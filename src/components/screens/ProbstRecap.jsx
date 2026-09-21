import { useMemo } from 'react';
import { useApp } from '../../AppContext';
import { ALL_CASTAWAYS } from '../../data';
import { computeStandings, generateProbstRecap } from '../../scoring';
import { FijianCard, Icon } from '../fijian';

export default function ProbstRecap({ episodeNum }) {
    const {
        episodes, rideOrDies, leagueMembers, bingo,
        postEpisode, league, auction,
    } = useApp();

    const memberUids = useMemo(() => Object.keys(leagueMembers || {}), [leagueMembers]);

    const { standings, perEpisode } = useMemo(
        () => computeStandings(episodes, rideOrDies, memberUids, bingo, postEpisode, league?.preSeasonEliminated, auction),
        [episodes, rideOrDies, memberUids, bingo, postEpisode, league?.preSeasonEliminated, auction]
    );

    const report = useMemo(
        () => generateProbstRecap(episodeNum, episodes, standings, perEpisode, leagueMembers, null),
        [episodeNum, episodes, standings, perEpisode, leagueMembers]
    );

    if (!report) return null;

    const { challengeHighlights: ch } = report;
    const hasChallengeHighlights = ch.immunityWinners.length > 0 || ch.rewardWinners.length > 0
        || ch.idolPlays.length > 0 || ch.idolFinds.length > 0 || ch.advantagePlays.length > 0;

    const hasSuperlatives = report.biggestMover || report.worstEpisode || report.bestPick;

    return (
        <div className="space-y-3">
            <FijianCard className="overflow-hidden">
                {/* Previously On headline */}
                <div className="p-5 bg-gradient-to-br from-stone-800/90 to-stone-900/80">
                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-[1px] w-6 bg-ochre/40" />
                            <p className="text-ochre text-[10px] font-bold uppercase tracking-[0.3em]">
                                Previously On... Survivor
                            </p>
                            <div className="h-[1px] w-6 bg-ochre/40" />
                        </div>
                        <p className="font-display text-xl tracking-wider text-ochre leading-tight">
                            {report.headline}
                        </p>
                    </div>
                </div>

                {/* Key Moments */}
                {hasChallengeHighlights && (
                    <div className="px-4 py-3 border-t border-ochre/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Icon name="emoji_events" className="text-ochre text-sm" />
                            <p className="text-ochre text-[11px] font-bold uppercase tracking-widest">Key Moments</p>
                        </div>
                        <div className="space-y-1.5">
                            {ch.immunityWinners.map((name, i) => (
                                <MomentRow key={`imm${i}`} emoji="🏅" text={`${name} won individual immunity`} />
                            ))}
                            {ch.rewardWinners.map((name, i) => (
                                <MomentRow key={`rew${i}`} emoji="🎁" text={`${name} won reward`} />
                            ))}
                            {ch.idolFinds.map((name, i) => (
                                <MomentRow key={`find${i}`} emoji="🗿" text={`${name} found a hidden immunity idol`} />
                            ))}
                            {ch.idolPlays.map((name, i) => (
                                <MomentRow key={`idol${i}`} emoji="💎" text={`${name} played an idol successfully`} color="text-fire-400" />
                            ))}
                            {ch.advantagePlays.map((name, i) => (
                                <MomentRow key={`adv${i}`} emoji="🃏" text={`${name} used an advantage`} />
                            ))}
                            {ch.survivedWithVotes.map((name, i) => (
                                <MomentRow key={`surv${i}`} emoji="🛡️" text={`${name} survived with votes against`} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Elimination */}
                {report.eliminated.length > 0 && (
                    <div className="px-4 py-3 border-t border-ochre/10">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">🔥</span>
                            <div>
                                <p className="text-sand-warm text-sm font-sans font-bold">
                                    {report.eliminated.join(' & ')}
                                </p>
                                <p className="text-sand-warm/50 text-xs font-sans">
                                    {report.eliminationMethod === 'medevac' ? 'Medical evacuation'
                                        : report.eliminationMethod === 'quit' ? 'Quit the game'
                                        : report.eliminationMethod === 'fire' ? 'Lost fire-making'
                                        : 'Voted out'}
                                </p>
                            </div>
                        </div>
                        {report.correctPredictors.length > 0 && (
                            <div className="flex items-center gap-2 ml-7 mt-1.5">
                                <Icon name="check_circle" className="text-jungle-400 text-sm" />
                                <p className="text-jungle-400 text-xs font-sans">
                                    Called it: {report.correctPredictors.join(', ')}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Superlatives */}
                {hasSuperlatives && (
                    <div className="px-4 py-3 border-t border-ochre/10">
                        <div className="grid grid-cols-3 gap-2">
                            {report.biggestMover && (
                                <div className="text-center">
                                    <p className="text-base">📈</p>
                                    <p className="text-ochre text-xs font-bold font-sans truncate">{report.biggestMover.name}</p>
                                    <p className="text-sand-warm/60 text-[10px] font-sans">+{report.biggestMover.points} pts</p>
                                    <p className="text-sand-warm/40 text-[10px] uppercase tracking-wider">Top Scorer</p>
                                </div>
                            )}
                            {report.worstEpisode && (
                                <div className="text-center">
                                    <p className="text-base">📉</p>
                                    <p className="text-fire-400/80 text-xs font-bold font-sans truncate">{report.worstEpisode.name}</p>
                                    <p className="text-sand-warm/60 text-[10px] font-sans">{report.worstEpisode.points} pts</p>
                                    <p className="text-sand-warm/40 text-[10px] uppercase tracking-wider">Cold Week</p>
                                </div>
                            )}
                            {report.bestPick && (
                                <div className="text-center">
                                    <p className="text-base">⭐</p>
                                    <p className="text-sky-400 text-xs font-bold font-sans truncate">{report.bestPick.name}</p>
                                    <p className="text-sand-warm/60 text-[10px] font-sans">{report.bestPick.points} pts</p>
                                    <p className="text-sand-warm/40 text-[10px] uppercase tracking-wider">MVP Pick</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Standings */}
                {report.standings && report.standings.length > 0 && (
                    <div className="px-4 py-3 border-t border-ochre/10">
                        <p className="text-ochre text-[11px] font-bold uppercase tracking-widest mb-2">Standings</p>
                        <div className="space-y-1">
                            {report.standings.map(s => (
                                <div key={s.rank} className="flex items-center gap-3 text-sm font-sans">
                                    <span className={`w-6 text-center font-bold ${s.rank === 1 ? 'text-ochre' : 'text-sand-warm/60'}`}>
                                        {s.rank === 1 ? '👑' : `#${s.rank}`}
                                    </span>
                                    <span className="flex-1 text-sand-warm">{s.name}</span>
                                    <span className="text-jungle-400 text-xs">+{s.epPoints}</span>
                                    <span className="text-ochre font-bold w-10 text-right">{s.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </FijianCard>
        </div>
    );
}

function MomentRow({ emoji, text, color = 'text-sand-warm/70' }) {
    return (
        <div className="flex items-center gap-2 text-sm font-sans">
            <span className="text-base">{emoji}</span>
            <span className={color}>{text}</span>
        </div>
    );
}
