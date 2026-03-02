# Pocketbase Admin Panel

The pocketbase admin panel is the admin UI served up at `http://localhost:8100/_/` in the local environment, or `https://domain.com/_/` in the production environment. Only superusers are allowed to access the admin panel.

IMPORTANT: AI Agents should ignore this information unless they are instructed to do something in the admin panel.

## Creating or Modifying Schemas

Any changes to the [PB admin > Collections](http://localhost:8100/_/#/collections) schemas (create or modify) will create a migration file in `pocketbase/pb_migrations/*.js`. These are committed to the repo so every instance schema will stay in sync. These do not include data from the database. The data will stay with the files in `./pocketbase/pb_data`, which is ignored in git.

## Adding a new collection

You can create a new collection from the [PB admin > Collections](http://localhost:8100/_/#/collections) page.

Name the collection with all lowercase letters and underscores, and keep it pluralized (Ex: `blog_posts` not `blog_post`).

Use the `type: Base` collection for any new standard data. Use a `type: View` for making a virtual table that is read-only and based on a query. You probably don't need to create an additional `type: Auth` collection.

Keep the `id, created, updated` fields and add your own. Added fields should follow the snake case format, e.g. `alert_method_preferred`.

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

Learn more about [Access Permissions](./access-permissions.md).

## Managing User Auth Settings

Go to the [Collections > Users](http://localhost:8100/_/#/collections?collection=_pb_users_auth_) page in the PB admin and click on the edit icon next to the name. This is our table of customers registered to for the website.

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
