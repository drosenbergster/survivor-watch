import { useApp } from '../../AppContext';

export function UserBar() {
  const { user, syncStatus, logout } = useApp();
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-stone-900 border-b border-stone-800 text-xs relative z-20">
      <div className="flex items-center gap-1.5">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            syncStatus === 'online' ? 'bg-jungle-400' :
            syncStatus === 'syncing' ? 'bg-torch animate-pulse-sync' :
            'bg-fire-600'
          }`}
          aria-hidden
        />
        <span className="text-stone-500 hidden sm:inline">
          {syncStatus === 'online' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Local'}
        </span>
      </div>
      <span className="flex-1 text-stone-500 truncate">{user.email}</span>
      <button
        type="button"
        onClick={logout}
        className="px-2.5 py-1 rounded border border-stone-700 text-stone-500 hover:text-fire-400 hover:border-fire-400/30 transition-all cursor-pointer"
      >
        Sign Out
      </button>
    </div>
  );
}
