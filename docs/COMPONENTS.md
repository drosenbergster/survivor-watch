# Component Guide — Survivor 50 Watch Party HQ

React component architecture and conventions.

## Structure

```
src/components/
├── fijian/       # Shared Fijian UI (FijianCard, FijianInput, BingoSquare, Icon)
├── layout/       # App shell (AppShell, UserBar, Header, TabNav, Footer)
└── screens/      # App views (all screens listed below)
```

## Fijian Components

Use these for all screens. See `src/components/fijian/` and `docs/STYLE_GUIDE.md`.

| Component | Usage |
|-----------|-------|
| **FijianCard** | Containers, sections |
| **FijianInput** | Text inputs with optional label (auto-generates `htmlFor`/`id`) |
| **FijianPrimaryButton** | Primary CTAs |
| **FijianSectionHeader** | Section titles |
| **FijianLabel** | Small Fijian/English label pairs |
| **BingoSquare** | Bingo cells with mark/win states |
| **Icon** | Material Symbols Outlined |
| **MasiBackground** | Full-screen backgrounds with masi pattern |
| **FijianHero** | Hero title block (SURVIVOR 50) |

## Layout Components

| Component | Purpose |
|-----------|---------|
| **AppShell** | Main layout: UserBar | Header | TabNav | Content | Footer |
| **UserBar** | Sync status, email, logout |
| **AppHeader** | Logo, title, embers |
| **TabNav** | Tab buttons with `aria-current` (5 tabs) |
| **AppFooter** | Footer text |

## Screen Components

### Auth & League Setup
| Component | File | Purpose |
|-----------|------|---------|
| **AuthScreen** | `AuthScreen.jsx` | Magic link sign-in |
| **LeagueGate** | `LeagueGate.jsx` | Create or join a league with code |
| **LeagueLobby** | `LeagueLobby.jsx` | Pre-game lobby, member list |
| **RideOrDieDraft** | `RideOrDieDraft.jsx` | 2-round snake draft |
| **SeasonPassport** | `SeasonPassport.jsx` | 5 sealed pre-season predictions |

### Core Tabs
| Component | File | Tab Label | Purpose |
|-----------|------|-----------|---------|
| **DraftTab** | `DraftTab.jsx` | Episode | Phase-driven episode hub — picks, predictions, torch, bingo, tribal, recap |
| **ScoreboardTab** | `ScoreboardTab.jsx` | Scores | Season standings with per-episode breakdown, ride or dies, bingo card history |
| **RulesTab** | `RulesTab.jsx` | Rules | Scoring rules + admin tools (tribe management) |
| **PlayerProfile** | `PlayerProfile.jsx` | Profile | Player stats, badges, prediction accuracy |
| **SurvivorAuction** | `SurvivorAuction.jsx` | Auction (temporary) | Appears when auction is active; auto-navigates all players. Disappears after perks expire. |

### Episode Flow
| Component | File | Purpose |
|-----------|------|---------|
| **WeeklyPicks** | `WeeklyPicks.jsx` | Select contestants for the episode |
| **Predictions** | `Predictions.jsx` | Elimination, bold, prop bet predictions |
| **LightYourTorch** | `LightYourTorch.jsx` | Player-driven episode start (locks picks, activates bingo) |
| **EpisodeLockScreen** | `EpisodeLockScreen.jsx` | Shows locked picks during episode |
| **TribalSnapVote** | `TribalSnapVote.jsx` | Mid-episode snap vote at tribal council |
| **BingoCard** | `BingoCard.jsx` | Interactive 5x5 bingo grid |

### Admin
| Component | File | Purpose |
|-----------|------|---------|
| **AdminEpisodeCard** | `AdminEpisodeCard.jsx` | Episode creation and management |
| **AdminScoring** | `AdminScoring.jsx` | Post-episode game event input |
| **TribeManagement** | `TribeManagement.jsx` | Tribe swaps and merge |

### Recap & Social
| Component | File | Purpose |
|-----------|------|---------|
| **ProbstRecap** | `ProbstRecap.jsx` | Full episode recap: Previously On headline, key moments, elimination, Player of Episode vote, Impact Rating vote, weekly picks scoreboard, standings, superlatives, badges |
| **CommissionerReport** | `CommissionerReport.jsx` | Auto-generated weekly recap |

### Advanced
| Component | File | Purpose |
|-----------|------|---------|
| **MergePassport** | `MergePassport.jsx` | Mid-season sealed predictions |
| **SurvivorAuction** | `SurvivorAuction.jsx` | Mid-season live auction: sequential cloche reveals, incremental +5 bidding with custom raise, standings-based budgets, 6 perks + 2 duds. Gets its own temporary tab during the event. |
| **FinaleMode** | `FinaleMode.jsx` | Passport reveals, reunion awards, legacy cards, crowning |

## React Conventions

### State
- Keep state close to where it's used
- Use `useApp()` for global state (context)
- **Never setState in the render body** — use `useEffect` with a ref guard for hydrating from async data
- Lift state only when needed

### Props
- Destructure props at top of component
- Use JSDoc for optional/complex props
- Spread `...rest` to underlying elements

### Event handlers
- Name handlers `handle*` (e.g. `handleSubmit`)
- Use `async` for handlers that await
- Wrap Firebase calls in try/catch and display errors to the user

### Accessibility
- Use semantic HTML (`<header>`, `<main>`, `<section>`)
- Add `aria-label` to icon-only buttons
- Use `aria-current="page"` for active nav
- Use `role="alert"` for error messages
- FijianInput auto-generates `htmlFor`/`id` for label association

### Tailwind
- Use theme tokens only — no hardcoded colors
- **Never use dynamic Tailwind class names** (e.g., `bg-${color}/20`). Use a lookup map + inline styles instead.
- For JS-driven colors, import from `src/theme.js`
