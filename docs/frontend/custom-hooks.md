# Custom React Hooks

This guide documents the custom React hooks in `frontend/src/hooks/` that provide common UI patterns and state management utilities.

## `useFormState`

Manages the lifecycle of an HTML form submission, tracking pending/submitted/success/error states.

### API

```ts
useFormState(options?: {
  onSuccess?: () => void
  onError?: (err?: unknown) => void
  onReset?: () => void
}): {
  formRef: React.RefObject<HTMLFormElement | null>
  submitted: boolean
  success: boolean
  apiError: ApiError | null
  handleSubmit: (fn: (formData: FormData) => Promise<unknown>) => (e: React.FormEvent<HTMLFormElement>) => Promise<void>
  reset: () => void
}
```

### Usage

```tsx
const { formRef, submitted, success, apiError, handleSubmit, reset } = useFormState({
  onSuccess: () => toast('Saved!'),
  onError: (err) => console.error(err),
})

const onSubmit = async (formData: FormData) => {
  // Handle form submission
}

<form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
  {/* form fields */}
</form>
```

### Behavior

- `submitted` becomes `true` after the first submit attempt
- `success` becomes `true` only after a successful async operation
- The async handler receives a `FormData` object containing all form field values
- If the async handler returns `false`, submission is silently treated as a validation failure (no `onSuccess` or `onError` called)
- `reset()` clears all state and calls `form.reset()` on the DOM element
- Callbacks are stored in refs, allowing `handleSubmit` to remain stable across renders without dependency array issues

### Integrating with `FieldError` and mutations

```tsx
const { formRef, handleSubmit, apiError } = useFormState({
  onSuccess: reset,
})

const collection = useUserFeedbackCollection()

const onSubmit = async (data: FormData) => {
  await collection.create(data)
}

<form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
  <Textarea name="message" required />
  <FieldError name="message" apiError={apiError} />
  <SaveButton submit loading={collection.loading} />
</form>
```

## `useListView`

Manages a virtualized list view with URL-synchronized state. Tracks which item is "viewing" (selected) and integrates with `react-virtuoso` for performance.

### API

```ts
useListView<T>({
  items: (T & { id: string })[]
  onParamsUpdate: (params: ParamsFilter | null) => void
}): {
  listItems: (T & { id: string })[]
  listRef: React.RefObject<VirtuosoHandle | null>
  viewingId: string | null
  urlProps: string
  setViewingIndex: (index: number | null) => void
  scrollToIndex: (index?: number) => void
  scrollToTop: () => void
  scrollToBottom: (setIndex?: boolean) => void
  getViewingIndex: (id: string | null) => number
}
```

### Usage

See example in [VirtualizedListExample](../../frontend/src/components/examples/VirtualizedListExample.tsx).

### Behavior

- `viewingId` is persisted to the URL as a `?viewingId=<id>` query parameter
- On initial load, if no `viewingId` is set, the list scrolls to the bottom (feed/timeline style)
- When the URL's `viewingId` changes, the list scrolls to that item
- `onParamsUpdate` is called whenever URL search params change (used to propagate filter updates)
- `urlProps` is a query string fragment (e.g., `"?viewingId=abc123"`) for building links that preserve state
- `scrollToBottom(true)` scrolls to the bottom and optionally sets the viewed item to the last one

## `useNavHelpers`

Convenience wrapper around React Router v6's `useNavigate` and `useLocation` for common navigation actions.

### API

```ts
useNavHelpers(): {
  routeMatches(values: string[]): boolean
  navigateTo(href: string): () => void
  reload(): void
  goBack(): void
}
```

### Usage

```tsx
const { routeMatches, navigateTo } = useNavHelpers()

<NavBar>
  <NavItem
    active={routeMatches(['/home', '/dashboard'])}
    onClick={navigateTo('/dashboard')}
  >
    Dashboard
  </NavItem>
</NavBar>
```

### Behavior

- `routeMatches(values)` returns `true` if the current pathname matches any of the provided paths
  - The root path `/` uses exact matching; all other paths use case-insensitive `startsWith`
- `navigateTo(href)` returns a thunk suitable for passing directly to `onClick` handlers
- `reload()` is equivalent to `window.location.reload()`
- `goBack()` is equivalent to `navigate(-1)`

## `useQueryParam`

Two hooks for managing URL query parameters as JSON-encoded, typed values.

### API

```ts
// Hook 1: Single parameter
useQueryParam<T>(
  key: string,
  defaultValue?: T
): [T | undefined, (value: T | undefined) => void]

// Hook 2: URL builder
useBuildQueryUrl(): (path: string, query?: QueryFilter) => string
```

### Usage

```tsx
// Reading and writing a single query param
const [filter, setFilter] = useQueryParam<QueryFilter>('query', { tags: [] })

// Building a URL with query param + preserving other params
const buildUrl = useBuildQueryUrl()
const linkHref = buildUrl('/feedback', { tags: ['bug'], operator: 'and' })
// Result: "/feedback?query=%7B%22tags%22%3A%5B%22bug%22%5D%2C%22operator%22%3A%22and%22%7D&viewingId=abc..."
```

### Behavior

- Values are JSON-stringified and URI-encoded on write
- Values are parsed from JSON on read; parse failures fall back to `defaultValue`
- Setting a value to `undefined` removes the parameter from the URL
- `setFilter` uses `replace: false` (pushes history), so users can back/forward through filter changes
- `useBuildQueryUrl` preserves all current URL params except the `query` param itself
  - This ensures `viewingId` (from `useListView`) persists when building filter links
  - Default `operator` is set to `'and'` in the built URL for consistency

## Related Patterns

- **URL as state**: All these hooks embrace storing UI state in the URL for shareability and persistence
- **Two URL systems**: The app uses both JSON-encoded params (via `useQueryParam`) and dot-notation params (via `UrlStore`); they coexist but aren't interchangeable
- **Integration with TanStack Query**: `useListView` calls `onParamsUpdate` which typically triggers a new query fetch via a query hook

See also:
- [State Management](./state-management.md) — when to use these vs Zustand or React state
- [Query Hooks](./query-hooks.md) — how filter params flow into collection queries
