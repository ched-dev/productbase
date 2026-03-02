# AI Agent Guide - ProductBase

This guide provides essential information for AI agents working on the ProductBase project.

## Project Overview

**ProductBase** is a product starter template using Pocketbase as a backend. It's a monorepo containing:
- **Frontend**: React 19 + Mantine UI (static site)
- **Backend**: Pocketbase (single-file backend with SQLite, auth, storage)
- **Infrastructure**: Docker Compose for local development and deployments

### Product Naming
- Use PocketBase casing when referring to the product template or project, also use in documentation
- Use `pocketbase` all lowercase when referred to in code

## Additional Documentation

Additional documentation on specific areas of the codebase along with best practices and preferred functionality can be found at `./docs/*.md`. These files should be used when you determine you are implementing or touching their specific topics. The filename is the topic.

## Development Setup

The latest development setup information resides in the `./README_dev.md` file.

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19, Mantine UI 7, TypeScript |
| Global State Management | Zustand |
| Query Management | TanStack Query |
| Backend | Pocketbase (Go/JS) |
| Database | SQLite (via Pocketbase) |
| Storage | Local or S3-compatible |
| Email | SMTP via Pocketbase |
| Testing | Vitest, React Testing Library |
| Linting | ESLint, Stylelint |
| Formatting | Prettier |

## Project Structure

```
productbase/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Shared libraries and utilities
│   │   │   └── pb/          # Pocketbase client library
│   │   ├── mock_api/        # Mock API responses for testing
│   │   ├── pages/           # Page components
│   │   ├── queryHooks/      # TanStack Query hooks for pocketbase collections
│   │   ├── stores/          # Zustand stores
│   │   ├── tasks/           # Build/codegen scripts (e.g. generate-pb-types)
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   └── package.json
├── pocketbase/               # Pocketbase backend
│   ├── pb_hooks/            # JavaScript event hooks
│   │   ├── lib/             # Hook utilities
│   │   └── main.pb.js       # Main hooks file
│   ├── pb_migrations/       # Database migrations
│   ├── pb_data/             # Local database storage (gitignored)
│   └── main.go              # Custom Go code (if needed)
├── docs/                    # Specific Documentation for AI Agents
├── docker-compose.yml       # Docker composition
├── Dockerfile               # Root-level Docker build
├── Makefile                 # Project task runner
├── README_dev.md            # Readme file for development environment setup
├── README.md                # Readme file for description of this project
└── AGENTS.md                # This file
```

### Testing
```bash
# Run all tests
cd frontend && npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Updating Documentation
If you are asked to do a task, confirm documentation is up-to-date with actual implementation. Documentation formats are in markdown, and the files you should update are available in multiple places:
- `/docs/**.md` is documentation intended for developers and operators of the project, including AI agents
- `/AGENTS.md` is documentation for AI Agents

## Important Notes

1. **Environment Variables**: Never commit `.env` files. They're gitignored.
2. **Database Data**: The `pocketbase/pb_data` directory is gitignored - it contains the actual SQLite database.
3. **Migrations**: Migration files are committed to keep the team in sync.
4. **Hooks**: Pocketbase hooks use JavaScript (not TypeScript) and run in a sandboxed GOJA environment which has no async code allowed.
5. **Hidden Fields**: To hide fields from API responses, mark them as "Hidden" in the collection schema.
6. **Unique Fields**: Add a unique index in the collection schema, not on the field itself.

## Troubleshooting

### Database Issues
If migrations are out of sync:
```bash
make migrations-sync
```

### Clear Local Database
```bash
make db-reset
```

For details on available dev commands, see the [Dev Tools](./README_dev.md#dev-tools) section in `README_dev.md` or run `make help`.

## Documentation

Find any documentation you need from the [./docs/INDEX.md](./docs/INDEX.md) file.
