# Forms

This guide documents Form capabilities, patterns, and best practices in ProductBase.

## Overview

Forms in ProductBase provide a consistent way to implement across the entire application.

## Form Components

Components that provide common form inputs.

**Location:** `src/components/forms/`

### ActionIconButton

A reusable action button component that displays icons with optional confirmation dialogs and navigation support.

**Props:**
- `type: IconName` - The icon to display
- `ariaLabel: string` - Accessibility label for the button
- `variant?: ActionIconProps['variant']` - Button variant (defaults to 'transparent')
- `color?: ActionIconProps['color']` - Button color
- `size?: ActionIconProps['size']` - Button size
- `href?: string` - Navigation URL (uses React Router)
- `onClick?(): void | false` - Click handler
- `confirmation?: string` - Optional confirmation message before executing

**Usage:**
```tsx
// Simple action with confirmation
<ActionIconButton
  type="delete"
  ariaLabel="Delete item"
  color="red"
  confirmation="Are you sure you want to delete this item?"
  onClick={handleDelete}
/>

// Navigation action
<ActionIconButton
  type="edit"
  ariaLabel="Edit item"
  href={`/edit/${itemId}`}
/>
```

### CancelButton

A styled cancel button that provides consistent styling across forms.

**Props:**
- `onClick: React.MouseEventHandler<HTMLButtonElement>` - Click handler
- `label?: string` - Button text (defaults to 'Cancel')

**Usage:**
```tsx
<CancelButton onClick={() => navigate('/dashboard')} />
```

### FieldError

Displays field-specific validation errors from API responses.

**Props:**
- `name: string` - The field name to look up in errors
- `apiError: ApiError | null | undefined` - Error object from form submission

**Usage:**
```tsx
<FieldError name="email" apiError={apiError} />
```

### FormError

Displays high-level form errors (excludes field validation errors).

**Props:**
- `apiError: ApiError | null | undefined` - Error object from form submission
- `title?: string` - Optional title (defaults to 'Error')

**Usage:**
```tsx
<FormError apiError={apiError} />
```

### SaveButton

A styled save/submit button with loading state support.

**Props:**
- `submit?: boolean` - Whether this is a submit button (defaults to false)
- `onClick?: React.MouseEventHandler<HTMLButtonElement>` - Click handler
- `label?: string` - Button text (defaults to 'SAVE')
- `loading?: boolean` - Loading state
- `disabled?: boolean` - Disabled state

**Usage:**
```tsx
<SaveButton submit loading={isSubmitting} />
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

  const onSubmit = async (formData: FormData) => {
    if (feedbackId) {
      await feedback.update(feedbackId, formData)
    } else {
      await feedback.create(formData)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
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
<ButtonGroup>
  {/* Cancel button with navigation */}
  <CancelButton to="/feedback" />
  {/* Save button with loading state */}
  <SaveButton submit loading={feedback.loading} />
</ButtonGroup>
```

The Save/Submit button should be the last button. Put other actions before it.

## CRUD Forms

Create and edit operations should use the same form component when possible. Plan to accept a `defaultValues` prop for edit mode.

## Testing

TBD