export function TabNav({ tabs, activeTab, onTabChange }) {
  return (
    <nav className="flex justify-center gap-2 flex-wrap px-4 py-3 relative z-10" aria-label="Main navigation">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap
            ${activeTab === tab.key
              ? 'bg-gradient-to-r from-fire-400 to-fire-600 text-white shadow-fire-lg border border-transparent'
              : 'bg-stone-900 border border-stone-800 text-stone-400 hover:bg-stone-800 hover:text-stone-200 hover:border-stone-700'
            }`}
          aria-current={activeTab === tab.key ? 'page' : undefined}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
