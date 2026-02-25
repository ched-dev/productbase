# AI Agent Guide - ProductBase

This guide provides essential information for AI agents working on the ProductBase project.

## Project Overview

**ProductBase** is a product starter template using Pocketbase as a backend. It's a monorepo containing:
- **Frontend**: React 19 + Mantine UI (static site)
- **Backend**: Pocketbase (single-file backend with SQLite, auth, storage)
- **Infrastructure**: Docker Compose for local development

### Product Naming
- Use PocketBase casing when referring to the product template or project, also use in documentation
- Use `pocketbase` all lowercase when referred to in code

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19, Mantine UI 7, TypeScript |
| State Management | Zustand |
| Backend | Pocketbase (Go/JS) |
| Database | SQLite (via Pocketbase) |
| Storage | Local or S3-compatible |
| Email | SMTP via Pocketbase |
| Payments | Stripe (planned) |
| Testing | Vitest, React Testing Library |
| Linting | ESLint, Stylelint |
| Formatting | Prettier |

## Development Setup

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- Git

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/ched-dev/productbase.git
cd productbase

# Copy environment files
cp ./frontend/.env.example ./frontend/.env
cp ./pocketbase/.env.example ./pocketbase/.env

# Start development environment
docker compose up
```

### Services
| Service | URL |
|---------|-----|
| Frontend | http://localhost:8800 |
| Pocketbase API | http://localhost:8100/api/ |
| Pocketbase Admin | http://localhost:8100/_/ |

## Project Structure

```
productbase/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/pb/          # Pocketbase client library
│   │   ├── pages/           # Page components
│   │   ├── stores/          # Zustand stores
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
├── docs/                    # Documentation
├── docker-compose.yml       # Docker composition
└── AGENTS.md               # This file
```

## Key Files

### Frontend
- `frontend/src/lib/pb/client.ts` - Pocketbase client singleton
- `frontend/src/lib/pb/auth.ts` - Authentication utilities
- `frontend/src/lib/pb/errors.ts` - Error handling
- `frontend/src/stores/AppStore.ts` - Main Zustand store
- `frontend/src/Router.tsx` - Application routing

### Backend
- `pocketbase/pb_hooks/main.pb.js` - Event hooks (onetable, aftersave, etc.)
- `pocketbase/pb_migrations/*.js` - Database migrations

## Common Tasks

### Running the Project
```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Frontend Development
```bash
cd frontend
nvm use  # Node v20+
npm install
npm run dev
```

### Backend Development
- Access Pocketbase Admin UI at http://localhost:8100/_/
- Create/modify collections through the admin UI
- Migrations are auto-generated in `pocketbase/pb_migrations/`
- Custom JS hooks go in `pocketbase/pb_hooks/main.pb.js`
- JS files use 2 spaces for indentation, no semicolons, and single quotes for strings

### Testing
```bash
# Run all tests
cd frontend && npm test

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Reset Database
```bash
# Delete local data and restart
rm -rf pocketbase/pb_data
docker compose up
```

### Documentation
After each task, confirm documentation is up-to-date with actual logic. Documentation formats are in markdown and available in multiple places:
- `/docs/*.md` is documentation intended for developers and operators of the project
- `/AGENTS.md` is documentation for AI Agents

## Pocketbase Specific

### Usage
The project extends Pocketbase with both GO and JavaScript. The JavaScript extensions use the GOJA runtime and do not allow async code. Keep this in mind when extending code in JS. The JS code also uses `require()` for imports, `module.exports` for exports (also known as commonjs format). Pocketbase will inject values into the JavaScript runtime which can be found in typefile `/pocketbase/pb_data/types.d.ts`.

### Documentation
- Main documentation page: https://pocketbase.io/docs/
- Collections: https://pocketbase.io/docs/collections/
- API Rules for collection access controls and data filters: https://pocketbase.io/docs/api-rules-and-filters/
- Authentication: https://pocketbase.io/docs/authentication/
- File uploading and handling: https://pocketbase.io/docs/files-handling/
- Working with relations: https://pocketbase.io/docs/working-with-relations/
- Extending Pocketbase: https://pocketbase.io/docs/use-as-framework/

### Collection Naming
- Use lowercase with underscores
- Keep pluralized (e.g., `blog_posts`, not `blog_post`)
- Use `type: Base` for standard data
- Use `type: View` for read-only virtual tables

### API Rules Syntax (for permissions)
More info: https://pocketbase.io/docs/api-rules-and-filters/
```javascript
// Access only items you own
user_id = @request.auth.id

// Allow only registered users
@request.auth.id != ""

// Based on request body value
@request.body.invite_code = "betaboys"

// Show only published items
is_published = true

// Check field length
@request.body.someField:length > 1
```

### Throwing Errors
PocketBase has a global error handler and every returned or thrown `Error` from a route or middleware will be safely converted by default to a generic API error to avoid accidentally leaking sensitive information (the original error will be visible only in the Dashboard > Logs or when in `--dev` mode).

To make it easier returning formatted json error responses, PocketBase provides `ApiError` constructor that can be instantiated directly or using the builtin factories.
`ApiError.data` will be returned in the response only if it is a map of `ValidationError` items.

Code Example:
```js
// construct ApiError with custom status code and validation data error
throw new ApiError(500, "something went wrong", {
    "title": new ValidationError("invalid_title", "Invalid or missing title"),
})

// if message is empty string, a default one will be set
throw new BadRequestError(optMessage, optData)      // 400 ApiError
throw new UnauthorizedError(optMessage, optData)    // 401 ApiError
throw new ForbiddenError(optMessage, optData)       // 403 ApiError
throw new NotFoundError(optMessage, optData)        // 404 ApiError
throw new TooManyrequestsError(optMessage, optData) // 429 ApiError
throw new InternalServerError(optMessage, optData)  // 500 ApiError
```

### Settings Collection
The project uses a singleton collection `_productbase_settings` for app configuration. Code Example to get the single record:
```js
const settings = app.findFirstRecordByFilter('_productbase_settings');

// returns
{
  "_schema_version": 1,
  "allow_admin_panel_updates": false,
  "allow_user_registrations": false,
  "collectionId": "pbc_3606149187",
  "collectionName": "_productbase_settings",
  "enable_waitlist": false,
  "id": "vc471qe8beknak1"
}
```

## Important Notes

1. **Environment Variables**: Never commit `.env` files. They're gitignored.
2. **Database Data**: The `pocketbase/pb_data` directory is gitignored - it contains the actual SQLite database.
3. **Migrations**: Migration files are committed to keep the team in sync.
4. **Hooks**: Pocketbase hooks use JavaScript (not TypeScript) and run in a sandboxed environment.
5. **Hidden Fields**: To hide fields from API responses, mark them as "Hidden" in the collection schema.
6. **Unique Fields**: Add a unique index in the collection schema, not on the field itself.

## Mantine UI Notes

- Mantine v7 uses CSS modules by default
- PostCSS is configured with mantine-postcss-preset
- Use `classnames` library for conditional CSS classes
- Components are accessible by default

## Dependencies

### Frontend Key Dependencies
- `@mantine/core` - UI components
- `@mantine/hooks` - React hooks
- `pocketbase` - SDK
- `zustand` - State management
- `react-router-dom` - Routing

## Troubleshooting

### Database Issues
If migrations are out of sync:
```bash
docker ps  # Find container ID
docker exec -it <CONTAINER_ID> /pb/pocketbase migrate history-sync
```

### Clear Local Database
```bash
rm -rf pocketbase/pb_data
docker compose up
```

### View Emails in Development
Check Pocketbase admin UI > Settings > Mail SMTP for email log/debugging (if configured).

## Frontend Style Guide

- Use **Prettier** for formatting
- Follow ESLint rules from `eslint-config-mantine`
- TypeScript strict mode enabled
- Use CSS Modules for component styling
- Follow React 19 patterns with hooks
- Inside of components:
  - Name functions which handle state changes as `handle*`, E.g. `handleSignIn(), handleSignUp()`
  - Name functions for events such as click, form submit, change, as `on*`, E.g. `onClick(), onSubmit(), onKeyPress()`
  - Name functions for rendering elements as `render*`, E.g. `renderForm(), renderStats()`
