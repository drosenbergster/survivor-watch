import { useState, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { computeStandings } from '../../scoring';
import { SCORE_EVENTS, ALL_CASTAWAYS, PLAYER_COLORS } from '../../data';
import { FijianCard, FijianSectionHeader, Icon } from '../fijian';

const SCORE_EMOJI = Object.fromEntries(SCORE_EVENTS.map(e => [e.key, e.emoji]));
const SCORE_LABEL = Object.fromEntries(SCORE_EVENTS.map(e => [e.key, e.label]));

function RankBadge({ rank }) {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-lg text-sand-warm/40 font-bold font-sans">#{rank}</span>;
}

function StandingsRow({ entry, rank, memberName, color, expanded, onToggle, perEpisode }) {
    const epNums = Object.keys(perEpisode || {}).map(Number).sort((a, b) => a - b);

    return (
        <div className="space-y-0">
            <button
                onClick={onToggle}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${expanded ? 'bg-stone-800/80' : 'hover:bg-stone-800/50'
                    }`}
            >
                <RankBadge rank={rank} />

                <div className={`w-2 h-8 rounded-full ${color?.bg || 'bg-ochre'}`} />

                <div className="flex-1 text-left">
                    <p className="font-sans font-bold text-sand-warm text-sm">{memberName}</p>
                    <div className="flex gap-3 text-xs text-sand-warm/50 font-sans">
                        <span>W:{entry.weekly}</span>
                        <span>P:{entry.predictions}</span>
                        <span>R:{entry.rideOrDie}</span>
                    </div>
                </div>

                <div className="text-right">
                    <p className="font-display text-2xl text-ochre tracking-wider">{entry.total}</p>
                    <p className="text-[10px] text-sand-warm/40 font-sans uppercase">pts</p>
                </div>

                <Icon
                    name="scoring"
                    className={`text-sand-warm/30 transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
            </button>

            {expanded && (
                <div className="ml-12 mr-3 pb-3 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <ScoreBox label="Weekly Picks" value={entry.weekly} color="text-fire-400" />
                        <ScoreBox label="Predictions" value={entry.predictions} color="text-green-400" />
                        <ScoreBox label="Ride or Die" value={entry.rideOrDie} color="text-sky-400" />
                    </div>

                    {epNums.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-sand-warm/50 font-sans font-semibold">Per Episode</p>
                            {epNums.map(epNum => {
                                const epScore = perEpisode[epNum]?.[entry.uid];
                                if (!epScore) return null;
                                return (
                                    <EpisodeBreakdown
                                        key={epNum}
                                        epNum={epNum}
                                        score={epScore}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ScoreBox({ label, value, color }) {
    return (
        <div className="bg-stone-800/60 rounded-lg p-2">
            <p className={`font-display text-lg ${color}`}>{value}</p>
            <p className="text-[10px] text-sand-warm/40 font-sans">{label}</p>
        </div>
    );
}

function EpisodeBreakdown({ epNum, score }) {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-3 py-2 bg-stone-900/60 rounded-lg hover:bg-stone-900/80 transition-all"
            >
                <span className="text-xs font-sans text-sand-warm/70">Ep {epNum}</span>
                <div className="flex gap-2 text-xs font-sans">
                    <span className="text-fire-400">{score.weekly}</span>
                    <span className="text-green-400">{score.predictions}</span>
                    <span className="text-sky-400">{score.rideOrDie}</span>
                    <span className="text-ochre font-bold">{score.total}</span>
                </div>
            </button>

            {open && (
                <div className="px-3 py-2 space-y-1.5 text-xs font-sans">
                    {score.breakdown.weekly.map((w, i) => (
                        <div key={i} className="flex justify-between text-sand-warm/60">
                            <span>
                                {w.name}
                                {w.scarcityBonus && <span className="text-ochre ml-1">×1.5</span>}
                                <span className="text-sand-warm/30 ml-1">
                                    ({w.events.map(e => SCORE_EMOJI[e] || e).join(' ')})
                                </span>
                            </span>
                            <span className="text-fire-400">+{w.points}</span>
                        </div>
                    ))}
                    {score.breakdown.predictions.map((p, i) => (
                        <div key={`p${i}`} className="flex justify-between text-sand-warm/60">
                            <span>
                                {p.type === 'elimination' && '🎯 Correct elimination'}
                                {p.type === 'bold' && '💡 Bold prediction'}
                                {p.type === 'propBet' && `📊 ${p.text}`}
                            </span>
                            <span className="text-green-400">+{p.points}</span>
                        </div>
                    ))}
                    {score.breakdown.rideOrDie.map((r, i) => (
                        <div key={`r${i}`} className="flex justify-between text-sand-warm/60">
                            <span>
                                💀 {r.name}
                                {r.reason === 'survived' && ' survived'}
                                {r.reason === 'ftc' && ' made FTC'}
                                {r.reason === 'winner' && ' won!'}
                            </span>
                            <span className="text-sky-400">+{r.points}</span>
                        </div>
                    ))}
                    {score.breakdown.weekly.length === 0 && score.breakdown.predictions.length === 0 && score.breakdown.rideOrDie.length === 0 && (
                        <p className="text-sand-warm/30 italic">No points this episode</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default function ScoreboardTab() {
    const { episodes, rideOrDies, leagueMembers } = useApp();
    const [expandedUid, setExpandedUid] = useState(null);

    const memberUids = useMemo(() => Object.keys(leagueMembers || {}), [leagueMembers]);

    const { standings, perEpisode } = useMemo(
        () => computeStandings(episodes, rideOrDies, memberUids),
        [episodes, rideOrDies, memberUids]
    );

    const hasScoredEpisodes = Object.values(episodes || {}).some(ep => ep.scored);

    return (
        <div className="space-y-6">
            <header className="text-center">
                <h2 className="font-display text-4xl tracking-wider text-sand-warm drop-shadow-text">Tovo</h2>
                <p className="text-sand-warm/70 text-sm mt-1 font-sans">Scores</p>
            </header>

            {!hasScoredEpisodes ? (
                <FijianCard className="p-8 max-w-md mx-auto text-center">
                    <FijianSectionHeader title="No Scores Yet" className="justify-center" />
                    <div className="flex justify-center mb-4 opacity-30">
                        <Icon name="leaderboard" className="text-ochre text-4xl" />
                    </div>
                    <p className="text-earth font-serif italic text-sm leading-relaxed">
                        The scoreboard will light up once the first episode is scored. May the best castaway win!
                    </p>
                </FijianCard>
            ) : (
                <>
                    <FijianCard className="p-4 space-y-1">
                        <FijianSectionHeader title="Season Standings" />
                        {standings.map((entry, i) => {
                            const colorIndex = memberUids.indexOf(entry.uid);
                            return (
                                <StandingsRow
                                    key={entry.uid}
                                    entry={entry}
                                    rank={i + 1}
                                    memberName={leagueMembers[entry.uid]?.displayName || entry.uid}
                                    color={PLAYER_COLORS[colorIndex] || PLAYER_COLORS[0]}
                                    expanded={expandedUid === entry.uid}
                                    onToggle={() => setExpandedUid(expandedUid === entry.uid ? null : entry.uid)}
                                    perEpisode={perEpisode}
                                />
                            );
                        })}
                    </FijianCard>

                    <FijianCard className="p-4">
                        <FijianSectionHeader title="Scoring Guide" />
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-sans text-sand-warm/60 mt-2">
                            {SCORE_EVENTS.map(e => (
                                <div key={e.key} className="flex justify-between">
                                    <span>{e.emoji} {e.label}</span>
                                    <span className="text-ochre">+{e.points}</span>
                                </div>
                            ))}
                            <div className="col-span-2 border-t border-stone-700 mt-2 pt-2">
                                <div className="flex justify-between">
                                    <span>🎯 Correct elimination pick</span>
                                    <span className="text-ochre">+5</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>💡 Bold prediction confirmed</span>
                                    <span className="text-ochre">+10</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>📊 Correct prop bet</span>
                                    <span className="text-ochre">+3</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>💀 Ride or Die survived</span>
                                    <span className="text-ochre">+2/ep</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>⭐ Exclusive pick bonus</span>
                                    <span className="text-ochre">×1.5</span>
                                </div>
                            </div>
                        </div>
                    </FijianCard>
                </>
            )}
        </div>
    );
}
