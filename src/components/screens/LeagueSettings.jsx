import { useState } from 'react';
import { useApp } from '../../AppContext';
import { FijianCard, FijianSectionHeader, FijianInput, FijianPrimaryButton, Icon } from '../fijian';

function CopyButton({ text, label }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* clipboard not available */ }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded border border-ochre/30 text-ochre text-xs hover:bg-ochre/10 transition-all cursor-pointer"
            aria-label={label}
        >
            <Icon name={copied ? 'check' : 'content_copy'} className="text-sm" />
        </button>
    );
}

function ShareButton({ text, title }) {
    const canShare = typeof navigator?.share === 'function';
    if (!canShare) return null;

    return (
        <button
            type="button"
            onClick={() => navigator.share({ title, text }).catch(() => {})}
            className="px-2.5 py-1.5 rounded border border-ochre/30 text-ochre text-xs hover:bg-ochre/10 transition-all cursor-pointer"
            aria-label="Share invite"
        >
            <Icon name="share" className="text-sm" />
        </button>
    );
}

export default function LeagueSettings() {
    const { league, leagueMembers, user, updateLeagueName, leaveLeague } = useApp();
    const [editingName, setEditingName] = useState(false);
    const [nameValue, setNameValue] = useState(league?.name || '');
    const [saving, setSaving] = useState(false);
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [error, setError] = useState('');

    if (!league) return null;

    const isHost = league.createdBy === user?.uid;
    const members = Object.entries(leagueMembers || {});
    const sortedMembers = [...members].sort(([, a], [, b]) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (b.role === 'admin' && a.role !== 'admin') return 1;
        return (a.joinedAt || 0) - (b.joinedAt || 0);
    });

    const joinCode = league.joinCode;
    const inviteUrl = `${window.location.origin}?join=${joinCode}`;

    const handleSaveName = async () => {
        if (!nameValue.trim()) return;
        setSaving(true);
        setError('');
        try {
            await updateLeagueName(nameValue.trim());
            setEditingName(false);
        } catch (err) {
            setError(err.message);
        }
        setSaving(false);
    };

    const handleLeave = async () => {
        setLeaving(true);
        try {
            await leaveLeague();
        } catch {
            setLeaving(false);
        }
    };

    return (
        <div className="space-y-5">
            <FijianSectionHeader title="League Settings" />

            {/* League Name */}
            <FijianCard className="p-4">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-sand-warm/60 uppercase tracking-widest font-bold">League Name</span>
                    {isHost && !editingName && (
                        <button
                            type="button"
                            onClick={() => { setNameValue(league.name); setEditingName(true); }}
                            className="text-ochre text-xs hover:underline cursor-pointer"
                        >
                            Edit
                        </button>
                    )}
                </div>
                {editingName ? (
                    <div className="flex gap-2 mt-1">
                        <FijianInput
                            value={nameValue}
                            onChange={(e) => setNameValue(e.target.value)}
                            maxLength={30}
                            className="flex-1"
                        />
                        <FijianPrimaryButton onClick={handleSaveName} disabled={saving || !nameValue.trim()}>
                            {saving ? '...' : 'Save'}
                        </FijianPrimaryButton>
                        <button
                            type="button"
                            onClick={() => setEditingName(false)}
                            className="px-3 rounded border border-stone-700 text-stone-400 text-xs cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <p className="text-sand-warm font-display text-xl tracking-wider">{league.name}</p>
                )}
                {error && <p className="text-amber text-xs mt-2" role="alert">{error}</p>}
            </FijianCard>

            {/* Join Code & Invite */}
            <FijianCard className="p-4">
                <span className="text-xs text-sand-warm/60 uppercase tracking-widest font-bold block mb-2">
                    Invite Code
                </span>
                <div className="flex items-center gap-2">
                    <span className="font-display text-2xl tracking-[0.3em] text-ochre bg-stone-dark/60 px-4 py-2 rounded border border-ochre/20">
                        {joinCode}
                    </span>
                    <CopyButton text={joinCode} label="Copy join code" />
                    <ShareButton
                        text={`Join my Survivor Watch Party league! Use code ${joinCode} or click: ${inviteUrl}`}
                        title={league.name}
                    />
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-sand-warm/60">Invite link:</span>
                    <span className="text-xs text-ochre/70 truncate flex-1">{inviteUrl}</span>
                    <CopyButton text={inviteUrl} label="Copy invite link" />
                </div>
            </FijianCard>

            {/* Members */}
            <FijianCard>
                <div className="px-4 py-3 border-b border-ochre/20 flex items-center justify-between">
                    <FijianSectionHeader title="Members" className="!mb-0" />
                    <span className="text-ochre/60 text-xs font-bold">{members.length}/6</span>
                </div>
                <div>
                    {sortedMembers.map(([uid, member]) => {
                        const isAdmin = member.role === 'admin';
                        const isYou = uid === user?.uid;
                        return (
                            <div key={uid} className="flex items-center gap-3 px-4 py-3 border-b border-ochre/10 last:border-b-0">
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
                    })}
                </div>
            </FijianCard>

            {/* Leave League */}
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
