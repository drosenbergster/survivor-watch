import { useMemo } from 'react';
import { useApp } from '../../AppContext';
import { computeStandings, generateProbstRecap, detectAchievements } from '../../scoring';
import { FijianCard, Icon } from '../fijian';

export default function ProbstRecap({ episodeNum }) {
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
        () => generateProbstRecap(episodeNum, episodes, standings, perEpisode, leagueMembers, achievements),
        [episodeNum, episodes, standings, perEpisode, leagueMembers, achievements]
    );

    if (!report) return null;

    const { challengeHighlights: ch } = report;
    const hasChallengeHighlights = ch.immunityWinners.length > 0 || ch.rewardWinners.length > 0
        || ch.idolPlays.length > 0 || ch.idolFinds.length > 0 || ch.advantagePlays.length > 0;

    return (
        <div className="space-y-3">
            {/* "Previously On" headline */}
            <FijianCard className="p-5 bg-gradient-to-br from-stone-800/90 to-stone-900/80 border-ochre/30">
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
            </FijianCard>

            {/* Challenge & Big Moments highlights */}
            {hasChallengeHighlights && (
                <FijianCard className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
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
                </FijianCard>
            )}

            {/* Elimination */}
            {report.eliminated.length > 0 && (
                <FijianCard className="p-4 space-y-2">
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
                        <div className="flex items-center gap-2 ml-7">
                            <Icon name="check_circle" className="text-jungle-400 text-sm" />
                            <p className="text-jungle-400 text-xs font-sans">
                                Called it: {report.correctPredictors.join(', ')}
                            </p>
                        </div>
                    )}
                </FijianCard>
            )}

            {/* Confessional King/Queen */}
            {report.confessionalKing && (
                <FijianCard className="p-3 flex items-center gap-3">
                    <span className="text-lg">🎬</span>
                    <div className="flex-1">
                        <p className="text-sand-warm text-sm font-sans font-bold">{report.confessionalKing.name}</p>
                        <p className="text-sand-warm/50 text-[10px] font-sans uppercase tracking-wider">Confessional King/Queen</p>
                    </div>
                    <span className="text-ochre font-display text-lg">{report.confessionalKing.count}</span>
                </FijianCard>
            )}

            {/* Exclusive pick bonuses */}
            {report.exclusivePicks.length > 0 && (
                <FijianCard className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <Icon name="diamond" className="text-ochre text-sm" />
                        <p className="text-ochre text-[11px] font-bold uppercase tracking-widest">Solo Pick Bonus</p>
                    </div>
                    {report.exclusivePicks.map((ep, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-sans">
                            <span className="text-sand-warm">{ep.player}</span>
                            <span className="text-sand-warm/40">→</span>
                            <span className="text-sand-warm/70">{ep.contestant}</span>
                            <span className="text-ochre ml-auto font-bold">+{ep.bonus} bonus</span>
                        </div>
                    ))}
                </FijianCard>
            )}

            {/* Standings snapshot */}
            {report.standings && report.standings.length > 0 && (
                <FijianCard className="p-4 space-y-2">
                    <p className="text-ochre text-[11px] font-bold uppercase tracking-widest">Standings</p>
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
                </FijianCard>
            )}

            {/* Superlatives row */}
            <div className="grid grid-cols-3 gap-2">
                {report.biggestMover && (
                    <FijianCard className="p-3 text-center">
                        <p className="text-lg">📈</p>
                        <p className="text-ochre text-xs font-bold font-sans truncate">{report.biggestMover.name}</p>
                        <p className="text-sand-warm/60 text-[10px] font-sans">+{report.biggestMover.points} pts</p>
                        <p className="text-sand-warm/60 text-[11px] uppercase tracking-wider mt-0.5">Top Scorer</p>
                    </FijianCard>
                )}
                {report.worstEpisode && (
                    <FijianCard className="p-3 text-center">
                        <p className="text-lg">📉</p>
                        <p className="text-fire-400/80 text-xs font-bold font-sans truncate">{report.worstEpisode.name}</p>
                        <p className="text-sand-warm/60 text-[10px] font-sans">{report.worstEpisode.points} pts</p>
                        <p className="text-sand-warm/60 text-[11px] uppercase tracking-wider mt-0.5">Cold Week</p>
                    </FijianCard>
                )}
                {report.bestPick && (
                    <FijianCard className="p-3 text-center">
                        <p className="text-lg">⭐</p>
                        <p className="text-sky-400 text-xs font-bold font-sans truncate">{report.bestPick.name}</p>
                        <p className="text-sand-warm/60 text-[10px] font-sans">{report.bestPick.points} pts</p>
                        <p className="text-sand-warm/60 text-[11px] uppercase tracking-wider mt-0.5">MVP Pick</p>
                    </FijianCard>
                )}
            </div>

            {/* New achievements */}
            {report.newBadges.length > 0 && (
                <FijianCard className="p-4 space-y-2">
                    <p className="text-ochre text-[11px] font-bold uppercase tracking-widest">Badges Earned</p>
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

function MomentRow({ emoji, text, color = 'text-sand-warm/70' }) {
    return (
        <div className="flex items-center gap-2 text-sm font-sans">
            <span className="text-base">{emoji}</span>
            <span className={color}>{text}</span>
        </div>
    );
}
