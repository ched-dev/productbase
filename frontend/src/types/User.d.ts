/**
 * The User object cached to a cookie
 */
export type CachedUser = Pick<User, "name" | "avatar">;

/**
 * The full User object from the database
 */
export type User = {
  id: string; // "4t2ndxzae6w8j99"
  name: string; // "dev user"
  avatar: string; // "somefile.jpg"
  verified: boolean;
  // emailVisibility: boolean;
  // collectionId: "_pb_users_auth_"
  // collectionName: "users"
  created: string; // "2026-02-25 01:12:18.812Z"
  updated: string; // "2026-02-25 01:12:18.812Z"
};
