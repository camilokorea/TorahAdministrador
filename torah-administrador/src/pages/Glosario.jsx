import React from 'react';
import { api } from '../lib/api';
import { parseGlosario } from '../lib/glosario';
import ContentEditor from '../components/ContentEditor';

const Preview = ({ text }) => {
    const { intro, entries } = parseGlosario(text);

    if (entries.length < 3) {
        return (
            <div className="space-y-3 font-serif">
                <p className="rounded-xl bg-gold-soft/60 p-3 font-sans text-xs text-ink">
                    Con menos de 3 entradas “-Término: definición” la app muestra el texto tal cual, sin buscador.
                </p>
                {text.split('\n').filter((l) => l.trim()).map((l, i) => <p key={i}>{l}</p>)}
            </div>
        );
    }

    return (
        <div>
            {intro.length > 0 && <p className="mb-4 text-center font-serif text-sm text-muted">{intro.join(' ')}</p>}
            <p className="mb-3 text-xs text-muted">{entries.length} términos</p>
            <dl className="divide-y divide-line rounded-xl border border-line">
                {entries.map((e, i) => (
                    <div key={`${e.term}-${i}`} className="px-4 py-3">
                        <dt className="font-serif font-semibold">{e.term}</dt>
                        {e.definition ? (
                            <dd className="mt-0.5 text-sm leading-relaxed text-muted">{e.definition}</dd>
                        ) : (
                            <dd className="mt-0.5 text-xs text-danger">Sin definición: revisa que tenga “:” después del término.</dd>
                        )}
                    </div>
                ))}
            </dl>
        </div>
    );
};

const Glosario = () => (
    <ContentEditor
        title="Glosario"
        description="Términos y definiciones que aparecen en la sección Glosario de la app."
        load={api.listGlosario}
        save={api.updateGlosario}
        Preview={Preview}
        help="Una entrada por línea: “-Término: definición”."
    />
);

export default Glosario;
