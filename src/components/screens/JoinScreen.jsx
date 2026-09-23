import { useState } from 'react';
import { useApp } from '../../AppContext';
import { SEASON_LABEL, SEASON_TAGLINE } from '../../data';
import {
    MasiBackground,
    FijianHero,
    FijianCard,
    FijianInput,
    FijianPrimaryButton,
    Icon,
} from '../fijian';

export default function JoinScreen() {
    const { joinWatchParty } = useApp();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await joinWatchParty(name);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-stone-dark font-sans text-stone-200 min-h-screen antialiased">
            <MasiBackground>
                <div className="flex flex-col flex-1 items-center justify-center px-8 z-20 pb-16 pt-12">
                    <FijianHero subtitle="WATCH PARTY HQ" />

                    <div className="w-full max-w-[360px]">
                        <FijianCard className="p-6">
                            <div className="text-center mb-6">
                                <h2 className="font-display text-2xl tracking-wider text-sand-warm">
                                    Join the Watch Party
                                </h2>
                                <p className="text-clay text-xs mt-2 uppercase tracking-widest font-bold">
                                    {SEASON_LABEL} · {SEASON_TAGLINE}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <FijianInput
                                    label="Your Display Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="What should the tribe call you?"
                                    required
                                    maxLength={20}
                                    autoFocus
                                    aria-label="Your display name"
                                />
                                <FijianPrimaryButton type="submit" disabled={loading || !name.trim()}>
                                    {loading ? 'One moment...' : 'Take Your Seat'}
                                </FijianPrimaryButton>
                            </form>

                            {error && (
                                <p className="text-amber text-xs text-center mt-4" role="alert">
                                    {error}
                                </p>
                            )}

                            <div className="mt-8 text-center">
                                <p className="text-clay font-serif italic text-sm leading-relaxed">
                                    One scoreboard. If you&apos;re watching, you&apos;re already on it.
                                </p>
                                <div className="flex justify-center mt-4 opacity-30">
                                    <Icon name="groups" className="text-ochre text-2xl" />
                                </div>
                            </div>
                        </FijianCard>
                    </div>
                </div>
            </MasiBackground>
        </div>
    );
}
