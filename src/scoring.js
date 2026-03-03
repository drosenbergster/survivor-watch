import { SCORE_EVENTS, ALL_CASTAWAYS } from './data';

const SCORE_MAP = Object.fromEntries(SCORE_EVENTS.map(e => [e.key, e.points]));

const RIDE_OR_DIE_SURVIVE_BONUS = 2;
const RIDE_OR_DIE_FINALE_BONUS = 15;
const RIDE_OR_DIE_WINNER_BONUS = 30;
const SCARCITY_MULTIPLIER = 1.5;
const CORRECT_ELIMINATION_POINTS = 5;
const CORRECT_PROP_BET_POINTS = 3;
const CORRECT_BOLD_PREDICTION_POINTS = 10;

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
export function scoreEpisode(episodeData, rideOrDies, eliminatedBefore, memberUids) {
    const {
        picks = {},
        predictions = {},
        gameEvents = {},
        propBets = [],
        propBetResults = {},
        eliminatedThisEp = [],
        boldResults = {},
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

        // Correct elimination prediction
        if (playerPred.elimination && eliminatedThisEp.includes(playerPred.elimination)) {
            predictionTotal += CORRECT_ELIMINATION_POINTS;
            breakdown.predictions.push({ type: 'elimination', correct: true, points: CORRECT_ELIMINATION_POINTS });
        }

        // Bold prediction (admin confirms per player)
        if (boldResults[uid]) {
            predictionTotal += CORRECT_BOLD_PREDICTION_POINTS;
            breakdown.predictions.push({ type: 'bold', correct: true, points: CORRECT_BOLD_PREDICTION_POINTS });
        }

        // Prop bets
        const playerProps = playerPred.propBets || {};
        for (const prop of propBets) {
            const playerAnswer = !!playerProps[prop.id];
            const correctAnswer = !!propBetResults[prop.id];
            if (playerAnswer === correctAnswer) {
                predictionTotal += CORRECT_PROP_BET_POINTS;
                breakdown.predictions.push({
                    type: 'propBet',
                    text: prop.text,
                    correct: true,
                    points: CORRECT_PROP_BET_POINTS,
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

        playerScores[uid] = {
            weekly: weeklyTotal,
            predictions: predictionTotal,
            rideOrDie: rideOrDieTotal,
            total: weeklyTotal + predictionTotal + rideOrDieTotal,
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
export function computeStandings(episodes, rideOrDies, memberUids) {
    const perEpisode = {};
    const cumulative = {};
    for (const uid of memberUids) {
        cumulative[uid] = { weekly: 0, predictions: 0, rideOrDie: 0, total: 0 };
    }

    const epNums = Object.keys(episodes || {})
        .map(Number)
        .filter(n => episodes[n]?.scored)
        .sort((a, b) => a - b);

    let eliminatedSoFar = [];

    for (const epNum of epNums) {
        const ep = episodes[epNum];
        const epScores = scoreEpisode(ep, rideOrDies, eliminatedSoFar, memberUids);
        perEpisode[epNum] = epScores;

        for (const uid of memberUids) {
            const s = epScores[uid] || { weekly: 0, predictions: 0, rideOrDie: 0, total: 0 };
            cumulative[uid].weekly += s.weekly;
            cumulative[uid].predictions += s.predictions;
            cumulative[uid].rideOrDie += s.rideOrDie;
            cumulative[uid].total += s.total;
        }

        eliminatedSoFar = [...eliminatedSoFar, ...(ep.eliminatedThisEp || [])];
    }

    const standings = memberUids
        .map(uid => ({ uid, ...cumulative[uid] }))
        .sort((a, b) => b.total - a.total);

    return { standings, perEpisode };
}
