import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowDown, ArrowUp, GraduationCap, Plus, RefreshCw } from 'lucide-react';
import { api, imagenUrl } from '../lib/api';
import { useAuth } from '../lib/auth';
import { useToast } from '../lib/toast';
import { btn, card, input } from '../lib/ui';

export const StatusBadge = ({ publicado }) => (
    <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${
            publicado ? 'bg-brand-soft text-brand' : 'bg-gold-soft text-gold'
        }`}
    >
        {publicado ? 'Publicado' : 'Borrador'}
    </span>
);

const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });

const Estudios = () => {
    const { token } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [estudios, setEstudios] = useState(null);
    const [error, setError] = useState(null);
    const [creating, setCreating] = useState(false);
    const [titulo, setTitulo] = useState('');
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        setError(null);
        try {
            setEstudios(await api.listEstudios(token));
        } catch (e) {
            setError(e.message);
        }
    }, [token]);

    useEffect(() => {
        load();
    }, [load]);

    const create = async (e) => {
        e.preventDefault();
        if (!titulo.trim()) return;
        setBusy(true);
        try {
            const nuevo = await api.crearEstudio(token, titulo.trim());
            navigate(`/estudios/${nuevo.id}`);
        } catch (err) {
            toast.error(`No se pudo crear el estudio: ${err.message}`);
            setBusy(false);
        }
    };

    const move = async (index, step) => {
        const next = [...estudios];
        [next[index], next[index + step]] = [next[index + step], next[index]];
        setEstudios(next);
        try {
            await api.ordenarEstudios(token, next.map((e) => e.id));
        } catch (err) {
            toast.error(`No se pudo guardar el orden: ${err.message}`);
            load();
        }
    };

    return (
        <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="font-serif text-3xl font-semibold">Estudios</h1>
                    <p className="mt-1 text-sm text-muted">Estudios bíblicos por tema. Solo los publicados aparecen en la app.</p>
                </div>
                {!creating && (
                    <button type="button" onClick={() => setCreating(true)} className={btn.primary}>
                        <Plus size={16} aria-hidden="true" /> Nuevo estudio
                    </button>
                )}
            </div>

            {creating && (
                <form onSubmit={create} className={`${card} mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center`}>
                    <label className="flex-1">
                        <span className="sr-only">Título del estudio</span>
                        <input
                            autoFocus
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            onKeyDown={(e) => e.key === 'Escape' && setCreating(false)}
                            placeholder="Título o tema del estudio (ej. El Shabat)"
                            maxLength={200}
                            className={`${input} h-11 font-serif text-lg`}
                        />
                    </label>
                    <div className="flex gap-2">
                        <button type="submit" disabled={busy || !titulo.trim()} className={btn.primary}>
                            {busy ? 'Creando…' : 'Crear y editar'}
                        </button>
                        <button type="button" onClick={() => setCreating(false)} className={btn.ghost}>
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {error && (
                <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-danger/10 p-4 text-sm text-danger">
                    No se pudieron cargar los estudios: {error}
                    <button type="button" onClick={load} className={btn.secondary}>
                        <RefreshCw size={16} aria-hidden="true" /> Reintentar
                    </button>
                </div>
            )}

            {!estudios && !error && <div className={`${card} mt-6 h-40 animate-pulse`} aria-busy="true" />}

            {estudios?.length === 0 && !creating && (
                <div className="mt-10 flex flex-col items-center rounded-3xl border-2 border-dashed border-line px-6 py-14 text-center">
                    <GraduationCap size={36} className="text-gold" aria-hidden="true" />
                    <h2 className="mt-3 font-serif text-xl font-semibold">Todavía no hay estudios</h2>
                    <p className="mt-1 max-w-sm text-sm text-muted">
                        Un estudio tiene un tema y secciones con texto, imágenes y versículos de la Biblia.
                    </p>
                    <button type="button" onClick={() => setCreating(true)} className={`${btn.primary} mt-5`}>
                        <Plus size={16} aria-hidden="true" /> Crear el primero
                    </button>
                </div>
            )}

            {estudios?.length > 0 && (
                <ul className="mt-6 space-y-3">
                    {estudios.map((e, i) => (
                        <li key={e.id} className={`${card} group relative flex items-stretch gap-4 p-3 transition hover:border-brand/40`}>
                            <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:w-36">
                                {e.portadaImagenId ? (
                                    <img src={imagenUrl(e.portadaImagenId)} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="grid h-full place-items-center text-gold/60">
                                        <GraduationCap size={28} aria-hidden="true" />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1 py-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Link to={`/estudios/${e.id}`} className="font-serif text-lg font-semibold leading-tight after:absolute after:inset-0">
                                        {e.titulo}
                                    </Link>
                                    <StatusBadge publicado={e.publicado} />
                                </div>
                                {e.resumen && <p className="mt-1 line-clamp-2 text-sm text-muted">{e.resumen}</p>}
                                <p className="mt-1 text-xs text-muted">
                                    {e.secciones} {e.secciones === 1 ? 'sección' : 'secciones'} · actualizado {formatDate(e.actualizadoEn)}
                                </p>
                            </div>
                            <div className="relative z-10 flex flex-col justify-center gap-1">
                                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir ${e.titulo}`} className={btn.icon}>
                                    <ArrowUp size={16} aria-hidden="true" />
                                </button>
                                <button type="button" onClick={() => move(i, 1)} disabled={i === estudios.length - 1} aria-label={`Bajar ${e.titulo}`} className={btn.icon}>
                                    <ArrowDown size={16} aria-hidden="true" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Estudios;
