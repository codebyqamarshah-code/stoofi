import axios from 'axios';

// In-memory cache for ultra-fast page navigation (SWR style)
const apiCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 3000, // 3-second timeout prevents indefinite hanging
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('auth-storage');
      if (raw) {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      }
    } catch (_) {}

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config?.method === 'get') {
      const cacheKey = response.config.url;
      if (cacheKey) {
        apiCache.set(cacheKey, { data: response.data, timestamp: Date.now() });
      }
    } else {
      // Invalidate cache on mutations (POST, PUT, DELETE)
      apiCache.clear();
    }
    return response.data;
  },
  (error) => {
    if (!error.response || error.code === 'ECONNABORTED') {
      console.warn("Backend server not reachable or request timed out. Returning instant safe fallback.");
      return Promise.resolve({ success: false, data: [], message: 'Offline mode' });
    }

    if (error.response.status === 401) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login' && window.location.pathname !== '/') {
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('token');
        window.location.href = '/login';
        return new Promise(() => {});
      }
    }

    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const err = new Error(message);
    err.response = error.response;
    return Promise.reject(err);
  }
);

// Cached GET wrapper for instant page navigation
const originalGet = api.get.bind(api);
api.get = function(url, config) {
  const cached = apiCache.get(url);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    // Return cached data instantly (0ms response)
    return Promise.resolve(JSON.parse(JSON.stringify(cached.data)));
  }
  return originalGet(url, config);
};

export default api;
