import { useState } from 'react';
import { useApp } from '../../AppContext';
import { FijianCard, FijianPrimaryButton, Icon } from '../fijian';
import { PROP_BET_POOL } from '../../data';

function PropBetEditor({ propBets, onSave }) {
    const [bets, setBets] = useState(propBets);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);

    const swapBet = (index) => {
        const usedTexts = new Set(bets.map(b => b.text));
        const available = PROP_BET_POOL.filter(t => !usedTexts.has(t));
        if (available.length === 0) return;
        setBets(prev => {
            const updated = [...prev];
            const replacement = available[Math.floor(Math.random() * available.length)];
            updated[index] = { ...updated[index], text: replacement };
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
            <p className="text-ochre text-[10px] font-bold uppercase tracking-widest">Prop Bets (tap to swap)</p>
            {bets.map((bet, i) => (
                <button
                    key={bet.id}
                    type="button"
                    onClick={() => swapBet(i)}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded bg-stone-800/50 text-sand-warm text-xs hover:bg-stone-700/50 transition-all cursor-pointer"
                >
                    <Icon name="swap_horiz" className="text-ochre/50 text-sm shrink-0" />
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
                    {saving ? 'Saving...' : 'Save Prop Bet Changes'}
                </button>
            )}
        </div>
    );
}

export default function AdminEpisodeCard() {
    const {
        user, league, currentEpisode, episodeData,
        createEpisode, updatePropBets, lockEpisode,
    } = useApp();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isAdmin = league?.createdBy === user?.uid;
    if (!isAdmin) return null;

    const episodeStatus = episodeData?.status;
    const nextEpisodeNum = currentEpisode
        ? (episodeStatus === 'live' || episodeStatus === 'post_episode' || episodeStatus === 'scored')
            ? currentEpisode + 1
            : currentEpisode
        : 1;
    const needsNewEpisode = !currentEpisode || !episodeData || episodeStatus === 'live' || episodeStatus === 'scored';

    const handleCreate = async () => {
        setLoading(true);
        setError('');
        try {
            const num = currentEpisode ? currentEpisode + 1 : 1;
            await createEpisode(num);
        } catch (err) { setError(err.message); }
        setLoading(false);
    };

    const handleLock = async () => {
        setLoading(true);
        setError('');
        try {
            await lockEpisode(currentEpisode);
        } catch (err) { setError(err.message); }
        setLoading(false);
    };

    const handleSavePropBets = async (bets) => {
        await updatePropBets(currentEpisode, bets);
    };

    // No current episode or episode is finished → offer to create next
    if (needsNewEpisode) {
        return (
            <FijianCard className="p-4 border-fire-400/20">
                <div className="flex items-center gap-2 mb-3">
                    <Icon name="shield_person" className="text-fire-400" />
                    <span className="text-fire-400 text-xs font-bold uppercase tracking-widest">Host Controls</span>
                </div>
                <FijianPrimaryButton onClick={handleCreate} disabled={loading}>
                    {loading ? 'Creating...' : `Create Episode ${nextEpisodeNum}`}
                </FijianPrimaryButton>
                {error && <p className="text-amber text-xs mt-2" role="alert">{error}</p>}
            </FijianCard>
        );
    }

    // Episode is in pre_episode → show lock button + prop bet editor
    if (episodeStatus === 'pre_episode') {
        return (
            <FijianCard className="p-4 border-fire-400/20">
                <div className="flex items-center gap-2 mb-3">
                    <Icon name="shield_person" className="text-fire-400" />
                    <span className="text-fire-400 text-xs font-bold uppercase tracking-widest">Host Controls</span>
                    <span className="ml-auto text-ochre/50 text-xs">Episode {currentEpisode}</span>
                </div>
                <FijianPrimaryButton onClick={handleLock} disabled={loading}>
                    {loading ? 'Locking...' : 'Episode Starting — Lock Picks'}
                </FijianPrimaryButton>
                <p className="text-earth/50 text-xs text-center mt-2 font-serif italic">
                    This locks all picks and predictions for everyone.
                </p>
                {episodeData?.propBets && (
                    <PropBetEditor propBets={episodeData.propBets} onSave={handleSavePropBets} />
                )}
                {error && <p className="text-amber text-xs mt-2" role="alert">{error}</p>}
            </FijianCard>
        );
    }

    return null;
}
