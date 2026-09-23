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
import { PICKS_START_EPISODE, SEASON_LABEL } from '../../data';

export default function EpisodeTab() {
    const {
        user, myEpisode, myEpisodeData, leagueId,
        isWatching, hasWatched, hasLockedPicks,
        advanceEpisode, saveBingoMarks, bingo,
        isMerged, mergePassports, finaleData,
    } = useApp();

    const hasEpisode = !!myEpisode && !!myEpisodeData;
    const episodePendingSync = !!myEpisode && !myEpisodeData;

    const watching = hasEpisode ? isWatching(myEpisode) : false;
    const watched = hasEpisode ? hasWatched(myEpisode) : false;
    const picksLocked = hasEpisode ? hasLockedPicks(myEpisode) : false;

    const isScored = !!myEpisodeData?.scored;
    const isFinaleActive = !!finaleData?.status;
    const passportSealed = !!mergePassports?.[user?.uid]?.sealedAt;

    // Castaway picks begin in Episode 2 — the premiere is the group's first look at this cast.
    const picksOpen = !!myEpisode && Number(myEpisode) >= PICKS_START_EPISODE;

    const bingoSeed = user ? `${leagueId}-${myEpisode}-${user.uid}` : 'fallback';
    const bingoMarked = bingo?.[myEpisode]?.[user?.uid];
    const handleBingoSave = useCallback((marked) => {
        if (saveBingoMarks) saveBingoMarks(myEpisode, marked);
    }, [saveBingoMarks, myEpisode]);

    const headerSubtitle = useMemo(() => {
        if (episodePendingSync) return 'Loading episode data…';
        if (!hasEpisode) return null;
        if (watching) return 'Your torch is lit — enjoy the show.';
        if (watched && isScored) return 'Episode complete. Review your results below.';
        if (watched) return 'Waiting for the host to score this episode.';
        return picksOpen
            ? 'Make your picks and Tree Mail, then light your torch.'
            : 'Answer your Tree Mail, then light your torch. No castaway picks tonight — you meet them first.';
    }, [episodePendingSync, hasEpisode, watching, watched, isScored, picksOpen]);

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
                    {myEpisode ? `Episode ${myEpisode}` : SEASON_LABEL}
                </h2>
                {headerSubtitle && (
                    <p className="text-sand-warm/70 text-sm mt-1 font-sans inline-flex items-center justify-center">
                        {headerSubtitle}
                        {!episodePendingSync && !watching && !watched && (
                            <HintBadge hintKey="picks">
                                {picksOpen
                                    ? 'Pick castaways and answer Tree Mail. They save as you go. Tap "Light Your Torch" when you sit down to watch.'
                                    : 'Answer Tree Mail, then tap "Light Your Torch" when you sit down to watch. Castaway picks open in Episode 2.'}
                            </HintBadge>
                        )}
                    </p>
                )}
            </header>

            <AdminEpisodeCard />

            {episodePendingSync && (
                <FijianCard className="p-6 text-center space-y-2">
                    <Icon name="hourglass_empty" className="text-ochre text-3xl mx-auto animate-pulse" />
                    <p className="text-sand-warm/80 text-sm font-sans">
                        Setting up Episode {myEpisode}. If this lingers, ask the host to open the app once (they sync the season week).
                    </p>
                </FijianCard>
            )}

            {/* Merge just hit — seal your Passport (finale predictions) once. */}
            {isMerged && !passportSealed && <MergePassport />}

            {/* Pre-watch: picks (Episode 2+), predictions, then torch */}
            {hasEpisode && !picksLocked && !watching && !watched && (
                <>
                    {picksOpen && <WeeklyPicks />}
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
                            episodeNum={myEpisode}
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

            {/* Scored: full episode recap */}
            {isScored && watched && (
                <ProbstRecap episodeNum={myEpisode} />
            )}

            {/* Hard stop — continue only after the host has scored this episode */}
            {hasEpisode && watched && isScored && (
                <FijianCard className="p-4 text-center">
                    <FijianPrimaryButton onClick={advanceEpisode}>
                        Continue to Episode {myEpisode + 1}
                    </FijianPrimaryButton>
                </FijianCard>
            )}
        </div>
    );
}
