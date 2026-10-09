import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Check, CircleAlert, Pencil } from 'lucide-react';
import { btn } from '../lib/ui';

const autoSize = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
};

/*
  Un versículo. Clic en el texto o en el lápiz para editarlo en el lugar.
  Guardar: Ctrl/⌘ + Enter. Cancelar: Esc.
*/
const VerseRow = ({ entry, editing, draft, onStart, onDraft, onCancel, onSave, saving, error, highlighted, justSaved }) => {
    const textareaRef = useRef(null);
    const rowRef = useRef(null);
    const [focusOnOpen, setFocusOnOpen] = useState(false);

    useLayoutEffect(() => {
        if (editing) autoSize(textareaRef.current);
    }, [editing, draft]);

    useEffect(() => {
        if (editing && focusOnOpen) {
            const el = textareaRef.current;
            el?.focus();
            el?.setSelectionRange(el.value.length, el.value.length);
            setFocusOnOpen(false);
        }
    }, [editing, focusOnOpen]);

    useEffect(() => {
        if (highlighted) rowRef.current?.scrollIntoView({ block: 'center' });
    }, [highlighted]);

    const start = () => {
        setFocusOnOpen(true);
        onStart();
    };

    const label = entry.isFragment ? `Entrada ${entry.index + 1} (fragmento)` : `Versículo ${entry.number}`;

    return (
        <li
            ref={rowRef}
            id={entry.number ? `v${entry.number}` : undefined}
            className={`group grid grid-cols-[2rem_1fr_auto] gap-x-2 px-3 sm:grid-cols-[3rem_1fr_auto] sm:gap-x-3 py-3 transition sm:px-4 ${
                highlighted ? 'bg-gold-soft/60 ring-2 ring-gold ring-inset' : editing ? 'bg-brand-soft/60' : 'hover:bg-surface-2/60'
            }`}
        >
            <div className="pt-0.5 text-right">
                {entry.isFragment ? (
                    <span
                        className="inline-flex items-center rounded-md bg-gold-soft px-1.5 py-0.5 text-[0.65rem] font-semibold text-gold"
                        title="Esta entrada no empieza con número: probablemente es la continuación del versículo anterior."
                    >
                        <CircleAlert size={12} className="mr-0.5" aria-hidden="true" />
                        frag.
                    </span>
                ) : (
                    <span className="font-sans text-sm font-semibold tabular-nums text-gold">{entry.number}</span>
                )}
            </div>

            {editing ? (
                <div className="col-span-2 sm:col-span-1">
                    <label>
                        <span className="sr-only">Texto de {label.toLowerCase()}</span>
                        <textarea
                            ref={textareaRef}
                            value={draft}
                            rows={2}
                            disabled={saving}
                            onChange={(e) => onDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') onCancel();
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    onSave();
                                }
                            }}
                            className="block w-full resize-none rounded-xl border border-brand bg-surface px-3 py-2 font-serif text-[1.05rem] leading-relaxed text-ink outline-none ring-2 ring-brand/20"
                        />
                    </label>
                    {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                        <button type="button" onClick={onSave} disabled={saving || !draft.trim()} className={btn.primary}>
                            {saving ? 'Guardando…' : 'Guardar'}
                        </button>
                        <button type="button" onClick={onCancel} disabled={saving} className={btn.ghost}>
                            Cancelar
                        </button>
                        <span className="ml-auto hidden text-xs text-muted sm:inline">Ctrl + Enter guarda · Esc cancela</span>
                    </div>
                </div>
            ) : (
                <>
                    <p
                        onClick={start}
                        className={`cursor-text font-serif text-[1.05rem] leading-relaxed ${entry.isFragment ? 'italic text-muted' : 'text-ink'}`}
                    >
                        {entry.body || <span className="text-muted">(vacío)</span>}
                    </p>
                    <div className="flex items-start gap-1">
                        {justSaved && (
                            <span className="inline-flex h-9 items-center gap-1 text-xs font-medium text-brand" role="status">
                                <Check size={14} aria-hidden="true" /> Guardado
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={start}
                            aria-label={`Editar ${label.toLowerCase()}`}
                            className={`${btn.icon} opacity-60 group-hover:opacity-100 focus-visible:opacity-100`}
                        >
                            <Pencil size={15} aria-hidden="true" />
                        </button>
                    </div>
                </>
            )}
        </li>
    );
};

export default VerseRow;
