# Backend Querying

This file is intended to help AI Coding Agents know important information about **querying** Pocketbase for data from the backend. This covers querying patterns for migrations and hooks.

## Overview

Backend querying in PocketBase involves using the PocketBase SDK to retrieve, filter, and manipulate data within migrations and hooks. This section covers the patterns and best practices for efficient data access.

## Querying from the Backend

In the backend, the querying will use the same syntax whether it is in **migrations** or **hooks**. The injected API values can be found in the type file `./pocketbase/pb_data/types.d.ts`.

### Basic Query Patterns

```js
// Getting a collection
const usersCollection = $app.findCollectionByNameOrId('users')
const organizationsCollection = $app.findCollectionByNameOrId('organizations')

// Getting multiple records with filter and sorting
const playlistsCollection = $app.findRecordsByFilter(
  'playlists',      // collection name or id
  'active = true',  // filter
  '+playlist_type,+playlist_position', // sort - supports multiple levels
  1000,   // limit
  0,      // offset
)

// Getting a single record by id
const playlist = $app.findRecordById('playlists', '<PLAYLIST_ID>')

// Getting a single record by other than id
const [connection] = $app.findRecordsByFilter(
  'connections',    // collection
  'type = {:type}', // filter
  '-id',            // sort
  10,               // limit
  0,                // offset
  { type: 'youtube' } // bound variables
)

// Getting first record using a filter
const membership = $app.findFirstRecordByFilter(
  'memberships',  // collection
  `user = {:userId} && organization = {:organizationId}`, // filter
  { userId, organizationId } // bound variables
)

// Expanding relationships with access checks
const memberships = $app.findRecordsByFilter(
  'memberships',
  `user = {:userId}`,
  1000,
  0,
  { userId }
)
$apis.enrichRecords(e, memberships, 'organization')
```

### Advanced Query Patterns

#### Complex Filtering

```js
// Multiple conditions with logical operators
const records = $app.findRecordsByFilter(
  'user_feedback',
  'status = "active" && (priority = "high" || priority = "medium")',
  '-created',
  100,
  0
)

// Using bound variables for security
const records = $app.findRecordsByFilter(
  'users',
  'email = {:email} && verified = true',
  '-created',
  10,
  0,
  { email: 'user@example.com' }
)

// Date range queries
const records = $app.findRecordsByFilter(
  'events',
  'start_date >= {:start} && end_date <= {:end}',
  '-created',
  50,
  0,
  { 
    start: '2023-01-01',
    end: '2023-12-31'
  }
)
```

#### Aggregation and Statistics

```js
// Count records
const count = $app.findRecordsByFilter(
  'user_feedback',
  'status = "active"',
  '',
  0, // No limit
  0
).length

// Get latest record
const latest = $app.findFirstRecordByFilter(
  'user_feedback',
  'status = "active"',
  '-created'
)

// Get oldest record
const oldest = $app.findFirstRecordByFilter(
  'user_feedback',
  'status = "active"',
  '+created'
)
```

### Working with JSON Fields

JSON fields need additional code to extract subproperties with objects or arrays:

```js
// Query for record by id
const pbPlaylist = $app.findRecordById('playlists', '<PLAYLIST_ID>')

// Define model schema for record
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

// Now we can access
playlist.playlist_thumbnails.maxres
playlist.playlist_videos.length

// These won't work
pbPlaylist.playlist_thumbnails.maxres
pbPlaylist.playlist_videos.length

// Extracting the details property - values must match data type
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

### Performance Optimization

#### Use Indexes

```js
// Create indexes for frequently queried fields
{
  "name": "idx_user_email",
  "unique": true,
  "fields": ["email"]
}

{
  "name": "idx_feedback_status",
  "unique": false,
  "fields": ["status", "created"]
}
```

#### Limit Results

```js
// Always limit results to prevent memory issues
const records = $app.findRecordsByFilter(
  'user_feedback',
  'status = "active"',
  '-created',
  100, // Limit to 100 records
  0
)

// For pagination
const page = 2
const pageSize = 20
const offset = (page - 1) * pageSize

const records = $app.findRecordsByFilter(
  'user_feedback',
  'status = "active"',
  '-created',
  pageSize,
  offset
)
```

### Error Handling

Some methods throw errors when results are not found, some do not. Inspect the types to properly handle errors if needed.

## Frontend Querying Reference

For frontend querying patterns to access Pocketbase data, see the [Query Hooks](../frontend/query-hooks.md) documentation.

**Key differences:**
- Backend: Uses PocketBase SDK directly
- Frontend: Uses Query hooks that wrap PocketBase SDK
- Backend: Synchronous operations
- Frontend: Asynchronous operations with caching

## Best Practices

### Use Bound Variables

Always use bound variables to prevent injection attacks:

```js
// ✅ Good: Use bound variables
const records = $app.findRecordsByFilter(
  'users',
  'email = {:email}',
  '-created',
  10,
  0,
  { email: userEmail }
)

// ❌ Bad: String concatenation
const records = $app.findRecordsByFilter(
  'users',
  `email = "${userEmail}"`,
  '-created',
  10,
  0
)
```

### Use Appropriate Query Methods

```js
// For single record by ID
const record = $app.findRecordById('users', userId)

// For single record with filter
const record = $app.findFirstRecordByFilter('users', 'email = {:email}', { email: 'user@example.com' })

// For multiple records
const records = $app.findRecordsByFilter('users', 'status = "active"', '-created', 100, 0)
```
