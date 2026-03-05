import { useState } from 'react';
import { useApp, getSnakeOrder } from '../../AppContext';
import { TRIBES, ALL_CASTAWAYS } from '../../data';
import {
    FijianCard,
    FijianSectionHeader,
    FijianPrimaryButton,
    Icon,
} from '../fijian';

function ContestantButton({ castaway, drafted, draftedByName, isPickable, onPick }) {
    return (
        <button
            type="button"
            onClick={() => isPickable && onPick(castaway.id)}
            disabled={!isPickable}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-all
                ${drafted ? 'opacity-40 cursor-default' : ''}
                ${isPickable ? 'hover:bg-ochre/10 hover:border-ochre/30 cursor-pointer' : 'cursor-default'}
                ${!drafted ? 'text-stone-200' : 'text-stone-400'}
                border border-transparent
            `}
        >
            <div className="flex-1 min-w-0">
                <span className={`font-medium ${drafted ? 'line-through' : ''}`}>{castaway.name}</span>
                <span className="text-xs text-stone-400 ml-2">{castaway.short}</span>
            </div>
            {drafted && draftedByName && (
                <span className="text-xs text-ochre/60 truncate ml-2">{draftedByName}</span>
            )}
        </button>
    );
}

function DraftStatus({ draftState, leagueMembers, user }) {
    const snake = getSnakeOrder(draftState.order);
    const currentUid = snake[draftState.currentPick];
    const currentName = leagueMembers[currentUid]?.displayName || 'Unknown';
    const isYourTurn = currentUid === user?.uid;
    const totalPicks = snake.length;
    const currentRound = Math.floor(draftState.currentPick / draftState.order.length) + 1;

    return (
        <FijianCard className={`p-5 text-center ${isYourTurn ? 'shadow-fire border-fire-400/30' : ''}`}>
            {isYourTurn ? (
                <>
                    <div className="text-3xl mb-2" aria-hidden>🔥</div>
                    <div className="font-display text-2xl tracking-wider text-fire-400">
                        Your Pick!
                    </div>
                    <p className="text-sand-warm/70 text-sm mt-1">Choose your Ride or Die</p>
                </>
            ) : (
                <>
                    <div className="font-display text-2xl tracking-wider text-sand-warm">
                        {currentName}
                    </div>
                    <p className="text-sand-warm/70 text-sm mt-1">is on the clock</p>
                </>
            )}
            <p className="text-ochre/60 text-xs mt-3">
                Round {currentRound} of 2 &middot; Pick {draftState.currentPick + 1} of {totalPicks}
            </p>
        </FijianCard>
    );
}

function DraftOrder({ draftState, leagueMembers, user }) {
    const snake = getSnakeOrder(draftState.order);

    return (
        <FijianCard>
            <div className="px-4 py-3 border-b border-ochre/20">
                <FijianSectionHeader title="Draft Order" className="!mb-0" />
            </div>
            <div className="p-3 space-y-1">
                {snake.map((uid, idx) => {
                    const member = leagueMembers[uid];
                    const isPast = idx < draftState.currentPick;
                    const isCurrent = idx === draftState.currentPick;
                    const pick = draftState.picks?.[idx];
                    const castaway = pick ? ALL_CASTAWAYS.find(c => c.id === pick.contestantId) : null;

                    return (
                        <div
                            key={idx}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs ${
                                isCurrent ? 'bg-fire-400/10 text-fire-400 font-bold' :
                                isPast ? 'text-stone-400' : 'text-clay'
                            }`}
                        >
                            <span className="w-5 text-right text-ochre/40">{idx + 1}.</span>
                            <span className="flex-1">
                                {member?.displayName || uid}
                                {uid === user?.uid && <span className="text-clay ml-1">(you)</span>}
                            </span>
                            {isPast && castaway && (
                                <span className="text-ochre/70">{castaway.name}</span>
                            )}
                            {isCurrent && <span className="text-fire-400 animate-pulse">◀</span>}
                        </div>
                    );
                })}
            </div>
        </FijianCard>
    );
}

function DraftComplete({ rideOrDies, leagueMembers, user }) {
    return (
        <div className="space-y-6">
            <FijianCard className="p-5 text-center border-jungle-400/30">
                <div className="text-3xl mb-2" aria-hidden>🤝</div>
                <p className="font-display text-2xl tracking-wider text-jungle-400">
                    Ride or Dies Locked!
                </p>
                <p className="text-clay text-sm mt-2 font-serif italic">
                    These bonds last all season. May your allies go far.
                </p>
            </FijianCard>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(rideOrDies).map(([uid, contestantIds]) => {
                    const member = leagueMembers[uid];
                    const isYou = uid === user?.uid;
                    return (
                        <FijianCard key={uid} className="p-4">
                            <h4 className="text-sand-warm text-sm font-bold mb-3">
                                {member?.displayName || uid}
                                {isYou && <span className="text-clay text-xs ml-1.5">(you)</span>}
                            </h4>
                            <ul className="space-y-2">
                                {(contestantIds || []).map((cId) => {
                                    const c = ALL_CASTAWAYS.find(x => x.id === cId);
                                    return (
                                        <li key={cId} className="flex items-center gap-2 bg-stone-800/50 px-3 py-2 rounded-lg">
                                            <Icon name="handshake" className="text-ochre text-sm" />
                                            <span className="text-sand-warm text-sm">{c?.name || cId}</span>
                                            <span className="text-stone-400 text-xs ml-auto">{c?.short}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </FijianCard>
                    );
                })}
            </div>
        </div>
    );
}

export default function RideOrDieDraft() {
    const { draftState, rideOrDies, leagueMembers, user, makeDraftPick } = useApp();
    const [picking, setPicking] = useState(false);
    const [error, setError] = useState('');

    if (!draftState) return null;

    const isComplete = draftState.status === 'complete';

    if (isComplete) {
        return (
            <div className="space-y-6 max-w-2xl mx-auto">
                <header className="text-center">
                    <h2 className="font-display text-4xl tracking-wider text-sand-warm drop-shadow-text">Sevu</h2>
                    <p className="text-sand-warm/70 text-sm mt-1">Ride or Die Draft</p>
                </header>
                <DraftComplete rideOrDies={rideOrDies} leagueMembers={leagueMembers} user={user} />
            </div>
        );
    }

    const snake = getSnakeOrder(draftState.order);
    const currentUid = snake[draftState.currentPick];
    const isYourTurn = currentUid === user?.uid;

    const draftedIds = new Set((draftState.picks || []).map(p => p.contestantId));
    const draftedByMap = {};
    for (const pick of (draftState.picks || [])) {
        draftedByMap[pick.contestantId] = leagueMembers[pick.uid]?.displayName || pick.uid;
    }

    const handlePick = async (contestantId) => {
        if (picking || !isYourTurn) return;
        setPicking(true);
        setError('');
        try {
            await makeDraftPick(contestantId);
        } catch (err) {
            setError(err.message);
        }
        setPicking(false);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <header className="text-center">
                <h2 className="font-display text-4xl tracking-wider text-sand-warm drop-shadow-text">Sevu</h2>
                <p className="text-sand-warm/70 text-sm mt-1">Ride or Die Draft</p>
            </header>

            <DraftStatus draftState={draftState} leagueMembers={leagueMembers} user={user} />

            <p className="text-sand-warm/60 text-xs font-sans leading-relaxed text-center max-w-sm mx-auto">
                Draft 2 contestants as your Ride or Dies. These are exclusive &mdash; no one else in
                your league can have the same picks. They earn you passive points all season just for
                surviving (+2/ep), plus bonuses for reaching the finale (+15) or winning (+30).
            </p>

            {error && <p className="text-amber text-xs text-center" role="alert">{error}</p>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {Object.entries(TRIBES).map(([tribeKey, tribe]) => (
                    <FijianCard key={tribeKey}>
                        <div
                            className="px-4 py-3 text-center font-display text-xl tracking-widest border-b-2"
                            style={{
                                borderColor: `var(--color-${tribeKey})`,
                                color: `var(--color-${tribeKey})`,
                                background: `linear-gradient(135deg, color-mix(in srgb, var(--color-${tribeKey}) 15%, transparent), transparent)`,
                            }}
                        >
                            {tribe.name}
                        </div>
                        <div className="p-2 space-y-0.5">
                            {tribe.members.map((c) => (
                                <ContestantButton
                                    key={c.id}
                                    castaway={c}
                                    drafted={draftedIds.has(c.id)}
                                    draftedByName={draftedByMap[c.id]}
                                    isPickable={isYourTurn && !draftedIds.has(c.id) && !picking}
                                    onPick={handlePick}
                                />
                            ))}
                        </div>
                    </FijianCard>
                ))}
            </div>

            <DraftOrder draftState={draftState} leagueMembers={leagueMembers} user={user} />
        </div>
    );
}
