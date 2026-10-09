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

    let best = null;
    books.forEach((book, order) => {
        const name = normalize(book.nombre);
        const abbr = normalize(book.abreviacion);
        let score = 0;
        if (name === key || abbr === key) score = 4;
        else if (abbr.startsWith(key)) score = 3;
        else if (name.startsWith(key)) score = 2;
        else if (key.length >= 3 && name.split(' ').some((w) => w.startsWith(key))) score = 1;
        else if (isAbbreviationOf(key, name)) score = 0.5;
        if (score && (!best || score > best.score)) best = { score, order, book };
    });

    return best ? { book: best.book, chapter, verse } : null;
};
