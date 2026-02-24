import cookie, { type CookieAttributes } from "js-cookie";
import {
  API_URL,
  AUTH_COOKIE_EXPIRATION_DAYS,
  AUTH_SUPERUSER_COOKIE_KEY,
} from "@/config";
import { getApiError } from "@/lib/pb/errors";
import { usePbClient } from "./client";
import type { SerializeOptions } from "pocketbase";
import type { RecordAuthResponse } from "pocketbase";

export type Superuser = {
  email: string;
}
export type SuperUserAuthRecord = RecordAuthResponse<Superuser>

const pb = usePbClient();

export async function superuserLogin(email: string, password: string) {
  // login user
  try {
    const authData: SuperUserAuthRecord = await pb.collection("_superusers").authWithPassword(
      email,
      password,
    );
    console.log('authData', authData);
    cacheAuth();
    return { superuser: authData }
  } catch (apiError: any) {
    throw apiError;
  }
}
export async function superuserLogout() {
  clearCachedAuth();
  return { superuser: null };
}

/**
 * Load auth from cookie, try to refresh token, cache updated auth
 */
export async function refreshAuth() {
  try {
    pb.authStore.loadFromCookie(cookie.get(AUTH_SUPERUSER_COOKIE_KEY) || "");

    if (pb.authStore.isValid) {
      await pb.collection("_superusers").authRefresh();
      cacheAuth();
    } else {
      clearCachedAuth();
    }
  } catch (e) {
    console.log(e);
    clearCachedAuth();
  }
}

/**
 * Cache the current auth to a cookie
 */
export function cacheAuth() {
  const cookieOptions: CookieAttributes = {
    sameSite: "strict",
    expires: new Date(
      Date.now() + (1000 * 60 * 60 * 24 * AUTH_COOKIE_EXPIRATION_DAYS),
    ),
  };
  const cookieValue = pb.authStore.exportToCookie(
    cookieOptions as SerializeOptions,
  );
  cookie.set(AUTH_SUPERUSER_COOKIE_KEY, cookieValue, cookieOptions);
  superuserStore.set(pb.authStore.record as unknown as Superuser);
}

/**
 * Clear the auth cookie
 */
export function clearCachedAuth() {
  pb.authStore.clear();
  cookie.remove(AUTH_SUPERUSER_COOKIE_KEY);
}
