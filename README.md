# Survivor Bracket Bingo

Bracket draft, bingo, and scoreboard for Survivor Season 50 watch parties. The UI draws on Fijian aesthetics (masi patterns, wood tones, earth colors) in tribute to the season’s setting.

*Survivor is a trademark of CBS. This project is a fan-made tool and is not affiliated with or endorsed by CBS or the show.*

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your Firebase config (Firebase Console → Project Settings)
npm run dev
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

Without `.env`, the app runs in UI-only mode (no auth, no sync).

## Stack

React 19, Vite 7, Tailwind 4, Firebase (Auth + Realtime DB).

## Project structure

| Path | Purpose |
|------|---------|
| `src/components/fijian/` | Shared Fijian UI (MasiBackground, FijianCard, FijianInput, BingoSquare, Icon) |
| `src/components/layout/` | AppShell, AppHeader, TabNav, UserBar, AppFooter |
| `src/components/screens/` | AuthScreen, DraftTab, BingoTab, ScoreboardTab, RulesTab |
| `src/styles/` | theme.css (tokens), fijian.css (patterns), base.css |

Design tokens and Stitch-inspired patterns live in `theme.css` and `fijian.css`. See `docs/STYLE_GUIDE.md` for conventions.
