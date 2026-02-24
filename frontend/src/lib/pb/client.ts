import * as config from "@/config";
import PocketBase from "pocketbase";

/**
 * Pocketbase API client for users to authenticate and request
 */
const pb = new PocketBase(config.API_URL);

export function usePbClient() {
  return pb;
}
