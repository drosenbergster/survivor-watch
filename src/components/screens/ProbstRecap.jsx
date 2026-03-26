import { useState, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { ALL_CASTAWAYS } from '../../data';
import { computeStandings, generateProbstRecap, scoreContestants } from '../../scoring';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

function PlayerOfEpisode({ episodeNum, inline }) {
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

    if (top3.length === 0) return null;

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

    const Wrap = inline
        ? ({ children }) => <div className="px-4 py-3 border-t border-ochre/10 space-y-3">{children}</div>
        : ({ children }) => <FijianCard className="p-4 space-y-3">{children}</FijianCard>;

    if (myVote) {
        const winner = results[0];
        const winnerName = winner ? ALL_CASTAWAYS.find(c => c.id === winner[0])?.name : null;
        return (
            <Wrap>
                <div className="flex items-center gap-2">
                    <Icon name="emoji_events" className="text-ochre text-sm" />
                    <p className="text-ochre text-[11px] font-bold uppercase tracking-widest">Player of the Episode</p>
                    <span className="text-sand-warm/40 text-xs ml-auto">{totalVoters}/{totalMembers} voted</span>
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
                        {winnerName && <p className="text-sand-warm/40 text-xs">Winner&apos;s pick owners get +7 pts</p>}
                    </div>
                )}
            </Wrap>
        );
    }

    return (
        <Wrap>
            <div className="flex items-center gap-2">
                <Icon name="emoji_events" className="text-ochre text-sm" />
                <p className="text-ochre text-[11px] font-bold uppercase tracking-widest">Player of the Episode</p>
            </div>
            <p className="text-clay text-xs font-serif italic">
                Rank the top 3 performers. Winner earns +7 pts for their pick owners.
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
        </Wrap>
    );
}

function ImpactRating({ episodeNum, inline }) {
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

    const Wrap = inline
        ? ({ children }) => <div className="px-4 py-3 border-t border-ochre/10 space-y-2">{children}</div>
        : ({ children }) => <FijianCard className="p-4 space-y-2">{children}</FijianCard>;

    if (myRating) {
        return (
            <Wrap>
                <div className="flex items-center gap-2">
                    <Icon name="star_half" className="text-fire-400 text-sm" />
                    <p className="text-ochre text-[11px] font-bold uppercase tracking-widest">Impact Rating</p>
                </div>
                <div className="flex items-center gap-2">
                    <Icon name="check_circle" className="text-jungle-400 text-sm" />
                    <span className="text-sand-warm text-sm font-sans">
                        You rated {eliminated?.name}&apos;s impact: {myRating}/5
                    </span>
                </div>
                {avg && (
                    <p className="text-sand-warm/40 text-xs font-sans">
                        Group average: {avg}/5 ({ratingValues.length}/{totalMembers} rated) — goes to their pick owner(s)
                    </p>
                )}
            </Wrap>
        );
    }

    return (
        <Wrap>
            <div className="flex items-center gap-2">
                <Icon name="star_half" className="text-fire-400 text-sm" />
                <p className="text-ochre text-[11px] font-bold uppercase tracking-widest">Impact Rating</p>
            </div>
            <p className="text-clay text-xs font-serif italic">
                How much did {eliminated?.name} impact the game? Average goes to their pick owner(s).
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
        </Wrap>
    );
}

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

                {/* Player of the Episode — before the elimination */}
                <PlayerOfEpisode episodeNum={episodeNum} inline />

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

                {/* Impact Rating — right after elimination */}
                <ImpactRating episodeNum={episodeNum} inline />

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
