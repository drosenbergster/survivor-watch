import { useState } from 'react';
import { useApp } from '../../AppContext';
import { ALL_CASTAWAYS, SCORE_EVENTS, PLAYER_COLORS } from '../../data';
import { ScreenHeader } from '../ui';

export default function ScoreboardTab() {
    const { gameState, saveGame } = useApp();
    const { players, draft, scores } = gameState;

    const [selectedCastaway, setSelectedCastaway] = useState('');
    const [eventLog, setEventLog] = useState([]);

    // Build picks map: playerIdx -> [castawayIds]
    const playerPicks = {};
    for (const [castawayId, playerIdx] of Object.entries(draft?.picks || {})) {
        if (!playerPicks[playerIdx]) playerPicks[playerIdx] = [];
        playerPicks[playerIdx].push(castawayId);
    }

    // Calculate scores per player
    const playerScores = players.map((_, idx) => {
        const myPicks = playerPicks[idx] || [];
        let total = 0;
        const events = (scores?.events || []).filter(e => myPicks.includes(e.castawayId));
        events.forEach(e => { total += e.points; });
        return total;
    });

    const logEvent = async (eventKey) => {
        if (!selectedCastaway) return;
        const event = SCORE_EVENTS.find(e => e.key === eventKey);
        if (!event) return;

        const newEvent = {
            castawayId: selectedCastaway,
            event: eventKey,
            label: event.label,
            points: event.points,
            // eslint-disable-next-line react-hooks/purity -- timestamp is set in event handler, not during render
            timestamp: Date.now(),
        };

        const newEvents = [...(scores?.events || []), newEvent];
        await saveGame({
            ...gameState,
            scores: { ...scores, events: newEvents },
        });

        setEventLog(prev => [newEvent, ...prev].slice(0, 20));
    };

    const undoLast = async () => {
        const events = [...(scores?.events || [])];
        if (events.length === 0) return;
        events.pop();
        await saveGame({
            ...gameState,
            scores: { ...scores, events },
        });
    };

    // Sort players by score descending
    const ranked = players
        .map((name, idx) => ({ name, idx, score: playerScores[idx] }))
        .sort((a, b) => b.score - a.score);

    return (
        <div className="space-y-6">
            <ScreenHeader title="Season Scoreboard" subtitle="Track points across the whole season. Update after each episode!" />

            {/* Score cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {ranked.map(({ name, idx, score }, rank) => (
                    <article
                        key={idx}
                        className="bg-stone-900 border border-stone-800 rounded-xl p-4 hover:shadow-fire transition-all"
                        style={{ borderTopColor: PLAYER_COLORS[idx].hex, borderTopWidth: '3px' }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-stone-500">#{rank + 1}</span>
                            {rank === 0 && score > 0 && <span className="text-xs" aria-hidden="true">👑</span>}
                        </div>
                        <h3 className="font-display text-lg tracking-wider" style={{ color: PLAYER_COLORS[idx].hex }}>
                            {name}
                        </h3>
                        <div className="text-4xl font-bold text-torch leading-none mt-1">{score}</div>
                        <div className="text-stone-500 text-xs mt-1">points</div>
                        {/* Drafted castaways */}
                        <div className="mt-3 flex flex-wrap gap-1">
                            {(playerPicks[idx] || []).map(cId => {
                                const c = ALL_CASTAWAYS.find(x => x.id === cId);
                                const isEliminated = (gameState.eliminated || []).includes(cId);
                                return (
                                    <span
                                        key={cId}
                                        className={`text-xs px-2 py-0.5 rounded bg-stone-800/50 ${isEliminated ? 'line-through opacity-40' : 'text-stone-400'}`}
                                    >
                                        {c?.name?.split(' ')[0] || cId}
                                    </span>
                                );
                            })}
                        </div>
                    </article>
                ))}
            </div>

            {/* Event logger */}
            <section className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <h3 className="font-display text-xl tracking-wider text-torch mb-4">Log Events</h3>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <select
                        value={selectedCastaway}
                        onChange={(e) => setSelectedCastaway(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-stone-700 bg-stone-800 text-stone-100 text-sm outline-none max-w-xs"
                        aria-label="Select castaway to log event for"
                    >
                        <option value="">Select a castaway...</option>
                        {ALL_CASTAWAYS.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={undoLast}
                        className="px-3 py-2 text-xs rounded-lg border border-stone-700 bg-stone-800 text-stone-400 hover:text-fire-400 hover:border-fire-400/30 transition-all cursor-pointer"
                    >
                        ⤺ Undo Last
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {SCORE_EVENTS.map(ev => (
                        <button
                            key={ev.key}
                            onClick={() => logEvent(ev.key)}
                            disabled={!selectedCastaway}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer disabled:opacity-30 disabled:cursor-default
                ${ev.negative
                                    ? 'border border-fire-600/30 bg-stone-800 text-stone-400 hover:border-fire-600 hover:text-fire-400'
                                    : 'border border-stone-700 bg-stone-800 text-stone-400 hover:border-jungle-400/50 hover:text-jungle-400'}
              `}
                        >
                            {ev.emoji} {ev.label} ({ev.points > 0 ? '+' : ''}{ev.points})
                        </button>
                    ))}
                </div>

                {/* Recent events */}
                {eventLog.length > 0 && (
                    <div className="mt-4 space-y-1">
                        <p className="text-stone-500 text-xs mb-1">Recent:</p>
                        {eventLog.slice(0, 5).map((e, i) => {
                            const c = ALL_CASTAWAYS.find(x => x.id === e.castawayId);
                            return (
                                <div key={i} className="text-xs text-stone-500 flex items-center gap-2">
                                    <span className={e.points > 0 ? 'text-jungle-400' : 'text-fire-400'}>
                                        {e.points > 0 ? '+' : ''}{e.points}
                                    </span>
                                    <span className="text-stone-400">{c?.name}</span>
                                    <span>— {e.label}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
