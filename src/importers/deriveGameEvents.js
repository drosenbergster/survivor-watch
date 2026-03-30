import { ALL_CASTAWAYS, TRIBES } from '../data';

function getTribeForContestant(contestantId, tribeOverrides) {
    if (tribeOverrides) {
        for (const [name, members] of Object.entries(tribeOverrides)) {
            if (Array.isArray(members) && members.includes(contestantId)) {
                return name;
            }
        }
    }
    for (const [tribeKey, tribe] of Object.entries(TRIBES)) {
        if (tribe.members.some(m => m.id === contestantId)) return tribeKey;
    }
    return null;
}

function getTribeMembers(tribeKey, remaining, tribeOverrides) {
    const remainingIds = new Set(remaining.map(c => c.id));

    if (tribeOverrides) {
        for (const [name, members] of Object.entries(tribeOverrides)) {
            const matchesKey = name.toLowerCase() === tribeKey.toLowerCase();
            const matchesStaticName = TRIBES[tribeKey]?.name?.toLowerCase() === name.toLowerCase();
            if (matchesKey || matchesStaticName) {
                return (Array.isArray(members) ? members : []).filter(id => remainingIds.has(id));
            }
        }
    }

    return TRIBES[tribeKey]?.members.filter(m => remainingIds.has(m.id)).map(m => m.id) || [];
}

/**
 * Assign a tribal challenge event (immunity or reward) to the correct tribe members.
 * When winnerIds are available, derives winning tribes from those IDs using
 * tribeOverrides, then expands to all tribe members (including sit-outs).
 * Falls back to tribe-key based assignment when winnerIds aren't available.
 */
function assignTribalChallengeEvent(winnerIds, winnerTribeKeys, eventKey, remaining, remainingIds, tribeOverrides, gameEvents, ensure) {
    if (winnerIds && winnerIds.length > 0) {
        const winningTribes = new Set();
        for (const cid of winnerIds) {
            const tribe = getTribeForContestant(cid, tribeOverrides);
            if (tribe) winningTribes.add(tribe);
        }
        for (const tribeKey of winningTribes) {
            const members = getTribeMembers(tribeKey, remaining, tribeOverrides);
            for (const cid of members) {
                ensure(cid);
                if (!gameEvents[cid].includes(eventKey)) {
                    gameEvents[cid].push(eventKey);
                }
            }
        }
    } else {
        for (const tribeKey of winnerTribeKeys) {
            const members = getTribeMembers(tribeKey, remaining, tribeOverrides);
            for (const cid of members) {
                ensure(cid);
                if (!gameEvents[cid].includes(eventKey)) {
                    gameEvents[cid].push(eventKey);
                }
            }
        }
    }
}

/**
 * Derive the full gameEvents object from high-level episode inputs.
 *
 * Supports single or multiple eliminations per episode.
 *
 * @param {Object} input
 * @param {string|null}   input.eliminatedId        - single contestant ID (legacy, use eliminatedIds for multi)
 * @param {string[]}      input.eliminatedIds       - array of eliminated contestant IDs
 * @param {string}        input.eliminationMethod    - default method: 'voted_out' | 'medevac' | 'quit' | 'fire'
 * @param {Object}        input.eliminationMethods   - per-ID overrides: { [contestantId]: method }
 * @param {string[]}      input.immunityWinners      - tribe keys (pre-merge) or contestant IDs (post-merge)
 * @param {string[]}      input.immunityWinnerIds    - contestant IDs who participated in an immunity win (used to derive winning tribes via tribeOverrides)
 * @param {string[]}      input.rewardWinners        - tribe keys (pre-merge) or contestant IDs (post-merge)
 * @param {string[]}      input.rewardWinnerIds      - contestant IDs who participated in a reward win
 * @param {boolean}       input.isPostMerge          - whether the game has merged
 * @param {string[]}      input.minorityVoters       - contestant IDs who voted wrong at tribal
 * @param {string[]}      input.receivedVotes        - contestant IDs who got votes but survived
 * @param {Object}        input.bigMoments           - { [contestantId]: string[] } manual event assignments
 * @param {Object[]}      input.remaining            - array of remaining contestant objects
 * @param {Object|null}   input.tribeOverrides       - { tribeName: [contestantId, ...] } from tribe swaps
 * @returns {{ gameEvents: Object, tribalAttendees: string[] }}
 */
export function deriveGameEvents({
    eliminatedId = null,
    eliminatedIds = [],
    eliminationMethod = 'voted_out',
    eliminationMethods = {},
    immunityWinners = [],
    immunityWinnerIds = [],
    rewardWinners = [],
    rewardWinnerIds = [],
    isPostMerge = false,
    minorityVoters = [],
    receivedVotes = [],
    bigMoments = {},
    remaining = [],
    tribeOverrides = null,
}) {
    const allEliminated = eliminatedIds.length > 0
        ? eliminatedIds
        : (eliminatedId ? [eliminatedId] : []);
    const eliminatedSet = new Set(allEliminated);
    const getMethod = (cid) => eliminationMethods[cid] || eliminationMethod;

    const gameEvents = {};
    const ensure = (cid) => { if (!gameEvents[cid]) gameEvents[cid] = []; };

    const remainingIds = new Set(remaining.map(c => c.id));

    // Tribal Immunity
    if (!isPostMerge) {
        assignTribalChallengeEvent(
            immunityWinnerIds, immunityWinners, 'tribal_immunity',
            remaining, remainingIds, tribeOverrides, gameEvents, ensure,
        );
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
        assignTribalChallengeEvent(
            rewardWinnerIds, rewardWinners, 'tribal_reward',
            remaining, remainingIds, tribeOverrides, gameEvents, ensure,
        );
    } else {
        for (const cid of rewardWinners) {
            if (remainingIds.has(cid)) {
                ensure(cid);
                gameEvents[cid].push('individual_reward');
            }
        }
    }

    // Tribal Council voting -- process each elimination that was a vote/fire
    let tribalAttendees = [];

    for (const elimId of allEliminated) {
        const method = getMethod(elimId);
        const hadTribal = method === 'voted_out' || method === 'fire';
        if (!hadTribal) continue;

        const elimTribe = getTribeForContestant(elimId, tribeOverrides);
        let attendees;

        if (!isPostMerge && elimTribe) {
            attendees = getTribeMembers(elimTribe, remaining, tribeOverrides);
            if (!attendees.includes(elimId)) attendees.push(elimId);
        } else {
            attendees = remaining.map(c => c.id);
        }

        tribalAttendees = [...new Set([...tribalAttendees, ...attendees])];

        const minoritySet = new Set(minorityVoters);
        const receivedSet = new Set(receivedVotes);

        for (const cid of attendees) {
            if (eliminatedSet.has(cid)) continue;
            ensure(cid);

            if (!minoritySet.has(cid) && !gameEvents[cid].includes('voted_correctly')) {
                gameEvents[cid].push('voted_correctly');
            }

            if (receivedSet.has(cid)) {
                if (!gameEvents[cid].includes('survived_with_votes')) {
                    gameEvents[cid].push('survived_with_votes');
                }
            } else if (!gameEvents[cid].includes('attended_tribal_zero') && !gameEvents[cid].includes('survived_with_votes')) {
                gameEvents[cid].push('attended_tribal_zero');
            }
        }
    }

    // Medevac consolation for each eliminated with that method
    for (const elimId of allEliminated) {
        if (getMethod(elimId) === 'medevac') {
            ensure(elimId);
            if (!gameEvents[elimId].includes('medevac')) {
                gameEvents[elimId].push('medevac');
            }
        }
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

    // Survived -- everyone remaining except eliminated contestants
    for (const c of remaining) {
        if (!eliminatedSet.has(c.id)) {
            ensure(c.id);
            if (!gameEvents[c.id].includes('survived')) {
                gameEvents[c.id].push('survived');
            }
        }
    }

    return { gameEvents, tribalAttendees };
}
