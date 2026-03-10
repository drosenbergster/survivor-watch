import { ALL_CASTAWAYS, TRIBES } from '../data';

function getTribeForContestant(contestantId) {
    for (const [tribeKey, tribe] of Object.entries(TRIBES)) {
        if (tribe.members.some(m => m.id === contestantId)) return tribeKey;
    }
    return null;
}

function getTribeMembers(tribeKey, remaining) {
    const remainingIds = new Set(remaining.map(c => c.id));
    return TRIBES[tribeKey]?.members.filter(m => remainingIds.has(m.id)).map(m => m.id) || [];
}

/**
 * Derive the full gameEvents object from high-level episode inputs.
 *
 * @param {Object} input
 * @param {string|null}   input.eliminatedId        - contestant ID eliminated this episode
 * @param {string}        input.eliminationMethod    - 'voted_out' | 'medevac' | 'quit' | 'fire'
 * @param {string[]}      input.immunityWinners      - tribe keys (pre-merge) or contestant IDs (post-merge)
 * @param {string[]}      input.rewardWinners        - tribe keys (pre-merge) or contestant IDs (post-merge)
 * @param {boolean}       input.isPostMerge          - whether the game has merged
 * @param {string[]}      input.minorityVoters       - contestant IDs who voted wrong at tribal
 * @param {string[]}      input.receivedVotes        - contestant IDs who got votes but survived
 * @param {Object}        input.bigMoments           - { [contestantId]: string[] } manual event assignments
 * @param {Object[]}      input.remaining            - array of remaining contestant objects
 * @returns {{ gameEvents: Object, tribalAttendees: string[] }}
 */
export function deriveGameEvents({
    eliminatedId = null,
    eliminationMethod = 'voted_out',
    immunityWinners = [],
    rewardWinners = [],
    isPostMerge = false,
    minorityVoters = [],
    receivedVotes = [],
    bigMoments = {},
    remaining = [],
}) {
    const gameEvents = {};
    const ensure = (cid) => { if (!gameEvents[cid]) gameEvents[cid] = []; };

    const remainingIds = new Set(remaining.map(c => c.id));

    // Tribal Immunity
    if (!isPostMerge) {
        for (const tribeKey of immunityWinners) {
            const members = getTribeMembers(tribeKey, remaining);
            for (const cid of members) {
                ensure(cid);
                gameEvents[cid].push('tribal_immunity');
            }
        }
    } else {
        for (const cid of immunityWinners) {
            if (remainingIds.has(cid)) {
                ensure(cid);
                gameEvents[cid].push('individual_immunity');
            }
        }
    }

    // Tribal Reward
    if (!isPostMerge) {
        for (const tribeKey of rewardWinners) {
            const members = getTribeMembers(tribeKey, remaining);
            for (const cid of members) {
                ensure(cid);
                gameEvents[cid].push('tribal_reward');
            }
        }
    } else {
        for (const cid of rewardWinners) {
            if (remainingIds.has(cid)) {
                ensure(cid);
                gameEvents[cid].push('individual_reward');
            }
        }
    }

    // Tribal Council voting -- only if someone was voted out (not medevac/quit)
    const hadTribal = eliminatedId && (eliminationMethod === 'voted_out' || eliminationMethod === 'fire');

    let tribalAttendees = [];

    if (hadTribal) {
        const elimTribe = getTribeForContestant(eliminatedId);

        if (!isPostMerge && elimTribe) {
            tribalAttendees = getTribeMembers(elimTribe, remaining);
            if (!tribalAttendees.includes(eliminatedId)) {
                tribalAttendees.push(eliminatedId);
            }
        } else {
            tribalAttendees = remaining.map(c => c.id);
        }

        const minoritySet = new Set(minorityVoters);
        const receivedSet = new Set(receivedVotes);

        for (const cid of tribalAttendees) {
            if (cid === eliminatedId) continue;
            ensure(cid);

            if (!minoritySet.has(cid)) {
                gameEvents[cid].push('voted_correctly');
            }

            if (receivedSet.has(cid)) {
                gameEvents[cid].push('survived_with_votes');
            } else {
                gameEvents[cid].push('attended_tribal_zero');
            }
        }
    }

    // Medevac consolation
    if (eliminatedId && eliminationMethod === 'medevac') {
        ensure(eliminatedId);
        gameEvents[eliminatedId].push('medevac');
    }

    // Big Moments (manual overrides)
    for (const [cid, events] of Object.entries(bigMoments)) {
        ensure(cid);
        for (const evt of events) {
            if (!gameEvents[cid].includes(evt)) {
                gameEvents[cid].push(evt);
            }
        }
    }

    // Survived -- everyone remaining except the eliminated contestant
    for (const c of remaining) {
        if (c.id !== eliminatedId) {
            ensure(c.id);
            if (!gameEvents[c.id].includes('survived')) {
                gameEvents[c.id].push('survived');
            }
        }
    }

    return { gameEvents, tribalAttendees };
}
