/**
 * AppHeader — compact inline header for the app shell.
 * The full FijianHero is reserved for auth/splash screens.
 */
export function AppHeader() {
  return (
    <header className="text-center py-2 relative z-10">
      <div className="flex items-center justify-center gap-2">
        <div className="relative shrink-0 w-4">
          <div className="w-3.5 h-7 bg-gradient-to-b from-ochre to-earth rounded-b-full rounded-t-sm mx-auto">
            <div className="absolute top-2 w-full h-[1px] bg-stone-dark/40" />
            <div className="absolute top-4 w-full h-[1px] bg-stone-dark/40" />
          </div>
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-5 bg-clay blur-[1px] rounded-full opacity-60 mix-blend-screen" />
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-3 bg-sand-warm rounded-full opacity-80" />
        </div>
        <div className="leading-none">
          <h1 className="font-display text-xl tracking-tight text-transparent bg-gradient-to-b from-clay via-ochre to-earth bg-clip-text drop-shadow-text">
            SURVIVOR 50
          </h1>
          <p className="text-[7px] font-bold tracking-[0.25em] text-sand-warm/50 uppercase mt-0.5">
            Watch Party HQ
          </p>
        </div>
      </div>
    </header>
  );
}
