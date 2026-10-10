import React from 'react';
import { imagenUrl } from '../../lib/api';
import { Markdown } from '../../lib/markdown';
import VersesQuote from './VersesQuote';

// Vista previa del estudio con el mismo orden y estilo que tendrá en la app.
const StudyView = ({ estudio }) => (
    <article className="mx-auto max-w-[42rem]">
        {estudio.portadaImagenId && (
            <img src={imagenUrl(estudio.portadaImagenId)} alt="" className="mb-6 aspect-[2/1] w-full rounded-2xl object-cover" />
        )}
        <h1 className="font-serif text-3xl font-semibold leading-tight">{estudio.titulo || 'Sin título'}</h1>
        {estudio.resumen && <p className="mt-2 text-muted">{estudio.resumen}</p>}

        {estudio.secciones.length > 1 && (
            <nav className="mt-6 rounded-2xl border border-line bg-surface p-4" aria-label="Contenido">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Contenido</p>
                <ol className="list-decimal space-y-1 pl-5 text-sm marker:text-gold">
                    {estudio.secciones.map((s) => <li key={s.id}>{s.titulo || 'Sin título'}</li>)}
                </ol>
            </nav>
        )}

        {estudio.secciones.map((s, i) => (
            <section key={s.id} className="mt-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Sección {i + 1}</p>
                <h2 className="mt-1 font-serif text-2xl font-semibold">{s.titulo || 'Sin título'}</h2>
                <div className="mt-4 space-y-5 font-serif text-[1.05rem] leading-relaxed">
                    {s.bloques.map((b) => {
                        if (b.tipo === 'texto') return b.texto ? <Markdown key={b.id} text={b.texto} /> : null;
                        if (b.tipo === 'imagen') {
                            return b.imagenId ? (
                                <figure key={b.id}>
                                    <img src={imagenUrl(b.imagenId)} alt={b.leyenda || ''} className="w-full rounded-xl" />
                                    {b.leyenda && <figcaption className="mt-2 text-center font-sans text-sm text-muted">{b.leyenda}</figcaption>}
                                </figure>
                            ) : null;
                        }
                        return b.referencias?.length ? <VersesQuote key={b.id} refs={b.referencias} /> : null;
                    })}
                </div>
            </section>
        ))}
    </article>
);

export default StudyView;
