import React, { useEffect, useRef, useState } from 'react';
import { EllipsisVertical } from 'lucide-react';
import { btn } from '../lib/ui';

// Menú "⋮" con acciones secundarias de un versículo.
const RowMenu = ({ label, items, disabled }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                disabled={disabled}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={`Más acciones: ${label}`}
                className={`${btn.icon} opacity-60 group-hover:opacity-100 focus-visible:opacity-100`}
            >
                <EllipsisVertical size={16} aria-hidden="true" />
            </button>
            {open && (
                <div role="menu" className="absolute right-0 top-10 z-20 w-60 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-xl">
                    {items.filter(Boolean).map(({ label: text, Icon, onSelect, danger }) => (
                        <button
                            key={text}
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setOpen(false);
                                onSelect();
                            }}
                            className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm hover:bg-surface-2 ${danger ? 'text-danger' : 'text-ink'}`}
                        >
                            <Icon size={16} aria-hidden="true" />
                            {text}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RowMenu;
