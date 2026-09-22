import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../AppContext';
import { FijianCard, FijianSectionHeader, Icon, HintBadge } from '../fijian';

export default function Predictions() {
    const { user, myEpisode, myEpisodeData, submitPredictions } = useApp();

    const myPredictions = myEpisodeData?.predictions?.[user?.uid];
    const propBets = myEpisodeData?.propBets || [];

    const [propAnswers, setPropAnswers] = useState(() => myPredictions?.propBets || {});
    const [error, setError] = useState('');
    const hydrated = useRef(!!myPredictions);
    const saveTimer = useRef(null);

    useEffect(() => {
        if (myPredictions && !hydrated.current) {
            hydrated.current = true;
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time hydration from remote data
            setPropAnswers(myPredictions.propBets || {});
        }
    }, [myPredictions]);

    const persist = useCallback(async (next) => {
        try {
            await submitPredictions(myEpisode, { propBets: next });
            setError('');
        } catch (err) {
            setError(err.message);
        }
    }, [submitPredictions, myEpisode]);

    const setProp = (propId, value) => {
        setPropAnswers(prev => {
            const next = { ...prev, [propId]: value };
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => persist(next), 400);
            return next;
        });
    };

    if (propBets.length === 0) return null;

    return (
        <div className="space-y-4">
            <FijianSectionHeader title="Tree Mail" />

            <p className="text-sand-warm/60 text-xs font-sans leading-relaxed">
                Quick calls before the episode. Answers auto-save. Points are awarded after the host scores.
            </p>

            <FijianCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Icon name="casino" className="text-ochre" />
                    <span className="text-sand-warm text-sm font-bold inline-flex items-center">
                        Tree Mail
                        <HintBadge hintKey="propBets">
                            Yes/No questions about what will happen this episode. Get +3 pts for each correct answer.
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
                                        className={`px-4 py-2 rounded text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
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
                                        className={`px-4 py-2 rounded text-xs font-bold transition-all cursor-pointer min-h-[44px] ${
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
                        Tap YES or NO — your answers save automatically.
                    </p>
                </div>
            </FijianCard>

            {error && <p className="text-amber text-xs text-center" role="alert">{error}</p>}
        </div>
    );
}
