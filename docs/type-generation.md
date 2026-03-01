# Type Generation

This guide explains how ProductBase automatically generates TypeScript types from your PocketBase database schema.

## Overview

The `generate-pb-types` script (`frontend/tasks/generate-pb-types.mjs`) reconstructs your PocketBase schema by replaying migrations, then generates TypeScript interfaces for each collection.

### Workflow

1. **Write migration** → Add a new PocketBase collection in `pocketbase/pb_migrations/*.js`
2. **Run script** → `npm run generate-pb-types`
3. **Commit types** → Generated file `frontend/src/types/PBCollections.d.ts` is committed
4. **Use in code** → Collection interfaces are imported and used in hooks and components

---

## Running the Script

### When to Run

After creating or modifying migrations:

```bash
cd frontend
npm run generate-pb-types

# Or from project root:
npm --prefix frontend run generate-pb-types
```

### What It Does

1. Reads all `.js` migration files from `pocketbase/pb_migrations/` (in order)
2. Replays them against a mock PocketBase runtime to reconstruct the current schema
3. Maps PocketBase field types to TypeScript types
4. Generates `frontend/src/types/PBCollections.d.ts`

### If It Fails

- **Silent failures**: Migrations that fail are ignored (usually system-level settings migrations)
- **Malformed migrations**: Fix the migration file and retry
- **Schema confusion**: Check that migrations are in the correct order (numerically named)

---

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

---

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

### Generic Type-Safe Handlers

```tsx
import type { CollectionRecords } from '@/types'

function saveRecord<K extends keyof CollectionRecords>(
  name: K,
  record: CollectionRecords[K]
) {
  // 'record' is typed as the correct interface for the collection
  console.log(record.created)  // OK, all records have 'created'
  console.log(record.id)       // OK, all records have 'id'
  // TypeScript knows about collection-specific fields
}

saveRecord('user_feedback', { message: 'Bug report', feedback_type: 'bug' })
// TypeScript error if properties don't match UserFeedbackRecord
```

---

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

---

## Known Limitations

### `json` Fields Are Untyped

JSON fields become `unknown`:

```ts
// PocketBase field: "metadata" (type: json)
metadata?: unknown

// To fix: cast when using
const meta = feedback.metadata as Record<string, unknown>
const camera = meta?.camera as string | undefined
```

**Workaround:** Create a separate type definition and cast it:

```ts
interface FeedbackMetadata {
  camera?: string
  location?: string
}

const meta = feedback.metadata as FeedbackMetadata | undefined
```

### `select` Fields Don't Capture Enum Values

Select fields become plain strings:

```ts
// PocketBase field: "feedback_type" (type: select, options: "bug|feature|general")
feedback_type: string  // Should be 'bug' | 'feature' | 'general'

// Workaround: create a type constant
export const FEEDBACK_TYPES = ['bug', 'feature', 'general'] as const
export type FeedbackType = typeof FEEDBACK_TYPES[number]
```

### `relation` Fields Don't Capture Related Type

Relation fields become string IDs only:

```ts
// PocketBase field: "user_id" (type: relation, target: "users")
user_id: string  // Should ideally be UsersRecord['id']

// Use expand to get the actual related record
feedback.getOne(id, { expand: 'user_id' })
// Then access expanded data: feedback.data.user_id.email
```

### System Fields Are Redundantly Declared

The `id` and `collectionName` fields appear on both `PBBaseRecord` and individual record interfaces. This is intentional — the interface-level declarations narrow `collectionName` to a literal type for better type safety. Don't remove them.

---

## Regenerating Types

If your schema changes and you forget to regenerate:

1. **Add a new collection** → migrations create it → `npm run generate-pb-types`
2. **Modify a collection** → migrations update it → `npm run generate-pb-types`
3. **Delete a collection** → migrations delete it → `npm run generate-pb-types`

The generated file is always a snapshot of the current schema, so the workflow is: change schema → regenerate → commit both migration and generated types.

---

## Script Implementation Notes

The script:

- Uses a mock PocketBase runtime (not a real database)
- Replays migrations in order (relies on numeric filename sorting)
- Catches and ignores migration errors (system migrations may fail in the mock)
- Generates a single flat `.d.ts` file (all types in one place)
- Does **not** recurse into nested `expand` fields (you still get strings for relation IDs)

---

## See Also

- [TanStack Query Hooks](./tanstack-query-hooks.md) — how to use generated types with collection hooks
- [Collections](./collections.md) — defining collections and fields in PocketBase
- [Migrations](./migrations.md) — writing migrations that define schema
