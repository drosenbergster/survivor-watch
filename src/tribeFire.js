/**
 * Tribe Fire — who is still in the game.
 *
 * A full flame means they watched the latest scored episode, or they finished
 * the newest episode before the host has scored it.
 * A faded flame means they missed only that latest scored episode.
 * Two scored episodes in a row with no watch, and they leave the row.
 * A live pulse means they are watching an episode right now, which also
 * puts a caught-up player back on the row.
 * Before anything is scored, anyone who has lit a torch shows a full flame.
 */

function episodeNumbers(episodes) {
    return Object.keys(episodes || {})
        .map(Number)
        .filter(n => Number.isFinite(n))
        .sort((a, b) => a - b);
}

function scoredEpisodeNumbers(episodes) {
    return episodeNumbers(episodes).filter(n => episodes[n]?.scored || episodes[String(n)]?.scored);
}

function statusFor(watchStatus, episodeNum, uid) {
    const bucket = watchStatus?.[episodeNum] ?? watchStatus?.[String(episodeNum)];
    return bucket?.[uid] || null;
}

function hasWatched(watchStatus, episodeNum, uid) {
    const status = statusFor(watchStatus, episodeNum, uid);
    return status?.watchedAt != null;
}

function isWatchingNow(watchStatus, uid) {
    return Object.values(watchStatus || {}).some(bucket => bucket?.[uid]?.watching === true);
}

function hasLitTorch(watchStatus, uid) {
    return Object.values(watchStatus || {}).some(bucket => {
        const status = bucket?.[uid];
        return !!(status && (status.watching || status.watchedAt != null || status.picksLockedAt != null));
    });
}

function consecutiveMisses(scored, watchStatus, uid) {
    let misses = 0;
    for (let i = scored.length - 1; i >= 0; i--) {
        if (hasWatched(watchStatus, scored[i], uid)) break;
        misses += 1;
    }
    return misses;
}

/**
 * @returns {{ uid: string, name: string, level: 'lit' | 'faded', live: boolean } | null}
 */
export function flameForMember({ episodes, watchStatus, uid, name }) {
    const scored = scoredEpisodeNumbers(episodes);
    const live = isWatchingNow(watchStatus, uid);
    const numbers = episodeNumbers(episodes);
    const newest = numbers.length ? numbers[numbers.length - 1] : null;
    const newestIsUnscored = newest != null && !scored.includes(newest);
    const finishedNewest = newestIsUnscored && hasWatched(watchStatus, newest, uid);

    if (scored.length === 0) {
        if (!hasLitTorch(watchStatus, uid)) return null;
        return { uid, name, level: 'lit', live };
    }

    if (finishedNewest || consecutiveMisses(scored, watchStatus, uid) === 0) {
        return { uid, name, level: 'lit', live };
    }

    const misses = consecutiveMisses(scored, watchStatus, uid);
    if (misses === 1 || live) {
        return { uid, name, level: 'faded', live };
    }

    return null;
}

/**
 * @param {{ episodes: object, watchStatus: object, members: object, selfUid?: string }} input
 * @returns {{ uid: string, name: string, level: 'lit' | 'faded', live: boolean }[]}
 */
export function buildTribeFire({ episodes, watchStatus, members, selfUid }) {
    const flames = Object.entries(members || {})
        .map(([uid, member]) => flameForMember({
            episodes,
            watchStatus,
            uid,
            name: member?.displayName || 'Player',
        }))
        .filter(Boolean);

    const rank = (flame) => (flame.live ? 0 : flame.level === 'lit' ? 1 : 2);
    flames.sort((a, b) => {
        const byRank = rank(a) - rank(b);
        if (byRank !== 0) return byRank;
        if (a.uid === selfUid) return -1;
        if (b.uid === selfUid) return 1;
        return a.name.localeCompare(b.name);
    });

    return flames;
}
