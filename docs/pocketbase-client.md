# PocketBase Client Library

This guide documents the PocketBase client library modules in `frontend/src/lib/pb/`.

## Architecture Overview

The PocketBase client is organized into focused modules:

```
lib/pb/
├── client.ts        # Singleton PocketBase instance
├── auth.ts          # User authentication & sessions
├── user.ts          # Cached user data
├── superuser.ts     # Admin authentication
├── data.ts          # Response wrappers (PBData, PBDataList)
└── errors.ts        # Error normalization (ApiError)
```

All modules share the same PocketBase client instance via `usePbClient()`, ensuring consistent auth state.

---

## `client.ts` — Singleton Instance

Creates and exports the global PocketBase client.

### API

```ts
function usePbClient(): PocketBase
```

### Details

- Despite the `use` prefix, this is **not** a React hook — it's just a function that returns a module-level singleton
- All other `lib/pb/` modules call `usePbClient()` at import time to share the same instance
- The client is initialized with `config.API_URL`
- **Important**: The PocketBase client maintains stateful `authStore` — sharing one instance ensures consistent authentication state across the entire app

### Usage

```tsx
import { usePbClient } from '@/lib/pb/client'

const pb = usePbClient()
const user = await pb.collection('users').getOne(userId)
```

---

## `auth.ts` — User Authentication

Handles login, logout, signup, and password reset for the `users` collection.

### API

| Function | Signature | Description |
|----------|-----------|-------------|
| `userLogin` | `(account: SignInInfo) => Promise<{ user: CachedUser }>` | Login with email/password |
| `userLogout` | `() => Promise<{ user: null }>` | Logout and clear session |
| `userSignUp` | `(account: SignUpInfo) => Promise<{ success: true }>` | Signup and send verification email |
| `sendForgotPasswordEmail` | `(email: string) => Promise<{ success: boolean }>` | Send password reset email |
| `resetPassword` | `(token: string, password: string) => Promise<{ success: boolean }>` | Confirm password reset with token |
| `refreshAuth` | `() => Promise<void>` | Load auth from cookie, refresh token, re-cache |
| `cacheAuth` | `() => void` | Write current authStore to auth cookie |
| `clearCachedAuth` | `() => void` | Clear authStore and remove auth cookie |

### Login Flow

```tsx
try {
  const result = await userLogin({ email: 'user@example.com', password: '...' })
  // AuthStore updated, auth cookie written, user cache written
  navigate('/dashboard')
} catch (err) {
  const apiError = getApiError(err)
  setErrorMessage(apiError.message)
}
```

### Session Persistence

- After `userLogin`, two cookies are written:
  - Auth cookie (`AUTH_COOKIE_KEY` from config) — stores auth token
  - User cookie (`USER_COOKIE_KEY` from config) — stores lightweight user data (name, email, avatar, etc.)
- `refreshAuth` loads the auth cookie, refreshes the token with PocketBase, and re-caches both cookies
- On refresh failure, both cookies are cleared and `window.location.reload()` is called to reset the app

### Key Behaviors

- `userSignUp` does **not** auto-login after signup; it only creates the account and sends a verification email. The user must verify their email and then login manually.
- Auth cookie expiration is driven by `AUTH_COOKIE_EXPIRY` (from config)
- Password reset uses PocketBase's built-in token flow: send email → user clicks link with token → call `resetPassword(token, newPassword)`

---

## `user.ts` — Cached User Data

Manages a lightweight, fast-access cache of the current user's data.

### API

| Function | Signature | Description |
|----------|-----------|-------------|
| `getCachedUser` | `(cookieValue?: string) => CachedUser \| null` | Read user from cookie |
| `cacheUser` | `() => Promise<CachedUser \| null>` | Refresh auth and update user cache |
| `clearCachedUser` | `() => void` | Remove user cache cookie |

### Purpose

The `user_preferences` cookie stores only essential user fields (defined in config as `USER_FIELDS`) as JSON:

```json
{ "id": "...", "email": "...", "name": "...", "avatar": "..." }
```

This avoids re-querying the API every time a component needs the current user's name or avatar. The cache is written after every `userLogin` and `refreshAuth`.

### Usage

```tsx
// In a component (the fast path, no API call):
const user = getCachedUser()
if (user) {
  return <span>{user.name}</span>
}

// Or after login (includes refresh for freshness):
const user = await cacheUser()
```

### Key Behaviors

- `cacheUser()` calls `refreshAuth()` first to ensure a valid token before caching
- On `refreshAuth` failure, both auth and user caches are cleared, then `window.location.reload()` resets the app
- Only fields in the `USER_FIELDS` array (from config) are persisted, keeping the cache lightweight

---

## `superuser.ts` — Admin Authentication

Mirrors `auth.ts` but for PocketBase's built-in `_superusers` collection (admin-level access).

### API

| Function | Signature | Description |
|----------|-----------|-------------|
| `superuserLogin` | `(email: string, password: string) => Promise<{ superuser: SuperUserAuthRecord }>` | Login as superuser |
| `superuserLogout` | `() => Promise<{ superuser: null }>` | Logout as superuser |
| `refreshAuth` | `() => Promise<void>` | Refresh superuser token |
| `cacheAuth` | `() => void` | Write superuser auth to cookie |
| `clearCachedAuth` | `() => void` | Clear superuser auth |

### Usage

```tsx
// In an admin-only login form:
try {
  await superuserLogin(email, password)
  navigate('/admin')
} catch (err) {
  // Handle error
}
```

### Key Behaviors

- Uses a separate cookie key (`AUTH_SUPERUSER_COOKIE_KEY`) so superuser and regular user sessions don't interfere
- **Important**: `superuser.ts` is not re-exported from `lib/pb/index.ts` — import directly:
  ```tsx
  import { superuserLogin } from '@/lib/pb/superuser'
  ```
- Mirrors the regular auth API, but targets the `_superusers` collection instead of `users`

---

## `data.ts` — Response Wrappers

Two classes that normalize and enhance PocketBase API responses.

### API

```ts
// Class: single record
export class PBData<T> {
  constructor(record: PBRecord)
  [key]: any  // All fields accessible via index
  sortProperty(key: string, sort: string): PBData<T>  // chainable
}

// Class: paginated list
export class PBDataList<T> {
  constructor(response: ListResponse)
  items: T[]
  first: T
  last: T
  getPage(): number  // 1-based
  getPerPage(): number
  getTotalPages(): number
  getTotalItems(): number
  hasNextPage: boolean
  hasPrevPage: boolean
  sort(sortStr: string): PBDataList<T>  // chainable
}
```

### Usage

```tsx
// TanStack Query hooks return these automatically
const feedback = useUserFeedbackCollection()
feedback.list()

// Later:
const items = feedback.data.items  // PBData[] or undefined
const totalCount = feedback.data.getTotalItems()

// Sorting is chainable and available on records too:
feedback.data.sort('-created,id')
record.sortProperty('feedback_actions', '-created')
```

### Key Behaviors

#### Expand Flattening

PocketBase returns relations nested under an `expand` key:

```json
{
  "id": "rec1",
  "user": "user1",
  "expand": {
    "user": { "id": "user1", "email": "..." }
  }
}
```

Both `PBData` and `PBDataList` flatten these automatically:

```tsx
const record = new PBData(pbResponse)
record.user  // Now the expanded user object, not just the ID
```

#### Back-Relation Aliasing

PocketBase uses `_via_` naming for back-relations:

```json
{
  "id": "user1",
  "expand": {
    "user_feedback_via_user": [ /* all feedback records for this user */ ]
  }
}
```

The wrapper rewrites this to a shorter name:

```tsx
const record = new PBData(pbResponse)
record.user_feedback  // Automatically aliased from user_feedback_via_user
```

#### Sort Syntax

Sorting uses PocketBase's syntax and works on array properties:

```tsx
// Sort feedback items by created date (descending), then ID (ascending)
feedback.data.sort('-created,id')

// Or call sortProperty on a single record:
record.sortProperty('feedback_actions', '-created')
```

---

## `errors.ts` — Error Normalization

Normalizes PocketBase errors into a consistent, typesafe structure.

### API

```ts
export class ApiError {
  name: 'ApiError'
  message: string
  status: number
  validationData: Record<string, ValidationErrorData>

  hasValidationErrors(): boolean
  hasValidationError(fieldName: string): boolean
  validationErrors(): Record<string, ValidationErrorData>
  validationError(fieldName: string): ValidationErrorData | undefined
}

export function getApiError(
  error: unknown,
  remapErrors?: Record<string, string>
): ApiError
```

### Validation Error Shape

```ts
interface ValidationErrorData {
  code: string    // e.g., 'required', 'invalid_email'
  message: string // e.g., 'Please fill out this field'
}
```

### Usage

```tsx
try {
  await collection.create(formData)
} catch (err) {
  const apiError = getApiError(err)

  if (apiError.hasValidationError('email')) {
    const emailErr = apiError.validationError('email')
    console.log(emailErr.code)      // 'invalid_email'
    console.log(emailErr.message)   // 'Invalid email address'
  }

  // Or check all validation errors at once
  if (apiError.hasValidationErrors()) {
    Object.entries(apiError.validationErrors()).forEach(([field, err]) => {
      console.log(`${field}: ${err.message}`)
    })
  }
}
```

### Key Behaviors

- Accepts both `ClientResponseError` (from the PocketBase SDK) and plain objects with `{ message, status, data }`
- Validation errors are flattened to a `Record<fieldName, { code, message }>`
- Built-in remap: `'Failed to create record.'` is always remapped to `'Invalid Data.'`
- Custom remaps can be passed as the second argument:
  ```tsx
  const apiError = getApiError(err, {
    'Invalid Data.': 'Please check your input',
  })
  ```

---

## Integration with Query Hooks

The query hooks (`usePocketbaseCollection`) use these modules internally:

```tsx
// lib/pb/data.ts normalizes responses
const response = await pb.collection(name).getList(...)
const wrappedData = new PBDataList(response)

// lib/pb/errors.ts normalizes errors
try {
  await pb.collection(name).create(data)
} catch (err) {
  throw new ApiError(err)  // Internal to the hook
}
```

See [TanStack Query Hooks](./tanstack-query-hooks.md) for the consumer-facing API.

---

## See Also

- [Auth in AGENTS.md](../AGENTS.md#important-notes) — config variables for cookie keys and expiry
- [Error Handling](./error-handling.md) — full error handling patterns
- [Querying](./querying.md) — backend patterns that complement these client utilities
