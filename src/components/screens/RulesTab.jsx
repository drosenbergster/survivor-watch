import { SCORE_EVENTS, ENGAGEMENT_SCORING } from '../../data';
import { useApp } from '../../AppContext';
import { FijianSectionHeader, Icon } from '../fijian';
import TribeManagement from './TribeManagement';
import SurvivorAuction from './SurvivorAuction';
import LeagueSettings from './LeagueSettings';

const HOW_IT_WORKS = [
  {
    icon: '🤝',
    title: 'Draft Your Ride or Dies',
    body: 'Before the season starts, your league holds a snake draft. Each player picks two exclusive contestants who earn passive points all season long.',
  },
  {
    icon: '🎯',
    title: 'Make Weekly Picks & Predictions',
    body: 'Before each episode, pick contestants to score for you that week and answer yes/no prop bets.',
  },
  {
    icon: '📺',
    title: 'Start Watching',
    body: 'When you\'re ready to watch, tap "Start Watching" on the Watch tab. This locks in your picks and predictions and activates your bingo card. Watch live or catch up later — you control your own timing.',
  },
  {
    icon: '🗳️',
    title: 'Vote at Tribal Council',
    body: 'When tribal council starts, pause the show and cast your snap vote for who you think is going home. Correct votes earn +8 points.',
  },
  {
    icon: '📊',
    title: 'Score & Compete',
    body: 'After you finish watching, tap "Done Watching." The host enters game results and scores the episode. Points come from contestant performance, predictions, bingo, and social votes.',
  },
];

const EPISODE_FLOW = [
  {
    title: 'Save Picks & Prop Bets (Play Tab)',
    body: 'Choose your weekly contestants and answer prop bets. Do this before you start the episode.',
  },
  {
    title: 'Start Watching (Watch Tab)',
    body: 'Tap "Start Watching" when you\'re ready to press play. This locks your picks and predictions and activates your bingo card and tribal snap vote.',
  },
  {
    title: 'Play Bingo While You Watch',
    body: 'Mark off bingo squares as events happen during the episode. Complete a line for +5 pts or the whole card for +50.',
  },
  {
    title: 'Snap Vote at Tribal Council',
    body: 'When tribal council starts, pause and pick who you think gets voted out. This is your live in-the-moment call (+8 pts if correct).',
  },
  {
    title: 'Finish the Episode',
    body: 'When the episode ends, tap "Done Watching" to lock in your bingo card. The host then enters the game results and scores the episode.',
  },
  {
    title: 'Post-Episode Votes (After Scoring)',
    body: 'Vote for Player of the Episode and rate the eliminated contestant\'s game impact. These social points add up over the season.',
  },
];

const EVENT_ICONS = {
  survived: 'check_circle',
  immunity: 'waves',
  reward: 'card_giftcard',
  idol_found: 'local_fire_department',
  idol_played: 'diamond',
  advantage: 'extension',
  blindside: 'visibility_off',
  no_votes: 'shield',
  merge: 'groups',
  final5: 'back_hand',
  ftc: 'account_balance',
  winner: 'stars',
  voted_out: 'close',
  first_boot: 'skull',
};

export default function RulesTab() {
  const { user, league } = useApp();
  const isHost = league?.createdBy === user?.uid;
  const isActive = league?.status === 'active';

  return (
    <article className="max-w-2xl mx-auto space-y-6 sm:space-y-8 magimagi-border-rules px-3 py-4 sm:p-6 scroll-container overflow-x-hidden">
      <header className="text-center py-6 sm:py-10">
        <h1 className="font-wood-serif font-bold text-4xl sm:text-5xl text-sand-warm uppercase tracking-tighter drop-shadow-text">
          LAWA
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="h-[1px] w-8 bg-terracotta" />
          <p className="font-display text-terracotta text-base sm:text-lg tracking-[0.3em]">FIJIAN RULES</p>
          <span className="h-[1px] w-8 bg-terracotta" />
        </div>
      </header>

      {/* ── How It Works ── */}
      <section>
        <FijianSectionHeader title="Tukutuku" subtitle="How It Works" variant="rules" />
        <div className="space-y-6">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="shrink-0 size-8 rounded-full border border-terracotta flex items-center justify-center text-lg">
                {step.icon}
              </div>
              <div>
                <h4 className="font-wood-serif text-lg text-sand-warm leading-none mb-1">{step.title}</h4>
                <p className="text-sm text-bleached-sand/70 leading-relaxed italic font-sans">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Two Ways to Earn ── */}
      <section>
        <FijianSectionHeader title="Veitokani" subtitle="Two Ways to Earn from Contestants" variant="rules" />

        <p className="text-sm text-bleached-sand/70 leading-relaxed font-sans mb-5">
          You earn points from contestants in two completely separate ways. Think of it like
          investing: Ride or Dies are your <strong className="text-sand-warm">long-term stock picks</strong>, while
          Weekly Picks are <strong className="text-sand-warm">short-term bets</strong> you make each episode.
        </p>

        <div className="space-y-5">
          {/* Ride or Die */}
          <div className="bg-black/20 rounded-xl p-3 sm:p-5 border border-terracotta/20 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤝</span>
              <h4 className="font-wood-serif text-base sm:text-lg text-sand-warm">Ride or Die &mdash; Your Season-Long Alliance</h4>
            </div>
            <p className="text-sm text-bleached-sand/70 leading-relaxed font-sans">
              Before the season begins, your league holds a <strong className="text-sand-warm">snake draft</strong>.
              Each player drafts <strong className="text-sand-warm">two exclusive contestants</strong> &mdash; no one else
              in your league can have the same ones. These picks are <strong className="text-sand-warm">locked for the
              entire season</strong>. You never change them.
            </p>
            <p className="text-sm text-bleached-sand/70 leading-relaxed font-sans">
              Your Ride or Dies earn you <strong className="text-sand-warm">episode event points</strong> (just
              like weekly picks) <strong className="text-sand-warm">plus</strong> passive bonuses for staying in the game:
            </p>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
              <div className="bg-black/30 rounded-lg py-2 px-1">
                <p className="font-display text-lg sm:text-xl text-sand-warm">+2</p>
                <p className="text-[9px] sm:text-[10px] text-bleached-sand/50 font-sans uppercase leading-tight">per episode survived</p>
              </div>
              <div className="bg-black/30 rounded-lg py-2 px-1">
                <p className="font-display text-lg sm:text-xl text-sand-warm">+15</p>
                <p className="text-[9px] sm:text-[10px] text-bleached-sand/50 font-sans uppercase leading-tight">reach finale</p>
              </div>
              <div className="bg-black/30 rounded-lg py-2 px-1">
                <p className="font-display text-lg sm:text-xl text-sand-warm">+30</p>
                <p className="text-[9px] sm:text-[10px] text-bleached-sand/50 font-sans uppercase leading-tight">win the season</p>
              </div>
            </div>
            <p className="text-xs text-bleached-sand/50 italic font-sans">
              Strategy: Draft contestants you think will be active and last the longest &mdash; they earn event points every episode plus survival bonuses.
            </p>
          </div>

          {/* Weekly Picks */}
          <div className="bg-black/20 rounded-xl p-3 sm:p-5 border border-terracotta/20 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h4 className="font-wood-serif text-base sm:text-lg text-sand-warm">Weekly Picks &mdash; Your Episode-by-Episode Bet</h4>
            </div>
            <p className="text-sm text-bleached-sand/70 leading-relaxed font-sans">
              Before each episode, you choose <strong className="text-sand-warm">two contestants from anyone still in the game</strong>.
              These don&apos;t have to be your Ride or Dies &mdash; you can pick <em>any</em> remaining contestant,
              even the same ones other players pick.
            </p>
            <p className="text-sm text-bleached-sand/70 leading-relaxed font-sans">
              Your weekly picks earn points based on <strong className="text-sand-warm">what actually happens during that
              episode</strong>: winning challenges, finding idols, playing advantages, surviving tribal council, and more.
              The full event list is in the scoring table below.
            </p>
            <p className="text-xs text-bleached-sand/50 italic font-sans">
              Strategy: Pick contestants you think will have a big episode &mdash; challenge beasts, players on the
              chopping block who might survive, or anyone you think might find an idol.
            </p>
          </div>

          {/* Exclusivity Bonus */}
          <div className="bg-terracotta/5 rounded-xl p-3 sm:p-5 border-2 border-dashed border-terracotta/30 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💎</span>
              <h4 className="font-wood-serif text-base sm:text-lg text-sand-warm">Exclusivity Bonus &mdash; 1.5&times; for Going Solo</h4>
            </div>
            <p className="text-sm text-bleached-sand/70 leading-relaxed font-sans">
              This applies to <strong className="text-sand-warm">Weekly Picks only</strong>. After everyone locks in
              their picks for an episode, the app checks if any contestant was picked by
              only <strong className="text-sand-warm">one player</strong> in the league.
            </p>
            <p className="text-sm text-bleached-sand/70 leading-relaxed font-sans">
              If you&apos;re the <strong className="text-terracotta">only person</strong> who picked a contestant, all
              of that contestant&apos;s episode points are multiplied
              by <strong className="text-terracotta">1.5&times;</strong> for you. If multiple players picked the same
              contestant, everyone gets the normal points &mdash; no bonus.
            </p>
            <div className="bg-black/30 rounded-lg p-3 text-sm font-sans space-y-1">
              <p className="text-bleached-sand/70">
                <strong className="text-sand-warm">Example:</strong> You pick Ozzy, and no one else does. Ozzy wins
                individual immunity (+10) and survives (+2) = 12 pts. With the exclusivity
                bonus: <strong className="text-terracotta">12 &times; 1.5 = 18 pts</strong> for you.
              </p>
              <p className="text-bleached-sand/50 text-xs italic">
                If two players had both picked Ozzy, they&apos;d each get the normal 12.
              </p>
            </div>
          </div>

          {/* Quick comparison */}
          <div className="bg-black/20 rounded-xl overflow-hidden border border-terracotta/20">
            <table className="w-full table-fixed text-[10px] sm:text-sm font-sans">
              <colgroup>
                <col className="w-[28%] sm:w-auto" />
                <col className="w-[36%] sm:w-auto" />
                <col className="w-[36%] sm:w-auto" />
              </colgroup>
              <thead className="bg-terracotta/10 border-b border-terracotta/20">
                <tr>
                  <th className="px-1 sm:px-4 py-2 sm:py-2.5 text-left font-wood-serif text-sand-warm text-[10px] sm:text-sm" scope="col" />
                  <th className="px-1 sm:px-4 py-2 sm:py-2.5 text-center font-wood-serif text-sand-warm text-[10px] sm:text-sm" scope="col">
                    <span className="hidden sm:inline">🤝 </span>Ride or Die
                  </th>
                  <th className="px-1 sm:px-4 py-2 sm:py-2.5 text-center font-wood-serif text-sand-warm text-[10px] sm:text-sm" scope="col">
                    <span className="hidden sm:inline">🎯 </span>Weekly Picks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terracotta/10 text-bleached-sand/70">
                <tr>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 font-bold text-sand-warm">When chosen</td>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 text-center">Before season</td>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 text-center">Every episode</td>
                </tr>
                <tr>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 font-bold text-sand-warm">Changeable?</td>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 text-center">No &mdash; locked</td>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 text-center">Yes &mdash; weekly</td>
                </tr>
                <tr>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 font-bold text-sand-warm">Who?</td>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 text-center">Exclusive</td>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 text-center">Anyone left</td>
                </tr>
                <tr>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 font-bold text-sand-warm">Scoring</td>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 text-center">Events + survival</td>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 text-center">Episode events</td>
                </tr>
                <tr>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 font-bold text-sand-warm">Exclusive?</td>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 text-center">No</td>
                  <td className="px-1 sm:px-4 py-1.5 sm:py-2.5 text-center">Yes (1.5&times;)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Episode Flow ── */}
      <section>
        <FijianSectionHeader title="Siga" subtitle="Episode Flow" variant="rules" />
        <div className="space-y-4">
          {EPISODE_FLOW.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="shrink-0 size-7 rounded-full bg-terracotta/10 border border-terracotta/30 flex items-center justify-center font-wood-serif text-terracotta font-bold text-sm">
                {i + 1}
              </div>
              <div>
                <h4 className="font-wood-serif text-base text-sand-warm leading-none mb-1">{step.title}</h4>
                <p className="text-sm text-bleached-sand/70 leading-relaxed italic font-sans">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bracket Draft ── */}
      <section>
        <FijianSectionHeader title="Draft" subtitle="Ride or Die" variant="rules" />
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="shrink-0 size-8 rounded-full border border-terracotta flex items-center justify-center font-wood-serif text-terracotta font-bold">
              1
            </div>
            <div>
              <h4 className="font-wood-serif text-lg text-sand-warm leading-none mb-1">Snake Format</h4>
              <p className="text-sm text-bleached-sand/70 leading-relaxed italic font-sans">
                Standard 10-round snake draft format (1-8, then 8-1).
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 size-8 rounded-full border border-terracotta flex items-center justify-center font-wood-serif text-terracotta font-bold">
              2
            </div>
            <div>
              <h4 className="font-wood-serif text-lg text-sand-warm leading-none mb-1">Deadline</h4>
              <p className="text-sm text-bleached-sand/70 leading-relaxed italic font-sans">
                Draft closes 1 hour before the season premiere.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <FijianSectionHeader title="Scoring" subtitle="Contestant Points" variant="rules" />
        <div className="bg-black/20 rounded-xl overflow-hidden border border-terracotta/20">
          <table className="w-full text-left">
            <thead className="bg-terracotta/10 border-b border-terracotta/20">
              <tr>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-wood-serif text-sand-warm text-sm sm:text-lg uppercase" scope="col">
                  Event
                </th>
                <th className="px-2 sm:px-4 py-2 sm:py-3 font-wood-serif text-sand-warm text-sm sm:text-lg uppercase text-right" scope="col">
                  Points
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terracotta/10">
              {SCORE_EVENTS.map((ev) => (
                <tr key={ev.key}>
                  <td className="px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 font-sans">
                    <Icon name={EVENT_ICONS[ev.key] || 'circle'} className="text-terracotta text-xs sm:text-sm" />
                    {ev.label}
                  </td>
                  <td className={`px-2 sm:px-4 py-1.5 sm:py-3 text-right font-display text-lg sm:text-2xl ${ev.negative ? 'text-deep-terracotta' : 'text-sand-warm'}`}>
                    {ev.points > 0 ? '+' : ''}{ev.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {ENGAGEMENT_SCORING.map((group) => (
        <section key={group.section}>
          <FijianSectionHeader title={group.section} subtitle={`${group.icon} Engagement`} variant="rules" />
          <div className="bg-black/20 rounded-xl overflow-hidden border border-terracotta/20">
            <table className="w-full text-left">
              <thead className="bg-terracotta/10 border-b border-terracotta/20">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-wood-serif text-sand-warm text-sm sm:text-lg uppercase" scope="col">
                    Category
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 font-wood-serif text-sand-warm text-sm sm:text-lg uppercase text-right" scope="col">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terracotta/10">
                {group.items.map((item) => (
                  <tr key={item.label}>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-3 text-xs sm:text-sm font-sans">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span>{item.emoji}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.note && (
                        <p className="text-[10px] sm:text-xs text-bleached-sand/50 mt-0.5 ml-6 sm:ml-7 italic">{item.note}</p>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-1.5 sm:py-3 text-right font-display text-lg sm:text-2xl text-sand-warm align-top">
                      {typeof item.points === 'number' ? `+${item.points}` : item.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section>
        <FijianSectionHeader title="Bingo" subtitle="Watch Party Game" variant="rules" />
        <div className="p-4 sm:p-6 bg-terracotta/5 border-2 border-dashed border-terracotta/30 rounded-2xl text-center">
          <p className="font-wood-serif text-sand-warm text-xl sm:text-2xl italic mb-2">&quot;JEFF PROBST!&quot;</p>
          <p className="text-[10px] uppercase text-bleached-sand/60 font-bold tracking-[0.2em] font-sans">
            Must be yelled at full volume to claim victory.
          </p>
        </div>
      </section>

      <section className="mb-16">
        <div className="relative bg-masi-dark/80 rounded-3xl p-5 sm:p-8 border-2 border-terracotta overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10" aria-hidden>
            <Icon name="temple_hindu" className="text-[80px] sm:text-[120px] text-terracotta" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col items-center mb-4 sm:mb-6 text-center">
              <Icon name="soup_kitchen" className="text-terracotta text-4xl sm:text-5xl mb-2" />
              <h3 className="font-wood-serif font-bold text-2xl sm:text-3xl text-sand-warm tracking-tight uppercase">
                Vaka-Viti
              </h3>
              <p className="text-[10px] text-terracotta font-black tracking-[0.3em] uppercase font-sans">(The Fijian Way)</p>
            </div>
            <p className="text-bleached-sand text-center text-sm sm:text-base leading-relaxed italic font-sans">
              Whenever the host says <span className="text-terracotta font-bold">&quot;C&apos;mon in guys!&quot;</span> or{' '}
              <span className="text-terracotta font-bold">&quot;Dig Deep&quot;</span>, the custom replacement for
              &quot;Cheers!&quot; is a synchronous tribe-wide salute.
            </p>
          </div>
        </div>
      </section>

      {isActive && isHost && (
        <section className="space-y-6 pt-8 border-t border-stone-700">
          <div className="text-center">
            <h3 className="font-display text-2xl tracking-wider text-ochre">Admin Tools</h3>
            <p className="text-sand-warm/60 text-xs font-sans mt-1">Host-only game management</p>
          </div>
          <TribeManagement />
        </section>
      )}

      {isActive && (
        <section className="space-y-6 pt-8 border-t border-stone-700">
          <div className="text-center">
            <h3 className="font-display text-2xl tracking-wider text-ochre">Survivor Auction</h3>
            <p className="text-sand-warm/60 text-xs font-sans mt-1">Mid-season catch-up event</p>
          </div>
          <SurvivorAuction />
        </section>
      )}

      <section className="space-y-6 pt-8 border-t border-stone-700">
        <LeagueSettings />
      </section>
    </article>
  );
}
