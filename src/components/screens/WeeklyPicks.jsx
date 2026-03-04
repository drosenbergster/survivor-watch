import { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../AppContext';
import { TRIBES, ALL_CASTAWAYS, getMaxPicks } from '../../data';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

export default function WeeklyPicks() {
    const { user, currentEpisode, episodeData, eliminated, submitPicks } = useApp();

    const myPicks = useMemo(() => episodeData?.picks?.[user?.uid] || [], [episodeData?.picks, user?.uid]);
    const [selected, setSelected] = useState(() => myPicks);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(() => myPicks.length > 0);
    const [error, setError] = useState('');
    const hydrated = useRef(myPicks.length > 0);

    const eliminatedSet = new Set(eliminated || []);
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
            await submitPicks(currentEpisode, selected);
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
                        <FijianCard key={tribeKey}>
                            <div
                                className="px-3 py-2 text-center font-display text-sm tracking-widest border-b-2"
                                style={{
                                    borderColor: `var(--color-${tribeKey})`,
                                    color: `var(--color-${tribeKey})`,
                                }}
                            >
                                {tribe.name}
                            </div>
                            <div className="p-1.5 space-y-0.5">
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
                                            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded text-left text-sm transition-all
                                                ${isEliminated ? 'opacity-30 line-through cursor-default' : 'cursor-pointer'}
                                                ${isPicked ? 'bg-ochre/15 border border-ochre/40 text-sand-warm' : ''}
                                                ${!isPicked && !isEliminated ? 'border border-transparent hover:bg-stone-800/50' : ''}
                                                ${!canPick && !isPicked && !isEliminated ? 'opacity-50' : ''}
                                            `}
                                        >
                                            {isPicked && <Icon name="check" className="text-ochre text-sm shrink-0" />}
                                            <span className="flex-1 font-medium">{c.name}</span>
                                            <span className="text-stone-500 text-xs">{c.short}</span>
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
