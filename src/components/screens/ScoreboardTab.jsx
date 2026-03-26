import { useState, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { computeStandings, detectAchievements } from '../../scoring';
import { SCORE_EVENTS, ALL_CASTAWAYS, PLAYER_COLORS, ACHIEVEMENT_MAP } from '../../data';
import { FijianCard, FijianSectionHeader, Icon, HintBadge } from '../fijian';
import BingoCard from './BingoCard';

const MILESTONE_KEYS = ['winner', 'ftc', 'merge', 'idol_played_success', 'fire_making_win', 'individual_immunity', 'advantage_used'];
const MEDIUM_KEYS = ['individual_reward', 'idol_found', 'survived_with_votes', 'advantage_found', 'exile'];
const SCORE_EVENT_MAP = Object.fromEntries(SCORE_EVENTS.map(e => [e.key, e]));

function RankBadge({ rank }) {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-lg text-sand-warm/60 font-bold font-sans">#{rank}</span>;
}

function StandingsRow({ entry, rank, memberName, color, expanded, onToggle, perEpisode, leagueId, bingo, isCurrentUser, playerRideOrDies, playerBadges }) {
    const epNums = Object.keys(perEpisode || {}).map(Number).sort((a, b) => a - b);
    const [episodesOpen, setEpisodesOpen] = useState(false);
    const [badgesOpen, setBadgesOpen] = useState(false);

    return (
        <div className="space-y-0">
            <button
                onClick={onToggle}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${expanded ? 'bg-stone-800/80' : 'hover:bg-stone-800/50'
                    }`}
            >
                <RankBadge rank={rank} />

                <div className={`w-2 h-8 rounded-full ${color?.bg || 'bg-ochre'}`} />

                <div className="flex-1 text-left">
                    <p className="font-sans font-bold text-sand-warm text-sm">{memberName}</p>
                    <div className="flex gap-3 text-xs text-sand-warm/50 font-sans">
                        <span>W:{entry.weekly}</span>
                        <span>P:{entry.predictions}</span>
                        <span>R:{entry.rideOrDie}</span>
                        {entry.bingo > 0 && <span>B:{entry.bingo}</span>}
                        {entry.social > 0 && <span>S:{entry.social}</span>}
                    </div>
                </div>

                <div className="text-right">
                    <p className="font-display text-2xl text-ochre tracking-wider">{entry.total}</p>
                    <p className="text-[10px] text-sand-warm/60 font-sans uppercase">pts</p>
                </div>

                <Icon
                    name="expand_more"
                    className={`text-sand-warm/60 transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
            </button>

            {expanded && (
                <div className="ml-12 mr-3 pb-3 space-y-3">
                    <div className="grid grid-cols-5 gap-2 text-center">
                        <ScoreBox label="Weekly" value={entry.weekly} color="text-fire-400" />
                        <ScoreBox label="Predict" value={entry.predictions} color="text-green-400" />
                        <ScoreBox label="RoD" value={entry.rideOrDie} color="text-sky-400" />
                        <ScoreBox label="Bingo" value={entry.bingo || 0} color="text-purple-400" />
                        <ScoreBox label="Social" value={entry.social || 0} color="text-amber-400" />
                    </div>

                    {playerRideOrDies.length > 0 && (
                        <div>
                            <p className="text-xs text-sand-warm/50 font-sans font-semibold mb-1">Ride or Dies</p>
                            <div className="flex gap-1.5 flex-wrap">
                                {playerRideOrDies.map(cId => {
                                    const c = ALL_CASTAWAYS.find(x => x.id === cId);
                                    return (
                                        <span key={cId} className="flex items-center gap-1.5 bg-stone-800/50 text-sand-warm/70 text-xs px-2 py-1 rounded font-sans">
                                            <Icon name="handshake" className="text-sky-400 text-[10px]" />
                                            {c?.name || cId}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Episodes — caret dropdown */}
                    {epNums.length > 0 && (
                        <div>
                            <button
                                onClick={() => setEpisodesOpen(e => !e)}
                                className="flex items-center gap-1.5 w-full text-left"
                            >
                                <span className="text-xs text-sand-warm/50 font-sans font-semibold flex-1">
                                    Per Episode ({epNums.length})
                                </span>
                                <Icon
                                    name="expand_more"
                                    className={`text-sand-warm/40 text-sm transition-transform ${episodesOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {episodesOpen && (
                                <div className="mt-1.5 space-y-2">
                                    {epNums.map(epNum => {
                                        const epScore = perEpisode[epNum]?.[entry.uid];
                                        if (!epScore) return null;
                                        const bingoSeed = isCurrentUser ? `${leagueId}-${epNum}-${entry.uid}` : null;
                                        const bingoMarked = isCurrentUser ? bingo?.[epNum]?.[entry.uid] : null;
                                        return (
                                            <EpisodeBreakdown
                                                key={epNum}
                                                epNum={epNum}
                                                score={epScore}
                                                bingoSeed={bingoSeed}
                                                bingoMarked={bingoMarked}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Badges — caret dropdown */}
                    {playerBadges.length > 0 && (
                        <div>
                            <button
                                onClick={() => setBadgesOpen(b => !b)}
                                className="flex items-center gap-1.5 w-full text-left"
                            >
                                <span className="text-xs text-sand-warm/50 font-sans font-semibold flex-1">
                                    Badges ({playerBadges.length})
                                </span>
                                <Icon
                                    name="expand_more"
                                    className={`text-sand-warm/40 text-sm transition-transform ${badgesOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {badgesOpen && (
                                <div className="mt-1.5 space-y-1">
                                    {playerBadges.map(b => (
                                        <div key={b.id} className="flex items-start gap-1.5 text-xs font-sans py-0.5">
                                            <span className="text-sand-warm/70 font-medium">{b.name}</span>
                                            <span className="text-sand-warm/30">&mdash; {b.description}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ScoreBox({ label, value, color }) {
    return (
        <div className="bg-stone-800/60 rounded-lg p-2">
            <p className={`font-display text-lg ${color}`}>{value}</p>
            <p className="text-[10px] text-sand-warm/60 font-sans">{label}</p>
        </div>
    );
}

function EpisodeBreakdown({ epNum, score, bingoSeed, bingoMarked }) {
    const [open, setOpen] = useState(false);
    const [showBingo, setShowBingo] = useState(false);

    const hasDetails = score.breakdown.weekly.length > 0
        || score.breakdown.predictions.length > 0
        || score.breakdown.rideOrDie.length > 0
        || (score.breakdown.bingo || []).length > 0
        || (score.breakdown.social || []).length > 0;

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-3 py-2 bg-stone-900/60 rounded-lg hover:bg-stone-900/80 transition-all"
            >
                <div className="flex items-center gap-2">
                    <span className="text-xs font-sans text-sand-warm/70">Ep {epNum}</span>
                    <Icon
                        name="expand_more"
                        className={`text-sand-warm/40 text-xs transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                </div>
                <span className="text-ochre font-bold text-xs font-sans">{score.total} pts</span>
            </button>

            {open && (
                <div className="px-3 py-2 space-y-2 text-xs font-sans">
                    {/* Episode scoring summary */}
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                        <EpSummaryCell label="W" value={score.weekly} color="text-fire-400" />
                        <EpSummaryCell label="P" value={score.predictions} color="text-green-400" />
                        <EpSummaryCell label="R" value={score.rideOrDie} color="text-sky-400" />
                        <EpSummaryCell label="B" value={score.bingo || 0} color="text-purple-400" />
                        <EpSummaryCell label="S" value={score.social || 0} color="text-amber-400" />
                    </div>

                    {/* Line item details grouped by category */}
                    {hasDetails ? (
                        <div className="space-y-2 pt-1 border-t border-stone-700/30">
                            {score.breakdown.weekly.length > 0 && (
                                <div>
                                    <p className="text-fire-400/70 text-[10px] font-bold uppercase tracking-wider mb-0.5">Weekly Picks</p>
                                    {score.breakdown.weekly.map((w, i) => (
                                        <div key={i} className="flex justify-between text-sand-warm/60 py-0.5">
                                            <span>
                                                {w.name}
                                                {w.scarcityBonus && <span className="text-ochre ml-1">×1.5</span>}
                                            </span>
                                            <span className="text-fire-400">+{w.points}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {score.breakdown.predictions.length > 0 && (
                                <div>
                                    <p className="text-green-400/70 text-[10px] font-bold uppercase tracking-wider mb-0.5">Predictions</p>
                                    {score.breakdown.predictions.map((p, i) => (
                                        <div key={`p${i}`} className="flex justify-between text-sand-warm/60 py-0.5">
                                            <span>
                                                {p.type === 'propBet' && `Tree Mail — ${p.text}`}
                                                {p.type === 'snapVote' && 'Snap vote correct'}
                                                {p.type === 'sideBet' && `Tribal Whisper — ${p.text}`}
                                            </span>
                                            <span className="text-green-400">+{p.points}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {score.breakdown.rideOrDie.length > 0 && (
                                <div>
                                    <p className="text-sky-400/70 text-[10px] font-bold uppercase tracking-wider mb-0.5">Ride or Die</p>
                                    {score.breakdown.rideOrDie.map((r, i) => (
                                        <div key={`r${i}`} className="flex justify-between text-sand-warm/60 py-0.5">
                                            <span>
                                                {r.name}
                                                {r.reason === 'events' && ' — game events'}
                                                {r.reason === 'survived' && ' — survived'}
                                                {r.reason === 'ftc' && ' — made FTC'}
                                                {r.reason === 'winner' && ' — won!'}
                                            </span>
                                            <span className="text-sky-400">+{r.points}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {(score.breakdown.bingo || []).length > 0 && (
                                <div>
                                    <p className="text-purple-400/70 text-[10px] font-bold uppercase tracking-wider mb-0.5">Bingo</p>
                                    {(score.breakdown.bingo || []).map((b, i) => (
                                        <div key={`b${i}`} className="flex justify-between text-sand-warm/60 py-0.5">
                                            <span>
                                                {b.type === 'lines' && `${b.count} ${b.count === 1 ? 'line' : 'lines'} completed`}
                                                {b.type === 'blackout' && 'Full blackout'}
                                            </span>
                                            <span className="text-purple-400">+{b.points}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {(score.breakdown.social || []).length > 0 && (
                                <div>
                                    <p className="text-amber-400/70 text-[10px] font-bold uppercase tracking-wider mb-0.5">Social</p>
                                    {(score.breakdown.social || []).map((s, i) => (
                                        <div key={`s${i}`} className="flex justify-between text-sand-warm/60 py-0.5">
                                            <span>
                                                {s.type === 'playerOfEpisode' && 'Player of Episode vote'}
                                                {s.type === 'impactRating' && `Impact rating (avg ${s.avg})`}
                                            </span>
                                            <span className="text-amber-400">+{s.points}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sand-warm/40 italic pt-1">No points this episode</p>
                    )}

                    {bingoSeed && (
                        <div className="pt-1.5 border-t border-stone-700/30">
                            <button
                                onClick={() => setShowBingo(!showBingo)}
                                className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                <Icon name={showBingo ? 'expand_less' : 'grid_view'} className="text-sm" />
                                {showBingo ? 'Hide Bingo Card' : 'View Bingo Card'}
                            </button>
                            {showBingo && (
                                <div className="mt-2 max-w-xs mx-auto">
                                    <BingoCard
                                        seed={bingoSeed}
                                        marked={bingoMarked}
                                        disabled={true}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function EpSummaryCell({ label, value, color }) {
    return (
        <div className={`rounded py-1 ${value > 0 ? 'bg-stone-800/60' : 'bg-stone-800/20'}`}>
            <p className={`font-bold text-sm ${value > 0 ? color : 'text-sand-warm/20'}`}>{value}</p>
            <p className={`text-[9px] uppercase ${value > 0 ? 'text-sand-warm/50' : 'text-sand-warm/20'}`}>{label}</p>
        </div>
    );
}

function SpoilerShield({ unwatchedEps, onNavigate }) {
    return (
        <FijianCard className="p-6 max-w-md mx-auto text-center space-y-4">
            <div className="text-4xl">🛡️</div>
            <h3 className="font-display text-2xl text-sand-warm tracking-wider">Spoiler Shield</h3>
            <p className="text-sand-warm/60 text-sm font-sans">
                You haven&apos;t watched {unwatchedEps.length === 1 ? `Episode ${unwatchedEps[0]}` : `Episodes ${unwatchedEps.join(', ')}`} yet.
                Scores are hidden to keep things fresh.
            </p>
            <button
                onClick={() => onNavigate?.('episode')}
                className="text-ochre text-sm underline hover:text-ochre/80 transition-colors font-sans"
            >
                🔥 Light your torch to watch →
            </button>
        </FijianCard>
    );
}

export default function ScoreboardTab({ onTabChange }) {
    const { user, episodes, rideOrDies, leagueMembers, hasWatched, bingo, postEpisode, league, leagueId, auction } = useApp();
    const [expandedUid, setExpandedUid] = useState(null);

    const memberUids = useMemo(() => Object.keys(leagueMembers || {}), [leagueMembers]);

    const scoredEpNums = useMemo(
        () => Object.entries(episodes || {}).filter(([, ep]) => ep.scored).map(([n]) => Number(n)),
        [episodes]
    );

    const unwatchedScoredEps = useMemo(
        () => scoredEpNums.filter(n => !hasWatched(n)),
        [scoredEpNums, hasWatched]
    );

    const spoilerActive = unwatchedScoredEps.length > 0;

    const { standings, perEpisode } = useMemo(
        () => computeStandings(episodes, rideOrDies, memberUids, bingo, postEpisode, league?.preSeasonEliminated, auction),
        [episodes, rideOrDies, memberUids, bingo, postEpisode, league?.preSeasonEliminated, auction]
    );

    const achievements = useMemo(
        () => detectAchievements(episodes, rideOrDies, memberUids, bingo, postEpisode, perEpisode),
        [episodes, rideOrDies, memberUids, bingo, postEpisode, perEpisode]
    );

    const hasScoredEpisodes = scoredEpNums.length > 0;

    const [guideOpen, setGuideOpen] = useState(false);
    const [eventsOpen, setEventsOpen] = useState(false);

    const milestoneEvents = MILESTONE_KEYS.map(k => SCORE_EVENT_MAP[k]).filter(Boolean);
    const mediumEvents = MEDIUM_KEYS.map(k => SCORE_EVENT_MAP[k]).filter(Boolean);
    const minorEvents = SCORE_EVENTS.filter(e => !MILESTONE_KEYS.includes(e.key) && !MEDIUM_KEYS.includes(e.key));

    return (
        <div className="space-y-6">
            <header className="text-center">
                <h2 className="font-display text-3xl tracking-wider text-sand-warm drop-shadow-text">Scores</h2>
                <p className="text-sand-warm/50 text-xs mt-1 font-sans inline-flex items-center justify-center gap-1">
                    Tap a player to see breakdown
                    <HintBadge hintKey="scores">
                        W = Weekly picks, P = Predictions, R = Ride or Die, B = Bingo, S = Social. Tap any player row for details.
                    </HintBadge>
                </p>
            </header>

            {!hasScoredEpisodes ? (
                <FijianCard className="p-8 max-w-md mx-auto text-center">
                    <FijianSectionHeader title="No Scores Yet" className="justify-center" />
                    <div className="flex justify-center mb-4 opacity-30">
                        <Icon name="leaderboard" className="text-ochre text-4xl" />
                    </div>
                    <p className="text-clay font-serif italic text-sm leading-relaxed">
                        The scoreboard will light up once the first episode is scored. May the best castaway win!
                    </p>
                </FijianCard>
            ) : spoilerActive ? (
                <SpoilerShield unwatchedEps={unwatchedScoredEps} onNavigate={onTabChange} />
            ) : (
                <>
                    <FijianCard className="p-4 space-y-1">
                        <FijianSectionHeader title="Season Standings" />
                        {standings.map((entry, i) => {
                            const colorIndex = memberUids.indexOf(entry.uid);
                            const badgeIds = achievements[entry.uid] || [];
                            const playerBadges = badgeIds.map(id => ACHIEVEMENT_MAP[id]).filter(Boolean);
                            return (
                                <StandingsRow
                                    key={entry.uid}
                                    entry={entry}
                                    rank={i + 1}
                                    memberName={leagueMembers[entry.uid]?.displayName || entry.uid}
                                    color={PLAYER_COLORS[colorIndex] || PLAYER_COLORS[0]}
                                    expanded={expandedUid === entry.uid}
                                    onToggle={() => setExpandedUid(expandedUid === entry.uid ? null : entry.uid)}
                                    perEpisode={perEpisode}
                                    leagueId={leagueId}
                                    bingo={bingo}
                                    isCurrentUser={entry.uid === user?.uid}
                                    playerRideOrDies={rideOrDies?.[entry.uid] || []}
                                    playerBadges={playerBadges}
                                />
                            );
                        })}
                    </FijianCard>

                    <FijianCard className="overflow-hidden">
                        <button
                            onClick={() => setGuideOpen(g => !g)}
                            className="w-full flex items-center gap-2 p-4 text-left"
                        >
                            <Icon name="menu_book" className="text-ochre text-sm" />
                            <span className="text-ochre text-[11px] font-bold uppercase tracking-widest flex-1">
                                Scoring Guide
                            </span>
                            <Icon
                                name="expand_more"
                                className={`text-ochre/50 text-sm transition-transform ${guideOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {guideOpen && (
                            <div className="px-4 pb-4 space-y-4 text-xs font-sans text-sand-warm/60">
                                {/* Weekly Picks (W) */}
                                <div>
                                    <p className="text-fire-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">
                                        Weekly Picks (W)
                                    </p>
                                    <p className="text-sand-warm/40 text-[10px] mb-2">
                                        Your picks earn points based on what their castaways do in the episode. Only picker = 1.5x bonus.
                                    </p>
                                    <div className="space-y-0.5">
                                        {milestoneEvents.map(e => (
                                            <ScoreGuideRow key={e.key} emoji={e.emoji} label={e.label} value={`+${e.points}`} />
                                        ))}
                                    </div>
                                    <div className="mt-1 space-y-0.5">
                                        {mediumEvents.map(e => (
                                            <ScoreGuideRow key={e.key} emoji={e.emoji} label={e.label} value={`+${e.points}`} />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setEventsOpen(e => !e)}
                                        className="flex items-center gap-1 mt-1.5 text-sand-warm/40 hover:text-sand-warm/60 transition-colors"
                                    >
                                        <Icon name={eventsOpen ? 'expand_less' : 'expand_more'} className="text-xs" />
                                        <span className="text-[10px]">{eventsOpen ? 'Hide' : 'Show'} {minorEvents.length} minor events (1-3 pts)</span>
                                    </button>
                                    {eventsOpen && (
                                        <div className="mt-1 space-y-0.5">
                                            {minorEvents.map(e => (
                                                <ScoreGuideRow key={e.key} emoji={e.emoji} label={e.label} value={`+${e.points}`} />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-stone-700/50" />

                                {/* Predictions (P) */}
                                <div>
                                    <p className="text-green-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">
                                        Predictions (P)
                                    </p>
                                    <div className="space-y-0.5">
                                        <ScoreGuideRow emoji="⚡" label="Snap Vote correct" value="+8" />
                                        <ScoreGuideRow emoji="📬" label="Tree Mail correct" value="+3" />
                                        <ScoreGuideRow emoji="🤫" label="Tribal Whisper correct" value="+3" />
                                    </div>
                                </div>

                                <div className="border-t border-stone-700/50" />

                                {/* Ride or Die (R) */}
                                <div>
                                    <p className="text-sky-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">
                                        Ride or Die (R)
                                    </p>
                                    <div className="space-y-0.5">
                                        <ScoreGuideRow emoji="✅" label="Survived episode" value="+2/ep" />
                                        <ScoreGuideRow emoji="🤝" label="Game event points (same as weekly)" value="pts" />
                                        <ScoreGuideRow emoji="🏛️" label="Made FTC" value="+15" />
                                        <ScoreGuideRow emoji="👑" label="Won the season" value="+30" />
                                    </div>
                                </div>

                                <div className="border-t border-stone-700/50" />

                                {/* Bingo (B) */}
                                <div>
                                    <p className="text-purple-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">
                                        Bingo (B)
                                    </p>
                                    <div className="space-y-0.5">
                                        <ScoreGuideRow emoji="🎯" label="Complete a line (5 in a row)" value="+5" />
                                        <ScoreGuideRow emoji="🌑" label="Blackout (all 25 squares)" value="+50" />
                                    </div>
                                </div>

                                <div className="border-t border-stone-700/50" />

                                {/* Social (S) */}
                                <div>
                                    <p className="text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-1.5">
                                        Social (S)
                                    </p>
                                    <div className="space-y-0.5">
                                        <ScoreGuideRow emoji="👑" label="Player of Episode (voted #1)" value="+7" />
                                        <ScoreGuideRow emoji="💔" label="Impact rating (avg to pick owner)" value="avg" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </FijianCard>
                </>
            )}
        </div>
    );
}

function ScoreGuideRow({ emoji, label, value }) {
    return (
        <div className="flex justify-between py-0.5">
            <span>{emoji} {label}</span>
            <span className="text-ochre font-medium ml-2 shrink-0">{value}</span>
        </div>
    );
}
