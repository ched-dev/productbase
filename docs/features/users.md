# Users

This file is intended to help AI Coding Agents know important information about how users work in Pocketbase and the ProductBase extension.

## Important Notes

### Type of Users

A **superuser** is someone who is the admin of the entire application. This may be a developer, product owner, or similar. This type of user does not login to the application itself, but only the Pocketbase admin panel. They show up in the `_superusers` collection in Pocketbase.

A **user** is a person who has signed up for the product. They can only login to the frontend and do not have access to the Pocketbase admin panel. They show up in the `users` collection in Pocketbase.

Additionally, a **user** ties into the **organizations** feature outlined in `./docs/organizations.md`.

## Managing User Auth Settings

Additional user management tasks can be completed in the [Pocketbase admin panel](../frontend/pocketbase-admin-panel.md). Here's some examples of actions:
- Enable / disable various auth methods (email login, OAuth, OTP, MFA)
- Modify any of the emails sent related to auth (verification, password reset, etc.)
- Change the durations on the Tokens generated for auth
- Only allow verified users to authenticate
- Disable user signup (closed registrations)
- Invite only registration (signup for limited users)
- Impersonating a user (also can be done [through SDK code](https://pocketbase.io/docs/authentication/#users-impersonation))
- Invalidating all user auth tokens for specific feature (auth duration, email verification, password reset, email change duration, protected file access)
