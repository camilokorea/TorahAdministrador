import React from 'react';
import { api } from '../lib/api';
import ContentEditor from '../components/ContentEditor';

// Igual que la app pública: si la primera línea es corta se usa como título.
const Preview = ({ text }) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const hasTitle = lines.length > 1 && lines[0].length <= 40;
    const title = hasTitle ? lines[0] : 'Dedicatoria';
    const paragraphs = hasTitle ? lines.slice(1) : lines;

    return (
        <article className="font-serif">
            <h3 className="mb-4 text-center text-2xl font-semibold">{title}</h3>
            <div className="space-y-3 text-[1.02rem] leading-relaxed">
                {paragraphs.length ? paragraphs.map((p, i) => <p key={i}>{p}</p>) : <p className="text-center text-muted">Sin contenido.</p>}
            </div>
        </article>
    );
};

const Dedicatoria = () => (
    <ContentEditor
        title="Dedicatoria"
        description="Texto de presentación que aparece en la sección Dedicatoria de la app."
        load={api.listDedicatoria}
        save={api.updateDedicatoria}
        Preview={Preview}
        help="La primera línea, si es corta, se usa como título. Cada línea es un párrafo."
    />
);

export default Dedicatoria;
