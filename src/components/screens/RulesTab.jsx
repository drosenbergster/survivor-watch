import { SCORE_EVENTS } from '../../data';
import { ScreenHeader } from '../ui';

export default function RulesTab() {
    return (
        <article className="max-w-2xl mx-auto space-y-4">
            <ScreenHeader title="How to Play" />

            {/* Draft rules */}
            <section className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <h3 className="font-display text-xl tracking-wider text-fire-400 mb-3">🏆 Bracket Draft</h3>
                <ol className="text-stone-400 text-sm space-y-2 list-decimal pl-5 leading-relaxed">
                    <li>Enter your <strong className="text-stone-200">4 player names</strong> and hit Start Draft.</li>
                    <li>Snake draft order: 1→2→3→4→4→3→2→1 … <strong className="text-stone-200">(6 rounds)</strong>.</li>
                    <li>Each person drafts <strong className="text-stone-200">6 castaways</strong> from the full S50 cast of 24.</li>
                    <li>Click a castaway's name when it's your turn to draft them.</li>
                    <li>Your drafted castaways earn you points all season long!</li>
                </ol>
            </section>

            {/* Scoring */}
            <section className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <h3 className="font-display text-xl tracking-wider text-fire-400 mb-3">📊 Scoring</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-stone-700">
                                <th className="text-left py-2 px-2 text-stone-300 font-medium" scope="col">Event</th>
                                <th className="text-right py-2 px-2 text-stone-300 font-medium" scope="col">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {SCORE_EVENTS.map(ev => (
                                <tr key={ev.key} className="border-b border-stone-800">
                                    <td className="py-1.5 px-2 text-stone-400">{ev.emoji} {ev.label}</td>
                                    <td className={`py-1.5 px-2 text-right font-semibold ${ev.negative ? 'text-fire-400' : 'text-jungle-400'}`}>
                                        {ev.points > 0 ? '+' : ''}{ev.points}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Bingo rules */}
            <section className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                <h3 className="font-display text-xl tracking-wider text-fire-400 mb-3">🎯 Bingo</h3>
                <ol className="text-stone-400 text-sm space-y-2 list-decimal pl-5 leading-relaxed">
                    <li>Each player gets a unique <strong className="text-stone-200">5×5 bingo card</strong> with Survivor moments.</li>
                    <li>Watch the episode — <strong className="text-stone-200">mark squares</strong> as things happen!</li>
                    <li>First to five in a row (horizontal, vertical, or diagonal) yells <strong className="text-fire-400">"JEFF PROBST!"</strong> 🍻</li>
                    <li>Center square is a <strong className="text-jungle-400">free space</strong>.</li>
                    <li>Generate new cards each episode for fresh fun.</li>
                </ol>
            </section>

            {/* Jeff Probst rule */}
            <section className="bg-gradient-to-br from-fire-400/10 to-fire-600/5 border border-fire-400/30 rounded-xl p-6 text-center">
                <h3 className="font-display text-xl tracking-wider text-fire-400 mb-2">🍻 The Jeff Probst Rule</h3>
                <p className="text-stone-400 text-sm mb-3">Whenever someone gets Bingo, <em>everyone</em> raises their glass and yells:</p>
                <p className="font-display text-5xl tracking-wider text-torch text-glow-torch animate-flicker py-2">
                    "JEFF PROBST!"
                </p>
                <p className="text-stone-500 text-sm mt-3">It's the law of the island. 🏝️</p>
            </section>
        </article>
    );
}
