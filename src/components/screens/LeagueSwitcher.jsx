import { useState, useEffect, useRef } from 'react';
import { ref, get } from 'firebase/database';
import { db } from '../../firebase';
import { useApp } from '../../AppContext';
import { Icon } from '../fijian';

export default function LeagueSwitcher() {
    const { userLeagues, leagueId, league, switchLeague } = useApp();
    const [open, setOpen] = useState(false);
    const [leagueInfo, setLeagueInfo] = useState({});
    const panelRef = useRef(null);
    const leagueIds = Object.keys(userLeagues || {});
    const hasMultiple = leagueIds.length > 1;

    useEffect(() => {
        if (!open || !db || leagueIds.length === 0) return;
        let cancelled = false;
        (async () => {
            const info = {};
            for (const lid of leagueIds) {
                try {
                    const snap = await get(ref(db, `leagues/${lid}`));
                    const val = snap.val();
                    if (val) {
                        info[lid] = {
                            name: val.name || 'Unnamed',
                            members: val.members ? Object.keys(val.members).length : 0,
                        };
                    }
                } catch { /* skip */ }
            }
            if (!cancelled) setLeagueInfo(info);
        })();
        return () => { cancelled = true; };
    }, [open, leagueIds.join(',')]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('pointerdown', handler);
        return () => document.removeEventListener('pointerdown', handler);
    }, [open]);

    if (!league) return null;

    return (
        <div className="relative" ref={panelRef}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center justify-center gap-1 min-h-[44px] min-w-[44px] px-2 rounded border border-stone-700 text-stone-400 hover:text-ochre hover:border-ochre/40 transition-all text-xs cursor-pointer max-w-[140px]"
                aria-label="League menu"
            >
                <Icon name={hasMultiple ? 'swap_horiz' : 'groups'} className="text-sm shrink-0" />
                <span className="truncate hidden sm:inline">{league.name}</span>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-stone-900 border border-stone-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-stone-700 text-[10px] uppercase tracking-widest text-stone-500 font-bold">
                        Your Leagues
                    </div>
                    {leagueIds.map((lid) => {
                        const info = leagueInfo[lid];
                        const active = lid === leagueId;
                        return (
                            <button
                                key={lid}
                                type="button"
                                onClick={() => {
                                    if (!active) switchLeague(lid);
                                    setOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2.5 flex items-center gap-2 transition-all cursor-pointer ${
                                    active ? 'bg-ochre/10 text-ochre' : 'text-sand-warm/70 hover:bg-stone-800'
                                }`}
                            >
                                {active && <Icon name="check" className="text-ochre text-sm" />}
                                <span className="flex-1 text-sm truncate">
                                    {info?.name || league?.name || lid.slice(0, 8) + '...'}
                                </span>
                                {info && (
                                    <span className="text-[10px] text-stone-500">
                                        {info.members} {info.members === 1 ? 'player' : 'players'}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                    <div className="border-t border-stone-700 px-3 py-2 text-[10px] text-stone-500">
                        Manage league settings in the Rules tab
                    </div>
                </div>
            )}
        </div>
    );
}
