import {
  IS_BROWSER,
  USER_COOKIE_EXPIRATION_DAYS,
  USER_COOKIE_KEY,
  USER_FIELDS,
} from "@/config";
import cookie from "js-cookie";
import isEmpty from "lodash/isEmpty";
import type { CachedUser } from "@/types";
import { usePbClient } from "./client";
import { clearCachedAuth, refreshAuth } from "./auth";
import pick from "lodash/pick";

const pb = usePbClient();

export function getCachedUser(cookieValue?: string): CachedUser | null {
  if (!cookieValue) {
    cookieValue = cookie.get(USER_COOKIE_KEY);
  }

  const user: CachedUser = JSON.parse(cookieValue || "{}");
  return isEmpty(user) ? null : user;
}
export function clearCachedUser() {
  cookie.remove(USER_COOKIE_KEY);
}
export async function cacheUser(): Promise<CachedUser | null> {
  try {
    await refreshAuth();
  } catch (e) {
    // refresh failed - expired token, non-existent, etc.
    clearCachedAuth();
    clearCachedUser();

    // force reload to clear cached user
    if (IS_BROWSER) {
      window.location.reload();
    }

    return null;
  }

  const loggedInUser = pick(pb.authStore.record, USER_FIELDS);

  cookie.set(USER_COOKIE_KEY, JSON.stringify(loggedInUser), {
    sameSite: "strict",
    expires: new Date(
      Date.now() + (1000 * 60 * 60 * 24 * USER_COOKIE_EXPIRATION_DAYS),
    ),
  });

  return loggedInUser as CachedUser;
}
