import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService, User } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (token: string, refreshToken: string) => void;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<User>) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      isHydrated: false,

      setHydrated: () => {
        console.log('🔵 Store hydrated');
        set({ isHydrated: true });
      },

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          error: null 
        });
      },
      
      setTokens: (token, refreshToken) => {
        set({ token, refreshToken });
      },

      login: (user, token, refreshToken) => {
        // Add cookie
        if (typeof window !== 'undefined') {
          document.cookie = `auth-token=${token}; path=/; max-age=604800; SameSite=Strict`;
        }
        
        set({ 
          user, 
          token, 
          refreshToken, 
          isAuthenticated: true,
          isLoading: false,
          error: null 
        });
      },
      
      logout: () => {
        // Clear cookie
        if (typeof window !== 'undefined') {
          document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        
        set({ 
          user: null, 
          token: null, 
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null 
        });
      },

      checkAuth: async () => {
        const currentState = get();
        
        console.log('🔍 Checking auth...', {
          isHydrated: currentState.isHydrated,
          hasToken: !!currentState.token,
          isLoading: currentState.isLoading
        });
        
        // Don't check if not hydrated yet
        if (!currentState.isHydrated) {
          console.log('⏳ Not hydrated yet, skipping auth check');
          return;
        }
        
        // If already checking, skip
        if (currentState.isLoading) {
          console.log('⏳ Already checking auth, skipping');
          return;
        }
        
        // If no token, just set as not authenticated
        if (!currentState.token) {
          console.log('❌ No token found, user not authenticated');
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false 
          });
          return;
        }
        
        try {
          console.log('🔄 Verifying token with API...');
          set({ isLoading: true, error: null });
          
          // Verify token by fetching current user
          const response = await authService.getCurrentUser();
          console.log('✅ Token valid, user:', response.data.email);
          
          set({ 
            user: response.data, 
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
          console.error('❌ Auth check failed:', errorMessage);
          
          // Clear invalid tokens
          set({ 
            user: null, 
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage
          });
        }
      },

      clearError: () => set({ error: null }),

      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...updates };
          console.log('📝 Updating user:', updatedUser.email);
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: 'mawjood-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => {
        console.log('💾 Starting hydration...');
        return (state) => {
          console.log('💾 Hydration complete, state:', {
            hasUser: !!state?.user,
            hasToken: !!state?.token,
            isAuthenticated: state?.isAuthenticated
          });
          
          // Mark as hydrated
          state?.setHydrated();
          
          // Auto check auth after hydration
          setTimeout(() => {
            console.log('🔄 Auto-checking auth after hydration...');
            state?.checkAuth();
          }, 100);
        };
      },
    }
  )
);