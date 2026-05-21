# Phase 3 Freeze — Lead, Assignment, Case, Timeline

**Date:** 2026-05-21  
**Status:** **FROZEN (care pipeline slice)**  
**Prerequisites:** [PHASE2_FREEZE.md](./PHASE2_FREEZE.md) (`P2_PASS=YES`), [PHASE1_FREEZE.md](./PHASE1_FREEZE.md) (`P1_COMPLETE=YES`)  
**Certificate:** [PHASE3_CERTIFICATE.md](./PHASE3_CERTIFICATE.md)  
**Execution:** [PHASE3_EXECUTION.md](./PHASE3_EXECUTION.md)

---

## Sign-off

```
PHASE3_PASS=YES
PHASE4_READY=YES
P3_COMPLETE=YES
LEAD_PIPELINE_FROZEN=YES
```

---

## 1. What is frozen

### 1.1 Domain capabilities (no breaking changes without version bump)

| Domain | Frozen routes / behavior | Owner module |
|--------|--------------------------|--------------|
| **Lead create** | `POST /api/mobile/service-requests` — customer intake → `PENDING` + timeline `CREATED` | `modules/lead` |
| **Lead CRM** | `POST/GET/PATCH /api/leads`, assign, convert — foundation envelope | `modules/leads` |
| **Assign** | `POST /api/admin/service-requests/{id}/assign-doctor` (+ technician) → `ASSIGNED` + timeline | `modules/assignment` |
| **Accept** | `POST /api/doctor/service-requests/{id}/accept` → `ACCEPTED` + timeline | `modules/assignment` |
| **Reject** | `POST /api/doctor/service-requests/{id}/reject` → `REJECTED` + timeline | `modules/assignment` |
| **Case** | `POST /api/doctor/service-requests/{id}/treatment-cases` → `CASE_OPENED` + `IN_PROGRESS` | `modules/case` |
| **Resolve** | `POST /api/doctor/service-requests/{id}/complete` (+ billing) → `COMPLETED` + timeline | `legacy` complete + `modules/assignment` hook |
| **Doctor queue** | `GET /api/doctor/service-requests?tab=` — tab semantics unchanged | `modules/doctor-queue` |
| **Timeline** | Append-only events on transitions; frozen service-request DTO on compat routes | `modules/timeline` |

### 1.2 Additive surfaces (Phase 3 — clients may adopt optionally)

| Surface | Additive |
|---------|----------|
| `GET /api/mobile/service-requests/{id}/timeline` | Event list `{ requestId, events[] }` |
| `GET /api/doctor/service-requests/{id}/timeline` | Same shape |
| `GET /api/admin/service-requests/{id}/timeline` | Same shape |
| `ServiceRequest` (DB) | `priority`, `leadId`, `adminNote` |
| CRM | `Lead`, `LeadActivity` tables |

### 1.3 Still owned by Phase 1 + 2 (unchanged in P3)

- OTP, session, refresh, device registry
- `GET/PATCH /api/mobile/me`, locations, profile additive fields
- Panel login/logout envelopes

---

## 2. Backend modules (canonical)

```
src/modules/lead/           — customer service-request intake + DTO mapper
src/modules/assignment/     — assign, accept, reject, complete timeline hook
src/modules/doctor-queue/   — doctor assigned-request list by tab
src/modules/case/           — treatment case create + clinical access
src/modules/timeline/       — append + read ServiceRequestTimelineEvent
```

Foundation wiring:

- `modules/leads/leads.repository.ts` — Prisma CRM (no throw)

Compat adapters remain thin under `legacy/web/lib/*` and `legacy/web/routes/*`.

**Compat fix (frozen):** Express legacy router passes `req.params` as Next-style `context.params` (`modules/compat-web/next-adapter.ts`).

---

## 3. Verification baseline (re-run before Phase 4 work)

```bash
cd pranidoctor-backend
npm run build
npm run openapi:generate
npm run p3:verify
npm run p2:verify          # profile regression
npm run e2e:freeze
```

| Gate | Result (2026-05-21 freeze run) |
|------|--------------------------------|
| **Build** | PASS |
| **OpenAPI** | PASS (179 legacy paths) |
| **`p3:verify`** | **17/17** — `P3_PASS=YES` |
| **`p2:verify`** | **13/13** — `P2_PASS=YES` |
| **`e2e:freeze`** | 8/9 — web proxy skipped (web dev not on :3001) |

### 3.1 Care pipeline matrix (`p3:verify`)

| Step | Check | Timeline event | Result |
|------|-------|----------------|--------|
| **Lead create** | `POST /api/mobile/service-requests` | `CREATED` | PASS |
| **Assign** | `POST …/assign-doctor` | `ASSIGNED` | PASS |
| **Accept** | `POST …/accept` | `ACCEPTED` | PASS |
| **Case** | `POST …/treatment-cases` | `CASE_OPENED` | PASS |
| **Resolve** | `POST …/complete` (+ billing) | `COMPLETED` | PASS |
| **Timeline read** | `GET …/timeline` (mobile) | full chain | PASS |
| **CRM lead** | `POST /api/leads` | — | PASS |
| **Module** | `LeadsRepository.create` | — | PASS |

End-to-end timeline verified:

`CREATED → ASSIGNED → ACCEPTED → CASE_OPENED → COMPLETED`

---

## 4. Web (pranidoctor-web)

| Rule | Status |
|------|--------|
| API consumer only | FROZEN |
| No Prisma on web | FROZEN |
| Proxies pass-through compat routes | FROZEN |

Start web dev (`:3001`) before expecting `e2e:freeze` 9/9.

---

## 5. Phase 4 entry criteria

Phase 4 may proceed when:

1. This freeze doc sign-off holds (`PHASE3_PASS=YES`).
2. Phase 2 profile freeze remains valid (`P2_PASS=YES`).
3. Phase 1 auth freeze remains valid (`P1_COMPLETE=YES`).
4. No compat service-request route renames or envelope changes without explicit bump.

**Suggested Phase 4 scope (not started):** billing refinement, notifications, attachments, dispatch rules — see product roadmap.

---

## 6. Related documents

| Doc | Purpose |
|-----|---------|
| [PHASE3_PLAN.md](./PHASE3_PLAN.md) | Master plan |
| [PHASE3_API_MAP.md](./PHASE3_API_MAP.md) | Route ownership |
| [PHASE3_DB_MAP.md](./PHASE3_DB_MAP.md) | Schema |
| [PHASE3_SEQUENCE.md](./PHASE3_SEQUENCE.md) | Implementation order |
| [PHASE3_EXECUTION.md](./PHASE3_EXECUTION.md) | Implementation record |
| [PHASE3_CERTIFICATE.md](./PHASE3_CERTIFICATE.md) | Domain sign-off |
| [openapi.json](./openapi.json) | Generated contract snapshot (179 paths) |

---

## 7. Output block (CI / README)

```
PHASE3_PASS=YES
PHASE4_READY=YES
```
