import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CornerDownLeft, Search } from 'lucide-react';
import { parseReference, useBooks } from '../lib/books';
import { input } from '../lib/ui';

// "Gén 1:3" -> abre Génesis, capítulo 1, con el versículo 3 resaltado.
const GoToReference = ({ onDone, autoFocus = false }) => {
    const { books } = useBooks();
    const navigate = useNavigate();
    const [value, setValue] = useState('');
    const [error, setError] = useState('');

    const submit = (e) => {
        e.preventDefault();
        const ref = parseReference(value, books);
        if (!ref) {
            setError('No se reconoce el libro. Prueba con “Gén 1:3” o “1 Cor 13”.');
            return;
        }
        const params = new URLSearchParams();
        if (ref.chapter) params.set('cap', ref.chapter);
        if (ref.verse) params.set('v', ref.verse);
        const query = params.toString();
        navigate(`/libro/${ref.book.id}${query ? `?${query}` : ''}`);
        setValue('');
        setError('');
        onDone?.();
    };

    return (
        <form onSubmit={submit} role="search">
            <label className="relative block">
                <span className="sr-only">Ir a una referencia</span>
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
                <input
                    type="text"
                    value={value}
                    autoFocus={autoFocus}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setError('');
                    }}
                    placeholder="Ir a… (ej. Gén 1:3)"
                    aria-invalid={!!error}
                    aria-describedby={error ? 'goto-error' : undefined}
                    className={`${input} h-10 pl-9 pr-9 text-sm`}
                />
                <CornerDownLeft size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
            </label>
            {error && (
                <p id="goto-error" className="mt-1.5 text-xs text-danger">
                    {error}
                </p>
            )}
        </form>
    );
};

export default GoToReference;
