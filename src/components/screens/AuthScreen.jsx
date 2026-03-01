import { useState } from 'react';
import { useApp } from '../../AppContext';
import { Button, Input } from '../ui';

export default function AuthScreen() {
    const { sendMagicLink } = useApp();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await sendMagicLink(email);
            setSent(true);
        } catch (err) {
            setError(err.message.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950">
            {/* Background embers */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                {Array.from({ length: 15 }, (_, i) => ({ left: `${(i * 6) % 100}%`, delay: `${(i * 0.25) % 4}s`, duration: `${3 + (i % 3)}s` })).map((s, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-fire-400 animate-float-up"
                        style={{ left: s.left, bottom: '-10px', animationDelay: s.delay, animationDuration: s.duration }}
                    />
                ))}
            </div>

            <div className="relative bg-stone-900 border border-stone-800 rounded-2xl p-8 max-w-md w-[90%] text-center shadow-2xl">
                <div className="text-5xl mb-3 animate-flicker" aria-hidden="true">🔥</div>
                <h1 className="font-display text-5xl tracking-wider text-fire-400 text-glow-fire">
                    SURVIVOR <span className="text-torch text-glow-torch">50</span>
                </h1>
                <p className="text-stone-400 text-sm tracking-widest uppercase mt-1 mb-6">Watch Party HQ</p>

                {sent ? (
                    <div className="space-y-4">
                        <div className="text-4xl" aria-hidden="true">✉️</div>
                        <h2 className="font-display text-2xl tracking-wider text-torch">Check Your Email!</h2>
                        <p className="text-stone-400 text-sm leading-relaxed">
                            We sent a magic link to <strong className="text-stone-200">{email}</strong>.
                            Click the link to sign in — no password needed!
                        </p>
                        <button
                            onClick={() => setSent(false)}
                            className="text-fire-400 text-xs hover:underline cursor-pointer mt-2"
                        >
                            Use a different email
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <p className="text-stone-400 text-sm mb-2">Enter your email and we'll send you a magic link ✨</p>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3"
                            required
                            autoComplete="email"
                            aria-label="Email address"
                        />
                        <Button type="submit" variant="primary" disabled={loading} className="w-full py-3">
                            {loading ? 'Sending...' : '🔥 Send Magic Link'}
                        </Button>
                    </form>
                )}

                {error && <p className="text-fire-600 text-xs mt-3" role="alert">{error}</p>}
            </div>
        </div>
    );
}
