import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { btn, input } from '../lib/ui';
import EnvChip, { EnvStripe } from '../components/EnvChip';
import InstallApp from '../components/InstallApp';

const Login = () => {
    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const from = location.state?.from || '/';
    if (isAuthenticated) return <Navigate to={from} replace />;

    const submit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            await login(email.trim(), password, rememberMe);
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.status === 401 ? 'Correo o contraseña incorrectos.' : err.message);
            setBusy(false);
        }
    };

    return (
        <main className="grid min-h-dvh place-items-center bg-page px-4 py-10 text-ink">
            <EnvStripe />
            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center text-center">
                    <img src="/favicon/web-app-manifest-192x192.png" alt="" width={72} height={72} className="h-18 w-18 rounded-full shadow-lg shadow-brand-strong/20" />
                    <h1 className="mt-5 font-serif text-2xl font-semibold">Biblia Menorah</h1>
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted">
                        Administrador de contenido <EnvChip />
                    </p>
                </div>

                <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-line bg-surface p-6 shadow-sm">
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">Correo</span>
                        <input
                            type="email"
                            required
                            autoComplete="username"
                            autoFocus
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nombre@ejemplo.com"
                            className={`${input} h-11`}
                        />
                    </label>
                    <label className="block">
                        <span className="mb-1.5 block text-sm font-medium">Contraseña</span>
                        <input
                            type="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`${input} h-11`}
                        />
                    </label>
                    <label className="flex items-center gap-2.5 text-sm">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 rounded border-line accent-brand"
                        />
                        Recordar sesión en este equipo
                    </label>
                    {error && (
                        <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
                            {error}
                        </p>
                    )}
                    <button type="submit" disabled={busy} className={`${btn.primary} h-11 w-full`}>
                        {busy ? 'Entrando…' : 'Iniciar sesión'}
                    </button>
                </form>
                <div className="mt-6">
                    <InstallApp />
                </div>
            </div>
        </main>
    );
};

export default Login;
