import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, onUnauthorized } from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const KEYS = ['token', 'username', 'isAuthenticated', 'rememberMe'];

const readStored = (key) => {
    try {
        return localStorage.getItem(key) || sessionStorage.getItem(key) || '';
    } catch {
        return '';
    }
};

const clearStored = () => {
    try {
        KEYS.forEach((k) => {
            localStorage.removeItem(k);
            sessionStorage.removeItem(k);
        });
    } catch {
        // Sin almacenamiento disponible.
    }
};

// Fecha de expiración del JWT (segundos -> ms), o null si no se puede leer.
const tokenExpiry = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload.exp ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
};

const isExpired = (token) => {
    const exp = tokenExpiry(token);
    return !!exp && exp <= Date.now();
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        const stored = readStored('token');
        return stored && !isExpired(stored) ? stored : '';
    });
    const [user, setUser] = useState(() => (token ? readStored('username') : ''));
    const [sessionExpired, setSessionExpired] = useState(false);

    const login = useCallback(async (email, password, rememberMe) => {
        const data = await api.login(email, password);
        clearStored();
        try {
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('token', data.token);
            storage.setItem('username', email);
            storage.setItem('isAuthenticated', 'true');
            storage.setItem('rememberMe', String(rememberMe));
        } catch {
            // La sesión funciona aunque no se pueda guardar.
        }
        setToken(data.token);
        setUser(email);
        setSessionExpired(false);
    }, []);

    const logout = useCallback(() => {
        clearStored();
        setToken('');
        setUser('');
        setSessionExpired(false);
    }, []);

    // Cuando el token vence no se cierra la pantalla: se pide la contraseña
    // de nuevo en un diálogo para no perder lo que se está editando.
    useEffect(() => {
        onUnauthorized(() => setSessionExpired(true));
        return () => onUnauthorized(null);
    }, []);

    useEffect(() => {
        if (!token) return undefined;
        const exp = tokenExpiry(token);
        if (!exp) return undefined;
        const timer = setTimeout(() => setSessionExpired(true), Math.max(exp - Date.now(), 0));
        return () => clearTimeout(timer);
    }, [token]);

    const value = useMemo(
        () => ({
            token,
            user,
            isAuthenticated: !!token,
            sessionExpired,
            login,
            logout,
            rememberMe: readStored('rememberMe') === 'true',
        }),
        [token, user, sessionExpired, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
