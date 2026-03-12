import { useState } from 'react';
import { FijianCard, FijianPrimaryButton, Icon } from '../fijian';
import { useApp } from '../../AppContext';

export default function LightYourTorch({ episodeNum }) {
    const { lightTorch, markWatched, isWatching, hasWatched } = useApp();
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState('');

    const watching = isWatching(episodeNum);
    const watched = hasWatched(episodeNum);

    if (watched) {
        return (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-sans">
                <Icon name="check_circle" className="text-lg" />
                Episode {episodeNum} watched
            </div>
        );
    }

    if (watching) {
        return (
            <FijianCard className="p-4 text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl animate-pulse">🔥</span>
                    <span className="font-display text-xl text-ochre tracking-wider">Watching Episode {episodeNum}</span>
                    <span className="text-3xl animate-pulse">🔥</span>
                </div>
                <p className="text-sand-warm/70 text-xs font-sans">
                    Picks and predictions locked. Mark bingo squares below as things happen!
                </p>
                {!confirming ? (
                    <button
                        onClick={() => setConfirming(true)}
                        className="mt-1 px-4 py-2 text-sm rounded-lg border border-stone-700 text-sand-warm/60 hover:text-sand-warm hover:border-ochre/40 transition-all cursor-pointer"
                    >
                        Done Watching Episode {episodeNum}
                    </button>
                ) : (
                    <div className="space-y-2">
                        <p className="text-sand-warm/60 text-xs">
                            Mark the episode as finished? Your bingo card will be locked in.
                        </p>
                        <div className="flex gap-2 justify-center">
                            <FijianPrimaryButton onClick={async () => {
                                setError('');
                                try { await markWatched(episodeNum); }
                                catch (err) { setError(err.message || 'Failed to mark watched'); }
                            }} className="text-xs px-4 py-1">
                                Yes, I&apos;m done
                            </FijianPrimaryButton>
                            <button
                                onClick={() => setConfirming(false)}
                                className="text-sand-warm/50 text-xs underline"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                {error && <p className="text-amber text-xs text-center" role="alert">{error}</p>}
            </FijianCard>
        );
    }

    return (
        <FijianCard className="p-6 text-center space-y-4">
            <div className="text-4xl">📺</div>
            <h3 className="font-display text-2xl text-sand-warm tracking-wider">Ready to Watch?</h3>
            <p className="text-sand-warm/60 text-sm font-sans max-w-xs mx-auto">
                Make sure you&apos;ve saved your picks and Tree Mail above.
                This locks everything in and activates your bingo card and tribal snap vote.
            </p>
            <FijianPrimaryButton onClick={async () => {
                setError('');
                try { await lightTorch(episodeNum); }
                catch (err) { setError(err.message || 'Failed to start'); }
            }}>
                <Icon name="local_fire_department" className="mr-1" />
                Light Your Torch
            </FijianPrimaryButton>
            {error && <p className="text-amber text-xs text-center" role="alert">{error}</p>}
        </FijianCard>
    );
}
