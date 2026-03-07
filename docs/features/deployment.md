# Deployment & Hosting

This file will help you get setup with auto-deployments and hosting on [Railway](https://railway.com?referralCode=ched_dev) (referral code URL).

## Railway Environment Variables

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


## Required Environment Variables in Railway

The following variables will need to be added to your Railway deployment. Most of them are referring to dynamic variables that don't need changing.

```env
# IMPORTANT: DO NOT INCLUDE ANY OF THE `DEV_SUPERUSER` or `DEV_USER` values
# General PocketBase Information
POCKETBASE_APPLICATION_NAME=Project Name
POCKETBASE_API_URL=$RAILWAY_PUBLIC_DOMAIN
# File Storage Settings
S3_FILES_ACCESS_KEY_ID=${{files_bucket.ACCESS_KEY_ID}}
S3_FILES_SECRET_ACCESS_KEY=${{files_bucket.SECRET_ACCESS_KEY}}
S3_FILES_ENDPOINT=${{files_bucket.REGION}}
S3_FILES_REGION=${{files_bucket.REGION}}
S3_FILES_BUCKET=${{files_bucket.BUCKET}}
# Backups Storage Settings
S3_BACKUPS_ACCESS_KEY_ID=${{backups_bucket.ACCESS_KEY_ID}}
S3_BACKUPS_SECRET_ACCESS_KEY=${{backups_bucket.SECRET_ACCESS_KEY}}
S3_BACKUPS_ENDPOINT=${{backups_bucket.REGION}}
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
VOLUME_MOUNT_PATH=$RAILWAY_VOLUME_MOUNT_PATH
```

## Dockerfile

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