import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';

export { displayName, normalize, parseReference } from './reference';

const BooksContext = createContext(null);
export const useBooks = () => useContext(BooksContext);

// Lista de libros compartida por toda la app (navegación, "Ir a referencia").
export const BooksProvider = ({ children }) => {
    const [books, setBooks] = useState(null);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setError(null);
        try {
            const list = await api.listLibros();
            setBooks(list);
        } catch (e) {
            setError(e.message);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const updateBook = useCallback((id, patch) => {
        setBooks((list) => list?.map((b) => (b.id === id ? { ...b, ...patch } : b)) ?? list);
    }, []);

    const value = useMemo(() => {
        const ordered = books ?? [];
        const testaments = [...new Set(ordered.map((b) => b.testamento))];
        return {
            books: ordered,
            loaded: !!books,
            error,
            reload: load,
            updateBook,
            testaments,
            byId: new Map(ordered.map((b, order) => [b.id, { ...b, order }])),
        };
    }, [books, error, load, updateBook]);

    return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
};
