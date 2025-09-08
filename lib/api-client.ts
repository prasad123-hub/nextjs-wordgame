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
 * Hook to use the API client in React components
 */
export function useApiClient() {
  return apiClient;
}
