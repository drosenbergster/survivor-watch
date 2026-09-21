import { useState, useMemo, useEffect, useRef } from 'react';
import { useApp, getEffectiveTribeAssignments } from '../../AppContext';
import { TRIBES, ALL_CASTAWAYS, getMaxPicks, userHasPerk } from '../../data';
import { computeScarcity } from '../../scoring';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

function SpyGlassPanel() {
    const { user, leagueMembers, myEpisode, myEpisodeData, auction } = useApp();
    const [targetUid, setTargetUid] = useState('');

    const hasSpyGlass = userHasPerk(auction, user?.uid, 'spy_glass', myEpisode);
    if (!hasSpyGlass) return null;

    const opponents = Object.entries(leagueMembers || {}).filter(([uid]) => uid !== user?.uid);
    const targetPicks = targetUid ? (myEpisodeData?.picks?.[targetUid] || []) : [];

    return (
        <FijianCard className="p-4 space-y-3 border-ochre/20">
            <div className="flex items-center gap-2">
                <span className="text-lg">🔍</span>
                <span className="text-ochre text-sm font-bold font-sans">Spy Glass</span>
            </div>
            <p className="text-sand-warm/50 text-xs font-sans">
                Pick an opponent to peek at their current picks for this episode.
            </p>
            <select
                value={targetUid}
                onChange={e => setTargetUid(e.target.value)}
                className="w-full bg-stone-800 text-sand-warm border border-stone-600 rounded-lg px-3 py-2 text-sm font-sans"
            >
                <option value="">Select opponent...</option>
                {opponents.map(([uid, m]) => (
                    <option key={uid} value={uid}>{m.displayName}</option>
                ))}
            </select>
            {targetUid && (
                <div className="space-y-1">
                    {targetPicks.length === 0 ? (
                        <p className="text-sand-warm/40 text-xs font-sans italic">
                            {leagueMembers?.[targetUid]?.displayName} hasn&apos;t locked picks yet.
                        </p>
                    ) : (
                        targetPicks.map(cid => {
                            const c = ALL_CASTAWAYS.find(x => x.id === cid);
                            return (
                                <div key={cid} className="flex items-center gap-2 px-2 py-1.5 rounded bg-ochre/5 text-xs font-sans">
                                    <span className="text-sand-warm">{c?.name || cid}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </FijianCard>
    );
}

export default function WeeklyPicks() {
    const { user, myEpisode, myEpisodeData, safeEliminated, episodes, submitPicks, auction, tribeSwaps } = useApp();

    const prevEpScarcity = useMemo(() => {
        if (!myEpisode || myEpisode <= 1) return null;
        const prevEp = episodes?.[myEpisode - 1];
        if (!prevEp?.scored || !prevEp?.picks) return null;
        const scarcity = computeScarcity(prevEp.picks);
        const totalPlayers = Object.keys(prevEp.picks).length;
        return { scarcity, totalPlayers };
    }, [myEpisode, episodes]);

    const myPicks = useMemo(() => myEpisodeData?.picks?.[user?.uid] || [], [myEpisodeData?.picks, user?.uid]);
    const [selected, setSelected] = useState(() => myPicks);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(() => myPicks.length > 0);
    const [error, setError] = useState('');
    const hydrated = useRef(myPicks.length > 0);

    const eliminatedSet = new Set(safeEliminated || []);
    const remaining = ALL_CASTAWAYS.filter(c => !eliminatedSet.has(c.id));
    const hasExtraPick = userHasPerk(auction, user?.uid, 'extra_pick', myEpisode);
    const maxPicks = getMaxPicks(remaining.length) + (hasExtraPick ? 1 : 0);

    const tribeOverrides = useMemo(
        () => getEffectiveTribeAssignments(tribeSwaps, myEpisode),
        [tribeSwaps, myEpisode]
    );

    const tribeGroups = useMemo(() => {
        if (tribeOverrides) {
            const groups = [];
            for (const [tribeName, memberIds] of Object.entries(tribeOverrides)) {
                const members = (memberIds || [])
                    .map(id => ALL_CASTAWAYS.find(c => c.id === id))
                    .filter(Boolean);
                const tribeKey = Object.keys(TRIBES).find(k => TRIBES[k].name.toLowerCase() === tribeName.toLowerCase()) || tribeName.toLowerCase();
                if (members.length > 0) groups.push({ key: tribeKey, name: tribeName, members });
            }
            return groups;
        }
        return Object.entries(TRIBES).map(([key, tribe]) => ({
            key,
            name: tribe.name,
            members: tribe.members,
        }));
    }, [tribeOverrides]);

    useEffect(() => {
        if (myPicks.length > 0 && !hydrated.current) {
            hydrated.current = true;
            setSelected(myPicks);
            setSaved(true);
        }
    }, [myPicks]);

    const togglePick = (id) => {
        setSaved(false);
        setSelected(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            if (prev.length >= maxPicks) return prev;
            return [...prev, id];
        });
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        try {
            await submitPicks(myEpisode, selected);
            setSaved(true);
        } catch (err) {
            setError(err.message);
        }
        setSaving(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <FijianSectionHeader title="Weekly Picks" className="!mb-0" />
                <span className={`text-xs font-bold ${selected.length === maxPicks ? 'text-jungle-400' : 'text-ochre'}`}>
                    {selected.length}/{maxPicks}
                </span>
            </div>

            <p className="text-sand-warm/60 text-xs font-sans leading-relaxed">
                Choose {maxPicks} castaways to score for you this episode.
                If you&apos;re the only player who picks someone, you get a{' '}
                <strong className="text-ochre">1.5&times; bonus</strong> on their points.
            </p>

            {hasExtraPick && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ochre/10 border border-ochre/20">
                    <span>➕</span>
                    <span className="text-ochre text-xs font-bold">Extra Pick active! You get +1 pick this episode.</span>
                </div>
            )}

            <SpyGlassPanel />

            {saved && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-jungle-400/10 border border-jungle-400/20">
                    <Icon name="check_circle" className="text-jungle-400 text-sm" />
                    <span className="text-jungle-400 text-xs font-bold">Picks saved!</span>
                </div>
            )}

            <div className={`grid grid-cols-1 ${tribeGroups.length > 1 ? 'lg:grid-cols-3' : ''} gap-3`}>
                {tribeGroups.map(({ key: tribeKey, name: tribeName, members: tribeMembers }) => {
                    const activeMembers = tribeMembers.filter(c => !eliminatedSet.has(c.id));
                    if (activeMembers.length === 0) return null;
                    return (
                        <FijianCard key={tribeKey} className="overflow-hidden">
                            <div
                                className="px-3 py-1.5 font-display text-xs sm:text-sm tracking-widest border-b-2"
                                style={{
                                    borderColor: `var(--color-${tribeKey})`,
                                    color: `var(--color-${tribeKey})`,
                                }}
                            >
                                {tribeName}
                            </div>
                            <div className="divide-y divide-stone-700/30">
                                {tribeMembers.map((c) => {
                                    const isEliminated = eliminatedSet.has(c.id);
                                    const isDisabled = isEliminated;
                                    const isPicked = selected.includes(c.id);
                                    const canPick = !isDisabled && !isPicked && selected.length < maxPicks;

                                    const prevCount = prevEpScarcity?.scarcity[c.id]?.count || 0;
                                    const prevTotal = prevEpScarcity?.totalPlayers || 0;

                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => !isDisabled && togglePick(c.id)}
                                            disabled={isDisabled}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-all
                                                ${isEliminated ? 'opacity-25 line-through cursor-default' : ''}
                                                ${!isDisabled ? 'cursor-pointer' : ''}
                                                ${isPicked ? 'bg-ochre/15 text-sand-warm' : ''}
                                                ${!isPicked && !isDisabled ? 'hover:bg-stone-800/50' : ''}
                                                ${!canPick && !isPicked && !isDisabled ? 'opacity-40' : ''}
                                            `}
                                        >
                                            <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                                isPicked ? 'border-ochre bg-ochre/20' : 'border-stone-600'
                                            }`}>
                                                {isPicked && <Icon name="check" className="text-ochre text-xs" />}
                                            </span>
                                            <span className="flex-1 font-medium">{c.name}</span>
                                            <span className="flex items-center gap-1.5 shrink-0">
                                                {prevEpScarcity && !isEliminated && (
                                                    <ScarcityBadge count={prevCount} total={prevTotal} />
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </FijianCard>
                    );
                })}
            </div>

            <FijianPrimaryButton
                onClick={handleSubmit}
                disabled={selected.length !== maxPicks || saving}
            >
                {saving ? 'Saving...' : selected.length !== maxPicks ? `Select ${maxPicks - selected.length} more` : saved ? 'Update Picks' : 'Save Picks'}
            </FijianPrimaryButton>

            {error && <p className="text-amber text-xs text-center" role="alert">{error}</p>}
        </div>
    );
}

function ScarcityBadge({ count, total }) {
    if (total === 0) return null;
    if (count === 0) {
        return (
            <span className="text-[10px] font-bold text-jungle-400/70 tracking-wider uppercase" title="Nobody picked last week — potential 1.5× bonus">
                Sleeper
            </span>
        );
    }
    if (count === 1) {
        return (
            <span className="text-[10px] font-bold text-ochre/60 tracking-wider" title={`Only 1 of ${total} picked last week`}>
                1/{total}
            </span>
        );
    }
    if (count >= Math.ceil(total * 0.6)) {
        return (
            <span className="text-[10px] font-bold text-sand-warm/30 tracking-wider uppercase" title={`${count} of ${total} picked last week — unlikely 1.5× bonus`}>
                Popular
            </span>
        );
    }
    return (
        <span className="text-[10px] font-bold text-sand-warm/25 tracking-wider" title={`${count} of ${total} picked last week`}>
            {count}/{total}
        </span>
    );
}
