# PHASE 1 BACKEND FOUNDATION — Database Strategy

**Version:** 1.0.0  
**Status:** PLAN ONLY — NO IMPLEMENTATION  
**Date:** 2026-05-21  
**Scope:** Database architecture, migration policy, connection management

---

## Table of Contents

1. [Database Architecture](#1-database-architecture)
2. [Prisma Strategy](#2-prisma-strategy)
3. [Migration Policy](#3-migration-policy)
4. [Connection Management](#4-connection-management)
5. [Transaction Strategy](#5-transaction-strategy)
6. [Query Patterns](#6-query-patterns)
7. [Cache Policy](#7-cache-policy)
8. [Backup & Recovery](#8-backup--recovery)

---

## 1. Database Architecture

### 1.1 Storage Tier Overview

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER ARCHITECTURE                               │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                        APPLICATION LAYER                                │  │
│  │                                                                         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │   Service   │  │   Service   │  │   Service   │  │   Worker    │   │  │
│  │  │   Layer     │  │   Layer     │  │   Layer     │  │   Process   │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │  │
│  │         └─────────────────┴────────────────┴────────────────┘          │  │
│  └──────────────────────────────────┬─────────────────────────────────────┘  │
│                                     │                                         │
│  ┌──────────────────────────────────┼─────────────────────────────────────┐  │
│  │                       DATA ACCESS LAYER                                 │  │
│  │                                                                         │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │  │
│  │  │                    PRISMA CLIENT                                │   │  │
│  │  │  • Type-safe queries         • Connection pooling               │   │  │
│  │  │  • Transaction management    • Migration tooling                │   │  │
│  │  └──────────────────────────────────┬──────────────────────────────┘   │  │
│  │                                     │                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐│  ┌──────────────┐                 │  │
│  │  │ Redis Client │  │ S3 Client   ││  │ Queue Client │                 │  │
│  │  │ (ioredis)    │  │ (aws-sdk)   ││  │ (BullMQ)     │                 │  │
│  │  └──────┬───────┘  └──────┬───────┘│  └──────┬───────┘                 │  │
│  └─────────┼─────────────────┼────────┼─────────┼─────────────────────────┘  │
│            │                 │        │         │                             │
│  ┌─────────┼─────────────────┼────────┼─────────┼─────────────────────────┐  │
│  │         ▼                 ▼        ▼         ▼          STORAGE TIER   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │  │
│  │  │  PostgreSQL  │  │    Redis     │  │   S3/MinIO   │                  │  │
│  │  │              │  │              │  │              │                  │  │
│  │  │ • Transac-   │  │ • Cache      │  │ • Media      │                  │  │
│  │  │   tional     │  │ • Sessions   │  │ • Documents  │                  │  │
│  │  │ • Relational │  │ • Queue      │  │ • Backups    │                  │  │
│  │  │ • ACID       │  │ • PubSub     │  │              │                  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Classification

| Classification | Storage | Examples | Retention |
|---------------|---------|----------|-----------|
| **Transactional** | PostgreSQL | Users, ServiceRequests, Billing | Permanent |
| **Ephemeral** | Redis | OTP counters, rate limits | TTL-based |
| **Session** | Redis | User sessions, tokens | 7-30 days |
| **Cache** | Redis | Query cache, computed data | Minutes to hours |
| **Queue** | Redis | Job payloads | Until processed |
| **Object** | S3 | Images, PDFs, uploads | Lifecycle rules |

### 1.3 Module-to-Database Mapping

| Module | PostgreSQL Tables | Redis Keys | S3 Prefixes |
|--------|-------------------|------------|-------------|
| auth | MobileOtpChallenge | `otp:*`, `session:*`, `ratelimit:*` | — |
| users | User, AdminProfile, CustomerProfile | `user:cache:*` | `uploads/profiles/` |
| doctors | DoctorProfile, DoctorServiceArea | `doctor:cache:*` | `uploads/doctors/` |
| leads | — (future) | `lead:*` | — |
| animals | AnimalProfile | `animal:cache:*` | `uploads/animals/` |
| clinics | AiTechnicianProfile, ServiceRequest, ... | `technician:*`, `request:*` | `uploads/technicians/` |
| ai | AiConversation, AiMessage | `ai:context:*`, `ai:cache:*` | — |
| notifications | Notification | `notification:*` | — |

---

## 2. Prisma Strategy

### 2.1 Schema Organization

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// ============================================
// ENUMS (alphabetical)
// ============================================

enum UserRole {
  ADMIN
  CUSTOMER
  DOCTOR
  AI_TECHNICIAN
  SUPPORT
  SUPER_ADMIN
}

// ... more enums

// ============================================
// MODELS - Organized by domain module
// ============================================

// --- Auth Domain ---
model MobileOtpChallenge { ... }

// --- Users Domain ---
model User { ... }
model AdminProfile { ... }
model CustomerProfile { ... }

// --- Doctors Domain ---
model DoctorProfile { ... }
model DoctorServiceArea { ... }

// --- Animals Domain ---
model AnimalProfile { ... }

// --- Clinics Domain ---
model AiTechnicianProfile { ... }
model ServiceRequest { ... }
// ... etc
```

### 2.2 Prisma Client Singleton

```typescript
// src/shared/database/prisma.ts

import { PrismaClient } from '@generated/prisma';
import { config } from '@shared/config';
import { logger } from '@shared/logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.nodeEnv === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: config.database.url,
      },
    },
  });

if (config.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Middleware for logging slow queries
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  
  const duration = after - before;
  if (duration > 200) {
    logger.warn({
      msg: 'Slow query detected',
      model: params.model,
      action: params.action,
      duration,
    });
  }
  
  return result;
});

// Graceful shutdown
export async function disconnectPrisma() {
  await prisma.$disconnect();
  logger.info('Prisma disconnected');
}
```

### 2.3 Repository Pattern

```typescript
// src/modules/users/user.repository.ts

import { prisma } from '@shared/database';
import { Prisma, User, UserRole, UserStatus } from '@generated/prisma';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { phone },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async findManyWithPagination(params: {
    where?: Prisma.UserWhereInput;
    page: number;
    pageSize: number;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { where, page, pageSize, orderBy } = params;
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: orderBy ?? { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        hasMore: skip + data.length < total,
      },
    };
  }
}
```

---

## 3. Migration Policy

### 3.1 Migration Naming Convention

| Component | Format | Example |
|-----------|--------|---------|
| Timestamp | `YYYYMMDDHHMMSS` | `20260521120000` |
| Separator | `_` | `_` |
| Description | `snake_case` | `add_user_preferences` |
| Full name | `{timestamp}_{description}` | `20260521120000_add_user_preferences` |

### 3.2 Migration Rules

```
RULE M-001: Never edit applied migrations
  → Checksums will break deployment
  → Create new migration for fixes

RULE M-002: Additive-first changes
  → Add columns as nullable first
  → Backfill data
  → Add constraints after backfill

RULE M-003: Backward compatibility
  → Old code must work with new schema
  → New code must work with old schema (during rollout)

RULE M-004: Test migrations on staging
  → Always run on staging with production-like data
  → Measure migration time for large tables

RULE M-005: Backup before repair
  → pg_dump before any migrate resolve
  → Document repair steps
```

### 3.3 Migration Workflow

```
Development:
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Edit schema  │───▶│ migrate dev  │───▶│   Test       │
│              │    │ --name xxx   │    │              │
└──────────────┘    └──────────────┘    └──────────────┘

Production:
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Backup     │───▶│ migrate      │───▶│  generate    │───▶│   Deploy     │
│   Database   │    │ deploy       │    │  client      │    │   App        │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────┘
```

### 3.4 Safe Migration Script

```bash
#!/bin/bash
# scripts/db/migrate-deploy-safe.sh

set -e

echo "Running migration preflight checks..."

# 1. Check for pending migrations
PENDING=$(npx prisma migrate status 2>&1 | grep -c "pending" || true)
if [ "$PENDING" = "0" ]; then
    echo "No pending migrations"
    exit 0
fi

echo "Found pending migrations"

# 2. Backup database (if production)
if [ "$NODE_ENV" = "production" ]; then
    echo "Creating backup..."
    pg_dump "$DATABASE_URL" > "/backups/pre-migrate-$(date +%Y%m%d%H%M%S).sql"
fi

# 3. Run migration
echo "Applying migrations..."
npx prisma migrate deploy

# 4. Regenerate client
echo "Regenerating Prisma client..."
npx prisma generate

echo "Migration complete"
```

---

## 4. Connection Management

### 4.1 Connection Pool Configuration

```typescript
// Environment-based pool sizing

const poolConfig = {
  development: {
    poolMin: 2,
    poolMax: 10,
    connectionTimeout: 10000,
  },
  staging: {
    poolMin: 2,
    poolMax: 15,
    connectionTimeout: 10000,
  },
  production: {
    poolMin: 5,
    poolMax: 20,
    connectionTimeout: 5000,
  },
};
```

### 4.2 Connection Pool Formula

```
Max Connections = (num_cores * 2) + effective_spindle_count

For typical VPS:
  4 cores → (4 * 2) + 1 = 9 connections per instance
  
For 2 app instances:
  Total pool: 9 * 2 = 18 connections
  PostgreSQL max_connections: 25 (with buffer)
```

### 4.3 Health Check Query

```typescript
// src/shared/database/health.ts

export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency: number;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      healthy: true,
      latency: Date.now() - start,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - start,
    };
  }
}
```

---

## 5. Transaction Strategy

### 5.1 Transaction Patterns

```typescript
// Pattern 1: Simple transaction
async function transferCredits(fromId: string, toId: string, amount: number) {
  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: fromId },
      data: { credits: { decrement: amount } },
    });
    
    await tx.user.update({
      where: { id: toId },
      data: { credits: { increment: amount } },
    });
  });
}

// Pattern 2: Transaction with isolation level
async function createOrderWithInventory(data: CreateOrderInput) {
  return prisma.$transaction(
    async (tx) => {
      // Check inventory
      const inventory = await tx.inventory.findUnique({
        where: { productId: data.productId },
      });
      
      if (!inventory || inventory.quantity < data.quantity) {
        throw new InsufficientInventoryError();
      }
      
      // Decrement inventory
      await tx.inventory.update({
        where: { productId: data.productId },
        data: { quantity: { decrement: data.quantity } },
      });
      
      // Create order
      return tx.order.create({ data });
    },
    {
      isolationLevel: 'Serializable',
      maxWait: 5000,
      timeout: 10000,
    }
  );
}

// Pattern 3: Cross-module transaction helper
export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn, {
    maxWait: 5000,
    timeout: 15000,
  });
}
```

### 5.2 Transaction Boundaries

| Scenario | Transaction Scope | Reason |
|----------|-------------------|--------|
| Single entity CRUD | No explicit tx | Prisma handles implicitly |
| Multi-entity same aggregate | Explicit tx | Consistency required |
| Cross-module writes | Event + eventual consistency | Loose coupling |
| Payment processing | Explicit tx + idempotency | Must be atomic |

---

## 6. Query Patterns

### 6.1 Pagination Pattern

```typescript
// src/shared/database/pagination.ts

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number,
  fetchedCount: number
): PaginatedResult<never>['meta'] {
  return {
    total,
    page,
    pageSize,
    hasMore: (page - 1) * pageSize + fetchedCount < total,
  };
}
```

### 6.2 Search Pattern

```typescript
// Full-text search with Prisma raw query
async function searchUsers(query: string, params: PaginationParams) {
  const { page = 1, pageSize = 20 } = params;
  const skip = (page - 1) * pageSize;
  
  // Use PostgreSQL full-text search
  const results = await prisma.$queryRaw<User[]>`
    SELECT * FROM "User"
    WHERE 
      to_tsvector('simple', coalesce(email, '') || ' ' || coalesce(phone, ''))
      @@ plainto_tsquery('simple', ${query})
    ORDER BY "createdAt" DESC
    LIMIT ${pageSize}
    OFFSET ${skip}
  `;
  
  const total = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) FROM "User"
    WHERE 
      to_tsvector('simple', coalesce(email, '') || ' ' || coalesce(phone, ''))
      @@ plainto_tsquery('simple', ${query})
  `;
  
  return {
    data: results,
    meta: buildPaginationMeta(Number(total[0].count), page, pageSize, results.length),
  };
}
```

### 6.3 Efficient Include Pattern

```typescript
// AVOID: Over-fetching with deep includes
const bad = await prisma.serviceRequest.findUnique({
  where: { id },
  include: {
    customer: { include: { user: true, animals: true } },
    assignedDoctor: { include: { user: true, reviews: true } },
    treatmentCases: { include: { prescriptions: { include: { items: true } } } },
  },
});

// PREFER: Selective fetching
const good = await prisma.serviceRequest.findUnique({
  where: { id },
  include: {
    customer: {
      select: { id: true, displayName: true },
    },
    assignedDoctor: {
      select: { id: true, displayName: true },
    },
  },
});

// Fetch related data separately if needed
const treatmentCases = await prisma.treatmentCase.findMany({
  where: { serviceRequestId: id },
  select: { id: true, diagnosis: true, status: true },
});
```

---

## 7. Cache Policy

### 7.1 Cache Strategy

| Data Type | Cache? | TTL | Invalidation |
|-----------|--------|-----|--------------|
| User profile | Yes | 5 min | On update |
| Doctor list | Yes | 1 min | On publish |
| Service request | No | — | Real-time critical |
| Location data | Yes | 24h | On admin edit |
| Settings | Yes | 1h | On update |
| AI prompts | Yes | 6h | On version change |

### 7.2 Cache Key Patterns

```typescript
// src/shared/cache/cache.keys.ts

export const CacheKeys = {
  // User cache
  user: (id: string) => `user:${id}`,
  userByPhone: (phone: string) => `user:phone:${phone}`,
  
  // Doctor cache
  doctor: (id: string) => `doctor:${id}`,
  doctorsByArea: (areaId: string) => `doctors:area:${areaId}`,
  
  // Location cache
  divisions: () => 'locations:divisions',
  districts: (divisionId: string) => `locations:districts:${divisionId}`,
  
  // Settings cache
  setting: (key: string) => `setting:${key}`,
  
  // Rate limiting
  rateLimit: (key: string, window: string) => `ratelimit:${key}:${window}`,
  
  // OTP
  otpAttempts: (phone: string) => `otp:attempts:${phone}`,
  otpCooldown: (phone: string) => `otp:cooldown:${phone}`,
};
```

### 7.3 Cache Service

```typescript
// src/shared/cache/cache.service.ts

import Redis from 'ioredis';
import { config } from '@shared/config';

export class CacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(config.redis.url);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(this.prefixKey(key));
    return value ? JSON.parse(value) : null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redis.setex(this.prefixKey(key), ttlSeconds, serialized);
    } else {
      await this.redis.set(this.prefixKey(key), serialized);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(this.prefixKey(key));
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(this.prefixKey(pattern));
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  private prefixKey(key: string): string {
    return `${config.redis.prefix}${key}`;
  }
}
```

---

## 8. Backup & Recovery

### 8.1 Backup Schedule

| Backup Type | Frequency | Retention | Location |
|-------------|-----------|-----------|----------|
| Full dump | Daily (2 AM) | 30 days | S3/Hetzner |
| WAL archiving | Continuous | 7 days | S3/Hetzner |
| Redis RDB | Hourly | 24 hours | Local |
| Redis AOF | Continuous | Latest | Local |

### 8.2 Backup Script

```bash
#!/bin/bash
# scripts/db/backup.sh

set -e

BACKUP_DIR="/opt/pranidoctor/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/pranidoctor_$DATE.sql.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create backup
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_FILE"

# Upload to S3
aws s3 cp "$BACKUP_FILE" "s3://$BACKUP_BUCKET/postgres/$DATE.sql.gz"

# Cleanup old local backups (keep 7 days)
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
```

### 8.3 Recovery Procedure

```bash
# 1. Stop application
docker compose stop pranidoctor-web

# 2. Restore from backup
gunzip -c /path/to/backup.sql.gz | psql "$DATABASE_URL"

# 3. Verify data integrity
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM \"User\";"

# 4. Restart application
docker compose start pranidoctor-web
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
| Docker Design | `docs/backend/05-docker-design.md` |
| DATABASE_ARCHITECTURE | `docs/database/DATABASE_ARCHITECTURE.md` |
| PRISMA_MIGRATION_RULES | `docs/PRISMA_MIGRATION_RULES.md` |
| TABLE_STRUCTURE | `docs/database/TABLE_STRUCTURE.md` |

---

*End of 03-db-strategy.md*
