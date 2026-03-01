# Zustand Stores

This guide documents the global state stores in `frontend/src/stores/` using Zustand and custom patterns.

## `AppStore` — Loading State

A simple Zustand store for app-wide bootstrap state.

### API

```ts
// Hook (Zustand convention)
function useAppStore(): {
  loaded: boolean
  setLoaded: (loaded: boolean) => void
}

// Direct access (outside React)
useAppStore.getState().setLoaded(true)
```

### Usage

```tsx
// In a component
function App() {
  const { loaded } = useAppStore()
  return loaded ? <MainUI /> : <SplashScreen />
}

// After async initialization (e.g., auth check)
async function bootstrap() {
  await refreshAuth()  // From lib/pb/auth.ts
  useAppStore.getState().setLoaded(true)
}
```

### Purpose

`loaded` is a boolean flag that gates rendering of the main UI until async initialization is complete. This ensures:

- Auth token is validated before showing the app
- User data is cached before components try to access it
- Prevents flickering or race conditions during startup

### Typical Bootstrap Sequence

1. App mounts
2. Call `refreshAuth()` to restore session from cookie
3. Call `cacheUser()` to load user data
4. Call `useAppStore.getState().setLoaded(true)`
5. Main UI renders

---

## `UrlStore` — URL Parameter State

A non-Zustand singleton store for managing complex URL query parameters with dot-notation support.

### API

```ts
// Hook (not a Zustand hook, just a convention)
function useUrlStore(): {
  // State
  currentValue: string

  // Checks
  hasValue(): boolean
  hasValueChanged(): boolean

  // Sync from URL
  setValueFromUrl(): void
  syncChangesFromUrl(): void

  // Builders
  createUrlState(data: Record, withQuestion?: boolean): string

  // Getters
  getKeyValues(): Record<string, string>
  get(key?: string): ParsedQs | undefined

  // Setters
  set(newValue: Record<string, unknown>): void
  add(key: string, value: string): void
  remove(key: string, onEmpty?: () => boolean): void
  clear(): void

  // Navigation
  navigate(path: string, data: Record<string, unknown>): void
}
```

### Usage

```tsx
// Reading URL parameters
const store = useUrlStore()
const filters = store.get('filters')  // { exif: { cameraMake: 'Canon' } }

// Writing to URL
store.set({ filters: { exif: { cameraMake: 'Canon' } } })
// URL becomes: ?filters.exif.cameraMake=Canon

// Removing a parameter
store.remove('filters')

// Navigating with parameters
store.navigate('/gallery', { filters: { tag: 'beach' } })
```

### Key Differences from `useQueryParam`

`UrlStore` and `useQueryParam` are **two separate URL systems** that coexist:

| Aspect | `UrlStore` | `useQueryParam` |
|--------|-----------|-----------------|
| Library | `qs` | `URLSearchParams` / JSON encoding |
| Nesting | Dot-notation (e.g., `filter.exif.cameraMake`) | JSON-encoded single param (e.g., `query={...}`) |
| React integration | Imperative singleton | React hook with state setter |
| When to use | Complex nested state | Simple, flat, serializable objects |

Both can coexist in the same app. `useQueryParam` is preferred for new code (more React-idiomatic), but `UrlStore` is used where dot-notation is beneficial.

### Behavior

- **`syncChangesFromUrl()`** checks if the URL has changed externally (e.g., user clicked back/forward) and updates the internal cache
  - Includes a `console.log` for debug tracking (dev artifact)
- **`remove(key, onEmpty?)`** can be cancelled by returning `false` from the `onEmpty` callback; useful for preventing the store from becoming empty
- **`createUrlState(data, withQuestion?)`** generates a URL query string with optional leading `?`
- Direct state mutation: modifications via `set()`, `add()`, `remove()` immediately navigate the URL via `lib/navigate.ts`

---

## Two URL Systems Explained

ProductBase uses two complementary URL state systems:

### System 1: `useQueryParam` (React hooks, JSON-encoded)

```tsx
const [filter, setFilter] = useQueryParam<QueryFilter>('query', { tags: [] })
// URL: ?query=%7B%22tags%22%3A%5B%5D%7D
```

**When to use:**
- Simple, flat data structures
- Data that's naturally serializable to JSON
- Integration with React components and hooks
- Filter/search parameters that are read frequently

**Example:** The `query` filter in list views uses this system.

### System 2: `UrlStore` (Imperative singleton, dot-notation)

```tsx
store.set({ filters: { exif: { cameraMake: 'Canon' } } })
// URL: ?filters.exif.cameraMake=Canon
```

**When to use:**
- Complex, deeply nested state
- State that survives page refreshes and backward compatibility is important
- Imperative navigation from outside React (e.g., from a query hook after a mutation)
- State where dot-notation is more readable than JSON

**Example:** Gallery filters with nested EXIF metadata use this system.

### Mixing Both Systems

The two systems can coexist in the URL:

```
?query=%7B%22tags%22%3A%5B%22nature%5D%7D&filters.exif.cameraMake=Canon&viewingId=abc
```

Each system manages its own parameters and doesn't interfere with the other.

---

## Programmatic Navigation

Both stores support imperative navigation — calling navigation functions from outside React components.

### Using `lib/navigate.ts`

```tsx
import { navigate } from '@/lib/navigate'

// After a mutation in a query hook
await collection.create(data)
navigate('/feedback/create/success', { replace: true })
```

This is the primary way to navigate after mutations without coupling query hooks to React components.

### Using `UrlStore.navigate`

```tsx
const store = useUrlStore()
store.navigate('/gallery', { filters: { tag: 'landscape' } })
```

This is equivalent to `navigate` but also handles URL parameter encoding via the store.

---

## Integration with Bootstrap

Both stores are initialized during app startup:

```tsx
// Pseudo-bootstrap sequence
useAppStore.getState().setLoaded(false)

await refreshAuth()
await cacheUser()

useUrlStore().setValueFromUrl()  // Restore URL state on load

useAppStore.getState().setLoaded(true)  // Show app
```

---

## See Also

- [Custom Hooks](./custom-hooks.md) — `useQueryParam` and `useBuildQueryUrl` for the alternative URL system
- [State Management](./state-management.md) — when to use stores vs React state vs TanStack Query
- [Routing](./routing.md) — how programmatic navigation integrates with React Router
