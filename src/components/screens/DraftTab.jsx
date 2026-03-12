import { useCallback, useMemo } from 'react';
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
import LightYourTorch from './LightYourTorch';
import BingoCard from './BingoCard';

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
                    Details hidden until you&apos;ve watched. Tap &quot;Light Your Torch&quot; above to begin.
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
        user, myEpisode, myEpisodeData, league, leagueId,
        isWatching, hasWatched, hasLockedPicks,
        advanceEpisode, saveBingoMarks, bingo,
        isMerged, mergePassports, finaleData,
    } = useApp();

    const hasEpisode = !!myEpisode && !!myEpisodeData;

    const watching = hasEpisode ? isWatching(myEpisode) : false;
    const watched = hasEpisode ? hasWatched(myEpisode) : false;
    const picksLocked = hasEpisode ? hasLockedPicks(myEpisode) : false;

    const isScored = !!myEpisodeData?.scored;
    const isFinaleActive = !!finaleData?.status;
    const mergePassportSealed = !!mergePassports?.[user?.uid]?.sealedAt;

    const bingoSeed = user ? `${leagueId}-${myEpisode}-${user.uid}` : 'fallback';
    const bingoMarked = bingo?.[myEpisode]?.[user?.uid];
    const handleBingoSave = useCallback((marked) => {
        if (saveBingoMarks) saveBingoMarks(myEpisode, marked);
    }, [saveBingoMarks, myEpisode]);

    const headerSubtitle = useMemo(() => {
        if (!hasEpisode) return null;
        if (watching) return 'Your torch is lit — enjoy the show.';
        if (watched && isScored) return 'Episode complete. Review your results below.';
        if (watched) return 'Waiting for the host to score this episode.';
        return 'Make your picks and Tree Mail, then light your torch.';
    }, [hasEpisode, watching, watched, isScored]);

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
                {headerSubtitle && (
                    <p className="text-sand-warm/70 text-sm mt-1 font-sans inline-flex items-center justify-center">
                        {headerSubtitle}
                        {!watching && !watched && (
                            <HintBadge hintKey="picks">
                                Pick contestants and answer Tree Mail, then tap &quot;Light Your Torch&quot; to lock everything in, activate your bingo card, and start the episode.
                            </HintBadge>
                        )}
                    </p>
                )}
            </header>

            <AdminEpisodeCard />

            {!hasEpisode && <SeasonOverview />}

            {isMerged && !mergePassportSealed && (
                <MergePassport />
            )}

            {/* Pre-watch: picks, predictions, then torch */}
            {hasEpisode && !picksLocked && !watching && !watched && (
                <>
                    <WeeklyPicks />
                    <Predictions />
                    <LightYourTorch episodeNum={myEpisode} />
                </>
            )}

            {/* Watching: torch status, bingo card, tribal vote, locked picks reference */}
            {hasEpisode && watching && (
                <>
                    <LightYourTorch episodeNum={myEpisode} />
                    <div className="max-w-md mx-auto">
                        <BingoCard
                            seed={bingoSeed}
                            marked={bingoMarked}
                            onSave={handleBingoSave}
                            disabled={false}
                        />
                    </div>
                    <TribalSnapVote episodeNum={myEpisode} />
                    <EpisodeLockScreen />
                </>
            )}

            {/* Watched, not yet scored */}
            {hasEpisode && watched && !isScored && (
                <FijianCard className="p-5 text-center space-y-2">
                    <Icon name="check_circle" className="text-jungle-400 text-3xl" />
                    <p className="text-sand-warm font-display text-lg tracking-wider">
                        Episode {myEpisode} Watched
                    </p>
                    <p className="text-sand-warm/50 text-sm font-sans">
                        Scores will appear once the host imports results.
                    </p>
                </FijianCard>
            )}

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
