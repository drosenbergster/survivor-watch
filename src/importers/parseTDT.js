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

function resolveContestant(rawName) {
    const clean = rawName.replace(/\*/g, '').trim().toLowerCase();
    return NAME_MAP[clean] || null;
}

function parseNum(val) {
    if (!val || val === '-' || val.toUpperCase() === 'NA') return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
}

/**
 * Parse TrueDorkTimes boxscore table text (copied from browser).
 *
 * Expected format: tab-separated values with header rows containing
 * "Contestant", "ChW", "VFB", "VAP", "TCA" etc.
 *
 * @param {string} text - pasted table text
 * @param {string[]} eliminatedBefore - IDs of contestants eliminated before this episode
 * @returns {Object} parsed episode data ready for deriveGameEvents
 */
export function parseTDT(text, eliminatedBefore = []) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    let headerIdx = -1;
    let headers = [];

    for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split('\t');
        if (cols.some(c => c === 'Contestant') && cols.some(c => c === 'VFB')) {
            headerIdx = i;
            headers = cols;
            break;
        }
    }

    if (headerIdx === -1) {
        return { error: 'Could not find header row. Make sure the pasted text includes the column headers (Contestant, ChW, VFB, VAP, TCA).' };
    }

    // Column indices -- there are duplicate ChW/ChA/SO columns (reward then immunity)
    const colIndices = {
        contestant: headers.indexOf('Contestant'),
    };

    let chWCount = 0;
    for (let i = 0; i < headers.length; i++) {
        if (headers[i] === 'ChW') {
            if (chWCount === 0) colIndices.rcChW = i;
            else colIndices.icChW = i;
            chWCount++;
        }
        if (headers[i] === 'VFB') colIndices.vfb = i;
        if (headers[i] === 'VAP') colIndices.vap = i;
        if (headers[i] === 'TotV') colIndices.totV = i;
        if (headers[i] === 'TCA') colIndices.tca = i;
        if (headers[i] === 'SO') {
            if (!colIndices.rcSO) colIndices.rcSO = i;
            else colIndices.icSO = i;
        }
    }

    const rows = [];
    const elimBeforeSet = new Set(eliminatedBefore);

    for (let i = headerIdx + 1; i < lines.length; i++) {
        const cols = lines[i].split('\t');
        if (cols.length < 3) continue;

        const rawName = cols[colIndices.contestant];
        if (!rawName) continue;

        // Stop at glossary/footnotes
        if (rawName.toLowerCase().startsWith('glossary') || rawName.toLowerCase().startsWith('challenge')) break;

        const isMedevac = rawName.includes('*');
        const contestantId = resolveContestant(rawName);
        if (!contestantId) continue;

        rows.push({
            id: contestantId,
            name: rawName.replace(/\*/g, '').trim(),
            isMedevac,
            rcChW: parseNum(cols[colIndices.rcChW]),
            icChW: parseNum(cols[colIndices.icChW]),
            vfb: parseNum(cols[colIndices.vfb]),
            vap: parseNum(cols[colIndices.vap]),
            totV: parseNum(cols[colIndices.totV]),
            tca: parseNum(cols[colIndices.tca]),
            eliminated: elimBeforeSet.has(contestantId),
        });
    }

    // Determine eliminated contestant this episode:
    // The person with TCA > 0 and VFB = 0 and highest VAP, or medevac'd
    let eliminatedId = null;
    let eliminationMethod = 'voted_out';

    const medevacs = rows.filter(r => r.isMedevac && !r.eliminated);
    if (medevacs.length > 0) {
        eliminatedId = medevacs[0].id;
        eliminationMethod = 'medevac';
    }

    if (!eliminatedId) {
        // Person at tribal who got the most votes and was voted out
        const tribalRows = rows.filter(r => r.tca !== null && r.tca > 0 && !r.eliminated);
        const bootCandidate = tribalRows
            .filter(r => r.vap !== null && r.vap > 0)
            .sort((a, b) => (b.vap || 0) - (a.vap || 0))[0];

        if (bootCandidate && bootCandidate.vfb === 0) {
            eliminatedId = bootCandidate.id;
        } else if (bootCandidate) {
            eliminatedId = bootCandidate.id;
        }
    }

    // Determine immunity winners by tribe grouping
    const immunityWinners = [];
    const rewardWinners = [];

    const tribeChallenge = {};
    for (const [tribeKey, tribe] of Object.entries(TRIBES)) {
        const tribeRows = rows.filter(r =>
            tribe.members.some(m => m.id === r.id) && !r.eliminated
        );
        if (tribeRows.length === 0) continue;

        const avgIcChW = tribeRows.reduce((s, r) => s + (r.icChW || 0), 0) / tribeRows.length;
        const avgRcChW = tribeRows.reduce((s, r) => s + (r.rcChW || 0), 0) / tribeRows.length;

        tribeChallenge[tribeKey] = { avgIcChW, avgRcChW };

        if (avgIcChW > 0) immunityWinners.push(tribeKey);
        if (avgRcChW > 0) rewardWinners.push(tribeKey);
    }

    // Determine minority voters (VFB = 0 at tribal, not the boot)
    const minorityVoters = rows
        .filter(r => r.tca !== null && r.tca > 0 && r.vfb === 0 && r.id !== eliminatedId && !r.eliminated)
        .map(r => r.id);

    // Determine who received votes but survived (VAP > 0, not boot)
    const receivedVotes = rows
        .filter(r => r.vap !== null && r.vap > 0 && r.id !== eliminatedId && !r.eliminated)
        .map(r => r.id);

    // Big moments from medevac markers
    const bigMoments = {};
    for (const r of rows) {
        if (r.isMedevac && r.id !== eliminatedId) {
            bigMoments[r.id] = ['medevac'];
        }
    }

    return {
        eliminatedId,
        eliminationMethod,
        immunityWinners,
        rewardWinners,
        isPostMerge: false,
        minorityVoters,
        receivedVotes,
        bigMoments,
        parsed: rows,
        confidence: {
            elimination: eliminatedId ? 'high' : 'none',
            challenges: immunityWinners.length > 0 ? 'high' : 'low',
            tribal: rows.some(r => r.tca > 0) ? 'high' : 'none',
        },
    };
}
