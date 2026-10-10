import React, { useEffect, useState } from 'react';
import { useBooks } from '../../lib/books';
import { formatReference, parseReferenceList } from '../../lib/reference';
import { input } from '../../lib/ui';
import VersesQuote from './VersesQuote';

const toText = (refs, byId) => refs.map((r) => formatReference(r, byId)).join('; ');

// Campo de referencias ("Gén 1:1-3; Jn 3:16") con vista previa del texto de la Biblia.
const VersesField = ({ refs, onChange }) => {
    const { books, byId, loaded } = useBooks();
    const [text, setText] = useState('');
    const [errors, setErrors] = useState([]);

    useEffect(() => {
        if (loaded) setText(toText(refs, byId));
        // Solo al cargar los libros: después el texto lo controla quien escribe.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaded]);

    const commit = () => {
        const parsed = parseReferenceList(text, books);
        setErrors(parsed.errors);
        onChange(parsed.refs);
        if (!parsed.errors.length) setText(toText(parsed.refs, byId));
    };

    return (
        <div className="space-y-3">
            <label className="block">
                <span className="mb-1.5 block text-xs text-muted">Referencias (separadas por “;”). Ej.: Gén 1:1-3; Sal 23; Jn 3:16</span>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            commit();
                        }
                    }}
                    placeholder="Gén 1:1-3; Jn 3:16"
                    aria-invalid={errors.length > 0}
                    className={`${input} h-10`}
                />
            </label>
            {errors.length > 0 && (
                <p className="text-sm text-danger">No se reconoce: {errors.map((e) => `“${e}”`).join(', ')}</p>
            )}
            {refs.length > 0 && <VersesQuote refs={refs} />}
        </div>
    );
};

export default VersesField;
