# Phase 3 — Implementation Sequence

**Date:** 2026-05-21  
**Prerequisites:** [PHASE2_FREEZE.md](./PHASE2_FREEZE.md) (`PHASE2_PASS=YES`)  
**Plan:** [PHASE3_PLAN.md](./PHASE3_PLAN.md)

---

## Sign-off

```
PHASE3_READY=YES
MODULE_COUNT=5
IMPLEMENTATION_ORDER=P3-00,P3-01,P3-02,P3-03,P3-04,P3-05,P3-06,P3-07,P3-08,P3-09,P3-10,P3-11
```

---

## Module registry (5)

| # | Module ID | Package path (target) |
|---|-----------|------------------------|
| 1 | `lead` | `modules/lead/` |
| 2 | `assignment` | `modules/assignment/` |
| 3 | `doctor-queue` | `modules/doctor-queue/` |
| 4 | `case` | `modules/case/` |
| 5 | `timeline` | `modules/timeline/` |

**Cross-cutting:** compat adapters in each module's `compat/` folder; legacy `lib/*-service-requests/*` become thin re-exports.

---

## IMPLEMENTATION_ORDER

Execute in order. Run `p2:verify` + sample service-request smoke between waves.

| Step | ID | Work package | Depends on | Est. |
|------|-----|--------------|------------|------|
| 1 | **P3-00** | Baseline & golden snapshots | P2-11 | 0.5d |
| 2 | **P3-01** | `timeline` — schema + append service | P3-00 | 1d |
| 3 | **P3-02** | `lead` — CRM Lead table + foundation repo | P3-00 | 1d |
| 4 | **P3-03** | `lead` — ServiceRequest create/list (port legacy) | P3-01, P2 area | 1.5d |
| 5 | **P3-04** | `assignment` — transitions + admin assign | P3-01, P3-03 | 1.5d |
| 6 | **P3-05** | `doctor-queue` — list/detail queries | P3-04 | 1d |
| 7 | **P3-06** | `assignment` — doctor accept/reject/complete | P3-04, P3-05 | 1d |
| 8 | **P3-07** | `case` — TreatmentCase service | P3-06 | 1d |
| 9 | **P3-08** | Attachments + priority enum migration | P3-03 | 1d |
| 10 | **P3-09** | Timeline read APIs + note POST | P3-01, P3-04 | 1d |
| 11 | **P3-10** | Foundation `/api/leads` wire + convert | P3-02, P3-03 | 1d |
| 12 | **P3-11** | `p3:verify` + certificate + OpenAPI | P3-05–P3-10 | 1d |

**Total estimate:** ~11–12 engineering days (1 developer).

---

## Step details

### P3-00 — Baseline

**Tasks:**

1. Run `npm run p2:verify` and `npm run p1:12-verify` (optional) — record baseline.
2. Snapshot golden JSON: `POST /api/mobile/service-requests`, doctor list, assign-doctor.
3. Document legacy lib → route map.

**Exit:** `docs/P3_00_BASELINE.md` (create at implement time).

---

### P3-01 — timeline (core)

**Tasks:**

1. Migration: `ServiceRequestTimelineEvent` + enum.
2. `timeline.service.append(event)` — used by all transitions.
3. Hook `CREATED` on service-request create.

**Exit:** Unit tests for append + list by requestId.

---

### P3-02 — lead (CRM)

**Tasks:**

1. Migration: `Lead`, `LeadActivity` + enums.
2. Implement `modules/leads/leads.repository.ts` (Prisma).
3. Wire foundation `LeadsController` (no compat change yet).

**Exit:** `POST /api/leads` returns 201 (admin auth).

---

### P3-03 — lead (customer intake)

**Tasks:**

1. Create `modules/lead/lead.service.ts` — port `createServiceRequestForCustomer`.
2. Validate village via `modules/area`.
3. Refactor `mobile/service-requests/route.ts` to thin adapter.
4. Emit timeline `CREATED`.

**Exit:** Frozen mobile create/list responses match golden snapshot.

---

### P3-04 — assignment (admin)

**Tasks:**

1. `assignment.service.assignDoctor`, `assignTechnician`.
2. Port `admin-service-requests/service-request-assignment-service.ts`.
3. Timeline events: `ASSIGNED`, `REASSIGNED`.
4. Refactor admin assign routes.

**Exit:** Admin assign → doctor queue `tab=new`.

---

### P3-05 — doctor-queue

**Tasks:**

1. `doctor-queue.service.listForDoctor(tab, filters)`.
2. Port `doctor-service-request-service` list + detail reads.
3. Shared technician list helper.
4. Preserve `provider-assigned-list-tab` status mapping.

**Exit:** Doctor GET list unchanged shape; optional `priority` in DTO.

---

### P3-06 — assignment (doctor actions)

**Tasks:**

1. Port accept, reject, complete to `assignment.service`.
2. Timeline: `ACCEPTED`, `REJECTED`, `STARTED`, `COMPLETED`.
3. Refactor doctor action routes.

**Exit:** Full happy path PENDING → COMPLETED with timeline ≥ 4 events.

---

### P3-07 — case

**Tasks:**

1. `case.service.createForDoctor` — port `doctor-clinical-service`.
2. Timeline: `CASE_OPENED`.
3. Refactor `treatment-cases/route.ts`.

**Exit:** POST treatment-cases creates row; frozen response shape.

---

### P3-08 — attachments + priority

**Tasks:**

1. Migration: `ServiceRequestAttachment`, `RequestPriority`, upload purposes.
2. Link files on create; expose count on DTO.
3. Backfill priority from `isEmergency`.

**Exit:** Create with `attachmentFileIds` persists join rows.

---

### P3-09 — timeline (read APIs)

**Tasks:**

1. Add GET timeline routes (mobile, doctor, admin).
2. Optional POST note endpoint.
3. Role-based filtering (customer sees public events only).

**Exit:** Timeline GET returns ordered events.

---

### P3-10 — lead convert

**Tasks:**

1. `lead.service.convertToServiceRequest`.
2. Wire `POST /api/leads/{id}/convert`.
3. Link `leadId` on ServiceRequest.

**Exit:** CRM lead → customer request end-to-end.

---

### P3-11 — Verification & docs

**Tasks:**

1. Add `scripts/p3-verify.ts` (matrix from PHASE3_API_MAP §12).
2. `npm run p3:verify` in package.json.
3. `docs/PHASE3_EXECUTION.md`, `docs/PHASE3_CERTIFICATE.md`, `docs/PHASE3_FREEZE.md`.
4. Regenerate `docs/openapi.json`.

**Exit:** `P3_PASS=YES`, `PHASE4_READY=YES` (optional next phase flag).

---

## Parallelization

```
P3-00 ──┬──► P3-01 ──► P3-03 ──► P3-04 ──► P3-05 ──► P3-06 ──► P3-07
        ├──► P3-02 ───────────────────────────────► P3-10
        └──► P3-08 (after P3-03)
        P3-01 + P3-04 ──► P3-09
        All ──► P3-11
```

---

## Verification commands (exit gate)

```bash
cd pranidoctor-backend
npm run build
npm run p2:verify          # profile regression
npm run p3:verify          # Phase 3 matrix (create in P3-11)
npm run openapi:generate
npm run e2e:freeze
```

Optional:

```bash
P2_INCLUDE_P1=1 npm run p2:verify
npm run p1:12-verify
```

---

## Definition of done (Phase 3)

- [ ] All steps P3-00–P3-11 complete
- [ ] Five modules under `src/modules/{lead,assignment,doctor-queue,case,timeline}/`
- [ ] Compat service-request paths unchanged for frozen fields
- [ ] Timeline + attachments additive only
- [ ] `LeadsRepository` implemented
- [ ] `PHASE3_*` docs merged
- [ ] Mobile/web teams notified of timeline + attachment fields

---

## Output block (CI / README)

```
PHASE3_READY=YES
MODULE_COUNT=5
IMPLEMENTATION_ORDER=P3-00,P3-01,P3-02,P3-03,P3-04,P3-05,P3-06,P3-07,P3-08,P3-09,P3-10,P3-11
```
