import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { onAuthStateChanged, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signOut } from 'firebase/auth';
import { ref, onValue, set, get, push, remove } from 'firebase/database';
import { auth, db } from './firebase';
import { generatePropBets, generateSideBets, ALL_CASTAWAYS, resolveBets, getAuctionPerks } from './data';
import { computeStandings, computeSocialScores } from './scoring';
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
    const swapEps = Object.keys(tribeSwaps)
        .filter(k => k !== 'merge')
        .map(Number)
        .filter(n => !isNaN(n) && n <= episodeNum)
        .sort((a, b) => b - a);
    if (swapEps.length === 0) return null;
    return tribeSwaps[swapEps[0]]?.assignments || null;
}

const DEMO_LEAGUE = {
    name: 'Demo Island',
    joinCode: 'DEMO00',
    createdBy: 'demo',
    createdAt: Date.now(),
    status: 'lobby',
};

const DEMO_MEMBERS = {
    demo: { displayName: 'You', email: 'demo@survivor.local', joinedAt: Date.now(), role: 'admin' },
    bot1: { displayName: 'Tanya', email: 'tanya@survivor.local', joinedAt: Date.now(), role: 'player' },
    bot2: { displayName: 'Marcus', email: 'marcus@survivor.local', joinedAt: Date.now(), role: 'player' },
    bot3: { displayName: 'Jess', email: 'jess@survivor.local', joinedAt: Date.now(), role: 'player' },
};

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateJoinCode() {
    let code = '';
    for (let i = 0; i < 4; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    code += String(Math.floor(Math.random() * 100)).padStart(2, '0');
    return code;
}

export function getSnakeOrder(playerOrder, rounds = 2) {
    const snake = [];
    for (let r = 0; r < rounds; r++) {
        if (r % 2 === 0) snake.push(...playerOrder);
        else snake.push(...[...playerOrder].reverse());
    }
    return snake;
}

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const actionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true,
};

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [leagueId, setLeagueId] = useState(null);
    const [league, setLeague] = useState(null);
    const [leagueMembers, setLeagueMembers] = useState({});
    const [draftState, setDraftState] = useState(null);
    const [rideOrDies, setRideOrDies] = useState({});
    const [passports, setPassports] = useState({});
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [playerEpisode, setPlayerEpisode] = useState({});
    const [episodes, setEpisodes] = useState({});
    const [eliminated, setEliminated] = useState([]);
    const [watchStatus, setWatchStatus] = useState({});
    const [bingo, setBingo] = useState({});
    const [postEpisode, setPostEpisode] = useState({});
    const [tribeSwaps, setTribeSwaps] = useState({});
    const [mergePassports, setMergePassports] = useState({});
    const [auction, setAuction] = useState(null);
    const [finaleData, setFinaleData] = useState(null);
    const [leagueLoading, setLeagueLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState('offline');
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [userLeagues, setUserLeagues] = useState({});

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

    // Resolve current league ID from user profile
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional loading state before async subscription
        if (!user) { setLeagueLoading(false); return; }
        if (!db) {
            setLeagueId('demo-league');
            setLeagueLoading(false);
            return;
        }
        const userLeagueRef = ref(db, `users/${user.uid}/currentLeague`);
        const unsub = onValue(userLeagueRef, (snap) => {
            setLeagueId(snap.val() || null);
            setLeagueLoading(false);
        }, () => setLeagueLoading(false));
        return () => unsub();
    }, [user]);

    // Sync onboardingComplete and user leagues list
    useEffect(() => {
        if (!user || !db) return;
        const onboardRef = ref(db, `users/${user.uid}/onboardingComplete`);
        const leaguesRef = ref(db, `users/${user.uid}/leagues`);
        const unsub1 = onValue(onboardRef, (snap) => {
            setOnboardingComplete(!!snap.val());
        });
        const unsub2 = onValue(leaguesRef, (snap) => {
            setUserLeagues(snap.val() || {});
        });
        return () => { unsub1(); unsub2(); };
    }, [user]);

    // Sync league data + members + draft + rideOrDies + passports + episodes
    useEffect(() => {
        if (!leagueId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional cleanup when league changes
            setLeague(null);
            setLeagueMembers({});
            setDraftState(null);
            setRideOrDies({});
            setPassports({});
            setCurrentEpisode(null);
            setPlayerEpisode({});
            setEpisodes({});
            setEliminated([]);
            setWatchStatus({});
            setBingo({});
            setPostEpisode({});
            setTribeSwaps({});
            setMergePassports({});
            setAuction(null);
            setFinaleData(null);
            return;
        }
        if (!db) {
            setLeague({ ...DEMO_LEAGUE, status: 'active', currentEpisode: 1 });
            setLeagueMembers(DEMO_MEMBERS);
            setDraftState({ status: 'complete' });
            setRideOrDies({
                demo: ['cirie_fields', 'ozzy_lusth'],
                bot1: ['rick_devens', 'aubry_bracco'],
                bot2: ['dee_valladares', 'christian_hubicki'],
                bot3: ['coach_wade', 'stephenie_lagrossa'],
            });
            setPassports({
                demo: { sealedAt: Date.now() },
                bot1: { sealedAt: Date.now() },
                bot2: { sealedAt: Date.now() },
                bot3: { sealedAt: Date.now() },
            });
            setCurrentEpisode(2);
            const ep1Props = generatePropBets(1, 5);
            setEpisodes({
                1: {
                    status: 'scored',
                    scored: true,
                    createdAt: Date.now() - 604800000,
                    propBets: ep1Props,
                    picks: {
                        demo: ['cirie_fields', 'ozzy_lusth', 'rick_devens', 'emily_flippen', 'christian_hubicki'],
                        bot1: ['rick_devens', 'aubry_bracco', 'dee_valladares', 'coach_wade', 'colby_donaldson'],
                        bot2: ['ozzy_lusth', 'dee_valladares', 'stephenie_lagrossa', 'jonathan_young', 'angelina_keeley'],
                        bot3: ['cirie_fields', 'coach_wade', 'tiffany_ervin', 'charlie_davis', 'genevieve_mushaluk'],
                    },
                    predictions: {
                        demo: { elimination: 'jenna_lewis', boldPrediction: 'Cirie finds an idol', propBets: { [ep1Props[0].id]: true, [ep1Props[2].id]: true } },
                        bot1: { elimination: 'mike_white', boldPrediction: 'Rick wins immunity', propBets: { [ep1Props[1].id]: true } },
                        bot2: { elimination: 'jenna_lewis', boldPrediction: 'Ozzy catches a fish', propBets: { [ep1Props[0].id]: true, [ep1Props[3].id]: true } },
                        bot3: { elimination: 'q_burdette', boldPrediction: 'Coach goes on a rant', propBets: { [ep1Props[2].id]: true, [ep1Props[4].id]: true } },
                    },
                    gameEvents: {
                        cirie_fields: ['survived', 'tribal_immunity'],
                        ozzy_lusth: ['survived', 'tribal_immunity', 'idol_found'],
                        rick_devens: ['survived', 'tribal_reward'],
                        emily_flippen: ['survived', 'tribal_immunity'],
                        christian_hubicki: ['survived', 'tribal_immunity'],
                        aubry_bracco: ['survived', 'voted_correctly'],
                        dee_valladares: ['survived', 'voted_correctly'],
                        coach_wade: ['survived', 'voted_correctly', 'attended_tribal_zero'],
                        colby_donaldson: ['survived', 'tribal_reward'],
                        stephenie_lagrossa: ['survived'],
                        jonathan_young: ['survived'],
                        angelina_keeley: ['survived'],
                        charlie_davis: ['survived'],
                        tiffany_ervin: ['survived'],
                        genevieve_mushaluk: ['survived', 'survived_with_votes'],
                        joe_hunter: ['survived', 'tribal_immunity'],
                        savannah_louie: ['survived', 'tribal_immunity'],
                        jenna_lewis: ['survived', 'tribal_reward'],
                        q_burdette: ['survived'],
                        kyle_fraser: ['survived'],
                        rizo_velovic: ['survived'],
                        kamilla_karthigesu: ['survived'],
                        mike_white: [],
                        chrissy_hofbeck: ['survived'],
                    },
                    propBetResults: { [ep1Props[0].id]: true, [ep1Props[2].id]: false, [ep1Props[4].id]: true },
                    eliminatedThisEp: ['mike_white'],
                    eliminationMethod: 'voted_out',
                },
                2: {
                    status: 'open',
                    createdAt: Date.now(),
                    propBets: generatePropBets(2, 5),
                    sideBets: generateSideBets(2, 3),
                    picks: {},
                    predictions: {},
                },
            });
            setEliminated(['mike_white']);
            setWatchStatus({
                1: { demo: { watching: false, watchedAt: Date.now() - 600000 }, bot1: { watchedAt: Date.now() - 500000 }, bot2: { watchedAt: Date.now() - 400000 }, bot3: { watchedAt: Date.now() - 300000 } },
                2: {},
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
            setPostEpisode({
                1: {
                    playerOfEpisode: {
                        bot1: ['ozzy_lusth', 'cirie_fields', 'coach_wade'],
                        bot2: ['ozzy_lusth', 'coach_wade', 'cirie_fields'],
                        bot3: ['cirie_fields', 'ozzy_lusth', 'coach_wade'],
                    },
                    impactRating: { bot1: 2, bot2: 3, bot3: 2 },
                },
            });
            setTribeSwaps({});
            setMergePassports({});
            setAuction(null);
            setFinaleData(null);
            setSyncStatus('online');
            return;
        }
        setSyncStatus('syncing');
        const leagueRef = ref(db, `leagues/${leagueId}`);
        const unsub = onValue(leagueRef, (snap) => {
            const data = snap.val();
            if (data) {
                const {
                    members, draft, rideOrDies: rod, passports: pp,
                    episodes: eps, eliminated: elim, watchStatus: ws, bingo: bg,
                    postEpisode: pe, playerEpisode: pep,
                    tribeSwaps: ts, mergePassports: mp, auction: auc, finaleData: fd,
                    ...meta
                } = data;
                setLeague(meta);
                setLeagueMembers(members || {});
                setDraftState(draft || null);
                setRideOrDies(rod || {});
                setPassports(pp || {});
                setEpisodes(eps || {});
                setCurrentEpisode(meta.currentEpisode || null);
                setPlayerEpisode(pep || {});
                setEliminated(elim || []);
                setWatchStatus(ws || {});
                setBingo(bg || {});
                setPostEpisode(pe || {});
                setTribeSwaps(ts || {});
                setMergePassports(mp || {});
                setAuction(auc || null);
                setFinaleData(fd || null);
            } else {
                setLeague(null);
                setLeagueMembers({});
                setDraftState(null);
                setRideOrDies({});
                setPassports({});
                setCurrentEpisode(null);
                setPlayerEpisode({});
                setEpisodes({});
                setEliminated([]);
                setWatchStatus({});
                setBingo({});
                setPostEpisode({});
                setTribeSwaps({});
                setMergePassports({});
                setAuction(null);
                setFinaleData(null);
            }
            setSyncStatus('online');
        }, () => setSyncStatus('offline'));
        return () => unsub();
    }, [leagueId]);

    const getSeasonImportData = useCallback(async () => {
        if (!db) return [];
        const snap = await get(ref(db, 'seasons/s50/autoImport'));
        if (!snap.exists()) return [];
        const data = snap.val();
        return Object.keys(data)
            .filter(k => k.startsWith('e'))
            .map(k => ({
                episodeNum: parseInt(k.slice(1), 10),
                eliminatedId: data[k].eliminatedId || null,
                eliminatedIds: data[k].eliminatedIds || (data[k].eliminatedId ? [data[k].eliminatedId] : []),
            }))
            .sort((a, b) => a.episodeNum - b.episodeNum);
    }, []);

    const createLeague = useCallback(async (name, displayName, startingEpisode = 1) => {
        if (!db || !user) throw new Error('Firebase not configured');

        let joinCode;
        let attempts = 0;
        while (attempts < 10) {
            joinCode = generateJoinCode();
            const existing = await get(ref(db, `leagueCodes/${joinCode}`));
            if (!existing.val()) break;
            attempts++;
        }
        if (attempts >= 10) throw new Error('Could not generate unique code. Try again.');

        const newRef = push(ref(db, 'leagues'));
        const id = newRef.key;

        let preSeasonEliminated = [];
        if (startingEpisode > 1) {
            const importData = await getSeasonImportData();
            preSeasonEliminated = importData
                .filter(ep => ep.episodeNum < startingEpisode)
                .flatMap(ep => ep.eliminatedIds || (ep.eliminatedId ? [ep.eliminatedId] : []));
        }

        const leagueData = {
            name,
            joinCode,
            season: 's50',
            createdBy: user.uid,
            createdAt: Date.now(),
            status: 'lobby',
            startingEpisode,
            members: {
                [user.uid]: {
                    displayName,
                    email: user.email || '',
                    joinedAt: Date.now(),
                    role: 'admin',
                },
            },
        };

        if (preSeasonEliminated.length > 0) {
            leagueData.eliminated = preSeasonEliminated;
            leagueData.preSeasonEliminated = preSeasonEliminated;
        }

        await set(newRef, leagueData);
        await set(ref(db, `leagueCodes/${joinCode}`), id);
        await set(ref(db, `users/${user.uid}/leagues/${id}`), true);

        return { id, joinCode };
    }, [user, getSeasonImportData]);

    const joinLeague = useCallback(async (code, displayName) => {
        if (!db || !user) throw new Error('Firebase not configured');

        const codeSnap = await get(ref(db, `leagueCodes/${code.toUpperCase()}`));
        const targetId = codeSnap.val();
        if (!targetId) throw new Error('Invalid join code. Check with your league admin.');

        const leagueSnap = await get(ref(db, `leagues/${targetId}`));
        const leagueData = leagueSnap.val();
        if (!leagueData) throw new Error('League not found.');
        if (leagueData.members && leagueData.members[user.uid]) throw new Error('You are already in this league.');

        const memberCount = leagueData.members ? Object.keys(leagueData.members).length : 0;
        if (memberCount >= 6) throw new Error('This league is full (max 6 players).');

        await set(ref(db, `leagues/${targetId}/members/${user.uid}`), {
            displayName,
            email: user.email || '',
            joinedAt: Date.now(),
            role: 'player',
        });
        await set(ref(db, `users/${user.uid}/currentLeague`), targetId);
        await set(ref(db, `users/${user.uid}/leagues/${targetId}`), true);

        return targetId;
    }, [user]);

    const leaveLeague = useCallback(async () => {
        if (!db || !user || !leagueId) return;
        await remove(ref(db, `leagues/${leagueId}/members/${user.uid}`));
        await remove(ref(db, `users/${user.uid}/leagues/${leagueId}`));
        const remaining = { ...userLeagues };
        delete remaining[leagueId];
        const nextId = Object.keys(remaining)[0] || null;
        if (nextId) {
            await set(ref(db, `users/${user.uid}/currentLeague`), nextId);
        } else {
            await remove(ref(db, `users/${user.uid}/currentLeague`));
        }
    }, [user, leagueId, userLeagues]);

    const switchLeague = useCallback(async (targetLeagueId) => {
        if (!db || !user) return;
        await set(ref(db, `users/${user.uid}/currentLeague`), targetLeagueId);
    }, [user]);

    const updateLeagueName = useCallback(async (name) => {
        if (!db || !user || !leagueId) return;
        if (league?.createdBy !== user.uid) throw new Error('Only the host can rename the league');
        await set(ref(db, `leagues/${leagueId}/name`), name);
    }, [user, leagueId, league]);

    const completeOnboarding = useCallback(async () => {
        if (!db || !user) {
            setOnboardingComplete(true);
            return;
        }
        await set(ref(db, `users/${user.uid}/onboardingComplete`), true);
    }, [user]);

    const startDraft = useCallback(async () => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can start the draft');

        const memberUids = Object.keys(leagueMembers);
        if (memberUids.length < 2) throw new Error('Need at least 2 players to draft');

        const order = shuffleArray(memberUids);
        await set(ref(db, `leagues/${leagueId}/draft`), {
            status: 'active',
            order,
            picks: [],
            currentPick: 0,
        });
        await set(ref(db, `leagues/${leagueId}/status`), 'draft');
    }, [user, leagueId, league, leagueMembers]);

    const makeDraftPick = useCallback(async (contestantId) => {
        if (!db || !user || !leagueId || !draftState) throw new Error('Not connected');
        if (draftState.status !== 'active') throw new Error('Draft is not active');

        const snake = getSnakeOrder(draftState.order);
        const expectedUid = snake[draftState.currentPick];
        if (expectedUid !== user.uid) throw new Error('Not your turn');

        const picks = [...(draftState.picks || []), { uid: user.uid, contestantId }];
        const nextPick = draftState.currentPick + 1;
        const isComplete = nextPick >= snake.length;

        await set(ref(db, `leagues/${leagueId}/draft/picks`), picks);
        await set(ref(db, `leagues/${leagueId}/draft/currentPick`), nextPick);

        if (isComplete) {
            await set(ref(db, `leagues/${leagueId}/draft/status`), 'complete');

            // Compute ride-or-dies per player from picks
            const rod = {};
            for (const pick of picks) {
                if (!rod[pick.uid]) rod[pick.uid] = [];
                rod[pick.uid].push(pick.contestantId);
            }
            await set(ref(db, `leagues/${leagueId}/rideOrDies`), rod);
        }
    }, [user, leagueId, draftState]);

    const submitPassport = useCallback(async (answers) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        await set(ref(db, `leagues/${leagueId}/passports/${user.uid}`), {
            ...answers,
            sealedAt: Date.now(),
        });
    }, [user, leagueId]);

    const startSeason = useCallback(async () => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can start the season');
        await set(ref(db, `leagues/${leagueId}/status`), 'active');
    }, [user, leagueId, league]);

    const createEpisode = useCallback(async (episodeNum) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');

        // Lock social scores for the previous episode so they stop fluctuating
        const prevEpNum = episodeNum - 1;
        const prevEp = episodes?.[prevEpNum];
        if (prevEp?.scored && !prevEp?.lockedSocial) {
            const memberUids = Object.keys(leagueMembers || {});
            const peData = postEpisode?.[prevEpNum] || {};
            const socialScores = computeSocialScores(prevEp, peData, memberUids);
            await set(ref(db, `leagues/${leagueId}/episodes/${prevEpNum}/lockedSocial`), socialScores);
        }

        const isPostMerge = !!tribeSwaps?.merge;
        const propBets = generatePropBets(episodeNum, 5, isPostMerge);
        const sideBets = generateSideBets(episodeNum, 3);
        await set(ref(db, `leagues/${leagueId}/episodes/${episodeNum}`), {
            status: 'open',
            createdAt: Date.now(),
            propBets,
            sideBets,
            picks: {},
            predictions: {},
        });
        await set(ref(db, `leagues/${leagueId}/currentEpisode`), episodeNum);
    }, [user, leagueId, tribeSwaps, episodes, leagueMembers, postEpisode]);

    const updatePropBets = useCallback(async (episodeNum, propBets) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can edit prop bets');
        await set(ref(db, `leagues/${leagueId}/episodes/${episodeNum}/propBets`), propBets);
    }, [user, leagueId, league]);

    const submitPicks = useCallback(async (episodeNum, contestantIds) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        const myRoDs = rideOrDies[user.uid] || [];
        const blocked = contestantIds.filter(cid => myRoDs.includes(cid));
        if (blocked.length > 0) throw new Error('You cannot weekly-pick your own ride or dies');
        await set(ref(db, `leagues/${leagueId}/episodes/${episodeNum}/picks/${user.uid}`), contestantIds);
    }, [user, leagueId, rideOrDies]);

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

    const submitSideBets = useCallback(async (episodeNum, bets) => {
        if (!user || !leagueId) throw new Error('Not connected');
        const path = `leagues/${leagueId}/episodes/${episodeNum}/playerSideBets/${user.uid}`;
        if (db) {
            await set(ref(db, path), bets);
        } else {
            setEpisodes(prev => ({
                ...prev,
                [episodeNum]: {
                    ...prev[episodeNum],
                    playerSideBets: {
                        ...(prev[episodeNum]?.playerSideBets || {}),
                        [user.uid]: bets,
                    },
                },
            }));
        }
    }, [user, leagueId]);

    const scoreEpisodeAction = useCallback(async (episodeNum, scoringData) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can score episodes');

        const { gameEvents, propBetResults, eliminatedThisEp, eliminationMethod, sideBetResults } = scoringData;

        const updates = {
            [`leagues/${leagueId}/episodes/${episodeNum}/gameEvents`]: gameEvents,
            [`leagues/${leagueId}/episodes/${episodeNum}/propBetResults`]: propBetResults || {},
            [`leagues/${leagueId}/episodes/${episodeNum}/sideBetResults`]: sideBetResults || {},
            [`leagues/${leagueId}/episodes/${episodeNum}/eliminatedThisEp`]: eliminatedThisEp || [],
            [`leagues/${leagueId}/episodes/${episodeNum}/eliminationMethod`]: eliminationMethod || 'voted_out',
            [`leagues/${leagueId}/episodes/${episodeNum}/scored`]: true,
            [`leagues/${leagueId}/episodes/${episodeNum}/scoredAt`]: Date.now(),
            [`leagues/${leagueId}/episodes/${episodeNum}/status`]: 'scored',
        };

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

    const lightTorch = useCallback(async (episodeNum) => {
        if (!user || !leagueId) return;

        // Validate picks are complete before locking
        const ep = episodes?.[episodeNum];
        const playerPicks = ep?.picks?.[user.uid] || [];
        const elimSet = new Set(eliminated || []);
        const remainingCount = ALL_CASTAWAYS.filter(c => !elimSet.has(c.id)).length;
        const maxPicks = Math.min(5, Math.floor(remainingCount / 2));
        if (playerPicks.length < maxPicks) {
            throw new Error(`You need ${maxPicks} picks before lighting your torch (currently ${playerPicks.length})`);
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

    // --- Post-episode actions ---

    const submitPlayerOfEpisodeVote = useCallback(async (episodeNum, rankings) => {
        if (!user || !leagueId) throw new Error('Not connected');
        const path = `leagues/${leagueId}/postEpisode/${episodeNum}/playerOfEpisode/${user.uid}`;
        if (db) {
            await set(ref(db, path), rankings);
        } else {
            setPostEpisode(prev => ({
                ...prev,
                [episodeNum]: {
                    ...(prev[episodeNum] || {}),
                    playerOfEpisode: {
                        ...(prev[episodeNum]?.playerOfEpisode || {}),
                        [user.uid]: rankings,
                    },
                },
            }));
        }
    }, [user, leagueId]);

    const submitImpactRating = useCallback(async (episodeNum, rating) => {
        if (!user || !leagueId) throw new Error('Not connected');
        const path = `leagues/${leagueId}/postEpisode/${episodeNum}/impactRating/${user.uid}`;
        if (db) {
            await set(ref(db, path), rating);
        } else {
            setPostEpisode(prev => ({
                ...prev,
                [episodeNum]: {
                    ...(prev[episodeNum] || {}),
                    impactRating: {
                        ...(prev[episodeNum]?.impactRating || {}),
                        [user.uid]: rating,
                    },
                },
            }));
        }
    }, [user, leagueId]);

    // --- Phase 9: Tribe management, merge passport, auction, finale ---

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
            const importSnap = await get(ref(db, `seasons/s50/autoImport/e${episodeNum}`));
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

    const startAuction = useCallback(async (items) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can start the auction');

        const memberUids = Object.keys(leagueMembers);
        const baseBudget = 100;
        const budgets = {};

        // Compute standings-based budget bonuses (everyone except 1st gets a bonus)
        const { standings } = computeStandings(episodes, rideOrDies, memberUids, bingo, postEpisode, []);
        const n = standings.length;

        memberUids.forEach(uid => {
            if (n <= 1) {
                budgets[uid] = { base: baseBudget, bonus: 0, total: baseBudget };
                return;
            }
            const rank = standings.findIndex(s => s.uid === uid);
            // 1st place (rank 0): no bonus. Others: linear scale up to 50% for last place.
            const bonusPct = rank === 0 ? 0 : (rank / (n - 1)) * 0.5;
            const bonus = Math.round(baseBudget * bonusPct);
            budgets[uid] = { base: baseBudget, bonus, total: baseBudget + bonus };
        });

        await set(ref(db, `leagues/${leagueId}/auction`), {
            status: 'active',
            items: items.map((item, i) => ({
                id: `auc_${i}`, ...item,
                revealed: false, winner: null, winningBid: null, skipped: false,
            })),
            currentItemIndex: 0,
            budgets,
            bids: {},
            startedAt: Date.now(),
        });
    }, [user, leagueId, league, leagueMembers, episodes, rideOrDies, bingo, postEpisode]);

    const placeBid = useCallback(async (itemId, amount) => {
        if (!user || !leagueId) throw new Error('Not connected');
        const path = `leagues/${leagueId}/auction/bids/${itemId}/${user.uid}`;
        if (db) {
            await set(ref(db, path), { amount, at: Date.now() });
        } else {
            setAuction(prev => prev ? {
                ...prev,
                bids: {
                    ...(prev.bids || {}),
                    [itemId]: {
                        ...(prev.bids?.[itemId] || {}),
                        [user.uid]: { amount, at: Date.now() },
                    },
                },
            } : prev);
        }
    }, [user, leagueId]);

    const closeAuctionItem = useCallback(async (itemId, winnerUid, winningBid) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can close auction items');

        const snap = await get(ref(db, `leagues/${leagueId}/auction`));
        const auctionData = snap.val();
        if (!auctionData) throw new Error('No auction running');

        const items = (auctionData.items || []).map(item =>
            item.id === itemId ? { ...item, winner: winnerUid, winningBid } : item
        );

        // Deduct from winner's budget
        const budgets = {};
        for (const [uid, b] of Object.entries(auctionData.budgets || {})) {
            const prev = typeof b === 'object' ? { ...b } : { base: b, bonus: 0, total: b };
            if (uid === winnerUid && winningBid) {
                prev.total = (prev.total || 0) - winningBid;
            }
            budgets[uid] = prev;
        }

        await set(ref(db, `leagues/${leagueId}/auction/items`), items);
        await set(ref(db, `leagues/${leagueId}/auction/budgets`), budgets);

        // Don't auto-advance yet -- host reveals the cloche first
    }, [user, leagueId, league]);

    const revealAuctionItem = useCallback(async (itemId) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can reveal items');

        const snap = await get(ref(db, `leagues/${leagueId}/auction`));
        const auctionData = snap.val();
        if (!auctionData) throw new Error('No auction running');

        const items = (auctionData.items || []).map(item =>
            item.id === itemId ? { ...item, revealed: true } : item
        );

        // Find next un-sold/un-skipped item to advance to
        const currentIdx = items.findIndex(i => i.id === itemId);
        let nextIndex = -1;
        for (let i = currentIdx + 1; i < items.length; i++) {
            if (!items[i].winner && !items[i].skipped) { nextIndex = i; break; }
        }

        await set(ref(db, `leagues/${leagueId}/auction/items`), items);

        if (nextIndex >= 0) {
            await set(ref(db, `leagues/${leagueId}/auction/currentItemIndex`), nextIndex);
        } else {
            const perkEp = currentEpisode || 1;
            await set(ref(db, `leagues/${leagueId}/auction/status`), 'complete');
            await set(ref(db, `leagues/${leagueId}/auction/perkEpisode`), perkEp);
        }
    }, [user, leagueId, league, currentEpisode]);

    const skipAuctionItem = useCallback(async (itemId) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can skip items');

        const snap = await get(ref(db, `leagues/${leagueId}/auction`));
        const auctionData = snap.val();
        if (!auctionData) throw new Error('No auction running');

        const items = (auctionData.items || []).map(item =>
            item.id === itemId ? { ...item, skipped: true, revealed: true } : item
        );

        const currentIdx = items.findIndex(i => i.id === itemId);
        let nextIndex = -1;
        for (let i = currentIdx + 1; i < items.length; i++) {
            if (!items[i].winner && !items[i].skipped) { nextIndex = i; break; }
        }

        await set(ref(db, `leagues/${leagueId}/auction/items`), items);

        if (nextIndex >= 0) {
            await set(ref(db, `leagues/${leagueId}/auction/currentItemIndex`), nextIndex);
        } else {
            const perkEp = currentEpisode || 1;
            await set(ref(db, `leagues/${leagueId}/auction/status`), 'complete');
            await set(ref(db, `leagues/${leagueId}/auction/perkEpisode`), perkEp);
        }
    }, [user, leagueId, league, currentEpisode]);

    const startFinale = useCallback(async () => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can start the finale');
        await set(ref(db, `leagues/${leagueId}/finaleData`), {
            status: 'active',
            startedAt: Date.now(),
            passportReveals: {},
            reunionAwards: {},
            champion: null,
        });
    }, [user, leagueId, league]);

    const revealPassport = useCallback(async (uid) => {
        if (!db || !user || !leagueId) throw new Error('Not connected');
        if (league?.createdBy !== user.uid) throw new Error('Only the host can reveal passports');
        const passport = passports?.[uid];
        if (!passport) return;
        await set(ref(db, `leagues/${leagueId}/finaleData/passportReveals/${uid}`), {
            ...passport,
            revealedAt: Date.now(),
        });
    }, [user, leagueId, league, passports]);

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

            const importRef = ref(db, `seasons/s50/autoImport/e${epNum}`);
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
                const sideBets = ep.sideBets || [];
                let propBetResults = ep.autoResolvedPropBets || {};
                let sideBetResults = ep.autoResolvedSideBets || {};

                if (Object.keys(propBetResults).length === 0 && propBets.length > 0 && propBets[0].resolveType) {
                    propBetResults = resolveBets(importData, propBets);
                }
                if (Object.keys(sideBetResults).length === 0 && sideBets.length > 0 && sideBets[0].resolveType) {
                    sideBetResults = resolveBets(importData, sideBets);
                }

                const eliminatedThisEp = eliminatedIds;

                scoreEpisodeAction(epNum, {
                    gameEvents,
                    propBetResults,
                    sideBetResults,
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

    const enterLeague = useCallback(async (targetLeagueId) => {
        if (!db || !user) return;
        await set(ref(db, `users/${user.uid}/currentLeague`), targetLeagueId);
    }, [user]);

    const sendMagicLink = (email) => {
        if (!auth) throw new Error('Firebase not configured. Add .env from .env.example');
        window.localStorage.setItem('emailForSignIn', email);
        return sendSignInLinkToEmail(auth, email, actionCodeSettings);
    };

    const logout = () => auth && signOut(auth);

    const value = {
        user, authLoading,
        league, leagueId, leagueMembers, leagueLoading,
        draftState, rideOrDies, passports, mergePassports,
        currentEpisode, episodeData, myEpisode, myEpisodeData, episodes, eliminated, safeEliminated,
        watchStatus, bingo, postEpisode,
        tribeSwaps, isMerged, currentTribes, auction, finaleData,
        lightTorch, markWatched, advanceEpisode, saveBingoMarks, hasWatched, isWatching, hasLockedPicks,
        syncStatus, onboardingComplete, userLeagues,
        createLeague, joinLeague, leaveLeague, switchLeague, updateLeagueName, completeOnboarding,
        startDraft, makeDraftPick, submitPassport, startSeason,
        createEpisode, updatePropBets, submitPicks, submitPredictions,
        submitSnapVote, submitSideBets, scoreEpisodeAction,
        submitPlayerOfEpisodeVote, submitImpactRating,
        executeTribeSwap, moveTribeSwap, deleteTribeSwap, fixElimination, rescoreEpisode,
        executeMerge, submitMergePassport,
        startAuction, placeBid, closeAuctionItem, revealAuctionItem, skipAuctionItem,
        startFinale, revealPassport, revealMergePassport, submitReunionVote, crownChampion,
        getSeasonImportData, enterLeague,
        sendMagicLink, logout,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
