import * as cheerio from 'cheerio';

// Minimal cast data duplicated from src/data.js for server-side use.
// Only the fields needed for parsing are included. Keep in sync with CONTESTANTS there.
//
// `aliases` cover the short names the stat sites actually print, which do not always
// match the first word of the official name: True Dork Times lists "Dan" and
// "Thien An", Fantasy Survivor Game lists "Kilby".
const CAST = [
    { id: 'aaliyah_puglia', name: 'Aaliyah Puglia', fsgId: '536' },
    { id: 'alexis_levine', name: 'Alexis Levine', fsgId: '537' },
    { id: 'an_nguyen', name: 'An Nguyen', fsgId: '538', aliases: ['thien an', 'thien'] },
    { id: 'ana_sani', name: 'Ana Sani', fsgId: '539' },
    { id: 'jelly_loblack', name: 'Angelica LoBlack', fsgId: '540', aliases: ['jelly', 'loblack', 'angelica loblack'] },
    { id: 'brady_booker', name: 'Brady Booker', fsgId: '541' },
    { id: 'carter_krull', name: 'Carter Krull', fsgId: '542' },
    { id: 'cristian_chavez', name: 'Cristian Chavez', fsgId: '543' },
    { id: 'danny_kilby', name: 'Dan Kilby', fsgId: '544', aliases: ['kilby', 'dan', 'danny', 'danny kilby'] },
    { id: 'devin_way', name: 'Devin Way', fsgId: '545' },
    { id: 'eric_macksoud', name: 'Eric Macksoud', fsgId: '546' },
    { id: 'jenna_doore', name: 'Jenna Doore', fsgId: '547', aliases: ['jenna greenawalt', 'greenawalt'] },
    { id: 'kristin_flickinger', name: 'Kristin Flickinger', fsgId: '548' },
    { id: 'lewis_kelly', name: 'Lewis Kelly', fsgId: '549' },
    { id: 'linnea_capobianco', name: 'Linnea Capobianco', fsgId: '550' },
    { id: 'maggie_nestor', name: 'Maggie Nestor', fsgId: '551' },
    { id: 'mike_pinsky', name: 'Michael Pinsky', fsgId: '552', aliases: ['mike', 'mike pinsky'] },
    { id: 'ori_jean_charles', name: 'Ori Jean-Charles', fsgId: '553', aliases: ['ori'] },
    { id: 'patt_cannaday', name: 'Patt Cannaday', fsgId: '554', aliases: ['pat', 'cannady', 'patt cannady'] },
    { id: 'rob_antonson', name: 'Rob Antonson', fsgId: '555' },
    { id: 'sharonda_cox', name: 'Sharonda Renee', fsgId: '556', aliases: ['renee', 'sharonda cox', 'cox'] },
];

const SAVU_IDS = ['alexis_levine', 'ana_sani', 'carter_krull', 'cristian_chavez', 'eric_macksoud', 'kristin_flickinger', 'linnea_capobianco', 'ori_jean_charles', 'rob_antonson', 'sharonda_cox'];
const TOKA_IDS = ['aaliyah_puglia', 'jelly_loblack', 'brady_booker', 'danny_kilby', 'devin_way', 'jenna_doore', 'lewis_kelly', 'maggie_nestor', 'mike_pinsky', 'an_nguyen'];

function tribeMembers(ids) {
    return ids.map(id => {
        const c = CAST.find(x => x.id === id);
        return { id, name: c.name };
    });
}

// Host-set tribe overrides take precedence over this baseline. Patt starts with no tribe.
const TRIBES = {
    savu: { name: 'Savu', members: tribeMembers(SAVU_IDS) },
    toka: { name: 'Toka', members: tribeMembers(TOKA_IDS) },
    unassigned: { name: 'No tribe', members: tribeMembers(['patt_cannaday']) },
};

const NAME_MAP = {};
for (const c of CAST) {
    NAME_MAP[c.name.toLowerCase()] = c.id;
    NAME_MAP[c.name.split(' ')[0].toLowerCase()] = c.id;
    for (const alias of (c.aliases || [])) NAME_MAP[alias.toLowerCase()] = c.id;
}

function resolveContestant(raw) {
    if (!raw) return null;
    const clean = String(raw).replace(/[*'"]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
    return NAME_MAP[clean] || NAME_MAP[clean.split(' ')[0]] || null;
}

function resolveTribe(name) {
    const clean = name.trim().toLowerCase();
    for (const [key, tribe] of Object.entries(TRIBES)) {
        if (tribe.name.toLowerCase() === clean || key === clean) return key;
    }
    return null;
}

function parseNum(val) {
    if (!val || val === '-' || val.toUpperCase() === 'NA') return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
}

/* ═══════════════════════════════════════════════════════════
   TDT HTML Parser
   ═══════════════════════════════════════════════════════════ */

/**
 * Parse TDT boxscore HTML page into structured episode data.
 * Uses cheerio to extract the table rows from HTML.
 */
export function parseTDTHtml(html, eliminatedBefore = []) {
    const $ = cheerio.load(html);

    // Extract scoring notes text (above the table, useful for idol/medevac info)
    const notesText = $('body').text();

    // Find the boxscore table -- look for a table containing "Contestant" and "VFB" headers
    let tableData = null;

    $('table').each((_, table) => {
        const headerText = $(table).text();
        if (headerText.includes('Contestant') && headerText.includes('VFB')) {
            tableData = table;
            return false;
        }
    });

    if (!tableData) {
        return { error: 'Could not find boxscore table in TDT HTML' };
    }

    // Extract all rows as arrays of cell text
    const allRows = [];
    $(tableData).find('tr').each((_, tr) => {
        const cells = [];
        $(tr).find('td, th').each((_, cell) => {
            cells.push($(cell).text().trim());
        });
        if (cells.length > 0) allRows.push(cells);
    });

    // Find the header row (contains "Contestant" and "VFB")
    let headerIdx = -1;
    let headers = [];
    for (let i = 0; i < allRows.length; i++) {
        if (allRows[i].includes('Contestant') && allRows[i].includes('VFB')) {
            headerIdx = i;
            headers = allRows[i];
            break;
        }
    }

    if (headerIdx === -1) {
        return { error: 'Could not find header row in TDT table' };
    }

    // Build a column→section mapping from the top-level header row (with colspans).
    // This tells us whether a ChW column falls under "Reward challenge" or "Immunity challenge".
    const sectionForCol = {};
    if (headerIdx > 0) {
        const topRow = $(tableData).find('tr').eq(headerIdx - 1);
        let col = 0;
        topRow.find('th, td').each((_, cell) => {
            const text = $(cell).text().trim().toLowerCase();
            const span = parseInt($(cell).attr('colspan')) || 1;
            for (let c = col; c < col + span; c++) sectionForCol[c] = text;
            col += span;
        });
    }

    // Map column positions — use section context to correctly assign ChW to reward vs immunity
    const ci = { contestant: headers.indexOf('Contestant') };
    for (let i = 0; i < headers.length; i++) {
        if (headers[i] === 'ChW') {
            const section = sectionForCol[i] || '';
            if (section.includes('reward')) ci.rcChW = i;
            else if (section.includes('immunity')) ci.icChW = i;
            else if (ci.rcChW == null) ci.rcChW = i;
            else ci.icChW = i;
        }
        if (headers[i] === 'VFB') ci.vfb = i;
        if (headers[i] === 'VAP') ci.vap = i;
        if (headers[i] === 'TotV') ci.totV = i;
        if (headers[i] === 'TCA') ci.tca = i;
    }

    const elimBeforeSet = new Set(eliminatedBefore);
    const rows = [];

    for (let i = headerIdx + 1; i < allRows.length; i++) {
        const cells = allRows[i];
        const rawName = cells[ci.contestant];
        if (!rawName) continue;

        // TDT marks medevacs with an asterisk on the contestant's NAME.
        // Asterisks on stats (TCA*, VAP*) indicate other situations like
        // Shot in the Dark or idol plays — not medevacs.
        const isMedevac = rawName.includes('*');
        const contestantId = resolveContestant(rawName);
        if (!contestantId) continue;

        rows.push({
            id: contestantId,
            name: rawName.replace(/\*/g, '').trim(),
            isMedevac,
            rcChW: parseNum(cells[ci.rcChW]),
            icChW: parseNum(cells[ci.icChW]),
            vfb: parseNum(cells[ci.vfb]),
            vap: parseNum(cells[ci.vap]),
            totV: parseNum(cells[ci.totV]),
            tca: parseNum(cells[ci.tca]),
            eliminated: elimBeforeSet.has(contestantId),
        });
    }

    // Determine who was eliminated this episode (supports double boots)
    const eliminatedIds = [];
    const eliminationMethods = {};

    const medevacs = rows.filter(r => r.isMedevac && !r.eliminated);
    for (const med of medevacs) {
        eliminatedIds.push(med.id);
        eliminationMethods[med.id] = 'medevac';
    }

    // Find vote-out boot(s) by grouping tribal attendees by TotV (each distinct
    // TotV = a separate tribal council), then selecting the highest-VAP person
    // with VFB=0 as the boot in each group. When multiple people are tied for
    // the highest VAP with VFB=0, all are boots (separate tribals with identical
    // total vote counts, e.g. two 4-0 votes). TCA is not required since some
    // eliminated contestants have TCA=0 (no-vote status).
    const vapCandidates = rows.filter(r =>
        r.vap !== null && r.vap > 0 &&
        !r.eliminated &&
        !eliminatedIds.includes(r.id)
    );

    const tribalsByTotV = {};
    for (const c of vapCandidates) {
        const totV = c.totV || 0;
        if (!tribalsByTotV[totV]) tribalsByTotV[totV] = [];
        tribalsByTotV[totV].push(c);
    }

    for (const group of Object.values(tribalsByTotV)) {
        // Sort by VAP descending within each tribal group
        group.sort((a, b) => (b.vap || 0) - (a.vap || 0));
        const maxVap = group[0].vap;
        // The boot(s) are those with the highest VAP AND VFB=0.
        // Ties at max VAP with VFB=0 indicate separate tribals with same TotV.
        for (const c of group) {
            if (c.vap < maxVap) break;
            if (c.vfb === null || c.vfb === 0) {
                eliminatedIds.push(c.id);
                eliminationMethods[c.id] = 'voted_out';
            }
        }
    }

    // Legacy single-ID fields for backward compatibility
    const eliminatedId = eliminatedIds[0] || null;
    const eliminationMethod = eliminatedId ? (eliminationMethods[eliminatedId] || 'voted_out') : 'voted_out';
    const elimIdSet = new Set(eliminatedIds);

    // Challenge winners — contestant-level IDs (works correctly post-swap)
    const immunityWinnerIds = rows
        .filter(r => !r.eliminated && r.icChW !== null && r.icChW > 0)
        .map(r => r.id);
    const rewardWinnerIds = rows
        .filter(r => !r.eliminated && r.rcChW !== null && r.rcChW > 0)
        .map(r => r.id);

    // Legacy tribe-key arrays (only reliable pre-swap; kept for backward compat)
    const immunityWinners = [];
    const rewardWinners = [];

    for (const [tribeKey, tribe] of Object.entries(TRIBES)) {
        const tribeRows = rows.filter(r =>
            tribe.members.some(m => m.id === r.id) && !r.eliminated
        );
        if (tribeRows.length === 0) continue;

        const avgIcChW = tribeRows.reduce((s, r) => s + (r.icChW || 0), 0) / tribeRows.length;
        const avgRcChW = tribeRows.reduce((s, r) => s + (r.rcChW || 0), 0) / tribeRows.length;

        if (avgIcChW > 0) immunityWinners.push(tribeKey);
        if (avgRcChW > 0) rewardWinners.push(tribeKey);
    }

    // Minority voters (VFB = 0 at tribal, not any boot this episode)
    const minorityVoters = rows
        .filter(r => r.tca !== null && r.tca > 0 && r.vfb === 0 && !elimIdSet.has(r.id) && !r.eliminated)
        .map(r => r.id);

    // Survived with votes (VAP > 0, not any boot this episode)
    const receivedVotes = rows
        .filter(r => r.vap !== null && r.vap > 0 && !elimIdSet.has(r.id) && !r.eliminated)
        .map(r => r.id);

    // Extract idol/advantage mentions from the page notes
    const bigMoments = {};
    const idolFoundPattern = /(\w+)\s+find(?:s|ed)?\s+.*?(?:idol|Boomerang)/gi;
    let match;
    while ((match = idolFoundPattern.exec(notesText)) !== null) {
        const id = resolveContestant(match[1]);
        if (id) {
            if (!bigMoments[id]) bigMoments[id] = [];
            if (!bigMoments[id].includes('idol_found')) bigMoments[id].push('idol_found');
        }
    }

    const voteCountMap = {};
    for (const r of rows) {
        if (r.vap !== null && r.vap > 0) {
            voteCountMap[r.id] = r.vap;
        }
    }

    return {
        eliminatedId,
        eliminatedIds,
        eliminationMethod,
        eliminationMethods,
        immunityWinners,
        immunityWinnerIds,
        rewardWinners,
        rewardWinnerIds,
        isPostMerge: detectPostMerge(eliminatedIds, immunityWinnerIds, rows),
        minorityVoters,
        receivedVotes,
        bigMoments,
        voteCountMap,
        parsed: rows,
    };
}

/**
 * Heuristic post-merge detection from TDT data alone.
 * Post-merge indicators: an individual immunity win, 3+ eliminations in one episode,
 * or individual immunity winners spanning 3 different original tribes.
 */
function detectPostMerge(eliminatedIds, immunityWinnerIds, rows = []) {
    // TDT's per-episode challenge wins are fractional for tribal challenges — each
    // participant gets 1/n of a point — while an individual win is a full point. So a
    // full point means immunity was individual, and the merge has happened. This is the
    // only signal that works with two starting tribes, where the 3-tribe check below
    // can never fire.
    if (rows.some(r => r.icChW !== null && r.icChW >= 1)) return true;

    if (eliminatedIds.length >= 3) return true;

    if (immunityWinnerIds.length > 0) {
        const tribes = new Set();
        for (const cid of immunityWinnerIds) {
            for (const [key, tribe] of Object.entries(TRIBES)) {
                if (tribe.members.some(m => m.id === cid)) { tribes.add(key); break; }
            }
        }
        if (tribes.size >= 3) return true;
    }

    return false;
}


/* ═══════════════════════════════════════════════════════════
   InsideSurvivor HTML Parser
   ═══════════════════════════════════════════════════════════ */

/**
 * Find the InsideSurvivor stats article URL for a given episode number
 * by scraping their weeklies category page.
 */
export function findInsiderStatsUrl(weekliesHtml, episodeNum) {
    const $ = cheerio.load(weekliesHtml);
    const target = `episode ${episodeNum} stats`;
    let url = null;

    $('a').each((_, el) => {
        const text = $(el).text().trim().toLowerCase();
        if (text.includes(target)) {
            url = $(el).attr('href');
            return false;
        }
    });

    return url;
}

/**
 * Parse InsideSurvivor article HTML into supplementary episode data.
 */
export function parseInsiderHtml(html) {
    const $ = cheerio.load(html);

    // Extract the article body text
    const articleText = $('article').text() || $('.entry-content').text() || $('body').text();

    const result = {
        idolsFound: [],
        idolsPlayed: [],
        advantagesFound: [],
        advantagesUsed: [],
        confessionals: {},
        medevacs: [],
        voteBreakdown: null,
    };

    // Idol/advantage parsing
    const idolFoundPattern = /(\w+)\s+found\s+(?:the|a|an)\s+.*?(?:idol|boomerang)/gi;
    let match;
    while ((match = idolFoundPattern.exec(articleText)) !== null) {
        const id = resolveContestant(match[1]);
        if (id && !result.idolsFound.includes(id)) result.idolsFound.push(id);
    }

    const playedPattern = /(\w+)\s+played\s+(?:the|a|an|her|his)\s+.*?idol/gi;
    while ((match = playedPattern.exec(articleText)) !== null) {
        const id = resolveContestant(match[1]);
        if (id && !result.idolsPlayed.includes(id)) result.idolsPlayed.push(id);
    }

    const advFoundPattern = /(\w+)\s+(?:found|received|is the first player to.*?receive)\s+(?:the|a|an)\s+.*?(?:advantage|vote blocker|extra vote|steal a vote)/gi;
    while ((match = advFoundPattern.exec(articleText)) !== null) {
        const id = resolveContestant(match[1]);
        if (id && !result.advantagesFound.includes(id)) result.advantagesFound.push(id);
    }

    const advUsedPattern = /(\w+)\s+(?:used|played)\s+(?:the|a|an|her|his)\s+.*?(?:advantage|vote blocker|extra vote|steal a vote)/gi;
    while ((match = advUsedPattern.exec(articleText)) !== null) {
        const id = resolveContestant(match[1]);
        if (id && !result.advantagesUsed.includes(id)) result.advantagesUsed.push(id);
    }

    const givenPattern = /(?:sent|gave)\s+(?:it|the idol|the advantage)\s+to\s+(\w+)/gi;
    while ((match = givenPattern.exec(articleText)) !== null) {
        const id = resolveContestant(match[1]);
        if (id && !result.idolsFound.includes(id)) result.idolsFound.push(id);
    }

    // Confessionals
    const confPattern = /(\w+)\s+had\s+(?:the\s+)?(?:most|lowest|\d+)\s+confessionals?\s+(?:this\s+episode\s+)?with\s+(\d+)/gi;
    while ((match = confPattern.exec(articleText)) !== null) {
        const id = resolveContestant(match[1]);
        if (id) result.confessionals[id] = parseInt(match[2], 10);
    }

    const noConfPattern = /(\w+(?:,\s+\w+)*(?:,?\s*&\s*\w+)?)\s+did\s+not\s+have\s+a\s+confessional/i;
    const noMatch = articleText.match(noConfPattern);
    if (noMatch) {
        const names = noMatch[1].split(/[,&]+/);
        for (const name of names) {
            const id = resolveContestant(name.trim());
            if (id) result.confessionals[id] = 0;
        }
    }

    // Medevac
    const medevacPattern = /(\w+)\s+(?:was|is the first.*?to be)\s+medically evacuated/i;
    const medevacMatch = articleText.match(medevacPattern);
    if (medevacMatch) {
        const id = resolveContestant(medevacMatch[1]);
        if (id) result.medevacs.push(id);
    }

    // Vote breakdown
    const votePattern = /(\w+)\s+was\s+voted\s+out\s+(\d+)-(\d+)(?:-(\d+))?/i;
    const voteMatch = articleText.match(votePattern);
    if (voteMatch) {
        const votes = [parseInt(voteMatch[2], 10), parseInt(voteMatch[3], 10)];
        if (voteMatch[4]) votes.push(parseInt(voteMatch[4], 10));
        result.voteBreakdown = {
            bootId: resolveContestant(voteMatch[1]),
            votes,
            totalVotes: votes.reduce((a, b) => a + b, 0),
        };
    }

    return result;
}

/**
 * Merge InsideSurvivor data into a TDT parse result.
 */
export function mergeResults(tdtResult, insiderResult) {
    const merged = { ...tdtResult };
    if (!merged.bigMoments) merged.bigMoments = {};

    for (const id of insiderResult.idolsFound) {
        if (!merged.bigMoments[id]) merged.bigMoments[id] = [];
        if (!merged.bigMoments[id].includes('idol_found')) merged.bigMoments[id].push('idol_found');
    }
    for (const id of insiderResult.idolsPlayed) {
        if (!merged.bigMoments[id]) merged.bigMoments[id] = [];
        if (!merged.bigMoments[id].includes('idol_played_success')) merged.bigMoments[id].push('idol_played_success');
    }
    for (const id of insiderResult.advantagesFound) {
        if (!merged.bigMoments[id]) merged.bigMoments[id] = [];
        if (!merged.bigMoments[id].includes('advantage_found')) merged.bigMoments[id].push('advantage_found');
    }
    for (const id of insiderResult.advantagesUsed) {
        if (!merged.bigMoments[id]) merged.bigMoments[id] = [];
        if (!merged.bigMoments[id].includes('advantage_used')) merged.bigMoments[id].push('advantage_used');
    }

    merged.confessionals = insiderResult.confessionals || {};
    return merged;
}


/* ═══════════════════════════════════════════════════════════
   FantasySurvivorGame (FSG) Episode Recap Parser
   ═══════════════════════════════════════════════════════════ */

// Fantasy Survivor Game numbers its contestants globally across seasons; Season 51
// occupies 536-556. Derived from CAST so there is one place to correct a bad id.
const FSG_ID_MAP = Object.fromEntries(
    CAST.filter(c => c.fsgId).map(c => [c.fsgId, c.id])
);

// FSG labels every scored event in a <dt>, e.g. "Read Tree Mail (2)". These are the
// exact labels observed across a full season, matched with the trailing point value
// stripped. FSG's own point values are deliberately ignored — their scale is flat
// (1-3 for everything) and rates tribal immunity above individual.
// Note: FSG has no "found a clue" label, so find_clue stays host-entered only.
const FSG_EVENT_LABELS = {
    'win a tribe immunity challenge': 'tribal_immunity',
    'win a tribe reward challenge': 'tribal_reward',
    'win an individual immunity challenge': 'individual_immunity',
    'win an individual reward challenge': 'individual_reward',
    'win the fire making challenge': 'fire_making_win',
    'win a journey challenge': 'journey_challenge_win',
    'win the marooning challenge': 'marooning_win',
    'win the supply challenge': 'supply_challenge_win',
    'read tree mail': 'read_tree_mail',
    'strategize at the water well': 'water_well_talk',
    'make fire at camp': 'make_fire_camp',
    'find food': 'find_food',
    'go on a journey': 'journey',
    'was exiled or sent to exile island': 'exile',
    'became part of the merged tribe': 'merge',
    'gain an immunity idol': 'idol_found',
    'gain an advantage': 'advantage_found',
    'play an idol or advantage': 'advantage_used',
    'play shot in the dark': 'shot_in_dark',
    'winner of this season': 'winner',
};

// Labels that mark someone leaving rather than scoring an event.
const FSG_EXIT_LABELS = {
    'survivor was voted out': 'voted_out',
    'survivor is off the show': 'medevac',
};

// Fallback for mid-season wording changes and season-specific twists. Tried only when
// the exact label is unknown, so order runs most specific first.
const FSG_EVENT_PATTERNS = [
    { pattern: /tribe immunity/i, event: 'tribal_immunity' },
    { pattern: /tribe reward/i, event: 'tribal_reward' },
    { pattern: /(?:individual|solo) immunity/i, event: 'individual_immunity' },
    { pattern: /(?:individual|solo) reward/i, event: 'individual_reward' },
    { pattern: /fire[- ]?making/i, event: 'fire_making_win' },
    { pattern: /journey challenge/i, event: 'journey_challenge_win' },
    { pattern: /marooning/i, event: 'marooning_win' },
    { pattern: /supply challenge/i, event: 'supply_challenge_win' },
    { pattern: /tree mail/i, event: 'read_tree_mail' },
    { pattern: /water well/i, event: 'water_well_talk' },
    { pattern: /make fire at camp/i, event: 'make_fire_camp' },
    { pattern: /find food/i, event: 'find_food' },
    { pattern: /exile/i, event: 'exile' },
    { pattern: /journey/i, event: 'journey' },
    { pattern: /merged? tribe|join the merge/i, event: 'merge' },
    { pattern: /immunity idol/i, event: 'idol_found' },
    { pattern: /gain an? advantage/i, event: 'advantage_found' },
    { pattern: /play an? (?:idol|advantage)/i, event: 'advantage_used' },
    { pattern: /shot in the dark/i, event: 'shot_in_dark' },
    { pattern: /find a? ?clue/i, event: 'find_clue' },
];

function resolveFsgLink(href) {
    if (!href) return null;
    const match = href.match(/\/survivors\/(\d+)-/);
    return match ? FSG_ID_MAP[match[1]] || null : null;
}

/**
 * Parse the FSG episode recap page to extract events for a specific episode.
 * The page lists all episodes; we find and parse only the requested one.
 */
export function parseFSGHtml(html, episodeNum) {
    const $ = cheerio.load(html);

    const result = {
        events: {},
        eliminatedId: null,
        eliminatedIds: [],
        eliminationMethod: null,
        eliminationMethods: {},
        immunityWinnerIds: [],
        rewardWinnerIds: [],
    };

    const addEvent = (cid, evt) => {
        if (!cid) return;
        if (!result.events[cid]) result.events[cid] = [];
        if (!result.events[cid].includes(evt)) result.events[cid].push(evt);
    };

    // FSG wraps each "Episode N" heading in a div alongside an <hr>, so the heading has
    // no following siblings of its own. The episode's content sits in that wrapper's
    // siblings, ending at the wrapper holding the next episode heading.
    const isEpisodeHeading = (el) => /^episode \d+$/i.test($(el).text().trim());

    let heading = null;
    $('h5, h4, h3').each((_, el) => {
        if ($(el).text().trim().toLowerCase() === `episode ${episodeNum}`) {
            heading = el;
            return false;
        }
    });

    if (!heading) return null;

    const sectionElements = [];
    let current = $(heading).parent().next();
    while (current.length > 0) {
        if (current.find('h5, h4, h3').filter((_, el) => isEpisodeHeading(el)).length) break;
        sectionElements.push(current);
        current = current.next();
    }

    const noteExit = (cid, method) => {
        if (!cid || result.eliminatedIds.includes(cid)) return;
        result.eliminatedIds.push(cid);
        result.eliminationMethods[cid] = method;
        if (!result.eliminatedId) {
            result.eliminatedId = cid;
            result.eliminationMethod = method;
        }
    };

    const linkedIds = (el) => {
        const ids = [];
        el.find('a[href^="/survivors/"]').each((_, a) => {
            const cid = resolveFsgLink($(a).attr('href'));
            if (cid && !ids.includes(cid)) ids.push(cid);
        });
        return ids;
    };

    const normalizeLabel = (raw) => (raw || '')
        .toLowerCase()
        .replace(/\s*\(-?\d+\)\s*$/, '')
        .replace(/\s+/g, ' ')
        .trim();

    const noteWinner = (event, cid) => {
        const list = (event === 'tribal_immunity' || event === 'individual_immunity')
            ? result.immunityWinnerIds
            : (event === 'tribal_reward' || event === 'individual_reward')
                ? result.rewardWinnerIds
                : null;
        if (list && !list.includes(cid)) list.push(cid);
    };

    for (const elem of sectionElements) {
        // Each lookup matches the element itself as well as its descendants, because a
        // section element can be a card container or a <dl> in its own right.

        // Headline cards carry the episode's exits and the season winner.
        elem.find('.recapbox').add(elem.filter('.recapbox')).each((_, box) => {
            const card = $(box);
            const label = normalizeLabel(card.find('h6').first().text());
            const ids = linkedIds(card);
            if (/voted out/.test(label)) ids.forEach(cid => noteExit(cid, 'voted_out'));
            else if (/quit|evac/.test(label)) ids.forEach(cid => noteExit(cid, 'medevac'));
            else if (/sole survivor/.test(label)) ids.forEach(cid => addEvent(cid, 'winner'));
        });

        // Per-player scoring lives in <dl> blocks: <dt>Label (points)</dt><dd>players</dd>.
        // Each pair must be read individually — the labels differ within one list.
        elem.find('dl').add(elem.filter('dl')).each((_, dl) => {
            let label = null;
            $(dl).children().each((_, child) => {
                const tag = $(child).prop('tagName')?.toLowerCase();
                if (tag === 'dt') {
                    label = normalizeLabel($(child).attr('title') || $(child).text());
                    return;
                }
                if (tag !== 'dd' || !label) return;

                const ids = linkedIds($(child));

                if (FSG_EXIT_LABELS[label]) {
                    ids.forEach(cid => noteExit(cid, FSG_EXIT_LABELS[label]));
                    return;
                }

                const event = FSG_EVENT_LABELS[label]
                    || FSG_EVENT_PATTERNS.find(({ pattern }) => pattern.test(label))?.event;
                if (!event) return;

                for (const cid of ids) {
                    addEvent(cid, event);
                    noteWinner(event, cid);
                }
            });
        });
    }

    return result;
}

// Events that only FSG tracks (camp life / journey) -- not detected by TDT or InsideSurvivor
const FSG_EXCLUSIVE_EVENTS = new Set([
    'supply_challenge_win', 'marooning_win', 'read_tree_mail',
    'water_well_talk', 'make_fire_camp', 'find_food',
    'journey', 'journey_challenge_win', 'find_clue', 'shot_in_dark',
]);

/**
 * Merge FSG data into an existing combined result (TDT + InsideSurvivor).
 * Adds FSG-exclusive events (camp life, journey, etc.) and supplements
 * immunity/reward winner IDs (FSG includes all tribe members, even sit-outs).
 */
export function mergeFSGResults(combinedResult, fsgResult) {
    if (!fsgResult) return combinedResult;
    const merged = { ...combinedResult };
    if (!merged.bigMoments) merged.bigMoments = {};

    for (const [cid, events] of Object.entries(fsgResult.events || {})) {
        for (const evt of events) {
            if (FSG_EXCLUSIVE_EVENTS.has(evt)) {
                if (!merged.bigMoments[cid]) merged.bigMoments[cid] = [];
                if (!merged.bigMoments[cid].includes(evt)) {
                    merged.bigMoments[cid].push(evt);
                }
            } else if (['idol_found', 'advantage_found', 'advantage_used', 'exile', 'merge'].includes(evt)) {
                if (!merged.bigMoments[cid]) merged.bigMoments[cid] = [];
                if (!merged.bigMoments[cid].includes(evt)) {
                    merged.bigMoments[cid].push(evt);
                }
            }
        }
    }

    // FSG lists all tribe members for immunity/reward wins (including sit-outs),
    // so prefer FSG's lists when available — they're more complete than TDT ChW > 0.
    if (fsgResult.immunityWinnerIds?.length > 0) {
        merged.immunityWinnerIds = fsgResult.immunityWinnerIds;
    }
    if (fsgResult.rewardWinnerIds?.length > 0) {
        merged.rewardWinnerIds = fsgResult.rewardWinnerIds;
    }

    // Supplement elimination data: if FSG detected boots that TDT missed
    // (e.g., due to TotV collision), add them to the combined result.
    if (fsgResult.eliminatedIds?.length > 0) {
        const existingElims = new Set(merged.eliminatedIds || (merged.eliminatedId ? [merged.eliminatedId] : []));
        for (const cid of fsgResult.eliminatedIds) {
            if (!existingElims.has(cid)) {
                if (!merged.eliminatedIds) merged.eliminatedIds = [...existingElims];
                merged.eliminatedIds.push(cid);
                if (!merged.eliminationMethods) merged.eliminationMethods = {};
                merged.eliminationMethods[cid] = fsgResult.eliminationMethods?.[cid] || 'voted_out';
            }
        }
    }

    // Detect post-merge: if any contestant has a 'merge' event from FSG,
    // this episode is the merge or post-merge — switch to individual challenges
    const hasMergeEvent = Object.values(merged.bigMoments || {}).some(
        events => Array.isArray(events) && events.includes('merge')
    );
    if (hasMergeEvent) {
        merged.isPostMerge = true;
    }

    return merged;
}


/* ═══════════════════════════════════════════════════════════
   Auto-resolve Tree Mail from imported data
   ═══════════════════════════════════════════════════════════ */

/**
 * Resolve structured bets against imported episode data.
 * importData: the merged TDT+Insider+FSG result
 * bets: [{ id, resolveType, resolveParams }]
 * Returns: { [betId]: boolean }
 */
export function resolvePropBets(importData, bets) {
    const results = {};
    const allEvents = Object.values(importData.bigMoments || {}).flat();
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
                results[id] = allEvents.includes(resolveParams.eventKey);
                break;
            case 'event_any_of':
                results[id] = (resolveParams.eventKeys || []).some(k => allEvents.includes(k));
                break;
            case 'event_none_of':
                results[id] = !(resolveParams.eventKeys || []).some(k => allEvents.includes(k));
                break;
            case 'event_count_gte': {
                const count = allEvents.filter(e => e === resolveParams.eventKey).length;
                results[id] = count >= resolveParams.threshold;
                break;
            }
            case 'event_count_any_of_gte': {
                const count = allEvents.filter(e => (resolveParams.eventKeys || []).includes(e)).length;
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
