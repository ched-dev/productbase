# TanStack Query Hooks

This guide documents the collection query hooks in `frontend/src/queryHooks/` built on top of [@tanstack/react-query](https://tanstack.com/query).

## Architecture Overview

The query hook layer follows a three-tier architecture:

```
React Component
    ↓ uses
Collection-specific hook (useUserFeedbackCollection)
    ↓ wraps
Base hook (usePocketbaseCollection)
    ↓ uses
TanStack Query (useQuery, useMutation)
    ↓ calls
lib/pb (auth, data, client)
    ↓
PocketBase API
```

## Base Hook: `usePocketbaseCollection`

The generic, reusable hook for any PocketBase collection. All collection-specific hooks wrap this.

### API

```ts
usePocketbaseCollection<T>(
  collectionName: string,
  defaults?: CollectionDefaults
): UsePocketbaseCollectionReturn<T>
```

#### `CollectionDefaults` options

| Option | Type | Description |
|--------|------|-------------|
| `expand` | `string` | PocketBase relation expansion syntax (e.g., `'user,feedback_actions'`) |
| `sort` | `string` | Default sort string (e.g., `'-created'` for descending date) |
| `filter` | `string` | Default PocketBase filter expression |
| `perPage` | `number` | Items per page for paginated `list()` (default: 30) |
| `fields` | `string` | Comma-separated field selection (e.g., `'id,name,created'`) |
| `attachUserOnCreate` | `boolean` | Auto-append `user: authStore.record.id` to create payloads (default: false) |

#### Return value (`UsePocketbaseCollectionReturn<T>`)

##### Read operations (lazy, call to trigger)

| Method | Signature | Description |
|--------|-----------|-------------|
| `list` | `(opts?: ListOptions) => void` | Fetch paginated list |
| `all` | `(opts?: ListOptions) => void` | Fetch all items (all pages) |
| `getOne` | `(id: string, opts?: GetOneOptions) => void` | Fetch single record by ID |

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

  if (feedback.loading) return <LoadingIcon />
  if (feedback.error) return <Alert color="red">{feedback.error.message}</Alert>
  if (!feedback.data) return null

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
- **FormData support**: Both plain objects and `FormData` instances are accepted for mutations. `attachUserOnCreate` correctly handles both

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

---

## Collection-Specific Hooks

Create a typed wrapper for each collection to reduce boilerplate and add domain-specific methods.

### Example: `useUserFeedbackCollection`

```tsx
import { usePocketbaseCollection } from './usePocketbaseCollection'
import type { UserFeedbackRecord } from '@/types'

export function useUserFeedbackCollection() {
  const base = usePocketbaseCollection<UserFeedbackRecord>(
    'user_feedback',
    {
      sort: '-created',
      attachUserOnCreate: true,
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

---

## Return Type Details

### `PBDataList<T>`

List query results with pagination helpers:

```ts
interface PBDataList<T> {
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

### `PBData<T>`

Single record with utility methods:

```ts
interface PBData<T> {
  [key]: any  // All fields accessible via index signature
  sortProperty(key: string, sort: string): PBData<T>  // chainable
}
```

Both classes automatically flatten PocketBase's `expand` relations and alias back-relations (e.g., `user_feedback_via_user` → `user_feedback`).

### Typing with `CollectionRecords`

Use the `CollectionRecords` type union for type-safe collection operations:

```tsx
import type { CollectionRecords } from '@/types'

// Generic collection handler that knows all collection types
function saveRecord<K extends keyof CollectionRecords>(
  name: K,
  record: CollectionRecords[K]
) {
  // 'record' is typed as the correct interface
  console.log(record.created)
}
```

---

## Integration with Components

### Pattern: Query in Effect

```tsx
function FeedbackDetail({ feedbackId }: Props) {
  const feedback = useUserFeedbackCollection()

  useEffect(() => {
    feedback.getOne(feedbackId, { expand: 'user,feedback_actions' })
  }, [feedbackId])

  return feedback.loading ? <Spinner /> : <Pre>{JSON.stringify(feedback.data)}</Pre>
}
```

### Pattern: Mutation with Form

```tsx
function CreateFeedbackForm() {
  const { formRef, handleSubmit } = useFormState({ onSuccess: reset })
  const feedback = useUserFeedbackCollection()

  return (
    <form ref={formRef} onSubmit={handleSubmit(async (data) => {
        await feedback.create(data)
    })}>
      {/* form fields */}
      <SaveButton submit loading={feedback.loading} />
    </form>
  )
}
```

### Pattern: List with Filters and Pagination

```tsx
function FeedbackList() {
  const feedback = useUserFeedbackCollection()
  const [filter, setFilter] = useQueryParam<QueryFilter>('query')

  useEffect(() => {
    feedback.list({
      filter: buildFilterString(filter),
      expand: 'user',
    })
  }, [filter])

  return (
    <div>
      <FilterControls value={filter} onChange={setFilter} />
      {feedback.data && (
        <div>
          {feedback.data.items.map(item => <Item key={item.id} {...item} />)}
          <Pagination
            current={feedback.data.getPage()}
            total={feedback.data.getTotalPages()}
          />
        </div>
      )}
    </div>
  )
}
```

---

## Error Handling

Mutations throw `ApiError` (or wrapper errors) that can be caught and handled:

```tsx
const collection = useUserFeedbackCollection()

await collection.create(data)  // throws ApiError on failure

// Or with try-catch:
try {
  await collection.create(data)
} catch (err) {
  const apiError = getApiError(err)
  if (apiError.hasValidationError('message')) {
    // Show field-specific error
  } else {
    // Show general error
  }
}
```

See [Error Handling](./error-handling.md) for details.

---

## Best Practices

1. **Create a hook per collection** — Even if you're only wrapping the base hook, the typed wrapper provides type safety and a home for domain methods
2. **Use `attachUserOnCreate` for user-scoped data** — Automatically includes the current user in creates; more reliable than manual assignment
3. **Expand relations in queries** — Pre-expand needed relations in `list` / `getOne` calls to avoid N+1 queries
4. **Let mutations invalidate cache** — Don't manually call `refetch` after mutations; let TanStack Query's invalidation handle it
5. **Avoid `useEffect` for side effects** — Prefer `onSuccess` callbacks in forms or side-effect hooks; see [State Management](./state-management.md)

---

## See Also

- [PocketBase Client Library](./pocketbase-client.md) — how `lib/pb` works under the hood
- [Querying](./querying.md) — backend query patterns in PocketBase migrations and hooks
- [Error Handling](./error-handling.md) — normalizing and displaying API errors
