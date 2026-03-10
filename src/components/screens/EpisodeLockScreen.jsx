import { useApp } from '../../AppContext';
import { ALL_CASTAWAYS } from '../../data';
import { FijianCard, FijianSectionHeader, Icon } from '../fijian';

function PicksList({ picks }) {
    if (!picks || picks.length === 0) {
        return <p className="text-sand-warm/50 text-xs font-serif italic">No picks submitted.</p>;
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
        return <p className="text-sand-warm/50 text-xs font-serif italic">No predictions submitted.</p>;
    }

    const hasPropBets = propBets && propBets.length > 0;
    const hasAnswers = hasPropBets && propBets.some(bet => predictions.propBets?.[bet.id] !== undefined);

    if (!hasAnswers) {
        return <p className="text-sand-warm/50 text-xs font-serif italic">No prop bets this episode.</p>;
    }

    return (
        <div className="space-y-3">
            {hasPropBets && (
                <div>
                    <span className="text-clay text-xs block mb-1.5">Prop bets:</span>
                    <div className="space-y-1">
                        {propBets.map(bet => {
                            const answer = predictions.propBets?.[bet.id];
                            return (
                                <div key={bet.id} className="flex items-center gap-2 text-xs">
                                    <span className={
                                        answer === true ? 'text-jungle-400 font-bold' :
                                        answer === false ? 'text-fire-400 font-bold' :
                                        'text-sand-warm/30'
                                    }>
                                        {answer === true ? 'YES' : answer === false ? 'NO' : '—'}
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

function ScarcityInfo({ episodeData, user, rideOrDies }) {
    const allPicks = episodeData?.picks || {};
    const contestantCount = {};

    for (const [, picks] of Object.entries(allPicks)) {
        for (const id of (picks || [])) {
            contestantCount[id] = (contestantCount[id] || 0) + 1;
        }
    }

    const myPicks = allPicks[user?.uid] || [];
    const isOthersRoD = (cid) => Object.entries(rideOrDies || {}).some(
        ([rodUid, rods]) => rodUid !== user?.uid && (rods || []).includes(cid)
    );
    const exclusive = myPicks.filter(id => contestantCount[id] === 1 && !isOthersRoD(id));
    const shared = myPicks.filter(id => contestantCount[id] > 1 || isOthersRoD(id));

    if (myPicks.length === 0) return null;

    return (
        <FijianCard className="p-4">
            <FijianSectionHeader title="Exclusivity Bonus" />
            {exclusive.length > 0 && (
                <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Icon name="star" className="text-torch text-sm" />
                        <span className="text-torch text-xs font-bold">1.5&times; bonus &mdash; only you picked them</span>
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
                    <span className="text-clay text-xs">Shared picks (1x):</span>
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
    const { user, currentEpisode, episodeData, rideOrDies } = useApp();

    const myPicks = episodeData?.picks?.[user?.uid] || [];
    const myPredictions = episodeData?.predictions?.[user?.uid];

    return (
        <div className="space-y-5">
            <FijianCard className="p-5 text-center border-fire-400/30 shadow-fire">
                <div className="text-3xl mb-2 animate-flicker" aria-hidden>📺</div>
                <p className="font-display text-2xl tracking-wider text-fire-400">Watching Episode {currentEpisode}</p>
                <p className="text-sand-warm/60 text-sm mt-1 font-sans">
                    Your picks and predictions are locked in. Enjoy the show!
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

            <ScarcityInfo episodeData={episodeData} user={user} rideOrDies={rideOrDies} />
        </div>
    );
}
