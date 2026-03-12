import { useState } from 'react';
import { useApp } from '../../AppContext';
import { FijianCard, Icon } from '../fijian';
import { PROP_BET_POOL } from '../../data';

function PropBetEditor({ propBets, onSave }) {
    const [bets, setBets] = useState(propBets);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    const swapBet = (index) => {
        const usedTexts = new Set(bets.map(b => b.text));
        const available = PROP_BET_POOL.filter(b => !usedTexts.has(b.text));
        if (available.length === 0) return;
        setBets(prev => {
            const updated = [...prev];
            const replacement = available[Math.floor(Math.random() * available.length)];
            updated[index] = { ...updated[index], text: replacement.text, resolveType: replacement.resolveType, resolveParams: replacement.resolveParams };
            return updated;
        });
        setDirty(true);
    };

    const handleSave = async () => {
        setSaving(true);
        await onSave(bets);
        setDirty(false);
        setSaving(false);
    };

    return (
        <div className="space-y-2 mt-3">
            <p className="text-ochre text-[10px] font-bold uppercase tracking-widest">Tree Mail (tap to swap)</p>
            {bets.map((bet, i) => (
                <button
                    key={bet.id}
                    type="button"
                    onClick={() => swapBet(i)}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded bg-stone-800/50 text-sand-warm text-xs hover:bg-stone-700/50 transition-all cursor-pointer"
                >
                    <Icon name="swap_horiz" className="text-ochre/70 text-sm shrink-0" />
                    <span className="flex-1">{bet.text}</span>
                </button>
            ))}
            {dirty && (
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-lg border border-ochre/40 text-ochre hover:bg-ochre/10 transition-all cursor-pointer disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save Tree Mail Changes'}
                </button>
            )}
        </div>
    );
}

export default function AdminEpisodeCard() {
    const {
        user, league, myEpisode, myEpisodeData,
        updatePropBets,
    } = useApp();
    const [error, setError] = useState('');

    const isAdmin = league?.createdBy === user?.uid;
    if (!isAdmin) return null;

    if (!myEpisodeData || myEpisodeData.scored) return null;

    const handleSavePropBets = async (bets) => {
        try {
            await updatePropBets(myEpisode, bets);
        } catch (err) { setError(err.message); }
    };

    return (
        <FijianCard className="p-4 border-fire-400/20">
            <div className="flex items-center gap-2 mb-3">
                <Icon name="shield_person" className="text-fire-400" />
                <span className="text-fire-400 text-xs font-bold uppercase tracking-widest">Host Controls</span>
                <span className="ml-auto text-ochre/70 text-xs">Episode {myEpisode}</span>
            </div>
            <p className="text-sand-warm/70 text-xs font-sans">
                Episode is open. Players lock their own picks when they light their torch.
            </p>
            {myEpisodeData?.propBets && (
                <PropBetEditor propBets={myEpisodeData.propBets} onSave={handleSavePropBets} />
            )}
            {error && <p className="text-amber text-xs mt-2" role="alert">{error}</p>}
        </FijianCard>
    );
}
