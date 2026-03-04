import { useId } from 'react';

/**
 * FijianInput — Themed input with Fijian styling
 */
export default function FijianInput({ label, id: externalId, className = '', ...props }) {
  const generatedId = useId();
  const inputId = externalId || (label ? generatedId : undefined);

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-ochre text-[10px] font-bold uppercase tracking-widest px-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-stone-dark/80 border-2 border-earth/30 focus:border-clay/50 focus:ring-0 rounded-lg h-14 px-5 text-sand-warm placeholder:text-sand-warm/50 italic transition-all outline-none ${className}`}
        {...props}
      />
    </div>
  );
}
