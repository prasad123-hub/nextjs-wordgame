/**
 * Utility functions for cookie configuration
 * Centralizes cookie settings for better EC2 deployment compatibility
 */

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}

/**
 * Get cookie configuration based on environment
 * Handles EC2 deployment scenarios better
 */
export function getCookieConfig(maxAge: number): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const isSecure = isProduction && process.env.NODE_ENV !== 'development';
  
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isProduction ? 'lax' : 'strict',
    maxAge,
    path: '/',
  };
}

/**
 * Get cookie configuration for clearing cookies
 */
export function getClearCookieConfig(): CookieOptions {
  return getCookieConfig(0);
}

/**
 * Check if we're in a production environment that requires HTTPS
 */
export function isSecureEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.NODE_ENV !== 'development';
}

/**
 * Get the appropriate sameSite policy based on environment
 */
export function getSameSitePolicy(): 'strict' | 'lax' | 'none' {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? 'lax' : 'strict';
}
