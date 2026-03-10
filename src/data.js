// Survivor Season 50 cast data — all 24 returning players
import { COLORS } from './theme';

export const TRIBES = {
    cila: {
        name: 'Cila',
        color: 'cila',
        members: [
            { id: 'rick_devens', name: 'Rick Devens', seasons: 'Edge of Extinction', short: 'S38' },
            { id: 'cirie_fields', name: 'Cirie Fields', seasons: 'Panama +3', short: 'S12,16,20,34' },
            { id: 'emily_flippen', name: 'Emily Flippen', seasons: 'S45', short: 'S45' },
            { id: 'christian_hubicki', name: 'Christian Hubicki', seasons: 'David vs. Goliath', short: 'S37' },
            { id: 'joe_hunter', name: 'Joe Hunter', seasons: 'S48', short: 'S48' },
            { id: 'jenna_lewis', name: 'Jenna Lewis', seasons: 'Borneo, All-Stars', short: 'S1,8' },
            { id: 'savannah_louie', name: 'Savannah Louie', seasons: 'S49 Winner 👑', short: 'S49' },
            { id: 'ozzy_lusth', name: 'Ozzy Lusth', seasons: 'Cook Islands +3', short: 'S13,16,23,34' },
        ],
    },
    vatu: {
        name: 'Vatu',
        color: 'vatu',
        members: [
            { id: 'aubry_bracco', name: 'Aubry Bracco', seasons: 'Kaôh Rōng +2', short: 'S32,34,38' },
            { id: 'q_burdette', name: 'Q Burdette', seasons: 'S46', short: 'S46' },
            { id: 'colby_donaldson', name: 'Colby Donaldson', seasons: 'Outback +2', short: 'S2,8,20' },
            { id: 'kyle_fraser', name: 'Kyle Fraser', seasons: 'S48 Winner 👑', short: 'S48' },
            { id: 'angelina_keeley', name: 'Angelina Keeley', seasons: 'David vs. Goliath', short: 'S37' },
            { id: 'stephenie_lagrossa', name: 'Stephenie LaGrossa', seasons: 'Palau +2', short: 'S10,11,20' },
            { id: 'genevieve_mushaluk', name: 'Genevieve Mushaluk', seasons: 'S47', short: 'S47' },
            { id: 'rizo_velovic', name: 'Rizo Velovic', seasons: 'S49', short: 'S49' },
        ],
    },
    kalo: {
        name: 'Kalo',
        color: 'kalo',
        members: [
            { id: 'charlie_davis', name: 'Charlie Davis', seasons: 'S46', short: 'S46' },
            { id: 'tiffany_ervin', name: 'Tiffany Ervin', seasons: 'S46', short: 'S46' },
            { id: 'chrissy_hofbeck', name: 'Chrissy Hofbeck', seasons: 'HvHvH', short: 'S35' },
            { id: 'kamilla_karthigesu', name: 'Kamilla Karthigesu', seasons: 'S48', short: 'S48' },
            { id: 'dee_valladares', name: 'Dee Valladares', seasons: 'S45 Winner 👑', short: 'S45' },
            { id: 'coach_wade', name: 'Coach Wade', seasons: 'Tocantins +2', short: 'S18,20,23' },
            { id: 'mike_white', name: 'Mike White', seasons: 'David vs. Goliath', short: 'S37' },
            { id: 'jonathan_young', name: 'Jonathan Young', seasons: 'S42', short: 'S42' },
        ],
    },
};

export const ALL_CASTAWAYS = Object.values(TRIBES).flatMap(t => t.members);

// Historical stats from SurvivorStatsDB (pre-season, based on prior seasons)
// Source: https://survivorstatsdb.com/character-cards-US50.html
export const HISTORICAL_STATS = {
    ozzy_lusth:           { overall: 85, tribal: 84, individual: 100, voting: 84, advantages: 0,   influence: 50, jury: 44, bestResult: 'Runner-up', age: 43, timesPlayed: 5 },
    colby_donaldson:      { overall: 83, tribal: 35, individual: 100, voting: 91, advantages: 0,   influence: 98, jury: 43, bestResult: 'Runner-up', age: 51, timesPlayed: 4 },
    kyle_fraser:          { overall: 78, tribal: 61, individual: 79,  voting: 79, advantages: 30,  influence: 58, jury: 62, bestResult: 'Sole Survivor', age: 31, timesPlayed: 2 },
    dee_valladares:       { overall: 77, tribal: 75, individual: 80,  voting: 61, advantages: 0,   influence: 73, jury: 62, bestResult: 'Sole Survivor', age: 28, timesPlayed: 2 },
    joe_hunter:           { overall: 77, tribal: 75, individual: 93,  voting: 76, advantages: 0,   influence: 55, jury: 12, bestResult: 'Runner-up', age: 46, timesPlayed: 2 },
    charlie_davis:        { overall: 73, tribal: 45, individual: 81,  voting: 70, advantages: 0,   influence: 71, jury: 38, bestResult: 'Runner-up', age: 27, timesPlayed: 2 },
    coach_wade:           { overall: 72, tribal: 51, individual: 39,  voting: 100, advantages: 20, influence: 93, jury: 33, bestResult: 'Runner-up', age: 53, timesPlayed: 4 },
    chrissy_hofbeck:      { overall: 70, tribal: 22, individual: 98,  voting: 63, advantages: 7,   influence: 61, jury: 25, bestResult: 'Runner-up', age: 54, timesPlayed: 2 },
    rick_devens:          { overall: 66, tribal: 26, individual: 90,  voting: 63, advantages: 100, influence: 79, jury: 0,  bestResult: '4th', age: 41, timesPlayed: 2 },
    kamilla_karthigesu:   { overall: 63, tribal: 61, individual: 58,  voting: 71, advantages: 19,  influence: 57, jury: 0,  bestResult: '4th', age: 31, timesPlayed: 2 },
    aubry_bracco:         { overall: 62, tribal: 53, individual: 27,  voting: 73, advantages: 0,   influence: 91, jury: 29, bestResult: 'Runner-up', age: 39, timesPlayed: 4 },
    jonathan_young:       { overall: 61, tribal: 66, individual: 52,  voting: 74, advantages: 0,   influence: 21, jury: 0,  bestResult: '4th', age: 32, timesPlayed: 2 },
    mike_white:           { overall: 58, tribal: 26, individual: 38,  voting: 70, advantages: 0,   influence: 45, jury: 30, bestResult: 'Runner-up', age: 54, timesPlayed: 2 },
    stephenie_lagrossa:   { overall: 58, tribal: 22, individual: 27,  voting: 77, advantages: 0,   influence: 90, jury: 14, bestResult: 'Runner-up', age: 45, timesPlayed: 4 },
    emily_flippen:        { overall: 55, tribal: 18, individual: 55,  voting: 74, advantages: 0,   influence: 86, jury: 0,  bestResult: '7th', age: 30, timesPlayed: 2 },
    q_burdette:           { overall: 54, tribal: 18, individual: 48,  voting: 76, advantages: 13,  influence: 67, jury: 0,  bestResult: '6th', age: 31, timesPlayed: 2 },
    genevieve_mushaluk:   { overall: 54, tribal: 40, individual: 43,  voting: 63, advantages: 15,  influence: 66, jury: 0,  bestResult: '5th', age: 34, timesPlayed: 2 },
    cirie_fields:         { overall: 53, tribal: 51, individual: 23,  voting: 69, advantages: 0,   influence: 95, jury: 0,  bestResult: '4th', age: 54, timesPlayed: 5 },
    christian_hubicki:    { overall: 52, tribal: 40, individual: 53,  voting: 60, advantages: 43,  influence: 53, jury: 0,  bestResult: '7th', age: 39, timesPlayed: 2 },
    angelina_keeley:      { overall: 51, tribal: 26, individual: 18,  voting: 68, advantages: 20,  influence: 72, jury: 0,  bestResult: 'Runner-up', age: 35, timesPlayed: 2 },
    jenna_lewis:          { overall: 51, tribal: 61, individual: 11,  voting: 70, advantages: 0,   influence: 48, jury: 0,  bestResult: '3rd', age: 47, timesPlayed: 3 },
    tiffany_ervin:        { overall: 51, tribal: 18, individual: 35,  voting: 89, advantages: 11,  influence: 57, jury: 0,  bestResult: '8th', age: 34, timesPlayed: 2 },
};

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

// Scoring events (values updated to match brainstorm)
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
        section: 'Predictions',
        icon: '🔮',
        items: [
            { label: 'Prop Bet (correct)', points: 3, emoji: '🎰' },
            { label: 'Snap Vote (correct)', points: 8, emoji: '⚡' },
            { label: 'Side Bet (correct)', points: 3, emoji: '🤞' },
        ],
    },
    {
        section: 'Ride or Die',
        icon: '🤝',
        items: [
            { label: 'Survive per Episode', points: 2, emoji: '✅' },
            { label: 'Reach Finale', points: 15, emoji: '🏛️' },
            { label: 'Win Season', points: 30, emoji: '👑' },
            { label: 'Exclusivity Bonus', points: '1.5×', emoji: '💎', note: 'If you are the only player who picked a contestant, their points are multiplied by 1.5×' },
        ],
    },
    {
        section: 'Bingo',
        icon: '🎱',
        items: [
            { label: 'Complete a Line', points: 5, emoji: '➖' },
            { label: 'Blackout (Full Card)', points: 50, emoji: '🌑' },
        ],
    },
    {
        section: 'Social',
        icon: '⭐',
        items: [
            { label: 'Player of the Episode', points: 7, emoji: '🏆' },
            { label: 'Impact Rating', points: '1-5 avg', emoji: '📊', note: 'Weekly peer rating' },
        ],
    },
    {
        section: 'Passports',
        icon: '📜',
        items: [
            { label: 'Season Passport', points: '15-25', emoji: '🛂', note: 'Pre-season predictions scored at finale' },
            { label: 'Merge Passport', points: '8-12', emoji: '📋', note: 'Mid-season predictions scored at finale' },
        ],
    },
];

// Structured prop bets -- each has resolution logic so outcomes are auto-determined from imported data.
// resolveType: 'event_any' | 'event_count_gte' | 'vote_unanimous' | 'elimination_method' | 'has_reward' | 'vote_split'
export const PROP_BET_POOL = [
    { text: 'Will someone find an idol?', resolveType: 'event_any', resolveParams: { eventKey: 'idol_found' } },
    { text: 'Will someone play an idol?', resolveType: 'event_any', resolveParams: { eventKey: 'idol_played_success' } },
    { text: 'Will someone find an advantage?', resolveType: 'event_any', resolveParams: { eventKey: 'advantage_found' } },
    { text: 'Will someone use an advantage?', resolveType: 'event_any', resolveParams: { eventKey: 'advantage_used' } },
    { text: 'Will someone find a clue?', resolveType: 'event_any', resolveParams: { eventKey: 'find_clue' } },
    { text: 'Will someone make fire at camp?', resolveType: 'event_any', resolveParams: { eventKey: 'make_fire_camp' } },
    { text: 'Will someone find food?', resolveType: 'event_any', resolveParams: { eventKey: 'find_food' } },
    { text: 'Will someone go on a journey?', resolveType: 'event_any', resolveParams: { eventKey: 'journey' } },
    { text: 'Will someone win a journey challenge?', resolveType: 'event_any', resolveParams: { eventKey: 'journey_challenge_win' } },
    { text: 'Will someone read tree mail?', resolveType: 'event_any', resolveParams: { eventKey: 'read_tree_mail' } },
    { text: 'Will someone strategize at the water well?', resolveType: 'event_any', resolveParams: { eventKey: 'water_well_talk' } },
    { text: 'Will someone go to exile?', resolveType: 'event_any', resolveParams: { eventKey: 'exile' } },
    { text: 'Will someone play Shot in the Dark?', resolveType: 'event_any', resolveParams: { eventKey: 'shot_in_dark' } },
    { text: 'Will anyone survive with votes against them?', resolveType: 'event_any', resolveParams: { eventKey: 'survived_with_votes' } },
    { text: 'Will there be a medical evacuation?', resolveType: 'elimination_method', resolveParams: { method: 'medevac' } },
    { text: 'Will the vote be unanimous?', resolveType: 'vote_unanimous', resolveParams: {} },
    { text: 'Will there be a split vote?', resolveType: 'vote_split', resolveParams: {} },
    { text: 'Will there be a reward challenge?', resolveType: 'has_reward', resolveParams: {} },
    { text: 'Will 2+ players receive votes at tribal?', resolveType: 'event_count_gte', resolveParams: { eventKey: 'survived_with_votes', threshold: 1 } },
    { text: 'Will 3+ players get zero votes at tribal?', resolveType: 'event_count_gte', resolveParams: { eventKey: 'attended_tribal_zero', threshold: 3 } },
    { text: 'Will someone win an individual immunity?', resolveType: 'event_any', resolveParams: { eventKey: 'individual_immunity' } },
    { text: 'Will someone win an individual reward?', resolveType: 'event_any', resolveParams: { eventKey: 'individual_reward' } },
    { text: 'Will someone reach the merge?', resolveType: 'event_any', resolveParams: { eventKey: 'merge' } },
    { text: 'Will there be a fire-making challenge?', resolveType: 'event_any', resolveParams: { eventKey: 'fire_making_win' } },
];

export const SIDE_BET_POOL = [
    { text: 'Will an idol be played at this tribal?', resolveType: 'event_any', resolveParams: { eventKey: 'idol_played_success' } },
    { text: 'Will the vote be unanimous?', resolveType: 'vote_unanimous', resolveParams: {} },
    { text: 'Will someone play Shot in the Dark?', resolveType: 'event_any', resolveParams: { eventKey: 'shot_in_dark' } },
    { text: 'Will there be a split vote?', resolveType: 'vote_split', resolveParams: {} },
    { text: 'Will anyone survive with votes against them?', resolveType: 'event_any', resolveParams: { eventKey: 'survived_with_votes' } },
    { text: 'Will an advantage be played?', resolveType: 'event_any', resolveParams: { eventKey: 'advantage_used' } },
    { text: 'Will 2+ players receive votes?', resolveType: 'event_count_gte', resolveParams: { eventKey: 'survived_with_votes', threshold: 1 } },
    { text: 'Will 3+ players get zero votes at tribal?', resolveType: 'event_count_gte', resolveParams: { eventKey: 'attended_tribal_zero', threshold: 3 } },
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

export function generatePropBets(episodeNumber, count = 5) {
    const shuffled = deterministicShuffle(PROP_BET_POOL, episodeNumber * 7919);
    return shuffled.slice(0, count).map((bet, i) => ({ id: `prop_${episodeNumber}_${i}`, text: bet.text, resolveType: bet.resolveType, resolveParams: bet.resolveParams }));
}

/**
 * Resolve prop/side bet outcomes from imported episode data.
 * importData: { bigMoments, minorityVoters, receivedVotes, eliminationMethod, rewardWinners, ... }
 * bets: [{ id, resolveType, resolveParams }]
 * Returns: { [betId]: boolean }
 */
export function resolveBets(importData, bets) {
    const results = {};
    const allEvents = Object.values(importData.bigMoments || {}).flat();
    const gameEvents = importData.gameEvents || {};
    const allGameEvents = Object.values(gameEvents).flat();
    const combinedEvents = [...allEvents, ...allGameEvents];

    for (const bet of bets) {
        const { id, resolveType, resolveParams } = bet;
        switch (resolveType) {
            case 'event_any':
                results[id] = combinedEvents.includes(resolveParams.eventKey);
                break;
            case 'event_count_gte': {
                const count = combinedEvents.filter(e => e === resolveParams.eventKey).length;
                results[id] = count >= resolveParams.threshold;
                break;
            }
            case 'vote_unanimous':
                results[id] = (importData.minorityVoters || []).length === 0 && !!importData.eliminatedId;
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
            default:
                results[id] = false;
        }
    }
    return results;
}

export function getMaxPicks(remainingCount) {
    return Math.min(5, Math.floor(remainingCount / 2));
}

// Bingo squares pool (100+ items, Probst-isms mixed in)
export const BINGO_ITEMS = [
    // Jeff Probst classics
    '"The tribe has spoken"',
    '"Come on in!"',
    '"Dig deep!"',
    '"Worth playing for?"',
    '"Outwit, outplay, outlast"',
    'Jeff says "previously on"',
    'Jeff says "want to know?"',
    'Jeff gives life advice',
    'Jeff raises his eyebrow',
    'Jeff narrates the challenge',
    'Jeff says "got nothin\' for ya"',
    'Jeff says "fire represents life"',
    'Jeff says "biggest move ever"',
    'Jeff says "one of the biggest blindsides"',
    'Jeff dramatically snuffs a torch',
    'Jeff asks "what happened at camp?"',
    'Jeff stirs the pot at tribal',
    'Jeff smirks at an answer',
    'Jeff does a challenge play-by-play',
    'Jeff says "I\'ll count the votes"',
    // Tribal council
    '"Blindside!"',
    'Someone whispers at tribal',
    'Vote is split',
    'Emotional tribal council',
    'Someone says "trust"',
    'Someone says "threat"',
    'Someone says "resume"',
    'Someone says "at the end of the day"',
    'Player throws someone under the bus',
    'Player boasts about themselves',
    'Someone says "million dollars"',
    'Someone says "it\'s just a game"',
    'Someone says "game changer"',
    'Player defends their game',
    'Player calls someone out',
    'Side conversation during tribal',
    'Someone says "blindside"',
    'A vote reveal gets a gasp',
    'Someone says "big move"',
    'Standing ovation or applause at tribal',
    // Challenges
    'Challenge involves water',
    'Puzzle in challenge',
    'Someone falls in challenge',
    'Immunity necklace closeup',
    'Challenge involves balance',
    'Challenge involves endurance',
    'Challenge has a gross food element',
    'Someone sits out of a challenge',
    'Challenge involves digging',
    'Photo finish in challenge',
    'Someone dominates a challenge',
    'Challenge involves knots or ropes',
    'Comeback win in challenge',
    // Idols & advantages
    'Idol is found',
    'Idol is played',
    'Player hides an idol',
    'Player finds a clue',
    'Advantage is found',
    'Someone plays Shot in the Dark',
    'Fake idol or decoy',
    'Someone searches for an idol alone',
    'Idol/advantage bluff',
    // Camp life
    'Rain at camp',
    'Someone makes fire',
    'Coconut is cracked open',
    'Player complains about hunger',
    'Player gets sunburned',
    'Secret meeting at well',
    'Reward has food',
    'Someone cooks rice',
    'Shelter building or repair',
    'Someone goes fishing',
    'Night vision camp footage',
    'Player talks to camera at night',
    'Someone naps in the shelter',
    'Fireside strategy talk',
    // Emotional & social
    'Player cries',
    'Someone talks about family',
    'Player fake-cries',
    'Group hug',
    'Someone gets emotional in confessional',
    'Someone says "I love this game"',
    'Player motivational speech',
    'Someone misses home',
    'Heartfelt moment between rivals',
    'Someone comforts another player',
    // Strategy
    'Alliance is formed',
    'Alliance is betrayed',
    'Someone strategizes in confessional',
    '"I didn\'t come here to lose"',
    '"This is my island"',
    'Someone says "4th time playing"',
    'A returnee references their past season',
    'Player lies to someone\'s face',
    'Two players make a final 2/3 deal',
    'Someone flips on their alliance',
    'Voting confessional trash talk',
    'Someone says "blood on my hands"',
    'Someone says "under the radar"',
    'Someone plays both sides',
    // Production & visuals
    'Shot of wildlife',
    'Bug/insect closeup',
    'Dramatic music sting',
    'Sunset or sunrise shot',
    'Aerial island shot',
    'Someone does a victory dance',
    'Slow-motion challenge replay',
    'Tree mail arrives',
    'Confessional count: 5+ for one player',
    // Game milestones
    'Medical team is called',
    'Post-merge feast',
    'Tribe swap happens',
    // Season 50 specials
    'Coach does Coach things',
    'Ozzy catches fish',
    'Cirie makes a big move',
    'Angelina mentions the jacket',
    'A winner references their winning season',
    'Two legends strategize together',
    'Someone mentions "the greatest season"',
];

// Hash a string to a numeric seed
function hashSeed(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

// Generate a shuffled bingo card (5x5 with free center)
// seed should be a string like "{leagueId}-{episodeNum}-{playerId}"
export function generateBingoCard(seed) {
    const shuffled = [...BINGO_ITEMS];
    let s = typeof seed === 'string' ? hashSeed(seed) : (seed || Math.floor(Math.random() * 10000));
    for (let i = shuffled.length - 1; i > 0; i--) {
        s = (s * 16807 + 0) % 2147483647;
        const j = s % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const items = shuffled.slice(0, 24);
    items.splice(12, 0, '🔥 FREE');
    return items;
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

export const ACHIEVEMENTS = [
    { id: 'prophet', name: 'Prophet', emoji: '🔮', description: '3 correct snap votes in a row' },
    { id: 'bingo_blackout', name: 'Bingo Blackout', emoji: '🎯', description: 'Complete an entire bingo card' },
    { id: 'contrarian', name: 'Contrarian', emoji: '🎭', description: 'Win 5 scarcity bonuses (unique picks that scored)' },
    { id: 'ride_or_die_loyalty', name: 'Ride or Die Loyalty', emoji: '💀', description: 'Both ride or dies survive to merge' },
    { id: 'beast_mode', name: 'Beast Mode', emoji: '💪', description: 'One of your picks scores 20+ in a single episode' },
    { id: 'first_blood', name: 'First Blood', emoji: '🗡️', description: 'Correct snap vote on the first episode' },
    { id: 'sole_survivor_standings', name: 'Sole Survivor', emoji: '👑', description: 'Hold first place for 3 consecutive weeks' },
    { id: 'dethroned', name: 'Dethroned', emoji: '⚔️', description: 'Overtake the first-place player' },
    { id: 'social_butterfly', name: 'Social Butterfly', emoji: '🦋', description: 'Vote on every Player of the Episode for 5 episodes' },
    { id: 'perfect_episode', name: 'Perfect Episode', emoji: '✨', description: 'Score in every category in a single episode' },
];

export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));
