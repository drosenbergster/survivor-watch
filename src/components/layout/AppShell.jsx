/**
 * AppShell — main layout wrapper (user bar, compact header, bottom nav)
 * Content area accounts for fixed bottom nav height.
 */
import { MasiBackground } from '../fijian';
import { UserBar } from './UserBar';
import { AppHeader } from './AppHeader';
import { TabNav } from './TabNav';
import { AppFooter } from './AppFooter';

export default function AppShell({ activeTab, onTabChange, tabs, children, onShowTutorial }) {
  return (
    <MasiBackground className="min-h-screen">
      <UserBar onShowTutorial={onShowTutorial} />
      <AppHeader />
      <main
        className="max-w-5xl mx-auto py-4 relative z-10 flex-1 pb-24"
        style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}
      >
        {children}
      </main>
      <AppFooter />
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
    </MasiBackground>
  );
}
