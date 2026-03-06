---
name: crud-collection
description: Generate complete CRUD pages (List, Detail, Form), query hook, routes, router entries, and optional nav bar entry for a PocketBase collection. Use this skill whenever the user wants to add new pages for a collection, scaffold CRUD for a collection, create list/detail/form pages, or wire up a new collection to the frontend. Trigger on phrases like "add pages for", "create CRUD for", "scaffold collection", "wire up collection", "add frontend for collection", or when the user references a collection from PBCollections.d.ts and wants UI for it.
---

# CRUD Collection Generator

Generate all frontend files needed to expose a PocketBase collection as full CRUD pages in this ProductBase app.

## Before You Start

1. Read the collection's TypeScript interface from `frontend/src/types/PBCollections.d.ts`
2. Identify the collection name (the `collectionName` literal type in the interface) and the Record interface name
3. Read the existing patterns — use the reference files in this skill's `references/` directory

## What Gets Generated

For a collection named `{collection_name}` with interface `{Name}Record`, generate these files and modifications:

### 1. Query Hook — `frontend/src/queryHooks/use{Name}Collection.ts`

```tsx
import type { {Name}Record } from '@/types'
import { usePocketbaseCollection, UsePocketbaseCollectionReturn } from './usePocketbaseCollection'

export type Use{Name}CollectionReturn = UsePocketbaseCollectionReturn<{Name}Record>

export function use{Name}Collection(): Use{Name}CollectionReturn {
  return usePocketbaseCollection<{Name}Record>('{collection_name}', {
    sort: '-created',
  })
}
```

If the collection has a `user` or `owner` field, add `attachOnCreate`:

```tsx
import { AUTH_USER, usePocketbaseCollection, UsePocketbaseCollectionReturn } from './usePocketbaseCollection'

// ... in the hook:
return usePocketbaseCollection<{Name}Record>('{collection_name}', {
  sort: '-created',
  attachOnCreate: { user: AUTH_USER },  // or { owner: AUTH_USER }
})
```

### 2. Barrel Export — `frontend/src/queryHooks/index.ts`

Add a line:
```tsx
export * from './use{Name}Collection'
```

### 3. List Page — `frontend/src/pages/{Name}List.tsx`

Follow this structure exactly:

```tsx
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Group, Stack, Text } from '@mantine/core'
import { routes } from '@/lib/routes'
import LoadingIcon from '@/components/LoadingIcon'
import ScreenBody from '@/components/layout/ScreenBody'
import ContentContainer from '@/components/layout/ContentContainer'
import { use{Name}Collection } from '@/queryHooks'
import type { PBDataList } from '@/lib/pb/data'

export default function {Name}List() {
  const items = use{Name}Collection()

  useEffect(() => {
    items.list()
  }, [])

  const itemList = items.data as PBDataList | undefined

  return (
    <ScreenBody>
      <ContentContainer>
        <Group justify="space-between" mb="lg">
          <h1>{Display Name Plural}</h1>
          <Button component={Link} to={routes.{routeKey}.new()}>
            Create {Display Name Singular}
          </Button>
        </Group>

        {items.loading || !itemList ? (
          <LoadingIcon />
        ) : itemList.items.length === 0 ? (
          <Text c="dimmed">No {display name plural lowercase} yet.</Text>
        ) : (
          <Stack gap="sm">
            {itemList.items.map((item) => (
              <Card
                key={item.id}
                shadow="xs"
                padding="md"
                withBorder
                component={Link}
                to={routes.{routeKey}.detail({ id: item.id })}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Group justify="space-between">
                  <div>
                    {/* Render the most important fields here */}
                    <Text fw={600}>{String(item.{primaryField})}</Text>
                    {/* Add secondary fields as dimmed text */}
                  </div>
                  <Text size="xs" c="dimmed">
                    {new Date(item.created as string).toLocaleString()}
                  </Text>
                </Group>
              </Card>
            ))}
          </Stack>
        )}
      </ContentContainer>
    </ScreenBody>
  )
}
```

Key decisions for the list page:
- Pick the most "presentable" or "name-like" field as the primary display field (e.g., `name`, `message`, `title`)
- Show 1-2 secondary fields inline (badges for enums/booleans, dimmed text for descriptions)
- Use `Badge` from Mantine for enum/select fields and boolean flags
- Always show the `created` timestamp on the right side

### 4. Detail Page — `frontend/src/pages/{Name}Detail.tsx`

```tsx
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Group, Stack, Text } from '@mantine/core'
import { routes } from '@/lib/routes'
import { useNavigateHelpers } from '@/hooks/useNavigateHelpers'
import LoadingIcon from '@/components/LoadingIcon'
import NotFoundView from '@/components/NotFoundView'
import ScreenBody from '@/components/layout/ScreenBody'
import ContentContainer from '@/components/layout/ContentContainer'
import SecondaryButton from '@/components/forms/SecondaryButton'
import { use{Name}Collection } from '@/queryHooks'
import type { PBData } from '@/lib/pb/data'

export default function {Name}Detail() {
  const { id } = useParams<{ id: string }>()
  const { navigate } = useNavigateHelpers()
  const items = use{Name}Collection()

  useEffect(() => {
    if (id) {
      items.getOne(id)
    }
  }, [id])

  const item = items.data as PBData | undefined

  if (!id) {
    navigate(routes.{routeKey}.list())
    return null
  }

  if (items.loading) {
    return <ScreenBody><LoadingIcon /></ScreenBody>
  }

  if (items.error?.status === 404 || !item) {
    return (
      <NotFoundView
        message="{Display Name Singular} not found."
        backTo={routes.{routeKey}.list()}
        backLabel="Back to {Display Name Plural}"
      />
    )
  }

  return (
    <ScreenBody>
      <ContentContainer>
        <Group justify="space-between" mb="lg">
          <h1>{Display Name Singular}</h1>
          <SecondaryButton label="Back to {Display Name Plural}" href={routes.{routeKey}.list()} />
        </Group>

        <Card shadow="xs" padding="md" withBorder>
          <Stack gap="sm">
            {/* Render each non-system field */}
            <div>
              <Text size="sm" c="dimmed">{Field Label}</Text>
              <Text>{String(item.{fieldName})}</Text>
            </div>
            {/* For optional fields, wrap in a conditional */}
            {/* For JSON fields, use pre-formatted display */}
            {/* For URL fields, render as clickable links */}
            {/* For boolean fields, show a Badge */}
            {/* Always show created timestamp at the bottom */}
            <div>
              <Text size="sm" c="dimmed">Created</Text>
              <Text size="sm">{new Date(item.created as string).toLocaleString()}</Text>
            </div>
          </Stack>
        </Card>
      </ContentContainer>
    </ScreenBody>
  )
}
```

Field rendering rules:
- **Required fields**: Always render, use `String(item.field)` for display
- **Optional fields**: Wrap in `{(item.field as type) ? (...) : null}`
- **Boolean fields**: Use `<Badge color={value ? 'green' : 'gray'}>{value ? 'Yes' : 'No'}</Badge>`
- **Select/enum fields**: Use `<Badge>{String(item.field)}</Badge>`
- **URL fields**: Render as `<Text component="a" href={...} target="_blank" rel="noopener noreferrer">`
- **Email fields**: Render as plain text (or mailto link)
- **JSON fields**: Use `<Text size="sm" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{JSON.stringify(item.field, null, 2)}</Text>`
- **Date fields**: Use `new Date(item.field as string).toLocaleString()`
- **Hidden fields** (marked `hidden: true` in migration): Skip entirely
- **System fields** (`id`, `collectionId`, `collectionName`, `updated`): Skip, except show `created` at the bottom

### 5. Form Page — `frontend/src/pages/{Name}Form.tsx`

```tsx
import { Fieldset, Stack, TextInput } from '@mantine/core'
import ScreenBody from '@/components/layout/ScreenBody'
import ContentContainer from '@/components/layout/ContentContainer'
import SaveButton from '@/components/forms/SaveButton'
import CancelButton from '@/components/forms/CancelButton'
import FormError from '@/components/forms/FormError'
import FieldError from '@/components/forms/FieldError'
import FormActionsGroup from '@/components/forms/FormActionsGroup'
import { useFormState } from '@/hooks/useFormState'
import { useNavigateHelpers } from '@/hooks/useNavigateHelpers'
import { use{Name}Collection } from '@/queryHooks'
import { routes } from '@/lib/routes'

export default function {Name}Form() {
  const items = use{Name}Collection()
  const { goBackOrNavigate } = useNavigateHelpers()

  const { formRef, apiError, handleSubmit } = useFormState({
    onSuccess: () => {
      goBackOrNavigate(routes.{routeKey}.list())
    },
  })

  const onSubmit = async (formData: FormData) => {
    await items.create({
      // Map each field from formData
      // fieldName: formData.get('fieldName') as string,
    })
  }

  return (
    <ScreenBody>
      <ContentContainer>
        <h1>Create {Display Name Singular}</h1>

        <FormError apiError={apiError} />

        <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="sm">
            {/* One Fieldset per field */}
            <Fieldset legend="{Field Label}">
              <TextInput name="{fieldName}" required placeholder="{placeholder}" />
              <FieldError name="{fieldName}" apiError={apiError} />
            </Fieldset>

            <FormActionsGroup>
              <CancelButton onClick={() => goBackOrNavigate(routes.{routeKey}.list())} />
              <SaveButton submit loading={items.loading} label="Create" />
            </FormActionsGroup>
          </Stack>
        </form>
      </ContentContainer>
    </ScreenBody>
  )
}
```

Field-to-input mapping:
- **text** (required): `<TextInput name="..." required />`
- **text** (optional): `<TextInput name="..." />`
- **number**: `<NumberInput name="..." required min={min} max={max} />` (import from `@mantine/core`)
- **bool**: `<Checkbox name="..." label="..." />` (import from `@mantine/core`)
- **select**: `<Select name="..." data={[{ value: '...', label: '...' }]} />` (import from `@mantine/core`)
- **email**: `<TextInput name="..." type="email" />`
- **url**: `<TextInput name="..." type="url" />`
- **date/datetime**: `<TextInput name="..." type="datetime-local" />`
- **json**: `<Textarea name="..." autosize minRows={3} />` (import from `@mantine/core`) — parse with `JSON.parse()` in `onSubmit`
- **file**: Skip for now (file uploads need special handling)
- **relation**: Skip for now (relations need custom select with data fetching)
- **geoPoint**: Skip (hidden/internal fields)

For the `onSubmit` handler, convert formData values:
- Numbers: `Number(formData.get('field'))`
- Booleans: `formData.get('field') === 'on'`
- JSON: `JSON.parse(formData.get('field') as string)` (wrap in try/catch or let API validate)
- Everything else: `formData.get('field') as string`

### 6. Route Definitions — `frontend/src/lib/routes.ts`

Add a new route group to the `routes` object:

```tsx
{routeKey}: {
  list: defineRoute('/{url-slug}'),
  new: defineRoute('/{url-slug}/new'),
  detail: defineRoute<'id'>('/{url-slug}/:id'),
},
```

The URL slug should be the collection name with underscores converted to hyphens (e.g., `activity_logs` → `activity-logs`).

If the collection will have an edit form, also add:
```tsx
edit: defineRoute<'id'>('/{url-slug}/:id/edit'),
```

### 7. Router — `frontend/src/Router.tsx`

Add lazy imports at the top with the other lazy imports:

```tsx
const {Name}List = lazy(() => import('./pages/{Name}List'))
const {Name}Detail = lazy(() => import('./pages/{Name}Detail'))
const {Name}Form = lazy(() => import('./pages/{Name}Form'))
```

Add Route entries inside the `AuthGate > Layout` block:

```tsx
<Route path={routes.{routeKey}.list.path} Component={() => <{Name}List />} />
<Route path={routes.{routeKey}.new.path} Component={() => <{Name}Form />} />
<Route path={routes.{routeKey}.detail.path} Component={() => <{Name}Detail />} />
```

### 8. NavBar (Optional) — `frontend/src/components/layout/NavBar.tsx`

Only add a nav entry if the user explicitly asks for it. If they do, add an `ActionIcon` to the navbar group:

```tsx
<ActionIcon
  onClick={handleNavigate(routes.{routeKey}.list())}
  aria-label="{Display Name Plural}"
  data-active={routeMatches([routes.{routeKey}.list()])}
  {...actionIconProps}
>
  <Icon type="{iconType}" size={actionIconProps.size} stroke={actionIconStroke} />
  <span>{Short Label}</span>
</ActionIcon>
```

### 9. Seed Data (Optional) — `frontend/tasks/seed-collection.mjs`

Only add if the user asks. Add an entry to `fakeDataGenerators`:

```js
{collection_name}: (pb) => {
  return {
    // Generate realistic fake data for each field
  }
},
```

## Naming Conventions

Given a collection name like `activity_logs` with interface `ActivityLogsRecord`:

| Concept | Value | Rule |
|---------|-------|------|
| Collection name | `activity_logs` | As-is from PocketBase |
| Record interface | `ActivityLogsRecord` | From PBCollections.d.ts |
| Hook name | `useActivityLogsCollection` | `use` + PascalCase(collection) + `Collection` |
| Hook file | `useActivityLogsCollection.ts` | Same as hook name |
| Route key | `activityLogs` | camelCase of collection name |
| URL slug | `activity-logs` | kebab-case of collection name |
| Page prefix | `ActivityLog` | PascalCase singular (drop trailing 's' if plural) |
| List page | `ActivityLogList.tsx` | Singular prefix + `List` |
| Detail page | `ActivityLogDetail.tsx` | Singular prefix + `Detail` |
| Form page | `ActivityLogForm.tsx` | Singular prefix + `Form` |
| Display name | `Activity Logs` / `Activity Log` | Title case, natural English |

## Process

1. Read the target collection interface from `PBCollections.d.ts`
2. Ask the user which collection to scaffold (if not specified)
3. Determine the naming from the conventions table above
4. Generate all files in order: query hook → barrel export → pages → routes → router
5. Ask if they want nav bar entry or seed data
6. Run `npm run typecheck` from the `frontend/` directory to verify no type errors
