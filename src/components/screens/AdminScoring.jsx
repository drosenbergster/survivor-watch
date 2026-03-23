import { useState, useMemo, useCallback, useEffect } from 'react';
import { useApp, getEffectiveTribeAssignments } from '../../AppContext';
import { ALL_CASTAWAYS, TRIBES, SCORE_EVENTS } from '../../data';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';
import { parseTDT } from '../../importers/parseTDT';
import { parseInsider, mergeInsiderIntoTDT } from '../../importers/parseInsider';
import { deriveGameEvents } from '../../importers/deriveGameEvents';
import { db as firebaseDb, functions } from '../../firebase';
import { ref, get } from 'firebase/database';
import { httpsCallable } from 'firebase/functions';

/* ── tiny reusable bits ─────────────────────────────────────── */

function Chip({ active, color, onClick, children }) {
    const base = 'px-3 py-1.5 rounded-lg text-xs font-sans transition-all';
    const activeClass = color === 'fire'
        ? 'bg-fire-400/90 text-white shadow-fire'
        : color === 'green'
            ? 'bg-green-500 text-white'
            : color === 'red'
                ? 'bg-red-500 text-white'
                : 'bg-ochre text-stone-950 font-bold';
    const inactiveClass = 'bg-stone-800 text-sand-warm/60 hover:bg-stone-700';
    return (
        <button onClick={onClick} className={`${base} ${active ? activeClass : inactiveClass}`}>
            {children}
        </button>
    );
}

function TribeChip({ tribeKey, active, onClick }) {
    const staticKey = Object.keys(TRIBES).find(k => k === tribeKey || TRIBES[k].name.toLowerCase() === tribeKey.toLowerCase());
    const displayName = TRIBES[staticKey]?.name || tribeKey;
    const colorKey = staticKey || tribeKey;
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${active
                ? 'border-fire-400 bg-fire-400/20 text-fire-400'
                : 'border-stone-600 bg-stone-800 text-sand-warm/60 hover:bg-stone-700'
                }`}
            style={!active ? { borderColor: `var(--color-${colorKey})`, color: `var(--color-${colorKey})` } : undefined}
        >
            {displayName}
        </button>
    );
}

function StepIndicator({ steps, current, onNavigate }) {
    return (
        <div className="flex gap-1.5 flex-wrap">
            {steps.map((s, i) => (
                <button
                    key={s.key}
                    onClick={() => onNavigate(s.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-all ${current === s.key
                        ? 'bg-ochre text-stone-950 font-bold'
                        : 'bg-stone-800 text-sand-warm/60 hover:bg-stone-700'
                        }`}
                >
                    {s.done ? '✓ ' : `${i + 1}. `}{s.label}
                </button>
            ))}
        </div>
    );
}

function SectionLabel({ children }) {
    return <h4 className="text-sand-warm/80 font-sans font-semibold text-sm">{children}</h4>;
}

function HelpText({ children }) {
    return <p className="text-sand-warm/50 text-xs font-sans">{children}</p>;
}

/* ── import panel ───────────────────────────────────────────── */

function ImportPanel({ onImport, eliminated }) {
    const [source, setSource] = useState('tdt');
    const [text, setText] = useState('');
    const [insiderText, setInsiderText] = useState('');
    const [parseResult, setParseResult] = useState(null);
    const [parseError, setParseError] = useState('');

    const handleParse = () => {
        setParseError('');
        setParseResult(null);

        if (!text.trim()) {
            setParseError('Paste the boxscore table or article text first.');
            return;
        }

        try {
            let result;
            if (source === 'tdt') {
                result = parseTDT(text, eliminated || []);
                if (insiderText.trim()) {
                    const insider = parseInsider(insiderText);
                    result = mergeInsiderIntoTDT(result, insider);
                    result._insiderData = insider;
                }
            } else {
                const insider = parseInsider(text);
                result = {
                    eliminatedId: insider.voteBreakdown?.bootId || (insider.medevacs[0] ?? null),
                    eliminationMethod: insider.medevacs.length > 0 ? 'medevac' : 'voted_out',
                    immunityWinners: insider.challengeWinners.immunity,
                    rewardWinners: insider.challengeWinners.reward,
                    isPostMerge: false,
                    minorityVoters: [],
                    receivedVotes: [],
                    bigMoments: {},
                    _insiderData: insider,
                };

                for (const id of insider.idolsFound) {
                    if (!result.bigMoments[id]) result.bigMoments[id] = [];
                    result.bigMoments[id].push('idol_found');
                }
                for (const id of insider.advantagesFound) {
                    if (!result.bigMoments[id]) result.bigMoments[id] = [];
                    result.bigMoments[id].push('advantage_found');
                }
            }

            if (result.error) {
                setParseError(result.error);
                return;
            }
            setParseResult(result);
        } catch (e) {
            setParseError(`Parse failed: ${e.message}`);
        }
    };

    const handleApply = () => {
        if (parseResult) onImport(parseResult);
    };

    const elim = parseResult?.eliminatedId
        ? ALL_CASTAWAYS.find(c => c.id === parseResult.eliminatedId)?.name
        : null;

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Chip active={source === 'tdt'} onClick={() => setSource('tdt')}>TrueDorkTimes</Chip>
                <Chip active={source === 'insider'} onClick={() => setSource('insider')}>InsideSurvivor</Chip>
            </div>

            <div className="space-y-2">
                <SectionLabel>
                    {source === 'tdt' ? 'Paste boxscore table' : 'Paste article text'}
                </SectionLabel>
                <HelpText>
                    {source === 'tdt'
                        ? 'Go to the TDT boxscore page, select the full table (including headers), copy, and paste here.'
                        : 'Go to the InsideSurvivor stats page, select all article text, copy, and paste here.'}
                </HelpText>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={source === 'tdt'
                        ? 'Contestant\tChW\tChA\tSO\tChW\t...'
                        : 'Episode 2 Stats\n\nHidden Immunity Idol/Advantage\n...'}
                    rows={6}
                    className="w-full bg-stone-800 text-sand-warm border border-stone-600 rounded-lg px-3 py-2 text-xs font-mono resize-y"
                />
            </div>

            {source === 'tdt' && (
                <div className="space-y-2">
                    <SectionLabel>InsideSurvivor supplement (optional)</SectionLabel>
                    <HelpText>Paste InsideSurvivor article to fill in idol/advantage info and confessionals.</HelpText>
                    <textarea
                        value={insiderText}
                        onChange={(e) => setInsiderText(e.target.value)}
                        placeholder="Optional: paste InsideSurvivor article text..."
                        rows={4}
                        className="w-full bg-stone-800 text-sand-warm border border-stone-600 rounded-lg px-3 py-2 text-xs font-mono resize-y"
                    />
                </div>
            )}

            <button
                onClick={handleParse}
                className="w-full py-2 rounded-lg bg-stone-700 hover:bg-stone-600 text-sand-warm text-sm font-sans transition-all"
            >
                Parse Data
            </button>

            {parseError && (
                <p className="text-red-400 text-sm font-sans">{parseError}</p>
            )}

            {parseResult && (
                <FijianCard className="p-4 bg-stone-900/60 space-y-3">
                    <h4 className="text-sand-warm/80 font-sans font-semibold text-xs uppercase tracking-wider">Parse Results</h4>
                    <div className="space-y-1 text-xs font-sans">
                        <div className="flex justify-between">
                            <span className="text-sand-warm/60">Eliminated:</span>
                            <span className={elim ? 'text-fire-400' : 'text-sand-warm/40'}>{elim || 'Not detected'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sand-warm/60">Method:</span>
                            <span className="text-sand-warm/80">{parseResult.eliminationMethod?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sand-warm/60">Immunity:</span>
                            <span className="text-sand-warm/80">
                                {parseResult.immunityWinners?.map(k => TRIBES[k]?.name || k).join(', ') || 'None detected'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sand-warm/60">Reward:</span>
                            <span className="text-sand-warm/80">
                                {parseResult.rewardWinners?.map(k => TRIBES[k]?.name || k).join(', ') || 'None detected'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sand-warm/60">Minority voters:</span>
                            <span className="text-sand-warm/80">
                                {parseResult.minorityVoters?.length > 0
                                    ? parseResult.minorityVoters.map(id => ALL_CASTAWAYS.find(c => c.id === id)?.name).join(', ')
                                    : 'None (unanimous)'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sand-warm/60">Survived w/ votes:</span>
                            <span className="text-sand-warm/80">
                                {parseResult.receivedVotes?.length > 0
                                    ? parseResult.receivedVotes.map(id => ALL_CASTAWAYS.find(c => c.id === id)?.name).join(', ')
                                    : 'None'}
                            </span>
                        </div>
                        {parseResult.bigMoments && Object.keys(parseResult.bigMoments).length > 0 && (
                            <div className="pt-1 border-t border-stone-700">
                                <span className="text-sand-warm/60">Big moments:</span>
                                {Object.entries(parseResult.bigMoments).map(([cid, events]) => (
                                    <div key={cid} className="text-sand-warm/80 ml-2">
                                        {ALL_CASTAWAYS.find(c => c.id === cid)?.name}: {events.join(', ')}
                                    </div>
                                ))}
                            </div>
                        )}
                        {parseResult._insiderData?.confessionals && Object.keys(parseResult._insiderData.confessionals).length > 0 && (
                            <div className="pt-1 border-t border-stone-700">
                                <span className="text-sand-warm/60">Confessionals:</span>
                                {Object.entries(parseResult._insiderData.confessionals)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([cid, count]) => (
                                        <span key={cid} className="text-sand-warm/80 ml-2">
                                            {ALL_CASTAWAYS.find(c => c.id === cid)?.name}: {count}
                                        </span>
                                    ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleApply}
                        className="w-full py-2 rounded-lg bg-fire-400/90 hover:bg-fire-400 text-white text-sm font-sans font-bold transition-all"
                    >
                        Apply to Scoring Form
                    </button>
                </FijianCard>
            )}
        </div>
    );
}

/* ── step 1: episode summary ────────────────────────────────── */

function EpisodeSummaryStep({
    remaining, remainingByTribe, eliminatedPick, setEliminatedPick,
    eliminationMethod, setEliminationMethod,
    immunityWinners, setImmunityWinners,
    rewardWinners, setRewardWinners,
    noReward, setNoReward,
    isPostMerge, setIsPostMerge,
}) {
    const toggleTribe = (list, setList, key) => {
        setList(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    const toggleContestant = (list, setList, id) => {
        setList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-5">
            <label className="flex items-center gap-2 text-xs text-sand-warm/60 font-sans cursor-pointer">
                <input
                    type="checkbox"
                    checked={isPostMerge}
                    onChange={(e) => setIsPostMerge(e.target.checked)}
                    className="rounded border-stone-600"
                />
                Post-merge (individual challenges)
            </label>

            <div className="space-y-3">
                <SectionLabel>Who was eliminated?</SectionLabel>
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
                        <HelpText>How?</HelpText>
                        <div className="flex gap-2 flex-wrap">
                            {[['voted_out', 'Voted Out'], ['medevac', 'Medevac'], ['quit', 'Quit'], ['fire', 'Fire-Making']].map(([val, label]) => (
                                <Chip key={val} active={eliminationMethod === val} color="fire" onClick={() => setEliminationMethod(val)}>
                                    {label}
                                </Chip>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <SectionLabel>Who won immunity?</SectionLabel>
                {!isPostMerge ? (
                    <>
                        <HelpText>Tap the tribe(s) that won immunity and are safe from tribal.</HelpText>
                        <div className="flex gap-2 flex-wrap">
                            {Object.keys(remainingByTribe).map(tk => (
                                <TribeChip
                                    key={tk}
                                    tribeKey={tk}
                                    active={immunityWinners.includes(tk)}
                                    onClick={() => toggleTribe(immunityWinners, setImmunityWinners, tk)}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <HelpText>Tap the player who won individual immunity.</HelpText>
                        <div className="flex flex-wrap gap-1.5">
                            {remaining.map(c => (
                                <Chip
                                    key={c.id}
                                    active={immunityWinners.includes(c.id)}
                                    color="fire"
                                    onClick={() => toggleContestant(immunityWinners, setImmunityWinners, c.id)}
                                >
                                    {c.name}
                                </Chip>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <SectionLabel>Who won reward?</SectionLabel>
                    <label className="flex items-center gap-1.5 text-xs text-sand-warm/60 font-sans cursor-pointer">
                        <input
                            type="checkbox"
                            checked={noReward}
                            onChange={(e) => setNoReward(e.target.checked)}
                            className="rounded border-stone-600"
                        />
                        No reward this episode
                    </label>
                </div>
                {!noReward && !isPostMerge && (
                    <>
                        <HelpText>Tap the tribe(s) that won the reward challenge.</HelpText>
                        <div className="flex gap-2 flex-wrap">
                            {Object.keys(remainingByTribe).map(tk => (
                                <TribeChip
                                    key={tk}
                                    tribeKey={tk}
                                    active={rewardWinners.includes(tk)}
                                    onClick={() => toggleTribe(rewardWinners, setRewardWinners, tk)}
                                />
                            ))}
                        </div>
                    </>
                )}
                {!noReward && isPostMerge && (
                    <>
                        <HelpText>Tap the player(s) who won individual reward.</HelpText>
                        <div className="flex flex-wrap gap-1.5">
                            {remaining.map(c => (
                                <Chip
                                    key={c.id}
                                    active={rewardWinners.includes(c.id)}
                                    color="fire"
                                    onClick={() => toggleContestant(rewardWinners, setRewardWinners, c.id)}
                                >
                                    {c.name}
                                </Chip>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

/* ── step 2: tribal council ─────────────────────────────────── */

function TribalCouncilStep({
    eliminatedPick, unanimousVote, setUnanimousVote,
    minorityVoters, setMinorityVoters,
    receivedVotes, setReceivedVotes,
    tribalAttendees,
}) {
    if (!eliminatedPick) {
        return (
            <div className="space-y-3">
                <SectionLabel>Tribal Council</SectionLabel>
                <HelpText>No elimination selected -- skip this step or go back and pick one.</HelpText>
            </div>
        );
    }

    const elimName = ALL_CASTAWAYS.find(c => c.id === eliminatedPick)?.name || 'Unknown';
    const attendees = tribalAttendees.filter(id => id !== eliminatedPick);

    const toggleMinority = (id) => {
        setMinorityVoters(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleReceived = (id) => {
        setReceivedVotes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-5">
            <SectionLabel>Tribal Council</SectionLabel>
            <HelpText>
                {attendees.length} players attended tribal. {elimName} was eliminated.
            </HelpText>

            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <span className="text-sm text-sand-warm/80 font-sans">Did everyone vote for {elimName}?</span>
                    <div className="flex gap-1.5">
                        <Chip active={unanimousVote} color="green" onClick={() => setUnanimousVote(true)}>Yes</Chip>
                        <Chip active={!unanimousVote} color="red" onClick={() => setUnanimousVote(false)}>No</Chip>
                    </div>
                </div>

                {!unanimousVote && (
                    <div className="space-y-2">
                        <HelpText>Who voted WRONG? (did NOT vote for {elimName})</HelpText>
                        <div className="flex flex-wrap gap-1.5">
                            {attendees.map(id => {
                                const c = ALL_CASTAWAYS.find(x => x.id === id);
                                return c ? (
                                    <Chip key={id} active={minorityVoters.includes(id)} color="fire" onClick={() => toggleMinority(id)}>
                                        {c.name}
                                    </Chip>
                                ) : null;
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <SectionLabel>Did anyone survive with votes against them?</SectionLabel>
                <HelpText>Tap anyone who received votes but was NOT eliminated.</HelpText>
                <div className="flex flex-wrap gap-1.5">
                    {attendees.map(id => {
                        const c = ALL_CASTAWAYS.find(x => x.id === id);
                        return c ? (
                            <Chip key={id} active={receivedVotes.includes(id)} color="fire" onClick={() => toggleReceived(id)}>
                                {c.name}
                            </Chip>
                        ) : null;
                    })}
                </div>
            </div>
        </div>
    );
}

/* ── step 3: big moments ────────────────────────────────────── */

const MOMENT_GROUPS = [
    {
        label: 'Idols & Advantages',
        events: ['idol_found', 'idol_played_success', 'advantage_found', 'advantage_used', 'find_clue', 'shot_in_dark'],
    },
    {
        label: 'Camp Life & Journeys',
        events: ['read_tree_mail', 'water_well_talk', 'make_fire_camp', 'find_food', 'journey', 'journey_challenge_win', 'supply_challenge_win', 'marooning_win'],
    },
    {
        label: 'Milestones',
        events: ['exile', 'merge', 'ftc', 'fire_making_win', 'winner', 'medevac'],
    },
];

function BigMomentsStep({ remaining, bigMoments, setBigMoments }) {
    const [expanded, setExpanded] = useState(() => {
        return Object.keys(bigMoments).length > 0 ? MOMENT_GROUPS.map((_, i) => i) : [];
    });

    const toggleExpand = (idx) => {
        setExpanded(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    };

    const toggleMoment = (eventKey, contestantId) => {
        setBigMoments(prev => {
            const current = { ...prev };
            if (!current[contestantId]) current[contestantId] = [];
            if (current[contestantId].includes(eventKey)) {
                current[contestantId] = current[contestantId].filter(e => e !== eventKey);
                if (current[contestantId].length === 0) delete current[contestantId];
            } else {
                current[contestantId] = [...current[contestantId], eventKey];
            }
            return current;
        });
    };

    const momentCount = Object.values(bigMoments).reduce((s, arr) => s + arr.length, 0);

    return (
        <div className="space-y-4">
            <SectionLabel>Big Moments</SectionLabel>
            <HelpText>
                {momentCount === 0
                    ? 'Most episodes have none. Expand a section only if something happened.'
                    : `${momentCount} moment${momentCount !== 1 ? 's' : ''} assigned.`}
            </HelpText>

            {MOMENT_GROUPS.map((group, idx) => (
                <div key={idx} className="rounded-lg border border-stone-700 overflow-hidden">
                    <button
                        onClick={() => toggleExpand(idx)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-stone-800 hover:bg-stone-700 transition-colors"
                    >
                        <span className="text-sm text-sand-warm/80 font-sans font-semibold">{group.label}</span>
                        <span className="text-sand-warm/40 text-xs">
                            {expanded.includes(idx) ? '▾' : '▸'}
                        </span>
                    </button>
                    {expanded.includes(idx) && (
                        <div className="p-3 space-y-3 bg-stone-900/40">
                            {group.events.map(eventKey => {
                                const evt = SCORE_EVENTS.find(e => e.key === eventKey);
                                if (!evt) return null;
                                return (
                                    <div key={eventKey} className="space-y-1.5">
                                        <p className="text-xs text-sand-warm/60 font-sans">
                                            {evt.emoji} {evt.label} <span className="text-ochre">+{evt.points}</span>
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {remaining.map(c => (
                                                <Chip
                                                    key={c.id}
                                                    active={bigMoments[c.id]?.includes(eventKey)}
                                                    color="fire"
                                                    onClick={() => toggleMoment(eventKey, c.id)}
                                                >
                                                    {c.name}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ── step 4: prop bets + side bets ──────────────────────────── */

function BetResultsStep({ propBets, propBetResults, setPropBetResults, sideBets, sideBetResults, setSideBetResults }) {
    if (propBets.length === 0 && sideBets.length === 0) {
        return (
            <div className="space-y-3">
                <SectionLabel>Bet Results</SectionLabel>
                <HelpText>No Tree Mail or Tribal Whispers this episode.</HelpText>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {propBets.length > 0 && (
                <div className="space-y-3">
                    <SectionLabel>Tree Mail Outcomes</SectionLabel>
                    <HelpText>Did this happen? Mark YES or NO.</HelpText>
                    {propBets.map(prop => {
                        const result = propBetResults[prop.id];
                        return (
                            <div key={prop.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-stone-800 text-sm font-sans">
                                <span className="flex-1 text-sand-warm/80">{prop.text}</span>
                                <div className="flex gap-1 shrink-0">
                                    <Chip active={result === true} color="green" onClick={() => setPropBetResults(prev => ({ ...prev, [prop.id]: true }))}>YES</Chip>
                                    <Chip active={result === false} color="red" onClick={() => setPropBetResults(prev => ({ ...prev, [prop.id]: false }))}>NO</Chip>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {sideBets.length > 0 && (
                <div className="space-y-3">
                    <SectionLabel>Tribal Whisper Outcomes</SectionLabel>
                    <HelpText>Mark YES or NO.</HelpText>
                    {sideBets.map(bet => {
                        const result = sideBetResults[bet.id];
                        return (
                            <div key={bet.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-stone-800 text-sm font-sans">
                                <span className="flex-1 text-sand-warm/80">{bet.text}</span>
                                <div className="flex gap-1 shrink-0">
                                    <Chip active={result === true} color="green" onClick={() => setSideBetResults(prev => ({ ...prev, [bet.id]: true }))}>YES</Chip>
                                    <Chip active={result === false} color="red" onClick={() => setSideBetResults(prev => ({ ...prev, [bet.id]: false }))}>NO</Chip>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ── step 5: review ─────────────────────────────────────────── */

function ReviewStep({ derivedEvents, eliminatedPick, eliminationMethod, remaining }) {
    const { gameEvents } = derivedEvents;
    const scoreMap = Object.fromEntries(SCORE_EVENTS.map(e => [e.key, e]));

    const elimContestant = eliminatedPick ? ALL_CASTAWAYS.find(c => c.id === eliminatedPick) : null;

    const contestantRows = remaining
        .filter(c => gameEvents[c.id]?.length > 0)
        .map(c => {
            const events = gameEvents[c.id] || [];
            const points = events.reduce((sum, key) => sum + (scoreMap[key]?.points || 0), 0);
            return { ...c, events, points };
        })
        .sort((a, b) => b.points - a.points);

    const totalEvents = Object.values(gameEvents).reduce((s, arr) => s + arr.length, 0);

    return (
        <div className="space-y-4">
            <SectionLabel>Review Derived Events</SectionLabel>
            <HelpText>
                {totalEvents} events derived for {contestantRows.length} contestants. Verify before finalizing.
            </HelpText>

            {elimContestant && (
                <div className="px-4 py-2 rounded-lg bg-fire-400/10 border border-fire-400/30 text-fire-400 text-sm font-sans">
                    {elimContestant.name} eliminated ({eliminationMethod.replace('_', ' ')})
                    {gameEvents[elimContestant.id]?.length > 0 && (
                        <span className="text-sand-warm/60 ml-2">
                            [{gameEvents[elimContestant.id].map(k => scoreMap[k]?.label || k).join(', ')}]
                        </span>
                    )}
                </div>
            )}

            <div className="space-y-1 max-h-80 overflow-y-auto">
                {contestantRows.map(c => (
                    <div key={c.id} className="flex items-start gap-2 px-3 py-2 rounded bg-stone-800/60 text-xs font-sans">
                        <span className="text-sand-warm/80 font-semibold w-28 shrink-0">{c.name}</span>
                        <span className="text-sand-warm/50 flex-1">
                            {c.events.map(k => scoreMap[k]?.emoji + ' ' + (scoreMap[k]?.label || k)).join(' · ')}
                        </span>
                        <span className="text-ochre font-bold shrink-0">+{c.points}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── main component ─────────────────────────────────────────── */

export default function AdminScoring({ episodeNum }) {
    const { user, league, episodes, eliminated, scoreEpisodeAction, tribeSwaps } = useApp();
    const episodeData = episodes?.[episodeNum] || null;
    const tribeOverrides = useMemo(() => getEffectiveTribeAssignments(tribeSwaps, episodeNum), [tribeSwaps, episodeNum]);

    const [expanded, setExpanded] = useState(false);

    // Input mode
    const [mode, setMode] = useState('manual'); // 'manual' | 'import'

    // Step 1: Episode Summary
    const [eliminatedPick, setEliminatedPick] = useState('');
    const [eliminationMethod, setEliminationMethod] = useState('voted_out');
    const [immunityWinners, setImmunityWinners] = useState([]);
    const [rewardWinners, setRewardWinners] = useState([]);
    const [noReward, setNoReward] = useState(false);
    const [isPostMerge, setIsPostMerge] = useState(false);

    // Step 2: Tribal Council
    const [unanimousVote, setUnanimousVote] = useState(true);
    const [minorityVoters, setMinorityVoters] = useState([]);
    const [receivedVotes, setReceivedVotes] = useState([]);

    // Step 3: Big Moments
    const [bigMoments, setBigMoments] = useState({});

    // Step 4: Bets
    const [propBetResults, setPropBetResults] = useState({});
    const [sideBetResultsState, setSideBetResultsState] = useState({});

    // Navigation
    const [step, setStep] = useState('summary');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Auto-import
    const [autoImportStatus, setAutoImportStatus] = useState('idle'); // 'idle' | 'loading' | 'loaded' | 'fetching' | 'error'
    const [autoImportSource, setAutoImportSource] = useState(null);
    const [autoImportApplied, setAutoImportApplied] = useState(false);

    const isAdmin = league?.createdBy === user?.uid;
    const propBets = episodeData?.propBets || [];
    const sideBets = episodeData?.sideBets || [];
    const isAutoScored = episodeData?.scored && episodeData?.scoredAt;

    const remaining = useMemo(() => {
        const elimSet = new Set(eliminated || []);
        return ALL_CASTAWAYS.filter(c => !elimSet.has(c.id));
    }, [eliminated]);

    const remainingByTribe = useMemo(() => {
        const result = {};
        const elimSet = new Set(eliminated || []);
        if (tribeOverrides) {
            for (const [tribeName, memberIds] of Object.entries(tribeOverrides)) {
                const members = (memberIds || [])
                    .filter(id => !elimSet.has(id))
                    .map(id => ALL_CASTAWAYS.find(c => c.id === id))
                    .filter(Boolean);
                const tribeKey = Object.keys(TRIBES).find(k => TRIBES[k].name.toLowerCase() === tribeName.toLowerCase()) || tribeName.toLowerCase();
                if (members.length > 0) result[tribeKey] = members;
            }
        } else {
            for (const [tribeKey, tribe] of Object.entries(TRIBES)) {
                const members = tribe.members.filter(c => !elimSet.has(c.id));
                if (members.length > 0) result[tribeKey] = members;
            }
        }
        return result;
    }, [eliminated, tribeOverrides]);

    // Auto-load imported stats from RTDB on mount
    useEffect(() => {
        if (!firebaseDb || !episodeNum || autoImportApplied) return;
        setAutoImportStatus('loading');

        const importRef = ref(firebaseDb, `seasons/s50/autoImport/e${episodeNum}`);
        get(importRef).then(snap => {
            if (snap.exists()) {
                const data = snap.val();
                setAutoImportSource(data.source || 'unknown');
                applyAutoImport(data);
                setAutoImportStatus('loaded');
                setAutoImportApplied(true);
            } else {
                setAutoImportStatus('idle');
            }
        }).catch(() => {
            setAutoImportStatus('idle');
        });
    }, [episodeNum, autoImportApplied]); // eslint-disable-line react-hooks/exhaustive-deps

    const applyAutoImport = useCallback((data) => {
        if (data.eliminatedId) setEliminatedPick(data.eliminatedId);
        if (data.eliminationMethod) setEliminationMethod(data.eliminationMethod);
        if (data.immunityWinners?.length) setImmunityWinners(data.immunityWinners);
        if (data.rewardWinners?.length) setRewardWinners(data.rewardWinners);
        if (data.isPostMerge) setIsPostMerge(true);
        if (data.minorityVoters?.length) {
            setUnanimousVote(false);
            setMinorityVoters(data.minorityVoters);
        }
        if (data.receivedVotes?.length) setReceivedVotes(data.receivedVotes);
        if (data.bigMoments && Object.keys(data.bigMoments).length > 0) setBigMoments(data.bigMoments);
        setStep('review');
    }, []);

    const handleFetchNow = useCallback(async () => {
        if (!functions) return;
        setAutoImportStatus('fetching');
        setError('');
        try {
            const callable = httpsCallable(functions, 'fetchEpisodeStatsManual');
            const result = await callable({ episodeNum, force: true });
            if (result.data?.success) {
                const importRef = ref(firebaseDb, `seasons/s50/autoImport/e${episodeNum}`);
                const snap = await get(importRef);
                if (snap.exists()) {
                    const data = snap.val();
                    setAutoImportSource(data.source || 'unknown');
                    applyAutoImport(data);
                    setAutoImportStatus('loaded');
                    setAutoImportApplied(true);
                }
            } else if (result.data?.skipped) {
                setError(result.data.reason || 'Stats not available yet');
                setAutoImportStatus('idle');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch stats');
            setAutoImportStatus('error');
        }
    }, [episodeNum, applyAutoImport]);

    // Compute tribal attendees from eliminated pick's tribe (pre-merge) or everyone (post-merge)
    const tribalAttendees = useMemo(() => {
        if (!eliminatedPick) return [];
        if (isPostMerge) {
            const ids = remaining.map(c => c.id);
            if (!ids.includes(eliminatedPick)) ids.push(eliminatedPick);
            return ids;
        }
        const elimSet = new Set(eliminated || []);
        if (tribeOverrides) {
            for (const [, memberIds] of Object.entries(tribeOverrides)) {
                if (Array.isArray(memberIds) && memberIds.includes(eliminatedPick)) {
                    const members = memberIds.filter(id => !elimSet.has(id));
                    if (!members.includes(eliminatedPick)) members.push(eliminatedPick);
                    return members;
                }
            }
        }
        for (const [, tribe] of Object.entries(TRIBES)) {
            if (tribe.members.some(m => m.id === eliminatedPick)) {
                const members = tribe.members.filter(c => !elimSet.has(c.id)).map(c => c.id);
                if (!members.includes(eliminatedPick)) members.push(eliminatedPick);
                return members;
            }
        }
        return remaining.map(c => c.id);
    }, [eliminatedPick, eliminated, remaining, isPostMerge, tribeOverrides]);

    const derivedEvents = useMemo(() => {
        return deriveGameEvents({
            eliminatedId: eliminatedPick || null,
            eliminationMethod,
            immunityWinners,
            rewardWinners: noReward ? [] : rewardWinners,
            isPostMerge,
            minorityVoters: unanimousVote ? [] : minorityVoters,
            receivedVotes,
            bigMoments,
            remaining,
            tribeOverrides,
        });
    }, [eliminatedPick, eliminationMethod, immunityWinners, rewardWinners, noReward,
        unanimousVote, minorityVoters, receivedVotes, bigMoments, remaining, tribeOverrides]);

    const handleImport = useCallback((parsed) => {
        if (parsed.eliminatedId) setEliminatedPick(parsed.eliminatedId);
        if (parsed.eliminationMethod) setEliminationMethod(parsed.eliminationMethod);
        if (parsed.immunityWinners?.length) setImmunityWinners(parsed.immunityWinners);
        if (parsed.rewardWinners?.length) setRewardWinners(parsed.rewardWinners);
        if (parsed.minorityVoters?.length) {
            setUnanimousVote(false);
            setMinorityVoters(parsed.minorityVoters);
        } else {
            setUnanimousVote(true);
            setMinorityVoters([]);
        }
        if (parsed.receivedVotes?.length) setReceivedVotes(parsed.receivedVotes);
        if (parsed.bigMoments && Object.keys(parsed.bigMoments).length > 0) setBigMoments(parsed.bigMoments);
        setMode('manual');
        setStep('review');
    }, []);

    const handleScore = async () => {
        setError('');
        setSaving(true);
        try {
            const { gameEvents } = derivedEvents;
            const eliminatedThisEp = eliminatedPick ? [eliminatedPick] : [];

            await scoreEpisodeAction(episodeNum, {
                gameEvents,
                propBetResults,
                sideBetResults: sideBetResultsState,
                eliminatedThisEp,
                eliminationMethod,
            });
        } catch (err) {
            setError(err.message || 'Failed to score episode');
        }
        setSaving(false);
    };

    if (!isAdmin) return null;
    if (episodeData?.status !== 'open' && !isAutoScored) return null;

    // Auto-scored compact banner (episode already scored)
    if (isAutoScored && !expanded) {
        const elimName = episodeData.eliminatedThisEp?.[0]
            ? ALL_CASTAWAYS.find(c => c.id === episodeData.eliminatedThisEp[0])?.name
            : null;
        return (
            <FijianCard className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon name="auto_awesome" className="text-green-400 text-lg" />
                        <span className="text-green-400 text-sm font-sans font-semibold">Episode auto-scored</span>
                    </div>
                    <button
                        onClick={() => setExpanded(true)}
                        className="text-xs text-sand-warm/50 hover:text-sand-warm font-sans underline"
                    >
                        Review / Adjust
                    </button>
                </div>
                <div className="text-xs text-sand-warm/60 font-sans flex flex-wrap gap-x-4 gap-y-1">
                    {elimName && <span>Eliminated: <span className="text-fire-400">{elimName}</span></span>}
                    <span>Method: {episodeData.eliminationMethod?.replace('_', ' ') || 'voted out'}</span>
                </div>
            </FijianCard>
        );
    }

    if (episodeData?.scored && !expanded) return null;

    const hasBets = propBets.length > 0 || sideBets.length > 0;

    const steps = [
        { key: 'summary', label: 'Episode', done: !!eliminatedPick || immunityWinners.length > 0 },
        { key: 'tribal', label: 'Tribal', done: eliminatedPick && (unanimousVote || minorityVoters.length > 0) },
        { key: 'moments', label: 'Moments', done: Object.keys(bigMoments).length > 0 },
        ...(hasBets ? [{ key: 'bets', label: 'Bets', done: Object.keys(propBetResults).length > 0 }] : []),
        { key: 'review', label: 'Review', done: false },
    ];

    return (
        <FijianCard className="p-5 space-y-5">
            <div className="flex items-center justify-between">
                <FijianSectionHeader title={`Score Episode ${episodeNum}`} />
                {isAutoScored && (
                    <button
                        onClick={() => setExpanded(false)}
                        className="text-xs text-sand-warm/50 hover:text-sand-warm font-sans"
                    >
                        <Icon name="close" className="text-base" />
                    </button>
                )}
            </div>

            {autoImportStatus === 'loaded' && (
                <div className="px-4 py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-sans flex items-center gap-2">
                    <span>Stats auto-imported from {autoImportSource}. Review and finalize.</span>
                </div>
            )}

            {autoImportStatus === 'loading' && (
                <div className="px-4 py-2 rounded-lg bg-stone-800 text-sand-warm/50 text-xs font-sans">
                    Checking for auto-imported stats...
                </div>
            )}

            <div className="flex gap-2 mb-2 flex-wrap">
                <Chip active={mode === 'manual'} onClick={() => setMode('manual')}>Manual</Chip>
                <Chip active={mode === 'import'} onClick={() => setMode('import')}>Import</Chip>
                {functions && (
                    <button
                        onClick={handleFetchNow}
                        disabled={autoImportStatus === 'fetching'}
                        className="px-3 py-1.5 rounded-lg text-xs font-sans transition-all bg-stone-800 text-sand-warm/60 hover:bg-stone-700 disabled:opacity-50"
                    >
                        {autoImportStatus === 'fetching' ? 'Fetching...' : 'Fetch Stats Now'}
                    </button>
                )}
            </div>

            {mode === 'import' ? (
                <ImportPanel onImport={handleImport} eliminated={eliminated} />
            ) : (
                <>
                    <StepIndicator steps={steps} current={step} onNavigate={setStep} />

                    {step === 'summary' && (
                        <EpisodeSummaryStep
                            remaining={remaining}
                            remainingByTribe={remainingByTribe}
                            eliminatedPick={eliminatedPick}
                            setEliminatedPick={setEliminatedPick}
                            eliminationMethod={eliminationMethod}
                            setEliminationMethod={setEliminationMethod}
                            immunityWinners={immunityWinners}
                            setImmunityWinners={setImmunityWinners}
                            rewardWinners={rewardWinners}
                            setRewardWinners={setRewardWinners}
                            noReward={noReward}
                            setNoReward={setNoReward}
                            isPostMerge={isPostMerge}
                            setIsPostMerge={setIsPostMerge}
                        />
                    )}

                    {step === 'tribal' && (
                        <TribalCouncilStep
                            eliminatedPick={eliminatedPick}
                            remaining={remaining}
                            unanimousVote={unanimousVote}
                            setUnanimousVote={setUnanimousVote}
                            minorityVoters={minorityVoters}
                            setMinorityVoters={setMinorityVoters}
                            receivedVotes={receivedVotes}
                            setReceivedVotes={setReceivedVotes}
                            tribalAttendees={tribalAttendees}
                        />
                    )}

                    {step === 'moments' && (
                        <BigMomentsStep
                            remaining={remaining}
                            bigMoments={bigMoments}
                            setBigMoments={setBigMoments}
                        />
                    )}

                    {step === 'bets' && (
                        <BetResultsStep
                            propBets={propBets}
                            propBetResults={propBetResults}
                            setPropBetResults={setPropBetResults}
                            sideBets={sideBets}
                            sideBetResults={sideBetResultsState}
                            setSideBetResults={setSideBetResultsState}
                        />
                    )}

                    {step === 'review' && (
                        <ReviewStep
                            derivedEvents={derivedEvents}
                            eliminatedPick={eliminatedPick}
                            eliminationMethod={eliminationMethod}
                            remaining={remaining}
                        />
                    )}

                    <div className="flex gap-2 pt-2">
                        {step !== 'summary' && (
                            <button
                                onClick={() => {
                                    const idx = steps.findIndex(s => s.key === step);
                                    if (idx > 0) setStep(steps[idx - 1].key);
                                }}
                                className="flex-1 py-2 rounded-lg bg-stone-700 hover:bg-stone-600 text-sand-warm text-sm font-sans transition-all"
                            >
                                Back
                            </button>
                        )}
                        {step !== 'review' ? (
                            <button
                                onClick={() => {
                                    const idx = steps.findIndex(s => s.key === step);
                                    if (idx < steps.length - 1) setStep(steps[idx + 1].key);
                                }}
                                className="flex-1 py-2 rounded-lg bg-ochre hover:bg-ochre/80 text-stone-950 text-sm font-sans font-bold transition-all"
                            >
                                Next
                            </button>
                        ) : (
                            <FijianPrimaryButton
                                onClick={handleScore}
                                disabled={saving}
                                className="flex-1"
                            >
                                <Icon name="check_circle" />
                                {saving ? 'Scoring...' : `Finalize Episode ${episodeNum}`}
                            </FijianPrimaryButton>
                        )}
                    </div>
                </>
            )}

            {error && (
                <p className="text-red-400 text-sm font-sans" role="alert">{error}</p>
            )}
        </FijianCard>
    );
}
