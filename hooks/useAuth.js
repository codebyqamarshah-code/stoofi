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
        
        // Mock API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Hardcoded credentials requested by user
        if ((email === 'admin@gmail.com' || email === 'admin@gmail') && password === 'school@123') {
          const mockUser = {
            id: 'admin_123',
            name: 'Admin',
            email: 'admin@gmail.com',
            role: 'admin'
          };
          const mockToken = 'mock_jwt_token_admin_123';
          
          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });
          
          Cookies.set('token', mockToken, { expires: 1 });
          return { success: true };
        } else {
          set({
            error: 'Invalid email or password',
            isLoading: false,
          });
          return { success: false, error: 'Invalid email or password' };
        }
      },

      logout: async () => {
        set({ user: null, token: null, isAuthenticated: false });
        Cookies.remove('token');
      },

      checkAuth: async () => {
        const { token } = get();
        // If there's a token in state/storage, just assume they are valid since this is a mock frontend
        if (token === 'mock_jwt_token_admin_123') {
           set({ 
             isAuthenticated: true,
             user: {
                id: 'admin_123',
                name: 'Admin',
                email: 'admin@gmail.com',
                role: 'admin'
             }
           });
        } else {
           set({ user: null, token: null, isAuthenticated: false });
           Cookies.remove('token');
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
