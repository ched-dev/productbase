# Components

This guide documents frontend React component patterns and best practices in ProductBase.

## Overview

ProductBase follows a structured component architecture with clear separation of concerns between reusable components, page components, and layout components.

### Component Types

#### Reusable Components

Components that can be used across multiple pages and contexts. See the [Component Reference](#component-reference) for a full list.

**Location:** `src/components/`

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

Components that provide common layout structure. See the [Component Reference](#component-reference) for a full list.

**Location:** `src/components/layout/`

**Characteristics:**
- Provide consistent layout
- Handle navigation
- May contain navigation state

#### Badge Components

Components that display status or role indicators. See the [Component Reference](#component-reference) for a full list.

**Location:** `src/components/badges/`

**Characteristics:**
- Consistent visual indicators across pages
- Props-driven with standardized colors

#### Form Components

Components that provide common form inputs. See [Forms](./forms.md#form-components) for a full list and detailed documentation.

**Location:** `src/components/forms/`

**Characteristics:**
- One place to edit style
- Consistency in code across froms

## Component Reference

| Component | Description |
|---|---|
| **`components/*`** | |
| Auth | Login and sign-up forms with authentication state |
| FeedbackWidget | Popover widget for collecting user feedback |
| Icon | Maps icon names to Tabler icons with size/stroke options |
| LoadingIcon | Ring-shaped loading spinner |
| NotFoundView | Full-page not-found state with message and back navigation |
| RingLoader | Custom SVG ring loader for Mantine |
| RouteLoading | Loading screen during route transitions |
| **`components/badges/*`** | |
| MembershipBadge | Color-coded role badge (owner=yellow, admin=blue, member=gray) |
| SelfBadge | Green dot badge indicating the current authenticated user |
| **`components/layout/*`** | |
| ContentContainer | Constrained-width container for centering content |
| NavBar | Main navigation bar with page links and new-item menu |
| ScreenBody | Page layout wrapper with navbar and scrollable content area |
| TitleBar | Top header with theme toggle, search, settings, and logout |

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

## List Patterns

### List with Pagination

TBD

### Virtualized Lists

For long lists, use virtualization. See example in [VirtualizedListExample](../../frontend/src/components/examples/VirtualizedListExample.tsx).

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

A confirmation message should be used on all destructive actions. Use provided `<ConfirmationMessage>` component.

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

## Mantine Usage

The Mantine packages provide a lot of useful reusable components, hooks, and UI patterns that should be kept when implementing new code inside components.

ProductBase frequently wraps Mantine components and uses them sitewide to allow one source of truth for changing UI. The only way to achieve this is to reuse or create a reusable component which is used everywhere.

ProductBase reusable components live in `frontend/src/components/*`.

### Mantine Components

`@mantine/core` package includes:

- **Layout:** `Box`, `Container`, `Group`, `Stack`
- **Inputs:** `TextInput`, `Textarea`, `Select`, `Radio`, `Switch`
- **Buttons:** `Button`, `ActionIcon`
- **Feedback:** `Alert`, `Loader`
- **Data Display:** `Badge`, `Card`, `Text`
- **Overlays:** `Modal`, `Popover`
- **Other:** `Fieldset`, `MantineProvider`

### Mantine Hooks

`@mantine/hooks` package provides lots of common React hooks for local state. This package includes:

- `useDisclosure` - Manages boolean state with `open`/`close` callbacks (e.g. modals, popovers)

### Mantine Best Practices

When adding a `size` property on wrapper components, use the `MantineSpacing` type instead of `MantineSize`. The `MantineSpacing` type includes custom defined sizes in the theme while the other does not.