# Migrations

This file is intended to help AI Coding Agents know important information about writing and using migrations in Pocketbase.

## Important Tips

Imports (commonjs) do not work in migration files.

## Delete Database and start from base migrations

Delete the data inside the `./pocketbase/pb_data` folder. Run Docker again and it will recreate the data in the folder. Here's a dev tool for it:
```sh
make db-reset
```

## Remove unwanted migrations

If you've made changes and have since manually reverted them so the migrations no longer apply, you can use the following to reset your migrations table to the proper state. Ex: You added a field to a schema, then later on removed it because you changed your mind.

First, delete any unwanted migrations from `pocketbase/pb_migrations/*.js`. You should only deleted uncommitted migrations. If they were committed, the auto-deployment may have already run the migration.

Then, run the following:
```sh
make migrations-sync
```

This command will remove any entry from the `_migrations` table that doesn't have a related migration file associated with it.

## Collection Field Options

Pocketbase supports various field options that control validation, display, and behavior. Here are the available options with their property names:

### Basic Display Options
- **`hidden`** - Whether the field is hidden from API responses (default: false)
- **`presentable`** - Whether the field is included in the "presentable" API response (default: false)

### Validation Options
- **`required`** - Whether the field is required (equivalent to "Nonempty") (default: false)
- **`pattern`** - Regex pattern for validation (e.g., `"^[a-z0-9]+$"`, `"^\\d{10}$"`)
- **`min`** - Minimum length/value for text/number fields
- **`max`** - Maximum length/value for text/number fields
- **`autogeneratePattern`** - Pattern for auto-generating values (e.g., `"[a-z0-9]{15}"`)

### System Options
- **`system`** - Whether this is a system field (like id, created, updated) (default: false)
- **`primaryKey`** - Whether this field is the primary key (default: false)

### Relation-Specific Options
- **`cascadeDelete`** - Whether to cascade deletes for relation fields (default: false)
- **`collectionId`** - The target collection ID for relation fields
- **`maxSelect`** - Maximum number of records that can be selected (for multi-select relations)
- **`minSelect`** - Minimum number of records that must be selected

### Date-Specific Options
- **`onCreate`** - Whether to set the date on record creation (for autodate fields)
- **`onUpdate`** - Whether to update the date on record modification (for autodate fields)

### Common Field Types and Their Options

**Text Fields**
```javascript
{
  "type": "text",
  "pattern": "^[a-z0-9]+$",
  "min": 15,
  "max": 15,
  "autogeneratePattern": "[a-z0-9]{15}"
}
```

**Relation Fields**
```javascript
{
  "type": "relation",
  "collectionId": "_pb_users_auth_",
  "maxSelect": 1,
  "minSelect": 0,
  "cascadeDelete": false
}
```

**Autodate Fields**
```javascript
{
  "type": "autodate",
  "onCreate": true,
  "onUpdate": false
}
```

**Boolean Fields**
```javascript
{
  "type": "bool"
}
```

## See Also

- [Backend Development](./development.md) - Backend development patterns
- [Collections](./collections.md) - Collection management
- [Access Permissions](./access-permissions.md) - API security
- [Hooks](./hooks.md) - Hook development patterns
