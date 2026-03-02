# Backend Hooks

This file is intended to help AI Coding Agents know important information about writing hooks in Pocketbase backend. None of this is about React hooks.

## Overview

Backend hooks in PocketBase allow you to execute custom JavaScript code at specific points in the request lifecycle. They're essential for implementing business logic, validation, and data transformations.

## Important Tips

Official event hooks documentation can be found at https://pocketbase.io/docs/js-event-hooks/ and should be looked at for details on a specific hook.

Hooks live in the `./pocketbase/pb_hooks/main.pb.js` file. If additional helper functions are needed, they can be placed in `./pocketbase/pb_hooks/lib/*.js` files. The lib files cannot be imported at the top level in `main.pb.js`. They must be included within the hook. This rule does not apply to imports in the lib folder. This is a restriction of the GOJA runtime environment.

Available injected global values can be referenced from `./pocketbase/pb_data/types.d.ts` which is more accurate than any documentation elsewhere.

The code style for hook files are 2 space indentation, no semicolon, and single quotes for strings.

All hooks should call `e.next()` once and only once before returning, unless an error is thrown.

Anytime you are skipping a hook because the user is logged in as a superuser, you need to call `e.next()` before the return. Example:
```js
// Allow superusers to see all
if (e.auth?.isSuperuser()) {
  e.next()
  return
}
```

Where you call `e.next()` may be relevant. For example, in `onRecordCreateExecute` hooks it will trigger validation.

Prefer to target the hooks to specific collections. For example:
```js
onRecordCreateExecute((e) => {
  // ...
}, 'users') // only for users records
```

Hooks should always destructure the values they need from the event. For Example:
```js
onRecordCreateExecute((e) => {
  const { auth, record } = e

  if (auth?.isSuperuser()) {
    e.next()
    return
  }
  
  // ...
})
```
This also includes an example for skipping if the user is superuser, though that may not always be required.

Prefer to use the global `$app` (instead of `e.app`) which is available in the hooks context. Additional globals are available:
- `__hooks` - The absolute path to the app pb_hooks directory.
- `$app` - The current running PocketBase application instance.
- `$http.send` - Making HTTP calls synchronously (required in hooks context)
- `$apis.*` - API routing helpers and middlewares.
- `$os.*` - OS level primitives (accessing environment variables, executing shell commands, etc.).
- `$security.*` - Low level helpers for creating and parsing JWTs, random string generation, AES encryption, etc.
- And many more - for all exposed APIs, please refer to the [JSVM reference docs](https://pocketbase.io/jsvm/).

## Hook Types and Patterns

### Validation Hooks

Use `onRecordCreateExecute` and `onRecordUpdateExecute` for data validation:

```js
onRecordCreateExecute((e) => {
  const { record } = e
  
  // Custom validation logic
  if (!record.get('email')) {
    throw new BadRequest('Email is required')
  }
  
  // Cross-field validation
  const startDate = new Date(record.get('start_date'))
  const endDate = new Date(record.get('end_date'))
  
  if (endDate <= startDate) {
    throw new BadRequest('End date must be after start date')
  }
  
  e.next()
}, 'events')
```

### Business Logic Hooks

Use `onRecordAfterCreateSuccess` and `onRecordAfterUpdateSuccess` for side effects:

```js
onRecordAfterCreateSuccess((e) => {
  const { record, auth } = e
  
  // Send notification email
  $http.send({
    method: 'POST',
    url: process.env.NOTIFICATION_SERVICE_URL,
    body: JSON.stringify({
      action: 'create',
      collection: record.collectionName,
      recordId: record.id,
      createdBy: auth?.id
    })
  })
  
  // Update related records
  const relatedRecords = $app.findRecordsByFilter(
    'related_collection',
    'parent_id = {:id}',
    '-created',
    10,
    0,
    { id: record.id }
  )
  
  relatedRecords.forEach(record => {
    record.set('status', 'updated')
    $app.save(record)
  })
}, 'main_collection')
```

Alternatively, you can trigger events on error with `onRecordAfterCreateError` and `onRecordAfterUpdateError`.

All of the hooks exist for Collections too. Naming is `onCollection*`.

### Access Control Hooks

Use `onRecordListRequest` and `onRecordViewRequest` for filtering:

```js
onRecordListRequest((e) => {
  const { auth } = e
  
  if (!auth?.isSuperuser()) {
    // Filter to only show user's organization data
  }
  
  e.next()
}, 'user_feedback')
```

### Data Transformation Hooks

Modify data before or after persistence:

```js
onRecordBeforeCreate((e) => {
  const { record, auth } = e
  
  // Set default values
  record.set('created_by', auth?.id)
  record.set('status', 'pending')
  record.set('slug', generateSlug(record.get('title')))
  
  e.next()
}, 'posts')

onRecordAfterUpdateSuccess((e) => {
  const { record } = e
  
  // Update search index
  $http.send({
    method: 'POST',
    url: process.env.SEARCH_SERVICE_URL + '/index',
    body: JSON.stringify({
      id: record.id,
      title: record.get('title'),
      content: record.get('content')
    })
  })
  
  e.next()
}, 'posts')
```

## Error Handling

The preferred method to throw errors from hooks are using the pocketbase provided error classes:

```js
// construct ApiError with custom status code and validation data error
throw new ApiError(500, 'something went wrong', {
    'title': new ValidationError('invalid_title', 'Invalid or missing title'),
})

// if message is empty string, a default one will be set
throw new BadRequestError(optMessage, optData)      // 400 ApiError
throw new UnauthorizedError(optMessage, optData)    // 401 ApiError
throw new ForbiddenError(optMessage, optData)       // 403 ApiError
throw new NotFoundError(optMessage, optData)        // 404 ApiError
throw new TooManyrequestsError(optMessage, optData) // 429 ApiError
throw new InternalServerError(optMessage, optData)  // 500 ApiError
```

## Best Practices

### Use Helper Functions

Extract complex logic into helper functions:

```js
// In pb_hooks/lib/validation.js
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// In pb_hooks/main.pb.js
onRecordBeforeCreate((e) => {
  const { record } = e
  
  const Validation = require(`${__hooks}/lib/validation.js`)
  if (!Validation.validateEmail(record.get('email'))) {
    throw new BadRequest('Invalid email format')
  }
  
  e.next()
}, 'users')
```

### Use Transactions for Multiple Operations

When updating multiple records, ensure atomicity:

```js
onRecordAfterCreateSuccess((e) => {
  const { record } = e
  
  // Start transaction
  $app.runInTransaction((txApp) => {
    // Update related records
    const related = txApp.findRecordsByFilter(
      'related_collection',
      'parent_id = {:id}',
      '-created',
      10,
      0,
      { id: record.id }
    )
    
    related.forEach(r => {
      r.set('status', 'updated')
      txApp.save(r)
    })
    
    // Commit transaction
    txApp.commit()
  })
  
  e.next()
}, 'main_collection')
```

## Debugging Hooks

Add logging to debug hook execution:

```js
onRecordBeforeCreate((e) => {
  const { app } = e
  
  app.logger().log('Hook executed for:', e.record.collectionName)
  app.logger().debug('Auth:', e.auth)
  app.logger().debug('Record data:', e.record)
  
  e.next()
}, 'users')
```

Check logs in Docker:
```bash
docker logs productbase_pocketbase_1
```

## See Also

- [Collections](./collections.md) - Collection types and field options
- [Migrations](./migrations.md) - Database schema management
- [Access Permissions](./access-permissions.md) - API rules and filters
- [Backend Development](./development.md) - Backend development patterns
- [Querying](./querying.md) - Data retrieval patterns
