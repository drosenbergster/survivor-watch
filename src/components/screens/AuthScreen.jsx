import { useState } from 'react';
import { useApp } from '../../AppContext';
import {
  MasiBackground,
  FijianHero,
  FijianPrimaryButton,
  FijianInput,
  Icon,
} from '../fijian';

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
    <div className="fixed inset-0 z-50 bg-stone-dark font-sans text-stone-200 min-h-screen antialiased">
      <MasiBackground>
        <div className="flex flex-col flex-1 items-center justify-center px-8 z-20 pb-16">
          <FijianHero subtitle="WATCH PARTY HQ" />

          <div className="w-full max-w-[320px] space-y-6">
            {sent ? (
              <div className="space-y-4 text-center">
                <div className="text-4xl" aria-hidden>✉️</div>
                <h2 className="font-display text-2xl tracking-wider text-clay">Check Your Email!</h2>
                <p className="text-earth font-serif italic text-sm leading-relaxed">
                  We sent a magic link to <strong className="text-sand-warm">{email}</strong>.
                  Click the link to sign in — no password needed!
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="text-clay text-xs hover:underline cursor-pointer mt-2"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <FijianInput
                  label="Island Access Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Messenger bird address..."
                  required
                  autoComplete="email"
                  aria-label="Email address"
                />
                <div className="pt-2">
                  <FijianPrimaryButton type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Magic Link'}
                  </FijianPrimaryButton>
                  <div className="mt-8 text-center space-y-4">
                    <p className="text-earth font-serif italic text-sm leading-relaxed">
                      &quot;A link will be cast into the waters to guide your way.&quot;
                    </p>
                    <div className="flex justify-center opacity-30">
                      <Icon name="scuba_diving" className="text-ochre text-2xl" />
                    </div>
                  </div>
                </div>
              </form>
            )}

            {error && (
              <p className="text-amber text-xs text-center" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      </MasiBackground>
    </div>
  );
}
