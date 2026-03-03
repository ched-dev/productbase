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

## Roles & Permissions

| Action | Owner | Admin | Member |
|--------|-------|-------|--------|
| View/list org (must be member) | Yes | Yes | Yes |
| Edit org | Yes | No | No |
| Delete org | Yes | No | No |
| Invite member | Yes | Yes | No |
| Change member role | Yes | No | No |
| Remove member (admin) | Yes | Yes | No |
| Remove member (member) | Yes | Yes | No |
| Transfer owner | Yes | No | No |
| Leave org | No (must transfer) | Yes | Yes |

- "Owner" refers to the `organization.owner` field on the organizations collection.
- Owner membership cannot be deleted by anyone — must transfer ownership first.
- Organization creation requires any authenticated user.
- Joining an Organziation allows the Owner to see members email address.

## Auto-created Membership

When an organization is created, a membership with `role: "owner"` is automatically created for the creating user via a PocketBase hook.

## Deletion Protections

- Memberships with `role: "owner"` cannot be deleted — the `handleDeleteProtection` hook returns a descriptive error ("Transfer ownership first")
- Admins and members cannot see the owner membership for deletion (API rule returns 404)
- The owner must transfer ownership before leaving or being removed

## See Also

- [Organizations](./organizations.md) — Organization management
