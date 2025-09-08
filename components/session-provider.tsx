'use client';

import { useEffect } from 'react';
import { useAuthStore, useIsHydrated } from '@/lib/stores/auth-store';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();
  const isHydrated = useIsHydrated();

  useEffect(() => {
    // Only check auth after the store has been hydrated from localStorage
    if (isHydrated) {
      checkAuth();
    }
  }, [checkAuth, isHydrated]);

  return <>{children}</>;
}
