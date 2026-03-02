# Backend Development

This guide documents backend development patterns and best practices for ProductBase using PocketBase.

## Overview

Backend development in ProductBase involves working with PocketBase collections, migrations, hooks, and API rules. This section provides patterns and conventions for building robust backend functionality.

## Development Workflow

### 1. Database Schema Design

**Prerequisites:** [Collections](./collections.md), [Migrations](./migrations.md)

1. **Plan your data model** - Identify entities and relationships
2. **Create collections** - Use lowercase with underscores, keep pluralized
3. **Define fields** - Use snake_case, set appropriate validation rules
4. **Set permissions** - Configure API rules for access control

### 2. Data Migration Strategy

**Prerequisites:** [Migrations](./migrations.md)

```javascript
// Example migration file
/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    name: 'your_collection',
    type: 'base',
    schema: [
      {
        name: 'field_name',
        type: 'text',
        required: true,
        options: {
          min: 2,
          max: 100
        }
      }
    ]
  })

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId('pbc_1581634021')

  return app.delete(collection)
})
```

**Best Practices:**
- Always include rollback logic when possible
- Use descriptive migration names with timestamps
- Test migrations in development before production
- Document breaking changes in migration comments

### 3. Business Logic with Hooks

**Prerequisites:** [Hooks](./hooks.md)

```javascript
// Example hook pattern
onRecordBeforeCreate((e) => {
  const { record, auth } = e

  // 1. Authentication check
  if (!auth?.isSuperuser()) {
    e.next()
    return
  }

  // 2. Business logic validation
  if (!record.get('required_field')) {
    throw new BadRequest('Required field is missing')
  }

  // 3. Data transformation
  record.set('created_by', auth.id)
  record.set('status', 'pending')

  e.next()
}, 'your_collection') // only run for your_collection
```

Hooks can allow for additional validation or customization into the pocketbase data and events.

### 4. API Rules and Permissions

**Prerequisites:** [Access Permissions](./access-permissions.md)

```javascript
// Collection API Rules
{
  "create": "@request.auth.id != ''",
  "update": "user.id = @request.auth.id",
  "delete": "@request.auth.id = owner.id",
  "list": "status = 'published'",
  "view": "status = 'published' || user.id = @request.auth.id"
}
```

**Permission Patterns:**
- **Public access** - No authentication required
- **User access** - Authenticated users only
- **Owner access** - Only the record owner
- **Admin access** - Superusers only
- **Role-based access** - Based on user roles or memberships

## Common Backend Patterns

### Multi-tenant Data Isolation

```javascript
// In hooks, ensure data isolation
onRecordListRequest((e) => {
  const { auth } = e

  if (!auth?.isSuperuser()) {
    // Filter records to only show user's organization data
    e.filter = `organization = "${auth.organization}"`
  }

  e.next()
}, 'user_feedback')
```

### Soft Delete Pattern

```javascript
// Add deleted_at field to collections
{
  "name": "deleted_at",
  "type": "date",
  "required": false
}

// Hook to handle soft deletes
onRecordBeforeDelete((e) => {
  const { record } = e
  
  // Instead of deleting, mark as deleted
  record.set('deleted_at', new Date())
  
  // Update the record
  $app.save(record)

  // don't call e.next() or record will be deleted
})
```

### Audit Trail Pattern

```javascript
// Hook to track changes
onRecordAfterUpdateSuccess((e) => {
  const { record, auth } = e
  
  // Create audit log entry
  const auditLog = new Record($app.findCollectionByNameOrId('audit_logs'), {
    collection_name: record.collectionName,
    record: record.id,
    action: 'update',
    user: auth?.id,
    changes: JSON.stringify(record.updated),
    timestamp: new Date()
  })
  
  $app.save(auditLog)
})
```

### Data Validation Patterns

```javascript
// Complex validation in hooks
onRecordBeforeCreate((e) => {
  const { record } = e
  
  // Custom validation logic
  if (record.get('email')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(record.get('email'))) {
      throw new BadRequest('Invalid email format')
    }
  }
  
  // Cross-field validation
  const startDate = new Date(record.get('start_date'))
  const endDate = new Date(record.get('end_date'))
  
  if (endDate <= startDate) {
    throw new BadRequest('End date must be after start date')
  }
  
  e.next()
})
```

## Error Handling

### Backend Error Patterns

```javascript
// Throwing appropriate errors
throw new BadRequest('Invalid input data')
throw new Unauthorized('Authentication required')
throw new Forbidden('Insufficient permissions')
throw new NotFound('Resource not found')
throw new InternalServerError('Server error occurred')
```

### Error Response Structure

```javascript
// Custom error with validation data
throw new ApiError(422, 'Validation failed', {
  'email': new ValidationError('invalid_email', 'Please provide a valid email'),
  'name': new ValidationError('required', 'Name is required')
})
```

## Performance Considerations

### Database Indexing

```javascript
// Add indexes for frequently queried fields
{
  "name": "idx_user_email",
  "unique": true,
  "fields": ["email"]
}

{
  "name": "idx_feedback_status",
  "unique": false,
  "fields": ["status", "created"]
}
```

## Testing Backend Logic

TBD

## Security Best Practices

TBD

## See Also

- [Collections](./collections.md) - Data modeling concepts
- [Migrations](./migrations.md) - Database schema management
- [Hooks](./hooks.md) - Hook development patterns
- [Access Permissions](./access-permissions.md) - API security
- [Querying](./querying.md) - Data retrieval patterns
