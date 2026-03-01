import { useState } from 'react';
import { useApp } from '../../AppContext';
import { TRIBES, PLAYER_COLORS } from '../../data';
import { ScreenHeader, Button, Input, Card } from '../ui';

// Snake draft order for 4 players, 6 rounds: 1-2-3-4-4-3-2-1-1-2-3-4...
function getSnakeDraftOrder(numPlayers, numRounds) {
    const order = [];
    for (let r = 0; r < numRounds; r++) {
        const round = [];
        for (let p = 0; p < numPlayers; p++) {
            round.push(r % 2 === 0 ? p : numPlayers - 1 - p);
        }
        order.push(...round);
    }
    return order;
}

export default function DraftTab() {
    const { gameState, saveGame, createGame } = useApp();
    const { players, draft } = gameState;

    const [names, setNames] = useState(players);
    const draftOrder = getSnakeDraftOrder(4, 6);

    const handleStartDraft = async () => {
        const finalNames = names.map((n, i) => n.trim() || `Player ${i + 1}`);
        const newState = {
            ...gameState,
            players: finalNames,
            draft: { started: true, completed: false, currentPick: 0, picks: {} },
        };
        if (!gameState.draft?.started) {
            await createGame(finalNames);
        }
        await saveGame(newState);
    };

    const handlePick = async (castawayId) => {
        if (!draft.started || draft.completed) return;
        const picks = { ...draft.picks, [castawayId]: draftOrder[draft.currentPick] };
        const nextPick = draft.currentPick + 1;
        const completed = nextPick >= draftOrder.length;
        await saveGame({
            ...gameState,
            draft: { ...draft, picks, currentPick: nextPick, completed },
        });
    };

    const handleResetDraft = async () => {
        await saveGame({
            ...gameState,
            draft: { started: false, completed: false, currentPick: 0, picks: {} },
        });
    };

    const currentDrafter = draft.started && !draft.completed ? draftOrder[draft.currentPick] : null;
    const currentRound = draft.started ? Math.floor(draft.currentPick / 4) + 1 : 0;

    // Get picks per player
    const playerPicks = {};
    for (const [castawayId, playerIdx] of Object.entries(draft.picks || {})) {
        if (!playerPicks[playerIdx]) playerPicks[playerIdx] = [];
        playerPicks[playerIdx].push(castawayId);
    }

    return (
        <div className="space-y-6">
            <ScreenHeader title="Season 50 Draft" subtitle="Each player drafts 6 castaways. Their fate is your fortune!" />

            {/* Setup or active draft indicator */}
            {!draft.started ? (
                <Card title="👥 Your Crew" className="p-6 max-w-md mx-auto">
                    <div className="space-y-2 mb-4">
                        {names.map((name, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: PLAYER_COLORS[i].hex }} />
                                <Input
                                    value={name}
                                    onChange={(e) => {
                                        const updated = [...names];
                                        updated[i] = e.target.value;
                                        setNames(updated);
                                    }}
                                    placeholder={`Player ${i + 1}`}
                                    maxLength={20}
                                    className="flex-1"
                                    aria-label={`Player ${i + 1} name`}
                                />
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleStartDraft} variant="primary" className="w-full py-3">
                        🔥 Start Draft
                    </Button>
                </Card>
            ) : !draft.completed ? (
                <div className="bg-stone-900 border border-fire-400/30 rounded-xl p-5 max-w-md mx-auto text-center shadow-fire">
                    <div className="font-display text-3xl tracking-wider" style={{ color: PLAYER_COLORS[currentDrafter].hex }}>
                        {players[currentDrafter]}
                    </div>
                    <p className="text-stone-400 text-sm mt-1">is on the clock</p>
                    <p className="text-stone-500 text-xs mt-2">Round {currentRound} of 6 · Pick {draft.currentPick + 1} of 24</p>
                </div>
            ) : (
                <div className="bg-stone-900 border border-jungle-400/30 rounded-xl p-5 max-w-md mx-auto text-center">
                    <p className="font-display text-2xl tracking-wider text-jungle-400">Draft Complete! 🎉</p>
                    <button onClick={handleResetDraft} className="mt-3 px-4 py-2 text-xs rounded-lg border border-stone-700 bg-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-600 transition-all cursor-pointer">
                        🔄 Reset Draft
                    </button>
                </div>
            )}

            {/* Tribe cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {Object.entries(TRIBES).map(([tribeKey, tribe]) => (
                    <div key={tribeKey} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                        <div
                            className="px-4 py-3 text-center font-display text-xl tracking-widest border-b-2"
                            style={{
                                borderColor: `var(--color-${tribeKey})`,
                                color: `var(--color-${tribeKey})`,
                                background: `linear-gradient(135deg, color-mix(in srgb, var(--color-${tribeKey}) 15%, transparent), transparent)`,
                            }}
                        >
                            {tribe.name} Tribe
                        </div>
                        <div className="p-2 space-y-1">
                            {tribe.members.map((c) => {
                                const draftedBy = draft.picks?.[c.id];
                                const isDrafted = draftedBy !== undefined;
                                const isClickable = draft.started && !draft.completed && !isDrafted;

                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => isClickable && handlePick(c.id)}
                                        disabled={!isClickable}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-all
                      ${isDrafted ? 'opacity-40 line-through cursor-default' : ''}
                      ${isClickable ? 'hover:bg-stone-800 hover:border-stone-600 cursor-pointer' : 'cursor-default'}
                      ${!isDrafted ? 'text-stone-200' : 'text-stone-500'}
                      border border-transparent
                    `}
                                        style={isDrafted ? { borderLeftColor: PLAYER_COLORS[draftedBy]?.hex, borderLeftWidth: '3px' } : {}}
                                    >
                                        <span className="font-medium">{c.name}</span>
                                        <span className="text-xs text-stone-500">{c.seasons}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Draft results */}
            {draft.completed && (
                <section>
                    <h3 className="font-display text-2xl tracking-wider text-center text-torch text-glow-torch mb-4">
                        🔥 Draft Results
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {players.map((name, idx) => {
                            const picks = playerPicks[idx] || [];
                            const allCastaways = Object.values(TRIBES).flatMap(t => t.members);
                            return (
                                <div
                                    key={idx}
                                    className="bg-stone-900 border border-stone-800 rounded-xl p-4"
                                    style={{ borderTopColor: PLAYER_COLORS[idx].hex, borderTopWidth: '3px' }}
                                >
                                    <h4 className="font-semibold text-sm mb-3" style={{ color: PLAYER_COLORS[idx].hex }}>
                                        {name}
                                    </h4>
                                    <ul className="space-y-1.5">
                                        {picks.map((cId) => {
                                            const c = allCastaways.find(x => x.id === cId);
                                            return (
                                                <li key={cId} className="text-xs text-stone-400 bg-stone-800/50 px-2.5 py-1.5 rounded">
                                                    {c?.name || cId}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
}
