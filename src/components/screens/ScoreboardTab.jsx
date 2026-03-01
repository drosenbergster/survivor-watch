import { useState } from 'react';
import { useApp } from '../../AppContext';
import { ALL_CASTAWAYS, SCORE_EVENTS, PLAYER_COLORS } from '../../data';
import { FijianCard, FijianSectionHeader, Icon } from '../fijian';

const EVENT_ICONS = {
  survived: 'check_circle',
  immunity: 'shield',
  reward: 'restaurant',
  idol_found: 'diamond',
  idol_played: 'diamond',
  advantage: 'extension',
  blindside: 'visibility_off',
  no_votes: 'shield',
  merge: 'groups',
  final5: 'back_hand',
  ftc: 'account_balance',
  winner: 'trophy',
  voted_out: 'close',
  first_boot: 'skull',
};

const EVENT_FIJIAN = {
  immunity: 'Uwa',
  idol_found: 'Cina',
  reward: 'Kakana',
  voted_out: 'Voted Out',
  winner: 'The Winner',
};

const EVENT_ICON_COLORS = {
  immunity: 'text-jungle-400',
  idol_found: 'text-amber-400',
  reward: 'text-amber-300',
  idol_played: 'text-amber-400',
  voted_out: 'text-red-400',
  blindside: 'text-red-400',
  winner: 'text-torch',
};

export default function ScoreboardTab() {
  const { gameState, saveGame } = useApp();
  const { players, draft, scores } = gameState;

  const [selectedCastaway, setSelectedCastaway] = useState('');
  const [logSearch, setLogSearch] = useState('');

  const playerPicks = {};
  for (const [castawayId, playerIdx] of Object.entries(draft?.picks || {})) {
    if (!playerPicks[playerIdx]) playerPicks[playerIdx] = [];
    playerPicks[playerIdx].push(castawayId);
  }

  const playerScores = players.map((_, idx) => {
    const myPicks = playerPicks[idx] || [];
    let total = 0;
    (scores?.events || []).filter((e) => myPicks.includes(e.castawayId)).forEach((e) => { total += e.points; });
    return total;
  });

  const logEvent = async (eventKey) => {
    if (!selectedCastaway) return;
    const event = SCORE_EVENTS.find((e) => e.key === eventKey);
    if (!event) return;

    const newEvent = {
      castawayId: selectedCastaway,
      event: eventKey,
      label: event.label,
      points: event.points,
      timestamp: Date.now(),
    };

    const newEvents = [...(scores?.events || []), newEvent];
    await saveGame({
      ...gameState,
      scores: { ...scores, events: newEvents },
    });
  };

  const undoLast = async () => {
    const events = [...(scores?.events || [])];
    if (events.length === 0) return;
    events.pop();
    await saveGame({
      ...gameState,
      scores: { ...scores, events },
    });
  };

  const ranked = players
    .map((name, idx) => ({ name, idx, score: playerScores[idx] }))
    .sort((a, b) => b.score - a.score);

  const recentEvents = (scores?.events || []).slice().reverse().slice(0, 10);
  const filteredLog = logSearch
    ? recentEvents.filter((e) =>
        e.label.toLowerCase().includes(logSearch.toLowerCase()) ||
        (ALL_CASTAWAYS.find((c) => c.id === e.castawayId)?.name || '').toLowerCase().includes(logSearch.toLowerCase())
      )
    : recentEvents;

  return (
    <div className="space-y-8 relative">
      <div className="absolute inset-0 masi-pattern-bingo opacity-[0.15] pointer-events-none rounded-lg" aria-hidden />
      <div className="relative z-10">
      {/* Hero header — Stitch style */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-700 pb-6 bg-stone-800/40 p-6 rounded-lg backdrop-blur-sm">
        <div>
          <h1 className="text-4xl md:text-6xl font-display text-sand-warm tracking-widest uppercase text-shadow-wood">
            Tovo Dashboard
          </h1>
          <p className="text-stone-400 mt-2 font-medium tracking-wide font-sans">Live Tribal Council & Challenge Statistics</p>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 border border-stone-600 rounded text-sm font-bold tracking-wider text-stone-300 uppercase">
            <Icon name="calendar_today" className="text-lg" />
            Season 50
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Top Survivors + Score Events */}
        <div className="lg:col-span-2 space-y-8">
          {/* Top Survivors — tribal card frame */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-sand-warm flex items-center gap-2 font-display tracking-wide text-2xl">
                <Icon name="stars" className="text-amber" />
                Top Survivors
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {ranked.map(({ name, idx, score }, rank) => (
                <article
                  key={idx}
                  className="tribal-card-outer shadow-2xl overflow-hidden group"
                >
                  <div className="tribal-card-frame p-4 flex flex-col items-center relative z-0 mx-1">
                    <div className="absolute top-2 right-2">
                      <Icon name="workspace_premium" className={rank === 0 ? 'text-sand-warm' : 'text-stone-400'} aria-hidden />
                    </div>
                    <div
                      className="w-16 h-16 rounded-full border-4 flex items-center justify-center mb-3 bg-stone-950 text-sand-warm font-display text-2xl relative"
                      style={{ borderColor: PLAYER_COLORS[idx].hex }}
                    >
                      {name.charAt(0)}
                      <div
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded text-black shadow-md"
                        style={{ backgroundColor: PLAYER_COLORS[idx].hex }}
                      >
                        #{rank + 1}
                      </div>
                    </div>
                    <h3 className="font-display text-lg tracking-widest text-xl mt-2" style={{ color: PLAYER_COLORS[idx].hex }}>
                      {name}
                    </h3>
                    <div className="flex items-baseline gap-1 bg-stone-950 px-4 py-1 rounded border border-stone-700 mt-3">
                      <span className="text-2xl font-wood font-bold text-sand-warm">{score}</span>
                      <span className="text-[10px] text-stone-500 uppercase font-bold">Pts</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1 justify-center">
                      {(playerPicks[idx] || []).slice(0, 4).map((cId) => {
                        const c = ALL_CASTAWAYS.find((x) => x.id === cId);
                        const isEliminated = (gameState.eliminated || []).includes(cId);
                        return (
                          <span
                            key={cId}
                            className={`text-[10px] px-1.5 py-0.5 rounded ${isEliminated ? 'line-through opacity-40' : 'text-sand-warm/80'} bg-stone-900/50`}
                          >
                            {c?.name?.split(' ')[0] || cId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Score Events — wood-btn grid */}
          <section>
            <h2 className="text-xl font-bold text-sand-warm mb-4 flex items-center gap-2 font-display tracking-wide text-2xl">
              <Icon name="edit_note" className="text-amber" />
              Score Events
            </h2>
            <div className="bg-stone-800 p-6 border-2 border-stone-600 rounded shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="mb-6 bg-stone-950 p-4 border border-stone-700 rounded shadow-inner">
                  <label className="block text-xs font-bold text-sand-warm uppercase tracking-widest mb-2">
                    Castaway Action
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCastaway}
                      onChange={(e) => setSelectedCastaway(e.target.value)}
                      className="flex-1 bg-stone-800 border border-stone-600 rounded px-4 py-3 text-sand-warm placeholder-stone-600 focus:outline-none focus:border-ochre/60 focus:ring-1 focus:ring-ochre/40 transition-all text-sm"
                      aria-label="Select castaway to log event for"
                    >
                      <option value="">Select castaway or enter event...</option>
                      {ALL_CASTAWAYS.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={undoLast}
                      className="wood-btn text-sand-warm px-6 py-3 rounded font-bold tracking-wider uppercase text-sm disabled:opacity-50"
                      disabled={!(scores?.events?.length)}
                    >
                      Undo
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {SCORE_EVENTS.filter((e) => !e.negative && e.key !== 'survived').slice(0, 8).map((ev) => (
                    <button
                      key={ev.key}
                      type="button"
                      onClick={() => logEvent(ev.key)}
                      disabled={!selectedCastaway}
                      className="wood-btn h-24 rounded flex flex-col items-center justify-center gap-2 transition-all group relative overflow-hidden disabled:opacity-30 disabled:cursor-default"
                    >
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" aria-hidden />
                      <Icon name={EVENT_ICONS[ev.key]} className={`text-3xl drop-shadow-md group-hover:scale-110 transition-transform ${EVENT_ICON_COLORS[ev.key] || 'text-torch'}`} />
                      <div className="text-center leading-tight">
                        <span className="block text-sm font-display tracking-widest text-[#fcd34d]">{ev.label}</span>
                        {EVENT_FIJIAN[ev.key] && (
                          <span className="block text-[10px] text-stone-400 font-bold uppercase">({EVENT_FIJIAN[ev.key]})</span>
                        )}
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => logEvent('voted_out')}
                    disabled={!selectedCastaway}
                    className="h-24 bg-stone-950 hover:bg-stone-800 border border-stone-700 active:translate-y-1 rounded flex flex-col items-center justify-center gap-2 transition-all group disabled:opacity-30"
                  >
                    <Icon name="close" className="text-3xl text-stone-500 group-hover:text-red-500 group-hover:scale-110 transition-all" />
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider group-hover:text-red-400">Voted Out</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => logEvent('winner')}
                    disabled={!selectedCastaway}
                    className="col-span-2 h-24 wood-btn border-2 border-torch active:translate-y-1 rounded flex flex-row items-center justify-center gap-3 transition-all group shadow-md disabled:opacity-30"
                  >
                    <Icon name="trophy" className="text-4xl text-torch group-hover:scale-110 transition-transform animate-pulse" />
                    <div className="text-left">
                      <span className="block text-2xl font-display font-bold text-torch uppercase tracking-widest">Sole Survivor</span>
                      <span className="block text-xs text-sand-warm uppercase tracking-wider">The Winner</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Tribal Log — Stitch 04 corner accents */}
        <div className="lg:col-span-1">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-sand-warm flex items-center gap-2 font-display tracking-wide text-2xl">
                <Icon name="history" className="text-amber" />
                Tribal Log
              </h2>
              <button type="button" className="p-1 hover:bg-stone-800 rounded text-stone-400 transition-colors" aria-label="Filter log">
                <Icon name="filter_list" className="text-lg" />
              </button>
            </div>
            <div className="corner-accents bg-stone-800 border-2 border-stone-600 min-h-[400px] overflow-hidden flex flex-col shadow-2xl rounded">
              <div className="p-4 border-b border-stone-600 bg-stone-950">
                <div className="relative">
                  <Icon name="search" className="absolute left-3 top-2.5 text-stone-500 text-lg" aria-hidden />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search events..."
                    className="w-full bg-stone-800 border border-stone-600 rounded py-2 pl-10 pr-4 text-sm text-sand-warm focus:outline-none focus:border-ochre/60 placeholder-stone-600"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
                {filteredLog.length === 0 ? (
                  <p className="text-stone-500 text-sm italic">No events yet. Log score events above.</p>
                ) : (
                  filteredLog.map((e, i) => {
                    const c = ALL_CASTAWAYS.find((x) => x.id === e.castawayId);
                    const iconColor = e.points > 0 ? 'text-jungle-400 bg-jungle-900/30 border-jungle-800' : 'text-red-400 bg-red-900/30 border-red-800';
                    return (
                      <div
                        key={i}
                        className="flex gap-3 items-start pb-4 border-b border-stone-800 last:border-0 last:pb-0 group hover:bg-white/5 p-2 rounded transition-colors"
                      >
                        <span className={`shrink-0 p-1.5 rounded border text-lg ${iconColor}`}>
                          <Icon name={EVENT_ICONS[e.event] || 'circle'} className="text-lg" />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-sand-warm">{e.label}</p>
                          <p className="text-xs text-stone-400">{c?.name}</p>
                          <p className="text-[10px] text-stone-600 mt-1 uppercase tracking-wide font-bold">
                            {e.points > 0 ? '+' : ''}{e.points} pts
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      </div>
    </div>
  );
}
