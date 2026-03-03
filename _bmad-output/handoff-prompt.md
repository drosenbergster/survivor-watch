# Survivor 50 Watch Party App -- Handoff Prompt

Copy everything below this line into a new chat to pick up where we left off.

---

## Context

I'm building a **Survivor 50 Watch Party App** -- a web app where my friend group (4-6 people) picks Survivor contestants, makes predictions, plays bingo, and competes across the full season. We completed an extensive brainstorming session and have a detailed feature document, build plan, and Stitch UI designs in the repo. We're ready to start coding Phase 1.

## Existing Codebase

The repo at the workspace root already has a working foundation:

- **Tech Stack:** Vite 7 + React 19 (JSX) + Tailwind CSS v4 + Firebase (Realtime Database + Auth) + React Router DOM v7
- **Auth:** Firebase magic link sign-in already implemented and working
- **App Shell:** Fijian-themed tabs -- Sevu (Draft), Qito (Bingo), Tovo (Scores), Lawa (Rules)
- **Components:** Fijian design system (`src/components/fijian/`) -- FijianCard, FijianInput, FijianHero, BingoSquare, FijianPrimaryButton, etc.
- **Data:** All 24 Season 50 contestants with tribe assignments in `src/data.js`, bingo trope pool (~58 items), card generation algorithm, scoring events (needs value updates)
- **Styling:** Dark theme with fire/amber accents, theme tokens in `src/theme.js` + `src/styles/theme.css`. Use Tailwind tokens like `text-ochre`, `bg-fire-400`, `shadow-fire`, `animate-flicker`.
- **Demo Mode:** App works without Firebase configured (local-only with demo user)
- **Stitch UI Designs:** Exported to `_bmad-output/stitch-screens/` -- sign-in, bingo, scoreboard, draft, and rules screens in both mobile and desktop variants. Use these as the visual reference.

Key files to read before coding:
- `src/App.jsx` -- main app with tab routing
- `src/AppContext.jsx` -- Firebase auth + realtime DB state management
- `src/data.js` -- Season 50 cast, scoring events, bingo items
- `src/theme.js` -- color constants
- `.cursor/rules/react.mdc` and `.cursor/rules/firebase.mdc` -- coding conventions

## The Game Design (Summary)

Full feature doc at `_bmad-output/brainstorming/brainstorming-session-2026-03-01-203435.md`. Key decisions:

### Core Game Model
- **Weekly Picks (not a season-long draft):** Each episode, every player selects contestants to score for them. Pick count = lesser of 5 or half remaining contestants (rounded down).
- **Ride or Die:** 2 exclusive contestants per player, chosen in a pre-season mini snake draft. Locked all season. Earn 2 pts passive loyalty per episode they survive. Big payouts if they reach finale (15 pts) or win (30 pts). Ride or dies are still in the weekly pick pool for everyone.
- **Scarcity Bonus:** If you're the only player who picked a contestant and they score, you get 1.5x multiplier on their performance points.

### Scoring (All Positive, No Negatives)
- ~60% contestant performance / ~40% owner engagement
- **Contestant Performance:** Tribal immunity win (+3), individual immunity (+10), individual reward (+5), tribal reward (+2), voted correctly (+3), survived tribal with votes against (+5), attended tribal zero votes (+2), survived episode (+2), found idol (+8), played idol successfully (+15), found/used advantage (+5/+10), exile (+3), made merge (+10), made FTC (+20), fire-making win (+10), won game (+50), medevac consolation (+3)
- **Owner Engagement:** Correct elimination prediction (+5), bold prediction correct (+10), prop bet correct (+3 each), tribal snap vote correct (+8), tribal side bet correct (+3 each), bingo line (+5), bingo blackout (+50), Probst Bingo complete (+15), Player of Episode (+7), Impact Rating (1-5 pts), hot take comes true (+8), slow burn comes true (+12), Season Passport picks (15-25 each), Merge Passport picks (8-12 each), jury duty (+2 per tribal attended as juror)

### Predictions System
- **Pre-episode:** Elimination prediction + bold prediction about one of your picks + ~5 prop bets
- **During episode:** Tribal Snap Vote (admin triggers, everyone votes who goes home) + 2-3 side bets
- **Post-episode:** Hot Take (3-episode window, 8 pts) + Slow Burn (rest of season, 12 pts). Both submitted weekly. Group approves/rejects to prevent lazy predictions.
- **Season Passport:** 5 sealed pre-season gut picks (winner, first boot, fan favorite, biggest villain, fire-making winner). Revealed at finale.
- **Merge Passport:** Same 5 questions at merge, half value.

### Episode Flow
1. **Pre-Episode (60 sec):** Set weekly picks, elimination prediction, bold prediction, prop bets
2. **During Episode:** Bingo card, Probst Bingo. Admin triggers "Tribal is Live" -> Snap Vote + side bets
3. **Post-Episode (5 min):** Admin confirms immunity/elimination/big moments. Group votes Player of Episode, Impact Rating. Submit Hot Take + Slow Burn. Admin confirms prop bet and side bet outcomes.
4. **Next Day (optional):** Admin pulls TrueDork Times data for detailed stats (VFB, challenge data)

### Admin Workload
- During episode: 2 button taps (Episode Starting, Tribal is Live)
- Post-episode: 3-5 minutes (confirm game events, prop bet outcomes, side bet outcomes)
- Rare: tribe swap reassignment, merge button
- Data source: [TDT Boxscores](https://truedorktimes.com/s50/boxscores/index.htm) for optional next-day stat imports

### Other Features
- **Bingo:** 5x5 auto-generated card per player per episode. Line = 5 pts, blackout = 50 pts. Probst Bingo sub-card = 15 pts.
- **Target Mechanic:** Leader gets "target" badge. Others get 8 pt "Dethrone" bonus for overtaking first. Holding first 3 weeks = "Sole Survivor of the Standings" badge.
- **Survivor Auction:** Mid-season catch-up mechanic. Fake currency (last place gets 50% more). Bid on game advantages.
- **Auto-Commissioner:** Auto-generated weekly recap with standings, superlatives, streaks. Shareable.
- **Achievements/Badges:** Prophet, Bingo Blackout, Contrarian, Beast Mode, etc.
- **Finale:** Slow burn resolution ceremony, passport reveals, reunion awards, legacy cards.
- **Remote/Async:** Spoiler shield, 24-hour async participation window for post-episode voting.

### Design Principles
1. The TV is the main event. Minimal phone interaction during episodes.
2. 60-second pre-episode. Required actions fit one screen.
3. One-sentence scoring. If you can't explain it simply, simplify it.
4. 3-touch admin. The host shouldn't work harder than anyone else.
5. Friendship first. No mechanic should create real tension.
6. Remote = emotionally connected.

## Build Plan

Full plan at `_bmad-output/build-plan.md`. Nine phases:

| Phase | What | Playable? |
|---|---|---|
| 1. Foundation & League System | League create/join with codes | No |
| 2. Pre-Season Setup | Ride or die draft, Season Passport | No |
| 3. Core Weekly Gameplay | Weekly picks, predictions, prop bets | **YES (MVP)** |
| 4. Bingo | Auto-generated cards, Probst Bingo | Yes |
| 5. Tribal Snap Vote | Live mid-episode voting | Yes |
| 6. Scoring Engine | Auto-scoring, standings, admin input | **YES (full game)** |
| 7. Post-Episode Social | Hot takes, slow burns, social votes | Yes |
| 8. Auto-Commissioner | Weekly reports, achievements, badges | Yes |
| 9. Advanced Features | Merge, auction, finale, remote | Yes (complete) |

## What To Do Next

Start building **Phase 1: Foundation & League System**. Auth already works. The main new work is:
1. Create/Join League screen (admin creates league, gets join code like "BULA42", others join)
2. League Lobby (shows who's joined)
3. Restructure Firebase data model from `games` to `leagues` to support the new mechanics
4. Update `AppContext.jsx` with league-aware state

Maintain the existing Fijian design language, component library, and dark fire/amber theme throughout. Read the Stitch screen exports in `_bmad-output/stitch-screens/` for visual reference.
