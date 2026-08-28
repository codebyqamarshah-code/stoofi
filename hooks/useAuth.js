import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import Cookies from 'js-cookie';

export const useAuth = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          if (res.success) {
            set({
              user: res.data,
              token: res.token,
              isAuthenticated: true,
              isLoading: false,
            });
            Cookies.set('token', res.token, { expires: 1 });
            return { success: true };
          }
        } catch (error) {
          set({
            error: error.message || 'Invalid email or password',
            isLoading: false,
          });
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        set({ user: null, token: null, isAuthenticated: false });
        Cookies.remove('token');
        try { await api.get('/auth/logout'); } catch(e){}
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
           set({ user: null, isAuthenticated: false });
           return;
        }
        try {
           const res = await api.get('/auth/me');
           if (res.success) {
             set({ isAuthenticated: true, user: res.data });
           } else {
             throw new Error('Not authorized');
           }
        } catch (error) {
           set({ user: null, token: null, isAuthenticated: false });
           Cookies.remove('token');
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
