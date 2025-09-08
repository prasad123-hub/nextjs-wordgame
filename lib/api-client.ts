import { useAuthStore } from './stores/auth-store';

/**
 * Enhanced fetch function that automatically handles token refresh on 401 errors
 */
export async function apiClient(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { isAuthenticated, refreshToken } = useAuthStore.getState();

  // Make the initial request
  let response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  // If we get a 401 and user is authenticated, try to refresh
  if (response.status === 401 && isAuthenticated) {
    const refreshSuccess = await refreshToken();

    if (refreshSuccess) {
      // Retry the original request with the new token
      response = await fetch(url, {
        ...options,
        credentials: 'include',
      });
    }
  }

  return response;
}

/**
 * Submit game results to the server
 */
export async function submitGame(gameData: {
  word: string;
  wordLength: number;
  guessedLetters: string[];
  gameStatus: 'won' | 'lost';
  wrongGuesses: number;
  hintsUsed: number;
}) {
  const response = await apiClient('/api/game/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gameData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to submit game');
  }

  return response.json();
}

/**
 * Fetch user game statistics
 */
export async function fetchUserStats() {
  const response = await apiClient('/api/game/stats', {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch user stats');
  }

  return response.json();
}

/**
 * Fetch leaderboard data
 */
export async function fetchLeaderboard() {
  const response = await apiClient('/api/game/leaderboard', {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch leaderboard');
  }

  return response.json();
}

/**
 * Hook to use the API client in React components
 */
export function useApiClient() {
  return apiClient;
}
