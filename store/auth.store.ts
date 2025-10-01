import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User, LoginCredentials, RegisterCredentials, ChangePasswordData, AuthResponse } from '@/types';
import { AuthService } from '@/services';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  getProfile: () => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // Login action
        login: async (credentials: LoginCredentials) => {
          try {
            set({ isLoading: true, error: null });

            const response: AuthResponse = await AuthService.login(credentials);

            if (response.success && response.data) {
              set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            }
          } catch (error: any) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error.message || 'Login failed',
            });
            throw error;
          }
        },

        // Register action
        register: async (credentials: RegisterCredentials) => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await AuthService.register(credentials);
            
            if (response.success && response.data) {
              set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            }
          } catch (error: any) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error.message || 'Registration failed',
            });
            throw error;
          }
        },

        // Logout action
        logout: async () => {
          try {
            set({ isLoading: true, error: null });
            
            await AuthService.logout();
            
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            // Clear state even if logout request fails
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        },

        // Get profile action
        getProfile: async () => {
          try {
            set({ isLoading: true, error: null });
            
            const response = await AuthService.getProfile();
            
            if (response.success && response.data) {
              set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
            }
          } catch (error: any) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error.message || 'Failed to get profile',
            });
            
            // Clear auth if profile fetch fails (token might be invalid)
            AuthService.clearAuth();
          }
        },

        // Change password action
        changePassword: async (data: ChangePasswordData) => {
          try {
            set({ isLoading: true, error: null });
            
            await AuthService.changePassword(data);
            
            set({
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            set({
              isLoading: false,
              error: error.message || 'Failed to change password',
            });
            throw error;
          }
        },

        // Clear error action
        clearError: () => {
          set({ error: null });
        },

        // Set loading action
        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        // Check authentication status
        checkAuth: () => {
          const isAuth = AuthService.isAuthenticated();
          const currentState = get();
          
          if (isAuth && !currentState.user) {
            
            get().getProfile();
          } else if (!isAuth && currentState.isAuthenticated) {
            // No token but state shows authenticated, clear state
            set({
              user: null,
              isAuthenticated: false,
              error: null,
            });
          } else {
            set({ isAuthenticated: isAuth });
          }
        },

        // Clear auth state
        clearAuth: () => {
          AuthService.clearAuth();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);
