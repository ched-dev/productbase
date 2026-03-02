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
