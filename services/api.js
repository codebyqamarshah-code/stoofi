import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
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
  (response) => response.data,
  (error) => {
    // If it's a network error (no response from server)
    if (!error.response) {
      console.warn("Backend server is not reachable (Network Error). Returning empty response.");
      // Return a fake successful response with no data so the UI doesn't break
      return Promise.resolve({ success: false, data: [], message: 'Network Error' });
    }

    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    const err = new Error(message);
    err.response = error.response;
    return Promise.reject(err);
  }
);

export default api;
