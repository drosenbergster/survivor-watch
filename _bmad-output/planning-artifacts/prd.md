---
stepsCompleted: ['discovery', 'vision', 'executive-summary', 'success', 'journeys', 'domain', 'scoping', 'functional', 'nonfunctional']
inputDocuments:
  - '_bmad-output/build-plan.md'
  - '_bmad-output/brainstorming/brainstorming-session-2026-03-01-203435.md'
  - 'Season 50 retrospective (live session, 2026-09-20)'
workflowType: 'prd'
---

# Product Requirements Document - Survivor Watch Party (Season 51)

**Author:** Fam
**Date:** 2026-09-20
**Status:** Draft for review
**Supersedes:** Season 50 implementation documented in `_bmad-output/build-plan.md`

---

## Executive Summary

The Survivor Watch Party app is a companion game for a small group of friends (currently 4, hoping to grow) who watch Survivor on their own schedules. Season 50 shipped a large, ambitious feature set: a pre-season snake draft, Ride or Die contestants, weekly picks, bingo, prop bets, an auction, achievement badges, Player of the Episode voting, and impact ratings.

The Season 50 retrospective produced a clear verdict. **Bingo worked.** The moments the group actually enjoyed were the well-written bingo squares and the funny things the app called out. Almost everything built on top of competitive optimization — the draft, Ride or Dies, the auction, Player of the Episode, impact ratings, badges — either went unused or actively felt hollow, because ranked voting and optimization mechanics have no nuance in a four-person league.

Season 51 is a deliberate contraction. **Bingo becomes the centerpiece.** Predictions and a light weekly player selection support it. Everything that existed to serve a competitive leaderboard is removed. The leaderboard survives as a scoreboard, not as the point.

The other half of the thesis: this group watches **asynchronously**, and Season 50 treated that as a problem to be gated around. Season 51 treats it as the design center. Marking an episode watched should be a payoff moment — your card against everyone else's, the group's reactions waiting for you, the recap — not just the unlocking of a spoiler curtain.

---

## Context

### What Season 50 taught us

| Verdict | Feature | Retrospective note |
|---|---|---|
| **Worked** | Bingo | The anchor. Best moments in the whole product. |
| **Worked** | Well-written, intentional content | "When it felt really intentional and creative was when it felt best." |
| **Potential** | Predictions | Good idea, generic execution. Auto-generated from a pool with no personality. |
| **Potential** | Vote-out guessing | Keep, but the surrounding voting mechanics were the problem. |
| **Failed** | Player of the Episode | Ranked voting on top-3 scorers. No nuance with 4 players. |
| **Failed** | Impact Rating | Rating an elimination 1–5 added nothing. |
| **Failed** | Achievement badges | Noise. |
| **Failed** | Ride or Die draft | Complexity without payoff. |
| **Cut by context** | Survivor Auction | Genuinely liked as an idea, but it only makes sense if the leaderboard matters and people are in sync. Neither is true. |
| **Never real** | Passport scoring | Rules promised 15–25 points. The scoring engine never implemented it. Reveal-only for the entire season. |
| **Friction** | Data import timing | Season 50's chaotic format made results hard to import and reconcile. |

### What Season 51 gives us

Season 51 — **"The Open Era"** — premieres Wednesday, September 23, 2026, 8–10pm ET/PT on CBS and Paramount+.

- **21 castaways**, not the usual 18. All new players, no returnees.
- **Two starting tribes**, not three. Tribe assignments are **predetermined by production** — castaways find their name and grab a buff rather than drawing rocks or doing a schoolyard pick.
- **One castaway does not start with the others.** They are held out, possibly sent to exile, and join whichever tribe loses an early Tribal Council.
- **Two-hour premiere.**
- Filmed in Fiji, cast ages 24–49.
- **Tribe names are not public as of this writing.** They will be revealed during the premiere.

Two consequences shape the entire plan:

**Nobody knows these people.** A pre-season draft or an Episode 1 player selection would be a coin flip dressed up as a decision. Watching two hours first and *then* choosing is a real choice. This is why Episode 1 has no player selection — not as a compromise, but because it is the better game.

**Sealed pre-season predictions are equally meaningless.** The Season Passport moves from pre-season to immediately after Episode 1. You have met everyone, you have seen them play, and now you commit. Same mechanic, actually a decision, and it gives the premiere a closing ritual.

### The data import situation

This is the highest-risk item in the plan and it is worth stating plainly.

The Season 50 importer scraped `truedorktimes.com/s50/boxscores`. **True Dork Times changed their URL structure.** Season 51 lives at `truedorktimes.com/survivor/boxscores/s51.htm`, and as of 2026-09-20 that page is a stub: last updated April 21, no per-contestant rows, placeholder text reading "Female contestants 1-9 / Male contestants 1-9" — their own page still assumes an 18-person cast. The in-season boxscore URL does not exist yet and returns 404.

Fantasy Survivor Game does have a live Season 51 page at `/survivors/season/51` listing all 21 castaways with zeroed stats, so that source is reachable, but the Season 50 code pointed at `/episode-recap/season/50`, a different path.

**We cannot verify the correct URLs or the parser against real data until after the premiere airs.** Therefore: no part of the Episode 1 experience may depend on imported data. Bingo, predictions, and the vote-out guess are all self-contained — players mark their own cards and make their own calls. The importer gets repaired Thursday, against a real page, and feeds Episode 2 onward, which is exactly when player picks and points begin.

This dissolves the deadline pressure. **The Wednesday deliverable is not the revamp. It is bingo and predictions being great.**

---

## Goals & Success Criteria

### Primary goals

1. **Make bingo the best part of the product.** Better squares, Season 51 aware, with the social payoff that async watching currently loses.
2. **Remove everything that felt hollow.** Fewer features, each one deliberate.
3. **Make async watching feel intentional**, not like a compromised version of watching together.
4. **Lower the barrier to entry** so the group can grow past four without the host walking anyone through it.
5. **Keep the host's weekly effort small and predictable.**

### Success criteria

| # | Criterion | Measure |
|---|---|---|
| SC1 | Episode 1 is fully playable with zero imported data | All players complete bingo + predictions on premiere night without host intervention |
| SC2 | Nobody gets spoiled | Zero incidents of results, standings, or eliminations visible before a player marks watched |
| SC3 | The group can grow | At least one new player joins from an invite link with no host hand-holding |
| SC4 | Host effort stays low | Under 10 minutes of host work per episode in the normal case |
| SC5 | Bingo carries the experience | Bingo is the most-engaged-with feature by marks and by post-episode discussion |
| SC6 | Content feels written, not generated | Group can point to specific squares and prediction questions they thought were funny or sharp |

---

## User Journeys

### Journey 1 — Premiere night (Episode 1, no picks)

Fam opens the app Wednesday before 8pm. There is no draft, no roster to pick, nothing to optimize. There is a bingo card — unique to Fam, five by five, squares written for a Season 51 premiere with 21 strangers and a twist where one person is left out. There are five prediction questions about the premiere. Fam answers them and locks in.

Two hours of TV. Fam taps squares as things happen. Nothing is scored yet, nothing is imported, nothing can break.

At the end, Fam marks the episode watched. Now: the Season Passport. Five sealed long-term calls — who wins, who goes deepest, who is the villain — made with two hours of actual evidence instead of a cast photo. Sealed. Not reopenable.

### Journey 2 — A friend who watches Saturday

Jordan is three days behind. Jordan opens the app and sees a locked episode with a bingo card and prediction questions, and nothing else. No standings, no results, no reactions, no hint of who went home. Jordan plays the episode exactly as Fam did on Wednesday.

Jordan marks it watched, and everything arrives at once: the recap, Jordan's card against everyone else's, the group's reactions from the last three days, the standings. Being late cost Jordan nothing and the payoff is bigger for having waited.

### Journey 3 — The fifth person joins

Someone sends a link. Sam opens it, enters an email, clicks the magic link, types a display name, and is in the league at the current episode. No host approval step, no explanation needed, no configuration.

### Journey 4 — Host runs the week

Thursday morning, Fam opens the host view. It states plainly whether the automatic import succeeded. If it did, results are in and scoring has run. If it did not, there is one screen to enter what matters — who went home, who won immunity, prediction outcomes — and it takes a few minutes. Either way Fam can see the state of it without guessing, and can correct a mistake and re-score without a wizard.

### Journey 5 — Episode 2, the first real picks

Now Fam has seen these people. Three contestants get picked from the remaining cast. The app shows who the rest of the league picked last episode, so Fam can decide whether to take the obvious strong player or be the only person on someone. Being the sole picker is worth more. In a four-person league, that is where the interesting decision lives.

---

## Project Scoping & Phased Development

### MVP strategy

**Approach:** Experience MVP, aggressively time-boxed. The Wednesday premiere is a hard external date that cannot move, so Phase 0 is scoped to what is genuinely necessary for premiere night and nothing else. Everything that depends on imported data, on scoring, or on new infrastructure is deliberately deferred past Wednesday, because none of it is needed until Episode 2.

**Resources:** One developer, working nights, with roughly two days before the premiere.

### Phase 0 — Premiere night (by Wednesday, Sept 23)

Must be done. Nothing here depends on the importer.

- Season 51 cast data: 21 contestants, two tribes, support for unassigned and for the held-out player
- Season identity centralized so `s51` is set in one place
- Remove the kill list: pre-season draft, Ride or Dies, Player of the Episode, Impact Rating, badges; disable the auction
- Episode 1 flow with no player selection
- Refreshed bingo pool, written for Season 51, including premiere and Open Era twist material
- Per-square bingo scoring plus line and blackout bonuses — self-contained, so the premiere can resolve on premiere night
- Prediction pool rewritten, with host ability to swap or author a question before lock
- Vote-out guess
- Season Passport moved to post-Episode-1, with questions rewritten for that timing
- Player cap raised from 6 to 12
- Season 50 copy removed from the UI

**Explicitly not in Phase 0:** the episode thread, importer repair, weekly picks, passport scoring, recap rewrite. None are needed Wednesday.

### Phase 1 — Before Episode 2 (Thu Sept 24 – Tue Sept 29)

- Repair the importer against the real Season 51 pages, now that they exist and can be inspected
- Host-facing import status that is unambiguous about whether it worked
- Fast manual result entry as the guaranteed path, not the fallback wizard
- Weekly player selection of three contestants, live from Episode 2
- Scarcity bonus for sole pickers
- Scoring and standings pass, rebalanced for the reduced feature set
- Tribe assignment once tribe names are known

### Phase 2 — Episode 3 onward

- **Episode thread**: per-episode reactions and comments, spoiler-gated, unlocked on marking watched
- Bingo comparison view — your card against the league's
- Recap personality pass, since narrative callouts were a retrospective favorite
- Passport scoring implemented for real, closing the Season 50 gap

### Phase 3 — Mid-season and finale

- Merge Passport, sealed when the merge is declared, with questions written for mid-season
- Finale flow, champion, reunion awards, passport reveals
- Possible revival of the auction if the group turns out to want more competition

### Risk mitigation

| Risk | Severity | Mitigation |
|---|---|---|
| Importer URLs and parsing unverifiable until after the premiere | **High** | Episode 1 depends on no imported data. Repair Thursday against a real page. Manual entry is always available. |
| Scope creep swallowing the two days before Wednesday | **High** | Phase 0 is a closed list. The episode thread and importer work are explicitly out. |
| Tribe names unknown until the premiere | Medium | Ship with contestants unassigned; host assigns tribes after watching using existing tribe management. |
| 21 players and 2 tribes break Season 50 assumptions | Medium | Audit anything assuming three tribes or 18–24 contestants. Pick counts scale off remaining cast. |
| Third-party stat sources may not cover Season 51 reliably | Medium | Manual entry is a first-class path, not a degraded one. |
| Removing features destabilizes the scoring engine | Medium | Ride or Dies, auction perks, and Player of the Episode all feed scoring. Remove the lanes, then verify standings still compute. |
| Episode thread is new infrastructure | Low | Deferred to Phase 2, after the premiere, with no deadline attached. |

---

## Functional Requirements

### League & Access

- FR1: A new player can join a league from a shared invite link
- FR2: A player can sign in with an email address and no password
- FR3: A league can hold up to 12 players
- FR4: A player can join mid-season and begin at the league's current episode
- FR5: A host can rename a league, view members, and share the invite
- FR6: A player can belong to multiple leagues and switch between them

### Episode Lifecycle (async-safe)

- FR7: Each player progresses through episodes independently of other players
- FR8: A player sees no results, standings, eliminations, or reactions for any episode they have not marked watched
- FR9: A player can lock their entries for an episode before watching it
- FR10: A player can mark an episode watched, which reveals that episode's outcomes
- FR11: Episode 1 is fully playable without any externally imported data
- FR12: The system creates episode records as players reach them

### Bingo

- FR13: Each player receives a distinct bingo card for each episode
- FR14: A player's card is reproducible — reopening the app shows the same card
- FR15: Bingo squares are drawn from a Season 51 specific pool
- FR16: A player can mark and unmark squares while watching
- FR17: A player earns points for each square they hit, independent of whether it forms a line
- FR18: Completed lines and blackouts earn additional bonuses, scored without host action
- FR19: A host can add custom squares to an upcoming episode's pool
- FR20: After marking watched, a player can compare their card against other players' cards

### Predictions & Calls

- FR21: A player can answer a set of prediction questions before locking an episode
- FR22: A host can replace any prediction question, or write their own, before the episode locks
- FR23: A player can predict which contestant will be voted out
- FR24: Prediction outcomes resolve automatically where data supports it, and by the host where it does not
- FR25: A player can seal a set of long-term season predictions after completing Episode 1
- FR26: A player can seal a second set of long-term predictions once the merge is declared
- FR27: Sealed predictions cannot be changed once sealed
- FR28: Sealed long-term predictions award points when their outcomes resolve
- FR29: All players' sealed predictions are revealed at the finale

### Player Selection

- FR30: From Episode 2 onward, a player selects a limited number of remaining contestants for the episode
- FR31: Episode 1 has no player selection
- FR32: A player who is the only one to select a contestant receives a bonus on that contestant's points
- FR33: A player can see how the league distributed their selections in the previous episode
- FR34: Selected contestants earn points from events that occurred in the episode
- FR35: Eliminated contestants are excluded from future selection

### Episode Thread

- FR36: A player can post reactions and comments to an episode's thread
- FR37: An episode thread is hidden from a player until they mark that episode watched
- FR38: A player sees the full accumulated thread when they finish an episode
- FR39: A player can react to a specific bingo square they hit

### Host Operations

- FR40: A host can see unambiguously whether automatic result import succeeded for an episode
- FR41: A host can enter an episode's results manually
- FR42: A host can assign and reassign contestants to tribes
- FR43: A host can declare the merge
- FR44: A host can trigger or re-run scoring for an episode
- FR45: A host can correct entered results and re-score without losing other data
- FR46: A host can mark a contestant eliminated, including by quit or medical evacuation

### Standings & Recap

- FR47: A player can view season standings
- FR48: A player can view their own per-episode point breakdown
- FR49: A player receives a narrative recap of an episode after marking it watched
- FR50: A player can view the current scoring rules
- FR51: At the finale, a champion is determined and reunion awards are presented

### Season Configuration

- FR52: The season's identity, cast, and tribe structure are defined in one place and can be replaced for a future season
- FR53: The cast supports 21 contestants across two tribes, including contestants not yet assigned to a tribe
- FR54: The system accommodates a contestant who does not begin the game on a tribe

---

## Non-Functional Requirements

### Correctness

- NFR1: **Spoiler isolation is the highest-priority correctness property.** No episode outcome may be visible to a player who has not marked that episode watched, through any surface — standings, profile, recap, thread, notification, or contestant status.
- NFR2: Sealed predictions must be immutable after sealing, enforced at the data layer rather than in the UI.
- NFR3: Scoring must be deterministic and reproducible — re-running it on unchanged inputs produces identical results.

### Effort & usability

- NFR4: A host's normal weekly work is under 10 minutes.
- NFR5: Manual result entry for an episode is completable in under 5 minutes.
- NFR6: A new player goes from invite link to playing in under 2 minutes.
- NFR7: Marking a bingo square is a single tap with immediate visual response, since it happens while watching TV.

### Platform

- NFR8: Primary use is a phone, in a dark room, during an episode. Mobile-first and legible at low brightness.
- NFR9: The app supports 12 players across roughly 15 episodes.
- NFR10: No part of the Episode 1 experience depends on a third-party data source.
- NFR11: When automatic import is unavailable or wrong, manual entry provides full functionality.

### Maintainability

- NFR12: Migrating to a future season should require changing season configuration and cast data, not game logic.
- NFR13: Removed features should be removed from the scoring engine rather than left inert, so scoring stays legible.

---

## Out of Scope for Season 51

Explicitly removed, with reasons, so these do not quietly return:

| Removed | Reason |
|---|---|
| Pre-season snake draft | Meaningless with 21 unknown players. Complexity without payoff. |
| Ride or Die contestants | Retrospective: not worth the mechanics it required. |
| Survivor Auction | Only pays off with a meaningful leaderboard and synchronized play. Neither applies. Code disabled, not deleted. |
| Player of the Episode | No nuance in a four-person league. |
| Impact Rating | Added nothing. |
| Achievement badges | Noise. |
| Episode 1 player selection | Nobody has seen these people play. |
| Pre-season sealed predictions | Replaced by post-Episode-1 sealing. |
| Historical contestant stats | No returnees in Season 51. |

---

## Resolved Decisions

Settled 2026-09-20.

1. **Picks per episode: three**, from Episode 2 onward, scaling down as the cast shrinks. Season 50's five was homework. Three keeps the weekly ask light and makes the sole-picker bonus consequential, which is where nuance comes from in a four-person league.

2. **Bingo is scored per square hit, plus line and blackout bonuses.** This is a correction to a real problem, not a tuning preference. Under Season 50 weights, bingo paid roughly 5–10 points an episode while three picked contestants routinely produce 20–40 — so bingo would have been a rounding error on a scoreboard that claims it is the centerpiece. Per-square scoring also rewards catching the funny thing, which is the specific experience the retrospective identified as best, rather than rewarding card-layout luck. Picks become the volatile lane; bingo becomes the steady one.

3. **The Merge Passport stays.** A committed deliverable, not a conditional one. Both passports need real scoring, which Season 50 never implemented.

4. **Bingo card stays five by five** for the two-hour premiere, with the pool written knowing there is double the usual runtime to fill.

5. **Content authoring: drafted for review.** The bingo pool, prediction pool, and passport questions get drafted in full, then edited and cut. Content quality is the Wednesday deliverable — the retrospective was unambiguous that well-written calls were the best part of Season 50, so this is the highest-leverage work in Phase 0, not a finishing touch.
