# Component Guide — Survivor 51 Watch Party HQ

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
| **HintBadge** | Inline `?` that expands a short explanation in place |
| **MasiBackground** | Full-screen backgrounds with masi pattern |
| **FijianHero** | Hero title block (SURVIVOR 51) |

## Layout Components

| Component | Purpose |
|-----------|---------|
| **AppShell** | Main layout: UserBar | Header | TabNav | Content | Footer |
| **UserBar** | Sync status, email, logout |
| **AppHeader** | Logo, title, embers |
| **TabNav** | Tab buttons with `aria-current` (4 tabs; `TABS` is defined in `src/App.jsx`) |
| **AppFooter** | Footer text |

## Screen Components

### Auth & Onboarding
| Component | File | Purpose |
|-----------|------|---------|
| **AuthScreen** | `AuthScreen.jsx` | Magic link sign-in |
| **JoinScreen** | `JoinScreen.jsx` | Pick a display name and take a seat in the one watch party |
| **WelcomeCarousel** | `WelcomeCarousel.jsx` | Four-slide first-run explainer |
| **TribeRoster** | `TribeRoster.jsx` | Who is playing, plus the invite link |

### Core Tabs
| Component | File | Tab Label | Purpose |
|-----------|------|-----------|---------|
| **EpisodeTab** | `EpisodeTab.jsx` | Episode | Phase-driven episode hub — picks, Tree Mail, torch, draft, bingo, tribal, recap |
| **ScoreboardTab** | `ScoreboardTab.jsx` | Scores | Season standings with per-episode breakdown and bingo card history |
| **PlayerProfile** | `PlayerProfile.jsx` | Profile | Player stats and prediction accuracy |
| **RulesTab** | `RulesTab.jsx` | Rules | Three-section rulebook + host-only tools (tribe management, roster) |

### Episode Flow
| Component | File | Purpose |
|-----------|------|---------|
| **WeeklyPicks** | `WeeklyPicks.jsx` | Select castaways for the episode and star a Captain. Count comes from `getMaxPicks`; reusable via `title`/`lede`/`captainNudge` props |
| **Predictions** | `Predictions.jsx` | Tree Mail yes/no calls |
| **LightYourTorch** | `LightYourTorch.jsx` | Player-driven episode start and finish (locks Tree Mail, activates bingo) |
| **TribeDraft** | `TribeDraft.jsx` | Premiere-only mid-episode draft, gated behind a "buffs are out" checkpoint. Wraps `WeeklyPicks` and holds its own lock |
| **EpisodeLockScreen** | `EpisodeLockScreen.jsx` | Shows locked picks, Tree Mail, and Captain during the episode |
| **TribalSnapVote** | `TribalSnapVote.jsx` | Mid-episode snap vote at tribal council |
| **BingoCard** | `BingoCard.jsx` | Interactive 5x5 bingo grid |

### Admin
| Component | File | Purpose |
|-----------|------|---------|
| **AdminEpisodeCard** | `AdminEpisodeCard.jsx` | Episode creation and management |
| **AdminScoring** | `AdminScoring.jsx` | Post-episode game event input and auto-import review |
| **TribeManagement** | `TribeManagement.jsx` | Starting tribes, swaps, and the merge. Buckets are add/removable, so a castaway with no tribe has somewhere to go |

### Recap & Social
| Component | File | Purpose |
|-----------|------|---------|
| **TribeFire** | `TribeFire.jsx` | Thin flame row — who is still bought in, faded after a missed week. Logic in `src/tribeFire.js` |
| **FireCircle** | `FireCircle.jsx` | Who else has finished this episode and how the room called its Tree Mail. Spoiler-gated in `src/fireCircle.js` |
| **ProbstRecap** | `ProbstRecap.jsx` | Full episode recap: Previously On headline, key moments, elimination, Player of Episode vote, Impact Rating vote, weekly picks scoreboard, standings, superlatives |

### Advanced
| Component | File | Purpose |
|-----------|------|---------|
| **MergePassport** | `MergePassport.jsx` | Mid-season sealed predictions |
| **FinaleMode** | `FinaleMode.jsx` | Passport reveals, reunion awards, champion crowning |

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
