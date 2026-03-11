import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BingoSquare, FijianCard, Icon } from '../fijian';
import { generateBingoCard, detectBingoLines, isBingoBlackout, BINGO_LINES } from '../../data';

const BULA_DURATION = 5000;
const LONG_PRESS_MS = 500;
const TOOLTIP_DURATION = 2500;
const BINGO_HEADERS = ['B', 'I', 'N', 'G', 'O'];

export default function BingoCard({ seed, marked: savedMarked, onSave, disabled }) {
    const card = useMemo(() => generateBingoCard(seed), [seed]);

    const [marked, setMarked] = useState(() => {
        if (savedMarked && savedMarked.length === 25) return savedMarked;
        const m = Array(25).fill(false);
        m[12] = true;
        return m;
    });

    useEffect(() => {
        if (savedMarked && savedMarked.length === 25) {
            setMarked(savedMarked); // eslint-disable-line react-hooks/set-state-in-effect -- sync external prop
        }
    }, [savedMarked]);

    const [bulaVisible, setBulaVisible] = useState(false);
    const [bulaType, setBulaType] = useState(null);
    const prevLinesRef = useRef(0);

    const lines = useMemo(() => detectBingoLines(marked), [marked]);
    const blackout = useMemo(() => isBingoBlackout(marked), [marked]);

    const winningSquares = useMemo(() => {
        const s = new Set();
        lines.forEach(line => line.forEach(i => s.add(i)));
        return s;
    }, [lines]);

    const nearestSquares = useMemo(() => {
        const s = new Set();
        for (const line of BINGO_LINES) {
            const unmarkedInLine = line.filter(i => !marked[i]);
            if (unmarkedInLine.length === 1) s.add(unmarkedInLine[0]);
        }
        return s;
    }, [marked]);

    useEffect(() => {
        if (lines.length > prevLinesRef.current) {
            setBulaType(blackout ? 'blackout' : 'bingo'); // eslint-disable-line react-hooks/set-state-in-effect -- celebration trigger
            setBulaVisible(true);
            const t = setTimeout(() => setBulaVisible(false), BULA_DURATION);
            return () => clearTimeout(t);
        }
        prevLinesRef.current = lines.length;
    }, [lines.length, blackout]);

    // Long-press tooltip
    const [tooltipIdx, setTooltipIdx] = useState(null);
    const longPressRef = useRef(null);
    const didLongPress = useRef(false);

    const startLongPress = useCallback((i) => {
        didLongPress.current = false;
        longPressRef.current = setTimeout(() => {
            didLongPress.current = true;
            setTooltipIdx(i);
        }, LONG_PRESS_MS);
    }, []);

    const endLongPress = useCallback(() => {
        clearTimeout(longPressRef.current);
    }, []);

    useEffect(() => {
        if (tooltipIdx !== null) {
            const t = setTimeout(() => setTooltipIdx(null), TOOLTIP_DURATION);
            return () => clearTimeout(t);
        }
    }, [tooltipIdx]);

    const toggle = useCallback((i) => {
        if (didLongPress.current) {
            didLongPress.current = false;
            return;
        }
        if (i === 12 || disabled) return;
        setMarked(prev => {
            const next = [...prev];
            next[i] = !next[i];
            return next;
        });
    }, [disabled]);

    useEffect(() => {
        if (onSave) {
            const debounce = setTimeout(() => onSave(marked), 500);
            return () => clearTimeout(debounce);
        }
    }, [marked, onSave]);

    return (
        <div className="relative">
            {bulaVisible && (
                <div
                    className="absolute inset-0 z-50 flex items-center justify-center animate-fade-in cursor-pointer"
                    onClick={() => setBulaVisible(false)}
                    role="status"
                >
                    <div className="bg-gradient-to-br from-ochre via-sunset to-masi-red rounded-2xl px-8 py-6 text-center shadow-2xl transform scale-110 animate-bounce">
                        <p className="font-display text-5xl text-white tracking-widest drop-shadow-text">
                            {bulaType === 'blackout' ? '🔥 BLACKOUT 🔥' : '🌺 BULA! 🌺'}
                        </p>
                        <p className="text-white/80 text-sm mt-2 font-sans">
                            {bulaType === 'blackout' ? 'Every square! +50 bonus points!' : `Line ${lines.length}! +5 points each!`}
                        </p>
                        <p className="text-white/50 text-xs mt-3 font-sans">Tap to dismiss</p>
                    </div>
                </div>
            )}

            {tooltipIdx !== null && (
                <div
                    className="absolute top-1 left-1 right-1 z-40 flex justify-center animate-fade-in"
                    onClick={() => setTooltipIdx(null)}
                >
                    <div className="bg-masi-black/95 border border-ochre/30 rounded-lg px-4 py-2.5 text-masi-cream text-sm text-center shadow-xl max-w-[85%]">
                        {card[tooltipIdx]}
                    </div>
                </div>
            )}

            <FijianCard className="p-2">
                <div className="grid grid-cols-5 gap-[2px]">
                    {BINGO_HEADERS.map(letter => (
                        <div key={letter} className="text-center font-display text-xs sm:text-sm text-ochre tracking-widest py-1">
                            {letter}
                        </div>
                    ))}
                    {card.map((item, i) => (
                        <BingoSquare
                            key={i}
                            label={item}
                            isFree={i === 12}
                            isTabua={i === 12}
                            isMarked={marked[i]}
                            isWinning={winningSquares.has(i)}
                            isNearest={nearestSquares.has(i)}
                            onClick={() => toggle(i)}
                            onPointerDown={() => startLongPress(i)}
                            onPointerUp={endLongPress}
                            onPointerLeave={endLongPress}
                            disabled={disabled}
                        />
                    ))}
                </div>
            </FijianCard>

            <div className="flex items-center justify-between mt-3 px-1">
                <div className="flex items-center gap-2 text-xs text-sand-warm/60">
                    <span className="inline-block w-3 h-3 rounded-sm bg-masi-red" /> Marked
                    <span className="inline-block w-3 h-3 rounded-sm bg-masi-ochre/40 ml-2" /> Free
                    {nearestSquares.size > 0 && (
                        <span className="inline-block w-3 h-3 rounded-sm ring-1 ring-ochre/50 bg-masi-black ml-2" />
                    )}
                    {nearestSquares.size > 0 && <span>Almost!</span>}
                </div>
                <div className="text-xs text-sand-warm/60">
                    {lines.length > 0 && (
                        <span className="text-ochre font-semibold">
                            <Icon name="star" className="text-sm align-text-bottom" /> {lines.length} {lines.length === 1 ? 'line' : 'lines'}
                            {blackout && ' + BLACKOUT'}
                        </span>
                    )}
                    {lines.length === 0 && `${marked.filter(Boolean).length}/25 marked`}
                </div>
            </div>
        </div>
    );
}
