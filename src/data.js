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

// Bingo squares pool
export const BINGO_ITEMS = [
    '"The tribe has spoken"',
    '"Come on in!"',
    '"Dig deep!"',
    '"Worth playing for?"',
    '"Blindside!"',
    'Someone says "million dollars"',
    'Player cries',
    'Someone talks about family',
    'Secret meeting at well',
    'Shot of wildlife',
    'Rain at camp',
    'Challenge involves water',
    'Someone falls in challenge',
    'Idol is found',
    'Idol is played',
    'Vote is split',
    'Player complains about hunger',
    'Someone makes fire',
    'Jeff snuffs a torch',
    '"Outwit, outplay, outlast"',
    'Puzzle in challenge',
    'Player boasts about themselves',
    'Someone whispers at tribal',
    'Jeff gives life advice',
    'Immunity necklace closeup',
    'Someone says "threat"',
    'Alliance is formed',
    'Alliance is betrayed',
    'Someone says "resume"',
    'Player finds a clue',
    'Reward has food',
    'Someone strategizes in confessional',
    'Jeff says "previously on"',
    'Tree mail arrives',
    'Someone says "game changer"',
    'Coach does Coach things',
    'Ozzy catches fish',
    'Cirie makes a big move',
    'Angelina mentions the jacket',
    'Someone says "4th time playing"',
    'Player hides an idol',
    'Emotional tribal council',
    'Jeff narrates the challenge',
    'Post-merge feast',
    'Someone says "at the end of the day"',
    'Player throws someone under the bus',
    'Coconut is cracked open',
    'Someone says "trust"',
    'Tribe swap happens',
    'Medical team is called',
    'Player gets sunburned',
    'Jeff says "want to know?"',
    'Someone does a victory dance',
    '"I didn\'t come here to lose"',
    'Player fake-cries',
    'Bug/insect closeup',
    'Someone says "it\'s just a game"',
    'Player talks to camera at night',
    '"This is my island"',
    'Jeff raises his eyebrow',
];

// Generate a shuffled bingo card (5x5 with free center)
export function generateBingoCard(seed) {
    const shuffled = [...BINGO_ITEMS];
    // Seeded shuffle using simple hash
    let s = seed || Math.random() * 10000;
    for (let i = shuffled.length - 1; i > 0; i--) {
        s = (s * 16807 + 0) % 2147483647;
        const j = s % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const items = shuffled.slice(0, 24);
    // Insert free space at center (index 12)
    items.splice(12, 0, 'FREE SPACE 🏝️');
    return items;
}
