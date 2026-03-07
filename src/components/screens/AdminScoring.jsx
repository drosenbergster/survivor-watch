import { useState, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { ALL_CASTAWAYS, SCORE_EVENTS } from '../../data';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

const CHALLENGE_EVENTS = SCORE_EVENTS.filter(e =>
    ['tribal_immunity', 'tribal_reward', 'individual_immunity', 'individual_reward'].includes(e.key)
);

const TRIBAL_EVENTS = SCORE_EVENTS.filter(e =>
    ['survived', 'voted_correctly', 'survived_with_votes', 'attended_tribal_zero'].includes(e.key)
);

const BIG_MOMENT_EVENTS = SCORE_EVENTS.filter(e =>
    ['idol_found', 'idol_played_success', 'advantage_found', 'advantage_used',
        'exile', 'merge', 'ftc', 'fire_making_win', 'winner', 'medevac'].includes(e.key)
);

function ContestantToggle({ contestant, selected, onToggle }) {
    return (
        <button
            onClick={() => onToggle(contestant.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all ${selected
                ? 'bg-fire-400/90 text-white shadow-fire'
                : 'bg-stone-800 text-sand-warm/60 hover:bg-stone-700'
                }`}
        >
            {contestant.name}
        </button>
    );
}

function EventSection({ title, events, remaining, assignments, onChange }) {
    const toggle = (eventKey, contestantId) => {
        const current = assignments[eventKey] || [];
        const updated = current.includes(contestantId)
            ? current.filter(id => id !== contestantId)
            : [...current, contestantId];
        onChange({ ...assignments, [eventKey]: updated });
    };

    return (
        <div className="space-y-3">
            <h4 className="text-sand-warm/80 font-sans font-semibold text-sm">{title}</h4>
            {events.map(event => (
                <div key={event.key} className="space-y-1.5">
                    <p className="text-xs text-sand-warm/60 font-sans">
                        {event.emoji} {event.label} <span className="text-ochre">+{event.points}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {remaining.map(c => (
                            <ContestantToggle
                                key={c.id}
                                contestant={c}
                                selected={(assignments[event.key] || []).includes(c.id)}
                                onToggle={(id) => toggle(event.key, id)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function AdminScoring({ episodeNum }) {
    const { user, league, episodeData, eliminated, scoreEpisodeAction } = useApp();
    const [assignments, setAssignments] = useState({});
    const [eliminatedPick, setEliminatedPick] = useState('');
    const [eliminationMethod, setEliminationMethod] = useState('voted_out');
    const [propBetResults, setPropBetResults] = useState({});
    const [boldResults, setBoldResults] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [section, setSection] = useState('elimination');

    const [sideBetResultsState, setSideBetResultsState] = useState({});

    const isAdmin = league?.createdBy === user?.uid;
    const propBets = episodeData?.propBets || [];
    const sideBets = episodeData?.sideBets || [];
    const predictions = episodeData?.predictions || {};

    const remaining = useMemo(() => {
        const elimSet = new Set(eliminated || []);
        return ALL_CASTAWAYS.filter(c => !elimSet.has(c.id));
    }, [eliminated]);

    if (!isAdmin || episodeData?.scored) return null;
    if (episodeData?.status !== 'open') return null;

    const boldPredictions = Object.entries(predictions)
        .filter(([, p]) => p?.boldPrediction)
        .map(([uid, p]) => ({ uid, text: p.boldPrediction }));

    const buildGameEvents = () => {
        const gameEvents = {};

        const ensure = (cid) => { if (!gameEvents[cid]) gameEvents[cid] = []; };

        for (const [eventKey, contestantIds] of Object.entries(assignments)) {
            for (const cid of contestantIds) {
                ensure(cid);
                gameEvents[cid].push(eventKey);
            }
        }

        // Auto-assign "survived" to all remaining who weren't eliminated this episode
        for (const c of remaining) {
            if (c.id !== eliminatedPick) {
                ensure(c.id);
                if (!gameEvents[c.id].includes('survived')) {
                    gameEvents[c.id].push('survived');
                }
            }
        }

        return gameEvents;
    };

    const handleScore = async () => {
        setError('');
        setSaving(true);
        try {
            const gameEvents = buildGameEvents();
            const eliminatedThisEp = eliminatedPick ? [eliminatedPick] : [];

            await scoreEpisodeAction(episodeNum, {
                gameEvents,
                propBetResults,
                boldResults,
                sideBetResults: sideBetResultsState,
                eliminatedThisEp,
                eliminationMethod,
            });
        } catch (err) {
            setError(err.message || 'Failed to score episode');
        }
        setSaving(false);
    };

    const sections = [
        { key: 'elimination', label: 'Elimination' },
        { key: 'challenges', label: 'Challenges' },
        { key: 'tribal', label: 'Tribal' },
        { key: 'moments', label: 'Big Moments' },
        { key: 'props', label: 'Prop Bets' },
        ...(sideBets.length > 0 ? [{ key: 'sidebets', label: 'Side Bets' }] : []),
        { key: 'bold', label: 'Bold Predictions' },
    ];

    return (
        <FijianCard className="p-5 space-y-5">
            <FijianSectionHeader title={`Score Episode ${episodeNum}`} />

            <div className="flex flex-wrap gap-1.5">
                {sections.map(s => (
                    <button
                        key={s.key}
                        onClick={() => setSection(s.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all ${section === s.key
                            ? 'bg-ochre text-stone-950 font-bold'
                            : 'bg-stone-800 text-sand-warm/60 hover:bg-stone-700'
                            }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {section === 'elimination' && (
                <div className="space-y-3">
                    <h4 className="text-sand-warm/80 font-sans font-semibold text-sm">Who was eliminated?</h4>
                    <select
                        value={eliminatedPick}
                        onChange={(e) => setEliminatedPick(e.target.value)}
                        className="w-full bg-stone-800 text-sand-warm border border-stone-600 rounded-lg px-3 py-2 text-sm font-sans"
                    >
                        <option value="">No elimination this episode</option>
                        {remaining.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.short})</option>
                        ))}
                    </select>
                    {eliminatedPick && (
                        <div className="space-y-2">
                            <p className="text-xs text-sand-warm/60 font-sans">How?</p>
                            <div className="flex gap-2">
                                {[['voted_out', 'Voted Out'], ['medevac', 'Medevac'], ['quit', 'Quit'], ['fire', 'Fire-Making']].map(([val, label]) => (
                                    <button
                                        key={val}
                                        onClick={() => setEliminationMethod(val)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-sans ${eliminationMethod === val
                                            ? 'bg-fire-400/90 text-white'
                                            : 'bg-stone-800 text-sand-warm/60'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {section === 'challenges' && (
                <EventSection
                    title="Challenge Results"
                    events={CHALLENGE_EVENTS}
                    remaining={remaining}
                    assignments={assignments}
                    onChange={setAssignments}
                />
            )}

            {section === 'tribal' && (
                <EventSection
                    title="Tribal Council"
                    events={TRIBAL_EVENTS}
                    remaining={remaining}
                    assignments={assignments}
                    onChange={setAssignments}
                />
            )}

            {section === 'moments' && (
                <EventSection
                    title="Big Moments"
                    events={BIG_MOMENT_EVENTS}
                    remaining={remaining}
                    assignments={assignments}
                    onChange={setAssignments}
                />
            )}

            {section === 'props' && (
                <div className="space-y-3">
                    <h4 className="text-sand-warm/80 font-sans font-semibold text-sm">Prop Bet Outcomes</h4>
                    <p className="text-sand-warm/50 text-xs font-sans">Did this happen? Mark YES or NO. Unanswered props won&apos;t affect scores.</p>
                    {propBets.map(prop => {
                        const result = propBetResults[prop.id];
                        return (
                            <div key={prop.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-stone-800 text-sm font-sans">
                                <span className="flex-1 text-sand-warm/80">{prop.text}</span>
                                <div className="flex gap-1 shrink-0">
                                    <button
                                        onClick={() => setPropBetResults(prev => ({ ...prev, [prop.id]: true }))}
                                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                            result === true
                                                ? 'bg-green-500 text-white'
                                                : 'bg-stone-700 text-sand-warm/50 hover:bg-stone-600'
                                        }`}
                                    >
                                        YES
                                    </button>
                                    <button
                                        onClick={() => setPropBetResults(prev => ({ ...prev, [prop.id]: false }))}
                                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                            result === false
                                                ? 'bg-red-500 text-white'
                                                : 'bg-stone-700 text-sand-warm/50 hover:bg-stone-600'
                                        }`}
                                    >
                                        NO
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {propBets.length === 0 && (
                        <p className="text-sm text-sand-warm/60 italic font-sans">No prop bets this episode</p>
                    )}
                </div>
            )}

            {section === 'sidebets' && (
                <div className="space-y-3">
                    <h4 className="text-sand-warm/80 font-sans font-semibold text-sm">Tribal Side Bet Outcomes</h4>
                    <p className="text-sand-warm/50 text-xs font-sans">Mark YES or NO. Unanswered bets won&apos;t affect scores.</p>
                    {sideBets.map(bet => {
                        const result = sideBetResultsState[bet.id];
                        return (
                            <div key={bet.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-stone-800 text-sm font-sans">
                                <span className="flex-1 text-sand-warm/80">{bet.text}</span>
                                <div className="flex gap-1 shrink-0">
                                    <button
                                        onClick={() => setSideBetResultsState(prev => ({ ...prev, [bet.id]: true }))}
                                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                            result === true
                                                ? 'bg-green-500 text-white'
                                                : 'bg-stone-700 text-sand-warm/50 hover:bg-stone-600'
                                        }`}
                                    >
                                        YES
                                    </button>
                                    <button
                                        onClick={() => setSideBetResultsState(prev => ({ ...prev, [bet.id]: false }))}
                                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                                            result === false
                                                ? 'bg-red-500 text-white'
                                                : 'bg-stone-700 text-sand-warm/50 hover:bg-stone-600'
                                        }`}
                                    >
                                        NO
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {section === 'bold' && (
                <div className="space-y-3">
                    <h4 className="text-sand-warm/80 font-sans font-semibold text-sm">Bold Prediction Outcomes</h4>
                    {boldPredictions.length === 0 && (
                        <p className="text-sm text-sand-warm/60 italic font-sans">No bold predictions submitted</p>
                    )}
                    {boldPredictions.map(({ uid, text }) => (
                        <button
                            key={uid}
                            onClick={() => setBoldResults(prev => ({ ...prev, [uid]: !prev[uid] }))}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-sans transition-all flex items-center gap-3 ${boldResults[uid]
                                ? 'bg-green-900/40 text-green-300 border border-green-700/50'
                                : 'bg-stone-800 text-sand-warm/60 border border-transparent'
                                }`}
                        >
                            <span className="text-lg">{boldResults[uid] ? '✅' : '⬜'}</span>
                            <span>"{text}"</span>
                        </button>
                    ))}
                </div>
            )}

            {error && (
                <p className="text-red-400 text-sm font-sans" role="alert">{error}</p>
            )}

            <FijianPrimaryButton
                onClick={handleScore}
                disabled={saving}
                className="w-full"
            >
                <Icon name="scoring" />
                {saving ? 'Scoring...' : `Finalize Episode ${episodeNum} Scores`}
            </FijianPrimaryButton>
        </FijianCard>
    );
}
