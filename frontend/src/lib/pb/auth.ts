import cookie, { type CookieAttributes } from "js-cookie";
import {
  AUTH_COOKIE_EXPIRATION_DAYS,
  AUTH_COOKIE_KEY,
  IS_DEV,
} from "@/config";
import { usePbClient } from "./client";
import type { SerializeOptions } from "pocketbase";
import type { SignInInfo, SignUpInfo } from "@/types/Auth";
import type { User } from "@/types/User";

const pb = usePbClient();

export async function userLogin(account: SignInInfo) {
  const authData = await pb.collection("users").authWithPassword(
    account.email,
    account.password,
  );

  if (IS_DEV) {
    console.log({ authData });
  }

  cacheAuth();

  return { user: pb.authStore.record as User | null };
}
export async function userLogout() {
  clearCachedAuth();
  // force page reload to clear any local state
  window.location.reload();
}

export async function sendForgotPasswordEmail(email: string) {
  const result = await pb.collection("users").requestPasswordReset(email);
  return { success: result };
}

export async function resetPassword(token: string, password: string) {
  const result = await pb.collection("users").confirmPasswordReset(
    token,
    password,
    password,
  );
  return { success: result };
}

export async function userSignUp(account: SignUpInfo) {
  const createdUser = await pb.collection('users').create({
    name: account.name,
    email: account.email,
    password: account.password,
    passwordConfirm: account.password,
  });
  
  console.log('Created user', createdUser)
  
  // immediately send verification email
  const sent = await pb.collection('users').requestVerification(account.email);

  console.log('Sent user verifiation email', sent)

  // log them in immediately
  // await userLogin(email, password)

  return { success: true };
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
