// Survivor Season 51 — "The Open Era" — 21 new castaways, two tribes, Fiji.
// Premiere: Wed Sep 23 2026 (two hours). Weekly episodes are 90 minutes from Sep 30.
import { COLORS } from './theme';

export const SEASON_ID = 's51';
export const SEASON_NUMBER = 51;
export const SEASON_LABEL = 'Season 51';
export const SEASON_TAGLINE = 'The Open Era';

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

export const ENGAGEMENT_SCORING = [
    {
        section: 'Bingo',
        icon: '🎱',
        items: [
            { label: 'Each Square You Hit', points: 2, emoji: '🎯' },
            { label: 'Complete a Line', points: 5, emoji: '➖' },
            { label: 'Blackout (Full Card)', points: 50, emoji: '🌑' },
        ],
    },
    {
        section: 'Predictions',
        icon: '🔮',
        items: [
            { label: 'Tree Mail (correct)', points: 3, emoji: '📬' },
            { label: 'Snap Vote (correct)', points: 8, emoji: '⚡' },
            { label: 'Tribal Whisper (correct)', points: 3, emoji: '🤫' },
        ],
    },
    {
        section: 'Weekly Picks',
        icon: '🎯',
        items: [
            { label: 'Pick 3 castaways from Episode 2 on', points: '—', emoji: '🗳️', note: 'They earn you their event points for the episode' },
            { label: 'Sole Picker Bonus', points: '1.5×', emoji: '💎', note: 'If you are the only player who picked a castaway, their points are multiplied by 1.5×' },
        ],
    },
    {
        section: 'Passports',
        icon: '📜',
        items: [
            { label: 'Season Passport', points: '5 each', emoji: '🛂', note: 'Sealed after the premiere, scored as each answer comes true' },
            { label: 'Merge Passport', points: '5 each', emoji: '📋', note: 'Sealed at the merge, scored as each answer comes true' },
        ],
    },
];

// Tree Mail — pre-episode predictions with auto-resolution from imported data.
// UI label: "Tree Mail". Internal keys kept as propBets for Firebase compatibility.
export const PROP_BET_POOL = [
    // Camp
    { text: 'Fire gets made at camp', cat: 'camp', phase: 'any', resolveType: 'event_any', resolveParams: { eventKey: 'make_fire_camp' } },
    { text: 'Somebody finds or catches food', cat: 'camp', phase: 'any', resolveType: 'event_any', resolveParams: { eventKey: 'find_food' } },
    { text: 'The water well hosts a scheming session', cat: 'camp', phase: 'any', resolveType: 'event_any', resolveParams: { eventKey: 'water_well_talk' } },
    { text: 'Somebody leaves camp on a journey or gets exiled', cat: 'camp', phase: 'any', resolveType: 'event_any_of', resolveParams: { eventKeys: ['journey', 'exile'] } },
    { text: 'A journey challenge gets won', cat: 'camp', phase: 'any', resolveType: 'event_any', resolveParams: { eventKey: 'journey_challenge_win' } },
    // Challenge
    { text: 'There is a reward challenge', cat: 'challenge', phase: 'any', resolveType: 'has_reward', resolveParams: {} },
    { text: 'Individual immunity is on the line', cat: 'challenge', phase: 'post-merge', resolveType: 'event_any', resolveParams: { eventKey: 'individual_immunity' } },
    { text: 'Individual reward is up for grabs', cat: 'challenge', phase: 'post-merge', resolveType: 'event_any', resolveParams: { eventKey: 'individual_reward' } },
    // Idol & power — the Open Era means anything can show up
    { text: 'Hidden power surfaces tonight', cat: 'idol', phase: 'any', resolveType: 'event_any_of', resolveParams: { eventKeys: ['idol_found', 'advantage_found', 'find_clue'] } },
    { text: 'An idol or advantage actually gets played', cat: 'idol', phase: 'any', resolveType: 'event_any_of', resolveParams: { eventKeys: ['idol_played_success', 'advantage_used'] } },
    { text: 'The Open Era goes off — two or more power moves tonight', cat: 'idol', phase: 'any', resolveType: 'event_count_any_of_gte', resolveParams: { eventKeys: ['idol_found', 'advantage_found', 'find_clue', 'idol_played_success', 'advantage_used'], threshold: 2 } },
    { text: 'Somebody rolls the dice on a Shot in the Dark', cat: 'idol', phase: 'any', resolveType: 'event_any', resolveParams: { eventKey: 'shot_in_dark' } },
    { text: 'A clue gets found before an idol does', cat: 'idol', phase: 'any', resolveType: 'event_any', resolveParams: { eventKey: 'find_clue' } },
    // Outcome
    { text: 'Medical gets called in', cat: 'outcome', phase: 'any', resolveType: 'elimination_method', resolveParams: { method: 'medevac' } },
    { text: 'Somebody racks up 4+ confessionals — the edit has a favorite', cat: 'outcome', phase: 'any', resolveType: 'confessional_any_gte', resolveParams: { threshold: 4 } },
    { text: 'The vote splits — not everyone lands on one name', cat: 'outcome', phase: 'any', resolveType: 'vote_split', resolveParams: {} },
    { text: 'Somebody survives with votes against them', cat: 'outcome', phase: 'any', resolveType: 'survived_with_vap_gte', resolveParams: { threshold: 1 } },
    { text: 'The boot gets buried — 5+ votes on one person', cat: 'outcome', phase: 'any', resolveType: 'eliminated_vap_gte', resolveParams: { threshold: 5 } },
];

// Tribal Whispers — during-tribal predictions with auto-resolution.
// UI label: "Tribal Whispers". Internal keys kept as sideBets for Firebase compatibility.
export const SIDE_BET_POOL = [
    { text: 'Somebody pulls out an idol', resolveType: 'event_any', resolveParams: { eventKey: 'idol_played_success' } },
    { text: 'Somebody plays an advantage', resolveType: 'event_any', resolveParams: { eventKey: 'advantage_used' } },
    { text: 'Somebody rolls the dice — Shot in the Dark', resolveType: 'event_any', resolveParams: { eventKey: 'shot_in_dark' } },
    { text: 'The votes fracture — split vote', resolveType: 'vote_split', resolveParams: {} },
    { text: 'The vote is decisive — 5+ votes on the boot', resolveType: 'eliminated_vap_gte', resolveParams: { threshold: 5 } },
    { text: 'All that buildup and no power gets played', resolveType: 'event_none_of', resolveParams: { eventKeys: ['idol_played_success', 'advantage_used', 'shot_in_dark'] } },
    { text: 'Somebody survives with 2+ votes against them', resolveType: 'survived_with_vap_gte', resolveParams: { threshold: 2 } },
    { text: 'It goes unanimous', resolveType: 'vote_unanimous', resolveParams: {} },
];

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

export function generateSideBets(episodeNumber, count = 3) {
    const shuffled = deterministicShuffle(SIDE_BET_POOL, (episodeNumber * 13337 + 42) % 2147483647);
    return shuffled.slice(0, count).map((bet, i) => ({ id: `side_${episodeNumber}_${i}`, text: bet.text, resolveType: bet.resolveType, resolveParams: bet.resolveParams }));
}

export function generatePropBets(episodeNumber, count = 5, isPostMerge = false) {
    const pool = isPostMerge ? PROP_BET_POOL : PROP_BET_POOL.filter(b => b.phase !== 'post-merge');
    const shuffled = deterministicShuffle(pool, episodeNumber * 7919);
    const selected = [];
    const catCount = {};
    for (const bet of shuffled) {
        const cat = bet.cat || 'other';
        if ((catCount[cat] || 0) >= 2) continue;
        selected.push(bet);
        catCount[cat] = (catCount[cat] || 0) + 1;
        if (selected.length >= count) break;
    }
    return selected.map((bet, i) => ({ id: `prop_${episodeNumber}_${i}`, text: bet.text, resolveType: bet.resolveType, resolveParams: bet.resolveParams }));
}

/**
 * Resolve Tree Mail / Tribal Whisper outcomes from imported episode data.
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

export const MAX_LEAGUE_MEMBERS = 12;

// Weekly picks start at Episode 2 — nobody has seen these 21 play before the premiere.
export const PICKS_START_EPISODE = 2;
export const MAX_PICKS = 3;

export function getMaxPicks(remainingCount) {
    return Math.min(MAX_PICKS, Math.floor(remainingCount / 2));
}

// ── Survivor Auction (shelved for Season 51) ──
// Kept intact rather than deleted: it only pays off with a leaderboard people are
// optimizing for and players watching in sync, and Season 51 is neither. Flip
// AUCTION_ENABLED to true to bring it back with its perks.

export const AUCTION_ENABLED = false;

export const AUCTION_PERKS = [
    { perkType: 'extra_pick', name: 'Extra Pick', description: 'Pick 1 extra contestant next episode', emoji: '➕' },
    { perkType: 'double_down', name: 'Double Down', description: 'Double your snap vote points next tribal (8 → 16)', emoji: '🔥' },
    { perkType: 'tree_mail_insider', name: 'Tree Mail Insider', description: 'Double your Tree Mail points next episode (+6 each)', emoji: '📬' },
    { perkType: 'bingo_frenzy', name: 'Bingo Frenzy', description: 'Double your bingo points next episode', emoji: '🎱' },
    { perkType: 'spy_glass', name: 'Spy Glass', description: "See one opponent's picks before locking yours", emoji: '🔍' },
    { perkType: 'steal_pick', name: 'Steal a Pick', description: "Copy one opponent's best pick as a bonus pick", emoji: '🃏' },
];

export const AUCTION_DUDS = [
    { perkType: 'dud_feast', name: 'The Merge Feast', description: "A covered platter of... rice. No game advantage whatsoever.", emoji: '🍖' },
    { perkType: 'dud_coconut', name: 'Coconut of Doom', description: "It's just a coconut. A very expensive coconut.", emoji: '🥥' },
];

export function getAuctionPerks(auction, episodeNum) {
    if (!AUCTION_ENABLED) return {};
    if (!auction || auction.status !== 'complete') return {};
    if (episodeNum != null && auction.perkEpisode != null && Number(episodeNum) !== Number(auction.perkEpisode)) return {};
    const perks = {};
    for (const item of (auction.items || [])) {
        if (item.winner && item.perkType && !item.perkType.startsWith('dud_')) {
            if (!perks[item.winner]) perks[item.winner] = [];
            perks[item.winner].push(item.perkType);
        }
    }
    return perks;
}

export function userHasPerk(auction, uid, perkType, episodeNum) {
    const perks = getAuctionPerks(auction, episodeNum);
    return (perks[uid] || []).includes(perkType);
}

// ── Island Bingo ──
// Written for a rookie cast: no returnee callbacks, no past-season references that
// only make sense for veterans. Season 51 is the "Open Era", so any twist from
// series history can appear at any time, and the cast are superfans who will say so.

export const BINGO_ITEMS = [
    // Jeff Probst (13)
    '"The tribe has spoken"',
    '"Come on in!"',
    '"Dig deep!"',
    '"Worth playing for?"',
    'Jeff says "got nothin\' for ya"',
    'Jeff says "fire represents life"',
    'Jeff gives a life lesson at tribal',
    'Jeff calls something "the biggest" or "the greatest"',
    'Jeff opens tribal by asking about camp',
    'Jeff says "this is Survivor"',
    'Jeff is visibly shocked at tribal',
    'Jeff explains a twist nobody understands',
    'Jeff grins because he knows something they don\'t',
    // Tribal council (16)
    'Someone whispers at tribal',
    'Votes land on more than one name',
    'Someone says "at the end of the day"',
    'Someone names a target out loud at tribal',
    'Someone says "million dollars"',
    'Side conversation during tribal',
    'Someone says "blindside"',
    'Someone shows their vote to the camera',
    'Creative spelling on a vote',
    'Someone cries at tribal council',
    'Jeff asks a brutal follow-up question',
    'Someone mentions jury management',
    'Someone gets up and moves seats during tribal',
    'A player completely dodges Jeff\'s question',
    'Tribal goes to a revote',
    'The boot looks genuinely blindsided',
    // Challenges (15)
    'Challenge involves water',
    'Puzzle at the end of a challenge',
    'Someone falls during a challenge',
    'Immunity idol closeup',
    'Challenge involves balance',
    'Challenge involves endurance',
    'Someone sits out of a challenge',
    'Challenge involves digging',
    'Challenge involves knots or ropes',
    'Someone gets hurt during a challenge',
    'Jeff stops or pauses a challenge',
    'Challenge involves throwing or tossing',
    'Challenge involves crawling through something',
    'The sit-out bench gets shown',
    'A tribe blows a huge lead',
    // Idols, advantages & the Open Era (14)
    'An idol is found',
    'An idol is played',
    'Someone hides an idol',
    'Someone finds a clue',
    'An advantage is found',
    'Someone plays a Shot in the Dark',
    'A fake idol or decoy appears',
    'Someone searches for an idol alone',
    'Someone bluffs having an idol',
    'An idol is played but negates zero votes',
    'A twist from an old season comes back',
    'An advantage nobody has seen in years turns up',
    'Someone says "Open Era"',
    'A player misunderstands how a twist works',
    // Camp life (18)
    'Rain at camp',
    'Someone makes fire',
    'A coconut gets cracked open',
    'Someone complains about hunger',
    'Someone is badly sunburned',
    'Secret meeting at the well',
    'Reward includes food',
    'Someone cooks rice',
    'Shelter building or repair',
    'Someone goes fishing',
    'Night vision camp footage',
    'Someone naps in the shelter',
    'Fireside strategy talk',
    'Someone is getting eaten alive by bugs',
    'Someone negotiates with Jeff for rice',
    'A camp argument or confrontation',
    'Camp celebration — dancing, singing, or cheering',
    'Someone is visibly freezing at night',
    // Emotional & social (12)
    'Someone cries',
    'Someone talks about their family',
    'Group hug',
    'Someone says "I love this game"',
    'Someone comforts another player',
    'Letters from home or a family visit',
    'Someone talks about their job back home',
    'Two players bond over something they share',
    'Someone vows revenge in a confessional',
    'Players celebrate wildly after a challenge win',
    'Someone gets emotional about just being here',
    'Someone opens up about something heavy',
    // Rookie cast tells (11)
    'Someone calls themselves a superfan',
    'Someone name-drops a former Survivor player',
    'Someone references a past season',
    'Someone says they have watched since they were a kid',
    'Someone quotes a Survivor catchphrase at camp',
    'Someone says they are "playing like" a past winner',
    'Someone brings up their occupation as a strategy',
    'Someone claims they are underestimated',
    'Someone says they have a "read" on everyone',
    'A player admits they have no idea what is happening',
    'Someone says they came here to play, not to sit',
    // Strategy (15)
    'An alliance is betrayed',
    '"I didn\'t come here to lose"',
    'Two players make a final 2 or final 3 deal',
    'Someone flips on their alliance',
    'Trash talk in a voting confessional',
    'Someone says "blood on my hands"',
    'Someone makes a promise they clearly will not keep',
    'Someone says "I need to win immunity"',
    'A blindside gets planned in a confessional',
    'Someone admits they are on the bottom',
    'A decoy name gets floated',
    'Someone says "stick to the plan"',
    'Post-tribal fallout conversation',
    'A number gets counted out loud',
    'Someone builds an alliance within an alliance',
    // Production & visuals (12)
    'Shot of wildlife',
    'Bug or insect closeup',
    'Dramatic music sting',
    'Sunset or sunrise shot',
    'Aerial island shot',
    'Someone does a victory dance',
    'Slow-motion challenge replay',
    'Tree mail arrives',
    'Drone shot following a contestant',
    'Torch-lit walk to tribal council',
    'Split-screen or picture-in-picture edit',
    'A confessional shot in the rain',
    // Game milestones (4)
    'Medical team gets called',
    'Post-merge feast',
    'A tribe swap happens',
    'Someone leaves with their torch unsnuffed',
];

// Premiere-only squares, mixed into the pool for Episode 1. Season 51 opens with
// production-assigned buffs and one castaway held out of the starting tribes.
// Episode 1 squares, seeded from the published premiere details: a true marooning
// off a sailing ship, a semi-blindfolded obstacle course with one immunity for two
// tribes, and a 21st castaway who is either out immediately or sent to Exile.
export const PREMIERE_BINGO_ITEMS = [
    'The sailing ship appears before anyone hits the water',
    'A castaway jumps or dives off the boat',
    'Something gets dropped or lost during the marooning',
    'A blindfold comes off crooked or too early',
    'A caller screams directions and gets ignored',
    'The losing tribe is obvious before the challenge ends',
    'The 21st castaway is sent to Exile',
    'Someone reads the note from production out loud',
    'Buffs get handed out by name',
    'The odd-one-out castaway is revealed',
    'Someone reacts badly to the tribe they got',
    'A castaway realizes they are alone',
    'Someone introduces themselves with a lie',
    'First confessional inside the first five minutes',
    'A castaway sprints off the mat',
    'Someone struggles to remember a name',
    'First fire of the season',
    'Someone says this is a dream come true',
    'Jeff welcomes the "Open Era"',
    'A castaway is immediately pegged as a threat',
    'First alliance forms on day one',
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
// seed should be a string like "{leagueId}-{episodeNum}-{playerId}"
export function generateBingoCard(seed, episodeNumber, customItems = []) {
    const shuffled = deterministicShuffleFromSeed(getBingoPool(episodeNumber, customItems), seed);
    const items = shuffled.slice(0, 24);
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

// Achievement badges were cut for Season 51 — the group found them to be noise.
// The exports stay so the badge surfaces render empty instead of crashing.
export const ACHIEVEMENTS = [];

export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));
