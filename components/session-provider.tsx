'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuthStatus = async () => {
      try {
        setLoading(true);

        // Make a request to verify the current session
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const data = await response.json();
          // User is authenticated, update the store
          setUser(data.user);
        } else {
          // User is not authenticated, clear the store
          setUser(null);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        // On error, clear the store
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
