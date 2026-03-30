/**
 * Server-side scoring logic for Cloud Functions.
 * Mirrors the client-side deriveGameEvents + getEffectiveTribeAssignments
 * so episodes can be scored without the host opening the app.
 */

const TRIBES = {
    cila: {
        name: 'Cila',
        members: [
            { id: 'rick_devens' }, { id: 'cirie_fields' }, { id: 'emily_flippen' },
            { id: 'christian_hubicki' }, { id: 'joe_hunter' }, { id: 'jenna_lewis' },
            { id: 'savannah_louie' }, { id: 'ozzy_lusth' },
        ],
    },
    vatu: {
        name: 'Vatu',
        members: [
            { id: 'aubry_bracco' }, { id: 'q_burdette' }, { id: 'colby_donaldson' },
            { id: 'kyle_fraser' }, { id: 'angelina_keeley' }, { id: 'stephenie_lagrossa' },
            { id: 'genevieve_mushaluk' }, { id: 'rizo_velovic' },
        ],
    },
    kalo: {
        name: 'Kalo',
        members: [
            { id: 'charlie_davis' }, { id: 'tiffany_ervin' }, { id: 'chrissy_hofbeck' },
            { id: 'kamilla_karthigesu' }, { id: 'dee_valladares' }, { id: 'coach_wade' },
            { id: 'mike_white' }, { id: 'jonathan_young' },
        ],
    },
};

const ALL_IDS = Object.values(TRIBES).flatMap(t => t.members.map(m => m.id));

export function getEffectiveTribeAssignments(tribeSwaps, episodeNum) {
    if (!tribeSwaps) return null;
    const swapEps = Object.keys(tribeSwaps)
        .filter(k => k !== 'merge')
        .map(Number)
        .filter(n => !isNaN(n) && n <= episodeNum)
        .sort((a, b) => b - a);
    if (swapEps.length === 0) return null;
    return tribeSwaps[swapEps[0]]?.assignments || null;
}

function getTribeForContestant(cid, tribeOverrides) {
    if (tribeOverrides) {
        for (const [name, members] of Object.entries(tribeOverrides)) {
            if (Array.isArray(members) && members.includes(cid)) return name;
        }
    }
    for (const [key, tribe] of Object.entries(TRIBES)) {
        if (tribe.members.some(m => m.id === cid)) return key;
    }
    return null;
}

function getTribeMembers(tribeKey, remainingIds, tribeOverrides) {
    if (tribeOverrides) {
        for (const [name, members] of Object.entries(tribeOverrides)) {
            const matchesKey = name.toLowerCase() === tribeKey.toLowerCase();
            const matchesName = TRIBES[tribeKey]?.name?.toLowerCase() === name.toLowerCase();
            if (matchesKey || matchesName) {
                return (Array.isArray(members) ? members : []).filter(id => remainingIds.has(id));
            }
        }
    }
    return TRIBES[tribeKey]?.members.filter(m => remainingIds.has(m.id)).map(m => m.id) || [];
}

function assignTribalChallengeEvent(winnerIds, winnerTribeKeys, eventKey, remainingIds, tribeOverrides, gameEvents, ensure) {
    if (winnerIds && winnerIds.length > 0) {
        const winningTribes = new Set();
        for (const cid of winnerIds) {
            const tribe = getTribeForContestant(cid, tribeOverrides);
            if (tribe) winningTribes.add(tribe);
        }
        for (const tribeKey of winningTribes) {
            for (const cid of getTribeMembers(tribeKey, remainingIds, tribeOverrides)) {
                ensure(cid);
                if (!gameEvents[cid].includes(eventKey)) gameEvents[cid].push(eventKey);
            }
        }
    } else {
        for (const tribeKey of winnerTribeKeys) {
            for (const cid of getTribeMembers(tribeKey, remainingIds, tribeOverrides)) {
                ensure(cid);
                if (!gameEvents[cid].includes(eventKey)) gameEvents[cid].push(eventKey);
            }
        }
    }
}

export function deriveGameEvents({
    eliminatedIds = [],
    eliminatedId = null,
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
    const remainingIds = new Set(remaining);

    if (!isPostMerge) {
        assignTribalChallengeEvent(immunityWinnerIds, immunityWinners, 'tribal_immunity', remainingIds, tribeOverrides, gameEvents, ensure);
        assignTribalChallengeEvent(rewardWinnerIds, rewardWinners, 'tribal_reward', remainingIds, tribeOverrides, gameEvents, ensure);
    } else {
        for (const cid of immunityWinners) {
            if (remainingIds.has(cid)) { ensure(cid); gameEvents[cid].push('individual_immunity'); }
        }
        for (const cid of rewardWinners) {
            if (remainingIds.has(cid)) { ensure(cid); gameEvents[cid].push('individual_reward'); }
        }
    }

    for (const elimId of allEliminated) {
        const method = getMethod(elimId);
        if (method !== 'voted_out' && method !== 'fire') continue;

        const elimTribe = getTribeForContestant(elimId, tribeOverrides);
        let attendees;
        if (!isPostMerge && elimTribe) {
            attendees = getTribeMembers(elimTribe, remainingIds, tribeOverrides);
            if (!attendees.includes(elimId)) attendees.push(elimId);
        } else {
            attendees = [...remainingIds];
        }

        const minoritySet = new Set(minorityVoters);
        const receivedSet = new Set(receivedVotes);

        for (const cid of attendees) {
            if (eliminatedSet.has(cid)) continue;
            ensure(cid);
            if (!minoritySet.has(cid) && !gameEvents[cid].includes('voted_correctly')) {
                gameEvents[cid].push('voted_correctly');
            }
            if (receivedSet.has(cid)) {
                if (!gameEvents[cid].includes('survived_with_votes')) gameEvents[cid].push('survived_with_votes');
            } else if (!gameEvents[cid].includes('attended_tribal_zero') && !gameEvents[cid].includes('survived_with_votes')) {
                gameEvents[cid].push('attended_tribal_zero');
            }
        }
    }

    for (const elimId of allEliminated) {
        if (getMethod(elimId) === 'medevac') {
            ensure(elimId);
            if (!gameEvents[elimId].includes('medevac')) gameEvents[elimId].push('medevac');
        }
    }

    for (const [cid, events] of Object.entries(bigMoments)) {
        ensure(cid);
        for (const evt of events) {
            if (!gameEvents[cid].includes(evt)) gameEvents[cid].push(evt);
        }
    }

    for (const cid of remaining) {
        if (!eliminatedSet.has(cid)) {
            ensure(cid);
            if (!gameEvents[cid].includes('survived')) gameEvents[cid].push('survived');
        }
    }

    return { gameEvents };
}

/**
 * Auto-score all leagues that have an unscored episode matching episodeNum.
 * Called by the Cloud Function after successfully importing episode data.
 * @param {Object} db - Firebase RTDB instance
 * @param {number} episodeNum - episode number to score
 * @param {Object} importData - merged import data (TDT+Insider+FSG)
 * @param {Function} resolvePropBets - bet resolver from parsers.js
 */
export async function autoScoreLeagues(db, episodeNum, importData, resolvePropBets, { forceRescore = false } = {}) {
    const leaguesSnap = await db.ref('leagues').get();
    if (!leaguesSnap.exists()) return { scored: 0 };

    const eliminatedIds = importData.eliminatedIds?.length > 0
        ? importData.eliminatedIds
        : (importData.eliminatedId ? [importData.eliminatedId] : []);

    if (eliminatedIds.length === 0) return { scored: 0, reason: 'no elimination data' };

    let scored = 0;

    for (const [leagueId, league] of Object.entries(leaguesSnap.val())) {
        const ep = league.episodes?.[episodeNum];
        if (!ep) continue;
        if (ep.scored && !forceRescore) continue;

        try {
            const tribeSwaps = league.tribeSwaps || {};
            const tribeOverrides = getEffectiveTribeAssignments(tribeSwaps, episodeNum);

            const currentEliminated = league.eliminated || [];
            const remaining = ALL_IDS.filter(id => !currentEliminated.includes(id));

            const { gameEvents } = deriveGameEvents({
                eliminatedIds,
                eliminationMethod: importData.eliminationMethod || 'voted_out',
                eliminationMethods: importData.eliminationMethods || {},
                immunityWinners: importData.immunityWinners || [],
                immunityWinnerIds: importData.immunityWinnerIds || [],
                rewardWinners: importData.rewardWinners || [],
                rewardWinnerIds: importData.rewardWinnerIds || [],
                isPostMerge: importData.isPostMerge || false,
                minorityVoters: importData.minorityVoters || [],
                receivedVotes: importData.receivedVotes || [],
                bigMoments: importData.bigMoments || {},
                remaining,
                tribeOverrides,
            });

            const propBets = ep.propBets || [];
            const sideBets = ep.sideBets || [];
            let propBetResults = ep.autoResolvedPropBets || {};
            let sideBetResults = ep.autoResolvedSideBets || {};

            if (resolvePropBets) {
                if (Object.keys(propBetResults).length === 0 && propBets.length > 0 && propBets[0]?.resolveType) {
                    propBetResults = resolvePropBets(importData, propBets);
                }
                if (Object.keys(sideBetResults).length === 0 && sideBets.length > 0 && sideBets[0]?.resolveType) {
                    sideBetResults = resolvePropBets(importData, sideBets);
                }
            }

            const updates = {
                [`leagues/${leagueId}/episodes/${episodeNum}/gameEvents`]: gameEvents,
                [`leagues/${leagueId}/episodes/${episodeNum}/propBetResults`]: propBetResults,
                [`leagues/${leagueId}/episodes/${episodeNum}/sideBetResults`]: sideBetResults,
                [`leagues/${leagueId}/episodes/${episodeNum}/eliminatedThisEp`]: eliminatedIds,
                [`leagues/${leagueId}/episodes/${episodeNum}/eliminationMethod`]: importData.eliminationMethod || 'voted_out',
                [`leagues/${leagueId}/episodes/${episodeNum}/scored`]: true,
                [`leagues/${leagueId}/episodes/${episodeNum}/scoredAt`]: Date.now(),
                [`leagues/${leagueId}/episodes/${episodeNum}/status`]: 'scored',
                [`leagues/${leagueId}/episodes/${episodeNum}/autoScoredBy`]: importData.source || 'auto',
            };

            // Rebuild eliminated list from all episodes' eliminatedThisEp arrays
            // to avoid stale entries from previous incorrect scoring runs
            const allEps = league.episodes || {};
            const rebuiltEliminated = new Set(league.preSeasonEliminated || []);
            for (const [epN, epData] of Object.entries(allEps)) {
                const epElims = Number(epN) === episodeNum
                    ? eliminatedIds
                    : (epData.eliminatedThisEp || []);
                for (const id of epElims) rebuiltEliminated.add(id);
            }
            updates[`leagues/${leagueId}/eliminated`] = [...rebuiltEliminated];

            for (const [path, value] of Object.entries(updates)) {
                await db.ref(path).set(value);
            }

            scored++;
            console.log(`Auto-scored episode ${episodeNum} for league ${leagueId}`);
        } catch (err) {
            console.warn(`Failed to auto-score league ${leagueId}:`, err.message);
        }
    }

    return { scored };
}
