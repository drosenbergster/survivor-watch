# Survivor 50 Watch Party App — Build Plan

## Current Status: All Phases Complete ✅

All 9 development phases have been implemented. A UX audit was conducted and all identified issues (P0–P2) have been resolved. The Hot Take / Slow Burn free-text prediction system was removed post-audit to reduce user friction.

---

## Tech Stack

- **Build Tool:** Vite 7
- **Frontend:** React 19 (JSX, hooks, functional components)
- **Styling:** Tailwind CSS v4 with custom Fijian theme tokens
- **Backend/DB:** Firebase (Realtime Database + Auth)
- **Auth:** Firebase Magic Link (email)
- **Hosting:** GitHub Pages (configured) or Vercel
- **Component Library:** Fijian-themed components (`FijianCard`, `FijianInput`, `FijianHero`, `BingoSquare`, etc.)

## Design Language

- Dark backgrounds (stone-950 / near-black)
- Orange/amber accent palette: `fire-400` (#e8722a), ochre tones
- Survivor 50 branding with flame icon
- Fijian section naming: Sevu (Draft/Picks), Qito (Bingo), Tovo (Scores), Lawa (Rules), Profile
- Card-based layouts for player standings
- Quick-tap button patterns for admin inputs
- Mobile-first, responsive to desktop
- Theme tokens via Tailwind: `text-ochre`, `bg-fire-400`, `shadow-fire`, `animate-flicker`

---

## Architecture Decisions

### Player-Driven Episode Flow (Async Refactor)
The original design had the host globally lock episodes and trigger tribal council for all players. This was refactored to a **player-driven model** where:
- Each player controls their own viewing timeline via "Light Your Torch" (locks picks, activates bingo)
- Each player marks themselves as "watched" when done
- Tribal Snap Vote is self-triggered by each player when they reach tribal council
- The host is responsible for: creating episodes, inputting scoring events, managing tribes
- Episode states are global (`open` → `scored`), but watch progress is per-player (`watching` → `watched`)

### Hot Take / Slow Burn Removal
Free-text prediction features (Hot Take and Slow Burn) were removed after the UX audit. They required too much user effort and duplicated the simpler structured prediction mechanics. The app retains: weekly elimination picks, bold predictions, prop bets, snap votes, and side bets.

### UX Audit Fixes Applied
- **P0:** Fixed render-body setState in Predictions.jsx and WeeklyPicks.jsx (moved to useEffect)
- **P0:** Bingo marks now load from Firebase and display on BingoCard
- **P1:** Dynamic Tailwind classes in FinaleMode.jsx replaced with COLOR_MAP + inline styles
- **P1:** FijianInput labels now properly associated via htmlFor/id (useId)
- **P2:** Error handling added to MergePassport and LightYourTorch
- **P2:** Player colors expanded from 4 to 8
- **P2:** Removed non-functional decorative tabs from AuthScreen
- **P2:** Fixed misleading "Drag" copy in TribeManagement
- **P2:** Added number input alongside auction bid slider

---

## Phase Summary

### Phase 1: Foundation & League System ✅
League creation/joining with join codes (e.g., "BULA42"). Firebase data model restructured for league-based multiplayer.

### Phase 2: Pre-Season Setup ✅
Contestant gallery, ride-or-die snake draft (2 per player), Season Passport (5 sealed predictions).

### Phase 3: Core Weekly Gameplay ✅
Weekly picks (up to half remaining contestants), pre-episode predictions (elimination, bold, prop bets). Player-driven pick locking via "Light Your Torch."

### Phase 4: Bingo ✅
5x5 auto-generated cards per player per episode. Tap-to-mark, line detection, blackout detection, "BULA!" celebration. Cards seeded by `{leagueId}-{episodeNum}-{playerId}`. Marks saved to Firebase and restored on reload.

### Phase 5: Tribal Snap Vote ✅
Player-triggered snap vote during tribal council. Side bets (yes/no). Async-friendly — players can pause and vote at their own pace.

### Phase 6: Scoring Engine & Admin Input ✅
Full scoring engine with contestant performance, prediction scoring, ride-or-die bonuses, scarcity multiplier, bingo scoring, and social scoring. Admin inputs game events post-episode.

### Phase 7: Post-Episode Social ✅
Player of the Episode (ranked voting), Impact Rating (1-5 scale for eliminated contestants). ~~Hot Take and Slow Burn~~ removed.

### Phase 8: Auto-Commissioner & Achievements ✅
Auto-generated weekly recap (headlines, superlatives, standings snapshot, badges). Achievement system with 10 badges (Prophet, Beast Mode, Contrarian, etc.). Player Profile with stats and badge wall.

### Phase 9: Advanced Features ✅
- **Tribe Management:** Admin tools for tribe swaps and merge
- **Merge Passport:** 5 mid-season predictions (half-value)
- **Survivor Auction:** Bidding with fake currency, host-driven item management
- **Finale Mode:** Passport reveals, reunion awards, legacy cards, champion crowning

---

## Scoring System (Final)

### Contestant Performance (~60%)
| Event | Points |
|-------|--------|
| Survived episode | +2 |
| Tribal immunity win | +3 |
| Individual immunity | +10 |
| Individual reward | +5 |
| Tribal reward | +2 |
| Voted correctly | +3 |
| Survived tribal (votes against) | +5 |
| Attended tribal (zero votes) | +2 |
| Found idol | +8 |
| Played idol successfully | +15 |
| Found advantage | +5 |
| Used advantage | +10 |
| Exile | +3 |
| Made merge | +10 |
| Made FTC | +20 |
| Fire-making win | +10 |
| Won game | +50 |

### Owner Engagement (~40%)
| Category | Points |
|----------|--------|
| Correct elimination prediction | +5 |
| Bold prediction correct | +10 |
| Prop bet correct | +3 each |
| Snap vote correct | +8 |
| Side bet correct | +3 each |
| Bingo line | +5 |
| Bingo blackout | +50 |
| Player of Episode (voted #1) | +7 |
| Impact Rating | avg (1-5) pts |
| Ride or Die survive per ep | +2 |
| Ride or Die reach finale | +15 |
| Ride or Die win | +30 |
| Scarcity bonus | 1.5x multiplier |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app, tab routing, league flow |
| `src/AppContext.jsx` | Global state, Firebase sync, all game actions |
| `src/data.js` | Contestants, tribes, scoring events, bingo items, achievements |
| `src/scoring.js` | Scoring engine, standings, achievements, commissioner report |
| `src/theme.js` | Color constants for JS |
| `src/styles/theme.css` | Design tokens (CSS custom properties) |
| `database.rules.json` | Firebase security rules |

---

## Reference Files

- Feature Brainstorm: `_bmad-output/brainstorming/brainstorming-session-2026-03-01-203435.md`
- Stitch Screen Designs: `_bmad-output/stitch-screens/`
- Handoff Prompt: `_bmad-output/handoff-prompt.md`
