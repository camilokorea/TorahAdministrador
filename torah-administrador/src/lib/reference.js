export const normalize = (text = '') =>
    text
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
        .replace(/[ª.\-()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const SMALL_WORDS = new Set(['de', 'del', 'los', 'las', 'la', 'el', 'y', 'a']);

// "JOSUÉ - YaHoShúa" -> "Josué - YaHoShúa" (igual que en la app pública).
export const displayName = (name = '') =>
    name
        .split(' ')
        .map((word, i) => {
            if (word !== word.toUpperCase() || !/\p{L}/u.test(word)) return word;
            const lower = word.toLocaleLowerCase('es');
            if (i > 0 && SMALL_WORDS.has(lower)) return lower;
            return lower.replace(/\p{L}/u, (c) => c.toLocaleUpperCase('es'));
        })
        .join(' ');

// Abreviaturas usuales en español que no se deducen del nombre (p. ej. "jn" es Juan, no Jonás).
const ALIASES = {
    gn: 'genesis', ex: 'exodo', lv: 'levitico', nm: 'numeros', dt: 'deuteronomio', jos: 'josue', jue: 'jueces',
    rt: 'rut', sm: 'samuel', re: 'reyes', cr: 'cronicas', esd: 'esdras', neh: 'nehemias', est: 'ester',
    sal: 'salmos', pr: 'proverbios', prov: 'proverbios', ecl: 'eclesiastes', cnt: 'cantares', is: 'isaias',
    jr: 'jeremias', lam: 'lamentaciones', ez: 'ezequiel', dn: 'daniel', os: 'oseas', jl: 'joel', am: 'amos',
    abd: 'abdias', jon: 'jonas', mi: 'miqueas', nah: 'nahum', hab: 'habacuc', sof: 'sofonias', hag: 'hageo',
    zac: 'zacarias', mal: 'malaquias', mt: 'mateo', mc: 'marcos', mr: 'marcos', lc: 'lucas', jn: 'juan',
    hch: 'hechos', ro: 'romanos', rm: 'romanos', co: 'corintios', ga: 'galatas', gal: 'galatas', ef: 'efesios',
    fil: 'filipenses', flp: 'filipenses', col: 'colosenses', ts: 'tesalonisenses', tes: 'tesalonisenses',
    ti: 'timoteo', tim: 'timoteo', tit: 'tito', flm: 'filemon', heb: 'hebreos', stg: 'santiago', sant: 'santiago',
    pe: 'pedro', jud: 'judas', ap: 'apocalipsis', apoc: 'apocalipsis', rev: 'revelacion',
};

const expandAlias = (key) => {
    const [, num = '', word] = key.match(/^(\d\s)?(.*)$/);
    return ALIASES[word] ? `${num}${ALIASES[word]}` : key;
};

// Abreviaturas comunes que no son prefijo: "jn" -> "juan", "gn" -> "genesis", "1 jn" -> "1 juan".
const isAbbreviationOf = (key, name) => {
    const [keyNum, keyWord] = key.match(/^(\d\s)?(.*)$/).slice(1);
    const [nameNum, nameWord] = name.match(/^(\d\s)?(.*)$/).slice(1);
    if ((keyNum ?? '') !== (nameNum ?? '') || keyWord.length < 2 || keyWord[0] !== nameWord[0]) return false;
    let i = 0;
    for (const c of nameWord) if (c === keyWord[i]) i += 1;
    return i === keyWord.length;
};

// Qué tan bien coincide un texto ya normalizado con un libro (0 = no coincide).
const scoreBook = (key, book) => {
    const name = normalize(book.nombre);
    const abbr = normalize(book.abreviacion);
    if (name === key || abbr === key) return 4;
    if (abbr.startsWith(key)) return 3;
    if (name.startsWith(key)) return 2;
    if (key.length >= 3 && name.split(' ').some((w) => w.startsWith(key))) return 1;
    if (isAbbreviationOf(key, name)) return 0.5;
    return 0;
};

// Libros que coinciden, del más probable al menos (a igual puntaje, en el orden de la Biblia).
const rankBooks = (key, books) =>
    books
        .map((book, order) => ({ book, order, score: scoreBook(key, book) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score || a.order - b.order)
        .map((x) => x.book);

// Sugerencias de libros para lo que se va escribiendo ("gen", "1 co", "jn", "apoc").
export const suggestBooks = (input, books, limit = 6) => {
    const key = expandAlias(normalize(input));
    if (!key) return [];
    return rankBooks(key, books).slice(0, limit);
};

const REFERENCE = /^(.*?)\s*(\d+)(?:\s*[:.,\s]\s*(\d+))?\s*$/;

// "Gén 1:3", "1 cor 13", "juan 3 16", "salmos" -> { book, chapter, verse }
export const parseReference = (input, books) => {
    const text = input.trim();
    if (!text) return null;

    const match = text.match(REFERENCE);
    let bookPart = match ? match[1] : text;
    let chapter = match ? Number(match[2]) : null;
    const verse = match && match[3] ? Number(match[3]) : null;

    // "1 samuel" sin capítulo: el número es parte del nombre.
    if (match && !match[1].trim()) {
        bookPart = text;
        chapter = null;
    }

    const key = expandAlias(normalize(bookPart));
    if (!key) return null;

    const [best] = rankBooks(key, books);
    return best ? { book: best, chapter, verse } : null;
};

// Capítulo completo cuando no se indican versículos ("Sal 23"); al mostrarlo se recorta al último versículo.
export const WHOLE_CHAPTER = 999;

const RANGE = /^(.*?)\s*(\d+)(?:\s*[:.,]\s*(\d+)(?:\s*[-–]\s*(\d+))?)?\s*$/;

/*
  "Gén 1:1-3; Sal 23; Jn 3:16" -> { refs: [{ libroId, capitulo, desde, hasta }], errors: ["texto no reconocido"] }
  Las referencias se separan con ";" o con salto de línea.
*/
export const parseReferenceList = (input, books) => {
    const refs = [];
    const errors = [];

    for (const part of input.split(/[;\n]/).map((p) => p.trim()).filter(Boolean)) {
        const m = part.match(RANGE);
        const found = m && m[1].trim() ? parseReference(`${m[1]} ${m[2]}`, books) : null;
        if (!m || !found || !found.chapter) {
            errors.push(part);
            continue;
        }
        const desde = m[3] ? Number(m[3]) : 1;
        const hasta = m[4] ? Number(m[4]) : m[3] ? desde : WHOLE_CHAPTER;
        if (hasta < desde) {
            errors.push(part);
            continue;
        }
        refs.push({ libroId: found.book.id, capitulo: found.chapter, desde, hasta });
    }

    return { refs, errors };
};

export const formatReference = (ref, booksById) => {
    const book = booksById.get(ref.libroId);
    const name = book ? displayName(book.nombre) : '¿Libro?';
    if (ref.desde === 1 && ref.hasta >= WHOLE_CHAPTER) return `${name} ${ref.capitulo}`;
    return `${name} ${ref.capitulo}:${ref.desde}${ref.hasta > ref.desde ? `–${ref.hasta}` : ''}`;
};

// Una sola referencia completa ("Gén 1:1-3", "Sal 23"), o null si falta el libro o el capítulo.
export const parseSingleReference = (text, books) => {
    const { refs, errors } = parseReferenceList(text, books);
    return refs.length === 1 && errors.length === 0 ? refs[0] : null;
};
