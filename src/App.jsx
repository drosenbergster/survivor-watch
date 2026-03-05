import { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import {
    AuthScreen, LeagueGate, LeagueLobby,
    RideOrDieDraft, SeasonPassport,
    DraftTab, BingoTab, ScoreboardTab, RulesTab, PlayerProfile,
    WelcomeCarousel,
} from './components/screens';
import { AppShell } from './components/layout';

function ProfileTab() {
    return <PlayerProfile />;
}

const TABS = [
    { key: 'draft', fijian: 'Sevu', english: 'Draft', Component: DraftTab },
    { key: 'bingo', fijian: 'Qito', english: 'Bingo', Component: BingoTab },
    { key: 'scoreboard', fijian: 'Tovo', english: 'Scores', Component: ScoreboardTab },
    { key: 'profile', fijian: 'Yau', english: 'Profile', Component: ProfileTab },
    { key: 'rules', fijian: 'Lawa', english: 'Rules', Component: RulesTab },
];

function LoadingScreen() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-stone-950">
            <div className="text-5xl animate-flicker" aria-hidden="true">🔥</div>
        </div>
    );
}

export default function App() {
    const { user, authLoading, league, leagueId, leagueLoading, draftState, passports, onboardingComplete, completeOnboarding } = useApp();
    const [activeTab, setActiveTab] = useState('draft');
    const [joinParam, setJoinParam] = useState(null);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('join');
        if (code) {
            setJoinParam(code.toUpperCase());
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, []);

    if (authLoading) return <LoadingScreen />;
    if (!user) return <AuthScreen />;
    if (!onboardingComplete) return <WelcomeCarousel onComplete={completeOnboarding} />;
    if (leagueLoading) return <LoadingScreen />;
    if (!leagueId) return <LeagueGate prefillCode={joinParam} />;

    // League status: lobby → draft → active
    const status = league?.status || 'lobby';

    const shellProps = { tabs: TABS, activeTab, onTabChange: setActiveTab, onShowTutorial: () => setActiveTab('rules') };

    if (status === 'lobby') {
        return (
            <AppShell {...shellProps}>
                <LeagueLobby />
            </AppShell>
        );
    }

    if (status === 'draft') {
        const draftComplete = draftState?.status === 'complete';
        const myPassportSealed = !!passports?.[user.uid]?.sealedAt;

        if (!draftComplete) {
            return (
                <AppShell {...shellProps}>
                    <RideOrDieDraft />
                </AppShell>
            );
        }

        if (!myPassportSealed) {
            return (
                <AppShell {...shellProps}>
                    <SeasonPassport />
                </AppShell>
            );
        }

        return (
            <AppShell {...shellProps}>
                <SeasonPassport />
            </AppShell>
        );
    }

    // status === 'active' or beyond → normal tab routing
    const ActiveComponent = TABS.find(t => t.key === activeTab)?.Component || DraftTab;

    return (
        <AppShell {...shellProps}>
            <ActiveComponent />
        </AppShell>
    );
}
