# Stage 1: Build the static frontend files with Vite
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY ./frontend ./
ARG VITE_FRONTEND_URL=$VITE_FRONTEND_URL
ARG VITE_POCKETBASE_API_URL=$VITE_POCKETBASE_API_URL

RUN npm install
RUN npm run build

# Stage 2: Build the Go backend with Pocketbase as a framework
FROM golang:1.24-alpine AS backend-builder

# Install build dependencies for Go and SQLite
RUN apk add --no-cache git ca-certificates gcc musl-dev

# Set working directory
WORKDIR /app

# Copy go mod files first for better layer caching
COPY ./pocketbase/go.mod ./pocketbase/go.sum ./

# Download dependencies
RUN go mod download

# Copy the entire pocketbase directory
COPY ./pocketbase ./

# Build the Go binary with Pocketbase framework
# CGO is required for SQLite (modernc.org/sqlite)
RUN CGO_ENABLED=1 GOOS=linux go build -ldflags="-s -w" -o pocketbase .

# Stage 3: Production image
FROM alpine:latest AS production

# Build arguments for runtime configuration
ARG POCKETBASE_APPLICATION_NAME=$POCKETBASE_APPLICATION_NAME
ARG POCKETBASE_API_URL=$POCKETBASE_API_URL
ARG S3_FILES_ACCESS_KEY_ID=$S3_FILES_ACCESS_KEY_ID
ARG S3_FILES_SECRET_ACCESS_KEY=$S3_FILES_SECRET_ACCESS_KEY
ARG S3_FILES_ENDPOINT=$S3_FILES_ENDPOINT
ARG S3_FILES_REGION=$S3_FILES_REGION
ARG S3_FILES_BUCKET=$S3_FILES_BUCKET
ARG S3_BACKUPS_ACCESS_KEY_ID=$S3_BACKUPS_ACCESS_KEY_ID
ARG S3_BACKUPS_SECRET_ACCESS_KEY=$S3_BACKUPS_SECRET_ACCESS_KEY
ARG S3_BACKUPS_ENDPOINT=$S3_BACKUPS_ENDPOINT
ARG S3_BACKUPS_REGION=$S3_BACKUPS_REGION
ARG S3_BACKUPS_BUCKET=$S3_BACKUPS_BUCKET
ARG SMTP_SEND_NAME=$SMTP_SEND_NAME
ARG SMTP_SEND_ADDRESS=$SMTP_SEND_ADDRESS
ARG SMTP_SERVER=$SMTP_SERVER
ARG SMTP_PORT=$SMTP_PORT
ARG SMTP_USER=$SMTP_USER
ARG SMTP_PASSWORD=$SMTP_PASSWORD
ARG VOLUME_MOUNT_PATH=$VOLUME_MOUNT_PATH

# Install runtime dependencies
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    # Optional: needed if you want to use scp to copy pb_data locally
    openssh

# Create directory structure
RUN mkdir -p /pb/pb_public /pb/pb_migrations /pb/pb_hooks /pb/pb_data

# Copy the Go binary from backend builder
COPY --from=backend-builder /app/pocketbase /pb/pocketbase

# Copy frontend static assets to pb_public
COPY --from=frontend-builder /app/dist /pb/pb_public

# Copy migrations and hooks
COPY ./pocketbase/pb_migrations /pb/pb_migrations
COPY ./pocketbase/pb_hooks /pb/pb_hooks

# Set working directory
WORKDIR /pb

# Expose port
EXPOSE 8100

# Start the Go server with Pocketbase framework
# All static assets including index.html will be served from /pb/pb_public
# Pocketbase admin will load under http://0.0.0.0:8100/_/
# For local testing comment out this CMD and run: docker build -t pbase . && docker run -p 8100:8100 -it pbase
CMD ["/bin/sh","-c","echo \"Starting with volume mount: ${VOLUME_MOUNT_PATH}\"; exec /pb/pocketbase serve --dir=\"${VOLUME_MOUNT_PATH}\" --migrationsDir=/pb/pb_migrations --hooksDir=/pb/pb_hooks --publicDir=/pb/pb_public --http=0.0.0.0:8100"]
