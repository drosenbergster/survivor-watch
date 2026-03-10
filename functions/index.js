import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { parseTDTHtml, findInsiderStatsUrl, parseInsiderHtml, mergeResults, parseFSGHtml, mergeFSGResults, resolvePropBets } from './parsers.js';

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
        const snap = await db.ref(`${SEASON_PATH}/e${i}/eliminatedId`).get();
        if (snap.exists() && snap.val()) prevEliminated.push(snap.val());
    }
    return prevEliminated;
}

async function determineNextEpisode(db) {
    const snap = await db.ref(SEASON_PATH).get();
    if (!snap.exists()) return 1;

    const imported = snap.val();
    const nums = Object.keys(imported)
        .filter(k => k.startsWith('e'))
        .map(k => parseInt(k.slice(1), 10))
        .filter(n => !isNaN(n));

    return nums.length > 0 ? Math.max(...nums) + 1 : 1;
}

async function fetchAndParse(episodeNum) {
    const db = getDatabase();

    // Check if already fetched
    const existing = await db.ref(`${SEASON_PATH}/e${episodeNum}`).get();
    if (existing.exists()) {
        return { skipped: true, reason: `Episode ${episodeNum} already imported` };
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
        eliminationMethod: result.eliminationMethod || 'voted_out',
        immunityWinners: result.immunityWinners || [],
        rewardWinners: result.rewardWinners || [],
        isPostMerge: result.isPostMerge || false,
        minorityVoters: result.minorityVoters || [],
        receivedVotes: result.receivedVotes || [],
        bigMoments: result.bigMoments || {},
        confessionals: result.confessionals || {},
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

    return { success: true, episodeNum, source, eliminatedId: result.eliminatedId };
}

// Scheduled: runs every Thursday at 11:30pm Pacific
export const fetchEpisodeStats = onSchedule(
    {
        schedule: 'every thursday 23:30',
        timeZone: 'America/Los_Angeles',
        region: 'us-central1',
        timeoutSeconds: 120,
        memory: '256MiB',
    },
    async () => {
        const db = getDatabase();
        const episodeNum = await determineNextEpisode(db);

        console.log(`Scheduled fetch: attempting episode ${episodeNum}`);
        const result = await fetchAndParse(episodeNum);
        console.log('Result:', JSON.stringify(result));

        // If the episode isn't available yet, try again Friday morning
        // (the retry is handled by the Friday schedule below)
        return result;
    }
);

// Retry: runs Friday morning in case Thursday night was too early
export const fetchEpisodeStatsRetry = onSchedule(
    {
        schedule: 'every friday 08:00',
        timeZone: 'America/Los_Angeles',
        region: 'us-central1',
        timeoutSeconds: 120,
        memory: '256MiB',
    },
    async () => {
        const db = getDatabase();
        const episodeNum = await determineNextEpisode(db);

        console.log(`Retry fetch: attempting episode ${episodeNum}`);
        const result = await fetchAndParse(episodeNum);
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
        const { episodeNum, force } = request.data || {};

        if (!episodeNum || typeof episodeNum !== 'number') {
            throw new HttpsError('invalid-argument', 'episodeNum is required and must be a number');
        }

        if (force) {
            const db = getDatabase();
            await db.ref(`${SEASON_PATH}/e${episodeNum}`).remove();
        }

        const result = await fetchAndParse(episodeNum);

        if (result.error) {
            throw new HttpsError('internal', result.error);
        }

        return result;
    }
);
