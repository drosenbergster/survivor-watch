import { useState } from 'react';
import { SCORE_EVENTS, ENGAGEMENT_SCORING } from '../../data';
import { useApp } from '../../AppContext';
import { Icon } from '../fijian';
import TribeManagement from './TribeManagement';
import LeagueSettings from './LeagueSettings';

function Accordion({ title, icon, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border border-terracotta/15 rounded-xl overflow-hidden bg-black/10">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 sm:py-4 text-left hover:bg-terracotta/5 transition-colors"
        aria-expanded={open}
      >
        <span className="text-xl">{icon}</span>
        <h3 className="font-wood-serif text-lg sm:text-xl text-sand-warm flex-1">{title}</h3>
        <Icon
          name={open ? 'expand_less' : 'expand_more'}
          className="text-terracotta text-xl transition-transform"
        />
      </button>
      {open && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-4">
          {children}
        </div>
      )}
    </section>
  );
}

const GAMEPLAY_STEPS = [
  { icon: '🔮', label: 'Before the episode, answer your Tree Mail — five yes/no calls on what happens tonight.' },
  { icon: '🎯', label: 'From Episode 2 on, also pick 3 castaways who score their event points for you.' },
  { icon: '🔥', label: 'Tap "Light Your Torch" when you sit down to watch — this locks everything and opens your bingo card.' },
  { icon: '🎱', label: 'Mark bingo squares as things happen. Every square you catch is worth points, lines and blackouts pay bonuses.' },
  { icon: '⚡', label: 'When tribal starts, pause and call who is going home. Answer Tribal Whispers while you are there.' },
  { icon: '📊', label: 'Tap "Done Watching" when the episode ends. Results, standings, and your card unlock then — not before.' },
];

const SCORING_CATEGORIES = (() => {
  const cats = {
    'Survival & Tribal': ['survived', 'voted_correctly', 'survived_with_votes', 'attended_tribal_zero'],
    'Challenges': ['tribal_immunity', 'individual_immunity', 'individual_reward', 'tribal_reward', 'fire_making_win', 'supply_challenge_win', 'marooning_win', 'journey_challenge_win'],
    'Idols & Advantages': ['idol_found', 'idol_played_success', 'advantage_found', 'advantage_used', 'find_clue', 'shot_in_dark'],
    'Milestones': ['merge', 'ftc', 'winner', 'exile', 'medevac'],
    'Camp Life': ['read_tree_mail', 'water_well_talk', 'make_fire_camp', 'find_food', 'journey'],
  };
  const lookup = Object.fromEntries(SCORE_EVENTS.map(e => [e.key, e]));
  return Object.entries(cats).map(([name, keys]) => ({
    name,
    events: keys.map(k => lookup[k]).filter(Boolean),
  }));
})();

export default function RulesTab() {
  const { user, league } = useApp();
  const isHost = league?.createdBy === user?.uid;
  const isActive = league?.status === 'active';
  const [openCat, setOpenCat] = useState(null);

  return (
    <div className="space-y-6 overflow-hidden">
      <header className="text-center py-4 sm:py-6">
        <h1 className="font-wood-serif font-bold text-4xl sm:text-5xl text-sand-warm uppercase tracking-tighter drop-shadow-text">
          LAWA
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="h-[1px] w-8 bg-terracotta" />
          <p className="font-display text-terracotta text-sm sm:text-base tracking-[0.3em]">FIJIAN RULES</p>
          <span className="h-[1px] w-8 bg-terracotta" />
        </div>
      </header>

      {/* ── How to Play ── */}
      <Accordion title="How to Play" icon="🏝️" defaultOpen>
        <p className="text-xs text-bleached-sand/60 font-sans pb-1">
          Every week follows the same rhythm: call it, watch it, mark it, score it. Watch
          whenever you want — nothing is revealed until you say you are done.
        </p>
        <ol className="space-y-2.5">
          {GAMEPLAY_STEPS.map((step, i) => (
            <li key={i} className="flex gap-3 items-start">
              <span className="shrink-0 w-5 h-5 rounded-full bg-terracotta/20 text-terracotta text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
              <div className="flex items-start gap-2 flex-1">
                <span className="shrink-0 text-base mt-0.5">{step.icon}</span>
                <p className="text-sm text-bleached-sand/80 leading-relaxed font-sans">{step.label}</p>
              </div>
            </li>
          ))}
        </ol>
      </Accordion>

      {/* ── Bingo ── */}
      <Accordion title="Bingo — The Main Event" icon="🎱">
        <p className="text-sm text-bleached-sand/70 leading-relaxed font-sans">
          Bingo is the heart of the game this season. Everyone gets their own card each
          episode, drawn from a pool written for Season 51.
        </p>
        <ul className="text-xs text-bleached-sand/70 font-sans space-y-1">
          <li><strong className="text-sand-warm">Every square you hit</strong> is worth 2 points — you do not need a line to score</li>
          <li><strong className="text-sand-warm">Each completed line</strong> pays a 5 point bonus on top</li>
          <li><strong className="text-sand-warm">Blackout</strong> — every square on the card — pays 50</li>
          <li>Long-press any square to read the full text</li>
        </ul>
        <div className="bg-terracotta/5 rounded-lg p-3 border border-dashed border-terracotta/25">
          <p className="text-xs text-bleached-sand/70 font-sans">
            Because every square counts, paying attention beats getting lucky with card layout.
          </p>
        </div>
      </Accordion>

      {/* ── Weekly Picks ── */}
      <Accordion title="Picking Castaways" icon="🎯">
        <p className="text-sm text-bleached-sand/70 leading-relaxed font-sans">
          There is <strong className="text-sand-warm">no draft</strong> this season. Nobody
          has seen these 21 play before, so the premiere is just for watching. Picks open in
          Episode 2.
        </p>
        <ul className="text-xs text-bleached-sand/70 font-sans space-y-1">
          <li>Pick <strong className="text-sand-warm">3 castaways</strong> each episode from anyone still in the game</li>
          <li>Change them every week — the limit shrinks as the cast gets smaller</li>
          <li>They earn you their event points for that episode</li>
        </ul>
        <div className="bg-terracotta/5 rounded-lg p-3 border border-dashed border-terracotta/25">
          <p className="text-xs text-bleached-sand/70 font-sans">
            <strong className="text-terracotta">Sole Picker Bonus:</strong>{' '}
            If you are the only player who picked a castaway, their episode points are multiplied by{' '}
            <strong className="text-terracotta">1.5×</strong>. Going against the room pays.
          </p>
        </div>
      </Accordion>

      {/* ── Passports ── */}
      <Accordion title="Passports" icon="📜">
        <p className="text-sm text-bleached-sand/70 leading-relaxed font-sans">
          Your long-term read on the season, sealed so nobody can see it until the finale.
        </p>
        <ul className="text-xs text-bleached-sand/70 font-sans space-y-1">
          <li><strong className="text-sand-warm">Season Passport</strong> — sealed right after the premiere, once you have actually met everyone</li>
          <li><strong className="text-sand-warm">Merge Passport</strong> — a second set of calls once the merge hits</li>
          <li>Once sealed, they cannot be changed</li>
        </ul>
      </Accordion>

      {/* ── Scoring: Contestant Events ── */}
      <Accordion title="Scoring — Contestant Events" icon="📊">
        <p className="text-xs text-bleached-sand/60 font-sans">
          Points your picked contestants earn from in-game events. Tap a category to expand.
        </p>
        <div className="space-y-1.5">
          {SCORING_CATEGORIES.map((cat) => (
            <div key={cat.name} className="border border-terracotta/10 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenCat(openCat === cat.name ? null : cat.name)}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-terracotta/5 transition-colors"
                aria-expanded={openCat === cat.name}
              >
                <span className="font-wood-serif text-sm text-sand-warm">{cat.name}</span>
                <span className="text-xs text-bleached-sand/50 font-sans">
                  {cat.events.length} events
                  <Icon
                    name={openCat === cat.name ? 'expand_less' : 'expand_more'}
                    className="text-terracotta text-sm align-middle ml-1"
                  />
                </span>
              </button>
              {openCat === cat.name && (
                <div className="border-t border-terracotta/10">
                  {cat.events.map((ev) => (
                    <div key={ev.key} className="flex items-center justify-between px-3 py-1.5 text-xs font-sans even:bg-black/10">
                      <span className="text-bleached-sand/70 flex items-center gap-1.5">
                        <span>{ev.emoji}</span> {ev.label}
                      </span>
                      <span className={`font-display text-base ${ev.negative ? 'text-deep-terracotta' : 'text-sand-warm'}`}>
                        {ev.points > 0 ? '+' : ''}{ev.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Accordion>

      {/* ── Scoring: Engagement & Bonuses ── */}
      <Accordion title="Scoring — Engagement & Bonuses" icon="⭐">
        <p className="text-xs text-bleached-sand/60 font-sans">
          Points you earn from predictions, bingo, social votes, and passports.
        </p>
        <div className="space-y-3">
          {ENGAGEMENT_SCORING.map((group) => (
            <div key={group.section} className="bg-black/15 rounded-lg overflow-hidden border border-terracotta/10">
              <div className="px-3 py-2 bg-terracotta/5 border-b border-terracotta/10">
                <h4 className="font-wood-serif text-sm text-sand-warm">
                  {group.icon} {group.section}
                </h4>
              </div>
              {group.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between px-3 py-1.5 text-xs font-sans even:bg-black/10">
                  <div>
                    <span className="text-bleached-sand/70">{item.emoji} {item.label}</span>
                    {item.note && (
                      <p className="text-[10px] text-bleached-sand/40 italic ml-5">{item.note}</p>
                    )}
                  </div>
                  <span className="font-display text-base text-sand-warm shrink-0 ml-2">
                    {typeof item.points === 'number' ? `+${item.points}` : item.points}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Accordion>

      {/* ── Tribal Whispers & Snap Vote ── */}
      <Accordion title="Tribal Council Voting" icon="🗳️">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg">⚡</span>
            <div className="text-sm text-bleached-sand/70 font-sans leading-relaxed space-y-1">
              <p>
                <strong className="text-sand-warm">Snap Vote:</strong> When tribal council starts, pause the show and
                pick who you think is going home. <strong className="text-terracotta">+8 pts</strong> if you nail it.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🤫</span>
            <div className="text-sm text-bleached-sand/70 font-sans leading-relaxed space-y-1">
              <p>
                <strong className="text-sand-warm">Tribal Whispers:</strong> Quick yes/no predictions that
                appear during tribal — &quot;Someone pulls out an idol,&quot; &quot;The vote is decisive,&quot; etc.
                <strong className="text-terracotta"> +3 pts</strong> for each correct call.
              </p>
            </div>
          </div>
          <div className="bg-terracotta/5 border border-dashed border-terracotta/25 rounded-lg p-3">
            <p className="text-xs text-bleached-sand/60 font-sans">
              Both open after you Light Your Torch and close when you mark Done Watching.
              The snap vote and whispers are only available while your torch is lit.
            </p>
          </div>
        </div>
      </Accordion>

      {/* ── Bingo & Watch Party ── */}
      <Accordion title="Bingo & Watch Party" icon="🎱">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg">📋</span>
            <p className="text-sm text-bleached-sand/70 font-sans leading-relaxed">
              Each episode generates a unique bingo card. Mark off squares as events happen while you watch —
              <strong className="text-sand-warm"> +2 pts per square</strong>, a{' '}
              <strong className="text-sand-warm">+5</strong> bonus per line, and{' '}
              <strong className="text-sand-warm">+50</strong> for a blackout.
            </p>
          </div>
          <div className="bg-terracotta/5 border border-dashed border-terracotta/25 rounded-xl p-3 sm:p-4 text-center">
            <p className="font-wood-serif text-sand-warm text-lg sm:text-xl italic">&quot;JEFF PROBST!&quot;</p>
            <p className="text-[10px] uppercase text-bleached-sand/50 font-bold tracking-[0.2em] font-sans mt-1">
              Must be yelled at full volume to claim bingo victory.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🍹</span>
            <p className="text-sm text-bleached-sand/70 font-sans leading-relaxed">
              <strong className="text-terracotta">Vaka-Viti:</strong> When you hear{' '}
              <span className="text-terracotta">&quot;C&apos;mon in guys!&quot;</span> or{' '}
              <span className="text-terracotta">&quot;Dig Deep&quot;</span> — synchronous tribe-wide salute.
            </p>
          </div>
        </div>
      </Accordion>

      {/* ── Admin / Auction / Settings ── */}
      {isActive && isHost && (
        <section className="space-y-4 pt-6 border-t border-stone-700/50">
          <div className="text-center">
            <h3 className="font-display text-xl tracking-wider text-ochre">Admin Tools</h3>
            <p className="text-sand-warm/50 text-xs font-sans mt-1">Host-only game management</p>
          </div>
          <TribeManagement />
        </section>
      )}

      <section className="space-y-4 pt-6 border-t border-stone-700/50 mb-12">
        <LeagueSettings />
      </section>
    </div>
  );
}
