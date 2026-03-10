import { ALL_CASTAWAYS, TRIBES } from '../data';

const NAME_MAP = buildNameMap();

function buildNameMap() {
    const map = {};
    for (const c of ALL_CASTAWAYS) {
        const first = c.name.split(' ')[0].toLowerCase();
        map[first] = c.id;
        const full = c.name.toLowerCase();
        map[full] = c.id;
    }
    map['q'] = 'q_burdette';
    return map;
}

function resolveContestant(name) {
    const clean = name.replace(/[*'"]/g, '').trim().toLowerCase();
    return NAME_MAP[clean] || NAME_MAP[clean.split(' ')[0]] || null;
}

function resolveTribe(name) {
    const clean = name.trim().toLowerCase();
    for (const [key, tribe] of Object.entries(TRIBES)) {
        if (tribe.name.toLowerCase() === clean || key === clean) return key;
    }
    return null;
}

/**
 * Parse InsideSurvivor stats article text.
 * Extracts idol/advantage info, confessional counts, and vote details
 * that supplement the TDT boxscore data.
 *
 * @param {string} text - pasted article text
 * @returns {Object} supplementary episode data
 */
export function parseInsider(text) {
    const result = {
        idolsFound: [],
        idolsPlayed: [],
        advantagesFound: [],
        advantagesUsed: [],
        confessionals: {},
        medevacs: [],
        voteBreakdown: null,
        challengeWinners: { reward: [], immunity: [] },
        warnings: [],
    };

    const sections = splitSections(text);

    parseIdolSection(sections['hidden immunity idol/advantage'] || sections['hidden immunity idol'] || '', result);
    parseConfessionals(sections['confessionals'] || '', result);
    parseMedevac(sections['medical evacuation'] || '', result);
    parseTribalCouncil(sections['tribal council'] || '', result);
    parseChallenges(sections, result);

    return result;
}

function splitSections(text) {
    const sections = {};
    const lines = text.split('\n');
    let currentKey = '';
    let currentLines = [];

    for (const line of lines) {
        const trimmed = line.trim();
        const sectionMatch = trimmed.match(/^(?:#+\s*)?(?:\*{2})?(Hidden Immunity Idol\/Advantage|Reward Challenge|Immunity Challenge|Confessionals|Tribal Council|Medical Evacuation|Journey|Cast\/Season|Episode Title|Survivor Birthdays)(?:\*{2})?/i);

        if (sectionMatch) {
            if (currentKey) sections[currentKey] = currentLines.join('\n');
            currentKey = sectionMatch[1].toLowerCase().replace(/\s*–.*$/, '');
            currentLines = [];
        } else {
            currentLines.push(trimmed);
        }
    }
    if (currentKey) sections[currentKey] = currentLines.join('\n');
    return sections;
}

function parseIdolSection(text, result) {
    if (!text) return;
    const lines = text.split('\n');

    for (const line of lines) {
        const foundMatch = line.match(/(\w+)\s+found\s+(?:the|a|an)\s+.*?(?:idol|boomerang)/i);
        if (foundMatch) {
            const id = resolveContestant(foundMatch[1]);
            if (id && !result.idolsFound.includes(id)) result.idolsFound.push(id);
        }

        const playedMatch = line.match(/(\w+)\s+played\s+(?:the|a|an|her|his)\s+.*?idol/i);
        if (playedMatch) {
            const id = resolveContestant(playedMatch[1]);
            if (id && !result.idolsPlayed.includes(id)) result.idolsPlayed.push(id);
        }

        const advantageMatch = line.match(/(\w+)\s+(?:found|received|is the first player to.*?receive)\s+(?:the|a|an)\s+.*?(?:advantage|vote blocker|extra vote|steal a vote)/i);
        if (advantageMatch) {
            const id = resolveContestant(advantageMatch[1]);
            if (id && !result.advantagesFound.includes(id)) result.advantagesFound.push(id);
        }

        const usedMatch = line.match(/(\w+)\s+(?:used|played)\s+(?:the|a|an|her|his)\s+.*?(?:advantage|vote blocker|extra vote|steal a vote)/i);
        if (usedMatch) {
            const id = resolveContestant(usedMatch[1]);
            if (id && !result.advantagesUsed.includes(id)) result.advantagesUsed.push(id);
        }

        const givenMatch = line.match(/(?:sent|gave)\s+(?:it|the idol|the advantage)\s+to\s+(\w+)/i);
        if (givenMatch) {
            const id = resolveContestant(givenMatch[1]);
            if (id && !result.advantagesFound.includes(id) && !result.idolsFound.includes(id)) {
                result.idolsFound.push(id);
            }
        }
    }
}

function parseConfessionals(text, result) {
    if (!text) return;

    const countPattern = /(\w+)\s+had\s+(?:the\s+)?(?:most|lowest|(?:\d+))\s+confessionals?\s+(?:this\s+episode\s+)?with\s+(\d+)/gi;
    let match;
    while ((match = countPattern.exec(text)) !== null) {
        const id = resolveContestant(match[1]);
        if (id) result.confessionals[id] = parseInt(match[2], 10);
    }

    const noConfPattern = /(\w+(?:,\s+\w+)*(?:,?\s*&\s*\w+)?)\s+did\s+not\s+have\s+a\s+confessional/i;
    const noMatch = text.match(noConfPattern);
    if (noMatch) {
        const names = noMatch[1].split(/[,&]+/);
        for (const name of names) {
            const id = resolveContestant(name.trim());
            if (id) result.confessionals[id] = 0;
        }
    }
}

function parseMedevac(text, result) {
    if (!text) return;
    const medevacPattern = /(\w+)\s+(?:was|is the first.*?to be)\s+medically evacuated/i;
    const match = text.match(medevacPattern);
    if (match) {
        const id = resolveContestant(match[1]);
        if (id) result.medevacs.push(id);
    }
}

function parseTribalCouncil(text, result) {
    if (!text) return;
    const votePattern = /(\w+)\s+was\s+voted\s+out\s+(\d+)-(\d+)(?:-(\d+))?/i;
    const match = text.match(votePattern);
    if (match) {
        const bootName = match[1];
        const votes = [parseInt(match[2], 10), parseInt(match[3], 10)];
        if (match[4]) votes.push(parseInt(match[4], 10));

        result.voteBreakdown = {
            bootName,
            bootId: resolveContestant(bootName),
            votes,
            totalVotes: votes.reduce((a, b) => a + b, 0),
            isUnanimous: votes.length === 2 && votes[1] <= 1,
        };
    }
}

function parseChallenges(sections, result) {
    const rewardText = Object.entries(sections).find(([k]) => k.startsWith('reward challenge'))?.[1] || '';
    const immunityText = Object.entries(sections).find(([k]) => k.startsWith('immunity challenge'))?.[1] || '';

    const tribeNames = Object.values(TRIBES).map(t => t.name);
    const tribeWinPattern = new RegExp(`(${tribeNames.join('|')}).*?(?:won|win|first.*?challenge)`, 'gi');

    for (const match of rewardText.matchAll(tribeWinPattern)) {
        const tk = resolveTribe(match[1]);
        if (tk && !result.challengeWinners.reward.includes(tk)) {
            result.challengeWinners.reward.push(tk);
        }
    }

    for (const match of immunityText.matchAll(tribeWinPattern)) {
        const tk = resolveTribe(match[1]);
        if (tk && !result.challengeWinners.immunity.includes(tk)) {
            result.challengeWinners.immunity.push(tk);
        }
    }
}

/**
 * Merge InsideSurvivor data into a TDT parse result to fill gaps.
 * TDT is the primary source; Insider supplements with idol/advantage/confessional data.
 */
export function mergeInsiderIntoTDT(tdtResult, insiderResult) {
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

    merged.confessionals = insiderResult.confessionals;

    if (!merged.eliminatedId && insiderResult.voteBreakdown?.bootId) {
        merged.eliminatedId = insiderResult.voteBreakdown.bootId;
        merged.eliminationMethod = 'voted_out';
    }

    if (insiderResult.medevacs.length > 0 && !merged.eliminatedId) {
        merged.eliminatedId = insiderResult.medevacs[0];
        merged.eliminationMethod = 'medevac';
    }

    return merged;
}
