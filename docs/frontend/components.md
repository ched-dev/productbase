# Components

This guide documents frontend React component patterns and best practices in ProductBase.

## Overview

ProductBase follows a structured component architecture with clear separation of concerns between reusable components, page components, and layout components.

### Component Types

#### Reusable Components

Components that can be used across multiple pages and contexts.

**Location:** `src/components/`

**Examples:**
- `Modal` - Modal dialog component
- `LoadingIcon` - Loading spinner

**Characteristics:**
- No business logic
- Props-driven
- Highly reusable
- Generic naming

#### Page Components

Components that represent complete pages or major sections.

**Location:** `src/pages/`

**Examples:**
- `FeedbackList` - List page for feedback
- `FeedbackDetail` - Detail page for feedback

**Characteristics:**
- Own data fetching
- Route-specific
- May contain multiple reusable components
- Business logic specific to the page

#### Layout Components

Components that provide common layout structure.

**Location:** `src/components/layout/`

**Examples:**
- `Layout` - Main app layout
- `ScreenBody` - Page content wrapper
- `TitleBar` - Page title and actions

**Characteristics:**
- Provide consistent layout
- Handle navigation
- May contain navigation state

#### Form Components

Components that provide common form inputs.

**Location:** `src/components/forms/`

**Examples:**
- `CancelButton` - Cancel action in forms
- `SaveButton` - Save and Submit action in forms
- `FieldError` - Display an error for a particular field

**Characteristics:**
- One place to edit style
- Consistency in code across froms

## Component Patterns

### Props Interface Pattern

Always define explicit props interfaces:

```tsx
interface FeedbackCardProps {
  feedback: UserFeedbackRecord
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function FeedbackCard({ feedback, onEdit, onDelete }: FeedbackCardProps) {
  // Component implementation
}
```

### Composition Pattern

Use composition over inheritance:

```tsx
// ✅ Good: Composition
export function Card({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="card">
      {title && <h3>{title}</h3>}
      <div className="card-content">
        {children}
      </div>
    </div>
  )
}

// Usage
<Card title="Feedback">
  <FeedbackList />
</Card>

// ❌ Bad: Inheritance
class FeedbackCard extends BaseCard {
  // Harder to compose and test
}
```

## Form Patterns

### Form State Management

Use the `useFormState` hook for form lifecycle management:

```tsx
export function FeedbackForm({ feedbackId }: Props) {
  const { formRef, handleSubmit, apiError } = useFormState({
    onSuccess: () => {
      toast('Feedback saved!')
      navigate('/feedback')
    },
    onError: (err) => {
      toast.error(err.message)
    }
  })

  const feedback = useUserFeedbackCollection()

  const handleSubmit = async (formData: FormData) => {
    if (feedbackId) {
      await feedback.update(feedbackId, formData)
    } else {
      await feedback.create(formData)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <Textarea name="message" required />
      <FieldError name="message" apiError={apiError} />
      <Select name="feedback_type" options={FEEDBACK_TYPES} required />
      <FieldError name="feedback_type" apiError={apiError} />
      <SaveButton submit loading={feedback.loading} />
    </form>
  )
}
```

### Field level validation with FieldError

Use `FieldError` component for per-field validation display:

```tsx
// Display field-specific errors
<FieldError name="email" apiError={apiError} />
```

### Form level validation with FormError Component

Use the `FormError` component for displaying high-level form errors:

```tsx
import FormError from '@/components/forms/FormError'

// Display form-level errors only (excludes validation errors)
<FormError apiError={apiError} />

// Custom title
<FormError apiError={apiError} title="Submission Error" />
```

**Props:**
- `apiError: ApiError | null | undefined` - The error object from form submission
- `title?: string` - Optional title, defaults to "Error"

**Behavior:**
- Only renders when `apiError` exists and has no validation errors
- Always shows error icon using the existing Icon component
- Displays the high-level error message
- Uses consistent Mantine Alert styling with red color

**Note:** FormError ignores field-level validation errors since those should be handled by FieldError components for individual fields.

### Form Actions

Use consistent form action components:

```tsx
// Save button with loading state
<SaveButton submit loading={feedback.loading} />

// Cancel button with navigation
<CancelButton to="/feedback" />
```

## List Patterns

### 1. List with Pagination

TBD

### 2. Virtualized Lists

For long lists, use virtualization:

```tsx
import { VariableSizeList } from 'react-window'

export function FeedbackList() {
  const feedback = useUserFeedbackCollection()
  const { listRef, viewingId } = useListView({
    items: feedback.data?.items || [],
    onParamsUpdate: handleFilterChange
  })

  return (
    <VariableSizeList
      ref={listRef}
      height={600}
      itemCount={feedback.data?.items.length || 0}
      itemSize={() => 100}
    >
      {({ index, style }) => (
        <div style={style}>
          <FeedbackCard
            feedback={feedback.data.items[index]}
            viewing={feedback.data.items[index].id === viewingId}
          />
        </div>
      )}
    </VariableSizeList>
  )
}
```

## Detail Patterns

### Detail with Edit

TBD

### Nested Routes

Use nested routes for related functionality:

```tsx
// Route structure
<Routes>
  <Route path="/feedback" element={<FeedbackList />} />
  <Route path="/feedback/:id" element={<FeedbackDetail />} />
  <Route path="/feedback/:id/edit" element={<FeedbackForm />} />
  <Route path="/feedback/:id/actions" element={<FeedbackActions />} />
</Routes>
```

## Integration with State Management

### State Integration

See the [State Management](./state-management.md) doc to better understand possible state management strategies.

### Error Handling Integration

See [State Management](./state-management.md) and [Error Handling](./error-handling.md) for complete patterns.

## Best Practices

### Component Naming

- Use PascalCase for component names
- Use descriptive names
- Avoid generic names like `Component` or `Container`

```tsx
// ✅ Good
export function FeedbackCard() {}
export function UserAvatar() {}
export function LoadingSpinner() {}

// ❌ Bad
export function Card() {}
export function Avatar() {}
export function Spinner() {}
```

### Props Design

- Use explicit props interfaces
- Avoid spreading props
- Use default values for optional props
- Group related props in objects when appropriate

```tsx
// ✅ Good
interface ButtonProps {
  children: ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

// ❌ Bad
interface ButtonProps {
  [key: string]: any  // Avoid spreading props
}
```

### State Management

- Use React state for component-scoped state
- Use URL state for shareable state
- Use Query Hooks for server state
- Avoid state duplication

### Performance

- Use memoization for expensive calculations
- Implement virtualization for long lists
- Use lazy loading for heavy components
- Avoid unnecessary re-renders

## Testing

TBD

## See Also

- [State Management](./state-management.md) - State management strategy and patterns
- [Routing](./routing.md) - Navigation and URL patterns
- [Error Handling](./error-handling.md) - Error handling patterns
- [Query Hooks](./query-hooks.md) - Data fetching patterns
- [Frontend Development](./frontend-development.md) - Frontend development patterns
- [Custom Hooks](./custom-hooks.md) - URL state and other custom hooks

## Important Tips

Any addition of queries to the pocketbase backend should follow the [querying](./querying.md) doc. Components should only be loading in the query hooks (`./frontend/src/queryHooks/*`) that will be used to make queries, not making queries directly from the component.

We heavily rely on the `PBDataList` and `PBData` classes to wrap responses from pocketbase so we can have a standardized way to work with returned data. Here are some key details about the classes:
**PBDataList**
Used to wrap the list endpoints with pagination values. The class provides helper methods and converts the items to **PBData** instances.
**PBData**
Used to wrap individual records. Converts the data to squash the `expand.*` values onto the object so relations can easily be accessed. It also removes the `_via_*` suffix for back-relations. For Example:
```js
// standard pocketbase response structure
user.expand.user_feedback_via_user; // array of user_feedback
// PBData instance structure
user.user_feedback; // array of user_feedback
```

Due to the standardized way we write our query functions, all errors thrown should be of the type **ClientResponseError**. We need to catch these errors and make them availabe to the component in a standardized way using the type of **ApiError**. This can be done by setting the error state with the converted error. For example:
```js
// to hold state
const [apiError, setApiError] = useState<ApiError | null>(null);

// to make request
getUserOrganizations()
  .then(x => {})
  .catch(err => setApiError(getApiError(err)))
```

Function naming inside components have the following rules:
- Functions which handle state changes should be named as `handle*`, E.g. `handleSignIn(), handleSignUp()`
- Functions for events such as click, form submit, change, should be named as `on*`, E.g. `onClick(), onSubmit(), onKeyPress()`
- Functions for rendering elements should be named as `render*`, E.g. `renderForm(), renderStats()`

Don't use `useEffect()` to react to state changes. Prefer having callbacks instead. If you are creating new reusable code, prefer to make callbacks instead of forcing consumer to use `useEffect()` for event triggers.

## Path Alias

The `@/` alias points to `frontend/src/`. Use it instead of relative imports:

```tsx
// ✅ Preferred
import { getApiError } from '@/lib/pb/errors'
import ScreenBody from '@/components/ScreenBody'

// ❌ Less preferred
import { getApiError } from '../../../../lib/pb/errors'
import ScreenBody from '../../components/ScreenBody'
```

## CRUD Forms

Create and edit operations should use the same form component when possible. Plan to accept a `defaultValues` prop for edit mode:

```tsx
// pages/FeedbackForm.tsx
export function FeedbackForm({ feedbackId }: Props) {
  const feedback = useUserFeedbackCollection()
  const [initialData, setInitialData] = useState(null)

  useEffect(() => {
    if (feedbackId) {
      feedback.getOne(feedbackId)
    }
  }, [feedbackId])

  const handleSubmit = async (formData: FormData) => {
    if (feedbackId) {
      await feedback.update(feedbackId, formData)
    } else {
      await feedback.create(formData)
    }
  }

  return <FeedbackFormContent onSubmit={handleSubmit} initialData={initialData} />
}
```