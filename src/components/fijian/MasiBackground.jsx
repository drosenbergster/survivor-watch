/**
 * MasiBackground — Fijian masi pattern with gradient overlay and optional bure silhouettes
 */
export default function MasiBackground({ children, className = '' }) {
  return (
    <div className={`relative flex min-h-screen w-full flex-col masi-pattern ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-earth/20 to-stone-dark pointer-events-none" aria-hidden />
      <div className="bure-silhouette absolute -left-10 bottom-20 w-64 h-64 rotate-12" aria-hidden />
      <div className="bure-silhouette absolute -right-16 top-10 w-80 h-80 -rotate-12" aria-hidden />
      {children}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-dark to-transparent pointer-events-none z-10" aria-hidden />
    </div>
  );
}
