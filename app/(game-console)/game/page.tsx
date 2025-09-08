'use client';

import { GameConsole } from '@/components/game-console';
import {
  useAuthLoading,
  useIsAuthenticated,
  useIsHydrated,
} from '@/lib/stores/auth-store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Game() {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const isHydrated = useIsHydrated();
  const router = useRouter();

  useEffect(() => {
    // Only make routing decisions after store is hydrated and auth check is complete
    if (isHydrated && !isLoading) {
      if (!isAuthenticated) {
        router.push('/sign-in');
      }
    }
  }, [isAuthenticated, isLoading, isHydrated, router]);

  if (!isHydrated || isLoading) {
    return (
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return <GameConsole />;
}
