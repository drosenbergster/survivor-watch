import { useState } from 'react';
import { useApp } from '../../AppContext';
import { ALL_CASTAWAYS } from '../../data';
import {
    FijianCard,
    FijianSectionHeader,
    FijianPrimaryButton,
    Icon,
} from '../fijian';

const PASSPORT_QUESTIONS = [
    { key: 'winner', label: 'Sole Survivor', prompt: 'Who wins Season 50?', points: '25 pts', icon: 'emoji_events' },
    { key: 'firstBoot', label: 'First Boot', prompt: 'Who goes home first?', points: '20 pts', icon: 'directions_walk' },
    { key: 'fanFavorite', label: 'Fan Favorite', prompt: 'Who will be the fan favorite?', points: '15 pts', icon: 'favorite' },
    { key: 'biggestVillain', label: 'Biggest Villain', prompt: 'Who plays the dirtiest game?', points: '15 pts', icon: 'mood_bad' },
    { key: 'fireMakingWinner', label: 'Fire-Making Winner', prompt: 'Who wins fire at Final 4?', points: '20 pts', icon: 'local_fire_department' },
];

function ContestantSelect({ value, onChange, label, excludeIds = [] }) {
    const available = ALL_CASTAWAYS.filter(c => !excludeIds.includes(c.id) || c.id === value);

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-stone-dark/80 border-2 border-earth/30 focus:border-clay/50 focus:ring-0 rounded-lg h-12 px-4 text-sand-warm text-sm transition-all outline-none appearance-none cursor-pointer"
            aria-label={label}
        >
            <option value="">Select a castaway...</option>
            {available.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.short})</option>
            ))}
        </select>
    );
}

function SealedPassport() {
    return (
        <FijianCard className="p-6 text-center border-jungle-400/30">
            <div className="text-4xl mb-3" aria-hidden>🔒</div>
            <p className="font-display text-2xl tracking-wider text-jungle-400">
                Passport Sealed!
            </p>
            <p className="text-clay text-sm mt-2 font-serif italic">
                Your gut picks are locked away until the finale reveal.
            </p>
        </FijianCard>
    );
}

export default function SeasonPassport() {
    const { user, passports, submitPassport, league, leagueMembers } = useApp();
    const [answers, setAnswers] = useState({
        winner: '', firstBoot: '', fanFavorite: '', biggestVillain: '', fireMakingWinner: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const myPassport = passports?.[user?.uid];
    const isSealed = !!myPassport?.sealedAt;

    const memberEntries = Object.entries(leagueMembers || {});
    const sealedCount = memberEntries.filter(([uid]) => passports?.[uid]?.sealedAt).length;
    const allSealed = sealedCount === memberEntries.length && memberEntries.length > 0;
    const isAdmin = league?.createdBy === user?.uid;

    const allFilled = PASSPORT_QUESTIONS.every(q => answers[q.key]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await submitPassport(answers);
        } catch (err) {
            setError(err.message);
        }
        setSubmitting(false);
    };

    const setAnswer = (key, val) => setAnswers(prev => ({ ...prev, [key]: val }));

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <header className="text-center">
                <h2 className="font-display text-4xl tracking-wider text-sand-warm drop-shadow-text">Passport</h2>
                <p className="text-sand-warm/70 text-sm mt-1">
                    Season 50 &middot; 5 gut picks, sealed until the finale
                </p>
            </header>

            {isSealed ? (
                <>
                    <SealedPassport />

                    {/* Sealed status of all members */}
                    <FijianCard>
                        <div className="px-4 py-3 border-b border-ochre/20 flex items-center justify-between">
                            <FijianSectionHeader title="Passport Status" className="!mb-0" />
                            <span className="text-ochre/60 text-xs font-bold">{sealedCount}/{memberEntries.length}</span>
                        </div>
                        <div className="p-3 space-y-1">
                            {memberEntries.map(([uid, member]) => {
                                const sealed = !!passports?.[uid]?.sealedAt;
                                return (
                                    <div key={uid} className="flex items-center gap-2 px-3 py-1.5 text-sm">
                                        <Icon
                                            name={sealed ? 'lock' : 'hourglass_empty'}
                                            className={`text-sm ${sealed ? 'text-jungle-400' : 'text-sand-warm/60'}`}
                                        />
                                        <span className={sealed ? 'text-sand-warm' : 'text-sand-warm/60'}>
                                            {member.displayName}
                                            {uid === user?.uid && <span className="text-clay text-xs ml-1">(you)</span>}
                                        </span>
                                        <span className={`ml-auto text-xs ${sealed ? 'text-jungle-400' : 'text-sand-warm/50'}`}>
                                            {sealed ? 'Sealed' : 'Pending'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </FijianCard>

                    {allSealed && isAdmin && (
                        <StartSeasonButton />
                    )}
                    {allSealed && !isAdmin && (
                        <FijianCard className="p-4 text-center border-ochre/10">
                            <p className="text-clay text-xs font-serif italic">
                                All passports sealed! Waiting for the host to start the season...
                            </p>
                        </FijianCard>
                    )}
                </>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {PASSPORT_QUESTIONS.map((q) => (
                        <FijianCard key={q.key} className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Icon name={q.icon} className="text-ochre text-lg" />
                                <div className="flex-1">
                                    <span className="text-sand-warm text-sm font-bold">{q.label}</span>
                                    <span className="text-ochre/70 text-xs ml-2">{q.points}</span>
                                </div>
                            </div>
                            <p className="text-clay text-xs mb-2 font-serif italic">{q.prompt}</p>
                            <ContestantSelect
                                value={answers[q.key]}
                                onChange={(val) => setAnswer(q.key, val)}
                                label={q.prompt}
                            />
                        </FijianCard>
                    ))}

                    <div className="pt-2">
                        <FijianPrimaryButton type="submit" disabled={!allFilled || submitting}>
                            {submitting ? 'Sealing...' : 'Seal My Passport'}
                        </FijianPrimaryButton>
                        <p className="text-sand-warm/60 text-xs text-center mt-3 font-serif italic">
                            Once sealed, your picks cannot be changed.
                        </p>
                    </div>

                    {error && <p className="text-amber text-xs text-center" role="alert">{error}</p>}
                </form>
            )}
        </div>
    );
}

function StartSeasonButton() {
    const { startSeason } = useApp();
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState('');

    return (
        <FijianCard className="p-5 text-center">
            <p className="text-sand-warm text-sm mb-4">
                All passports are sealed. Ready to play!
            </p>
            <FijianPrimaryButton
                onClick={async () => {
                    setStarting(true);
                    setError('');
                    try { await startSeason(); }
                    catch (err) { setError(err.message); }
                    setStarting(false);
                }}
                disabled={starting}
            >
                {starting ? 'Starting...' : 'Start the Season'}
            </FijianPrimaryButton>
            {error && <p className="text-amber text-xs mt-3" role="alert">{error}</p>}
        </FijianCard>
    );
}
