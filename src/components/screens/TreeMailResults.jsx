import { useState } from 'react';
import { useApp } from '../../AppContext';
import { FijianCard } from '../fijian';

function AnswerChip({ active, tone, onClick, children }) {
    const activeClass = tone === 'yes'
        ? 'bg-green-500 text-white'
        : 'bg-red-500 text-white';
    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all ${active ? activeClass : 'bg-stone-800 text-sand-warm/60 hover:bg-stone-700'}`}
        >
            {children}
        </button>
    );
}

export default function TreeMailResults({ episodeNum }) {
    const { user, league, episodes, markPropBetResult } = useApp();
    const [error, setError] = useState('');
    const episode = episodes?.[episodeNum];
    const propBets = episode?.propBets || [];
    const results = episode?.propBetResults || {};
    const isHost = league?.createdBy === user?.uid;
    const manual = propBets.some(bet => !bet.resolveType);

    if (!isHost || propBets.length === 0) return null;

    const mark = async (betId, value) => {
        setError('');
        const current = results[betId];
        try {
            await markPropBetResult(episodeNum, betId, current === value ? null : value);
        } catch (err) {
            setError(err.message || 'Could not save that answer');
        }
    };

    return (
        <FijianCard className="p-5 space-y-3">
            <h3 className="font-display text-xl tracking-wider text-sand-warm">Tree Mail</h3>
            <p className="text-sand-warm/60 text-xs font-sans">
                {manual
                    ? 'Tap what happened. It saves immediately, and it does not score the episode. A blank pays nobody. The import leaves every tap alone.'
                    : 'These fill in from the boxscore. Tap one only to override it. A tap sticks.'}
            </p>
            {propBets.map(bet => {
                const result = results[bet.id];
                return (
                    <div key={bet.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-stone-800 text-sm font-sans">
                        <span className="flex-1 text-sand-warm/80">{bet.text}</span>
                        <div className="flex gap-1 shrink-0">
                            <AnswerChip tone="yes" active={result === true} onClick={() => mark(bet.id, true)}>YES</AnswerChip>
                            <AnswerChip tone="no" active={result === false} onClick={() => mark(bet.id, false)}>NO</AnswerChip>
                        </div>
                    </div>
                );
            })}
            {error && <p className="text-amber text-xs font-sans" role="alert">{error}</p>}
        </FijianCard>
    );
}
