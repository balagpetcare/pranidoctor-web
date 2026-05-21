# PHASE 0 ARCHITECTURE PATCH V1

**Version:** 1.0.0  
**Date:** 2026-05-21  
**Source review:** `docs/PHASE0_FINAL_REVIEW.md`  
**Status:** Applied to documentation (Phase 0 stabilization)

---

## Executive Summary

This patch resolves two **high-severity** architecture conflicts identified in Phase 0 final review:

| ID | Issue | Resolution |
|----|-------|------------|
| **CONF-H001** | OTP length inconsistency (6 vs 4 digits; 300s vs 90s countdown) | Standardized to `OTP_LENGTH=6` system-wide |
| **CONF-H002** | AI memory scope mismatch (detailed schemas vs ERD “Future”) | Split into **MVP** and **Phase 2** modules with explicit tables |

---

## Issue 1 — OTP Standardization

### Decision

```
OTP_LENGTH=6
OTP_EXPIRY_SECONDS=300
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_SENDS_PER_HOUR=5
```

### Before / After

| Area | Before | After |
|------|--------|-------|
| AUTH_FLOW | 6 digits (already correct) | §3.0 **OTP Policy** table added (canonical) |
| APP_FLOW | 4-digit UI mockup, ~90s countdown | 6-digit boxes, 300s (05:00) countdown |
| MOBILE_UI_BLUEPRINT | 4 boxes, 90s, 56×64dp | 6 boxes, 300s, 48×56dp |
| COMPONENT_SYSTEM | `AppOtpInput` default `length = 4` | `length = 6` |
| API_CONTRACT_V1 | `code: "123456"` only | OTP Policy table + `otpLength: 6` + validation rules |
| ERROR_STANDARD | Generic OTP errors | `OTP_INVALID_LENGTH`, `OTP_INVALID_FORMAT` + 6-digit messages |
| MASTER_SYSTEM_RULES | “Never log OTP” only | §27.4 OTP Policy pointer |
| SCREEN_HIERARCHY | Generic OTP screen | Spec: 6-digit, 300s expiry, 60s resend cooldown |

### OTP Policy (Canonical)

| Field | Value | Notes |
|-------|-------|-------|
| **length** | 6 | Numeric `^\d{6}$` |
| **expiry** | 300 s | Challenge invalidated; UI countdown matches |
| **cooldown** | 60 s | Resend disabled until elapsed |
| **attempt limit** | 5 | Per challenge; then require new OTP |
| **rate limiting** | 5 sends/hour/phone | `OTP_RATE_LIMIT` |
| **retry** | New request after max attempts or expiry | Not same code after lockout |
| **masking** | No OTP in API JSON; bcrypt in DB; never in logs | SMS only channel for plain OTP |

**Authoritative doc:** `docs/api/AUTH_FLOW.md` §3.0

### Files Updated (Issue 1)

| File | Version |
|------|---------|
| `docs/api/AUTH_FLOW.md` | 1.1.0 |
| `docs/uiux/APP_FLOW.md` | 1.1.0 |
| `docs/uiux/MOBILE_UI_BLUEPRINT.md` | 1.1.0 |
| `docs/uiux/COMPONENT_SYSTEM.md` | 1.1.0 |
| `docs/api/API_CONTRACT_V1.md` | 1.1.0 |
| `docs/api/ERROR_STANDARD.md` | 1.1.0 |
| `docs/core/MASTER_SYSTEM_RULES.md` | §27.4 added |
| `docs/uiux/SCREEN_HIERARCHY.md` | OtpVerificationPage spec |

---

## Issue 2 — AI Memory Scope Split

### Decision

| Phase | Modules |
|-------|---------|
| **MVP** | `conversation_context`, `session_summary`, `prompt_cache` |
| **Phase 2** | `long_term_memory`, `vector_memory`, `personalization` |

### Before / After

| Area | Before | After |
|------|--------|-------|
| ERD §14 | All AI memory under “Future Domains” | New §14 **AI Memory MVP vs Phase 2**; Future §15 |
| MEMORY_SYSTEM | Full Prisma models implied MVP | Roadmap table; §3.2 MVP vs §3.2.1 Phase 2 schemas |
| AI_ORCHESTRATOR | Memory only in Related Docs | §11 **Memory Integration** with MVP hooks |
| DATABASE_ARCHITECTURE | Did not exist | New doc — storage tiers + AI memory + OTP |

### MVP Module Mapping

| Module | Storage | Tables / Keys |
|--------|---------|---------------|
| `conversation_context` | Redis | `ctx:{sessionId}` |
| `session_summary` | PostgreSQL | `AiConversation` |
| `prompt_cache` | Redis | `prompt:{hash}` |

### Phase 2 Module Mapping

| Module | Storage | Tables |
|--------|---------|--------|
| `long_term_memory` | PostgreSQL | `AiMemoryEntry` |
| `vector_memory` | PostgreSQL + vector index | `AiMemoryEntry.embeddingVector` |
| `personalization` | PostgreSQL | `AiUserContext` |

### Files Updated (Issue 2)

| File | Version / Change |
|------|------------------|
| `docs/database/ERD.md` | 1.1.0 — §14 AI memory, §15 Future, §16 Relationships |
| `docs/ai/MEMORY_SYSTEM.md` | 1.1.0 — Phase roadmap, scoped schemas |
| `docs/ai/AI_ORCHESTRATOR.md` | 1.1.0 — §11 Memory integration |
| `docs/database/DATABASE_ARCHITECTURE.md` | 1.0.0 — **new** |

---

## Conflict Resolution Status

| ID | Status | Verification |
|----|--------|--------------|
| CONF-H001 | **Resolved** | All listed docs use 6-digit OTP; policy in AUTH_FLOW §3.0 |
| CONF-H002 | **Resolved** | ERD §14 + MEMORY_SYSTEM + DATABASE_ARCHITECTURE + AI_ORCHESTRATOR §11 aligned |

---

## Engineering Implementation Checklist

### OTP (MVP)

- [ ] Set env: `OTP_LENGTH=6`, `OTP_EXPIRY_SECONDS=300`, `OTP_MAX_ATTEMPTS=5`, `OTP_RESEND_COOLDOWN_SECONDS=60`, `OTP_MAX_SENDS_PER_HOUR=5`
- [ ] Zod: `z.string().length(6).regex(/^\d{6}$/)` on verify endpoint
- [ ] Flutter: `AppOtpInput(length: 6)`; 6 boxes; countdown from `expiresIn` (300)
- [ ] Resend button gated on `resendAvailableIn` (60)
- [ ] Return `OTP_INVALID_LENGTH` / `OTP_INVALID_FORMAT` per ERROR_STANDARD
- [ ] Never include OTP in API responses or logs

### AI Memory (MVP)

- [ ] Prisma: add `AiConversation` (+ optional `AiMessage`) only for MVP migration
- [ ] Redis: `ctx:{sessionId}`, `prompt:{hash}` with documented TTLs
- [ ] Implement `ConversationContextManager` + archive on session close
- [ ] Wire `AI_ORCHESTRATOR` §11 MVP hooks in triage/chat pipelines
- [ ] `AI_MEMORY_PHASE2_ENABLED=false` — do not query `AiMemoryEntry` / `AiUserContext`

### AI Memory (Phase 2 — later)

- [ ] Migration for `AiUserContext`, `AiMemoryEntry`, vector index
- [ ] Enable `AI_MEMORY_PHASE2_ENABLED` after retrieval pipeline tested
- [ ] Orchestrator §11.2 hooks

---

## Document Index (Post-Patch)

| Document | Role |
|----------|------|
| `PHASE0_ARCHITECTURE_PATCH_V1.md` | This patch log |
| `PHASE0_FINAL_REVIEW.md` | Original findings (unchanged) |
| `api/AUTH_FLOW.md` | OTP policy authority |
| `api/API_CONTRACT_V1.md` | API OTP contract |
| `api/ERROR_STANDARD.md` | OTP error codes |
| `uiux/APP_FLOW.md` | Mobile OTP UX flow |
| `uiux/MOBILE_UI_BLUEPRINT.md` | OTP screen wireframe |
| `uiux/COMPONENT_SYSTEM.md` | `AppOtpInput` default |
| `database/ERD.md` | Entity scope by phase |
| `database/DATABASE_ARCHITECTURE.md` | Data layer + memory placement |
| `ai/MEMORY_SYSTEM.md` | Memory implementation detail |
| `ai/AI_ORCHESTRATOR.md` | Orchestrator memory hooks |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Architecture | Phase 0 stabilization patch v1 |

---

*End of PHASE0_ARCHITECTURE_PATCH_V1.md*
