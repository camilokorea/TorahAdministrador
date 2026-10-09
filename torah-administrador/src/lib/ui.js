// Estilos compartidos de botones y campos.
const base =
    'inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50';

export const btn = {
    primary: `${base} h-10 bg-brand px-4 text-on-brand hover:bg-brand-strong dark:hover:bg-brand dark:hover:brightness-110`,
    secondary: `${base} h-10 border border-line bg-surface px-4 text-ink hover:bg-surface-2`,
    ghost: `${base} h-10 px-3 text-muted hover:bg-surface-2 hover:text-ink`,
    danger: `${base} h-10 px-3 text-danger hover:bg-danger/10`,
    icon: `${base} h-9 w-9 shrink-0 text-muted hover:bg-surface-2 hover:text-ink`,
    small: `${base} h-8 px-3 text-xs`,
};

export const input =
    'w-full rounded-xl border border-line bg-surface px-3.5 text-[0.95rem] text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

export const card = 'rounded-2xl border border-line bg-surface';
