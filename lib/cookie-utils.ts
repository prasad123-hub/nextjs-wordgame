/**
 * Utility functions for cookie configuration
 * Centralizes cookie settings for better EC2 deployment compatibility
 */

export interface CookieOptions {
  maxAge: number;
  path: string;
}

/**
 * Get cookie configuration based on environment
 * Handles EC2 deployment scenarios better
 */
export function getCookieConfig(maxAge: number): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  // const isSecure = isProduction;

  return {
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
  return process.env.NODE_ENV === 'production';
}

/**
 * Get the appropriate sameSite policy based on environment
 */
export function getSameSitePolicy(): 'strict' | 'lax' | 'none' {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? 'lax' : 'strict';
}

/**
 * Get cookie configuration with domain support
 */
export function getCookieConfigWithDomain(
  maxAge: number,
  domain?: string
): CookieOptions {
  const config = getCookieConfig(maxAge);
  return config;
}
