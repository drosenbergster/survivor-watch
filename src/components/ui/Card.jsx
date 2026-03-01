/**
 * Card — container with optional border accent
 * @param {Object} props
 * @param {string} [props.title]
 * @param {string} [props.accentColor] — hex for top border
 * @param {string} [props.className]
 */
export default function Card({ title, accentColor, className = '', children, ...props }) {
  const base = 'bg-stone-900 border border-stone-800 rounded-xl p-4';
  const style = accentColor ? { borderTopColor: accentColor, borderTopWidth: '3px' } : undefined;
  return (
    <div className={`${base} ${className}`.trim()} style={style} {...props}>
      {title && <h3 className="text-sm font-semibold mb-4 text-stone-300">{title}</h3>}
      {children}
    </div>
  );
}
