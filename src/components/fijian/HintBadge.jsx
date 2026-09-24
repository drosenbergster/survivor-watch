import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const STORAGE_KEY = 'survivorHints';
const PANEL_WIDTH = 256;

function getDismissed() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch { return {}; }
}

export default function HintBadge({ hintKey, children }) {
    const [open, setOpen] = useState(false);
    const [dismissed, setDismissed] = useState(() => !!getDismissed()[hintKey]);
    const [box, setBox] = useState(null);
    const popRef = useRef(null);
    const btnRef = useRef(null);
    const panelRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            const target = e.target;
            if (popRef.current?.contains(target) || panelRef.current?.contains(target)) return;
            setOpen(false);
        };
        document.addEventListener('pointerdown', handler);
        return () => document.removeEventListener('pointerdown', handler);
    }, [open]);

    useLayoutEffect(() => {
        if (!open || !btnRef.current) return;
        const place = () => {
            const rect = btnRef.current.getBoundingClientRect();
            const margin = 12;
            const placeAbove = rect.top > 160;
            let left = rect.left + rect.width / 2;
            left = Math.max(margin + PANEL_WIDTH / 2, Math.min(left, window.innerWidth - margin - PANEL_WIDTH / 2));
            setBox({
                top: placeAbove ? rect.top - 8 : rect.bottom + 8,
                left,
                placeAbove,
            });
        };
        place();
        window.addEventListener('resize', place);
        window.addEventListener('scroll', place, true);
        return () => {
            window.removeEventListener('resize', place);
            window.removeEventListener('scroll', place, true);
        };
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
                ref={btnRef}
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-5 h-5 rounded-full bg-ochre/20 text-ochre text-[11px] font-bold flex items-center justify-center hover:bg-ochre/30 transition-colors ml-1.5"
                aria-label="Help"
                aria-expanded={open}
            >
                ?
            </button>

            {open && box && createPortal(
                <div
                    ref={panelRef}
                    role="tooltip"
                    style={{
                        position: 'fixed',
                        top: box.top,
                        left: box.left,
                        transform: box.placeAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
                        width: PANEL_WIDTH,
                        zIndex: 80,
                    }}
                    className="bg-stone-800 border border-ochre/30 rounded-lg shadow-xl p-3 text-xs text-sand-warm/80 leading-relaxed"
                >
                    {children}
                    <button
                        type="button"
                        onClick={dismiss}
                        className="block mt-2 text-ochre/70 hover:text-ochre text-[10px] uppercase tracking-wider"
                    >
                        Got it
                    </button>
                </div>,
                document.body
            )}
        </span>
    );
}
