# Error Handling

This guide documents error handling patterns in ProductBase, focusing on PocketBase API errors and validation.

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

  return (
    <form ref={formRef} onSubmit={handleSubmit(async (formData) => {
      await users.create(formData)
    })}>
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

  return (
    <form ref={formRef} onSubmit={handleSubmit(async (formData) => {
      await items.create(formData)
    })}>
      {apiError && (
        <Alert color="red" title="Error">
          {apiError.message}
        </Alert>
      )}
      {/* form fields */}
    </form>
  )
}
```

---

## Error Handling in Query Hooks

Mutations in query hooks throw `ApiError` (wrapped by TanStack Query).

### Pattern: Let useFormState Handle It

```tsx
const { formRef, handleSubmit } = useFormState({
  onError: (apiError) => {
    toast.error(apiError.message)
  },
})

<form ref={formRef} onSubmit={handleSubmit(async (formData) => {
  await collection.create(formData)
})}>
  {/* fields */}
</form>
```

---

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

---

## Error Handling in PocketBase Hooks

Backend errors should be thrown appropriately from migrations and hooks.

### Throwing Validation Errors

```javascript
// pocketbase/pb_migrations/1234_create_users_collection.js
$app.save(usersCollection);

// In a hook (main.pb.js):
$app.onRecordBeforeCreate((e) => {
  if (!e.record.getDataValue('email')) {
    throw new BadRequest('Email is required');
  }
}, 'users');
```

### Throwing Generic Errors

```javascript
// Any thrown error in a hook becomes a 400 Bad Request:
onRecordBeforeDelete((e) => {
  const org = $app.findCollectionByNameOrId('organizations');
  const memberships = $app.findRecordsByFilter(
    'memberships',
    'organization = "{:id}"',
    { id: e.record.id }
  );

  if (memberships.length > 0) {
    throw new Error('Cannot delete organization with active members');
  }
}, 'organizations');
```

---

## Best Practices

1. **Always use `getApiError` to normalize** — Never assume error shape; always normalize
   ```tsx
   const apiError = getApiError(err)  // Safe for any error type
   ```

2. **Show field-specific errors when available** — Use `validationError(field)` for per-field display
   ```tsx
   if (apiError.hasValidationError('email')) {
     // Show error near email input
   }
   ```

3. **Show general errors when validation is empty** — Fall back to the top-level message
   ```tsx
   const message = apiError.hasValidationErrors()
     ? 'Please fix the errors below'
     : apiError.message
   ```

4. **Log for debugging** — In development, log the full error
   ```tsx
   if (IS_DEV) console.error('API error:', err, apiError)
   ```

---

## See Also

- [PocketBase Client Library](./pocketbase-client.md) — error normalization details
- [TanStack Query Hooks](./tanstack-query-hooks.md) — error handling in mutations
- [Components](./components.md) — `FieldError` component
