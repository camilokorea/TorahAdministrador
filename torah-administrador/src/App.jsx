import React from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { BooksProvider } from './lib/books';
import { ToastProvider } from './lib/toast';
import Layout from './components/Layout';
import Login from './pages/Login';
import Books from './pages/Books';
import Book from './pages/Book';
import Dedicatoria from './pages/Dedicatoria';
import Glosario from './pages/Glosario';
import NotFound from './pages/NotFound';
import Estudios from './pages/Estudios';
import EstudioEditor from './pages/EstudioEditor';

const RequireAuth = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
    }
    return (
        <BooksProvider>
            <Outlet />
        </BooksProvider>
    );
};

// Router de datos: necesario para avisar de cambios sin guardar al navegar.
const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
    {
        element: <RequireAuth />,
        children: [
            {
                element: <Layout />,
                children: [
                    { index: true, element: <Books /> },
                    { path: 'libro/:id', element: <Book /> },
                    { path: 'estudios', element: <Estudios /> },
                    { path: 'estudios/:id', element: <EstudioEditor /> },
                    { path: 'dedicatoria', element: <Dedicatoria /> },
                    { path: 'glosario', element: <Glosario /> },
                    { path: '*', element: <NotFound /> },
                ],
            },
        ],
    },
]);

const App = () => (
    <AuthProvider>
        <ToastProvider>
            <RouterProvider router={router} />
        </ToastProvider>
    </AuthProvider>
);

export default App;
