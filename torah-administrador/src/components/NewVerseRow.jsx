import React, { useLayoutEffect, useRef } from 'react';
import { btn } from '../lib/ui';

// Fila para escribir un versículo nuevo en una posición del capítulo.
const NewVerseRow = ({ number, draft, onNumber, onDraft, onSave, onCancel, saving, error, chapterNumber }) => {
    const textareaRef = useRef(null);

    useLayoutEffect(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${el.scrollHeight + 2}px`;
    }, [draft]);

    useLayoutEffect(() => {
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ block: 'center' });
    }, []);

    const valid = Number(number) > 0 && draft.trim();

    return (
        <li className="border-l-4 border-gold bg-gold-soft/40 px-3 py-4 sm:px-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold">Nuevo versículo</p>
            <div className="grid grid-cols-[4.5rem_1fr] gap-3">
                <label>
                    <span className="mb-1 block text-xs text-muted">Número</span>
                    <input
                        type="number"
                        min={1}
                        value={number}
                        onChange={(e) => onNumber(e.target.value)}
                        disabled={saving}
                        className="h-10 w-full rounded-xl border border-line bg-surface px-2 text-center font-semibold tabular-nums text-gold focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                </label>
                <label>
                    <span className="mb-1 block text-xs text-muted">Texto (sin el número)</span>
                    <textarea
                        ref={textareaRef}
                        rows={2}
                        value={draft}
                        disabled={saving}
                        onChange={(e) => onDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') onCancel();
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && valid) {
                                e.preventDefault();
                                onSave();
                            }
                        }}
                        placeholder="Escribe o pega el texto del versículo…"
                        className="block w-full resize-none rounded-xl border border-brand bg-surface px-3 py-2 font-serif text-[1.05rem] leading-relaxed text-ink outline-none ring-2 ring-brand/20"
                    />
                </label>
            </div>
            {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={onSave} disabled={saving || !valid} className={btn.primary}>
                    {saving ? 'Insertando…' : `Insertar ${chapterNumber}:${number || '?'}`}
                </button>
                <button type="button" onClick={onCancel} disabled={saving} className={btn.ghost}>
                    Cancelar
                </button>
                <span className="ml-auto hidden text-xs text-muted sm:inline">Ctrl + Enter inserta · Esc cancela</span>
            </div>
        </li>
    );
};

export default NewVerseRow;
