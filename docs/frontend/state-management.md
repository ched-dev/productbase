# State Management Strategy

This guide explains when to use each state management tool in ProductBase.

## Overview

ProductBase uses complementary state systems, each optimized for different purposes:

```
┌─────────────────────────────────────────────────────────────┐
│  Where should my state live?                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔗 Server State     → TanStack Query Hooks (queryHooks/)   │
│  🌍 Global State     → Zustand (stores/)                    │
│  🎯 Local State      → React useState                       │
│  🔍 URL State        → useQueryParam / UrlStore             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## State Tools

### Query Hooks — Server State

Use for **data fetched from PocketBase**: lists, single records, computed values.

#### Characteristics

- **Source of truth**: PocketBase API
- **Automatic invalidation**: Mutations trigger cache refreshes
- **Synchronization**: Multiple components automatically share fresh data
- **Caching**: 5-minute stale-while-revalidate
- **Loading states**: Built-in `loading`, `fetching`, `error`

#### When to Use

```tsx
// ✅ DO: Use Query Hooks for server data
const feedback = useUserFeedbackCollection()
useEffect(() => {
  feedback.all()
}, [])

// ❌ DON'T: Fetch and store in React state
const [feedbackList, setFeedbackList] = useState([])
useEffect(() => {
  pb.collection('user_feedback').getFullList().then(setFeedbackList)
}, [])
```

#### Advantages

- Automatic cache sharing across components
- Built-in stale-while-revalidate pattern
- No manual refetch logic after mutations
- Type-safe with generated `PBCollections` types

### Zustand Stores — Global State

Use for **app-wide state that outlives components**: auth loading, theme, feature flags.

#### Characteristics

- **Lifespan**: App-wide, survives component unmount
- **Mutability**: Imperative setters
- **Performance**: Optional subscription (don't re-render on every state change)
- **Simplicity**: No boilerplate, just a hook

#### When to Use

```tsx
// ✅ DO: Use Zustand for truly global state
const { loaded, setLoaded } = useAppStore()

// ❌ DON'T: Use for temporary, local state
// (use React state instead)
const [modalOpen, setModalOpen] = useState(false)

// ❌ DON'T: Use for server data
// (use TanStack Query instead)
const { user, setUser } = useUserStore()  // ❌ Bad
```

### React State — Local State

Use for **component-scoped, temporary state**: forms, animations, UI toggles.

#### Characteristics

- **Scope**: Single component or subtree via `<Provider>`
- **Lifespan**: Unmounts when component unmounts
- **Mutability**: `useState` setter
- **Performance**: Component-local re-renders (fast)

#### When to Use

```tsx
// ✅ DO: Use React state for form UI
const [feedbackType, setFeedbackType] = useState('')
const [showCancelConfirm, setShowCancelConfirm] = useState(false)

// ❌ DON'T: Use for data that should persist across navigation
const [userEmail, setUserEmail] = useState('')  // ❌ Loses value on remount

// ❌ DON'T: Duplicate server state
const [savedFeedback, setSavedFeedback] = useState([])  // ❌ Bad
// Use Query Hooks instead
```

#### Note on `useFormState`

The custom `useFormState` hook is a React state wrapper. Use it alongside query hooks:

```tsx
const { formRef, handleSubmit } = useFormState({
  onSuccess: reset,
})
const collection = useUserFeedbackCollection()

const onSubmit = async (data: FormData) => {
  await collection.create(data)  // TanStack Query mutation
}

<form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
  {/* fields */}
</form>
```

For detailed form component documentation and patterns, see [Forms](./forms.md).

### URL State — Persistent, Shareable State

Use for **state that should survive page refresh or be shareable via link**: filters, pagination, viewed item.

#### Characteristics

- **Persistence**: Survives page refresh
- **Sharing**: Entire app state in the URL
- **Queryability**: Bookmarkable and searchable

#### When to Use

```tsx
// ✅ DO: Store filters in URL
const [filter, setFilter] = useQueryParam<QueryFilter>('query', { tags: [] })

// ✅ DO: Store viewed item in URL
useListView({ items: feedback.data.items, onParamsUpdate: ... })

// ❌ DON'T: Store in React state if you want to preserve it on refresh
const [filter, setFilter] = useState({ tags: [] })  // ❌ Lost on refresh
```

#### Two URL Systems

##### System 1: `useQueryParam` (React hooks, JSON-encoded)

```tsx
const [filter, setFilter] = useQueryParam<QueryFilter>('query', { tags: [] })
// URL: ?query=%7B%22tags%22%3A%5B%5D%7D
```

**When to use:**
- Simple, flat, JSON-serializable data
- Filters and search parameters
- Tight React integration

##### System 2: `UrlStore` (Imperative singleton, dot-notation)

```tsx
const store = useUrlStore()
store.set({ filters: { exif: { cameraMake: 'Canon' } } })
// URL: ?filters.exif.cameraMake=Canon
```

**When to use:**
- Complex, deeply nested state
- Imperative navigation from query hooks
- Backward compatibility with existing URL schemes

See [Custom Hooks](./custom-hooks.md)

## Anti-Patterns

### ❌ `useEffect` for State Reactions

```tsx
// ❌ DON'T: Use useEffect to react to state changes
const feedback = useUserFeedbackCollection()
const [filter, setFilter] = useState('')

useEffect(() => {
  feedback.list({ filter })
}, [filter])
```

**Why bad:**
- Multiple re-render cycles
- Hard to trace data flow
- Stale closure bugs

**Instead: Use callbacks**

```tsx
// ✅ DO: React to user actions directly
const handleFilterChange = (newFilter) => {
  setFilter(newFilter)
  feedback.list({ filter: newFilter })
}
```

Or:

```tsx
// ✅ DO: Use useQueryParam for URL state
const [filter, setFilter] = useQueryParam('query')
// Changes to URL automatically trigger callbacks (useListView.onParamsUpdate)
```

### ❌ Duplicating Server State in React

```tsx
// ❌ DON'T: Fetch data and store in useState
const [feedbackList, setFeedbackList] = useState([])
useEffect(() => {
  pb.collection('user_feedback').getFullList().then(setFeedbackList)
}, [])
```

**Why bad:**
- No automatic cache sharing
- Manual refetch logic after mutations
- Loading states are fragmented

**Instead: Use Query Hooks**

```tsx
// ✅ DO: Use query hooks
const feedback = useUserFeedbackCollection()
feedback.all()
feedback.sort('-created')
// feedback.data automatically updates when mutations invalidate
```

### ❌ Global State for Temporary UI

```tsx
// ❌ DON'T: Zustand for modal state
const useUIStore = create(() => ({
  feedbackModalOpen: false,
  setFeedbackModalOpen: (open) => { /* ... */ },
}))
```

**Why bad:**
- Pollutes global state
- Hard to reason about multiple modals
- Overkill for local UI

**Instead: React state**

```tsx
// ✅ DO: React state in component
const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
```

## Best Practices

### Avoid State Duplication

Don't store the same data in multiple state systems:

```tsx
// ❌ Bad: Duplicate state
const [user, setUser] = useState(null)
const { user: queryUser } = useUserQuery()

// ✅ Good: Single source of truth
const { data: user } = useUserQuery()
```

### Use URL State for Navigation

Always use URL state for navigation-related state:

```tsx
// ✅ Good: URL state for navigation
const [currentPage, setCurrentPage] = useQueryParam('page', 1)

// ❌ Bad: React state for navigation
const [currentPage, setCurrentPage] = useState(1)
```

### Getting the current logged in user

The current logged in user will always be available on the pocketbase client.

```tsx
const pb = usePbClient()
const currentUserId = pb.authStore.record?.id
```