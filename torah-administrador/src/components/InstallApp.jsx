import React, { useEffect, useState } from 'react';
import { Download, Share, SquarePlus, X } from 'lucide-react';
import { useInstall } from '../lib/install';
import { btn } from '../lib/ui';

const HIDE_KEY = 'admin.instalarOcultoHasta';
const HIDE_DAYS = 14;

const hiddenNow = () => {
    try {
        return Number(localStorage.getItem(HIDE_KEY) || 0) > Date.now();
    } catch {
        return false;
    }
};

const Step = ({ n, children }) => (
    <li className="flex gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold-soft text-sm font-bold text-gold">{n}</span>
        <span>{children}</span>
    </li>
);

// Pasos de Safari para iPhone/iPad (allí no se puede instalar desde un botón).
const IOSDialog = ({ onClose }) => {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
            <button type="button" aria-label="Cerrar" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default" />
            <div role="dialog" aria-modal="true" aria-labelledby="ios-title" className="relative w-full max-w-md rounded-t-3xl bg-page p-6 text-ink shadow-2xl sm:rounded-3xl">
                <div className="mb-5 flex items-center justify-between">
                    <h2 id="ios-title" className="font-serif text-lg font-semibold">Instalar en iPhone o iPad</h2>
                    <button type="button" onClick={onClose} aria-label="Cerrar" className={btn.icon} autoFocus>
                        <X size={18} aria-hidden="true" />
                    </button>
                </div>
                <ol className="space-y-4 text-[0.95rem]">
                    <Step n={1}>
                        Toca el botón <strong>Compartir</strong>{' '}
                        <Share size={18} className="mx-0.5 inline -translate-y-0.5 text-brand" aria-label="(ícono de compartir)" /> en la barra de Safari.
                    </Step>
                    <Step n={2}>
                        Elige <strong>Agregar a pantalla de inicio</strong>{' '}
                        <SquarePlus size={18} className="mx-0.5 inline -translate-y-0.5 text-brand" aria-hidden="true" />.
                    </Step>
                    <Step n={3}>
                        Toca <strong>Agregar</strong>. El administrador aparecerá en tu pantalla de inicio y se abrirá como una app.
                    </Step>
                </ol>
            </div>
        </div>
    );
};

/*
  Atajo para instalar el administrador como app. No aparece si ya se está usando instalado.
  - variant "banner": aviso arriba del contenido; se puede ocultar por 14 días.
  - variant "menu": opción fija en el menú lateral.
*/
const InstallApp = ({ variant = 'banner', onDone }) => {
    const { mode, install } = useInstall();
    const [iosOpen, setIosOpen] = useState(false);
    const [hidden, setHidden] = useState(hiddenNow);

    if (!mode || (variant === 'banner' && hidden)) return null;

    const onInstall = async () => {
        if (mode === 'ios') setIosOpen(true);
        else {
            await install();
            onDone?.();
        }
    };

    const hide = () => {
        try {
            localStorage.setItem(HIDE_KEY, String(Date.now() + HIDE_DAYS * 86_400_000));
        } catch {
            // sin almacenamiento: se oculta solo en esta sesión
        }
        setHidden(true);
    };

    const dialog = iosOpen && <IOSDialog onClose={() => setIosOpen(false)} />;

    if (variant === 'menu') {
        return (
            <>
                <button
                    type="button"
                    onClick={onInstall}
                    className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink"
                >
                    <Download size={18} aria-hidden="true" />
                    Instalar como app
                </button>
                {dialog}
            </>
        );
    }

    return (
        <>
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-brand/20 bg-brand-soft p-3 pl-4">
                <img src="/favicon/web-app-manifest-192x192.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Instala el administrador</p>
                    <p className="text-xs text-muted">Ábrelo desde tu pantalla de inicio o escritorio, como una app.</p>
                </div>
                <button type="button" onClick={onInstall} className={`${btn.primary} shrink-0 cursor-pointer`}>
                    Instalar
                </button>
                <button type="button" onClick={hide} aria-label="Ocultar por ahora" className={`${btn.icon} shrink-0 cursor-pointer`}>
                    <X size={16} aria-hidden="true" />
                </button>
            </div>
            {dialog}
        </>
    );
};

export default InstallApp;
