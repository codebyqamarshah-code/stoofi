import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';
import Cookies from 'js-cookie';

// Strip heavy multi-megabyte base64 document attachments before writing to localStorage
// so browser storage never throws QuotaExceededError and wipes the session.
const sanitizeUserForStorage = (user) => {
  if (!user || typeof user !== 'object') return user;
  const {
    cnicFront,
    cnicBack,
    characterCertificate,
    experienceLetter,
    ...rest
  } = user;
  return rest;
};

const safeSetLocalStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    // Prune legacy sidebar cache versions if quota exceeded, then retry
    try {
      for (let i = 1; i <= 10; i++) {
        localStorage.removeItem(`stoofi_custom_sidebar_v${i}_Super Admin`);
        localStorage.removeItem(`stoofi_custom_sidebar_v${i}_Admin`);
        localStorage.removeItem(`stoofi_custom_sidebar_v${i}_Teacher`);
        localStorage.removeItem(`stoofi_custom_sidebar_v${i}_Student`);
      }
      localStorage.setItem(key, value);
    } catch (_) {}
  }
};

const decodeJwtFallbackUser = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload && (payload.id || payload._id || payload.role)) {
      return {
        _id: payload.id || payload._id,
        role: payload.role || 'Super Admin',
        email: payload.email || '',
        fullName: payload.fullName || payload.name || payload.role || 'User',
        name: payload.name || payload.fullName || payload.role || 'User',
        canDelete: true,
      };
    }
  } catch (_) {}
  return null;
};

export const useAuth = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setSession: (user, token) => {
        if (user) {
          const userEmail = (user.email || '').toLowerCase();
          user.canDelete = userEmail !== 'pakroyalcollege@gmail.com' && user.canDelete !== false;
        }
        const cleanUser = sanitizeUserForStorage(user);
        set({ user: cleanUser, token, isAuthenticated: true, isLoading: false, error: null });
        if (token) {
          try {
            Cookies.set('token', token, { path: '/', expires: 7, sameSite: 'Lax' });
          } catch (_) {}
          if (typeof document !== 'undefined') {
            try {
              document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
            } catch (_) {}
          }
          if (typeof window !== 'undefined') {
            try { sessionStorage.setItem('token', token); } catch (_) {}
            safeSetLocalStorage('token', token);
          }
        }
        if (cleanUser && typeof window !== 'undefined') {
          const recentUserObj = {
            _id: cleanUser._id,
            name: cleanUser.fullName || cleanUser.name || cleanUser.username,
            fullName: cleanUser.fullName || cleanUser.name || cleanUser.username,
            email: cleanUser.email,
            role: cleanUser.role,
            canDelete: cleanUser.canDelete,
            avatar: cleanUser.avatar || cleanUser.picture
          };
          safeSetLocalStorage('recent_user', JSON.stringify(recentUserObj));
        }
      },

      login: async (email, password, remember = true, roleLabel = null, otp = null) => {
        set({ isLoading: true, error: null });
        const cleanEmail = email?.trim().toLowerCase() || 'super@gmail.com';
        const superEmails = ['super@gmail.com', 'jafferi2008@gmail.com', 'blankslate022@gmail.com', 'pakroyalcollege@gmail.com'];
        
        let role = roleLabel;
        if (!role) {
          if (superEmails.includes(cleanEmail)) {
            role = 'Super Admin';
          } else if (cleanEmail === 'admin@gmail.com' || cleanEmail === 'admin@gamil.com') {
            role = 'Admin';
          } else {
            role = cleanEmail.split('@')[0].toUpperCase();
          }
        }

        try {
          let deviceId = null;
          let deviceName = 'Web Browser';
          if (typeof window !== 'undefined') {
            try {
              deviceId = localStorage.getItem('stoofi_device_id');
              if (!deviceId) {
                deviceId = `dev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;
                safeSetLocalStorage('stoofi_device_id', deviceId);
              }
              const ua = navigator.userAgent;
              let b = ua.includes('Edg') ? 'Edge' : ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : ua.includes('Firefox') ? 'Firefox' : 'Browser';
              let os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'macOS' : ua.includes('Android') ? 'Android' : ua.includes('iPhone') ? 'iOS' : 'OS';
              deviceName = `${b} on ${os}`;
            } catch (_) {}
          }

          const res = await api.post('/auth/login', { email: cleanEmail, password, otp, deviceId, deviceName });
          if (res && res.success) {
            if (res.requireOtp) {
              set({ isLoading: false, error: null });
              return { success: true, requireOtp: true };
            }
            const finalUser = sanitizeUserForStorage(res.data || {});
            const finalToken = res.token;
            const userEmail = (finalUser.email || cleanEmail || '').toLowerCase();
            finalUser.canDelete = userEmail !== 'pakroyalcollege@gmail.com' && finalUser.canDelete !== false;

            set({
              user: finalUser,
              token: finalToken,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            // Persist token across Cookie, sessionStorage, and localStorage safely
            try {
              Cookies.set('token', finalToken, { path: '/', expires: 7, sameSite: 'Lax' });
            } catch (_) {}
            if (typeof document !== 'undefined') {
              try {
                document.cookie = `token=${finalToken}; path=/; max-age=604800; SameSite=Lax`;
              } catch (_) {}
            }
            if (typeof window !== 'undefined') {
              try { sessionStorage.setItem('token', finalToken); } catch (_) {}
              safeSetLocalStorage('token', finalToken);
              safeSetLocalStorage('recent_user', JSON.stringify({
                _id: finalUser._id,
                name: finalUser.fullName || finalUser.name || finalUser.username,
                fullName: finalUser.fullName || finalUser.name || finalUser.username,
                email: finalUser.email,
                role: finalUser.role,
                canDelete: finalUser.canDelete,
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
        try { Cookies.remove('token', { path: '/' }); } catch (_) {}
        if (typeof document !== 'undefined') {
          try {
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          } catch (_) {}
        }
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('auth-storage');
            localStorage.removeItem('token');
            localStorage.removeItem('auth-storage');
          } catch (_) {}
        }
        try { await api.get('/auth/logout'); } catch(e){}
      },

      checkAuth: async () => {
        let token = get().token;
        let user = get().user;

        if (typeof window !== 'undefined') {
          if (!token) {
            try {
              token = localStorage.getItem('token') || sessionStorage.getItem('token') || Cookies.get('token');
            } catch (_) {}
          }
          if (token) {
            try {
              Cookies.set('token', token, { path: '/', expires: 7, sameSite: 'Lax' });
              document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
              safeSetLocalStorage('token', token);
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
          return false;
        }

        let resolvedUser = user ? sanitizeUserForStorage(user) : decodeJwtFallbackUser(token);
        
        // Set user immediately so dashboard protection never sees (!user && !isAuthenticated) while /auth/me loads
        if (resolvedUser) {
          set({ isAuthenticated: true, user: resolvedUser, token, isLoading: false });
        } else {
          set({ isAuthenticated: true, token, isLoading: true });
        }

        if (typeof token === 'string' && token.startsWith('mock_')) {
          get().logout();
          return false;
        }

        try {
          const res = await api.get('/auth/me');
          if (res && res.success && res.data) {
            const cleanData = sanitizeUserForStorage(res.data);
            set({ isAuthenticated: true, user: cleanData, token, isLoading: false });
            if (typeof window !== 'undefined') {
              safeSetLocalStorage('recent_user', JSON.stringify(cleanData));
            }
            return true;
          }
        } catch (error) {
          // Only invalidate if backend explicitly rejected the token with 401 and no fallback user exists
          if (!resolvedUser && error?.response?.status === 401) {
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
            return false;
          } else {
            set({ isAuthenticated: true, user: resolvedUser, token, isLoading: false });
            return true;
          }
        }
        return true;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' && window.localStorage ? window.localStorage : sessionStorage)),
      partialize: (state) => {
        return {
          user: sanitizeUserForStorage(state.user),
          token: state.token,
          isAuthenticated: state.isAuthenticated
        };
      },
    }
  )
);
