import { useState } from 'react';
import { useApp } from '../../AppContext';
import { FijianCard, FijianPrimaryButton, Icon } from '../fijian';
import WeeklyPicks from './WeeklyPicks';

export default function TribeDraft({ episodeNum }) {
    const { lockDraft } = useApp();
    const [drafting, setDrafting] = useState(false);
    const [locking, setLocking] = useState(false);
    const [error, setError] = useState('');

    if (!drafting) {
        return (
            <FijianCard className="p-5 text-center space-y-3 border-ochre/20">
                <div className="text-3xl">🧣</div>
                <h3 className="font-display text-xl text-sand-warm tracking-wider">Premiere Draft</h3>
                <p className="text-sand-warm/60 text-sm font-sans max-w-xs mx-auto">
                    They find their names and grab their buffs in the first few minutes.
                    Pause right there — that is when you draft. Your card stays up.
                </p>
                <FijianPrimaryButton onClick={() => setDrafting(true)}>
                    <Icon name="groups" />
                    The buffs are out
                </FijianPrimaryButton>
            </FijianCard>
        );
    }

    return (
        <div
            className="fixed inset-0 z-30 overflow-y-auto bg-stone-950/92 px-4 pt-6 pb-28"
            role="dialog"
            aria-modal="true"
            aria-label="Premiere draft"
        >
            <div className="max-w-md mx-auto space-y-4">
            <FijianCard className="p-4 text-center border-ochre/40">
                <p className="font-display text-2xl tracking-wider text-ochre">Premiere Draft</p>
                <p className="text-sand-warm/60 text-xs mt-1 font-sans">
                    Take your picks and star a Captain. The card stays where you left it.
                </p>
            </FijianCard>

            <WeeklyPicks
                title="Your Draft"
                lede="Now that you have seen the tribes, draft the castaways who score for you tonight — premiere night is the widest draft of the season. They save as you tap."
                captainNudge="Star one of your picks as Captain before you lock your draft."
            />

            <FijianCard className="p-4 text-center space-y-2">
                <FijianPrimaryButton
                    onClick={async () => {
                        setError('');
                        setLocking(true);
                        try { await lockDraft(episodeNum); }
                        catch (err) { setError(err.message || 'Could not lock your draft'); }
                        setLocking(false);
                    }}
                    disabled={locking}
                >
                    <Icon name="lock" className="mr-1" />
                    {locking ? 'Locking in…' : 'Lock My Draft'}
                </FijianPrimaryButton>
                {error && <p className="text-amber text-xs font-sans" role="alert">{error}</p>}
            </FijianCard>
            </div>
        </div>
    );
}
