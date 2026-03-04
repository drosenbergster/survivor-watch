import { useState } from 'react';
import { useApp } from '../../AppContext';
import { ALL_CASTAWAYS } from '../../data';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

const MERGE_QUESTIONS = [
    { key: 'winner', label: 'Sole Survivor', prompt: 'Who wins Season 50?', points: '12 pts', icon: 'emoji_events' },
    { key: 'firstJury', label: 'First Juror', prompt: 'Who is the first jury member?', points: '8 pts', icon: 'gavel' },
    { key: 'fanFavorite', label: 'Fan Favorite', prompt: 'Who will be the fan favorite post-merge?', points: '8 pts', icon: 'favorite' },
    { key: 'biggestVillain', label: 'Biggest Villain', prompt: 'Who plays the dirtiest post-merge game?', points: '8 pts', icon: 'mood_bad' },
    { key: 'fireMakingWinner', label: 'Fire-Making Winner', prompt: 'Who wins fire at Final 4?', points: '12 pts', icon: 'local_fire_department' },
];

function ContestantSelect({ value, onChange, label, excludeIds = [] }) {
    const { eliminated } = useApp();
    const available = ALL_CASTAWAYS.filter(
        c => !(eliminated || []).includes(c.id) && (!excludeIds.includes(c.id) || c.id === value)
    );

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

export default function MergePassport() {
    const { user, mergePassports, submitMergePassport, isMerged } = useApp();
    const [answers, setAnswers] = useState({
        winner: '', firstJury: '', fanFavorite: '', biggestVillain: '', fireMakingWinner: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isMerged) return null;

    const myPassport = mergePassports?.[user?.uid];
    const isSealed = !!myPassport?.sealedAt;

    const allFilled = MERGE_QUESTIONS.every(q => answers[q.key]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await submitMergePassport(answers);
        } catch (err) {
            setError(err.message || 'Failed to seal passport');
        }
        setSubmitting(false);
    };

    const setAnswer = (key, val) => setAnswers(prev => ({ ...prev, [key]: val }));

    if (isSealed) {
        return (
            <FijianCard className="p-5 text-center border-purple-400/30">
                <div className="text-3xl mb-2">🔒</div>
                <p className="font-display text-xl tracking-wider text-purple-400">Merge Passport Sealed</p>
                <p className="text-clay text-xs mt-1 font-serif italic">
                    Your mid-season reads are locked until the finale reveal.
                </p>
            </FijianCard>
        );
    }

    return (
        <div className="space-y-4">
            <FijianCard className="p-4 text-center border-purple-400/20">
                <p className="font-display text-xl tracking-wider text-purple-400">Merge Passport</p>
                <p className="text-sand-warm/50 text-xs font-sans mt-1">
                    5 updated predictions with the merge intel. Half-value — 8-12 pts each.
                </p>
            </FijianCard>

            <form onSubmit={handleSubmit} className="space-y-4">
                {MERGE_QUESTIONS.map(q => (
                    <FijianCard key={q.key} className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Icon name={q.icon} className="text-purple-400 text-lg" />
                            <div className="flex-1">
                                <span className="text-sand-warm text-sm font-bold">{q.label}</span>
                                <span className="text-purple-400/50 text-xs ml-2">{q.points}</span>
                            </div>
                        </div>
                        <p className="text-clay text-xs mb-2 font-serif italic">{q.prompt}</p>
                        <ContestantSelect
                            value={answers[q.key]}
                            onChange={val => setAnswer(q.key, val)}
                            label={q.prompt}
                        />
                    </FijianCard>
                ))}

                <FijianPrimaryButton type="submit" disabled={!allFilled || submitting}>
                    {submitting ? 'Sealing...' : 'Seal Merge Passport'}
                </FijianPrimaryButton>
                <p className="text-sand-warm/60 text-xs text-center font-serif italic">
                    Once sealed, your merge picks cannot be changed.
                </p>
                {error && <p className="text-amber text-xs text-center" role="alert">{error}</p>}
            </form>
        </div>
    );
}
