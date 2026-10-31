import axios from 'axios';

const isProd = process.env.NODE_ENV === 'production';
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

// Base URL configuration - dynamically resolve according to client execution environment
let baseURL = '/api';

if (typeof window !== 'undefined') {
  // In the browser, always route to same-origin /api so Next.js fullstack route handlers are invoked
  baseURL = '/api';
} else {
  // Server-side rendering default
  if (envApiUrl && !envApiUrl.includes('stoofi-backend')) {
    baseURL = envApiUrl;
  } else if (process.env.VERCEL_URL) {
    baseURL = `https://${process.env.VERCEL_URL}/api`;
  } else {
    baseURL = 'http://localhost:3000/api';
  }
}

const api = axios.create({
  baseURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // In browser, ensure we always talk to the same-origin Next.js fullstack API routes
    if (!config.baseURL || config.baseURL.includes('stoofi-backend') || config.baseURL.includes('localhost:5000')) {
      config.baseURL = '/api';
    }

    let token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
      try {
        const raw = sessionStorage.getItem('auth-storage') || localStorage.getItem('auth-storage');
        if (raw) {
          const parsed = JSON.parse(raw);
          token = parsed?.state?.token;
        }
      } catch (_) {}
    }
    if (!token) {
      const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
      if (match) token = match[2];
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Client-side guard: Block DELETE requests for restricted accounts (e.g. pakroyalcollege@gmail.com)
    if (config.method?.toLowerCase() === 'delete') {
      try {
        const rawUser = localStorage.getItem('recent_user') || localStorage.getItem('auth-storage');
        if (rawUser) {
          const u = JSON.parse(rawUser);
          const email = (u?.email || u?.state?.user?.email || '').toLowerCase();
          const canDelete = u?.canDelete !== undefined ? u.canDelete : (u?.state?.user?.canDelete);
          if (email === 'pakroyalcollege@gmail.com' || canDelete === false) {
            if (typeof window !== 'undefined') {
              alert('Delete action is restricted for this administrative account (Add & Edit only).');
            }
            return Promise.reject(new Error('Delete action is restricted for this account (Add & Edit only).'));
          }
        }
      } catch (_) {}
    }

    // Device ID is passed in request body for /auth/login only (see useAuth.js)
    // Do NOT send it as a custom header — it triggers CORS preflight on every request
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers) {
      if (typeof config.headers.delete === 'function') {
        config.headers.delete('Content-Type');
        config.headers.delete('content-type');
      }
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
    // File uploads need more time (up to 3 minutes for large documents)
    config.timeout = 180000;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 401 Unauthorized handling for protected routes:
    // Only force logout if the core session verification (/auth/me) itself fails with 401.
    // Never wipe storage or kick the user out of the dashboard just because an auxiliary endpoint
    // (e.g. /teachers, /staff, /setup/stats, /visitor-book) returned a 401 or permission error.
    const requestUrl = error.config?.url || '';
    const isCoreAuthCheck = requestUrl.includes('/auth/me');

    if (error.response?.status === 401 && isCoreAuthCheck) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/') {
        sessionStorage.removeItem('auth-storage');
        sessionStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('token');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/login?expired=true';
        return new Promise(() => {});
      }
    }

    let message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    // Transform technical SSL / MongoDB / network errors into professional user messages
    const isMaintenanceOrSsl =
      error.response?.data?.isMaintenance ||
      error.response?.data?.errorType === 'DATABASE_MAINTENANCE' ||
      message.includes('SSL routines') ||
      message.includes('tlsv1 alert') ||
      message.includes('SSL alert') ||
      message.includes('ServerSelectionError') ||
      message.includes('MongooseServerSelectionError') ||
      message.includes('MongoNetworkError') ||
      error.response?.status === 503;

    if (isMaintenanceOrSsl) {
      message = 'Database is currently performing a brief cloud synchronization. Please wait a few moments and try again.';
      if (!error.response) {
        error.response = { status: 503, data: {} };
      }
      error.response.data = error.response.data || {};
      error.response.data.isMaintenance = true;
      error.response.data.message = message;
    } else if (message === 'Network Error' || error.code === 'ERR_NETWORK' || message.includes('ECONNREFUSED')) {
      message = 'Unable to connect to server. Please check your internet connection or try again shortly.';
    }

    const err = new Error(message);
    err.response = error.response;
    return Promise.reject(err);
  }
);

export default api;
