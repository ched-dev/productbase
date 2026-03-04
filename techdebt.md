# Technical Debt

Tasks that need further planning or reimplementation.

Organizations
- [ ] User can create multiple Organizations
- [ ] User should be able to close Organization
- [ ] Cannot invite another owner
- [ ] Cannot transfer to a non-accepted user
- [ ] Invited email and acceptance, clear email on acceptance
- [ ] Removed from Org email

High Priority
- [ ] Add simple debug log in each custom hook handler to confirm it is being called and not blocked by API Rules
- [ ] Go through manual collection creation process

Auth
- [ ] MFA integration
- [ ] Auth with third party providers
- [ ] Move forgot password and accept invite routes to routes file

General
- [ ] Add a landing page which doesn't require auth, links to login and signup
- [ ] Add config.ts information
- [ ] Create a Style Guide page for custom components
- [ ] Cron job to delete old backups
- [ ] Auto-backup on deployment before migrations
- [ ] Update `npm run generate-pb-types` to show errors for failed migrations
- [ ] Update `make seed-collection` to be more dynamic and support attaching user
- [ ] Forms attach authed user at server side
- [x] Are `e.app` and `$app` different permissions?
- [ ] Handle non-typed Pocketbase data: JSON fields, enums
- [ ] Mantine error colors
- [ ] Squash migrations after a feature is completed
- [ ] `nvm use # node v20+` for everyone
- [ ] Replace public fav icons