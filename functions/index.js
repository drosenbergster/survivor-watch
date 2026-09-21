/**
 * Cloud Functions triggers for the episode importer.
 *
 * These require the Blaze plan to deploy. While the project is on the free Spark plan
 * the same pipeline runs from GitHub Actions instead — see .github/workflows/import-episode.yml
 * and scripts/run-import.mjs, which call the identical code in importer.js.
 */
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { determineNextEpisode, fetchAndParse, SEASON_PATH, MAX_EPISODE } from './importer.js';

initializeApp();

// Scheduled: runs Thu 6pm and Thu 11pm (Pacific).
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
        const { episodeNum, reason } = await determineNextEpisode(db);

        console.log(`Scheduled fetch: episode ${episodeNum} (${reason})`);
        const result = await fetchAndParse(db, episodeNum, { force: false });
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
        const result = await fetchAndParse(db, episodeNum, { force: false });
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

        if (!episodeNum || typeof episodeNum !== 'number' || episodeNum < 1 || episodeNum > MAX_EPISODE) {
            throw new HttpsError('invalid-argument', `episodeNum is required and must be a number between 1 and ${MAX_EPISODE}`);
        }

        const db = getDatabase();

        if (force) {
            await db.ref(`${SEASON_PATH}/e${episodeNum}`).remove();
        }

        const result = await fetchAndParse(db, episodeNum, { force: !!force });

        if (result.error) {
            throw new HttpsError('internal', result.error);
        }

        return result;
    }
);
