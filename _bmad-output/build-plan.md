# Survivor 50 Watch Party App -- Build Plan

## Tech Stack (aligned with existing codebase)

- **Build Tool:** Vite 7
- **Frontend:** React 19 (JSX, hooks, functional components)
- **Styling:** Tailwind CSS v4 with custom Fijian theme tokens
- **Backend/DB:** Firebase (Realtime Database + Auth)
- **Auth:** Firebase Magic Link (email) -- already implemented
- **Routing:** React Router DOM v7
- **Hosting:** GitHub Pages (configured) or Vercel
- **Component Library:** Existing Fijian-themed components (`FijianCard`, `FijianInput`, `FijianHero`, `BingoSquare`, etc.)

## What Already Exists

- Firebase auth with magic link sign-in (working)
- Firebase Realtime Database sync (working)
- All 24 Season 50 contestants with tribe data (`src/data.js`)
- Bingo item pool (~58 tropes) with card generation algorithm
- Scoring events (needs value updates to match brainstorm)
- App shell with Fijian-named tabs: Sevu (Draft), Qito (Bingo), Tovo (Scores), Lawa (Rules)
- Fijian component library for consistent styling
- Dark theme with fire/amber color system (`src/theme.js`, `src/styles/theme.css`)
- Demo mode (works without Firebase configured)

## Design Language (from Stitch screens + existing code)

- Dark backgrounds (stone-950 / near-black)
- Orange/amber accent palette: `fire-400` (#e8722a), ochre tones
- Survivor 50 branding with flame icon
- Fijian section naming: Sevu (Draft/Picks), Qito (Bingo), Tovo (Scores), Lawa (Rules)
- Card-based layouts for player standings
- Quick-tap button patterns for admin inputs
- Mobile-first, responsive to desktop
- Theme tokens via Tailwind: `text-ochre`, `bg-fire-400`, `shadow-fire`, `animate-flicker`

---

## Phase 1: Foundation & League System
**Goal:** Auth already works. Add league creation/joining so friends can connect.
**Playable after this phase?** No, but the group is assembled.

### Already Done:
- Sign-in with magic link (AuthScreen component exists)
- App shell with Fijian tabs (AppShell, TabNav exist)
- Firebase Realtime Database sync (AppContext exists)
- Demo mode for local development

### New Work:
1. **Create/Join League screen** -- Admin creates league with a name, gets a join code. Others enter code to join.
2. **League Lobby** -- Shows who's joined, waiting for everyone before starting.
3. **Update Firebase data model** -- Restructure from current `games` model to support league-based multiplayer with the new game mechanics.

### Technical:
- Firebase data structure: `leagues/{leagueId}/members`, `leagues/{leagueId}/episodes`, etc.
- Join code generation (short alphanumeric, e.g. "BULA42")
- Update `AppContext.jsx` with league-aware state management
- Update `database.rules.json` for league-based access control

### Deliverable:
Friends sign in, create or join a league with a code, and see each other in the lobby.

---

## Phase 2: Pre-Season Setup
**Goal:** Contestants loaded, ride or die draft complete, Season Passport filled out.
**Playable after this phase?** Not yet, but the season is set up.

### Screens:
1. **Contestant Gallery** -- All Season 50 contestants with photos, organized by starting tribe
2. **Ride or Die Draft** -- 2-round snake draft. Shows pick order, available contestants, who's been taken. Each player picks 2 exclusive ride or dies.
3. **Season Passport** -- 5-question sealed prediction form (winner, first boot, fan favorite, biggest villain, fire-making winner). Locked once submitted.
4. **Season Overview** -- Dashboard showing your ride or dies, your sealed passport status, league members

### Technical:
- Contestant data already exists in `src/data.js` (24 contestants, 3 tribes)
- Firebase paths: `leagues/{id}/rideOrDies`, `leagues/{id}/passports`
- Draft logic: snake order, exclusive picks, real-time updates via Firebase Realtime DB
- Passport sealing: stored in Firebase, hidden from other players until finale

### Deliverable:
Draft night is complete. Everyone has their 2 ride or dies and sealed passport.

---

## Phase 3: Core Weekly Gameplay
**Goal:** Players can make their weekly picks and pre-episode predictions.
**Playable after this phase?** YES -- the core game loop works.

### Screens:
1. **Weekly Picks** -- Select up to 5 (or half remaining) contestants for this episode. Shows all remaining contestants by tribe, your selections, scarcity info (who others have picked, if picks are locked). Pick deadline countdown.
2. **Pre-Episode Predictions** -- One screen with:
   - Elimination prediction (dropdown of all remaining contestants)
   - Bold prediction (free text about one of your picks)
   - Prop bets (~5 yes/no toggles, auto-generated)
3. **Episode Lock Screen** -- "Episode is LIVE" state. Predictions locked. Shows your picks, your predictions, bingo card link. Countdown or live status.

### Technical:
- Firebase paths: `leagues/{id}/episodes/{epNum}/picks`, `leagues/{id}/episodes/{epNum}/predictions`
- Pick validation: enforce max picks based on remaining contestants (from `data.js` minus eliminated)
- Lock mechanism: admin "Episode Starting" button updates episode state in Firebase, freezes all pre-episode inputs via Realtime DB listener
- Episode state machine: `setup` → `pre_episode` → `live` → `tribal` → `post_episode` → `scored`

### Deliverable:
Before each episode, everyone opens the app, makes their picks and predictions in 60 seconds, and locks in. The core ritual is live.

---

## Phase 4: Bingo
**Goal:** Bingo cards working during episodes.
**Playable after this phase?** Yes, and episodes are now more fun.

### Screens:
1. **Bingo Card (Qito)** -- 5x5 grid auto-generated per player per episode. Tap squares to mark. Line detection (row/column/diagonal). Blackout detection. "BULA!" celebration animation on bingo.
2. **Probst Bingo** -- Smaller sub-card (3x3 or 4x4) of Jeff-isms. Separate completion tracking.
3. **Bingo History** -- Past episode cards and results.

### Technical:
- Master trope list already exists in `src/data.js` (BINGO_ITEMS, ~58 items -- expand to ~75-100)
- Card generation algorithm already exists (`generateBingoCard` function with seeded shuffle)
- Per-player per-episode unique cards (use `{leagueId}-{episodeNum}-{playerId}` as seed)
- `BingoSquare` component already exists -- add line detection logic
- Firebase paths: `leagues/{id}/episodes/{epNum}/bingo/{playerId}` for card state

### Deliverable:
During each episode, everyone has a unique bingo card on their phone. Tap squares as events happen. "BULA!" when you get a line.

---

## Phase 5: Tribal Snap Vote & Live Features
**Goal:** The mid-episode tribal council experience works.
**Playable after this phase?** Yes, and tribal council becomes electric.

### Screens:
1. **Admin Trigger Panel** -- Two big buttons: "Episode Starting" (locks predictions) and "Tribal is Live" (opens snap vote). Simple, fast.
2. **Tribal Snap Vote** -- Push notification / alert: "TRIBAL IS LIVE -- Who's going home?" Player taps a contestant, locks in. Timer visible. 
3. **Tribal Side Bets** -- 2-3 quick yes/no questions alongside the snap vote: "Will an idol be played?" "Will there be tears?"

### Technical:
- Firebase Realtime Database for live state updates (already configured for real-time sync)
- Admin controls: update episode state to `tribal` in Firebase
- All players see snap vote screen when state changes (Realtime DB `onValue` listener)
- Vote locking mechanism via Firebase state
- Firebase paths: `leagues/{id}/episodes/{epNum}/snapVotes`, `leagues/{id}/episodes/{epNum}/sideBets`

### Deliverable:
Admin hits one button, everyone's phone lights up with "TRIBAL IS LIVE." Lock in your vote before Jeff reads the votes.

---

## Phase 6: Scoring Engine & Admin Input
**Goal:** Points actually work. Admin can input game events and scores auto-calculate.
**Playable after this phase?** Yes, and the competitive game is fully live.

### Screens:
1. **Admin Post-Episode Input** -- Select events that happened:
   - Which tribe(s) won immunity/reward
   - Who won individual immunity/reward
   - Who was eliminated (and how)
   - Big moments: idol finds, idol plays, advantages, exile
   - Group confirmation mode: push each event to group for majority confirm
2. **Scoring Breakdown** -- Per-player per-episode breakdown: "Your pick Ozzy: Tribal immunity +3, Voted correctly +3, Survived +2 = 8 pts"
3. **Season Standings (Tovo)** -- Leaderboard with total scores, ride or die status, weekly movement arrows, Target badge on leader

### Technical:
- Scoring engine: takes game state events → calculates points per contestant → maps to player picks → applies scarcity bonus → sums
- Update `SCORE_EVENTS` in `src/data.js` to match brainstormed values (remove negatives, update point values)
- Firebase paths: `leagues/{id}/episodes/{epNum}/gameEvents`, `leagues/{id}/scores`
- Auto-calculation triggers on game event input (Firebase function or client-side compute)
- Ride or die passive loyalty bonus: auto-applied each episode
- Target mechanic: detect leader, apply dethrone bonus logic

### Deliverable:
Admin inputs what happened, app calculates everything. Standings update. The competitive game is real.

---

## Phase 7: Post-Episode Social & Predictions
**Goal:** Hot takes, slow burns, social votes all working.
**Playable after this phase?** Yes, and the post-episode ritual is complete.

### Screens:
1. **Post-Episode Hub** -- One screen that walks through:
   - Player of the Episode (nominees + ranking vote)
   - Impact Rating (1-5 scale if someone was eliminated)
   - Hot Take submission (free text, 3-episode window)
   - Slow Burn submission (free text, season-long)
   - Group approval voting on submitted takes
2. **Prediction Board** -- View all your active hot takes and slow burns, their status (active/resolved/expired), resolution history
3. **Hot Take Alerts** -- When someone triggers "this came true," group votes to confirm

### Technical:
- Firebase paths: `leagues/{id}/hotTakes`, `leagues/{id}/slowBurns`, `leagues/{id}/socialVotes`
- Expiration logic: hot takes expire after 3 episodes, slow burns at finale
- Group approval workflow: submit → others vote → majority approve/reject
- Resolution workflow: anyone triggers → group confirms → points awarded

### Deliverable:
The full post-episode ceremony works. Hot takes and slow burns accumulate throughout the season.

---

## Phase 8: Auto-Commissioner & Achievements
**Goal:** Between-episodes engagement and gamification layer.
**Playable after this phase?** Yes, and the app has a life between episodes.

### Screens:
1. **Weekly Report (Auto-Commissioner)** -- Auto-generated after scoring: standings, biggest mover, worst prediction, best hot take, streak updates, headline. Shareable card format.
2. **Achievements/Badges** -- Badge wall on profile. Unlock notifications.
3. **Player Profile** -- Ride or dies, badges, season stats, prediction accuracy, hot take record
4. **Activity Feed** -- Recent events across the league

### Technical:
- Report generation logic: query Firebase scoring data, identify superlatives, generate text
- Achievement detection: listen for qualifying events via Firebase, award badges
- Badge definitions in `src/data.js` alongside other game constants
- Firebase paths: `leagues/{id}/achievements/{playerId}`, `leagues/{id}/reports/{epNum}`

### Deliverable:
The app generates content that sparks mid-week conversation. Badges give secondary objectives.

---

## Phase 9: Advanced Features
**Goal:** Full feature set including merge, auction, finale, remote support.
**Playable after this phase?** Yes, with the complete experience.

### Screens:
1. **Merge Passport** -- Unlocks at merge, same 5 questions as Season Passport
2. **Survivor Auction** -- Mid-season event: fake currency, live bidding, advantage items
3. **Tribe Management** -- Admin screen for tribe swaps and merge
4. **Finale Mode** -- Slow burn resolution ceremony, passport reveals, reunion awards, legacy cards, champion crowning
5. **Remote Player Experience** -- Spoiler shield, async participation windows, watch-along pulse

### Technical:
- Tribe swap/merge admin tools
- Auction bidding logic with catch-up currency distribution
- Finale resolution sequence (ordered reveal of predictions)
- Legacy card generation
- Spoiler shield: per-player episode-watched tracking

### Deliverable:
The complete Survivor watch party experience, start to finish.

---

## Development Priority & Timeline

If targeting Survivor 50 (currently airing):

| Phase | Effort | Can Play After? |
|---|---|---|
| Phase 1: Foundation & Auth | 1-2 days | No |
| Phase 2: Pre-Season Setup | 2-3 days | No |
| Phase 3: Core Weekly Gameplay | 2-3 days | **YES -- MVP** |
| Phase 4: Bingo | 1-2 days | Yes + bingo |
| Phase 5: Tribal Snap Vote | 1-2 days | Yes + live tribal |
| Phase 6: Scoring Engine | 2-3 days | **YES -- full game** |
| Phase 7: Post-Episode Social | 2-3 days | Yes + social |
| Phase 8: Auto-Commissioner | 1-2 days | Yes + engagement |
| Phase 9: Advanced Features | 3-5 days | Yes + everything |

**MVP (Phases 1-3): ~5-8 days.** Friends can sign in, pick contestants, make predictions.
**Full Game (Phases 1-6): ~10-16 days.** Scoring works, standings update, competition is real.
**Complete Experience (Phases 1-9): ~16-25 days.** Everything we brainstormed, fully built.

---

## Files from Brainstorming Session

- Feature Document: `_bmad-output/brainstorming/brainstorming-session-2026-03-01-203435.md`
- Stitch Screen Designs: `_bmad-output/stitch-screens/`
- Build Plan: `_bmad-output/build-plan.md` (this file)
