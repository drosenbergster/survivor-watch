import Icon from './Icon';

export default function BingoSquare({ label, isFree, isMarked, isWinning, onClick, isTabua, ...props }) {
  const base = 'aspect-square flex flex-col items-center justify-center p-1 text-center bamboo-border transition-all cursor-pointer select-none';
  const free = isTabua ? 'bg-masi-ochre/40 tabua-icon' : 'bg-masi-ochre/40';
  const marked = 'bg-masi-red shadow-inner text-masi-cream font-bold';
  const unmarked = 'bg-masi-black text-masi-cream/70 hover:bg-masi-ochre/40 hover:text-masi-cream';

  let style = unmarked;
  if (isFree) style = free;
  else if (isMarked) style = marked;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${style} ${isWinning ? 'animate-pulse-win' : ''} text-[10px] sm:text-[11px] font-medium uppercase leading-tight`}
      aria-pressed={isMarked}
      aria-label={isFree ? 'Free space' : `${label}${isMarked ? ', marked' : ''}`}
      {...props}
    >
      {isTabua ? (
        <Icon name="star" className="text-base sm:text-lg text-masi-cream" aria-hidden />
      ) : (
        <span className="line-clamp-3 overflow-hidden">{label}</span>
      )}
    </button>
  );
}
