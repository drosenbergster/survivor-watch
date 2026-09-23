# Survivor 51 Watch Party HQ

A web app for Survivor Season 51 — "The Open Era" — watch parties. Draft castaways, make a few calls, mark a bingo card, and compete across the season with your friend group (4-8 players). The UI draws on Fijian aesthetics (masi patterns, wood tones, earth colors) in tribute to the season's setting.

*Survivor is a trademark of CBS. This project is a fan-made tool and is not affiliated with or endorsed by CBS or the show.*

## Features

- **One Watch Party** — Sign in, pick a display name, and you are on the only scoreboard. No leagues, no codes, no lobby
- **Weekly Picks** — Choose castaways to score for you each episode. The count tapers as the field thins, so a roster stays yours rather than converging on everyone else's
- **Captain** — Star one of your picks each week; they score double. The one real decision every episode
- **Premiere Draft** — The premiere has nobody to pick yet, so the draft happens mid-episode. Pause when the buffs are handed out, take five, and lock it
- **Tree Mail** — Yes/no prop bets, auto-resolved from imported stats
- **Snap Vote** — One call at tribal council, before the questioning starts
- **Merge Passport** — Sealed long-term predictions revealed at the finale
- **Bingo** — Auto-generated 5x5 card per player per episode with line detection
- **Tribe Fire** — A flame per player showing who is still bought into the season, faded after a missed week
- **Fire Circle** — Who else has finished the episode, and how the room called its Tree Mail
- **Fully Automated Scoring** — Stats auto-imported from TrueDorkTimes, InsideSurvivor, and FantasySurvivorGame; prop bets auto-resolved; episodes scored without host intervention
- **Spoiler Protection** — Per-player watch gating ensures scores and results only appear after a player completes their viewing
- **Post-Episode Social** — Player of the Episode voting, Impact Rating
- **Tribe Management** — Host tools for the starting tribes, swaps, and the merge
- **Finale Mode** — Passport reveals, reunion awards, champion crowning
- **Async Support** — Player-driven episode flow so everyone plays at their own pace

## How Scoring Works

1. **Thursday through Saturday** — A GitHub Actions cron job fetches episode stats from three external sources (TDT, InsideSurvivor, FSG). It runs three times a day and exits quietly when results are not published yet
2. **Auto-resolve** — Tree Mail prop bets are resolved programmatically against the imported data
3. **Auto-score** — The host opening the app triggers automatic scoring from the imported data
4. **Spoiler-safe** — Results are gated per-player behind their watch status; no data leaks until they mark the episode as watched

The host can still manually review or adjust scores via an optional admin override panel.

Scheduling lives in GitHub Actions rather than Cloud Functions because the Firebase scheduler requires the paid Blaze plan.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your Firebase config (Firebase Console → Project Settings)
npm run dev
```

### Cloud Functions (callable import)

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
| `src/App.jsx` | Main app, tab routing, sign-in/join gates |
| `src/AppContext.jsx` | Global state, Firebase sync, auto-scoring, all game actions |
| `src/data.js` | Season 51 cast, tribes, scoring events, pick-count rules, structured prop bets, bet resolution |
| `src/scoring.js` | Scoring engine, standings, episode breakdowns |
| `src/tribeFire.js` | Flame state per player from watch history |
| `src/fireCircle.js` | Who has finished an episode, and how the room called it |
| `src/importers/` | Client-side parsers (TDT, InsideSurvivor) and game event derivation |
| `functions/` | Cloud Functions plus the importer and parsers used by the scheduled job |
| `.github/workflows/import-episode.yml` | Scheduled stat import (Thu-Sat, three times daily) |
| `src/theme.js` | Color constants for JS |
| `src/components/fijian/` | Shared Fijian UI (FijianCard, FijianInput, BingoSquare, Icon, HintBadge) |
| `src/components/layout/` | AppShell, AppHeader, TabNav, UserBar, AppFooter |
| `src/components/screens/` | All app screens (see `docs/COMPONENTS.md`) |
| `src/styles/` | theme.css (tokens), fijian.css (patterns), base.css |
| `database.rules.json` | Firebase Realtime Database security rules |

See `docs/STYLE_GUIDE.md` for design conventions and `docs/COMPONENTS.md` for component reference.

## Documentation

| Doc | Location |
|-----|----------|
| Component Guide | `docs/COMPONENTS.md` |
| Style Guide | `docs/STYLE_GUIDE.md` |
| Build Plan (historical) | `_bmad-output/build-plan.md` |
| Feature Brainstorm (historical) | `_bmad-output/brainstorming/brainstorming-session-2026-03-01-203435.md` |
| Stitch Designs (historical) | `_bmad-output/stitch-screens/` |

Files under `_bmad-output/` are dated planning snapshots. They record what was decided at the time and are not kept in sync with the shipped app.

## License

MIT — see [LICENSE](LICENSE).
