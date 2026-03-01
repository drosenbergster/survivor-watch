export function AppHeader({ embers }) {
  return (
    <header className="text-center pt-6 pb-2 relative z-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {embers.map((s, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-fire-400 animate-float-up"
            style={{ left: s.left, bottom: '-5px', animationDelay: s.delay, animationDuration: s.duration }}
          />
        ))}
      </div>
      <div className="text-4xl mb-1 animate-flicker relative" aria-hidden="true">🔥</div>
      <h1 className="font-display text-5xl sm:text-6xl tracking-wider text-fire-400 text-glow-fire leading-none relative">
        SURVIVOR <span className="text-torch text-glow-torch text-6xl sm:text-7xl">50</span>
      </h1>
      <p className="text-stone-500 text-xs tracking-[0.3em] uppercase mt-1 relative">Watch Party HQ</p>
    </header>
  );
}
