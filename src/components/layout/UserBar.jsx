import { useApp } from '../../AppContext';
import { Icon } from '../fijian';
import LeagueSwitcher from '../screens/LeagueSwitcher';

export function UserBar({ onShowTutorial }) {
  const { user, syncStatus, logout } = useApp();
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-stone-900 border-b border-stone-800 text-xs relative z-20">
      <div className="flex items-center gap-1.5">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            syncStatus === 'online' ? 'bg-jungle-400' :
            syncStatus === 'syncing' ? 'bg-torch animate-pulse-sync' :
            'bg-fire-600'
          }`}
          aria-hidden
        />
        <span className="text-stone-400 hidden sm:inline">
          {syncStatus === 'online' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Local'}
        </span>
      </div>
      <span className="flex-1 text-stone-400 truncate">{user.email}</span>
      {onShowTutorial && (
        <button
          type="button"
          onClick={onShowTutorial}
          className="flex items-center gap-1 px-2 py-1 rounded border border-stone-700 text-stone-400 hover:text-ochre hover:border-ochre/40 transition-all cursor-pointer"
          aria-label="How to play"
        >
          <Icon name="help_outline" className="text-sm" />
          <span className="hidden sm:inline">How to Play</span>
        </button>
      )}
      <LeagueSwitcher />
      <button
        type="button"
        onClick={logout}
        className="px-2.5 py-1 rounded border border-stone-700 text-stone-400 hover:text-ochre hover:border-ochre/40 transition-all cursor-pointer"
      >
        Sign Out
      </button>
    </div>
  );
}
