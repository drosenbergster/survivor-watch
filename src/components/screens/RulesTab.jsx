import { SCORE_EVENTS } from '../../data';
import { FijianSectionHeader, Icon } from '../fijian';

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
  return (
    <article className="max-w-2xl mx-auto space-y-8 magimagi-border-rules p-6 scroll-container rounded-lg">
      <header className="text-center py-10">
        <h1 className="font-wood-serif font-bold text-5xl text-sand-warm uppercase tracking-tighter drop-shadow-text">
          LAWA
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="h-[1px] w-8 bg-terracotta" />
          <p className="font-display text-terracotta text-lg tracking-[0.3em]">FIJIAN RULES</p>
          <span className="h-[1px] w-8 bg-terracotta" />
        </div>
      </header>

      <section>
        <FijianSectionHeader title="Sevu" subtitle="Bracket Draft" variant="rules" />
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
        <FijianSectionHeader title="Lawa ni Qito" subtitle="Scoring" variant="rules" />
        <div className="bg-black/20 rounded-xl overflow-hidden border border-terracotta/20">
          <table className="w-full text-left">
            <thead className="bg-terracotta/10 border-b border-terracotta/20">
              <tr>
                <th className="px-4 py-3 font-wood-serif text-sand-warm text-lg uppercase" scope="col">
                  Event
                </th>
                <th className="px-4 py-3 font-wood-serif text-sand-warm text-lg uppercase text-right" scope="col">
                  Toka (Pts)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terracotta/10">
              {SCORE_EVENTS.slice(0, 8).map((ev) => (
                <tr key={ev.key}>
                  <td className="px-4 py-3 text-sm flex items-center gap-2 font-sans">
                    <Icon name={EVENT_ICONS[ev.key] || 'circle'} className="text-terracotta text-sm" />
                    {ev.label}
                  </td>
                  <td className={`px-4 py-3 text-right font-display text-2xl ${ev.negative ? 'text-deep-terracotta' : 'text-sand-warm'}`}>
                    {ev.points > 0 ? '+' : ''}{ev.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <FijianSectionHeader title="Qito" subtitle="Bingo" variant="rules" />
        <div className="p-6 bg-terracotta/5 border-2 border-dashed border-terracotta/30 rounded-2xl text-center">
          <p className="font-wood-serif text-sand-warm text-2xl italic mb-2">&quot;JEFF PROBST!&quot;</p>
          <p className="text-[10px] uppercase text-bleached-sand/60 font-bold tracking-[0.2em] font-sans">
            Must be yelled at full volume to claim victory.
          </p>
        </div>
      </section>

      <section className="mb-16">
        <div className="relative bg-masi-dark/80 rounded-3xl p-8 border-2 border-terracotta overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10" aria-hidden>
            <Icon name="temple_hindu" className="text-[120px] text-terracotta" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col items-center mb-6 text-center">
              <Icon name="soup_kitchen" className="text-terracotta text-5xl mb-2" />
              <h3 className="font-wood-serif font-bold text-3xl text-sand-warm tracking-tight uppercase">
                Vaka-Viti
              </h3>
              <p className="text-[10px] text-terracotta font-black tracking-[0.3em] uppercase font-sans">(The Fijian Way)</p>
            </div>
            <p className="text-bleached-sand text-center text-base leading-relaxed italic font-sans">
              Whenever the host says <span className="text-terracotta font-bold">&quot;C&apos;mon in guys!&quot;</span> or{' '}
              <span className="text-terracotta font-bold">&quot;Dig Deep&quot;</span>, the custom replacement for
              &quot;Cheers!&quot; is a synchronous tribe-wide salute.
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
