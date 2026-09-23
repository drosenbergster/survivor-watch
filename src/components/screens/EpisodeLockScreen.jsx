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
        return <p className="text-sand-warm/50 text-xs font-serif italic">No Tree Mail this episode.</p>;
    }

    return (
        <div className="space-y-3">
            {hasPropBets && (
                <div>
                    <span className="text-clay text-xs block mb-1.5">Tree Mail:</span>
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

function CaptainInfo({ episodeData, user }) {
    const myPicks = episodeData?.picks?.[user?.uid] || [];
    const captainId = episodeData?.captains?.[user?.uid] || null;

    if (myPicks.length === 0 || !captainId) return null;

    const captain = ALL_CASTAWAYS.find(c => c.id === captainId);

    return (
        <FijianCard className="p-4">
            <FijianSectionHeader title="Your Captain" />
            <div className="flex items-center gap-2">
                <Icon name="star" className="text-torch text-sm" />
                <span className="text-torch text-sm font-bold">{captain?.name || captainId}</span>
                <span className="text-clay text-xs">scores double tonight</span>
            </div>
        </FijianCard>
    );
}

export default function EpisodeLockScreen() {
    const { user, myEpisodeData } = useApp();

    const myPicks = myEpisodeData?.picks?.[user?.uid] || [];
    const myPredictions = myEpisodeData?.predictions?.[user?.uid];

    return (
        <div className="space-y-4">
            <FijianCard className="p-4">
                <FijianSectionHeader title="Your Locked Picks" />
                <PicksList picks={myPicks} />
            </FijianCard>

            <FijianCard className="p-4">
                <FijianSectionHeader title="Your Predictions" />
                <PredictionsSummary predictions={myPredictions} propBets={myEpisodeData?.propBets} />
            </FijianCard>

            <CaptainInfo episodeData={myEpisodeData} user={user} />
        </div>
    );
}
