import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (user: User) => void;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<boolean>;
  checkAuth: () => Promise<void>;
  setHydrated: (hydrated: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isHydrated: false,

      // Actions
      setUser: user => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },

      setLoading: loading => {
        set({ isLoading: loading });
      },

      setError: error => {
        set({ error });
      },

      login: user => {
        set({
          user,
          isAuthenticated: true,
          error: null,
          isLoading: false,
        });
      },

      logout: async () => {
        try {
          // Call logout API to clear server-side session
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Logout API call failed:', error);
        } finally {
          // Clear local state regardless of API call result
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            isLoading: false,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      refreshToken: async () => {
        try {
          console.log('refreshToken: Attempting to refresh token...');
          const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });

          console.log(`refreshToken: Response status = ${response.status}`);
          console.log(
            `refreshToken: Response headers =`,
            Object.fromEntries(response.headers.entries())
          );

          if (response.ok) {
            const data = await response.json();
            console.log('refreshToken: Token refresh successful');
            set({
              user: data.user,
              isAuthenticated: true,
              error: null,
            });
            return true;
          } else {
            const errorText = await response.text();
            console.error(
              `refreshToken: Refresh failed with status ${response.status}:`,
              errorText
            );
            // Refresh failed, logout user
            await useAuthStore.getState().logout();
            return false;
          }
        } catch (error) {
          console.error('refreshToken: Token refresh failed:', error);
          await useAuthStore.getState().logout();
          return false;
        }
      },

      checkAuth: async () => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch('/api/auth/me', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            set({
              user: data.user,
              isAuthenticated: true,
              error: null,
              isLoading: false,
            });
          } else if (response.status === 401) {
            // Token expired, try to refresh
            console.log('Access token expired, attempting refresh...');
            const refreshSuccess = await useAuthStore.getState().refreshToken();
            if (!refreshSuccess) {
              set({
                user: null,
                isAuthenticated: false,
                error: 'Session expired. Please log in again.',
                isLoading: false,
              });
            }
          } else {
            console.error('Auth check failed with status:', response.status);
            set({
              user: null,
              isAuthenticated: false,
              error: 'Authentication failed',
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({
            user: null,
            isAuthenticated: false,
            error: 'Network error. Please check your connection.',
            isLoading: false,
          });
        }
      },

      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
      },
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist user and isAuthenticated, not loading states or errors
      partialize: state => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => state => {
        state?.setHydrated(true);
      },
    }
  )
);

// Selectors for better performance
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () =>
  useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);
export const useIsHydrated = () => useAuthStore(state => state.isHydrated);
