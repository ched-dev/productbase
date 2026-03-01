# Hooks

This file is intended to help AI Coding Agents know important information about writing hooks in Pocketbase backend. None of this is about React hooks.

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


The preferred method to throw errors from hooks are using the pocketbase provided error classes. Code Examples:
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

Imports use `require()` and exports use `module.exports = {}`, a.k.a. the commonjs format. Imports in hook files are relative to the current working directory (CWD) and not to the `pb_hooks` folder. Using relative paths allows my IDE to keep proper file references. The variable name should be the uppercased name of the file. For example:
```js
const Organizations = require(`./organizations.js`)
```

Additional information about routing middlewares and the `RequestEvent` passed to hooks can be found on the [routing](https://pocketbase.io/docs/js-routing/) documentation.