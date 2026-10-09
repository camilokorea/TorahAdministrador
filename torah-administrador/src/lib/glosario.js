// Mismo formato que interpreta la app pública: introducción y entradas "-Término: definición".
export const parseGlosario = (text = '') => {
    const intro = [];
    const entries = [];

    for (const raw of text.split('\n')) {
        const line = raw.trim();
        if (!line) continue;
        if (line.startsWith('-')) {
            const body = line.replace(/^-+\s*/, '');
            const colon = body.indexOf(':');
            const dot = body.indexOf('. ');
            const cut = colon > 0 && colon < 80 ? colon : dot > 0 && dot < 80 ? dot : -1;
            entries.push({
                term: cut > 0 ? body.slice(0, cut).trim() : body,
                definition: cut > 0 ? body.slice(cut + 1).trim() : '',
            });
        } else if (entries.length) {
            const last = entries[entries.length - 1];
            last.definition = `${last.definition} ${line}`.trim();
        } else {
            intro.push(line);
        }
    }

    return { intro, entries };
};
