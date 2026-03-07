# Deployment & Hosting

This file will help you get setup with auto-deployments via Github and hosting on [Railway](https://railway.com?referralCode=ched_dev) (referral code URL).

## Railway Introduction

Railway.com is a simple hosting platform which provides a free tier through a $5 credit towards monthly bill (as of March 2026). You can create a free trial account without a credit card to test the template. After your free trial expires, you will need to add a credit card to prove you are not a bot. The out-of-the-box ProductBase install should be within the free credit limit. If you grow in traffic, data, or file and backup storage, you will see your bill grow.

If you don't already have a Railway account, follow these instructions to get one setup:
- Visit [Railway](https://railway.com?referralCode=ched_dev) (referral code URL)
- In the top menu, click **Sign in** (you can use Github or email login)
- After login you will have your projects dashboard and ready for next steps

## Railway Project Setup

You can install the template from this URL: [ProductBase Template on Railway](https://railway.com/deploy/DSlwFZ?referralCode=ched_dev&utm_medium=integration&utm_source=template&utm_campaign=deployment_docs) - or follow instructions below to do a manual install.

To setup a ProductBase app from within Railway, login to Railway and follow these instructions:
- Start from the **Projects** page (aka Dashboard)
- Click on the **New** button to create a new project
- You will see the **What would you like to create?** prompt
- In the list below, click **Template**
- Search for **ProductBase** and find the template by **ched_dev** (others may be imposters)

Template initialization:
- Choose the project you wish to deploy to (most likely a New Project)
- If you want to fine tune environment values (SMTP, auto-create account information) before install, click **Configure** and **Save Config** when done (otherwise you can change these later)
- Choose your desired regions for the buckets (ideally the same region)
- Click **Deploy**

This will create a `production` environment by default. 

If you run into problems, see [Troubleshooting Template Deployment](#troubleshooting-template-deployment) below.

## Create your Superuser

- Click on the `productbase-docker` service
- In the **Deployments** tab, find the latest deployment and click on **View logs** button
- Switch to the **Deploy Logs** tab
- Find the log similar to:
```
http://0.0.0.0:8100/_/#/pbinstal/ey...
```
- Copy the link and save it to a text file temporarily
- Replace the `http://0.0.0.0:8100` with your public domain, E.g. `https://productbase-docker-production.up.railway.app`
- Open the URL in a browser: E.g. `https://productbase-docker-production.up.railway.app/_/#/pbinstal/ey...`
- You will see the PocketBase admin screen to create the Superuser
- Fill out the information and create your Superuser

## Troubleshooting Template Deployment

If the deployment fails, look into the Build Logs and diagnose the issue. It's likely missing environment variables. Update the environment variables and deploy them.

If the deployment is successful but the public URL doesn't load properly:
- In the `productbase-docker` service settings, confirm the domain is pointing to the correct port of the app `8100`.

If you can't login to the frontend app, confirm you are using a **user** account and not a **superuser** account. The frontend app only uses the **user** for authentication.

## Setting up a deployed development account

When you want to develop on top of ProductBase, you may want to setup a development deployment to use for testing.

Follow these steps to create a cloned development environment in Railway:
- From within the project page, click the **production** dropdown in the left side of the top nav
- Click **New Environment**
- Name it `development`
- Choose the **Duplicate Environment** option with **production** as the environment
- Click **Create Environment**
- Let the initial deployment finish
- Click on the `productbase-docker` service
- Change to the **Variables** tab
- Click the **Raw Editor** button
- Add the following environment variables first in the list (these will allow automatic user creation for next steps), feel free to change values
```env
# Frontend Dev Setup (auto-login in dev mode - should match backend env vars)
## DON'T REUSE REAL EMAIL PASSWORD HERE
VITE_DEV_MOCK_USER_NAME=mock account
VITE_DEV_MOCK_USER_EMAIL=mock@gmail.com
VITE_DEV_MOCK_USER_PASSWORD=password
# Backend Dev Setup (auto-create users)
## DON'T USE DEV_* VARS IN PRODUCTION
DEV_SUPERUSER_EMAIL=superuser@gmail.com
DEV_SUPERUSER_PASSWORD=superuser
DEV_MOCK_USER_NAME=mock account
DEV_MOCK_USER_EMAIL=mock@gmail.com
DEV_MOCK_USER_PASSWORD=password
```
- Next we will reset the database by wiping it (it will be recreated after)
  - Click on the `productbase-docker-volume`
  - Change to **Settings**
  - Click **Wipe Volume**
  - The deployment will restart with the mock users created

You can now use this as a base for PR environments (temporary preview environments).

## Setting up PR deployment environments

After you've setup the develop environment in Railway, you can enable PR environments to deploy a temporary environment when PRs are created or updated. A URL will be added to the PR via comment from the Railway bot.

To enable the PR environments:
- Open the **Project Settings**
- Go to **Environments** section
- In the **PR Environments** section, click **Enable PR Environments** button
- Set the **Base Environment** to the development environment you created
- In **Bot PR Environments** confirm **Enable Bot PR Environments** is *enabled* (should be enabled for AI bot PRs)
- In **Focused PR Environments** confirm **Enable Focused PR Environments** is *disabled* (this won't deploy unchanged services, use enable if you want fresh environments)

## Reference

### Required Environment Variables in Railway

The following variables will be created in your Railway template deployment. Most of them are referring to dynamic variables that don't need changing.

```env
# IMPORTANT: DO NOT INCLUDE ANY OF THE `DEV_SUPERUSER` or `DEV_USER` values
# Frontend Build Vars
VITE_FRONTEND_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
VITE_POCKETBASE_API_URL=${{VITE_FRONTEND_URL}}
# General PocketBase Information
POCKETBASE_APPLICATION_NAME=ProductBase
POCKETBASE_API_URL=${{VITE_FRONTEND_URL}}
# File Storage Settings
S3_FILES_ACCESS_KEY_ID=${{files_bucket.ACCESS_KEY_ID}}
S3_FILES_SECRET_ACCESS_KEY=${{files_bucket.SECRET_ACCESS_KEY}}
S3_FILES_ENDPOINT=${{files_bucket.ENDPOINT}}
S3_FILES_REGION=${{files_bucket.REGION}}
S3_FILES_BUCKET=${{files_bucket.BUCKET}}
# Backups Storage Settings
S3_BACKUPS_ACCESS_KEY_ID=${{backups_bucket.ACCESS_KEY_ID}}
S3_BACKUPS_SECRET_ACCESS_KEY=${{backups_bucket.SECRET_ACCESS_KEY}}
S3_BACKUPS_ENDPOINT=${{backups_bucket.ENDPOINT}}
S3_BACKUPS_REGION=${{backups_bucket.REGION}}
S3_BACKUPS_BUCKET=${{backups_bucket.BUCKET}}
# SMTP Settings needed to support sending emails (Remove these if not using SMTP)
SMTP_SEND_NAME=ProductBase
SMTP_SEND_ADDRESS=sender@domain.com
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=password
# Volume to store SQLite Database across deployments
VOLUME_MOUNT_PATH=${{RAILWAY_VOLUME_MOUNT_PATH}}
```

### Railway Environment Variables Reference

Common environment variabels provided in the Railway build environment.

| Variable | Description |
|---|---|
| `RAILWAY_PUBLIC_DOMAIN` | The publicly accessible domain. of the form . This is only available after generating a domain in the service settings. This will be your custom domain if you've added one, otherwise railway assigns a name. E.g. `projectname-production.up.railway.app` |
| `RAILWAY_PRIVATE_DOMAIN` | The private DNS name of the service. This can be used to route traffic within Railway to avoid ingress/egress costs. E.g. `productbase.railway.internal` |
| `RAILWAY_PROJECT_NAME` | The project name the service belongs to. E.g. `ProductBase` |
| `RAILWAY_ENVIRONMENT_NAME` | The environment name of the service instance. E.g. `production`, `development`. You get `production` by default and can create new ones manually in the project. |
| `RAILWAY_SERVICE_NAME` | The service name. E.g. `productbase` |
| `RAILWAY_PROJECT_ID` | The project ID the service belongs to. A GUID. |
| `RAILWAY_ENVIRONMENT_ID` | The environment ID of the service instance. A GUID. |
| `RAILWAY_SERVICE_ID` | The service ID. A GUID. |
| `RAILWAY_VOLUME_ID` | The volume ID. A GUID. |
| `RAILWAY_VOLUME_NAME` | The name of the attached volume. E.g. `productbase-volume` |
| `RAILWAY_VOLUME_MOUNT_PATH` | The mount path of the attached volume. Should be set to `/pb_data`. |

You can also refer to other services in the project. They follow the format `${{service_name.ENV_VAR}}`. The Railway Template will provide these variables:

| Variable | Description | Example |
|---|---|---|
| `${{backups_bucket.ACCESS_KEY_ID}}` | S3-compatible access key ID for authentication | `tid_xxx...` |
| `${{backups_bucket.BUCKET}}` | The S3 bucket name | `backupsbucket-cw-0epjd-vy` |
| `${{backups_bucket.ENDPOINT}}` | The S3 endpoint URL | `https://t3.storageapi.dev` |
| `${{backups_bucket.RAILWAY_BUCKET_ID}}` | Railway's unique identifier for the bucket | A GUID |
| `${{backups_bucket.RAILWAY_BUCKET_NAME}}` | Railway's assigned name for the bucket | `backups_bucket` |
| `${{backups_bucket.RAILWAY_ENVIRONMENT_ID}}` | The environment ID of the bucket | A GUID |
| `${{backups_bucket.RAILWAY_ENVIRONMENT_NAME}}` | The environment name the bucket belongs to | `production`, `staging` |
| `${{backups_bucket.RAILWAY_PROJECT_ID}}` | The project ID the bucket belongs to | A GUID |
| `${{backups_bucket.RAILWAY_PROJECT_NAME}}` | The project name the bucket belongs to | `ProductBase` |
| `${{backups_bucket.REGION}}` | The S3 region | `auto` |
| `${{backups_bucket.SECRET_ACCESS_KEY}}` | S3-compatible secret access key for authentication | `tsec_xxx...` |
| `${{files_bucket.*}}` | All the same type of values as `backups_bucket` | See other examples |

### Dockerfile

The production deployment will load up the `./Dockerfile` and run in a container. The Dockerfile uses a multi-stage build with the following steps:

**Stage 1 — Frontend Builder** (`node:20-alpine`)
- Copies the `./frontend` directory and accepts environment variables as build args
- Runs `npm install` and `npm run build` to produce static assets via Vite

**Stage 2 — Backend Builder** (`golang:1.24-alpine`)
- Installs build dependencies: `git`, `ca-certificates`, `gcc`, `musl-dev` (needed for CGO/SQLite)
- Copies `go.mod` / `go.sum` first for layer caching, then downloads dependencies
- Copies the `./pocketbase` source and compiles the Go binary, outputting `/app/pocketbase`

**Stage 3 — Production Image** (`alpine:latest`)
- Installs runtime packages: `ca-certificates`, `tzdata`, `openssh`
- Creates the directory structure: `/pb/pb_public`, `/pb/pb_migrations`, `/pb/pb_hooks`, `/pb/pb_data`
- Copies the compiled Go binary from Stage 2 into `/pb/pocketbase`
- Copies the Vite-built frontend static assets from Stage 1 into `/pb/pb_public` (served by PocketBase)
- Copies `./pocketbase/pb_migrations` and `./pocketbase/pb_hooks` into the container
- Exposes port `8100`
- Starts the server via `pocketbase serve`, using the `VOLUME_MOUNT_PATH` env var for `--dir` (persistent SQLite storage), with migrations, hooks, and public dirs all pointing to their respective `/pb/` subdirectories
