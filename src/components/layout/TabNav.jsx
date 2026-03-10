import { Icon } from '../fijian';

export function TabNav({ tabs, activeTab, onTabChange }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900/95 backdrop-blur-sm border-t border-stone-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-stretch max-w-lg mx-auto h-14">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 transition-colors cursor-pointer ${
                active
                  ? 'text-ochre'
                  : 'text-stone-500 active:text-stone-300'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                name={tab.icon}
                className={`text-[22px] transition-transform ${active ? 'scale-110' : ''}`}
              />
              <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-ochre' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
