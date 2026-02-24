# Pocketbase Backend

Pocketbase is a backend server in a single file binary. It includes:

- Database (SQLite)
- REST API
- Authentication (Email, OAuth, MFA)
- Storage (Local, S3)
- GO/JS SDK
- Backups
- Cron Jobs
- Logs UI


# Tips

## Creating or Modifying Schemas

Any changes to the [PB admin > Collections](http://localhost:8100/_/#/collections) schemas (create or modify) will create a migration file in `pocketbase/pb_migrations/*.js`. These are committed to the repo for everyone to stay in sync. These do not include example data. The data will stay with the files in `pocketbase/pb_data`, which is ignored in git.

## Adding a new collection

You can create a new collection from the [PB admin > Collections](http://localhost:8100/_/#/collections) page.

Name the collection with all lowercase letters and underscores, and keep it pluralized (Ex: `blog_posts`).

Use the `type: Base` collection for any new standard data. Use a `type: View` for making a virtual table that is read-only and based on a query. You probably don't need to create an additional `type: Auth` collection.

Keep the `id, created, updated` fields and add your own.

To keep data integrity, make sure to set the validation options (min/max length, validation pattern, nonempty) as strict as possible. Errors when updating here will be auto-generated and returned from the API. This layer is our server-side field validation.

## Hide a field from being returned in the API (private data properties)

In the collection schema, on the field you wish to hide, use the gear edit icon and make sure **Hidden** is **true** (checked).

## Show a field in a relation

In the collection schema, on the field you wish to show in relations, use the gear edit icon and make sure **Presentable** is **true** (checked).

## Adding a unique field

In the collection schema, on the field you wish to mark as unique, scroll down to **Unique constraints and indexes** and add a new index, mark it **Unique**, choose the field to apply it to, and save it.

There is no need to mark the `id` field unique.

## Change access permissions to a collection

When creating or updating a collection schema, click on the **API Rules** tab. Fields will default to superusers only, if you click it and leave with an empty value, it will allow anyone.

Sample permission rules:
```
// general format - field_name must be on the model
<field_name> = <expression>

// access only items you own
user_id = @request.auth.id

// allow only registered users
@request.auth.id != ""

// based on request body value
@request.body.invite_code = "betaboys"

// based on a property (only show published items)
is_publised = true
published_date >= @now

// force a value to be set
@request.body.role:isset = true

// check example submitted data: {"someSelectField": ["val1", "val2"]}
@request.body.someSelectField:length > 1

// check existing record field length
someRelationField:length = 2

// basic and / or syntax
@request.auth.id != "" && (status = "active" || status = "pending")

// must be user in `allowed_users` relation field
@request.auth.id != "" && allowed_users.id ?= @request.auth.id
```

View the documentation for [Filters Syntax](https://pocketbase.io/docs/api-rules-and-filters/#filters-syntax) and helpful [@macros](https://pocketbase.io/docs/api-rules-and-filters/#-macros) and [modifiers](https://pocketbase.io/docs/api-rules-and-filters/#isset-modifier) such as `:isset`, `:length`, `:lower`.

## Delete Database and start from base migrations

Delete the data inside the `pocketbase/pb_data` folder. Run a `docker-compose up` and it will recreate the data in the folder.

## Remove unwanted migrations

If you've made changes and have since manually reverted them so the migrations no longer apply, you can use the following to reset your migrations table to the proper state. Ex: You added a field to a schema, then later on removed it because you changed your mind.

First, delete any unwanted migrations from `pocketbase/pb_migrations/*.js`. You should only deleted uncommitted migrations. If they were committed, the auto-deployment may have already run the migration.

Then, run the following:
```sh
docker ps
# find the CONTAINER ID (Ex: 41fdf49fb7cd) for productbase_pocketbase
docker exec -it CONTAINER_ID /pb/pocketbase migrate history-sync
```

The `docker exec` command will remove any entry from the `_migrations` table that doesn't have a related migration file associated with it.

## Managing User Auth Settings

Go to the [Collections > Users](http://0.0.0.0:8100/_/#/collections?collection=_pb_users_auth_) page in the PB admin and click on the edit icon next to the name. This is our table of customers registered to for the website.

Click on the **Options** tab.

You can enable / disable various auth methods here (email login, OAuth, OTP, MFA), as well as modify any of the emails sent related to auth (verification, password reset, confirm email change, otp message, login alert). Finally, you can change the durations on the Tokens generated for auth.

## Only allow verified users to authenticate

> Start from Users table (see "Managing User Auth Settings" above)

Change to the **API Rules** tab, then scroll down and click on **Additional auth collection rules**.

Set the **Authentication rule** to **verified = true**.

## Disable user signup (closed registrations)

> Start from Users table (see "Managing User Auth Settings" above)

Change to the **API Rules** tab.

Change the **Create rule** to superusers only by clicking the **Set Superusers only** button in the top right.

## Invite only registration (signup for limited users)

> Start from Users table (see "Managing User Auth Settings" above)

Change to the **API Rules** tab.

Change the **Create rule** to **@request.body.invite_code = "betaboys"**.

This will return the following to anyone without the invite code on the request body:
```
{"data":{},"message":"Failed to create record.","status":400}
```

## Impersonating a user

> Start from Users table (see "Managing User Auth Settings" above)

In the top right menu, click on **Impersonate**.

Generate the token and use it in your API calls, or update your local cookie with it in devtools.

This can also be done [through SDK code](https://pocketbase.io/docs/authentication/#users-impersonation).

## Invalidating all user auth tokens

> Start from Users table (see "Managing User Auth Settings" above)

Change to the **Options** tab, then scroll down to **Other** section and expand **Tokens Options**.

Under each of the Token duration fields is a link to invalidate all tokens for that specific feature (auth duration, email verification, password reset, email change duration, protected file access).