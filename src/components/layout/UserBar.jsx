import { useApp } from '../../AppContext';
import { Icon } from '../fijian';
import LeagueSwitcher from '../screens/LeagueSwitcher';

export function UserBar({ onShowTutorial }) {
  const { user, syncStatus, logout } = useApp();
  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 border-b border-stone-800 text-xs relative z-20"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.625rem)' }}
    >
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
      <span className="flex-1 text-stone-400 truncate hidden sm:block">{user.email}</span>
      <span className="flex-1 sm:hidden" />
      {onShowTutorial && (
        <button
          type="button"
          onClick={onShowTutorial}
          className="flex items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-2 rounded border border-stone-700 text-stone-400 hover:text-ochre hover:border-ochre/40 transition-all cursor-pointer"
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
        className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded border border-stone-700 text-stone-400 hover:text-ochre hover:border-ochre/40 transition-all cursor-pointer"
        aria-label="Sign out"
      >
        <Icon name="logout" className="text-base sm:hidden" />
        <span className="hidden sm:inline px-2.5">Sign Out</span>
      </button>
    </div>
  );
}
