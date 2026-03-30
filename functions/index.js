import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { parseTDTHtml, findInsiderStatsUrl, parseInsiderHtml, mergeResults, parseFSGHtml, mergeFSGResults, resolvePropBets } from './parsers.js';
import { autoScoreLeagues } from './scoring.js';

initializeApp();

const TDT_BASE = 'https://www.truedorktimes.com/s50/boxscores';
const INSIDER_WEEKLIES = 'https://insidesurvivor.com/category/weeklies';
const FSG_RECAP = 'https://www.fantasysurvivorgame.com/episode-recap/season/50';
const SEASON_PATH = 'seasons/s50/autoImport';

async function fetchPage(url) {
    const res = await fetch(url, {
        headers: { 'User-Agent': 'SurvivorWatchPartyApp/1.0' },
    });
    if (!res.ok) return null;
    return res.text();
}

async function getEliminatedBefore(db, episodeNum) {
    const prevEliminated = [];
    for (let i = 1; i < episodeNum; i++) {
        const idsSnap = await db.ref(`${SEASON_PATH}/e${i}/eliminatedIds`).get();
        if (idsSnap.exists() && Array.isArray(idsSnap.val())) {
            prevEliminated.push(...idsSnap.val());
        } else {
            const snap = await db.ref(`${SEASON_PATH}/e${i}/eliminatedId`).get();
            if (snap.exists() && snap.val()) prevEliminated.push(snap.val());
        }
    }
    return prevEliminated;
}

/**
 * Find the next episode to process. Checks for:
 * 1. Episodes that were imported but have unscored leagues (need re-scoring)
 * 2. The next episode number that hasn't been imported yet
 */
async function determineNextEpisode(db) {
    const snap = await db.ref(SEASON_PATH).get();
    if (!snap.exists()) return { episodeNum: 1, reason: 'no_imports' };

    const imported = snap.val();
    const nums = Object.keys(imported)
        .filter(k => k.startsWith('e'))
        .map(k => parseInt(k.slice(1), 10))
        .filter(n => !isNaN(n))
        .sort((a, b) => a - b);

    if (nums.length === 0) return { episodeNum: 1, reason: 'no_imports' };

    // Check if any imported episodes still have unscored leagues
    const leaguesSnap = await db.ref('leagues').get();
    if (leaguesSnap.exists()) {
        for (const epNum of nums) {
            for (const [, league] of Object.entries(leaguesSnap.val())) {
                const ep = league.episodes?.[epNum];
                if (ep && !ep.scored) {
                    return { episodeNum: epNum, reason: 'unscored_leagues', hasImport: true };
                }
            }
        }
    }

    return { episodeNum: Math.max(...nums) + 1, reason: 'next_new' };
}

async function fetchAndParse(episodeNum, { force = false } = {}) {
    const db = getDatabase();

    // Check if already fetched — allow re-processing if forced or if leagues are unscored
    const existing = await db.ref(`${SEASON_PATH}/e${episodeNum}`).get();
    if (existing.exists() && !force) {
        const importData = existing.val();
        const scoreResult = await autoScoreLeagues(db, episodeNum, importData, resolvePropBets);
        if (scoreResult.scored > 0) {
            return { alreadyImported: true, autoScored: scoreResult.scored, episodeNum };
        }
        return { skipped: true, reason: `Episode ${episodeNum} already imported and all leagues scored` };
    }

    const eliminatedBefore = await getEliminatedBefore(db, episodeNum);

    // Fetch TDT boxscore
    const tdtUrl = `${TDT_BASE}/e${episodeNum}.htm`;
    const tdtHtml = await fetchPage(tdtUrl);

    if (!tdtHtml) {
        return { skipped: true, reason: `TDT boxscore not available yet for episode ${episodeNum}` };
    }

    let result = parseTDTHtml(tdtHtml, eliminatedBefore);
    if (result.error) {
        return { error: result.error };
    }

    let source = 'tdt';

    // Try InsideSurvivor
    try {
        const weekliesHtml = await fetchPage(INSIDER_WEEKLIES);
        if (weekliesHtml) {
            const statsUrl = findInsiderStatsUrl(weekliesHtml, episodeNum);
            if (statsUrl) {
                const fullUrl = statsUrl.startsWith('http') ? statsUrl : `https://insidesurvivor.com${statsUrl}`;
                const articleHtml = await fetchPage(fullUrl);
                if (articleHtml) {
                    const insiderData = parseInsiderHtml(articleHtml);
                    result = mergeResults(result, insiderData);
                    result.confessionals = insiderData.confessionals;
                    source = 'tdt+insider';
                }
            }
        }
    } catch (err) {
        console.warn('InsideSurvivor fetch failed (non-blocking):', err.message);
    }

    // Try FantasySurvivorGame for camp life and journey events
    try {
        const fsgHtml = await fetchPage(FSG_RECAP);
        if (fsgHtml) {
            const fsgData = parseFSGHtml(fsgHtml, episodeNum);
            if (fsgData) {
                result = mergeFSGResults(result, fsgData);
                source += '+fsg';
            }
        }
    } catch (err) {
        console.warn('FSG fetch failed (non-blocking):', err.message);
    }

    // Store in RTDB
    const importData = {
        fetchedAt: Date.now(),
        source,
        episodeNum,
        eliminatedId: result.eliminatedId || null,
        eliminatedIds: result.eliminatedIds || (result.eliminatedId ? [result.eliminatedId] : []),
        eliminationMethod: result.eliminationMethod || 'voted_out',
        eliminationMethods: result.eliminationMethods || {},
        immunityWinners: result.immunityWinners || [],
        immunityWinnerIds: result.immunityWinnerIds || [],
        rewardWinners: result.rewardWinners || [],
        rewardWinnerIds: result.rewardWinnerIds || [],
        isPostMerge: result.isPostMerge || false,
        minorityVoters: result.minorityVoters || [],
        receivedVotes: result.receivedVotes || [],
        bigMoments: result.bigMoments || {},
        confessionals: result.confessionals || {},
        voteCountMap: result.voteCountMap || {},
    };

    // Resolve prop/side bets for all leagues referencing this season
    try {
        let leaguesSnap = await db.ref('leagues').orderByChild('season').equalTo('s50').get();
        // Fallback: if no leagues have the season field yet, scan all leagues
        if (!leaguesSnap.exists()) {
            leaguesSnap = await db.ref('leagues').get();
        }
        if (leaguesSnap.exists()) {
            for (const [leagueId, league] of Object.entries(leaguesSnap.val())) {
                const ep = league.episodes?.[episodeNum];
                if (!ep) continue;

                const propBets = ep.propBets || [];
                const sideBets = ep.sideBets || [];
                const allBets = [...propBets, ...sideBets];

                if (allBets.length > 0 && allBets[0].resolveType) {
                    const betResults = resolvePropBets(importData, allBets);
                    const propResults = {};
                    const sideResults = {};
                    for (const bet of propBets) {
                        if (betResults[bet.id] !== undefined) propResults[bet.id] = betResults[bet.id];
                    }
                    for (const bet of sideBets) {
                        if (betResults[bet.id] !== undefined) sideResults[bet.id] = betResults[bet.id];
                    }
                    await db.ref(`leagues/${leagueId}/episodes/${episodeNum}/autoResolvedPropBets`).set(propResults);
                    await db.ref(`leagues/${leagueId}/episodes/${episodeNum}/autoResolvedSideBets`).set(sideResults);
                }
            }
        }
    } catch (err) {
        console.warn('Prop bet resolution failed (non-blocking):', err.message);
    }

    await db.ref(`${SEASON_PATH}/e${episodeNum}`).set(importData);

    // Auto-score all leagues that have an unscored episode for this number
    let scoreResult = { scored: 0 };
    try {
        scoreResult = await autoScoreLeagues(db, episodeNum, importData, resolvePropBets, { forceRescore: force });
        console.log(`Auto-scored ${scoreResult.scored} league(s) for episode ${episodeNum}`);
    } catch (err) {
        console.warn('Auto-score after import failed (non-blocking):', err.message);
    }

    return { success: true, episodeNum, source, eliminatedId: result.eliminatedId, eliminatedIds: importData.eliminatedIds || [result.eliminatedId].filter(Boolean), autoScored: scoreResult.scored };
}

// Scheduled: runs Thu 6pm, Thu 11pm, Fri 8am, Fri 6pm (Pacific)
// Multiple windows to catch when stats sites publish results.
export const fetchEpisodeStats = onSchedule(
    {
        schedule: '0 18,23 * * 4',
        timeZone: 'America/Los_Angeles',
        region: 'us-central1',
        timeoutSeconds: 120,
        memory: '256MiB',
    },
    async () => {
        const db = getDatabase();
        const { episodeNum, reason, hasImport } = await determineNextEpisode(db);

        console.log(`Scheduled fetch: episode ${episodeNum} (${reason})`);
        const result = await fetchAndParse(episodeNum, { force: false });
        console.log('Result:', JSON.stringify(result));
        return result;
    }
);

// Retry: runs Friday morning & evening as fallback
export const fetchEpisodeStatsRetry = onSchedule(
    {
        schedule: '0 8,18 * * 5',
        timeZone: 'America/Los_Angeles',
        region: 'us-central1',
        timeoutSeconds: 120,
        memory: '256MiB',
    },
    async () => {
        const db = getDatabase();
        const { episodeNum, reason } = await determineNextEpisode(db);

        console.log(`Retry fetch: episode ${episodeNum} (${reason})`);
        const result = await fetchAndParse(episodeNum, { force: false });
        console.log('Result:', JSON.stringify(result));
        return result;
    }
);

// Callable: host can manually trigger from AdminScoring UI
export const fetchEpisodeStatsManual = onCall(
    {
        region: 'us-central1',
        timeoutSeconds: 120,
        memory: '256MiB',
    },
    async (request) => {
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be signed in');
        }

        const { episodeNum, force } = request.data || {};

        if (!episodeNum || typeof episodeNum !== 'number' || episodeNum < 1 || episodeNum > 20) {
            throw new HttpsError('invalid-argument', 'episodeNum is required and must be a number between 1 and 20');
        }

        if (force) {
            const db = getDatabase();
            await db.ref(`${SEASON_PATH}/e${episodeNum}`).remove();
        }

        const result = await fetchAndParse(episodeNum, { force: !!force });

        if (result.error) {
            throw new HttpsError('internal', result.error);
        }

        return result;
    }
);
