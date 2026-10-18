import { useEffect, useState } from 'react';
import { api } from './api';
import { analyzeChapter } from './verses';

// Libros ya pedidos a la API durante la sesión (para no repetir la descarga en cada referencia).
const cache = new Map();

export const loadBook = (id) => {
    if (!cache.has(id)) {
        cache.set(
            id,
            api.getLibro(id).catch((e) => {
                cache.delete(id);
                throw e;
            })
        );
    }
    return cache.get(id);
};

// Versículos numerados de un capítulo; los fragmentos sin número se unen al versículo anterior (igual que la app).
export const numberedVerses = (raw) => {
    const verses = [];
    for (const entry of analyzeChapter(raw).entries) {
        if (!entry.isFragment) verses.push({ n: entry.number, text: entry.body });
        else if (verses.length && entry.body) verses[verses.length - 1].text += ` ${entry.body}`;
    }
    return verses;
};

export const resolveReference = async (ref) => {
    const book = await loadBook(ref.libroId);
    const chapter = book.capitulos.find((c) => c.capituloNumero === ref.capitulo);
    if (!chapter) return { verses: [], missing: true };
    const verses = numberedVerses(chapter.versiculos).filter((v) => v.n >= ref.desde && v.n <= ref.hasta);
    return { verses, missing: verses.length === 0 };
};

// Hook: texto de una lista de referencias. Devuelve [{ ref, verses, missing }] o null mientras carga.
export const useReferencesText = (refs) => {
    const [state, setState] = useState({ key: '', data: null, error: null });
    const key = JSON.stringify(refs);

    useEffect(() => {
        let cancelled = false;
        Promise.all(refs.map(async (ref) => ({ ref, ...(await resolveReference(ref)) })))
            .then((data) => !cancelled && setState({ key, data, error: null }))
            .catch((e) => !cancelled && setState({ key, data: null, error: e.message }));
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return state.key === key ? state : { data: null, error: null };
};

// Hook: capítulos de un libro con sus versículos numerados ([{ n, verses: [{ n, text }] }]), o null mientras carga.
export const useBookChapters = (bookId) => {
    const [state, setState] = useState({ id: null, chapters: null, error: null });

    useEffect(() => {
        if (!bookId) return undefined;
        let cancelled = false;
        loadBook(bookId)
            .then((book) => {
                if (cancelled) return;
                const chapters = book.capitulos.map((c) => ({ n: c.capituloNumero, verses: numberedVerses(c.versiculos) }));
                setState({ id: bookId, chapters, error: null });
            })
            .catch((e) => !cancelled && setState({ id: bookId, chapters: null, error: e.message }));
        return () => {
            cancelled = true;
        };
    }, [bookId]);

    return state.id === bookId ? state : { chapters: null, error: null };
};
