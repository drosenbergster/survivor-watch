import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { onAuthStateChanged, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signOut } from 'firebase/auth';
import { ref, onValue, set, get, remove } from 'firebase/database';
import { auth, db } from './firebase';
import { generatePropBets, ALL_CASTAWAYS, resolveBets, mergePropBetResults, SEASON_ID, WATCH_PARTY_ID, WATCH_PARTY_NAME, PICKS_START_EPISODE, getMaxPicks } from './data';
import { deriveGameEvents } from './importers/deriveGameEvents';

const AppContext = createContext(null);

export function useApp() {
    return useContext(AppContext);
}

/**
 * Get the effective tribe assignments for a given episode, considering swaps.
 * Returns the assignments object from the most recent swap on or before episodeNum,
 * or null if no swap applies.
 */
export function getEffectiveTribeAssignments(tribeSwaps, episodeNum) {
    if (!tribeSwaps) return null;

    // If merged and this episode is at or after the merge, return all contestants
    // under the merged tribe name
    if (tribeSwaps.merge && tribeSwaps.merge.episodeNum <= episodeNum) {
        const tribeName = tribeSwaps.merge.tribeName || 'Merged Tribe';
        const allIds = ALL_CASTAWAYS.map(c => c.id);
        return { [tribeName]: allIds };
    }

    const swapEps = Object.keys(tribeSwaps)
        .filter(k => k !== 'merge')
        .map(Number)
        .filter(n => !isNaN(n) && n <= episodeNum)
        .sort((a, b) => b - a);
    if (swapEps.length === 0) return null;
    return tribeSwaps[swapEps[0]]?.assignments || null;
}

const DEMO_PARTY = {
    name: WATCH_PARTY_NAME,
    createdBy: 'demo',
    createdAt: Date.now(),
    status: 'active',
};

const DEMO_MEMBERS = {
    demo: { displayName: 'You', email: 'demo@survivor.local', joinedAt: Date.now(), role: 'admin' },
    bot1: { displayName: 'Tanya', email: 'tanya@survivor.local', joinedAt: Date.now(), role: 'player' },
    bot2: { displayName: 'Marcus', email: 'marcus@survivor.local', joinedAt: Date.now(), role: 'player' },
    bot3: { displayName: 'Jess', email: 'jess@survivor.local', joinedAt: Date.now(), role: 'player' },
};

const actionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true,
};

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [league, setLeague] = useState(null);
    const [leagueMembers, setLeagueMembers] = useState({});
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [playerEpisode, setPlayerEpisode] = useState({});
    const [episodes, setEpisodes] = useState({});
    const [eliminated, setEliminated] = useState([]);
    const [watchStatus, setWatchStatus] = useState({});
    const [bingo, setBingo] = useState({});
    const [tribeSwaps, setTribeSwaps] = useState({});
    const [mergePassports, setMergePassports] = useState({});
    const [finaleData, setFinaleData] = useState(null);
    const [partyLoading, setPartyLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState('offline');
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [displayName, setDisplayName] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // Everyone shares one watch party, so there is nothing to look up or choose.
    const leagueId = WATCH_PARTY_ID;

    // Auth listener — demo user when Firebase not configured
    useEffect(() => {
        if (!auth) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fallback for demo mode
            setUser({ uid: 'demo', email: 'demo@survivor.local' });
            setAuthLoading(false);
            return;
        }
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthLoading(false);
        });
        return unsub;
    }, []);

    // Handle magic link sign-in on page load
    useEffect(() => {
        if (!auth || !isSignInWithEmailLink(auth, window.location.href)) return;
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt('Please enter your email to confirm sign-in:');
        }
        if (email) {
            signInWithEmailLink(auth, email, window.location.href)
                .then(() => {
                    window.localStorage.removeItem('emailForSignIn');
                    window.history.replaceState(null, '', window.location.origin);
                })
                .catch((err) => console.error('Magic link sign-in error:', err));
        }
    }, []);

    // Sync the player's own profile. `displayName` doubles as the marker that they
    // have finished joining the watch party — nothing else is readable until then.
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional loading state before async subscription
        if (!user) { setDisplayName(null); setProfileLoading(false); return; }
        if (!db) {
            setDisplayName('You');
            setOnboardingComplete(true);
            setProfileLoading(false);
            return;
        }
        const profileRef = ref(db, `users/${user.uid}`);
        const unsub = onValue(profileRef, (snap) => {
            const profile = snap.val() || {};
            setDisplayName(profile.displayName || null);
            setOnboardingComplete(!!profile.onboardingComplete);
            setProfileLoading(false);
        }, () => setProfileLoading(false));
        return () => unsub();
    }, [user]);

    // Sync watch party data + members + episodes
    useEffect(() => {
        if (!db) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional seeding for demo mode
            setLeague({ ...DEMO_PARTY, currentEpisode: 1 });
            setLeagueMembers(DEMO_MEMBERS);
            setCurrentEpisode(2);
            setPlayerEpisode({ demo: 1 });
            const ep1Props = generatePropBets(1, 5);
            setEpisodes({
                1: {
                    status: 'scored',
                    scored: true,
                    createdAt: Date.now() - 604800000,
                    propBets: ep1Props,
                    picks: {},
                    predictions: {
                        demo: { elimination: 'aaliyah_puglia', propBets: { [ep1Props[0].id]: true, [ep1Props[2].id]: true } },
                        bot1: { elimination: 'brady_booker', propBets: { [ep1Props[1].id]: true } },
                        bot2: { elimination: 'aaliyah_puglia', propBets: { [ep1Props[0].id]: true, [ep1Props[3].id]: true } },
                        bot3: { elimination: 'mike_pinsky', propBets: { [ep1Props[2].id]: true, [ep1Props[4].id]: true } },
                    },
                    gameEvents: {
                        alexis_levine: ['survived', 'tribal_immunity'],
                        ana_sani: ['survived', 'tribal_immunity', 'idol_found'],
                        brady_booker: ['survived', 'tribal_reward'],
                        carter_krull: ['survived', 'voted_correctly'],
                        danny_kilby: ['survived', 'voted_correctly', 'attended_tribal_zero'],
                        devin_way: ['survived'],
                        jenna_doore: ['survived', 'survived_with_votes'],
                        aaliyah_puglia: [],
                    },
                    propBetResults: { [ep1Props[0].id]: true, [ep1Props[2].id]: false, [ep1Props[4].id]: true },
                    eliminatedThisEp: ['aaliyah_puglia'],
                    eliminationMethod: 'voted_out',
                },
                2: {
                    status: 'open',
                    createdAt: Date.now(),
                    propBets: generatePropBets(2, 5),
                    picks: {},
                    predictions: {},
                },
            });
            setEliminated(['aaliyah_puglia']);
            setWatchStatus({
                1: {
                    demo: { watching: false, watchedAt: Date.now() - 600000 },
                    bot1: { watchedAt: Date.now() - 500000 },
                    // bot2 missed the scored episode: faded flame
                },
                // bot3 is catching up on the unscored episode: faded flame with a live pulse
                2: { bot3: { watching: true, picksLockedAt: Date.now() } },
            });
            const demoBingo1 = Array(25).fill(false);
            demoBingo1[12] = true; // free space
            [0, 1, 2, 3, 4].forEach(i => { demoBingo1[i] = true; }); // top row = 1 line
            setBingo({
                1: {
                    demo: demoBingo1,
                    bot1: Array(25).fill(false).map((_, i) => i === 12),
                    bot2: Array(25).fill(false).map((_, i) => i === 12),
                    bot3: Array(25).fill(false).map((_, i) => i === 12),
                },
            });
            setTribeSwaps({});
            setMergePassports({});
            setFinaleData(null);
            setSyncStatus('online');
            setPartyLoading(false);
            return;
        }
        // The party is only readable to its members, so wait for the join to land.
        if (!displayName) return;
        setSyncStatus('syncing');
        const leagueRef = ref(db, `leagues/${leagueId}`);
        const unsub = onValue(leagueRef, (snap) => {
            const data = snap.val();
            if (data) {
                const {
                    members,
                    episodes: eps, eliminated: elim, watchStatus: ws, bingo: bg,
                    playerEpisode: pep,
                    tribeSwaps: ts, mergePassports: mp, finaleData: fd,
                    ...meta
                } = data;
                setLeague(meta);
                setLeagueMembers(members || {});
                setEpisodes(eps || {});
                setCurrentEpisode(meta.currentEpisode || null);
                setPlayerEpisode(pep || {});
                setEliminated(elim || []);
                setWatchStatus(ws || {});
                setBingo(bg || {});
                setTribeSwaps(ts || {});
                setMergePassports(mp || {});
                setFinaleData(fd || null);
            } else {
                setLeague(null);
                setLeagueMembers({});
                setCurrentEpisode(null);
                setPlayerEpisode({});
                setEpisodes({});
                setEliminated([]);
                setWatchStatus({});
                setBingo({});
                setTribeSwaps({});
                setMergePassports({});
                setFinaleData(null);
            }
            setSyncStatus('online');
            setPartyLoading(false);
        }, () => {
            setSyncStatus('offline');
            setPartyLoading(false);
        });
        return () => unsub();
    }, [leagueId, displayName]);

    /**
     * Claim a seat in the one watch party. All it takes is a name — there is no
     * code to enter and no lobby to wait in.
     */
    const joinWatchParty = useCallback(async (name) => {
        const trimmed = (name || '').trim();
        if (!trimmed) throw new Error('Pick a name the tribe can call you.');
        if (!db || !user) {
            setDisplayName(trimmed);
            return;
        }

        const member = { displayName: trimmed, email: user.email || '', joinedAt: Date.now() };

        // The security rules only permit this write while the party does not exist,
        // so the first player through the door creates it and hosts it, and everyone
        // after is rejected and falls through to the membership write. No read is
        // needed (non-members cannot read the party) and there is no race to lose.
        let hosting = false;
        try {
            await set(ref(db, `leagues/${leagueId}`), {
                name: WATCH_PARTY_NAME,
                season: SEASON_ID,
                createdBy: user.uid,
                createdAt: Date.now(),
                status: 'active',
                startingEpisode: 1,
                members: { [user.uid]: { ...member, role: 'admin' } },
            });
            hosting = true;
        } catch { /* party already exists — just join it */ }

        if (!hosting) {
            await set(ref(db, `leagues/${leagueId}/members/${user.uid}`), { ...member, role: 'player' });
        }

        // Written last on purpose: this is what the app reads to decide you are in,
        // so a failure above leaves you on the join screen able to retry.
        await set(ref(db, `users/${user.uid}/displayName`), trimmed);
    }, [user, leagueId]);

    const completeOnboarding = useCallback(async () => {
        if (!db || !user) {
            setOnboardingComplete(true);
            return;
        }
        await set(ref(db, `users/${user.uid}/onboardingComplete`), true);
    }, [user]);

    const createEpisode = useCallback(async (episodeNum) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');

        const isHost = league?.createdBy === user.uid;
        const isPostMerge = !!tribeSwaps?.merge;
        const propBets = generatePropBets(episodeNum, 5, isPostMerge);
        await set(ref(db, `leagues/${leagueId}/episodes/${episodeNum}`), {
            status: 'open',
            createdAt: Date.now(),
            propBets,
            picks: {},
            predictions: {},
        });
        if (isHost) {
            await set(ref(db, `leagues/${leagueId}/currentEpisode`), episodeNum);
        }
    }, [user, leagueId, league, tribeSwaps]);

    const updatePropBets = useCallback(async (episodeNum, propBets) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can edit prop bets');
        await set(ref(db, `leagues/${leagueId}/episodes/${episodeNum}/propBets`), propBets);
    }, [user, leagueId, league]);

    const submitPicks = useCallback(async (episodeNum, contestantIds) => {
        if (!user || !leagueId) throw new Error('Not connected');
        if (db) {
            await set(ref(db, `leagues/${leagueId}/episodes/${episodeNum}/picks/${user.uid}`), contestantIds);
        } else {
            setEpisodes(prev => ({
                ...prev,
                [episodeNum]: {
                    ...prev[episodeNum],
                    picks: { ...(prev[episodeNum]?.picks || {}), [user.uid]: contestantIds },
                },
            }));
        }
    }, [user, leagueId]);

    // `null` clears the captain, which happens when the chosen castaway is unpicked.
    const submitCaptain = useCallback(async (episodeNum, contestantId) => {
        if (!user || !leagueId) throw new Error('Not connected');
        if (db) {
            await set(ref(db, `leagues/${leagueId}/episodes/${episodeNum}/captains/${user.uid}`), contestantId || null);
        } else {
            setEpisodes(prev => ({
                ...prev,
                [episodeNum]: {
                    ...prev[episodeNum],
                    captains: { ...(prev[episodeNum]?.captains || {}), [user.uid]: contestantId || null },
                },
            }));
        }
    }, [user, leagueId]);

    const submitPredictions = useCallback(async (episodeNum, predictions) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        await set(ref(db, `leagues/${leagueId}/episodes/${episodeNum}/predictions/${user.uid}`), predictions);
    }, [user, leagueId]);

    const submitSnapVote = useCallback(async (episodeNum, contestantId) => {
        if (!user || !leagueId) throw new Error('Not connected');
        const path = `leagues/${leagueId}/episodes/${episodeNum}/snapVotes/${user.uid}`;
        if (db) {
            await set(ref(db, path), { contestantId, submittedAt: Date.now() });
        } else {
            setEpisodes(prev => ({
                ...prev,
                [episodeNum]: {
                    ...prev[episodeNum],
                    snapVotes: {
                        ...(prev[episodeNum]?.snapVotes || {}),
                        [user.uid]: { contestantId, submittedAt: Date.now() },
                    },
                },
            }));
        }
    }, [user, leagueId]);

    const scoreEpisodeAction = useCallback(async (episodeNum, scoringData) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can score episodes');

        const { gameEvents, propBetResults, eliminatedThisEp, eliminationMethod } = scoringData;

        const updates = {
            [`leagues/${leagueId}/episodes/${episodeNum}/gameEvents`]: gameEvents,
            [`leagues/${leagueId}/episodes/${episodeNum}/eliminatedThisEp`]: eliminatedThisEp || [],
            [`leagues/${leagueId}/episodes/${episodeNum}/eliminationMethod`]: eliminationMethod || 'voted_out',
            [`leagues/${leagueId}/episodes/${episodeNum}/scored`]: true,
            [`leagues/${leagueId}/episodes/${episodeNum}/scoredAt`]: Date.now(),
            [`leagues/${leagueId}/episodes/${episodeNum}/status`]: 'scored',
        };

        // Tree Mail is saved tap by tap. Scoring writes it only when the caller
        // already merged host taps with anything the import could resolve.
        if (propBetResults !== undefined) {
            updates[`leagues/${leagueId}/episodes/${episodeNum}/propBetResults`] = propBetResults;
        }

        // Rebuild eliminated list from all episodes to avoid stale entries
        const rebuiltEliminated = new Set(league?.preSeasonEliminated || []);
        for (const [epN, epData] of Object.entries(episodes || {})) {
            const epElims = Number(epN) === episodeNum
                ? (eliminatedThisEp || [])
                : (epData.eliminatedThisEp || []);
            for (const id of epElims) rebuiltEliminated.add(id);
        }
        updates[`leagues/${leagueId}/eliminated`] = [...rebuiltEliminated];

        // Use individual set calls (multi-path update via set requires root ref)
        for (const [path, value] of Object.entries(updates)) {
            await set(ref(db, path), value);
        }
    }, [user, leagueId, league, eliminated]);

    // One Tree Mail answer. Saving it does not score the episode.
    const markPropBetResult = useCallback(async (episodeNum, betId, value) => {
        if (!user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can mark Tree Mail');
        const path = `leagues/${leagueId}/episodes/${episodeNum}/propBetResults/${betId}`;
        const keep = typeof value === 'boolean';
        if (db) {
            if (keep) await set(ref(db, path), value);
            else await remove(ref(db, path));
        } else {
            setEpisodes(prev => {
                const ep = prev[episodeNum] || {};
                const results = { ...(ep.propBetResults || {}) };
                if (keep) results[betId] = value;
                else delete results[betId];
                return { ...prev, [episodeNum]: { ...ep, propBetResults: results } };
            });
        }
    }, [user, leagueId, league]);

    // Premiere draft: picks happen after the buffs are handed out, so this is the
    // only lock they get. Tree Mail stays locked by the torch.
    const lockDraft = useCallback(async (episodeNum) => {
        if (!user || !leagueId) throw new Error('Not connected');
        const ep = episodes?.[episodeNum];
        const playerPicks = ep?.picks?.[user.uid] || [];
        const elimSet = new Set(eliminated || []);
        const maxPicks = getMaxPicks(ALL_CASTAWAYS.filter(c => !elimSet.has(c.id)).length, episodeNum);
        if (playerPicks.length < maxPicks) {
            throw new Error(`Pick ${maxPicks} castaways before locking your draft (currently ${playerPicks.length})`);
        }
        const captain = ep?.captains?.[user.uid];
        if (!captain || !playerPicks.includes(captain)) {
            throw new Error('Star one of your picks as Captain before locking your draft');
        }

        const path = `leagues/${leagueId}/watchStatus/${episodeNum}/${user.uid}/draftLockedAt`;
        if (db) {
            await set(ref(db, path), Date.now());
        } else {
            setWatchStatus(prev => ({
                ...prev,
                [episodeNum]: {
                    ...(prev[episodeNum] || {}),
                    [user.uid]: {
                        ...(prev[episodeNum]?.[user.uid] || {}),
                        draftLockedAt: Date.now(),
                    },
                },
            }));
        }
    }, [user, leagueId, episodes, eliminated]);

    const lightTorch = useCallback(async (episodeNum) => {
        if (!user || !leagueId) return;

        // Episode 1 has no castaway picks — nobody has seen this cast play yet.
        if (Number(episodeNum) >= PICKS_START_EPISODE) {
            const ep = episodes?.[episodeNum];
            const playerPicks = ep?.picks?.[user.uid] || [];
            const elimSet = new Set(eliminated || []);
            const remainingCount = ALL_CASTAWAYS.filter(c => !elimSet.has(c.id)).length;
            const maxPicks = getMaxPicks(remainingCount, episodeNum);
            if (playerPicks.length < maxPicks) {
                throw new Error(`You need ${maxPicks} picks before lighting your torch (currently ${playerPicks.length})`);
            }
            // Asking here means the choice is never lost by forgetting to make it.
            const captain = ep?.captains?.[user.uid];
            if (!captain || !playerPicks.includes(captain)) {
                throw new Error('Pick your Captain before lighting your torch — tap the star on one of your picks');
            }
        }

        const basePath = `leagues/${leagueId}/watchStatus/${episodeNum}/${user.uid}`;
        if (db) {
            await set(ref(db, `${basePath}/watching`), true);
            await set(ref(db, `${basePath}/picksLockedAt`), Date.now());
        } else {
            setWatchStatus(prev => ({
                ...prev,
                [episodeNum]: {
                    ...(prev[episodeNum] || {}),
                    [user.uid]: {
                        ...(prev[episodeNum]?.[user.uid] || {}),
                        watching: true,
                        picksLockedAt: Date.now(),
                    },
                },
            }));
        }
    }, [user, leagueId, episodes, eliminated]);

    const markWatched = useCallback(async (episodeNum) => {
        if (!user || !leagueId) return;
        const basePath = `leagues/${leagueId}/watchStatus/${episodeNum}/${user.uid}`;
        if (db) {
            await set(ref(db, `${basePath}/watching`), false);
            await set(ref(db, `${basePath}/watchedAt`), Date.now());
        } else {
            setWatchStatus(prev => ({
                ...prev,
                [episodeNum]: { ...(prev[episodeNum] || {}), [user.uid]: { watching: false, watchedAt: Date.now() } },
            }));
        }
    }, [user, leagueId]);

    const advanceEpisode = useCallback(async () => {
        if (!db || !user || !leagueId) return;
        const myEp = playerEpisode[user.uid];
        if (!myEp) return;
        await set(ref(db, `leagues/${leagueId}/playerEpisode/${user.uid}`), myEp + 1);
    }, [user, leagueId, playerEpisode]);

    // Host-only utility: reset THIS user's episode pointer (fixes stale test data).
    const setMyEpisode = useCallback(async (targetEpisode) => {
        if (!db || !user || !leagueId) return;
        const n = Math.max(1, Number(targetEpisode) || 1);
        await set(ref(db, `leagues/${leagueId}/playerEpisode/${user.uid}`), n);
    }, [user, leagueId]);

    const saveBingoMarks = useCallback(async (episodeNum, marked) => {
        if (!user || !leagueId) return;
        const path = `leagues/${leagueId}/bingo/${episodeNum}/${user.uid}`;
        if (db) {
            await set(ref(db, path), marked);
        }
    }, [user, leagueId]);

    const hasWatched = useCallback((episodeNum, uid) => {
        const ws = watchStatus[episodeNum];
        if (!ws) return false;
        const target = uid || user?.uid;
        return !!ws[target]?.watchedAt;
    }, [watchStatus, user]);

    const isWatching = useCallback((episodeNum) => {
        const ws = watchStatus[episodeNum];
        if (!ws || !user) return false;
        return !!ws[user.uid]?.watching;
    }, [watchStatus, user]);

    const hasLockedPicks = useCallback((episodeNum) => {
        const ws = watchStatus[episodeNum];
        if (!ws || !user) return false;
        const playerWs = ws[user.uid];
        return !!(playerWs?.picksLockedAt || playerWs?.watching || playerWs?.watchedAt);
    }, [watchStatus, user]);

    // The premiere draft happens mid-episode, so it carries its own lock.
    const hasDrafted = useCallback((episodeNum) => {
        const ws = watchStatus[episodeNum];
        if (!ws || !user) return false;
        return !!ws[user.uid]?.draftLockedAt;
    }, [watchStatus, user]);

    // --- Phase 9: Tribe management, passport, finale ---

    const executeTribeSwap = useCallback(async (episodeNum, newAssignments) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can manage tribes');
        await set(ref(db, `leagues/${leagueId}/tribeSwaps/${episodeNum}`), {
            assignments: newAssignments,
            executedAt: Date.now(),
        });
    }, [user, leagueId, league]);

    const moveTribeSwap = useCallback(async (fromEpisode, toEpisode) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can manage tribes');
        const snap = await get(ref(db, `leagues/${leagueId}/tribeSwaps/${fromEpisode}`));
        const swapData = snap.val();
        if (!swapData) throw new Error(`No tribe swap found at episode ${fromEpisode}`);
        await set(ref(db, `leagues/${leagueId}/tribeSwaps/${toEpisode}`), swapData);
        await remove(ref(db, `leagues/${leagueId}/tribeSwaps/${fromEpisode}`));
    }, [user, leagueId, league]);

    const deleteTribeSwap = useCallback(async (episodeNum) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can manage tribes');
        await remove(ref(db, `leagues/${leagueId}/tribeSwaps/${episodeNum}`));
    }, [user, leagueId, league]);

    const fixElimination = useCallback(async (episodeNum, contestantId, method) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can fix eliminations');

        const epSnap = await get(ref(db, `leagues/${leagueId}/episodes/${episodeNum}`));
        const epData = epSnap.val();

        const prevEliminated = epData?.eliminatedThisEp || [];
        const newEliminated = contestantId
            ? [...new Set([...prevEliminated, contestantId])]
            : prevEliminated;

        await set(ref(db, `leagues/${leagueId}/episodes/${episodeNum}/eliminatedThisEp`), newEliminated);
        await set(ref(db, `leagues/${leagueId}/episodes/${episodeNum}/eliminationMethod`), method);

        if (contestantId) {
            const gameEvents = epData?.gameEvents || {};
            const existingEvents = gameEvents[contestantId] || [];
            const surviveIdx = existingEvents.indexOf('survived');
            const updatedEvents = surviveIdx >= 0
                ? [...existingEvents.slice(0, surviveIdx), ...existingEvents.slice(surviveIdx + 1)]
                : [...existingEvents];
            if (method === 'medevac' && !updatedEvents.includes('medevac')) {
                updatedEvents.push('medevac');
            }
            await set(ref(db, `leagues/${leagueId}/episodes/${episodeNum}/gameEvents/${contestantId}`), updatedEvents);

            const currentEliminated = eliminated || [];
            if (!currentEliminated.includes(contestantId)) {
                await set(ref(db, `leagues/${leagueId}/eliminated`), [...currentEliminated, contestantId]);
            }
        }
    }, [user, leagueId, league, eliminated]);

    const rescoreEpisode = useCallback(async (episodeNum) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can re-score episodes');

        const epSnap = await get(ref(db, `leagues/${leagueId}/episodes/${episodeNum}`));
        const epData = epSnap.val();
        if (!epData?.scored) throw new Error(`Episode ${episodeNum} has not been scored yet`);

        const tribeOverrides = getEffectiveTribeAssignments(tribeSwaps, episodeNum);

        const prevEliminated = [];
        const epNums = Object.keys(episodes || {}).map(Number).filter(n => n < episodeNum).sort((a, b) => a - b);
        for (const n of epNums) {
            const ep = episodes[n];
            if (ep?.eliminatedThisEp) prevEliminated.push(...ep.eliminatedThisEp);
        }
        const elimSet = new Set(prevEliminated);
        const remaining = ALL_CASTAWAYS.filter(c => !elimSet.has(c.id));

        let importData = null;
        try {
            const importSnap = await get(ref(db, `seasons/${SEASON_ID}/autoImport/e${episodeNum}`));
            if (importSnap.exists()) importData = importSnap.val();
        } catch { /* proceed with stored episode data */ }

        const eliminatedIds = epData.eliminatedThisEp?.length > 0
            ? epData.eliminatedThisEp
            : importData?.eliminatedIds?.length > 0
                ? importData.eliminatedIds
                : (importData?.eliminatedId ? [importData.eliminatedId] : []);
        const eliminationMethod = epData.eliminationMethod || importData?.eliminationMethod || 'voted_out';

        const source = importData || epData;
        const { gameEvents } = deriveGameEvents({
            eliminatedIds,
            eliminationMethod,
            immunityWinners: source.immunityWinners || epData.immunityWinners || [],
            immunityWinnerIds: source.immunityWinnerIds || [],
            rewardWinners: source.rewardWinners || epData.rewardWinners || [],
            rewardWinnerIds: source.rewardWinnerIds || [],
            isPostMerge: source.isPostMerge || !!tribeSwaps?.merge,
            minorityVoters: source.minorityVoters || [],
            receivedVotes: source.receivedVotes || [],
            bigMoments: source.bigMoments || {},
            remaining,
            tribeOverrides,
        });

        await set(ref(db, `leagues/${leagueId}/episodes/${episodeNum}/gameEvents`), gameEvents);
        await set(ref(db, `leagues/${leagueId}/episodes/${episodeNum}/rescoredAt`), Date.now());
    }, [user, leagueId, league, tribeSwaps, episodes]);

    const executeMerge = useCallback(async (episodeNum, mergeTribeName) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can merge tribes');
        await set(ref(db, `leagues/${leagueId}/tribeSwaps/merge`), {
            episodeNum,
            tribeName: mergeTribeName,
            executedAt: Date.now(),
        });
    }, [user, leagueId, league]);

    const submitMergePassport = useCallback(async (answers) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        await set(ref(db, `leagues/${leagueId}/mergePassports/${user.uid}`), {
            ...answers,
            sealedAt: Date.now(),
        });
    }, [user, leagueId]);

    const startFinale = useCallback(async () => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can start the finale');
        await set(ref(db, `leagues/${leagueId}/finaleData`), {
            status: 'active',
            startedAt: Date.now(),
            passportReveals: {},
            reunionAwards: {},
            passportTruth: {},
            champion: null,
        });
    }, [user, leagueId, league]);

    const revealMergePassport = useCallback(async (uid) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can reveal passports');
        const mp = mergePassports?.[uid];
        if (!mp) return;
        await set(ref(db, `leagues/${leagueId}/finaleData/mergePassportReveals/${uid}`), {
            ...mp,
            revealedAt: Date.now(),
        });
    }, [user, leagueId, league, mergePassports]);

    /**
     * Host-only: record what actually happened this season, unlocking passport bonus
     * points for every player. `truth` uses the same keys as PASSPORT_QUESTIONS.
     */
    const setPassportTruth = useCallback(async (truth) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can set the passport truth');
        await set(ref(db, `leagues/${leagueId}/finaleData/passportTruth`), truth);
    }, [user, leagueId, league]);

    const submitReunionVote = useCallback(async (category, nomineeUid) => {
        if (!user || !leagueId) throw new Error('Not connected');
        const path = `leagues/${leagueId}/finaleData/reunionAwards/${category}/${user.uid}`;
        if (db) {
            await set(ref(db, path), nomineeUid);
        } else {
            setFinaleData(prev => prev ? {
                ...prev,
                reunionAwards: {
                    ...(prev.reunionAwards || {}),
                    [category]: {
                        ...(prev.reunionAwards?.[category] || {}),
                        [user.uid]: nomineeUid,
                    },
                },
            } : prev);
        }
    }, [user, leagueId]);

    const crownChampion = useCallback(async (uid) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can crown the champion');
        await set(ref(db, `leagues/${leagueId}/finaleData/champion`), uid);
        await set(ref(db, `leagues/${leagueId}/status`), 'complete');
    }, [user, leagueId, league]);

    const isMerged = useMemo(() => {
        return !!tribeSwaps?.merge;
    }, [tribeSwaps]);

    const currentTribes = useMemo(() => {
        if (!tribeSwaps || Object.keys(tribeSwaps).length === 0) return null;
        if (tribeSwaps.merge) return { merged: { name: tribeSwaps.merge.tribeName || 'Merged Tribe' } };
        const swapEps = Object.keys(tribeSwaps).filter(k => k !== 'merge').map(Number).sort((a, b) => b - a);
        if (swapEps.length === 0) return null;
        return tribeSwaps[swapEps[0]]?.assignments || null;
    }, [tribeSwaps]);

    const myEpisode = useMemo(() => {
        if (!user) return null;
        return playerEpisode[user.uid] || null;
    }, [user, playerEpisode]);

    const myEpisodeData = useMemo(() => {
        if (!myEpisode || !episodes[myEpisode]) return null;
        return episodes[myEpisode];
    }, [myEpisode, episodes]);

    const episodeData = useMemo(() => {
        if (!currentEpisode || !episodes[currentEpisode]) return null;
        return episodes[currentEpisode];
    }, [currentEpisode, episodes]);

    // --- Per-player episode progression: init + ensure episode exists ---
    const autoCreateAttempted = useRef({});

    useEffect(() => {
        if (!db || !user || !leagueId || !league) return;
        if (league.status !== 'active') return;

        const firstEp = league.startingEpisode || 1;
        const myEp = playerEpisode[user.uid];

        if (!myEp) {
            const key = `${leagueId}_init_${user.uid}`;
            if (autoCreateAttempted.current[key]) return;
            autoCreateAttempted.current[key] = true;
            set(ref(db, `leagues/${leagueId}/playerEpisode/${user.uid}`), firstEp).catch(() => {
                autoCreateAttempted.current[key] = false;
            });
            return;
        }

        if (!episodes[myEp]) {
            const key = `${leagueId}_create_${myEp}`;
            if (autoCreateAttempted.current[key]) return;
            autoCreateAttempted.current[key] = true;
            createEpisode(myEp).catch(() => {
                autoCreateAttempted.current[key] = false;
            });
        }
    }, [db, user, leagueId, league, playerEpisode, episodes, createEpisode]);

    // Host: keep currentEpisode aligned when a member opened a new week first
    useEffect(() => {
        if (!db || !user || !leagueId || !league) return;
        if (league.status !== 'active') return;
        if (league.createdBy !== user.uid) return;

        const openNums = Object.entries(episodes || {})
            .filter(([, ep]) => ep?.status === 'open' && !ep?.scored)
            .map(([n]) => Number(n))
            .filter(n => !Number.isNaN(n));
        if (openNums.length === 0) return;
        const maxOpen = Math.max(...openNums);
        const cur = league.currentEpisode || 0;
        if (maxOpen > cur) {
            set(ref(db, `leagues/${leagueId}/currentEpisode`), maxOpen).catch(() => {});
        }
    }, [db, user, leagueId, league, episodes]);

    // --- Auto-scoring: detect import data and score any unscored episode ---
    const autoScoreAttempted = useRef({});

    useEffect(() => {
        if (!db || !user || !leagueId || !league) return;
        if (league.createdBy !== user.uid) return;

        const unscoredEps = Object.entries(episodes || {}).filter(([, ep]) => !ep.scored);
        if (unscoredEps.length === 0) return;

        for (const [epNumStr, ep] of unscoredEps) {
            const epNum = Number(epNumStr);
            const key = `${leagueId}_${epNum}`;
            if (autoScoreAttempted.current[key]) continue;

            const importRef = ref(db, `seasons/${SEASON_ID}/autoImport/e${epNum}`);
            get(importRef).then(snap => {
                if (!snap.exists()) return;
                const importData = snap.val();
                if (!importData.eliminatedId && !importData.eliminationMethod) return;

                autoScoreAttempted.current[key] = true;

                // Build remaining from eliminations BEFORE this episode only
                const eliminatedBefore = new Set();
                for (const [en, ed] of Object.entries(episodes || {})) {
                    if (Number(en) < epNum) {
                        for (const id of (ed.eliminatedThisEp || [])) eliminatedBefore.add(id);
                    }
                }
                const remaining = ALL_CASTAWAYS.filter(c => !eliminatedBefore.has(c.id));
                const tribeOverrides = getEffectiveTribeAssignments(tribeSwaps, epNum);
                const eliminatedIds = importData.eliminatedIds?.length > 0
                    ? importData.eliminatedIds
                    : (importData.eliminatedId ? [importData.eliminatedId] : []);
                const { gameEvents } = deriveGameEvents({
                    eliminatedIds,
                    eliminationMethod: importData.eliminationMethod || 'voted_out',
                    immunityWinners: importData.immunityWinners || [],
                    immunityWinnerIds: importData.immunityWinnerIds || [],
                    rewardWinners: importData.rewardWinners || [],
                    rewardWinnerIds: importData.rewardWinnerIds || [],
                    isPostMerge: importData.isPostMerge || false,
                    minorityVoters: importData.minorityVoters || [],
                    receivedVotes: importData.receivedVotes || [],
                    bigMoments: importData.bigMoments || {},
                    remaining,
                    tribeOverrides,
                });

                const propBets = ep.propBets || [];
                const resolved = propBets.some(b => b.resolveType)
                    ? resolveBets(importData, propBets)
                    : {};
                const propBetResults = mergePropBetResults(ep.propBetResults, propBets, resolved);

                const eliminatedThisEp = eliminatedIds;

                scoreEpisodeAction(epNum, {
                    gameEvents,
                    propBetResults,
                    eliminatedThisEp,
                    eliminationMethod: importData.eliminationMethod || 'voted_out',
                }).then(() => {
                    console.log(`Auto-scored episode ${epNum} from imported data`);
                }).catch(err => {
                    console.warn('Auto-score failed:', err.message);
                    delete autoScoreAttempted.current[key];
                });
            }).catch(err => {
                console.warn('Auto-score import check failed:', err.message);
            });
        }
    }, [db, user, leagueId, league, episodes, eliminated, scoreEpisodeAction, tribeSwaps]);

    // --- Spoiler protection: safeEliminated only includes eliminations from watched episodes ---
    const safeEliminated = useMemo(() => {
        if (!user) return [];
        return (eliminated || []).filter(cid => {
            for (const [epNum, ep] of Object.entries(episodes || {})) {
                if ((ep.eliminatedThisEp || []).includes(cid)) {
                    return hasWatched(Number(epNum));
                }
            }
            return true;
        });
    }, [eliminated, episodes, user, hasWatched]);

    const sendMagicLink = (email) => {
        if (!auth) throw new Error('Firebase not configured. Add .env from .env.example');
        window.localStorage.setItem('emailForSignIn', email);
        return sendSignInLinkToEmail(auth, email, actionCodeSettings);
    };

    const logout = () => auth && signOut(auth);

    const value = {
        user, authLoading, displayName, profileLoading,
        league, leagueId, leagueMembers, partyLoading,
        mergePassports,
        currentEpisode, episodeData, myEpisode, myEpisodeData, episodes, eliminated, safeEliminated,
        watchStatus, bingo,
        tribeSwaps, isMerged, currentTribes, finaleData,
        lightTorch, lockDraft, markWatched, advanceEpisode, setMyEpisode, saveBingoMarks, hasWatched, isWatching, hasLockedPicks, hasDrafted,
        syncStatus, onboardingComplete,
        joinWatchParty, completeOnboarding,
        createEpisode, updatePropBets, submitPicks, submitCaptain, submitPredictions,
        submitSnapVote, markPropBetResult, scoreEpisodeAction,
        executeTribeSwap, moveTribeSwap, deleteTribeSwap, fixElimination, rescoreEpisode,
        executeMerge, submitMergePassport,
        startFinale, revealMergePassport, setPassportTruth, submitReunionVote, crownChampion,
        sendMagicLink, logout,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
