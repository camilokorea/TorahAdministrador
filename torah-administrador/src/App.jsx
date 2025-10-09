// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Importamos el contexto
import Login from './components/Login';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Consumimos el estado de autenticación

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta de Login */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
