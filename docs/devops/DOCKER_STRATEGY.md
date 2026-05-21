# DOCKER STRATEGY — Prani Doctor

**Version:** 1.0.0  
**Last Updated:** 2026-05-21  
**Scope:** Container architecture, images, compose configurations, orchestration

---

## Table of Contents

1. [Docker Philosophy](#1-docker-philosophy)
2. [Image Strategy](#2-image-strategy)
3. [Dockerfile Standards](#3-dockerfile-standards)
4. [Docker Compose Architecture](#4-docker-compose-architecture)
5. [Service Definitions](#5-service-definitions)
6. [Volume Management](#6-volume-management)
7. [Network Configuration](#7-network-configuration)
8. [Environment Management](#8-environment-management)
9. [Container Security](#9-container-security)
10. [Development Workflow](#10-development-workflow)
11. [Production Deployment](#11-production-deployment)
12. [Future: Kubernetes Migration](#12-future-kubernetes-migration)

---

## 1. Docker Philosophy

### 1.1 Core Principles

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DOCKER PRINCIPLES                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. IMMUTABLE INFRASTRUCTURE                                                    │
│     • Build once, deploy everywhere                                             │
│     • No runtime modifications to containers                                    │
│     • Configuration via environment variables                                   │
│                                                                                  │
│  2. MINIMAL IMAGES                                                              │
│     • Multi-stage builds                                                        │
│     • Alpine-based where possible                                               │
│     • Only necessary dependencies                                               │
│                                                                                  │
│  3. REPRODUCIBLE BUILDS                                                         │
│     • Pinned versions                                                           │
│     • Locked dependencies                                                       │
│     • Deterministic builds                                                      │
│                                                                                  │
│  4. SECURITY FIRST                                                              │
│     • Non-root users                                                            │
│     • No secrets in images                                                      │
│     • Regular base image updates                                                │
│     • Vulnerability scanning                                                    │
│                                                                                  │
│  5. OBSERVABLE                                                                  │
│     • Health checks on all services                                             │
│     • Structured logging                                                        │
│     • Metrics endpoints                                                         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Container Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CONTAINER ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  STATELESS CONTAINERS                    STATEFUL CONTAINERS                    │
│  ─────────────────────                   ────────────────────                   │
│  ┌─────────────────────┐                 ┌─────────────────────┐               │
│  │  pranidoctor-web    │                 │    PostgreSQL       │               │
│  │  • Next.js App      │                 │    • Persistent     │               │
│  │  • Horizontally     │                 │    • Volume mounted │               │
│  │    scalable         │                 │    • Single instance│               │
│  │  • No local state   │                 │      (Phase 1)      │               │
│  └─────────────────────┘                 └─────────────────────┘               │
│                                                                                  │
│  ┌─────────────────────┐                 ┌─────────────────────┐               │
│  │  caddy              │                 │    Redis            │               │
│  │  • Reverse proxy    │                 │    • Session/cache  │               │
│  │  • SSL termination  │                 │    • Job queues     │               │
│  │  • Load balancing   │                 │    • Persistence    │               │
│  └─────────────────────┘                 └─────────────────────┘               │
│                                                                                  │
│                                          ┌─────────────────────┐               │
│                                          │    MinIO            │               │
│                                          │    • Object storage │               │
│                                          │    • S3 compatible  │               │
│                                          └─────────────────────┘               │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Image Strategy

### 2.1 Image Naming Convention

```
Format: [registry]/[repository]:[tag]

Examples:
  ghcr.io/pranidoctor/web:prod-1.2.3-abc1234
  ghcr.io/pranidoctor/web:staging-1.2.3-def5678
  ghcr.io/pranidoctor/web:latest
  ghcr.io/pranidoctor/web:sha-abc1234

Tag Convention:
  [environment]-[version]-[commit_sha]

  environment: prod | staging | dev
  version:     SemVer (1.2.3)
  commit_sha:  First 7 characters of git commit
```

### 2.2 Base Image Selection

| Service | Base Image | Reason |
|---------|------------|--------|
| Next.js App | `node:20-alpine` | Small, LTS, compatible |
| PostgreSQL | `postgres:16-alpine` | Official, minimal |
| Redis | `redis:7-alpine` | Official, minimal |
| MinIO | `minio/minio:latest` | Official only |
| Caddy | `caddy:2-alpine` | Official, minimal |

### 2.3 Image Versioning Policy

```yaml
# Version policy
versioning:
  base_images:
    update: "Monthly"
    testing: "Staging first, 24h soak"
    pinning: "Use digest for production"
  
  application:
    strategy: "SemVer"
    major: "Breaking changes"
    minor: "New features"
    patch: "Bug fixes"
  
  retention:
    production: "Keep last 10 versions"
    staging: "Keep last 5 versions"
    development: "Keep last 3 versions"
```

---

## 3. Dockerfile Standards

### 3.1 Application Dockerfile

```dockerfile
# /Dockerfile

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

# Security: Run as non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Install dependencies only when needed
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_VERSION

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# ============================================
# Stage 3: Runner
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copy only production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma client and schema
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
```

### 3.2 Multi-Architecture Build

```dockerfile
# Build for multiple architectures
# docker buildx build --platform linux/amd64,linux/arm64 -t image:tag .

FROM --platform=$TARGETPLATFORM node:20-alpine AS runner
ARG TARGETPLATFORM
ARG BUILDPLATFORM

RUN echo "Building on $BUILDPLATFORM for $TARGETPLATFORM"

# ... rest of Dockerfile
```

### 3.3 Dockerfile Best Practices

```dockerfile
# ============================================
# DOCKERFILE BEST PRACTICES
# ============================================

# 1. Use specific versions, not 'latest'
FROM node:20.11.0-alpine3.19

# 2. Combine RUN commands to reduce layers
RUN apk add --no-cache \
    curl \
    git \
    && rm -rf /var/cache/apk/*

# 3. Use .dockerignore
# See .dockerignore section below

# 4. Copy files in order of change frequency
COPY package*.json ./          # Changes less often
COPY prisma ./prisma/          # Changes occasionally
COPY src ./src/                # Changes frequently

# 5. Use ARG for build-time variables
ARG BUILD_DATE
ARG GIT_COMMIT
LABEL org.opencontainers.image.created=$BUILD_DATE
LABEL org.opencontainers.image.revision=$GIT_COMMIT

# 6. Use ENV for runtime variables
ENV NODE_ENV=production

# 7. Don't run as root
USER 1001

# 8. Always include HEALTHCHECK
HEALTHCHECK CMD curl -f http://localhost:3000/health || exit 1
```

### 3.4 .dockerignore

```
# /.dockerignore

# Dependencies
node_modules
.pnpm-store

# Build outputs (rebuilt in container)
.next
out
build
dist

# Development
.env.local
.env.*.local
*.log
npm-debug.log*

# Testing
coverage
.nyc_output

# IDE
.idea
.vscode
*.swp
*.swo

# Git
.git
.gitignore

# Docker
Dockerfile*
docker-compose*
.dockerignore

# Documentation
docs
*.md
!README.md

# Misc
.DS_Store
Thumbs.db
```

---

## 4. Docker Compose Architecture

### 4.1 Compose File Structure

```
/opt/pranidoctor/apps/web/
├── docker-compose.yml              # Base configuration
├── docker-compose.override.yml     # Development overrides (gitignored)
├── docker-compose.prod.yml         # Production overrides
├── docker-compose.staging.yml      # Staging overrides
├── .env.example                    # Example environment
├── .env.production                 # Production env (encrypted/gitignored)
└── .env.staging                    # Staging env (encrypted/gitignored)
```

### 4.2 Base Docker Compose

```yaml
# docker-compose.yml

version: '3.9'

services:
  # ============================================
  # Application
  # ============================================
  pranidoctor-web:
    image: ghcr.io/pranidoctor/web:${APP_VERSION:-latest}
    container_name: pranidoctor-web
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - frontend
      - backend
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 1536M
        reservations:
          cpus: '0.5'
          memory: 512M

  # ============================================
  # PostgreSQL Database
  # ============================================
  postgres:
    image: postgres:16-alpine
    container_name: pranidoctor-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config/postgres/postgresql.conf:/etc/postgresql/postgresql.conf:ro
      - ./config/postgres/init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - backend
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2048M
        reservations:
          cpus: '0.5'
          memory: 1024M

  # ============================================
  # Redis Cache & Queue
  # ============================================
  redis:
    image: redis:7-alpine
    container_name: pranidoctor-redis
    restart: unless-stopped
    command: redis-server /usr/local/etc/redis/redis.conf
    volumes:
      - redis_data:/data
      - ./config/redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.1'
          memory: 128M

  # ============================================
  # MinIO Object Storage
  # ============================================
  minio:
    image: minio/minio:latest
    container_name: pranidoctor-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - backend
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.1'
          memory: 256M

  # ============================================
  # Caddy Reverse Proxy
  # ============================================
  caddy:
    image: caddy:2-alpine
    container_name: pranidoctor-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - pranidoctor-web
    networks:
      - frontend
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

# ============================================
# Volumes
# ============================================
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  minio_data:
    driver: local
  caddy_data:
    driver: local
  caddy_config:
    driver: local

# ============================================
# Networks
# ============================================
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
```

### 4.3 Production Overrides

```yaml
# docker-compose.prod.yml

version: '3.9'

services:
  pranidoctor-web:
    image: ghcr.io/pranidoctor/web:${APP_VERSION}
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"
        labels: "service,env"
    labels:
      - "service=pranidoctor-web"
      - "env=production"

  # Second app instance for load balancing
  pranidoctor-web-2:
    image: ghcr.io/pranidoctor/web:${APP_VERSION}
    container_name: pranidoctor-web-2
    restart: unless-stopped
    env_file:
      - .env.production
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - frontend
      - backend
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 1536M

  postgres:
    volumes:
      - /opt/pranidoctor/data/postgres:/var/lib/postgresql/data
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "3"

  redis:
    volumes:
      - /opt/pranidoctor/data/redis:/data
    command: redis-server /usr/local/etc/redis/redis.conf --appendonly yes

  minio:
    volumes:
      - /opt/pranidoctor/data/minio:/data

  caddy:
    volumes:
      - /opt/pranidoctor/config/caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - /opt/pranidoctor/data/caddy/data:/data
      - /opt/pranidoctor/data/caddy/config:/config
```

### 4.4 Development Overrides

```yaml
# docker-compose.override.yml (local development)

version: '3.9'

services:
  pranidoctor-web:
    build:
      context: .
      dockerfile: Dockerfile
      target: deps
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev
    environment:
      - NODE_ENV=development
    ports:
      - "3000:3000"

  postgres:
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  redis:
    ports:
      - "6379:6379"

  minio:
    ports:
      - "9000:9000"
      - "9001:9001"

  # Remove Caddy in development
  caddy:
    profiles:
      - prod-only

volumes:
  postgres_dev_data:
```

---

## 5. Service Definitions

### 5.1 PostgreSQL Configuration

```conf
# config/postgres/postgresql.conf

# Connection Settings
listen_addresses = '*'
max_connections = 100
superuser_reserved_connections = 3

# Memory Settings
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
work_mem = 4MB

# Checkpoint Settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB

# Query Planning
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

# Locale
lc_messages = 'en_US.utf8'
lc_monetary = 'en_US.utf8'
lc_numeric = 'en_US.utf8'
lc_time = 'en_US.utf8'
```

### 5.2 Redis Configuration

```conf
# config/redis/redis.conf

# Network
bind 0.0.0.0
port 6379
protected-mode yes

# General
daemonize no
pidfile /var/run/redis/redis-server.pid
loglevel notice
logfile ""

# Persistence
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# Memory
maxmemory 256mb
maxmemory-policy allkeys-lru

# Security
# requirepass your_redis_password

# Snapshotting
save 900 1
save 300 10
save 60 10000
dbfilename dump.rdb
dir /data
```

### 5.3 MinIO Bucket Initialization

```bash
#!/bin/bash
# config/minio/init-buckets.sh

# Wait for MinIO to be ready
until curl -sf http://minio:9000/minio/health/live; do
    echo "Waiting for MinIO..."
    sleep 2
done

# Configure mc client
mc alias set myminio http://minio:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD

# Create buckets
mc mb --ignore-existing myminio/pranidoctor-media
mc mb --ignore-existing myminio/pranidoctor-uploads
mc mb --ignore-existing myminio/pranidoctor-backups

# Set bucket policies
mc anonymous set download myminio/pranidoctor-media
# mc policy set upload myminio/pranidoctor-uploads

echo "MinIO buckets initialized successfully"
```

---

## 6. Volume Management

### 6.1 Volume Strategy

```yaml
# Volume types and usage
volumes:
  # Named volumes for services
  postgres_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/pranidoctor/data/postgres
  
  # Performance volumes (use local driver)
  redis_data:
    driver: local
  
  # Large storage volumes
  minio_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/pranidoctor/data/minio
```

### 6.2 Backup-Friendly Volume Layout

```
/opt/pranidoctor/data/
├── postgres/                 # Database files
│   └── pgdata/
├── redis/                    # Redis AOF/RDB
│   ├── appendonly.aof
│   └── dump.rdb
├── minio/                    # Object storage
│   └── pranidoctor-media/
│       └── uploads/
└── caddy/                    # Caddy certificates
    ├── data/
    └── config/
```

### 6.3 Volume Backup Script

```bash
#!/bin/bash
# scripts/backup-volumes.sh

BACKUP_DIR="/opt/pranidoctor/backups/volumes"
DATE=$(date +%Y%m%d_%H%M%S)

# Stop services before backup
docker compose stop pranidoctor-web pranidoctor-web-2

# Backup PostgreSQL data
docker run --rm \
    -v pranidoctor_postgres_data:/data:ro \
    -v $BACKUP_DIR:/backup \
    alpine tar czf /backup/postgres_$DATE.tar.gz -C /data .

# Backup Redis data
docker run --rm \
    -v pranidoctor_redis_data:/data:ro \
    -v $BACKUP_DIR:/backup \
    alpine tar czf /backup/redis_$DATE.tar.gz -C /data .

# Restart services
docker compose start pranidoctor-web pranidoctor-web-2

echo "Volume backup completed: $DATE"
```

---

## 7. Network Configuration

### 7.1 Network Isolation

```yaml
# Detailed network configuration
networks:
  frontend:
    name: pranidoctor-frontend
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.20.0.0/24
          gateway: 172.20.0.1
    driver_opts:
      com.docker.network.bridge.enable_icc: "true"
      com.docker.network.bridge.enable_ip_masquerade: "true"
  
  backend:
    name: pranidoctor-backend
    driver: bridge
    internal: true  # No external access
    ipam:
      driver: default
      config:
        - subnet: 172.21.0.0/24
          gateway: 172.21.0.1
```

### 7.2 Service Network Assignment

| Service | Frontend | Backend | Reason |
|---------|----------|---------|--------|
| Caddy | ✓ | ✗ | Public-facing |
| App | ✓ | ✓ | Receives traffic, accesses DB |
| PostgreSQL | ✗ | ✓ | Internal only |
| Redis | ✗ | ✓ | Internal only |
| MinIO | ✗ | ✓ | Internal only |

### 7.3 DNS Resolution

```yaml
# Docker internal DNS
services:
  pranidoctor-web:
    # Can access other services by name
    environment:
      - DATABASE_URL=postgresql://postgres:5432/pranidoctor
      - REDIS_URL=redis://redis:6379
      - MINIO_ENDPOINT=minio:9000
```

---

## 8. Environment Management

### 8.1 Environment File Structure

```bash
# .env.example (committed to git)
# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://pranidoctor.com
APP_VERSION=1.0.0

# Database
DB_NAME=pranidoctor_db
DB_USER=pranidoctor
DB_PASSWORD=CHANGE_ME

# Redis
REDIS_PASSWORD=CHANGE_ME

# MinIO
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=CHANGE_ME

# JWT Secrets
ADMIN_JWT_SECRET=CHANGE_ME_32_CHARS_MIN
MOBILE_JWT_SECRET=CHANGE_ME_32_CHARS_MIN

# AI Services
OPENAI_API_KEY=sk-CHANGE_ME

# SMS Provider
SMS_API_KEY=CHANGE_ME
```

### 8.2 Secret Management

```yaml
# Option 1: Docker secrets (Swarm mode)
secrets:
  db_password:
    external: true
  jwt_secret:
    external: true

services:
  pranidoctor-web:
    secrets:
      - db_password
      - jwt_secret
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password

# Option 2: Environment files (current approach)
services:
  pranidoctor-web:
    env_file:
      - .env.production

# Option 3: External secret manager (future)
# HashiCorp Vault, AWS Secrets Manager, etc.
```

### 8.3 Environment Encryption

```bash
#!/bin/bash
# scripts/encrypt-env.sh

# Encrypt environment file using age or sops
# https://github.com/getsops/sops

# Using SOPS with age
sops --encrypt --age $(cat $AGE_KEY_FILE | grep "public key" | cut -d: -f2 | tr -d ' ') \
    .env.production > .env.production.enc

# Decrypt
sops --decrypt .env.production.enc > .env.production
```

---

## 9. Container Security

### 9.1 Security Checklist

```yaml
# Container security best practices
security:
  user:
    run_as_non_root: true
    user_id: 1001
    group_id: 1001
  
  filesystem:
    read_only_root: true  # Where possible
    no_new_privileges: true
  
  capabilities:
    drop_all: true
    add_only_required: []
  
  secrets:
    no_secrets_in_image: true
    use_env_files: true
    encrypt_at_rest: true
  
  network:
    internal_networks: true
    minimal_port_exposure: true
```

### 9.2 Security-Hardened Service

```yaml
services:
  pranidoctor-web:
    image: ghcr.io/pranidoctor/web:${APP_VERSION}
    
    # Run as non-root
    user: "1001:1001"
    
    # Read-only filesystem
    read_only: true
    
    # Temporary filesystem for writable directories
    tmpfs:
      - /tmp
      - /app/.next/cache
    
    # Security options
    security_opt:
      - no-new-privileges:true
    
    # Drop all capabilities
    cap_drop:
      - ALL
    
    # Resource limits (DoS protection)
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
          pids: 100
```

### 9.3 Image Scanning

```bash
#!/bin/bash
# scripts/scan-images.sh

# Scan with Trivy
docker run --rm \
    -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy image \
    --severity HIGH,CRITICAL \
    --exit-code 1 \
    ghcr.io/pranidoctor/web:${APP_VERSION}

# Scan with Docker Scout (if available)
docker scout cves ghcr.io/pranidoctor/web:${APP_VERSION}
```

---

## 10. Development Workflow

### 10.1 Local Development Setup

```bash
#!/bin/bash
# scripts/dev-setup.sh

# Start development environment
docker compose up -d postgres redis minio

# Wait for services
echo "Waiting for services..."
sleep 5

# Run database migrations
npm run db:push

# Seed database (if needed)
npm run db:seed

# Start development server
npm run dev
```

### 10.2 Development Commands

```bash
# Start all services
docker compose up -d

# Start specific service
docker compose up -d postgres

# View logs
docker compose logs -f pranidoctor-web

# Rebuild application
docker compose build --no-cache pranidoctor-web

# Run one-off commands
docker compose run --rm pranidoctor-web npm run db:migrate

# Shell into container
docker compose exec pranidoctor-web sh

# Stop all services
docker compose down

# Stop and remove volumes (CAUTION: data loss)
docker compose down -v
```

### 10.3 Hot Reload Configuration

```yaml
# docker-compose.override.yml for development
services:
  pranidoctor-web:
    build:
      context: .
      target: deps
    volumes:
      # Mount source code
      - ./src:/app/src
      - ./prisma:/app/prisma
      - ./public:/app/public
      # Exclude node_modules
      - /app/node_modules
    environment:
      - WATCHPACK_POLLING=true  # For file watching
```

---

## 11. Production Deployment

### 11.1 Deployment Script

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

# Configuration
APP_VERSION=${1:-latest}
COMPOSE_FILE="docker-compose.yml"
COMPOSE_PROD_FILE="docker-compose.prod.yml"

echo "Deploying version: $APP_VERSION"

# Pull latest images
echo "Pulling images..."
APP_VERSION=$APP_VERSION docker compose -f $COMPOSE_FILE -f $COMPOSE_PROD_FILE pull

# Run database migrations
echo "Running migrations..."
docker compose -f $COMPOSE_FILE -f $COMPOSE_PROD_FILE run --rm \
    pranidoctor-web npx prisma migrate deploy

# Deploy with zero downtime (rolling update)
echo "Deploying application..."
APP_VERSION=$APP_VERSION docker compose -f $COMPOSE_FILE -f $COMPOSE_PROD_FILE up -d \
    --no-deps --scale pranidoctor-web=2

# Wait for health checks
echo "Waiting for health checks..."
sleep 30

# Verify deployment
HEALTH_STATUS=$(curl -sf http://localhost/api/health || echo "failed")
if [ "$HEALTH_STATUS" == "failed" ]; then
    echo "Health check failed! Rolling back..."
    ./scripts/rollback.sh
    exit 1
fi

echo "Deployment successful!"

# Cleanup old images
docker image prune -f
```

### 11.2 Rollback Script

```bash
#!/bin/bash
# scripts/rollback.sh

set -e

# Get previous version from deployment history
PREVIOUS_VERSION=$(cat /opt/pranidoctor/deployment-history.txt | tail -2 | head -1)

if [ -z "$PREVIOUS_VERSION" ]; then
    echo "No previous version found!"
    exit 1
fi

echo "Rolling back to version: $PREVIOUS_VERSION"

# Deploy previous version
APP_VERSION=$PREVIOUS_VERSION docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for health
sleep 30

# Verify rollback
HEALTH_STATUS=$(curl -sf http://localhost/api/health || echo "failed")
if [ "$HEALTH_STATUS" == "failed" ]; then
    echo "Rollback failed! Manual intervention required."
    exit 1
fi

echo "Rollback successful!"
```

### 11.3 Zero-Downtime Deployment

```bash
#!/bin/bash
# scripts/deploy-zero-downtime.sh

# Blue-Green deployment approach
# 1. Deploy new version alongside old
# 2. Health check new version
# 3. Switch traffic
# 4. Remove old version

NEW_VERSION=$1
OLD_CONTAINER=$(docker ps -qf "name=pranidoctor-web" | head -1)

# Start new container
docker run -d \
    --name pranidoctor-web-new \
    --network pranidoctor-frontend \
    --network pranidoctor-backend \
    -e DATABASE_URL="$DATABASE_URL" \
    ghcr.io/pranidoctor/web:$NEW_VERSION

# Wait for health
sleep 30

# Health check
if ! curl -sf http://pranidoctor-web-new:3000/api/health; then
    echo "New version unhealthy, aborting"
    docker rm -f pranidoctor-web-new
    exit 1
fi

# Update Caddy to use new container
# (In production, use container orchestration)

# Remove old container
docker rm -f $OLD_CONTAINER

# Rename new container
docker rename pranidoctor-web-new pranidoctor-web
```

---

## 12. Future: Kubernetes Migration

### 12.1 Migration Triggers

| Trigger | Threshold | Action |
|---------|-----------|--------|
| DAU | > 10,000 | Consider K8s |
| Services | > 10 | Consider K8s |
| Team | > 5 DevOps | Consider K8s |
| Geography | Multi-region | Required K8s |

### 12.2 Kubernetes-Ready Patterns

```yaml
# Current patterns that translate to K8s

# Health checks → Liveness/Readiness probes
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3

# Environment variables → ConfigMaps/Secrets
env_file:
  - .env.production

# Resource limits → Resource requests/limits
deploy:
  resources:
    limits:
      cpus: '1.5'
      memory: 1536M
    reservations:
      cpus: '0.5'
      memory: 512M

# Volumes → PersistentVolumeClaims
volumes:
  - postgres_data:/var/lib/postgresql/data
```

### 12.3 Migration Checklist

```markdown
## Kubernetes Migration Checklist

### Pre-Migration
- [ ] All services containerized
- [ ] Health checks implemented
- [ ] Stateless application design verified
- [ ] External state (DB, Redis, S3) or StatefulSets planned
- [ ] Secrets management strategy defined

### Infrastructure
- [ ] K8s cluster provisioned (EKS/GKE/AKS or self-managed)
- [ ] Ingress controller installed
- [ ] Cert-manager for SSL
- [ ] Monitoring stack (Prometheus/Grafana)

### Migration
- [ ] Helm charts or Kustomize manifests created
- [ ] CI/CD updated for K8s deployments
- [ ] Staging environment tested
- [ ] Database migration strategy validated
- [ ] DNS cutover planned
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | DevOps Team | Initial release |

---

## Related Documents

| Document | Location |
|----------|----------|
| VPS Structure | `docs/devops/VPS_STRUCTURE.md` |
| CI/CD Pipeline | `docs/devops/CICD_PIPELINE.md` |
| Backup Strategy | `docs/devops/BACKUP_STRATEGY.md` |
| Monitoring | `docs/devops/MONITORING.md` |

---

*End of DOCKER_STRATEGY.md*
