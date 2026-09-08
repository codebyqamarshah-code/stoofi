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
            return { success: true };
          }
        } catch (error) {
          // If NOT super admin or admin, enforce strict DB check and return error
          if (!isSuperAdmin && !isAdmin) {
            const errorMsg = error?.response?.data?.message || 'Please register first.';
            set({ isLoading: false, error: errorMsg });
            return { success: false, error: errorMsg };
          }
        }

        // Fallback for Super Admin and Admin only (as requested)
        if (isSuperAdmin || isAdmin) {
          const userObj = {
            _id: isSuperAdmin ? 'super-admin-001' : 'admin-002',
            username: isSuperAdmin ? 'Super Admin' : 'Admin',
            email: cleanEmail,
            role: role,
            fullName: isSuperAdmin ? 'Super Admin' : 'Admin'
          };
          const tokenStr = isSuperAdmin ? 'mock_jwt_token_super_admin_2026' : 'mock_jwt_token_admin_2026';
          
          set({
            user: userObj,
            token: tokenStr,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
          Cookies.set('token', tokenStr, { expires: 7 });
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', tokenStr);
          }
          return { success: true };
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
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
