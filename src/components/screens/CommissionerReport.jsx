import { useMemo } from 'react';
import { useApp } from '../../AppContext';
import { computeStandings, generateCommissionerReport, detectAchievements } from '../../scoring';
import { FijianCard, Icon } from '../fijian';

export default function CommissionerReport({ episodeNum }) {
    const {
        episodes, rideOrDies, leagueMembers, bingo,
        postEpisode,
    } = useApp();

    const memberUids = useMemo(() => Object.keys(leagueMembers || {}), [leagueMembers]);

    const { standings, perEpisode } = useMemo(
        () => computeStandings(episodes, rideOrDies, memberUids, bingo, postEpisode),
        [episodes, rideOrDies, memberUids, bingo, postEpisode]
    );

    const achievements = useMemo(
        () => detectAchievements(episodes, rideOrDies, memberUids, bingo, postEpisode, perEpisode),
        [episodes, rideOrDies, memberUids, bingo, postEpisode, perEpisode]
    );

    const report = useMemo(
        () => generateCommissionerReport(episodeNum, episodes, standings, perEpisode, leagueMembers, achievements),
        [episodeNum, episodes, standings, perEpisode, leagueMembers, achievements]
    );

    if (!report) return null;

    return (
        <div className="space-y-3">
            {/* Headline card */}
            <FijianCard className="p-5 bg-gradient-to-br from-stone-800/90 to-stone-900/80 border-ochre/30">
                <div className="text-center space-y-2">
                    <p className="text-ochre/60 text-[10px] font-bold uppercase tracking-[0.3em]">Auto-Commissioner</p>
                    <p className="font-display text-xl tracking-wider text-ochre leading-tight">
                        {report.headline}
                    </p>
                    {report.subheadlines.map((h, i) => (
                        <p key={i} className="text-sand-warm/50 text-xs font-sans">{h}</p>
                    ))}
                </div>
            </FijianCard>

            {/* Standings snapshot */}
            {report.standings && report.standings.length > 0 && (
                <FijianCard className="p-4 space-y-2">
                    <p className="text-ochre/60 text-[10px] font-bold uppercase tracking-widest">Standings</p>
                    {report.standings.map(s => (
                        <div key={s.rank} className="flex items-center gap-3 text-sm font-sans">
                            <span className={`w-6 text-center font-bold ${s.rank === 1 ? 'text-ochre' : 'text-sand-warm/40'}`}>
                                {s.rank === 1 ? '👑' : `#${s.rank}`}
                            </span>
                            <span className="flex-1 text-sand-warm">{s.name}</span>
                            <span className="text-jungle-400 text-xs">+{s.epPoints}</span>
                            <span className="text-ochre font-bold w-10 text-right">{s.total}</span>
                        </div>
                    ))}
                </FijianCard>
            )}

            {/* Superlatives row */}
            <div className="grid grid-cols-3 gap-2">
                {report.biggestMover && (
                    <FijianCard className="p-3 text-center">
                        <p className="text-lg">📈</p>
                        <p className="text-ochre text-xs font-bold font-sans truncate">{report.biggestMover.name}</p>
                        <p className="text-sand-warm/40 text-[10px] font-sans">+{report.biggestMover.points} pts</p>
                        <p className="text-sand-warm/30 text-[9px] uppercase tracking-wider mt-0.5">Top Scorer</p>
                    </FijianCard>
                )}
                {report.worstEpisode && (
                    <FijianCard className="p-3 text-center">
                        <p className="text-lg">📉</p>
                        <p className="text-fire-400/80 text-xs font-bold font-sans truncate">{report.worstEpisode.name}</p>
                        <p className="text-sand-warm/40 text-[10px] font-sans">{report.worstEpisode.points} pts</p>
                        <p className="text-sand-warm/30 text-[9px] uppercase tracking-wider mt-0.5">Cold Week</p>
                    </FijianCard>
                )}
                {report.bestPick && (
                    <FijianCard className="p-3 text-center">
                        <p className="text-lg">⭐</p>
                        <p className="text-sky-400 text-xs font-bold font-sans truncate">{report.bestPick.name}</p>
                        <p className="text-sand-warm/40 text-[10px] font-sans">{report.bestPick.points} pts</p>
                        <p className="text-sand-warm/30 text-[9px] uppercase tracking-wider mt-0.5">MVP Pick</p>
                    </FijianCard>
                )}
            </div>

            {/* Elimination */}
            {report.eliminated.length > 0 && (
                <FijianCard className="p-4 space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🔥</span>
                        <span className="text-sand-warm text-sm font-sans">
                            {report.eliminated.join(' & ')} eliminated
                        </span>
                    </div>
                    {report.correctPredictors.length > 0 && (
                        <p className="text-jungle-400 text-xs font-sans ml-7">
                            Called it: {report.correctPredictors.join(', ')}
                        </p>
                    )}
                </FijianCard>
            )}

            {/* New achievements */}
            {report.newBadges.length > 0 && (
                <FijianCard className="p-4 space-y-2">
                    <p className="text-ochre/60 text-[10px] font-bold uppercase tracking-widest">Badges Earned</p>
                    {report.newBadges.map((b, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm font-sans">
                            <span className="text-lg">{b.emoji}</span>
                            <span className="text-sand-warm">{b.name}</span>
                            <span className="text-ochre/60 text-xs ml-auto">{b.badge}</span>
                        </div>
                    ))}
                </FijianCard>
            )}
        </div>
    );
}
