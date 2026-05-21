# DATABASE ARCHITECTURE — Prani Doctor

**Version:** 1.0.0  
**Last Updated:** 2026-05-21  
**Scope:** Data layer architecture, storage tiers, AI memory placement, cross-doc alignment

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Storage Tiers](#2-storage-tiers)
3. [Domain Boundaries](#3-domain-boundaries)
4. [AI Memory Architecture](#4-ai-memory-architecture)
5. [Auth Data (OTP)](#5-auth-data-otp)
6. [Multi-Tenant Readiness](#6-multi-tenant-readiness)
7. [Related Documents](#7-related-documents)

---

## 1. Architecture Overview

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         PRANI DOCTOR DATA LAYER                                │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                      │
│  │   Mobile    │     │   Admin     │     │  Workers    │                      │
│  │   Flutter   │     │   Next.js   │     │  (BullMQ)   │                      │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘                      │
│         │                   │                   │                              │
│         └───────────────────┴───────────────────┘                              │
│                             │                                                  │
│                             ▼                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐     │
│  │                    API LAYER (Next.js Route Handlers)                 │     │
│  │  Zod validation │ RBAC │ tenantId-ready filters                      │     │
│  └──────────────────────────────┬───────────────────────────────────────┘     │
│                                 │                                              │
│         ┌───────────────────────┼───────────────────────┐                      │
│         ▼                       ▼                       ▼                      │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐              │
│  │ PostgreSQL  │         │    Redis    │         │  S3/R2      │              │
│  │ (Prisma)    │         │ Cache/Queue │         │ Media       │              │
│  │ Source of   │         │ Sessions    │         │             │              │
│  │ truth       │         │ AI context  │         │             │              │
│  └─────────────┘         └─────────────┘         └─────────────┘              │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Primary references:** `ERD.md`, `TABLE_STRUCTURE.md` (incl. §1.2 `tenantId`, §9.9 AI audit), `MULTI_TENANT_STRATEGY.md`, `MEMORY_SYSTEM.md`.

---

## 2. Storage Tiers

| Tier | Technology | Data Types | TTL / Lifecycle |
|------|------------|------------|-----------------|
| **Transactional** | PostgreSQL | Users, profiles, service requests, clinical, billing | Permanent (soft delete) |
| **Ephemeral** | Redis | OTP rate counters, session context, prompt cache | Seconds to hours |
| **Object** | S3-compatible | Images, documents, voice (future) | Permanent with lifecycle rules |
| **Queue** | Redis + BullMQ | AI jobs, notifications, async tasks | Until processed |

---

## 3. Domain Boundaries

| Domain | PostgreSQL Cluster | MVP | Notes |
|--------|-------------------|-----|-------|
| Identity | User, profiles, MobileOtpChallenge | Yes | OTP challenges hashed |
| Geography | Division → Village | Yes | Shared reference data |
| Service | ServiceRequest, assignments | Yes | Core product |
| Clinical | TreatmentCase, Prescription | Yes | Doctor workflows |
| Financial | BillingRecord, PaymentRecord | Partial | Payment gateway Phase 2+ |
| AI Technician | Semen services, instances | Yes | Technician app |
| **AI Memory (MVP)** | AiConversation, AiMessage | Yes | See §4 |
| **AI Memory (Phase 2)** | AiMemoryEntry, AiUserContext | No | Deferred |
| Future | Leads, farms, wallet, telemedicine | No | `ERD.md` §15 |

---

## 4. AI Memory Architecture

Resolves **CONF-H002** (memory scope mismatch between `MEMORY_SYSTEM.md` and `ERD.md`).

### 4.1 MVP Modules (Implement for Phase 0)

| Module | Store | Entity / Key | Written | Read |
|--------|-------|--------------|---------|------|
| `conversation_context` | Redis | `ctx:{sessionId}` | Each message | Every AI request in session |
| `session_summary` | PostgreSQL | `AiConversation` | Session close | Last N summaries per user |
| `prompt_cache` | Redis | `prompt:{hash}` | Cache miss after build | Before provider call |

```
Session Start
     │
     ▼
conversation_context (Redis) ◄── read/write during chat
     │
     │ session end
     ▼
session_summary (AiConversation row)
     │
prompt_cache (Redis) ◄── parallel; independent of session lifecycle
```

**Prisma MVP tables:**

- `AiConversation` — required
- `AiMessage` — optional (full transcript / audit)

### 4.2 Phase 2 Modules (Do Not Migrate in MVP)

| Module | Store | Table | Capability |
|--------|-------|-------|------------|
| `long_term_memory` | PostgreSQL | `AiMemoryEntry` | Scoped facts, patterns |
| `vector_memory` | PostgreSQL + index | `AiMemoryEntry.embeddingVector` | Semantic retrieval |
| `personalization` | PostgreSQL | `AiUserContext` | Language, topics, animal cache |

Orchestrator integration: `AI_ORCHESTRATOR.md` §11. Feature flag `AI_MEMORY_PHASE2_ENABLED=false` until Phase 2.

### 4.3 What Is Not AI Memory

Core application tables supply clinical context but are not memory modules:

- `AnimalProfile`, `TreatmentCase`, `Prescription`, `ServiceRequest`

These are queried by domain services; MVP does not duplicate them into `AiMemoryEntry`.

---

## 5. Auth Data (OTP)

Mobile OTP uses `MobileOtpChallenge` (PostgreSQL) plus Redis rate-limit keys.

| Policy Field | Value | Env Var |
|--------------|-------|---------|
| Length | 6 digits | `OTP_LENGTH=6` |
| Expiry | 300 s | `OTP_EXPIRY_SECONDS=300` |
| Resend cooldown | 60 s | `OTP_RESEND_COOLDOWN_SECONDS=60` |
| Verify attempts | 5 | `OTP_MAX_ATTEMPTS=5` |
| Sends per hour | 5 | `OTP_MAX_SENDS_PER_HOUR=5` |
| Masking | Never return OTP in API JSON | — |

Canonical policy: `docs/api/AUTH_FLOW.md` §3.0. Resolves **CONF-H001**.

---

## 6. Multi-Tenant Readiness

MVP runs single-tenant; `tenantId` columns are documented in `MULTI_TENANT_STRATEGY.md` for forward compatibility. AI memory tables follow the same pattern when tenants activate:

- `AiConversation.tenantId` (nullable in MVP)
- Phase 2 tables include `tenantId` from initial Phase 2 migration

---

## 7. Related Documents

| Document | Path |
|----------|------|
| ERD | `docs/database/ERD.md` |
| Table Structure | `docs/database/TABLE_STRUCTURE.md` |
| Memory System | `docs/ai/MEMORY_SYSTEM.md` |
| AI Orchestrator | `docs/ai/AI_ORCHESTRATOR.md` |
| Auth Flow | `docs/api/AUTH_FLOW.md` |
| Architecture Patch | `docs/PHASE0_ARCHITECTURE_PATCH_V1.md` |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Architecture | Initial — AI memory + OTP alignment |

---

*End of DATABASE_ARCHITECTURE.md*
