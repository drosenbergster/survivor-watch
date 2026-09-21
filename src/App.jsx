import { useState, useEffect, useMemo } from 'react';
import { useApp } from './AppContext';
import {
    AuthScreen, LeagueGate, LeagueLobby,
    DraftTab, ScoreboardTab, RulesTab, PlayerProfile,
    SurvivorAuction, WelcomeCarousel,
} from './components/screens';
import { AppShell } from './components/layout';
import { AUCTION_ENABLED } from './data';

function ProfileTab() {
    return <PlayerProfile />;
}

const BASE_TABS = [
    { key: 'episode', label: 'Episode', icon: 'local_fire_department', Component: DraftTab },
    { key: 'scores', label: 'Scores', icon: 'leaderboard', Component: ScoreboardTab },
    { key: 'profile', label: 'Profile', icon: 'person', Component: ProfileTab },
    { key: 'rules', label: 'Rules', icon: 'menu_book', Component: RulesTab },
];

const AUCTION_TAB = { key: 'auction', label: 'Auction', icon: 'gavel', Component: SurvivorAuction };

function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-stone-950">
            <div className="text-5xl animate-flicker" aria-hidden="true">🔥</div>
        </div>
    );
}

export default function App() {
    const { user, authLoading, league, leagueId, leagueLoading, onboardingComplete, completeOnboarding, auction } = useApp();
    const [activeTab, setActiveTab] = useState('episode');
    const [joinParam, setJoinParam] = useState(null);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('join');
        if (code) {
            setJoinParam(code.toUpperCase());
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, []);

    const isHost = league?.createdBy === user?.uid;
    const auctionVisible = AUCTION_ENABLED && (auction || isHost);
    const isActive = league?.status === 'active';

    const TABS = useMemo(() => {
        if (isActive && auctionVisible) {
            return [...BASE_TABS.slice(0, 2), AUCTION_TAB, ...BASE_TABS.slice(2)];
        }
        return BASE_TABS;
    }, [isActive, auctionVisible]);

    useEffect(() => {
        if (auction?.status === 'active' && activeTab !== 'auction') {
            setActiveTab('auction');
        }
    }, [auction?.status]);

    if (authLoading) return <LoadingScreen />;
    if (!user) return <AuthScreen />;
    if (!onboardingComplete) return <WelcomeCarousel onComplete={completeOnboarding} />;
    if (leagueLoading) return <LoadingScreen />;
    if (!leagueId) return <LeagueGate prefillCode={joinParam} />;

    const status = league?.status || 'lobby';

    const shellProps = { tabs: TABS, activeTab, onTabChange: setActiveTab, onShowTutorial: () => setActiveTab('rules') };

    if (status === 'lobby') {
        return (
            <AppShell {...shellProps}>
                <LeagueLobby />
            </AppShell>
        );
    }

    // Season 51 has no pre-season draft. Any league still sitting in the old
    // 'draft' status falls through to normal play.
    // status === 'active' or beyond → normal tab routing
    const ActiveComponent = TABS.find(t => t.key === activeTab)?.Component || TABS[0].Component;

    return (
        <AppShell {...shellProps}>
            <ActiveComponent onTabChange={setActiveTab} />
        </AppShell>
    );
}
