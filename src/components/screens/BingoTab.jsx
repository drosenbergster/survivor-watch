import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../AppContext';
import { generateBingoCard } from '../../data';
import { ScreenHeader, Button } from '../ui';

export default function BingoTab() {
    const { gameState, saveGame } = useApp();
    const { players, bingo } = gameState;

    const [selectedPlayer, setSelectedPlayer] = useState(0);
    const [winAnimation, setWinAnimation] = useState(false);
    const [winningCells, setWinningCells] = useState([]);

    // Get or generate card for selected player
    const playerCard = bingo?.cards?.[selectedPlayer];
    const seed = playerCard?.seed || (selectedPlayer + 1) * 7919;
    const marks = playerCard?.marks || Array(25).fill(false);
    const card = generateBingoCard(seed);

    const saveBingoState = useCallback(async (s, m) => {
        const newCards = { ...(bingo?.cards || {}) };
        newCards[selectedPlayer] = { seed: s, marks: m };
        await saveGame({
            ...gameState,
            bingo: { ...bingo, cards: newCards },
        });
    }, [selectedPlayer, gameState, bingo, saveGame]);

    // Always mark free space
    useEffect(() => {
        if (!marks[12]) {
            const newMarks = [...marks];
            newMarks[12] = true;
            saveBingoState(seed, newMarks);
        }
    }, [selectedPlayer, marks, seed, saveBingoState]);

    const toggleMark = async (index) => {
        if (index === 12) return; // Free space always marked
        const newMarks = [...marks];
        newMarks[index] = !newMarks[index];
        await saveBingoState(seed, newMarks);
        checkWin(newMarks);
    };

    const checkWin = useCallback((m) => {
        const lines = [
            // Rows
            [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
            // Cols
            [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
            // Diagonals
            [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
        ];
        for (const line of lines) {
            if (line.every(i => m[i])) {
                setWinAnimation(true);
                setWinningCells(line);
                return;
            }
        }
        setWinAnimation(false);
        setWinningCells([]);
    }, []);

    const newCard = async () => {
        const newSeed = Math.floor(Math.random() * 100000);
        const freshMarks = Array(25).fill(false);
        freshMarks[12] = true;
        await saveBingoState(newSeed, freshMarks);
        setWinAnimation(false);
        setWinningCells([]);
    };

    const resetMarks = async () => {
        const freshMarks = Array(25).fill(false);
        freshMarks[12] = true;
        await saveBingoState(seed, freshMarks);
        setWinAnimation(false);
        setWinningCells([]);
    };

    return (
        <div className="space-y-6">
            <ScreenHeader
                title="Survivor Bingo"
                subtitle={
                    <>
                        Mark squares as they happen. First to 5 in a row yells{' '}
                        <span className="text-fire-400 font-bold text-base">"JEFF PROBST!"</span> 🍻
                    </>
                }
            />

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
                <label htmlFor="player-select" className="text-stone-400 text-sm">Card for:</label>
                <select
                    id="player-select"
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg border border-stone-700 bg-stone-800 text-stone-100 text-sm outline-none"
                    aria-label="Select player for bingo card"
                >
                    {players.map((name, i) => (
                        <option key={i} value={i}>{name}</option>
                    ))}
                </select>
                <Button onClick={newCard}>🔀 New Card</Button>
                <Button onClick={resetMarks}>🔄 Reset</Button>
            </div>

            {/* Bingo Board */}
            <div className="grid grid-cols-5 gap-1.5 max-w-lg mx-auto" role="grid" aria-label="Bingo card">
                {card.map((item, i) => {
                    const isFree = i === 12;
                    const isMarked = marks[i];
                    const isWinning = winningCells.includes(i);

                    return (
                        <button
                            key={i}
                            onClick={() => toggleMark(i)}
                            className={`aspect-square flex items-center justify-center text-center p-1.5 rounded-lg text-xs leading-tight transition-all cursor-pointer select-none
                ${isFree
                                    ? 'bg-gradient-to-br from-jungle-400 to-jungle-600 text-white font-bold border border-jungle-400'
                                    : isMarked
                                        ? 'bg-gradient-to-br from-fire-400 to-fire-600 text-white font-semibold border border-fire-400 shadow-fire'
                                        : 'bg-stone-900 border border-stone-700 text-stone-400 hover:bg-stone-800 hover:border-stone-600 hover:text-stone-200'}
                ${isWinning ? 'animate-pulse-win' : ''}
              `}
                            aria-pressed={isMarked}
                            aria-label={isFree ? 'Free space' : `${item}${isMarked ? ', marked' : ''}`}
                        >
                            <span className="line-clamp-4">{item}</span>
                        </button>
                    );
                })}
            </div>

            {/* Win animation */}
            {winAnimation && (
                <div className="text-center animate-bounce-in" role="status" aria-live="polite">
                    <span className="font-display text-5xl tracking-wider text-torch text-glow-torch block">
                        🔥 JEFF PROBST! 🔥
                    </span>
                    <p className="text-stone-400 text-lg mt-2">BINGO! The tribe has spoken! 🍻</p>
                </div>
            )}
        </div>
    );
}
