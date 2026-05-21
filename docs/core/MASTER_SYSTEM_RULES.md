# MASTER SYSTEM RULES — Prani Doctor Ecosystem

**Version:** 1.0.0  
**Effective:** 2026-05-21  
**Scope:** Backend (Next.js), Mobile (Flutter), AI Services, DevOps, Documentation  
**Enforcement:** Cursor AI agents, human engineers, CI pipelines

---

## Table of Contents

1. [Project Identity](#1-project-identity)
2. [Architecture Governance](#2-architecture-governance)
3. [Backend Architecture Rules](#3-backend-architecture-rules)
4. [Flutter Architecture Rules](#4-flutter-architecture-rules)
5. [API Standards](#5-api-standards)
6. [Database Rules](#6-database-rules)
7. [Security Standards](#7-security-standards)
8. [AI Architecture Rules](#8-ai-architecture-rules)
9. [AI Provider Abstraction](#9-ai-provider-abstraction)
10. [Cost Optimization Strategy](#10-cost-optimization-strategy)
11. [Multi-Tenant Principles](#11-multi-tenant-principles)
12. [Modular Architecture Enforcement](#12-modular-architecture-enforcement)
13. [Naming Conventions](#13-naming-conventions)
14. [Folder Strategy](#14-folder-strategy)
15. [Documentation Rules](#15-documentation-rules)
16. [Cursor AI Behavior Rules](#16-cursor-ai-behavior-rules)
17. [Agent Execution Workflow](#17-agent-execution-workflow)
18. [Planning-First Workflow](#18-planning-first-workflow)
19. [Emergency System Standards](#19-emergency-system-standards)
20. [Offline-First Philosophy](#20-offline-first-philosophy)
21. [DevOps Standards](#21-devops-standards)
22. [Docker Rules](#22-docker-rules)
23. [CI/CD Rules](#23-cicd-rules)
24. [Environment Management](#24-environment-management)
25. [Git Workflow](#25-git-workflow)
26. [Error Handling Standards](#26-error-handling-standards)
27. [Logging Standards](#27-logging-standards)
28. [Monitoring Standards](#28-monitoring-standards)
29. [Feature Module Isolation](#29-feature-module-isolation)
30. [Shared Package Strategy](#30-shared-package-strategy)
31. [Scalability Rules](#31-scalability-rules)
32. [Event-Driven Architecture Preparation](#32-event-driven-architecture-preparation)
33. [Microservice Readiness](#33-microservice-readiness)
34. [Decision Records](#34-decision-records)
35. [Compliance Matrix](#35-compliance-matrix)

---

## 1. Project Identity

### 1.1 Isolation Rule

| Rule | Enforcement |
|------|-------------|
| **NEVER** mix Prani Doctor with BPA, WPA, Quarbani, or any other project | Hard block |
| Schema, naming, business rules must be Prani Doctor-specific | Mandatory |
| Cross-project code sharing requires explicit architecture review | Exception only |

### 1.2 Domain Context

| Attribute | Value |
|-----------|-------|
| **Product** | Veterinary service platform for Bangladesh |
| **Domain** | pranidoctor.com |
| **Primary Language** | Bengali (বাংলা) with English technical terms |
| **Currency** | BDT (Bangladeshi Taka) |
| **Geography Model** | Division → District → Upazila → Union → Village |

### 1.3 Core User Roles

| Role | System Key | Access Level |
|------|------------|--------------|
| Super Admin | `SUPER_ADMIN` | Full platform control |
| Admin | `ADMIN` | Operations management |
| Doctor | `DOCTOR` | Clinical workflow |
| AI Technician | `AI_TECHNICIAN` | Field coordination |
| Customer | `CUSTOMER` | Service consumer |
| Support | `SUPPORT` | Customer assistance |

---

## 2. Architecture Governance

### 2.1 Technology Stack (Immutable)

| Layer | Technology | Version Constraint |
|-------|------------|-------------------|
| **Web/Admin/API** | Next.js (App Router) | 16.x+ |
| **Mobile** | Flutter | Latest stable |
| **Database** | PostgreSQL | 16+ |
| **ORM** | Prisma | 7.x+ |
| **State (Flutter)** | Riverpod | Latest |
| **Routing (Flutter)** | go_router | Latest |
| **HTTP (Flutter)** | Dio | Latest |

### 2.2 Architecture Decision Authority

| Decision Type | Authority | Documentation Required |
|---------------|-----------|----------------------|
| Stack change | Lead architect + product owner | ADR in `docs/decisions/` |
| New dependency | Senior engineer | PR justification |
| Schema change | Database owner | `docs/DATABASE_SCHEMA_PLAN.md` update |
| API contract change | API owner | Contract versioning |
| Security change | Security review | Threat model update |

### 2.3 Architecture Principles

```
PRINCIPLE-001: Single Source of Truth
  → Prisma schema is the database truth
  → API contracts are the integration truth
  → This document is the governance truth

PRINCIPLE-002: Separation of Concerns
  → Admin routes: /api/admin/*
  → Mobile routes: /api/mobile/*
  → Public routes: /api/public/*

PRINCIPLE-003: Defense in Depth
  → Middleware layer authentication
  → Route handler authorization
  → Database-level constraints
```

---

## 3. Backend Architecture Rules

### 3.1 Next.js App Router Structure

```
src/
├── app/
│   ├── (public)/           # Public pages (no auth)
│   ├── admin/
│   │   ├── (dashboard)/    # Protected admin pages
│   │   └── login/          # Admin login (unprotected)
│   └── api/
│       ├── admin/          # Admin-only APIs
│       ├── mobile/         # Mobile app APIs
│       └── public/         # Open APIs (rate-limited)
├── components/
│   ├── admin-ui/           # Admin design system
│   └── shared/             # Cross-context components
├── lib/
│   ├── admin-auth/         # Admin JWT handling
│   ├── mobile-auth/        # Mobile OTP handling
│   ├── prisma.ts           # Prisma client singleton
│   └── utils/              # Shared utilities
└── generated/
    └── prisma/             # Generated Prisma client
```

### 3.2 API Route Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| API-001 | All `/api/admin/*` routes require admin JWT | Middleware |
| API-002 | All `/api/mobile/*` routes require mobile token | Route guard |
| API-003 | Response shape: `{ success, data?, error?, message? }` | Linting |
| API-004 | Error responses include `code` field | Mandatory |
| API-005 | Pagination: list in `data[]`, counts in `meta: { total, page, pageSize, hasMore }` | Standard (see `API_CONTRACT_V1.md` §4) |

### 3.3 Server Action Rules

```typescript
// ALLOWED: Server actions in app/actions/
'use server'
export async function createServiceRequest(data: FormData) { }

// FORBIDDEN: Server actions in components
// FORBIDDEN: Server actions without validation
// FORBIDDEN: Server actions without auth check
```

### 3.4 Data Fetching Patterns

| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| Server Component | Initial page load | Direct Prisma calls |
| Route Handler | Client mutations | `/api/*` endpoints |
| Server Action | Form submissions | `'use server'` functions |

---

## 4. Flutter Architecture Rules

### 4.1 Project Structure

```
lib/
├── app/
│   ├── app.dart            # MaterialApp root
│   ├── app_env.dart        # Environment config
│   ├── app_startup.dart    # Initialization
│   └── bootstrap.dart      # Provider scope setup
├── core/
│   ├── cache/              # Hive/local storage
│   ├── error/              # Exception handling
│   ├── models/             # Shared DTOs
│   ├── network/            # Dio configuration
│   └── session/            # Auth state management
├── features/
│   └── [feature_name]/
│       ├── data/           # Repository implementations
│       ├── domain/         # Business logic (optional)
│       └── presentation/   # Widgets and pages
├── l10n/                   # Localization
├── routing/                # go_router configuration
└── theme/                  # App theming
```

### 4.2 Feature Module Contract

```dart
// REQUIRED: Each feature module must have:
// 1. Entry page: [feature]_page.dart
// 2. Route constant in app_routes.dart
// 3. Provider registration if stateful

// FORBIDDEN:
// - Cross-feature direct imports (use core/)
// - Business logic in presentation layer
// - Network calls in widgets
```

### 4.3 State Management Rules

| Rule ID | Rule |
|---------|------|
| FLUTTER-001 | Use Riverpod for all async state |
| FLUTTER-002 | Session state via `SessionController` only |
| FLUTTER-003 | Local-first with sync via `CacheStore` |
| FLUTTER-004 | No `setState` for data fetching |
| FLUTTER-005 | Error states via `ApiResult<T>` |

### 4.4 Navigation Rules

```dart
// ALLOWED: Named routes via go_router
context.go(AppRoutes.home);
context.push(AppRoutes.serviceDetail, extra: serviceId);

// FORBIDDEN: Direct Navigator calls
// FORBIDDEN: Hardcoded route strings in widgets
```

---

## 5. API Standards

### 5.1 Endpoint Naming

| Resource | GET (list) | GET (single) | POST | PUT | DELETE |
|----------|------------|--------------|------|-----|--------|
| Service Request | `/requests` | `/requests/:id` | `/requests` | `/requests/:id` | `/requests/:id` |
| Animal Profile | `/animals` | `/animals/:id` | `/animals` | `/animals/:id` | `/animals/:id` |

### 5.2 Request/Response Contract

```typescript
// Standard success response
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: { total: number; page: number; pageSize: number };
}

// Standard error response
interface ApiError {
  success: false;
  error: {
    code: string;      // Machine-readable: "VALIDATION_ERROR"
    message: string;   // Human-readable (Bengali preferred)
    details?: object;  // Field-level errors
  };
}
```

### 5.3 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success with body |
| 201 | Resource created |
| 204 | Success, no content |
| 400 | Validation error |
| 401 | Authentication required |
| 403 | Authorization denied |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable entity |
| 500 | Server error (log alert) |

### 5.4 Versioning Strategy

```
Current: /api/mobile/* (v1 implicit)
Future:  /api/v2/mobile/* (when breaking changes needed)

Rule: v1 endpoints remain stable for 12 months after v2 release
```

---

## 6. Database Rules

### 6.1 Migration Rules (from PRISMA_MIGRATION_RULES.md)

| Rule | Description |
|------|-------------|
| NEVER edit applied migration | Checksums break deployment |
| Additive-first changes | Add columns nullable, backfill, then constrain |
| `npm run db:deploy:safe` | Required for all non-dev deployments |
| Backup before repair | `pg_dump` before `migrate resolve` |

### 6.2 Schema Conventions

| Convention | Example |
|------------|---------|
| Model names | PascalCase: `ServiceRequest` |
| Field names | camelCase: `assignedDoctorId` |
| Enum values | SCREAMING_SNAKE: `IN_PROGRESS` |
| Junction tables | `DoctorServiceArea` |
| Timestamps | `createdAt`, `updatedAt` (auto) |

### 6.3 Index Strategy

```prisma
// REQUIRED indexes:
// - Foreign keys
// - Status fields used in filters
// - Composite indexes for common queries

@@index([customerId])
@@index([status])
@@index([areaId, serviceCategoryId])
@@index([assignedDoctorId, status])
```

### 6.4 Money Fields

```prisma
// ALL monetary values:
serviceFee     Decimal @db.Decimal(14, 2)
platformCommission Decimal @db.Decimal(14, 2)

// Currency stored per record (default: BDT)
currency String @default("BDT")
```

---

## 7. Security Standards

### 7.1 Authentication Matrix

| Context | Method | Token Location | Lifetime |
|---------|--------|----------------|----------|
| Admin Panel | JWT | HttpOnly cookie | 24h |
| Mobile Customer | JWT | Authorization header | 7d |
| Mobile Doctor | JWT | Authorization header | 7d |
| Mobile Technician | JWT | Authorization header | 7d |

### 7.2 Secret Management

| Rule | Implementation |
|------|----------------|
| JWT secrets ≥ 32 chars | Enforced in code |
| Per-role secrets | `ADMIN_JWT_SECRET`, `MOBILE_JWT_SECRET`, etc. |
| Never commit `.env` | `.gitignore` enforced |
| Rotate on exposure | Documented procedure required |

### 7.3 Input Validation

```typescript
// ALL user input:
// 1. Zod schema validation at API boundary
// 2. Prisma type safety at DB layer
// 3. Sanitization for HTML output

import { z } from 'zod';
const schema = z.object({
  phone: z.string().regex(/^01[3-9]\d{8}$/), // BD mobile
  amount: z.number().positive().max(1000000),
});
```

### 7.4 Authorization Rules

```
RULE: Role-based access enforced at route level

/api/admin/* → ADMIN | SUPER_ADMIN
/api/mobile/doctor/* → DOCTOR
/api/mobile/customer/* → CUSTOMER
/api/mobile/technician/* → AI_TECHNICIAN
```

### 7.5 Data Protection

| Data Type | Protection |
|-----------|------------|
| Passwords | bcrypt hash (cost 12) |
| Phone numbers | Visible only to assigned parties |
| Medical records | Role-restricted queries |
| Financial data | Audit log on access |

---

## 8. AI Architecture Rules

### 8.1 AI Integration Principles

```
PRINCIPLE: AI assists, humans decide

- AI suggestions require human confirmation for clinical decisions
- AI can automate administrative tasks autonomously
- AI must log all actions for audit trail
- AI errors must fail gracefully to manual workflow
```

### 8.2 AI Service Boundaries

| Service | AI Role | Human Override |
|---------|---------|----------------|
| Symptom triage | Urgency suggestion | Doctor final call |
| Assignment | Provider recommendation | Admin can reassign |
| Content | Draft generation | Editor approval |
| Support | First-response | Escalation to human |

### 8.3 AI Data Handling

```
RULE: AI services receive minimum necessary data

- Strip PII before analysis where possible
- Never persist conversation logs with raw medical data
- Anonymize data for model training
- Audit all AI-to-database writes
```

---

## 9. AI Provider Abstraction

### 9.1 Provider Interface

```typescript
// src/lib/ai/provider.interface.ts
interface AiProvider {
  name: string;
  complete(prompt: string, options: CompletionOptions): Promise<string>;
  embed(text: string): Promise<number[]>;
  isAvailable(): Promise<boolean>;
}

// Implementations:
// - OpenAiProvider
// - AnthropicProvider
// - LocalLlamaProvider (future)
```

### 9.2 Fallback Chain

```
PRIMARY   → OpenAI GPT-4 (or specified model)
SECONDARY → Anthropic Claude (if OpenAI fails)
TERTIARY  → Cached response (if available)
FINAL     → Graceful degradation to manual
```

### 9.3 Cost Controls

| Control | Implementation |
|---------|----------------|
| Request limits | Per-user daily/monthly caps |
| Token budgets | Max tokens per request type |
| Caching | Cache identical prompts (TTL: 1h) |
| Batching | Aggregate non-urgent requests |

---

## 10. Cost Optimization Strategy

### 10.1 Infrastructure Costs

| Resource | Optimization |
|----------|--------------|
| Database | Connection pooling, query optimization |
| Storage | S3 lifecycle rules, image compression |
| Compute | Serverless for variable load |
| AI | Provider negotiation, caching |

### 10.2 Development Costs

| Practice | Benefit |
|----------|---------|
| Planning-first | Reduce rework cycles |
| Reusable components | Faster feature delivery |
| Automated testing | Catch bugs early |
| Documentation | Reduce onboarding time |

### 10.3 Token Efficiency (Cursor AI)

```
RULE: Optimize prompts for token efficiency

- Reference files by path, not full content
- Use structured formats (tables, lists)
- Avoid redundant context repetition
- Chunk large tasks into focused prompts
```

---

## 11. Multi-Tenant Principles

### 11.1 Current State: Single-Tenant

```
Prani Doctor MVP is single-tenant (one platform instance)
Multi-tenant patterns are prepared for future scaling
```

### 11.2 Future-Ready Patterns

| Pattern | Preparation |
|---------|-------------|
| Tenant isolation | `tenantId` field design documented |
| Data partitioning | Schema supports horizontal split |
| Config per tenant | `Setting` table with tenant scope |

### 11.3 Scaling Path

```
Phase 1 (Current): Single instance, single database
Phase 2 (Growth):  Read replicas, connection pooling
Phase 3 (Scale):   Database-per-region or sharding
```

---

## 12. Modular Architecture Enforcement

### 12.1 Module Boundaries

```
RULE: Modules communicate via defined interfaces

Feature A → Shared Interface → Feature B
    ↓                              ↓
  Own DB tables              Own DB tables
```

### 12.2 Dependency Rules

| From | To | Allowed |
|------|----|---------|
| Feature module | Core | ✓ |
| Feature module | Another feature | ✗ (use shared interface) |
| Core | Feature module | ✗ |
| Shared | Core | ✓ |

### 12.3 Module Checklist

- [ ] Self-contained folder structure
- [ ] No direct imports from other features
- [ ] Own route namespace
- [ ] Own Prisma models (if applicable)
- [ ] Documented public API

---

## 13. Naming Conventions

### 13.1 File Naming

| Type | Convention | Example |
|------|------------|---------|
| React component | PascalCase | `AdminPageHeader.tsx` |
| Utility function | camelCase | `formatCurrency.ts` |
| API route | kebab-case folder | `api/service-requests/route.ts` |
| Dart file | snake_case | `service_request_page.dart` |
| CSS module | kebab-case | `admin-shell.css` |

### 13.2 Code Naming

| Type | Convention | Example |
|------|------------|---------|
| React component | PascalCase | `ServiceRequestCard` |
| Function | camelCase | `calculateCommission` |
| Constant | SCREAMING_SNAKE | `MAX_FILE_SIZE` |
| Type/Interface | PascalCase | `ServiceRequestDto` |
| API response type | `{Entity}Dto` suffix | `ServiceRequestDto`, `AnimalProfileDto` |
| API write input | `{Entity}CreateInput` / `{Entity}UpdateInput` | `CreateServiceRequestInput` |
| Zod schema | camelCase + `Schema` | `serviceRequestCreateSchema` |
| Enum value | SCREAMING_SNAKE | `IN_PROGRESS` |
| Dart class | PascalCase | `ServiceRequestPage` |
| Dart DTO file | snake_case + `_dto.dart` | `service_request_dto.dart` |
| Dart function | camelCase | `fetchServiceRequests` |

### 13.3 Database Naming

| Type | Convention | Example |
|------|------------|---------|
| Table | PascalCase (Prisma) | `ServiceRequest` |
| Column | camelCase | `assignedDoctorId` |
| Index | descriptive | `ServiceRequest_status_idx` |
| Enum | PascalCase | `ServiceRequestStatus` |
| Migration folder | `YYYYMMDDHHMMSS_snake_case` | `20260521120000_add_ai_usage_record` |
| Migration `--name` | snake_case verb phrase | `add_location_master_fields` |

See `docs/PRISMA_MIGRATION_RULES.md` for migration safety rules.

### 13.4 Upload Naming (Canonical)

| Layer | Convention | Example |
|-------|------------|---------|
| REST route | `/api/mobile/uploads`, `/api/admin/uploads` | Plural resource |
| Prisma model | `UploadedFile` | PascalCase |
| DB table map | `@@map("uploaded_file")` if used | snake_case |
| Object key | `uploads/{context}/{yyyy}/{mm}/{fileId}.{ext}` | `uploads/ai-tech/2026/05/clx….jpg` |
| Context segment | `farmer`, `doctor`, `ai-tech`, `admin` | Lowercase kebab |
| MinIO bucket | `pranidoctor-uploads` | Dev/prod same name |
| Error codes | `UPLOAD_*` prefix | `UPLOAD_SIZE_EXCEEDED` |

### 13.5 Environment Variable Naming

| Context | Canonical secret | Fallback (dev only) |
|---------|------------------|---------------------|
| Admin panel JWT | `ADMIN_JWT_SECRET` | `AUTH_SECRET`, `JWT_SECRET` |
| Mobile app JWT (OTP) | `MOBILE_JWT_SECRET` | `AUTH_SECRET` |
| Doctor web panel JWT | `DOCTOR_JWT_SECRET` | `AUTH_SECRET` |
| Technician web JWT | `TECHNICIAN_JWT_SECRET` | `DOCTOR_JWT_SECRET`, `AUTH_SECRET` |

Do not reuse the same secret string across contexts in production. See `docs/ENV_SETUP.md`.

### 13.6 API Version (MVP)

- Contract document: `API_CONTRACT_V1.md` (version **1.1.0** doc revision).
- Runtime routes: `/api/mobile/*`, `/api/admin/*` — **v1 implicit** (no `/v1` path prefix in MVP).
- Response header: `X-API-Version: v1` on all JSON responses.
- Future explicit paths: `/api/v1/mobile/*` per `API_VERSIONING.md`.

---

## 14. Folder Strategy

### 14.1 Backend (pranidoctor-web)

```
pranidoctor-web/
├── docs/
│   ├── core/               # Governance documents (this file)
│   ├── decisions/          # Architecture Decision Records
│   ├── api/                # API documentation
│   └── [feature].md        # Feature-specific docs
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Migration history
│   └── seed.ts             # Development seeding
├── scripts/
│   ├── prisma/             # DB maintenance scripts
│   └── [utility]/          # Other automation
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/         # React components
│   ├── lib/                # Shared libraries
│   └── generated/          # Generated code (gitignored)
└── tests/                  # Test files
```

### 14.2 Mobile (pranidoctor_user)

```
pranidoctor_user/
├── lib/
│   ├── app/                # App configuration
│   ├── core/               # Shared utilities
│   ├── features/           # Feature modules
│   ├── l10n/               # Localization
│   ├── routing/            # Navigation
│   └── theme/              # Theming
├── assets/                 # Static assets
└── test/                   # Test files
```

### 14.3 Documentation Hierarchy

```
docs/
├── core/
│   └── MASTER_SYSTEM_RULES.md    # This file (governance)
├── [FEATURE]_PLAN.md             # Feature planning docs
├── [FEATURE]_IMPLEMENTATION.md   # Implementation details
└── README files in code dirs     # Local context
```

---

## 15. Documentation Rules

### 15.1 Required Documentation

| Artifact | Location | Owner |
|----------|----------|-------|
| System rules | `docs/core/MASTER_SYSTEM_RULES.md` | Architect |
| Schema plan | `docs/DATABASE_SCHEMA_PLAN.md` | DB owner |
| Migration rules | `docs/PRISMA_MIGRATION_RULES.md` | DB owner |
| Feature plans | `docs/[FEATURE]_PLAN.md` | Feature lead |
| API docs | `docs/api/` or inline OpenAPI | API owner |

### 15.2 Documentation Standards

```markdown
# Document Title

**Version:** X.Y.Z
**Last Updated:** YYYY-MM-DD
**Owner:** [Role/Name]

## Purpose
[One paragraph describing why this document exists]

## [Sections...]

---
*End of document*
```

### 15.3 When to Update

| Event | Required Update |
|-------|-----------------|
| Schema change | DATABASE_SCHEMA_PLAN.md |
| New feature | [FEATURE]_PLAN.md |
| API change | API documentation |
| Process change | Relevant governance doc |
| Major decision | ADR in docs/decisions/ |

---

## 16. Cursor AI Behavior Rules

### 16.1 Context Loading Priority

```
1. MASTER_SYSTEM_RULES.md (this file) — Always first
2. Relevant feature documentation
3. Existing code patterns
4. Package.json / pubspec.yaml for dependencies
```

### 16.2 Agent Constraints

| Rule | Description |
|------|-------------|
| READ-BEFORE-EDIT | Always read target file before modifying |
| NO-GUESSING | If uncertain, ask or research |
| PATTERN-MATCH | Follow existing code patterns |
| DOCUMENT-CHANGES | Update docs when changing contracts |
| TEST-CHANGES | Run lint/build after changes |

### 16.3 Prohibited Actions

```
NEVER:
- Commit secrets or credentials
- Remove existing tests without explicit approval
- Change authentication logic without security review
- Mix projects (BPA, WPA, etc. with Prani Doctor)
- Add dependencies without justification
- Skip validation on user input
```

### 16.4 Response Format

```
For code tasks:
1. State understanding of the task
2. List files to modify
3. Make changes
4. Run verification (lint, build)
5. Summarize changes

For planning tasks:
1. Analyze requirements
2. Identify constraints
3. Propose approach with alternatives
4. Request confirmation before implementation
```

---

## 17. Agent Execution Workflow

### 17.1 Task Classification

| Type | Workflow |
|------|----------|
| **Simple fix** | Read → Edit → Verify → Done |
| **Feature addition** | Plan → Approve → Implement → Test → Done |
| **Refactoring** | Analyze → Plan → Incremental changes → Verify |
| **Investigation** | Search → Analyze → Report findings |

### 17.2 Pre-Execution Checklist

```
Before starting any task:
□ Read MASTER_SYSTEM_RULES.md (if not cached)
□ Identify affected modules
□ Check for existing patterns
□ Verify no conflicts with ongoing work
□ Understand success criteria
```

### 17.3 Post-Execution Checklist

```
After completing any task:
□ Run npm run lint (backend)
□ Run npm run build (backend)
□ Run flutter analyze (mobile)
□ Update documentation if contracts changed
□ Summarize changes made
```

---

## 18. Planning-First Workflow

### 18.1 When Planning is Required

| Scenario | Planning Required |
|----------|-------------------|
| New feature | ✓ Always |
| Schema change | ✓ Always |
| API contract change | ✓ Always |
| Bug fix | ✗ Unless architectural |
| Simple refactor | ✗ Unless cross-module |

### 18.2 Planning Document Template

```markdown
# [Feature Name] Plan

## 1. Objective
[What problem does this solve?]

## 2. Scope
- In scope: [list]
- Out of scope: [list]

## 3. Technical Approach
[How will this be implemented?]

## 4. Database Changes
[Schema additions/modifications]

## 5. API Changes
[New/modified endpoints]

## 6. UI/UX Changes
[Screens/components affected]

## 7. Risks
[Potential issues and mitigations]

## 8. Acceptance Criteria
[How do we know it's done?]
```

### 18.3 Planning Review Gates

```
Gate 1: Architecture alignment (this document)
Gate 2: Schema compatibility (DATABASE_SCHEMA_PLAN.md)
Gate 3: Security review (if auth/data changes)
Gate 4: UX review (if user-facing changes)
```

---

## 19. Emergency System Standards

### 19.1 Emergency Request Handling

```
EMERGENCY_FLAG triggers:
- Priority assignment queue
- SMS notification to available providers
- Elevated tracking visibility
- Expedited billing (emergency fee applicable)
```

### 19.2 Emergency Indicators

| Field | Values |
|-------|--------|
| `isEmergency` | boolean flag |
| `urgency` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `triageLevel` | Future: AI-suggested severity |

### 19.3 System Fallbacks

```
If primary assignment fails:
1. Expand geographic radius
2. Alert admin for manual assignment
3. Notify customer of delay with ETA
```

---

## 20. Offline-First Philosophy

### 20.1 Mobile Offline Capabilities

| Feature | Offline Support |
|---------|-----------------|
| View profile | ✓ Cached |
| View animals | ✓ Cached |
| View past requests | ✓ Cached |
| Create new request | ✓ Queue for sync |
| Real-time status | ✗ Requires network |

### 20.2 Sync Strategy

```dart
// Conflict resolution: Server wins with user notification
// Sync triggers:
// - App foreground
// - Network restored
// - Manual refresh
// - Background periodic (if enabled)
```

### 20.3 Cache Invalidation

```
Cache TTL by data type:
- User profile: 24 hours
- Animal profiles: 24 hours
- Service requests: 1 hour
- Static content: 7 days
```

---

## 21. DevOps Standards

### 21.1 Environment Tiers

| Tier | Purpose | Database | Access |
|------|---------|----------|--------|
| Local | Development | Docker Postgres | Developer |
| Staging | Testing | Shared Postgres | Team |
| Production | Live | Managed Postgres | Restricted |

### 21.2 Deployment Checklist

```
Pre-deployment:
□ All tests passing
□ Migration tested on staging
□ Environment variables verified
□ Rollback plan documented

Post-deployment:
□ Health checks passing
□ Error rate normal
□ Key user flows verified
□ Monitoring alerts configured
```

### 21.3 Incident Response

```
Severity Levels:
P1: System down (response: immediate)
P2: Major feature broken (response: 1 hour)
P3: Minor issue (response: 24 hours)
P4: Enhancement request (response: next sprint)
```

---

## 22. Docker Rules

### 22.1 Local Development

```yaml
# docker-compose.yml pattern
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: pranidoctor_db
      POSTGRES_USER: pranidoctor
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
```

### 22.2 Container Standards

| Rule | Description |
|------|-------------|
| Base images | Official or verified only |
| Secrets | Never in Dockerfile |
| Health checks | Required for all services |
| Resource limits | Defined in compose/k8s |

### 22.3 Image Tagging

```
Convention: [repo]:[env]-[version]-[commit]
Example: pranidoctor-web:prod-1.2.3-abc1234
```

---

## 23. CI/CD Rules

### 23.1 Pipeline Stages

```
┌─────────┐    ┌──────────┐    ┌────────┐    ┌────────┐
│  Lint   │ →  │  Build   │ →  │  Test  │ →  │ Deploy │
└─────────┘    └──────────┘    └────────┘    └────────┘
```

### 23.2 Branch Protection

| Branch | Protection |
|--------|------------|
| `main` | PR required, CI must pass, 1 approval |
| `staging` | PR required, CI must pass |
| `feature/*` | No direct push to main |

### 23.3 Required CI Checks

```yaml
# Minimum passing checks:
- lint: npm run lint
- typecheck: npm run typecheck
- build: npm run build
- test: npm run test (when tests exist)
- prisma: npx prisma validate
```

---

## 24. Environment Management

### 24.1 Variable Categories

| Category | Example | Commit to Repo |
|----------|---------|----------------|
| Public config | `NEXT_PUBLIC_API_URL` | ✓ in `.env.example` |
| Private config | `DATABASE_URL` | ✗ Never |
| Secrets | `ADMIN_JWT_SECRET` | ✗ Never |
| Feature flags | `FEATURE_AI_TRIAGE` | ✓ in `.env.example` |

### 24.2 Required Variables

```bash
# Backend (minimum for local dev)
DATABASE_URL=postgresql://...
ADMIN_JWT_SECRET=[32+ chars]
MOBILE_JWT_SECRET=[32+ chars]

# Mobile (via --dart-define)
API_BASE_URL=http://localhost:3000
```

### 24.3 Secret Rotation

```
Rotation triggers:
- Team member departure
- Suspected exposure
- Annual rotation (recommended)
- Security audit finding
```

---

## 25. Git Workflow

### 25.1 Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/[ticket]-[description]` | `feature/PD-123-service-request-api` |
| Bug fix | `fix/[ticket]-[description]` | `fix/PD-456-otp-validation` |
| Hotfix | `hotfix/[description]` | `hotfix/emergency-assignment` |
| Release | `release/[version]` | `release/1.2.0` |

### 25.2 Commit Message Format

```
[type]: [description]

[optional body]

[optional footer]

Types: feat, fix, docs, style, refactor, test, chore
```

### 25.3 Commit Examples

```
feat: add service request creation API

- POST /api/mobile/requests endpoint
- Zod validation for input
- Customer auth required

Closes PD-123
```

### 25.4 Merge Strategy

| To Branch | From Branch | Method |
|-----------|-------------|--------|
| main | feature/* | Squash merge |
| staging | main | Fast-forward |
| production | main | Tagged release |

---

## 26. Error Handling Standards

### 26.1 Backend Error Handling

```typescript
// Centralized error handler pattern
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400,
    public details?: object
  ) {
    super(message);
  }
}

// Usage
throw new AppError('VALIDATION_ERROR', 'Invalid phone number', 400, {
  field: 'phone',
  received: input.phone
});
```

### 26.2 Flutter Error Handling

```dart
// Centralized via ApiResult
sealed class ApiResult<T> {
  const ApiResult();
}

class Success<T> extends ApiResult<T> {
  final T data;
  const Success(this.data);
}

class Failure<T> extends ApiResult<T> {
  final AppException error;
  const Failure(this.error);
}
```

### 26.3 Error Logging Rules

| Error Type | Log Level | Alert |
|------------|-----------|-------|
| Validation | WARN | No |
| Auth failure | WARN | Rate-based |
| Server error | ERROR | Yes |
| External API failure | ERROR | Yes |

---

## 27. Logging Standards

### 27.1 Log Levels

| Level | Use Case |
|-------|----------|
| DEBUG | Development tracing (disabled in prod) |
| INFO | Business events, audit trail |
| WARN | Recoverable issues |
| ERROR | Failures requiring attention |

### 27.2 Log Format

```json
{
  "timestamp": "ISO8601",
  "level": "INFO",
  "service": "pranidoctor-web",
  "event": "service_request_created",
  "requestId": "uuid",
  "userId": "uuid",
  "data": { "requestId": "..." }
}
```

### 27.3 Sensitive Data Rules

```
NEVER log:
- Passwords or tokens
- Full credit card numbers
- Medical details (log request ID only)
- OTP codes (plain or hashed)

ALWAYS mask:
- Phone: 017***1234
- Email: u***@example.com
```

### 27.4 OTP Policy (System Standard)

Mobile authentication uses **6-digit numeric OTP** (`OTP_LENGTH=6`). Full policy (length, expiry, cooldown, attempt limits, rate limiting, masking) is defined in `docs/api/AUTH_FLOW.md` §3.0. API contract and error codes: `docs/api/API_CONTRACT_V1.md`, `docs/api/ERROR_STANDARD.md`. Mobile UI: `AppOtpInput` default `length = 6`.

---

## 28. Monitoring Standards

### 28.1 Health Checks

| Endpoint | Check |
|----------|-------|
| `/api/admin/health` | DB connection, admin service |
| `/api/mobile/health` | DB connection, mobile service |

### 28.2 Key Metrics

| Metric | Alert Threshold |
|--------|-----------------|
| API response time | p95 > 2s |
| Error rate | > 1% |
| Database connections | > 80% pool |
| Memory usage | > 85% |

### 28.3 Alerting Rules

```
P1 Alert: Service down > 1 minute
P2 Alert: Error rate > 5% for 5 minutes
P3 Alert: Slow queries > 10s
```

---

## 29. Feature Module Isolation

### 29.1 Module Definition

```
A feature module is:
- Self-contained folder under features/
- Has own route(s)
- Has own data layer (if needed)
- Exports only public interface
```

### 29.2 Inter-Module Communication

```typescript
// ALLOWED: Via shared types/interfaces
import { ServiceRequestDto } from '@/types/service-request';

// FORBIDDEN: Direct module import
import { validateRequest } from '../another-feature/utils';
```

### 29.3 Module Boundaries (Backend)

```
src/
├── features/
│   ├── service-requests/
│   │   ├── api/           # Route handlers
│   │   ├── services/      # Business logic
│   │   └── types.ts       # Public types
│   └── billing/
│       ├── api/
│       ├── services/
│       └── types.ts
└── shared/
    └── types/             # Cross-module types
```

---

## 30. Shared Package Strategy

### 30.1 Current Approach

```
Single repo per platform (web, mobile)
Shared code via:
- src/lib/ (backend utilities)
- lib/core/ (Flutter utilities)
- Type definitions in shared locations
```

### 30.2 Future Package Extraction

| Candidate | When to Extract |
|-----------|-----------------|
| Validation schemas | When shared across 3+ features |
| UI components | When design system stabilizes |
| API types | When mobile + web need sync |

### 30.3 Package Criteria

```
Extract to package when:
- Used by multiple applications
- Stable API (low churn)
- Clear versioning needs
- Team wants independent releases
```

---

## 31. Scalability Rules

### 31.1 Database Scalability

| Load Level | Strategy |
|------------|----------|
| Current | Single Postgres, connection pooling |
| 10x users | Read replicas, query optimization |
| 100x users | Sharding or managed scaling |

### 31.2 Application Scalability

```
Stateless design:
- No server-side session state
- JWT tokens for auth
- External cache (future: Redis)
- File storage in S3
```

### 31.3 Query Optimization Rules

```
RULE: N+1 queries are forbidden

// BAD
const requests = await prisma.serviceRequest.findMany();
for (const r of requests) {
  const doctor = await prisma.doctorProfile.findUnique({...});
}

// GOOD
const requests = await prisma.serviceRequest.findMany({
  include: { assignedDoctor: true }
});
```

---

## 32. Event-Driven Architecture Preparation

### 32.1 Current State

```
Synchronous request-response pattern
Events logged for audit but not published
```

### 32.2 Event Candidates

| Event | Current | Future |
|-------|---------|--------|
| Request created | DB write + log | Publish to queue |
| Request assigned | DB write + log | Publish + notify |
| Payment received | DB write + log | Publish + trigger |

### 32.3 Event Schema (Future)

```typescript
interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  timestamp: string;
  payload: object;
  metadata: {
    userId: string;
    correlationId: string;
  };
}
```

---

## 33. Microservice Readiness

### 33.1 Current: Modular Monolith

```
All features in single deployment
Clear module boundaries
Shared database with logical separation
```

### 33.2 Extraction Candidates

| Service | Extraction Trigger |
|---------|-------------------|
| Auth | Multi-app SSO needed |
| Notifications | High volume, independent scaling |
| Payments | Compliance isolation |
| AI Services | Compute-intensive, async |

### 33.3 Extraction Checklist

```
Before extracting a microservice:
□ Clear API contract defined
□ Data ownership documented
□ Communication patterns designed
□ Deployment pipeline ready
□ Monitoring/alerting configured
□ Rollback strategy tested
```

---

## 34. Decision Records

### 34.1 ADR Format

```markdown
# ADR-[number]: [title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[What is the issue?]

## Decision
[What was decided?]

## Consequences
[What are the results?]
```

### 34.2 When to Write ADR

| Decision | ADR Required |
|----------|--------------|
| New technology adoption | ✓ |
| Architecture pattern change | ✓ |
| Security approach change | ✓ |
| Process change | ✓ |
| Bug fix | ✗ |
| Minor refactor | ✗ |

---

## 35. Compliance Matrix

### 35.1 Rule Verification

| Category | Verification Method | Frequency |
|----------|---------------------|-----------|
| Naming conventions | Lint rules | Every commit |
| API standards | Schema validation | Every commit |
| Security | Auth tests | Every commit |
| Documentation | Manual review | Every PR |
| Architecture | Architect review | Major changes |

### 35.2 Governance Enforcement

```
Enforcement levels:
HARD BLOCK:  CI fails, merge blocked
SOFT BLOCK:  Warning, manual override possible
ADVISORY:    Logged, no block
```

### 35.3 Exception Process

```
To request exception from any rule:
1. Document the rule and reason for exception
2. Propose alternative safeguard
3. Get approval from rule owner
4. Document exception in PR and docs/decisions/
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Architecture Team | Initial release |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                    PRANI DOCTOR RULES                        │
├─────────────────────────────────────────────────────────────┤
│ ALWAYS:                                                      │
│   □ Read before edit                                        │
│   □ Follow existing patterns                                │
│   □ Run lint + build                                        │
│   □ Update docs for contract changes                        │
│                                                              │
│ NEVER:                                                       │
│   □ Mix with other projects                                 │
│   □ Commit secrets                                          │
│   □ Skip validation                                         │
│   □ Change auth without review                              │
│                                                              │
│ KEY FILES:                                                   │
│   → docs/core/MASTER_SYSTEM_RULES.md (this)                 │
│   → docs/DATABASE_SCHEMA_PLAN.md                            │
│   → docs/PRISMA_MIGRATION_RULES.md                          │
│   → docs/ADMIN_UI_DESIGN_RULES.md                           │
└─────────────────────────────────────────────────────────────┘
```

---

*End of MASTER_SYSTEM_RULES.md*
