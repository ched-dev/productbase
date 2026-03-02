# Type Generation

This guide explains how ProductBase automatically generates TypeScript types from your PocketBase database schema.

## Overview

The `generate-pb-types` script (`frontend/tasks/generate-pb-types.mjs`) reconstructs your PocketBase schema by replaying migrations, then generates TypeScript interfaces for each collection.

```sh
cd frontend
npm run generate-pb-types
```

### Workflow

1. **Write migration** → Add a new PocketBase collection in `pocketbase/pb_migrations/*.js` (this can also be done from the [PocketBase Admin Panel](./pocketbase-admin-panel.md))
2. **Run script** → In the frontend, `npm run generate-pb-types`
3. **Commit types** → Generated file `frontend/src/types/PBCollections.d.ts` is committed
4. **Use in code** → Collection interfaces are imported and used in hooks and components

## Generated File Structure

### Example Output

```ts
// frontend/src/types/PBCollections.d.ts
// Auto-generated. DO NOT EDIT MANUALLY.

interface PBBaseRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
}

export interface UserFeedbackRecord extends PBBaseRecord {
  id: string;
  user?: string;
  feedback_type: string;
  message: string;
  reply_desired?: boolean;
  metadata?: string;
  feedback_actions?: string[];
  collectionName: 'user_feedback';
}

export interface UserPreferencesRecord extends PBBaseRecord {
  id: string;
  user: string;
  alert_preferred_method: string;
  alert_phone_number?: string;
  collectionName: 'user_preferences';
}

export type CollectionRecords = {
  feedback_actions: FeedbackActionsRecord;
  user_feedback: UserFeedbackRecord;
  user_preferences: UserPreferencesRecord;
};
```

### Key Components

- **`PBBaseRecord`** — Base interface with system fields inherited by all collections
- **`<CollectionName>Record`** — Typed interface for each collection
  - Fields are optional (`?`) if the PocketBase field is optional
  - Required fields have no `?`
  - `collectionName` is a string literal (e.g., `'user_feedback'`)
- **`CollectionRecords`** — Union type mapping collection names to their record type

## Using Generated Types

### In Collection Hooks

```tsx
import type { UserFeedbackRecord } from '@/types'
import { usePocketbaseCollection } from './usePocketbaseCollection'

export function useUserFeedbackCollection() {
  return usePocketbaseCollection<UserFeedbackRecord>('user_feedback', {
    sort: '-created',
    attachUserOnCreate: true,
  })
}
```

### In Components

```tsx
function FeedbackItem({ feedback }: { feedback: UserFeedbackRecord }) {
  return (
    <div>
      <h3>{feedback.feedback_type}</h3>
      <p>{feedback.message}</p>
      {feedback.reply_desired && <strong>Wants a reply</strong>}
    </div>
  )
}
```

## Type Mapping Reference

How PocketBase field types map to TypeScript:

| PocketBase Type | TypeScript Type | Notes |
|-----------------|-----------------|-------|
| `text` | `string` | |
| `email` | `string` | Validated at database level |
| `url` | `string` | Validated at database level |
| `number` | `number` | |
| `bool` | `boolean` | |
| `date` | `string` | ISO date string |
| `select` | `string` | Enum values not captured |
| `relation` | `string \| string[]` | Single or many depending on field config |
| `file` | `string \| string[]` | File path(s) |
| `json` | `unknown` | No specific type information |
| `password` | (not exposed) | Only available server-side |
| System fields | (in `PBBaseRecord`) | `id`, `created`, `updated`, `collectionId`, `collectionName` |


## Known Limitations

### `json` Fields Are Untyped

JSON fields become `unknown`:

```ts
// PocketBase field: "metadata" (type: json)
metadata?: unknown
```

TBD: A plan will need to be implemented for typing these on the frontend.

### `select` Fields Don't Capture Enum Values

Select fields become plain strings:

```ts
// PocketBase field: "feedback_type" (type: select, options: "bug|feature|general")
feedback_type: string  // Should be 'bug' | 'feature' | 'general'

// Workaround: create a type constant
export const FEEDBACK_TYPES = ['bug', 'feature', 'general'] as const
export type FeedbackType = typeof FEEDBACK_TYPES[number]
```

TBD: A plan will need to be implemented for typing these on the frontend.

### System Fields Are Redundantly Declared

The `id` and `collectionName` fields appear on both `PBBaseRecord` and individual record interfaces. This is intentional — the interface-level declarations narrow `collectionName` to a literal type for better type safety. Don't remove them.
