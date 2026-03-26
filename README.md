# Survivor 50 Watch Party HQ

A web app for Survivor Season 50 watch parties. Pick contestants, make predictions, play bingo, and compete across the full season with your friend group (4-8 players). The UI draws on Fijian aesthetics (masi patterns, wood tones, earth colors) in tribute to the season's setting.

*Survivor is a trademark of CBS. This project is a fan-made tool and is not affiliated with or endorsed by CBS or the show.*

## Features

- **League System** — Create/join private leagues with join codes
- **Ride or Die Draft** — Pre-season 2-round snake draft for exclusive contestants with historical player stats
- **Weekly Picks** — Choose contestants to score for you each episode
- **Predictions** — Prop bets (auto-resolvable), snap votes, side bets
- **Season & Merge Passports** — Sealed long-term predictions revealed at finale
- **Bingo** — Auto-generated 5x5 card per player per episode with line/blackout detection
- **Fully Automated Scoring** — Stats auto-imported from TrueDorkTimes, InsideSurvivor, and FantasySurvivorGame; prop bets auto-resolved; episodes scored without host intervention
- **Spoiler Protection** — Per-player watch gating ensures scores and results only appear after a player completes their viewing
- **Post-Episode Social** — Player of the Episode voting, Impact Rating
- **Achievements** — 10 badges (Prophet, Beast Mode, Contrarian, etc.)
- **Auto-Commissioner** — Weekly recap with headlines, superlatives, and standings
- **Tribe Management** — Admin tools for tribe swaps and merge
- **Survivor Auction** — Mid-season live auction with sequential cloche reveals, incremental bidding, standings-based budgets, 6 game-modifying perks (Extra Pick, Double Down, Tree Mail Insider, Bingo Frenzy, Spy Glass, Steal a Pick), and 2 hidden duds. Perks activate immediately for the current episode.
- **Finale Mode** — Passport reveals, reunion awards, legacy cards, champion crowning
- **Async Support** — Player-driven episode flow so everyone plays at their own pace

## How Scoring Works

1. **Thursday night** — Firebase Cloud Functions automatically fetch episode stats from three external sources (TDT, InsideSurvivor, FSG)
2. **Auto-resolve** — Prop bets and side bets are resolved programmatically against the imported data
3. **Auto-score** — The first league creator to open the app triggers automatic scoring from the imported data
4. **Spoiler-safe** — Results are gated per-player behind their watch status; no data leaks until they mark the episode as watched

The host can still manually review or adjust scores via an optional admin override panel.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your Firebase config (Firebase Console → Project Settings)
npm run dev
```

### Cloud Functions (auto-import)

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## Firebase

Config is read from environment variables only — no hardcoded credentials.

| Env var | Description |
|---------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `VITE_FIREBASE_DATABASE_URL` | Realtime DB URL |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |

Without `.env`, the app runs in demo mode (local-only with demo user, no auth or sync).

## Stack

React 19, Vite 7, Tailwind CSS v4, Firebase (Auth + Realtime DB + Cloud Functions).

## Project Structure

| Path | Purpose |
|------|---------|
| `src/App.jsx` | Main app, tab routing, league flow |
| `src/AppContext.jsx` | Global state, Firebase sync, auto-scoring, all game actions |
| `src/data.js` | Season 50 cast, tribes, scoring events, structured prop bets, bet resolution, auction perks |
| `src/scoring.js` | Scoring engine, standings, achievements, commissioner report, auction perk multipliers |
| `src/importers/` | Client-side parsers (TDT, InsideSurvivor) and game event derivation |
| `functions/` | Firebase Cloud Functions for scheduled auto-import and bet resolution |
| `src/theme.js` | Color constants for JS |
| `src/components/fijian/` | Shared Fijian UI (FijianCard, FijianInput, BingoSquare, Icon) |
| `src/components/layout/` | AppShell, AppHeader, TabNav, UserBar, AppFooter |
| `src/components/screens/` | All app screens (see `docs/COMPONENTS.md`) |
| `src/styles/` | theme.css (tokens), fijian.css (patterns), base.css |
| `database.rules.json` | Firebase Realtime Database security rules |

See `docs/STYLE_GUIDE.md` for design conventions and `docs/COMPONENTS.md` for component reference.

## Documentation

| Doc | Location |
|-----|----------|
| Build Plan | `_bmad-output/build-plan.md` |
| Feature Brainstorm | `_bmad-output/brainstorming/brainstorming-session-2026-03-01-203435.md` |
| Handoff Prompt | `_bmad-output/handoff-prompt.md` |
| Component Guide | `docs/COMPONENTS.md` |
| Style Guide | `docs/STYLE_GUIDE.md` |
| Stitch Designs | `_bmad-output/stitch-screens/` |

## License

MIT — see [LICENSE](LICENSE).
