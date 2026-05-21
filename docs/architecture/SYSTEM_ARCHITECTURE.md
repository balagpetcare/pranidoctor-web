# SYSTEM ARCHITECTURE — Prani Doctor Ecosystem

**Version:** 1.0.0  
**Last Updated:** 2026-05-21  
**Owner:** Architecture Team  
**Reference:** [MASTER_SYSTEM_RULES.md](../core/MASTER_SYSTEM_RULES.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [High-Level Architecture](#2-high-level-architecture)
3. [System Components](#3-system-components)
4. [Module Communication Flow](#4-module-communication-flow)
5. [API Gateway Structure](#5-api-gateway-structure)
6. [Multi-Tenant Architecture](#6-multi-tenant-architecture)
7. [Service Boundaries](#7-service-boundaries)
8. [AI Orchestration Layer](#8-ai-orchestration-layer)
9. [Offline Synchronization](#9-offline-synchronization)
10. [Security Architecture](#10-security-architecture)
11. [Queue and Event Strategy](#11-queue-and-event-strategy)
12. [Media Upload Strategy](#12-media-upload-strategy)
13. [Real-Time Communication](#13-real-time-communication)
14. [Notification Architecture](#14-notification-architecture)
15. [Scalability Strategy](#15-scalability-strategy)
16. [Infrastructure Planning](#16-infrastructure-planning)
17. [Shared Services](#17-shared-services)
18. [Failure Handling Strategy](#18-failure-handling-strategy)
19. [Data Ownership Strategy](#19-data-ownership-strategy)
20. [Future Microservice Separation](#20-future-microservice-separation)
21. [Domain-Specific Subsystems](#21-domain-specific-subsystems)
22. [Integration Points](#22-integration-points)
23. [Architecture Decision Summary](#23-architecture-decision-summary)

---

## 1. Executive Summary

### 1.1 Platform Vision

Prani Doctor is an enterprise veterinary service platform for Bangladesh, connecting farmers with veterinary doctors and AI technicians through a unified digital ecosystem.

### 1.2 Architecture Philosophy

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ARCHITECTURE PRINCIPLES                          │
├─────────────────────────────────────────────────────────────────────┤
│  1. Modular Monolith First → Microservices When Needed              │
│  2. Offline-First Mobile → Sync When Connected                       │
│  3. AI-Assisted → Human-Verified                                     │
│  4. Local-First Data → Cloud Backup                                  │
│  5. API-First Design → Multi-Client Support                          │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.3 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Mobile | Flutter | Cross-platform apps (Customer, Doctor, Technician) |
| API | Next.js (App Router) | REST API + Server Components |
| Database | PostgreSQL 16+ | Primary data store |
| ORM | Prisma 7+ | Type-safe database access |
| Cache | Redis (future) | Session, cache, pub/sub |
| Storage | S3-compatible | Media files |
| AI | OpenAI / Anthropic | AI services with abstraction |
| Queue | BullMQ (future) | Background jobs |

---

## 2. High-Level Architecture

### 2.1 System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Customer   │  │   Doctor    │  │ AI Technic. │  │   Admin     │        │
│  │  Mobile App │  │  Mobile App │  │  Mobile App │  │   Panel     │        │
│  │  (Flutter)  │  │  (Flutter)  │  │  (Flutter)  │  │  (Next.js)  │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │                │
│         └────────────────┴────────────────┴────────────────┘                │
│                                    │                                         │
│                          ┌─────────▼─────────┐                              │
│                          │    API Gateway    │                              │
│                          │   (Next.js API)   │                              │
│                          └─────────┬─────────┘                              │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────┐
│                              API LAYER                                       │
├────────────────────────────────────┼────────────────────────────────────────┤
│                          ┌─────────▼─────────┐                              │
│                          │   Route Handlers  │                              │
│                          │  /api/mobile/*    │                              │
│                          │  /api/admin/*     │                              │
│                          │  /api/public/*    │                              │
│                          └─────────┬─────────┘                              │
│                                    │                                         │
│    ┌───────────────────────────────┼───────────────────────────────┐        │
│    │                               │                               │        │
│    ▼                               ▼                               ▼        │
│ ┌──────────────┐            ┌──────────────┐            ┌──────────────┐   │
│ │   Auth       │            │   Business   │            │   AI         │   │
│ │   Service    │            │   Services   │            │   Service    │   │
│ └──────┬───────┘            └──────┬───────┘            └──────┬───────┘   │
│        │                           │                           │           │
└────────┼───────────────────────────┼───────────────────────────┼───────────┘
         │                           │                           │
┌────────┼───────────────────────────┼───────────────────────────┼───────────┐
│        │               DATA LAYER  │                           │           │
├────────┼───────────────────────────┼───────────────────────────┼───────────┤
│        ▼                           ▼                           ▼           │
│ ┌──────────────┐            ┌──────────────┐            ┌──────────────┐   │
│ │   Prisma     │            │   Redis      │            │   S3         │   │
│ │   ORM        │            │   Cache      │            │   Storage    │   │
│ └──────┬───────┘            └──────────────┘            └──────────────┘   │
│        │                                                                    │
│        ▼                                                                    │
│ ┌──────────────┐                                                           │
│ │  PostgreSQL  │                                                           │
│ │   Database   │                                                           │
│ └──────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow

```
Mobile App → API Gateway → Auth Middleware → Route Handler → Service Layer → Database
     ↑                                                              │
     └──────────────────────── Response ◄───────────────────────────┘
```

---

## 3. System Components

### 3.1 Component Registry

| Component | Type | Technology | Status |
|-----------|------|------------|--------|
| Customer App | Mobile | Flutter | Active |
| Doctor App | Mobile | Flutter | Planned |
| Technician App | Mobile | Flutter | Planned |
| Admin Panel | Web | Next.js | Active |
| API Server | Backend | Next.js API | Active |
| Database | Data | PostgreSQL | Active |
| Cache | Data | Redis | Planned |
| Queue | Infra | BullMQ | Planned |
| Storage | Infra | S3 | Active |
| AI Service | Service | OpenAI/Anthropic | Planned |
| SMS Gateway | Service | HTTP API | Active |
| Push Notifications | Service | FCM/APNs | Planned |

### 3.2 Component Interaction Matrix

```
              │ Customer │ Doctor │ Tech  │ Admin │ API  │ AI   │ Queue │ DB   │
──────────────┼──────────┼────────┼───────┼───────┼──────┼──────┼───────┼──────┤
Customer App  │    -     │   ✗    │   ✗   │   ✗   │  ✓   │  ✗   │   ✗   │  ✗   │
Doctor App    │    ✗     │   -    │   ✗   │   ✗   │  ✓   │  ✗   │   ✗   │  ✗   │
Technician    │    ✗     │   ✗    │   -   │   ✗   │  ✓   │  ✗   │   ✗   │  ✗   │
Admin Panel   │    ✗     │   ✗    │   ✗   │   -   │  ✓   │  ✗   │   ✗   │  ✗   │
API Server    │    ✓     │   ✓    │   ✓   │   ✓   │  -   │  ✓   │   ✓   │  ✓   │
AI Service    │    ✗     │   ✗    │   ✗   │   ✗   │  ✓   │  -   │   ✗   │  ✗   │
Queue Worker  │    ✗     │   ✗    │   ✗   │   ✗   │  ✓   │  ✓   │  -    │  ✓   │

✓ = Direct communication allowed
✗ = No direct communication (must go through API)
```

### 3.3 Application Boundaries

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MOBILE APPLICATIONS                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              SHARED FLUTTER CORE (lib/core/)                │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │    │
│  │  │ Network │ │  Cache  │ │ Session │ │  Error  │           │    │
│  │  │   Dio   │ │  Hive   │ │ Secure  │ │ Handling│           │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │  CUSTOMER   │  │   DOCTOR    │  │  TECHNICIAN │                  │
│  │    APP      │  │    APP      │  │    APP      │                  │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤                  │
│  │ • Profile   │  │ • Cases     │  │ • Tasks     │                  │
│  │ • Animals   │  │ • Treatment │  │ • Triage    │                  │
│  │ • Requests  │  │ • Prescribe │  │ • Handoff   │                  │
│  │ • Tracking  │  │ • Billing   │  │ • Reports   │                  │
│  │ • Payments  │  │ • Schedule  │  │ • Location  │                  │
│  │ • Support   │  │ • Earnings  │  │ • Support   │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Module Communication Flow

### 4.1 Service Request Lifecycle

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Customer   │     │     API      │     │    Doctor    │     │   Payment    │
│   Submits    │────▶│   Receives   │────▶│   Assigned   │────▶│   Processed  │
│   Request    │     │   Request    │     │   to Case    │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │                    │
       ▼                    ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Validation  │     │  Area-Based  │     │  Treatment   │     │  Commission  │
│  + Triage    │     │  Assignment  │     │  + Prescribe │     │  Calculation │
│  (AI Assist) │     │  Algorithm   │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### 4.2 Data Flow Patterns

```
Pattern 1: Synchronous Request-Response
┌────────┐         ┌─────────┐         ┌──────────┐
│ Client │ ──────▶ │   API   │ ──────▶ │ Database │
│        │ ◀────── │         │ ◀────── │          │
└────────┘         └─────────┘         └──────────┘

Pattern 2: Async with Queue (Future)
┌────────┐         ┌─────────┐         ┌─────────┐         ┌──────────┐
│ Client │ ──────▶ │   API   │ ──────▶ │  Queue  │ ──────▶ │  Worker  │
│        │ ◀────── │         │         │         │         │          │
└────────┘         └─────────┘         └─────────┘         └──────────┘
     │                                                            │
     └──────────────────── Notification ◀─────────────────────────┘

Pattern 3: Event-Driven (Future)
┌────────┐         ┌─────────┐         ┌─────────────┐
│ Client │ ──────▶ │   API   │ ──────▶ │ Event Bus   │
└────────┘         └─────────┘         └──────┬──────┘
                                              │
                   ┌──────────────────────────┼──────────────────────────┐
                   ▼                          ▼                          ▼
            ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
            │ Notification │          │   Billing    │          │   Analytics  │
            │   Service    │          │   Service    │          │   Service    │
            └──────────────┘          └──────────────┘          └──────────────┘
```

### 4.3 Module Dependency Graph

```
                           ┌────────────────┐
                           │     CORE       │
                           │   (Shared)     │
                           └───────┬────────┘
                                   │
           ┌───────────────────────┼───────────────────────┐
           │                       │                       │
           ▼                       ▼                       ▼
    ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
    │     AUTH     │       │   LOCATION   │       │   CONTENT    │
    │   Service    │       │   Service    │       │   Service    │
    └──────┬───────┘       └──────┬───────┘       └──────────────┘
           │                      │
           │    ┌─────────────────┴─────────────────┐
           │    │                                   │
           ▼    ▼                                   ▼
    ┌──────────────┐                        ┌──────────────┐
    │   SERVICE    │◀───────────────────────│    DOCTOR    │
    │   REQUEST    │                        │   Service    │
    └──────┬───────┘                        └──────┬───────┘
           │                                       │
           │    ┌──────────────────────────────────┘
           ▼    ▼
    ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
    │  TREATMENT   │──────▶│ PRESCRIPTION │──────▶│   BILLING    │
    │   Service    │       │   Service    │       │   Service    │
    └──────────────┘       └──────────────┘       └──────┬───────┘
                                                         │
                                                         ▼
                                                  ┌──────────────┐
                                                  │   PAYMENT    │
                                                  │   Service    │
                                                  └──────────────┘
```

---

## 5. API Gateway Structure

### 5.1 Route Namespace Design

```
/api
├── /admin                    # Admin panel endpoints
│   ├── /auth                 # Admin authentication
│   │   ├── POST /login       # Admin login
│   │   ├── POST /logout      # Admin logout
│   │   └── GET  /me          # Current admin
│   ├── /dashboard            # Dashboard data
│   ├── /users                # User management
│   ├── /doctors              # Doctor management
│   ├── /technicians          # Technician management
│   ├── /requests             # Request oversight
│   ├── /billing              # Financial management
│   ├── /areas                # Geography management
│   ├── /content              # Content management
│   ├── /reports              # Analytics/reports
│   └── /settings             # Platform settings
│
├── /mobile                   # Mobile app endpoints
│   ├── /auth                 # Mobile authentication
│   │   ├── POST /otp/request # Request OTP
│   │   ├── POST /otp/verify  # Verify OTP
│   │   └── POST /refresh     # Refresh token
│   │
│   ├── /customer             # Customer-specific
│   │   ├── /profile          # Profile management
│   │   ├── /animals          # Animal profiles
│   │   ├── /requests         # Service requests
│   │   ├── /notifications    # Notifications
│   │   └── /payments         # Payment history
│   │
│   ├── /doctor               # Doctor-specific
│   │   ├── /profile          # Doctor profile
│   │   ├── /cases            # Assigned cases
│   │   ├── /treatments       # Treatment records
│   │   ├── /prescriptions    # Prescriptions
│   │   ├── /billing          # Billing/earnings
│   │   └── /schedule         # Availability
│   │
│   ├── /technician           # Technician-specific
│   │   ├── /profile          # Technician profile
│   │   ├── /tasks            # Assigned tasks
│   │   └── /reports          # Field reports
│   │
│   └── /shared               # Shared endpoints
│       ├── /locations        # Geography lookup
│       ├── /categories       # Service categories
│       └── /content          # Educational content
│
├── /public                   # Public endpoints (rate-limited)
│   ├── /health               # Health check
│   ├── /version              # API version
│   └── /content              # Public content
│
├── /ai                       # AI service endpoints (internal)
│   ├── /triage               # Symptom triage
│   ├── /assign               # Assignment recommendation
│   └── /diagnose             # Diagnosis assistance
│
└── /webhook                  # External webhooks
    ├── /sms                  # SMS provider callbacks
    └── /payment              # Payment gateway callbacks
```

### 5.2 Middleware Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MIDDLEWARE PIPELINE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Request ──┬─────────────────────────────────────────────────────▶  │
│            │                                                         │
│            ▼                                                         │
│  ┌─────────────────────┐                                            │
│  │    Rate Limiter     │  ← IP-based, token bucket                  │
│  └──────────┬──────────┘                                            │
│             │                                                        │
│             ▼                                                        │
│  ┌─────────────────────┐                                            │
│  │   Request Logger    │  ← Structured logging (no PII)             │
│  └──────────┬──────────┘                                            │
│             │                                                        │
│             ▼                                                        │
│  ┌─────────────────────┐                                            │
│  │   CORS Handler      │  ← Origin validation                       │
│  └──────────┬──────────┘                                            │
│             │                                                        │
│             ▼                                                        │
│  ┌─────────────────────┐                                            │
│  │ Auth Middleware     │  ← JWT validation (route-specific)         │
│  │ • Admin JWT         │                                            │
│  │ • Mobile JWT        │                                            │
│  └──────────┬──────────┘                                            │
│             │                                                        │
│             ▼                                                        │
│  ┌─────────────────────┐                                            │
│  │  Role Authorizer    │  ← Permission check                        │
│  └──────────┬──────────┘                                            │
│             │                                                        │
│             ▼                                                        │
│  ┌─────────────────────┐                                            │
│  │  Request Validator  │  ← Zod schema validation                   │
│  └──────────┬──────────┘                                            │
│             │                                                        │
│             ▼                                                        │
│       Route Handler                                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Response Standardization

```typescript
// Success Response
{
  success: true,
  data: T,
  meta?: {
    page: number,
    pageSize: number,
    total: number,
    hasMore: boolean
  }
}

// Error Response
{
  success: false,
  error: {
    code: "ERROR_CODE",           // Machine-readable
    message: "বাংলায় বার্তা",      // Human-readable (Bengali)
    messageEn?: "English message", // Optional English
    details?: {                    // Field-level errors
      field: ["error1", "error2"]
    },
    traceId?: "uuid"              // For debugging (non-prod)
  }
}
```

---

## 6. Multi-Tenant Architecture

### 6.1 Current State: Single-Tenant

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SINGLE-TENANT MVP                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    pranidoctor.com                           │    │
│  │                                                              │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐               │    │
│  │  │ Customer  │  │  Doctor   │  │  Admin    │               │    │
│  │  │  Portal   │  │  Portal   │  │  Portal   │               │    │
│  │  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘               │    │
│  │        │              │              │                      │    │
│  │        └──────────────┼──────────────┘                      │    │
│  │                       │                                      │    │
│  │                       ▼                                      │    │
│  │           ┌───────────────────────┐                         │    │
│  │           │   Single Database     │                         │    │
│  │           │   pranidoctor_db      │                         │    │
│  │           └───────────────────────┘                         │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Future Multi-Tenant Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MULTI-TENANT FUTURE STATE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │
│  │  Tenant A     │  │  Tenant B     │  │  Tenant C     │           │
│  │  (Dhaka)      │  │  (Chittagong) │  │  (Rajshahi)   │           │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘           │
│          │                  │                  │                    │
│          └──────────────────┼──────────────────┘                    │
│                             │                                        │
│                             ▼                                        │
│              ┌──────────────────────────────┐                       │
│              │      API Gateway Layer       │                       │
│              │  (Tenant Resolution + Auth)  │                       │
│              └──────────────┬───────────────┘                       │
│                             │                                        │
│         ┌───────────────────┼───────────────────┐                   │
│         │                   │                   │                   │
│         ▼                   ▼                   ▼                   │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│  │  Shared     │     │  Schema per │     │  Database   │          │
│  │  Database   │ OR  │   Tenant    │ OR  │  per Tenant │          │
│  │  + tenantId │     │  (Postgres) │     │  (Isolated) │          │
│  └─────────────┘     └─────────────┘     └─────────────┘          │
│                                                                      │
│  Strategy Selection based on:                                        │
│  • Data isolation requirements                                       │
│  • Scale requirements                                               │
│  • Compliance needs                                                 │
│  • Operational complexity tolerance                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.3 Tenant Isolation Patterns

| Pattern | Description | Use When |
|---------|-------------|----------|
| **Row-Level** | `tenantId` on all tables | Low isolation needs, shared infra |
| **Schema-Level** | Postgres schema per tenant | Medium isolation, same DB |
| **Database-Level** | Separate database | High isolation, compliance |
| **Instance-Level** | Separate deployment | Maximum isolation |

### 6.4 Tenant Resolution Flow

```typescript
// Future: Tenant resolution middleware
async function resolveTenant(request: Request): Promise<Tenant> {
  // Priority order:
  // 1. Subdomain: dhaka.pranidoctor.com → tenant: dhaka
  // 2. Header: X-Tenant-ID
  // 3. JWT claim: tenantId in token
  // 4. Default tenant (single-tenant mode)
  
  const subdomain = extractSubdomain(request.url);
  if (subdomain && subdomain !== 'www') {
    return getTenantBySlug(subdomain);
  }
  
  const headerTenant = request.headers.get('X-Tenant-ID');
  if (headerTenant) {
    return getTenantById(headerTenant);
  }
  
  return getDefaultTenant();
}
```

---

## 7. Service Boundaries

### 7.1 Domain Service Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVICE DOMAINS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    CORE DOMAIN SERVICES                      │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │    │
│  │  │    AUTH      │  │   IDENTITY   │  │   LOCATION   │       │    │
│  │  │   Service    │  │   Service    │  │   Service    │       │    │
│  │  │              │  │              │  │              │       │    │
│  │  │ • OTP        │  │ • User       │  │ • Division   │       │    │
│  │  │ • JWT        │  │ • Profile    │  │ • District   │       │    │
│  │  │ • Session    │  │ • Role       │  │ • Upazila    │       │    │
│  │  │ • Refresh    │  │ • Permission │  │ • Union      │       │    │
│  │  └──────────────┘  └──────────────┘  │ • Village    │       │    │
│  │                                      └──────────────┘       │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                  BUSINESS DOMAIN SERVICES                    │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │    │
│  │  │   ANIMAL     │  │   SERVICE    │  │  TREATMENT   │       │    │
│  │  │   Service    │  │   REQUEST    │  │   Service    │       │    │
│  │  │              │  │   Service    │  │              │       │    │
│  │  │ • Profile    │  │              │  │ • Case       │       │    │
│  │  │ • Health     │  │ • Create     │  │ • Diagnosis  │       │    │
│  │  │ • History    │  │ • Assign     │  │ • Procedure  │       │    │
│  │  │ • Breeding   │  │ • Track      │  │ • Notes      │       │    │
│  │  └──────────────┘  │ • Complete   │  └──────────────┘       │    │
│  │                    │ • Cancel     │                         │    │
│  │                    └──────────────┘                         │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │    │
│  │  │ PRESCRIPTION │  │   BILLING    │  │   PAYMENT    │       │    │
│  │  │   Service    │  │   Service    │  │   Service    │       │    │
│  │  │              │  │              │  │              │       │    │
│  │  │ • Create     │  │ • Generate   │  │ • Process    │       │    │
│  │  │ • Items      │  │ • Commission │  │ • Gateway    │       │    │
│  │  │ • Validity   │  │ • Payout     │  │ • Reconcile  │       │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                  SUPPORTING SERVICES                         │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │    │
│  │  │ NOTIFICATION │  │   CONTENT    │  │    MEDIA     │       │    │
│  │  │   Service    │  │   Service    │  │   Service    │       │    │
│  │  │              │  │              │  │              │       │    │
│  │  │ • SMS        │  │ • Tutorial   │  │ • Upload     │       │    │
│  │  │ • Push       │  │ • Knowledge  │  │ • Process    │       │    │
│  │  │ • In-App     │  │ • FAQ        │  │ • Storage    │       │    │
│  │  │ • Email      │  │ • Localize   │  │ • CDN        │       │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     AI SERVICES                              │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │    │
│  │  │   TRIAGE     │  │  DIAGNOSIS   │  │  ASSIGNMENT  │       │    │
│  │  │   Service    │  │   Service    │  │   Service    │       │    │
│  │  │              │  │              │  │              │       │    │
│  │  │ • Urgency    │  │ • Symptoms   │  │ • Recommend  │       │    │
│  │  │ • Priority   │  │ • Analysis   │  │ • Optimize   │       │    │
│  │  │ • Route      │  │ • Suggest    │  │ • Load       │       │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐                         │    │
│  │  │    VOICE     │  │    CHAT      │                         │    │
│  │  │  Assistant   │  │   Assistant  │                         │    │
│  │  │              │  │              │                         │    │
│  │  │ • STT        │  │ • Support    │                         │    │
│  │  │ • Intent     │  │ • FAQ        │                         │    │
│  │  │ • TTS        │  │ • Escalate   │                         │    │
│  │  └──────────────┘  └──────────────┘                         │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Service Ownership Matrix

| Service | Data Owned | Dependencies | API Exposed |
|---------|------------|--------------|-------------|
| **Auth** | Session, OTP | Identity | Login, Logout, Verify |
| **Identity** | User, Profile | Location | CRUD Profiles |
| **Location** | Geography tree | None | Search, Lookup |
| **Animal** | AnimalProfile | Identity | CRUD Animals |
| **ServiceRequest** | Request, Assignment | Identity, Location, Animal | Request lifecycle |
| **Treatment** | TreatmentCase | ServiceRequest | Case management |
| **Prescription** | Prescription, Items | Treatment | Prescribe, View |
| **Billing** | BillingRecord | ServiceRequest, Treatment | Generate, Issue |
| **Payment** | PaymentRecord | Billing | Process, Reconcile |
| **Notification** | Notification | Identity | Send, Query |
| **Content** | ContentPost | Identity | CRUD Content |
| **Media** | File metadata | None | Upload, Serve |

### 7.3 Service Communication Rules

```
RULE: Services communicate via API, not direct DB access

✓ ALLOWED:
  ServiceRequest calls → Identity Service API → Get user data
  
✗ FORBIDDEN:
  ServiceRequest queries → User table directly
```

---

## 8. AI Orchestration Layer

### 8.1 AI Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      AI ORCHESTRATION LAYER                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    AI REQUEST ROUTER                         │    │
│  │                                                              │    │
│  │  Request → Classify → Route → Execute → Validate → Respond  │    │
│  │                                                              │    │
│  └───────────────────────────┬──────────────────────────────────┘    │
│                              │                                        │
│          ┌───────────────────┼───────────────────┐                   │
│          │                   │                   │                   │
│          ▼                   ▼                   ▼                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   TRIAGE     │    │  DIAGNOSIS   │    │  ASSIGNMENT  │          │
│  │   Pipeline   │    │   Pipeline   │    │   Pipeline   │          │
│  │              │    │              │    │              │          │
│  │ Input:       │    │ Input:       │    │ Input:       │          │
│  │ • Symptoms   │    │ • Symptoms   │    │ • Request    │          │
│  │ • Animal     │    │ • History    │    │ • Location   │          │
│  │ • Urgency    │    │ • Images     │    │ • Providers  │          │
│  │              │    │              │    │              │          │
│  │ Output:      │    │ Output:      │    │ Output:      │          │
│  │ • Priority   │    │ • Possible   │    │ • Ranked     │          │
│  │ • Routing    │    │   conditions │    │   providers  │          │
│  │ • ETA        │    │ • Confidence │    │ • Reasoning  │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    AI PROVIDER ABSTRACTION                   │    │
│  │                                                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │    │
│  │  │   OpenAI     │  │  Anthropic   │  │   Local      │       │    │
│  │  │   GPT-4      │  │   Claude     │  │   Llama      │       │    │
│  │  │   (Primary)  │  │  (Fallback)  │  │  (Future)    │       │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 AI Pipeline Architecture

```typescript
// AI Pipeline Interface
interface AiPipeline<TInput, TOutput> {
  name: string;
  version: string;
  
  // Pipeline stages
  preprocess(input: TInput): ProcessedInput;
  validate(input: ProcessedInput): ValidationResult;
  execute(input: ProcessedInput): Promise<RawOutput>;
  postprocess(raw: RawOutput): TOutput;
  
  // Safety
  getSafetyChecks(): SafetyCheck[];
  getHumanOverridePoints(): OverridePoint[];
}

// Example: Triage Pipeline
interface TriagePipeline extends AiPipeline<TriageInput, TriageOutput> {
  input: {
    symptoms: string[];
    animalType: AnimalType;
    urgencyIndicators: string[];
    customerNotes: string;
  };
  
  output: {
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    suggestedRequestType: ServiceRequestType;
    estimatedResponseTime: number; // minutes
    confidence: number; // 0-1
    reasoning: string;
    requiresHumanReview: boolean;
  };
}
```

### 8.3 AI Diagnosis Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AI DIAGNOSIS PIPELINE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. INPUT COLLECTION                                                 │
│     ┌─────────────────────────────────────────────────────────┐     │
│     │ • Symptom text (customer description)                   │     │
│     │ • Animal profile (species, age, weight, history)        │     │
│     │ • Images (optional symptom photos)                      │     │
│     │ • Geographic context (endemic diseases)                 │     │
│     │ • Seasonal factors                                      │     │
│     └─────────────────────────────────────────────────────────┘     │
│                              │                                        │
│                              ▼                                        │
│  2. PREPROCESSING                                                    │
│     ┌─────────────────────────────────────────────────────────┐     │
│     │ • Translate Bengali → English (if needed)               │     │
│     │ • Extract symptom keywords                              │     │
│     │ • Normalize animal data                                 │     │
│     │ • Process images (resize, analyze)                      │     │
│     └─────────────────────────────────────────────────────────┘     │
│                              │                                        │
│                              ▼                                        │
│  3. AI ANALYSIS                                                      │
│     ┌─────────────────────────────────────────────────────────┐     │
│     │ Prompt → LLM → Structured Response                      │     │
│     │                                                         │     │
│     │ System: Veterinary diagnostic assistant                 │     │
│     │ Context: Animal profile + symptoms + region             │     │
│     │ Task: Suggest possible conditions with confidence       │     │
│     │ Output: JSON with conditions, urgency, actions          │     │
│     └─────────────────────────────────────────────────────────┘     │
│                              │                                        │
│                              ▼                                        │
│  4. VALIDATION                                                       │
│     ┌─────────────────────────────────────────────────────────┐     │
│     │ • Check response structure                              │     │
│     │ • Validate confidence thresholds                        │     │
│     │ • Flag for human review if needed                       │     │
│     │ • Safety checks (dangerous conditions)                  │     │
│     └─────────────────────────────────────────────────────────┘     │
│                              │                                        │
│                              ▼                                        │
│  5. OUTPUT                                                           │
│     ┌─────────────────────────────────────────────────────────┐     │
│     │ {                                                       │     │
│     │   possibleConditions: [                                 │     │
│     │     { name: "Mastitis", confidence: 0.85 },            │     │
│     │     { name: "Milk Fever", confidence: 0.45 }           │     │
│     │   ],                                                    │     │
│     │   urgency: "HIGH",                                      │     │
│     │   recommendedAction: "Immediate veterinary visit",      │     │
│     │   humanReviewRequired: true                             │     │
│     │ }                                                       │     │
│     └─────────────────────────────────────────────────────────┘     │
│                                                                      │
│  CRITICAL: All diagnostic outputs require doctor confirmation        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.4 AI Cost Control

```typescript
interface AiCostConfig {
  // Per-user limits
  userDailyLimit: number;      // Max requests/day
  userMonthlyLimit: number;    // Max requests/month
  
  // Per-request limits
  maxInputTokens: number;      // Max input size
  maxOutputTokens: number;     // Max output size
  
  // Caching
  cacheEnabled: boolean;
  cacheTtlMinutes: number;
  
  // Fallback
  fallbackOnRateLimit: 'queue' | 'manual' | 'error';
}

// Default configuration
const AI_COST_CONFIG: AiCostConfig = {
  userDailyLimit: 50,
  userMonthlyLimit: 500,
  maxInputTokens: 2000,
  maxOutputTokens: 1000,
  cacheEnabled: true,
  cacheTtlMinutes: 60,
  fallbackOnRateLimit: 'queue'
};
```

---

## 9. Offline Synchronization

### 9.1 Offline Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      OFFLINE-FIRST ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    MOBILE APPLICATION                        │    │
│  │                                                              │    │
│  │  ┌───────────────────┐      ┌───────────────────┐           │    │
│  │  │   UI LAYER        │      │   CACHE LAYER     │           │    │
│  │  │   (Flutter)       │◀────▶│   (Hive)          │           │    │
│  │  └────────┬──────────┘      └────────┬──────────┘           │    │
│  │           │                          │                       │    │
│  │           ▼                          ▼                       │    │
│  │  ┌───────────────────────────────────────────────────┐      │    │
│  │  │              SYNC ENGINE                           │      │    │
│  │  │                                                    │      │    │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │      │    │
│  │  │  │  Outbox     │  │  Conflict   │  │  Network  │ │      │    │
│  │  │  │  Queue      │  │  Resolver   │  │  Monitor  │ │      │    │
│  │  │  └─────────────┘  └─────────────┘  └───────────┘ │      │    │
│  │  │                                                    │      │    │
│  │  └────────────────────────┬──────────────────────────┘      │    │
│  │                           │                                  │    │
│  └───────────────────────────┼──────────────────────────────────┘    │
│                              │                                        │
│                              │ (When Online)                          │
│                              ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                       API SERVER                             │    │
│  │                                                              │    │
│  │  ┌───────────────────────────────────────────────────┐      │    │
│  │  │              SYNC HANDLER                          │      │    │
│  │  │                                                    │      │    │
│  │  │  • Receive queued operations                      │      │    │
│  │  │  • Validate + apply changes                       │      │    │
│  │  │  • Return sync state + conflicts                  │      │    │
│  │  │  • Push updated data                              │      │    │
│  │  │                                                    │      │    │
│  │  └────────────────────────────────────────────────────┘      │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 Sync Data Classification

| Data Type | Offline Access | Sync Strategy | Conflict Resolution |
|-----------|---------------|---------------|---------------------|
| User profile | Full cache | Pull on login | Server wins |
| Animal profiles | Full cache | Bidirectional | Server wins + notify |
| Service requests | Recent 30 days | Pull + queue creates | Server wins |
| Request history | Full cache | Pull only | N/A (read-only) |
| Prescriptions | Full cache | Pull only | N/A (read-only) |
| Static content | Full cache | Pull on app start | Server wins |
| Location data | Full cache | Pull weekly | Server wins |
| Notifications | Last 100 | Pull only | N/A (read-only) |

### 9.3 Offline Operation Queue

```dart
// Offline operation model
class OfflineOperation {
  final String id;
  final String type;          // 'CREATE_REQUEST', 'UPDATE_PROFILE', etc.
  final DateTime createdAt;
  final Map<String, dynamic> payload;
  final int retryCount;
  final OperationStatus status;
  
  // Conflict handling
  final String? conflictingOperationId;
  final ConflictResolution? resolution;
}

enum OperationStatus {
  pending,      // Waiting for network
  syncing,      // Currently syncing
  completed,    // Successfully synced
  failed,       // Sync failed
  conflict,     // Conflict detected
}

enum ConflictResolution {
  serverWins,
  clientWins,
  merge,
  askUser,
}
```

### 9.4 Sync Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SYNC FLOW                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. TRIGGER                                                          │
│     ┌─────────────┐                                                 │
│     │ App Launch  │                                                 │
│     │ Network Up  │ → Check last sync → Initiate sync              │
│     │ User Action │                                                 │
│     │ Timer       │                                                 │
│     └─────────────┘                                                 │
│                                                                      │
│  2. UPLOAD (Client → Server)                                         │
│     ┌─────────────────────────────────────────────────────────┐     │
│     │ a. Read pending operations from outbox                  │     │
│     │ b. Sort by timestamp (oldest first)                     │     │
│     │ c. Send batch to server                                 │     │
│     │ d. Server applies changes, returns results              │     │
│     │ e. Mark operations complete or handle conflicts         │     │
│     └─────────────────────────────────────────────────────────┘     │
│                                                                      │
│  3. DOWNLOAD (Server → Client)                                       │
│     ┌─────────────────────────────────────────────────────────┐     │
│     │ a. Request changes since last sync timestamp            │     │
│     │ b. Receive delta updates                                │     │
│     │ c. Apply to local cache                                 │     │
│     │ d. Update last sync timestamp                           │     │
│     └─────────────────────────────────────────────────────────┘     │
│                                                                      │
│  4. CONFLICT HANDLING                                                │
│     ┌─────────────────────────────────────────────────────────┐     │
│     │ If server has newer version:                            │     │
│     │   → Non-critical: Server wins silently                  │     │
│     │   → Critical: Notify user of override                   │     │
│     │   → User data: Ask user which to keep                   │     │
│     └─────────────────────────────────────────────────────────┘     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. Security Architecture

### 10.1 Security Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SECURITY ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  LAYER 1: NETWORK SECURITY                                           │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ • TLS 1.3 for all connections                               │    │
│  │ • Certificate pinning (mobile apps)                         │    │
│  │ • DDoS protection (CDN/WAF)                                 │    │
│  │ • IP rate limiting                                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  LAYER 2: APPLICATION SECURITY                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ • JWT authentication (per-role secrets)                     │    │
│  │ • Role-based access control (RBAC)                          │    │
│  │ • Input validation (Zod schemas)                            │    │
│  │ • Output sanitization                                       │    │
│  │ • CSRF protection (admin panel)                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  LAYER 3: DATA SECURITY                                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ • Encryption at rest (database)                             │    │
│  │ • Encryption in transit (TLS)                               │    │
│  │ • PII masking in logs                                       │    │
│  │ • Secure credential storage (bcrypt)                        │    │
│  │ • Audit logging                                             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  LAYER 4: OPERATIONAL SECURITY                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ • Secret rotation procedures                                │    │
│  │ • Access audit trails                                       │    │
│  │ • Incident response plan                                    │    │
│  │ • Security monitoring/alerting                              │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.2 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MOBILE OTP AUTHENTICATION                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. REQUEST OTP                                                      │
│     ┌────────┐          ┌─────────┐          ┌─────────┐           │
│     │ Mobile │ ──────▶  │   API   │ ──────▶  │   SMS   │           │
│     │  App   │  phone   │ Server  │   OTP    │ Gateway │           │
│     └────────┘          └─────────┘          └─────────┘           │
│                              │                                       │
│                              ▼                                       │
│                         Store OTP                                    │
│                         (hashed, TTL: 5min)                         │
│                                                                      │
│  2. VERIFY OTP                                                       │
│     ┌────────┐          ┌─────────┐                                 │
│     │ Mobile │ ──────▶  │   API   │ ──────▶ Validate OTP            │
│     │  App   │ phone+OTP│ Server  │         + rate limit            │
│     └────────┘          └────┬────┘                                 │
│                              │                                       │
│                              ▼                                       │
│                    ┌─────────────────┐                              │
│                    │  Generate JWT   │                              │
│                    │  (role-specific)│                              │
│                    └────────┬────────┘                              │
│                             │                                        │
│                             ▼                                        │
│                    Return access_token                               │
│                    + refresh_token                                   │
│                                                                      │
│  3. ACCESS PROTECTED RESOURCE                                        │
│     ┌────────┐          ┌─────────┐                                 │
│     │ Mobile │ ──────▶  │   API   │ ──────▶ Validate JWT            │
│     │  App   │  Bearer  │ Server  │         + RBAC check            │
│     │        │  token   │         │                                  │
│     └────────┘          └─────────┘                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.3 Authorization Matrix

| Resource | CUSTOMER | DOCTOR | AI_TECHNICIAN | ADMIN | SUPER_ADMIN |
|----------|----------|--------|---------------|-------|-------------|
| Own profile | RW | RW | RW | RW | RW |
| Other profiles | - | - | - | R | RW |
| Own animals | CRUD | - | R | R | CRUD |
| All animals | - | R (assigned) | R (assigned) | R | CRUD |
| Service requests (own) | CRU | - | - | - | CRUD |
| Service requests (all) | - | R (assigned) | R (assigned) | RU | CRUD |
| Treatment records | R (own) | CRUD (own) | R (assigned) | R | CRUD |
| Billing records | R (own) | CRU (own) | R | RU | CRUD |
| Admin settings | - | - | - | R | RW |
| User management | - | - | - | CRU | CRUD |

```
R = Read, W = Write, C = Create, U = Update, D = Delete
```

### 10.4 Data Classification

| Classification | Examples | Access | Storage | Retention |
|----------------|----------|--------|---------|-----------|
| **Public** | Content, FAQ | Anyone | Standard | Indefinite |
| **Internal** | Aggregated stats | Staff | Standard | 3 years |
| **Confidential** | User profiles | Role-based | Encrypted | Account lifetime |
| **Restricted** | Medical records | Strict role | Encrypted | 7 years + legal |
| **Secret** | Credentials, keys | System only | Vault/HSM | Rotate annually |

---

## 11. Queue and Event Strategy

### 11.1 Queue Architecture (Future)

```
┌─────────────────────────────────────────────────────────────────────┐
│                       QUEUE ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    PRODUCER (API Server)                     │    │
│  │                                                              │    │
│  │  Event occurs → Create job → Push to queue                  │    │
│  │                                                              │    │
│  └───────────────────────────┬──────────────────────────────────┘    │
│                              │                                        │
│                              ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    REDIS + BULLMQ                            │    │
│  │                                                              │    │
│  │  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐   │    │
│  │  │  Notification  │  │     SMS        │  │    Email     │   │    │
│  │  │    Queue       │  │    Queue       │  │    Queue     │   │    │
│  │  │                │  │                │  │              │   │    │
│  │  │ Priority: HIGH │  │ Priority: HIGH │  │ Priority: LOW│   │    │
│  │  └────────────────┘  └────────────────┘  └──────────────┘   │    │
│  │                                                              │    │
│  │  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐   │    │
│  │  │      AI        │  │    Report      │  │    Billing   │   │    │
│  │  │    Queue       │  │    Queue       │  │    Queue     │   │    │
│  │  │                │  │                │  │              │   │    │
│  │  │ Priority: MED  │  │ Priority: LOW  │  │ Priority: MED│   │    │
│  │  └────────────────┘  └────────────────┘  └──────────────┘   │    │
│  │                                                              │    │
│  └───────────────────────────┬──────────────────────────────────┘    │
│                              │                                        │
│                              ▼                                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    WORKERS (Scalable)                        │    │
│  │                                                              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │    │
│  │  │ Worker 1 │  │ Worker 2 │  │ Worker 3 │  │ Worker N │    │    │
│  │  │ (Notif)  │  │  (SMS)   │  │  (AI)    │  │ (Mixed)  │    │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 11.2 Job Types

| Queue | Job Type | Priority | Retry | Timeout |
|-------|----------|----------|-------|---------|
| **notification** | Push notification | HIGH | 3 | 30s |
| **sms** | SMS message | HIGH | 5 | 60s |
| **email** | Email delivery | MEDIUM | 5 | 120s |
| **ai** | AI processing | MEDIUM | 2 | 300s |
| **billing** | Commission calc | MEDIUM | 3 | 60s |
| **report** | Report generation | LOW | 1 | 600s |
| **cleanup** | Data cleanup | LOW | 1 | 3600s |

### 11.3 Event Types (Future Event Bus)

```typescript
// Domain events for future event-driven architecture
type DomainEvent = 
  // Service Request events
  | { type: 'SERVICE_REQUEST_CREATED'; payload: ServiceRequestCreated }
  | { type: 'SERVICE_REQUEST_ASSIGNED'; payload: ServiceRequestAssigned }
  | { type: 'SERVICE_REQUEST_COMPLETED'; payload: ServiceRequestCompleted }
  | { type: 'SERVICE_REQUEST_CANCELLED'; payload: ServiceRequestCancelled }
  
  // Treatment events
  | { type: 'TREATMENT_STARTED'; payload: TreatmentStarted }
  | { type: 'TREATMENT_COMPLETED'; payload: TreatmentCompleted }
  | { type: 'PRESCRIPTION_CREATED'; payload: PrescriptionCreated }
  
  // Billing events
  | { type: 'BILLING_GENERATED'; payload: BillingGenerated }
  | { type: 'PAYMENT_RECEIVED'; payload: PaymentReceived }
  | { type: 'PAYOUT_PROCESSED'; payload: PayoutProcessed }
  
  // User events
  | { type: 'USER_REGISTERED'; payload: UserRegistered }
  | { type: 'DOCTOR_VERIFIED'; payload: DoctorVerified }
  | { type: 'LOCATION_UPDATED'; payload: LocationUpdated };
```

---

## 12. Media Upload Strategy

### 12.1 Upload Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      MEDIA UPLOAD FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐                                                     │
│  │   CLIENT    │                                                     │
│  │  (Mobile)   │                                                     │
│  └──────┬──────┘                                                     │
│         │                                                            │
│         │ 1. Request signed URL                                      │
│         ▼                                                            │
│  ┌─────────────┐                                                     │
│  │     API     │ ─────────────────────────────────────────┐         │
│  │   Server    │                                          │         │
│  └──────┬──────┘                                          │         │
│         │                                                 │         │
│         │ 2. Generate presigned URL                       │         │
│         │    (S3 PutObject, TTL: 15min)                  │         │
│         │                                                 │         │
│         ▼                                                 │         │
│  ┌─────────────┐                                          │         │
│  │   Return    │                                          │         │
│  │   {         │                                          │         │
│  │     uploadUrl,                                         │         │
│  │     fileKey,                                           │         │
│  │     expires                                            │         │
│  │   }         │                                          │         │
│  └──────┬──────┘                                          │         │
│         │                                                 │         │
│         │ 3. Client uploads directly to S3                │         │
│         ▼                                                 │         │
│  ┌─────────────┐                                          │         │
│  │     S3      │ ◀────────────────────────────────────────┘         │
│  │   Bucket    │                                                     │
│  └──────┬──────┘                                                     │
│         │                                                            │
│         │ 4. (Optional) S3 Event → Lambda → Process                  │
│         │    - Resize images                                         │
│         │    - Generate thumbnails                                   │
│         │    - Scan for malware                                      │
│         │                                                            │
│  ┌──────▼──────┐                                                     │
│  │  Processed  │                                                     │
│  │   Bucket    │                                                     │
│  └─────────────┘                                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 12.2 File Type Policies

| Type | Max Size | Allowed Formats | Processing |
|------|----------|-----------------|------------|
| Profile photo | 5 MB | jpg, png, webp | Resize to 512x512 |
| Animal photo | 10 MB | jpg, png, webp | Resize to 1920x1920 |
| Symptom image | 20 MB | jpg, png, webp | Keep original + thumb |
| Document | 20 MB | pdf, jpg, png | OCR (future) |
| Prescription scan | 20 MB | jpg, png, pdf | Archive only |

### 12.3 Storage Organization

```
s3://pranidoctor-media/
├── uploads/
│   └── {year}/{month}/{day}/
│       └── {uuid}.{ext}           # Raw uploads
│
├── processed/
│   ├── profiles/
│   │   └── {userId}/
│   │       └── avatar.webp        # Processed profile pics
│   │
│   ├── animals/
│   │   └── {animalId}/
│   │       └── {photoId}.webp     # Animal photos
│   │
│   └── requests/
│       └── {requestId}/
│           ├── original/          # Original symptom images
│           └── thumbnails/        # Generated thumbnails
│
└── archive/
    └── {year}/
        └── prescriptions/         # Long-term storage
```

---

## 13. Real-Time Communication

### 13.1 Real-Time Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    REAL-TIME COMMUNICATION                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  STRATEGY: Polling + Push Notifications (MVP)                        │
│            WebSocket (Future for chat/live tracking)                 │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   CURRENT APPROACH                           │    │
│  │                                                              │    │
│  │  ┌──────────────┐         ┌──────────────┐                  │    │
│  │  │    Mobile    │ ──────▶ │   REST API   │                  │    │
│  │  │     App      │  Poll   │   (GET)      │                  │    │
│  │  │              │  30s    │              │                  │    │
│  │  └──────────────┘         └──────────────┘                  │    │
│  │                                                              │    │
│  │  ┌──────────────┐         ┌──────────────┐                  │    │
│  │  │   Backend    │ ──────▶ │  FCM / APNs  │ ──────▶ Mobile  │    │
│  │  │   Event      │  Push   │   Gateway    │  Push   Device  │    │
│  │  └──────────────┘         └──────────────┘                  │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   FUTURE APPROACH                            │    │
│  │                                                              │    │
│  │  ┌──────────────┐         ┌──────────────┐                  │    │
│  │  │    Mobile    │ ◀─────▶ │  WebSocket   │                  │    │
│  │  │     App      │  WS     │   Server     │                  │    │
│  │  │              │         │   (Redis     │                  │    │
│  │  └──────────────┘         │   Pub/Sub)   │                  │    │
│  │                           └──────────────┘                  │    │
│  │                                                              │    │
│  │  Use cases:                                                  │    │
│  │  • Live location tracking                                    │    │
│  │  • Chat messages                                             │    │
│  │  • Real-time status updates                                  │    │
│  │  • Voice/video call signaling                                │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 13.2 WebSocket Events (Future)

```typescript
// WebSocket message types
type WSMessage =
  // Status updates
  | { type: 'REQUEST_STATUS_CHANGED'; data: { requestId: string; status: string } }
  | { type: 'PROVIDER_LOCATION_UPDATE'; data: { providerId: string; lat: number; lng: number } }
  
  // Chat
  | { type: 'CHAT_MESSAGE'; data: { conversationId: string; message: ChatMessage } }
  | { type: 'TYPING_INDICATOR'; data: { conversationId: string; userId: string } }
  
  // Calls
  | { type: 'CALL_INCOMING'; data: { callId: string; callerId: string } }
  | { type: 'CALL_ANSWERED'; data: { callId: string } }
  | { type: 'CALL_ENDED'; data: { callId: string; reason: string } }
  
  // Notifications
  | { type: 'NOTIFICATION'; data: Notification };
```

---

## 14. Notification Architecture

### 14.1 Notification Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    NOTIFICATION SERVICE                      │    │
│  │                                                              │    │
│  │  Event → Notification Service → Channel Router               │    │
│  │                                                              │    │
│  └───────────────────────────┬──────────────────────────────────┘    │
│                              │                                        │
│         ┌────────────────────┼────────────────────┐                  │
│         │                    │                    │                  │
│         ▼                    ▼                    ▼                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │     SMS      │    │    PUSH      │    │   IN-APP     │          │
│  │   Channel    │    │   Channel    │    │   Channel    │          │
│  │              │    │              │    │              │          │
│  │ • HTTP API   │    │ • FCM        │    │ • Database   │          │
│  │ • Rate limit │    │ • APNs       │    │ • WebSocket  │          │
│  │ • Retry      │    │ • Retry      │    │ • Polling    │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    NOTIFICATION PREFERENCES                  │    │
│  │                                                              │    │
│  │  User can control:                                          │    │
│  │  • SMS: On/Off (required for critical)                      │    │
│  │  • Push: On/Off                                             │    │
│  │  • In-App: Always on                                        │    │
│  │  • Quiet hours: 10pm - 7am (configurable)                   │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 14.2 Notification Types

| Type | SMS | Push | In-App | Template |
|------|-----|------|--------|----------|
| OTP Verification | ✓ | ✗ | ✗ | `otp_verification` |
| Request Submitted | ✓ | ✓ | ✓ | `request_submitted` |
| Request Assigned | ✓ | ✓ | ✓ | `request_assigned` |
| Provider En Route | ✗ | ✓ | ✓ | `provider_enroute` |
| Treatment Complete | ✓ | ✓ | ✓ | `treatment_complete` |
| Payment Received | ✓ | ✓ | ✓ | `payment_received` |
| New Message | ✗ | ✓ | ✓ | `new_message` |
| Emergency Alert | ✓ | ✓ | ✓ | `emergency_alert` |

### 14.3 Template System

```typescript
// Notification template structure
interface NotificationTemplate {
  id: string;
  channel: 'sms' | 'push' | 'inapp';
  language: 'bn' | 'en';
  titleTemplate: string;
  bodyTemplate: string;
  variables: string[];
}

// Example: Bengali SMS template
const smsRequestAssigned: NotificationTemplate = {
  id: 'request_assigned_sms_bn',
  channel: 'sms',
  language: 'bn',
  titleTemplate: '',
  bodyTemplate: 'প্রিয় {{customerName}}, আপনার অনুরোধ #{{requestId}} এ {{doctorName}} নিযুক্ত হয়েছেন। আনুমানিক আগমন: {{eta}}',
  variables: ['customerName', 'requestId', 'doctorName', 'eta']
};
```

---

## 15. Scalability Strategy

### 15.1 Scaling Roadmap

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SCALING ROADMAP                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PHASE 1: VERTICAL SCALING (Current → 10K users)                    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ • Optimize database queries                                 │    │
│  │ • Add database indexes                                      │    │
│  │ • Connection pooling (Prisma)                               │    │
│  │ • Response caching (Redis)                                  │    │
│  │ • Image optimization (CDN)                                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  PHASE 2: HORIZONTAL SCALING (10K → 100K users)                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ • Read replicas for database                                │    │
│  │ • Multiple API instances (load balanced)                    │    │
│  │ • Separate worker processes                                 │    │
│  │ • CDN for all static assets                                 │    │
│  │ • Queue-based background processing                         │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  PHASE 3: DISTRIBUTED SCALING (100K+ users)                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ • Database sharding (by region)                             │    │
│  │ • Microservice extraction                                   │    │
│  │ • Event-driven architecture                                 │    │
│  │ • Multi-region deployment                                   │    │
│  │ • Edge computing for location services                      │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 15.2 Bottleneck Analysis

| Component | Current Limit | Scaling Solution |
|-----------|---------------|------------------|
| Database connections | 100 | Connection pool + replicas |
| API throughput | 1000 req/s | Horizontal scaling |
| File storage | Unlimited | S3 (scales automatically) |
| SMS gateway | 100/min | Multiple providers |
| AI requests | 60/min | Caching + batching |

### 15.3 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API response time (p50) | < 100ms | New Relic/Datadog |
| API response time (p95) | < 500ms | New Relic/Datadog |
| API response time (p99) | < 2000ms | New Relic/Datadog |
| Database query time (p95) | < 50ms | Prisma metrics |
| Mobile app startup | < 3s | Firebase Performance |
| Image load time | < 1s | CDN analytics |

---

## 16. Infrastructure Planning

### 16.1 Environment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    DEVELOPMENT                               │    │
│  │                                                              │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐                      │    │
│  │  │  Local  │  │  Docker │  │  Local  │                      │    │
│  │  │  Next   │  │  Postgres│  │  Redis  │                      │    │
│  │  └─────────┘  └─────────┘  └─────────┘                      │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      STAGING                                 │    │
│  │                                                              │    │
│  │  ┌─────────────────────────────────────────────────────┐    │    │
│  │  │                  Vercel / Railway                   │    │    │
│  │  │                                                     │    │    │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐            │    │    │
│  │  │  │  Next   │  │  Neon   │  │  Upstash │            │    │    │
│  │  │  │  App    │  │ Postgres│  │  Redis   │            │    │    │
│  │  │  └─────────┘  └─────────┘  └─────────┘            │    │    │
│  │  │                                                     │    │    │
│  │  └─────────────────────────────────────────────────────┘    │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     PRODUCTION                               │    │
│  │                                                              │    │
│  │  ┌─────────────────────────────────────────────────────┐    │    │
│  │  │             AWS / GCP / Vercel                      │    │    │
│  │  │                                                     │    │    │
│  │  │  ┌──────────────────────────────────────────────┐  │    │    │
│  │  │  │               CDN / WAF                      │  │    │    │
│  │  │  │           (Cloudflare / AWS)                 │  │    │    │
│  │  │  └──────────────────────────────────────────────┘  │    │    │
│  │  │                       │                             │    │    │
│  │  │                       ▼                             │    │    │
│  │  │  ┌──────────────────────────────────────────────┐  │    │    │
│  │  │  │           Load Balancer                      │  │    │    │
│  │  │  └──────────────────────────────────────────────┘  │    │    │
│  │  │                       │                             │    │    │
│  │  │       ┌───────────────┼───────────────┐            │    │    │
│  │  │       ▼               ▼               ▼            │    │    │
│  │  │  ┌─────────┐    ┌─────────┐    ┌─────────┐        │    │    │
│  │  │  │  App 1  │    │  App 2  │    │  App N  │        │    │    │
│  │  │  │ (Next)  │    │ (Next)  │    │ (Next)  │        │    │    │
│  │  │  └─────────┘    └─────────┘    └─────────┘        │    │    │
│  │  │       │               │               │            │    │    │
│  │  │       └───────────────┼───────────────┘            │    │    │
│  │  │                       ▼                             │    │    │
│  │  │  ┌──────────────────────────────────────────────┐  │    │    │
│  │  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐      │  │    │    │
│  │  │  │  │ Primary │  │ Replica │  │  Redis  │      │  │    │    │
│  │  │  │  │   DB    │  │   DB    │  │  Cache  │      │  │    │    │
│  │  │  │  └─────────┘  └─────────┘  └─────────┘      │  │    │    │
│  │  │  │                                              │  │    │    │
│  │  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐      │  │    │    │
│  │  │  │  │   S3    │  │  Queue  │  │   AI    │      │  │    │    │
│  │  │  │  │ Storage │  │ Workers │  │ Service │      │  │    │    │
│  │  │  │  └─────────┘  └─────────┘  └─────────┘      │  │    │    │
│  │  │  │                                              │  │    │    │
│  │  │  └──────────────────────────────────────────────┘  │    │    │
│  │  │                                                     │    │    │
│  │  └─────────────────────────────────────────────────────┘    │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 16.2 Service Selection

| Service | Development | Staging | Production |
|---------|-------------|---------|------------|
| **Compute** | Local | Vercel/Railway | AWS ECS / Vercel |
| **Database** | Docker Postgres | Neon/Supabase | AWS RDS / Neon |
| **Cache** | Local Redis | Upstash | AWS ElastiCache |
| **Storage** | Local folder | AWS S3 | AWS S3 + CloudFront |
| **Queue** | In-memory | Upstash | AWS SQS / Redis |
| **Monitoring** | Console | Sentry | Datadog/New Relic |

---

## 17. Shared Services

### 17.1 Shared Service Catalog

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SHARED SERVICES                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                  AUTHENTICATION SERVICE                      │    │
│  │                                                              │    │
│  │  Functions:                                                  │    │
│  │  • OTP generation and validation                            │    │
│  │  • JWT token management                                     │    │
│  │  • Session management                                       │    │
│  │  • Role verification                                        │    │
│  │                                                              │    │
│  │  Consumers: All mobile apps, Admin panel                    │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   NOTIFICATION SERVICE                       │    │
│  │                                                              │    │
│  │  Functions:                                                  │    │
│  │  • SMS delivery                                             │    │
│  │  • Push notification delivery                               │    │
│  │  • In-app notification management                           │    │
│  │  • Template management                                      │    │
│  │                                                              │    │
│  │  Consumers: All business services                           │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    LOCATION SERVICE                          │    │
│  │                                                              │    │
│  │  Functions:                                                  │    │
│  │  • Geography hierarchy (Division → Village)                 │    │
│  │  • Area search and lookup                                   │    │
│  │  • Provider-area mapping                                    │    │
│  │  • Distance calculation                                     │    │
│  │                                                              │    │
│  │  Consumers: Request service, Assignment service             │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     MEDIA SERVICE                            │    │
│  │                                                              │    │
│  │  Functions:                                                  │    │
│  │  • Presigned URL generation                                 │    │
│  │  • Image processing (resize, optimize)                      │    │
│  │  • File metadata management                                 │    │
│  │  • CDN integration                                          │    │
│  │                                                              │    │
│  │  Consumers: All services needing file upload                │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     AUDIT SERVICE                            │    │
│  │                                                              │    │
│  │  Functions:                                                  │    │
│  │  • Activity logging                                         │    │
│  │  • Change tracking                                          │    │
│  │  • Compliance reporting                                     │    │
│  │  • Data access audit                                        │    │
│  │                                                              │    │
│  │  Consumers: All services (automatically)                    │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 18. Failure Handling Strategy

### 18.1 Failure Modes and Recovery

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FAILURE HANDLING MATRIX                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  COMPONENT FAILURES                                                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │  Database Down                                               │    │
│  │  → Detection: Health check fails                            │    │
│  │  → Impact: All writes blocked                               │    │
│  │  → Recovery: Failover to replica                            │    │
│  │  → User experience: Retry with exponential backoff          │    │
│  │                                                              │    │
│  │  Cache Down (Redis)                                          │    │
│  │  → Detection: Connection timeout                            │    │
│  │  → Impact: Slower responses                                 │    │
│  │  → Recovery: Bypass cache, direct DB access                 │    │
│  │  → User experience: Slightly slower, no data loss           │    │
│  │                                                              │    │
│  │  SMS Gateway Down                                            │    │
│  │  → Detection: API error / timeout                           │    │
│  │  → Impact: OTP not delivered                                │    │
│  │  → Recovery: Fallback to secondary provider                 │    │
│  │  → User experience: "Try again in 30s" + push notification │    │
│  │                                                              │    │
│  │  AI Service Down                                             │    │
│  │  → Detection: API error / timeout                           │    │
│  │  → Impact: No AI suggestions                                │    │
│  │  → Recovery: Graceful degradation to manual                 │    │
│  │  → User experience: Manual input instead of AI assist       │    │
│  │                                                              │    │
│  │  File Storage Down (S3)                                      │    │
│  │  → Detection: Upload fails                                  │    │
│  │  → Impact: Media upload blocked                             │    │
│  │  → Recovery: Queue upload, retry later                      │    │
│  │  → User experience: "Upload queued, will retry"            │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  DEGRADATION HIERARCHY                                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │  Level 1: Full Functionality                                 │    │
│  │           All services operational                          │    │
│  │                                                              │    │
│  │  Level 2: Reduced Functionality                              │    │
│  │           Core flows work, AI/media degraded                │    │
│  │                                                              │    │
│  │  Level 3: Critical Only                                      │    │
│  │           Emergency requests only                           │    │
│  │                                                              │    │
│  │  Level 4: Maintenance Mode                                   │    │
│  │           Read-only, static message                         │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 18.2 Circuit Breaker Pattern

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;     // Failures before opening
  successThreshold: number;     // Successes to close
  timeout: number;              // Time in open state (ms)
}

// Circuit breaker states
// CLOSED: Normal operation, requests flow through
// OPEN: Failures exceeded threshold, fast-fail all requests
// HALF-OPEN: Testing if service recovered

const defaultConfig: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 30000 // 30 seconds
};
```

---

## 19. Data Ownership Strategy

### 19.1 Data Domain Ownership

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA OWNERSHIP MAP                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    IDENTITY DOMAIN                           │    │
│  │                                                              │    │
│  │  Owner: Identity Service                                    │    │
│  │                                                              │    │
│  │  Tables:                                                    │    │
│  │  • User (auth data, role)                                   │    │
│  │  • AdminProfile                                             │    │
│  │  • CustomerProfile                                          │    │
│  │  • DoctorProfile                                            │    │
│  │  • AiTechnicianProfile                                      │    │
│  │                                                              │    │
│  │  Read access: All services (via API)                        │    │
│  │  Write access: Identity service only                        │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    GEOGRAPHY DOMAIN                          │    │
│  │                                                              │    │
│  │  Owner: Location Service                                    │    │
│  │                                                              │    │
│  │  Tables:                                                    │    │
│  │  • Division, District, Upazila, Union, Village              │    │
│  │  • DoctorServiceArea                                        │    │
│  │  • AiTechnicianServiceArea                                  │    │
│  │                                                              │    │
│  │  Read access: All services                                  │    │
│  │  Write access: Admin via Location service                   │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    SERVICE DOMAIN                            │    │
│  │                                                              │    │
│  │  Owner: Service Request Service                             │    │
│  │                                                              │    │
│  │  Tables:                                                    │    │
│  │  • AnimalProfile                                            │    │
│  │  • ServiceCategory                                          │    │
│  │  • ServiceRequest                                           │    │
│  │                                                              │    │
│  │  Read access: Identity (for assignment)                     │    │
│  │  Write access: Request service, Customer, Admin             │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   CLINICAL DOMAIN                            │    │
│  │                                                              │    │
│  │  Owner: Treatment Service                                   │    │
│  │                                                              │    │
│  │  Tables:                                                    │    │
│  │  • TreatmentCase                                            │    │
│  │  • Prescription                                             │    │
│  │  • PrescriptionItem                                         │    │
│  │                                                              │    │
│  │  Read access: Customer (own), Admin                         │    │
│  │  Write access: Doctor, Admin                                │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   FINANCIAL DOMAIN                           │    │
│  │                                                              │    │
│  │  Owner: Billing Service                                     │    │
│  │                                                              │    │
│  │  Tables:                                                    │    │
│  │  • BillingRecord                                            │    │
│  │  • PaymentRecord                                            │    │
│  │                                                              │    │
│  │  Read access: Customer (own), Doctor (own), Admin           │    │
│  │  Write access: Billing service, Payment webhook             │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 19.2 Data Lifecycle

| Data Type | Creation | Updates | Retention | Deletion |
|-----------|----------|---------|-----------|----------|
| User profile | Registration | Owner/Admin | Account lifetime | Account delete |
| Animal profile | Owner creates | Owner | Account lifetime | Soft delete |
| Service request | Customer creates | System/Provider | 7 years | Archive only |
| Treatment record | Doctor creates | Doctor/Admin | 7 years (legal) | Archive only |
| Billing record | System generates | System/Admin | 7 years (tax) | Archive only |
| Payment record | Payment gateway | Immutable | 7 years | Archive only |
| Audit log | System | Immutable | 3 years | Hard delete |

---

## 20. Future Microservice Separation

### 20.1 Extraction Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│               MICROSERVICE EXTRACTION ROADMAP                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  CURRENT: MODULAR MONOLITH                                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │         ┌────────────────────────────────────────┐          │    │
│  │         │          SINGLE DEPLOYMENT             │          │    │
│  │         │                                        │          │    │
│  │         │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │          │    │
│  │         │  │ Auth │ │ Svc  │ │ Bill │ │ AI   │ │          │    │
│  │         │  │      │ │ Req  │ │      │ │      │ │          │    │
│  │         │  └──────┘ └──────┘ └──────┘ └──────┘ │          │    │
│  │         │                                        │          │    │
│  │         │         ┌────────────────┐            │          │    │
│  │         │         │  Shared DB     │            │          │    │
│  │         │         └────────────────┘            │          │    │
│  │         │                                        │          │    │
│  │         └────────────────────────────────────────┘          │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  PHASE 1: EXTRACT NOTIFICATION SERVICE                              │
│  Trigger: High SMS volume, need independent scaling                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │  ┌─────────────────────────────────┐  ┌───────────────┐     │    │
│  │  │      MAIN APPLICATION           │  │ Notification  │     │    │
│  │  │                                 │  │   Service     │     │    │
│  │  │  ┌──────┐ ┌──────┐ ┌──────┐   │  │               │     │    │
│  │  │  │ Auth │ │ Svc  │ │ Bill │   │  │ • SMS         │     │    │
│  │  │  │      │ │ Req  │ │      │   │──│ • Push        │     │    │
│  │  │  └──────┘ └──────┘ └──────┘   │  │ • In-App      │     │    │
│  │  │                                 │  │               │     │    │
│  │  └─────────────────────────────────┘  └───────────────┘     │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  PHASE 2: EXTRACT AI SERVICE                                        │
│  Trigger: Compute-intensive, need GPU/specialized infra             │
│                                                                      │
│  PHASE 3: EXTRACT PAYMENT SERVICE                                   │
│  Trigger: PCI compliance, financial isolation requirements          │
│                                                                      │
│  PHASE 4: EXTRACT AUTH SERVICE                                      │
│  Trigger: Multi-app SSO, centralized identity                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 20.2 Service Extraction Checklist

```markdown
## Service Extraction Checklist

### Pre-Extraction
- [ ] Clear service boundary defined
- [ ] API contract documented (OpenAPI)
- [ ] Data ownership mapped
- [ ] Dependency graph analyzed
- [ ] Communication pattern chosen (sync/async)

### Extraction
- [ ] New repository created
- [ ] Database tables migrated (if owned)
- [ ] API endpoints implemented
- [ ] Authentication/authorization configured
- [ ] Logging/monitoring integrated

### Integration
- [ ] Old code updated to use new service API
- [ ] Feature flags for gradual rollout
- [ ] Circuit breaker configured
- [ ] Error handling tested

### Post-Extraction
- [ ] Performance baseline measured
- [ ] Documentation updated
- [ ] Team training completed
- [ ] Runbook created
```

---

## 21. Domain-Specific Subsystems

### 21.1 Farm Management System

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FARM MANAGEMENT SUBSYSTEM                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    DAIRY MANAGEMENT                          │    │
│  │                                                              │    │
│  │  Features:                                                   │    │
│  │  • Milk production tracking                                 │    │
│  │  • Breeding calendar                                        │    │
│  │  • Cattle health records                                    │    │
│  │  • Feed management                                          │    │
│  │  • Financial tracking                                       │    │
│  │                                                              │    │
│  │  Data models:                                               │    │
│  │  • DairyAnimal (extends AnimalProfile)                      │    │
│  │  • MilkRecord                                               │    │
│  │  • BreedingRecord                                           │    │
│  │  • FeedRecord                                               │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   FATTENING MANAGEMENT                       │    │
│  │                                                              │    │
│  │  Features:                                                   │    │
│  │  • Weight tracking                                          │    │
│  │  • Growth projections                                       │    │
│  │  • Feed cost optimization                                   │    │
│  │  • Sale planning                                            │    │
│  │  • Profit calculation                                       │    │
│  │                                                              │    │
│  │  Data models:                                               │    │
│  │  • FatteningAnimal (extends AnimalProfile)                  │    │
│  │  • WeightRecord                                             │    │
│  │  • FatteningBatch                                           │    │
│  │  • SaleRecord                                               │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    POULTRY MANAGEMENT                        │    │
│  │                                                              │    │
│  │  Features:                                                   │    │
│  │  • Flock management                                         │    │
│  │  • Egg production tracking                                  │    │
│  │  • Mortality tracking                                       │    │
│  │  • Vaccination schedules                                    │    │
│  │  • Batch profitability                                      │    │
│  │                                                              │    │
│  │  Data models:                                               │    │
│  │  • PoultryFlock                                             │    │
│  │  • EggProductionRecord                                      │    │
│  │  • FlockMortalityRecord                                     │    │
│  │  • VaccinationRecord                                        │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 21.2 Emergency System

```
┌─────────────────────────────────────────────────────────────────────┐
│                      EMERGENCY SYSTEM                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    EMERGENCY FLOW                            │    │
│  │                                                              │    │
│  │  1. DETECTION                                                │    │
│  │     • Customer marks request as emergency                   │    │
│  │     • AI triage flags critical symptoms                     │    │
│  │     • Time-sensitive conditions detected                    │    │
│  │                                                              │    │
│  │  2. PRIORITIZATION                                           │    │
│  │     • Emergency queue (separate from normal)                │    │
│  │     • Bypass normal assignment queue                        │    │
│  │     • Expand search radius automatically                    │    │
│  │                                                              │    │
│  │  3. NOTIFICATION                                             │    │
│  │     • SMS + Push to all available providers in area         │    │
│  │     • Admin dashboard alert                                 │    │
│  │     • Escalation timer (15min → expand radius)              │    │
│  │                                                              │    │
│  │  4. TRACKING                                                 │    │
│  │     • Real-time status updates                              │    │
│  │     • Provider location tracking                            │    │
│  │     • ETA calculation                                       │    │
│  │                                                              │    │
│  │  5. COMPLETION                                               │    │
│  │     • Emergency fee applied (if configured)                 │    │
│  │     • Detailed incident report                              │    │
│  │     • Analytics capture                                     │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 21.3 Telemedicine System

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TELEMEDICINE SYSTEM (Future)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    COMPONENTS                                │    │
│  │                                                              │    │
│  │  ┌──────────────────┐  ┌──────────────────┐                 │    │
│  │  │  Video Call      │  │  Chat/Messaging  │                 │    │
│  │  │  Service         │  │  Service         │                 │    │
│  │  │                  │  │                  │                 │    │
│  │  │  • WebRTC        │  │  • Real-time     │                 │    │
│  │  │  • TURN server   │  │  • History       │                 │    │
│  │  │  • Recording     │  │  • Attachments   │                 │    │
│  │  └──────────────────┘  └──────────────────┘                 │    │
│  │                                                              │    │
│  │  ┌──────────────────┐  ┌──────────────────┐                 │    │
│  │  │  Scheduling      │  │  Medical Records │                 │    │
│  │  │  Service         │  │  Sharing         │                 │    │
│  │  │                  │  │                  │                 │    │
│  │  │  • Appointment   │  │  • View history  │                 │    │
│  │  │  • Calendar      │  │  • Share images  │                 │    │
│  │  │  • Reminders     │  │  • Past scripts  │                 │    │
│  │  └──────────────────┘  └──────────────────┘                 │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Integration with: ServiceRequest (type: ONLINE_CONSULTATION)       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 21.4 Voice Assistant System

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VOICE ASSISTANT SYSTEM (Future)                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    VOICE PIPELINE                            │    │
│  │                                                              │    │
│  │  1. SPEECH-TO-TEXT                                           │    │
│  │     • Bengali speech recognition                            │    │
│  │     • Noise filtering (farm environment)                    │    │
│  │     • Dialect handling                                      │    │
│  │                                                              │    │
│  │  2. INTENT RECOGNITION                                       │    │
│  │     • Command classification                                │    │
│  │     • Entity extraction (animal, symptom)                   │    │
│  │     • Context awareness                                     │    │
│  │                                                              │    │
│  │  3. ACTION EXECUTION                                         │    │
│  │     • Map intent to API call                                │    │
│  │     • Execute with confirmation                             │    │
│  │     • Handle multi-turn dialogs                             │    │
│  │                                                              │    │
│  │  4. TEXT-TO-SPEECH                                           │    │
│  │     • Bengali speech synthesis                              │    │
│  │     • Natural voice                                         │    │
│  │     • Clear pronunciation                                   │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Use cases:                                                          │
│  • "আমার গরুর জ্বর, ডাক্তার পাঠান" → Create emergency request       │
│  • "আজকের দুধের পরিমাণ লিখো" → Record milk production              │
│  • "আমার পরবর্তী অ্যাপয়েন্টমেন্ট কবে?" → Query appointments        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 21.5 Marketplace System (Future)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    MARKETPLACE SYSTEM (Future)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    COMPONENTS                                │    │
│  │                                                              │    │
│  │  ┌──────────────────┐  ┌──────────────────┐                 │    │
│  │  │  Product         │  │  Order           │                 │    │
│  │  │  Catalog         │  │  Management      │                 │    │
│  │  │                  │  │                  │                 │    │
│  │  │  • Medicines     │  │  • Cart          │                 │    │
│  │  │  • Feed          │  │  • Checkout      │                 │    │
│  │  │  • Equipment     │  │  • Tracking      │                 │    │
│  │  │  • Vaccines      │  │  • Returns       │                 │    │
│  │  └──────────────────┘  └──────────────────┘                 │    │
│  │                                                              │    │
│  │  ┌──────────────────┐  ┌──────────────────┐                 │    │
│  │  │  Vendor          │  │  Delivery        │                 │    │
│  │  │  Management      │  │  Integration     │                 │    │
│  │  │                  │  │                  │                 │    │
│  │  │  • Onboarding    │  │  • Courier API   │                 │    │
│  │  │  • Inventory     │  │  • Tracking      │                 │    │
│  │  │  • Payout        │  │  • COD handling  │                 │    │
│  │  └──────────────────┘  └──────────────────┘                 │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Integration:                                                        │
│  • Prescription → Medicine recommendation                           │
│  • Farm profile → Feed recommendation                               │
│  • Location → Delivery estimation                                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 22. Integration Points

### 22.1 External System Integrations

| System | Type | Purpose | Status |
|--------|------|---------|--------|
| SMS Gateway | HTTP API | OTP, notifications | Active |
| FCM/APNs | SDK | Push notifications | Planned |
| Payment Gateway | HTTP API | Payment processing | Planned |
| S3 | SDK | File storage | Active |
| OpenAI | HTTP API | AI services | Planned |
| Anthropic | HTTP API | AI fallback | Planned |
| Maps API | HTTP API | Location services | Planned |

### 22.2 Integration Patterns

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INTEGRATION PATTERNS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PATTERN 1: SYNC REQUEST-RESPONSE                                   │
│  Use: Payment verification, real-time data                          │
│  ┌────────┐         ┌─────────┐         ┌──────────┐               │
│  │  API   │ ──────▶ │ Gateway │ ──────▶ │ External │               │
│  │        │ ◀────── │         │ ◀────── │  System  │               │
│  └────────┘         └─────────┘         └──────────┘               │
│                                                                      │
│  PATTERN 2: ASYNC WITH CALLBACK                                     │
│  Use: SMS delivery, payment processing                              │
│  ┌────────┐         ┌─────────┐         ┌──────────┐               │
│  │  API   │ ──────▶ │ Gateway │ ──────▶ │ External │               │
│  │        │         │         │         │  System  │               │
│  └────────┘         └─────────┘         └──────────┘               │
│      │                                        │                     │
│      └─────────────── Webhook ◀───────────────┘                     │
│                                                                      │
│  PATTERN 3: FIRE AND FORGET WITH QUEUE                              │
│  Use: Notifications, non-critical updates                           │
│  ┌────────┐         ┌─────────┐         ┌──────────┐               │
│  │  API   │ ──────▶ │  Queue  │ ──────▶ │  Worker  │ → External   │
│  └────────┘         └─────────┘         └──────────┘               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 23. Architecture Decision Summary

### 23.1 Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Architecture style** | Modular monolith | Simpler to start, can extract later |
| **API style** | REST | Widely understood, Flutter support |
| **Database** | PostgreSQL | ACID, JSON support, ecosystem |
| **Mobile framework** | Flutter | Cross-platform, single codebase |
| **State management** | Riverpod | Modern, testable, type-safe |
| **Auth** | JWT + OTP | Stateless, mobile-friendly |
| **File storage** | S3 | Scalable, cost-effective |
| **AI approach** | Provider abstraction | Flexibility, cost control |
| **Offline strategy** | Local-first | Rural network conditions |

### 23.2 Trade-offs Accepted

| Trade-off | Accepted Limitation | Mitigating Factors |
|-----------|---------------------|-------------------|
| **Monolith** | Single deployment unit | Clear module boundaries |
| **Polling** | Not true real-time | Push notifications supplement |
| **REST** | Less efficient than gRPC | Simpler, browser-compatible |
| **PostgreSQL** | Not infinitely scalable | Sufficient for target scale |
| **Server-wins sync** | May lose offline edits | User notification on conflict |

### 23.3 Architecture Principles Checklist

```
✓ Single source of truth (Prisma schema)
✓ API-first design (mobile + admin same API)
✓ Offline-first mobile (Hive cache)
✓ AI-assisted, human-verified
✓ Modular boundaries (feature isolation)
✓ Security in depth (middleware + route + DB)
✓ Graceful degradation (fallbacks defined)
✓ Observable system (logging + monitoring)
✓ Future-ready (microservice extraction path)
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Architecture Team | Initial release |

---

## Related Documents

| Document | Location |
|----------|----------|
| Master System Rules | `docs/core/MASTER_SYSTEM_RULES.md` |
| Database Schema Plan | `docs/DATABASE_SCHEMA_PLAN.md` |
| Prisma Migration Rules | `docs/PRISMA_MIGRATION_RULES.md` |
| Admin UI Design Rules | `docs/ADMIN_UI_DESIGN_RULES.md` |
| API Documentation | `docs/api/` |

---

*End of SYSTEM_ARCHITECTURE.md*
