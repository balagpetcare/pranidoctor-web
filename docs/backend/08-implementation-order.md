# PHASE 1 BACKEND FOUNDATION — Implementation Order

**Version:** 1.0.0  
**Status:** PLAN ONLY — NO IMPLEMENTATION  
**Date:** 2026-05-21  
**Scope:** Implementation sequence, milestones, dependencies

---

## Table of Contents

1. [Implementation Philosophy](#1-implementation-philosophy)
2. [Phase Overview](#2-phase-overview)
3. [Phase 1A: Foundation](#3-phase-1a-foundation)
4. [Phase 1B: Core Modules](#4-phase-1b-core-modules)
5. [Phase 1C: Supporting Modules](#5-phase-1c-supporting-modules)
6. [Phase 1D: Integration](#6-phase-1d-integration)
7. [Dependency Graph](#7-dependency-graph)
8. [Completion Checklist](#8-completion-checklist)

---

## 1. Implementation Philosophy

### 1.1 Core Principles

```
PRINCIPLE I-001: Vertical Slice First
  → Implement end-to-end functionality before breadth
  → One complete API route before many partial ones
  → Test the full stack early

PRINCIPLE I-002: Infrastructure Before Features
  → Set up shared kernel before modules
  → Database and config before business logic
  → Error handling and logging first

PRINCIPLE I-003: Test Early and Often
  → Write tests alongside implementation
  → Integration tests for critical paths
  → No untested code in shared kernel

PRINCIPLE I-004: Incremental Migration
  → New backend runs alongside existing Next.js API
  → Gradual route migration
  → Feature flags for rollout
```

### 1.2 Implementation Order Rationale

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         IMPLEMENTATION SEQUENCE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Phase 1A: Foundation                                                           │
│  ─────────────────────                                                          │
│  Why first: Everything depends on config, logging, database                     │
│                                                                                  │
│       ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│       │  Config  │  │  Logger  │  │ Database │  │  Errors  │                  │
│       │          │──▶│          │──▶│  Prisma  │──▶│          │                  │
│       └──────────┘  └──────────┘  └──────────┘  └──────────┘                  │
│                                                                                  │
│  Phase 1B: Core Modules                                                         │
│  ──────────────────────                                                         │
│  Why second: Auth enables all other modules; users is universal                 │
│                                                                                  │
│       ┌──────────┐  ┌──────────┐                                               │
│       │   Auth   │──▶│  Users   │                                               │
│       │          │  │          │                                               │
│       └──────────┘  └──────────┘                                               │
│                                                                                  │
│  Phase 1C: Supporting Modules                                                   │
│  ────────────────────────────                                                   │
│  Why third: Domain modules depend on auth and users                            │
│                                                                                  │
│       ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│       │ Animals  │  │ Doctors  │  │ Clinics  │  │  Leads   │                  │
│       │          │  │          │  │          │  │          │                  │
│       └──────────┘  └──────────┘  └──────────┘  └──────────┘                  │
│                                                                                  │
│  Phase 1D: Integration                                                          │
│  ─────────────────────                                                          │
│  Why last: Requires all other modules to be functional                         │
│                                                                                  │
│       ┌──────────┐  ┌──────────┐  ┌──────────┐                                │
│       │    AI    │  │  Notifs  │  │  Queues  │                                │
│       │          │  │          │  │ Workers  │                                │
│       └──────────┘  └──────────┘  └──────────┘                                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase Overview

### 2.1 Phase Summary

| Phase | Name | Focus | Deliverable |
|-------|------|-------|-------------|
| 1A | Foundation | Infrastructure | Shared kernel working |
| 1B | Core Modules | Auth + Users | Authentication API complete |
| 1C | Supporting Modules | Domain logic | Full CRUD for entities |
| 1D | Integration | AI + Notifications | End-to-end workflows |

### 2.2 Critical Path

```
Config → Logger → Database → Errors → Middleware →
Auth → Users → Doctors → Clinics → AI → Notifications
```

---

## 3. Phase 1A: Foundation

### 3.1 Step 1: Project Setup

**Tasks:**
1. Initialize Node.js project with TypeScript
2. Configure ESLint + Prettier
3. Set up path aliases in tsconfig.json
4. Create folder structure as per `02-folder-structure.md`
5. Add `.env.example` template

**Deliverable:** Empty project with correct structure

**Checklist:**
- [ ] `package.json` with correct scripts
- [ ] `tsconfig.json` with path aliases
- [ ] ESLint config
- [ ] Folder structure created
- [ ] `.gitignore` configured

### 3.2 Step 2: Configuration Module

**Tasks:**
1. Create `src/shared/config/` structure
2. Implement Zod schema for environment validation
3. Create config loader with fail-fast validation
4. Add configs for: app, database, redis, jwt, otp

**Files:**
```
src/shared/config/
├── index.ts
├── config.schema.ts
├── config.loader.ts
├── app.config.ts
├── database.config.ts
├── redis.config.ts
├── jwt.config.ts
└── otp.config.ts
```

**Checklist:**
- [ ] Config schema validates all required env vars
- [ ] App fails to start with missing config
- [ ] Sensitive values not logged
- [ ] Unit tests pass

### 3.3 Step 3: Logger Module

**Tasks:**
1. Set up Pino logger with structured output
2. Create request ID generation utility
3. Implement log sanitization for sensitive data
4. Add child logger factory

**Files:**
```
src/shared/logger/
├── index.ts
├── logger.ts
├── sanitizer.ts
└── request-id.ts
```

**Checklist:**
- [ ] Logs output in JSON format
- [ ] Sensitive fields redacted
- [ ] Request IDs included
- [ ] Log levels configurable

### 3.4 Step 4: Database Module

**Tasks:**
1. Copy Prisma schema from existing project
2. Create Prisma client singleton
3. Implement connection health check
4. Add transaction helper utilities
5. Create pagination utilities

**Files:**
```
src/shared/database/
├── index.ts
├── prisma.ts
├── health.ts
├── transaction.ts
└── pagination.ts

prisma/
└── schema.prisma
```

**Checklist:**
- [ ] Prisma client generates successfully
- [ ] Health check endpoint works
- [ ] Connection pooling configured
- [ ] Slow query logging enabled

### 3.5 Step 5: Error Module

**Tasks:**
1. Create base AppError class
2. Implement HTTP error classes (400, 401, 403, 404, 409, 422, 429, 500)
3. Create domain error classes
4. Implement global error handler middleware
5. Add Prisma error handler

**Files:**
```
src/shared/errors/
├── index.ts
├── app.error.ts
├── http.errors.ts
├── domain.errors.ts
├── error.handler.ts
└── prisma.errors.ts
```

**Checklist:**
- [ ] All HTTP errors have correct status codes
- [ ] Error responses match API_CONTRACT_V1 format
- [ ] Prisma errors converted to HTTP errors
- [ ] Stack traces not exposed in production

### 3.6 Step 6: Core Middleware

**Tasks:**
1. Create request logging middleware
2. Implement CORS middleware
3. Create validation middleware (Zod integration)
4. Add rate limiting middleware skeleton

**Files:**
```
src/shared/middleware/
├── index.ts
├── logger.middleware.ts
├── cors.middleware.ts
├── validate.middleware.ts
└── rate-limit.middleware.ts
```

**Checklist:**
- [ ] All requests logged with timing
- [ ] CORS configured for allowed origins
- [ ] Validation errors return 422 with details
- [ ] Middleware order documented

### 3.7 Step 7: Common Validation Schemas

**Tasks:**
1. Create Bangladesh phone validation schema
2. Add pagination schemas
3. Create date/money schemas
4. Add common string sanitization

**Files:**
```
src/shared/validation/
├── index.ts
├── common.schemas.ts
├── phone.schema.ts
├── pagination.schema.ts
└── money.schema.ts
```

**Checklist:**
- [ ] Phone validation matches BD format
- [ ] Pagination has reasonable limits
- [ ] Money rounds to 2 decimal places
- [ ] Schemas export TypeScript types

### 3.8 Step 8: Express App Setup

**Tasks:**
1. Create Express app with middleware stack
2. Configure body parsing with size limits
3. Add health check endpoint
4. Set up 404 handler
5. Integrate global error handler

**Files:**
```
src/app.ts
src/server.ts
```

**Checklist:**
- [ ] App starts without errors
- [ ] Health endpoint returns 200
- [ ] 404 returns proper JSON error
- [ ] Errors handled gracefully

---

## 4. Phase 1B: Core Modules

### 4.1 Step 9: Auth Module - JWT Service

**Tasks:**
1. Create JWT service with sign/verify
2. Implement token payload interfaces
3. Add secret validation
4. Create token extraction utilities

**Files:**
```
src/modules/auth/
├── index.ts
├── auth.module.ts
├── services/
│   └── jwt.service.ts
├── types.ts
└── __tests__/
    └── jwt.service.test.ts
```

**Checklist:**
- [ ] Tokens sign with correct algorithm
- [ ] Token verification catches expiry
- [ ] Different secrets per auth context
- [ ] Unit tests pass

### 4.2 Step 10: Auth Module - OTP Service

**Tasks:**
1. Create OTP generation with configurable length
2. Implement OTP storage (MobileOtpChallenge)
3. Add rate limiting logic
4. Create verification with attempt tracking
5. Implement cooldown enforcement

**Files:**
```
src/modules/auth/
├── services/
│   └── otp.service.ts
├── schemas/
│   ├── otp-request.schema.ts
│   └── otp-verify.schema.ts
├── dto/
│   ├── otp-request.dto.ts
│   └── otp-verify.dto.ts
└── __tests__/
    └── otp.service.test.ts
```

**Checklist:**
- [ ] OTP is 6 digits
- [ ] OTP expires after 300s
- [ ] Max 5 verify attempts
- [ ] Cooldown enforced (60s)
- [ ] Rate limit: 5/hour

### 4.3 Step 11: Auth Module - Routes

**Tasks:**
1. Create `/api/mobile/auth/otp/request` route
2. Create `/api/mobile/auth/otp/verify` route
3. Create `/api/admin/auth/login` route
4. Create `/api/admin/auth/me` route
5. Implement auth middleware

**Files:**
```
src/api/mobile/auth/
├── auth.routes.ts
├── auth.controller.ts
└── __tests__/
    └── auth.routes.test.ts

src/api/admin/auth/
├── auth.routes.ts
└── auth.controller.ts

src/shared/middleware/
└── auth.middleware.ts
```

**Checklist:**
- [ ] OTP request returns success without OTP
- [ ] OTP verify returns tokens
- [ ] Admin login with email/password works
- [ ] Protected routes reject without token
- [ ] Integration tests pass

### 4.4 Step 12: Users Module

**Tasks:**
1. Create user repository with CRUD
2. Implement user service
3. Add profile services (Customer, Doctor, Admin, Technician)
4. Create user DTOs and schemas
5. Add user routes

**Files:**
```
src/modules/users/
├── index.ts
├── user.service.ts
├── user.repository.ts
├── services/
│   ├── customer-profile.service.ts
│   ├── doctor-profile.service.ts
│   └── admin-profile.service.ts
├── dto/
│   ├── user.dto.ts
│   └── profile.dto.ts
├── schemas/
│   ├── user.schema.ts
│   └── profile.schema.ts
└── __tests__/
    └── user.service.test.ts

src/api/mobile/users/
├── users.routes.ts
└── users.controller.ts

src/api/admin/users/
├── users.routes.ts
└── users.controller.ts
```

**Checklist:**
- [ ] User CRUD operations work
- [ ] Profile fetching by type works
- [ ] Role-based filtering works
- [ ] Pagination works
- [ ] Integration tests pass

---

## 5. Phase 1C: Supporting Modules

### 5.1 Step 13: Animals Module

**Tasks:**
1. Create animal profile service
2. Add animal CRUD routes
3. Implement ownership validation

**Deliverable:** `/api/mobile/animals/*` routes working

**Checklist:**
- [ ] Create animal for customer
- [ ] List customer's animals
- [ ] Update animal details
- [ ] Soft delete animal
- [ ] Ownership enforced

### 5.2 Step 14: Doctors Module

**Tasks:**
1. Create doctor profile service
2. Implement service area management
3. Add availability logic
4. Create doctor routes (list, detail, availability)

**Deliverable:** `/api/mobile/doctors/*` and `/api/admin/doctors/*` routes

**Checklist:**
- [ ] List doctors by area
- [ ] Doctor profile with qualifications
- [ ] Service areas CRUD
- [ ] Status management (active/suspended)

### 5.3 Step 15: Clinics Module (Service Requests)

**Tasks:**
1. Create service request service
2. Implement request lifecycle
3. Add assignment logic
4. Create customer-facing routes
5. Create admin routes

**Deliverable:** `/api/mobile/requests/*` and `/api/admin/requests/*`

**Checklist:**
- [ ] Create service request
- [ ] Request lifecycle transitions
- [ ] Provider assignment
- [ ] Status updates
- [ ] Request history

### 5.4 Step 16: Clinics Module (AI Technicians)

**Tasks:**
1. Create AI technician service
2. Implement onboarding workflow
3. Add semen service templates
4. Create technician routes

**Deliverable:** `/api/mobile/technician/*` routes

**Checklist:**
- [ ] Technician profile management
- [ ] Document upload handling
- [ ] Service listing
- [ ] Area coverage

### 5.5 Step 17: Clinics Module (Billing)

**Tasks:**
1. Create billing service
2. Implement invoice generation
3. Add payment recording
4. Create billing routes

**Deliverable:** `/api/mobile/billing/*` and `/api/admin/billing/*`

**Checklist:**
- [ ] Invoice creation
- [ ] Payment recording
- [ ] Status tracking
- [ ] Commission calculation

### 5.6 Step 18: Leads Module

**Tasks:**
1. Create lead capture service
2. Implement conversion tracking
3. Add lead routes

**Deliverable:** `/api/public/leads/*` and `/api/admin/leads/*`

**Checklist:**
- [ ] Capture lead from landing page
- [ ] Track lead source
- [ ] Convert to user
- [ ] Analytics data

---

## 6. Phase 1D: Integration

### 6.1 Step 19: Queue Infrastructure

**Tasks:**
1. Set up BullMQ with Redis
2. Create queue service abstraction
3. Implement notification queue
4. Create worker entry point

**Deliverable:** Queue system working with test job

**Checklist:**
- [ ] Job enqueue works
- [ ] Worker processes jobs
- [ ] Retry logic works
- [ ] Dead letter queue configured

### 6.2 Step 20: Notifications Module

**Tasks:**
1. Create notification service
2. Implement SMS provider integration
3. Add push notification support (skeleton)
4. Create notification worker
5. Add notification routes

**Deliverable:** SMS sending works end-to-end

**Checklist:**
- [ ] SMS OTP sends via provider
- [ ] Notification stored in DB
- [ ] In-app notifications list
- [ ] Mark as read

### 6.3 Step 21: AI Module

**Tasks:**
1. Create AI provider abstraction
2. Implement OpenAI/Anthropic providers
3. Add conversation context service
4. Create AI completion endpoint
5. Implement prompt caching

**Deliverable:** AI chat completion works

**Checklist:**
- [ ] Provider abstraction works
- [ ] Completion API returns response
- [ ] Context preserved in session
- [ ] Prompt caching reduces costs

### 6.4 Step 22: Event System

**Tasks:**
1. Implement internal event bus
2. Register module event handlers
3. Add audit logging via events
4. Connect notifications to events

**Deliverable:** Events trigger notifications

**Checklist:**
- [ ] Events publish/subscribe works
- [ ] Service request → notification
- [ ] Audit events logged
- [ ] Error handling in handlers

### 6.5 Step 23: Docker & Deployment

**Tasks:**
1. Create production Dockerfile
2. Set up docker-compose
3. Add Caddy configuration
4. Create deployment scripts
5. Set up CI/CD pipeline

**Deliverable:** App deployable via Docker

**Checklist:**
- [ ] Docker build succeeds
- [ ] Compose starts all services
- [ ] Health checks pass
- [ ] SSL working via Caddy

---

## 7. Dependency Graph

### 7.1 Module Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          MODULE DEPENDENCY GRAPH                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                            SHARED KERNEL                                  │  │
│  │                                                                           │  │
│  │    config ──▶ logger ──▶ database ──▶ errors ──▶ middleware              │  │
│  │      │          │           │           │            │                    │  │
│  │      └──────────┴───────────┴───────────┴────────────┘                    │  │
│  │                              │                                             │  │
│  └──────────────────────────────┼─────────────────────────────────────────────┘  │
│                                 │                                                │
│                                 ▼                                                │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                               AUTH                                         │  │
│  │                         (OTP, JWT, Session)                               │  │
│  └───────────────────────────────┬───────────────────────────────────────────┘  │
│                                  │                                               │
│                                  ▼                                               │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                              USERS                                         │  │
│  │                     (User, Profiles, Preferences)                         │  │
│  └───────────────────────────────┬───────────────────────────────────────────┘  │
│                                  │                                               │
│          ┌───────────────────────┼───────────────────────┐                      │
│          │                       │                       │                      │
│          ▼                       ▼                       ▼                      │
│   ┌──────────────┐       ┌──────────────┐       ┌──────────────┐               │
│   │   ANIMALS    │       │   DOCTORS    │       │    LEADS     │               │
│   │              │       │              │       │              │               │
│   └──────┬───────┘       └──────┬───────┘       └──────────────┘               │
│          │                      │                                               │
│          └──────────────────────┘                                               │
│                       │                                                         │
│                       ▼                                                         │
│   ┌───────────────────────────────────────────────────────────────────────────┐│
│   │                            CLINICS                                        ││
│   │               (ServiceRequest, AI Technician, Billing)                    ││
│   └───────────────────────────────┬───────────────────────────────────────────┘│
│                                   │                                             │
│           ┌───────────────────────┴───────────────────────┐                    │
│           │                                               │                    │
│           ▼                                               ▼                    │
│   ┌──────────────┐                               ┌──────────────┐              │
│   │      AI      │                               │ NOTIFICATIONS│              │
│   │              │                               │              │              │
│   └──────────────┘                               └──────────────┘              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Implementation Dependency Rules

```
RULE: Cannot start module until all dependencies are complete

AUTH    → requires: shared kernel
USERS   → requires: auth
ANIMALS → requires: users
DOCTORS → requires: users
LEADS   → requires: users
CLINICS → requires: animals, doctors
AI      → requires: clinics
NOTIFS  → requires: shared kernel (events from any module)
```

---

## 8. Completion Checklist

### 8.1 Phase 1A: Foundation

- [ ] Project setup complete
- [ ] Config module with validation
- [ ] Logger with sanitization
- [ ] Database with health check
- [ ] Error handling middleware
- [ ] Core middleware stack
- [ ] Validation schemas
- [ ] Express app runs

### 8.2 Phase 1B: Core Modules

- [ ] JWT service with sign/verify
- [ ] OTP service with rate limiting
- [ ] Auth routes working
- [ ] Auth middleware protecting routes
- [ ] User CRUD service
- [ ] Profile services
- [ ] User routes (mobile + admin)
- [ ] Integration tests pass

### 8.3 Phase 1C: Supporting Modules

- [ ] Animals CRUD
- [ ] Doctors module with areas
- [ ] Service requests lifecycle
- [ ] AI technician onboarding
- [ ] Billing and payments
- [ ] Leads capture

### 8.4 Phase 1D: Integration

- [ ] Queue infrastructure
- [ ] Notification worker
- [ ] SMS integration
- [ ] AI module with providers
- [ ] Event system
- [ ] Docker deployment

### 8.5 Final Validation

- [ ] All API routes match API_CONTRACT_V1
- [ ] Error codes match ERROR_STANDARD
- [ ] OTP policy matches AUTH_FLOW
- [ ] Security matches MASTER_SYSTEM_RULES
- [ ] All tests pass
- [ ] Documentation complete
- [ ] Deployment successful

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
| Folder Structure | `docs/backend/02-folder-structure.md` |
| Database Strategy | `docs/backend/03-db-strategy.md` |
| Security Design | `docs/backend/04-security-design.md` |
| Docker Design | `docs/backend/05-docker-design.md` |
| Module Contract | `docs/backend/06-module-contract.md` |
| Queue Strategy | `docs/backend/07-queue-strategy.md` |
| API Contract V1 | `docs/api/API_CONTRACT_V1.md` |
| Auth Flow | `docs/api/AUTH_FLOW.md` |
| Master System Rules | `docs/core/MASTER_SYSTEM_RULES.md` |

---

*End of 08-implementation-order.md*
