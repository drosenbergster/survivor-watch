import { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../AppContext';
import { TRIBES, ALL_CASTAWAYS, getMaxPicks } from '../../data';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

export default function WeeklyPicks() {
    const { user, myEpisode, myEpisodeData, safeEliminated, submitPicks } = useApp();

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
                If you&apos;re the only player who picks someone, you get a <strong className="text-ochre">1.5&times; bonus</strong>.
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
                                    const isPicked = selected.includes(c.id);
                                    const canPick = !isEliminated && !isPicked && selected.length < maxPicks;

                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => !isEliminated && togglePick(c.id)}
                                            disabled={isEliminated}
                                            className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-all
                                                ${isEliminated ? 'opacity-25 line-through cursor-default' : 'cursor-pointer'}
                                                ${isPicked ? 'bg-ochre/15 text-sand-warm' : ''}
                                                ${!isPicked && !isEliminated ? 'hover:bg-stone-800/50' : ''}
                                                ${!canPick && !isPicked && !isEliminated ? 'opacity-40' : ''}
                                            `}
                                        >
                                            <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                                                isPicked
                                                    ? 'border-ochre bg-ochre/20'
                                                    : 'border-stone-600'
                                            }`}>
                                                {isPicked && <Icon name="check" className="text-ochre text-xs" />}
                                            </span>
                                            <span className="flex-1 font-medium">{c.name}</span>
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
