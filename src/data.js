// Survivor Season 51 — "The Open Era" — 21 new castaways, two tribes, Fiji.
// Premiere: Wed Sep 23 2026 (two hours). Weekly episodes are 90 minutes from Sep 30.
import { COLORS } from './theme';

export const SEASON_ID = 's51';
export const SEASON_NUMBER = 51;
export const SEASON_LABEL = 'Season 51';
export const SEASON_TAGLINE = 'The Open Era';

// One watch party per season, and everyone who signs in lands in it. The id is
// derived rather than generated so any client can reach it without a lookup.
// `leagues/` is the historical Firebase path and is kept for data continuity.
export const WATCH_PARTY_ID = `${SEASON_ID}-global`;
export const WATCH_PARTY_NAME = `${SEASON_LABEL} Watch Party`;

// Production assigns the starting tribes and reveals them in the premiere, so we
// ship with every castaway unassigned. The host sorts them from Rules → Tribe
// Management after watching Episode 1; those assignments override this file.
//
// `aliases` exist because the stat sites we import from use short names that do not
// always match the first word of the official name: True Dork Times lists "Dan" and
// "Thien An", Fantasy Survivor Game lists "Kilby" and "Thien An". `fsgId` is that
// site's numeric contestant id.
export const CONTESTANTS = [
    { id: 'aaliyah_puglia', name: 'Aaliyah Puglia', age: 24, occupation: 'Chef', short: 'Chef', from: 'Providence, RI', fsgId: '536' },
    { id: 'alexis_levine', name: 'Alexis Levine', age: 34, occupation: 'Criminal defense attorney', short: 'Attorney', from: 'Atlanta, GA', fsgId: '537' },
    { id: 'an_nguyen', name: 'An "Thien An" Nguyen', age: 24, occupation: 'Medical student', short: 'Med student', from: 'Fort Worth, TX', fsgId: '538', aliases: ['thien an', 'thien', 'an nguyen'] },
    { id: 'ana_sani', name: 'Ana Sani', age: 34, occupation: 'Voice actress', short: 'Voice actress', from: 'Toronto, ON', fsgId: '539' },
    { id: 'jelly_loblack', name: 'Angelica "Jelly" Loblack', age: 29, occupation: 'Sociology professor', short: 'Professor', from: 'Bloomington, IN', fsgId: '540', aliases: ['jelly', 'angelica', 'angelica loblack'] },
    { id: 'brady_booker', name: 'Brady Booker', age: 27, occupation: 'Pro wrestler', short: 'Pro wrestler', from: 'Knoxville, TN', fsgId: '541' },
    { id: 'carter_krull', name: 'Carter Krull', age: 24, occupation: 'Livestock farmer', short: 'Farmer', from: 'Sioux Falls, SD', fsgId: '542' },
    { id: 'cristian_chavez', name: 'Cristian Chavez', age: 26, occupation: 'Head of HR', short: 'Head of HR', from: 'Salt Lake City, UT', fsgId: '543' },
    { id: 'danny_kilby', name: 'Danny "Kilby" Kilby', age: 30, occupation: 'Game designer', short: 'Game designer', from: 'London, ON', fsgId: '544', aliases: ['kilby', 'dan', 'danny', 'dan kilby'] },
    { id: 'devin_way', name: 'Devin Way', age: 33, occupation: 'Actor', short: 'Actor', from: 'Los Angeles, CA', fsgId: '545' },
    { id: 'eric_macksoud', name: 'Eric Macksoud', age: 34, occupation: 'Mental health counselor', short: 'Counselor', from: 'Windsor Locks, CT', fsgId: '546' },
    { id: 'jenna_doore', name: 'Jenna Doore', age: 30, occupation: 'Wedding photographer', short: 'Photographer', from: 'Toledo, OH', fsgId: '547' },
    { id: 'kristin_flickinger', name: 'Kristin Flickinger', age: 49, occupation: 'Crisis management', short: 'Crisis mgmt', from: 'Santa Barbara, CA', fsgId: '548' },
    { id: 'lewis_kelly', name: 'Lewis Kelly', age: 28, occupation: 'Farmer', short: 'Farmer', from: 'Puerto Rico', fsgId: '549' },
    { id: 'linnea_capobianco', name: 'Linnea Capobianco', age: 25, occupation: 'Entrepreneur', short: 'Entrepreneur', from: 'Jersey City, NJ', fsgId: '550' },
    { id: 'maggie_nestor', name: 'Maggie Nestor', age: 40, occupation: 'Farmer', short: 'Farmer', from: 'Charlestown, WV', fsgId: '551' },
    { id: 'mike_pinsky', name: 'Mike Pinsky', age: 32, occupation: '', short: 'NYC', from: 'New York, NY', fsgId: '552' },
    { id: 'ori_jean_charles', name: 'Ori Jean-Charles', age: 27, occupation: '', short: 'Spring Valley', from: 'Spring Valley, NY', fsgId: '553', aliases: ['ori', 'ori jean charles'] },
    { id: 'patt_cannaday', name: 'Patt Cannaday', age: 33, occupation: '', short: 'Washington DC', from: 'Washington, DC', fsgId: '554', aliases: ['pat'] },
    { id: 'rob_antonson', name: 'Rob Antonson', age: 40, occupation: 'Airline gate agent', short: 'Gate agent', from: 'Cumberland, RI', fsgId: '555' },
    { id: 'sharonda_cox', name: 'Sharonda Cox', age: 34, occupation: 'Resident, OBGYN', short: 'OBGYN resident', from: 'Richmond, KY', fsgId: '556' },
];

/**
 * Lowercased name/alias → contestant id, for matching names scraped from stat sites.
 * Covers the official full name, the first word of it, and any explicit aliases.
 */
export const NAME_LOOKUP = (() => {
    const map = {};
    for (const c of CONTESTANTS) {
        map[c.name.toLowerCase()] = c.id;
        map[c.name.split(' ')[0].toLowerCase()] = c.id;
        // "An \"Thien An\" Nguyen" → "an nguyen"
        const plain = c.name.replace(/"[^"]*"\s*/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
        map[plain] = c.id;
        for (const alias of (c.aliases || [])) map[alias.toLowerCase()] = c.id;
    }
    return map;
})();

export function resolveCastawayName(rawName) {
    if (!rawName) return null;
    const clean = String(rawName).replace(/[*'"]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    return NAME_LOOKUP[clean] || NAME_LOOKUP[clean.split(' ')[0]] || null;
}

// `seasons` is rendered as a subtitle wherever a castaway appears. For a rookie
// season there is no season history, so we surface who they are instead.
for (const c of CONTESTANTS) {
    c.seasons = c.occupation ? `${c.occupation} · ${c.age}` : `${c.from} · ${c.age}`;
}

// Tribe names are revealed in the premiere — fill these in once they are known.
// `unassigned` holds everyone until then so that every screen still renders.
export const TRIBES = {
    tribeOne: { name: 'Tribe One', color: 'cila', members: [] },
    tribeTwo: { name: 'Tribe Two', color: 'kalo', members: [] },
    unassigned: { name: 'Castaways', color: 'vatu', members: CONTESTANTS },
};

export const ALL_CASTAWAYS = CONTESTANTS;

export const PLAYER_COLORS = [
    { bg: 'bg-player-1', text: 'text-player-1', border: 'border-player-1', ring: 'ring-player-1', hex: COLORS.player1 },
    { bg: 'bg-player-2', text: 'text-player-2', border: 'border-player-2', ring: 'ring-player-2', hex: COLORS.player2 },
    { bg: 'bg-player-3', text: 'text-player-3', border: 'border-player-3', ring: 'ring-player-3', hex: COLORS.player3 },
    { bg: 'bg-player-4', text: 'text-player-4', border: 'border-player-4', ring: 'ring-player-4', hex: COLORS.player4 },
    { bg: 'bg-player-5', text: 'text-player-5', border: 'border-player-5', ring: 'ring-player-5', hex: COLORS.player5 },
    { bg: 'bg-player-6', text: 'text-player-6', border: 'border-player-6', ring: 'ring-player-6', hex: COLORS.player6 },
    { bg: 'bg-player-7', text: 'text-player-7', border: 'border-player-7', ring: 'ring-player-7', hex: COLORS.player7 },
    { bg: 'bg-player-8', text: 'text-player-8', border: 'border-player-8', ring: 'ring-player-8', hex: COLORS.player8 },
];

// Contestant events. These drive points for the contestants a player picked.
export const SCORE_EVENTS = [
    { key: 'survived', label: 'Survived Episode', points: 2, emoji: '✅' },
    { key: 'tribal_immunity', label: 'Tribal Immunity Win', points: 3, emoji: '🏅' },
    { key: 'individual_immunity', label: 'Individual Immunity', points: 10, emoji: '🏅' },
    { key: 'individual_reward', label: 'Individual Reward', points: 5, emoji: '🎁' },
    { key: 'tribal_reward', label: 'Tribal Reward', points: 2, emoji: '🎁' },
    { key: 'voted_correctly', label: 'Voted Correctly', points: 3, emoji: '✓' },
    { key: 'survived_with_votes', label: 'Survived w/ Votes Against', points: 5, emoji: '🛡️' },
    { key: 'attended_tribal_zero', label: 'Tribal, Zero Votes', points: 2, emoji: '👻' },
    { key: 'idol_found', label: 'Found Idol', points: 8, emoji: '🗿' },
    { key: 'idol_played_success', label: 'Idol Played Successfully', points: 15, emoji: '💎' },
    { key: 'advantage_found', label: 'Found Advantage', points: 5, emoji: '🃏' },
    { key: 'advantage_used', label: 'Used Advantage Successfully', points: 10, emoji: '🃏' },
    { key: 'exile', label: 'Sent to Exile', points: 3, emoji: '🏝️' },
    { key: 'merge', label: 'Made Merge', points: 10, emoji: '🤝' },
    { key: 'ftc', label: 'Made FTC', points: 20, emoji: '🏛️' },
    { key: 'fire_making_win', label: 'Fire-Making Win', points: 10, emoji: '🔥' },
    { key: 'winner', label: 'Sole Survivor', points: 50, emoji: '👑' },
    { key: 'medevac', label: 'Medevac Consolation', points: 3, emoji: '🚑' },
    // Camp life & journey events (auto-detected from FSG)
    { key: 'supply_challenge_win', label: 'Supply Challenge Win', points: 1, emoji: '📦' },
    { key: 'marooning_win', label: 'Marooning Challenge Win', points: 1, emoji: '⚓' },
    { key: 'read_tree_mail', label: 'Read Tree Mail', points: 1, emoji: '📬' },
    { key: 'water_well_talk', label: 'Water Well Strategy', points: 1, emoji: '💧' },
    { key: 'make_fire_camp', label: 'Made Fire at Camp', points: 1, emoji: '🪵' },
    { key: 'find_food', label: 'Found Food', points: 1, emoji: '🍌' },
    { key: 'journey', label: 'Went on Journey', points: 1, emoji: '🚶' },
    { key: 'journey_challenge_win', label: 'Journey Challenge Win', points: 2, emoji: '⛰️' },
    { key: 'find_clue', label: 'Found Clue', points: 2, emoji: '🔎' },
    { key: 'shot_in_dark', label: 'Shot in the Dark', points: 2, emoji: '🎲' },
];

// The only four ways a player scores. This is the whole player-facing rulebook,
// so every detail worth knowing lives here as a note rather than being restated
// in prose elsewhere. Ordered the way a night actually goes.
export const ENGAGEMENT_SCORING = [
    {
        section: 'Weekly Picks',
        icon: '🎯',
        items: [
            { label: 'Pick 3 castaways', points: '—', emoji: '🗳️', note: 'They earn you their event points for the episode. Change them every week. Picks open in Episode 2 — the premiere is for meeting the cast.' },
            { label: 'Captain', points: '2×', emoji: '⭐', note: 'Star one of your three each week. They score double. Pick the one you believe in.' },
        ],
    },
    {
        section: 'Predictions',
        icon: '🔮',
        items: [
            { label: 'Tree Mail (correct)', points: 3, emoji: '📬', note: 'Five yes/no calls about the episode, answered before you watch.' },
            { label: 'Snap Vote (correct)', points: 8, emoji: '⚡', note: 'Once they sit down at tribal, pause before Jeff asks anything and call whose torch gets snuffed. Opens when you light your torch, closes when you mark Done.' },
        ],
    },
    {
        section: 'Bingo',
        icon: '🎱',
        items: [
            { label: 'Each Square You Hit', points: 2, emoji: '🎯', note: 'No line needed to score. Long-press a square to read the full text.' },
            { label: 'Complete a Line', points: 5, emoji: '➖' },
            { label: 'Blackout (Full Card)', points: 50, emoji: '🌑' },
        ],
    },
    {
        section: 'Passport',
        icon: '📜',
        items: [
            { label: 'Passport (sealed at merge)', points: '5 each', emoji: '🛂', note: 'Sole Survivor · First Juror · Fan Favorite · Biggest Villain · Fire-Making Winner. Sealed when the merge hits, revealed at the finale. Once sealed, it stays sealed.' },
        ],
    },
];

// Tree Mail — yes/no calls made before the episode. Each line has to be a real
// decision, and the wording has to match what resolveType actually checks.
// UI label: "Tree Mail". Internal keys kept as propBets for Firebase compatibility.
// Episode 1 uses PREMIERE_PROP_BETS instead: no imported data exists yet, so the
// host marks those by hand.
// `excludes` names questions that must not appear in the same set, either
// because one answer gives away the other ("an idol is played" inside "an idol
// or an advantage is played") or because they are opposites and one of the two
// is a free +3 ("the vote splits" against "every vote is the same name").
export const PROP_BET_POOL = [
    // Camp — a scene, not a supply list
    { key: 'fire', text: 'Somebody gets a real fire going', cat: 'camp', phase: 'any', resolveType: 'event_any', resolveParams: { eventKey: 'make_fire_camp' } },
    { key: 'food', text: 'They eat something that is not rice', cat: 'camp', phase: 'any', resolveType: 'event_any', resolveParams: { eventKey: 'find_food' } },
    { key: 'well', text: 'The real plan gets made at the well', cat: 'camp', phase: 'any', resolveType: 'event_any', resolveParams: { eventKey: 'water_well_talk' } },
    { key: 'sent_away', text: 'Someone is sent away from camp', cat: 'camp', phase: 'any', excludes: ['journey_win', 'exile'], resolveType: 'event_any_of', resolveParams: { eventKeys: ['journey', 'exile'] } },
    { key: 'journey_win', text: 'A journey has an actual winner', cat: 'camp', phase: 'any', excludes: ['sent_away'], resolveType: 'event_any', resolveParams: { eventKey: 'journey_challenge_win' } },
    { key: 'exile', text: 'Exile is the twist tonight', cat: 'camp', phase: 'any', excludes: ['sent_away'], resolveType: 'event_any', resolveParams: { eventKey: 'exile' } },
    // Challenge
    { key: 'reward_separate', text: 'Reward is its own challenge, apart from immunity', cat: 'challenge', phase: 'any', resolveType: 'has_reward', resolveParams: {} },
    { key: 'ind_immunity', text: 'Someone wins individual immunity', cat: 'challenge', phase: 'post-merge', resolveType: 'event_any', resolveParams: { eventKey: 'individual_immunity' } },
    { key: 'ind_reward', text: 'A reward goes to one person, not a tribe', cat: 'challenge', phase: 'post-merge', resolveType: 'event_any', resolveParams: { eventKey: 'individual_reward' } },
    // Power — each line is a different bet, not three ways to say "an advantage"
    { key: 'power_surfaces', text: 'An idol, an advantage, or a clue turns up', cat: 'idol', phase: 'any', excludes: ['clue', 'no_power_found'], resolveType: 'event_any_of', resolveParams: { eventKeys: ['idol_found', 'advantage_found', 'find_clue'] } },
    { key: 'power_played', text: 'Someone plays an idol or an advantage', cat: 'idol', phase: 'any', excludes: ['idol_works', 'advantage_used'], resolveType: 'event_any_of', resolveParams: { eventKeys: ['idol_played_success', 'advantage_used'] } },
    { key: 'two_power', text: 'Two separate power plays in one episode', cat: 'idol', phase: 'any', excludes: ['no_power_found'], resolveType: 'event_count_any_of_gte', resolveParams: { eventKeys: ['idol_found', 'advantage_found', 'find_clue', 'idol_played_success', 'advantage_used'], threshold: 2 } },
    { key: 'shot', text: 'Someone risks a Shot in the Dark', cat: 'idol', phase: 'any', resolveType: 'event_any', resolveParams: { eventKey: 'shot_in_dark' } },
    { key: 'clue', text: 'A clue gets found', cat: 'idol', phase: 'any', excludes: ['power_surfaces'], resolveType: 'event_any', resolveParams: { eventKey: 'find_clue' } },
    { key: 'idol_works', text: 'An idol is played and it works', cat: 'idol', phase: 'any', excludes: ['power_played'], resolveType: 'event_any', resolveParams: { eventKey: 'idol_played_success' } },
    { key: 'advantage_used', text: 'An advantage that is not an idol gets used', cat: 'idol', phase: 'any', excludes: ['power_played'], resolveType: 'event_any', resolveParams: { eventKey: 'advantage_used' } },
    { key: 'no_power_found', text: 'Nobody finds an idol or an advantage', cat: 'idol', phase: 'any', excludes: ['power_surfaces', 'two_power'], resolveType: 'event_none_of', resolveParams: { eventKeys: ['idol_found', 'advantage_found'] } },
    // The vote and the edit
    { key: 'medevac', text: 'Medical pulls someone from the game', cat: 'outcome', phase: 'any', resolveType: 'elimination_method', resolveParams: { method: 'medevac' } },
    { key: 'confessionals', text: 'One person owns the edit — four or more confessionals', cat: 'outcome', phase: 'any', resolveType: 'confessional_any_gte', resolveParams: { threshold: 4 } },
    { key: 'vote_split', text: 'The vote splits. More than one name', cat: 'vote', phase: 'any', excludes: ['vote_unanimous'], resolveType: 'vote_split', resolveParams: {} },
    { key: 'vote_unanimous', text: 'Every vote is the same name', cat: 'vote', phase: 'any', excludes: ['vote_split', 'survived_votes'], resolveType: 'vote_unanimous', resolveParams: {} },
    { key: 'survived_votes', text: 'Someone stays in after their name is read', cat: 'vote', phase: 'any', excludes: ['vote_unanimous'], resolveType: 'survived_with_vap_gte', resolveParams: { threshold: 1 } },
    { key: 'blowout', text: 'The boot is a blowout — five or more votes', cat: 'vote', phase: 'any', resolveType: 'eliminated_vap_gte', resolveParams: { threshold: 5 } },
];

// Premiere Tree Mail. Written for a two-hour Episode 1 with 21 strangers, two
// tribes, and one castaway held out. No resolveType: nothing to import yet.
export const PREMIERE_PROP_BETS = [
    { key: 'held_out_skips_tribal', text: 'The 21st castaway misses the first Tribal Council', cat: 'premiere', excludes: ['tribe_short'] },
    { key: 'double_boot', text: 'Two people go home tonight', cat: 'premiere' },
    { key: 'early_power', text: 'An idol or a clue turns up before the first vote', cat: 'premiere' },
    { key: 'medical_or_quit', text: 'Medical, or a quit, stops the premiere', cat: 'premiere' },
    { key: 'jeff_twist', text: 'Jeff spells out a twist before the first challenge', cat: 'premiere' },
    { key: 'first_is_reward', text: 'The first challenge is for reward, not immunity', cat: 'premiere' },
    { key: 'tribe_short', text: 'One tribe is short a player when they vote', cat: 'premiere', excludes: ['held_out_skips_tribal'] },
    { key: 'already_out', text: 'Somebody is already on the outs before they hit the beach', cat: 'premiere' },
];

/** True when `bet` can join a set that already holds `chosen`. */
export function betFits(bet, chosen) {
    return !chosen.some(picked =>
        picked.key === bet.key
        || (bet.excludes || []).includes(picked.key)
        || (picked.excludes || []).includes(bet.key)
        || picked.text === bet.text
    );
}

function deterministicShuffle(arr, seed) {
    const shuffled = [...arr];
    let s = seed;
    for (let i = shuffled.length - 1; i > 0; i--) {
        s = (s * 16807 + 0) % 2147483647;
        const j = s % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export function getPropBetSwapPool(episodeNumber, isPostMerge = false) {
    if (Number(episodeNumber) === 1) return PREMIERE_PROP_BETS;
    return isPostMerge ? PROP_BET_POOL : PROP_BET_POOL.filter(b => b.phase !== 'post-merge');
}

export function generatePropBets(episodeNumber, count = 5, isPostMerge = false) {
    const pool = getPropBetSwapPool(episodeNumber, isPostMerge);
    const shuffled = deterministicShuffle(pool, episodeNumber * 7919);
    const selected = [];
    // Premiere questions are all one category, so only the cap is skipped —
    // the weekly pool needs it or a shuffle hands you five idol bets.
    const capCategories = Number(episodeNumber) !== 1;
    const catCount = {};
    for (const bet of shuffled) {
        const cat = bet.cat || 'other';
        if (capCategories && (catCount[cat] || 0) >= 2) continue;
        if (!betFits(bet, selected)) continue;
        selected.push(bet);
        catCount[cat] = (catCount[cat] || 0) + 1;
        if (selected.length >= count) break;
    }
    // `key` and `excludes` ride along so the host's swap can tell what is
    // already on the card. Firebase rejects undefined, so unset means null.
    return selected.map((bet, i) => ({
        id: `prop_${episodeNumber}_${i}`,
        key: bet.key,
        excludes: bet.excludes || null,
        text: bet.text,
        resolveType: bet.resolveType || null,
        resolveParams: bet.resolveParams || null,
    }));
}

/**
 * Resolve Tree Mail outcomes from imported episode data.
 * importData: { bigMoments, minorityVoters, receivedVotes, eliminationMethod, rewardWinners, confessionals, voteCountMap, ... }
 * bets: [{ id, resolveType, resolveParams }]
 * Returns: { [betId]: boolean }
 */
export function resolveBets(importData, bets) {
    const results = {};
    const allEvents = Object.values(importData.bigMoments || {}).flat();
    const gameEvents = importData.gameEvents || {};
    const allGameEvents = Object.values(gameEvents).flat();
    const combinedEvents = [...allEvents, ...allGameEvents];
    const confessionals = importData.confessionals || {};
    const voteCountMap = importData.voteCountMap || {};
    const allEliminatedIds = importData.eliminatedIds?.length > 0
        ? importData.eliminatedIds
        : (importData.eliminatedId ? [importData.eliminatedId] : []);
    const elimIdSet = new Set(allEliminatedIds);

    for (const bet of bets) {
        const { id, resolveType, resolveParams } = bet;
        switch (resolveType) {
            case 'event_any':
                results[id] = combinedEvents.includes(resolveParams.eventKey);
                break;
            case 'event_any_of':
                results[id] = (resolveParams.eventKeys || []).some(k => combinedEvents.includes(k));
                break;
            case 'event_none_of':
                results[id] = !(resolveParams.eventKeys || []).some(k => combinedEvents.includes(k));
                break;
            case 'event_count_gte': {
                const count = combinedEvents.filter(e => e === resolveParams.eventKey).length;
                results[id] = count >= resolveParams.threshold;
                break;
            }
            case 'event_count_any_of_gte': {
                const count = combinedEvents.filter(e => (resolveParams.eventKeys || []).includes(e)).length;
                results[id] = count >= resolveParams.threshold;
                break;
            }
            case 'confessional_any_gte': {
                const counts = Object.values(confessionals);
                results[id] = counts.some(c => c >= resolveParams.threshold);
                break;
            }
            case 'vote_unanimous':
                results[id] = (importData.minorityVoters || []).length === 0 && allEliminatedIds.length > 0;
                break;
            case 'vote_split':
                results[id] = (importData.minorityVoters || []).length > 0;
                break;
            case 'elimination_method':
                results[id] = importData.eliminationMethod === resolveParams.method;
                break;
            case 'has_reward':
                results[id] = (importData.rewardWinners || []).length > 0;
                break;
            case 'eliminated_vap_gte': {
                const maxBootVap = allEliminatedIds.reduce(
                    (max, cid) => Math.max(max, voteCountMap[cid] || 0), 0
                );
                results[id] = maxBootVap >= resolveParams.threshold;
                break;
            }
            case 'survived_with_vap_gte': {
                results[id] = Object.entries(voteCountMap).some(
                    ([cid, vap]) => !elimIdSet.has(cid) && vap >= resolveParams.threshold
                );
                break;
            }
            default:
                results[id] = false;
        }
    }
    return results;
}

// Weekly picks start at Episode 2 — nobody has seen these 21 play before the premiere.
export const PICKS_START_EPISODE = 2;
// The premiere drafts mid-episode instead, right after the buffs are handed out.
export const DRAFT_EPISODE = 1;
export const MAX_PICKS = 3;

export function getMaxPicks(remainingCount) {
    return Math.min(MAX_PICKS, Math.floor(remainingCount / 2));
}

// ── Island Bingo ──
// Mark it the moment it happens. Short, because the square is tiny and the
// label is uppercase. No freebies that hit every episode (the logo, palm trees,
// a confessional existing). Seven lanes, so a random card cannot be eight
// versions of Jeff's shirt.

export const BINGO_ITEMS = [
    // Jeff, the lines and the bits
    'Jeff: "Come on in!"',
    '"Worth playing for?"',
    'Jeff: "Dig deep"',
    '"The tribe has spoken"',
    'Jeff snuffs a torch',
    '"Got nothin\' for ya"',
    'Jeff reads the votes',
    '"Grab your torches"',
    'A Probst dad joke',
    'Jeff asks for final words',
    '"Immunity is back up"',
    'The Probst stare-down',
    // The edit, not the scenery
    'Villain music hits',
    'A whisper, subtitled',
    'A vote in close-up',
    'A flashback insert',
    'Sad music, big smile',
    'A stare, no dialogue',
    'A nickname on the chyron',
    'Smash cut to a chicken',
    'The voting confessional',
    'An "hours later" card',
    'Someone narrates the lie',
    'A slow push-in on a face',
    // Words you hear them say
    '"It\'s a big move"',
    '"I trust them completely"',
    '"I\'m on the bottom"',
    '"We need a decoy"',
    '"It\'s just a vote"',
    'They count the numbers',
    'A name gets walked back',
    '"I\'m a free agent"',
    '"Don\'t tell the others"',
    'Someone says "blindsided"',
    '"They\'re coming for me"',
    '"I have the numbers"',
    // The challenge, the beat not the prop
    'A puzzle piece won\'t fit',
    'Wipes out on the beam',
    'Jeff stops the challenge',
    'Sitting out on the bench',
    'The lead changes hands',
    'A knot that will not budge',
    'The bag hits the ground',
    'A full-body splash',
    'The tribe flag goes in',
    '"Dig, dig, dig!"',
    'The necklace goes on',
    'Benched off the puzzle',
    // Idols and paper
    'Sneaks away from camp',
    'A clue, read whispering',
    'Digging after dark',
    'An idol out of a bag',
    '"Do not open this"',
    'The Shot in the Dark die',
    'Idol shown to one ally',
    'An advantage hits the mat',
    '"I know where it is"',
    'A Beware Advantage',
    'Someone clocks a search',
    'A fake-idol theory',
    // Camp, when it becomes a scene
    'A fight over the rice',
    'The machete comes out',
    'Tree mail hits camp',
    '"I am so hungry"',
    'Strategy at the well',
    'The shelter sags',
    'Food does not get shared',
    'A bug-bite meltdown',
    '"This tribe is a mess"',
    'Quiet after a blindside',
    'A reward feast',
    'Fire that will not catch',
    // Tribal, mark it when it happens
    '"Play it if you\'ve got it"',
    'A throwaway vote',
    'Jeff calls a revote',
    'Someone stands to play',
    '"Anything left to say?"',
    'People stand. Live tribal',
    '"Give me a minute"',
    'A juror shakes it off',
    'Jeff asks it again',
    'A vote gets crossed out',
    '"I\'ll go tally the votes"',
    'Somebody cries at tribal',
];

// Premiere-only. Episode 1 cards reserve eight of these so the two-hour open
// is about the ship, the buffs, and the castaway who does not start.
export const PREMIERE_BINGO_ITEMS = [
    'The ship in the open',
    'Someone jumps off',
    'A blindfold',
    'Two different buffs',
    'A buff yanked on',
    '"There are 21 of you"',
    'The 21st held back',
    'The marooning sprint',
    'A note read out loud',
    '"I have wanted this"',
    'The word "alliance"',
    'Jeff names the twist',
    'The whole cast, one mat',
    'Already crying',
    'A buff as a headband',
    'Camp with no shelter',
];

// Hash a string to a numeric seed
function hashSeed(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

/**
 * Build the square pool for an episode. Premiere squares only appear in Episode 1,
 * and a host can supply extra squares for any episode.
 */
export function getBingoPool(episodeNumber, customItems = []) {
    const base = Number(episodeNumber) === 1
        ? [...BINGO_ITEMS, ...PREMIERE_BINGO_ITEMS]
        : [...BINGO_ITEMS];
    return [...customItems.filter(Boolean), ...base];
}

// Generate a shuffled bingo card (5x5 with free center)
// seed should be a string like "{partyId}-{episodeNum}-{playerId}"
const PREMIERE_SQUARES_ON_CARD = 8;

export function generateBingoCard(seed, episodeNumber, customItems = []) {
    const custom = customItems.filter(Boolean);
    let items;
    if (Number(episodeNumber) === 1) {
        const premierePick = deterministicShuffleFromSeed(PREMIERE_BINGO_ITEMS, `${seed}:premiere`)
            .slice(0, PREMIERE_SQUARES_ON_CARD);
        const fill = deterministicShuffleFromSeed([...custom, ...BINGO_ITEMS], seed)
            .slice(0, 24 - premierePick.length);
        items = deterministicShuffleFromSeed([...premierePick, ...fill], `${seed}:mix`);
    } else {
        items = deterministicShuffleFromSeed(getBingoPool(episodeNumber, custom), seed).slice(0, 24);
    }
    items.splice(12, 0, '🔥 FREE');
    return items;
}

function deterministicShuffleFromSeed(pool, seed) {
    const shuffled = [...pool];
    let s = typeof seed === 'string' ? hashSeed(seed) : (seed || Math.floor(Math.random() * 10000));
    for (let i = shuffled.length - 1; i > 0; i--) {
        s = (s * 16807 + 0) % 2147483647;
        const j = s % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export const BINGO_LINES = [
    [0,1,2,3,4], [5,6,7,8,9], [10,11,12,13,14], [15,16,17,18,19], [20,21,22,23,24],
    [0,5,10,15,20], [1,6,11,16,21], [2,7,12,17,22], [3,8,13,18,23], [4,9,14,19,24],
    [0,6,12,18,24], [4,8,12,16,20],
];

export function detectBingoLines(marked) {
    return BINGO_LINES.filter(line => line.every(i => marked[i]));
}

export function isBingoBlackout(marked) {
    return marked.every(Boolean);
}

// Squares hit, excluding the free centre so it does not pay out on its own.
export function countBingoSquares(marked) {
    if (!Array.isArray(marked)) return 0;
    return marked.reduce((n, isMarked, i) => (isMarked && i !== 12 ? n + 1 : n), 0);
}

// Passport — five long-term calls, each a different kind of Survivor question.
// Winner, placement, timing, character, and a challenge. The host enters the
// truth at the finale; scoring compares these keys.
export const PASSPORT_POINTS_PER_CORRECT = 5;

export const PASSPORT_QUESTIONS = [
    { key: 'winner', label: 'Sole Survivor', prompt: `Who takes the million and wins ${SEASON_LABEL}?`, icon: 'emoji_events' },
    { key: 'runnerUp', label: 'Runner-up', prompt: 'Who makes the end and finishes second?', icon: 'military_tech' },
    { key: 'firstJury', label: 'First juror', prompt: 'Who is the first person voted onto the jury?', icon: 'gavel' },
    { key: 'villain', label: 'The villain', prompt: 'Who does this season treat as the villain?', icon: 'mood_bad' },
    { key: 'fireMakingWinner', label: 'Fire', prompt: 'Who wins fire-making at the final four?', icon: 'local_fire_department' },
];
