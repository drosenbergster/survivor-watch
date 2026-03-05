import { useState } from 'react';
import { useApp } from '../../AppContext';
import {
    MasiBackground,
    FijianHero,
    FijianInput,
    FijianPrimaryButton,
    FijianCard,
    Icon,
} from '../fijian';

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard not available */
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="ml-2 px-2 py-1 rounded border border-ochre/30 text-ochre text-xs hover:bg-ochre/10 transition-all cursor-pointer"
            aria-label="Copy join code"
        >
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
}

function CreateSuccess({ joinCode }) {
    return (
        <div className="space-y-6 text-center">
            <div className="text-4xl" aria-hidden>🏝️</div>
            <h2 className="font-display text-2xl tracking-wider text-clay">League Created!</h2>
            <p className="text-clay font-serif italic text-sm leading-relaxed">
                Share this code with your crew to join the island.
            </p>
            <div className="flex items-center justify-center gap-2">
                <span className="font-display text-4xl tracking-[0.3em] text-sand-warm bg-stone-dark/60 px-6 py-3 rounded-lg border border-ochre/30">
                    {joinCode}
                </span>
                <CopyButton text={joinCode} />
            </div>
            <p className="text-sand-warm/70 text-xs">
                Waiting in the lobby for your tribe...
            </p>
        </div>
    );
}

export default function LeagueGate({ prefillCode }) {
    const { createLeague, joinLeague } = useApp();
    const [mode, setMode] = useState(prefillCode ? 'join' : 'create');
    const [leagueName, setLeagueName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [joinCode, setJoinCode] = useState(prefillCode || '');
    const [createdCode, setCreatedCode] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await createLeague(leagueName.trim(), displayName.trim());
            setCreatedCode(result.joinCode);
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleJoin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await joinLeague(joinCode.trim().toUpperCase(), displayName.trim());
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-stone-dark font-sans text-stone-200 min-h-screen antialiased">
            <MasiBackground>
                <div className="flex flex-col flex-1 items-center justify-center px-8 z-20 pb-16 pt-12">
                    <FijianHero subtitle="WATCH PARTY HQ" />

                    <div className="w-full max-w-[360px]">
                        {createdCode ? (
                            <CreateSuccess joinCode={createdCode} />
                        ) : (
                            <FijianCard className="p-6">
                                <div className="flex mb-6 border-b border-ochre/20">
                                    <button
                                        type="button"
                                        onClick={() => { setMode('create'); setError(''); }}
                                        className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                                            mode === 'create'
                                                ? 'text-ochre border-b-2 border-ochre'
                                                : 'text-clay hover:text-sand-warm'
                                        }`}
                                    >
                                        Create League
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setMode('join'); setError(''); }}
                                        className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                                            mode === 'join'
                                                ? 'text-ochre border-b-2 border-ochre'
                                                : 'text-clay hover:text-sand-warm'
                                        }`}
                                    >
                                        Join League
                                    </button>
                                </div>

                                {mode === 'create' ? (
                                    <form onSubmit={handleCreate} className="space-y-5">
                                        <FijianInput
                                            label="League Name"
                                            value={leagueName}
                                            onChange={(e) => setLeagueName(e.target.value)}
                                            placeholder="e.g. Tribal Council"
                                            required
                                            maxLength={30}
                                            aria-label="League name"
                                        />
                                        <FijianInput
                                            label="Your Display Name"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="What should the tribe call you?"
                                            required
                                            maxLength={20}
                                            aria-label="Your display name"
                                        />
                                        <FijianPrimaryButton type="submit" disabled={loading || !leagueName.trim() || !displayName.trim()}>
                                            {loading ? 'Creating...' : 'Create League'}
                                        </FijianPrimaryButton>
                                    </form>
                                ) : (
                                    <form onSubmit={handleJoin} className="space-y-5">
                                        <FijianInput
                                            label="Join Code"
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                            placeholder="e.g. BULA42"
                                            required
                                            maxLength={6}
                                            className="font-display tracking-[0.3em] text-center text-lg"
                                            aria-label="Join code"
                                        />
                                        <FijianInput
                                            label="Your Display Name"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="What should the tribe call you?"
                                            required
                                            maxLength={20}
                                            aria-label="Your display name"
                                        />
                                        <FijianPrimaryButton type="submit" disabled={loading || !joinCode.trim() || !displayName.trim()}>
                                            {loading ? 'Joining...' : 'Join League'}
                                        </FijianPrimaryButton>
                                    </form>
                                )}

                                {error && (
                                    <p className="text-amber text-xs text-center mt-4" role="alert">
                                        {error}
                                    </p>
                                )}

                                <div className="mt-8 text-center">
                                    <p className="text-clay font-serif italic text-sm leading-relaxed">
                                        {mode === 'create'
                                            ? '"Gather your alliance. The island awaits."'
                                            : '"Enter the code from your tribe leader."'}
                                    </p>
                                    <div className="flex justify-center mt-4 opacity-30">
                                        <Icon name="groups" className="text-ochre text-2xl" />
                                    </div>
                                </div>
                            </FijianCard>
                        )}
                    </div>
                </div>
            </MasiBackground>
        </div>
    );
}
