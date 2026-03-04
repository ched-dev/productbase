# Forms

This guide documents Form capabilities, patterns, and best practices in ProductBase.

## Overview

Forms in ProductBase provide a consistent way to implement across the entire application.

## Form Components

Components that provide common form inputs. These are used sitewide so you can modify in one place for styling or functionality.

**Location:** `src/components/forms/`

| Component | Description |
|---|---|
| ActionIconButton | Icon button with optional confirmation and navigation |
| CancelButton | Styled cancel button for forms |
| ConfirmationMessage | Modal dialog for confirming destructive actions |
| DangerButton | Red button for dangerous/destructive actions |
| EmailInput | Email text input with client-side validation |
| FieldError | Inline validation error for individual fields |
| FormActionsGroup | Wrapper for grouping form action buttons |
| FormError | Alert for form-level API errors |
| SaveButton | Save/submit button with loading state |
| SecondaryButton | Subtle button for non-primary actions and navigation |

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

### SecondaryButton

A styled button for non-primary actions such as navigation, settings, or alternative paths. Uses the subtle variant (same as CancelButton) to visually distinguish from primary actions. Supports both click handlers and navigation via React Router links.

**Props:**
- `label: string` - Button text (required)
- `href?: string` - Navigation URL (uses React Router Link)
- `onClick?: React.MouseEventHandler<HTMLButtonElement>` - Click handler

**Usage:**
```tsx
// Navigation action
<SecondaryButton label="Settings" href="/organizations/123/edit" />

// Click handler action
<SecondaryButton label="Switch Mode" onClick={() => handleSwitch()} />
```

**When to use SecondaryButton vs CancelButton:**
- Use `CancelButton` when dismissing or canceling a form/modal (e.g., closing a dialog, abandoning edits)
- Use `SecondaryButton` for non-primary actions like navigation, settings, alternative paths, or mode switching

### FormActionsGroup

A wrapper component for form action buttons (Cancel, Save) that provides consistent grouping using Mantine's `Group`.

**Props:**
- `children: React.ReactNode` - The action buttons to render
- `justify?: string` - Flex justify-content value (default: 'flex-end')

**Usage:**
```tsx
<FormActionsGroup>
  <CancelButton onClick={() => navigate('/dashboard')} />
  <SaveButton submit loading={isSubmitting} />
</FormActionsGroup>
```

### DangerButton

A styled button for dangerous/destructive actions with red styling.

**Props:**
- `onClick?: React.MouseEventHandler<HTMLButtonElement>` - Click handler
- `label?: string` - Button text (defaults to 'Confirm')
- `loading?: boolean` - Loading state
- `disabled?: boolean` - Disabled state

**Usage:**
```tsx
<DangerButton onClick={handleDelete} label="Delete" />
```

### EmailInput

A text input for email addresses that validates the value on blur, requiring a proper `user@domain.tld` format. Wraps Mantine's `TextInput` with `type="email"` hardcoded.

**Props:** All `TextInput` props except `type`.

**Usage:**
```tsx
<EmailInput name="email" required placeholder="user@example.com" />
```

**Behavior:**
- On blur, validates against a regex requiring `local@domain.tld` format
- Blocks form submission via `setCustomValidity` when validation fails (browser shows native tooltip)
- Clears validation when the user resumes typing

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
<FormActionsGroup>
  <CancelButton onClick={() => navigate('/feedback')} />
  <SaveButton submit loading={feedback.loading} />
</FormActionsGroup>
```

The Save/Submit button should be the last button. Put other actions before it.

## CRUD Forms

Create and edit operations should use the same form component when possible. Plan to accept a `defaultValues` prop for edit mode.

## Testing

TBD