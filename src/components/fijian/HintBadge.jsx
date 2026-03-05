import { useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'survivorHints';

function getDismissed() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch { return {}; }
}

export default function HintBadge({ hintKey, children }) {
    const [open, setOpen] = useState(false);
    const [dismissed, setDismissed] = useState(() => !!getDismissed()[hintKey]);
    const popRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (popRef.current && !popRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('pointerdown', handler);
        return () => document.removeEventListener('pointerdown', handler);
    }, [open]);

    if (dismissed) return null;

    const dismiss = () => {
        setDismissed(true);
        const stored = getDismissed();
        stored[hintKey] = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    };

    return (
        <span className="relative inline-flex items-center" ref={popRef}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-5 h-5 rounded-full bg-ochre/20 text-ochre text-[11px] font-bold flex items-center justify-center hover:bg-ochre/30 transition-colors ml-1.5"
                aria-label="Help"
            >
                ?
            </button>

            {open && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-stone-800 border border-ochre/30 rounded-lg shadow-xl p-3 text-xs text-sand-warm/80 leading-relaxed">
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-stone-800 border-r border-b border-ochre/30 rotate-45" />
                    {children}
                    <button
                        onClick={dismiss}
                        className="block mt-2 text-ochre/70 hover:text-ochre text-[10px] uppercase tracking-wider"
                    >
                        Got it
                    </button>
                </div>
            )}
        </span>
    );
}
