import cookie, { type CookieAttributes } from "js-cookie";
import {
  AUTH_COOKIE_EXPIRATION_DAYS,
  AUTH_COOKIE_KEY,
  IS_DEV,
} from "@/config";
import { getApiError } from "@/lib/pb/errors";
import { cacheUser, clearCachedUser, getCachedUser } from "./user";
import { usePbClient } from "./client";
import type { SerializeOptions } from "pocketbase";

const pb = usePbClient();

export async function userLogin(email: string, password: string) {
  // login user
  try {
    const authData = await pb.collection("users").authWithPassword(
      email,
      password,
    );
    if (IS_DEV) {
      console.log({ authData });
    }
    cacheAuth();
  } catch (apiError: any) {
    throw apiError;
  }

  // cache for later
  try {
    const user = await cacheUser();
    return { user };
  } catch (apiError) {
    return getApiError(apiError);
  }
}
export async function userLogout() {
  clearCachedAuth();
  clearCachedUser();
  return { user: getCachedUser() };
}

export async function sendForgotPasswordEmail(email: string) {
  try {
    const result = await pb.collection("users").requestPasswordReset(email);
    return { success: result };
  } catch (apiError) {
    return getApiError(apiError);
  }
}
export async function resetPassword(token: string, password: string) {
  try {
    const result = await pb.collection("users").confirmPasswordReset(
      token,
      password,
      password,
    );
    return { success: result };
  } catch (apiError) {
    const result = getApiError(apiError);

    // swap error message
    // if (result.error.extensions?.code === 'FORBIDDEN') {
    //   result.error.message = 'Token is invalid.'
    // }

    return getApiError(apiError);
  }
}
export async function userSignUp(email: string, password: string) {
  try {
    await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
    });
    // immediately send verification email
    await pb.collection("users").requestVerification(email);

    // log them in immediately
    // await userLogin(email, password)

    return { success: true };
  } catch (error: any) {
    return getApiError(error);
  }
}

/**
 * Load auth from cookie, try to refresh token, cache updated auth
 */
export async function refreshAuth() {
  try {
    pb.authStore.loadFromCookie(cookie.get(AUTH_COOKIE_KEY) || "");

    if (pb.authStore.isValid) {
      await pb.collection("users").authRefresh();
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
  cookie.set(AUTH_COOKIE_KEY, cookieValue, cookieOptions);
}

/**
 * Clear the auth cookie
 */
export function clearCachedAuth() {
  pb.authStore.clear();
  cookie.remove(AUTH_COOKIE_KEY);
}
