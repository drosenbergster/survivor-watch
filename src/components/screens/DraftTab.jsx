import { useApp } from '../../AppContext';
import { ALL_CASTAWAYS } from '../../data';
import { FijianCard, FijianSectionHeader, FijianPrimaryButton, Icon, HintBadge } from '../fijian';
import AdminEpisodeCard from './AdminEpisodeCard';
import AdminScoring from './AdminScoring';
import WeeklyPicks from './WeeklyPicks';
import Predictions from './Predictions';
import EpisodeLockScreen from './EpisodeLockScreen';
import TribalSnapVote from './TribalSnapVote';
import PostEpisodeHub from './PostEpisodeHub';
import ProbstRecap from './ProbstRecap';
import MergePassport from './MergePassport';
import FinaleMode from './FinaleMode';

function SeasonOverview() {
    const { user, leagueMembers, rideOrDies } = useApp();
    const memberEntries = Object.entries(leagueMembers || {});
    const myRod = rideOrDies?.[user?.uid] || [];

    return (
        <div className="space-y-5">
            {myRod.length > 0 && (
                <FijianCard className="p-4">
                    <FijianSectionHeader title="Your Ride or Dies" />
                    <div className="space-y-2">
                        {myRod.map((cId) => {
                            const c = ALL_CASTAWAYS.find(x => x.id === cId);
                            return (
                                <div key={cId} className="flex items-center gap-3 bg-stone-800/50 px-3 py-2.5 rounded-lg">
                                    <Icon name="handshake" className="text-ochre text-sm" />
                                    <span className="text-sand-warm text-sm">{c?.name || cId}</span>
                                    <span className="text-ochre/70 text-xs ml-auto">+2 pts/ep</span>
                                </div>
                            );
                        })}
                    </div>
                </FijianCard>
            )}

            <FijianCard>
                <div className="px-4 py-3 border-b border-ochre/20">
                    <FijianSectionHeader title="League Ride or Dies" className="!mb-0" />
                </div>
                <div className="p-3 space-y-3">
                    {memberEntries.map(([uid, member]) => {
                        const rod = rideOrDies?.[uid] || [];
                        return (
                            <div key={uid}>
                                <span className="text-sand-warm text-sm font-bold">
                                    {member.displayName}
                                    {uid === user?.uid && <span className="text-clay text-xs ml-1">(you)</span>}
                                </span>
                                <div className="flex gap-2 flex-wrap mt-1">
                                    {rod.length > 0 ? rod.map(cId => {
                                        const c = ALL_CASTAWAYS.find(x => x.id === cId);
                                        return (
                                            <span key={cId} className="bg-stone-800/50 text-stone-300 text-xs px-2.5 py-1 rounded">
                                                {c?.name || cId}
                                            </span>
                                        );
                                    }) : <span className="text-sand-warm/50 text-xs">None</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </FijianCard>
        </div>
    );
}

function EpisodeScoredBanner({ episodeNum }) {
    const { hasWatched } = useApp();
    const watched = hasWatched(episodeNum);

    if (!watched) {
        return (
            <FijianCard className="p-5 text-center bg-gradient-to-b from-stone-800/80 to-stone-900/60 space-y-2">
                <div className="text-3xl">🛡️</div>
                <p className="text-sand-warm font-display text-lg tracking-wider">Episode {episodeNum} Complete</p>
                <p className="text-sand-warm/50 text-sm font-sans">
                    Details hidden until you&apos;ve watched. Go to the Watch tab and tap &quot;Start Watching&quot; to begin.
                </p>
            </FijianCard>
        );
    }

    return (
        <FijianCard className="p-5 text-center bg-gradient-to-b from-stone-800/80 to-stone-900/60">
            <p className="text-ochre font-display text-xl tracking-wider">Episode {episodeNum} Scored</p>
            <p className="text-sand-warm/60 text-sm font-sans mt-1">
                Check the Scores tab for standings and breakdowns.
            </p>
        </FijianCard>
    );
}

export default function DraftTab() {
    const {
        user, myEpisode, myEpisodeData, league,
        isWatching, hasWatched, hasLockedPicks,
        advanceEpisode,
        isMerged, mergePassports, finaleData,
    } = useApp();

    const hasEpisode = !!myEpisode && !!myEpisodeData;

    const watching = hasEpisode ? isWatching(myEpisode) : false;
    const watched = hasEpisode ? hasWatched(myEpisode) : false;
    const picksLocked = hasEpisode ? hasLockedPicks(myEpisode) : false;

    const isScored = !!myEpisodeData?.scored;
    const isFinaleActive = !!finaleData?.status;
    const mergePassportSealed = !!mergePassports?.[user?.uid]?.sealedAt;

    if (isFinaleActive) {
        return (
            <div className="space-y-6">
                <header className="text-center">
                    <h2 className="font-display text-3xl tracking-wider text-sand-warm drop-shadow-text">Finale</h2>
                </header>
                <FinaleMode />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="text-center">
                <h2 className="font-display text-3xl tracking-wider text-sand-warm drop-shadow-text">
                    {hasEpisode ? `Episode ${myEpisode}` : 'Season 50'}
                </h2>
                {hasEpisode && (
                    <p className="text-sand-warm/70 text-sm mt-1 font-sans inline-flex items-center justify-center">
                        Make your picks, then head to Watch to start the episode.
                        <HintBadge hintKey="picks">
                            Each episode, pick contestants and answer Tree Mail. Then go to the Watch tab and tap &quot;Start Watching&quot; to lock everything in and activate your bingo card.
                        </HintBadge>
                    </p>
                )}
            </header>

            <AdminEpisodeCard />

            {!hasEpisode && <SeasonOverview />}

            {/* Merge Passport prompt — show when merged but not yet sealed */}
            {isMerged && !mergePassportSealed && (
                <MergePassport />
            )}

            {/* Player hasn't locked picks — show picks + predictions */}
            {hasEpisode && !picksLocked && !watching && !watched && (
                <>
                    <WeeklyPicks />
                    <Predictions />
                </>
            )}

            {/* Player is actively watching — show locked picks + tribal vote */}
            {hasEpisode && watching && (
                <>
                    <EpisodeLockScreen />
                    <TribalSnapVote episodeNum={myEpisode} />
                </>
            )}

            {/* Player finished watching, episode not scored yet */}
            {hasEpisode && watched && !isScored && (
                <FijianCard className="p-5 text-center space-y-2">
                    <Icon name="check_circle" className="text-jungle-400 text-3xl" />
                    <p className="text-sand-warm font-display text-lg tracking-wider">
                        Episode {myEpisode} Watched
                    </p>
                    <p className="text-sand-warm/50 text-sm font-sans">
                        Scores will appear automatically once stats are imported.
                    </p>
                </FijianCard>
            )}

            {/* Admin scoring — optional override for host */}
            {watched && <AdminScoring episodeNum={myEpisode} />}

            {isScored && (
                <EpisodeScoredBanner episodeNum={myEpisode} />
            )}

            {isScored && watched && (
                <>
                    <ProbstRecap episodeNum={myEpisode} />
                    <PostEpisodeHub episodeNum={myEpisode} />
                </>
            )}

            {/* Continue to next episode — available after watching */}
            {hasEpisode && watched && (
                <FijianCard className="p-4 text-center">
                    <FijianPrimaryButton onClick={advanceEpisode}>
                        Continue to Episode {myEpisode + 1}
                    </FijianPrimaryButton>
                </FijianCard>
            )}

            {hasEpisode && picksLocked && <SeasonOverview />}
        </div>
    );
}
