---
stepsCompleted: [1, 2, 3]
inputDocuments: []
session_topic: 'Creative features for a Survivor watch party draft/bingo app'
session_goals: 'Generate diverse feature ideas across episode-scoped and season-long timescales'
selected_approach: 'ai-recommended'
techniques_used: ['Cross-Pollination', 'Morphological Analysis', 'Reverse Brainstorming']
ideas_generated: [65+]
context_file: ''
technique_execution_complete: true
---

# Brainstorming Session Results

**Facilitator:** Fam
**Date:** 2026-03-01
**Session Duration:** Extended deep-dive session

---

## Session Overview

**Topic:** Creative features for a Survivor watch party app -- spanning per-episode activities and season-long mechanics, for in-person groups with async remote capability

**Goals:** Generate a big, diverse pile of feature ideas across both timescales, then refine into an intentional, buildable plan

**Techniques Used:**
1. **Cross-Pollination** -- Borrowed mechanics from fantasy sports, bingo, prediction markets, party games, video games, social media
2. **Morphological Analysis** -- Mapped features across timing x activity-type matrix to find gaps (especially remote/async and admin experience)
3. **Reverse Brainstorming** -- "How to make the worst watch party app" to extract design principles and guardrails

---

## Design Principles

These six principles govern every feature decision:

1. **The TV is the main event.** Minimal phone interaction during the episode. The app is the sidekick.
2. **60-second pre-episode.** Required actions fit on one screen in under a minute.
3. **One-sentence scoring.** If you can't explain a scoring event in one sentence, simplify it.
4. **3-touch admin.** The host shouldn't work harder than anyone else during the episode.
5. **Friendship first.** No mechanic should create real tension. Competition serves the friendship.
6. **Remote = emotionally connected.** Remote players should feel like they're missing the couch, not missing the game.

---

## App Overview

**What it is:** A Survivor watch party companion app where friends pick contestants, make predictions, play bingo, and compete across a full season.

**Who it's for:** Friend groups of 2-8 people (ideal 4-6) watching Survivor together, primarily in-person with async remote support.

**Platform:** Web app (mobile-friendly URL, no app store required).

**Build philosophy:** Build for one season, design so multi-season features (career stats, legacy cards) can be added later.

---

## Core Game Model

### Weekly Picks (Path B)

No season-long draft or roster. Each episode, every player selects contestants to score for them that week.

**Pick count rule:** Pick the lesser of **5** or **half the remaining contestants (rounded down)**.

| Season Phase | Remaining | Picks |
|---|---|---|
| Early season (Eps 1-11) | 24 → 10 | 5 |
| Late season (Eps 12-13) | 9-8 | 4 |
| Endgame (Eps 14-15) | 7-6 | 3 |
| Finale (5 remaining) | 5 | 2 |

- All remaining contestants are in the open pool every week -- anyone can pick anyone
- Fresh slate each episode -- no carryover, no lock-in
- Friends who join mid-season can start playing immediately

**Scarcity Bonus:** If you're the ONLY player who picked a contestant and they score points that episode, you earn a **1.5x multiplier** on their performance points. Standard 1x if 2+ people picked them. Rewards contrarian thinking.

### Ride or Die (Season-Long Identity)

Each player selects **2 exclusive ride or die contestants** in a mini snake draft before the season begins. These are locked all season.

- **Exclusive:** No two players can share a ride or die
- **Passive loyalty bonus:** 2 pts per ride or die per episode they survive
- **Still in the weekly pool:** Anyone (including you) can pick your ride or die as a weekly pick -- the ride or die owner just gets the passive bonus on top
- **Deep run payouts:** Ride or die makes the finale = 15 pts. Ride or die wins the game = 30 pts.
- **If eliminated:** Loyalty bonus stops, but ride or die stays on your profile for legacy/career stats

### Pre-Season Setup

1. Admin creates the league, shares a join code
2. Everyone joins (target: under 5 minutes from zero to playing)
3. Randomize pick order for ride or die mini draft (2 rounds, snake format)
4. Everyone fills out their Season Passport (5 gut picks -- see below)
5. Watch the premiere

---

## Scoring System

### Philosophy

- **All positive scoring.** No penalties, no negative points, ever.
- **~60% contestant performance / ~40% owner engagement.** Draft skill matters but smart predictions close the gap.
- **Whole numbers, simple categories.** Every scoring event explainable in one sentence.

### Category A: Contestant Performance Scoring

Points earned by your weekly picks (and passively by your ride or dies). Weekly picks earn full value.

#### A1: Challenge Scoring

| Event | Points | Source |
|---|---|---|
| Your player's tribe wins immunity | 3 | Admin confirms |
| Your player's tribe wins reward | 2 | Admin confirms |
| Your player's tribe places 2nd (3-tribe format) | 1 | Admin confirms |
| Your player wins individual immunity | 10 | Admin confirms |
| Your player wins individual reward | 5 | Admin confirms |

#### A2: Tribal Council Scoring

| Event | Points | Source |
|---|---|---|
| Voted correctly (for the person booted) | 3 | TDT data (next day) or group confirm |
| Survived tribal with votes against them | 5 | TDT data or group confirm |
| Attended tribal, zero votes received | 2 | TDT data or group confirm |
| Survived the episode (no tribal attended) | 2 | Implied from not being eliminated |

#### A3: Big Moments Scoring

| Event | Points | Source |
|---|---|---|
| Found a hidden immunity idol | 8 | Admin/group confirms |
| Successfully played an idol (votes negated) | 15 | Admin/group confirms |
| Found/received any advantage | 5 | Admin/group confirms |
| Successfully used an advantage | 10 | Admin/group confirms |
| Sent to Exile/Journey | 3 | Admin/group confirms |
| Shot in the Dark played successfully (safe) | 15 | Admin/group confirms |
| Made the merge | 10 | Admin confirms (once per season) |
| Made Final Tribal Council | 20 | Admin confirms |
| Won fire-making challenge | 10 | Admin confirms |
| Won the game | 50 | Admin confirms |
| Medical evacuation (consolation) | 3 | Admin confirms |

#### A4: Confessional Scoring (OPTIONAL MODULE)

| Event | Points | Source |
|---|---|---|
| Each confessional | 1 per confessional | Fan-tracked data, next day+ |

Turn on if your group cares about screen time. Turn off to keep it simpler.

### Category B: Owner Engagement Scoring

Points earned by YOU (the player), not your contestants. Equal opportunity regardless of weekly pick quality.

#### B1: Pre-Episode Predictions

| Event | Points | Source |
|---|---|---|
| Correctly predict who's eliminated | 5 | App tracks, auto-resolves on admin elimination confirm |
| Bold prediction about one of your picks comes true | 10 | App tracks, group confirms post-episode |

#### B2: Prop Bets (Pre-Episode)

| Event | Points | Source |
|---|---|---|
| Each correct prop bet | 3 | App generates ~5 yes/no bets, admin confirms outcomes post-episode |

Prop bet examples: "Will an idol be played?" "Over/under 3 confessionals for one player?" "Will someone cry?" "Will there be a revote?" Capped at ~5 per episode, optional but fun.

#### B3: Live Episode Scoring

| Event | Points | Source |
|---|---|---|
| Tribal Snap Vote correct (guess who goes home) | 8 | Admin triggers tribal, confirms result |
| Tribal side bet correct (2-3 yes/no questions) | 3 each | Admin confirms during tribal sequence |
| Bingo line (5 in a row on your card) | 5 | Self-reported, group validates |
| Bingo blackout (entire card complete) | 50 | Self-reported, group validates (replaces line scoring) |
| Probst Bingo complete (all Jeff-isms) | 15 | Self-reported, group validates |

#### B4: Post-Episode Social Scoring

| Event | Points | Source |
|---|---|---|
| Player of the Episode (your nominee wins) | 7 | App presents top 3 stat leaders as nominees, everyone ranks 1-2-3, points on 3-2-1 scale |
| Impact Rating (when a player is eliminated) | 1-5 | Group rates eliminated player's game impact on 1-5 scale, owner earns the averaged score |
| Jury Duty (passive, post-merge) | 2 per tribal attended as juror | Auto-tracked when eliminated player makes jury |

#### B5: Hot Takes & Slow Burns

**Hot Take (weekly, 3-episode window):**
- Submit one after every episode in the 5-minute post-episode window
- Group votes: "Is this hot enough?" Majority yes = locked in. Majority no = rejected, wasted for the week.
- Lives for 3 episodes. If it comes true, anyone can trigger a "Hot Take Alert" and the group confirms. 8 pts.
- If 3 episodes pass without coming true, expires. No penalty.
- Rolling pipeline of up to 3 active hot takes at any time.

**Slow Burn (weekly, rest-of-season window):**
- Submit one after every episode alongside your hot take
- Same group approval process
- Lives until the finale. If it comes true, 12 pts. If not, expires at season's end.
- Unlimited -- one new slow burn per episode, all stay active simultaneously.
- Resolved at the finale in a big reveal ceremony.

**Anti-gaming:** Group approval gate rejects lazy/obvious predictions. Rejected takes earn nothing and can't be resubmitted.

#### B6: Season-Long Predictions

**Season Passport (pre-season, sealed until finale):**
- 5 gut picks locked before the premiere: winner, first boot, fan favorite, biggest villain, fire-making winner
- Each correct pick: 15-25 pts (scaled by difficulty)
- Sealed and revealed at the finale

**Merge Passport (mid-season, sealed until finale):**
- Same 5 questions, re-answered at the merge with updated info
- Each correct pick: 8-12 pts (half value since more info available)
- Sealed and revealed at the finale

---

## Game State Management

The admin maintains the state of the Survivor game. The app auto-calculates all scoring from that state.

### Admin Actions

**During the episode (2 live touches):**
1. Hit "Episode Starting" button (locks all pre-episode predictions and weekly picks)
2. Hit "Tribal is Live" button (opens Tribal Snap Vote and side bets for all players)

**Post-episode (3-5 minutes):**
3. Confirm who won immunity (individual or tribal)
4. Confirm who was eliminated (and how: voted out, medevac, quit)
5. Confirm big moments via group confirmation round: idol finds/plays, advantages, exile
6. Confirm prop bet outcomes (4-6 yes/no taps)
7. Confirm tribal side bet outcomes (2-3 yes/no taps)

**Special game state updates (rare, 1-2 minutes when they happen):**
- Tribe swap: reassign contestants to new tribes in the app
- Merge: hit "Merge" button, name merged tribe
- These happen post-episode, not mid-episode. No need to scramble during the show.

**Optional next-day enhancement (5 minutes):**
- Pull per-episode data from TrueDork Times for detailed stats (VFB, challenge data, vote counts)
- Core game works without this; it's a bonus stat layer

### Automatic Calculations

Once the admin inputs game state, the app handles:
- All challenge scoring (admin says "Kalo wins immunity" → every Kalo member gets points → flows to their owners)
- All tribal council scoring (from TDT data or group confirms)
- All prediction resolution (elimination confirm auto-resolves pre-episode picks, snap votes)
- Ride or die loyalty bonuses (passive, every episode)
- Jury duty points (passive, auto-tracked)
- Standings, streaks, achievements
- Auto-commissioner report generation

---

## Bingo System

### Main Bingo Card

- **5x5 grid** (25 squares) auto-generated each episode from a master list of ~75-100 Survivor tropes
- Each player gets a DIFFERENT randomly-arranged card
- Center square is free ("Jeff says 'come on in'" or similar guaranteed event)
- During the episode, mark squares as events happen on screen
- **Scoring:** Got a line of 5 = **5 pts**. Full blackout (all 25) = **50 pts** (replaces line scoring).
- New card every episode
- Honor system with social accountability (friends call BS on false claims)

### Probst Bingo (Separate Sub-Card)

- Smaller card (3x3 or 4x4) of exclusively Jeff Probst quotes and mannerisms
- "Worth playing for?" / "Got nothin' for ya" / "Dig deep!" / "The tribe has spoken" / etc.
- Complete the full Probst card = **15 pts**
- Runs alongside the main bingo card every episode

### Example Master List Categories

- Jeff-isms and catchphrases
- Emotional moments (crying, hugging, arguments)
- Strategic events (lying, whispering at tribal, alliance discussions)
- Challenge elements (water, balance, puzzles, endurance)
- Camp life (fire, rain, food, shelter)
- Tribal council events (idol plays, advantages, dramatic votes)
- Production moments (dramatic music sting, close-up of an animal, sunset shot)

---

## Episode Flow

### Pre-Episode (60 seconds, one screen)

1. Select your weekly picks (5 or fewer based on remaining contestants)
2. Lock in elimination prediction (who goes home tonight?)
3. Lock in bold prediction about one of your picks
4. Fill out prop bets (optional, ~5 quick yes/no questions)
5. Done. Put your phone down.

### During Episode

- Bingo card running passively (mark squares as events happen)
- Probst Bingo running alongside
- **Admin triggers "Tribal is Live"** → everyone gets push notification
- Lock in Tribal Snap Vote (who's going home?)
- Lock in tribal side bets (2-3 quick yes/no: idol played? revote? tears?)
- Votes lock when Jeff says "I'll read the votes"
- **Otherwise: watch the show. The TV is the main event.**

### Post-Episode (5 minutes)

1. **Admin confirms:** immunity winner, elimination, how they were eliminated
2. **Group confirmation round:** "What big moments happened?" (idol finds, advantages, exile -- quick yes/no taps, majority rules)
3. **Player of the Episode:** App shows top 3 nominees, everyone ranks 1-2-3
4. **Impact Rating** (if someone was eliminated): Group rates 1-5
5. **Hot Take + Slow Burn submission:** Everyone types their two predictions, group approves/rejects
6. **Admin confirms prop bet and side bet outcomes** (quick yes/no taps)
7. **Bingo claims finalized** (anyone claiming a line or blackout, group validates)

### Next Day (Optional)

- Admin pulls TDT episode data for detailed stat scoring (VFB, challenge breakdowns)
- Auto-commissioner report generates and pushes to the group

### Between Episodes

- Auto-commissioner weekly report (standings, biggest mover, best/worst predictions, streaks, hot take tracker)
- Optional mid-week mini-engagement (trivia question, poll, quote quiz -- one touch point, 15 seconds)
- Players can review their active hot takes and slow burns
- Players can review standings, achievements, ride or die status

---

## Special Episode Handling

| Episode Type | How It Works |
|---|---|
| **Double tribal** (2 tribes go to tribal) | Both tribals scored. Two snap votes triggered. Big scoring episode. |
| **Double elimination** | Both eliminations scored. Two impact ratings. Two waiver-style events. |
| **Non-elimination episode** (recap, special) | Admin marks "no elimination." Elimination predictions void (no penalty). Challenges and bingo still score. |
| **Tribe swap** | Admin reassigns contestants to new tribes post-episode. Future tribal scoring follows new assignments. |
| **Merge** | Admin hits "Merge" button. Tribal challenge scoring stops. Individual-only going forward. Merge Passport unlocks. Jury tracking begins. All surviving players earn merge bonus (10 pts). |
| **Rock draw** | Eliminated player treated like medevac (bad luck consolation: 3 pts). |
| **Fire-making (Final 4)** | Winner earns 10 pts (like individual immunity). Loser eliminated normally. |
| **Shot in the Dark** | Played successfully = 15 pts. Played and fails = 0 pts (no penalty). |
| **Two-hour premiere/episode** | Treated as two scoring episodes. Double predictions, double bingo cards, double snap votes. |
| **Medical evacuation** | Player removed. 3 pts "Fallen Warrior" consolation. Owner's ride or die bonus stops if applicable. |
| **Finale (5 remaining)** | Season Passport reveal. All slow burns resolved. Pick 2 contestants. Ride or die payouts. Champion crowned. Legacy cards generated. |

---

## Tribe & Contestant Management

The app tracks the structure of the Survivor game as it evolves:

- **Pre-season:** Admin inputs all contestants and assigns starting tribes
- **Each episode:** Admin updates game state (challenge winners, eliminations, big moments)
- **Tribe swaps:** Admin reassigns players to new tribes (post-episode, 1-2 minutes)
- **Merge:** Admin marks merge, switches from tribal to individual scoring mode
- **Eliminations:** Contestant removed from active pool, jury tracking begins if post-merge

All scoring auto-calculates from the game state. Admin says "Kalo wins immunity" and every Kalo member's owners receive points automatically.

---

## Data Sources

### Primary: Admin + Group Input (episode night)

- Challenge results, eliminations, big moments
- Handles 100% of core scoring
- 5-8 admin taps per episode + group confirmation round

### Secondary: TrueDork Times (next day, optional)

- Per-episode stats: VFB (voted correctly), VAP (votes against), challenge data, vote counts
- Source: [TDT Survivor 50 Boxscores](https://truedorktimes.com/s50/boxscores/index.htm) and [Season Stats Spreadsheet](https://docs.google.com/spreadsheets/d/1hkt7EQWcG6VfVoiBIdoV1c8J9jBE1fWFm5KZTten7Io/)
- Enhances Tier 1 scoring with detailed tribal council data
- Could eventually be automated with a scraper

### Tertiary: Fan Community (next day+, optional)

- Confessional counts (if optional module is enabled)
- Can take 1-2 days to finalize

---

## Social & Engagement Features

### Auto-Commissioner Report

After each episode, the app auto-generates a shareable recap:
- Updated standings
- Biggest mover of the week
- Worst prediction of the week
- Best hot take that resolved
- Slow burns still cooking
- Streak updates
- Achievement unlocks
- Ride or die status check
- "Headline" in ESPN-style tone

Push notification to the group. Shareable card format for iMessage/group chat. Zero effort from anyone.

### Achievements & Badges

Unlocked throughout the season for accomplishments:
- **"Prophet"** -- 3 correct elimination predictions in a row
- **"Bingo Blackout"** -- complete an entire bingo card
- **"Jeff's Favorite"** -- complete Probst Bingo 3 times
- **"Hot Streak"** -- 3 hot takes come true in a row
- **"Contrarian"** -- win 5 scarcity bonuses (unique picks that scored)
- **"Ride or Die Loyalty"** -- both ride or dies survive to merge
- **"Speed Demon"** -- first to lock in Tribal Snap Vote 3 times
- **"Beast Mode"** -- one of your picks scores 20+ in a single episode

Badges display on your profile. Secondary objectives beyond winning.

### The Target on Your Back

The player in first place gets a "target" badge. Everyone ELSE gets a one-time **"Dethrone" bonus (8 pts)** if they overtake first place that week. The leader gets nothing extra for staying on top. Holding first for 3 consecutive weeks despite the target = **"Sole Survivor of the Standings"** badge.

Natural rubber-banding mechanic that keeps standings competitive.

### Survivor Auction (Mid-Season Event)

Once per season (at the merge episode), the app runs a Survivor Auction:
- Everyone gets fake currency budget (last place gets 50% more, second-to-last gets 25% more)
- Auction items: "Double your bold prediction points next week," "Peek at someone's hot takes before they're revealed," "Extra weekly pick slot for one episode," "Immunity from the Target mechanic for one week"
- Live bidding in the room
- Serves as a catch-up mechanic for trailing players

---

## Remote / Async Player Experience

### Live Remote (watching at the same time, different location)

- All pre-episode, prediction, and scoring features work identically on your phone
- **Watch-Along Pulse:** Simplified live feed showing when in-person players react (someone hit bingo, someone locked in snap vote, the room is going crazy). Emotional connection without full video call awkwardness.

### Async Remote (watching later)

- **Spoiler Shield:** App hides all results, predictions, and the social feed until the player marks the episode as watched
- After marking watched, a 24-hour window opens for:
  - Post-episode social votes (Player of Episode, Impact Rating)
  - Hot take and slow burn submissions
  - Bingo claim (honor system)
- **Cannot submit:** Pre-episode predictions, snap vote, side bets (you can't predict after watching)
- Season-long game stays intact; live-only moments are missed but the gap is manageable

---

## Finale Experience

### The Slow Burn Resolution Ceremony

All remaining slow burns resolve one by one as finale milestones happen. The app queues them: "Fam predicted in Episode 3 that Cirie makes FTC. Let's find out..." Creates a second layer of reveals on top of the Survivor finale.

### Season Passport Reveal

Sealed pre-season picks cracked open as finale events happen. Running score tally builds drama. "You picked HER to win back in week one?!"

### Merge Passport Reveal

Same ceremony, half the stakes. Mid-season reads exposed.

### Reunion Awards

After the finale, the app runs a "Reunion Show" for the group:
- **Auto-generated awards:** Best Draft Pick (ride or die), Worst Take of the Season, Luckiest Player, Best Rivalry, Biggest Comeback
- **Group-voted awards:** MVP, Most Entertaining Player, Best Hot Take of the Season
- **Champion crowned** (group vote to break ties)
- **Legacy cards generated** for each player: best prediction, worst take, final ranking, badges earned, rival, signature moment

### Next Season Teaser

"Season [X+1] draft opens in [countdown]. Will [champion] defend? Will [last place] have their revenge?" Retention hook.

---

## Onboarding

### 5-Minute Setup

1. One person creates the league, shares a join code
2. Everyone joins on their phone (web app URL)
3. Ride or die mini draft (2 rounds, randomized order, 2-3 minutes)
4. Everyone fills out Season Passport (2 minutes)
5. Ready to play

### Tutorial Episode

First episode runs in "tutorial mode" -- the app explains each feature as it naturally comes up:
- "Time for your pre-episode picks! Here's how it works..."
- "Tribal is happening -- tap to lock in your vote!"
- By end of Episode 1, everyone knows the app without reading instructions

---

## Tiebreakers

If two players are tied in total points at season's end: **group votes on the champion** (Survivor jury style). The group knows who played the best game -- let them decide.

---

## Multi-Season Design

Build for one season, but design the data model so these features can be added:

- **Career stats** across seasons (total points, total correct predictions, badges earned)
- **Legacy cards** that stack up -- a time capsule of your group's Survivor history
- **Returning champion mechanics** (previous winner gets the "target" badge from Episode 1?)
- **Season-over-season rivalry tracking**
- **All-time leaderboard**

---

## Admin Quick Reference

### During Episode (2 taps):
1. "Episode Starting" (locks predictions)
2. "Tribal is Live" (opens snap vote)

### Post-Episode (3-5 minutes):
3. Confirm immunity winner
4. Confirm elimination (who + how)
5. Group big-moment confirmation (idol/advantage/exile -- yes/no taps)
6. Confirm prop bet outcomes (~5 yes/no taps)
7. Confirm tribal side bet outcomes (2-3 yes/no taps)

### Rare Events:
- Tribe swap: reassign contestants (1-2 min)
- Merge: hit merge button (10 seconds)

### Optional Next Day:
- Pull TDT episode data for bonus stats (5 min)

---

## Technical Notes

### Data Model Essentials

- **Contestants:** name, photo, current tribe, status (active/eliminated/medevac/jury), elimination episode
- **Tribes:** name, members, active/merged status
- **Players:** username, ride or dies, weekly picks per episode, predictions, scores, badges
- **Episodes:** number, type (standard/double/finale), game state changes, scoring events
- **Predictions:** type (elimination/bold/hot take/slow burn/passport), content, status (active/resolved/expired), approval votes
- **Bingo cards:** per-player per-episode, squares from master list, completion status

### Key External Data Source

- [TrueDork Times Boxscores](https://truedorktimes.com/s50/boxscores/index.htm) -- per-episode stats updated after each episode
- [TDT Stats Spreadsheet](https://docs.google.com/spreadsheets/d/1hkt7EQWcG6VfVoiBIdoV1c8J9jBE1fWFm5KZTten7Io/) -- full season data with glossary

---

## Creative Facilitation Narrative

This brainstorming session evolved from a broad "Survivor watch party app" concept into a fully designed game system through three creative techniques. Cross-pollination from fantasy sports, bingo, prediction markets, and party games generated 50+ raw ideas. Morphological analysis revealed critical gaps in the remote/async experience and admin tooling. Reverse brainstorming surfaced the six design principles that became the quality filter for every feature.

The pivotal moment was the shift from Path A (full fantasy draft with rosters) to Path B (weekly picks with ride or dies) -- simplifying the core mechanic while maintaining strategic depth through the rich prediction and social scoring layers.

### Key Breakthrough Moments
- The Tribal Snap Vote concept (live mid-episode prediction triggered by admin)
- Hot takes with group approval as anti-gaming mechanic
- Short burn / slow burn dual prediction system
- The "pick 5 or half remaining" scaling rule
- TrueDork Times as structured data source for automated scoring
- Post-episode admin workflow (not mid-episode) for all game state management
