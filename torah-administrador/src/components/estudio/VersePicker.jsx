import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Search, X } from 'lucide-react';
import { displayName, normalize, useBooks } from '../../lib/books';
import { WHOLE_CHAPTER } from '../../lib/reference';
import { useBookChapters } from '../../lib/verseText';
import { btn, input } from '../../lib/ui';

/*
  Selector de citas tipo "calendario": libro → capítulo → versículos.
  En los versículos se toca el primero y luego el último del rango (como un rango de fechas).
*/
const VersePicker = ({ open, onClose, onAdd, initialBookId = null, initialChapter = null }) => {
    const { books, testaments } = useBooks();
    const [bookId, setBookId] = useState(initialBookId);
    const [chapter, setChapter] = useState(initialChapter);
    const [range, setRange] = useState(null); // { desde, hasta }
    const [hover, setHover] = useState(null);
    const [filter, setFilter] = useState('');
    const panelRef = useRef(null);
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) return undefined;
        setBookId(initialBookId);
        setChapter(initialChapter);
        setRange(null);
        setFilter('');
        const previous = document.activeElement;
        const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
        document.addEventListener('keydown', onKey);
        requestAnimationFrame(() => panelRef.current?.querySelector('[data-autofocus]')?.focus() ?? panelRef.current?.focus());
        return () => {
            document.removeEventListener('keydown', onKey);
            previous?.focus?.();
        };
    }, [open, initialBookId, initialChapter]);

    const { chapters, error } = useBookChapters(bookId);
    const book = books.find((b) => b.id === bookId);
    const current = chapters?.find((c) => c.n === chapter);
    const step = !bookId ? 'libro' : !chapter ? 'capitulo' : 'versiculo';

    const filtered = useMemo(() => {
        const q = normalize(filter);
        return q ? books.filter((b) => normalize(`${b.nombre} ${b.abreviacion}`).includes(q)) : null;
    }, [books, filter]);

    if (!open) return null;

    const pickVerse = (n) => {
        if (!range || range.desde !== range.hasta) setRange({ desde: n, hasta: n });
        else setRange({ desde: Math.min(range.desde, n), hasta: Math.max(range.desde, n) });
    };

    const add = (ref) => {
        onAdd(ref);
        onClose();
    };

    const label = book && chapter
        ? `${displayName(book.nombre)} ${chapter}${range ? `:${range.desde}${range.hasta > range.desde ? `–${range.hasta}` : ''}` : ''}`
        : '';
    const previewVerses = current
        ? current.verses.filter((v) => (range ? v.n >= range.desde && v.n <= range.hasta : v.n === hover))
        : [];

    const bookButton = (b) => (
        <button
            key={b.id}
            type="button"
            onClick={() => { setBookId(b.id); setChapter(null); setRange(null); }}
            className="rounded-xl border border-line bg-surface px-3 py-2 text-left font-serif text-sm font-semibold hover:border-brand/50 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand"
        >
            {displayName(b.nombre)}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[65] grid place-items-center bg-black/40 p-3 sm:p-6">
            <button type="button" aria-label="Cerrar" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default" />
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label="Elegir una cita de la Biblia"
                tabIndex={-1}
                className="relative flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-page shadow-2xl outline-none"
            >
                {/* Ruta: Libros › Génesis › Capítulo 3 */}
                <div className="flex items-center gap-1 border-b border-line px-4 py-3 text-sm">
                    <button type="button" onClick={() => { setBookId(null); setChapter(null); setRange(null); }} className={`rounded-lg px-2 py-1 ${step === 'libro' ? 'font-semibold text-ink' : 'text-brand hover:bg-brand-soft'}`}>
                        Libros
                    </button>
                    {book && (
                        <>
                            <ChevronRight size={14} className="text-muted" aria-hidden="true" />
                            <button type="button" onClick={() => { setChapter(null); setRange(null); }} className={`rounded-lg px-2 py-1 font-serif ${step === 'capitulo' ? 'font-semibold text-ink' : 'text-brand hover:bg-brand-soft'}`}>
                                {displayName(book.nombre)}
                            </button>
                        </>
                    )}
                    {chapter && (
                        <>
                            <ChevronRight size={14} className="text-muted" aria-hidden="true" />
                            <span className="px-2 py-1 font-semibold">Capítulo {chapter}</span>
                        </>
                    )}
                    <button type="button" onClick={onClose} aria-label="Cerrar" className={`${btn.icon} ml-auto`}>
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    {step === 'libro' && (
                        <>
                            <label className="relative mb-4 block">
                                <span className="sr-only">Buscar libro</span>
                                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
                                <input
                                    data-autofocus
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && filtered?.length === 1 && setBookId(filtered[0].id)}
                                    placeholder="Buscar libro…"
                                    className={`${input} h-10 pl-9`}
                                />
                            </label>
                            {filtered ? (
                                filtered.length ? (
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{filtered.map(bookButton)}</div>
                                ) : (
                                    <p className="py-6 text-center text-sm text-muted">Ningún libro coincide.</p>
                                )
                            ) : (
                                testaments.map((t) => (
                                    <section key={t} className="mb-5">
                                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold">{t}</h3>
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{books.filter((b) => b.testamento === t).map(bookButton)}</div>
                                    </section>
                                ))
                            )}
                        </>
                    )}

                    {step === 'capitulo' && (
                        <>
                            <p className="mb-3 text-sm text-muted">Elige el capítulo</p>
                            {error && <p className="text-sm text-danger">No se pudo cargar el libro: {error}</p>}
                            {!chapters && !error && <div className="h-40 animate-pulse rounded-2xl bg-surface-2" aria-busy="true" />}
                            {chapters && (
                                <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
                                    {chapters.map((c, i) => (
                                        <button
                                            key={c.n}
                                            type="button"
                                            data-autofocus={i === 0 ? true : undefined}
                                            onClick={() => { setChapter(c.n); setRange(null); }}
                                            className="grid aspect-square place-items-center rounded-xl border border-line bg-surface font-serif font-semibold tabular-nums hover:border-brand/50 hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-brand"
                                        >
                                            {c.n}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {step === 'versiculo' && current && (
                        <>
                            <p className="mb-3 text-sm text-muted">
                                Toca el <strong className="text-ink">primer versículo</strong> y luego el <strong className="text-ink">último</strong> del pasaje. Para uno solo, tócalo una vez.
                            </p>
                            <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12" onMouseLeave={() => setHover(null)}>
                                {current.verses.map((v, i) => {
                                    const inRange = range && v.n >= range.desde && v.n <= range.hasta;
                                    const edge = range && (v.n === range.desde || v.n === range.hasta);
                                    return (
                                        <button
                                            key={v.n}
                                            type="button"
                                            data-autofocus={i === 0 ? true : undefined}
                                            onClick={() => pickVerse(v.n)}
                                            onMouseEnter={() => setHover(v.n)}
                                            onFocus={() => setHover(v.n)}
                                            aria-pressed={!!inRange}
                                            className={`grid aspect-square place-items-center rounded-lg text-sm font-semibold tabular-nums transition focus-visible:outline-2 focus-visible:outline-brand ${
                                                edge ? 'bg-gold text-white' : inRange ? 'bg-gold-soft text-ink' : 'border border-line bg-surface hover:border-brand/50 hover:bg-brand-soft'
                                            }`}
                                        >
                                            {v.n}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-4 min-h-24 rounded-2xl border-l-4 border-gold bg-gold-soft/40 px-4 py-3">
                                {previewVerses.length ? (
                                    <p className="max-h-48 overflow-y-auto font-serif leading-relaxed">
                                        {previewVerses.map((v) => (
                                            <span key={v.n}>
                                                <sup className="mr-1 font-sans text-[0.65em] font-semibold text-gold">{v.n}</sup>
                                                {v.text}{' '}
                                            </span>
                                        ))}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted">Pasa el cursor sobre un versículo para leerlo.</p>
                                )}
                            </div>
                        </>
                    )}
                    {step === 'versiculo' && !current && <div className="h-40 animate-pulse rounded-2xl bg-surface-2" aria-busy="true" />}
                </div>

                {step === 'versiculo' && (
                    <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
                        <span className="font-serif text-lg font-semibold">{label}</span>
                        <button
                            type="button"
                            onClick={() => add({ libroId: bookId, capitulo: chapter, desde: 1, hasta: WHOLE_CHAPTER })}
                            className={`${btn.ghost} ml-auto`}
                        >
                            Todo el capítulo
                        </button>
                        <button
                            type="button"
                            disabled={!range}
                            onClick={() => add({ libroId: bookId, capitulo: chapter, desde: range.desde, hasta: range.hasta })}
                            className={btn.primary}
                        >
                            Agregar {range ? label : ''}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VersePicker;
