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

      setSession: (user, token) => {
        set({ user, token, isAuthenticated: true, isLoading: false, error: null });
        if (token) {
          Cookies.set('token', token, { path: '/', expires: 7 });
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('token', token);
            localStorage.setItem('token', token);
          }
        }
        if (user && typeof window !== 'undefined') {
          const recentUserObj = {
            _id: user._id,
            name: user.fullName || user.name || user.username,
            fullName: user.fullName || user.name || user.username,
            email: user.email,
            role: user.role,
            picture: user.picture || user.avatar,
            avatar: user.avatar || user.picture
          };
          localStorage.setItem('recent_user', JSON.stringify(recentUserObj));
        }
      },

      login: async (email, password, remember = true, roleLabel = null, otp = null) => {
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
          const res = await api.post('/auth/login', { email: cleanEmail, password, otp });
          if (res && res.success) { if (res.requireOtp) { return { success: true, requireOtp: true }; }
            const finalUser = res.data;
            const finalToken = res.token;
            set({
              user: finalUser,
              token: finalToken,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            // Use session cookie with 7 days expiry
            Cookies.set('token', finalToken, { path: '/', expires: 7 });
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('token', finalToken);
              localStorage.setItem('token', finalToken);
              localStorage.setItem('recent_user', JSON.stringify({
                _id: finalUser._id,
                name: finalUser.fullName || finalUser.name || finalUser.username,
                fullName: finalUser.fullName || finalUser.name || finalUser.username,
                email: finalUser.email,
                role: finalUser.role,
                picture: finalUser.picture || finalUser.avatar,
                avatar: finalUser.avatar || finalUser.picture
              }));
            }
            return { success: true, user: finalUser };
          }
        } catch (error) {
          let errorMsg = error?.response?.data?.message || error?.message || 'Invalid credentials. Please check your details and try again.';
          if (errorMsg === 'Network Error' || errorMsg.includes('Network Error') || errorMsg.includes('ECONNREFUSED')) {
            errorMsg = 'Unable to connect to authentication server. Please check your connection or try again.';
          }
          set({ isLoading: false, error: errorMsg });
          return { success: false, error: errorMsg, message: errorMsg };
        }
      },

      logout: async () => {
        set({ user: null, token: null, isAuthenticated: false });
        Cookies.remove('token');
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('auth-storage');
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
            token = localStorage.getItem('token') || sessionStorage.getItem('token') || Cookies.get('token');
          }
          if (token) {
            try {
              Cookies.set('token', token, { path: '/', expires: 7, sameSite: 'lax' });
              localStorage.setItem('token', token);
            } catch (_) {}
          }
          if (!user) {
            try {
              const rawStorage = localStorage.getItem('auth-storage') || sessionStorage.getItem('auth-storage');
              if (rawStorage) {
                const parsed = JSON.parse(rawStorage);
                if (parsed?.state?.user) user = parsed.state.user;
                if (!token && parsed?.state?.token) token = parsed.state.token;
              }
            } catch (e) {}

            if (!user) {
              try {
                const rawRecent = localStorage.getItem('recent_user');
                if (rawRecent) {
                  user = JSON.parse(rawRecent);
                }
              } catch (e) {}
            }
          }
        }

        if (!token) {
           set({ user: null, isAuthenticated: false, isLoading: false });
           return;
        }

        let resolvedUser = user;
        
        // If we have a user in state, set it immediately for fast UI response
        if (resolvedUser) {
          set({ isAuthenticated: true, user: resolvedUser, token, isLoading: false });
        } else {
          // We have a token but no user, set loading state to true while we fetch
          set({ isAuthenticated: false, token, isLoading: true });
        }

        if (typeof token === 'string' && token.startsWith('mock_')) {
          return;
        }

        try {
           const res = await api.get('/auth/me');
           if (res && res.success && res.data) {
             set({ isAuthenticated: true, user: res.data, isLoading: false });
             if (typeof window !== 'undefined') {
               localStorage.setItem('recent_user', JSON.stringify({
                 _id: res.data._id,
                 name: res.data.fullName || res.data.name || res.data.username,
                 fullName: res.data.fullName || res.data.name || res.data.username,
                 email: res.data.email,
                 role: res.data.role,
                 picture: res.data.picture || res.data.avatar,
                 avatar: res.data.avatar || res.data.picture
               }));
             }
           }
        } catch (error) {
           // If /auth/me fails and we don't have a user, token is likely invalid
           if (!resolvedUser) {
             set({ user: null, token: null, isAuthenticated: false, isLoading: false });
           } else {
             set({ isAuthenticated: true, isLoading: false });
           }
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' && window.localStorage ? window.localStorage : sessionStorage)),
      partialize: (state) => {
        return { user: state.user, token: state.token, isAuthenticated: state.isAuthenticated };
      },
    }
  )
);
