import { useCallback, useMemo } from 'react';
import { useApp } from '../../AppContext';
import { FijianCard, FijianPrimaryButton, Icon, HintBadge } from '../fijian';
import AdminEpisodeCard from './AdminEpisodeCard';
import AdminScoring from './AdminScoring';
import WeeklyPicks from './WeeklyPicks';
import Predictions from './Predictions';
import EpisodeLockScreen from './EpisodeLockScreen';
import TribalSnapVote from './TribalSnapVote';
import ProbstRecap from './ProbstRecap';
import MergePassport from './MergePassport';
import FinaleMode from './FinaleMode';
import LightYourTorch from './LightYourTorch';
import BingoCard from './BingoCard';

export default function DraftTab() {
    const {
        user, myEpisode, myEpisodeData, leagueId,
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

            {/* Scored: full episode recap (Previously On, Key Moments, Elimination, votes, picks, standings, badges) */}
            {isScored && watched && (
                <ProbstRecap episodeNum={myEpisode} />
            )}

            {/* Hard stop — continue to next episode */}
            {hasEpisode && watched && (
                <FijianCard className="p-4 text-center">
                    <FijianPrimaryButton onClick={advanceEpisode}>
                        Continue to Episode {myEpisode + 1}
                    </FijianPrimaryButton>
                </FijianCard>
            )}
        </div>
    );
}
