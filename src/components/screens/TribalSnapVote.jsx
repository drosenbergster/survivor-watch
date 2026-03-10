import { useState, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { ALL_CASTAWAYS, TRIBES } from '../../data';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

function SnapVoteSelector({ remaining, selected, onSelect, disabled }) {
    const byTribe = useMemo(() => {
        const map = {};
        for (const [tribeKey, tribe] of Object.entries(TRIBES)) {
            const members = tribe.members.filter(c => remaining.some(r => r.id === c.id));
            if (members.length > 0) {
                map[tribeKey] = { name: tribe.name, members };
            }
        }
        return map;
    }, [remaining]);

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

function SideBetToggle({ bet, value, onChange, disabled }) {
    return (
        <button
            onClick={() => !disabled && onChange(!value)}
            disabled={disabled}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-sans transition-all flex items-center gap-3 ${
                value
                    ? 'bg-fire-400/20 text-fire-400 border border-fire-400/40'
                    : 'bg-stone-800 text-sand-warm/60 border border-transparent hover:bg-stone-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            <span className="text-lg">{value ? '🔥' : '⬜'}</span>
            <span className="flex-1">{bet.text}</span>
            <span className="text-xs text-sand-warm/60">{value ? 'YES' : 'NO'}</span>
        </button>
    );
}

export default function TribalSnapVote({ episodeNum }) {
    const {
        user, episodeData, safeEliminated,
        submitSnapVote, submitSideBets,
    } = useApp();

    const [showTribal, setShowTribal] = useState(false);
    const [selectedVote, setSelectedVote] = useState('');
    const [sideBetAnswers, setSideBetAnswers] = useState({});
    const [submittingVote, setSubmittingVote] = useState(false);
    const [submittingSideBets, setSubmittingSideBets] = useState(false);
    const [error, setError] = useState('');

    const remaining = useMemo(() => {
        const elimSet = new Set(safeEliminated || []);
        return ALL_CASTAWAYS.filter(c => !elimSet.has(c.id));
    }, [safeEliminated]);

    const sideBets = episodeData?.sideBets || [];
    const mySnapVote = episodeData?.snapVotes?.[user?.uid];
    const mySideBets = episodeData?.playerSideBets?.[user?.uid];
    const hasVoted = !!mySnapVote;
    const hasSubmittedSideBets = !!mySideBets;

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

    const handleSubmitSideBets = async () => {
        setError('');
        setSubmittingSideBets(true);
        try {
            await submitSideBets(episodeNum, sideBetAnswers);
        } catch (err) {
            setError(err.message);
        }
        setSubmittingSideBets(false);
    };

    const votedContestant = mySnapVote
        ? ALL_CASTAWAYS.find(c => c.id === mySnapVote.contestantId)
        : null;

    const allDone = hasVoted && (hasSubmittedSideBets || sideBets.length === 0);

    if (allDone) {
        return (
            <FijianCard className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <Icon name="check_circle" className="text-jungle-400" />
                    <span className="text-sand-warm font-sans font-bold text-sm">Tribal Votes Locked</span>
                </div>
                <div className="text-xs font-sans text-sand-warm/60 space-y-1">
                    <p>Snap vote: <span className="text-ochre">{votedContestant?.name}</span> <span className="text-sand-warm/60">(+8 if correct)</span></p>
                    {sideBets.map(bet => {
                        const answer = mySideBets?.[bet.id];
                        return (
                            <div key={bet.id} className="flex items-center gap-2">
                                <span className={answer ? 'text-fire-400' : 'text-sand-warm/60'}>
                                    {answer ? 'YES' : 'NO'}
                                </span>
                                <span className="text-stone-400">{bet.text}</span>
                            </div>
                        );
                    })}
                </div>
            </FijianCard>
        );
    }

    if (!showTribal) {
        return (
            <FijianCard className="p-5 text-center space-y-3 border-fire-400/20">
                <div className="text-3xl">🔥</div>
                <h3 className="font-display text-xl text-sand-warm tracking-wider">Tribal Council</h3>
                <p className="text-sand-warm/60 text-sm font-sans max-w-xs mx-auto">
                    When tribal starts, pause the show and lock in your votes.
                </p>
                <FijianPrimaryButton onClick={() => setShowTribal(true)}>
                    <Icon name="how_to_vote" />
                    I&apos;m at Tribal — Let Me Vote
                </FijianPrimaryButton>
            </FijianCard>
        );
    }

    return (
        <div className="space-y-4">
            <FijianCard className="p-4 text-center border-fire-400/40 shadow-fire">
                <p className="font-display text-2xl tracking-wider text-fire-400">
                    TRIBAL COUNCIL
                </p>
                <p className="text-sand-warm/60 text-xs mt-1 font-sans">
                    Pause the show and lock in your votes!
                </p>
            </FijianCard>

            {!hasVoted ? (
                <FijianCard className="p-4 space-y-4">
                    <FijianSectionHeader title="Who's Going Home?" />
                    <SnapVoteSelector
                        remaining={remaining}
                        selected={selectedVote}
                        onSelect={setSelectedVote}
                        disabled={submittingVote}
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
            ) : (
                <FijianCard className="p-4 text-center space-y-2">
                    <Icon name="check_circle" className="text-jungle-400 text-3xl" />
                    <p className="text-sand-warm font-sans font-bold">Vote Locked In</p>
                    <p className="text-ochre text-sm font-sans">
                        {votedContestant?.name} is going home
                    </p>
                    <p className="text-sand-warm/60 text-xs font-sans">+8 pts if you&apos;re right</p>
                </FijianCard>
            )}

            {sideBets.length > 0 && !hasSubmittedSideBets && (
                <FijianCard className="p-4 space-y-3">
                    <FijianSectionHeader title="Tribal Side Bets" />
                    <p className="text-clay text-xs font-serif italic">
                        Quick yes/no calls &mdash; +3 pts each correct
                    </p>
                    {sideBets.map(bet => (
                        <SideBetToggle
                            key={bet.id}
                            bet={bet}
                            value={!!sideBetAnswers[bet.id]}
                            onChange={(v) => setSideBetAnswers(prev => ({ ...prev, [bet.id]: v }))}
                            disabled={submittingSideBets}
                        />
                    ))}
                    <FijianPrimaryButton
                        onClick={handleSubmitSideBets}
                        disabled={submittingSideBets}
                    >
                        {submittingSideBets ? 'Locking...' : 'Lock In Side Bets'}
                    </FijianPrimaryButton>
                </FijianCard>
            )}

            {error && (
                <p className="text-red-400 text-sm text-center font-sans" role="alert">{error}</p>
            )}
        </div>
    );
}
