import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, signOut } from 'firebase/auth';
import { ref, onValue, set, push } from 'firebase/database';
import { auth, db } from './firebase';

const AppContext = createContext(null);

export function useApp() {
    return useContext(AppContext);
}

const DEFAULT_GAME_STATE = {
    players: ['Player 1', 'Player 2', 'Player 3', 'Player 4'],
    draft: {
        started: false,
        completed: false,
        currentPick: 0,
        picks: {},
    },
    bingo: {
        cards: {},
    },
    scores: {
        events: [],
    },
    eliminated: [],
};

const actionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true,
};

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [gameState, setGameState] = useState(DEFAULT_GAME_STATE);
    const [gameId, setGameId] = useState(null);
    const [syncStatus, setSyncStatus] = useState('offline');

    // Auth listener
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthLoading(false);
        });
        return unsub;
    }, []);

    // Handle magic link sign-in on page load
    useEffect(() => {
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = window.localStorage.getItem('emailForSignIn');
            if (!email) {
                email = window.prompt('Please enter your email to confirm sign-in:');
            }
            if (email) {
                signInWithEmailLink(auth, email, window.location.href)
                    .then(() => {
                        window.localStorage.removeItem('emailForSignIn');
                        // Clean up URL
                        window.history.replaceState(null, '', window.location.origin);
                    })
                    .catch((err) => console.error('Magic link sign-in error:', err));
            }
        }
    }, []);

    // Realtime DB sync
    useEffect(() => {
        if (!user || !gameId) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional loading state before async subscription
        setSyncStatus('syncing');
        const gameRef = ref(db, `games/${gameId}`);
        const unsub = onValue(gameRef, (snapshot) => {
            const data = snapshot.val();
            if (data) setGameState(data);
            setSyncStatus('online');
        }, () => setSyncStatus('offline'));
        return () => unsub();
    }, [user, gameId]);

    const saveGame = async (newState) => {
        setGameState(newState);
        if (gameId && user) {
            setSyncStatus('syncing');
            try {
                await set(ref(db, `games/${gameId}`), newState);
                setSyncStatus('online');
            } catch { setSyncStatus('offline'); }
        }
    };

    const createGame = async (playerNames) => {
        const state = { ...DEFAULT_GAME_STATE, players: playerNames };
        if (user) {
            const newRef = push(ref(db, 'games'));
            const id = newRef.key;
            await set(newRef, state);
            setGameId(id);
            await set(ref(db, `users/${user.uid}/games/${id}`), { created: Date.now() });
            return id;
        } else {
            setGameState(state);
            setGameId('local');
            return 'local';
        }
    };

    const joinGame = (id) => setGameId(id);

    // Magic link auth
    const sendMagicLink = (email) => {
        window.localStorage.setItem('emailForSignIn', email);
        return sendSignInLinkToEmail(auth, email, actionCodeSettings);
    };

    const logout = () => signOut(auth);

    const value = {
        user, authLoading, gameState, gameId, syncStatus,
        saveGame, createGame, joinGame, sendMagicLink, logout,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
