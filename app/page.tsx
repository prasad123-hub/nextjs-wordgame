'use client';

import { useIsAuthenticated, useAuthLoading } from '@/lib/stores/auth-store';
import { useRouter } from 'next/navigation';

export default function Home() {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const router = useRouter();
  if (isLoading) {
    return (
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/sign-in');
  } else {
    router.push('/game');
  }

  return null;
}
