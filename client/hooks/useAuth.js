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

      login: async (email, password, remember = true, roleLabel = null) => {
        set({ isLoading: true, error: null });
        const cleanEmail = email?.trim().toLowerCase() || 'super@gmail.com';
        
        let role = roleLabel;
        if (!role) {
          if (cleanEmail === 'super@gmail.com') {
            role = 'Super Admin';
          } else if (cleanEmail === 'admin@gmail.com') {
            role = 'Admin';
          } else {
            role = cleanEmail.split('@')[0].toUpperCase();
          }
        }

        const isSuperAdmin = role === 'Super Admin' || cleanEmail === 'super@gmail.com';
        const isAdmin = role === 'Admin' || cleanEmail === 'admin@gmail.com';

        try {
          const res = await api.post('/auth/login', { email: cleanEmail, password });
          if (res && res.success) {
            const finalUser = res.data;
            const finalToken = res.token;
            set({
              user: finalUser,
              token: finalToken,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            Cookies.set('token', finalToken, { expires: 7 });
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', finalToken);
            }
            return { success: true, user: finalUser };
          }
        } catch (error) {
          const errorMsg = error?.response?.data?.message || error?.message || 'User not found. Please register first.';
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg };
        }
      },

      logout: async () => {
        set({ user: null, token: null, isAuthenticated: false });
        Cookies.remove('token');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');
        }
        try { await api.get('/auth/logout'); } catch(e){}
      },

      checkAuth: async () => {
        let token = get().token;
        let user = get().user;

        if (typeof window !== 'undefined') {
          if (!token) {
            token = localStorage.getItem('token') || Cookies.get('token');
          }
          if (!user) {
            try {
              const raw = localStorage.getItem('auth-storage');
              if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.state?.user) user = parsed.state.user;
                if (!token && parsed?.state?.token) token = parsed.state.token;
              }
            } catch (e) {}
          }
        }

        if (!token) {
           set({ user: null, isAuthenticated: false, isLoading: false });
           return;
        }

        let resolvedUser = user;
        if (!resolvedUser) {
          // No user data found — don't assume any role, force re-login
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isAuthenticated: true, user: resolvedUser, token, isLoading: false });

        if (typeof token === 'string' && token.startsWith('mock_')) {
          return;
        }

        try {
           const res = await api.get('/auth/me');
           if (res && res.success && res.data) {
             set({ isAuthenticated: true, user: res.data, isLoading: false });
           }
        } catch (error) {
           set({ isAuthenticated: true, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => {
        let safeUser = state.user;
        if (safeUser) {
          safeUser = { ...safeUser };
          if (safeUser.avatar && safeUser.avatar.length > 5000) safeUser.avatar = '';
          if (safeUser.picture && safeUser.picture.length > 5000) safeUser.picture = '';
        }
        return { user: safeUser, token: state.token, isAuthenticated: state.isAuthenticated };
      },
    }
  )
);
