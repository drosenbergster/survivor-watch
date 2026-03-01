/**
 * Button — primary, secondary, ghost variants
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'} [props.variant]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
export default function Button({ variant = 'secondary', disabled, className = '', children, ...props }) {
  const base = 'rounded-lg font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-default';
  const variants = {
    primary: 'py-3 px-4 bg-gradient-to-r from-fire-400 to-fire-600 text-white hover:shadow-fire-lg text-sm',
    secondary: 'py-2 px-4 border border-stone-700 bg-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-600 text-sm',
    ghost: 'py-2 px-3 text-stone-400 hover:text-fire-400 hover:border-fire-400/30 border border-transparent',
  };
  const { type = 'button', ...rest } = props;
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
