import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, RefreshCw, Search } from 'lucide-react';
import { displayName, normalize, useBooks } from '../lib/books';
import { btn, card, input } from '../lib/ui';

const Books = () => {
    const { books, loaded, error, reload, testaments } = useBooks();
    const [query, setQuery] = useState('');
    const [testament, setTestament] = useState('');

    const filtered = useMemo(() => {
        const q = normalize(query);
        return books.filter(
            (b) =>
                (!testament || b.testamento === testament) &&
                (!q || normalize(`${b.nombre} ${b.abreviacion}`).includes(q))
        );
    }, [books, query, testament]);

    return (
        <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="font-serif text-3xl font-semibold">Libros</h1>
                    <p className="mt-1 text-sm text-muted">Elige un libro para editar su nombre, abreviatura o versículos.</p>
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="relative block flex-1">
                    <span className="sr-only">Filtrar libros</span>
                    <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Filtrar por nombre o abreviatura"
                        className={`${input} h-10 pl-9`}
                    />
                </label>
                <div role="group" aria-label="Testamento" className="flex gap-1 rounded-full bg-surface-2 p-1">
                    {['', ...testaments].map((t) => (
                        <button
                            key={t || 'todos'}
                            type="button"
                            aria-pressed={testament === t}
                            onClick={() => setTestament(t)}
                            className={`h-8 rounded-full px-3.5 text-sm font-semibold transition ${
                                testament === t ? 'bg-surface text-brand shadow-sm' : 'text-muted hover:text-ink'
                            }`}
                        >
                            {t || 'Todos'}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-danger/10 p-4 text-sm text-danger">
                    No se pudo cargar la lista de libros: {error}
                    <button type="button" onClick={reload} className={btn.secondary}>
                        <RefreshCw size={16} aria-hidden="true" /> Reintentar
                    </button>
                </div>
            )}

            {!loaded && !error && (
                <div className={`${card} mt-6 divide-y divide-line`} aria-busy="true">
                    {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="flex h-14 items-center px-4">
                            <div className="h-3 w-40 animate-pulse rounded bg-surface-2" />
                        </div>
                    ))}
                </div>
            )}

            {loaded && (
                <div className={`${card} mt-6 overflow-hidden`}>
                    <table className="w-full text-left text-sm">
                        <thead className="bg-surface-2 text-xs uppercase tracking-wider text-muted">
                            <tr>
                                <th scope="col" className="w-12 px-4 py-3 font-semibold">#</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Nombre</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Abreviatura</th>
                                <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Testamento</th>
                                <th scope="col" className="w-10 px-2 py-3"><span className="sr-only">Abrir</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {filtered.map((b) => (
                                <tr key={b.id} className="group relative transition hover:bg-brand-soft">
                                    <td className="px-4 py-3 tabular-nums text-muted">{books.indexOf(b) + 1}</td>
                                    <td className="px-4 py-3">
                                        <Link to={`/libro/${b.id}`} className="font-serif text-[0.95rem] font-semibold text-ink after:absolute after:inset-0 focus-visible:outline-none">
                                            {displayName(b.nombre)}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-muted">{b.abreviacion}</td>
                                    <td className="hidden px-4 py-3 text-muted sm:table-cell">{b.testamento}</td>
                                    <td className="px-2 py-3 text-muted">
                                        <ChevronRight size={16} className="transition group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden="true" />
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-muted">
                                        Ningún libro coincide con el filtro.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Books;
