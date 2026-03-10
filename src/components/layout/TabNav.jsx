export function TabNav({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="flex justify-center gap-2 sm:gap-3 flex-wrap px-3 py-3 relative z-10" aria-label="Main navigation">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`py-2 px-4 sm:px-5 rounded-lg text-xs uppercase tracking-widest font-bold transition-all cursor-pointer
            ${activeTab === tab.key
              ? 'bg-gradient-to-br from-clay via-sienna to-ochre text-stone-dark shadow-lg shadow-stone-950/50 border border-earth/40'
              : 'bg-transparent text-sand-warm/60 border border-transparent hover:bg-stone-900/80 hover:text-sand-warm'
            }`}
          aria-current={activeTab === tab.key ? 'page' : undefined}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
