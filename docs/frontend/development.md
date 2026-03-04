# Frontend Development

This guide documents frontend development patterns and best practices for ProductBase using React, TypeScript, and modern tooling.

## Overview

Frontend development in ProductBase follows modern React patterns with TypeScript, TanStack Query for data management, and [Mantine](https://mantine.dev/) for components. This section provides patterns and conventions for building maintainable frontend features.

## Development Workflow

### Component Architecture

1. **Plan your component structure** - Identify reusable vs page-specific components
2. **Create query hooks** - Build data access layer first
3. **Build UI components** - Focus on presentation and user interaction
4. **Add state management** - Implement local and global state as needed
5. **Handle errors** - Implement proper error boundaries and user feedback

### Data-First Development

**Prerequisites:** [Query Hooks](./query-hooks.md)

```typescript
// 1. Create collection hook first
export function useUserFeedbackCollection() {
  const base = usePocketbaseCollection<UserFeedbackRecord>(
    'user_feedback',
    {
      sort: '-created',
      attachUserOnCreate: 'user',
    }
  )

  return {
    ...base,
    // Add domain-specific methods
    uploadAttachment: async (id: string, file: File) => {
      const formData = new FormData()
      formData.append('attachment', file)
      await base.update(id, formData)
    },
  }
}

// 2. Use in components
export function FeedbackList() {
  const feedback = useUserFeedbackCollection()

  useEffect(() => {
    feedback.all({ expand: 'user,feedback_actions' })
  }, [])

  // Component logic...
}
```

**Benefits:**
- Clear separation of concerns
- Reusable data access patterns
- Automatic cache management
- Type safety throughout

### Component Organization

**Prerequisites:** [Components](./components.md)

```tsx
// Reusable component (src/components/FeedbackCard.tsx)
export function FeedbackCard({ feedback }: { feedback: UserFeedbackRecord }) {
  return (
    <Card>
      <Text>{feedback.message}</Text>
      <Text size="sm" color="dimmed">
        {feedback.user?.name}
      </Text>
    </Card>
  )
}

// Page component (src/pages/FeedbackList.tsx)
export function FeedbackList() {
  const feedback = useUserFeedbackCollection()

  return (
    <ScreenBody>
      <TitleBar title="Feedback" />
      {feedback.data?.items.map(item => (
        <FeedbackCard key={item.id} feedback={item} />
      ))}
    </ScreenBody>
  )
}
```

**Organization Principles:**
- **components/** - Reusable across multiple pages
- **pages/** - Route-specific, owns data fetching
- **hooks/** - Custom React hooks for UI patterns
- **stores/** - Global state management
- **lib/** - Utility functions and libraries

## State Management Patterns

There's a few ways to manage state. Here's some links to more information about them.

[Query Hooks for Pocketbase Data](./query-hooks.md)
**When to Use:**
- Data fetched from PocketBase
- Lists, single records, computed values
- Data that needs caching and synchronization

[React State for Local UI](./state-management.md#react-state--local-state)
**When to Use:**
- Form field state
- Modal/popover state
- UI toggles and animations
- Temporary state that doesn't persist

[Zustand for Global State](./state-management.md#zustand-stores--global-state)
**When to Use:**
- App loading state
- Theme preferences
- Feature flags
- Complex state that multiple components need

[URL State for Shareable State](./state-management.md#url-state--persistent-shareable-state)
**When to Use:**
- Filter parameters
- Pagination state
- Selected items
- View modes and sorting
- Shareable URLs

## Form Patterns

ProductBase includes a helpful set of standards for creating forms. For detailed form component documentation and patterns, see [Forms](./forms.md).

## Error Handling Patterns

See [Error Handling](./error-handling.md)

## Routing Patterns

See [Routing](./routing.md)

## Performance Optimization

### Code Splitting

```tsx
// Lazy load pages
const FeedbackList = lazy(() => import('./pages/FeedbackList'))
const FeedbackDetail = lazy(() => import('./pages/FeedbackDetail'))

// Use Suspense for loading fallback
<Suspense fallback={<RouteLoading />}>
  <Routes>
    <Route path="/feedback" element={<FeedbackList />} />
    <Route path="/feedback/:id" element={<FeedbackDetail />} />
  </Routes>
</Suspense>
```

### Virtualization

For long lists, use virtualization. See example in [VirtualizedListExample](../../frontend/src/components/examples/VirtualizedListExample.tsx).

### Memoization

```tsx
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data)
}, [data])

// Memoize callback functions
const handleSave = useCallback(async (data) => {
  await saveData(data)
}, [saveData])
```

## Testing Patterns

TBD
