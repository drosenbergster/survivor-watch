import { useState, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { TRIBES, ALL_CASTAWAYS } from '../../data';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, FijianInput, Icon } from '../fijian';

function TribeSwapPanel({ episodeNum }) {
    const { eliminated, executeTribeSwap, tribeSwaps } = useApp();

    const activeContestants = useMemo(
        () => ALL_CASTAWAYS.filter(c => !(eliminated || []).includes(c.id)),
        [eliminated]
    );

    const currentTribeNames = useMemo(() => {
        const names = Object.values(TRIBES).map(t => t.name);
        const swapEps = Object.keys(tribeSwaps || {}).filter(k => k !== 'merge').map(Number).sort((a, b) => b - a);
        if (swapEps.length > 0) {
            const latest = tribeSwaps[swapEps[0]]?.assignments || {};
            return Object.keys(latest);
        }
        return names;
    }, [tribeSwaps]);

    const [assignments, setAssignments] = useState(() => {
        const init = {};
        for (const name of currentTribeNames) init[name] = [];
        for (const c of activeContestants) {
            const originalTribe = Object.values(TRIBES).find(t => t.members.some(m => m.id === c.id));
            const tribeName = originalTribe?.name || currentTribeNames[0];
            if (init[tribeName]) init[tribeName].push(c.id);
            else if (currentTribeNames[0]) init[currentTribeNames[0]].push(c.id);
        }
        return init;
    });
    const [submitting, setSubmitting] = useState(false);

    const moveTo = (cid, fromTribe, toTribe) => {
        setAssignments(prev => ({
            ...prev,
            [fromTribe]: prev[fromTribe].filter(id => id !== cid),
            [toTribe]: [...(prev[toTribe] || []), cid],
        }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        await executeTribeSwap(episodeNum, assignments);
        setSubmitting(false);
    };

    const tribeNames = Object.keys(assignments);

    return (
        <FijianCard className="p-4 space-y-4">
            <FijianSectionHeader title="Tribe Swap" />
            <p className="text-clay text-xs font-serif italic">
                Move contestants between tribes to reflect the swap. Apply after the episode airs.
            </p>

            {tribeNames.map(tribeName => (
                <div key={tribeName} className="space-y-1">
                    <p className="text-ochre text-xs font-bold uppercase tracking-widest">{tribeName}</p>
                    <div className="space-y-1">
                        {(assignments[tribeName] || []).map(cid => {
                            const c = ALL_CASTAWAYS.find(x => x.id === cid);
                            return (
                                <div key={cid} className="flex items-center gap-2 bg-stone-800/50 px-3 py-2 rounded-lg">
                                    <span className="text-sand-warm text-sm font-sans flex-1">{c?.name}</span>
                                    <div className="flex gap-1">
                                        {tribeNames.filter(t => t !== tribeName).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => moveTo(cid, tribeName, t)}
                                                className="px-2 py-1 text-[10px] rounded bg-stone-700/50 text-sand-warm/50 hover:bg-ochre/20 hover:text-ochre transition-all"
                                            >
                                                → {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {(assignments[tribeName] || []).length === 0 && (
                            <p className="text-sand-warm/60 text-xs italic px-3 py-2">Empty</p>
                        )}
                    </div>
                </div>
            ))}

            <FijianPrimaryButton onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Applying...' : 'Apply Tribe Swap'}
            </FijianPrimaryButton>
        </FijianCard>
    );
}

function MergePanel() {
    const { executeMerge, myEpisode, isMerged, tribeSwaps } = useApp();
    const [tribeName, setTribeName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (isMerged) {
        return (
            <FijianCard className="p-4 space-y-2">
                <FijianSectionHeader title="Merge" />
                <div className="flex items-center gap-2">
                    <Icon name="check_circle" className="text-jungle-400" />
                    <span className="text-sand-warm text-sm font-sans">
                        Tribes merged into <span className="text-ochre font-bold">{tribeSwaps?.merge?.tribeName}</span> at Episode {tribeSwaps?.merge?.episodeNum}
                    </span>
                </div>
            </FijianCard>
        );
    }

    const handleMerge = async () => {
        if (!tribeName.trim()) return;
        setSubmitting(true);
        await executeMerge(myEpisode, tribeName.trim());
        setSubmitting(false);
    };

    return (
        <FijianCard className="p-4 space-y-3">
            <FijianSectionHeader title="Merge Tribes" />
            <p className="text-clay text-xs font-serif italic">
                Combine all tribes into one. This unlocks the Merge Passport and switches to individual scoring.
            </p>
            <FijianInput
                value={tribeName}
                onChange={e => setTribeName(e.target.value)}
                placeholder="Merged tribe name (e.g. Lavita)"
                label="Merged Tribe Name"
            />
            {tribeName.trim() && (
                <FijianPrimaryButton onClick={handleMerge} disabled={submitting}>
                    {submitting ? 'Merging...' : `Merge into "${tribeName.trim()}"`}
                </FijianPrimaryButton>
            )}
        </FijianCard>
    );
}

export default function TribeManagement() {
    const { user, league, myEpisode } = useApp();

    if (league?.createdBy !== user?.uid) return null;

    return (
        <div className="space-y-4">
            <FijianCard className="p-4 text-center border-ochre/20">
                <p className="font-display text-xl tracking-wider text-ochre">Tribe Management</p>
                <p className="text-sand-warm/50 text-xs font-sans mt-1">Admin tools for tribe swaps and merge</p>
            </FijianCard>
            <TribeSwapPanel episodeNum={myEpisode} />
            <MergePanel />
        </div>
    );
}
