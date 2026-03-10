import { SCORE_EVENTS, ALL_CASTAWAYS, detectBingoLines, isBingoBlackout, ACHIEVEMENT_MAP } from './data';

const SCORE_MAP = Object.fromEntries(SCORE_EVENTS.map(e => [e.key, e.points]));

const RIDE_OR_DIE_SURVIVE_BONUS = 2;
const RIDE_OR_DIE_FINALE_BONUS = 15;
const RIDE_OR_DIE_WINNER_BONUS = 30;
const SCARCITY_MULTIPLIER = 1.5;
const CORRECT_PROP_BET_POINTS = 3;
const CORRECT_SNAP_VOTE_POINTS = 8;
const CORRECT_SIDE_BET_POINTS = 3;
const PLAYER_OF_EPISODE_POINTS = 7;
const BINGO_LINE_POINTS = 5;
const BINGO_BLACKOUT_POINTS = 50;

/**
 * Given game events for an episode, compute the raw points each contestant earned.
 * gameEvents: { [contestantId]: string[] }  (array of SCORE_EVENT keys)
 * Returns: { [contestantId]: number }
 */
export function scoreContestants(gameEvents) {
    const scores = {};
    for (const [contestantId, events] of Object.entries(gameEvents || {})) {
        let total = 0;
        for (const key of events) {
            total += SCORE_MAP[key] || 0;
        }
        scores[contestantId] = total;
    }
    return scores;
}

/**
 * Compute scarcity map: which contestants were picked exclusively by one player.
 * picks: { [uid]: string[] }
 * Returns: { [contestantId]: { count: number, exclusiveOwner: string|null } }
 */
export function computeScarcity(picks) {
    const contestantOwners = {};
    for (const [uid, playerPicks] of Object.entries(picks || {})) {
        for (const cid of (playerPicks || [])) {
            if (!contestantOwners[cid]) contestantOwners[cid] = [];
            contestantOwners[cid].push(uid);
        }
    }
    const result = {};
    for (const [cid, owners] of Object.entries(contestantOwners)) {
        result[cid] = {
            count: owners.length,
            exclusiveOwner: owners.length === 1 ? owners[0] : null,
        };
    }
    return result;
}

/**
 * Score a single episode for all players.
 *
 * episodeData: { picks, predictions, propBets, gameEvents, propBetResults, eliminatedThisEp }
 * rideOrDies: { [uid]: string[] }
 * eliminatedBefore: string[]  (contestants eliminated BEFORE this episode)
 *
 * Returns: { [uid]: { weekly, predictions, rideOrDie, total, breakdown } }
 */
export function scoreEpisode(episodeData, rideOrDies, eliminatedBefore, memberUids, bingoData) {
    const {
        picks = {},
        predictions = {},
        gameEvents = {},
        propBets = [],
        propBetResults = {},
        eliminatedThisEp = [],
        snapVotes = {},
        sideBets = [],
        playerSideBets = {},
        sideBetResults = {},
    } = episodeData;

    const contestantScores = scoreContestants(gameEvents);
    const scarcity = computeScarcity(picks);
    const eliminatedSet = new Set(eliminatedBefore || []);
    const playerScores = {};

    for (const uid of memberUids) {
        const breakdown = { weekly: [], predictions: [], rideOrDie: [] };
        let weeklyTotal = 0;
        let predictionTotal = 0;
        let rideOrDieTotal = 0;

        // --- Weekly pick performance ---
        const playerPicks = picks[uid] || [];
        for (const cid of playerPicks) {
            const raw = contestantScores[cid] || 0;
            const sc = scarcity[cid];
            const isExclusive = sc?.exclusiveOwner === uid;
            const multiplied = isExclusive ? Math.round(raw * SCARCITY_MULTIPLIER) : raw;
            weeklyTotal += multiplied;
            if (raw > 0) {
                const castaway = ALL_CASTAWAYS.find(c => c.id === cid);
                breakdown.weekly.push({
                    contestantId: cid,
                    name: castaway?.name || cid,
                    raw,
                    scarcityBonus: isExclusive,
                    points: multiplied,
                    events: gameEvents[cid] || [],
                });
            }
        }

        // --- Prediction scoring ---
        const playerPred = predictions[uid] || {};

        // Prop bets — only score when admin has explicitly set a result
        const playerProps = playerPred.propBets || {};
        for (const prop of propBets) {
            const correctAnswer = propBetResults[prop.id];
            if (correctAnswer === undefined || correctAnswer === null) continue;
            const playerAnswer = !!playerProps[prop.id];
            if (playerAnswer === !!correctAnswer) {
                predictionTotal += CORRECT_PROP_BET_POINTS;
                breakdown.predictions.push({
                    type: 'propBet',
                    text: prop.text,
                    correct: true,
                    points: CORRECT_PROP_BET_POINTS,
                });
            }
        }

        // --- Snap vote scoring ---
        const playerSnapVote = snapVotes[uid];
        if (playerSnapVote?.contestantId && eliminatedThisEp.includes(playerSnapVote.contestantId)) {
            predictionTotal += CORRECT_SNAP_VOTE_POINTS;
            breakdown.predictions.push({ type: 'snapVote', correct: true, points: CORRECT_SNAP_VOTE_POINTS });
        }

        // --- Side bet scoring — only score when admin has explicitly set a result ---
        const playerSB = playerSideBets[uid] || {};
        for (const bet of sideBets) {
            const correctAnswer = sideBetResults[bet.id];
            if (correctAnswer === undefined || correctAnswer === null) continue;
            const playerAnswer = !!playerSB[bet.id];
            if (playerAnswer === !!correctAnswer) {
                predictionTotal += CORRECT_SIDE_BET_POINTS;
                breakdown.predictions.push({
                    type: 'sideBet',
                    text: bet.text,
                    correct: true,
                    points: CORRECT_SIDE_BET_POINTS,
                });
            }
        }

        // --- Ride or Die passive bonus ---
        const playerRoDs = rideOrDies[uid] || [];
        for (const rodId of playerRoDs) {
            if (!eliminatedSet.has(rodId) && !eliminatedThisEp.includes(rodId)) {
                rideOrDieTotal += RIDE_OR_DIE_SURVIVE_BONUS;
                const castaway = ALL_CASTAWAYS.find(c => c.id === rodId);
                breakdown.rideOrDie.push({
                    contestantId: rodId,
                    name: castaway?.name || rodId,
                    reason: 'survived',
                    points: RIDE_OR_DIE_SURVIVE_BONUS,
                });
            }
        }

        // Ride or Die milestone bonuses (FTC / winner) from game events
        for (const rodId of playerRoDs) {
            const events = gameEvents[rodId] || [];
            if (events.includes('winner')) {
                rideOrDieTotal += RIDE_OR_DIE_WINNER_BONUS;
                const castaway = ALL_CASTAWAYS.find(c => c.id === rodId);
                breakdown.rideOrDie.push({
                    contestantId: rodId,
                    name: castaway?.name || rodId,
                    reason: 'winner',
                    points: RIDE_OR_DIE_WINNER_BONUS,
                });
            } else if (events.includes('ftc')) {
                rideOrDieTotal += RIDE_OR_DIE_FINALE_BONUS;
                const castaway = ALL_CASTAWAYS.find(c => c.id === rodId);
                breakdown.rideOrDie.push({
                    contestantId: rodId,
                    name: castaway?.name || rodId,
                    reason: 'ftc',
                    points: RIDE_OR_DIE_FINALE_BONUS,
                });
            }
        }

        // --- Bingo scoring ---
        let bingoTotal = 0;
        breakdown.bingo = [];
        const playerBingo = bingoData?.[uid];
        if (playerBingo && Array.isArray(playerBingo) && playerBingo.length === 25) {
            const lines = detectBingoLines(playerBingo);
            if (lines.length > 0) {
                const linePoints = lines.length * BINGO_LINE_POINTS;
                bingoTotal += linePoints;
                breakdown.bingo.push({ type: 'lines', count: lines.length, points: linePoints });
            }
            if (isBingoBlackout(playerBingo)) {
                bingoTotal += BINGO_BLACKOUT_POINTS;
                breakdown.bingo.push({ type: 'blackout', points: BINGO_BLACKOUT_POINTS });
            }
        }

        playerScores[uid] = {
            weekly: weeklyTotal,
            predictions: predictionTotal,
            rideOrDie: rideOrDieTotal,
            bingo: bingoTotal,
            total: weeklyTotal + predictionTotal + rideOrDieTotal + bingoTotal,
            breakdown,
        };
    }

    return playerScores;
}

/**
 * Compute cumulative season standings across all scored episodes.
 *
 * episodes: { [epNum]: episodeData }
 * rideOrDies: { [uid]: string[] }
 * memberUids: string[]
 *
 * Returns: { standings: [{ uid, total, weekly, predictions, rideOrDie }], perEpisode: { [epNum]: playerScores } }
 */
/**
 * Compute Player of Episode winner and scoring from votes.
 * votes: { [uid]: [cid1, cid2, cid3] }
 * Returns: { winnerId, scores: { [uid]: number } }
 */
function computePlayerOfEpisode(votes, picks, memberUids) {
    const tally = {};
    for (const [, ranks] of Object.entries(votes || {})) {
        if (!Array.isArray(ranks)) continue;
        ranks.forEach((cid, i) => {
            if (!cid) return;
            tally[cid] = (tally[cid] || 0) + (3 - i);
        });
    }

    const sorted = Object.entries(tally).sort(([, a], [, b]) => b - a);
    if (sorted.length === 0) return { winnerId: null, scores: {} };

    const winnerId = sorted[0][0];
    const scores = {};

    for (const uid of memberUids) {
        const ranking = votes[uid];
        if (Array.isArray(ranking) && ranking[0] === winnerId) {
            scores[uid] = PLAYER_OF_EPISODE_POINTS;
        }
    }

    return { winnerId, scores };
}

/**
 * Compute Impact Rating average from all ratings.
 * ratings: { [uid]: number }
 * Returns average as a number (0 if no ratings)
 */
function computeImpactRatingAvg(ratings) {
    const values = Object.values(ratings || {}).filter(v => typeof v === 'number');
    if (values.length === 0) return 0;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

export function computeStandings(episodes, rideOrDies, memberUids, bingoAllEpisodes, postEpisodeData) {
    const perEpisode = {};
    const cumulative = {};
    for (const uid of memberUids) {
        cumulative[uid] = { weekly: 0, predictions: 0, rideOrDie: 0, bingo: 0, social: 0, total: 0 };
    }

    const epNums = Object.keys(episodes || {})
        .map(Number)
        .filter(n => episodes[n]?.scored)
        .sort((a, b) => a - b);

    let eliminatedSoFar = [];

    for (const epNum of epNums) {
        const ep = episodes[epNum];
        const epBingo = bingoAllEpisodes?.[epNum] || {};
        const epScores = scoreEpisode(ep, rideOrDies, eliminatedSoFar, memberUids, epBingo);
        perEpisode[epNum] = epScores;

        // Post-episode scoring
        const peData = postEpisodeData?.[epNum] || {};

        // Player of Episode
        if (peData.playerOfEpisode) {
            const { scores: poeScores } = computePlayerOfEpisode(peData.playerOfEpisode, ep.picks, memberUids);
            for (const [uid, pts] of Object.entries(poeScores)) {
                if (epScores[uid]) {
                    epScores[uid].social = (epScores[uid].social || 0) + pts;
                    epScores[uid].total += pts;
                    epScores[uid].breakdown.social = epScores[uid].breakdown.social || [];
                    epScores[uid].breakdown.social.push({ type: 'playerOfEpisode', points: pts });
                }
            }
        }

        // Impact Rating
        if (peData.impactRating && ep.eliminatedThisEp?.length > 0) {
            const avg = computeImpactRatingAvg(peData.impactRating);
            if (avg > 0) {
                const eliminatedId = ep.eliminatedThisEp[0];
                for (const uid of memberUids) {
                    const playerPicks = ep.picks?.[uid] || [];
                    if (playerPicks.includes(eliminatedId)) {
                        const pts = Math.round(avg);
                        if (epScores[uid]) {
                            epScores[uid].social = (epScores[uid].social || 0) + pts;
                            epScores[uid].total += pts;
                            epScores[uid].breakdown.social = epScores[uid].breakdown.social || [];
                            epScores[uid].breakdown.social.push({ type: 'impactRating', avg, points: pts });
                        }
                    }
                }
            }
        }

        for (const uid of memberUids) {
            const s = epScores[uid] || { weekly: 0, predictions: 0, rideOrDie: 0, bingo: 0, social: 0, total: 0 };
            cumulative[uid].weekly += s.weekly;
            cumulative[uid].predictions += s.predictions;
            cumulative[uid].rideOrDie += s.rideOrDie;
            cumulative[uid].bingo += (s.bingo || 0);
            cumulative[uid].social += (s.social || 0);
            cumulative[uid].total += s.total;
        }

        eliminatedSoFar = [...eliminatedSoFar, ...(ep.eliminatedThisEp || [])];
    }

    const standings = memberUids
        .map(uid => ({ uid, ...cumulative[uid] }))
        .sort((a, b) => b.total - a.total);

    return { standings, perEpisode };
}

const DETHRONE_BONUS = 8;

/**
 * Detect achievements for all players across the season.
 * Returns: { [uid]: string[] } — array of achievement IDs
 */
export function detectAchievements(episodes, rideOrDies, memberUids, bingoAllEpisodes, postEpisodeData, perEpisode) {
    const earned = {};
    for (const uid of memberUids) earned[uid] = [];

    const epNums = Object.keys(episodes || {})
        .map(Number)
        .filter(n => episodes[n]?.scored)
        .sort((a, b) => a - b);

    if (epNums.length === 0) return earned;

    // Track per-uid stats across episodes
    const elimStreaks = {};
    const scarcityCounts = {};
    const poeVoteCounts = {};
    const leaderHistory = [];

    for (const uid of memberUids) {
        elimStreaks[uid] = 0;
        scarcityCounts[uid] = 0;
        poeVoteCounts[uid] = 0;
    }

    for (const epNum of epNums) {
        const ep = episodes[epNum];
        const epScores = perEpisode?.[epNum] || {};

        for (const uid of memberUids) {
            const score = epScores[uid];
            if (!score) continue;

            // Prophet: consecutive correct snap votes
            const snapVote = ep.snapVotes?.[uid]?.contestantId;
            const actualEliminated = ep.eliminatedThisEp || [];
            if (snapVote && actualEliminated.includes(snapVote)) {
                elimStreaks[uid]++;
                if (elimStreaks[uid] >= 3 && !earned[uid].includes('prophet')) {
                    earned[uid].push('prophet');
                }
            } else {
                elimStreaks[uid] = 0;
            }

            // First Blood: correct snap vote on the first episode
            if (epNum === epNums[0] && snapVote && actualEliminated.includes(snapVote)) {
                if (!earned[uid].includes('first_blood')) earned[uid].push('first_blood');
            }

            // Beast Mode: a pick scores 20+
            if (score.breakdown?.weekly) {
                for (const w of score.breakdown.weekly) {
                    if (w.points >= 20 && !earned[uid].includes('beast_mode')) {
                        earned[uid].push('beast_mode');
                    }
                }
            }

            // Contrarian: scarcity bonuses
            if (score.breakdown?.weekly) {
                for (const w of score.breakdown.weekly) {
                    if (w.scarcityBonus) scarcityCounts[uid]++;
                }
                if (scarcityCounts[uid] >= 5 && !earned[uid].includes('contrarian')) {
                    earned[uid].push('contrarian');
                }
            }

            // Perfect Episode: scored in every category
            if (score.weekly > 0 && score.predictions > 0 && score.rideOrDie > 0 && (score.bingo || 0) > 0) {
                if (!earned[uid].includes('perfect_episode')) {
                    earned[uid].push('perfect_episode');
                }
            }
        }

        // Bingo Blackout
        const epBingo = bingoAllEpisodes?.[epNum] || {};
        for (const uid of memberUids) {
            if (epBingo[uid] && isBingoBlackout(epBingo[uid]) && !earned[uid].includes('bingo_blackout')) {
                earned[uid].push('bingo_blackout');
            }
        }

        // Social Butterfly: voted on Player of Episode
        const poeVotes = postEpisodeData?.[epNum]?.playerOfEpisode || {};
        for (const uid of memberUids) {
            if (poeVotes[uid]) poeVoteCounts[uid]++;
            if (poeVoteCounts[uid] >= 5 && !earned[uid].includes('social_butterfly')) {
                earned[uid].push('social_butterfly');
            }
        }

        // Track leader for Sole Survivor / Dethroned
        let cumulTotals = {};
        for (const uid of memberUids) cumulTotals[uid] = 0;
        for (const en of epNums.filter(n => n <= epNum)) {
            for (const uid of memberUids) {
                cumulTotals[uid] += (perEpisode[en]?.[uid]?.total || 0);
            }
        }
        const sorted = memberUids.slice().sort((a, b) => cumulTotals[b] - cumulTotals[a]);
        leaderHistory.push(sorted[0]);
    }

    // Ride or Die Loyalty: both ride or dies survived to merge
    for (const uid of memberUids) {
        const rods = rideOrDies?.[uid] || [];
        if (rods.length >= 2) {
            const allMadeIt = rods.every(cid => {
                for (const epNum of epNums) {
                    const events = episodes[epNum]?.gameEvents?.[cid] || [];
                    if (events.includes('merge')) return true;
                }
                return false;
            });
            if (allMadeIt && !earned[uid].includes('ride_or_die_loyalty')) {
                earned[uid].push('ride_or_die_loyalty');
            }
        }
    }

    // Sole Survivor of Standings: first place 3+ consecutive
    if (leaderHistory.length >= 3) {
        for (let i = 2; i < leaderHistory.length; i++) {
            const uid = leaderHistory[i];
            if (uid === leaderHistory[i - 1] && uid === leaderHistory[i - 2]) {
                if (!earned[uid].includes('sole_survivor_standings')) {
                    earned[uid].push('sole_survivor_standings');
                }
            }
        }
    }

    // Dethroned: overtook the previous leader
    for (let i = 1; i < leaderHistory.length; i++) {
        if (leaderHistory[i] !== leaderHistory[i - 1]) {
            const uid = leaderHistory[i];
            if (!earned[uid].includes('dethroned')) {
                earned[uid].push('dethroned');
            }
        }
    }

    return earned;
}

/**
 * Generate the Auto-Commissioner report for a given episode.
 * Returns an object with headline, standings snapshot, superlatives, etc.
 */
export function generateCommissionerReport(epNum, episodes, standings, perEpisode, members, achievements) {
    const epScores = perEpisode?.[epNum] || {};
    const ep = episodes?.[epNum];
    if (!ep) return null;

    const memberNames = (uid) => members?.[uid]?.displayName || uid;
    const contestantName = (cid) => ALL_CASTAWAYS.find(c => c.id === cid)?.name || cid;

    // Biggest mover: who gained the most this episode
    let biggestMover = null;
    let biggestMoverPts = 0;
    for (const [uid, score] of Object.entries(epScores)) {
        if (score.total > biggestMoverPts) {
            biggestMoverPts = score.total;
            biggestMover = uid;
        }
    }

    // Worst episode
    let worstPlayer = null;
    let worstPts = Infinity;
    for (const [uid, score] of Object.entries(epScores)) {
        if (score.total < worstPts) {
            worstPts = score.total;
            worstPlayer = uid;
        }
    }

    // Best pick: highest scoring individual contestant this episode
    let bestPick = null;
    let bestPickPts = 0;
    const contestantScores = scoreContestants(ep.gameEvents || {});
    for (const [cid, pts] of Object.entries(contestantScores)) {
        if (pts > bestPickPts) {
            bestPickPts = pts;
            bestPick = cid;
        }
    }

    // Elimination
    const eliminated = (ep.eliminatedThisEp || []).map(contestantName);

    // Correct snap votes at tribal
    const correctPredictors = Object.entries(ep.snapVotes || {})
        .filter(([, vote]) => (ep.eliminatedThisEp || []).includes(vote?.contestantId))
        .map(([uid]) => memberNames(uid));

    // New achievements this episode (simplified — just list all)
    const newBadges = [];
    for (const [uid, badges] of Object.entries(achievements || {})) {
        for (const badge of badges) {
            newBadges.push({ uid, badge: ACHIEVEMENT_MAP[badge] });
        }
    }

    // Headlines — ESPN-style tone
    const headlines = [];
    if (biggestMover) {
        headlines.push(`${memberNames(biggestMover)} dominates Episode ${epNum} with ${biggestMoverPts} points`);
    }
    if (eliminated.length > 0) {
        headlines.push(`${eliminated.join(' & ')} ${eliminated.length === 1 ? 'has' : 'have'} their torch snuffed`);
    }
    if (standings?.[0]) {
        headlines.push(`${memberNames(standings[0].uid)} leads the standings with ${standings[0].total} total points`);
    }
    if (correctPredictors.length > 0) {
        headlines.push(`${correctPredictors.join(', ')} called the boot at tribal`);
    }

    return {
        epNum,
        headline: headlines[0] || `Episode ${epNum} is in the books`,
        subheadlines: headlines.slice(1),
        standings: standings?.slice(0, 6).map((s, i) => ({
            rank: i + 1,
            name: memberNames(s.uid),
            total: s.total,
            epPoints: epScores[s.uid]?.total || 0,
        })),
        biggestMover: biggestMover ? { name: memberNames(biggestMover), points: biggestMoverPts } : null,
        worstEpisode: worstPlayer ? { name: memberNames(worstPlayer), points: worstPts } : null,
        bestPick: bestPick ? { name: contestantName(bestPick), points: bestPickPts } : null,
        eliminated,
        correctPredictors,
        newBadges: newBadges.map(b => ({ name: memberNames(b.uid), badge: b.badge?.name, emoji: b.badge?.emoji })),
    };
}
