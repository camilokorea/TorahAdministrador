import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Info, ListPlus, Plus, RefreshCw, TriangleAlert } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { displayName, useBooks } from '../lib/books';
import { useToast } from '../lib/toast';
import { analyzeChapter, composeVerse, formatRanges } from '../lib/verses';
import { confirmDiscard, useUnsavedChanges } from '../lib/useUnsavedChanges';
import { btn, card } from '../lib/ui';
import InlineField from '../components/InlineField';
import VerseRow from '../components/VerseRow';
import NewVerseRow from '../components/NewVerseRow';

const Book = () => {
    const { id } = useParams();
    const [params, setParams] = useSearchParams();
    const { token } = useAuth();
    const { updateBook } = useBooks();
    const toast = useToast();

    const [libro, setLibro] = useState(null);
    const [loadError, setLoadError] = useState(null);
    const [editing, setEditing] = useState(null); // { index, draft, original }
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [justSaved, setJustSaved] = useState(null);
    const [nameDirty, setNameDirty] = useState(false);
    const [abbrDirty, setAbbrDirty] = useState(false);
    const [inserting, setInserting] = useState(null); // { position, number, draft }
    const [busy, setBusy] = useState(false); // insertar / eliminar / unir en curso
    const [insertError, setInsertError] = useState('');

    const load = useCallback(async () => {
        setLoadError(null);
        setLibro(null);
        try {
            setLibro(await api.getLibro(id));
        } catch (e) {
            setLoadError(e.message);
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    // Recarga el libro sin vaciar la pantalla (después de insertar o eliminar cambian las posiciones).
    const refresh = useCallback(async () => {
        try {
            setLibro(await api.getLibro(id));
        } catch (e) {
            toast.error(`No se pudo recargar el libro: ${e.message}`);
        }
    }, [id, toast]);

    const chapters = libro?.capitulos ?? [];
    const requested = Number(params.get('cap'));
    const chapter = chapters.find((c) => c.capituloNumero === requested) ?? chapters[0];
    const chapterPos = chapter ? chapters.indexOf(chapter) : -1;
    const targetVerse = Number(params.get('v')) || null;

    const analysis = useMemo(() => analyzeChapter(chapter?.versiculos), [chapter]);

    const verseDirty = (!!editing && editing.draft.trim() !== editing.original.trim()) || !!inserting?.draft.trim();
    useUnsavedChanges(verseDirty || nameDirty || abbrDirty);

    // Al cambiar de capítulo (por los botones o por "Ir a…") se cierra el editor.
    // Si había cambios, useUnsavedChanges ya pidió confirmación antes de navegar.
    const chapterNumber = chapter?.capituloNumero;
    useEffect(() => {
        setEditing(null);
        setSaveError('');
        setJustSaved(null);
        setInserting(null);
    }, [id, chapterNumber]);

    const goToChapter = (number) => setParams({ cap: String(number) });

    const startEditing = (entry) => {
        if (editing?.index === entry.index) return;
        if (verseDirty && !confirmDiscard()) return;
        setSaveError('');
        setInserting(null);
        setEditing({ index: entry.index, draft: entry.body, original: entry.body });
    };

    const cancelEditing = () => {
        setEditing(null);
        setSaveError('');
    };

    const saveVerse = async (entry) => {
        const text = composeVerse(entry, editing.draft);
        setSaving(true);
        setSaveError('');
        try {
            await api.updateVersiculo(token, libro.id, chapter.capituloNumero, entry.index, text);
            setLibro((prev) => ({
                ...prev,
                capitulos: prev.capitulos.map((c) =>
                    c.capituloNumero === chapter.capituloNumero
                        ? { ...c, versiculos: c.versiculos.map((v, i) => (i === entry.index ? text : v)) }
                        : c
                ),
            }));
            setEditing(null);
            setJustSaved(entry.index);
            setTimeout(() => setJustSaved((cur) => (cur === entry.index ? null : cur)), 2500);
            const ref = entry.number ? `${libro.abreviacion} ${chapter.capituloNumero}:${entry.number}` : `${libro.abreviacion} ${chapter.capituloNumero}`;
            toast.success(`${ref} guardado.`);
        } catch (e) {
            setSaveError(e.status === 401 ? 'La sesión expiró. Vuelve a entrar y pulsa Guardar otra vez.' : `No se pudo guardar: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    const refOf = (number) => `${libro.abreviacion} ${chapter.capituloNumero}${number ? `:${number}` : ''}`;

    // Número sugerido para un versículo nuevo después de la entrada indicada.
    const numberAfter = (index) => {
        const previous = analysis.entries.slice(0, index + 1).reverse().find((e) => !e.isFragment);
        return (previous?.number ?? 0) + 1;
    };

    // Posición donde va un versículo faltante: antes del primer versículo con número mayor.
    const positionFor = (number) => {
        const next = analysis.entries.find((e) => !e.isFragment && e.number > number);
        return next ? next.index : analysis.entries.length;
    };

    const startInsert = (position, number) => {
        if (verseDirty && !confirmDiscard()) return;
        setEditing(null);
        setInsertError('');
        setInserting({ position, number: String(number), draft: '' });
    };

    const saveInsert = async () => {
        const number = Number(inserting.number);
        const text = `${number} ${inserting.draft.trim()}`;
        setBusy(true);
        setInsertError('');
        try {
            await api.insertVersiculo(token, libro.id, chapter.capituloNumero, inserting.position, text);
            const position = inserting.position;
            setInserting(null);
            await refresh();
            setJustSaved(position);
            setTimeout(() => setJustSaved((cur) => (cur === position ? null : cur)), 2500);
            toast.success(`${refOf(number)} insertado.`);
        } catch (e) {
            setInsertError(e.status === 401 ? 'La sesión expiró. Vuelve a entrar y pulsa Insertar otra vez.' : `No se pudo insertar: ${e.message}`);
        } finally {
            setBusy(false);
        }
    };

    const deleteEntry = async (entry) => {
        const what = entry.isFragment ? `este fragmento de ${refOf()}` : `el versículo ${refOf(entry.number)}`;
        const preview = entry.body.length > 140 ? `${entry.body.slice(0, 140)}…` : entry.body;
        if (!window.confirm(`¿Eliminar ${what}?\n\n“${preview}”\n\nEsta acción no se puede deshacer.`)) return;
        setBusy(true);
        try {
            await api.deleteVersiculo(token, libro.id, chapter.capituloNumero, entry.index, entry.raw);
            toast.success(entry.isFragment ? 'Fragmento eliminado.' : `${refOf(entry.number)} eliminado.`);
        } catch (e) {
            toast.error(e.status === 401 ? 'La sesión expiró. Vuelve a entrar e inténtalo otra vez.' : `No se pudo eliminar: ${e.message}`);
        } finally {
            await refresh();
            setBusy(false);
        }
    };

    // Un fragmento sin número se agrega al final del versículo anterior y luego se elimina.
    const mergeEntry = async (entry) => {
        const previous = analysis.entries[entry.index - 1];
        if (!previous) return;
        const label = previous.number ? `${chapter.capituloNumero}:${previous.number}` : 'la entrada anterior';
        if (!window.confirm(`¿Unir este fragmento al final de ${label}?\n\nEl texto quedará en ese versículo y el fragmento se eliminará.`)) return;
        setBusy(true);
        try {
            const merged = `${previous.raw.trim()} ${entry.body}`;
            await api.updateVersiculo(token, libro.id, chapter.capituloNumero, previous.index, merged);
            await api.deleteVersiculo(token, libro.id, chapter.capituloNumero, entry.index, entry.raw);
            toast.success(`Fragmento unido a ${refOf(previous.number)}.`);
        } catch (e) {
            toast.error(`No se pudo completar la unión: ${e.message}. Revisa el capítulo.`);
        } finally {
            await refresh();
            setBusy(false);
        }
    };

    const saveHeader = (field) => async (value) => {
        if (field === 'nombre') await api.updateNombre(token, libro.id, value);
        else await api.updateAbreviatura(token, libro.id, value);
        const patch = field === 'nombre' ? { nombre: value } : { abreviacion: value };
        setLibro((prev) => ({ ...prev, ...patch }));
        updateBook(libro.id, patch);
        toast.success(field === 'nombre' ? 'Nombre del libro guardado.' : 'Abreviatura guardada.');
    };

    const newRow = inserting && chapter && (
        <NewVerseRow
            key="nuevo"
            chapterNumber={chapter.capituloNumero}
            number={inserting.number}
            draft={inserting.draft}
            onNumber={(number) => setInserting((cur) => ({ ...cur, number }))}
            onDraft={(draft) => setInserting((cur) => ({ ...cur, draft }))}
            onSave={saveInsert}
            onCancel={() => setInserting(null)}
            saving={busy}
            error={insertError}
        />
    );

    if (loadError) {
        return (
            <div className="rounded-2xl bg-danger/10 p-6 text-danger">
                <p className="font-semibold">No se pudo abrir el libro.</p>
                <p className="mt-1 text-sm">{loadError}</p>
                <div className="mt-4 flex gap-2">
                    <button type="button" onClick={load} className={btn.secondary}>
                        <RefreshCw size={16} aria-hidden="true" /> Reintentar
                    </button>
                    <Link to="/" className={btn.ghost}>Volver a los libros</Link>
                </div>
            </div>
        );
    }

    if (!libro) {
        return (
            <div aria-busy="true" className="space-y-4">
                <div className="h-8 w-56 animate-pulse rounded-lg bg-surface-2" />
                <div className="h-4 w-32 animate-pulse rounded bg-surface-2" />
                <div className={`${card} h-96 animate-pulse`} />
            </div>
        );
    }

    return (
        <div>
            <nav aria-label="Ruta" className="text-sm text-muted">
                <Link to="/" className="hover:text-brand">Libros</Link>
                <span className="mx-2" aria-hidden="true">/</span>
                <span className="text-ink">{displayName(libro.nombre)}</span>
            </nav>

            <header className="mt-3 space-y-2">
                <InlineField
                    label="nombre del libro"
                    value={libro.nombre}
                    onSave={saveHeader('nombre')}
                    onDirtyChange={setNameDirty}
                    inputClassName="font-serif text-lg"
                    display={<h1 className="font-serif text-3xl font-semibold">{displayName(libro.nombre)}</h1>}
                />
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    <InlineField
                        label="abreviatura"
                        value={libro.abreviacion}
                        onSave={saveHeader('abreviatura')}
                        onDirtyChange={setAbbrDirty}
                        inputClassName="font-mono"
                        display={
                            <span className="text-muted">
                                Abreviatura <span className="ml-1 rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs text-ink">{libro.abreviacion}</span>
                            </span>
                        }
                    />
                    <span className="text-muted">{libro.testamento}</span>
                    <span className="text-muted">{chapters.length} {chapters.length === 1 ? 'capítulo' : 'capítulos'}</span>
                </div>
                {libro.nombre !== displayName(libro.nombre) && (
                    <p className="text-xs text-muted">
                        Guardado como “{libro.nombre}”. La app lo muestra como “{displayName(libro.nombre)}”.
                    </p>
                )}
            </header>

            {chapter && (
                <>
                    <div className="sticky top-14 z-20 -mx-4 mt-6 border-y border-line bg-page/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => goToChapter(chapters[chapterPos - 1].capituloNumero)}
                                disabled={chapterPos <= 0}
                                aria-label="Capítulo anterior"
                                className={btn.icon}
                            >
                                <ChevronLeft size={18} aria-hidden="true" />
                            </button>
                            <label className="flex items-center gap-2 text-sm font-medium">
                                Capítulo
                                <select
                                    value={chapter.capituloNumero}
                                    onChange={(e) => goToChapter(Number(e.target.value))}
                                    className="h-9 rounded-xl border border-line bg-surface px-2 font-semibold tabular-nums focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                                >
                                    {chapters.map((c) => (
                                        <option key={c.capituloNumero} value={c.capituloNumero}>{c.capituloNumero}</option>
                                    ))}
                                </select>
                                <span className="text-muted">de {chapters.length}</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => goToChapter(chapters[chapterPos + 1].capituloNumero)}
                                disabled={chapterPos >= chapters.length - 1}
                                aria-label="Capítulo siguiente"
                                className={btn.icon}
                            >
                                <ChevronRight size={18} aria-hidden="true" />
                            </button>
                            <span className="ml-auto hidden text-xs text-muted sm:inline">
                                {analysis.entries.length - analysis.fragments} versículos
                            </span>
                        </div>
                    </div>

                    {(analysis.missing.length > 0 || analysis.fragments > 0) && (
                        <div className="mt-4 flex gap-3 rounded-2xl border border-gold/40 bg-gold-soft/50 p-4 text-sm">
                            <TriangleAlert size={18} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                            <div className="space-y-1">
                                {analysis.missing.length > 0 && (
                                    <>
                                    <p>
                                        <strong>Faltan versículos:</strong> {formatRanges(analysis.missing)}. No existen en los datos de este capítulo.
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {analysis.missing.slice(0, 12).map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                disabled={busy}
                                                onClick={() => startInsert(positionFor(n), n)}
                                                className={`${btn.small} border border-gold/50 bg-surface text-ink hover:bg-gold-soft`}
                                            >
                                                <Plus size={14} aria-hidden="true" /> Agregar {chapter.capituloNumero}:{n}
                                            </button>
                                        ))}
                                    </div>
                                    </>
                                )}
                                {analysis.fragments > 0 && (
                                    <p>
                                        <strong>{analysis.fragments} {analysis.fragments === 1 ? 'fragmento' : 'fragmentos'}</strong> sin número
                                        (marcados “frag.”): son la continuación del versículo anterior. La app pública los une automáticamente.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-4 flex justify-end">
                        <button type="button" onClick={() => startInsert(0, 1)} disabled={busy || !!inserting} className={btn.ghost}>
                            <ListPlus size={16} aria-hidden="true" /> Insertar al inicio
                        </button>
                    </div>

                    <ol className={`${card} mt-2 divide-y divide-line ${inserting ? '' : 'overflow-hidden'}`} aria-busy={busy}>
                        {analysis.entries.map((entry) => (
                            <React.Fragment key={`${chapter.capituloNumero}-${entry.index}`}>
                            {inserting?.position === entry.index && newRow}
                            <VerseRow
                                entry={entry}
                                editing={editing?.index === entry.index}
                                draft={editing?.index === entry.index ? editing.draft : ''}
                                onStart={() => startEditing(entry)}
                                onDraft={(draft) => setEditing((cur) => ({ ...cur, draft }))}
                                onCancel={cancelEditing}
                                onSave={() => saveVerse(entry)}
                                saving={saving && editing?.index === entry.index}
                                error={editing?.index === entry.index ? saveError : ''}
                                highlighted={targetVerse !== null && entry.number === targetVerse && !editing}
                                justSaved={justSaved === entry.index}
                                busy={busy}
                                onInsertAfter={() => startInsert(entry.index + 1, numberAfter(entry.index))}
                                onDelete={() => deleteEntry(entry)}
                                onMerge={entry.isFragment && entry.index > 0 ? () => mergeEntry(entry) : undefined}
                            />
                            </React.Fragment>
                        ))}
                        {inserting?.position === analysis.entries.length && newRow}
                    </ol>

                    <p className="mt-4 flex items-center gap-2 text-xs text-muted">
                        <Info size={14} aria-hidden="true" />
                        Cada cambio guardado crea una nueva versión; la app pública la descarga la próxima vez que se abra.
                    </p>
                </>
            )}
        </div>
    );
};

export default Book;
