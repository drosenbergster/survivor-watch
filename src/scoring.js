import {
    SCORE_EVENTS,
    ALL_CASTAWAYS,
    detectBingoLines,
    isBingoBlackout,
    countBingoSquares,
    PASSPORT_POINTS_PER_CORRECT,
    PASSPORT_QUESTIONS,
} from './data';

const SCORE_MAP = Object.fromEntries(SCORE_EVENTS.map(e => [e.key, e.points]));

const SCARCITY_MULTIPLIER = 1.5;
const CORRECT_PROP_BET_POINTS = 3;
const CORRECT_SNAP_VOTE_POINTS = 8;
const CORRECT_SIDE_BET_POINTS = 3;
const BINGO_SQUARE_POINTS = 2;
const BINGO_LINE_POINTS = 5;
const BINGO_BLACKOUT_POINTS = 50;

/**
 * Compute raw event points each contestant earned this episode.
 * gameEvents: { [contestantId]: string[] } — array of SCORE_EVENT keys
 * Returns: { [contestantId]: number }
 */
export function scoreContestants(gameEvents) {
    const scores = {};
    for (const [contestantId, events] of Object.entries(gameEvents || {})) {
        let total = 0;
        for (const key of events) total += SCORE_MAP[key] || 0;
        scores[contestantId] = total;
    }
    return scores;
}

/**
 * Which contestants were picked by exactly one player this episode (unlocking 1.5x).
 * picks: { [uid]: string[] }
 * Returns: { [contestantId]: { count, exclusiveOwner } }
 */
export function computeScarcity(picks) {
    const owners = {};
    for (const [uid, playerPicks] of Object.entries(picks || {})) {
        for (const cid of (playerPicks || [])) {
            if (!owners[cid]) owners[cid] = [];
            owners[cid].push(uid);
        }
    }
    const result = {};
    for (const [cid, list] of Object.entries(owners)) {
        result[cid] = {
            count: list.length,
            exclusiveOwner: list.length === 1 ? list[0] : null,
        };
    }
    return result;
}

/**
 * Score a single episode for all players. Three streams: picks, predictions, bingo.
 *
 * episodeData: { picks, predictions, propBets, propBetResults, snapVotes, sideBets,
 *                playerSideBets, sideBetResults, eliminatedThisEp }
 * bingoData:   { [uid]: boolean[25] }
 * memberUids:  string[]
 *
 * Returns: { [uid]: { weekly, predictions, bingo, total, breakdown } }
 */
export function scoreEpisode(episodeData, memberUids, bingoData) {
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
    const playerScores = {};

    for (const uid of memberUids) {
        const breakdown = { weekly: [], predictions: [], bingo: [] };
        let weeklyTotal = 0;
        let predictionTotal = 0;

        // ── Weekly picks: event points, with sole-picker 1.5× ──
        const playerPicks = picks[uid] || [];
        for (const cid of playerPicks) {
            const raw = contestantScores[cid] || 0;
            const isExclusive = scarcity[cid]?.exclusiveOwner === uid;
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

        // ── Predictions: Tree Mail, Snap Vote, Tribal Whispers ──
        const playerPred = predictions[uid] || {};

        const playerProps = playerPred.propBets || {};
        for (const prop of propBets) {
            const correctAnswer = propBetResults[prop.id];
            if (correctAnswer === undefined || correctAnswer === null) continue;
            if (!!playerProps[prop.id] === !!correctAnswer) {
                predictionTotal += CORRECT_PROP_BET_POINTS;
                breakdown.predictions.push({
                    type: 'propBet',
                    text: prop.text,
                    correct: true,
                    points: CORRECT_PROP_BET_POINTS,
                });
            }
        }

        const playerSnapVote = snapVotes[uid];
        if (playerSnapVote?.contestantId && eliminatedThisEp.includes(playerSnapVote.contestantId)) {
            predictionTotal += CORRECT_SNAP_VOTE_POINTS;
            breakdown.predictions.push({
                type: 'snapVote',
                correct: true,
                points: CORRECT_SNAP_VOTE_POINTS,
            });
        }

        const playerSB = playerSideBets[uid] || {};
        for (const bet of sideBets) {
            const correctAnswer = sideBetResults[bet.id];
            if (correctAnswer === undefined || correctAnswer === null) continue;
            if (!!playerSB[bet.id] === !!correctAnswer) {
                predictionTotal += CORRECT_SIDE_BET_POINTS;
                breakdown.predictions.push({
                    type: 'sideBet',
                    text: bet.text,
                    correct: true,
                    points: CORRECT_SIDE_BET_POINTS,
                });
            }
        }

        // ── Bingo: squares + lines + blackout ──
        let bingoTotal = 0;
        const playerBingo = bingoData?.[uid];
        if (playerBingo && Array.isArray(playerBingo) && playerBingo.length === 25) {
            const squares = countBingoSquares(playerBingo);
            if (squares > 0) {
                const pts = squares * BINGO_SQUARE_POINTS;
                bingoTotal += pts;
                breakdown.bingo.push({ type: 'squares', count: squares, points: pts });
            }
            const lines = detectBingoLines(playerBingo);
            if (lines.length > 0) {
                const pts = lines.length * BINGO_LINE_POINTS;
                bingoTotal += pts;
                breakdown.bingo.push({ type: 'lines', count: lines.length, points: pts });
            }
            if (isBingoBlackout(playerBingo)) {
                bingoTotal += BINGO_BLACKOUT_POINTS;
                breakdown.bingo.push({ type: 'blackout', points: BINGO_BLACKOUT_POINTS });
            }
        }

        playerScores[uid] = {
            weekly: weeklyTotal,
            predictions: predictionTotal,
            bingo: bingoTotal,
            total: weeklyTotal + predictionTotal + bingoTotal,
            breakdown,
        };
    }

    return playerScores;
}

/**
 * Score sealed passports against a "truth" object once the season is decided.
 * passports: { [uid]: { winner, firstJury, fanFavorite, biggestVillain, fireMakingWinner, sealedAt } }
 * truth:     { winner, firstJury, fanFavorite, biggestVillain, fireMakingWinner }
 * Returns:   { [uid]: { points, correct: [{ key, label, answer, correctAnswer }], total } }
 */
export function scorePassports(passports, truth) {
    const result = {};
    if (!passports) return result;
    for (const [uid, passport] of Object.entries(passports)) {
        if (!passport) { result[uid] = { points: 0, correct: [] }; continue; }
        const correct = [];
        let points = 0;
        for (const q of PASSPORT_QUESTIONS) {
            const answer = passport[q.key];
            const correctAnswer = truth?.[q.key];
            if (answer && correctAnswer && answer === correctAnswer) {
                points += PASSPORT_POINTS_PER_CORRECT;
                correct.push({ key: q.key, label: q.label, answer, correctAnswer });
            }
        }
        result[uid] = { points, correct };
    }
    return result;
}

/**
 * Compute cumulative season standings across all scored episodes,
 * optionally including passport bonuses if the finale truth is known.
 *
 * episodes: { [epNum]: episodeData }
 * memberUids: string[]
 * bingoAllEpisodes: { [epNum]: { [uid]: boolean[25] } }
 * options: { passports, passportTruth, preSeasonEliminated }
 *
 * Returns: { standings, perEpisode, passportScores }
 */
export function computeStandings(episodes, memberUids, bingoAllEpisodes, options = {}) {
    const { passports = null, passportTruth = null } = options;
    const perEpisode = {};
    const cumulative = {};
    for (const uid of memberUids) {
        cumulative[uid] = { weekly: 0, predictions: 0, bingo: 0, passport: 0, total: 0 };
    }

    const epNums = Object.keys(episodes || {})
        .map(Number)
        .filter(n => episodes[n]?.scored)
        .sort((a, b) => a - b);

    for (const epNum of epNums) {
        const ep = episodes[epNum];
        const epBingo = bingoAllEpisodes?.[epNum] || {};
        const epScores = scoreEpisode(ep, memberUids, epBingo);
        perEpisode[epNum] = epScores;

        for (const uid of memberUids) {
            const s = epScores[uid] || { weekly: 0, predictions: 0, bingo: 0, total: 0 };
            cumulative[uid].weekly += s.weekly;
            cumulative[uid].predictions += s.predictions;
            cumulative[uid].bingo += s.bingo;
            cumulative[uid].total += s.total;
        }
    }

    // Passport bonus only applies once the finale truth is set.
    let passportScores = {};
    if (passports && passportTruth) {
        passportScores = scorePassports(passports, passportTruth);
        for (const uid of memberUids) {
            const p = passportScores[uid]?.points || 0;
            cumulative[uid].passport += p;
            cumulative[uid].total += p;
        }
    }

    const standings = memberUids
        .map(uid => ({ uid, ...cumulative[uid] }))
        .sort((a, b) => b.total - a.total);

    return { standings, perEpisode, passportScores };
}

/**
 * Build the "Previously On... Survivor" recap for one episode.
 * Narrative + superlatives + updated standings row for the Probst-style hero card.
 */
export function generateProbstRecap(epNum, episodes, standings, perEpisode, members) {
    const epScores = perEpisode?.[epNum] || {};
    const ep = episodes?.[epNum];
    if (!ep) return null;

    const memberName = (uid) => members?.[uid]?.displayName || uid;
    const contestantName = (cid) => ALL_CASTAWAYS.find(c => c.id === cid)?.name || cid;
    const gameEvents = ep.gameEvents || {};
    const contestantScores = scoreContestants(gameEvents);

    // Superlatives
    let biggestMover = null;
    let biggestMoverPts = 0;
    let worstPlayer = null;
    let worstPts = Infinity;
    for (const [uid, score] of Object.entries(epScores)) {
        if (score.total > biggestMoverPts) { biggestMoverPts = score.total; biggestMover = uid; }
        if (score.total < worstPts) { worstPts = score.total; worstPlayer = uid; }
    }

    let bestPick = null;
    let bestPickPts = 0;
    for (const [cid, pts] of Object.entries(contestantScores)) {
        if (pts > bestPickPts) { bestPickPts = pts; bestPick = cid; }
    }

    // Narrative extraction
    const eliminated = (ep.eliminatedThisEp || []).map(contestantName);
    const eliminationMethod = ep.eliminationMethod || 'voted_out';

    const immunityWinners = [];
    const rewardWinners = [];
    const idolPlays = [];
    const advantagePlays = [];
    const survivedWithVotes = [];
    const idolFinds = [];

    for (const [cid, events] of Object.entries(gameEvents)) {
        const name = contestantName(cid);
        for (const evt of events) {
            if (evt === 'individual_immunity') immunityWinners.push(name);
            if (evt === 'individual_reward') rewardWinners.push(name);
            if (evt === 'idol_played_success') idolPlays.push(name);
            if (evt === 'advantage_used') advantagePlays.push(name);
            if (evt === 'survived_with_votes') survivedWithVotes.push(name);
            if (evt === 'idol_found') idolFinds.push(name);
        }
    }

    const correctPredictors = Object.entries(ep.snapVotes || {})
        .filter(([, vote]) => (ep.eliminatedThisEp || []).includes(vote?.contestantId))
        .map(([uid]) => memberName(uid));

    // Standings race commentary for the headline
    let headline = `Episode ${epNum} is in the books`;
    if (standings && standings.length >= 2) {
        const leader = memberName(standings[0].uid);
        const second = memberName(standings[1].uid);
        const gap = standings[0].total - standings[1].total;
        const leaderEpPts = epScores[standings[0].uid]?.total || 0;
        const leaderPrevTotal = standings[0].total - leaderEpPts;
        const secondPrevTotal = standings[1].total - (epScores[standings[1].uid]?.total || 0);

        if (gap === 0) {
            headline = `Dead heat — ${leader} and ${second} are tied for the lead`;
        } else if (leaderPrevTotal <= secondPrevTotal && gap > 0) {
            headline = `${leader} takes over first place after Episode ${epNum}`;
        } else if (gap <= 5) {
            headline = `${gap}-point gap — ${leader} holds off ${second}`;
        } else if (gap >= 30) {
            headline = `${leader} is running away with it — ${gap}-point lead`;
        } else {
            headline = `${leader} leads by ${gap} after Episode ${epNum}`;
        }
    } else if (standings?.length === 1) {
        headline = `${memberName(standings[0].uid)} opens with ${standings[0].total} points`;
    }

    return {
        epNum,
        headline,
        standings: standings?.slice(0, 6).map((s, i) => ({
            rank: i + 1,
            name: memberName(s.uid),
            total: s.total,
            epPoints: epScores[s.uid]?.total || 0,
        })),
        biggestMover: biggestMover ? { name: memberName(biggestMover), points: biggestMoverPts } : null,
        worstEpisode: worstPlayer ? { name: memberName(worstPlayer), points: worstPts } : null,
        bestPick: bestPick ? { name: contestantName(bestPick), points: bestPickPts } : null,
        eliminated,
        eliminationMethod,
        correctPredictors,
        challengeHighlights: { immunityWinners, rewardWinners, idolPlays, advantagePlays, survivedWithVotes, idolFinds },
    };
}
