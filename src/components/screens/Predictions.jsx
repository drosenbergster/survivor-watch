import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../AppContext';
import { ALL_CASTAWAYS } from '../../data';
import { FijianCard, FijianSectionHeader, FijianInput, FijianPrimaryButton, Icon, HintBadge } from '../fijian';

export default function Predictions() {
    const { user, currentEpisode, episodeData, eliminated, submitPredictions } = useApp();

    const myPredictions = episodeData?.predictions?.[user?.uid];
    const myPicks = episodeData?.picks?.[user?.uid] || [];
    const propBets = episodeData?.propBets || [];
    const eliminatedSet = new Set(eliminated || []);
    const remaining = ALL_CASTAWAYS.filter(c => !eliminatedSet.has(c.id));

    const [elimination, setElimination] = useState(() => myPredictions?.elimination || '');
    const [boldPrediction, setBoldPrediction] = useState(() => myPredictions?.boldPrediction || '');
    const [propAnswers, setPropAnswers] = useState(() => myPredictions?.propBets || {});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(() => !!myPredictions);
    const [error, setError] = useState('');
    const hydrated = useRef(!!myPredictions);

    useEffect(() => {
        if (myPredictions && !hydrated.current) {
            hydrated.current = true;
            setElimination(myPredictions.elimination || '');
            setBoldPrediction(myPredictions.boldPrediction || '');
            setPropAnswers(myPredictions.propBets || {});
            setSaved(true);
        }
    }, [myPredictions]);

    const setProp = (propId, value) => {
        setSaved(false);
        setPropAnswers(prev => ({ ...prev, [propId]: value }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        try {
            await submitPredictions(currentEpisode, {
                elimination,
                boldPrediction,
                propBets: propAnswers,
            });
            setSaved(true);
        } catch (err) {
            setError(err.message);
        }
        setSaving(false);
    };

    const pickedCastaways = myPicks.map(id => ALL_CASTAWAYS.find(c => c.id === id)).filter(Boolean);

    return (
        <div className="space-y-4">
            <FijianSectionHeader title="Predictions" />

            <p className="text-sand-warm/60 text-xs font-sans leading-relaxed">
                Lock in your predictions before watching. Points are awarded after the host scores the episode.
            </p>

            {saved && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-jungle-400/10 border border-jungle-400/20">
                    <Icon name="check_circle" className="text-jungle-400 text-sm" />
                    <span className="text-jungle-400 text-xs font-bold">Predictions saved!</span>
                </div>
            )}

            {/* Elimination prediction */}
            <FijianCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Icon name="skull" className="text-fire-400" />
                    <span className="text-sand-warm text-sm font-bold">Elimination Prediction</span>
                    <span className="text-ochre/70 text-xs ml-auto">+5 pts</span>
                </div>
                <p className="text-clay text-xs mb-2 font-serif italic">Who goes home tonight?</p>
                <select
                    value={elimination}
                    onChange={(e) => { setElimination(e.target.value); setSaved(false); }}
                    className="w-full bg-stone-dark/80 border-2 border-earth/30 focus:border-clay/50 focus:ring-0 rounded-lg h-12 px-4 text-sand-warm text-sm transition-all outline-none appearance-none cursor-pointer"
                    aria-label="Elimination prediction"
                >
                    <option value="">Select a castaway...</option>
                    {remaining.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.short})</option>
                    ))}
                </select>
            </FijianCard>

            {/* Bold prediction */}
            <FijianCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Icon name="bolt" className="text-torch" />
                    <span className="text-sand-warm text-sm font-bold">Bold Prediction</span>
                    <span className="text-ochre/70 text-xs ml-auto">+10 pts</span>
                </div>
                <p className="text-clay text-xs mb-2 font-serif italic">
                    Predict something specific about one of your weekly picks. The host decides if it came true.
                </p>
                {pickedCastaways.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {pickedCastaways.map(c => (
                            <span key={c.id} className="bg-ochre/10 text-ochre text-xs px-2 py-0.5 rounded">
                                {c.name}
                            </span>
                        ))}
                    </div>
                )}
                <FijianInput
                    value={boldPrediction}
                    onChange={(e) => { setBoldPrediction(e.target.value); setSaved(false); }}
                    placeholder='e.g. "Cirie finds an idol tonight"'
                    maxLength={120}
                    aria-label="Bold prediction"
                />
            </FijianCard>

            {/* Prop bets */}
            {propBets.length > 0 && (
                <FijianCard className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Icon name="casino" className="text-ochre" />
                        <span className="text-sand-warm text-sm font-bold inline-flex items-center">
                            Prop Bets
                            <HintBadge hintKey="propBets">
                                Yes/No questions about what will happen this episode. Get +3 pts for each correct answer. The host sets the questions before the episode.
                            </HintBadge>
                        </span>
                        <span className="text-ochre/70 text-xs ml-auto">+3 pts each</span>
                    </div>
                    <div className="space-y-2">
                        {propBets.map((bet) => {
                            const answer = propAnswers[bet.id];
                            return (
                                <div
                                    key={bet.id}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-stone-800/30 border border-transparent"
                                >
                                    <span className="flex-1 text-sm text-sand-warm">{bet.text}</span>
                                    <div className="flex gap-1 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setProp(bet.id, true)}
                                            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                                answer === true
                                                    ? 'bg-jungle-400 text-white'
                                                    : 'bg-stone-700 text-sand-warm/50 hover:bg-stone-600'
                                            }`}
                                        >
                                            YES
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setProp(bet.id, false)}
                                            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                                answer === false
                                                    ? 'bg-fire-400 text-white'
                                                    : 'bg-stone-700 text-sand-warm/50 hover:bg-stone-600'
                                            }`}
                                        >
                                            NO
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        <p className="text-sand-warm/50 text-xs text-center pt-1">
                            Tap YES or NO for each prop bet.
                        </p>
                    </div>
                </FijianCard>
            )}

            <FijianPrimaryButton
                onClick={handleSubmit}
                disabled={saving}
            >
                {saving ? 'Saving...' : saved ? 'Update Predictions' : 'Save Predictions'}
            </FijianPrimaryButton>

            {error && <p className="text-amber text-xs text-center" role="alert">{error}</p>}
        </div>
    );
}
