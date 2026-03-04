# Configuration

App-wide constants and settings are defined in `frontend/src/config.ts`. This file centralizes environment detection, URLs, cookie keys, and dev tooling so they can be imported from a single location. Think of these as feature flags that can only be changed via code.

## App Info

| Constant | Value | Description |
|----------|-------|-------------|
| `VERSION` | `"1.0"` | Frontend template version, displayed in the UI |

## Environment Detection

| Constant | Description |
|----------|-------------|
| `IS_DEV` | `true` when running locally with Vite (`import.meta.env.DEV`) |
| `IS_PROD` | Inverse of `IS_DEV` |
| `IS_BROWSER` | `true` when running in the browser (not SSR) |

These are useful for conditionally enabling dev-only features (e.g. mock accounts) or guarding browser-only code.

## URLs

| Constant | Source | Description |
|----------|--------|-------------|
| `PUBLIC_URL` | `VITE_FRONTEND_URL` env var | The public-facing site URL, used to build absolute links (e.g. in emails) |
| `API_URL` | `VITE_POCKETBASE_API_URL` env var | PocketBase API URL used by the PocketBase client. This will be the same as `PUBLIC_URL` when in production, but different in dev. |

## Dev Mock Account

When `IS_DEV` is `true`, `MOCK_ACCOUNT` is populated from environment variables to pre-fill login forms during local development:

| Field | Env Var | Default |
|-------|---------|---------|
| `name` | `VITE_DEV_MOCK_USER_NAME` | `"dev user"` |
| `email` | `VITE_DEV_MOCK_USER_EMAIL` | `""` |
| `password` | `VITE_DEV_MOCK_USER_PASSWORD` | `""` |

In dev, the login form can be submitted with no values if the `MOCK_ACCOUNT` is present.
In production, all fields default to empty strings and require a value to submit.

## Auth Cookies

| Constant | Value | Description |
|----------|-------|-------------|
| `AUTH_COOKIE_KEY` | `"productbase_auth"` | Cookie name for the user auth token |
| `AUTH_SUPERUSER_COOKIE_KEY` | `"productbase_su_auth"` | Cookie name for the superuser auth token |
| `AUTH_COOKIE_EXPIRATION_DAYS` | `1` | Days before auth cookies expire |

## Related

- [Authentication](../features/authentication.md) — Auth flows and session management
- [Routing](./routing.md) — Frontend route definitions (separate from config URLs)
