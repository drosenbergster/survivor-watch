import { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../AppContext';
import { TRIBES, ALL_CASTAWAYS, getMaxPicks } from '../../data';
import { computeScarcity } from '../../scoring';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

export default function WeeklyPicks() {
    const { user, myEpisode, myEpisodeData, safeEliminated, rideOrDies, episodes, submitPicks } = useApp();
    const myRoDs = useMemo(() => new Set(rideOrDies?.[user?.uid] || []), [rideOrDies, user?.uid]);

    const othersRoDs = useMemo(() => {
        const set = new Set();
        for (const [uid, rods] of Object.entries(rideOrDies || {})) {
            if (uid === user?.uid) continue;
            for (const cid of (rods || [])) set.add(cid);
        }
        return set;
    }, [rideOrDies, user?.uid]);

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
    const maxPicks = getMaxPicks(remaining.length);

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
                Choose {maxPicks} contestants to score for you this episode.
                If you&apos;re the only player who picks someone (and they&apos;re not someone else&apos;s ride or die),
                you get a <strong className="text-ochre">1.5&times; bonus</strong>.
                Your ride or dies score passively — pick someone else!
            </p>

            {saved && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-jungle-400/10 border border-jungle-400/20">
                    <Icon name="check_circle" className="text-jungle-400 text-sm" />
                    <span className="text-jungle-400 text-xs font-bold">Picks saved!</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {Object.entries(TRIBES).map(([tribeKey, tribe]) => {
                    const activeMembers = tribe.members.filter(c => !eliminatedSet.has(c.id));
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
                                {tribe.name}
                            </div>
                            <div className="divide-y divide-stone-700/30">
                                {tribe.members.map((c) => {
                                    const isEliminated = eliminatedSet.has(c.id);
                                    const isMyRoD = myRoDs.has(c.id);
                                    const isOthersRoD = othersRoDs.has(c.id);
                                    const isDisabled = isEliminated || isMyRoD;
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
                                                ${isMyRoD && !isEliminated ? 'opacity-50 cursor-default' : ''}
                                                ${!isDisabled ? 'cursor-pointer' : ''}
                                                ${isPicked ? 'bg-ochre/15 text-sand-warm' : ''}
                                                ${!isPicked && !isDisabled ? 'hover:bg-stone-800/50' : ''}
                                                ${!canPick && !isPicked && !isDisabled ? 'opacity-40' : ''}
                                            `}
                                        >
                                            <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                                isPicked
                                                    ? 'border-ochre bg-ochre/20'
                                                    : isMyRoD && !isEliminated
                                                        ? 'border-fire-400/40 bg-fire-400/10'
                                                        : 'border-stone-600'
                                            }`}>
                                                {isPicked && <Icon name="check" className="text-ochre text-xs" />}
                                                {isMyRoD && !isEliminated && <Icon name="favorite" className="text-fire-400/60 text-xs" />}
                                            </span>
                                            <span className="flex-1 font-medium">{c.name}</span>
                                            <span className="flex items-center gap-1.5 shrink-0">
                                                {isOthersRoD && !isEliminated && (
                                                    <span className="text-[10px] font-bold text-clay/50 tracking-wider uppercase" title="Someone else's ride or die — no 1.5× bonus">
                                                        RoD
                                                    </span>
                                                )}
                                                {isMyRoD && !isEliminated && (
                                                    <span className="text-[10px] font-bold text-fire-400/60 tracking-wider uppercase">Ride or Die</span>
                                                )}
                                                {prevEpScarcity && !isEliminated && !isMyRoD && (
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
                disabled={selected.length === 0 || saving}
            >
                {saving ? 'Saving...' : saved ? 'Update Picks' : 'Save Picks'}
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
