import React, { createContext, useState, useContext } from 'react';

import { UseHttpCodes } from '../hooks/UseHttpCodes';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const API_URL = (import.meta.env.VITE_API_BASE_URL || 'https://bibliaapi.comunidadmenorah.com/api/') + 'Auth/';
    // const API_URL = 'https://localhost:7116/api/Auth/';

    // Verificar tanto localStorage como sessionStorage para la inicialización
    const getStoredValue = (key) => {
        try {
            return localStorage.getItem(key) || sessionStorage.getItem(key) || "";
        } catch (error) {
            console.warn(`Error accessing storage for key ${key}:`, error);
            return "";
        }
    };

    const [token, setToken] = useState(getStoredValue("token"));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(getStoredValue("username"));
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const storedValue = getStoredValue('isAuthenticated');
        if (!storedValue || storedValue === '') {
            return false;
        }
        try {
            return JSON.parse(storedValue);
        } catch (error) {
            console.warn('Error parsing isAuthenticated from storage:', error);
            return false;
        }
    });

    const {
        codigosHttp
    } = UseHttpCodes();

    const login = async (userData, rememberMe = false) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL + 'login', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                setToken(null);
                setUser(null);
                setIsAuthenticated(false);
                setError(response.status + '-' + codigosHttp[response.status]);
            } else {
                const data = await response.json();
                setToken(data.token);
                setUser(userData.email);
                setIsAuthenticated(true);

                // Usar localStorage si "Recordar sesión" está marcado, sino sessionStorage
                try {
                    const storage = rememberMe ? localStorage : sessionStorage;
                    storage.setItem("token", data.token);
                    storage.setItem("username", userData.email);
                    storage.setItem("isAuthenticated", "true");
                    storage.setItem("rememberMe", rememberMe.toString());
                } catch (error) {
                    console.warn('Error saving to storage:', error);
                    // Continuar con el login aunque falle el storage
                }
            }
        } catch (err) {
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);

        // Limpiar tanto localStorage como sessionStorage
        try {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("username");
            sessionStorage.removeItem("isAuthenticated");
            sessionStorage.removeItem("rememberMe");
            
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("isAuthenticated");
            localStorage.removeItem("rememberMe");
        } catch (error) {
            console.warn('Error clearing storage:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ token, loading, error, user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook para usar el contexto
export const useAuth = () => {
    return useContext(AuthContext);
};
