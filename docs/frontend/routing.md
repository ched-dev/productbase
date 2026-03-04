# Routing

This guide documents frontend routing patterns in ProductBase using React Router v7.

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


## Centralized Route Definitions

All routes are defined in `frontend/src/lib/routes.ts`. Each route is a callable function that generates URLs, and also exposes its `.path` for use in Router.tsx.

### Adding New Routes

When implementing new features that require new pages, add routes to `routes.ts` using `defineRoute()`:

```ts
// In frontend/src/lib/routes.ts
export const routes = {
  // No path params
  home: defineRoute('/'),

  feedback: {
    list: defineRoute('/feedback'),
    new: defineRoute('/feedback/new'),
    // Path params are type-safe via the generic
    detail: defineRoute<'id'>('/feedback/:id'),
    edit: defineRoute<'id'>('/feedback/:id/edit'),
  },
}
```

### Using Routes

```tsx
import { routes } from '@/lib/routes'

// Generate URLs by calling the route function
routes.feedback.list()                          // '/feedback'
routes.feedback.detail({ id: 'abc123' })        // '/feedback/abc123'

// Optional query string parameters (second argument)
routes.feedback.list({}, { sort: '-created' })  // '/feedback?sort=-created'

// Use .path for Router.tsx path props (keeps the :param placeholders)
routes.feedback.detail.path                     // '/feedback/:id'
```

### In Components

```tsx
// Link
<Button component={Link} to={routes.feedback.detail({ id: item.id })}>
  View
</Button>

// Imperative navigation
navigate(routes.feedback.list())

// Router.tsx
<Route path={routes.feedback.detail.path} Component={() => <FeedbackDetail />} />
```

## URL Conventions for CRUD

When adding new route groups, follow these URL patterns:

| Action | Pattern | Example |
|--------|---------|---------|
| List | `/<resource>` | `/feedback` |
| Create | `/<resource>/new` | `/feedback/new` |
| View | `/<resource>/:id` | `/feedback/abc123` |
| Update | `/<resource>/:id/edit` | `/feedback/abc123/edit` |
| Delete | Modal/prompt on list or detail | (no dedicated URL) |
| Nested | `/<resource>/:id/<subresource>` | `/feedback/abc123/actions` |
| Custom action | `/<resource>/:id/:action` | `/feedback/abc123/share` |

## Imperative Navigation

There are two standard navigation patterns:

1. **In React components and hooks**: use `useNavigateHelpers().navigate` (React Router's navigate via the hook)
2. **Outside React** (plain stores, utility functions, without Router context): use `navigateUsingRouter()` from `@/hooks/useNavigateHelpers`

### Usage in Components and Hooks

```tsx
// In a component
import { routes } from '@/lib/routes'
import { useNavigateHelpers } from '@/hooks/useNavigateHelpers'

export default function FeedbackForm() {
  const { navigate } = useNavigateHelpers()

  const { formRef, handleSubmit } = useFormState({
    onSuccess: () => {
      navigate(routes.feedback.detail({ id }))
    },
  })
  // ...
}
```

```tsx
// In a custom hook
import { routes } from '@/lib/routes'
import { useNavigateHelpers } from '@/hooks/useNavigateHelpers'

export function useUserFeedbackCollection() {
  const base = usePocketbaseCollection<UserFeedbackRecord>('user_feedback', ...)
  const { navigate } = useNavigateHelpers()

  return {
    ...base,
    createAndRedirect: async (data: FormData) => {
      const newRecord = await base.create(data)
      navigate(routes.feedback.detail({ id: newRecord.id }))
      return newRecord
    },
  }
}
```

### Usage Outside React

```tsx
// In a plain store or utility function (without Router context)
import { navigateUsingRouter } from '@/hooks/useNavigateHelpers'

urlStorage.navigate = (path: string, newValue: UrlStorageData) => {
  navigateUsingRouter(path + '?' + qs.stringify(newValue))
}
```

## Route Guards

### Missing ID Redirect

Detail and edit pages that require an `:id` param should redirect to the resource's list page if `id` is missing. Place the guard **after all hooks** (to avoid violating React's rules of hooks) but **before any rendering logic**:

```tsx
import { routes } from '@/lib/routes'
import { useNavigateHelpers } from '@/hooks/useNavigateHelpers'

export default function FeedbackDetail() {
  const { id } = useParams<{ id: string }>()
  const { navigate } = useNavigateHelpers()
  const feedback = useFeedbackCollection()

  // Hooks must come first
  useEffect(() => {
    if (id) feedback.getOne(id)
  }, [id])

  // Guard: redirect if no id (placed after hooks)
  // This also narrows `id` to `string` for all code below
  if (!id) {
    navigate(routes.feedback.list())
    return null
  }

  // id is now `string` — no need for id! type assertions
  return <div>...</div>
}
```

This pattern:
1. Keeps hooks unconditional (React requirement)
2. Redirects to the list page instead of showing a broken page
3. Narrows `id` from `string | undefined` to `string` for all code below the guard, eliminating `id!` non-null type assertions

## Related Patterns

- **`useNavigateHelpers`** — Convenience hook for active route detection and navigation
- **URL state** — Preserving filter/search/viewed-item in URL via `useQueryParam` and `useListView`

See [Custom Hooks](./custom-hooks.md) for details.
