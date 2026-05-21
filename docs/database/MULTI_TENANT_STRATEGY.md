# MULTI-TENANT STRATEGY — Prani Doctor

**Version:** 1.0.0  
**Last Updated:** 2026-05-21  
**Scope:** Multi-tenancy architecture, data isolation, scaling strategy

---

## Table of Contents

1. [Current State](#1-current-state)
2. [Multi-Tenant Architecture Options](#2-multi-tenant-architecture-options)
3. [Recommended Strategy](#3-recommended-strategy)
4. [Tenant Identification](#4-tenant-identification)
5. [Data Isolation Patterns](#5-data-isolation-patterns)
6. [Schema Design for Multi-Tenancy](#6-schema-design-for-multi-tenancy)
7. [Query Patterns](#7-query-patterns)
8. [AI Memory Storage Strategy](#8-ai-memory-storage-strategy)
9. [Offline Sync Strategy](#9-offline-sync-strategy)
10. [Audit Trail Strategy](#10-audit-trail-strategy)
11. [Scalability Path](#11-scalability-path)
12. [Migration Plan](#12-migration-plan)

---

## 1. Current State

### 1.1 MVP Architecture

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    CURRENT STATE: SINGLE-TENANT                               │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐        │
│   │                     PRANI DOCTOR PLATFORM                        │        │
│   │                     (Single Instance)                            │        │
│   └─────────────────────────────────────────────────────────────────┘        │
│                                │                                              │
│                                ▼                                              │
│   ┌─────────────────────────────────────────────────────────────────┐        │
│   │                     POSTGRESQL DATABASE                          │        │
│   │                     (Single Schema)                              │        │
│   │                                                                  │        │
│   │   All users, all data, all features in one database             │        │
│   └─────────────────────────────────────────────────────────────────┘        │
│                                                                                │
│   Characteristics:                                                            │
│   • Single PostgreSQL database                                                │
│   • Single Prisma schema                                                      │
│   • All users share same tables                                               │
│   • No tenant isolation                                                       │
│   • Simplified operations                                                     │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Why Multi-Tenant Ready?

| Scenario | Business Need | Technical Implication |
|----------|--------------|----------------------|
| White-label platform | Other vet networks want to use Prani Doctor | Data isolation required |
| Geographic expansion | Bangladesh regions → Other countries | Compliance, data residency |
| Enterprise clients | Large farms want dedicated instances | SLA, performance isolation |
| Franchise model | Independent operators under brand | Revenue attribution |
| Development branches | Feature branches need isolated data | `deploymentBranch` field |

### 1.3 Multi-Tenant Readiness Fields (Already Present)

```prisma
model ServiceInstance {
  tenantId         String?   // Multi-tenant ready
  deploymentBranch String?   @default("main")  // Environment targeting
  // ...
}
```

---

## 2. Multi-Tenant Architecture Options

### 2.1 Architecture Comparison

| Model | Data Isolation | Complexity | Cost | Customization |
|-------|----------------|------------|------|---------------|
| **Shared Database, Shared Schema** | Low (Row-level) | Low | Low | Limited |
| **Shared Database, Separate Schema** | Medium (Schema-level) | Medium | Medium | Moderate |
| **Separate Database** | High (DB-level) | High | High | Full |
| **Hybrid** | Varies | High | Medium-High | Full |

### 2.2 Option 1: Shared Database, Shared Schema (Recommended for MVP+)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│               SHARED DATABASE, SHARED SCHEMA (Row-Level Isolation)            │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐        │
│   │                     SINGLE DATABASE                              │        │
│   │                                                                  │        │
│   │   ┌─────────────────────────────────────────────────────────┐  │        │
│   │   │                    USER TABLE                            │  │        │
│   │   │   id   │ tenantId │ email │ role │ ...                  │  │        │
│   │   │───────────────────────────────────────────────────────── │  │        │
│   │   │   1    │  tenant_a │ ...  │ ...  │                      │  │        │
│   │   │   2    │  tenant_b │ ...  │ ...  │                      │  │        │
│   │   │   3    │  tenant_a │ ...  │ ...  │                      │  │        │
│   │   └─────────────────────────────────────────────────────────┘  │        │
│   │                                                                  │        │
│   │   All tables have tenantId column                               │        │
│   │   Row-level security enforced at application layer              │        │
│   └─────────────────────────────────────────────────────────────────┘        │
│                                                                                │
│   Pros:                              Cons:                                    │
│   • Simplest to implement            • Lower isolation                        │
│   • Lowest operational cost          • Noisy neighbor risk                    │
│   • Easy migrations                  • Complex RLS policies                   │
│   • Unified reporting                • Single point of failure                │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Option 2: Shared Database, Separate Schema

```
┌───────────────────────────────────────────────────────────────────────────────┐
│               SHARED DATABASE, SEPARATE SCHEMA                                │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐        │
│   │                     SINGLE DATABASE                              │        │
│   │                                                                  │        │
│   │   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │        │
│   │   │ tenant_a      │  │ tenant_b      │  │ tenant_c      │      │        │
│   │   │───────────────│  │───────────────│  │───────────────│      │        │
│   │   │ user          │  │ user          │  │ user          │      │        │
│   │   │ service_req   │  │ service_req   │  │ service_req   │      │        │
│   │   │ ...           │  │ ...           │  │ ...           │      │        │
│   │   └───────────────┘  └───────────────┘  └───────────────┘      │        │
│   │                                                                  │        │
│   │   ┌───────────────┐                                             │        │
│   │   │ public        │  Shared tables (geography, templates)       │        │
│   │   │───────────────│                                             │        │
│   │   │ division      │                                             │        │
│   │   │ district      │                                             │        │
│   │   └───────────────┘                                             │        │
│   └─────────────────────────────────────────────────────────────────┘        │
│                                                                                │
│   Pros:                              Cons:                                    │
│   • Better isolation                 • Migration complexity                   │
│   • PostgreSQL search_path           • Connection pool per schema             │
│   • Easier per-tenant backup         • Cross-tenant queries hard              │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 2.4 Option 3: Separate Database

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                      SEPARATE DATABASE PER TENANT                              │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                    │
│   │ DATABASE A    │  │ DATABASE B    │  │ DATABASE C    │                    │
│   │ (tenant_a)    │  │ (tenant_b)    │  │ (tenant_c)    │                    │
│   │───────────────│  │───────────────│  │───────────────│                    │
│   │ user          │  │ user          │  │ user          │                    │
│   │ service_req   │  │ service_req   │  │ service_req   │                    │
│   │ ...           │  │ ...           │  │ ...           │                    │
│   └───────────────┘  └───────────────┘  └───────────────┘                    │
│                                                                                │
│   ┌───────────────────────────────────────────────────────────────┐          │
│   │                    CENTRAL DATABASE                           │          │
│   │                    (Shared metadata)                          │          │
│   │───────────────────────────────────────────────────────────────│          │
│   │ tenant (id, name, dbUrl, status)                              │          │
│   │ shared_geography                                              │          │
│   │ shared_templates                                              │          │
│   └───────────────────────────────────────────────────────────────┘          │
│                                                                                │
│   Pros:                              Cons:                                    │
│   • Maximum isolation                • High operational cost                   │
│   • Independent scaling              • Complex deployment                     │
│   • Compliance ready                 • Cross-tenant reporting hard            │
│   • Per-tenant SLAs                  • Many databases to manage               │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Recommended Strategy

### 3.1 Phased Approach

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDED MULTI-TENANT EVOLUTION                          │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   PHASE 1: MVP (Current)                                                      │
│   ─────────────────────                                                       │
│   • Single tenant (Prani Doctor Bangladesh)                                   │
│   • tenantId fields prepared but not enforced                                 │
│   • deploymentBranch for dev/staging/prod                                     │
│                                                                                │
│   PHASE 2: Soft Multi-Tenancy                                                 │
│   ──────────────────────────                                                  │
│   • tenantId populated on all records                                         │
│   • Application-level filtering                                               │
│   • Shared database, shared schema                                            │
│   • Tenant management admin UI                                                │
│                                                                                │
│   PHASE 3: Enhanced Isolation                                                 │
│   ────────────────────────────                                                │
│   • PostgreSQL Row-Level Security (RLS)                                       │
│   • Performance isolation (resource quotas)                                   │
│   • Per-tenant configuration                                                  │
│                                                                                │
│   PHASE 4: Enterprise Scale                                                   │
│   ─────────────────────────                                                   │
│   • Hybrid model: Small tenants share, large get dedicated                    │
│   • Regional databases for compliance                                         │
│   • Cross-tenant analytics warehouse                                          │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Decision Criteria for Phase Transition

| Trigger | Current Phase | Next Phase |
|---------|---------------|------------|
| First white-label request | Phase 1 | Phase 2 |
| 10+ tenants OR compliance need | Phase 2 | Phase 3 |
| Enterprise SLA requirements | Phase 3 | Phase 4 |
| Geographic expansion (new country) | Phase 2/3 | Phase 4 |

---

## 4. Tenant Identification

### 4.1 Tenant Model (Future Implementation)

```prisma
// Future: Tenant management table
model Tenant {
  id            String       @id @default(cuid())
  slug          String       @unique  // e.g., "pranidoctor-bd"
  name          String                // "Prani Doctor Bangladesh"
  domain        String?      @unique  // "pranidoctor.com"
  status        TenantStatus @default(ACTIVE)
  tier          TenantTier   @default(FREE)
  
  // Configuration
  configJson    Json?        // Tenant-specific settings
  featureFlags  Json?        // Feature toggles
  brandingJson  Json?        // Logo, colors, etc.
  
  // Limits
  maxUsers      Int          @default(1000)
  maxStorage    BigInt       @default(1073741824)  // 1GB default
  
  // Billing
  billingEmail  String?
  stripeCustId  String?
  
  // Metadata
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  deletedAt     DateTime?

  // Relations (future)
  // users User[]
  // serviceRequests ServiceRequest[]
  
  @@index([status])
  @@index([domain])
}

enum TenantStatus {
  ACTIVE
  SUSPENDED
  TRIAL
  CANCELLED
}

enum TenantTier {
  FREE
  STARTER
  PROFESSIONAL
  ENTERPRISE
}
```

### 4.2 Tenant Resolution Strategy

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    TENANT RESOLUTION FLOW                                      │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   Request arrives at API                                                      │
│        │                                                                       │
│        ▼                                                                       │
│   ┌────────────────────────────────────────────────────────┐                 │
│   │              RESOLVE TENANT ID                          │                 │
│   │                                                        │                 │
│   │   Strategy 1: Domain-based (Web)                       │                 │
│   │   • pranidoctor.com → tenant_pranidoctor_bd            │                 │
│   │   • client.vetplatform.com → tenant_client            │                 │
│   │                                                        │                 │
│   │   Strategy 2: Header-based (API)                       │                 │
│   │   • X-Tenant-ID: tenant_pranidoctor_bd                 │                 │
│   │                                                        │                 │
│   │   Strategy 3: JWT Claim (Mobile)                       │                 │
│   │   • token.tenantId = "tenant_pranidoctor_bd"          │                 │
│   │                                                        │                 │
│   │   Strategy 4: Path-based (Multi-app)                   │                 │
│   │   • /api/tenant/pranidoctor-bd/...                    │                 │
│   └────────────────────────────────────────────────────────┘                 │
│        │                                                                       │
│        ▼                                                                       │
│   ┌────────────────────────────────────────────────────────┐                 │
│   │              INJECT INTO CONTEXT                        │                 │
│   │                                                        │                 │
│   │   • Store in request context                           │                 │
│   │   • Pass to Prisma middleware                          │                 │
│   │   • Available in all queries                           │                 │
│   └────────────────────────────────────────────────────────┘                 │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Default Tenant (MVP)

```typescript
// During MVP, use a constant default tenant
const DEFAULT_TENANT_ID = 'tenant_pranidoctor_bd';

// All records created with this tenant ID
// All queries filter by this tenant ID (when enabled)
```

---

## 5. Data Isolation Patterns

### 5.1 Table Classification

| Category | Examples | Tenant Scope | Notes |
|----------|----------|--------------|-------|
| **Tenant-Scoped** | User, ServiceRequest, AnimalProfile | Per-tenant | Add tenantId |
| **Shared Reference** | Division, District, LivestockBreed | Global | No tenantId |
| **Tenant-Customizable** | ServiceCategory, SemenServiceTemplate | Both | Has tenantId (nullable) |
| **System** | Setting (global config) | System | No tenantId |

### 5.2 Tenant-Scoped Tables (Add tenantId)

> **Table catalog alignment:** Row estimates and indexes for these tables are in `TABLE_STRUCTURE.md` §1.2 and domain sections §9.1–9.9. MVP: `tenantId` nullable, not filtered in queries.

```prisma
// Tables that need tenantId for multi-tenancy

// Identity Domain
model User {
  tenantId String?  // Future: non-null when multi-tenant enabled
  // ...
}

model CustomerProfile {
  tenantId String?
  // ...
}

model DoctorProfile {
  tenantId String?
  // ...
}

model AiTechnicianProfile {
  tenantId String?
  // ...
}

// Service Domain
model ServiceRequest {
  tenantId String?
  // ...
}

model AnimalProfile {
  tenantId String?
  // ...
}

model TreatmentCase {
  tenantId String?
  // ...
}

// Financial Domain
model BillingRecord {
  tenantId String?
  // ...
}

model PaymentRecord {
  tenantId String?
  // ...
}

// AI Technician Domain
model AiServiceRequest {
  tenantId String?
  // ...
}

model AiTechnicianService {
  tenantId String?
  // ...
}

// Enterprise Domain (already has tenantId)
model ServiceInstance {
  tenantId String?
  // ...
}

// Notifications
model Notification {
  tenantId String?
  // ...
}

// Content
model ContentPost {
  tenantId String?  // Or null for global content
  // ...
}
```

### 5.3 Shared Reference Tables (No tenantId)

```prisma
// These remain global across all tenants

model Division { /* No tenantId - shared geography */ }
model District { /* No tenantId */ }
model Upazila { /* No tenantId */ }
model Union { /* No tenantId */ }
model Village { /* No tenantId */ }
model Area { /* No tenantId */ }

model LivestockBreed { /* No tenantId - shared master data */ }
model SemenProvider { /* No tenantId - shared providers */ }

// Global settings
model Setting {
  key       String  @unique
  valueJson Json
  scope     String  @default("global")  // "global" or "tenant:{id}"
}
```

### 5.4 PostgreSQL Row-Level Security (Phase 3)

```sql
-- Enable RLS on tenant-scoped tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Create policy for tenant isolation
CREATE POLICY tenant_isolation_policy ON "User"
  USING (tenant_id = current_setting('app.current_tenant_id'));

-- Set tenant context at connection time
SET app.current_tenant_id = 'tenant_pranidoctor_bd';
```

---

## 6. Schema Design for Multi-Tenancy

### 6.1 tenantId Field Pattern

```prisma
// Standard tenantId pattern for all tenant-scoped tables
model ExampleTable {
  id        String   @id @default(cuid())
  tenantId  String?  // Nullable during migration, required when enabled
  
  // ... other fields ...
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Index for tenant-filtered queries
  @@index([tenantId])
  // Composite indexes for common queries
  @@index([tenantId, status])
  @@index([tenantId, createdAt])
}
```

### 6.2 Cross-Tenant Reference Pattern

```prisma
// When a tenant-scoped table references a shared table
model ServiceRequest {
  id                String  @id @default(cuid())
  tenantId          String?
  
  // References shared geography (no tenantId needed)
  villageId         String?
  village           Village? @relation(...)
  
  // References tenant-scoped user
  customerId        String
  customer          CustomerProfile @relation(...)
  
  // Constraint: customerId.tenantId must match this.tenantId
  // Enforced at application level
}
```

### 6.3 Tenant-Customizable Pattern

```prisma
// Tables that can be global OR tenant-specific
model ServiceCategory {
  id          String   @id @default(cuid())
  tenantId    String?  // null = global, set = tenant-specific
  
  name        String
  slug        String   // Unique within tenant or globally
  isGlobal    Boolean  @default(false)  // true = visible to all tenants
  
  // Unique slug per tenant (or global)
  @@unique([tenantId, slug])
}

// Query logic:
// 1. Get global categories (tenantId IS NULL AND isGlobal = true)
// 2. Get tenant-specific categories (tenantId = currentTenant)
// 3. Merge and deduplicate by slug
```

---

## 7. Query Patterns

### 7.1 Prisma Middleware for Tenant Filtering

```typescript
// src/lib/prisma/tenant-middleware.ts

import { Prisma } from '@prisma/client';

const TENANT_SCOPED_MODELS = [
  'User',
  'CustomerProfile',
  'DoctorProfile',
  'AiTechnicianProfile',
  'ServiceRequest',
  'AnimalProfile',
  'TreatmentCase',
  'BillingRecord',
  'PaymentRecord',
  'Notification',
  // ... add all tenant-scoped models
];

export function tenantMiddleware(tenantId: string): Prisma.Middleware {
  return async (params, next) => {
    // Skip if not a tenant-scoped model
    if (!TENANT_SCOPED_MODELS.includes(params.model || '')) {
      return next(params);
    }

    // Inject tenantId for creates
    if (params.action === 'create') {
      params.args.data = {
        ...params.args.data,
        tenantId,
      };
    }

    if (params.action === 'createMany') {
      params.args.data = params.args.data.map((item: any) => ({
        ...item,
        tenantId,
      }));
    }

    // Inject tenantId filter for reads
    if (['findFirst', 'findMany', 'findUnique', 'count', 'aggregate'].includes(params.action)) {
      params.args.where = {
        ...params.args.where,
        tenantId,
      };
    }

    // Inject tenantId filter for updates/deletes
    if (['update', 'updateMany', 'delete', 'deleteMany'].includes(params.action)) {
      params.args.where = {
        ...params.args.where,
        tenantId,
      };
    }

    return next(params);
  };
}
```

### 7.2 Tenant Context Provider

```typescript
// src/lib/tenant/context.ts

import { AsyncLocalStorage } from 'async_hooks';

interface TenantContext {
  tenantId: string;
  tier: string;
  features: string[];
}

const tenantStorage = new AsyncLocalStorage<TenantContext>();

export function runWithTenant<T>(context: TenantContext, fn: () => T): T {
  return tenantStorage.run(context, fn);
}

export function getCurrentTenant(): TenantContext | undefined {
  return tenantStorage.getStore();
}

export function requireTenant(): TenantContext {
  const tenant = getCurrentTenant();
  if (!tenant) {
    throw new Error('Tenant context not available');
  }
  return tenant;
}
```

### 7.3 API Route with Tenant Context

```typescript
// src/app/api/mobile/requests/route.ts

import { runWithTenant, resolveTenantFromRequest } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const tenant = await resolveTenantFromRequest(request);
  
  return runWithTenant(tenant, async () => {
    // Prisma middleware automatically filters by tenantId
    const requests = await prisma.serviceRequest.findMany({
      where: { status: 'PENDING' },
      // tenantId filter automatically added
    });
    
    return NextResponse.json({ success: true, data: requests });
  });
}
```

---

## 8. AI Memory Storage Strategy

### 8.1 AI Conversation Model (Future)

```prisma
// AI conversation and memory storage for chatbot/assistant

model AiConversation {
  id            String          @id @default(cuid())
  tenantId      String?
  userId        String
  sessionId     String          // Client session identifier
  contextType   AiContextType   // SERVICE_REQUEST, GENERAL, DIAGNOSTIC
  contextId     String?         // Related entity ID
  status        ConversationStatus @default(ACTIVE)
  metadataJson  Json?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  closedAt      DateTime?
  
  user          User            @relation(fields: [userId], references: [id])
  messages      AiMessage[]
  contextItems  AiContextItem[]
  
  @@index([tenantId, userId])
  @@index([tenantId, sessionId])
  @@index([contextType, contextId])
  @@index([status])
}

model AiMessage {
  id              String        @id @default(cuid())
  conversationId  String
  role            AiMessageRole // USER, ASSISTANT, SYSTEM, FUNCTION
  content         String        @db.Text
  contentType     String        @default("text")  // text, image_url, function_call
  
  // Token tracking for cost
  inputTokens     Int?
  outputTokens    Int?
  
  // Function/tool calls
  functionName    String?
  functionArgs    Json?
  functionResult  Json?
  
  // Moderation
  flagged         Boolean       @default(false)
  flagReason      String?
  
  createdAt       DateTime      @default(now())
  
  conversation    AiConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  @@index([conversationId, createdAt])
}

model AiContextItem {
  id              String        @id @default(cuid())
  conversationId  String
  itemType        String        // animal_profile, service_request, symptoms
  itemId          String?       // ID of the referenced entity
  content         String        @db.Text
  embedding       Float[]?      // Vector embedding for semantic search
  relevanceScore  Float?
  createdAt       DateTime      @default(now())
  
  conversation    AiConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  @@index([conversationId])
  @@index([itemType, itemId])
}

enum AiContextType {
  SERVICE_REQUEST
  DIAGNOSTIC
  GENERAL
  ONBOARDING
  SUPPORT
}

enum AiMessageRole {
  USER
  ASSISTANT
  SYSTEM
  FUNCTION
}

enum ConversationStatus {
  ACTIVE
  COMPLETED
  ABANDONED
  FLAGGED
}
```

### 8.2 AI Memory Retention Policies

```typescript
// AI memory retention configuration
const AI_RETENTION_POLICY = {
  // Active conversation timeout
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  
  // Memory retention by context type
  retention: {
    SERVICE_REQUEST: 90,  // 90 days
    DIAGNOSTIC: 365,      // 1 year (medical record)
    GENERAL: 30,          // 30 days
    ONBOARDING: 7,        // 7 days
    SUPPORT: 180,         // 6 months
  },
  
  // Data anonymization threshold
  anonymizationThreshold: 730, // 2 years
  
  // Cleanup frequency
  cleanupInterval: 24 * 60 * 60 * 1000, // Daily
};

// Cleanup job
async function cleanupAiMemory() {
  const cutoffDate = new Date();
  
  for (const [contextType, days] of Object.entries(AI_RETENTION_POLICY.retention)) {
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    await prisma.aiConversation.deleteMany({
      where: {
        contextType,
        closedAt: { lt: cutoffDate },
        status: { in: ['COMPLETED', 'ABANDONED'] }
      }
    });
  }
}
```

### 8.3 AI Report Storage

```prisma
// AI-generated diagnostic reports
model AiDiagnosticReport {
  id                String    @id @default(cuid())
  tenantId          String?
  serviceRequestId  String?
  animalId          String
  generatedById     String?   // AI technician or system
  
  // Input summary
  symptomsProvided  String    @db.Text
  inputContextJson  Json      // Structured input data
  
  // AI output
  triageLevel       String    // LOW, MEDIUM, HIGH, CRITICAL
  suggestedDiagnosis String   @db.Text
  confidenceScore   Float     // 0-1
  differentialDiagnoses Json  // Array of alternatives
  recommendedActions String   @db.Text
  urgencyNotes      String?   @db.Text
  
  // Traceability
  modelVersion      String    // AI model version used
  promptTemplateId  String?   // Template used for generation
  rawResponseJson   Json?     // Full AI response (encrypted)
  
  // Review
  reviewedById      String?   // Doctor who reviewed
  reviewStatus      ReviewStatus @default(PENDING)
  reviewNotes       String?   @db.Text
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  animal            AnimalProfile @relation(fields: [animalId], references: [id])
  serviceRequest    ServiceRequest? @relation(fields: [serviceRequestId], references: [id])
  reviewedBy        User? @relation("AiReportReviewer", fields: [reviewedById], references: [id])
  
  @@index([tenantId, createdAt])
  @@index([animalId])
  @@index([serviceRequestId])
  @@index([reviewStatus])
}
```

---

## 9. Offline Sync Strategy

### 9.1 Offline Sync Model

```prisma
// Track offline operations for sync
model SyncOperation {
  id              String          @id @default(cuid())
  tenantId        String?
  deviceId        String          // Client device identifier
  userId          String
  
  // Operation details
  operationType   SyncOperationType
  entityType      String          // "ServiceRequest", "AnimalProfile", etc.
  entityId        String?         // Existing entity ID (for updates)
  localId         String          // Client-generated ID
  payload         Json            // The data to sync
  
  // Sync state
  status          SyncStatus      @default(PENDING)
  attemptCount    Int             @default(0)
  lastAttemptAt   DateTime?
  errorMessage    String?
  
  // Resolution
  resolvedEntityId String?        // Server-assigned ID after sync
  conflictResolution String?      // How conflict was resolved
  
  // Timestamps
  clientCreatedAt DateTime        // When created on device
  serverReceivedAt DateTime       @default(now())
  processedAt     DateTime?
  
  user            User            @relation(fields: [userId], references: [id])
  
  @@index([tenantId, deviceId])
  @@index([tenantId, userId, status])
  @@index([status, lastAttemptAt])
  @@index([entityType, localId])
}

model SyncConflict {
  id              String          @id @default(cuid())
  tenantId        String?
  syncOperationId String
  
  conflictType    ConflictType    // VERSION, DELETED, DUPLICATE
  serverVersion   Json            // Current server state
  clientVersion   Json            // Client's version
  resolution      ConflictResolution?
  resolvedBy      String?         // User ID or "SYSTEM"
  resolvedAt      DateTime?
  
  createdAt       DateTime        @default(now())
  
  syncOperation   SyncOperation   @relation(fields: [syncOperationId], references: [id])
  
  @@index([tenantId])
  @@index([syncOperationId])
  @@index([resolution])
}

model ClientDeviceState {
  id              String          @id @default(cuid())
  tenantId        String?
  userId          String
  deviceId        String          @unique
  
  // Device info
  deviceType      String          // iOS, Android
  appVersion      String
  osVersion       String?
  
  // Sync state
  lastSyncAt      DateTime?
  lastSyncVersion String?         // Server sync cursor/version
  pendingOps      Int             @default(0)
  
  // Push notifications
  pushToken       String?
  pushEnabled     Boolean         @default(true)
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  user            User            @relation(fields: [userId], references: [id])
  
  @@index([tenantId, userId])
}

enum SyncOperationType {
  CREATE
  UPDATE
  DELETE
}

enum SyncStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CONFLICT
}

enum ConflictType {
  VERSION
  DELETED
  DUPLICATE
}

enum ConflictResolution {
  SERVER_WINS
  CLIENT_WINS
  MERGED
  MANUAL
}
```

### 9.2 Sync Flow

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                          OFFLINE SYNC FLOW                                     │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   MOBILE CLIENT (OFFLINE)                    SERVER                           │
│   ──────────────────────                     ──────                           │
│                                                                                │
│   1. User creates ServiceRequest                                              │
│      └─▶ Store locally with localId                                          │
│      └─▶ Queue SyncOperation                                                 │
│                                                                                │
│   2. Network available                                                        │
│      └─▶ POST /api/mobile/sync                                               │
│          ├─ Send pending SyncOperations ────▶ Receive operations             │
│          │                                    │                               │
│          │                                    ├─ Validate payload             │
│          │                                    ├─ Check for conflicts          │
│          │                                    ├─ Apply operations             │
│          │                                    └─ Return results               │
│          │                                                                    │
│          ◀── Receive sync results ───────────┘                               │
│          │                                                                    │
│          ├─ Update local IDs with server IDs                                 │
│          ├─ Mark operations completed                                         │
│          └─ Handle conflicts if any                                          │
│                                                                                │
│   CONFLICT RESOLUTION:                                                        │
│   • VERSION: Server version > client version → server wins                   │
│   • DELETED: Entity deleted on server → inform client                        │
│   • DUPLICATE: Same entity created → merge or pick one                       │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 9.3 Offline Capabilities by Entity

| Entity | Create Offline | Update Offline | Conflict Strategy |
|--------|----------------|----------------|-------------------|
| ServiceRequest | Yes | Limited | Server wins |
| AnimalProfile | Yes | Yes | Merge (user review) |
| TreatmentCase | Yes (draft) | Yes (draft) | Server wins |
| Prescription | No | No | N/A |
| Review | Yes | Yes | Server wins |
| Profile (own) | Yes | Yes | Last write wins |

---

## 10. Audit Trail Strategy

### 10.1 Audit Log Model

```prisma
// Comprehensive audit logging
model AuditLog {
  id              String          @id @default(cuid())
  tenantId        String?
  
  // Action details
  action          AuditAction     // CREATE, UPDATE, DELETE, READ, LOGIN, etc.
  entityType      String          // Table/model name
  entityId        String?         // Affected record ID
  
  // Actor
  actorType       ActorType       // USER, SYSTEM, API_KEY
  actorId         String?         // User ID if applicable
  actorRole       String?         // Role at time of action
  
  // Change details
  previousState   Json?           // Before state (for updates)
  newState        Json?           // After state
  changedFields   String[]        // List of changed field names
  
  // Request context
  ipAddress       String?
  userAgent       String?
  requestId       String?         // Correlation ID
  sessionId       String?
  
  // Result
  success         Boolean         @default(true)
  errorMessage    String?
  
  createdAt       DateTime        @default(now())
  
  @@index([tenantId, createdAt])
  @@index([tenantId, entityType, entityId])
  @@index([tenantId, actorId, createdAt])
  @@index([action])
  @@index([entityType])
}

model DataAccessLog {
  id              String          @id @default(cuid())
  tenantId        String?
  
  // What was accessed
  entityType      String
  entityIds       String[]        // Can be multiple records
  fieldsAccessed  String[]        // Which fields were read
  
  // Who accessed
  actorId         String
  actorRole       String
  
  // Context
  purpose         String?         // Why this data was accessed
  apiEndpoint     String?
  ipAddress       String?
  
  createdAt       DateTime        @default(now())
  
  @@index([tenantId, createdAt])
  @@index([tenantId, actorId])
  @@index([entityType])
}

enum AuditAction {
  CREATE
  READ
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  FAILED_LOGIN
  PASSWORD_CHANGE
  ROLE_CHANGE
  EXPORT
  IMPORT
  APPROVE
  REJECT
  SUSPEND
  ACTIVATE
}

enum ActorType {
  USER
  SYSTEM
  API_KEY
  WEBHOOK
}
```

### 10.2 Audit Middleware

```typescript
// src/lib/prisma/audit-middleware.ts

import { Prisma } from '@prisma/client';

const AUDITED_MODELS = [
  'User',
  'DoctorProfile',
  'AiTechnicianProfile',
  'ServiceRequest',
  'BillingRecord',
  'PaymentRecord',
  // ... models requiring audit
];

const SENSITIVE_FIELDS = [
  'passwordHash',
  'codeHash',
  // Fields to exclude from audit log
];

export function auditMiddleware(getContext: () => AuditContext): Prisma.Middleware {
  return async (params, next) => {
    if (!AUDITED_MODELS.includes(params.model || '')) {
      return next(params);
    }

    const context = getContext();
    const startTime = Date.now();
    
    // Capture before state for updates
    let previousState: any = null;
    if (params.action === 'update' && params.args.where?.id) {
      previousState = await prisma[params.model].findUnique({
        where: { id: params.args.where.id }
      });
    }

    // Execute the operation
    const result = await next(params);

    // Log the audit event
    const auditEntry = {
      tenantId: context.tenantId,
      action: mapActionToAuditAction(params.action),
      entityType: params.model,
      entityId: result?.id || params.args.where?.id,
      actorType: context.actorType,
      actorId: context.userId,
      actorRole: context.userRole,
      previousState: sanitizeState(previousState),
      newState: sanitizeState(result),
      changedFields: getChangedFields(previousState, result),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      requestId: context.requestId,
      success: true,
    };

    // Fire and forget audit log (don't block the request)
    prisma.auditLog.create({ data: auditEntry }).catch(console.error);

    return result;
  };
}

function sanitizeState(state: any): any {
  if (!state) return null;
  const sanitized = { ...state };
  for (const field of SENSITIVE_FIELDS) {
    delete sanitized[field];
  }
  return sanitized;
}
```

### 10.3 Audit Retention Policy

| Log Type | Retention Period | Archive Strategy |
|----------|------------------|------------------|
| AuditLog | 7 years | Cold storage after 1 year |
| DataAccessLog | 2 years | Archive after 90 days |
| ServiceInstanceAuditEvent | 5 years | Cold storage after 1 year |
| Login attempts | 90 days | Delete |

---

## 11. Scalability Path

### 11.1 Scaling Phases

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         SCALABILITY ROADMAP                                    │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   PHASE 1: VERTICAL SCALING (Current → 100K users)                           │
│   ─────────────────────────────────────────────────                          │
│   • Single PostgreSQL instance (managed)                                      │
│   • Connection pooling (PgBouncer)                                            │
│   • Query optimization                                                        │
│   • Read replicas for reporting                                               │
│                                                                                │
│   PHASE 2: HORIZONTAL READ SCALING (100K → 1M users)                         │
│   ──────────────────────────────────────────────────                         │
│   • Multiple read replicas                                                    │
│   • Read/write splitting                                                      │
│   • Caching layer (Redis)                                                     │
│   • CDN for static content                                                    │
│                                                                                │
│   PHASE 3: PARTITION & SHARD (1M → 10M users)                                │
│   ─────────────────────────────────────────────                              │
│   • Table partitioning (time-based)                                           │
│   • Tenant-based sharding for large tenants                                   │
│   • Separate databases for hot tenants                                        │
│                                                                                │
│   PHASE 4: GLOBAL DISTRIBUTION (10M+ users)                                  │
│   ─────────────────────────────────────────                                  │
│   • Regional databases                                                        │
│   • Cross-region replication                                                  │
│   • Edge caching                                                              │
│   • Eventual consistency patterns                                             │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Connection Pooling Strategy

```typescript
// Prisma with connection pooling configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool settings
  // Configured via connection string parameters
});

// Connection string format:
// postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10
```

### 11.3 Read Replica Configuration (Future)

```typescript
// Future: Prisma with read replicas
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,  // Primary (writes)
    },
  },
});

// Read replica for heavy queries
const prismaRead = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_URL,  // Read replica
    },
  },
});

// Usage pattern
async function getReports() {
  return prismaRead.serviceRequest.findMany({
    where: { status: 'COMPLETED' },
    // Heavy aggregation
  });
}
```

---

## 12. Migration Plan

### 12.1 Phase 1 → Phase 2 Migration Steps

```markdown
## Migration: Enable Soft Multi-Tenancy

### Step 1: Add tenantId columns
```sql
-- Add nullable tenantId to all tenant-scoped tables
ALTER TABLE "User" ADD COLUMN "tenantId" TEXT;
ALTER TABLE "CustomerProfile" ADD COLUMN "tenantId" TEXT;
-- ... repeat for all tenant-scoped tables

-- Create indexes
CREATE INDEX "User_tenantId_idx" ON "User" ("tenantId");
-- ... repeat for all
```

### Step 2: Backfill existing data
```sql
-- Set default tenant for all existing records
UPDATE "User" SET "tenantId" = 'tenant_pranidoctor_bd' WHERE "tenantId" IS NULL;
UPDATE "CustomerProfile" SET "tenantId" = 'tenant_pranidoctor_bd' WHERE "tenantId" IS NULL;
-- ... repeat for all
```

### Step 3: Create Tenant management table
```sql
CREATE TABLE "Tenant" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT DEFAULT 'ACTIVE',
  -- ... other fields
);

-- Insert default tenant
INSERT INTO "Tenant" ("id", "slug", "name") 
VALUES ('tenant_pranidoctor_bd', 'pranidoctor-bd', 'Prani Doctor Bangladesh');
```

### Step 4: Add foreign key constraints
```sql
-- Add FK to Tenant table
ALTER TABLE "User" 
ADD CONSTRAINT "User_tenantId_fkey" 
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id");
-- ... repeat for all
```

### Step 5: Update application code
- Enable tenant middleware
- Update API routes to resolve tenant
- Update admin panel for tenant management
```

### 12.2 Rollback Plan

```markdown
## Rollback: Disable Multi-Tenancy

### Step 1: Remove FK constraints
```sql
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_tenantId_fkey";
-- ... repeat for all
```

### Step 2: Disable tenant middleware
- Comment out tenant middleware in Prisma client
- Remove tenant resolution from API routes

### Step 3: (Optional) Drop tenantId columns
```sql
-- Only if reverting permanently
ALTER TABLE "User" DROP COLUMN IF EXISTS "tenantId";
-- ... repeat for all
```
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
| ERD | `docs/database/ERD.md` |
| Table Structure | `docs/database/TABLE_STRUCTURE.md` |
| Role System | `docs/database/ROLE_SYSTEM.md` |
| Master System Rules | `docs/core/MASTER_SYSTEM_RULES.md` |
| System Architecture | `docs/architecture/SYSTEM_ARCHITECTURE.md` |

---

*End of MULTI_TENANT_STRATEGY.md*
