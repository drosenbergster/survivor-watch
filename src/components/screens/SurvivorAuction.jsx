import { useState, useEffect } from 'react';
import { useApp } from '../../AppContext';
import { AUCTION_PERKS, AUCTION_DUDS } from '../../data';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon } from '../fijian';

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function AuctionSetup() {
    const { startAuction } = useApp();
    const [selected, setSelected] = useState(AUCTION_PERKS.slice(0, 4).map(p => p.perkType));
    const [submitting, setSubmitting] = useState(false);

    const toggle = (perkType) => {
        setSelected(prev =>
            prev.includes(perkType) ? prev.filter(p => p !== perkType) : [...prev, perkType]
        );
    };

    const handleStart = async () => {
        setSubmitting(true);
        const realItems = AUCTION_PERKS.filter(p => selected.includes(p.perkType));
        const allItems = shuffle([...realItems, ...AUCTION_DUDS]);
        await startAuction(allItems);
        setSubmitting(false);
    };

    const totalItems = selected.length + AUCTION_DUDS.length;

    return (
        <div className="space-y-6">
            <FijianCard className="p-5 text-center border-ochre/20">
                <span className="text-4xl">🪙</span>
                <p className="font-display text-2xl tracking-wider text-ochre mt-2">Survivor Auction</p>
                <p className="text-sand-warm/50 text-xs font-sans mt-1">
                    Select which perks to include. Two mystery items are added automatically.
                </p>
            </FijianCard>

            <FijianCard className="p-4 space-y-3">
                <FijianSectionHeader title="Choose Perks" />
                <div className="space-y-2">
                    {AUCTION_PERKS.map((perk) => {
                        const isSelected = selected.includes(perk.perkType);
                        return (
                            <button
                                key={perk.perkType}
                                onClick={() => toggle(perk.perkType)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                                    isSelected
                                        ? 'bg-ochre/15 border border-ochre/30'
                                        : 'bg-stone-800/40 border border-transparent hover:border-stone-700'
                                }`}
                            >
                                <span className="text-xl">{perk.emoji}</span>
                                <div className="flex-1">
                                    <p className="text-sand-warm text-sm font-sans font-bold">{perk.name}</p>
                                    <p className="text-sand-warm/60 text-xs font-sans">{perk.description}</p>
                                </div>
                                {isSelected && <Icon name="check_circle" className="text-ochre" />}
                            </button>
                        );
                    })}
                </div>

                <div className="bg-stone-800/40 rounded-lg p-3 border border-dashed border-stone-700">
                    <p className="text-sand-warm/60 text-xs font-sans">
                        <span className="text-ochre font-bold">+ 2 mystery duds</span> will be shuffled in.
                        Nobody knows what&apos;s under each cloche until it&apos;s bought!
                    </p>
                </div>
            </FijianCard>

            {selected.length > 0 && (
                <FijianPrimaryButton onClick={handleStart} disabled={submitting}>
                    {submitting ? 'Shuffling...' : `Start Auction (${totalItems} items)`}
                </FijianPrimaryButton>
            )}
        </div>
    );
}

function ClocheReveal({ item, index, total, isRevealed }) {
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (isRevealed) {
            setAnimating(true);
            const t = setTimeout(() => setAnimating(false), 800);
            return () => clearTimeout(t);
        }
    }, [isRevealed]);

    if (!isRevealed) {
        return (
            <div className="flex flex-col items-center py-6">
                <div className="relative">
                    <span className="text-7xl block animate-float-up" style={{ animationDuration: '3s' }}>🍽️</span>
                    <span className="absolute -top-2 -right-2 bg-ochre text-stone-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {index + 1}
                    </span>
                </div>
                <p className="font-display text-lg tracking-wider text-sand-warm/40 mt-3">
                    Item {index + 1} of {total}
                </p>
                <p className="text-sand-warm/30 text-xs font-sans mt-1 italic">
                    What&apos;s under the cloche?
                </p>
            </div>
        );
    }

    const isDud = item.perkType?.startsWith('dud_');

    return (
        <div className={`flex flex-col items-center py-6 transition-all duration-500 ${animating ? 'scale-110' : 'scale-100'}`}>
            <span className={`text-6xl block ${animating ? 'animate-bounce-in' : ''}`}>{item.emoji}</span>
            <p className={`font-display text-xl tracking-wider mt-3 ${isDud ? 'text-sand-warm/50' : 'text-ochre'}`}>
                {item.name}
            </p>
            <p className={`text-xs font-sans mt-1 text-center max-w-xs ${isDud ? 'text-sand-warm/40 italic' : 'text-sand-warm/60'}`}>
                {item.description}
            </p>
            {isDud && (
                <span className="mt-2 px-3 py-1 rounded-full bg-stone-800 text-sand-warm/40 text-[10px] font-bold uppercase tracking-wider">
                    Dud
                </span>
            )}
        </div>
    );
}

const BID_INCREMENT = 5;
const STARTING_BID = 5;

function BidPanel({ item, budget, isHost }) {
    const { closeAuctionItem, skipAuctionItem, leagueMembers, auction, placeBid, user } = useApp();
    const [closing, setClosing] = useState(false);
    const [justBid, setJustBid] = useState(false);
    const [customAmount, setCustomAmount] = useState('');
    const [showCustom, setShowCustom] = useState(false);

    const allBids = auction?.bids?.[item.id] || {};
    const sortedBids = Object.entries(allBids)
        .map(([uid, bid]) => ({ uid, ...bid }))
        .sort((a, b) => b.amount - a.amount);
    const highBid = sortedBids[0];
    const currentPrice = highBid?.amount || 0;
    const nextPrice = currentPrice === 0 ? STARTING_BID : currentPrice + BID_INCREMENT;
    const minCustom = currentPrice + 1;
    const isHighBidder = highBid?.uid === user?.uid;
    const canAfford = nextPrice <= budget;
    const canBidIncrement = !isHighBidder && canAfford && !item.winner;
    const isSold = !!item.winner;
    const canBidAtAll = !isHighBidder && budget > currentPrice && !isSold;

    const doBid = (amount) => {
        placeBid(item.id, amount);
        setJustBid(true);
        setCustomAmount('');
        setShowCustom(false);
        setTimeout(() => setJustBid(false), 400);
    };

    const handleQuickBid = () => {
        if (canBidIncrement) doBid(nextPrice);
    };

    const handleCustomBid = () => {
        const val = parseInt(customAmount, 10);
        if (val > currentPrice && val <= budget && !isHighBidder) {
            doBid(val);
        }
    };

    const customVal = parseInt(customAmount, 10);
    const customValid = customVal > currentPrice && customVal <= budget;

    const handleClose = async () => {
        if (!highBid) return;
        setClosing(true);
        await closeAuctionItem(item.id, highBid.uid, highBid.amount);
        setClosing(false);
    };

    const handleSkip = async () => {
        setClosing(true);
        await skipAuctionItem(item.id);
        setClosing(false);
    };

    if (isSold) {
        return (
            <FijianCard className="p-4 text-center border-jungle-400/20">
                <div className="flex items-center justify-center gap-2">
                    <Icon name="gavel" className="text-jungle-400" />
                    <span className="text-jungle-400 text-sm font-bold">SOLD!</span>
                </div>
                <p className="text-sand-warm/60 text-xs font-sans mt-1">
                    Won by <span className="text-ochre font-bold">{leagueMembers?.[item.winner]?.displayName}</span> for{' '}
                    <span className="text-ochre">{item.winningBid}</span> coins
                </p>
            </FijianCard>
        );
    }

    return (
        <FijianCard className="p-4 space-y-4">
            {/* Current price display */}
            <div className="text-center">
                {currentPrice > 0 ? (
                    <>
                        <p className="text-sand-warm/40 text-[10px] font-bold uppercase tracking-wider">Current Bid</p>
                        <p className="font-display text-4xl text-ochre tracking-wider mt-1">
                            {currentPrice} <span className="text-2xl">🪙</span>
                        </p>
                        <p className={`text-sm font-sans mt-1 ${isHighBidder ? 'text-jungle-400 font-bold' : 'text-sand-warm/60'}`}>
                            {isHighBidder ? "You're winning!" : `👑 ${leagueMembers?.[highBid.uid]?.displayName}`}
                        </p>
                    </>
                ) : (
                    <>
                        <p className="text-sand-warm/40 text-[10px] font-bold uppercase tracking-wider">Opening Bid</p>
                        <p className="font-display text-3xl text-sand-warm/30 tracking-wider mt-1">
                            {STARTING_BID} <span className="text-2xl">🪙</span>
                        </p>
                        <p className="text-sand-warm/40 text-xs font-sans mt-1">No bids yet</p>
                    </>
                )}
            </div>

            {/* Bid history */}
            {sortedBids.length > 1 && (
                <div className="space-y-0.5">
                    {sortedBids.slice(1, 4).map((bid) => (
                        <div key={bid.uid} className="flex items-center gap-2 text-xs font-sans px-2 py-0.5 text-sand-warm/40">
                            <span className="flex-1">{leagueMembers?.[bid.uid]?.displayName}</span>
                            <span>{bid.amount} 🪙</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Bidding controls */}
            {canBidAtAll && (
                <div className="space-y-2">
                    {/* Quick +5 button */}
                    {canBidIncrement && (
                        <button
                            onClick={handleQuickBid}
                            className={`w-full py-4 rounded-xl text-lg font-display tracking-wider transition-all active:scale-95 ${
                                justBid
                                    ? 'bg-jungle-400 text-white scale-95'
                                    : 'bg-ochre/20 text-ochre hover:bg-ochre/30 border-2 border-ochre/30 hover:border-ochre/50'
                            }`}
                            aria-label={`Bid ${nextPrice} coins`}
                        >
                            BID {nextPrice} 🪙
                        </button>
                    )}

                    {/* Custom bid toggle + input */}
                    {!showCustom ? (
                        <button
                            onClick={() => setShowCustom(true)}
                            className="w-full text-center text-sand-warm/40 text-xs font-sans py-1 hover:text-sand-warm/60 transition-colors"
                        >
                            or raise higher...
                        </button>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                min={minCustom}
                                max={budget}
                                value={customAmount}
                                onChange={e => setCustomAmount(e.target.value)}
                                placeholder={`${minCustom}–${budget}`}
                                className="flex-1 bg-stone-800/60 border border-earth/30 rounded-lg px-3 py-2.5 text-ochre font-bold text-sm text-center outline-none focus:border-ochre/50"
                                aria-label="Custom bid amount"
                            />
                            <button
                                onClick={handleCustomBid}
                                disabled={!customValid}
                                className="px-5 py-2.5 rounded-lg text-sm font-sans font-bold bg-ochre/20 text-ochre hover:bg-ochre/30 transition-all disabled:opacity-30"
                            >
                                BID
                            </button>
                            <button
                                onClick={() => { setShowCustom(false); setCustomAmount(''); }}
                                className="px-2 py-2.5 text-sand-warm/40 hover:text-sand-warm/60"
                                aria-label="Cancel custom bid"
                            >
                                <Icon name="close" className="text-sm" />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {isHighBidder && !isSold && (
                <div className="text-center py-2">
                    <p className="text-jungle-400 text-sm font-bold font-sans">You have the high bid!</p>
                    <p className="text-sand-warm/40 text-xs font-sans mt-0.5">Waiting to see if anyone outbids you...</p>
                </div>
            )}

            {!canBidAtAll && !isHighBidder && !isSold && (
                <p className="text-sand-warm/40 text-xs font-sans text-center italic py-2">
                    Not enough coins to outbid (need &gt;{currentPrice}, have {budget})
                </p>
            )}

            {/* Host controls */}
            {isHost && (
                <div className="flex gap-2 pt-2 border-t border-stone-700/50">
                    {highBid && (
                        <button
                            onClick={handleClose}
                            disabled={closing}
                            className="flex-1 px-3 py-3 rounded-xl text-sm font-sans font-bold bg-fire-400/20 text-fire-400 hover:bg-fire-400/30 transition-all disabled:opacity-30"
                        >
                            {closing ? '...' : `🔨 SOLD to ${leagueMembers?.[highBid.uid]?.displayName}!`}
                        </button>
                    )}
                    <button
                        onClick={handleSkip}
                        disabled={closing}
                        className="px-3 py-3 rounded-xl text-sm font-sans bg-stone-800/60 text-sand-warm/50 hover:text-sand-warm/70 transition-all"
                    >
                        No Sale
                    </button>
                </div>
            )}
        </FijianCard>
    );
}

function ProgressBar({ items, currentIndex }) {
    return (
        <div className="flex gap-1.5 justify-center">
            {items.map((item, i) => {
                let color = 'bg-stone-700';
                if (item.winner) color = 'bg-jungle-400';
                else if (item.skipped) color = 'bg-stone-600';
                else if (i === currentIndex) color = 'bg-ochre animate-pulse';
                return (
                    <div
                        key={item.id}
                        className={`w-3 h-3 rounded-full transition-all ${color}`}
                        title={item.winner ? `Won by ${item.winner}` : i === currentIndex ? 'Current' : 'Upcoming'}
                    />
                );
            })}
        </div>
    );
}

function AuctionComplete({ items, leagueMembers, perkEpisode }) {
    const realWins = items.filter(i => i.winner && !i.perkType?.startsWith('dud_'));
    const dudWins = items.filter(i => i.winner && i.perkType?.startsWith('dud_'));

    return (
        <div className="space-y-4">
            <FijianCard className="p-5 text-center border-ochre/20">
                <span className="text-4xl">🎉</span>
                <p className="font-display text-2xl tracking-wider text-ochre mt-2">Auction Complete</p>
                <p className="text-sand-warm/50 text-xs font-sans mt-1">
                    Perks activate for <span className="text-ochre font-bold">Episode {perkEpisode || '?'}</span> only.
                </p>
            </FijianCard>

            {realWins.length > 0 && (
                <FijianCard className="p-4 space-y-2">
                    <p className="text-sand-warm/40 text-[10px] font-bold uppercase tracking-wider">Perks Awarded</p>
                    {realWins.map(item => (
                        <div key={item.id} className="flex items-center gap-3 px-2 py-2 rounded-lg bg-jungle-400/5">
                            <span className="text-xl">{item.emoji}</span>
                            <div className="flex-1">
                                <p className="text-sand-warm text-sm font-sans font-bold">{item.name}</p>
                                <p className="text-sand-warm/50 text-xs font-sans">{item.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-ochre text-xs font-bold">
                                    {leagueMembers?.[item.winner]?.displayName}
                                </p>
                                <p className="text-sand-warm/40 text-[10px]">{item.winningBid} 🪙</p>
                            </div>
                        </div>
                    ))}
                </FijianCard>
            )}

            {dudWins.length > 0 && (
                <FijianCard className="p-4 space-y-2 opacity-70">
                    <p className="text-sand-warm/40 text-[10px] font-bold uppercase tracking-wider">Duds</p>
                    {dudWins.map(item => (
                        <div key={item.id} className="flex items-center gap-3 px-2 py-2">
                            <span className="text-xl">{item.emoji}</span>
                            <div className="flex-1">
                                <p className="text-sand-warm/50 text-sm font-sans">{item.name}</p>
                            </div>
                            <p className="text-sand-warm/40 text-xs">
                                {leagueMembers?.[item.winner]?.displayName} — {item.winningBid} 🪙
                            </p>
                        </div>
                    ))}
                </FijianCard>
            )}
        </div>
    );
}

function BudgetDisplay({ budget, budgetBase, budgetBonus }) {
    return (
        <FijianCard className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <span className="text-lg">🪙</span>
                <div>
                    <p className="text-sand-warm text-sm font-sans font-bold">{budget} coins</p>
                    {budgetBonus > 0 && (
                        <p className="text-jungle-400 text-[10px] font-sans">
                            {budgetBase} base + {budgetBonus} catch-up bonus
                        </p>
                    )}
                </div>
            </div>
            <span className="text-sand-warm/40 text-xs font-sans">Your Budget</span>
        </FijianCard>
    );
}

export default function SurvivorAuction() {
    const { user, league, auction, leagueMembers, revealAuctionItem } = useApp();
    const isHost = league?.createdBy === user?.uid;
    const isComplete = auction?.status === 'complete';

    if (!auction && !isHost) {
        return (
            <div className="space-y-4">
                <FijianCard className="p-6 text-center">
                    <span className="text-5xl block">🍽️</span>
                    <p className="font-display text-xl tracking-wider text-sand-warm/60 mt-3">
                        Survivor Auction
                    </p>
                    <p className="text-sand-warm/40 text-sm font-sans mt-2">
                        The host hasn&apos;t started the auction yet. When they do, this tab will light up.
                    </p>
                </FijianCard>
            </div>
        );
    }

    if (!auction && isHost) {
        return <AuctionSetup />;
    }

    if (isComplete) {
        return <AuctionComplete items={auction.items || []} leagueMembers={leagueMembers} perkEpisode={auction.perkEpisode} />;
    }

    const items = auction.items || [];
    const currentIndex = auction.currentItemIndex ?? 0;
    const currentItem = items[currentIndex];
    const myBudget = auction.budgets?.[user?.uid]?.total ?? auction.budgets?.[user?.uid] ?? 0;
    const budgetBase = auction.budgets?.[user?.uid]?.base ?? myBudget;
    const budgetBonus = auction.budgets?.[user?.uid]?.bonus ?? 0;

    const isCurrentRevealed = currentItem?.revealed;

    const handleReveal = async () => {
        if (currentItem && !isCurrentRevealed) {
            await revealAuctionItem(currentItem.id);
        }
    };

    return (
        <div className="space-y-4">
            <FijianCard className="p-4 text-center border-ochre/20">
                <p className="font-display text-xl tracking-wider text-ochre">Survivor Auction</p>
                <ProgressBar items={items} currentIndex={currentIndex} />
            </FijianCard>

            <BudgetDisplay budget={myBudget} budgetBase={budgetBase} budgetBonus={budgetBonus} />

            {currentItem && (
                <FijianCard className="p-4 border-ochre/10 overflow-hidden">
                    <ClocheReveal
                        item={currentItem}
                        index={currentIndex}
                        total={items.length}
                        isRevealed={isCurrentRevealed}
                    />

                    {!isCurrentRevealed && isHost && (
                        <div className="text-center pt-2">
                            <p className="text-sand-warm/40 text-xs font-sans mb-3">
                                Bidding is open! Lift the cloche after someone wins.
                            </p>
                        </div>
                    )}
                </FijianCard>
            )}

            {currentItem && !currentItem.winner && !currentItem.skipped && (
                <BidPanel
                    item={currentItem}
                    budget={myBudget}
                    isHost={isHost}
                />
            )}

            {currentItem?.winner && !isCurrentRevealed && isHost && (
                <div className="text-center">
                    <FijianPrimaryButton onClick={handleReveal}>
                        🍽️ Lift the Cloche!
                    </FijianPrimaryButton>
                </div>
            )}

            {currentItem?.winner && isCurrentRevealed && (
                <FijianCard className="p-4 text-center border-jungle-400/20">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Icon name="gavel" className="text-jungle-400" />
                        <span className="text-jungle-400 font-bold text-sm">SOLD!</span>
                    </div>
                    <p className="text-sand-warm/60 text-xs font-sans">
                        <span className="text-ochre font-bold">{leagueMembers?.[currentItem.winner]?.displayName}</span>{' '}
                        won <span className="text-ochre">{currentItem.name}</span> for {currentItem.winningBid} 🪙
                    </p>
                    {currentItem.perkType?.startsWith('dud_') && (
                        <p className="text-sand-warm/40 text-xs font-sans italic mt-1">😂 It&apos;s a dud!</p>
                    )}
                </FijianCard>
            )}

            {items.filter(i => i.winner && i.revealed).length > 0 && (
                <FijianCard className="p-3 space-y-1">
                    <p className="text-sand-warm/40 text-[10px] font-bold uppercase tracking-wider mb-1">Previous Items</p>
                    {items.filter(i => (i.winner || i.skipped) && i.revealed).map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-xs font-sans">
                            <span>{item.emoji}</span>
                            <span className={`flex-1 ${item.perkType?.startsWith('dud_') ? 'text-sand-warm/40' : 'text-sand-warm/70'}`}>
                                {item.name}
                            </span>
                            {item.winner ? (
                                <span className="text-sand-warm/50">
                                    {leagueMembers?.[item.winner]?.displayName} — {item.winningBid} 🪙
                                </span>
                            ) : (
                                <span className="text-sand-warm/30 italic">No sale</span>
                            )}
                        </div>
                    ))}
                </FijianCard>
            )}
        </div>
    );
}
