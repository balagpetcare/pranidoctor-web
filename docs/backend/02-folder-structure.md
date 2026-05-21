# PHASE 1 BACKEND FOUNDATION — Folder Structure

**Version:** 1.0.0  
**Status:** PLAN ONLY — NO IMPLEMENTATION  
**Date:** 2026-05-21  
**Scope:** Backend folder organization for modular monolith

---

## Table of Contents

1. [Folder Structure Overview](#1-folder-structure-overview)
2. [Root Level Organization](#2-root-level-organization)
3. [Module Structure](#3-module-structure)
4. [Shared Kernel Structure](#4-shared-kernel-structure)
5. [Configuration Structure](#5-configuration-structure)
6. [Test Structure](#6-test-structure)
7. [File Naming Conventions](#7-file-naming-conventions)
8. [Import Aliases](#8-import-aliases)

---

## 1. Folder Structure Overview

### 1.1 High-Level Directory Tree

```
pranidoctor-backend/
├── prisma/                          # Database schema & migrations
│   ├── migrations/                  # Migration history
│   ├── seed/                        # Seed data scripts
│   └── schema.prisma                # Prisma schema (source of truth)
│
├── src/
│   ├── modules/                     # Domain modules (core business logic)
│   │   ├── auth/                    # Authentication module
│   │   ├── users/                   # User management module
│   │   ├── doctors/                 # Doctor module
│   │   ├── leads/                   # Leads module
│   │   ├── animals/                 # Animal profiles module
│   │   ├── clinics/                 # Clinics & AI technicians module
│   │   ├── ai/                      # AI orchestration module
│   │   └── notifications/           # Notifications module
│   │
│   ├── shared/                      # Shared kernel
│   │   ├── config/                  # Configuration management
│   │   ├── logger/                  # Logging infrastructure
│   │   ├── cache/                   # Cache abstraction (Redis)
│   │   ├── queue/                   # Queue abstraction (BullMQ)
│   │   ├── events/                  # Internal event bus
│   │   ├── database/                # Prisma client & utilities
│   │   ├── errors/                  # Error classes & handling
│   │   ├── middleware/              # Express middleware
│   │   ├── validation/              # Zod schemas & validators
│   │   ├── utils/                   # Utility functions
│   │   └── types/                   # Shared TypeScript types
│   │
│   ├── api/                         # API route handlers
│   │   ├── mobile/                  # Mobile app routes
│   │   ├── admin/                   # Admin panel routes
│   │   ├── public/                  # Public (unauthenticated) routes
│   │   └── webhooks/                # External webhook handlers
│   │
│   ├── workers/                     # Background job processors
│   │   ├── notification.worker.ts
│   │   ├── ai.worker.ts
│   │   └── cleanup.worker.ts
│   │
│   ├── generated/                   # Auto-generated code
│   │   └── prisma/                  # Prisma client output
│   │
│   ├── app.ts                       # Express app configuration
│   ├── server.ts                    # HTTP server entry point
│   └── worker.ts                    # Worker process entry point
│
├── tests/                           # Test files
│   ├── unit/                        # Unit tests (mirror src structure)
│   ├── integration/                 # Integration tests
│   ├── e2e/                         # End-to-end tests
│   └── fixtures/                    # Test data fixtures
│
├── scripts/                         # Utility scripts
│   ├── db/                          # Database utilities
│   ├── seed/                        # Seeding scripts
│   └── deploy/                      # Deployment scripts
│
├── config/                          # External configuration
│   ├── redis/                       # Redis configuration
│   └── postgres/                    # PostgreSQL configuration
│
├── docker/                          # Docker-related files
│   ├── Dockerfile                   # Application Dockerfile
│   ├── Dockerfile.dev               # Development Dockerfile
│   └── docker-compose.yml           # Development compose
│
├── docs/                            # Documentation (symlink or copy)
│
├── .env.example                     # Environment template
├── .env.development                 # Development environment
├── .env.test                        # Test environment
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## 2. Root Level Organization

### 2.1 Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts |
| `tsconfig.json` | TypeScript configuration |
| `tsconfig.build.json` | Production build config |
| `vitest.config.ts` | Test runner configuration |
| `.env.example` | Environment variable template |
| `.eslintrc.js` | Linting rules |
| `.prettierrc` | Code formatting |
| `.dockerignore` | Docker build exclusions |
| `.gitignore` | Git exclusions |

### 2.2 Entry Points

| File | Purpose | Command |
|------|---------|---------|
| `src/server.ts` | HTTP server | `npm run start` |
| `src/worker.ts` | Background jobs | `npm run worker` |
| `src/app.ts` | Express app (imported by both) | — |

---

## 3. Module Structure

### 3.1 Standard Module Layout

Each module follows a consistent internal structure:

```
src/modules/{module-name}/
├── index.ts                    # Public exports (module interface)
├── {module}.module.ts          # Module registration & dependencies
├── {module}.service.ts         # Primary business logic service
├── {module}.repository.ts      # Database access layer
├── {module}.types.ts           # Module-specific types
│
├── dto/                        # Data Transfer Objects
│   ├── create-{entity}.dto.ts
│   ├── update-{entity}.dto.ts
│   └── {entity}.response.dto.ts
│
├── schemas/                    # Zod validation schemas
│   ├── create-{entity}.schema.ts
│   ├── update-{entity}.schema.ts
│   └── query-{entity}.schema.ts
│
├── services/                   # Additional services (if needed)
│   └── {sub-feature}.service.ts
│
├── events/                     # Module events
│   ├── {module}.events.ts      # Event type definitions
│   └── {module}.handlers.ts    # Event handlers
│
└── __tests__/                  # Module-scoped tests
    ├── {module}.service.test.ts
    └── {module}.repository.test.ts
```

### 3.2 Module Examples

#### Auth Module

```
src/modules/auth/
├── index.ts
├── auth.module.ts
├── auth.service.ts
├── auth.repository.ts
├── auth.types.ts
│
├── dto/
│   ├── otp-request.dto.ts
│   ├── otp-verify.dto.ts
│   ├── login-response.dto.ts
│   └── admin-login.dto.ts
│
├── schemas/
│   ├── otp-request.schema.ts
│   ├── otp-verify.schema.ts
│   └── admin-login.schema.ts
│
├── services/
│   ├── otp.service.ts
│   ├── jwt.service.ts
│   └── session.service.ts
│
├── events/
│   ├── auth.events.ts
│   └── auth.handlers.ts
│
└── __tests__/
    ├── auth.service.test.ts
    └── otp.service.test.ts
```

#### Clinics Module (Complex)

```
src/modules/clinics/
├── index.ts
├── clinics.module.ts
├── clinics.service.ts
├── clinics.repository.ts
├── clinics.types.ts
│
├── dto/
│   ├── service-request/
│   │   ├── create-request.dto.ts
│   │   ├── update-request.dto.ts
│   │   └── request.response.dto.ts
│   ├── ai-technician/
│   │   ├── create-technician.dto.ts
│   │   └── technician.response.dto.ts
│   └── billing/
│       ├── create-billing.dto.ts
│       └── billing.response.dto.ts
│
├── schemas/
│   ├── service-request.schema.ts
│   ├── ai-technician.schema.ts
│   └── billing.schema.ts
│
├── services/
│   ├── service-request.service.ts
│   ├── ai-technician.service.ts
│   ├── assignment.service.ts
│   ├── billing.service.ts
│   └── inventory.service.ts
│
├── events/
│   ├── clinics.events.ts
│   └── clinics.handlers.ts
│
└── __tests__/
    ├── service-request.service.test.ts
    └── ai-technician.service.test.ts
```

### 3.3 Module Index (Public API)

```typescript
// src/modules/auth/index.ts

// Only export what other modules need
export { AuthService } from './auth.service';
export { AuthModule } from './auth.module';

// Export types that are part of public interface
export type { AuthenticatedUser, TokenPair } from './auth.types';

// Export DTOs for API routes
export { OtpRequestDto, OtpVerifyDto, LoginResponseDto } from './dto';

// DO NOT export:
// - Repository (internal implementation)
// - Internal services
// - Internal types
```

---

## 4. Shared Kernel Structure

### 4.1 Shared Folder Layout

```
src/shared/
├── config/
│   ├── index.ts                    # Config loader
│   ├── config.schema.ts            # Environment validation
│   ├── app.config.ts               # App-specific config
│   ├── database.config.ts          # Database config
│   ├── redis.config.ts             # Redis config
│   ├── jwt.config.ts               # JWT secrets config
│   └── external.config.ts          # External services config
│
├── logger/
│   ├── index.ts
│   ├── logger.ts                   # Pino logger setup
│   ├── logger.middleware.ts        # Request logging
│   └── logger.types.ts             # Logger types
│
├── cache/
│   ├── index.ts
│   ├── cache.service.ts            # Redis cache abstraction
│   ├── cache.keys.ts               # Cache key patterns
│   └── cache.types.ts
│
├── queue/
│   ├── index.ts
│   ├── queue.service.ts            # BullMQ abstraction
│   ├── queue.names.ts              # Queue definitions
│   └── queue.types.ts
│
├── events/
│   ├── index.ts
│   ├── event-bus.ts                # Internal event emitter
│   ├── event.types.ts              # Event type definitions
│   └── event.registry.ts           # Event handler registration
│
├── database/
│   ├── index.ts
│   ├── prisma.ts                   # Prisma client singleton
│   ├── transaction.ts              # Transaction helpers
│   └── pagination.ts               # Pagination utilities
│
├── errors/
│   ├── index.ts
│   ├── app.error.ts                # Base error class
│   ├── http.errors.ts              # HTTP-specific errors
│   ├── domain.errors.ts            # Domain-specific errors
│   └── error.handler.ts            # Global error handler
│
├── middleware/
│   ├── index.ts
│   ├── auth.middleware.ts          # JWT validation
│   ├── rate-limit.middleware.ts    # Rate limiting
│   ├── validate.middleware.ts      # Zod validation
│   └── cors.middleware.ts          # CORS configuration
│
├── validation/
│   ├── index.ts
│   ├── common.schemas.ts           # Shared Zod schemas
│   ├── phone.schema.ts             # Bangladesh phone validation
│   └── pagination.schema.ts        # Pagination params
│
├── utils/
│   ├── index.ts
│   ├── date.utils.ts               # Date helpers
│   ├── phone.utils.ts              # Phone normalization
│   ├── crypto.utils.ts             # Hashing, tokens
│   ├── slug.utils.ts               # Slug generation
│   └── response.utils.ts           # API response builders
│
└── types/
    ├── index.ts
    ├── express.d.ts                # Express type extensions
    ├── api.types.ts                # API response types
    └── common.types.ts             # Shared types
```

### 4.2 Shared Kernel Import Rules

```typescript
// ALLOWED: Any module can import from shared
import { logger } from '@shared/logger';
import { prisma } from '@shared/database';
import { AppError } from '@shared/errors';

// FORBIDDEN: Shared cannot import from modules
// src/shared/utils/something.ts
import { UserService } from '@modules/users'; // ✗ FORBIDDEN
```

---

## 5. Configuration Structure

### 5.1 Environment Variables

```bash
# .env.example

# App
NODE_ENV=development
PORT=3000
APP_NAME=pranidoctor-api
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/pranidoctor
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=pd:

# JWT Secrets (≥32 chars each)
ADMIN_JWT_SECRET=
MOBILE_JWT_SECRET=
DOCTOR_JWT_SECRET=
TECHNICIAN_JWT_SECRET=

# OTP
OTP_LENGTH=6
OTP_EXPIRY_SECONDS=300
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_ATTEMPTS=5

# SMS Provider
SMS_PROVIDER=twilio
SMS_API_KEY=
SMS_API_SECRET=

# AI Providers
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
AI_PRIMARY_PROVIDER=openai

# Storage
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

### 5.2 Configuration Validation

```typescript
// src/shared/config/config.schema.ts

import { z } from 'zod';

export const configSchema = z.object({
  nodeEnv: z.enum(['development', 'test', 'staging', 'production']),
  port: z.coerce.number().default(3000),
  appName: z.string().default('pranidoctor-api'),
  
  database: z.object({
    url: z.string().url(),
    poolMin: z.coerce.number().default(2),
    poolMax: z.coerce.number().default(10),
  }),
  
  redis: z.object({
    url: z.string().url(),
    prefix: z.string().default('pd:'),
  }),
  
  jwt: z.object({
    adminSecret: z.string().min(32),
    mobileSecret: z.string().min(32),
    doctorSecret: z.string().min(32),
    technicianSecret: z.string().min(32),
  }),
  
  otp: z.object({
    length: z.coerce.number().default(6),
    expirySeconds: z.coerce.number().default(300),
    resendCooldownSeconds: z.coerce.number().default(60),
    maxAttempts: z.coerce.number().default(5),
  }),
});

export type AppConfig = z.infer<typeof configSchema>;
```

---

## 6. Test Structure

### 6.1 Test Organization

```
tests/
├── unit/                           # Mirror src/ structure
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.service.test.ts
│   │   │   └── otp.service.test.ts
│   │   └── users/
│   │       └── users.service.test.ts
│   └── shared/
│       ├── utils/
│       │   └── phone.utils.test.ts
│       └── validation/
│           └── phone.schema.test.ts
│
├── integration/                    # Database/external deps
│   ├── modules/
│   │   ├── auth.integration.test.ts
│   │   └── users.integration.test.ts
│   └── setup.ts                    # Integration test setup
│
├── e2e/                            # Full API tests
│   ├── auth.e2e.test.ts
│   ├── users.e2e.test.ts
│   └── setup.ts                    # E2E test setup
│
├── fixtures/                       # Test data
│   ├── users.fixture.ts
│   ├── animals.fixture.ts
│   └── factory.ts                  # Test data factory
│
└── helpers/                        # Test utilities
    ├── db.helper.ts                # Database helpers
    ├── auth.helper.ts              # Auth test helpers
    └── request.helper.ts           # HTTP request helpers
```

### 6.2 Test File Naming

| Type | Location | Pattern |
|------|----------|---------|
| Unit | `tests/unit/` | `*.test.ts` |
| Integration | `tests/integration/` | `*.integration.test.ts` |
| E2E | `tests/e2e/` | `*.e2e.test.ts` |
| Module-scoped | `src/modules/{name}/__tests__/` | `*.test.ts` |

---

## 7. File Naming Conventions

### 7.1 File Name Patterns

| Type | Convention | Example |
|------|------------|---------|
| Service | `{name}.service.ts` | `auth.service.ts` |
| Repository | `{name}.repository.ts` | `user.repository.ts` |
| Controller/Route | `{name}.routes.ts` | `auth.routes.ts` |
| DTO | `{action}-{entity}.dto.ts` | `create-user.dto.ts` |
| Schema | `{name}.schema.ts` | `otp-request.schema.ts` |
| Types | `{name}.types.ts` | `auth.types.ts` |
| Events | `{module}.events.ts` | `clinics.events.ts` |
| Middleware | `{name}.middleware.ts` | `auth.middleware.ts` |
| Utils | `{name}.utils.ts` | `phone.utils.ts` |
| Config | `{name}.config.ts` | `redis.config.ts` |
| Test | `{name}.test.ts` | `auth.service.test.ts` |

### 7.2 Class/Function Naming

| Type | Convention | Example |
|------|------------|---------|
| Service class | PascalCase + Service | `AuthService` |
| Repository class | PascalCase + Repository | `UserRepository` |
| DTO class | PascalCase + Dto | `CreateUserDto` |
| Error class | PascalCase + Error | `UnauthorizedError` |
| Middleware | camelCase | `authMiddleware` |
| Utility function | camelCase | `normalizePhone` |
| Constant | SCREAMING_SNAKE | `MAX_OTP_ATTEMPTS` |
| Schema | camelCase + Schema | `createUserSchema` |

### 7.3 Index Exports Pattern

```typescript
// src/modules/auth/dto/index.ts
export * from './otp-request.dto';
export * from './otp-verify.dto';
export * from './login-response.dto';

// Usage in module index
export * from './dto';
```

---

## 8. Import Aliases

### 8.1 Path Aliases Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@modules/*": ["src/modules/*"],
      "@shared/*": ["src/shared/*"],
      "@api/*": ["src/api/*"],
      "@workers/*": ["src/workers/*"],
      "@generated/*": ["src/generated/*"],
      "@tests/*": ["tests/*"]
    }
  }
}
```

### 8.2 Import Order Convention

```typescript
// 1. Node.js built-ins
import { readFile } from 'fs/promises';
import path from 'path';

// 2. External packages
import express from 'express';
import { z } from 'zod';

// 3. Shared kernel (alphabetical)
import { AppError } from '@shared/errors';
import { logger } from '@shared/logger';
import { prisma } from '@shared/database';

// 4. Other modules (alphabetical)
import { AuthService } from '@modules/auth';
import { UserService } from '@modules/users';

// 5. Local imports (relative)
import { CreateUserDto } from './dto';
import { UserRepository } from './user.repository';
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
| Database Strategy | `docs/backend/03-db-strategy.md` |
| Module Contract | `docs/backend/06-module-contract.md` |
| Master System Rules | `docs/core/MASTER_SYSTEM_RULES.md` |

---

*End of 02-folder-structure.md*
