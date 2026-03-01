/**
 * Input — themed text input
 * @param {Object} props — spread to <input>
 */
export default function Input({ className = '', ...props }) {
  const base = 'px-3 py-2 rounded-lg border border-stone-700 bg-stone-800/50 text-stone-100 placeholder-stone-500 outline-none focus:border-fire-400 transition-colors text-sm';
  return <input className={`${base} ${className}`.trim()} {...props} />;
}
