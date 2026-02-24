# Build stage for Go application using Pocketbase as a framework
FROM golang:1.24-alpine AS build-backend

# Install required build dependencies (gcc and musl-dev needed for CGO)
RUN apk add --no-cache git ca-certificates gcc musl-dev

# Set working directory
WORKDIR /app

# Copy go mod files first for better layer caching
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the entire pocketbase directory
COPY . ./

# Build the Go binary with Pocketbase framework
# CGO is required for SQLite
RUN CGO_ENABLED=1 GOOS=linux go build -o pocketbase .

# Production stage
FROM alpine:latest AS production

# Install runtime dependencies
RUN apk add --no-cache ca-certificates

# Copy the built binary from build stage
COPY --from=build-backend /app/pocketbase /pb/pocketbase

# Copy migrations and hooks
COPY --from=build-backend /app/pb_migrations /pb/pb_migrations
COPY --from=build-backend /app/pb_hooks /pb/pb_hooks

# Set working directory
WORKDIR /pb

# Expose port
EXPOSE 8100

# Run the Go server with Pocketbase
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8100"]
