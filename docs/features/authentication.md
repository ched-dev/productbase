# Authentication

This file is intended to help AI Coding Agents know important information about the **authentication** feature in ProductBase.

## Important Notes

ProductBase uses **PocketBase** as its auth provider. Authentication is email/password by default, with cookie-based session management on the frontend. Additional auth methods (OAuth, OTP, MFA, magic links) can be enabled through the PocketBase admin panel — see [PocketBase Admin Panel](../frontend/pocketbase-admin-panel.md).

## Auth Methods

| Method | Status | Configuration |
|--------|--------|---------------|
| Email / Password | Active | Default |
| OAuth (social login) | Available | Enable in PocketBase admin panel |
| OTP | Available | Enable in PocketBase admin panel |
| MFA | Available | Enable in PocketBase admin panel |
| Magic Links | Available | Enable in PocketBase admin panel |

## User Flows

### Sign Up

1. User submits name, email, and password via `AuthGate` component
2. `useAuth().signup()` calls PocketBase signup method
3. PocketBase creates the user record
4. Backend hook `handleRegistration()` validates: registrations enabled, no duplicate email, user not already authenticated
5. Verification email sent automatically via PocketBase request verification action
6. User is redirected to the login form (not auto-logged-in)

### Sign In

1. User submits email and password via `AuthGate` component
2. `useAuth().login()` authenticates via PocketBase
3. Auth token cached to cookie using `config.AUTH_COOKIE_KEY` and `config.AUTH_COOKIE_EXPIRATION_DAYS`
4. `AuthGate` component renders its children, revealing the app routes

### Sign Out

1. `useAuth().logout()` calls `userLogout()`
2. Auth cookie cleared via `clearCachedAuth()` (clears `pb.authStore` and removes cookie)
3. React state set to `null`, causing `AuthGate` to render the login form

### Password Reset

1. `sendForgotPasswordEmail(email)` calls `pb.collection('users').requestPasswordReset(email)`
2. User receives reset email with token link
3. `resetPassword(token, password)` calls `pb.collection('users').confirmPasswordReset()`

### Token Refresh

1. On app load, `useAuth()` calls `refreshAuth()`
2. Auth store loaded from cookie using `config.AUTH_COOKIE_KEY`
3. If valid, token refreshed and re-cached
4. If invalid or expired, auth and user cookies are cleared

## Session Management

| Cookie | Key | Expiration | Purpose |
|--------|-----|------------|---------|
| `productbase_auth` | `AUTH_COOKIE_KEY` | 1 day | Auth token and user metadata |
| `productbase_su_auth` | `AUTH_SUPERUSER_COOKIE_KEY` | 1 day | Superuser authentication |

- Cookies use `sameSite: "strict"`
- Token expiration is configurable via `AUTH_COOKIE_EXPIRATION_DAYS` in `frontend/src/config.ts`

## Route Protection

**Frontend:** The `AuthGate` component in `Router.tsx` wraps all routes and checks user state via `useAuth()`. If no authenticated user exists, it renders the login/signup form — no other components (Layout, TitleBar, pages) are rendered. When authenticated, `AuthGate` renders its children, allowing the app routes to load.

**Backend:** PocketBase API rules enforce auth on each collection. For example, organizations require `@request.auth.id != ""` for creation and ownership checks for viewing/editing. Backend Hooks provide additional validation with descriptive error messages.

**Dev Mode:** When the `config.IS_DEV` is true, you can simply click login and leave the form empty to use the `config.MOCK_ACCOUNT` data loaded from environment variables.

## Registration Controls

- **Toggle registrations:** The `_productbase_settings.allow_user_registrations` flag controls whether new signups are allowed (enforced by hook in `pocketbase/pb_hooks/lib/hooks/users.js`)
- **Duplicate email check:** Hook validates email uniqueness before PocketBase's built-in check, providing a clearer error message
- **Already authenticated:** Logged-in users cannot create new accounts (hook enforced)
- **Superuser bypass:** Superusers can create users regardless of registration settings

## Frontend Routes

| Page | Path |
|------|------|
| Login / Sign Up | Any path in app other than `/` (rendered by `AuthGate` when unauthenticated) |

The login and signup forms share the same screen with a mode toggle.

## See Also

- [Users](./users.md) — Users of the application stored in PocketBase
- [Organizations](./organizations.md) — Organization management
