import axios from 'axios';

const isProd = process.env.NODE_ENV === 'production';
const envApiUrl = process.env.NEXT_PUBLIC_API_URL;

// Base URL configuration - default to relative '/api' if NEXT_PUBLIC_API_URL is omitted in production
let baseURL = envApiUrl || (isProd ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
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
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 401 Unauthorized handling for protected routes
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/') {
        sessionStorage.removeItem('auth-storage');
        sessionStorage.removeItem('token');
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('token');
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/login';
        return new Promise(() => {});
      }
    }

    let message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    // Transform unhelpful technical network errors into professional user messages
    if (message === 'Network Error' || error.code === 'ERR_NETWORK' || message.includes('ECONNREFUSED')) {
      message = 'Unable to connect to server. Please check your internet connection or try again shortly.';
    }

    const err = new Error(message);
    err.response = error.response;
    return Promise.reject(err);
  }
);

export default api;
