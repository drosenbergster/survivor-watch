import { useState } from 'react';
import { MasiBackground, FijianHero, FijianCard, FijianPrimaryButton, Icon } from '../fijian';

const SLIDES = [
    {
        icon: '🏝️',
        title: 'Welcome to Watch Party HQ',
        body: 'Your Survivor Season 50 companion app. Pick contestants, make predictions, play bingo, and compete with your friends across the entire season.',
    },
    {
        icon: '🤝',
        title: 'Pick Your Tribe',
        body: 'Draft two exclusive Ride or Dies before the season starts. Then each episode, choose which contestants will score points for you that week.',
    },
    {
        icon: '🔮',
        title: 'Predict & Play',
        body: 'Answer Tree Mail, vote at tribal council, and fill out your bingo card — all while watching the show.',
    },
    {
        icon: '🏆',
        title: 'Score & Compete',
        body: 'Points come from contestant performance, correct predictions, bingo lines, and social votes. Check the scoreboard to see who leads the tribe.',
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
