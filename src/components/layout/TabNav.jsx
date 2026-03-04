export function TabNav({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="flex justify-center gap-2 sm:gap-4 flex-wrap px-3 py-4 relative z-10" aria-label="Main navigation">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`flex flex-col items-center py-2 px-3 sm:px-4 rounded-lg transition-all cursor-pointer
            ${activeTab === tab.key
              ? 'bg-gradient-to-br from-clay via-sienna to-ochre shadow-lg shadow-stone-950/50 border border-earth/40'
              : 'bg-transparent border border-transparent hover:bg-stone-900/80'
            }`}
          aria-current={activeTab === tab.key ? 'page' : undefined}
        >
          <span className={`text-[9px] uppercase tracking-tighter font-bold italic leading-none ${activeTab === tab.key ? 'text-stone-dark' : 'text-ochre'}`}>
            {tab.fijian}
          </span>
          <span className={`text-[10px] uppercase tracking-widest leading-none ${activeTab === tab.key ? 'text-stone-dark/90' : 'text-sand-warm/60'}`}>
            {tab.english}
          </span>
        </button>
      ))}
    </nav>
  );
}
