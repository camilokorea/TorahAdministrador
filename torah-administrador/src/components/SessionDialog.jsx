import React, { useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { btn, input } from '../lib/ui';

// La sesión venció: se pide la contraseña sin salir de la página, así no se pierde lo editado.
const SessionDialog = () => {
    const { sessionExpired, user, login, logout, rememberMe } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    if (!sessionExpired) return null;

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            await login(user, password, rememberMe);
            setPassword('');
        } catch (err) {
            setError(err.status === 401 ? 'Contraseña incorrecta.' : err.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4">
            <form
                onSubmit={submit}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="session-title"
                className="w-full max-w-sm rounded-3xl bg-page p-6 shadow-2xl"
            >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-soft text-gold">
                    <LockKeyhole size={20} aria-hidden="true" />
                </span>
                <h2 id="session-title" className="mt-4 font-serif text-xl font-semibold">Tu sesión expiró</h2>
                <p className="mt-1 text-sm text-muted">
                    Escribe tu contraseña para continuar. Lo que estabas editando sigue en pantalla; después vuelve a pulsar “Guardar”.
                </p>
                <p className="mt-4 text-sm font-medium">{user}</p>
                <label className="mt-2 block">
                    <span className="sr-only">Contraseña</span>
                    <input
                        type="password"
                        autoFocus
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        className={`${input} h-11`}
                    />
                </label>
                {error && <p className="mt-2 text-sm text-danger">{error}</p>}
                <div className="mt-5 flex items-center justify-between gap-2">
                    <button type="button" onClick={logout} className={btn.ghost}>
                        Cerrar sesión
                    </button>
                    <button type="submit" disabled={busy || !password} className={btn.primary}>
                        {busy ? 'Entrando…' : 'Continuar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SessionDialog;
