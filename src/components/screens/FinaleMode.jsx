import { useState, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { computeStandings, detectAchievements } from '../../scoring';
import { ALL_CASTAWAYS, ACHIEVEMENTS, ACHIEVEMENT_MAP } from '../../data';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

const REUNION_CATEGORIES = [
    { key: 'mvp', label: 'MVP', description: 'Who played the best overall game?', emoji: '🏆' },
    { key: 'entertainer', label: 'Most Entertaining', description: 'Who was the most fun to play with?', emoji: '🎭' },
    { key: 'bestTake', label: 'Best Hot Take', description: 'Who had the boldest correct prediction?', emoji: '🔥' },
];

const PASSPORT_QUESTIONS = {
    winner: { label: 'Sole Survivor', icon: '👑' },
    firstBoot: { label: 'First Boot', icon: '🚪' },
    fanFavorite: { label: 'Fan Favorite', icon: '❤️' },
    biggestVillain: { label: 'Biggest Villain', icon: '😈' },
    fireMakingWinner: { label: 'Fire-Making', icon: '🔥' },
};

const MERGE_QUESTIONS = {
    winner: { label: 'Sole Survivor', icon: '👑' },
    firstJury: { label: 'First Juror', icon: '⚖️' },
    fanFavorite: { label: 'Fan Favorite', icon: '❤️' },
    biggestVillain: { label: 'Biggest Villain', icon: '😈' },
    fireMakingWinner: { label: 'Fire-Making', icon: '🔥' },
};

function contestantName(cid) {
    return ALL_CASTAWAYS.find(c => c.id === cid)?.name || cid;
}

const COLOR_MAP = {
    'ochre': { text: '#c8a55a', bg20: 'rgba(200,165,90,0.2)', bg30: 'rgba(200,165,90,0.3)', border: 'rgba(200,165,90,0.2)' },
    'purple-400': { text: '#c084fc', bg20: 'rgba(192,132,252,0.2)', bg30: 'rgba(192,132,252,0.3)', border: 'rgba(192,132,252,0.2)' },
};

function PassportRevealCard({ uid, memberName, passport, questions, title, color }) {
    const [revealed, setRevealed] = useState(false);
    const c = COLOR_MAP[color] || COLOR_MAP['ochre'];

    if (!passport) {
        return (
            <FijianCard className="p-3 opacity-40">
                <p className="text-sand-warm/50 text-sm font-sans">{memberName} — no passport</p>
            </FijianCard>
        );
    }

    return (
        <FijianCard className="p-4 space-y-2" style={{ borderColor: c.border }}>
            <div className="flex items-center justify-between">
                <p className="text-sand-warm text-sm font-sans font-bold">{memberName}</p>
                {!revealed ? (
                    <button
                        onClick={() => setRevealed(true)}
                        className="px-3 py-1 rounded-lg text-xs font-sans transition-all"
                        style={{ backgroundColor: c.bg20, color: c.text }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = c.bg30}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = c.bg20}
                    >
                        Reveal
                    </button>
                ) : (
                    <span className="text-xs" style={{ color: c.text }}>Revealed</span>
                )}
            </div>
            {revealed && (
                <div className="space-y-1.5 pt-1">
                    {Object.entries(questions).map(([key, q]) => (
                        <div key={key} className="flex items-center gap-2 text-sm font-sans">
                            <span>{q.icon}</span>
                            <span className="text-sand-warm/50 flex-1">{q.label}</span>
                            <span className="text-ochre font-bold">
                                {passport[key] ? contestantName(passport[key]) : '—'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </FijianCard>
    );
}

function ReunionAwards() {
    const { user, leagueMembers, finaleData, submitReunionVote } = useApp();
    const memberEntries = Object.entries(leagueMembers || {});
    const awards = finaleData?.reunionAwards || {};

    return (
        <FijianCard className="p-4 space-y-4">
            <FijianSectionHeader title="Reunion Awards" />
            {REUNION_CATEGORIES.map(cat => {
                const votes = awards[cat.key] || {};
                const myVote = votes[user?.uid];

                const tally = {};
                for (const [, nomineeUid] of Object.entries(votes)) {
                    tally[nomineeUid] = (tally[nomineeUid] || 0) + 1;
                }
                const sorted = Object.entries(tally).sort(([, a], [, b]) => b - a);
                const winner = sorted[0];

                return (
                    <div key={cat.key} className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{cat.emoji}</span>
                            <div className="flex-1">
                                <p className="text-sand-warm text-sm font-sans font-bold">{cat.label}</p>
                                <p className="text-sand-warm/60 text-xs font-sans">{cat.description}</p>
                            </div>
                        </div>
                        {myVote ? (
                            <div className="ml-8 space-y-1">
                                <p className="text-sand-warm/50 text-xs font-sans">
                                    You voted: <span className="text-ochre">{leagueMembers?.[myVote]?.displayName}</span>
                                </p>
                                {sorted.length > 0 && (
                                    <div className="space-y-0.5">
                                        {sorted.map(([uid, count], i) => (
                                            <div key={uid} className="flex items-center gap-2 text-xs font-sans">
                                                <span className={i === 0 ? 'text-ochre font-bold' : 'text-sand-warm/60'}>
                                                    {leagueMembers?.[uid]?.displayName}
                                                </span>
                                                <span className="text-sand-warm/60 ml-auto">{count} vote{count > 1 ? 's' : ''}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="ml-8 flex flex-wrap gap-2">
                                {memberEntries.map(([uid, member]) => (
                                    <button
                                        key={uid}
                                        onClick={() => submitReunionVote(cat.key, uid)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-sans bg-stone-800/50 text-sand-warm/60 hover:bg-ochre/20 hover:text-ochre transition-all"
                                    >
                                        {member.displayName}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </FijianCard>
    );
}

function LegacyCard({ uid, memberName, standing, rank, achievements: earned, episodes }) {
    const badge = earned?.[uid] || [];

    const scoredEps = Object.keys(episodes || {}).filter(n => episodes[n]?.scored).length;
    const avgPerEp = scoredEps > 0 ? Math.round((standing?.total || 0) / scoredEps) : 0;

    return (
        <FijianCard className="p-4 space-y-3 border-ochre/20">
            <div className="text-center">
                <p className="text-ochre text-[11px] font-bold uppercase tracking-[0.3em]">Legacy Card</p>
                <p className="font-display text-2xl tracking-wider text-sand-warm">{memberName}</p>
                <p className="text-ochre font-display text-lg">
                    #{rank} · {standing?.total || 0} pts
                </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-stone-800/50 rounded-lg p-2">
                    <p className="font-display text-lg text-fire-400">{avgPerEp}</p>
                    <p className="text-[11px] text-sand-warm/60">Avg/Ep</p>
                </div>
                <div className="bg-stone-800/50 rounded-lg p-2">
                    <p className="font-display text-lg text-purple-400">{badge.length}</p>
                    <p className="text-[11px] text-sand-warm/60">Badges</p>
                </div>
            </div>

            {badge.length > 0 && (
                <div className="flex flex-wrap gap-1 justify-center">
                    {badge.map(id => {
                        const a = ACHIEVEMENT_MAP[id];
                        return a ? (
                            <span key={id} className="text-lg" title={a.name}>{a.emoji}</span>
                        ) : null;
                    })}
                </div>
            )}
        </FijianCard>
    );
}

function ChampionCrowning() {
    const { user, league, leagueMembers, finaleData, crownChampion } = useApp();
    const isHost = league?.createdBy === user?.uid;
    const champion = finaleData?.champion;
    const [crowning, setCrowning] = useState(false);

    if (champion) {
        const name = leagueMembers?.[champion]?.displayName || champion;
        return (
            <FijianCard className="p-6 text-center bg-gradient-to-b from-ochre/10 to-transparent border-ochre/40">
                <span className="text-5xl">👑</span>
                <p className="font-display text-3xl tracking-wider text-ochre mt-2">{name}</p>
                <p className="text-sand-warm/60 text-sm font-sans mt-1">Season 50 Champion</p>
            </FijianCard>
        );
    }

    if (!isHost) {
        return (
            <FijianCard className="p-5 text-center">
                <span className="text-3xl">👑</span>
                <p className="text-sand-warm/50 text-sm font-sans mt-2">
                    Waiting for the host to crown the champion...
                </p>
            </FijianCard>
        );
    }

    const memberEntries = Object.entries(leagueMembers || {});
    return (
        <FijianCard className="p-4 space-y-3">
            <FijianSectionHeader title="Crown the Champion" />
            <p className="text-clay text-xs font-serif italic">
                The group decides. Who played the best game this season?
            </p>
            <div className="space-y-2">
                {memberEntries.map(([uid, member]) => (
                    <button
                        key={uid}
                        onClick={async () => {
                            setCrowning(true);
                            await crownChampion(uid);
                            setCrowning(false);
                        }}
                        disabled={crowning}
                        className="w-full px-4 py-3 rounded-lg text-sm font-sans font-bold bg-ochre/10 text-ochre hover:bg-ochre/20 transition-all text-left"
                    >
                        👑 Crown {member.displayName}
                    </button>
                ))}
            </div>
        </FijianCard>
    );
}

export default function FinaleMode() {
    const {
        user, league, leagueMembers, passports, mergePassports,
        episodes, rideOrDies, bingo, postEpisode,
        finaleData, startFinale,
    } = useApp();

    const isHost = league?.createdBy === user?.uid;
    const memberUids = useMemo(() => Object.keys(leagueMembers || {}), [leagueMembers]);

    const { standings, perEpisode } = useMemo(
        () => computeStandings(episodes, rideOrDies, memberUids, bingo, postEpisode),
        [episodes, rideOrDies, memberUids, bingo, postEpisode]
    );

    const achievements = useMemo(
        () => detectAchievements(episodes, rideOrDies, memberUids, bingo, postEpisode, perEpisode),
        [episodes, rideOrDies, memberUids, bingo, postEpisode, perEpisode]
    );

    const [starting, setStarting] = useState(false);

    if (!finaleData) {
        if (!isHost) {
            return (
                <FijianCard className="p-5 text-center">
                    <span className="text-4xl">🏝️</span>
                    <p className="text-sand-warm/50 text-sm font-sans mt-2">
                        The finale hasn&apos;t started yet. The host will kick it off when it&apos;s time.
                    </p>
                </FijianCard>
            );
        }
        return (
            <FijianCard className="p-5 space-y-3 text-center">
                <span className="text-4xl">🏝️</span>
                <p className="font-display text-xl tracking-wider text-ochre">Start the Finale</p>
                <p className="text-clay text-xs font-serif italic">
                    This begins the passport reveal ceremony, reunion awards, and champion crowning.
                </p>
                <FijianPrimaryButton
                    onClick={async () => {
                        setStarting(true);
                        await startFinale();
                        setStarting(false);
                    }}
                    disabled={starting}
                >
                    {starting ? 'Starting...' : 'Begin the Finale'}
                </FijianPrimaryButton>
            </FijianCard>
        );
    }

    return (
        <div className="space-y-4">
            <FijianCard className="p-5 text-center bg-gradient-to-b from-stone-800/90 to-stone-900/80 border-ochre/30">
                <p className="font-display text-3xl tracking-wider text-ochre">Finale</p>
                <p className="text-sand-warm/50 text-xs font-sans mt-1">Season 50 — The Final Chapter</p>
            </FijianCard>

            {/* Season Passport Reveals */}
            <FijianCard className="p-4 space-y-3">
                <FijianSectionHeader title="Season Passport Reveals" />
                <p className="text-clay text-xs font-serif italic">
                    Sealed before the premiere. How did everyone&apos;s gut picks hold up?
                </p>
                {memberUids.map(uid => (
                    <PassportRevealCard
                        key={uid}
                        uid={uid}
                        memberName={leagueMembers?.[uid]?.displayName || uid}
                        passport={passports?.[uid]}
                        questions={PASSPORT_QUESTIONS}
                        title="Season Passport"
                        color="jungle-400"
                    />
                ))}
            </FijianCard>

            {/* Merge Passport Reveals */}
            {Object.keys(mergePassports || {}).length > 0 && (
                <FijianCard className="p-4 space-y-3">
                    <FijianSectionHeader title="Merge Passport Reveals" />
                    <p className="text-clay text-xs font-serif italic">
                        Updated at the merge with more info. Half the stakes, double the accountability.
                    </p>
                    {memberUids.map(uid => (
                        <PassportRevealCard
                            key={uid}
                            uid={uid}
                            memberName={leagueMembers?.[uid]?.displayName || uid}
                            passport={mergePassports?.[uid]}
                            questions={MERGE_QUESTIONS}
                            title="Merge Passport"
                            color="purple-400"
                        />
                    ))}
                </FijianCard>
            )}

            {/* Reunion Awards */}
            <ReunionAwards />

            {/* Legacy Cards */}
            <FijianCard className="p-4 space-y-3">
                <FijianSectionHeader title="Legacy Cards" />
                {standings?.map((s, i) => (
                    <LegacyCard
                        key={s.uid}
                        uid={s.uid}
                        memberName={leagueMembers?.[s.uid]?.displayName || s.uid}
                        standing={s}
                        rank={i + 1}
                        achievements={achievements}
                        episodes={episodes}
                    />
                ))}
            </FijianCard>

            {/* Champion Crowning */}
            <ChampionCrowning />
        </div>
    );
}
