import { HISTORICAL_STATS } from '../../data';

const STAT_KEYS = [
    { key: 'tribal',     label: 'Tribal',     color: 'bg-ochre' },
    { key: 'individual', label: 'Individual',  color: 'bg-fire-400' },
    { key: 'voting',     label: 'Voting',      color: 'bg-jungle-400' },
    { key: 'advantages', label: 'Advantages',  color: 'bg-purple-400' },
    { key: 'influence',  label: 'Influence',   color: 'bg-sky-400' },
    { key: 'jury',       label: 'Jury',        color: 'bg-amber-400' },
];

function StatBar({ label, value, color }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-sand-warm/60 font-sans w-16 text-right shrink-0">{label}</span>
            <div className="flex-1 bg-stone-800/60 rounded-full h-2 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${color}`}
                    style={{ width: `${value}%` }}
                />
            </div>
            <span className="text-[10px] text-sand-warm/50 font-sans w-8 shrink-0">{value}%</span>
        </div>
    );
}

export function HistoricalStatBars({ contestantId, compact = false }) {
    const stats = HISTORICAL_STATS[contestantId];
    if (!stats) return null;

    if (compact) {
        return (
            <div className="flex items-center gap-2 mt-1">
                <span className="text-ochre font-bold text-xs font-sans">{stats.overall}%</span>
                <div className="flex-1 bg-stone-800/60 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-ochre to-fire-400"
                        style={{ width: `${stats.overall}%` }}
                    />
                </div>
                <span className="text-[10px] text-sand-warm/40 font-sans">{stats.bestResult}</span>
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-ochre font-bold text-sm font-sans">{stats.overall}% Overall</span>
                <span className="text-sand-warm/50 text-[10px] font-sans">
                    {stats.bestResult} · {stats.timesPlayed}x played · Age {stats.age}
                </span>
            </div>
            {STAT_KEYS.map(({ key, label, color }) => (
                <StatBar key={key} label={label} value={stats[key]} color={color} />
            ))}
        </div>
    );
}

export function HistoricalStatMini({ contestantId }) {
    const stats = HISTORICAL_STATS[contestantId];
    if (!stats) return null;

    return (
        <div className="flex items-center gap-1.5">
            <span className="text-ochre font-bold text-[11px] font-sans">{stats.overall}%</span>
            <span className="text-sand-warm/40 text-[10px] font-sans">{stats.bestResult}</span>
        </div>
    );
}
