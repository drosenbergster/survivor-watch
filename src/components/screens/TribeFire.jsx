import { useMemo } from 'react';
import { useApp } from '../../AppContext';
import { HintBadge } from '../fijian';
import { buildTribeFire } from '../../tribeFire';

function flameLabel(flame) {
    if (flame.live && flame.level === 'faded') return `${flame.name}, faded flame, watching now`;
    if (flame.live) return `${flame.name}, flame lit, watching now`;
    if (flame.level === 'faded') return `${flame.name}, faded flame`;
    return `${flame.name}, flame lit`;
}

export default function TribeFire() {
    const { episodes, watchStatus, leagueMembers, user } = useApp();

    const flames = useMemo(
        () => buildTribeFire({
            episodes,
            watchStatus,
            members: leagueMembers,
            selfUid: user?.uid,
        }),
        [episodes, watchStatus, leagueMembers, user]
    );

    const anyScored = useMemo(
        () => Object.values(episodes || {}).some(ep => ep?.scored),
        [episodes]
    );

    if (flames.length === 0) {
        if (anyScored) return null;
        return (
            <p className="text-sand-warm/40 text-xs font-sans text-center">
                Be the first to light your torch.
            </p>
        );
    }

    return (
        <div className="flex flex-wrap items-start justify-center gap-x-3 gap-y-2">
            <ul className="flex flex-wrap justify-center gap-x-3 gap-y-2">
                {flames.map(flame => (
                    <li
                        key={flame.uid}
                        className="flex flex-col items-center w-14 text-center"
                        aria-label={flameLabel(flame)}
                    >
                        <span
                            className={`text-lg leading-none ${
                                flame.live
                                    ? 'animate-flicker'
                                    : flame.level === 'lit'
                                        ? 'opacity-80'
                                        : 'opacity-25 saturate-0'
                            }`}
                            aria-hidden="true"
                        >
                            🔥
                        </span>
                        <span className={`mt-0.5 text-[11px] font-sans truncate w-full ${
                            flame.uid === user?.uid
                                ? 'text-ochre'
                                : flame.level === 'faded'
                                    ? 'text-sand-warm/35'
                                    : 'text-sand-warm/70'
                        }`}>
                            {flame.name}
                        </span>
                    </li>
                ))}
            </ul>
            <HintBadge hintKey="tribeFire">
                Who is still in it. A flickering flame is watching right now, a steady one is caught up,
                and a dim one missed last week.
            </HintBadge>
        </div>
    );
}
