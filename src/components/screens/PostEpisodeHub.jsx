import { useState, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { ALL_CASTAWAYS } from '../../data';
import { scoreContestants } from '../../scoring';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

function PlayerOfEpisode({ episodeNum }) {
    const {
        user, episodes, postEpisode, leagueMembers,
        submitPlayerOfEpisodeVote,
    } = useApp();

    const epData = episodes[episodeNum];
    const myVote = postEpisode[episodeNum]?.playerOfEpisode?.[user?.uid];
    const allVotes = postEpisode[episodeNum]?.playerOfEpisode || {};
    const [rankings, setRankings] = useState([null, null, null]);
    const [submitting, setSubmitting] = useState(false);

    const top3 = useMemo(() => {
        if (!epData?.gameEvents) return [];
        const scores = scoreContestants(epData.gameEvents);
        return Object.entries(scores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([cid, pts]) => ({
                ...ALL_CASTAWAYS.find(c => c.id === cid),
                pts,
            }))
            .filter(c => c.id);
    }, [epData?.gameEvents]);

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
                                    <span className="text-sand-warm/30 text-xs ml-auto">{score} pts</span>
                                </div>
                            );
                        })}
                        {winnerName && <p className="text-sand-warm/40 text-xs">Winner&apos;s pick owners get +7 pts</p>}
                    </div>
                )}
            </FijianCard>
        );
    }

    return (
        <FijianCard className="p-4 space-y-4">
            <FijianSectionHeader title="Player of the Episode" />
            <p className="text-earth text-xs font-serif italic">
                Rank the top 3 performers. Tap a medal to assign.
            </p>
            <div className="space-y-2">
                {top3.map(c => {
                    const rank = rankings.indexOf(c.id);
                    const medals = ['🥇', '🥈', '🥉'];
                    return (
                        <div key={c.id} className="flex items-center gap-2 bg-stone-800/50 px-3 py-2.5 rounded-lg">
                            <span className="text-sand-warm text-sm font-sans flex-1">{c.name}</span>
                            <span className="text-ochre/50 text-xs">{c.pts} pts</span>
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
            <p className="text-earth text-xs font-serif italic">
                Rate {eliminated?.name}&apos;s game impact. Their pick owner(s) earn the group average.
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

export default function PostEpisodeHub({ episodeNum }) {
    return (
        <div className="space-y-4">
            <FijianCard className="p-4 text-center border-ochre/20">
                <p className="font-display text-xl tracking-wider text-ochre">Post-Episode</p>
                <p className="text-sand-warm/50 text-xs font-sans mt-1">Episode {episodeNum} wrap-up</p>
            </FijianCard>

            <PlayerOfEpisode episodeNum={episodeNum} />
            <ImpactRating episodeNum={episodeNum} />
        </div>
    );
}
