import React from 'react';
import { useBooks } from '../../lib/books';
import { formatReference } from '../../lib/reference';
import { useReferencesText } from '../../lib/verseText';

// Muestra el texto de las referencias tal como aparecerá en el estudio.
const VersesQuote = ({ refs }) => {
    const { byId } = useBooks();
    const { data, error } = useReferencesText(refs);

    if (error) return <p className="text-sm text-danger">No se pudo cargar el texto: {error}</p>;
    if (!data) return <div className="h-16 animate-pulse rounded-xl bg-surface-2" aria-busy="true" />;

    return (
        <div className="space-y-3">
            {data.map(({ ref, verses, missing }, i) => (
                <figure key={i} className="rounded-xl border-l-4 border-gold bg-gold-soft/40 px-4 py-3">
                    <figcaption className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gold">{formatReference(ref, byId)}</figcaption>
                    {missing ? (
                        <p className="text-sm text-danger">Esos versículos no existen en la Biblia cargada.</p>
                    ) : (
                        <blockquote className="font-serif leading-relaxed text-ink">
                            {verses.map((v) => (
                                <span key={v.n}>
                                    <sup className="mr-1 font-sans text-[0.65em] font-semibold text-gold">{v.n}</sup>
                                    {v.text}{' '}
                                </span>
                            ))}
                        </blockquote>
                    )}
                </figure>
            ))}
        </div>
    );
};

export default VersesQuote;
