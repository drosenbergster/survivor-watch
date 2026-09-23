import { useState, useMemo } from 'react';
import { useApp, getEffectiveTribeAssignments } from '../../AppContext';
import { ALL_CASTAWAYS, TRIBES } from '../../data';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

function SnapVoteSelector({ remaining, selected, onSelect, disabled, tribeOverrides }) {
    const byTribe = useMemo(() => {
        const map = {};
        if (tribeOverrides) {
            for (const [tribeName, memberIds] of Object.entries(tribeOverrides)) {
                const members = (memberIds || [])
                    .map(id => ALL_CASTAWAYS.find(c => c.id === id))
                    .filter(c => c && remaining.some(r => r.id === c.id));
                const tribeKey = Object.keys(TRIBES).find(k => TRIBES[k].name.toLowerCase() === tribeName.toLowerCase()) || tribeName.toLowerCase();
                if (members.length > 0) map[tribeKey] = { name: tribeName, members };
            }
        } else {
            for (const [tribeKey, tribe] of Object.entries(TRIBES)) {
                const members = tribe.members.filter(c => remaining.some(r => r.id === c.id));
                if (members.length > 0) map[tribeKey] = { name: tribe.name, members };
            }
        }
        return map;
    }, [remaining, tribeOverrides]);

    return (
        <div className="space-y-3">
            {Object.entries(byTribe).map(([key, tribe]) => (
                <div key={key}>
                    <p className="text-xs text-sand-warm/50 font-sans font-semibold mb-1.5">{tribe.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                        {tribe.members.map(c => (
                            <button
                                key={c.id}
                                onClick={() => !disabled && onSelect(c.id)}
                                disabled={disabled}
                                className={`px-3 py-2 rounded-lg text-sm font-sans transition-all ${
                                    selected === c.id
                                        ? 'bg-fire-400 text-white shadow-fire font-bold scale-105'
                                        : 'bg-stone-800 text-sand-warm/70 hover:bg-stone-700 hover:text-sand-warm'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {c.name}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function TribalSnapVote({ episodeNum }) {
    const {
        user, myEpisodeData, safeEliminated,
        submitSnapVote, tribeSwaps,
    } = useApp();

    const tribeOverrides = useMemo(
        () => getEffectiveTribeAssignments(tribeSwaps, episodeNum),
        [tribeSwaps, episodeNum]
    );

    const [showTribal, setShowTribal] = useState(false);
    const [selectedVote, setSelectedVote] = useState('');
    const [submittingVote, setSubmittingVote] = useState(false);
    const [error, setError] = useState('');

    const remaining = useMemo(() => {
        const elimSet = new Set(safeEliminated || []);
        return ALL_CASTAWAYS.filter(c => !elimSet.has(c.id));
    }, [safeEliminated]);

    const mySnapVote = myEpisodeData?.snapVotes?.[user?.uid];
    const hasVoted = !!mySnapVote;

    const handleSubmitVote = async () => {
        if (!selectedVote) return;
        setError('');
        setSubmittingVote(true);
        try {
            await submitSnapVote(episodeNum, selectedVote);
        } catch (err) {
            setError(err.message);
        }
        setSubmittingVote(false);
    };

    const votedContestant = mySnapVote
        ? ALL_CASTAWAYS.find(c => c.id === mySnapVote.contestantId)
        : null;

    if (hasVoted) {
        return (
            <FijianCard className="p-4 text-center space-y-2">
                <Icon name="check_circle" className="text-jungle-400 text-3xl" />
                <p className="text-sand-warm font-sans font-bold">Your call is locked</p>
                <p className="text-ochre text-sm font-sans">{votedContestant?.name}</p>
                <p className="text-sand-warm/60 text-xs font-sans">+8 if the torch gets snuffed</p>
            </FijianCard>
        );
    }

    if (!showTribal) {
        return (
            <FijianCard className="p-5 text-center space-y-3 border-fire-400/20">
                <div className="text-3xl">🔥</div>
                <h3 className="font-display text-xl text-sand-warm tracking-wider">Tribal Council</h3>
                <p className="text-sand-warm/60 text-sm font-sans max-w-xs mx-auto">
                    They have sat down. Pause before Jeff asks his first question.
                </p>
                <FijianPrimaryButton onClick={() => setShowTribal(true)}>
                    <Icon name="how_to_vote" />
                    I&apos;m at tribal
                </FijianPrimaryButton>
            </FijianCard>
        );
    }

    return (
        <div className="space-y-4">
            <FijianCard className="p-4 text-center border-fire-400/40 shadow-fire">
                <p className="font-display text-2xl tracking-wider text-fire-400">
                    Tribal Council
                </p>
                <p className="text-sand-warm/60 text-xs mt-1 font-sans">
                    One call, before the questioning starts. Worth +8.
                </p>
            </FijianCard>

            <FijianCard className="p-4 space-y-4">
                <FijianSectionHeader title="Whose Torch Gets Snuffed?" />
                <SnapVoteSelector
                    remaining={remaining}
                    selected={selectedVote}
                    onSelect={setSelectedVote}
                    disabled={submittingVote}
                    tribeOverrides={tribeOverrides}
                />
                {selectedVote && (
                    <FijianPrimaryButton
                        onClick={handleSubmitVote}
                        disabled={submittingVote || !selectedVote}
                    >
                        <Icon name="how_to_vote" />
                        {submittingVote
                            ? 'Locking in...'
                            : `Lock In: ${ALL_CASTAWAYS.find(c => c.id === selectedVote)?.name}`
                        }
                    </FijianPrimaryButton>
                )}
            </FijianCard>

            {error && (
                <p className="text-red-400 text-sm text-center font-sans" role="alert">{error}</p>
            )}
        </div>
    );
}
