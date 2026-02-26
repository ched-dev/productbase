# Productbase: A Product Starter Template for Pocketbase

Spin up a new Pocketbase project with the base configuration for a product.

## Features

User signup flow
- [x] Open / Close Registrations
- [ ] Join a Waitlist
- [ ] Signup
  - [x] Requires unique email
  - [ ] Requires agreeing to Terms & Privacy
- [ ] Forgot Password Reset
- [ ] Email Verification
- [ ] Max failed login attempts

Frontend
- [x] React + Mantine UI compiled to static site
- [ ] Mobile first app
- [ ] User Settings page
- [x] PBDataList and PBData classes to help with relational data

Email Integration
- [ ] SMTP connection via Pocketbase
- [ ] Code-based email templating
- [ ] Emails can be emulated in dev mode
- [ ] Emails can be displayed in browser

Payments Integration
- [ ] Stripe single item checkout
- [ ] Stripe subscription model

Analytics Integration
- [ ] Umami?
- [ ] Sentry Integration

Hosting
- [ ] Hosted on Railway (pocketbase w/ volume mount, backup bucket, file bucket)
- [ ] Auto deployments via Github repo

Backups
- [ ] Database backups via Pocketbase + Railway Bucket
- [ ] DB restore from Pocketbase admin

Dev Tools
- [ ] Local scripts to seed or copy db from prod

## Limitations

Unsupported features with replacements needed:
- Typescript types for Pocketbase data
- Role-based access permissions

## Copyright

This template is copyright until a v1.0 release