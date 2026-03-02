# Collections


## Important Notes

## Collection Types
- Base is the standard collection type most frequently used
- View is a read-only collection likely aggregated from other collections data
- Auth is a special collection to store user-like records and is unlikely to be needed for most cases

## Collection Naming
- Use lowercase with underscores
- Keep pluralized (e.g., `blog_posts`, not `blog_post`)

## Collection Fields
Common fields include `id, created, updated` fields.
Added fields should follow the snake case format, e.g. `alert_method_preferred`.

To keep data integrity, make sure to set the validation options (min/max length, validation pattern, nonempty, etc.) as strict as possible. Errors when updating here will be auto-generated and returned from the API. This layer is our server-side field validation.

Relational fields should use singular or plural of the related collection, based on one-to-one or one-to-many relationship. Don't use `*_id` field names. Pocketbase will store the unique id property in the field, but expanded relations will also live here, so a `user_id` with the full user won't make sense. Use this table for examples:
|one-to-one|one-to-many|
---
|user|users|
|feedback|feedback|
|owner|owners|
|membership|memberships|

### Field Naming

- Use lowercase with underscores
- Keep pluralized (e.g., `blog_posts`, not `blog_post`)
- Date fields should start with `date_*`
- Don't use `*_id` field names, use the relation name instead
- Relation fields to the user should be named 'user', 'owner', or 'membership' for one-to-one relation - or plural versions for one-to-many

### Field Types

TBD

## Collection API Rules (Access Permissions)
Collections have API Rules to define access permissions which will be auto-verified at the API layer. More info is available in [access-permissions.md](./access-permissions.md).
