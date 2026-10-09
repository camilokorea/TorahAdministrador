import React, { useEffect, useRef, useState } from 'react';
import { Check, Pencil, X } from 'lucide-react';
import { btn, input } from '../lib/ui';

// Texto con botón de editar; al editar se convierte en un campo con Guardar/Cancelar.
const InlineField = ({ label, value, onSave, display, inputClassName = '', onDirtyChange }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value ?? '');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const dirty = editing && draft.trim() !== (value ?? '').trim();

    useEffect(() => {
        onDirtyChange?.(dirty);
    }, [dirty, onDirtyChange]);

    useEffect(() => {
        if (editing) inputRef.current?.select();
    }, [editing]);

    const start = () => {
        setDraft(value ?? '');
        setError('');
        setEditing(true);
    };

    const cancel = () => {
        setEditing(false);
        setError('');
    };

    const save = async (e) => {
        e?.preventDefault();
        const next = draft.trim();
        if (!next) {
            setError('No puede quedar vacío.');
            return;
        }
        if (next === (value ?? '').trim()) {
            cancel();
            return;
        }
        setBusy(true);
        setError('');
        try {
            await onSave(next);
            setEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    if (!editing) {
        return (
            <div className="group flex items-center gap-1.5">
                {display ?? <span>{value}</span>}
                <button type="button" onClick={start} aria-label={`Editar ${label}`} title={`Editar ${label}`} className={`${btn.icon} h-8 w-8 opacity-60 group-hover:opacity-100`}>
                    <Pencil size={15} aria-hidden="true" />
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={save} className="w-full max-w-xl">
            <div className="flex items-center gap-2">
                <label className="flex-1">
                    <span className="sr-only">{label}</span>
                    <input
                        ref={inputRef}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => e.key === 'Escape' && cancel()}
                        disabled={busy}
                        className={`${input} h-10 ${inputClassName}`}
                    />
                </label>
                <button type="submit" disabled={busy} aria-label="Guardar" title="Guardar (Enter)" className={`${btn.primary} w-10 px-0`}>
                    <Check size={18} aria-hidden="true" />
                </button>
                <button type="button" onClick={cancel} disabled={busy} aria-label="Cancelar" title="Cancelar (Esc)" className={`${btn.secondary} w-10 px-0`}>
                    <X size={18} aria-hidden="true" />
                </button>
            </div>
            {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
        </form>
    );
};

export default InlineField;
