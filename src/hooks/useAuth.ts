import { useAuthStore } from '@/store/authStore';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const router = useRouter();
  const store = useAuthStore();

  const requireAuth = useCallback((redirectTo: string = '/') => {
    if (!store.isAuthenticated) {
      router.push(redirectTo);
      return false;
    }
    return true;
  }, [store.isAuthenticated, router]);

  const requireRole = useCallback((
    role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN', 
    redirectTo: string = '/unauthorized'
  ) => {
    if (!store.isAuthenticated || store.user?.role !== role) {
      router.push(redirectTo);
      return false;
    }
    return true;
  }, [store.isAuthenticated, store.user?.role, router]);

  const hasRole = useCallback((role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN') => {
    return store.user?.role === role;
  }, [store.user?.role]);

  const isAdmin = useCallback(() => {
    return store.user?.role === 'ADMIN';
  }, [store.user?.role]);

  const isBusinessOwner = useCallback(() => {
    return store.user?.role === 'BUSINESS_OWNER' || store.user?.role === 'ADMIN';
  }, [store.user?.role]);

  return {
    ...store,
    requireAuth,
    requireRole,
    hasRole,
    isAdmin,
    isBusinessOwner,
  };
};