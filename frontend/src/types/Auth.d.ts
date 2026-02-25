/**
 * The object used to sign up
 */
export type SignUpInfo = { name: string } & SignInInfo

/**
 * The object used to sign in
 */
export type SignInInfo = {
  email: string;
  password: string;
}