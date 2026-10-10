import React from 'react';

/*
  Formato básico de los estudios (mismo archivo en el administrador y en la app pública):
    ## Subtítulo          ### Subtítulo menor
    **negrita**  *cursiva*  [texto](https://enlace)
    - elemento de lista   1. lista numerada
    > cita
  Se convierte directamente en elementos de React: nunca se inserta HTML, así que no hay riesgo de código inyectado.
*/

const SAFE_URL = /^(https?:\/\/|mailto:)/i;
const INLINE = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|_[^_\s][^_]*_|\[[^\]]+\]\([^)\s]+\))/g;

const renderInline = (text, keyPrefix) =>
    text.split(INLINE).filter(Boolean).map((part, i) => {
        const key = `${keyPrefix}-${i}`;
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            return <strong key={key}>{renderInline(part.slice(2, -2), key)}</strong>;
        }
        if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
            if (part.length > 2) return <em key={key}>{part.slice(1, -1)}</em>;
        }
        const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
        if (link) {
            return SAFE_URL.test(link[2]) ? (
                <a key={key} href={link[2]} target="_blank" rel="noreferrer noopener" className="text-brand underline underline-offset-2">
                    {link[1]}
                </a>
            ) : (
                link[1]
            );
        }
        return part;
    });

const withBreaks = (lines, key) =>
    lines.flatMap((line, i) => (i === 0 ? renderInline(line, `${key}-${i}`) : [<br key={`${key}-br-${i}`} />, ...renderInline(line, `${key}-${i}`)]));

export const parseMarkdown = (source = '') => {
    const blocks = [];
    let paragraph = [];
    let list = null;
    let quote = [];

    const flush = () => {
        if (paragraph.length) blocks.push({ type: 'p', lines: paragraph });
        if (list) blocks.push(list);
        if (quote.length) blocks.push({ type: 'quote', lines: quote });
        paragraph = [];
        list = null;
        quote = [];
    };

    for (const raw of source.replace(/\r/g, '').split('\n')) {
        const line = raw.trimEnd();
        const heading = line.match(/^(#{2,3})\s+(.*)$/);
        const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
        const number = line.match(/^\s*\d+[.)]\s+(.*)$/);
        const cite = line.match(/^>\s?(.*)$/);

        if (!line.trim()) {
            flush();
        } else if (heading) {
            flush();
            blocks.push({ type: heading[1].length === 2 ? 'h2' : 'h3', text: heading[2] });
        } else if (bullet || number) {
            const type = bullet ? 'ul' : 'ol';
            if (paragraph.length || quote.length || (list && list.type !== type)) flush();
            if (!list) list = { type, items: [] };
            list.items.push((bullet || number)[1]);
        } else if (cite) {
            if (paragraph.length || list) flush();
            quote.push(cite[1]);
        } else {
            if (list || quote.length) flush();
            paragraph.push(line.trim());
        }
    }
    flush();
    return blocks;
};

export const Markdown = ({ text, className = '' }) => (
    <div className={`space-y-3 ${className}`}>
        {parseMarkdown(text).map((b, i) => {
            const key = `b${i}`;
            switch (b.type) {
                case 'h2':
                    return <h3 key={key} className="pt-2 font-serif text-[1.35em] font-semibold leading-tight">{renderInline(b.text, key)}</h3>;
                case 'h3':
                    return <h4 key={key} className="pt-1 font-serif text-[1.15em] font-semibold leading-tight">{renderInline(b.text, key)}</h4>;
                case 'ul':
                    return (
                        <ul key={key} className="list-disc space-y-1 pl-6 marker:text-gold">
                            {b.items.map((item, j) => <li key={j}>{renderInline(item, `${key}-${j}`)}</li>)}
                        </ul>
                    );
                case 'ol':
                    return (
                        <ol key={key} className="list-decimal space-y-1 pl-6 marker:text-gold">
                            {b.items.map((item, j) => <li key={j}>{renderInline(item, `${key}-${j}`)}</li>)}
                        </ol>
                    );
                case 'quote':
                    return <blockquote key={key} className="border-l-4 border-gold/60 pl-4 italic text-muted">{withBreaks(b.lines, key)}</blockquote>;
                default:
                    return <p key={key}>{withBreaks(b.lines, key)}</p>;
            }
        })}
    </div>
);
