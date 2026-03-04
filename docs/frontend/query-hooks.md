# Query Hooks

This guide documents the collection query hooks in `frontend/src/queryHooks/` built on top of [@tanstack/react-query](https://tanstack.com/query).

## Overview

TanStack Query hooks provide a type-safe, caching layer for interacting with PocketBase collections. They follow a three-tier architecture that separates concerns and provides automatic cache management.

## Architecture Overview

The query hook layer follows a three-tier architecture:

```
React Component
    ↓ uses
Collection-specific hook (useUserFeedbackCollection)
    ↓ wraps
Base hook (usePocketbaseCollection, auto-generate pocketbase SDK calls)
    ↓ uses
TanStack Query (useQuery, useMutation, caching)
    ↓ calls
PocketBase API
```

## Base Hook: `usePocketbaseCollection`

The generic, reusable hook for any PocketBase collection. All collection-specific query hooks wrap this.

### API

```ts
usePocketbaseCollection<T>(
  collectionName: string,
  defaults?: CollectionDefaults
): UsePocketbaseCollectionReturn<T>
```

#### `CollectionDefaults` options

Inherits the PocketBase options, with additions for helpers.

| Option | Type | Description |
|--------|------|-------------|
| `expand` | `string` | PocketBase relation expansion syntax (e.g., `'user,feedback_actions'`) |
| `sort` | `string` | Default sort string (e.g., `'-created'` for descending date) |
| `filter` | `string` | Default PocketBase filter expression |
| `perPage` | `number` | Items per page for paginated `list()` (default: 30) |
| `fields` | `string` | Comma-separated field selection (e.g., `'id,name,created'`) |
| **added helpers below** | | |
| `attachOnCreate` | `Record<string, string \| AUTH_USER>` | Key-value map of fields to auto-populate on create. Values are literal string IDs or the `AUTH_USER` sentinel (resolves to `authStore.record.id` at create time). See examples below. |

#### Return value (`UsePocketbaseCollectionReturn<T>`)

##### Read operations (lazy, call to trigger)

| Method | Signature | Description |
|--------|-----------|-------------|
| `list` | `(opts?: ListOptions) => void` | Fetch paginated list |
| `all` | `(opts?: ListOptions) => void` | Fetch all items (all pages) |
| `getOne` | `(id: string, opts?: GetOneOptions) => void` | Fetch single record by ID |
| `count` | `(opts?: ListOptions) => void` | Fetch total item count (lightweight — fetches 1 record with `fields: 'id'`). Access result via `data.getTotalItems()` |

##### Mutations (async, returns Promise)

| Method | Signature | Description |
|--------|-----------|-------------|
| `create` | `(data: object \| FormData, opts?) => Promise<PBData<T>>` | Create record, invalidate cache |
| `update` | `(id: string, data: object \| FormData, opts?) => Promise<PBData<T>>` | Update record, invalidate cache |
| `delete` | `(id: string, opts?) => Promise<void>` | Delete record, invalidate cache |

##### Unified status surface

| Property | Type | Description |
|----------|------|-------------|
| `fetching` | `boolean` | True while any query/mutation is in flight |
| `loading` | `boolean` | True while the active operation is pending |
| `success` | `boolean` | True if last operation succeeded |
| `error` | `ApiError \| null` | Normalized error from last operation (or null) |
| `data` | `PBDataList<T> \| PBData<T> \| undefined` | Result of last operation |

### Usage

```tsx
import { useUserFeedbackCollection } from '@/queryHooks'

export function FeedbackList() {
  const feedback = useUserFeedbackCollection()

  useEffect(() => {
    feedback.all({ expand: 'user,feedback_actions' })
  }, [])

  if (feedback.loading) return <LoadingState />
  if (feedback.error) return <ErrorState apiError={apiError} />
  if (!feedback.data) return <EmptyState />

  return (
    <div>
      {feedback.data.items.map(item => (
        <div key={item.id}>{item.message}</div>
      ))}
    </div>
  )
}
```

### Behavior

- **Lazy reads**: `list()`, `all()`, and `getOne()` don't trigger automatically; you must call them (usually in `useEffect` on mount or in a callback)
- **Unified status**: The `fetching/loading/success/error/data` surface reflects the *most recent* operation (query or mutation). This avoids exposing multiple independent query states
- **Cache invalidation**: Successful mutations (`create`, `update`, `delete`) automatically invalidate the collection's cache at the top level, refreshing all queries
- **Cache GC**: 5-minute garbage collection time — unused queries are removed from the cache after 5 minutes of inactivity
- **FormData support**: Both plain objects and `FormData` instances are accepted for mutations. `attachOnCreate` correctly handles both

### Query Key Factory

The hook uses a granular query key structure:

```ts
collectionKeys = {
  collection: (name: string) => ['pb', name],
  list: (name: string) => [...collectionKeys.collection(name), 'list'],
  all: (name: string) => [...collectionKeys.collection(name), 'all'],
  record: (name: string, id: string) => [...collectionKeys.collection(name), 'record', id],
}
```

When a mutation succeeds, it invalidates at the collection level, which cascades to all sub-queries (list, all, record).

## Collection-Specific Hooks

Create a typed wrapper for each collection to reduce boilerplate and add domain-specific methods.

### Example: `useUserFeedbackCollection`

```tsx
import { AUTH_USER, usePocketbaseCollection } from './usePocketbaseCollection'
import type { UserFeedbackRecord } from '@/types'

export function useUserFeedbackCollection() {
  const base = usePocketbaseCollection<UserFeedbackRecord>(
    'user_feedback',
    {
      sort: '-created',
      attachOnCreate: { user: AUTH_USER },
    }
  )

  return {
    ...base,
    uploadAttachment: async (id: string, file: File) => {
      const formData = new FormData()
      formData.append('attachment', file)
      await base.update(id, formData)
    },
  }
}
```

### File Location Convention

Place collection hooks at:
```
frontend/src/queryHooks/use<Feature>Collection.ts
```

Example: `useUserFeedbackCollection.ts`, `useUserPreferencesCollection.ts`

### Extending with Domain Methods

Add methods specific to your collection's business logic:

```tsx
export function useOrganizationCollection() {
  const base = usePocketbaseCollection<OrganizationRecord>(
    'organizations',
    { sort: 'name' }
  )

  return {
    ...base,
    // Domain-specific method
    transferOwnership: async (orgId: string, newOwnerId: string) => {
      return base.update(orgId, { owner: newOwnerId })
    },
    // Wrapper for common pattern
    listActive: (opts?: ListOptions) => {
      return base.list({ ...opts, filter: "status='active'" })
    },
  }
}
```

## Return Type Details

### `PBDataList<T>`

List query results with pagination helpers:

```ts
interface PBDataList<T> {
  items: T[]
  length: number
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

### `PBData<T>`

Single record with utility methods:

```ts
interface PBData<T> {
  [key]: any  // All fields accessible via index signature
  sortProperty(key: string, sort: string): PBData<T>  // chainable
}
```

**Important:** Both classes automatically flatten PocketBase's `expand` relations and alias back-relations (e.g., `user_feedback_via_user` → `user_feedback`).

## Integration with Components

### Pattern: Query in Effect

```tsx
function FeedbackDetail({ feedbackId }: Props) {
  const feedback = useUserFeedbackCollection()

  useEffect(() => {
    feedback.getOne(feedbackId, { expand: 'user,feedback_actions' })
  }, [feedbackId])

  return feedback.loading ? <LoadingState /> : <Pre>{JSON.stringify(feedback.data)}</Pre>
}
```

### Pattern: Mutation with Form

```tsx
function CreateFeedbackForm() {
  const { formRef, handleSubmit } = useFormState({ onSuccess: reset })
  const feedback = useUserFeedbackCollection()

  const onSubmit = async (data: FormData) => {
    await feedback.create(data)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      <FormError apiError={apiError} />
      {/* form fields */}
      <SaveButton submit loading={feedback.loading} />
    </form>
  )
}
```

## Error Handling Integration

TanStack Query hooks integrate seamlessly with the error handling system. Errors will be available on the `error` property.

See [Error Handling](./error-handling.md) for complete error handling patterns.

## Best Practices

### Create a Hook per Collection

Even if you're only wrapping the base hook, the typed wrapper provides type safety and a home for domain methods:

```tsx
// ✅ Good: Typed wrapper with domain methods
export function useUserFeedbackCollection() {
  const base = usePocketbaseCollection<UserFeedbackRecord>('user_feedback')
  
  return {
    ...base,
    uploadAttachment: async (id, file) => {
      const formData = new FormData()
      formData.append('attachment', file)
      await base.update(id, formData)
    }
  }
}

// ❌ Bad: Direct usage without wrapper
const feedback = usePocketbaseCollection('user_feedback')  // No type safety
```

### Use `attachOnCreate` to Auto-Populate Fields

Automatically includes values in create payloads; more reliable than manual assignment. Use the `AUTH_USER` sentinel to resolve to the logged-in user's ID at create time, or pass literal string IDs for other relations:

```tsx
import { AUTH_USER } from '@/queryHooks'

// User-scoped data — attach the logged-in user
const feedback = usePocketbaseCollection('user_feedback', {
  attachOnCreate: { user: AUTH_USER },
})

// Owner-scoped data — attach the logged-in user as owner
const orgs = usePocketbaseCollection('organizations', {
  attachOnCreate: { owner: AUTH_USER },
})

// Organization-scoped data — attach a known org ID
const projects = usePocketbaseCollection('projects', {
  attachOnCreate: { organization: orgId },
})

// Multiple fields at once
const tasks = usePocketbaseCollection('tasks', {
  attachOnCreate: { organization: orgId, assigned_to: AUTH_USER },
})
```

### Expand Relations in Queries

Pre-expand needed relations in `list` / `getOne` calls to avoid N+1 queries:

```tsx
// ✅ Good: Pre-expand relations
feedback.list({ expand: 'user,feedback_actions' })

// ❌ Bad: Separate queries for relations
feedback.list()
// Then separate queries for each user/feedback_action
```

### Let Mutations Invalidate Cache

Don't manually call `refetch` after mutations; let TanStack Query's invalidation handle it:

```tsx
// ✅ Good: Automatic invalidation
await feedback.create(data)  // Automatically invalidates list queries

// ❌ Bad: Manual refetch
await feedback.create(data)
feedback.list()  // Unnecessary manual refetch
```

### Avoid `useEffect` for Side Effects

Prefer `onSuccess` callbacks in forms or side-effect hooks:

```tsx
// ✅ Good: onSuccess callback
const { formRef, handleSubmit } = useFormState({
  onSuccess: () => {
    navigate('/feedback')
  }
})

// ❌ Bad: useEffect for side effects
useEffect(() => {
  if (feedback.success) {
    navigate('/feedback')
  }
}, [feedback.success])
```

## Performance Considerations

### Use Appropriate Query Methods

```tsx
// For lists with pagination
feedback.list({ page: 1, perPage: 20 })

// For all data (use sparingly)
feedback.all()

// For single records
feedback.getOne(id)
```
