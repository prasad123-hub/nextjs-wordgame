'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Check if user is already authenticated on app load
    // This will automatically handle token refresh if needed
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
}
