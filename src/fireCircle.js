/**
 * Fire Circle — what happened on the couch, once you have finished the episode.
 *
 * `returned` is everyone who marked the episode done, in the order they got back.
 * `stillOut` is everyone whose torch is still lit for it: present, and silent.
 * `lines` only exist once the host has scored, and hold the room's Tree Mail
 * calls split into the players who called it and the players who missed it.
 * Skipping a line leaves you out of it rather than putting you in a pile.
 */

function memberName(members, uid) {
    return members?.[uid]?.displayName || 'Player';
}

function watchBucket(watchStatus, episodeNum) {
    return watchStatus?.[episodeNum] ?? watchStatus?.[String(episodeNum)] ?? {};
}

export function hasFinished(watchStatus, episodeNum, uid) {
    return watchBucket(watchStatus, episodeNum)?.[uid]?.watchedAt != null;
}

function buildSeats({ watchStatus, episodeNum, members }) {
    const bucket = watchBucket(watchStatus, episodeNum);
    const known = new Set(Object.keys(members || {}));

    const returned = Object.entries(bucket)
        .filter(([uid, status]) => known.has(uid) && status?.watchedAt != null)
        .map(([uid, status]) => ({ uid, name: memberName(members, uid), watchedAt: status.watchedAt }))
        .sort((a, b) => a.watchedAt - b.watchedAt);

    const stillOut = Object.entries(bucket)
        .filter(([uid, status]) => known.has(uid) && status?.watchedAt == null && status?.watching === true)
        .map(([uid]) => ({ uid, name: memberName(members, uid) }))
        .sort((a, b) => a.name.localeCompare(b.name));

    return { returned, stillOut };
}

function buildLines({ episode, members }) {
    if (!episode?.scored) return [];

    const bets = episode.propBets || [];
    const results = episode.propBetResults || {};
    const predictions = episode.predictions || {};

    return bets
        .map((bet) => {
            const answer = results[bet.id];
            if (typeof answer !== 'boolean') return null;

            const calledIt = [];
            const missedIt = [];
            for (const [uid, pred] of Object.entries(predictions)) {
                if (!members?.[uid]) continue;
                const call = pred?.propBets?.[bet.id];
                if (typeof call !== 'boolean') continue;
                (call === answer ? calledIt : missedIt).push({ uid, name: memberName(members, uid) });
            }
            if (calledIt.length === 0 && missedIt.length === 0) return null;

            const byName = (a, b) => a.name.localeCompare(b.name);
            calledIt.sort(byName);
            missedIt.sort(byName);

            return { id: bet.id, text: bet.text, answer, calledIt, missedIt };
        })
        .filter(Boolean);
}

/**
 * @returns {{ returned: object[], stillOut: object[], lines: object[] } | null}
 *   null when the viewer has not finished the episode, which keeps the circle
 *   closed to anyone who could still be spoiled by it.
 */
export function buildFireCircle({ episode, episodeNum, watchStatus, members, selfUid }) {
    if (!selfUid || !hasFinished(watchStatus, episodeNum, selfUid)) return null;

    const { returned, stillOut } = buildSeats({ watchStatus, episodeNum, members });
    return { returned, stillOut, lines: buildLines({ episode, members }) };
}
