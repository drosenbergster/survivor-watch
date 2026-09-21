/**
 * FijianHero — Torch logo + SURVIVOR 51 title block
 */
export default function FijianHero({ subtitle = 'WATCH PARTY HQ' }) {
  return (
    <div className="text-center mb-10 relative">
      <div className="absolute -inset-10 clip-[ellipse(50%_40%_at_50%_50%)] bg-ochre/5 -z-10 blur-xl" aria-hidden />
      <div className="mb-6 drop-shadow-cina relative flex items-center justify-center">
        <div className="relative">
          <div className="w-10 h-24 bg-gradient-to-b from-ochre to-earth rounded-b-full rounded-t-lg relative">
            <div className="absolute top-4 w-full h-1 bg-stone-dark opacity-40" />
            <div className="absolute top-8 w-full h-1 bg-stone-dark opacity-40" />
          </div>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-12 h-16 bg-clay blur-[2px] rounded-full opacity-80 mix-blend-screen" />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-10 bg-sand-warm rounded-full" />
        </div>
      </div>
      <h1 className="text-6xl font-display tracking-tight text-transparent bg-gradient-to-b from-clay via-ochre to-earth wood-texture bg-clip-text leading-[0.85] drop-shadow-text">
        SURVIVOR
      </h1>
      <h1 className="text-8xl font-display tracking-tighter text-transparent bg-gradient-to-b from-sand-warm via-clay to-ochre wood-texture bg-clip-text leading-[0.85] mt-1 drop-shadow-text-lg">
        51
      </h1>
      <div className="flex items-center justify-center gap-2 mt-8">
        <div className="h-[1px] w-8 bg-ochre/40" />
        <p className="text-[10px] font-bold tracking-[0.4em] text-sand-warm uppercase opacity-80">
          {subtitle}
        </p>
        <div className="h-[1px] w-8 bg-ochre/40" />
      </div>
    </div>
  );
}
