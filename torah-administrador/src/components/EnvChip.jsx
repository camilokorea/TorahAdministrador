import React from 'react';

// Etiqueta de ambientes que no son producción (VITE_ENV_LABEL, p. ej. "Pruebas").
export const envLabel = import.meta.env.VITE_ENV_LABEL;

if (envLabel) {
    document.title = `[${envLabel}] ${document.title}`;
}

export const EnvStripe = () =>
    envLabel ? <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-gold" /> : null;

const EnvChip = () =>
    envLabel ? (
        <span className="inline-block rounded-full bg-gold px-2 py-0.5 font-sans text-[0.6rem] font-bold uppercase tracking-wider text-white dark:text-page">
            {envLabel}
        </span>
    ) : null;

export default EnvChip;
