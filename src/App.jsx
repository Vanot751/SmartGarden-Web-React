import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Redirección hacia el panel administrativo Django
function AdminRedirect() {
  useEffect(() => {
    const backendUrl = (import.meta.env.VITE_API_URL || 'https://smart-garden-api-django.vercel.app').replace(/\/$/, '');
    const currentPath = window.location.pathname.startsWith('/admin') ? window.location.pathname : '/admin/';
    const targetPath = currentPath.endsWith('/') ? currentPath : `${currentPath}/`;
    const search = window.location.search || '';
    window.location.replace(`${backendUrl}${targetPath}${search}`);
  }, []);

  return null;
}

// Guard de ruta privada autenticada con JWT
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/admin" element={<AdminRedirect />} />
          <Route path="/admin/*" element={<AdminRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
