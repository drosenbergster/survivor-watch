import { useState, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { computeStandings, detectAchievements } from '../../scoring';
import { ALL_CASTAWAYS, ACHIEVEMENTS, PLAYER_COLORS } from '../../data';
import { FijianCard, FijianSectionHeader, Icon } from '../fijian';

function BadgeWall({ earned }) {
    return (
        <div className="grid grid-cols-4 gap-2">
            {ACHIEVEMENTS.map(a => {
                const unlocked = earned.includes(a.id);
                return (
                    <div
                        key={a.id}
                        className={`flex flex-col items-center p-2 rounded-lg text-center transition-all ${
                            unlocked ? 'bg-ochre/10' : 'bg-stone-800/30 opacity-30'
                        }`}
                    >
                        <span className="text-2xl">{a.emoji}</span>
                        <span className={`text-[10px] font-sans mt-1 leading-tight ${
                            unlocked ? 'text-ochre' : 'text-sand-warm/60'
                        }`}>
                            {a.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function RideOrDieCard({ contestantId, isEliminated }) {
    const c = ALL_CASTAWAYS.find(x => x.id === contestantId);
    if (!c) return null;

    return (
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
            isEliminated ? 'bg-red-950/30 border border-red-900/30' : 'bg-stone-800/50'
        }`}>
            <span className="text-xl">{isEliminated ? '💀' : '🔥'}</span>
            <div className="flex-1">
                <p className={`text-sm font-sans font-bold ${isEliminated ? 'text-red-400/60 line-through' : 'text-sand-warm'}`}>
                    {c.name}
                </p>
                <p className="text-[10px] text-sand-warm/60 font-sans">{c.seasons}</p>
            </div>
            <span className={`text-xs font-sans ${isEliminated ? 'text-red-400/50' : 'text-jungle-400'}`}>
                {isEliminated ? 'Eliminated' : 'Active'}
            </span>
        </div>
    );
}

function StatBox({ label, value, sub }) {
    return (
        <div className="bg-stone-800/50 rounded-lg p-3 text-center">
            <p className="font-display text-xl text-ochre">{value}</p>
            <p className="text-[10px] text-sand-warm/60 font-sans">{label}</p>
            {sub && <p className="text-[11px] text-sand-warm/60 font-sans">{sub}</p>}
        </div>
    );
}

function PredictionAccuracy({ episodes, uid }) {
    const epNums = Object.keys(episodes || {})
        .map(Number)
        .filter(n => episodes[n]?.scored)
        .sort((a, b) => a - b);

    let correct = 0;
    let total = 0;

    for (const epNum of epNums) {
        const ep = episodes[epNum];
        const pred = ep.predictions?.[uid]?.elimination;
        if (pred) {
            total++;
            if ((ep.eliminatedThisEp || []).includes(pred)) correct++;
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
        user, episodes, rideOrDies, leagueMembers, eliminated, bingo,
        postEpisode,
    } = useApp();

    const targetUid = profileUid || user?.uid;
    const member = leagueMembers?.[targetUid];
    const rods = rideOrDies?.[targetUid] || [];
    const memberUids = useMemo(() => Object.keys(leagueMembers || {}), [leagueMembers]);

    const { standings, perEpisode } = useMemo(
        () => computeStandings(episodes, rideOrDies, memberUids, bingo, postEpisode),
        [episodes, rideOrDies, memberUids, bingo, postEpisode]
    );

    const achievements = useMemo(
        () => detectAchievements(episodes, rideOrDies, memberUids, bingo, postEpisode, perEpisode),
        [episodes, rideOrDies, memberUids, bingo, postEpisode, perEpisode]
    );

    const myStanding = standings?.find(s => s.uid === targetUid);
    const myRank = standings?.findIndex(s => s.uid === targetUid) + 1;
    const myAchievements = achievements?.[targetUid] || [];
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
                    <span className="text-sand-warm/60">·</span>
                    <span className="text-sand-warm/60">
                        {myAchievements.length} badges
                    </span>
                </div>
            </FijianCard>

            {/* Score breakdown */}
            <div className="grid grid-cols-5 gap-2">
                <StatBox label="Weekly" value={myStanding?.weekly || 0} />
                <StatBox label="Predict" value={myStanding?.predictions || 0} />
                <StatBox label="RoD" value={myStanding?.rideOrDie || 0} />
                <StatBox label="Bingo" value={myStanding?.bingo || 0} />
                <StatBox label="Social" value={myStanding?.social || 0} />
            </div>

            {/* Ride or Dies */}
            <FijianCard className="p-4 space-y-2">
                <FijianSectionHeader title="Ride or Dies" />
                {rods.length === 0 ? (
                    <p className="text-sand-warm/60 text-sm font-sans italic">No ride or dies drafted</p>
                ) : (
                    rods.map(cid => (
                        <RideOrDieCard
                            key={cid}
                            contestantId={cid}
                            isEliminated={(eliminated || []).includes(cid)}
                        />
                    ))
                )}
            </FijianCard>

            {/* Prediction accuracy */}
            <FijianCard className="p-4 space-y-3">
                <FijianSectionHeader title="Prediction Accuracy" />
                <div>
                    <p className="text-sand-warm/50 text-xs font-sans mb-1">Elimination Predictions</p>
                    <PredictionAccuracy episodes={episodes} uid={targetUid} />
                </div>
            </FijianCard>

            {/* Badge Wall */}
            <FijianCard className="p-4 space-y-3">
                <FijianSectionHeader title="Badges" />
                <BadgeWall earned={myAchievements} />
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
