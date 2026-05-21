# PHASE 6 — AI VETERINARY CORE

**Document type:** AI systems architecture plan  
**Date:** 2026-05-21  
**Authority:** [PROJECT_FREEZE.md](./PROJECT_FREEZE.md) — freeze rules **override** all work  
**Prerequisites:** [PHASE1_PLAN.md](./PHASE1_PLAN.md), [PHASE2_AUTH.md](./PHASE2_AUTH.md), [PHASE5_TREATMENT.md](./PHASE5_TREATMENT.md)  
**Implementation repo:** `pranidoctor-backend/src/modules/ai-veterinary-core/` (**new**, replaces non-functional foundation `modules/ai` stub at mount)

**Principle:** AI is an **assistant layer**. AI **never** diagnoses independently. AI **never** replaces doctors. **Human escalation has priority.**

---

## Freeze Validation

```
DATABASE_FROZEN=true
API_FROZEN=true
MIGRATION_FROZEN=true   (additive only)
DEPENDENCY_FROZEN=true
```

| Gate | Status | Notes |
|------|--------|-------|
| `modules/auth/**`, `profile/**`, `area/**` | **BLOCKED** (edit) | P1/P2 frozen |
| `modules/{case,lead,assignment,timeline}/**` | **BLOCKED** (edit) | P3 frozen — read-only case context |
| `modules/treatment-workflow/**` | **BLOCKED** (edit) | P5 frozen contract |
| `legacy/web/routes/**` | **BLOCKED** (edit) | Compat AI technician routes unchanged |
| New `modules/ai-veterinary-core/**` | **ALLOWED** | Assistant orchestration layer |
| Mount at `/api/ai/*` | **ALLOWED** | Foundation `{ success, data }` |
| Additive Prisma models | **ALLOWED** | Session, memory, triage, escalation, audit |
| External LLM SDK | **BLOCKED** (this phase) | `DEPENDENCY_FROZEN` — provider adapter + stub/rules engine |
| Autonomous diagnosis / Rx | **BLOCKED** | Safety policy |
| Auto doctor assignment | **BLOCKED** | Escalation queues review only |

---

## Modules

### AI_CHAT

| Field | Detail |
|-------|--------|
| **Purpose** | Farmer education, clarification, next-step guidance |
| **Inputs** | Message, locale (`bn`\|`en`), optional `caseId`, session id |
| **Outputs** | Assistant reply, refusal flag, human-redirect hint, session id |
| **Ownership** | `AiAssistantSession`, `AiAssistantMessage` |
| **Boundaries** | **Never** output diagnosis; safety layer enforces |
| **Rollback** | Remove mount; forward-fix sessions to `CLOSED` |

### AI_TRIAGE

| Field | Detail |
|-------|--------|
| **Purpose** | Risk bucketing for urgency guidance |
| **Inputs** | Symptoms, case id, history summary, media metadata |
| **Outputs** | `LOW` \| `MEDIUM` \| `HIGH`, recommendation, escalation flag |
| **Ownership** | `AiTriageRecord` |
| **Boundaries** | Never assign doctor; never close case |
| **Rollback** | Stop triage endpoint; records remain audit-only |

### AI_MEMORY

| Field | Detail |
|-------|--------|
| **Purpose** | Conversation, case context, preference recall |
| **Inputs** | User id, session id, kind, key, value |
| **Outputs** | Stored memory entries (filtered) |
| **Ownership** | `AiAssistantMemory` |
| **Exclude** | Hidden decision memory, diagnosis memory |
| **TTL** | Conversation 30d · case context 7d · preference 90d |
| **Deletion** | `DELETE /ai/memory` by kind/key or purge expired |
| **Rollback** | Disable writes; TTL job forward-fix |

### AI_ESCALATION

| Field | Detail |
|-------|--------|
| **Purpose** | Human handoff when risk/confidence/policy requires |
| **Triggers** | HIGH risk, emergency symptoms, low confidence, doctor request |
| **Actions** | Flag case metadata, queue review, handoff record |
| **Ownership** | `AiEscalationRecord` |
| **Boundaries** | **No automatic messaging** |
| **Rollback** | Mark escalations `DISMISSED` |

---

## Global Rules

| Rule | Enforcement |
|------|-------------|
| AI never replaces doctor | All responses include care disclaimer |
| HIGH risk → mandatory human path | Auto `escalationRequired` + escalation record |
| No autonomous treatment | Refusal layer blocks treatment/Rx language |
| No autonomous prescription | Guardrails + policy |
| No medical certainty | Refuse patterns: "you have", "diagnosis is", "prescribe" |

---

## API Contract

**Base path:** `/api/ai`  
**Envelope:** `{ success: true, data }` / `{ success: false, error }`  
**Auth:** `authMobile` (authenticated farmer/customer)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/chat` | Case-aware farmer chat |
| POST | `/triage` | Symptom risk assessment |
| GET | `/memory` | List user memory (filtered kinds) |
| DELETE | `/memory` | Delete memory by kind/key |
| POST | `/escalate` | Manual / policy escalation |

---

## AI Safety Layer

| Component | Role |
|-----------|------|
| Input guardrails | Block diagnosis requests phrasing |
| Output guardrails | Strip/replace diagnostic certainty |
| Confidence threshold | Below 0.55 → escalation flag (explicit in response) |
| Refusal layer | Return educational redirect |
| Human redirect | Suggest doctor visit / emergency |
| Audit logging | `AiSafetyAuditLog` — inputs/outputs metadata, no provider internals |

---

## Flutter Integration

**Path:** `pranidoctor_user/lib/core/ai/`

| File | Purpose |
|------|---------|
| `ai_dto.dart` | Chat, triage, memory, escalation DTOs |
| `ai_repository_contract.dart` | HTTP contract |
| `ai_conversation_model.dart` | Local conversation state |
| `ai_draft_contract.dart` | Offline message draft |

---

## Verification

```bash
npm run test -- --run src/modules/ai-veterinary-core
npm run build
npm run ai:verify
```

---

**Next:** [PHASE6_AI_IMPLEMENTATION.md](./PHASE6_AI_IMPLEMENTATION.md)
