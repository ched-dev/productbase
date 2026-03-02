# Pocketbase API Rules for Access Permissions

This file is intended to help AI Coding Agents know important information about the API Rules and Filters feature in Pocketbase. It controls access permissions at the API layer. Additional permissions may be enforced at the **hooks** layer.

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

## See Also

- [Backend Development](./development.md) - Backend development patterns
- [Collections](./collections.md) - Collection management
- [Hooks](./hooks.md) - Hook development patterns
- [Querying](./querying.md) - Data retrieval patterns
