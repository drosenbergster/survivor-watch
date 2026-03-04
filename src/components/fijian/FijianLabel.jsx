/**
 * FijianLabel — Small uppercase label (Fijian/English pair)
 */
export default function FijianLabel({ fijian, english }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[11px] uppercase tracking-tighter text-ochre font-bold italic leading-none">{fijian}</span>
      <span className="text-[11px] text-sand-warm/70 uppercase tracking-widest leading-none">{english}</span>
    </div>
  );
}
