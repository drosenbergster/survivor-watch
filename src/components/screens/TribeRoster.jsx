import { useState } from 'react';
import { useApp } from '../../AppContext';
import { SEASON_LABEL } from '../../data';
import { FijianCard, FijianSectionHeader, Icon } from '../fijian';

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

export default function TribeRoster() {
    const { league, leagueMembers, user } = useApp();

    if (!league) return null;

    const hostUid = league.createdBy;
    const members = Object.entries(leagueMembers || {});
    const sortedMembers = [...members].sort(([uidA, a], [uidB, b]) => {
        if (uidA === hostUid) return -1;
        if (uidB === hostUid) return 1;
        return (a.joinedAt || 0) - (b.joinedAt || 0);
    });

    const inviteUrl = window.location.origin;

    return (
        <div className="space-y-5">
            <FijianSectionHeader title="The Tribe" />

            <FijianCard>
                <div className="px-4 py-3 border-b border-ochre/20 flex items-center justify-between min-w-0">
                    <span className="text-xs text-sand-warm/60 uppercase tracking-widest font-bold">
                        Watching {SEASON_LABEL}
                    </span>
                    <span className="text-ochre/60 text-xs font-bold shrink-0">
                        {members.length} {members.length === 1 ? 'player' : 'players'}
                    </span>
                </div>
                <div>
                    {sortedMembers.map(([uid, member]) => {
                        const isHost = uid === hostUid;
                        const isYou = uid === user?.uid;
                        return (
                            <div key={uid} className="flex items-center gap-3 px-4 py-3 border-b border-ochre/10 last:border-b-0 min-w-0">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                    isHost ? 'bg-fire-400/20 text-fire-400' : 'bg-ochre/10 text-ochre'
                                }`}>
                                    {member.displayName?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sand-warm text-sm font-medium truncate block">
                                        {member.displayName}
                                        {isYou && <span className="text-clay text-xs ml-1.5">(you)</span>}
                                    </span>
                                </div>
                                {isHost && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-fire-400 bg-fire-400/10 px-2 py-0.5 rounded shrink-0">
                                        Host
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </FijianCard>

            <FijianCard className="p-4">
                <span className="text-xs text-sand-warm/60 uppercase tracking-widest font-bold block mb-2">
                    Bring Someone In
                </span>
                <p className="text-xs text-bleached-sand/60 font-sans mb-3">
                    Send them the link. They sign in, pick a name, and they are on the scoreboard.
                </p>
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-ochre/70 truncate min-w-0 flex-1">{inviteUrl}</span>
                    <CopyButton text={inviteUrl} label="Copy invite link" />
                    <ShareButton
                        text={`Come watch ${SEASON_LABEL} with us: ${inviteUrl}`}
                        title="Survivor Watch Party"
                    />
                </div>
            </FijianCard>
        </div>
    );
}
