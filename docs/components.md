# Frontend Components

This file is intended to help AI Coding Agents know important information about the common practices this code base uses when writing pages or components.

## Important Tips

Any addition of queries to the pocketbase backend should live in the `./frontend/src/lib/query/*` files. See the `organizations.ts` file for and example.

We heavily rely on the `PBDataList` and `PBData` classes to wrap responses from pocketbase so we can have a standardized way to work with returned data. Here are some key details about the classes:
**PBDataList**
Used to wrap the list endpoints with pagination values. The class provides helper methods and converts the items to **PBData** instances.
**PBData**
Used to wrap individual records. Converts the data to squash the `expand.*` values onto the object so relations can easily be accessed. It also removes the `_via_*` suffix for back-relations. For Example:
```js
// standard pocketbase response structure
user.expand.user_feedback_via_user; // array of user_feedback
// PBData instance structure
user.user_feedback; // array of user_feedback
```

Due to the standardized way we write our query functions, all errors thrown should be of the type **ClientResponseError**. We need to catch these errors and make them availabe to the component in a standardized way using the type of **ApiError**. This can be done by setting the error state with the converted error. For example:
```js
// to hold state
const [apiError, setApiError] = useState<ApiError | null>(null);

// to make request
getUserOrganizations()
  .then(x => {})
  .catch(err => setApiError(getApiError(err)))
```

Function naming inside components have the following rules:
- Functions which handle state changes should be named as `handle*`, E.g. `handleSignIn(), handleSignUp()`
- Functions for events such as click, form submit, change, should be named as `on*`, E.g. `onClick(), onSubmit(), onKeyPress()`
- Functions for rendering elements should be named as `render*`, E.g. `renderForm(), renderStats()`
