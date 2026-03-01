/**
 * FijianSectionHeader — Section title with Fijian styling
 * @param {string} variant - 'default' | 'rules' (rules uses Cormorant Garamond, terracotta)
 */
export default function FijianSectionHeader({ title, subtitle, variant = 'default', className = '' }) {
  const isRules = variant === 'rules';
  const borderClass = isRules ? 'border-terracotta/30' : 'border-ochre/30';
  const headingClass = isRules
    ? 'font-wood-serif font-bold text-3xl text-sand-warm tracking-wide'
    : 'font-serif font-bold text-2xl text-sand-warm tracking-wide';
  return (
    <div className={`flex items-center gap-3 mb-6 border-b ${borderClass} pb-2 ${className}`}>
      <h3 className={headingClass}>
        {title}
        {subtitle && (
          <span className="text-sm font-sans opacity-60 text-sand-warm/80 italic tracking-normal ml-1">
            ({subtitle})
          </span>
        )}
      </h3>
    </div>
  );
}
