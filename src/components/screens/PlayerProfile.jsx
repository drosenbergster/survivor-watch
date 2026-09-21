import { useMemo } from 'react';
import { useApp } from '../../AppContext';
import { computeStandings } from '../../scoring';
import { PLAYER_COLORS } from '../../data';
import { FijianCard, FijianSectionHeader, Icon } from '../fijian';

function StatBox({ label, value, sub }) {
    return (
        <div className="bg-stone-800/50 rounded-lg p-3 text-center">
            <p className="font-display text-xl text-ochre">{value}</p>
            <p className="text-[10px] text-sand-warm/60 font-sans">{label}</p>
            {sub && <p className="text-[11px] text-sand-warm/60 font-sans">{sub}</p>}
        </div>
    );
}

function SnapVoteAccuracy({ episodes, uid }) {
    const epNums = Object.keys(episodes || {})
        .map(Number)
        .filter(n => episodes[n]?.scored)
        .sort((a, b) => a - b);

    let correct = 0;
    let total = 0;

    for (const epNum of epNums) {
        const ep = episodes[epNum];
        const vote = ep.snapVotes?.[uid]?.contestantId;
        if (vote) {
            total++;
            if ((ep.eliminatedThisEp || []).includes(vote)) correct++;
        }
    }

    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 bg-stone-800/50 rounded-full h-2 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-ochre to-fire-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-ochre text-sm font-bold font-sans w-12 text-right">{pct}%</span>
            <span className="text-sand-warm/60 text-xs font-sans">({correct}/{total})</span>
        </div>
    );
}

export default function PlayerProfile({ uid: profileUid, onClose }) {
    const {
        user, episodes, rideOrDies, leagueMembers, bingo,
        postEpisode, league, auction,
    } = useApp();

    const targetUid = profileUid || user?.uid;
    const member = leagueMembers?.[targetUid];
    const memberUids = useMemo(() => Object.keys(leagueMembers || {}), [leagueMembers]);

    const { standings, perEpisode } = useMemo(
        () => computeStandings(episodes, rideOrDies, memberUids, bingo, postEpisode, league?.preSeasonEliminated, auction),
        [episodes, rideOrDies, memberUids, bingo, postEpisode, league?.preSeasonEliminated, auction]
    );

    const myStanding = standings?.find(s => s.uid === targetUid);
    const myRank = standings?.findIndex(s => s.uid === targetUid) + 1;
    const colorIndex = memberUids.indexOf(targetUid);
    const color = PLAYER_COLORS[colorIndex] || PLAYER_COLORS[0];

    const scoredEpCount = Object.keys(episodes || {}).filter(n => episodes[n]?.scored).length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <FijianCard className="p-5 text-center space-y-2">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-sand-warm/60 hover:text-sand-warm"
                    >
                        <Icon name="close" />
                    </button>
                )}
                <div className={`w-14 h-14 rounded-full ${color.bg} mx-auto flex items-center justify-center`}>
                    <span className="font-display text-2xl text-stone-900">
                        {(member?.displayName || '?')[0].toUpperCase()}
                    </span>
                </div>
                <p className="font-display text-2xl tracking-wider text-sand-warm">
                    {member?.displayName || targetUid}
                </p>
                <div className="flex items-center justify-center gap-3 text-sm font-sans">
                    <span className="text-ochre font-bold">
                        {myRank ? `#${myRank}` : '—'}
                    </span>
                    <span className="text-sand-warm/60">·</span>
                    <span className="text-sand-warm/60">
                        {myStanding?.total || 0} pts
                    </span>
                </div>
            </FijianCard>

            {/* Score breakdown */}
            <div className="grid grid-cols-3 gap-2">
                <StatBox label="Bingo" value={myStanding?.bingo || 0} />
                <StatBox label="Predict" value={myStanding?.predictions || 0} />
                <StatBox label="Picks" value={myStanding?.weekly || 0} />
            </div>

            {/* Prediction accuracy */}
            <FijianCard className="p-4 space-y-3">
                <FijianSectionHeader title="Snap Vote Accuracy" />
                <div>
                    <p className="text-sand-warm/50 text-xs font-sans mb-1">Tribal Council Votes</p>
                    <SnapVoteAccuracy episodes={episodes} uid={targetUid} />
                </div>
            </FijianCard>

            {/* Season stats */}
            <FijianCard className="p-4">
                <FijianSectionHeader title="Season Stats" />
                <div className="grid grid-cols-3 gap-2 mt-2">
                    <StatBox label="Episodes" value={scoredEpCount} />
                    <StatBox label="Avg/Ep" value={scoredEpCount > 0 ? Math.round((myStanding?.total || 0) / scoredEpCount) : 0} />
                    <StatBox label="Best Ep" value={
                        Math.max(0, ...Object.values(perEpisode || {}).map(ep => ep[targetUid]?.total || 0))
                    } />
                </div>
            </FijianCard>
        </div>
    );
}
