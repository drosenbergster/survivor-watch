# Survivor 50 Watch Party App — Handoff Prompt

Copy everything below this line into a new chat to pick up where we left off.

---

## Context

I've built a **Survivor 50 Watch Party App** — a web app where my friend group (4-8 players) picks Survivor contestants, makes predictions, plays bingo, and competes across the full season. **All 9 development phases are complete.** A UX audit was performed and all identified issues have been resolved.

## Current State

The app is fully functional with:
- League system (create/join with codes)
- Ride or Die draft + Season Passport
- Weekly picks + predictions (elimination, bold, prop bets)
- Bingo (auto-generated 5x5, line/blackout detection, marks saved to Firebase)
- Tribal Snap Vote + side bets (player-driven, async-friendly)
- Full scoring engine (auto-calculated, scarcity bonus, ride-or-die bonuses)
- Post-Episode Social (Player of Episode voting, Impact Rating)
- Auto-Commissioner (weekly recap) + 10 achievements/badges
- Tribe Management (swaps, merge) + Merge Passport
- Survivor Auction (bidding with slider + number input)
- Finale Mode (passport reveals, reunion awards, legacy cards, champion crowning)
- Player Profile with stats and badge wall

### Key Architecture Decision: Player-Driven Episode Flow
The episode flow is **player-driven, not host-driven**. Each player controls their own timeline:
1. Player taps "Light Your Torch" to lock picks and activate bingo
2. Player marks bingo squares during the episode
3. Player triggers their own snap vote at tribal council
4. Player marks "watched" when done
5. Host is only responsible for: creating episodes, inputting game events for scoring, tribe management

### Removed: Hot Take / Slow Burn
Free-text prediction features were removed after the UX audit (too much friction). The app retains all structured prediction mechanics (elimination picks, bold predictions, prop bets, snap votes, side bets, passports).

## Tech Stack

- **Build Tool:** Vite 7
- **Frontend:** React 19 (JSX, hooks, functional components)
- **Styling:** Tailwind CSS v4 with custom Fijian theme tokens
- **Backend/DB:** Firebase (Realtime Database + Auth)
- **Auth:** Firebase Magic Link (email)
- **State Management:** React Context (`AppContext.jsx`)

## Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app with tab routing, league flow gates |
| `src/AppContext.jsx` | All global state, Firebase sync, game actions (~800 lines) |
| `src/data.js` | Season 50 cast, tribes, scoring events, bingo items, achievements |
| `src/scoring.js` | Scoring engine, standings, achievement detection, commissioner report |
| `src/theme.js` | Color constants for JS |
| `src/styles/theme.css` | Design tokens (CSS custom properties) |
| `database.rules.json` | Firebase security rules (league-scoped) |

Other important docs:
- `_bmad-output/build-plan.md` — Full build plan with status
- `_bmad-output/brainstorming/brainstorming-session-2026-03-01-203435.md` — Original feature brainstorm
- `docs/COMPONENTS.md` — Component reference
- `docs/STYLE_GUIDE.md` — Design system
- `.cursor/rules/` — Coding conventions

## What's Next

The app is feature-complete. Potential next steps:
1. **Deploy** — Ship to Vercel/Firebase Hosting for the watch party group
2. **Real data testing** — Walk through a full episode lifecycle with real users
3. **Performance** — Code-split the large JS bundle (~588KB)
4. **Polish** — Activity feed, Probst Bingo sub-card, notification sounds
5. **Data import** — TrueDork Times boxscore integration for detailed stat imports
