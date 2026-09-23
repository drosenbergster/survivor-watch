/**
 * Episode import pipeline: fetch the stat sites, parse them, store the result, and
 * score any league waiting on that episode.
 *
 * This is deliberately free of any Cloud Functions or scheduler imports so it can be
 * driven from either side: the trigger wrappers in index.js, or the plain Node CLI in
 * scripts/run-import.mjs that GitHub Actions uses. Keeping one implementation means the
 * two cannot drift apart.
 */
import {
    parseTDTHtml, findInsiderStatsUrl, parseInsiderHtml, mergeResults,
    parseFSGHtml, mergeFSGResults, resolvePropBets,
} from './parsers.js';
import { autoScoreLeagues } from './scoring.js';

export const SEASON_ID = 's51';
export const SEASON_NUMBER = 51;

// Verified against the live Season 51 index: episode boxscores are published at
// /s51/boxscores/e{N}.htm, the same shape Season 50 used.
const TDT_BASE = `https://www.truedorktimes.com/${SEASON_ID}/boxscores`;
const INSIDER_WEEKLIES = 'https://insidesurvivor.com/category/weeklies';
const FSG_RECAP = `https://www.fantasysurvivorgame.com/episode-recap/season/${SEASON_NUMBER}`;
export const SEASON_PATH = `seasons/${SEASON_ID}/autoImport`;

export const MAX_EPISODE = 20;

function tdtEpisodeUrl(episodeNum) {
    return `${TDT_BASE}/e${episodeNum}.htm`;
}

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
export async function determineNextEpisode(db) {
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

/**
 * Fetch and parse the stat sites for one episode without touching the database.
 * Exposed separately so a dry run can exercise the whole scrape-and-parse path
 * with no credentials.
 */
export async function fetchAndParseEpisode(episodeNum, eliminatedBefore = []) {
    const tdtUrl = tdtEpisodeUrl(episodeNum);
    const tdtHtml = await fetchPage(tdtUrl);

    if (!tdtHtml) {
        return { skipped: true, reason: `TDT boxscore not available yet for episode ${episodeNum}`, tdtUrl };
    }

    let result = parseTDTHtml(tdtHtml, eliminatedBefore);
    if (result.error) return { error: result.error, tdtUrl };

    let source = 'tdt';

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

    return { result, source, tdtUrl };
}

function buildImportData(result, source, episodeNum) {
    return {
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
}

async function resolveBetsForLeagues(db, episodeNum, importData) {
    let leaguesSnap = await db.ref('leagues').orderByChild('season').equalTo(SEASON_ID).get();
    // Fallback: if no leagues have the season field yet, scan all leagues
    if (!leaguesSnap.exists()) {
        leaguesSnap = await db.ref('leagues').get();
    }
    if (!leaguesSnap.exists()) return;

    for (const [leagueId, league] of Object.entries(leaguesSnap.val())) {
        const ep = league.episodes?.[episodeNum];
        if (!ep) continue;

        const propBets = ep.propBets || [];
        if (propBets.length === 0 || !propBets[0].resolveType) continue;

        const betResults = resolvePropBets(importData, propBets);
        const propResults = {};
        for (const bet of propBets) {
            if (betResults[bet.id] !== undefined) propResults[bet.id] = betResults[bet.id];
        }
        await db.ref(`leagues/${leagueId}/episodes/${episodeNum}/autoResolvedPropBets`).set(propResults);
    }
}

export async function fetchAndParse(db, episodeNum, { force = false } = {}) {
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
    const parsed = await fetchAndParseEpisode(episodeNum, eliminatedBefore);
    if (parsed.skipped || parsed.error) return parsed;

    const { result, source } = parsed;

    // Post-merge detection: if FSG merge events flagged this episode as post-merge,
    // great. Otherwise, check if any prior episode was already marked post-merge —
    // once merged, all subsequent episodes are post-merge too.
    if (!result.isPostMerge && episodeNum > 1) {
        for (let i = episodeNum - 1; i >= 1; i--) {
            const prevSnap = await db.ref(`${SEASON_PATH}/e${i}/isPostMerge`).get();
            if (prevSnap.exists() && prevSnap.val() === true) {
                result.isPostMerge = true;
                break;
            }
        }
    }

    const importData = buildImportData(result, source, episodeNum);

    try {
        await resolveBetsForLeagues(db, episodeNum, importData);
    } catch (err) {
        console.warn('Prop bet resolution failed (non-blocking):', err.message);
    }

    await db.ref(`${SEASON_PATH}/e${episodeNum}`).set(importData);

    let scoreResult = { scored: 0 };
    try {
        scoreResult = await autoScoreLeagues(db, episodeNum, importData, resolvePropBets, { forceRescore: force });
        console.log(`Auto-scored ${scoreResult.scored} league(s) for episode ${episodeNum}`);
    } catch (err) {
        console.warn('Auto-score after import failed (non-blocking):', err.message);
    }

    return {
        success: true,
        episodeNum,
        source,
        eliminatedId: result.eliminatedId,
        eliminatedIds: importData.eliminatedIds || [result.eliminatedId].filter(Boolean),
        autoScored: scoreResult.scored,
    };
}
