import { useState, useMemo, useCallback } from 'react';
import { FijianCard, FijianSectionHeader, Icon } from '../fijian';
import { useApp } from '../../AppContext';
import { generateBingoCard } from '../../data';
import BingoCard from './BingoCard';
import LightYourTorch from './LightYourTorch';

function EpisodeSelector({ current, total, selected, onSelect }) {
    return (
        <div className="flex items-center gap-2 justify-center flex-wrap">
            {Array.from({ length: total }, (_, i) => i + 1).map(ep => (
                <button
                    key={ep}
                    onClick={() => onSelect(ep)}
                    className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${
                        ep === selected
                            ? 'bg-ochre text-black shadow-md scale-110'
                            : ep <= current
                                ? 'bg-black/30 text-sand-warm/80 hover:bg-ochre/30 border border-ochre/20'
                                : 'bg-black/10 text-sand-warm/30 cursor-not-allowed'
                    }`}
                    disabled={ep > current}
                >
                    {ep}
                </button>
            ))}
        </div>
    );
}

function BingoRecap({ episodeNum, leagueId, userId }) {
    const seed = `${leagueId}-${episodeNum}-${userId}`;
    const card = useMemo(() => generateBingoCard(seed), [seed]);
    const { watchStatus } = useApp();

    const ws = watchStatus[episodeNum]?.[userId];
    if (!ws?.watchedAt) {
        return (
            <FijianCard className="p-4 text-center">
                <p className="text-sand-warm/50 text-sm italic">You didn&apos;t watch this episode through the app.</p>
            </FijianCard>
        );
    }

    // In a real app, saved bingo marks would be loaded from Firebase
    // For now show the card layout
    return (
        <FijianCard className="p-3">
            <FijianSectionHeader title={`Episode ${episodeNum} Card`} />
            <div className="grid grid-cols-5 gap-[2px] mt-2 opacity-60 pointer-events-none">
                {card.map((item, i) => (
                    <div
                        key={i}
                        className={`aspect-square flex items-center justify-center p-1 text-center text-[7px] font-medium uppercase leading-tight rounded-sm ${
                            i === 12 ? 'bg-masi-ochre/40 text-masi-cream' : 'bg-masi-black text-masi-cream/50'
                        }`}
                    >
                        {item}
                    </div>
                ))}
            </div>
        </FijianCard>
    );
}

export default function BingoTab() {
    const {
        user, league, leagueId, currentEpisode, episodes,
        isWatching, hasWatched, saveBingoMarks, bingo,
    } = useApp();

    const [selectedEp, setSelectedEp] = useState(currentEpisode || 1);
    const totalEpisodes = currentEpisode || 1;

    const epData = episodes[selectedEp];
    const isOpen = epData?.status === 'open';
    const isScored = epData?.status === 'scored';

    const watching = isWatching(selectedEp);
    const watched = hasWatched(selectedEp);

    const seed = user ? `${leagueId}-${selectedEp}-${user.uid}` : 'fallback';

    const handleSave = useCallback((marked) => {
        if (saveBingoMarks) saveBingoMarks(selectedEp, marked);
    }, [saveBingoMarks, selectedEp]);

    if (!league || league.status !== 'active') {
        return (
            <div className="space-y-6">
                <header className="text-center">
                    <h2 className="font-display text-4xl tracking-wider text-sand-warm drop-shadow-text">Qito</h2>
                    <p className="text-sand-warm/70 text-sm mt-1 font-sans">Bingo</p>
                </header>
                <FijianCard className="p-8 max-w-md mx-auto text-center">
                    <FijianSectionHeader title="Not Yet" className="justify-center" />
                    <div className="flex justify-center mb-4 opacity-30">
                        <Icon name="grid_view" className="text-ochre text-4xl" />
                    </div>
                    <p className="text-earth font-serif italic text-sm leading-relaxed">
                        Bingo cards activate once the season begins. Complete your draft first!
                    </p>
                </FijianCard>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <header className="text-center">
                <h2 className="font-display text-4xl tracking-wider text-sand-warm drop-shadow-text">Qito</h2>
                <p className="text-sand-warm/70 text-sm mt-1 font-sans">Bingo</p>
            </header>

            {totalEpisodes > 1 && (
                <EpisodeSelector
                    current={totalEpisodes}
                    total={Math.max(totalEpisodes, 14)}
                    selected={selectedEp}
                    onSelect={setSelectedEp}
                />
            )}

            {isOpen && !watching && !watched && (
                <LightYourTorch episodeNum={selectedEp} />
            )}

            {isScored && !watched && (
                <LightYourTorch episodeNum={selectedEp} />
            )}

            {watching && (
                <div className="max-w-sm mx-auto">
                    <BingoCard
                        seed={seed}
                        marked={bingo?.[selectedEp]?.[user?.uid]}
                        onSave={handleSave}
                        disabled={false}
                    />
                </div>
            )}

            {isScored && watched && (
                <div className="space-y-3">
                    <FijianSectionHeader title="Your Card" />
                    <div className="max-w-sm mx-auto">
                        <BingoCard
                            seed={seed}
                            marked={bingo?.[selectedEp]?.[user?.uid]}
                            disabled={true}
                        />
                    </div>
                </div>
            )}

            {isScored && watched && (
                <FijianCard className="p-4 space-y-2">
                    <FijianSectionHeader title="Bingo Recap" />
                    <p className="text-sand-warm/60 text-xs font-sans">
                        Your bingo results for Episode {selectedEp} are included in the scoreboard.
                    </p>
                </FijianCard>
            )}

            {currentEpisode && currentEpisode > 1 && selectedEp === currentEpisode && (
                <div className="space-y-3">
                    <FijianSectionHeader title="Past Episodes" />
                    <div className="space-y-2">
                        {Array.from({ length: currentEpisode - 1 }, (_, i) => currentEpisode - 1 - i).map(ep => (
                            <button
                                key={ep}
                                onClick={() => setSelectedEp(ep)}
                                className="w-full text-left px-4 py-3 rounded-lg bg-black/20 border border-ochre/10 hover:border-ochre/30 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sand-warm text-sm font-sans">Episode {ep}</span>
                                    <div className="flex items-center gap-2">
                                        {hasWatched(ep) && (
                                            <Icon name="check_circle" className="text-emerald-400 text-sm" />
                                        )}
                                        <Icon name="chevron_right" className="text-sand-warm/40 text-sm" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
