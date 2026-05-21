# PHASE 1 BACKEND FOUNDATION — Docker Design

**Version:** 1.0.0  
**Status:** PLAN ONLY — NO IMPLEMENTATION  
**Date:** 2026-05-21  
**Scope:** Container architecture, Docker configuration, deployment strategy

---

## Table of Contents

1. [Container Architecture](#1-container-architecture)
2. [Dockerfile Strategy](#2-dockerfile-strategy)
3. [Docker Compose Configuration](#3-docker-compose-configuration)
4. [Service Definitions](#4-service-definitions)
5. [Volume Management](#5-volume-management)
6. [Network Configuration](#6-network-configuration)
7. [Development Workflow](#7-development-workflow)
8. [Production Deployment](#8-production-deployment)

---

## 1. Container Architecture

### 1.1 Service Topology

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CONTAINER ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   EXTERNAL TRAFFIC                                                               │
│         │                                                                        │
│         ▼                                                                        │
│   ┌──────────────────────────────────────────────────────────────────────┐      │
│   │                          CADDY (Reverse Proxy)                        │      │
│   │  • TLS termination      • Load balancing      • Automatic HTTPS     │      │
│   └──────────────────────────────────┬───────────────────────────────────┘      │
│                                      │                                           │
│                    ┌─────────────────┼─────────────────┐                        │
│                    ▼                 ▼                 ▼                        │
│   ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐               │
│   │    API Server    │ │    API Server    │ │     Worker       │               │
│   │   (Instance 1)   │ │   (Instance 2)   │ │   (Background)   │               │
│   │                  │ │                  │ │                  │               │
│   │ pranidoctor-api  │ │ pranidoctor-api  │ │ pranidoctor-     │               │
│   │                  │ │     (replica)    │ │      worker      │               │
│   └────────┬─────────┘ └────────┬─────────┘ └────────┬─────────┘               │
│            │                    │                    │                          │
│            └────────────────────┴────────────────────┘                          │
│                                 │                                                │
│   ┌─────────────────────────────┼─────────────────────────────────────────┐     │
│   │                    BACKEND NETWORK (internal)                          │     │
│   ├─────────────────────────────┼─────────────────────────────────────────┤     │
│   │                             │                                          │     │
│   │ ┌──────────────┐ ┌─────────▼────────┐ ┌──────────────┐                │     │
│   │ │  PostgreSQL  │ │      Redis       │ │    MinIO     │                │     │
│   │ │              │ │                  │ │              │                │     │
│   │ │ • Primary DB │ │ • Cache          │ │ • Object     │                │     │
│   │ │ • Persistent │ │ • Queue          │ │   Storage    │                │     │
│   │ │              │ │ • Sessions       │ │ • S3 compat  │                │     │
│   │ └──────────────┘ └──────────────────┘ └──────────────┘                │     │
│   │                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────┘     │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Container Inventory

| Container | Image | Purpose | Replicas |
|-----------|-------|---------|----------|
| pranidoctor-api | Custom (Node.js) | API server | 2 (prod) |
| pranidoctor-worker | Custom (Node.js) | Background jobs | 1-2 |
| postgres | postgres:16-alpine | Primary database | 1 |
| redis | redis:7-alpine | Cache/Queue | 1 |
| minio | minio/minio:latest | Object storage | 1 |
| caddy | caddy:2-alpine | Reverse proxy | 1 |

### 1.3 Resource Allocation

| Container | CPU Limit | Memory Limit | Memory Reserve |
|-----------|-----------|--------------|----------------|
| API Server | 1.5 cores | 1.5 GB | 512 MB |
| Worker | 1.0 core | 1.0 GB | 256 MB |
| PostgreSQL | 1.0 core | 2.0 GB | 1.0 GB |
| Redis | 0.5 core | 512 MB | 128 MB |
| MinIO | 0.5 core | 512 MB | 256 MB |
| Caddy | 0.5 core | 256 MB | 128 MB |

---

## 2. Dockerfile Strategy

### 2.1 Application Dockerfile (Multi-Stage)

```dockerfile
# docker/Dockerfile

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
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

# Build application
ENV NODE_ENV=production
RUN npm run build

# Prune dev dependencies after build
RUN npm prune --production

# ============================================
# Stage 3: Runner
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy production files
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/prisma ./prisma
COPY --from=builder --chown=appuser:nodejs /app/package.json ./

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["node", "dist/server.js"]
```

### 2.2 Worker Dockerfile

```dockerfile
# docker/Dockerfile.worker

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

ENV NODE_ENV=production

# Copy from main build (shared artifact)
COPY --from=pranidoctor-api --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=pranidoctor-api --chown=appuser:nodejs /app/dist ./dist
COPY --from=pranidoctor-api --chown=appuser:nodejs /app/prisma ./prisma
COPY --from=pranidoctor-api --chown=appuser:nodejs /app/package.json ./

USER appuser

# No health check endpoint for worker
# Liveness determined by process exit

CMD ["node", "dist/worker.js"]
```

### 2.3 .dockerignore

```
# .dockerignore

# Dependencies (reinstalled in container)
node_modules

# Build outputs (rebuilt in container)
dist
.next
out
build

# Development
.env.local
.env.development
.env.test
*.log
npm-debug.log*

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

# Tests
tests
coverage
.nyc_output
vitest.config.ts

# Misc
.DS_Store
Thumbs.db
```

---

## 3. Docker Compose Configuration

### 3.1 Base Configuration

```yaml
# docker-compose.yml

version: '3.9'

services:
  # ============================================
  # API Server
  # ============================================
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile
    container_name: pranidoctor-api
    restart: unless-stopped
    env_file:
      - .env
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
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
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
  # Background Worker
  # ============================================
  worker:
    build:
      context: .
      dockerfile: docker/Dockerfile.worker
    container_name: pranidoctor-worker
    restart: unless-stopped
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - backend
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1024M
        reservations:
          cpus: '0.25'
          memory: 256M

  # ============================================
  # PostgreSQL
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
  # Redis
  # ============================================
  redis:
    image: redis:7-alpine
    container_name: pranidoctor-redis
    restart: unless-stopped
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
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
  # MinIO (S3-compatible storage)
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

  # ============================================
  # Caddy (Reverse Proxy)
  # ============================================
  caddy:
    image: caddy:2-alpine
    container_name: pranidoctor-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - api
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

### 3.2 Development Overrides

```yaml
# docker-compose.override.yml (development)

version: '3.9'

services:
  api:
    build:
      target: deps  # Stop at deps stage for dev
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
    environment:
      - NODE_ENV=development
    ports:
      - "3000:3000"
      - "9229:9229"  # Debug port

  worker:
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run worker:dev
    environment:
      - NODE_ENV=development

  postgres:
    ports:
      - "5432:5432"

  redis:
    ports:
      - "6379:6379"

  minio:
    ports:
      - "9000:9000"
      - "9001:9001"

  # Disable Caddy in development
  caddy:
    profiles:
      - prod
```

### 3.3 Production Overrides

```yaml
# docker-compose.prod.yml

version: '3.9'

services:
  api:
    image: ghcr.io/pranidoctor/api:${APP_VERSION}
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "5"

  api-2:
    image: ghcr.io/pranidoctor/api:${APP_VERSION}
    container_name: pranidoctor-api-2
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
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
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

  worker:
    image: ghcr.io/pranidoctor/worker:${APP_VERSION}
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "3"

  postgres:
    volumes:
      - /opt/pranidoctor/data/postgres:/var/lib/postgresql/data

  minio:
    volumes:
      - /opt/pranidoctor/data/minio:/data

  caddy:
    volumes:
      - /opt/pranidoctor/config/caddy/Caddyfile:/etc/caddy/Caddyfile:ro
```

---

## 4. Service Definitions

### 4.1 Caddy Configuration

```caddyfile
# config/caddy/Caddyfile

{
    email admin@pranidoctor.com
}

pranidoctor.com, www.pranidoctor.com {
    # API routes
    handle /api/* {
        reverse_proxy api:3000 api-2:3000 {
            lb_policy round_robin
            health_uri /health
            health_interval 30s
        }
    }

    # Health check
    handle /health {
        respond "OK" 200
    }

    # Static files and frontend (if served by same domain)
    handle {
        reverse_proxy api:3000 api-2:3000
    }

    # Logging
    log {
        output file /var/log/caddy/access.log
        format json
    }

    # Headers
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
        -Server
    }
}

# Admin panel subdomain (optional)
admin.pranidoctor.com {
    reverse_proxy api:3000 api-2:3000
    
    # Additional admin restrictions
    # @admin_ips remote_ip 203.0.113.0/24
    # handle @admin_ips {
    #     reverse_proxy api:3000
    # }
    # respond "Forbidden" 403
}
```

### 4.2 PostgreSQL Configuration

```conf
# config/postgres/postgresql.conf

# Connection
listen_addresses = '*'
max_connections = 100

# Memory
shared_buffers = 512MB
effective_cache_size = 1536MB
maintenance_work_mem = 128MB
work_mem = 4MB

# WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9
min_wal_size = 1GB
max_wal_size = 4GB

# Query Planning
random_page_cost = 1.1

# Logging
log_destination = 'stderr'
logging_collector = on
log_min_duration_statement = 1000
log_checkpoints = on
```

---

## 5. Volume Management

### 5.1 Volume Strategy

| Volume | Type | Backup Required | Path |
|--------|------|-----------------|------|
| postgres_data | Persistent | Yes (critical) | /var/lib/postgresql/data |
| redis_data | Persistent | Yes (important) | /data |
| minio_data | Persistent | Yes (important) | /data |
| caddy_data | Persistent | No (regenerated) | /data |
| caddy_config | Persistent | No (regenerated) | /config |

### 5.2 Volume Backup Script

```bash
#!/bin/bash
# scripts/backup-volumes.sh

set -e

BACKUP_DIR="/opt/pranidoctor/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL
docker exec pranidoctor-postgres pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_DIR/postgres_$DATE.sql.gz"

# Backup Redis (BGSAVE first)
docker exec pranidoctor-redis redis-cli BGSAVE
sleep 5
docker cp pranidoctor-redis:/data/dump.rdb "$BACKUP_DIR/redis_$DATE.rdb"

# Upload to S3 (optional)
# aws s3 sync "$BACKUP_DIR" s3://pranidoctor-backups/

echo "Backup completed: $DATE"
```

---

## 6. Network Configuration

### 6.1 Network Isolation

```yaml
networks:
  frontend:
    # Accessible from Caddy (internet-facing)
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/24

  backend:
    # Internal only - no external access
    driver: bridge
    internal: true
    ipam:
      config:
        - subnet: 172.21.0.0/24
```

### 6.2 Service Network Assignment

| Service | Frontend | Backend | Reason |
|---------|----------|---------|--------|
| caddy | ✓ | ✗ | Internet-facing |
| api | ✓ | ✓ | Receives traffic + DB access |
| api-2 | ✓ | ✓ | Same as api |
| worker | ✗ | ✓ | Internal only |
| postgres | ✗ | ✓ | Internal only |
| redis | ✗ | ✓ | Internal only |
| minio | ✗ | ✓ | Internal only |

---

## 7. Development Workflow

### 7.1 Development Commands

```bash
# Start development environment
docker compose up -d postgres redis minio

# Run API locally (hot reload)
npm run dev

# Or run everything in Docker
docker compose up -d

# View logs
docker compose logs -f api

# Run migrations
docker compose exec api npx prisma migrate dev

# Shell into container
docker compose exec api sh

# Stop all services
docker compose down

# Clean rebuild
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### 7.2 Local Development Setup

```bash
#!/bin/bash
# scripts/dev-setup.sh

# Start infrastructure
docker compose up -d postgres redis minio

# Wait for services
echo "Waiting for services..."
sleep 10

# Run migrations
npm run db:push

# Seed database
npm run db:seed

# Start development server
npm run dev
```

---

## 8. Production Deployment

### 8.1 Deployment Script

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

APP_VERSION=${1:-latest}
COMPOSE_FILE="docker-compose.yml"
COMPOSE_PROD="docker-compose.prod.yml"

echo "Deploying version: $APP_VERSION"

# Pull latest images
APP_VERSION=$APP_VERSION docker compose -f $COMPOSE_FILE -f $COMPOSE_PROD pull

# Run migrations
docker compose -f $COMPOSE_FILE -f $COMPOSE_PROD run --rm api npx prisma migrate deploy

# Deploy with rolling update
APP_VERSION=$APP_VERSION docker compose -f $COMPOSE_FILE -f $COMPOSE_PROD up -d --no-deps api api-2 worker

# Wait for health checks
sleep 30

# Verify deployment
curl -f http://localhost/health || exit 1

echo "Deployment complete!"
```

### 8.2 Health Check Endpoint

```typescript
// src/api/health/health.routes.ts

router.get('/health', async (req, res) => {
  const checks = await Promise.all([
    checkDatabase(),
    checkRedis(),
  ]);
  
  const healthy = checks.every((c) => c.healthy);
  
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION,
    checks,
  });
});
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Architecture | Initial Phase 1 plan |

---

## Related Documents

| Document | Path |
|----------|------|
| System Architecture | `docs/backend/01-system-architecture.md` |
| Docker Strategy (existing) | `docs/devops/DOCKER_STRATEGY.md` |
| VPS Structure | `docs/devops/VPS_STRUCTURE.md` |
| CI/CD Pipeline | `docs/devops/CICD_PIPELINE.md` |

---

*End of 05-docker-design.md*
