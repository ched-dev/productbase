# ProductBase Documentation Index

Welcome to the ProductBase documentation index! This file serves as a comprehensive guide to all documentation available in this project, helping you quickly find the information you need.

## 📚 Table of Contents

### 🏗️ Core Concepts

- **[ProductBase](./productbase.md)** - Overview of the ProductBase template, its purpose, and core features
- **[Pocketbase](./pocketbase.md)** - Pocketbase-specific information, usage patterns, and important considerations
- **[Collections](./collections.md)** - Collection types, naming conventions, field options, and API rules
- **[Access Permissions](./access-permissions.md)** - API rules and filters for controlling access permissions
- **[Migrations](./migrations.md)** - Writing and managing database migrations
- **[Hooks](./hooks.md)** - Backend hook development patterns and best practices

### 🎨 Frontend Architecture

- **[Components](./components.md)** - React component patterns, shared layout components, and form best practices
- **[Routing](./routing.md)** - React Router v6 patterns, URL conventions, and navigation strategies
- **[State Management](./state-management.md)** - State management strategy using TanStack Query, Zustand, React state, and URL state
- **[Custom Hooks](./custom-hooks.md)** - Custom React hooks for common UI patterns and state management
- **[Error Handling](./error-handling.md)** - Error handling patterns, ApiError class, and validation error management

### 🔄 Data Management

- **[Querying](./querying.md)** - Pocketbase querying patterns for both frontend and backend
- **[TanStack Query Hooks](./tanstack-query-hooks.md)** - Collection query hooks architecture and usage patterns
- **[Type Generation](./type-generation.md)** - TypeScript type generation from Pocketbase schema and usage patterns

### 👥 User and Organization Features

- **[Users](./users.md)** - User types, management, and authentication patterns
- **[Organizations](./organizations.md)** - Multi-tenant organization feature implementation
- **[Memberships](./memberships.md)** - User membership system and relationships

### 🗄️ State Management Stores

- **[Zustand Stores](./zustand-stores.md)** - Global state stores (AppStore, UrlStore) and URL parameter management

### 🔧 Administration

- **[Pocketbase Admin Panel](./pocketbase-admin-panel.md)** - Admin panel configuration, schema management, and user management

## 🎯 Quick Start Guides

### For New Developers

1. **Start Here**: [ProductBase](./productbase.md) - Understand the project structure and purpose
2. **Backend Basics**: [Pocketbase](./pocketbase.md) and [Collections](./collections.md) - Learn the backend architecture
3. **Frontend Patterns**: [Components](./components.md) and [Routing](./routing.md) - Understand the frontend structure
4. **Data Flow**: [Querying](./querying.md) and [TanStack Query Hooks](./tanstack-query-hooks.md) - Learn how data moves through the app

### For Feature Development

- **Adding a New Collection**: [Collections](./collections.md) → [Migrations](./migrations.md) → [Type Generation](./type-generation.md) → [TanStack Query Hooks](./tanstack-query-hooks.md)
- **Creating New Components**: [Components](./components.md) → [Custom Hooks](./custom-hooks.md) → [State Management](./state-management.md)
- **Implementing Authentication**: [Users](./users.md) → [Access Permissions](./access-permissions.md) → [Error Handling](./error-handling.md)
- **Multi-tenant Features**: [Organizations](./organizations.md) → [Memberships](./memberships.md) → [Access Permissions](./access-permissions.md)

### For Backend Development

- **Database Schema**: [Collections](./collections.md) → [Migrations](./migrations.md)
- **Business Logic**: [Hooks](./hooks.md) → [Access Permissions](./access-permissions.md)
- **API Design**: [Querying](./querying.md) → [TanStack Query Hooks](./tanstack-query-hooks.md)

### For Frontend Development

- **Component Architecture**: [Components](./components.md) → [Custom Hooks](./custom-hooks.md)
- **State Management**: [State Management](./state-management.md) → [Zustand Stores](./zustand-stores.md)
- **Navigation**: [Routing](./routing.md) → [Custom Hooks](./custom-hooks.md)

## 📖 Documentation Conventions

- **File Links**: All links in this index point to the actual documentation files
- **Categorization**: Documents are grouped by their primary purpose and usage context
- **Cross-References**: Many documents reference related topics - follow these links for comprehensive understanding
- **Progressive Learning**: Start with core concepts before moving to specific features

## 🔄 Keeping This Index Updated

When adding new documentation:

1. Create the new documentation file in the `docs/` directory
2. Add an entry to the appropriate section in this INDEX.md file
3. Include a brief, descriptive summary of what the document covers
4. Consider if the new document should be referenced in other existing documents

---

*This index is automatically maintained and should be updated whenever new documentation is added to the project.*