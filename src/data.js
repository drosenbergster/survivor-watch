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

// Starting tribes are Savu (purple) and Toka (yellow). Patt Cannaday begins with
// no buff, so she stays in `unassigned`. A host can still override these from
// Rules → Tribe Management after a swap; those assignments take precedence.
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
    { id: 'jelly_loblack', name: 'Angelica "Jelly" LoBlack', age: 29, occupation: 'Sociology professor', short: 'Professor', from: 'Bloomington, IN', fsgId: '540', aliases: ['jelly', 'angelica', 'angelica loblack', 'loblack', 'lo black', 'angelica lo black'] },
    { id: 'brady_booker', name: 'Brady Booker', age: 27, occupation: 'Pro wrestler', short: 'Pro wrestler', from: 'Knoxville, TN', fsgId: '541' },
    { id: 'carter_krull', name: 'Carter Krull', age: 24, occupation: 'Livestock farmer', short: 'Farmer', from: 'Sioux Falls, SD', fsgId: '542' },
    { id: 'cristian_chavez', name: 'Cristian Chavez', age: 26, occupation: 'Head of HR', short: 'Head of HR', from: 'Salt Lake City, UT', fsgId: '543' },
    { id: 'danny_kilby', name: 'Dan Kilby', age: 30, occupation: 'Game designer', short: 'Game designer', from: 'London, ON', fsgId: '544', aliases: ['kilby', 'dan', 'danny', 'danny kilby', 'dan kilby'] },
    { id: 'devin_way', name: 'Devin Way', age: 33, occupation: 'Actor', short: 'Actor', from: 'Los Angeles, CA', fsgId: '545' },
    { id: 'eric_macksoud', name: 'Eric Macksoud', age: 34, occupation: 'Mental health counselor', short: 'Counselor', from: 'Windsor Locks, CT', fsgId: '546' },
    { id: 'jenna_doore', name: 'Jenna Doore', age: 30, occupation: 'Wedding photographer', short: 'Photographer', from: 'Toledo, OH', fsgId: '547', aliases: ['jenna greenawalt', 'greenawalt'] },
    { id: 'kristin_flickinger', name: 'Kristin Flickinger', age: 49, occupation: 'Crisis management', short: 'Crisis mgmt', from: 'Santa Barbara, CA', fsgId: '548' },
    { id: 'lewis_kelly', name: 'Lewis Kelly', age: 28, occupation: 'Farmer', short: 'Farmer', from: 'Puerto Rico', fsgId: '549' },
    { id: 'linnea_capobianco', name: 'Linnea Capobianco', age: 25, occupation: 'Entrepreneur', short: 'Entrepreneur', from: 'Jersey City, NJ', fsgId: '550' },
    { id: 'maggie_nestor', name: 'Maggie Nestor', age: 40, occupation: 'Farmer', short: 'Farmer', from: 'Charlestown, WV', fsgId: '551' },
    { id: 'mike_pinsky', name: 'Michael Pinsky', age: 32, occupation: '', short: 'NYC', from: 'New York, NY', fsgId: '552', aliases: ['mike', 'mike pinsky'] },
    { id: 'ori_jean_charles', name: 'Ori Jean-Charles', age: 27, occupation: '', short: 'Spring Valley', from: 'Spring Valley, NY', fsgId: '553', aliases: ['ori', 'ori jean charles'] },
    { id: 'patt_cannaday', name: 'Patt Cannaday', age: 33, occupation: '', short: 'Washington DC', from: 'Washington, DC', fsgId: '554', aliases: ['pat', 'cannady', 'patt cannady'] },
    { id: 'rob_antonson', name: 'Rob Antonson', age: 40, occupation: 'Airline gate agent', short: 'Gate agent', from: 'Cumberland, RI', fsgId: '555' },
    { id: 'sharonda_cox', name: 'Sharonda Renee', age: 34, occupation: 'Resident, OBGYN', short: 'OBGYN resident', from: 'Richmond, KY', fsgId: '556', aliases: ['renee', 'sharonda cox', 'cox'] },
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

function cast(...ids) {
    return ids.map(id => CONTESTANTS.find(c => c.id === id));
}

// Savu is purple, Toka is yellow. Patt Cannaday starts without a tribe.
export const TRIBES = {
    savu: {
        name: 'Savu',
        color: 'savu',
        members: cast(
            'alexis_levine', 'ana_sani', 'carter_krull', 'cristian_chavez', 'eric_macksoud',
            'kristin_flickinger', 'linnea_capobianco', 'ori_jean_charles', 'rob_antonson', 'sharonda_cox',
        ),
    },
    toka: {
        name: 'Toka',
        color: 'toka',
        members: cast(
            'aaliyah_puglia', 'jelly_loblack', 'brady_booker', 'danny_kilby', 'devin_way',
            'jenna_doore', 'lewis_kelly', 'maggie_nestor', 'mike_pinsky', 'an_nguyen',
        ),
    },
    unassigned: { name: 'No tribe', color: 'unassigned', members: cast('patt_cannaday') },
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

// Weekly picks start at Episode 2 — nobody has seen these 21 play before the premiere.
export const PICKS_START_EPISODE = 2;
// The premiere drafts mid-episode instead, right after the buffs are handed out.
export const DRAFT_EPISODE = 1;
// The premiere runs two hours against the widest field of the season.
export const PREMIERE_PICKS = 5;
// Two is a floor, not a minimum that happens to be low: at one pick the Captain
// star has nothing to choose between, and that is the best weekly decision there is.
export const MIN_PICKS = 2;

// Wide early, narrower as the field thins. A roster everyone else also owns is not
// a decision, and holding the count flat would converge everybody at the merge.
const PICK_TIERS = [
    { atLeast: 15, picks: 4 },
    { atLeast: 9, picks: 3 },
];

export function getMaxPicks(remainingCount, episodeNum) {
    const cap = Number(episodeNum) === DRAFT_EPISODE
        ? PREMIERE_PICKS
        : (PICK_TIERS.find(t => remainingCount >= t.atLeast)?.picks ?? MIN_PICKS);
    // Always leave at least one castaway you did not pick.
    return Math.min(cap, Math.max(1, remainingCount - 1));
}

// The only four ways a player scores. This is the whole player-facing rulebook,
// so every detail worth knowing lives here as a note rather than being restated
// in prose elsewhere. Ordered the way a night actually goes.
export const ENGAGEMENT_SCORING = [
    {
        section: 'Weekly Picks',
        icon: '🎯',
        items: [
            { label: 'Pick your castaways', points: '—', emoji: '🗳️', note: `They earn you their event points for the episode. Change them every week. The app tells you how many — ${PREMIERE_PICKS} on premiere night, then fewer as the field thins, never below ${MIN_PICKS}.` },
            { label: 'Captain', points: '2×', emoji: '⭐', note: 'Star one of your picks each week. They score double. Pick the one you believe in.' },
        ],
    },
    {
        section: 'Predictions',
        icon: '🔮',
        items: [
            { label: 'Tree Mail (correct)', points: 3, emoji: '📬', note: 'Yes or no calls about the episode, answered before you watch. A blank pays nothing, but a wrong answer costs nothing either.' },
            { label: 'Snap Vote (correct)', points: 8, emoji: '⚡', note: 'Once they sit down at tribal, pause before Jeff asks anything and call whose torch gets snuffed. Opens when you light your torch, closes when you mark Done.' },
        ],
    },
    {
        section: 'Bingo',
        icon: '🎱',
        items: [
            { label: 'Each Square You Hit', points: 1, emoji: '🎯', note: 'No line needed to score. Long-press a square to read the full text.' },
            { label: 'Complete a Line', points: 5, emoji: '➖' },
            { label: 'Blackout (Full Card)', points: 50, emoji: '🌑', note: 'Paid instead of your line bonuses, not on top of them. Your squares still count.' },
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
// host marks those by tapping. A tap saves on its own and is not part of scoring.
// `excludes` names questions that must not appear in the same set, either
// because one answer gives away the other ("an idol is played" inside "an idol
// or an advantage is played") or because they are opposites and one of the two
// is a free +3 ("the vote splits" against "every vote is the same name").
export const PROP_BET_POOL = [
    // Camp — a scene, not a supply list
    { key: 'fire', text: 'Somebody makes fire at camp', cat: 'camp', phase: 'any', resolveType: 'event_any', resolveParams: { eventKey: 'make_fire_camp' } },
    { key: 'food', text: 'Somebody finds food', cat: 'camp', phase: 'any', resolveType: 'event_any', resolveParams: { eventKey: 'find_food' } },
    { key: 'well', text: 'Somebody talks strategy at the well', cat: 'camp', phase: 'any', resolveType: 'event_any', resolveParams: { eventKey: 'water_well_talk' } },
    { key: 'sent_away', text: 'Someone is sent away from camp', cat: 'camp', phase: 'any', excludes: ['journey_win', 'exile'], resolveType: 'event_any_of', resolveParams: { eventKeys: ['journey', 'exile'] } },
    { key: 'journey_win', text: 'A journey has an actual winner', cat: 'camp', phase: 'any', excludes: ['sent_away'], resolveType: 'event_any', resolveParams: { eventKey: 'journey_challenge_win' } },
    { key: 'exile', text: 'Exile is the twist tonight', cat: 'camp', phase: 'any', excludes: ['sent_away'], resolveType: 'event_any', resolveParams: { eventKey: 'exile' } },
    // Challenge
    { key: 'reward_separate', text: 'A reward gets won', cat: 'challenge', phase: 'any', resolveType: 'has_reward', resolveParams: {} },
    { key: 'ind_immunity', text: 'Someone wins individual immunity', cat: 'challenge', phase: 'post-merge', resolveType: 'event_any', resolveParams: { eventKey: 'individual_immunity' } },
    { key: 'ind_reward', text: 'A reward goes to one person, not a tribe', cat: 'challenge', phase: 'post-merge', resolveType: 'event_any', resolveParams: { eventKey: 'individual_reward' } },
    // Power — each line is a different bet, not three ways to say "an advantage"
    { key: 'power_surfaces', text: 'An idol or an advantage turns up', cat: 'idol', phase: 'any', excludes: ['no_power_found'], resolveType: 'event_any_of', resolveParams: { eventKeys: ['idol_found', 'advantage_found'] } },
    { key: 'power_played', text: 'Someone plays an idol or an advantage', cat: 'idol', phase: 'any', excludes: ['idol_works'], resolveType: 'event_any_of', resolveParams: { eventKeys: ['idol_played_success', 'advantage_used'] } },
    { key: 'two_power', text: 'An idol or an advantage comes up twice, found or played', cat: 'idol', phase: 'any', excludes: ['no_power_found'], resolveType: 'event_count_any_of_gte', resolveParams: { eventKeys: ['idol_found', 'advantage_found', 'idol_played_success', 'advantage_used'], threshold: 2 } },
    { key: 'shot', text: 'Someone risks a Shot in the Dark', cat: 'idol', phase: 'any', resolveType: 'event_any', resolveParams: { eventKey: 'shot_in_dark' } },
    { key: 'idol_works', text: 'An idol is played and it works', cat: 'idol', phase: 'any', excludes: ['power_played'], resolveType: 'event_any', resolveParams: { eventKey: 'idol_played_success' } },
    { key: 'no_power_found', text: 'Nobody finds an idol or an advantage', cat: 'idol', phase: 'any', excludes: ['power_surfaces', 'two_power'], resolveType: 'event_none_of', resolveParams: { eventKeys: ['idol_found', 'advantage_found'] } },
    // The vote and the edit
    { key: 'confessionals', text: 'One person owns the edit — four or more confessionals', cat: 'outcome', phase: 'any', resolveType: 'confessional_any_gte', resolveParams: { threshold: 4 } },
    { key: 'vote_split', text: 'The vote splits. More than one name', cat: 'vote', phase: 'any', excludes: ['vote_unanimous'], resolveType: 'vote_split', resolveParams: {} },
    { key: 'vote_unanimous', text: 'Every vote is the same name', cat: 'vote', phase: 'any', excludes: ['vote_split', 'survived_votes'], resolveType: 'vote_unanimous', resolveParams: {} },
    { key: 'survived_votes', text: 'Someone stays in after their name is read', cat: 'vote', phase: 'any', excludes: ['vote_unanimous'], resolveType: 'survived_with_vap_gte', resolveParams: { threshold: 1 } },
    { key: 'blowout', text: 'The boot is a blowout — five or more votes', cat: 'vote', phase: 'any', resolveType: 'eliminated_vap_gte', resolveParams: { threshold: 5 } },
];

// Premiere Tree Mail. Written for a two-hour Episode 1 with 21 strangers, two
// tribes, and one castaway held out. No resolveType: nothing to import yet, so
// the host marks every one of these by hand. That frees the wording from the
// importer's vocabulary — the only test is whether the room can agree on the
// answer by the end of the night.
//
// Order matters here. Episode 1 deals from the top of this list instead of
// shuffling (see generatePropBets), so the first PREMIERE_PROP_BET_COUNT lines
// are the curated set everybody gets and the rest are the host's swap bench.
export const PREMIERE_PROP_BETS = [
    // The headliners — real coin flips with something to argue about
    { key: 'early_idol', text: 'An idol is found before the first Tribal Council', cat: 'idol', excludes: ['clue_only', 'no_idol_found'] },
    { key: 'target_survives', text: 'Somebody gets targeted and survives the vote', cat: 'vote' },
    { key: 'first_vote_unanimous', text: 'The first vote is unanimous', cat: 'vote' },
    { key: 'blown_lead', text: 'A tribe blows a lead and still loses', cat: 'challenge' },
    { key: 'alliance_four', text: 'Four or more lock into one alliance', cat: 'camp' },
    { key: 'fire_day_one', text: 'A tribe gets fire going on day one', cat: 'camp' },
    { key: 'sits_out', text: 'Somebody sits out of the first challenge', cat: 'challenge', excludes: ['tribe_short'] },

    // The bench — swap these in from Host Controls
    { key: 'puzzle_finish', text: 'The immunity challenge comes down to a puzzle', cat: 'challenge' },
    { key: 'first_is_reward', text: 'The first challenge is for reward, not immunity', cat: 'challenge', excludes: ['both_prizes'] },
    { key: 'both_prizes', text: 'The winning tribe takes reward and immunity together', cat: 'challenge', excludes: ['first_is_reward'] },
    { key: 'clue_only', text: 'Somebody finds a clue but never gets the idol', cat: 'idol', excludes: ['early_idol'] },
    { key: 'power_shared', text: 'Somebody tells an ally about their idol or advantage', cat: 'idol' },
    { key: 'power_played', text: 'An idol or advantage gets played at the first Tribal', cat: 'idol' },
    { key: 'boot_has_power', text: 'The first person out leaves holding an advantage', cat: 'idol' },
    { key: 'no_idol_found', text: 'Nobody finds an idol tonight', cat: 'idol', excludes: ['early_idol', 'boot_has_power'] },
    { key: 'shot_in_dark', text: 'Somebody risks a Shot in the Dark', cat: 'vote' },
    { key: 'open_lie', text: "Somebody lies straight to another player's face", cat: 'camp' },
    { key: 'final_deal', text: 'Two people shake on a final two before the first vote', cat: 'camp' },
    { key: 'early_target', text: 'Somebody names a target before the shelter is built', cat: 'camp' },
    { key: 'rain', text: 'Rain hits camp before the first vote', cat: 'camp' },
    { key: 'journey', text: 'Somebody leaves camp for a journey', cat: 'twist' },
    { key: 'double_boot', text: 'Two people go home tonight', cat: 'twist' },
    { key: 'tribe_short', text: 'One tribe is short a player when they vote', cat: 'twist', excludes: ['held_out_skips_tribal', 'sits_out'] },
    { key: 'held_out_skips_tribal', text: 'The held-out castaway misses the first Tribal Council', cat: 'twist', excludes: ['tribe_short'] },
];

// How many Tree Mail questions land on a card. The premiere runs two hours and
// has no weekly picks in front of it, so it carries a few more.
export const PROP_BET_COUNT = 5;
export const PREMIERE_PROP_BET_COUNT = 7;

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

export function generatePropBets(episodeNumber, count, isPostMerge = false) {
    const isPremiere = Number(episodeNumber) === 1;
    const pool = getPropBetSwapPool(episodeNumber, isPostMerge);
    // There is only ever one premiere, so a shuffle buys nothing and can bury
    // the best questions. Deal it in authored order instead.
    const ordered = isPremiere ? pool : deterministicShuffle(pool, episodeNumber * 7919);
    const target = count ?? (isPremiere ? PREMIERE_PROP_BET_COUNT : PROP_BET_COUNT);
    const selected = [];
    // The weekly pool needs a category cap or a shuffle hands you five idol
    // bets. The premiere set is curated by hand, so it does not.
    const capCategories = !isPremiere;
    const catCount = {};
    for (const bet of ordered) {
        const cat = bet.cat || 'other';
        if (capCategories && (catCount[cat] || 0) >= 2) continue;
        if (!betFits(bet, selected)) continue;
        selected.push(bet);
        catCount[cat] = (catCount[cat] || 0) + 1;
        if (selected.length >= target) break;
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

/**
 * Host taps win. Auto-resolve fills only a question nobody has answered, and
 * only when that question has a resolver. A question with no resolver stays
 * blank — the resolver's default is NO, which would hand points to everyone
 * who skipped it.
 */
export function mergePropBetResults(existing, bets, resolved) {
    const merged = {};
    for (const bet of bets || []) {
        if (typeof existing?.[bet.id] === 'boolean') {
            merged[bet.id] = existing[bet.id];
        } else if (bet.resolveType && typeof resolved?.[bet.id] === 'boolean') {
            merged[bet.id] = resolved[bet.id];
        }
    }
    return merged;
}

// ── Island Bingo ──
// Mark it the moment it happens. Short, because the square is tiny and the
// label is uppercase. Seven lanes, so a random card cannot be eight versions
// of Jeff's shirt.
//
// Three rules earn a square its place:
//   1. It must be able to NOT happen. Anything that lands every single episode
//      is a formality, not a square — no torch snuffing, no reading of votes,
//      no "the tribe has spoken."
//   2. It must be possible tonight. Nothing gated behind the merge, because a
//      premiere card that contains it is unwinnable in that spot.
//   3. A judgment call is welcome if it starts an argument ("was that a dad
//      joke?"), and unwelcome if it is quietly always true (a slow push-in).

export const BINGO_ITEMS = [
    // Jeff, the lines and the bits
    '"Worth playing for?"',
    'Jeff: "Dig deep"',
    '"Got nothin\' for ya"',
    'A Probst dad joke',
    '"Permanent uncertainty"',
    'Jeff says "Open Era"',
    'Jeff wades in after them',
    'Jeff needles somebody',
    // The edit, not the scenery
    'Villain music hits',
    'A whisper, subtitled',
    'A flashback insert',
    'Sad music, big smile',
    'A nickname on the chyron',
    'An "hours later" card',
    'A rat or a crab on screen',
    'Night vision at camp',
    'A clip from an old season',
    'A confessional in the rain',
    // Words you hear them say
    '"It\'s a big move"',
    '"I trust them completely"',
    '"I\'m on the bottom"',
    '"We need a decoy"',
    'A name gets walked back',
    '"I\'m a free agent"',
    '"Don\'t tell the others"',
    'Someone says "blindsided"',
    '"They\'re coming for me"',
    '"I have the numbers"',
    '"I\'m playing my own game"',
    '"This is my dream"',
    // The challenge, the beat not the prop
    'A puzzle piece won\'t fit',
    'Wipes out on the beam',
    'Jeff stops the challenge',
    'Sitting out on the bench',
    'A knot that will not budge',
    'A full-body splash',
    '"Dig, dig, dig!"',
    'The finish flag goes up',
    'Immunity gets handed over',
    'A crate drags up the beach',
    'Someone slips on the mud',
    // Idols and paper
    'Sneaks away from camp',
    'A clue, read whispering',
    'Digging after dark',
    'An idol gets unwrapped',
    '"Do not open this"',
    'The Shot in the Dark die',
    'Idol shown to one ally',
    'An advantage gets played',
    '"I know where it is"',
    'A Beware Advantage',
    'Somebody makes a fake idol',
    'A vote steal or extra vote',
    // Camp, when it becomes a scene
    'A fight over the rice',
    'The machete comes out',
    '"I am so hungry"',
    'Strategy at the well',
    'The shelter sags',
    'Somebody hides food',
    'A bug-bite meltdown',
    '"This tribe is a mess"',
    'Quiet after a blindside',
    'A reward feast',
    'Fire that will not catch',
    'Rain soaks the camp',
    // Tribal, mark it when it happens
    'A throwaway vote',
    'Jeff calls a revote',
    'Someone stands to play',
    'People stand. Live tribal',
    '"Give me a minute"',
    'A vote does not count',
    'Somebody cries at tribal',
    'A whisper huddle at tribal',
    'Someone changes their mind',
    'The vote is unanimous',
    'A name said out loud',
];

// Premiere-only. Episode 1 cards reserve four of these, so the open is on the
// card without becoming a third of it. The boat, the buffs, and the held-out
// player are one scene. Confirmed beats are left off on purpose — supplies
// thrown in and swum ashore, the yellow and purple buffs, and the player sent
// on a journey will happen, same as the ship and the jump in the sneak peek.
// What stays can miss, or at least start an argument.
export const PREMIERE_BINGO_ITEMS = [
    'Probst rings the bell',
    '"Find your name"',
    'Somebody says "21"',
    'A note read out loud',
    '"I have wanted this"',
    'Already crying',
    'A buff as a headband',
    'Bamboo comes off the boat',
    'A name is mispronounced',
    'Nobody knows what to do',
    'An alliance in hour one',
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
const PREMIERE_SQUARES_ON_CARD = 4;

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
