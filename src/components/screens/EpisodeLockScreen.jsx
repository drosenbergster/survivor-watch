import { useApp } from '../../AppContext';
import { ALL_CASTAWAYS } from '../../data';
import { FijianCard, FijianSectionHeader, Icon } from '../fijian';

function PicksList({ picks }) {
    if (!picks || picks.length === 0) {
        return <p className="text-earth/40 text-xs font-serif italic">No picks submitted.</p>;
    }
    return (
        <div className="flex flex-wrap gap-1.5">
            {picks.map(id => {
                const c = ALL_CASTAWAYS.find(x => x.id === id);
                return (
                    <span key={id} className="bg-ochre/10 text-sand-warm text-xs px-2.5 py-1 rounded">
                        {c?.name || id}
                    </span>
                );
            })}
        </div>
    );
}

function PredictionsSummary({ predictions, propBets }) {
    if (!predictions) {
        return <p className="text-earth/40 text-xs font-serif italic">No predictions submitted.</p>;
    }

    const elimTarget = predictions.elimination
        ? ALL_CASTAWAYS.find(c => c.id === predictions.elimination)
        : null;

    return (
        <div className="space-y-3">
            {elimTarget && (
                <div className="flex items-center gap-2">
                    <Icon name="skull" className="text-fire-400 text-sm" />
                    <span className="text-earth text-xs">Going home:</span>
                    <span className="text-sand-warm text-sm font-medium">{elimTarget.name}</span>
                </div>
            )}
            {predictions.boldPrediction && (
                <div className="flex items-start gap-2">
                    <Icon name="bolt" className="text-torch text-sm mt-0.5" />
                    <div>
                        <span className="text-earth text-xs block">Bold prediction:</span>
                        <span className="text-sand-warm text-sm italic">&ldquo;{predictions.boldPrediction}&rdquo;</span>
                    </div>
                </div>
            )}
            {propBets && propBets.length > 0 && predictions.propBets && (
                <div>
                    <span className="text-earth text-xs block mb-1.5">Prop bets:</span>
                    <div className="space-y-1">
                        {propBets.map(bet => {
                            const answer = predictions.propBets[bet.id];
                            return (
                                <div key={bet.id} className="flex items-center gap-2 text-xs">
                                    <span className={answer ? 'text-jungle-400' : 'text-earth/40'}>
                                        {answer ? 'YES' : 'NO'}
                                    </span>
                                    <span className="text-stone-400">{bet.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function ScarcityInfo({ episodeData, user }) {
    const allPicks = episodeData?.picks || {};
    const contestantCount = {};

    for (const [, picks] of Object.entries(allPicks)) {
        for (const id of (picks || [])) {
            contestantCount[id] = (contestantCount[id] || 0) + 1;
        }
    }

    const myPicks = allPicks[user?.uid] || [];
    const exclusive = myPicks.filter(id => contestantCount[id] === 1);
    const shared = myPicks.filter(id => contestantCount[id] > 1);

    if (myPicks.length === 0) return null;

    return (
        <FijianCard className="p-4">
            <FijianSectionHeader title="Scarcity Report" />
            {exclusive.length > 0 && (
                <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Icon name="star" className="text-torch text-sm" />
                        <span className="text-torch text-xs font-bold">1.5x Bonus Eligible</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {exclusive.map(id => {
                            const c = ALL_CASTAWAYS.find(x => x.id === id);
                            return (
                                <span key={id} className="bg-torch/10 text-torch text-xs px-2 py-0.5 rounded border border-torch/20">
                                    {c?.name || id}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
            {shared.length > 0 && (
                <div>
                    <span className="text-earth text-xs">Shared picks (1x):</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {shared.map(id => {
                            const c = ALL_CASTAWAYS.find(x => x.id === id);
                            return (
                                <span key={id} className="text-stone-400 text-xs bg-stone-800/50 px-2 py-0.5 rounded">
                                    {c?.name || id} ({contestantCount[id]} owners)
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </FijianCard>
    );
}

export default function EpisodeLockScreen() {
    const { user, currentEpisode, episodeData } = useApp();

    const myPicks = episodeData?.picks?.[user?.uid] || [];
    const myPredictions = episodeData?.predictions?.[user?.uid];

    return (
        <div className="space-y-5">
            <FijianCard className="p-5 text-center border-fire-400/30 shadow-fire">
                <div className="text-3xl mb-2 animate-flicker" aria-hidden>🔥</div>
                <p className="font-display text-2xl tracking-wider text-fire-400">Torch Lit &mdash; Ep {currentEpisode}</p>
                <p className="text-earth text-sm mt-1 font-serif italic">
                    Your picks are locked in. Enjoy the show!
                </p>
            </FijianCard>

            <FijianCard className="p-4">
                <FijianSectionHeader title="Your Picks" />
                <PicksList picks={myPicks} />
            </FijianCard>

            <FijianCard className="p-4">
                <FijianSectionHeader title="Your Predictions" />
                <PredictionsSummary predictions={myPredictions} propBets={episodeData?.propBets} />
            </FijianCard>

            <ScarcityInfo episodeData={episodeData} user={user} />
        </div>
    );
}
