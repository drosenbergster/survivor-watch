/**
 * ScreenHeader — consistent title + subtitle for screen views
 * @param {string} title
 * @param {React.ReactNode} [subtitle] — string or JSX
 */
export default function ScreenHeader({ title, subtitle }) {
  return (
    <header className="text-center">
      <h2 className="font-display text-4xl tracking-wider text-torch text-glow-torch">{title}</h2>
      {subtitle != null && <p className="text-stone-400 text-sm mt-1">{subtitle}</p>}
    </header>
  );
}
