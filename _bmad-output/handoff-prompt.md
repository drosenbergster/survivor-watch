# Survivor 50 Watch Party App — Handoff Prompt

Copy everything below this line into a new chat to pick up where we left off.

---

## Context

I've built a **Survivor 50 Watch Party App** — a web app where my friend group (4-8 players) picks Survivor contestants, makes predictions, plays bingo, and competes across the full season. **All 9 development phases are complete.** Scoring is fully automated — no host intervention required.

## Current State

The app is fully functional with:
- League system (create/join with codes)
- Ride or Die draft + Season Passport + historical player stats from SurvivorStatsDB
- Weekly picks + auto-resolvable prop bets + side bets
- Bingo (auto-generated 5x5, line/blackout detection, marks saved to Firebase)
- Tribal Snap Vote + side bets (player-driven, async-friendly)
- **Fully automated scoring** — stats auto-imported from TrueDorkTimes, InsideSurvivor, and FantasySurvivorGame via Firebase Cloud Functions (scheduled Thursday nights + Friday retry)
- **Auto-resolved prop/side bets** — structured bets with `resolveType`/`resolveParams` resolved programmatically from imported data
- **Spoiler protection** — all results gated per-player behind watch status (`safeEliminated` for UI, full `eliminated` for scoring)
- Post-Episode Social (Player of Episode voting, Impact Rating)
- Auto-Commissioner (weekly recap) + 10 achievements/badges
- Tribe Management (swaps, merge) + Merge Passport
- Survivor Auction (bidding with slider + number input)
- Finale Mode (passport reveals, reunion awards, legacy cards, champion crowning)
- Player Profile with stats and badge wall

### Key Architecture Decision: Fully Automated Scoring
Episode scoring is **fully automated, no host required**:
1. Firebase Cloud Functions fetch stats from TDT + InsideSurvivor + FantasySurvivorGame on Thursday nights
2. Prop bets and side bets are auto-resolved server-side against imported data
3. The league creator's client auto-scores the episode when import data is available
4. All results are gated behind per-player watch status — no spoilers until a player marks "watched"
5. The host can optionally review/adjust via a collapsed admin override panel

### Key Architecture Decision: Player-Driven Episode Flow
The episode flow is **player-driven, not host-driven**. Each player controls their own timeline:
1. Player taps "Light Your Torch" to lock picks and activate bingo
2. Player marks bingo squares during the episode
3. Player triggers their own snap vote at tribal council
4. Player marks "watched" when done — results appear automatically

### Removed: Hot Take / Slow Burn / Elimination Prediction / Bold Prediction
Free-text prediction features (Hot Take, Slow Burn, Bold Prediction) were removed — too much friction. The pre-episode elimination prediction was removed as redundant with the Tribal Snap Vote. The app retains: weekly picks, prop bets, snap votes, side bets, and passports.

## Tech Stack

- **Build Tool:** Vite 7
- **Frontend:** React 19 (JSX, hooks, functional components)
- **Styling:** Tailwind CSS v4 with custom Fijian theme tokens
- **Backend/DB:** Firebase (Realtime Database + Auth + Cloud Functions)
- **Auth:** Firebase Magic Link (email)
- **State Management:** React Context (`AppContext.jsx`)
- **Server-Side Parsing:** Cheerio (in Cloud Functions for HTML scraping)

## Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app with tab routing, league flow gates |
| `src/AppContext.jsx` | Global state, Firebase sync, auto-scoring logic, spoiler protection (~900 lines) |
| `src/data.js` | Season 50 cast, tribes, scoring events, structured prop bets, `resolveBets()` |
| `src/scoring.js` | Scoring engine, standings, achievement detection, commissioner report |
| `src/importers/deriveGameEvents.js` | Derives granular game events from high-level episode inputs |
| `src/importers/parseTDT.js` | Client-side TrueDorkTimes boxscore parser |
| `src/importers/parseInsider.js` | Client-side InsideSurvivor article parser |
| `functions/index.js` | Firebase Cloud Functions (scheduled + callable) for auto-import |
| `functions/parsers.js` | Server-side HTML parsers (TDT, InsideSurvivor, FSG) + `resolvePropBets()` |
| `src/theme.js` | Color constants for JS |
| `src/styles/theme.css` | Design tokens (CSS custom properties) |
| `database.rules.json` | Firebase security rules (league-scoped + autoImport) |

Other important docs:
- `_bmad-output/build-plan.md` — Full build plan with status
- `_bmad-output/brainstorming/brainstorming-session-2026-03-01-203435.md` — Original feature brainstorm
- `docs/COMPONENTS.md` — Component reference
- `docs/STYLE_GUIDE.md` — Design system
- `.cursor/rules/` — Coding conventions

## What's Next

The app is feature-complete and scoring is fully automated. Potential next steps:
1. **Performance** — Code-split the large JS bundle (~658KB)
2. **Multi-league** — Support switching between leagues, mid-season league creation
3. **Polish** — Activity feed, notification sounds, richer stats visualization
4. **Deploy Cloud Functions** — `firebase deploy --only functions` to activate auto-import
