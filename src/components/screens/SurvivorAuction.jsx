import { useState, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

const DEFAULT_ITEMS = [
    { name: 'Double Bold', description: 'Double your bold prediction points next episode', emoji: '💡' },
    { name: 'Spy Glass', description: 'Peek at one opponent\'s hot takes before they\'re revealed', emoji: '🔍' },
    { name: 'Extra Pick', description: 'Pick 1 extra contestant next episode', emoji: '➕' },
    { name: 'Shield', description: 'Immunity from the Target mechanic for one week', emoji: '🛡️' },
    { name: 'Steal a Vote', description: 'Copy one opponent\'s best pick next episode', emoji: '🃏' },
    { name: 'Double Down', description: 'Double your snap vote points next tribal', emoji: '🔥' },
];

function AuctionSetup() {
    const { startAuction } = useApp();
    const [items, setItems] = useState(DEFAULT_ITEMS.slice(0, 4));
    const [submitting, setSubmitting] = useState(false);

    const handleStart = async () => {
        setSubmitting(true);
        await startAuction(items);
        setSubmitting(false);
    };

    return (
        <FijianCard className="p-4 space-y-4">
            <FijianSectionHeader title="Setup Auction" />
            <p className="text-earth text-xs font-serif italic">
                Select items for the auction. Last place gets 50% more budget.
            </p>
            <div className="space-y-2">
                {DEFAULT_ITEMS.map((item, i) => {
                    const selected = items.some(x => x.name === item.name);
                    return (
                        <button
                            key={i}
                            onClick={() => {
                                if (selected) setItems(prev => prev.filter(x => x.name !== item.name));
                                else setItems(prev => [...prev, item]);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                                selected ? 'bg-ochre/15 border border-ochre/30' : 'bg-stone-800/40 border border-transparent hover:border-stone-700'
                            }`}
                        >
                            <span className="text-xl">{item.emoji}</span>
                            <div className="flex-1">
                                <p className="text-sand-warm text-sm font-sans font-bold">{item.name}</p>
                                <p className="text-sand-warm/40 text-xs font-sans">{item.description}</p>
                            </div>
                            {selected && <Icon name="check_circle" className="text-ochre" />}
                        </button>
                    );
                })}
            </div>
            {items.length > 0 && (
                <FijianPrimaryButton onClick={handleStart} disabled={submitting}>
                    {submitting ? 'Starting...' : `Start Auction (${items.length} items)`}
                </FijianPrimaryButton>
            )}
        </FijianCard>
    );
}

function BidPanel({ item, budget, myBid, onBid, isHost }) {
    const { closeAuctionItem, leagueMembers, auction } = useApp();
    const [bidAmount, setBidAmount] = useState(myBid?.amount || 0);
    const [closing, setClosing] = useState(false);

    const allBids = auction?.bids?.[item.id] || {};
    const sortedBids = Object.entries(allBids)
        .map(([uid, bid]) => ({ uid, ...bid }))
        .sort((a, b) => b.amount - a.amount);

    const highBid = sortedBids[0];
    const isSold = !!item.winner;

    const handleBid = () => {
        if (bidAmount > 0 && bidAmount <= budget) {
            onBid(item.id, bidAmount);
        }
    };

    const handleClose = async () => {
        if (!highBid) return;
        setClosing(true);
        await closeAuctionItem(item.id, highBid.uid, highBid.amount);
        setClosing(false);
    };

    return (
        <FijianCard className={`p-4 space-y-3 ${isSold ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                    <p className="text-sand-warm text-sm font-sans font-bold">{item.name}</p>
                    <p className="text-sand-warm/40 text-xs font-sans">{item.description}</p>
                </div>
                {isSold && (
                    <span className="text-jungle-400 text-xs font-bold px-2 py-1 bg-jungle-400/10 rounded">
                        SOLD
                    </span>
                )}
            </div>

            {isSold ? (
                <p className="text-sand-warm/60 text-xs font-sans">
                    Won by <span className="text-ochre">{leagueMembers?.[item.winner]?.displayName}</span> for {item.winningBid} coins
                </p>
            ) : (
                <>
                    {sortedBids.length > 0 && (
                        <div className="space-y-1">
                            {sortedBids.slice(0, 3).map((bid, i) => (
                                <div key={bid.uid} className="flex items-center gap-2 text-xs font-sans">
                                    <span className={i === 0 ? 'text-ochre font-bold' : 'text-sand-warm/50'}>
                                        {leagueMembers?.[bid.uid]?.displayName}
                                    </span>
                                    <span className="text-sand-warm/30 ml-auto">{bid.amount} coins</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min={1}
                            max={budget}
                            value={bidAmount}
                            onChange={e => setBidAmount(Number(e.target.value))}
                            className="flex-1 accent-ochre"
                            aria-label="Bid amount slider"
                        />
                        <input
                            type="number"
                            min={1}
                            max={budget}
                            value={bidAmount}
                            onChange={e => {
                                const v = Math.max(1, Math.min(budget, Number(e.target.value) || 0));
                                setBidAmount(v);
                            }}
                            className="w-16 bg-stone-800/60 border border-earth/30 rounded-lg px-2 py-1 text-ochre font-bold text-sm text-center outline-none focus:border-ochre/50"
                            aria-label="Bid amount"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleBid}
                            disabled={bidAmount <= 0 || bidAmount > budget}
                            className="flex-1 px-3 py-2 rounded-lg text-sm font-sans font-bold bg-ochre/20 text-ochre hover:bg-ochre/30 transition-all disabled:opacity-30"
                        >
                            Bid {bidAmount} coins
                        </button>
                        {isHost && highBid && (
                            <button
                                onClick={handleClose}
                                disabled={closing}
                                className="px-3 py-2 rounded-lg text-sm font-sans bg-fire-400/20 text-fire-400 hover:bg-fire-400/30 transition-all"
                            >
                                {closing ? '...' : 'Sold!'}
                            </button>
                        )}
                    </div>
                </>
            )}
        </FijianCard>
    );
}

export default function SurvivorAuction() {
    const { user, league, auction, placeBid } = useApp();

    const isHost = league?.createdBy === user?.uid;

    if (!auction && !isHost) {
        return (
            <FijianCard className="p-5 text-center">
                <span className="text-3xl">🪙</span>
                <p className="text-sand-warm/50 text-sm font-sans mt-2">
                    The Survivor Auction hasn&apos;t started yet. The host will kick it off at merge.
                </p>
            </FijianCard>
        );
    }

    if (!auction && isHost) {
        return <AuctionSetup />;
    }

    const myBudget = auction?.budgets?.[user?.uid] || 0;
    const isComplete = auction?.status === 'complete';

    return (
        <div className="space-y-4">
            <FijianCard className="p-4 text-center border-ochre/20">
                <p className="font-display text-xl tracking-wider text-ochre">
                    {isComplete ? 'Auction Complete' : 'Survivor Auction'}
                </p>
                <p className="text-sand-warm/50 text-xs font-sans mt-1">
                    {isComplete ? 'All items have been sold!' : `Your budget: ${myBudget} coins`}
                </p>
            </FijianCard>

            {(auction?.items || []).map(item => (
                <BidPanel
                    key={item.id}
                    item={item}
                    budget={myBudget}
                    myBid={auction?.bids?.[item.id]?.[user?.uid]}
                    onBid={placeBid}
                    isHost={isHost}
                />
            ))}
        </div>
    );
}
