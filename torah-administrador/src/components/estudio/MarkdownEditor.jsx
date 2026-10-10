import React, { useLayoutEffect, useRef } from 'react';
import { Bold, Heading2, Italic, Link2, List, ListOrdered, Quote } from 'lucide-react';

// Botones que envuelven la selección o agregan un prefijo a las líneas seleccionadas.
const ACTIONS = [
    { label: 'Negrita', Icon: Bold, wrap: ['**', '**'], placeholder: 'texto' },
    { label: 'Cursiva', Icon: Italic, wrap: ['*', '*'], placeholder: 'texto' },
    { label: 'Subtítulo', Icon: Heading2, prefix: '## ' },
    { label: 'Lista', Icon: List, prefix: '- ' },
    { label: 'Lista numerada', Icon: ListOrdered, prefix: '1. ' },
    { label: 'Cita', Icon: Quote, prefix: '> ' },
    { label: 'Enlace', Icon: Link2, wrap: ['[', '](https://)'], placeholder: 'texto del enlace' },
];

const MarkdownEditor = ({ value, onChange, placeholder }) => {
    const ref = useRef(null);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.max(el.scrollHeight + 2, 96)}px`;
    }, [value]);

    const apply = (action) => {
        const el = ref.current;
        const { selectionStart: start, selectionEnd: end } = el;
        let next;
        let cursorStart;
        let cursorEnd;

        if (action.wrap) {
            const selected = value.slice(start, end) || action.placeholder;
            next = value.slice(0, start) + action.wrap[0] + selected + action.wrap[1] + value.slice(end);
            cursorStart = start + action.wrap[0].length;
            cursorEnd = cursorStart + selected.length;
        } else {
            const lineStart = value.lastIndexOf('\n', start - 1) + 1;
            const block = value.slice(lineStart, end);
            const prefixed = block.split('\n').map((l) => action.prefix + l.replace(/^(#{2,3}\s|[-*]\s|\d+[.)]\s|>\s?)/, '')).join('\n');
            next = value.slice(0, lineStart) + prefixed + value.slice(end);
            cursorStart = lineStart;
            cursorEnd = lineStart + prefixed.length;
        }

        onChange(next);
        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(cursorStart, cursorEnd);
        });
    };

    return (
        <div className="overflow-hidden rounded-xl border border-line bg-surface focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
            <div role="toolbar" aria-label="Formato" className="flex flex-wrap gap-0.5 border-b border-line bg-surface-2/60 px-1.5 py-1">
                {ACTIONS.map((a) => (
                    <button
                        key={a.label}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => apply(a)}
                        title={a.label}
                        aria-label={a.label}
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface hover:text-ink"
                    >
                        <a.Icon size={16} aria-hidden="true" />
                    </button>
                ))}
            </div>
            <textarea
                ref={ref}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                spellCheck
                lang="es"
                className="block w-full resize-none bg-transparent px-3.5 py-3 font-serif text-[1rem] leading-relaxed text-ink outline-none"
            />
        </div>
    );
};

export default MarkdownEditor;
