import type { CachedUser } from "./types";

/**
 * App Config and Debugging Settings
 */

/**
 * The version of ProductBase
 */
export const VERSION = `1.0`

/**
 * Is the app running in dev? (locally with vite)
 */
export const IS_DEV = import.meta.env.DEV

/**
 * Is the app running in production?
 */
export const IS_PROD = !IS_DEV;

/**
 * Is the app running in the browser?
 */
export const IS_BROWSER = !import.meta.env.SSR;

/**
 * Fallback for PUBLIC_FRONTEND_URL
 */
export const FALLBACK_PUBLIC_FRONTEND_URL = "https://productbase.ched.dev";
/**
 * Public site URL
 */
export const PUBLIC_URL = import.meta.env.VITE_FRONTEND_URL || FALLBACK_PUBLIC_FRONTEND_URL;

/**
 * Default account info used to login locally
 */
export const MOCK_ACCOUNT = IS_DEV ? {
  email: 'fake@gmail.com',
  password: 'password',
} : { email: '', password: '' }

/**
 * URL of reset password page
 */
export const USER_RESET_PASSWORD_URL = PUBLIC_URL + "/reset-password";

/**
 * URL of accept invite page
 */
export const USER_ACCEPT_INVITE_URL = PUBLIC_URL + "/accept-invite";

/**
 * User fields to save to cache
 */
export const USER_FIELDS: (keyof CachedUser)[] = ["name", "avatar"];

/**
 * Used to store UI displayed user info (USER_FIELDS)
 */
export const USER_COOKIE_KEY = "productbase_user";

/**
 * Number of days before user cookie expires
 * _Only applies to the user info, not tokens_
 */
export const USER_COOKIE_EXPIRATION_DAYS = 7;

/**
 * Used to store authStore data from PB
 */
export const AUTH_COOKIE_KEY = "productbase_auth";

/**
 * Used to store superuser authStore data from PB
 */
export const AUTH_SUPERUSER_COOKIE_KEY = "productbase_su_auth";

/**
 * Number of days before auth cookie expires
 * _Only applies to the auth token_
 */
export const AUTH_COOKIE_EXPIRATION_DAYS = 1;

/**
 * PB API URL
 */
export const API_URL = import.meta.env.VITE_PB_API_URL;