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

### Field Naming
- Use lowercase with underscores
- Keep pluralized (e.g., `blog_posts`, not `blog_post`)
- Date fields should start with `date_*`

### Field Options
- Hidden
- Presentable
- Unique
- Nonempty

## Collection API Rules (Access Permissions)
Collections have API Rules to define access permissions which will be auto-verified at the API layer. More info is available in [access-permissions.md](./access-permissions.md).