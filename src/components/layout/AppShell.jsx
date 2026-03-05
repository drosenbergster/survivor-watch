/**
 * AppShell — main layout wrapper (user bar, header, nav, footer)
 * Uses MasiBackground for same cool feel as AuthScreen.
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
      <TabNav tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      <main className="max-w-5xl mx-auto px-4 py-6 relative z-10 flex-1">
        {children}
      </main>
      <AppFooter />
    </MasiBackground>
  );
}
