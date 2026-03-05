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
];

export const ENGAGEMENT_SCORING = [
    {
        section: 'Predictions',
        icon: '🔮',
        items: [
            { label: 'Correct Elimination Pick', points: 5, emoji: '🎯' },
            { label: 'Bold Prediction (correct)', points: 10, emoji: '💡' },
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

// Prop bet template pool (auto-generated, admin can swap/edit)
export const PROP_BET_POOL = [
    'Will an idol be played tonight?',
    'Will someone cry?',
    'Will there be a revote at tribal?',
    'Will the challenge involve water?',
    'Will someone find an idol or advantage?',
    'Will Jeff say "dig deep"?',
    'Will there be a blindside?',
    'Will the vote be unanimous?',
    'Will someone whisper at tribal council?',
    'Will a player mention their family?',
    'Will there be a puzzle in the challenge?',
    'Will someone talk about being a threat?',
    'Will a former winner win immunity?',
    'Will someone throw another player under the bus at tribal?',
    'Will there be a split vote?',
    'Will someone play a Shot in the Dark?',
    'Will rain fall during camp scenes?',
    'Will there be a reward challenge?',
    'Will Jeff give a speech or life advice?',
    'Will someone make fire at camp?',
    'Will an alliance be formed or discussed?',
    'Will the episode end with a torch snuff?',
    'Will Ozzy catch a fish?',
    'Will Coach do something Coach-like?',
    'Will someone say "at the end of the day"?',
    'Will a player hide something from their tribe?',
    'Will someone say "million dollars"?',
    'Will a player get sunburned or complain about conditions?',
    'Will there be a medical check?',
    'Will the eliminated player see it coming?',
];

export const SIDE_BET_POOL = [
    'Will an idol be played at this tribal?',
    'Will there be tears at tribal?',
    'Will someone whisper at tribal?',
    'Will there be a revote?',
    'Will the vote be unanimous?',
    'Will Jeff stir the pot?',
    'Will someone play Shot in the Dark?',
    'Will there be a split vote?',
    'Will someone stand up during tribal?',
    'Will the boot see it coming?',
    'Will someone mention a past alliance?',
    'Will Jeff give a dramatic pause?',
];

export function generateSideBets(episodeNumber, count = 3) {
    const shuffled = [...SIDE_BET_POOL];
    let s = (episodeNumber * 13337 + 42) % 2147483647;
    for (let i = shuffled.length - 1; i > 0; i--) {
        s = (s * 16807 + 0) % 2147483647;
        const j = s % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count).map((text, i) => ({ id: `side_${episodeNumber}_${i}`, text }));
}

export function generatePropBets(episodeNumber, count = 5) {
    const shuffled = [...PROP_BET_POOL];
    let s = episodeNumber * 7919;
    for (let i = shuffled.length - 1; i > 0; i--) {
        s = (s * 16807 + 0) % 2147483647;
        const j = s % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count).map((text, i) => ({ id: `prop_${episodeNumber}_${i}`, text }));
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
    { id: 'prophet', name: 'Prophet', emoji: '🔮', description: '3 correct elimination predictions in a row' },
    { id: 'bingo_blackout', name: 'Bingo Blackout', emoji: '🎯', description: 'Complete an entire bingo card' },
    { id: 'contrarian', name: 'Contrarian', emoji: '🎭', description: 'Win 5 scarcity bonuses (unique picks that scored)' },
    { id: 'ride_or_die_loyalty', name: 'Ride or Die Loyalty', emoji: '💀', description: 'Both ride or dies survive to merge' },
    { id: 'beast_mode', name: 'Beast Mode', emoji: '💪', description: 'One of your picks scores 20+ in a single episode' },
    { id: 'first_blood', name: 'First Blood', emoji: '🗡️', description: 'Correctly predict the first elimination' },
    { id: 'sole_survivor_standings', name: 'Sole Survivor', emoji: '👑', description: 'Hold first place for 3 consecutive weeks' },
    { id: 'dethroned', name: 'Dethroned', emoji: '⚔️', description: 'Overtake the first-place player' },
    { id: 'social_butterfly', name: 'Social Butterfly', emoji: '🦋', description: 'Vote on every Player of the Episode for 5 episodes' },
    { id: 'perfect_episode', name: 'Perfect Episode', emoji: '✨', description: 'Score in every category in a single episode' },
];

export const ACHIEVEMENT_MAP = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));
