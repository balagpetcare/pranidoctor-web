# PHASE 1 BACKEND FOUNDATION — System Architecture

**Version:** 1.0.0  
**Status:** PLAN ONLY — NO IMPLEMENTATION  
**Date:** 2026-05-21  
**Scope:** Backend foundation for Prani Doctor modular monolith

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Architecture Principles](#2-architecture-principles)
3. [Technology Stack](#3-technology-stack)
4. [Module Boundaries](#4-module-boundaries)
5. [Dependency Graph](#5-dependency-graph)
6. [Data Flow Patterns](#6-data-flow-patterns)
7. [Scalability Path](#7-scalability-path)
8. [Future Microservice Separation](#8-future-microservice-separation)

---

## 1. Architecture Overview

### 1.1 Architecture Pattern: Modular Monolith

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PRANI DOCTOR BACKEND                                    │
│                         (Modular Monolith Architecture)                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                          API GATEWAY LAYER                                   │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │ /api/mobile │  │ /api/admin  │  │ /api/public │  │ /api/webhook│        │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │ │
│  │         └─────────────────┴────────────────┴────────────────┘               │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                         │                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                          MODULE LAYER                                        │ │
│  │                                                                               │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │ │
│  │  │   AUTH   │ │  USERS   │ │ DOCTORS  │ │  LEADS   │ │ ANIMALS  │          │ │
│  │  │  Module  │ │  Module  │ │  Module  │ │  Module  │ │  Module  │          │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │ │
│  │                                                                               │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐                              │ │
│  │  │ CLINICS  │ │    AI    │ │  NOTIFICATIONS   │                              │ │
│  │  │  Module  │ │  Module  │ │     Module       │                              │ │
│  │  └──────────┘ └──────────┘ └──────────────────┘                              │ │
│  │                                                                               │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                         │                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                         SHARED KERNEL                                        │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │ │
│  │  │ Config  │ │ Logger  │ │  Cache  │ │  Queue  │ │  Events │ │  Utils  │  │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                         │                                         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                         DATA LAYER                                           │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │ │
│  │  │   PostgreSQL    │  │     Redis       │  │   S3/MinIO      │              │ │
│  │  │   (Prisma)      │  │  Cache/Queue    │  │   Storage       │              │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘              │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Why Modular Monolith?

| Factor | Decision |
|--------|----------|
| Team Size | Small team (< 5 backend devs) → monolith efficiency |
| Deployment | Single VPS initially → simpler deployments |
| Transaction Boundaries | Cross-module transactions required → shared DB |
| Complexity | MVP phase → avoid microservice operational overhead |
| Future Migration | Clean module boundaries enable future extraction |

---

## 2. Architecture Principles

### 2.1 Core Principles

```
PRINCIPLE-001: Module Independence
  → Each module owns its domain logic
  → No direct cross-module database queries
  → Inter-module communication via defined interfaces

PRINCIPLE-002: Single Source of Truth
  → Prisma schema is the database truth
  → Module services are the business logic truth
  → API contracts are the integration truth

PRINCIPLE-003: Defense in Depth
  → Middleware layer: Authentication
  → Route handler: Authorization
  → Service layer: Business validation
  → Database layer: Constraints

PRINCIPLE-004: Fail Fast, Fail Safe
  → Validate at boundaries
  → Return meaningful errors
  → Log all failures for observability

PRINCIPLE-005: Future-Ready
  → Design for eventual microservice extraction
  → Avoid tight coupling between modules
  → Use domain events for loose coupling
```

### 2.2 Domain-Driven Design Alignment

| DDD Concept | Implementation |
|-------------|----------------|
| Bounded Context | Module boundary |
| Aggregate | Primary entity + owned entities |
| Domain Event | Internal event bus message |
| Repository | Prisma + service layer |
| Value Object | TypeScript branded types |
| Entity | Prisma model + domain logic |

---

## 3. Technology Stack

### 3.1 Core Stack (Immutable for Phase 1)

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Node.js | 20 LTS | JavaScript execution |
| Language | TypeScript | 5.x | Type safety |
| Framework | Express.js | 5.x | HTTP server |
| ORM | Prisma | 7.x | Database access |
| Database | PostgreSQL | 16+ | Primary data store |
| Cache | Redis | 7.x | Cache + Queue + Session |
| Container | Docker | Latest | Deployment |

### 3.2 Secondary Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Validation | Zod | Schema validation |
| Queue | BullMQ | Background job processing |
| Logging | Pino | Structured logging |
| Testing | Vitest | Unit/integration tests |
| API Docs | OpenAPI 3.1 | API documentation |

### 3.3 Infrastructure Dependencies

| Service | Local Dev | Production |
|---------|-----------|------------|
| PostgreSQL | Docker | Managed / Docker |
| Redis | Docker | Managed / Docker |
| MinIO (S3) | Docker | S3-compatible |
| Caddy | Optional | Reverse proxy |

---

## 4. Module Boundaries

### 4.1 Module Catalog

| Module | Domain | Responsibility | External Deps |
|--------|--------|----------------|---------------|
| **auth** | Identity | Authentication, OTP, JWT, sessions | SMS gateway |
| **users** | Identity | User profiles, preferences | — |
| **doctors** | Provider | Doctor profiles, availability, assignments | — |
| **leads** | Provider | Lead capture, conversion tracking | — |
| **animals** | Customer | Animal profiles, health records | — |
| **clinics** | Provider | Clinic management, AI technicians | — |
| **ai** | Intelligence | AI orchestration, memory, prompts | AI providers |
| **notifications** | Communication | SMS, push, email, in-app alerts | SMS/Push gateways |

### 4.2 Module Ownership Rules

```
RULE: Each Prisma model belongs to exactly ONE module
RULE: Module A cannot import from Module B's internal services
RULE: Cross-module data access via public service interfaces only
RULE: Shared entities (User, Location) owned by designated module
```

### 4.3 Module-to-Entity Mapping

| Module | Owned Entities |
|--------|----------------|
| auth | MobileOtpChallenge, (Session — future) |
| users | User, AdminProfile, CustomerProfile |
| doctors | DoctorProfile, DoctorServiceArea, DoctorProfileArea |
| leads | (LeadCapture — future) |
| animals | AnimalProfile |
| clinics | AiTechnicianProfile, AiTechnicianService, ServiceRequest, etc. |
| ai | AiConversation, AiMessage, (AiMemoryEntry — Phase 2) |
| notifications | Notification |

---

## 5. Dependency Graph

### 5.1 Module Dependency Diagram

```
                         ┌─────────────────────────────┐
                         │       SHARED KERNEL         │
                         │  config / logger / cache    │
                         │  queue / events / utils     │
                         └──────────────┬──────────────┘
                                        │
       ┌────────────────────────────────┼────────────────────────────────┐
       │                                │                                │
       ▼                                ▼                                ▼
┌──────────────┐              ┌──────────────┐              ┌──────────────┐
│     AUTH     │              │    USERS     │              │ NOTIFICATIONS│
│   Module     │              │   Module     │              │    Module    │
│              │              │              │              │              │
│ • OTP Flow   │              │ • Profiles   │              │ • SMS        │
│ • JWT        │              │ • Prefs      │              │ • Push       │
│ • Session    │              │              │              │ • In-app     │
└──────┬───────┘              └──────┬───────┘              └──────────────┘
       │                             │                              ▲
       │         ┌───────────────────┘                              │
       ▼         ▼                                                  │
┌──────────────────────┐                                           │
│       DOCTORS        │                                           │
│       Module         │◄──────────────────────────────────────────┤
│                      │                                           │
│ • DoctorProfile      │         ┌───────────────┐                 │
│ • ServiceArea        │◄────────│    CLINICS    │                 │
│ • Availability       │         │    Module     │─────────────────┤
└──────────────────────┘         │               │                 │
                                 │ • AI Tech     │                 │
┌──────────────────────┐         │ • Requests    │                 │
│       ANIMALS        │◄────────│ • Billing     │                 │
│       Module         │         └───────┬───────┘                 │
│                      │                 │                         │
│ • AnimalProfile      │                 │                         │
│ • HealthRecords      │                 ▼                         │
└──────────────────────┘         ┌───────────────┐                 │
                                 │      AI       │─────────────────┘
┌──────────────────────┐         │    Module     │
│       LEADS          │         │               │
│       Module         │◄────────│ • Orchestrator│
│                      │         │ • Memory      │
│ • Lead Capture       │         │ • Prompts     │
│ • Conversion         │         └───────────────┘
└──────────────────────┘
```

### 5.2 Dependency Rules

| From Module | Allowed Dependencies |
|-------------|---------------------|
| auth | shared kernel only |
| users | auth, shared kernel |
| doctors | auth, users, shared kernel |
| leads | auth, users, notifications, shared kernel |
| animals | auth, users, shared kernel |
| clinics | auth, users, doctors, animals, notifications, shared kernel |
| ai | auth, users, animals, clinics, notifications, shared kernel |
| notifications | shared kernel only (receives events) |

### 5.3 Forbidden Dependencies (Hard Block)

```
✗ notifications → clinics (circular)
✗ auth → users (keep auth isolated)
✗ doctors → clinics (clinics depends on doctors)
✗ any module → another module's internal services
```

---

## 6. Data Flow Patterns

### 6.1 Request-Response Flow (Synchronous)

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│   Client   │───▶│   Router   │───▶│  Service   │───▶│  Prisma    │
│            │    │            │    │            │    │            │
│            │◀───│            │◀───│            │◀───│            │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
                        │
                        ▼
               ┌────────────────┐
               │  Middleware    │
               │  • Auth        │
               │  • Validation  │
               │  • Rate Limit  │
               └────────────────┘
```

### 6.2 Event-Driven Flow (Asynchronous)

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│  Service   │───▶│ Event Bus  │───▶│   Queue    │───▶│  Worker    │
│  Action    │    │  (publish) │    │  (BullMQ)  │    │  (process) │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
                        │
                        ▼
               ┌────────────────────────────────────┐
               │         Event Subscribers          │
               │  • NotificationService             │
               │  • AuditLogService                 │
               │  • AnalyticsService                │
               └────────────────────────────────────┘
```

### 6.3 Cross-Module Communication Pattern

```typescript
// ALLOWED: Public service interface
import { UserService } from '@modules/users/user.service';
const user = await userService.findById(userId);

// FORBIDDEN: Direct repository/internal access
import { userRepository } from '@modules/users/internal/user.repository';

// PREFERRED: Event-based decoupling
eventBus.publish('service-request.created', { requestId, customerId });
// Notification module subscribes and handles independently
```

---

## 7. Scalability Path

### 7.1 Horizontal Scaling Strategy

```
Phase 1: Single Instance
┌─────────────────────────────────────┐
│  VPS (Single Node)                  │
│  ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │ App     │ │ Postgres│ │ Redis │ │
│  └─────────┘ └─────────┘ └───────┘ │
└─────────────────────────────────────┘

Phase 2: Vertical + Read Replica
┌─────────────────────────────────────┐
│  Primary VPS                        │
│  ┌─────────┐ ┌─────────┐ ┌───────┐ │
│  │ App x2  │ │ Postgres│ │ Redis │ │
│  └─────────┘ │ Primary │ │ Cluster│ │
│              └────┬────┘ └───────┘ │
└───────────────────┼─────────────────┘
                    │
            ┌───────▼───────┐
            │  Postgres     │
            │  Read Replica │
            └───────────────┘

Phase 3: Container Orchestration
┌─────────────────────────────────────────────────────────────────┐
│  Kubernetes / Docker Swarm                                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │ App Pod │ │ App Pod │ │ App Pod │ │ Worker  │              │
│  │  (API)  │ │  (API)  │ │  (API)  │ │  Pods   │              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                          │                                       │
│  ┌───────────────────────┴───────────────────────┐              │
│  │        Managed Services (RDS, ElastiCache)    │              │
│  └───────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Scaling Triggers

| Metric | Threshold | Action |
|--------|-----------|--------|
| Request latency P99 | > 500ms | Add app instance |
| Database connections | > 80% | Add read replica |
| Memory usage | > 80% | Vertical scale |
| Queue depth | > 1000 | Add workers |
| DAU | > 10,000 | Consider microservices |

---

## 8. Future Microservice Separation

### 8.1 Extraction Candidates (Priority Order)

| Module | Extraction Trigger | Complexity |
|--------|-------------------|------------|
| notifications | High volume SMS/push | Low |
| ai | Independent scaling needs | Medium |
| auth | Security isolation | Medium |
| clinics | Domain complexity | High |

### 8.2 Microservice-Ready Patterns

```
Pattern: API Gateway Facade
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Routes to appropriate service (module or microservice)  │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │   Monolith   │ │ Notification │ │   AI        │
   │  (remaining) │ │ Microservice │ │ Microservice│
   └──────────────┘ └──────────────┘ └──────────────┘

Pattern: Event-Driven Communication
┌──────────────┐     ┌────────────────┐     ┌──────────────┐
│   Service A  │────▶│  Message Bus   │────▶│  Service B   │
│   (publish)  │     │  (Redis/Kafka) │     │  (subscribe) │
└──────────────┘     └────────────────┘     └──────────────┘
```

### 8.3 Pre-Extraction Checklist

Before extracting any module to microservice:

- [ ] Module has clear public API interface
- [ ] No direct database queries from other modules
- [ ] All cross-module communication via events/interfaces
- [ ] Module has own test suite with > 80% coverage
- [ ] API contracts documented in OpenAPI
- [ ] Circuit breaker patterns implemented
- [ ] Health check endpoint exists
- [ ] Metrics/logging standardized

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Architecture | Initial Phase 1 plan |

---

## Related Documents

| Document | Path |
|----------|------|
| Folder Structure | `docs/backend/02-folder-structure.md` |
| Database Strategy | `docs/backend/03-db-strategy.md` |
| Security Design | `docs/backend/04-security-design.md` |
| Docker Design | `docs/backend/05-docker-design.md` |
| Module Contract | `docs/backend/06-module-contract.md` |
| Queue Strategy | `docs/backend/07-queue-strategy.md` |
| Implementation Order | `docs/backend/08-implementation-order.md` |
| Master System Rules | `docs/core/MASTER_SYSTEM_RULES.md` |

---

*End of 01-system-architecture.md*
