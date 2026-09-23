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
                    Pause right there — that is when you draft.
                </p>
                <FijianPrimaryButton onClick={() => setDrafting(true)}>
                    <Icon name="groups" />
                    The buffs are out
                </FijianPrimaryButton>
            </FijianCard>
        );
    }

    return (
        <div className="space-y-4">
            <FijianCard className="p-4 text-center border-ochre/40">
                <p className="font-display text-2xl tracking-wider text-ochre">Premiere Draft</p>
                <p className="text-sand-warm/60 text-xs mt-1 font-sans">
                    Three castaways, one Captain. Your bingo card opens once you lock it.
                </p>
            </FijianCard>

            <WeeklyPicks
                title="Your Draft"
                lede="Now that you have seen the tribes, draft the three castaways who score for you tonight. They save as you tap."
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
    );
}
