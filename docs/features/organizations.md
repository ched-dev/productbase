# Organizations

This file is intended to help AI Coding Agents know important information about the **organizations** feature in ProductBase.

## Important Notes

The **organizations** feature was implemented based on the blog article: https://www.flightcontrol.dev/blog/ultimate-guide-to-multi-tenant-saas-data-modeling

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

## API Rules

- **List/View**: Owner or any member (via memberships back-relation)
- **Create**: Authenticated and verified users only (`@request.auth.verified = true`)
- **Update/Delete**: Owner only

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
