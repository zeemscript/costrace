# =======================
# 1) Build Stage
# =======================
FROM golang:1.25-alpine AS builder

WORKDIR /costrace

# Install git (needed for go mod download from private repos)
RUN apk add --no-cache git

# Download dependencies early (better caching)
COPY go.mod go.sum ./
RUN go mod download

# Copy the project
COPY . .

# Build the Go binary
# RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o costrace .
RUN go build -o costrace .

FROM alpine:3.20

WORKDIR /costrace

# Copy binary from builder
COPY --from=builder /costrace .

EXPOSE 8081

# Run the API
CMD ["./costrace"]