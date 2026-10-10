import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowUp, BookOpenText, Eye, ImageIcon, PencilLine, Plus, RefreshCw, Trash2, Type } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { useUnsavedChanges } from '../lib/useUnsavedChanges';
import { btn, card, input } from '../lib/ui';
import { StatusBadge } from './Estudios';
import MarkdownEditor from '../components/estudio/MarkdownEditor';
import ImageField from '../components/estudio/ImageField';
import VersesField from '../components/estudio/VersesField';
import StudyView from '../components/estudio/StudyView';

const tmpId = () => `n${Math.random().toString(36).slice(2, 10)}`;

const BLOCK_TYPES = {
    texto: { label: 'Texto', Icon: Type, create: () => ({ tipo: 'texto', texto: '' }) },
    imagen: { label: 'Imagen', Icon: ImageIcon, create: () => ({ tipo: 'imagen', imagenId: null, leyenda: '' }) },
    versiculos: { label: 'Versículos', Icon: BookOpenText, create: () => ({ tipo: 'versiculos', referencias: [] }) },
};

// Solo los campos que se guardan, para comparar si hay cambios sin guardar.
const editable = (e) =>
    e && {
        titulo: e.titulo,
        resumen: e.resumen ?? '',
        portadaImagenId: e.portadaImagenId ?? null,
        secciones: e.secciones.map((s) => ({
            id: s.id,
            titulo: s.titulo,
            bloques: s.bloques.map((b) => ({
                id: b.id,
                tipo: b.tipo,
                texto: b.tipo === 'texto' ? b.texto ?? '' : null,
                imagenId: b.tipo === 'imagen' ? b.imagenId ?? null : null,
                leyenda: b.tipo === 'imagen' ? b.leyenda ?? '' : null,
                referencias: b.tipo === 'versiculos' ? b.referencias ?? [] : [],
            })),
        })),
    };

const moveItem = (list, index, step) => {
    const next = [...list];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    return next;
};

const blockHasContent = (b) =>
    (b.tipo === 'texto' && b.texto?.trim()) || (b.tipo === 'imagen' && b.imagenId) || (b.tipo === 'versiculos' && b.referencias?.length);

const SmallIconButton = ({ label, onClick, disabled, children, danger }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        className={`${btn.icon} h-8 w-8 ${danger ? 'hover:text-danger' : ''}`}
    >
        {children}
    </button>
);

const EstudioEditor = () => {
    const { id } = useParams();
    const { token } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [server, setServer] = useState(null);
    const [draft, setDraft] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [conflict, setConflict] = useState(false);
    const [preview, setPreview] = useState(false);
    const [deleted, setDeleted] = useState(false);

    const load = useCallback(async () => {
        setLoadError(null);
        try {
            const e = await api.getEstudio(token, id);
            setServer(e);
            setDraft(e);
            setConflict(false);
            setSaveError('');
        } catch (err) {
            setLoadError(err.message);
        }
    }, [id, token]);

    useEffect(() => {
        load();
    }, [load]);

    const dirty = useMemo(
        () => !!server && !!draft && JSON.stringify(editable(server)) !== JSON.stringify(editable(draft)),
        [server, draft]
    );
    useUnsavedChanges(dirty && !deleted);

    useEffect(() => {
        if (deleted) navigate('/estudios', { replace: true });
    }, [deleted, navigate]);

    const update = (patch) => setDraft((d) => ({ ...d, ...patch }));
    const updateSection = (si, patch) =>
        setDraft((d) => ({ ...d, secciones: d.secciones.map((s, i) => (i === si ? { ...s, ...patch } : s)) }));
    const updateBlock = (si, bi, patch) =>
        setDraft((d) => ({
            ...d,
            secciones: d.secciones.map((s, i) =>
                i === si ? { ...s, bloques: s.bloques.map((b, j) => (j === bi ? { ...b, ...patch } : b)) } : s
            ),
        }));

    const save = async () => {
        if (!draft.titulo.trim()) {
            setSaveError('El estudio necesita un título.');
            return null;
        }
        setSaving(true);
        setSaveError('');
        try {
            const saved = await api.guardarEstudio(token, { id: server.id, revision: server.revision, ...editable(draft) });
            setServer(saved);
            setDraft(saved);
            toast.success('Estudio guardado.');
            return saved;
        } catch (e) {
            if (e.status === 409) setConflict(true);
            setSaveError(e.message);
            return null;
        } finally {
            setSaving(false);
        }
    };

    const togglePublish = async () => {
        const publicar = !server.publicado;
        if (publicar && !draft.secciones.some((s) => s.bloques.some(blockHasContent))) {
            setSaveError('Agrega contenido a alguna sección antes de publicar.');
            return;
        }
        if (dirty && !(await save())) return;
        setSaving(true);
        try {
            await api.estadoEstudio(token, server.id, publicar);
            const fresh = await api.getEstudio(token, server.id);
            setServer(fresh);
            setDraft(fresh);
            toast.success(publicar ? 'Estudio publicado. Ya aparece en la app.' : 'Estudio pasado a borrador. Ya no aparece en la app.');
        } catch (e) {
            toast.error(`No se pudo cambiar el estado: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        if (!window.confirm(`¿Eliminar el estudio “${server.titulo}”?\n\nSe borran también sus imágenes. Esta acción no se puede deshacer.`)) return;
        try {
            await api.eliminarEstudio(token, server.id);
            toast.success('Estudio eliminado.');
            setDeleted(true);
        } catch (e) {
            toast.error(`No se pudo eliminar: ${e.message}`);
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            if (dirty && !saving) save();
        }
    };

    if (loadError) {
        return (
            <div className="rounded-2xl bg-danger/10 p-6 text-danger">
                <p className="font-semibold">No se pudo abrir el estudio.</p>
                <p className="mt-1 text-sm">{loadError}</p>
                <div className="mt-4 flex gap-2">
                    <button type="button" onClick={load} className={btn.secondary}>
                        <RefreshCw size={16} aria-hidden="true" /> Reintentar
                    </button>
                    <Link to="/estudios" className={btn.ghost}>Volver a los estudios</Link>
                </div>
            </div>
        );
    }

    if (!draft) return <div className={`${card} h-96 animate-pulse`} aria-busy="true" />;

    return (
        <div onKeyDown={onKeyDown}>
            <nav aria-label="Ruta" className="text-sm text-muted">
                <Link to="/estudios" className="hover:text-brand">Estudios</Link>
                <span className="mx-2" aria-hidden="true">/</span>
                <span className="text-ink">{server.titulo}</span>
            </nav>

            <div className="sticky top-14 z-20 -mx-4 mt-3 flex flex-wrap items-center gap-2 border-y border-line bg-page/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0">
                <StatusBadge publicado={server.publicado} />
                {dirty && <span className="text-xs font-medium text-gold" role="status">Cambios sin guardar</span>}
                <div className="ml-auto flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => setPreview((p) => !p)} className={btn.ghost}>
                        {preview ? <PencilLine size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                        {preview ? 'Editar' : 'Vista previa'}
                    </button>
                    <button type="button" onClick={togglePublish} disabled={saving} className={btn.secondary}>
                        {server.publicado ? 'Pasar a borrador' : 'Publicar'}
                    </button>
                    <button type="button" onClick={save} disabled={!dirty || saving} className={btn.primary}>
                        {saving ? 'Guardando…' : 'Guardar'}
                    </button>
                </div>
            </div>

            {saveError && (
                <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-danger/10 p-4 text-sm text-danger">
                    {saveError}
                    {conflict && (
                        <button
                            type="button"
                            onClick={() => window.confirm('Se descartarán tus cambios y se cargará la versión guardada. ¿Continuar?') && load()}
                            className={btn.secondary}
                        >
                            <RefreshCw size={16} aria-hidden="true" /> Cargar la versión actual
                        </button>
                    )}
                </div>
            )}

            {preview ? (
                <div className={`${card} mt-6 px-5 py-8 sm:px-10`}>
                    <StudyView estudio={draft} />
                </div>
            ) : (
                <div className="mt-6 space-y-6">
                    <section className={`${card} space-y-4 p-5`} aria-label="Datos generales">
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">Título</span>
                            <input
                                value={draft.titulo}
                                onChange={(e) => update({ titulo: e.target.value })}
                                maxLength={200}
                                className={`${input} h-12 font-serif text-xl font-semibold`}
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">Resumen (opcional)</span>
                            <textarea
                                value={draft.resumen ?? ''}
                                onChange={(e) => update({ resumen: e.target.value })}
                                maxLength={1000}
                                rows={2}
                                placeholder="Una o dos frases que aparecen en la lista de estudios."
                                className={`${input} resize-y py-2.5`}
                            />
                        </label>
                        <div>
                            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">Imagen de portada (opcional)</span>
                            <ImageField label="Portada" aspect="aspect-[2/1]" value={draft.portadaImagenId} onChange={(portadaImagenId) => update({ portadaImagenId })} />
                        </div>
                    </section>

                    {draft.secciones.map((s, si) => (
                        <section key={s.id} className={`${card} p-5`} aria-label={`Sección ${si + 1}`}>
                            <div className="flex items-center gap-2">
                                <span className="shrink-0 rounded-full bg-gold-soft px-2.5 py-1 text-xs font-semibold text-gold">Sección {si + 1}</span>
                                <label className="flex-1">
                                    <span className="sr-only">Título de la sección {si + 1}</span>
                                    <input
                                        value={s.titulo}
                                        onChange={(e) => updateSection(si, { titulo: e.target.value })}
                                        placeholder="Título de la sección"
                                        maxLength={200}
                                        className={`${input} h-10 font-serif text-lg font-semibold`}
                                    />
                                </label>
                                <SmallIconButton label="Subir sección" disabled={si === 0} onClick={() => update({ secciones: moveItem(draft.secciones, si, -1) })}>
                                    <ArrowUp size={15} aria-hidden="true" />
                                </SmallIconButton>
                                <SmallIconButton label="Bajar sección" disabled={si === draft.secciones.length - 1} onClick={() => update({ secciones: moveItem(draft.secciones, si, 1) })}>
                                    <ArrowDown size={15} aria-hidden="true" />
                                </SmallIconButton>
                                <SmallIconButton
                                    label="Eliminar sección"
                                    danger
                                    onClick={() =>
                                        (!s.bloques.some(blockHasContent) || window.confirm(`¿Eliminar la sección “${s.titulo || si + 1}” y todo su contenido?`)) &&
                                        update({ secciones: draft.secciones.filter((_, i) => i !== si) })
                                    }
                                >
                                    <Trash2 size={15} aria-hidden="true" />
                                </SmallIconButton>
                            </div>

                            <div className="mt-4 space-y-4">
                                {s.bloques.length === 0 && (
                                    <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
                                        Esta sección está vacía. Agrega texto, una imagen o versículos.
                                    </p>
                                )}
                                {s.bloques.map((b, bi) => {
                                    const { label, Icon } = BLOCK_TYPES[b.tipo] ?? BLOCK_TYPES.texto;
                                    return (
                                        <div key={b.id} className="rounded-xl border border-line bg-page/60 p-3">
                                            <div className="mb-2 flex items-center gap-1">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                                                    <Icon size={14} aria-hidden="true" /> {label}
                                                </span>
                                                <span className="ml-auto" />
                                                <SmallIconButton label="Subir bloque" disabled={bi === 0} onClick={() => updateSection(si, { bloques: moveItem(s.bloques, bi, -1) })}>
                                                    <ArrowUp size={14} aria-hidden="true" />
                                                </SmallIconButton>
                                                <SmallIconButton label="Bajar bloque" disabled={bi === s.bloques.length - 1} onClick={() => updateSection(si, { bloques: moveItem(s.bloques, bi, 1) })}>
                                                    <ArrowDown size={14} aria-hidden="true" />
                                                </SmallIconButton>
                                                <SmallIconButton
                                                    label="Eliminar bloque"
                                                    danger
                                                    onClick={() =>
                                                        (!blockHasContent(b) || window.confirm('¿Eliminar este bloque?')) &&
                                                        updateSection(si, { bloques: s.bloques.filter((_, j) => j !== bi) })
                                                    }
                                                >
                                                    <Trash2 size={14} aria-hidden="true" />
                                                </SmallIconButton>
                                            </div>

                                            {b.tipo === 'texto' && (
                                                <MarkdownEditor value={b.texto ?? ''} onChange={(texto) => updateBlock(si, bi, { texto })} placeholder="Escribe aquí. Usa la barra para negrita, subtítulos, listas…" />
                                            )}
                                            {b.tipo === 'imagen' && (
                                                <div className="space-y-2">
                                                    <ImageField value={b.imagenId} onChange={(imagenId) => updateBlock(si, bi, { imagenId })} removable={false} />
                                                    <input
                                                        value={b.leyenda ?? ''}
                                                        onChange={(e) => updateBlock(si, bi, { leyenda: e.target.value })}
                                                        placeholder="Leyenda (opcional)"
                                                        className={`${input} h-9 text-sm`}
                                                    />
                                                </div>
                                            )}
                                            {b.tipo === 'versiculos' && (
                                                <VersesField refs={b.referencias ?? []} onChange={(referencias) => updateBlock(si, bi, { referencias })} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {Object.entries(BLOCK_TYPES).map(([tipo, { label, Icon, create }]) => (
                                    <button
                                        key={tipo}
                                        type="button"
                                        onClick={() => updateSection(si, { bloques: [...s.bloques, { id: tmpId(), ...create() }] })}
                                        className={`${btn.small} border border-line bg-surface text-ink hover:bg-surface-2`}
                                    >
                                        <Plus size={14} aria-hidden="true" /> <Icon size={14} aria-hidden="true" /> {label}
                                    </button>
                                ))}
                            </div>
                        </section>
                    ))}

                    <button
                        type="button"
                        onClick={() => update({ secciones: [...draft.secciones, { id: tmpId(), titulo: '', bloques: [] }] })}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line py-5 text-sm font-semibold text-muted transition hover:border-brand/50 hover:text-brand"
                    >
                        <Plus size={18} aria-hidden="true" /> Agregar sección
                    </button>

                    <div className="flex justify-end border-t border-line pt-6">
                        <button type="button" onClick={remove} className={btn.danger}>
                            <Trash2 size={16} aria-hidden="true" /> Eliminar estudio
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EstudioEditor;
