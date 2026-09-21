#!/usr/bin/env node
/**
 * Runs the episode importer outside Cloud Functions, so it works on Firebase's free
 * Spark plan. Driven by GitHub Actions on a schedule, and runnable by hand.
 *
 * Usage:
 *   node scripts/run-import.mjs                 # auto-detect which episode to do
 *   node scripts/run-import.mjs --episode 1     # a specific episode
 *   node scripts/run-import.mjs --episode 1 --force   # re-import and re-score
 *   node scripts/run-import.mjs --episode 1 --dry-run # scrape and parse, write nothing
 *
 * Credentials (not needed for --dry-run):
 *   FIREBASE_SERVICE_ACCOUNT   service account JSON, as a string
 *   FIREBASE_DATABASE_URL      e.g. https://<project>-default-rtdb.firebaseio.com
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import {
    determineNextEpisode, fetchAndParse, fetchAndParseEpisode, MAX_EPISODE,
} from '../importer.js';

function parseArgs(argv) {
    const args = { force: false, dryRun: false, episode: null };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--force') args.force = true;
        else if (a === '--dry-run' || a === '--dryRun') args.dryRun = true;
        else if (a === '--episode' || a === '-e') args.episode = parseInt(argv[++i], 10);
        else if (a.startsWith('--episode=')) args.episode = parseInt(a.split('=')[1], 10);
    }
    return args;
}

const args = parseArgs(process.argv.slice(2));

if (args.episode !== null && (isNaN(args.episode) || args.episode < 1 || args.episode > MAX_EPISODE)) {
    console.error(`--episode must be a number between 1 and ${MAX_EPISODE}`);
    process.exit(1);
}

// A dry run only touches the public stat sites, so it needs no credentials at all.
if (args.dryRun) {
    const episodeNum = args.episode ?? 1;
    console.log(`Dry run: episode ${episodeNum} (no database writes)`);
    const parsed = await fetchAndParseEpisode(episodeNum, []);

    if (parsed.error) {
        console.error(`Parse error: ${parsed.error}`);
        process.exit(1);
    }
    if (parsed.skipped) {
        console.log(`Not available yet: ${parsed.reason}`);
        console.log(`  tried ${parsed.tdtUrl}`);
        process.exit(0);
    }

    const r = parsed.result;
    console.log(`Source: ${parsed.source}`);
    console.log(`  castaways parsed:  ${(r.parsed || []).length}`);
    console.log(`  eliminated:        ${(r.eliminatedIds || []).join(', ') || '(none yet)'}`);
    console.log(`  immunity winners:  ${(r.immunityWinnerIds || []).join(', ') || '(none yet)'}`);
    console.log(`  reward winners:    ${(r.rewardWinnerIds || []).join(', ') || '(none yet)'}`);
    console.log(`  post-merge:        ${!!r.isPostMerge}`);
    const unresolved = (r.parsed || []).filter(row => !row.id);
    console.log(`  unresolved names:  ${unresolved.length ? JSON.stringify(unresolved) : 'none'}`);
    process.exit(0);
}

const rawCreds = process.env.FIREBASE_SERVICE_ACCOUNT;
const databaseURL = process.env.FIREBASE_DATABASE_URL;

if (!rawCreds) {
    console.error('FIREBASE_SERVICE_ACCOUNT is not set. Use --dry-run to test without credentials.');
    process.exit(1);
}
if (!databaseURL) {
    console.error('FIREBASE_DATABASE_URL is not set.');
    process.exit(1);
}

let serviceAccount;
try {
    serviceAccount = JSON.parse(rawCreds);
} catch {
    console.error('FIREBASE_SERVICE_ACCOUNT is not valid JSON.');
    process.exit(1);
}

initializeApp({ credential: cert(serviceAccount), databaseURL });
const db = getDatabase();

let episodeNum = args.episode;
if (episodeNum === null) {
    const next = await determineNextEpisode(db);
    episodeNum = next.episodeNum;
    console.log(`Auto-detected episode ${episodeNum} (${next.reason})`);
}

if (args.force) {
    console.log(`Force: clearing existing import for episode ${episodeNum}`);
    const { SEASON_PATH } = await import('../importer.js');
    await db.ref(`${SEASON_PATH}/e${episodeNum}`).remove();
}

const result = await fetchAndParse(db, episodeNum, { force: args.force });
console.log('Result:', JSON.stringify(result, null, 2));

if (result.error) process.exit(1);

// A boxscore that is not published yet is the normal case when this runs on a
// schedule, so it must not be treated as a failure.
process.exit(0);
