# Querying with the Pocketbase SDK

This file is intended to help AI Coding Agents know important information about **querying** Pocketbase for data. Querying uses different SDKs depending if it comes from the frontend or backend.

## Querying from the backend

In the backend, the querying will use the same syntax whether it is in **migrations** or **hooks**. The injected API values can be found in the type file `./pocketbase/pb_data/types.d.ts`.

Example queries:
```js
// getting a collection
const usersCollection = $app.findCollectionByNameOrId('users')
const organizationsCollection = $app.findCollectionByNameOrId('organizations')

// getting multiple records with filter and sorting
const playlistsCollection = $app.findRecordsByFilter(
  'playlists',      // collection name or id
  'active = true',  // filter
  '+playlist_type,+playlist_position', // sort - supports multiple levels
  1000,   // limit
  0,      // offset
)

// getting a single record by id
const playlist = $app.findRecordById('playlists', '<PLAYLIST_ID>')

// getting a single record by other than id
const [connection] = $app.findRecordsByFilter(
  'connections',    // collection
  'type = {:type}', // filter
  '-id',            // sort
  10,               // limit
  0,                // offset
  { type: 'youtube' } // bound variables
)

// getting first record using a filter
const membership = $app.findFirstRecordByFilter(
  'memberships',  // collection
  `user = {:userId} && organization = {:organizationId}`, // filter
  { userId, organizationId } // bound variables
)

// expanding relationships with access checks
const memberships = $app.findRecordsByFilter(
  'memberships',
  `user = {:userId}`,
  1000,
  0,
  { userId }
)
$apis.enrichRecords(e, memberships, 'organization')
```

JSON fields need additional code to extract subproperties with objects or arrays. For example:
```js
// query for record by id
const pbPlaylist = $app.findRecordById('playlists', '<PLAYLIST_ID>')
// define model schema for record
const playlist = new DynamicModel({
  playlist_id: pbPlaylist.get('playlist_id'),
  playlist_slug: pbPlaylist.get('playlist_slug'),
  playlist_title: pbPlaylist.get('playlist_title'),
  playlist_description: pbPlaylist.get('playlist_description'),
  playlist_duration: pbPlaylist.get('playlist_duration'),
  playlist_thumbnails: new DynamicModel({ // JSON field
    default: {},
    high: {},
    maxres: {},
    medium: {},
    standard: {}
  }),
  playlist_videos: [] // arrays don't need DynamicModel definition
})
pbPlaylist.unmarshalJSONField('playlist_thumbnails', playlist.playlist_thumbnails)
pbPlaylist.unmarshalJSONField('playlist_videos', playlist.playlist_videos)
// now we can access
playlist.playlist_thumbnails.maxres
playlist.playlist_videos.length
// these won't work
pbPlaylist.playlist_thumbnails.maxres
pbPlaylist.playlist_videos.length

// extracting the details property - values must match data type
const youtubeAuth = new DynamicModel({
  access_token: '',
  expires_in: 3600, // 1 hour
  refresh_token: '',
  refresh_token_expires_in: 604800, // 7 days
  scope: '',
  token_type: ''
})
connection.unmarshalJSONField('details', youtubeAuth)
```

## Querying from the frontend

Queries in the components should use a custom React hook for each feature, such as `useOrganizations()` or `useUserFeedback()`. I will call these query hooks will have all the methods needed to interact with the feature and uses tanstack query under the hood. It will hide the need for creating and managing query keys. For example:
```js
const userFeedback = useUserFeedbackCollection()
userFeedback.create(data, RecordOptions) // calls createUserFeedback() query
userFeedback.list(RecordListOptions) // query for all user_feedback in pocketbase
userFeedback.all(RecordListOptions) // query for all pages of user_feedback in pocketbase
userFeedback.getOne(id, RecordOptions) // query for a single item
userFeedback.update(id, data, RecordOptions) // query to update single item
userFeedback.delete(id, CommonOptions) // query to delete 
userFeedback.fetching // maps to tanstack query isFetching
userFeedback.loading // maps to tanstack query isPending
userFeedback.success // maps to tanstack query isSuccess
userFeedback.error // ApiError when failed, null otherwise (truthy check = isError)
userFeedback.data // maps to tanstack query data
```

**File location:** `frontend/src/queryHooks/use<Feature>Collection.ts`

**Separation of concerns:** The hook uses the base `usePocketbaseCollection()` hook to make common PocketBase calls, and uses TanStack Query to handle request state — hooks and components must not make direct PocketBase calls.

**Return types:**
- `list()` and `all()` return `PBDataList` — use `.items`, `.totalItems`, `.page`, etc.
- `getOne()` returns `PBData` — access fields directly as properties

**State scope:** The status properties (`data`, `loading`, `fetching`, `success`, `error`) reflect the state of the last triggered operation. `list`, `all`, and `getOne` are TanStack queries; `create`, `update`, and `delete` are TanStack mutations — their states are tracked separately.

**Auto-invalidation:** On a successful mutation (`create`, `update`, `delete`), the hook automatically invalidates related `list`/`all` queries so components stay in sync without manual cache management.

## Expand Relations

[Working with Relations in Pocketbase SDKs](https://pocketbase.io/docs/working-with-relations/)

```ts
// has a `user` relation
const resultList = await pb.collection('user_feedback').getList(1, 50, {
  expand: 'user', // must be the relation field
  expand: 'user.user_preference', // sub-relations supported too
  expand: 'user.name,user.avatar', // won't work on non-relational fields
})
```

Back-relations querying for models which don't have the original relation
```ts
const resultList = await pb.collection('users').getList(1, 50, {
  // get user_feedback values via user relation match
  expand: 'user_feedback_via_user,user_feedback_via_user.feedback_actions',
})
```