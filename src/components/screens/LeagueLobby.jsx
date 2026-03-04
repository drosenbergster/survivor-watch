import { useState } from 'react';
import { useApp } from '../../AppContext';
import {
    FijianCard,
    FijianSectionHeader,
    FijianPrimaryButton,
    Icon,
} from '../fijian';

function CopyCodeButton({ code }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
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
            className="ml-2 p-1.5 rounded border border-ochre/30 text-ochre hover:bg-ochre/10 transition-all cursor-pointer"
            aria-label="Copy join code"
        >
            <Icon name={copied ? 'check' : 'content_copy'} className="text-sm" />
        </button>
    );
}

function MemberRow({ member, uid, currentUid }) {
    const isAdmin = member.role === 'admin';
    const isYou = uid === currentUid;

    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-ochre/10 last:border-b-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                isAdmin ? 'bg-fire-400/20 text-fire-400' : 'bg-ochre/10 text-ochre'
            }`}>
                {member.displayName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
                <span className="text-sand-warm text-sm font-medium truncate block">
                    {member.displayName}
                    {isYou && <span className="text-clay text-xs ml-1.5">(you)</span>}
                </span>
            </div>
            {isAdmin && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-fire-400 bg-fire-400/10 px-2 py-0.5 rounded">
                    Host
                </span>
            )}
        </div>
    );
}

export default function LeagueLobby() {
    const { league, leagueMembers, leaveLeague, startDraft, user } = useApp();
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState('');

    if (!league) return null;

    const members = Object.entries(leagueMembers || {});
    const memberCount = members.length;
    const isAdmin = league.createdBy === user?.uid;
    const canStartDraft = isAdmin && memberCount >= 2;
    const sortedMembers = [...members].sort(([, a], [, b]) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (b.role === 'admin' && a.role !== 'admin') return 1;
        return (a.joinedAt || 0) - (b.joinedAt || 0);
    });

    const handleLeave = async () => {
        setLeaving(true);
        try {
            await leaveLeague();
        } catch {
            setLeaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-md mx-auto">
            {/* League header */}
            <header className="text-center">
                <h2 className="font-display text-4xl tracking-wider text-sand-warm drop-shadow-text">
                    {league.name}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="text-clay text-xs uppercase tracking-widest">Join Code</span>
                    <span className="font-display text-lg tracking-[0.2em] text-ochre bg-stone-dark/60 px-3 py-1 rounded border border-ochre/20">
                        {league.joinCode}
                    </span>
                    <CopyCodeButton code={league.joinCode} />
                </div>
                <p className="text-sand-warm/70 text-xs mt-2">
                    Share this code so others can join your league
                </p>
            </header>

            {/* Members list */}
            <FijianCard>
                <div className="px-4 py-3 border-b border-ochre/20 flex items-center justify-between">
                    <FijianSectionHeader title="The Tribe" className="!mb-0" />
                    <span className="text-ochre/60 text-xs font-bold">
                        {memberCount}/6
                    </span>
                </div>
                <div>
                    {sortedMembers.map(([uid, member]) => (
                        <MemberRow key={uid} member={member} uid={uid} currentUid={user?.uid} />
                    ))}
                </div>
                {memberCount < 4 && (
                    <div className="px-4 py-3 text-center">
                        <p className="text-sand-warm/60 text-xs font-serif italic">
                            Waiting for more castaways to arrive... ({4 - memberCount} more needed)
                        </p>
                    </div>
                )}
            </FijianCard>

            {/* Start Draft / Status */}
            {canStartDraft ? (
                <FijianCard className="p-5 text-center">
                    <p className="text-sand-warm text-sm mb-4">
                        Everyone&apos;s here? Time to pick your Ride or Dies.
                    </p>
                    <FijianPrimaryButton
                        onClick={async () => {
                            setStarting(true);
                            setError('');
                            try { await startDraft(); }
                            catch (err) { setError(err.message); }
                            setStarting(false);
                        }}
                        disabled={starting}
                    >
                        {starting ? 'Starting...' : 'Start Ride or Die Draft'}
                    </FijianPrimaryButton>
                    {error && <p className="text-amber text-xs mt-3" role="alert">{error}</p>}
                </FijianCard>
            ) : (
                <FijianCard className="p-4 text-center border-ochre/10">
                    <div className="flex items-center justify-center gap-2 text-clay">
                        <div className="w-2 h-2 rounded-full bg-torch animate-pulse-sync" aria-hidden />
                        <span className="text-xs uppercase tracking-widest font-bold">Lobby</span>
                    </div>
                    <p className="text-sand-warm/60 text-xs mt-2 font-serif italic">
                        {isAdmin
                            ? 'Waiting for more players to join before drafting...'
                            : 'The game begins once the host starts the Ride or Die draft.'}
                    </p>
                </FijianCard>
            )}

            {/* Leave league */}
            <div className="text-center pt-2">
                {confirmLeave ? (
                    <div className="space-y-3">
                        <p className="text-clay text-xs">Leave this league?</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                type="button"
                                onClick={handleLeave}
                                disabled={leaving}
                                className="px-4 py-2 text-xs rounded-lg border border-fire-400/40 text-fire-400 hover:bg-fire-400/10 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {leaving ? 'Leaving...' : 'Yes, Leave'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmLeave(false)}
                                className="px-4 py-2 text-xs rounded-lg border border-ochre/30 text-sand-warm/70 hover:text-sand-warm transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setConfirmLeave(true)}
                        className="text-sand-warm/60 text-xs hover:text-fire-400 transition-all cursor-pointer"
                    >
                        Leave League
                    </button>
                )}
            </div>
        </div>
    );
}
