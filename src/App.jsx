import { useState } from 'react';
import { useApp } from './AppContext';
import {
    AuthScreen, JoinScreen,
    EpisodeTab, ScoreboardTab, RulesTab, PlayerProfile,
    WelcomeCarousel,
} from './components/screens';
import { AppShell } from './components/layout';

function ProfileTab() {
    return <PlayerProfile />;
}

const TABS = [
    { key: 'episode', label: 'Episode', icon: 'local_fire_department', Component: EpisodeTab },
    { key: 'scores', label: 'Scores', icon: 'leaderboard', Component: ScoreboardTab },
    { key: 'profile', label: 'Profile', icon: 'person', Component: ProfileTab },
    { key: 'rules', label: 'Rules', icon: 'menu_book', Component: RulesTab },
];

function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-stone-950">
            <div className="text-5xl animate-flicker" aria-hidden="true">🔥</div>
        </div>
    );
}

export default function App() {
    const { user, authLoading, displayName, profileLoading, partyLoading, onboardingComplete, completeOnboarding } = useApp();
    const [activeTab, setActiveTab] = useState('episode');

    if (authLoading) return <LoadingScreen />;
    if (!user) return <AuthScreen />;
    if (!onboardingComplete) return <WelcomeCarousel onComplete={completeOnboarding} />;
    if (profileLoading) return <LoadingScreen />;
    if (!displayName) return <JoinScreen />;
    if (partyLoading) return <LoadingScreen />;

    const shellProps = { tabs: TABS, activeTab, onTabChange: setActiveTab, onShowTutorial: () => setActiveTab('rules') };

    const ActiveComponent = TABS.find(t => t.key === activeTab)?.Component || TABS[0].Component;

    return (
        <AppShell {...shellProps}>
            <ActiveComponent onTabChange={setActiveTab} />
        </AppShell>
    );
}
