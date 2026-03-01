# Frontend Components

This file is intended to help AI Coding Agents know important information about the common practices this code base uses when writing pages or components.

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

I don't like using `useEffect()` to react to state changes. I would rather have callbacks instead. If you are creating new reusable code, prefer to make callbacks instead of forcing consumer to use `useEffect()` for event triggers.

---

## Shared Layout Components

All pages are wrapped in a `Layout` component that provides common UI elements. These reusable layout components are available in `components/`:

| Component | Purpose |
|-----------|---------|
| `Layout` | Page wrapper with nav, footer, theme |
| `ScreenBody` | Main content container with standard padding |
| `TitleBar` | Page header with title and icon |
| `NavBar` | Navigation menu bar |
| `RouteLoading` | Fallback shown while lazy-loaded pages load |
| `LoadingIcon` | Spinner icon for data loading states |
| `CancelButton` | Standard "cancel" button with default styles |
| `SaveButton` | Standard "Save" button with default styles |
| `Icon` | Icon wrapper component |

### Usage

```tsx
import ScreenBody from '@/components/ScreenBody'
import LoadingIcon from '@/components/LoadingIcon'

function FeedbackPage() {
  const feedback = useUserFeedbackCollection()

  return (
    <ScreenBody>
      <h1>Feedback</h1>
      {feedback.loading && <LoadingIcon />}
      {/* content */}
    </ScreenBody>
  )
}
```

---

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

---

## Component Organization

### `components/` — Reusable Components

Place components here if they:
- Are used in multiple pages
- Don't depend on page-specific route params
- Are generic (form inputs, buttons, layout helpers)
- Have no data fetching logic

**Example:** `FieldError.tsx`, `LoadingIcon.tsx`, `Layout.tsx`

### `pages/` — Page Components

Place components here if they:
- Are route-level (correspond to a URL)
- Own data fetching (via query hooks)
- Are used only in one place
- Depend on route params

**Example:** `FeedbackList.tsx`, `FeedbackDetail.tsx`

---

## Forms

### `useFormState` Hook

Manages form submission lifecycle: pending, submitted, success, and error states.

```tsx
import { useFormState } from '@/hooks'

const { formRef, submitted, success, apiError, handleSubmit, reset } = useFormState({
  onSuccess: () => toast('Saved!'),
  onError: (err) => toast.error(err.message),
})

<form ref={formRef} onSubmit={handleSubmit(async (formData) => {
  await collection.create(formData)
})}>
  {/* fields */}
  <SaveButton submit loading={collection.loading} />
</form>
```

**Key properties:**
- `formRef` — attach to `<form>`
- `submitted` — `true` after first submit attempt (use for showing validation errors)
- `success` — `true` after successful submit
- `apiError` — `ApiError | null` from the last operation
- `handleSubmit` — form event handler that calls your async function
- `reset()` — clear all state and call `form.reset()`

See [Custom Hooks](./custom-hooks.md#useformstate) for full API.

### `FieldError` Component

Display validation errors next to form fields:

```tsx
import { FieldError } from '@/components'

const { submitted, handleSubmit, apiError } = useFormState({})
const collection = useUserFeedbackCollection()

<form onSubmit={handleSubmit(async (formData) => {
  await collection.create(formData)
})}>
  <Textarea name="message" required />
  <FieldError
    name="message"
    apiError={apiError}
  />
</form>
```

**Props:**
- `name: string` — the field name to look up in validation errors
- `apiError: ApiError | null` — error object from `useFormState`

### Form Best Practices

- Use **FormData** for values — don't create local state for each field
- Use **Mantine UI** form components (`TextInput`, `Textarea`, `Select`, etc.)
- Use **`useFormState`** for form lifecycle
- Use **`FieldError`** to display validation errors per field
- Use **`getApiError`** to normalize backend errors
- Reference **`FeedbackWidget.tsx`** as the canonical form example

---

## Error Handling

All API errors should be normalized to `ApiError`:

```tsx
import { getApiError } from '@/lib/pb/errors'

try {
  await collection.create(formData)
} catch (err) {
  const apiError = getApiError(err)

  if (apiError.hasValidationErrors()) {
    // Show per-field errors
    Object.entries(apiError.validationErrors()).forEach(([field, error]) => {
      console.log(`${field}: ${error.message}`)
    })
  } else {
    // Show general error
    toast.error(apiError.message)
  }
}
```

See [Error Handling](./error-handling.md) for full guide.

---

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