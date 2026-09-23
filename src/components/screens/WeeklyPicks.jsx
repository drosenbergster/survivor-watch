import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useApp, getEffectiveTribeAssignments } from '../../AppContext';
import { TRIBES, ALL_CASTAWAYS, getMaxPicks } from '../../data';
import { FijianCard, FijianSectionHeader, Icon } from '../fijian';

export default function WeeklyPicks() {
    const { user, myEpisode, myEpisodeData, safeEliminated, submitPicks, submitCaptain, tribeSwaps } = useApp();

    const myPicks = useMemo(() => myEpisodeData?.picks?.[user?.uid] || [], [myEpisodeData?.picks, user?.uid]);
    const myCaptain = myEpisodeData?.captains?.[user?.uid] || null;
    const [selected, setSelected] = useState(() => myPicks);
    const [captain, setCaptainState] = useState(() => myCaptain);
    const [error, setError] = useState('');
    const hydrated = useRef(myPicks.length > 0);
    const saveTimer = useRef(null);

    const eliminatedSet = new Set(safeEliminated || []);
    const remaining = ALL_CASTAWAYS.filter(c => !eliminatedSet.has(c.id));
    const maxPicks = getMaxPicks(remaining.length);

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

    const visibleTribeCount = tribeGroups.filter(g => g.members.some(c => !eliminatedSet.has(c.id))).length;

    // Hydrate from remote picks (once they arrive)
    useEffect(() => {
        if (myPicks.length > 0 && !hydrated.current) {
            hydrated.current = true;
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time hydration from remote data
            setSelected(myPicks);
            setCaptainState(myCaptain);
        }
    }, [myPicks, myCaptain]);

    // Auto-persist any change (debounced) — Light Your Torch is the only lock action.
    const persist = useCallback(async (next) => {
        try {
            await submitPicks(myEpisode, next);
            setError('');
        } catch (err) {
            setError(err.message);
        }
    }, [submitPicks, myEpisode]);

    const persistCaptain = useCallback(async (id) => {
        try {
            await submitCaptain(myEpisode, id);
            setError('');
        } catch (err) {
            setError(err.message);
        }
    }, [submitCaptain, myEpisode]);

    const togglePick = (id) => {
        setSelected(prev => {
            let next;
            if (prev.includes(id)) next = prev.filter(x => x !== id);
            else if (prev.length >= maxPicks) return prev;
            else next = [...prev, id];
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => persist(next), 400);
            // Dropping your captain drops the captaincy with them.
            if (!next.includes(id) && captain === id) {
                setCaptainState(null);
                persistCaptain(null);
            }
            return next;
        });
    };

    const chooseCaptain = (id) => {
        const next = captain === id ? null : id;
        setCaptainState(next);
        persistCaptain(next);
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
                Choose {maxPicks} castaways to score for you this episode. They save as you tap.
                Tap the star on one of them to make them your{' '}
                <strong className="text-ochre">Captain</strong> — they score{' '}
                <strong className="text-ochre">double</strong>.
            </p>

            {selected.length > 0 && !captain && (
                <p className="text-ochre/80 text-xs font-sans text-center" role="status">
                    Pick your Captain before you light your torch.
                </p>
            )}

            <div className={`grid grid-cols-1 ${
                visibleTribeCount >= 3 ? 'lg:grid-cols-3' : visibleTribeCount === 2 ? 'lg:grid-cols-2' : ''
            } gap-3`}>
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
                                    const isCaptain = captain === c.id;

                                    return (
                                        <div
                                            key={c.id}
                                            className={`flex items-center transition-all
                                                ${isEliminated ? 'opacity-25 line-through' : ''}
                                                ${isPicked ? 'bg-ochre/15 text-sand-warm' : ''}
                                                ${!isPicked && !isDisabled ? 'hover:bg-stone-800/50' : ''}
                                                ${!canPick && !isPicked && !isDisabled ? 'opacity-40' : ''}
                                            `}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => !isDisabled && togglePick(c.id)}
                                                disabled={isDisabled}
                                                aria-pressed={isPicked}
                                                className={`flex-1 flex items-center gap-2 px-3 py-2 text-left text-sm min-w-0 ${isDisabled ? 'cursor-default' : 'cursor-pointer'}`}
                                            >
                                                <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                                    isPicked ? 'border-ochre bg-ochre/20' : 'border-stone-600'
                                                }`}>
                                                    {isPicked && <Icon name="check" className="text-ochre text-xs" />}
                                                </span>
                                                <span className="flex-1 font-medium truncate">{c.name}</span>
                                            </button>
                                            {isPicked && (
                                                <button
                                                    type="button"
                                                    onClick={() => chooseCaptain(c.id)}
                                                    aria-pressed={isCaptain}
                                                    aria-label={isCaptain ? `${c.name} is your Captain` : `Make ${c.name} your Captain`}
                                                    className="shrink-0 px-3 py-2 cursor-pointer"
                                                >
                                                    <Icon
                                                        name={isCaptain ? 'star' : 'star_outline'}
                                                        className={isCaptain ? 'text-ochre text-lg' : 'text-sand-warm/30 text-lg hover:text-ochre/60'}
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </FijianCard>
                    );
                })}
            </div>

            {error && <p className="text-amber text-xs text-center" role="alert">{error}</p>}
        </div>
    );
}
