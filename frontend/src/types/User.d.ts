/**
 * The User object cached to a cookie
 */
export type CachedUser = Pick<User, "name" | "avatar">;

/**
 * The full User object from the database
 */
export type User = {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
};
