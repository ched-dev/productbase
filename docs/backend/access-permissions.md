# Pocketbase API Rules for Access Permissions

This file is intended to help AI Coding Agents know important information about the API Rules and Filters feature in Pocketbase. It controls access permissions at the API layer. Additional permissions or validations may be enforced in the [Hooks](./hooks.md) layer.

## Official Documentation

- [API Rules for collection access controls and data filters](https://pocketbase.io/docs/api-rules-and-filters/)
- [Filters Syntax](https://pocketbase.io/docs/api-rules-and-filters/#filters-syntax)
- Helpful [@macros](https://pocketbase.io/docs/api-rules-and-filters/#-macros) and [modifiers](https://pocketbase.io/docs/api-rules-and-filters/#isset-modifier) such as `:isset`, `:length`, `:lower`.

## API Rules Syntax Examples

Sample permission rules:
```
// general format - field_name must be on the model, can be a subproperty
<field_name> = <expression>

// access only items you own
user.id = @request.auth.id

// allow only registered users
@request.auth.id != ""

// based on request body value
@request.body.invite_code = "betaboys"

// based on a property (only show published items)
is_published = true && date_published >= @now

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

## Error Handling

If an API rule fails, there will be a generic error response similar to:

```json
{
  "data": {},
  "message": "Failed to create record.",
  "status": 400
}
```

## When to use API Rules vs Hooks for permissions and validation

The API rules should ideally be denying users who don't have access. If you have additional checks in the API rule, you will receive a generic error response without much help as to why it failed.

ProductBase will prefer to have more descriptive errors, which is why we handle additional validation in the [Hooks](./hooks.md) and return a specific error message instead:

```js
if (auth.get('verified') !== true) {
  app.logger().debug('Unverified account', 'auth.id', auth.id)
  throw new ForbiddenError('Account verification is required.', {
    verified: new ValidationError('validation_not_verified', 'Account verification is required'),
  })
}
```

## Permission Matrix

A permission matrix is a markdown table that maps every user-facing action to the roles or actors that can perform it. Each cell is **Yes**, **No**, or **Yes** with a condition noted in parentheses. This makes it easy to audit whether API rules and hooks actually enforce the intended permissions.

See [Memberships — Roles & Permissions](../features/memberships.md#roles--permissions) for a working example.

### When to Generate

Generate a permission matrix when:

- A new collection with role-based or membership-based access is created.
- API rules or hook-based permission logic are added or changed on an existing collection.
- Requested by a developer during a review or audit.

### How to Generate (AI Agent Instructions)

When asked to produce a permission matrix for a collection, follow these steps:

1. **Identify roles and actors** — Determine who interacts with the collection. Look for relation fields (e.g., `user`, `owner`), membership roles (`owner`, `admin`, `member`), or any other actor distinctions.

2. **Read API rules** — Find the collection's migration file in `pocketbase/pb_migrations/` and extract the `listRule`, `viewRule`, `createRule`, `updateRule`, and `deleteRule`.

3. **Read hook logic** — Check `pocketbase/pb_hooks/lib/hooks/` for any request hooks that add permission checks, protections, or role-based guards on top of the API rules.

4. **List every action** — Go beyond CRUD. Include business-level actions like "Invite member", "Transfer ownership", or "Leave organization" if they are enforced by hooks or dedicated endpoints.

5. **Build the matrix** — Combine both layers (API rules + hooks) into a single table. Mark each cell Yes, No, or Yes with a parenthetical condition. Add footnotes below the table for anything that needs extra explanation.

6. **Place the matrix** — Add it to the relevant feature doc (e.g., `docs/features/<collection>.md`) under a `## Roles & Permissions` heading.

### Template

```markdown
| Action | Role A | Role B | Role C |
|--------|--------|--------|--------|
| List/View | Yes | Yes | Yes |
| Create | Yes | Yes | No |
| Update | Yes | No | No |
| Delete | Yes (must transfer first) | No | No |
| Custom action | Yes | Yes | No |
```

Replace Role A/B/C with the actual roles. Add or remove columns and rows as needed.
