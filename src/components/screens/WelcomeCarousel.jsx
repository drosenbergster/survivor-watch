import { useState } from 'react';
import { MasiBackground, FijianHero, FijianCard, FijianPrimaryButton, Icon } from '../fijian';

const SLIDES = [
    {
        icon: '🏝️',
        title: 'Welcome to Watch Party HQ',
        body: 'Your Survivor 51 companion app. Play bingo, make calls, pick castaways, and see how your read on the season holds up.',
    },
    {
        icon: '🎱',
        title: 'Bingo Is the Main Event',
        body: 'Every episode you get your own card. Mark squares as things happen — every square you catch scores, and lines and blackouts pay bonuses on top.',
    },
    {
        icon: '🔮',
        title: 'Make Your Calls',
        body: 'Answer Tree Mail before the episode, then guess who gets voted out. After the premiere you seal a Passport of season-long predictions.',
    },
    {
        icon: '🎯',
        title: 'Pick Castaways from Episode 2',
        body: 'No draft this season — you meet all 21 first. From Episode 2 you pick three each week, and being the only one on someone is worth more.',
    },
    {
        icon: '📺',
        title: 'Watch on Your Own Time',
        body: 'Nothing is spoiled before you watch. Mark an episode done and everything unlocks at once — results, standings, and how your card stacked up.',
    },
];

export default function WelcomeCarousel({ onComplete }) {
    const [slide, setSlide] = useState(0);
    const isLast = slide === SLIDES.length - 1;
    const current = SLIDES[slide];

    return (
        <div className="fixed inset-0 z-50 bg-stone-dark font-sans text-stone-200 min-h-screen antialiased">
            <MasiBackground>
                <div className="flex flex-col flex-1 items-center justify-center px-6 z-20">
                    <FijianHero subtitle="WATCH PARTY HQ" />

                    <FijianCard className="w-full max-w-sm p-6 space-y-5 text-center mt-6">
                        <div className="text-5xl">{current.icon}</div>
                        <h2 className="font-display text-2xl tracking-wider text-sand-warm">
                            {current.title}
                        </h2>
                        <p className="text-sand-warm/70 text-sm font-sans leading-relaxed">
                            {current.body}
                        </p>

                        <div className="flex justify-center gap-2 pt-2">
                            {SLIDES.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSlide(i)}
                                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                                        i === slide ? 'bg-ochre scale-125' : 'bg-stone-600'
                                    }`}
                                    aria-label={`Slide ${i + 1}`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-3 pt-2">
                            {!isLast ? (
                                <>
                                    <button
                                        onClick={onComplete}
                                        className="flex-1 px-4 py-2.5 rounded-lg text-sm text-sand-warm/60 hover:text-sand-warm transition-colors"
                                    >
                                        Skip
                                    </button>
                                    <FijianPrimaryButton onClick={() => setSlide(s => s + 1)} className="flex-1">
                                        Next
                                    </FijianPrimaryButton>
                                </>
                            ) : (
                                <FijianPrimaryButton onClick={onComplete} className="flex-1">
                                    <Icon name="local_fire_department" className="mr-1" />
                                    Let&apos;s Go
                                </FijianPrimaryButton>
                            )}
                        </div>
                    </FijianCard>
                </div>
            </MasiBackground>
        </div>
    );
}
