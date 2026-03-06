# ProductBase

> A Product Starter Template for Pocketbase

Spin up a new Pocketbase project with the base configuration for a product.

## Features

AI Agent Friendly
- [x] Documented standards for AI Agents to use when adding new features in codebase

Feature Flagging
- [ ] Environment variable driven feature enablement
- [ ] CLI tools to generate larger features

User signup flow
- [x] Open / Close Registrations
- [ ] Join a Waitlist
- [ ] Signup
  - [x] Requires unique email
  - [ ] Requires agreeing to Terms & Privacy
- [ ] Forgot Password Reset
- [ ] Email Verification
- [ ] Max failed login attempts
- [ ] User Settings page

Organizations (Workspaces, Teams)
- [x] Higher level grouping of users
- [x] Users can have Memberships to many Organizations
- [x] Users have a role within the Organization (owner, admin, member)
- [ ] Naming is customizable

User Feedback Widget
- [x] Prebuilt User Feedback Widget triggered via button
- [x] Collects feedback type, message, and if a reply is desired
- [ ] Add a hook to forward feedback elsewhere (Slack, Linear, etc.)

User Notifications Widget
- [ ] In app notifications menu

User Referrals
- [ ] Users can refer each other via custom codes

Email Integration
- [ ] SMTP connection via Pocketbase
- [ ] Code-based email templating
- [ ] Emails can be emulated in dev mode

Frontend
- [x] React + [Mantine](https://mantine.dev/) compiled to static site served via PocketBase
- [ ] Landing page design template
- [ ] Mobile first design template
- [x] Reusable coding standards to easily build out new features
  - [x] Generated TypeScript files for Pocketbase Collections `npm run generate-pb-types`
  - [x] `queryHooks` to easily access PB collection data with TypeScript support
  - [x] PBDataList and PBData classes to help with squashing expanded relational data
  - [ ] Keyboard shortcuts manager
- [ ] Premade UI elements
  - [ ] Modal component
  - [ ] Toast notification system
  - [ ] Alert system
  - [ ] Empty states
  - [ ] Show more pagination

Hosting
- [ ] Hosted on Railway (pocketbase w/ volume mount, backup bucket, file bucket)
- [ ] Auto deployments via Github repo

Backups
- [ ] Database backups via Pocketbase + Railway Bucket
- [ ] DB restore from Pocketbase admin

Dev Tools
- [x] Local scripts to help development (`make help`)
  - [ ] Create a Collection based on a sample JSON
  - [x] Seed DB Collection (`make seed-collection COLLECTION=user_feedback COUNT=3`)
  - [x] Reset DB (`make db-reset`)
  - [x] Migrations Sync (`make migrations-sync`)
  - [ ] Scaffold a new Collection
  - [ ] Scaffold CRUD components for Collection

Payments Integration
- [ ] Stripe single item checkout
- [ ] Stripe subscription model

Analytics Integration
- [ ] Umami Integration
- [ ] Sentry Integration

## Documentation

Start from the [docs/INDEX.md](./docs/INDEX.md).

## Copyright

This template is copyright until a v1.0 release