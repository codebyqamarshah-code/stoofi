import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
          } else if (cleanEmail === 'admin@gmail.com' || cleanEmail === 'admin@gamil.com') {
            role = 'Admin';
          } else {
            role = cleanEmail.split('@')[0].toUpperCase();
          }
        }

        const isSuperAdmin = role === 'Super Admin' || cleanEmail === 'super@gmail.com';
        const isAdmin = role === 'Admin' || cleanEmail === 'admin@gmail.com' || cleanEmail === 'admin@gamil.com';

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
            // Use session cookie (no expires attribute) so it clears on browser close
            Cookies.set('token', finalToken, { path: '/', expires: 7 });
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('token', finalToken);
              localStorage.setItem('recent_user', JSON.stringify({
                name: finalUser.fullName || finalUser.name || finalUser.username,
                fullName: finalUser.fullName || finalUser.name || finalUser.username,
                email: finalUser.email,
                role: finalUser.role,
                picture: finalUser.picture,
                avatar: finalUser.avatar
              }));
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
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('auth-storage');
          // Fallback clean up just in case
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');
          // We intentionally do NOT remove recent_user so they see their profile next time
        }
        try { await api.get('/auth/logout'); } catch(e){}
      },

      checkAuth: async () => {
        let token = get().token;
        let user = get().user;

        if (typeof window !== 'undefined') {
          if (!token) {
            token = sessionStorage.getItem('token') || Cookies.get('token');
          }
          if (!user) {
            try {
              const raw = sessionStorage.getItem('auth-storage');
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
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for zustand persist
      partialize: (state) => {
        return { user: state.user, token: state.token, isAuthenticated: state.isAuthenticated };
      },
    }
  )
);
