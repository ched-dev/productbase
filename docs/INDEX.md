# ProductBase Documentation Index

Welcome to the ProductBase documentation index! This file serves as a comprehensive guide to all documentation available in this project, helping you quickly find the information you need.

## Table of Contents

### Core Concepts

- **[ProductBase](./productbase.md)** - Overview of the ProductBase template, its purpose, and core features
- **[Pocketbase](./pocketbase.md)** - Pocketbase-specific information, usage patterns, and important considerations

### Backend Architecture

- **[Backend Development](./backend/development.md)** - Backend development patterns and best practices
- **[Collections](./backend/collections.md)** - Collection types, naming conventions, field options, and API rules
- **[Access Permissions](./backend/access-permissions.md)** - API rules and filters for controlling access permissions
- **[Migrations](./backend/migrations.md)** - Writing and managing database migrations
- **[Hooks](./backend/hooks.md)** - Backend hook development patterns and best practices
- **[Querying](./backend/querying.md)** - Pocketbase querying patterns for backend development

### Frontend Architecture

- **[Pocketbase Admin Panel](./frontend/pocketbase-admin-panel.md)** - Admin panel configuration, schema management, and user management
- **[Configuration](./frontend/config.md)** - App-wide constants, environment detection, Base URLs, and cookie settings
- **[Frontend Development](./frontend/development.md)** - Frontend development patterns and best practices
- **[State Management](./frontend/state-management.md)** - State management strategy using TanStack Query, Zustand, React state, and URL state
  - **[Query Hooks](./frontend/query-hooks.md)** - Collection query hooks architecture and usage patterns
  - **[Custom Hooks](./frontend/custom-hooks.md)** - Custom React hooks for common UI patterns and state management
- **[Components](./frontend/components.md)** - React component patterns, shared layout components, and best practices
- **[Forms](./frontend/forms.md)** - Form components, patterns, and best practices
- **[Routing](./frontend/routing.md)** - React Router v6 patterns, URL conventions, and navigation strategies
- **[Error Handling](./frontend/error-handling.md)** - Error handling patterns, ApiError class, and validation error management
- **[Type Generation](./frontend/type-generation.md)** - TypeScript type generation from Pocketbase schema and usage patterns

### User and Organization Features

- **[Authentication](./features/authentication.md)** - Auth flows, session management, route protection, and registration controls
- **[Users](./features/users.md)** - User types, management, and authentication patterns (frontend perspective)
- **[Organizations](./features/organizations.md)** - Multi-tenant organization feature implementation
- **[Memberships](./features/memberships.md)** - User membership system and relationships for Organizations

## Development Pathways

### For New Developers

Follow the [README_dev.md](../README_dev.md) to get your environment setup locally.

### For Feature Development

- **Adding a New Collection**: [Collections](./backend/collections.md) → [Migrations](./backend/migrations.md) → [Type Generation](./frontend/type-generation.md) → [Query Hooks](./frontend/query-hooks.md)
- **Creating New Components**: [Components](./frontend/components.md) → [Custom Hooks](./frontend/custom-hooks.md) → [State Management](./frontend/state-management.md)
- **Authentication & Users**: [Authentication](./features/authentication.md) → [Users](./features/users.md) → [Pocketbase Admin Panel](./frontend/pocketbase-admin-panel.md)
- **Multi-tenant Features**: [Organizations](./features/organizations.md) → [Memberships](./features/memberships.md) → [Access Permissions](./backend/access-permissions.md)

## Documentation Conventions

- **File Links**: All links in this index point to the actual documentation files
- **Categorization**: Documents are grouped by their primary purpose and usage context
- **Cross-References**: Many documents reference related topics - follow these links for comprehensive understanding
- **Progressive Learning**: Start with core concepts before moving to specific features
- **Prerequisites**: Each document includes prerequisite information to guide your learning path

## Keeping This Index Updated

When adding new documentation:

1. Create the new documentation file in the appropriate `docs/**` directory
2. Add an entry to the appropriate section in this INDEX.md file
3. Include a brief, descriptive summary of what the document covers
4. Consider if the new document should be referenced in other existing documents
5. Update any relevant development pathways that include the new document
