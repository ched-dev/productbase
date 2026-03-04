import type { SignUpInfo } from "./types/Auth"

/**
 * App Config and Debugging Settings
 */

/**
 * The version of ProductBase frontend template
 */
export const VERSION = `1.0`

/**
 * Is the app running in dev? (locally with vite)
 */
export const IS_DEV = import.meta.env.DEV

/**
 * Is the app running in production?
 */
export const IS_PROD = !IS_DEV

/**
 * Is the app running in the browser?
 */
export const IS_BROWSER = !import.meta.env.SSR

/**
 * Public site URL
 */
export const PUBLIC_URL = import.meta.env.VITE_FRONTEND_URL

/**
 * PocketBase API URL
 */
export const API_URL = import.meta.env.VITE_POCKETBASE_API_URL

/**
 * Used to store authStore data from PB
 */
export const AUTH_COOKIE_KEY = "productbase_auth"

/**
 * Used to store superuser authStore data from PB
 */
export const AUTH_SUPERUSER_COOKIE_KEY = "productbase_su_auth"

/**
 * Number of days before auth cookie expires
 * _Only applies to the auth token_
 */
export const AUTH_COOKIE_EXPIRATION_DAYS = 1

/**
 * Default account info used to login locally. Uses the `DEV_MOCK_USER_*` env values
 * if we are in dev mode.
 */
export const MOCK_ACCOUNT: SignUpInfo = IS_DEV ? {
  name: import.meta.env.VITE_DEV_MOCK_USER_NAME || 'dev user',
  email: import.meta.env.VITE_DEV_MOCK_USER_EMAIL || '',
  password: import.meta.env.VITE_DEV_MOCK_USER_PASSWORD || '',
} : { name: '', email: '', password: '' }

/**
 * Checks that required config values are present and logs errors for any missing ones.
 * Called before the app mounts. Can be called anywhere features require a config value.
 */
export function requiredConfigCheck(configObj: Record<string, unknown>, keys: string[]) {
  const missing = keys.filter(key => configObj[key] === undefined)
  missing.forEach(key => console.error(`[config] Missing required config: ${key}`))
}