import { useState, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { TRIBES, ALL_CASTAWAYS } from '../../data';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, FijianInput, Icon } from '../fijian';

function ExistingSwapsPanel() {
    const { tribeSwaps, moveTribeSwap, deleteTribeSwap } = useApp();
    const [moveFrom, setMoveFrom] = useState(null);
    const [moveTo, setMoveTo] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    const swapEps = useMemo(() =>
        Object.keys(tribeSwaps || {}).filter(k => k !== 'merge').map(Number).sort((a, b) => a - b),
        [tribeSwaps]
    );

    if (swapEps.length === 0) return null;

    const handleMove = async (fromEp) => {
        const toEp = parseInt(moveTo, 10);
        if (!toEp || toEp < 1) { setError('Enter a valid episode number'); return; }
        if (toEp === fromEp) { setError('Already on that episode'); return; }
        setBusy(true);
        setError('');
        try {
            await moveTribeSwap(fromEp, toEp);
            setMoveFrom(null);
            setMoveTo('');
        } catch (e) {
            setError(e.message);
        }
        setBusy(false);
    };

    const handleDelete = async (ep) => {
        if (!window.confirm(`Delete tribe swap from episode ${ep}?`)) return;
        setBusy(true);
        try { await deleteTribeSwap(ep); } catch (e) { setError(e.message); }
        setBusy(false);
    };

    return (
        <FijianCard className="p-4 space-y-3">
            <FijianSectionHeader title="Existing Swaps" />
            <p className="text-clay text-xs font-serif italic">
                Move a swap to a different episode or remove it entirely.
            </p>
            {swapEps.map(ep => {
                const assignments = tribeSwaps[ep]?.assignments || {};
                const tribeNames = Object.keys(assignments);
                const total = Object.values(assignments).reduce((s, arr) => s + (arr?.length || 0), 0);
                return (
                    <div key={ep} className="bg-stone-800/50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sand-warm text-sm font-sans">
                                Episode <span className="text-ochre font-bold">{ep}</span>
                                <span className="text-sand-warm/50 ml-2">
                                    ({tribeNames.join(', ')} — {total} players)
                                </span>
                            </span>
                            <div className="flex gap-1.5">
                                <button
                                    onClick={() => { setMoveFrom(moveFrom === ep ? null : ep); setMoveTo(''); setError(''); }}
                                    className="px-2 py-1 text-[10px] rounded bg-stone-700/50 text-ochre hover:bg-ochre/20 transition-all"
                                >
                                    Move
                                </button>
                                <button
                                    onClick={() => handleDelete(ep)}
                                    disabled={busy}
                                    className="px-2 py-1 text-[10px] rounded bg-stone-700/50 text-red-400 hover:bg-red-400/20 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        {moveFrom === ep && (
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <FijianInput
                                        type="number"
                                        min={1}
                                        value={moveTo}
                                        onChange={e => setMoveTo(e.target.value)}
                                        placeholder="New episode #"
                                        label="Move to episode"
                                    />
                                </div>
                                <FijianPrimaryButton
                                    onClick={() => handleMove(ep)}
                                    disabled={busy || !moveTo}
                                    className="shrink-0"
                                >
                                    {busy ? 'Moving...' : 'Confirm'}
                                </FijianPrimaryButton>
                            </div>
                        )}
                    </div>
                );
            })}
            {error && <p className="text-red-400 text-xs font-sans">{error}</p>}
        </FijianCard>
    );
}

function TribeSwapPanel({ episodeNum }) {
    const { eliminated, executeTribeSwap, tribeSwaps } = useApp();
    const [targetEpisode, setTargetEpisode] = useState(episodeNum || '');

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

        const swapEps = Object.keys(tribeSwaps || {}).filter(k => k !== 'merge').map(Number).sort((a, b) => b - a);
        const latestAssignments = swapEps.length > 0 ? tribeSwaps[swapEps[0]]?.assignments : null;

        for (const c of activeContestants) {
            let placed = false;
            if (latestAssignments) {
                for (const [tribeName, members] of Object.entries(latestAssignments)) {
                    if (members?.includes(c.id)) {
                        if (init[tribeName]) init[tribeName].push(c.id);
                        else if (currentTribeNames[0]) init[currentTribeNames[0]].push(c.id);
                        placed = true;
                        break;
                    }
                }
            }
            if (!placed) {
                const originalTribe = Object.values(TRIBES).find(t => t.members.some(m => m.id === c.id));
                const tribeName = originalTribe?.name || currentTribeNames[0];
                if (init[tribeName]) init[tribeName].push(c.id);
                else if (currentTribeNames[0]) init[currentTribeNames[0]].push(c.id);
            }
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
        const ep = parseInt(targetEpisode, 10);
        if (!ep || ep < 1) return;
        setSubmitting(true);
        await executeTribeSwap(ep, assignments);
        setSubmitting(false);
    };

    const tribeNames = Object.keys(assignments);

    return (
        <FijianCard className="p-4 space-y-4">
            <FijianSectionHeader title="Tribe Swap" />
            <p className="text-clay text-xs font-serif italic">
                Move contestants between tribes to reflect the swap. Choose which episode the swap applies to.
            </p>

            <div className="max-w-32">
                <FijianInput
                    type="number"
                    min={1}
                    value={targetEpisode}
                    onChange={e => setTargetEpisode(e.target.value)}
                    label="Swap episode"
                    placeholder="Ep #"
                />
            </div>

            {tribeNames.map(tribeName => (
                <div key={tribeName} className="space-y-1">
                    <p className="text-ochre text-xs font-bold uppercase tracking-widest">{tribeName}</p>
                    <div className="space-y-1">
                        {(assignments[tribeName] || []).map(cid => {
                            const c = ALL_CASTAWAYS.find(x => x.id === cid);
                            return (
                                <div key={cid} className="flex items-center gap-2 bg-stone-800/50 px-3 py-2 rounded-lg min-w-0">
                                    <span className="text-sand-warm text-sm font-sans flex-1 min-w-0 truncate">{c?.name}</span>
                                    <div className="flex gap-1 flex-wrap shrink-0">
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

            <FijianPrimaryButton
                onClick={handleSubmit}
                disabled={submitting || !targetEpisode || parseInt(targetEpisode, 10) < 1}
            >
                {submitting ? 'Applying...' : `Apply Tribe Swap (Episode ${targetEpisode || '?'})`}
            </FijianPrimaryButton>
        </FijianCard>
    );
}

function EliminationFixPanel() {
    const { eliminated, episodes, fixElimination } = useApp();
    const [episodeNum, setEpisodeNum] = useState('');
    const [contestantId, setContestantId] = useState('');
    const [method, setMethod] = useState('medevac');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const scoredEpisodes = useMemo(() =>
        Object.entries(episodes || {})
            .filter(([, ep]) => ep.scored)
            .map(([num]) => Number(num))
            .sort((a, b) => a - b),
        [episodes]
    );

    const activeContestants = useMemo(
        () => ALL_CASTAWAYS.filter(c => !(eliminated || []).includes(c.id)),
        [eliminated]
    );

    const handleFix = async () => {
        const ep = parseInt(episodeNum, 10);
        if (!ep) { setError('Pick an episode'); return; }
        if (!contestantId) { setError('Pick a contestant'); return; }
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            await fixElimination(ep, contestantId, method);
            const name = ALL_CASTAWAYS.find(c => c.id === contestantId)?.name;
            setSuccess(`${name} marked as ${method.replace('_', ' ')} in episode ${ep}`);
            setContestantId('');
        } catch (e) {
            setError(e.message);
        }
        setSubmitting(false);
    };

    return (
        <FijianCard className="p-4 space-y-3">
            <FijianSectionHeader title="Fix Elimination" />
            <p className="text-clay text-xs font-serif italic">
                Retroactively add or correct an elimination on a scored episode.
            </p>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="text-sand-warm/60 text-xs font-sans block mb-1">Episode</label>
                    <select
                        value={episodeNum}
                        onChange={e => setEpisodeNum(e.target.value)}
                        className="w-full bg-stone-800 text-sand-warm border border-stone-600 rounded-lg px-3 py-2 text-sm font-sans"
                    >
                        <option value="">Select...</option>
                        {scoredEpisodes.map(n => (
                            <option key={n} value={n}>Episode {n}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="text-sand-warm/60 text-xs font-sans block mb-1">Method</label>
                    <select
                        value={method}
                        onChange={e => setMethod(e.target.value)}
                        className="w-full bg-stone-800 text-sand-warm border border-stone-600 rounded-lg px-3 py-2 text-sm font-sans"
                    >
                        <option value="medevac">Medevac</option>
                        <option value="voted_out">Voted Out</option>
                        <option value="quit">Quit</option>
                        <option value="fire">Fire-Making</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="text-sand-warm/60 text-xs font-sans block mb-1">Contestant</label>
                <select
                    value={contestantId}
                    onChange={e => setContestantId(e.target.value)}
                    className="w-full bg-stone-800 text-sand-warm border border-stone-600 rounded-lg px-3 py-2 text-sm font-sans"
                >
                    <option value="">Select contestant...</option>
                    {activeContestants.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.short})</option>
                    ))}
                </select>
            </div>

            <FijianPrimaryButton onClick={handleFix} disabled={submitting || !episodeNum || !contestantId}>
                {submitting ? 'Updating...' : 'Apply Fix'}
            </FijianPrimaryButton>

            {error && <p className="text-red-400 text-xs font-sans">{error}</p>}
            {success && (
                <div className="flex items-center gap-2 text-green-400 text-xs font-sans">
                    <Icon name="check_circle" className="text-sm" />
                    {success}
                </div>
            )}
        </FijianCard>
    );
}

function RescorePanel() {
    const { episodes, rescoreEpisode } = useApp();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const scoredEpisodes = useMemo(() =>
        Object.entries(episodes || {})
            .filter(([, ep]) => ep.scored)
            .map(([num]) => Number(num))
            .sort((a, b) => a - b),
        [episodes]
    );

    if (scoredEpisodes.length === 0) return null;

    const handleRescore = async (epNum) => {
        setBusy(true);
        setError('');
        setSuccess('');
        try {
            await rescoreEpisode(epNum);
            setSuccess(`Episode ${epNum} re-scored with current tribe assignments`);
        } catch (e) {
            setError(e.message);
        }
        setBusy(false);
    };

    const handleRescoreAll = async () => {
        setBusy(true);
        setError('');
        setSuccess('');
        try {
            for (const epNum of scoredEpisodes) {
                await rescoreEpisode(epNum);
            }
            setSuccess(`All ${scoredEpisodes.length} episodes re-scored`);
        } catch (e) {
            setError(e.message);
        }
        setBusy(false);
    };

    return (
        <FijianCard className="p-4 space-y-3">
            <FijianSectionHeader title="Re-score Episodes" />
            <p className="text-clay text-xs font-serif italic">
                Re-derive game events using current tribe assignments. Use after fixing a tribe swap or elimination.
            </p>

            <div className="flex flex-wrap gap-2">
                {scoredEpisodes.map(ep => (
                    <button
                        key={ep}
                        onClick={() => handleRescore(ep)}
                        disabled={busy}
                        className="px-3 py-1.5 rounded-lg text-xs font-sans bg-stone-800 text-sand-warm/60 hover:bg-ochre/20 hover:text-ochre transition-all disabled:opacity-50"
                    >
                        Ep {ep}
                    </button>
                ))}
            </div>

            <FijianPrimaryButton onClick={handleRescoreAll} disabled={busy}>
                {busy ? 'Re-scoring...' : `Re-score All (${scoredEpisodes.length} episodes)`}
            </FijianPrimaryButton>

            {error && <p className="text-red-400 text-xs font-sans">{error}</p>}
            {success && (
                <div className="flex items-center gap-2 text-green-400 text-xs font-sans">
                    <Icon name="check_circle" className="text-sm" />
                    {success}
                </div>
            )}
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
                <p className="text-sand-warm/50 text-xs font-sans mt-1">Admin tools for tribe swaps, merge, and fixes</p>
            </FijianCard>
            <ExistingSwapsPanel />
            <TribeSwapPanel episodeNum={myEpisode} />
            <MergePanel />
            <EliminationFixPanel />
            <RescorePanel />
        </div>
    );
}
