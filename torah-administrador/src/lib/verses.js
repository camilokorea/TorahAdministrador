// Cada versículo guardado empieza con su número ("1 En el principio...", a veces pegado: "5YaHWéH...").
// Algunas entradas son fragmentos sin número que continúan el versículo anterior.
// Misma regla que la app pública: un número solo inicia versículo si avanza la secuencia.
const LEADING_NUMBER = /^\s*(\d{1,3})(?:[\s.:]+|(?=\p{L}))(.*)$/su;

export const analyzeChapter = (raw = []) => {
    const entries = [];
    let last = 0;

    raw.forEach((text, index) => {
        const value = text ?? '';
        const match = value.trim().match(LEADING_NUMBER);
        const n = match ? Number(match[1]) : null;
        const isVerse = n !== null && (n === last + 1 || n > last);

        if (isVerse) {
            entries.push({ index, raw: value, number: n, body: match[2].trim(), isFragment: false });
            last = n;
        } else {
            entries.push({ index, raw: value, number: null, body: value.trim(), isFragment: true });
        }
    });

    const present = new Set(entries.filter((e) => !e.isFragment).map((e) => e.number));
    const missing = [];
    for (let n = 1; n <= last; n += 1) {
        if (!present.has(n)) missing.push(n);
    }

    return { entries, missing, fragments: entries.filter((e) => e.isFragment).length };
};

// Al guardar se conserva el número al inicio con el formato "N texto".
export const composeVerse = (entry, body) => (entry.number !== null ? `${entry.number} ${body.trim()}` : body.trim());

// [14, 15, 18] -> "14–15, 18"
export const formatRanges = (numbers) => {
    const parts = [];
    let start = null;
    let prev = null;
    for (const n of numbers) {
        if (start === null) {
            start = n;
        } else if (n !== prev + 1) {
            parts.push(start === prev ? `${start}` : `${start}–${prev}`);
            start = n;
        }
        prev = n;
    }
    if (start !== null) parts.push(start === prev ? `${start}` : `${start}–${prev}`);
    return parts.join(', ');
};
