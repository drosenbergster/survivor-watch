import { useMemo } from 'react';
import { useApp } from '../../AppContext';
import { FijianCard, Icon } from '../fijian';
import { buildFireCircle } from '../../fireCircle';

function Seat({ name, isSelf, order }) {
    return (
        <li className="flex flex-col items-center w-16 text-center">
            <span className="text-xl leading-none" aria-hidden="true">🔥</span>
            <span className={`mt-0.5 text-[11px] font-sans truncate w-full ${isSelf ? 'text-ochre' : 'text-sand-warm/70'}`}>
                {name}
            </span>
            {order != null && (
                <span className="text-[10px] text-sand-warm/30 font-sans">{order}</span>
            )}
        </li>
    );
}

function Pile({ label, people, selfUid, tone }) {
    if (people.length === 0) {
        return (
            <div className="flex-1 min-w-0">
                <p className={`text-[10px] uppercase tracking-wider font-sans ${tone.label}`}>{label}</p>
                <p className="text-sand-warm/25 text-xs font-sans mt-0.5">Nobody</p>
            </div>
        );
    }

    return (
        <div className="flex-1 min-w-0">
            <p className={`text-[10px] uppercase tracking-wider font-sans ${tone.label}`}>{label}</p>
            <p className="text-xs font-sans mt-0.5 leading-relaxed">
                {people.map((person, i) => (
                    <span key={person.uid}>
                        <span className={person.uid === selfUid ? `${tone.self} font-semibold` : 'text-sand-warm/60'}>
                            {person.name}
                        </span>
                        {i < people.length - 1 && <span className="text-sand-warm/25">, </span>}
                    </span>
                ))}
            </p>
        </div>
    );
}

export default function FireCircle({ episodeNum }) {
    const { episodes, watchStatus, leagueMembers, user } = useApp();

    const circle = useMemo(
        () => buildFireCircle({
            episode: episodes?.[episodeNum],
            episodeNum,
            watchStatus,
            members: leagueMembers,
            selfUid: user?.uid,
        }),
        [episodes, episodeNum, watchStatus, leagueMembers, user]
    );

    if (!circle) return null;

    const { returned, stillOut, lines } = circle;

    return (
        <FijianCard className="p-4 space-y-4">
            <div className="text-center">
                <h3 className="font-display text-xl tracking-wider text-sand-warm">Fire Circle</h3>
                <p className="text-sand-warm/40 text-xs font-sans mt-0.5">
                    {returned.length === 1
                        ? 'You are the first one at the fire.'
                        : `${returned.length} of you are sitting at the fire.`}
                </p>
            </div>

            <ul className="flex flex-wrap justify-center gap-x-3 gap-y-2">
                {returned.map((person, i) => (
                    <Seat key={person.uid} name={person.name} isSelf={person.uid === user?.uid} order={i + 1} />
                ))}
            </ul>

            {stillOut.length > 0 && (
                <p className="text-sand-warm/35 text-xs font-sans text-center">
                    Still watching: {stillOut.map(p => p.name).join(', ')}
                </p>
            )}

            {lines.length > 0 && (
                <div className="space-y-3 pt-1 border-t border-ochre/10">
                    <div className="flex items-center gap-2 pt-2">
                        <Icon name="mail" className="text-ochre text-sm" />
                        <p className="text-ochre text-[11px] font-bold uppercase tracking-widest">How the Room Called It</p>
                    </div>

                    {lines.map(line => (
                        <div key={line.id} className="space-y-1.5">
                            <div className="flex items-start gap-2">
                                <span className={`text-[10px] font-bold font-sans mt-0.5 shrink-0 ${line.answer ? 'text-jungle-400' : 'text-fire-400'}`}>
                                    {line.answer ? 'YES' : 'NO'}
                                </span>
                                <span className="text-sand-warm text-xs font-sans">{line.text}</span>
                            </div>
                            <div className="flex gap-3 pl-7">
                                <Pile
                                    label="Called it"
                                    people={line.calledIt}
                                    selfUid={user?.uid}
                                    tone={{ label: 'text-jungle-400/70', self: 'text-jungle-400' }}
                                />
                                <Pile
                                    label="Missed it"
                                    people={line.missedIt}
                                    selfUid={user?.uid}
                                    tone={{ label: 'text-fire-400/70', self: 'text-fire-400' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </FijianCard>
    );
}
