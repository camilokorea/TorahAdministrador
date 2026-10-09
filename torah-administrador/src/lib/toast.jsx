import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

let nextId = 1;

// Avisos breves (éxito/error) en la esquina inferior. Un solo aviso por acción.
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

    const show = useCallback(
        (kind, message) => {
            const id = nextId++;
            setToasts((list) => [...list.slice(-2), { id, kind, message }]);
            setTimeout(() => dismiss(id), kind === 'error' ? 7000 : 3500);
        },
        [dismiss]
    );

    const value = useMemo(
        () => ({ success: (m) => show('success', m), error: (m) => show('error', m) }),
        [show]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        role={t.kind === 'error' ? 'alert' : 'status'}
                        className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 pr-2 text-sm shadow-lg"
                    >
                        {t.kind === 'error' ? (
                            <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger" aria-hidden="true" />
                        ) : (
                            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                        )}
                        <p className="flex-1 text-ink">{t.message}</p>
                        <button
                            type="button"
                            onClick={() => dismiss(t.id)}
                            aria-label="Cerrar aviso"
                            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2"
                        >
                            <X size={14} aria-hidden="true" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
