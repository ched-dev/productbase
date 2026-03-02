# ProductBase Development Setup

Instructions to setup dev environment

There is some one-time setup required to get the project running. Follow the steps below.

## Setup `.env` files
A one-time setup of the env files is required.

Run the following commands from the root folder:
```sh
cp ./frontend/.env.example ./frontend/.env
cp ./pocketbase/.env.example ./pocketbase/.env
```

Go into each `.env` file and update the values as needed.

## Startup Docker
You can run this monorepo with a single Docker command:
```sh
docker compose up
```

## Building for production

## Frontend
Docker will run the frontend for you but you may want to run the package install to get support inside your IDE.

Install dependencies with:
```sh
cd ./frontend
nvm use # node v20+
npm install
```

The frontend is available at:
```
http://localhost:8800/
```

## Backend
The entire backend runs on Pocketbase. More details can be found in the [pocketbase/README.md](./pocketbase/README.md) file. The Docker up commands will run pocketbase as well.

The backend is available at:
```
REST API:  http://0.0.0.0:8100/api/
Dashboard: http://0.0.0.0:8100/_/
```

## Dev Tools

A `Makefile` at the project root provides helpful commands for local development:

```sh
make help                # List all available commands
make db-reset            # Tear down stack and delete local pb_data (irreversible)
make migrations-sync     # Sync migration history after deleting migration files
make seed-collection     # Seed a PocketBase collection with fake data
```

**`make db-reset`** is useful when you want a completely fresh database. It will prompt for confirmation before proceeding.

**`make migrations-sync`** re-syncs PocketBase's migration history table when migration files have been manually deleted and the database is out of sync.

**`make seed-collection COLLECTION=<name>`** seeds a PocketBase collection with fake data. Useful for testing UI and pagination. Pass `COUNT=N` to create N records (default: 1).

Example:
```sh
make seed-collection COLLECTION=user_feedback        # Creates 1 user_feedback record
make seed-collection COLLECTION=user_feedback COUNT=5  # Creates 5 user_feedback records
```

Available collections: `user_feedback`, `feedback_actions`, `user_preferences`

## Documentation

- [Backend Development](./docs/backend/development.md) - Backend development patterns
- [Frontend Development](./docs/frontend/development.md) - Frontend development patterns
- [Access Permissions](./docs/backend/access-permissions.md) - Access permissions patterns
- [Collections](./docs/backend/collections.md) - Collection management
- [Migrations](./docs/backend/migrations.md) - Migration management
- [Backend Hooks](./docs/backend/hooks.md) - Backend hook patterns
- [Backend Querying](./docs/backend/querying.md) - Backend querying patterns
- [PocketBase Admin Panel](./docs/frontend/pocketbase-admin-panel.md) - Admin panel usage
- [State Management](./docs/frontend/state-management.md) - State management strategy for global, URL, and server state
- [Query Hooks](./docs/frontend/query-hooks.md) - Data fetching patterns
- [Components](./docs/frontend/components.md) - Component patterns and best practices
- [Error Handling](./docs/frontend/error-handling.md) - Error handling patterns
- [Routing](./docs/frontend/routing.md) - Navigation and URL patterns
- [Custom Hooks](./docs/frontend/custom-hooks.md) - URL state and other custom hooks
- [Type Generation](./docs/frontend/type-generation.md) - Type generation patterns
