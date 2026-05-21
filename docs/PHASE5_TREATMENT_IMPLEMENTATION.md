# PHASE 5 — TREATMENT WORKFLOW IMPLEMENTATION

**Date:** 2026-05-21  
**Role:** Principal Clinical Workflow Architect  
**Authority:** [PROJECT_FREEZE.md](./PROJECT_FREEZE.md) · Plan: [PHASE5_TREATMENT.md](./PHASE5_TREATMENT.md)  
**Repositories:** `pranidoctor-backend` (module) · `pranidoctor_user` (Flutter contract) · `pranidoctor-web/docs` (this report)

**Disambiguation:** Treatment workflow is a **new domain layer** over P3 clinical cases. Frozen **`modules/case/**`** and legacy doctor clinical routes were not modified.

---

## Summary

Delivered freeze-compliant treatment workflow with:

1. **State machine** — `ASSIGNED` → `CONSULTATION_STARTED` → `DIAGNOSED` → `PRESCRIBED` → `FOLLOWUP_PENDING` → `CLOSED`
2. **Sub-modules** — consultation, diagnosis (TreatmentCase), prescription, followup, notes
3. **Foundation API** at `/api/cases/*` with `{ success, data }` envelope
4. **Assigned-doctor-only mutations** via session + assignment guards
5. **Timeline audit** via append-only `ServiceRequestTimelineEvent`
6. **Additive migration** for workflow tables
7. **Flutter contracts** (DTOs, repository, offline draft/sync)
8. **17 unit tests** + `treatment:verify` gate

No billing, inventory, appointment, notification dispatch, or AI diagnosis.

---

## Verification

| Gate | Command | Result |
|------|---------|--------|
| Treatment tests | `npm run test -- --run src/modules/treatment-workflow` | **17/17 PASS** |
| Build | `npm run build` | **PASS** |
| Treatment verify | `npm run treatment:verify` | **8/8 PASS** |

```
TREATMENT_WORKFLOW_VERIFY=PASS
TREATMENT_COMPLETE=YES
FREEZE_COMPLIANT=YES
```

---

## REPORT

### Created

| Component | Path |
|-----------|------|
| Module | `src/modules/treatment-workflow/treatment-workflow.module.ts` |
| Service | `src/modules/treatment-workflow/treatment-workflow.service.ts` |
| Controller | `src/modules/treatment-workflow/treatment-workflow.controller.ts` |
| Routes | `src/modules/treatment-workflow/treatment-workflow.routes.ts` |
| Types | `src/modules/treatment-workflow/treatment-workflow.types.ts` |
| Workflow transitions | `src/modules/treatment-workflow/domain/workflow.transitions.ts` |
| Mapper | `src/modules/treatment-workflow/domain/treatment.mapper.ts` |
| Access guard | `src/modules/treatment-workflow/guards/treatment-access.guard.ts` |
| Verify script | `scripts/treatment-verify.ts` |
| Plan doc | `docs/PHASE5_TREATMENT.md` |
| Flutter DTOs | `pranidoctor_user/lib/core/treatment/treatment_dto.dart` |
| Flutter repository | `pranidoctor_user/lib/core/treatment/treatment_repository_contract.dart` |
| Flutter offline draft | `pranidoctor_user/lib/core/treatment/treatment_draft_contract.dart` |

### Endpoints

All mounted under **`/api/cases`** · `authDoctor` + `requireRole('DOCTOR')`:

| Method | Path | Action |
|--------|------|--------|
| GET | `/:id/treatment` | View treatment aggregate |
| POST | `/:id/consultation` | Start consultation |
| POST | `/:id/diagnosis` | Record diagnosis |
| POST | `/:id/prescription` | Create prescription |
| POST | `/:id/followup` | Schedule followup |
| POST | `/:id/close` | Close workflow |
| GET | `/:id/notes` | List notes (visibility-filtered) |
| POST | `/:id/notes` | Append note |

**Case id:** `:id` = `ServiceRequest.id` (P3 clinical case key).

### Entities

| Entity | Table | Purpose |
|--------|-------|---------|
| `TreatmentWorkflow` | `TreatmentWorkflow` | Workflow state machine (1:1 service request) |
| `TreatmentConsultation` | `TreatmentConsultation` | Observations + attachment refs |
| `TreatmentCase` | `TreatmentRecord` (existing) | Diagnosis record (reused) |
| `Prescription` / `PrescriptionItem` | existing | Prescription abstraction |
| `TreatmentFollowup` | `TreatmentFollowup` | Followup schedule + history |
| `TreatmentNote` | `TreatmentNote` | PRIVATE / SHARED / AUDIT notes |

### Workflow

```
ASSIGNED
  → CONSULTATION_STARTED   POST /consultation
  → DIAGNOSED              POST /diagnosis
  → PRESCRIBED             POST /prescription
  → FOLLOWUP_PENDING       POST /followup
  → CLOSED                 POST /close

PRESCRIBED → CLOSED        POST /close (skip followup)
```

**Guards:** assigned doctor only · valid request status · strict transition · closed workflow rejects mutations.

**Audit:** `CASE_OPENED`, `CASE_UPDATED`, `COMPLETED` timeline events with workflow metadata.

### Migration

| Item | Detail |
|------|--------|
| Migration | `20260521200000_phase5_treatment_workflow` |
| New enums | `TreatmentWorkflowStatus`, `TreatmentFollowupStatus`, `TreatmentNoteType` |
| New tables | `TreatmentWorkflow`, `TreatmentConsultation`, `TreatmentFollowup`, `TreatmentNote` |
| Existing tables | `TreatmentCase`, `Prescription` — unchanged schema, reused by layer |

### Blocked

| Item | Reason |
|------|--------|
| Edit `modules/case/**` | P3 freeze |
| Edit legacy doctor routes | API freeze |
| Payment / billing | Out of scope |
| Medicine inventory / stock | Out of scope |
| Appointment / checkout | Out of scope |
| AI diagnosis | Out of scope |
| Notification sending | Out of scope (followup metadata only) |

### Compatibility

| Surface | Policy |
|---------|--------|
| `modules/case/case.service.ts` | **Unchanged** — legacy create path preserved |
| `POST /api/doctor/service-requests/:id/treatment-cases` | **Unchanged** |
| `POST /api/doctor/service-requests/:id/prescriptions` | **Unchanged** |
| Foundation `/api/cases/*` | **New additive surface** |
| P3 timeline append-only | **Preserved** — treatment layer appends only |

---

## Tests

| Suite | File | Coverage |
|-------|------|----------|
| Workflow transitions | `domain/workflow.transitions.test.ts` | State machine rules |
| Access / permission | `guards/treatment-access.guard.test.ts` | Doctor assignment guard |
| Mapper | `domain/treatment.mapper.test.ts` | DTO mapping |
| Service | `treatment-workflow.service.test.ts` | Consultation, diagnosis, Rx, followup, notes guards |
| API routes | `treatment-workflow.routes.test.ts` | Endpoint registration |

---

## Module wiring

`src/modules/index.ts` mounts `createTreatmentWorkflowModule()` as module name `'cases'` → `/api/cases/*`.

---

## Next steps (optional, not in scope)

- Integration tests against live DB with assigned doctor session
- Flutter Dio `TreatmentRepository` implementation
- Customer read-only treatment summary endpoint (separate phase)
