import React, { useCallback, useEffect, useState } from 'react';
import { Eye, PencilLine, RefreshCw, Undo2 } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { useUnsavedChanges } from '../lib/useUnsavedChanges';
import { btn, card } from '../lib/ui';

/*
  Editor de un texto largo (Dedicatoria, Glosario) con vista previa de cómo
  lo muestra la app pública. En pantallas grandes se ven lado a lado.
*/
const ContentEditor = ({ title, description, load, save, Preview, help }) => {
    const { token } = useAuth();
    const toast = useToast();
    const [record, setRecord] = useState(null);
    const [draft, setDraft] = useState('');
    const [loadError, setLoadError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('edit');

    const fetchRecord = useCallback(async () => {
        setLoadError(null);
        try {
            const list = await load();
            const first = list?.[0] ?? null;
            setRecord(first);
            setDraft(first?.contenido ?? '');
        } catch (e) {
            setLoadError(e.message);
        }
    }, [load]);

    useEffect(() => {
        fetchRecord();
    }, [fetchRecord]);

    const dirty = !!record && draft !== (record.contenido ?? '');
    useUnsavedChanges(dirty);

    const onSave = async () => {
        setSaving(true);
        try {
            await save(token, record.id, draft);
            setRecord((r) => ({ ...r, contenido: draft }));
            toast.success(`${title} guardado.`);
        } catch (e) {
            toast.error(e.status === 401 ? 'La sesión expiró. Vuelve a entrar y pulsa Guardar otra vez.' : `No se pudo guardar: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            if (dirty && !saving) onSave();
        }
    };

    if (loadError) {
        return (
            <div className="rounded-2xl bg-danger/10 p-6 text-danger">
                <p className="font-semibold">No se pudo cargar el contenido.</p>
                <p className="mt-1 text-sm">{loadError}</p>
                <button type="button" onClick={fetchRecord} className={`${btn.secondary} mt-4`}>
                    <RefreshCw size={16} aria-hidden="true" /> Reintentar
                </button>
            </div>
        );
    }

    return (
        <div onKeyDown={onKeyDown}>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="font-serif text-3xl font-semibold">{title}</h1>
                    <p className="mt-1 text-sm text-muted">{description}</p>
                </div>
                <div className="flex items-center gap-2">
                    {dirty && <span className="text-xs font-medium text-gold" role="status">Cambios sin guardar</span>}
                    <button type="button" onClick={() => setDraft(record.contenido ?? '')} disabled={!dirty || saving} className={btn.ghost}>
                        <Undo2 size={16} aria-hidden="true" /> Descartar
                    </button>
                    <button type="button" onClick={onSave} disabled={!dirty || saving || !record} className={btn.primary}>
                        {saving ? 'Guardando…' : 'Guardar'}
                    </button>
                </div>
            </div>

            <div role="tablist" aria-label="Modo" className="mt-6 flex gap-1 rounded-full bg-surface-2 p-1 lg:hidden">
                {[
                    ['edit', 'Editar', PencilLine],
                    ['preview', 'Vista previa', Eye],
                ].map(([key, label, Icon]) => (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={tab === key}
                        onClick={() => setTab(key)}
                        className={`flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold ${tab === key ? 'bg-surface text-brand shadow-sm' : 'text-muted'}`}
                    >
                        <Icon size={15} aria-hidden="true" /> {label}
                    </button>
                ))}
            </div>

            <div className="mt-4 grid gap-6 lg:mt-6 lg:grid-cols-2">
                <section className={tab === 'edit' ? '' : 'hidden lg:block'} aria-label="Editor">
                    <h2 className="mb-2 hidden text-xs font-semibold uppercase tracking-wider text-muted lg:block">Texto</h2>
                    {record ? (
                        <textarea
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            spellCheck
                            lang="es"
                            className="block h-[65dvh] w-full resize-y rounded-2xl border border-line bg-surface p-4 font-serif text-[1rem] leading-relaxed text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                    ) : (
                        <div className={`${card} h-[65dvh] animate-pulse`} />
                    )}
                    <p className="mt-2 flex justify-between text-xs text-muted">
                        <span>{help}</span>
                        <span className="tabular-nums">{draft.length.toLocaleString('es')} caracteres</span>
                    </p>
                </section>
                <section className={tab === 'preview' ? '' : 'hidden lg:block'} aria-label="Vista previa">
                    <h2 className="mb-2 hidden text-xs font-semibold uppercase tracking-wider text-muted lg:block">Así se verá en la app</h2>
                    <div className={`${card} h-[65dvh] overflow-y-auto p-5`}>
                        <Preview text={draft} />
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ContentEditor;
