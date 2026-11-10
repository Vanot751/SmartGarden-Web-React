import axios from 'axios';

export const DEFAULT_PRODUCTION_API_URL = 'https://smart-garden-api-django.vercel.app';

/**
 * Normaliza la URL base del backend definida en VITE_API_URL.
 * Remueve barras finales y el sufijo opcional "/api" para evitar rutas duplicadas ("/api/api/...").
 */
export function normalizeApiBaseUrl(rawUrl = import.meta.env.VITE_API_URL || DEFAULT_PRODUCTION_API_URL) {
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

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/api/token/') ||
      requestUrl.includes('/api/auth/login/') ||
      requestUrl.includes('/api/auth/register/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          if (!refreshPromise) {
            refreshPromise = axios
              .post(`${API_BASE_URL}/api/token/refresh/`, { refresh: refreshToken })
              .finally(() => {
                refreshPromise = null;
              });
          }
          const refreshRes = await refreshPromise;
          const newAccess = refreshRes.data?.access;
          if (newAccess) {
            localStorage.setItem('access_token', newAccess);
            if (refreshRes.data?.refresh) {
              localStorage.setItem('refresh_token', refreshRes.data.refresh);
            }
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Si falla la renovación en /api/token/refresh/, cerramos la sesión
        }
      }

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
