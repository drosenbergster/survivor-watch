import { useState, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { ALL_CASTAWAYS } from '../../data';
import { computeStandings, generateProbstRecap, detectAchievements, scoreContestants, computeScarcity } from '../../scoring';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

function PlayerOfEpisode({ episodeNum }) {
    const {
        user, episodes, postEpisode, leagueMembers,
        submitPlayerOfEpisodeVote,
    } = useApp();

    const epData = episodes[episodeNum];
    const myVote = postEpisode[episodeNum]?.playerOfEpisode?.[user?.uid];
    const allVotes = useMemo(() => postEpisode[episodeNum]?.playerOfEpisode || {}, [postEpisode, episodeNum]);
    const [rankings, setRankings] = useState([null, null, null]);
    const [submitting, setSubmitting] = useState(false);

    const gameEvents = epData?.gameEvents;
    const top3 = useMemo(() => {
        if (!gameEvents) return [];
        const scores = scoreContestants(gameEvents);
        return Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([cid, pts]) => ({
                ...ALL_CASTAWAYS.find(c => c.id === cid),
                pts,
            }))
            .filter(c => c.id);
    }, [gameEvents]);

    const results = useMemo(() => {
        const tally = {};
        for (const [, ranks] of Object.entries(allVotes)) {
            if (!Array.isArray(ranks)) continue;
            ranks.forEach((cid, i) => {
                if (!cid) return;
                tally[cid] = (tally[cid] || 0) + (3 - i);
            });
        }
        return Object.entries(tally).sort(([, a], [, b]) => b - a);
    }, [allVotes]);

    const totalVoters = Object.keys(allVotes).length;
    const totalMembers = Object.keys(leagueMembers || {}).length;

    if (top3.length === 0) {
        return (
            <FijianCard className="p-4">
                <FijianSectionHeader title="Player of the Episode" />
                <p className="text-sand-warm/50 text-sm font-sans italic">No game events scored yet.</p>
            </FijianCard>
        );
    }

    const handleRank = (cid, rank) => {
        setRankings(prev => {
            const next = [...prev];
            const existingIdx = next.indexOf(cid);
            if (existingIdx !== -1) next[existingIdx] = null;
            next[rank] = cid;
            return next;
        });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        await submitPlayerOfEpisodeVote(episodeNum, rankings);
        setSubmitting(false);
    };

    if (myVote) {
        const winner = results[0];
        const winnerName = winner ? ALL_CASTAWAYS.find(c => c.id === winner[0])?.name : null;
        return (
            <FijianCard className="p-4 space-y-3">
                <FijianSectionHeader title="Player of the Episode" />
                <div className="flex items-center gap-2">
                    <Icon name="check_circle" className="text-jungle-400" />
                    <span className="text-sand-warm text-sm font-sans">Vote submitted</span>
                    <span className="text-sand-warm/60 text-xs ml-auto">{totalVoters}/{totalMembers} voted</span>
                </div>
                {results.length > 0 && (
                    <div className="space-y-1">
                        {results.map(([cid, score], i) => {
                            const c = ALL_CASTAWAYS.find(x => x.id === cid);
                            return (
                                <div key={cid} className="flex items-center gap-2 text-sm font-sans">
                                    <span className={i === 0 ? 'text-ochre font-bold' : 'text-sand-warm/60'}>
                                        {i === 0 ? '👑' : `#${i + 1}`}
                                    </span>
                                    <span className={i === 0 ? 'text-ochre' : 'text-sand-warm/60'}>{c?.name}</span>
                                    <span className="text-sand-warm/60 text-xs ml-auto">{score} pts</span>
                                </div>
                            );
                        })}
                        {winnerName && <p className="text-sand-warm/60 text-xs">Winner&apos;s pick owners get +7 pts</p>}
                    </div>
                )}
            </FijianCard>
        );
    }

    return (
        <FijianCard className="p-4 space-y-4">
            <FijianSectionHeader title="Player of the Episode" />
            <p className="text-clay text-xs font-serif italic">
                Rank the top 3 performers this episode. Whoever wins the vote earns +7 pts
                for the player(s) who had them as a weekly pick. Tap the medals to assign 1st, 2nd, 3rd.
            </p>
            <div className="space-y-2">
                {top3.map(c => {
                    const rank = rankings.indexOf(c.id);
                    const medals = ['🥇', '🥈', '🥉'];
                    return (
                        <div key={c.id} className="flex items-center gap-2 bg-stone-800/50 px-3 py-2.5 rounded-lg">
                            <span className="text-sand-warm text-sm font-sans flex-1">{c.name}</span>
                            <span className="text-ochre/70 text-xs">{c.pts} pts</span>
                            <div className="flex gap-1">
                                {[0, 1, 2].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => handleRank(c.id, r)}
                                        className={`w-8 h-8 rounded-full text-lg flex items-center justify-center transition-all ${
                                            rank === r
                                                ? 'bg-ochre/20 scale-110'
                                                : 'bg-stone-700/50 hover:bg-stone-600/50 opacity-40'
                                        }`}
                                    >
                                        {medals[r]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            {rankings[0] && rankings[1] && rankings[2] && (
                <FijianPrimaryButton onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Lock In Rankings'}
                </FijianPrimaryButton>
            )}
        </FijianCard>
    );
}

function ImpactRating({ episodeNum }) {
    const { user, episodes, postEpisode, submitImpactRating, leagueMembers } = useApp();

    const epData = episodes[episodeNum];
    const eliminatedThisEp = epData?.eliminatedThisEp || [];
    const myRating = postEpisode[episodeNum]?.impactRating?.[user?.uid];
    const allRatings = postEpisode[episodeNum]?.impactRating || {};
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    if (eliminatedThisEp.length === 0) return null;

    const eliminated = ALL_CASTAWAYS.find(c => c.id === eliminatedThisEp[0]);
    const ratingValues = Object.values(allRatings).filter(v => typeof v === 'number');
    const avg = ratingValues.length > 0 ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1) : null;
    const totalMembers = Object.keys(leagueMembers || {}).length;

    const handleSubmit = async () => {
        setSubmitting(true);
        await submitImpactRating(episodeNum, rating);
        setSubmitting(false);
    };

    if (myRating) {
        return (
            <FijianCard className="p-4 space-y-2">
                <FijianSectionHeader title="Impact Rating" />
                <div className="flex items-center gap-2">
                    <Icon name="check_circle" className="text-jungle-400" />
                    <span className="text-sand-warm text-sm font-sans">
                        You rated {eliminated?.name}&apos;s impact: {myRating}/5
                    </span>
                </div>
                {avg && (
                    <p className="text-sand-warm/50 text-xs font-sans">
                        Group average: {avg}/5 ({ratingValues.length}/{totalMembers} rated) — goes to their pick owner(s)
                    </p>
                )}
            </FijianCard>
        );
    }

    return (
        <FijianCard className="p-4 space-y-3">
            <FijianSectionHeader title="Impact Rating" />
            <p className="text-clay text-xs font-serif italic">
                How much did {eliminated?.name} impact the game? The average rating becomes bonus points
                for whoever had them as a weekly pick this episode.
            </p>
            <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(v => (
                    <button
                        key={v}
                        onClick={() => setRating(v)}
                        className={`w-12 h-12 rounded-xl text-lg font-bold font-display transition-all ${
                            rating === v
                                ? 'bg-fire-400 text-white shadow-fire scale-110'
                                : rating > 0 && v <= rating
                                    ? 'bg-fire-400/40 text-fire-400'
                                    : 'bg-stone-800 text-sand-warm/50 hover:bg-stone-700'
                        }`}
                    >
                        {v}
                    </button>
                ))}
            </div>
            {rating > 0 && (
                <FijianPrimaryButton onClick={handleSubmit} disabled={submitting}>
                    {submitting ? 'Submitting...' : `Rate ${rating}/5`}
                </FijianPrimaryButton>
            )}
        </FijianCard>
    );
}

function WeeklyPicksScoreboard({ episodeNum, inline }) {
    const { episodes, leagueMembers, rideOrDies } = useApp();
    const ep = episodes[episodeNum];
    const epPicks = ep?.picks;
    const epGameEvents = ep?.gameEvents;

    const picksData = useMemo(() => {
        if (!epPicks || !epGameEvents) return [];
        const contestantScores = scoreContestants(epGameEvents);
        const scarcity = computeScarcity(epPicks);

        return Object.entries(epPicks).map(([uid, playerPicks]) => {
            const picks = (playerPicks || []).map(cid => {
                const castaway = ALL_CASTAWAYS.find(c => c.id === cid);
                const raw = contestantScores[cid] || 0;
                const isSolePicker = scarcity[cid]?.exclusiveOwner === uid;
                const isOthersRoD = Object.entries(rideOrDies || {}).some(
                    ([rodUid, rods]) => rodUid !== uid && (rods || []).includes(cid)
                );
                const isExclusive = isSolePicker && !isOthersRoD;
                const points = isExclusive ? Math.round(raw * 1.5) : raw;
                return { cid, name: castaway?.name || cid, points, isExclusive };
            });
            const total = picks.reduce((sum, p) => sum + p.points, 0);
            const name = leagueMembers[uid]?.displayName || uid;
            return { uid, name, picks, total };
        }).sort((a, b) => b.total - a.total);
    }, [epPicks, epGameEvents, leagueMembers, rideOrDies]);

    if (picksData.length === 0) return null;

    const content = (
        <div className="space-y-2.5">
            {picksData.map(player => (
                <div key={player.uid}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sand-warm text-xs sm:text-sm font-sans font-bold">{player.name}</span>
                        <span className="text-ochre font-bold text-xs sm:text-sm font-sans">{player.total} pts</span>
                    </div>
                    <div className="space-y-0.5">
                        {player.picks.map(pick => (
                            <div
                                key={pick.cid}
                                className={`flex items-center justify-between text-xs font-sans px-2 py-1 rounded ${
                                    pick.isExclusive
                                        ? 'bg-ochre/10 text-ochre'
                                        : 'bg-stone-800/30 text-sand-warm/70'
                                }`}
                            >
                                <span>{pick.name}</span>
                                <span className="font-bold">
                                    {pick.points}
                                    {pick.isExclusive && <span className="ml-0.5 text-ochre/80">×1.5</span>}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    if (inline) return content;

    return (
        <FijianCard className="p-4 space-y-3">
            <div className="flex items-center gap-2">
                <Icon name="groups" className="text-ochre text-sm" />
                <p className="text-ochre text-[11px] font-bold uppercase tracking-widest">Weekly Picks</p>
            </div>
            {content}
        </FijianCard>
    );
}

export default function ProbstRecap({ episodeNum }) {
    const {
        episodes, rideOrDies, leagueMembers, bingo,
        postEpisode, league,
    } = useApp();

    const [picksOpen, setPicksOpen] = useState(false);
    const memberUids = useMemo(() => Object.keys(leagueMembers || {}), [leagueMembers]);

    const { standings, perEpisode } = useMemo(
        () => computeStandings(episodes, rideOrDies, memberUids, bingo, postEpisode, league?.preSeasonEliminated),
        [episodes, rideOrDies, memberUids, bingo, postEpisode, league?.preSeasonEliminated]
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

    const hasSuperlatives = report.biggestMover || report.worstEpisode || report.bestPick;

    return (
        <div className="space-y-3">
            {/* Unified recap card — Previously On through Standings */}
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

                {/* Superlatives — inline within the recap flow */}
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

                {/* Standings + collapsible Weekly Picks */}
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

                        {/* Weekly Picks dropdown */}
                        <button
                            onClick={() => setPicksOpen(p => !p)}
                            className="flex items-center gap-1.5 mt-3 pt-2 border-t border-stone-700/40 w-full text-left"
                        >
                            <Icon name="groups" className="text-ochre/70 text-sm" />
                            <span className="text-ochre/70 text-[11px] font-bold uppercase tracking-widest flex-1">
                                Weekly Picks Breakdown
                            </span>
                            <Icon
                                name="expand_more"
                                className={`text-ochre/50 text-sm transition-transform ${picksOpen ? 'rotate-180' : ''}`}
                            />
                        </button>
                        {picksOpen && (
                            <div className="mt-2">
                                <WeeklyPicksScoreboard episodeNum={episodeNum} inline />
                            </div>
                        )}
                    </div>
                )}

                {/* Badges — compact with descriptions so users know what they mean */}
                {report.newBadges.length > 0 && (
                    <div className="px-4 py-3 border-t border-ochre/10 space-y-1">
                        {report.newBadges.map((b, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs font-sans">
                                <span className="text-sm shrink-0">{b.emoji}</span>
                                <span>
                                    <span className="text-sand-warm/80">{b.name}</span>
                                    {' '}
                                    <span className="text-ochre/60">{b.badge}</span>
                                    {b.description && (
                                        <span className="text-sand-warm/40"> &mdash; {b.description}</span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </FijianCard>

            {/* Interactive post-episode votes live outside the recap card */}
            <PlayerOfEpisode episodeNum={episodeNum} />
            <ImpactRating episodeNum={episodeNum} />
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
