# Error Handling

This guide documents error handling patterns in ProductBase, focusing on PocketBase API errors and validation.

**Prerequisites:** [State Management](./state-management.md), [Components](./components.md), [Query Hooks](./query-hooks.md)

**Related Topics:** [Frontend Development](./development.md), [Backend Development](../backend/development.md)

## `ApiError` Class

The primary error class for normalizing PocketBase responses.

### API

```ts
export class ApiError {
  name: 'ApiError'
  message: string
  status: number
  validationData: Record<string, ValidationErrorData>

  hasValidationErrors(): boolean
  hasValidationError(fieldName: string): boolean
  validationErrors(): Record<string, ValidationErrorData>
  validationError(fieldName: string): ValidationErrorData | undefined
}

export function getApiError(
  error: unknown,
  remapErrors?: Record<string, string>
): ApiError

export interface ValidationErrorData {
  code: string    // e.g., 'required', 'invalid_email', 'regex'
  message: string // e.g., 'Please fill out this field'
}
```

### Creating an ApiError

```tsx
import { getApiError } from '@/lib/pb/errors'

try {
  await pb.collection('users').create(data)
} catch (err) {
  const apiError = getApiError(err)
  console.log(apiError.message)   // 'Invalid Data.'
  console.log(apiError.status)    // 422
}
```

### Checking for Validation Errors

```tsx
const apiError = getApiError(err)

// Check if there are any validation errors
if (apiError.hasValidationErrors()) {
  const errors = apiError.validationErrors()
  Object.entries(errors).forEach(([field, data]) => {
    console.log(`${field}: ${data.message} (${data.code})`)
  })
}

// Check for a specific field
if (apiError.hasValidationError('email')) {
  const emailErr = apiError.validationError('email')
  console.log(emailErr.message)  // e.g., 'Invalid email address'
  console.log(emailErr.code)     // e.g., 'invalid_email'
}
```

### Error Remapping

Remap specific error messages to custom text:

```tsx
const apiError = getApiError(err, {
  'Invalid Data.': 'Please check all fields and try again',
  'Failed to create record.': 'Invalid Data.',  // Multiple remaps OK
})

// Now apiError.message reflects the remap if it was triggered
```

**Built-in remaps:**
- `'Failed to create record.'` → `'Invalid Data.'`

---

## Error Handling in Forms

Integrate `ApiError` with `useFormState` and `FieldError` components.

### Pattern: Per-Field Validation Display

```tsx
import { useFormState } from '@/hooks'
import { getApiError } from '@/lib/pb/errors'
import { FieldError } from '@/components'

function CreateUserForm() {
  const { formRef, handleSubmit, apiError } = useFormState({
    onSuccess: () => toast('User created'),
  })
  const users = useUserCollection()

  const onSubmit = async (formData: FormData) => {
    await users.create(formData)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      <TextInput type="email" name="email" required />
      <FieldError name="email" apiError={apiError} />

      <TextInput name="name" required />
      <FieldError name="name" apiError={apiError} />

      <SaveButton submit label="Create" loading={users.loading} />
    </form>
  )
}
```

### Pattern: Form-Level Error Display

```tsx
function CreateItemForm() {
  const { formRef, handleSubmit, apiError } = useFormState({
    onError: (err) => {
      // apiError is automatically set by useFormState
    },
  })
  const items = useItemCollection()

  const onSubmit = async (formData: FormData) => {
    await items.create(formData)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      <FormError apiError={apirError} />
      {/* form fields */}
    </form>
  )
}
```

For detailed form component documentation and patterns, see [Forms](./forms.md).

## Error Handling in Query Hooks

Mutations in query hooks throw `ApiError` (wrapped by TanStack Query).

### Pattern: Let useFormState Handle It

```tsx
const { formRef, handleSubmit } = useFormState({
  onError: (apiError) => {
    toast.error(apiError.message)
  },
})

const onSubmit = async (formData: FormData) => {
  await collection.create(formData)
}

<form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
  {/* fields */}
</form>
```

## Error Types from PocketBase

PocketBase returns different error types depending on the operation:

### Validation Errors (422)

Returned when a field fails a validation rule:

```json
{
  "status": 422,
  "response": {
    "data": {
      "email": {
        "code": "invalid_email",
        "message": "Invalid email address"
      },
      "name": {
        "code": "required",
        "message": "Please fill out this field"
      }
    }
  }
}
```

**Validation codes:**
- `required` — field is empty
- `invalid_email` — email format invalid
- `invalid_url` — URL format invalid
- `regex` — failed regex validation
- `unique` — violates unique constraint
- And others depending on field type and rules

### Authentication Errors (401)

Token expired or invalid:

```json
{
  "status": 401,
  "response": {
    "message": "The request requires valid record authorization token."
  }
}
```

**Action:** Call `refreshAuth()` to get a new token, or redirect to login.

### Permission Errors (403)

Access rule denied:

```json
{
  "status": 403,
  "response": {
    "message": "Only users can access this resource."
  }
}
```

**Action:** Show user message that they don't have permission.

### Record Not Found (404)

Record doesn't exist:

```json
{
  "status": 404,
  "response": {
    "message": "The requested resource was not found."
  }
}
```

**Action:** Redirect to list or show "not found" message.

### Server Errors (500, etc.)

Server-side errors:

```json
{
  "status": 500,
  "response": {
    "message": "Something went wrong."
  }
}
```

**Action:** Log and show user a generic error message.
