import Icon from './Icon';

export default function BingoSquare({ label, isFree, isMarked, isWinning, isNearest, onClick, isTabua, ...props }) {
  const base = 'min-w-0 w-full h-full min-h-[3.75rem] sm:min-h-[4.25rem] flex flex-col items-center justify-center px-0.5 py-1 text-center bamboo-border transition-all cursor-pointer select-none active:scale-95';
  const free = isTabua ? 'bg-masi-ochre/40 tabua-icon' : 'bg-masi-ochre/40';
  const marked = 'bg-masi-red shadow-inner text-masi-cream font-bold';
  const unmarked = 'bg-masi-black text-masi-cream/90 hover:bg-masi-ochre/40 hover:text-masi-cream';

  let style = unmarked;
  if (isFree) style = free;
  else if (isMarked) style = marked;

  const nearest = isNearest && !isMarked && !isFree ? 'ring-1 ring-ochre/50' : '';

  return (
    <button
      type="button"
      onClick={onClick}
      title={isFree ? 'Free space' : label}
      onContextMenu={(e) => e.preventDefault()}
      className={`${base} ${style} ${nearest} ${isWinning ? 'animate-pulse-win' : ''} text-[9px] sm:text-[10px] font-medium uppercase leading-tight`}
      aria-pressed={isMarked}
      aria-label={isFree ? 'Free space' : `${label}${isMarked ? ', marked' : ''}`}
      {...props}
    >
      {isTabua ? (
        <>
          <Icon name="star" className="text-base sm:text-lg text-masi-cream" aria-hidden />
          <span className="text-[8px] sm:text-[9px] text-masi-cream/80 mt-0.5 leading-none">FREE</span>
        </>
      ) : (
        <span className="block w-full break-words">{label}</span>
      )}
    </button>
  );
}
