# Organizations

This file is intended to help AI Coding Agents know important information about the **organizations** feature in ProductBase.

## Important Notes

The **organizations** feature was implemented based on the blog article: https://www.flightcontrol.dev/blog/ultimate-guide-to-multi-tenant-saas-data-modeling

Another helpful article to the "why" can be found in the blog article: https://blog.bullettrain.co/teams-should-be-an-mvp-feature/

In PocketBase, we created collections for **organizations** and **memberships** which rely on **users**.

## Collection Schema

| Field | Type | Options |
|-------|------|---------|
| `id` | text | system, primaryKey, autogenerate |
| `name` | text | required, min: 1, max: 100 |
| `description` | text | optional, max: 500 |
| `owner` | relation | to users, required |
| `created` | autodate | |
| `updated` | autodate | |

## Roles & Permissions

| Action | Owner | Admin | Member | Authenticated (non-member) | Anonymous |
|--------|-------|-------|--------|---------------------------|-----------|
| List/View | Yes | Yes | Yes | No | No |
| Create | Yes* | Yes* | Yes* | Yes* | No |
| Edit | Yes | No | No | No | No |
| Delete | Yes | No | No | No | No |
| Transfer ownership | Yes (new owner must be existing member) | No | No | No | No |

\* Any authenticated user with a verified account.

- "Owner" refers to the `organization.owner` field.
- Verification is enforced by hook (not the API rule) to provide descriptive errors.
- Owner membership is auto-created on organization creation.

## Ownership Transfer

Ownership can be transferred via the organization edit page. When the `owner` field changes:
1. A hook verifies the new owner has an existing membership
2. The old owner's membership role changes from `owner` to `admin`
3. The new owner's membership role changes to `owner`

## Deletion Protection

- Users who own organizations cannot be deleted (hook enforced)
- Owner memberships cannot be deleted — ownership must be transferred first

## Frontend Routes

| Page | Path |
|------|------|
| List | `/organizations` |
| Create | `/organizations/new` |
| Detail | `/organizations/:id` |
| Settings | `/organizations/:id/edit` |
| Members | `/organizations/:id/members` |

## See Also

- [Memberships](./memberships.md) — Member management and roles
