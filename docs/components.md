# Frontend Components

This file is intended to help AI Coding Agents know important information about the common practices this code base uses when writing pages or components.

## Important Tips

Any addition of queries to the pocketbase backend should follow the [querying](./querying.md) doc. Components should only be loading in the query hooks (`./frontend/src/queryHooks/*`) that will be used to make queries, not making queries directly from the component.

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

I don't like using `useEffect()` to react to state changes. I would rather have callbacks instead. If you are creating new reusable code, prefer to make callbacks instead of forcing consumer to use `useEffect()` for event triggers.

Forms have the following reusable code:
- `./frontend/src/hooks/useFormState.ts` for basic form state handling
- Mantine UI for form fields
- `./frontend/src/components/FieldError.tsx` to show field errors
- Use FormData for values, do not create local state unless it needs to be controlled
- './frontend/src/components/FeedbackWidget.tsx` is a good example of a single form
- CRUD forms will need to be planned out when we implement the first one. For now, I know I will want to have the Create / Edit form to be one component to reduce duplication of code.