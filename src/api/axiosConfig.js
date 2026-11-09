import axios from 'axios';

/**
 * Normaliza la URL base del backend definida en VITE_API_URL.
 * Remueve barras finales y el sufijo opcional "/api" para evitar rutas duplicadas ("/api/api/...").
 */
export function normalizeApiBaseUrl(rawUrl = import.meta.env.VITE_API_URL) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  return rawUrl.trim().replace(/\/+$/, '').replace(/\/api$/i, '');
}

export const API_BASE_URL = normalizeApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('operator_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session_expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
