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

| Type | Key Options |
|------|-------------|
| `text` | `min`, `max`, `pattern`, `autogeneratePattern`, `presentable`, `primaryKey` |
| `number` | `min`, `max`, `onlyInt` |
| `bool` | — |
| `select` | `maxSelect`, `values` (array of allowed strings) |
| `email` | `onlyDomains`, `exceptDomains` |
| `url` | `onlyDomains`, `exceptDomains` |
| `date` | `min`, `max` |
| `file` | `maxSelect`, `maxSize`, `mimeTypes`, `thumbs`, `protected` |
| `json` | `maxSize` |
| `geoPoint` | — (use `hidden: true` for internal/system use) |
| `autodate` | `onCreate`, `onUpdate` (auto-set timestamps) |

The `hidden: true` option can be applied to any field to exclude it from API responses.

Example migration with all field types:
```js
/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": null,
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select3130271566",
        "maxSelect": 1,
        "name": "log_level",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "info",
          "debug",
          "log",
          "warn"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3065852031",
        "max": 0,
        "min": 0,
        "name": "message",
        "pattern": "",
        "presentable": true,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "number1997877400",
        "max": 5000,
        "min": 10,
        "name": "code",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "bool287399681",
        "name": "is_error",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "exceptDomains": [],
        "hidden": false,
        "id": "email3885137012",
        "name": "email",
        "onlyDomains": [],
        "presentable": false,
        "required": false,
        "system": false,
        "type": "email"
      },
      {
        "exceptDomains": [],
        "hidden": false,
        "id": "url917281265",
        "name": "link",
        "onlyDomains": [],
        "presentable": false,
        "required": false,
        "system": false,
        "type": "url"
      },
      {
        "hidden": false,
        "id": "date2862495610",
        "max": "",
        "min": "",
        "name": "date",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "file2036324795",
        "maxSelect": 1,
        "maxSize": 0,
        "mimeTypes": [],
        "name": "attachment",
        "presentable": false,
        "protected": false,
        "required": false,
        "system": false,
        "thumbs": [],
        "type": "file"
      },
      {
        "hidden": false,
        "id": "json3264396956",
        "maxSize": 0,
        "name": "message_json",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "json"
      },
      {
        "hidden": true,
        "id": "geoPoint536888524",
        "name": "ip_location",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "geoPoint"
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_444539071",
    "indexes": [
      "CREATE UNIQUE INDEX `idx_cocPthS2AQ` ON `activity_logs` (`link`)",
      "CREATE INDEX `idx_PRn3iZqsm3` ON `activity_logs` (`log_level`)"
    ],
    "listRule": "@request.auth.id != \"\"",
    "name": "activity_logs",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": "@request.auth.id != \"\""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_444539071");

  return app.delete(collection);
})
```

## Collection API Rules (Access Permissions)
Collections have API Rules to define access permissions which will be auto-verified at the API layer. More info is available in [access-permissions.md](./access-permissions.md).

## Seed Data

New collections should have a fake data generator added to `frontend/tasks/seed-collection.mjs` to support the `make seed-collection` command. Use AI to generate the seed data code by providing it with context about the collection type and the existing file.

Before generating seed data, make sure the collection's TypeScript type has been generated first by running `npm run generate-pb-types` (from the `frontend/` directory) so that `frontend/src/types/PBCollections.d.ts` is up to date.

Example prompt:

> Add a new fake data generator for the `<collection_name>` collection to `frontend/tasks/seed-collection.mjs`. Match the existing pattern in the file. Refer to the collection's type definition in `frontend/src/types/PBCollections.d.ts` for field names and types. Generate realistic fake data with randomized values. If the collection has relation fields, fetch existing records from the related collection first (see `memberships` generator for an example).
