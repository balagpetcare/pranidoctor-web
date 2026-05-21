# PHASE 5 — TREATMENT WORKFLOW

**Document type:** Clinical workflow architecture plan  
**Date:** 2026-05-21  
**Authority:** [PROJECT_FREEZE.md](./PROJECT_FREEZE.md) — freeze rules **override** all work  
**Prerequisites:** [PHASE1_PLAN.md](./PHASE1_PLAN.md), [PHASE2_AUTH.md](./PHASE2_AUTH.md), [PHASE2_AREA.md](./PHASE2_AREA.md), Phase 3 care pipeline (P3 frozen), Phase 4 case layer (read-only contract)  
**Implementation repo:** `pranidoctor-backend/src/modules/treatment-workflow/` (**new**, additive)

**Naming note:** Treatment workflow is a **domain layer over clinical cases** (`ServiceRequest` + `TreatmentCase`). It does **not** redesign the P3 Case Engine (`modules/case/**`).

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
| `modules/case/**` | **BLOCKED** (edit) | P3 frozen — import read-only helpers only |
| `modules/{lead,assignment,timeline,doctor-queue}/**` | **BLOCKED** (edit) | P3 frozen |
| `legacy/web/routes/**` | **BLOCKED** (edit) | Compat doctor clinical routes unchanged |
| New `modules/treatment-workflow/**` | **ALLOWED** | Platform treatment layer |
| Additive `/api/cases/*` foundation routes | **ALLOWED** | `{ success, data }` envelope |
| Additive Prisma models | **ALLOWED** | Workflow, consultation, followup, notes |
| Existing `TreatmentCase`, `Prescription` | **CONDITIONAL** | Read/write via treatment layer — preserve IDs |
| Payment / billing / inventory | **BLOCKED** | Out of scope |
| Appointment / checkout / AI diagnosis | **BLOCKED** | Out of scope |
| Notification dispatch | **BLOCKED** | Followup stores reminder metadata only |

---

## Modules

### CONSULTATION

| Field | Detail |
|-------|--------|
| **Responsibilities** | Consultation record, observations, attachment references |
| **Ownership** | `TreatmentConsultation` rows owned by `treatment-workflow` |
| **Lifecycle** | Created on `POST /cases/:id/consultation`; immutable after write |
| **Boundaries** | No billing; attachment refs only (UploadedFile ids) |
| **Dependencies** | `TreatmentWorkflow`, assigned-doctor guard, timeline `CASE_OPENED` |
| **Rollback** | Delete module tables forward-fix only; deactivate via workflow close |

### PRESCRIPTION

| Field | Detail |
|-------|--------|
| **Responsibilities** | Prescription header + items (medicine, dosage, duration, warnings) |
| **Ownership** | Uses existing `Prescription` / `PrescriptionItem` tables |
| **Lifecycle** | Created on `POST /cases/:id/prescription` when workflow is `DIAGNOSED` |
| **Boundaries** | Abstraction only — **no inventory**, no stock deduction |
| **Dependencies** | Diagnosis step, `PrescriptionStatus.ACTIVE` |
| **Rollback** | Void prescription via existing enum (not in this phase API) |

### FOLLOWUP

| Field | Detail |
|-------|--------|
| **Responsibilities** | Next followup date, reminder note, followup history |
| **Ownership** | `TreatmentFollowup` rows |
| **Lifecycle** | Created on `POST /cases/:id/followup`; status `PENDING` → `COMPLETED` on close |
| **Boundaries** | **No notification sending** — metadata only |
| **Dependencies** | Post-prescription workflow state |
| **Rollback** | Mark followup `CANCELLED` on workflow close |

### NOTES

| Field | Detail |
|-------|--------|
| **Responsibilities** | Private, shared, and audit notes |
| **Ownership** | `TreatmentNote` rows |
| **Lifecycle** | Append-only via `POST /cases/:id/notes` |
| **Boundaries** | No cross-module writes; notes module only writes `TreatmentNote` |
| **Dependencies** | Workflow must exist; private notes visible only to author doctor |
| **Rollback** | Append-only — no delete in MVP |

---

## Workflow

**Case id:** `:id` = `ServiceRequest.id` (P3 clinical case key).

### States

```
ASSIGNED
  → CONSULTATION_STARTED   (POST consultation)
  → DIAGNOSED              (POST diagnosis)
  → PRESCRIBED             (POST prescription)
  → FOLLOWUP_PENDING       (POST followup)
  → CLOSED                 (POST close)
```

Shortcut: `PRESCRIBED → CLOSED` when no followup required.

### Doctor capabilities

| Action | Endpoint | From state |
|--------|----------|------------|
| View | GET `/cases/:id/treatment` | any (assigned) |
| Consult | POST `/cases/:id/consultation` | `ASSIGNED` |
| Diagnose | POST `/cases/:id/diagnosis` | `CONSULTATION_STARTED` |
| Prescribe | POST `/cases/:id/prescription` | `DIAGNOSED` |
| Schedule followup | POST `/cases/:id/followup` | `PRESCRIBED` |
| Close | POST `/cases/:id/close` | `PRESCRIBED` or `FOLLOWUP_PENDING` |

### Guards

| Guard | Rule |
|-------|------|
| Session | `authDoctor` + `requireRole(DOCTOR)` |
| Assignment | `assignedDoctorId === doctorProfile.id` |
| Request status | `ASSIGNED`, `ACCEPTED`, or `IN_PROGRESS` |
| Transition | Strict state machine — invalid transition → `409 WORKFLOW_INVALID_STATE` |
| Mutation lock | `CLOSED` workflow rejects all mutating endpoints |

### Audit events (timeline append-only)

| Step | `ServiceRequestEventType` | Metadata |
|------|---------------------------|----------|
| Consultation | `CASE_OPENED` | `{ workflowStatus, consultationId }` |
| Diagnosis | `CASE_UPDATED` | `{ workflowStatus, treatmentCaseId }` |
| Prescription | `CASE_UPDATED` | `{ workflowStatus, prescriptionId }` |
| Followup | `CASE_UPDATED` | `{ workflowStatus, followupId }` |
| Close | `COMPLETED` | `{ workflowStatus }` |

### Permission checks

- Resolve `doctorProfileId` from `req.user.id` via `DoctorProfile.userId`
- Reject if doctor profile missing → `403 DOCTOR_PROFILE_REQUIRED`
- Reject if not assigned → `404 CASE_NOT_FOUND` (no enumeration)

---

## Consultation Module

| Field | Support |
|-------|---------|
| Consultation record | `TreatmentConsultation` |
| Observations | `observations` text |
| Diagnosis summary (draft) | `diagnosisSummary` text |
| Attachments | `attachmentRefs` JSON array of `{ fileId, label? }` |

No billing fields.

---

## Prescription Module

| Field | Support |
|-------|---------|
| Header | `instructions`, `validUntil`, `warnings` (header-level string) |
| Items | `medicineName`, `dosage`, `duration`, `instruction`, `quantity` |
| Abstraction | Maps to `Prescription` + `PrescriptionItem` — no formulary/inventory |

---

## Followup Module

| Field | Support |
|-------|---------|
| Next followup | `scheduledAt` |
| Reminders | `reminderNote` (not dispatched) |
| History | `TreatmentFollowup[]` per case |

---

## Notes Module

| Type | Visibility |
|------|------------|
| `PRIVATE` | Author doctor only |
| `SHARED` | Assigned doctor (future: care team) |
| `AUDIT` | Immutable audit trail entry |

---

## API Contract

**Base path:** `/api/cases`  
**Envelope:** `{ success: true, data }` / `{ success: false, error }`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/:id/treatment` | Full treatment aggregate (workflow + consultation + diagnosis + Rx + followups) |
| POST | `/:id/consultation` | Start consultation |
| POST | `/:id/diagnosis` | Record diagnosis (upserts `TreatmentCase`) |
| POST | `/:id/prescription` | Create prescription |
| POST | `/:id/followup` | Schedule followup |
| POST | `/:id/close` | Close treatment workflow |
| GET | `/:id/notes` | List notes (filtered by visibility) |
| POST | `/:id/notes` | Append note |

**Auth:** Bearer doctor token (`authDoctor`).

### GET treatment response

```json
{
  "success": true,
  "data": {
    "caseId": "service-request-cuid",
    "workflowStatus": "PRESCRIBED",
    "consultations": [],
    "diagnosis": { "treatmentCaseId": "...", "diagnosis": "...", "symptoms": "..." },
    "prescriptions": [],
    "followups": [],
    "closedAt": null
  }
}
```

---

## Cache Strategy

Treatment workflow is **transactional** — no Redis cache in Phase 5. Read path uses Prisma with indexed lookups on `serviceRequestId`.

---

## Flutter Integration

**Path:** `pranidoctor_user/lib/core/treatment/`

| File | Purpose |
|------|---------|
| `treatment_dto.dart` | Workflow, consultation, prescription, followup, note DTOs |
| `treatment_repository_contract.dart` | HTTP contract mirroring `/api/cases/*` |
| `treatment_draft_contract.dart` | Offline draft + sync queue contract |

**Offline draft:** local Hive box `treatment_draft_v1` — queue consultation/diagnosis/prescription drafts until sync.

---

## Database (additive)

| Model | Purpose |
|-------|---------|
| `TreatmentWorkflow` | State machine per service request |
| `TreatmentConsultation` | Consultation records |
| `TreatmentFollowup` | Followup scheduling + history |
| `TreatmentNote` | Private/shared/audit notes |

Reuses: `TreatmentCase`, `Prescription`, `PrescriptionItem`.

---

## Compatibility

| Surface | Policy |
|---------|--------|
| Legacy `POST /api/doctor/service-requests/:id/treatment-cases` | **Unchanged** |
| Legacy `POST .../prescriptions` | **Unchanged** |
| P3 `modules/case/**` | **Unchanged** |
| Foundation `/api/cases/*` | **New additive surface** |

---

## Verification

```bash
npm run test -- --run src/modules/treatment-workflow
npm run build
npm run treatment:verify
```

---

**Next:** [PHASE5_TREATMENT_IMPLEMENTATION.md](./PHASE5_TREATMENT_IMPLEMENTATION.md)
