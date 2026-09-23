import { useState, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { computeStandings, scorePassports } from '../../scoring';
import { ALL_CASTAWAYS, PASSPORT_QUESTIONS, PASSPORT_POINTS_PER_CORRECT } from '../../data';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

const REUNION_CATEGORIES = [
    { key: 'mvp', label: 'MVP', description: 'Who played the best overall game?', emoji: '🏆' },
    { key: 'entertainer', label: 'Most Entertaining', description: 'Who was the most fun to play with?', emoji: '🎭' },
    { key: 'bestTake', label: 'Best Hot Take', description: 'Who had the boldest correct prediction?', emoji: '🔥' },
];

function contestantName(cid) {
    return ALL_CASTAWAYS.find(c => c.id === cid)?.name || cid;
}

function PassportRevealCard({ memberName, passport, truth }) {
    const [revealed, setRevealed] = useState(false);

    if (!passport?.sealedAt) {
        return (
            <FijianCard className="p-3 opacity-40">
                <p className="text-sand-warm/50 text-sm font-sans">{memberName} — didn&apos;t seal a passport</p>
            </FijianCard>
        );
    }

    // Compute the correct-count once we have truth
    const scored = truth ? scorePassports({ x: passport }, truth).x : null;
    const points = scored?.points || 0;

    return (
        <FijianCard className="p-4 space-y-2 border-amber-400/30">
            <div className="flex items-center justify-between">
                <p className="text-sand-warm text-sm font-sans font-bold">{memberName}</p>
                {!revealed ? (
                    <button
                        onClick={() => setRevealed(true)}
                        className="px-3 py-1 rounded-lg text-xs font-sans transition-all bg-amber-400/20 text-amber-400 hover:bg-amber-400/30"
                    >
                        Reveal
                    </button>
                ) : (
                    <span className="text-xs text-amber-400 font-bold">
                        {truth ? `+${points} pts` : 'Revealed'}
                    </span>
                )}
            </div>
            {revealed && (
                <div className="space-y-1.5 pt-1">
                    {PASSPORT_QUESTIONS.map(q => {
                        const answer = passport[q.key];
                        const correctAnswer = truth?.[q.key];
                        const isCorrect = truth && answer && answer === correctAnswer;
                        const isWrong = truth && answer && correctAnswer && answer !== correctAnswer;
                        return (
                            <div key={q.key} className="flex items-center gap-2 text-sm font-sans">
                                <Icon
                                    name={isCorrect ? 'check_circle' : isWrong ? 'cancel' : 'help_outline'}
                                    className={`text-sm ${isCorrect ? 'text-jungle-400' : isWrong ? 'text-fire-400' : 'text-sand-warm/40'}`}
                                />
                                <span className="text-sand-warm/50 flex-1">{q.label}</span>
                                <span className={`font-bold ${isCorrect ? 'text-jungle-400' : 'text-sand-warm'}`}>
                                    {answer ? contestantName(answer) : '—'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </FijianCard>
    );
}

function ContestantSelect({ value, onChange, label }) {
    return (
        <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-stone-dark/80 border border-earth/30 rounded-lg h-10 px-3 text-sand-warm text-sm outline-none"
            aria-label={label}
        >
            <option value="">Select...</option>
            {ALL_CASTAWAYS.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
            ))}
        </select>
    );
}

function PassportTruthPanel() {
    const { finaleData, setPassportTruth } = useApp();
    const [truth, setTruth] = useState(() => finaleData?.passportTruth || {});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const setKey = (key, val) => {
        setTruth(prev => ({ ...prev, [key]: val }));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await setPassportTruth(truth);
            setSaved(true);
        } finally {
            setSaving(false);
        }
    };

    return (
        <FijianCard className="p-4 space-y-3 border-amber-400/20">
            <FijianSectionHeader title="Passport Truth (Host)" />
            <p className="text-clay text-xs font-serif italic">
                Enter what actually happened. Each answer that matches a sealed passport pays +{PASSPORT_POINTS_PER_CORRECT} pts.
            </p>
            <div className="space-y-2">
                {PASSPORT_QUESTIONS.map(q => (
                    <div key={q.key} className="space-y-1">
                        <label className="text-sand-warm/70 text-xs font-sans font-bold">{q.label}</label>
                        <ContestantSelect value={truth[q.key]} onChange={val => setKey(q.key, val)} label={q.label} />
                    </div>
                ))}
            </div>
            <FijianPrimaryButton onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : saved ? 'Truth Saved — scores updated' : 'Save Passport Truth'}
            </FijianPrimaryButton>
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

function LegacyCard({ memberName, standing, rank, episodes }) {
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

            <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-stone-800/50 rounded-lg p-2">
                    <p className="font-display text-lg text-fire-400">{standing?.weekly || 0}</p>
                    <p className="text-[10px] text-sand-warm/60">Picks</p>
                </div>
                <div className="bg-stone-800/50 rounded-lg p-2">
                    <p className="font-display text-lg text-green-400">{standing?.predictions || 0}</p>
                    <p className="text-[10px] text-sand-warm/60">Predict</p>
                </div>
                <div className="bg-stone-800/50 rounded-lg p-2">
                    <p className="font-display text-lg text-purple-400">{standing?.bingo || 0}</p>
                    <p className="text-[10px] text-sand-warm/60">Bingo</p>
                </div>
                <div className="bg-stone-800/50 rounded-lg p-2">
                    <p className="font-display text-lg text-amber-400">{standing?.passport || 0}</p>
                    <p className="text-[10px] text-sand-warm/60">Passport</p>
                </div>
            </div>

            <p className="text-center text-sand-warm/50 text-xs font-sans">
                Avg {avgPerEp} pts/ep across {scoredEps} episodes
            </p>
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
                <p className="text-sand-warm/60 text-sm font-sans mt-1">Season 51 Champion</p>
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
        user, league, leagueMembers, mergePassports,
        episodes, bingo, finaleData, startFinale,
    } = useApp();

    const isHost = league?.createdBy === user?.uid;
    const memberUids = useMemo(() => Object.keys(leagueMembers || {}), [leagueMembers]);
    const passportTruth = finaleData?.passportTruth || null;

    const { standings } = useMemo(
        () => computeStandings(episodes, memberUids, bingo, {
            passports: mergePassports,
            passportTruth,
        }),
        [episodes, memberUids, bingo, mergePassports, passportTruth]
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
                    This begins the passport reveal, reunion awards, and champion crowning.
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
                <p className="text-sand-warm/50 text-xs font-sans mt-1">Season 51 finale</p>
            </FijianCard>

            {/* Host enters truth so passports score */}
            {isHost && <PassportTruthPanel />}

            {/* Passport Reveals */}
            <FijianCard className="p-4 space-y-3">
                <FijianSectionHeader title="Passport Reveals" />
                <p className="text-clay text-xs font-serif italic">
                    Sealed at the merge — five long-term calls per player. +{PASSPORT_POINTS_PER_CORRECT} pts each answer that came true.
                </p>
                {memberUids.map(uid => (
                    <PassportRevealCard
                        key={uid}
                        memberName={leagueMembers?.[uid]?.displayName || uid}
                        passport={mergePassports?.[uid]}
                        truth={passportTruth}
                    />
                ))}
            </FijianCard>

            {/* Reunion Awards */}
            <ReunionAwards />

            {/* Legacy Cards */}
            <FijianCard className="p-4 space-y-3">
                <FijianSectionHeader title="Legacy Cards" />
                {standings?.map((s, i) => (
                    <LegacyCard
                        key={s.uid}
                        memberName={leagueMembers?.[s.uid]?.displayName || s.uid}
                        standing={s}
                        rank={i + 1}
                        episodes={episodes}
                    />
                ))}
            </FijianCard>

            {/* Champion Crowning */}
            <ChampionCrowning />
        </div>
    );
}
