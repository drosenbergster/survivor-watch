import * as cheerio from 'cheerio';

// Minimal cast data duplicated from src/data.js for server-side use.
// Only the fields needed for parsing are included.
const TRIBES = {
    cila: {
        name: 'Cila',
        members: [
            { id: 'rick_devens', name: 'Rick Devens' },
            { id: 'cirie_fields', name: 'Cirie Fields' },
            { id: 'emily_flippen', name: 'Emily Flippen' },
            { id: 'christian_hubicki', name: 'Christian Hubicki' },
            { id: 'joe_hunter', name: 'Joe Hunter' },
            { id: 'jenna_lewis', name: 'Jenna Lewis' },
            { id: 'savannah_louie', name: 'Savannah Louie' },
            { id: 'ozzy_lusth', name: 'Ozzy Lusth' },
        ],
    },
    vatu: {
        name: 'Vatu',
        members: [
            { id: 'aubry_bracco', name: 'Aubry Bracco' },
            { id: 'q_burdette', name: 'Q Burdette' },
            { id: 'colby_donaldson', name: 'Colby Donaldson' },
            { id: 'kyle_fraser', name: 'Kyle Fraser' },
            { id: 'angelina_keeley', name: 'Angelina Keeley' },
            { id: 'stephenie_lagrossa', name: 'Stephenie LaGrossa' },
            { id: 'genevieve_mushaluk', name: 'Genevieve Mushaluk' },
            { id: 'rizo_velovic', name: 'Rizo Velovic' },
        ],
    },
    kalo: {
        name: 'Kalo',
        members: [
            { id: 'charlie_davis', name: 'Charlie Davis' },
            { id: 'tiffany_ervin', name: 'Tiffany Ervin' },
            { id: 'chrissy_hofbeck', name: 'Chrissy Hofbeck' },
            { id: 'kamilla_karthigesu', name: 'Kamilla Karthigesu' },
            { id: 'dee_valladares', name: 'Dee Valladares' },
            { id: 'coach_wade', name: 'Coach Wade' },
            { id: 'mike_white', name: 'Mike White' },
            { id: 'jonathan_young', name: 'Jonathan Young' },
        ],
    },
};

const ALL_CASTAWAYS = Object.values(TRIBES).flatMap(t => t.members);

// Build first-name -> id lookup
const NAME_MAP = {};
for (const c of ALL_CASTAWAYS) {
    NAME_MAP[c.name.split(' ')[0].toLowerCase()] = c.id;
    NAME_MAP[c.name.toLowerCase()] = c.id;
}
NAME_MAP['q'] = 'q_burdette';

function resolveContestant(raw) {
    const clean = raw.replace(/[*'"]/g, '').trim().toLowerCase();
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

        // TDT marks medevacs with asterisks on stats AND a null VFB (they never voted).
        // Other special situations (idols, revotes) also get asterisked stats but retain a real VFB.
        const hasAsteriskName = rawName.includes('*');
        const hasAsteriskStats = [cells[ci.vap], cells[ci.tca], cells[ci.totV]]
            .some(v => v && v.includes('*'));
        const rawVfb = cells[ci.vfb]?.trim();
        const vfbIsNull = !rawVfb || rawVfb === '-' || rawVfb.toUpperCase() === 'NA';
        const isMedevac = hasAsteriskName || (hasAsteriskStats && vfbIsNull);
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

    // Find vote-out boot(s): the eliminated contestant at each tribal has
    // TCA > 0 (attended tribal), VAP > 0 (received votes), and VFB = 0
    // (didn't vote with the majority / couldn't vote). This reliably detects
    // multiple boots even when separate tribals have identical total vote counts.
    const bootCandidates = rows.filter(r =>
        r.tca !== null && r.tca > 0 &&
        r.vap !== null && r.vap > 0 &&
        (r.vfb === null || r.vfb === 0) &&
        !r.eliminated &&
        !eliminatedIds.includes(r.id)
    ).sort((a, b) => (b.vap || 0) - (a.vap || 0));

    for (const boot of bootCandidates) {
        eliminatedIds.push(boot.id);
        eliminationMethods[boot.id] = 'voted_out';
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
        isPostMerge: false,
        minorityVoters,
        receivedVotes,
        bigMoments,
        voteCountMap,
        parsed: rows,
    };
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

const FSG_ID_MAP = {
    '512': 'jenna_lewis',
    '513': 'colby_donaldson',
    '514': 'stephenie_lagrossa',
    '515': 'cirie_fields',
    '516': 'ozzy_lusth',
    '517': 'coach_wade',
    '518': 'aubry_bracco',
    '519': 'chrissy_hofbeck',
    '520': 'christian_hubicki',
    '521': 'angelina_keeley',
    '522': 'mike_white',
    '523': 'rick_devens',
    '524': 'jonathan_young',
    '525': 'emily_flippen',
    '526': 'dee_valladares',
    '527': 'q_burdette',
    '528': 'charlie_davis',
    '529': 'tiffany_ervin',
    '530': 'genevieve_mushaluk',
    '531': 'kyle_fraser',
    '532': 'joe_hunter',
    '533': 'kamilla_karthigesu',
    '534': 'savannah_louie',
    '535': 'rizo_velovic',
};

const FSG_EVENT_PATTERNS = [
    { pattern: /win the marooning challenge/i, event: 'marooning_win' },
    { pattern: /win the supply challenge/i, event: 'supply_challenge_win' },
    { pattern: /win a tribe reward challenge/i, event: 'tribal_reward' },
    { pattern: /win a tribe immunity challenge/i, event: 'tribal_immunity' },
    { pattern: /win a solo reward/i, event: 'individual_reward' },
    { pattern: /win (?:a )?solo immunity/i, event: 'individual_immunity' },
    { pattern: /win an? individual reward/i, event: 'individual_reward' },
    { pattern: /win an? individual immunity/i, event: 'individual_immunity' },
    { pattern: /win a journey challenge/i, event: 'journey_challenge_win' },
    { pattern: /win a fire[- ]making challenge/i, event: 'fire_making_win' },
    { pattern: /read tree mail/i, event: 'read_tree_mail' },
    { pattern: /strategize at the water well/i, event: 'water_well_talk' },
    { pattern: /make fire at camp/i, event: 'make_fire_camp' },
    { pattern: /find food/i, event: 'find_food' },
    { pattern: /go to exile island/i, event: 'exile' },
    { pattern: /go on a journey/i, event: 'journey' },
    { pattern: /join the merge/i, event: 'merge' },
    { pattern: /find a? ?clue/i, event: 'find_clue' },
    { pattern: /gain an? immunity idol/i, event: 'idol_found' },
    { pattern: /gain an? advantage/i, event: 'advantage_found' },
    { pattern: /play an? advantage/i, event: 'advantage_used' },
    { pattern: /play (?:the )?shot in the dark/i, event: 'shot_in_dark' },
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

    // Find the episode section. FSG uses h5 tags for "Episode N".
    // We need to find the right section and collect all sibling content until the next <hr>.
    let episodeSection = null;

    $('h5, h4, h3').each((_, el) => {
        const text = $(el).text().trim();
        if (text.toLowerCase() === `episode ${episodeNum}`) {
            episodeSection = el;
            return false;
        }
    });

    if (!episodeSection) return null;

    // Collect all siblings after the episode header until we hit the next <hr> or another episode header
    const sectionElements = [];
    let current = $(episodeSection).next();
    while (current.length > 0) {
        const tagName = current.prop('tagName')?.toLowerCase();
        if (tagName === 'hr') break;
        // Another episode header means we've left our section
        if (['h3', 'h4', 'h5'].includes(tagName) && /episode \d+/i.test(current.text())) break;
        sectionElements.push(current);
        current = current.next();
    }

    // Parse each element in the episode section
    for (const elem of sectionElements) {
        const text = elem.text().trim();
        if (!text) continue;

        // Check for "Voted out" or "Quit/Evac"
        const votedOutMatch = text.match(/voted out/i);
        const quitEvacMatch = text.match(/quit\/evac/i);

        if (votedOutMatch || quitEvacMatch) {
            const method = quitEvacMatch ? 'medevac' : 'voted_out';
            const links = elem.find('a');
            links.each((_, a) => {
                const cid = resolveFsgLink($(a).attr('href'));
                if (cid && !result.eliminatedIds.includes(cid)) {
                    result.eliminatedIds.push(cid);
                    result.eliminationMethods[cid] = method;
                    if (!result.eliminatedId) {
                        result.eliminatedId = cid;
                        result.eliminationMethod = method;
                    }
                }
            });
            continue;
        }

        // Match against FSG event patterns
        for (const { pattern, event } of FSG_EVENT_PATTERNS) {
            if (pattern.test(text)) {
                const links = elem.find('a');
                links.each((_, a) => {
                    const cid = resolveFsgLink($(a).attr('href'));
                    if (cid) {
                        addEvent(cid, event);
                        if (event === 'tribal_immunity' && !result.immunityWinnerIds.includes(cid)) {
                            result.immunityWinnerIds.push(cid);
                        }
                        if (event === 'tribal_reward' && !result.rewardWinnerIds.includes(cid)) {
                            result.rewardWinnerIds.push(cid);
                        }
                    }
                });
                break;
            }
        }
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
   Auto-resolve Tree Mail / Tribal Whisper bets from imported data
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
