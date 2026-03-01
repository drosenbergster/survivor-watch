/**
 * AppShell — main layout wrapper (user bar, header, nav, footer)
 * Used when user is authenticated.
 */
import { UserBar } from './UserBar';
import { AppHeader } from './AppHeader';
import { TabNav } from './TabNav';
import { AppFooter } from './AppFooter';

const EMBER_STYLES = Array.from({ length: 12 }, (_, i) => ({
  left: `${10 + (i * 7) % 80}%`,
  delay: `${(i * 0.3) % 4}s`,
  duration: `${3 + (i % 3)}s`,
}));

export default function AppShell({ activeTab, onTabChange, tabs, children }) {
  return (
    <div className="min-h-screen">
      <UserBar />
      <AppHeader embers={EMBER_STYLES} />
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      <main className="max-w-5xl mx-auto px-4 py-6 relative z-10">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
