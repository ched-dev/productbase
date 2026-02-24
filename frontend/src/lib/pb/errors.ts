import isObject from "lodash/isObject";
import { ClientResponseError } from "pocketbase";

export type APIErrorResult = { error: string };
/**
 * Get an error from the Pocketbase API response
 */
export function getApiError(error: unknown): APIErrorResult {
  const apiError = isObject(error) && error instanceof ClientResponseError
    ? error as ClientResponseError
    : undefined;
  if (apiError) {
    return {
      error: apiError?.message,
    };
  }

  // can't parse the error
  return {
    error: "An unknown error occurred.",
  };
}
