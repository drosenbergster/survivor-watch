import { useState } from 'react';
import { useApp } from './AppContext';
import {
    AuthScreen, LeagueGate, LeagueLobby,
    RideOrDieDraft, SeasonPassport,
    DraftTab, BingoTab, ScoreboardTab, RulesTab, PlayerProfile,
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
    const { user, authLoading, league, leagueId, leagueLoading, draftState, passports } = useApp();
    const [activeTab, setActiveTab] = useState('draft');

    if (authLoading) return <LoadingScreen />;
    if (!user) return <AuthScreen />;
    if (leagueLoading) return <LoadingScreen />;
    if (!leagueId) return <LeagueGate />;

    // League status: lobby → draft → active
    const status = league?.status || 'lobby';

    if (status === 'lobby') {
        return (
            <AppShell tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
                <LeagueLobby />
            </AppShell>
        );
    }

    if (status === 'draft') {
        const draftComplete = draftState?.status === 'complete';
        const myPassportSealed = !!passports?.[user.uid]?.sealedAt;

        // Draft in progress or just completed (show results)
        if (!draftComplete) {
            return (
                <AppShell tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
                    <RideOrDieDraft />
                </AppShell>
            );
        }

        // Draft done but passport not yet sealed → fill out passport
        if (!myPassportSealed) {
            return (
                <AppShell tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
                    <SeasonPassport />
                </AppShell>
            );
        }

        // Passport sealed → show passport status (waiting for others / start season)
        return (
            <AppShell tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
                <SeasonPassport />
            </AppShell>
        );
    }

    // status === 'active' or beyond → normal tab routing
    const ActiveComponent = TABS.find(t => t.key === activeTab)?.Component || DraftTab;

    return (
        <AppShell tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab}>
            <ActiveComponent />
        </AppShell>
    );
}
