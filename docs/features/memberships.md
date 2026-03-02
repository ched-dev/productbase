# Memberships

This file is intended to help AI Coding Agents know important information about the **memberships** feature in ProductBase.

## Important Notes

The **memberships** feature was implemented based on the blog article: https://www.flightcontrol.dev/blog/ultimate-guide-to-multi-tenant-saas-data-modeling

Memberships allow users to belong to multiple **organizations**.

## Collection Schema

| Field | Type | Options |
|-------|------|---------|
| `id` | text | system, primaryKey, autogenerate |
| `user` | relation | to users, optional (nullable for pending invites) |
| `organization` | relation | to organizations, required, cascadeDelete |
| `role` | text | required — `owner`, `admin`, or `member` |
| `invited_by` | relation | to users, optional |
| `invite_email` | text | optional (for pending invitations) |
| `created` | autodate | |
| `updated` | autodate | |

**Unique index** on `(user, organization)` where user is not empty.

## Roles

| Role | Can manage members | Can edit org | Can delete org | Can be removed |
|------|--------------------|-------------|----------------|----------------|
| `owner` | Yes | Yes | Yes | No (must transfer first) |
| `admin` | Yes | No | No | Yes |
| `member` | No | No | No | Yes (or can leave) |

## API Rules

- **List/View**: Own memberships, or any membership in an org you belong to
- **Create**: Org owner or admin
- **Update**: Org owner only (for role changes)
- **Delete**: Owner/admin can remove non-owner members; members can leave (unless owner)

## Auto-created Membership

When an organization is created, a membership with `role: "owner"` is automatically created for the creating user via a PocketBase hook.

## Deletion Protections

- Memberships with `role: "owner"` cannot be deleted (hook enforced)
- The owner must transfer ownership before leaving or being removed

## See Also

- [Organizations](./organizations.md) — Organization management
