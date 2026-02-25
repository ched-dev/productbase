# Productbase: A Product Starter Template for Pocketbase

Spin up a new Pocketbase project with the base configuration for a product.

## Features

User signup flow
- [ ] Signup, Forgot / Password Reset
- [ ] Email Verification
- [ ] Max failed login attempts
- [ ] Open / Close Registrations
- [ ] Join a Waitlist

Frontend
- [ ] React + Mantine UI compiled to static site
- [ ] User Settings page

Email Integration
- [ ] SMTP connection via Pocketbase
- [ ] Code-based email templating

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

## Tasks

Mailer hook for devs
- If dev mode, emulate emails
- Click to show email in browser

Pocketbase Code Prompt:
My app is setup to use Pocketbase and I am extending it via their [event hooks](https://pocketbase.io/docs/js-event-hooks/) and using a custom collection name `_productbase_settings` which acts as a singleton.
