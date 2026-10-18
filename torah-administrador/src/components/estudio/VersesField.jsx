import React, { useId, useMemo, useState } from 'react';
import { BookOpenText, CornerDownLeft, X } from 'lucide-react';
import { displayName, parseReference, useBooks } from '../../lib/books';
import { formatReference, parseReferenceList, parseSingleReference, suggestBooks, WHOLE_CHAPTER } from '../../lib/reference';
import { btn, input } from '../../lib/ui';
import VersesQuote from './VersesQuote';
import VersePicker from './VersePicker';

const sameRef = (a, b) => a.libroId === b.libroId && a.capitulo === b.capitulo && a.desde === b.desde && a.hasta === b.hasta;

/*
  Citas de un bloque de versículos.
  - Escribiendo: "gen" sugiere Génesis; "Gén 1:1-3" se agrega con Enter (también varias separadas por ";").
  - Con el selector "Elegir en la Biblia": libro → capítulo → rango de versículos.
*/
const VersesField = ({ refs, onChange }) => {
    const { books, byId } = useBooks();
    const [text, setText] = useState('');
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const [error, setError] = useState('');
    const [picker, setPicker] = useState(null); // { bookId, chapter } o {} para empezar en libros
    const listId = useId();

    const add = (nuevas) => {
        const unicas = nuevas.filter((r) => !refs.some((x) => sameRef(x, r)));
        if (unicas.length) onChange([...refs, ...unicas]);
    };

    const options = useMemo(() => {
        const q = text.trim();
        if (!q) return [];
        const list = [];
        if (q.includes(';')) {
            const { refs: varias } = parseReferenceList(q, books);
            if (varias.length) list.push({ key: 'varias', label: `Agregar ${varias.length} citas`, detail: varias.map((r) => formatReference(r, byId)).join('; '), run: () => commit() });
            return list;
        }
        const ref = parseSingleReference(q, books);
        if (ref) {
            const whole = ref.desde === 1 && ref.hasta >= WHOLE_CHAPTER;
            list.push({ key: 'agregar', label: `Agregar ${formatReference(ref, byId)}`, detail: whole ? 'capítulo completo' : null, run: () => { add([ref]); reset(); } });
            if (whole) {
                list.push({ key: 'versos', label: `Elegir versículos de ${formatReference(ref, byId)}…`, run: () => openPicker(ref.libroId, ref.capitulo) });
            }
            return list;
        }
        const partial = parseReference(q, books);
        const bookPart = q.replace(/\s+\d+([:.,]\d*)?(-\d*)?$/, '');
        const sugeridos = suggestBooks(bookPart || q, books);
        if (partial?.book && partial.chapter && !sugeridos.some((b) => b.id === partial.book.id)) sugeridos.unshift(partial.book);
        for (const b of sugeridos) {
            list.push({ key: b.id, label: displayName(b.nombre), detail: 'elegir capítulo y versículos', run: () => openPicker(b.id, null) });
        }
        return list;
    }, [text, books, byId, refs]); // eslint-disable-line react-hooks/exhaustive-deps

    const reset = () => {
        setText('');
        setError('');
        setOpen(false);
        setActive(0);
    };

    const openPicker = (bookId, chapter) => {
        setOpen(false);
        setPicker({ bookId, chapter });
    };

    // Enter sin sugerencia elegida: interpretar el texto tal cual (una o varias citas).
    const commit = () => {
        const { refs: nuevas, errors } = parseReferenceList(text, books);
        if (nuevas.length) add(nuevas);
        if (errors.length) {
            setText(errors.join('; '));
            setError(`No se reconoce: ${errors.map((e) => `“${e}”`).join(', ')}. Elige un libro de la lista o usa “Elegir en la Biblia”.`);
        } else {
            reset();
        }
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown' && options.length) {
            e.preventDefault();
            setOpen(true);
            setActive((a) => (a + 1) % options.length);
        } else if (e.key === 'ArrowUp' && options.length) {
            e.preventDefault();
            setActive((a) => (a - 1 + options.length) % options.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (open && options[active]) options[active].run();
            else commit();
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    const showList = open && options.length > 0;

    return (
        <div className="space-y-3">
            {refs.length > 0 && (
                <ul className="flex flex-wrap gap-2" aria-label="Citas agregadas">
                    {refs.map((r, i) => (
                        <li key={`${r.libroId}-${r.capitulo}-${r.desde}-${r.hasta}`} className="inline-flex items-center gap-1 rounded-full border border-gold/50 bg-gold-soft/60 py-1 pl-3 pr-1 text-sm font-semibold">
                            {formatReference(r, byId)}
                            <button
                                type="button"
                                onClick={() => onChange(refs.filter((_, j) => j !== i))}
                                aria-label={`Quitar ${formatReference(r, byId)}`}
                                className="grid h-6 w-6 place-items-center rounded-full text-muted hover:bg-surface hover:text-danger"
                            >
                                <X size={14} aria-hidden="true" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                    <input
                        role="combobox"
                        aria-expanded={showList}
                        aria-controls={listId}
                        aria-activedescendant={showList ? `${listId}-${active}` : undefined}
                        aria-autocomplete="list"
                        aria-label="Agregar cita"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                            setError('');
                            setOpen(true);
                            setActive(0);
                        }}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 150)}
                        onKeyDown={onKeyDown}
                        placeholder="Escribe un libro o una cita: gen, Gén 1:1-3, Jn 3:16…"
                        aria-invalid={!!error}
                        className={`${input} h-10 pr-9`}
                    />
                    <CornerDownLeft size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
                    {showList && (
                        <ul id={listId} role="listbox" className="absolute inset-x-0 top-11 z-30 max-h-72 overflow-y-auto rounded-xl border border-line bg-surface py-1 shadow-xl">
                            {options.map((o, i) => (
                                <li
                                    key={o.key}
                                    id={`${listId}-${i}`}
                                    role="option"
                                    aria-selected={i === active}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        o.run();
                                    }}
                                    onMouseEnter={() => setActive(i)}
                                    className={`flex cursor-pointer items-baseline gap-2 px-3.5 py-2 text-sm ${i === active ? 'bg-brand-soft' : ''}`}
                                >
                                    <span className="font-serif font-semibold text-ink">{o.label}</span>
                                    {o.detail && <span className="truncate text-xs text-muted">{o.detail}</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button type="button" onClick={() => openPicker(null, null)} className={btn.secondary}>
                    <BookOpenText size={16} aria-hidden="true" /> Elegir en la Biblia
                </button>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}

            {refs.length > 0 && <VersesQuote refs={refs} />}

            <VersePicker
                open={!!picker}
                initialBookId={picker?.bookId ?? null}
                initialChapter={picker?.chapter ?? null}
                onClose={() => setPicker(null)}
                onAdd={(ref) => {
                    add([ref]);
                    reset();
                }}
            />
        </div>
    );
};

export default VersesField;
