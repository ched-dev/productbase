# Routing

This guide documents frontend routing patterns in ProductBase using React Router v6.

## Router Structure

The main router is in `frontend/src/Router.tsx`:

```tsx
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './Layout'
import RouteLoading from './components/RouteLoading'

export function Router() {
  return (
    <BrowserRouter>
      <ExportNavigate />
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route Component={Layout}>
            <Route path="/" Component={Home} />
            {/* Add more routes here */}
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

### Key Patterns

1. **All routes wrapped in `Layout`** — Every page shares the same layout (nav, footer, etc.)
2. **Lazy-loaded pages** — Pages use `React.lazy()` for code-splitting
3. **Loading fallback** — `Suspense` shows `RouteLoading` component while pages load
4. **`ExportNavigate` component** — Captures the React Router `navigate` function for imperative use outside React

---

## URL Conventions for CRUD

When implementing new features that require new pages, use these URL patterns:

| Action | Pattern | Example |
|--------|---------|---------|
| List | `/<resource>` | `/feedback` |
| Create | `/<resource>/new` | `/feedback/new` |
| View | `/<resource>/:id` | `/feedback/abc123` |
| Update | `/<resource>/:id/edit` | `/feedback/abc123/edit` |
| Delete | Modal/prompt on list or detail | (no dedicated URL) |
| Nested | `/<resource>/:id/<subresource>` | `/feedback/abc123/actions` |
| Custom action | `/<resource>/:id/:action` | `/feedback/abc123/share` |

### Example

```tsx
<Routes>
  <Route Component={Layout}>
    <Route path="/feedback" Component={lazy(() => import('./pages/FeedbackList'))} />
    <Route path="/feedback/new" Component={lazy(() => import('./pages/FeedbackForm'))} />
    <Route path="/feedback/:id" Component={lazy(() => import('./pages/FeedbackDetail'))} />
    <Route path="/feedback/:id/edit" Component={lazy(() => import('./pages/FeedbackForm'))} />
  </Route>
</Routes>
```

## Imperative Navigation

Use `lib/navigate.ts` for programmatic navigation outside of React components or when you wish to navigate without user interaction, such as events.

### Usage (Anywhere in the app)

```tsx
// In a query hook after mutation success
import { navigate } from '@/lib/navigate'

export function useUserFeedbackCollection() {
  const base = usePocketbaseCollection<UserFeedbackRecord>('user_feedback', ...)

  return {
    ...base,
    createAndRedirect: async (data: FormData) => {
      const newRecord = await base.create(data)
      navigate(`/feedback/${newRecord.id}`)  // Imperative navigation
      return newRecord
    },
  }
}
```

### Use Case

This pattern is essential for:
- Redirecting somewhere after successful form submission
- Navigating after a mutation from inside a query hook (not a component)
- Navigation from utility functions that aren't React components

## Route Guards

TBD

## Related Patterns

- **`useNavHelpers`** — Convenience hook for active route detection and navigation
- **URL state** — Preserving filter/search/viewed-item in URL via `useQueryParam` and `useListView`

See [Custom Hooks](./custom-hooks.md) for details.
