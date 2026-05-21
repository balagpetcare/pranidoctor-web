# Phase 3 — Database Map (Lead, Case, Assignment, Timeline)

**Date:** 2026-05-21  
**Schema owner:** `pranidoctor-backend/prisma/schema.prisma`  
**Policy:** Additive only — no drops, no enum removals, no NOT NULL without default

---

## 1. Canonical entities (existing)

### 1.1 `ServiceRequest` — operational lead / request

| Column | Type | Phase 3 use |
|--------|------|-------------|
| `id` | cuid | PK — timeline + case FK |
| `customerId` | FK → `CustomerProfile` | Farmer owner |
| `animalId` | FK → `AnimalProfile` | Required on create |
| `serviceCategoryId` | FK | Category slug validation |
| `serviceType` | `ServiceRequestType` | DOCTOR_HOME_VISIT, EMERGENCY, AI_SERVICE, … |
| `status` | `ServiceRequestStatus` | State machine (assignment module) |
| `assignedDoctorId` | FK? | Doctor assignment |
| `assignedTechnicianId` | FK? | Technician assignment |
| `villageId` / `areaId` | FK? | Location (prefer village — P2) |
| `locationText` | string? | Free-form notes |
| `problemOrSymptom` | string? | Primary symptom text |
| `description` | string? | Extended notes |
| `urgency` | string? | Legacy — migrate to enum |
| `isEmergency` | bool | Priority signal |
| `assignedAt`, `startedAt`, `completedAt`, `cancelledAt` | DateTime? | Denormalized timestamps |

**Indexes (existing):** `status`, `customerId`, `assignedDoctorId+status`, `villageId`

### 1.2 `TreatmentCase` — clinical case (`TreatmentRecord` table)

| Column | Type | Notes |
|--------|------|-------|
| `serviceRequestId` | FK | Required |
| `doctorId` / `aiTechnicianId` | FK? | Provider |
| `animalId` | FK | Same animal as request |
| `status` | `TreatmentCaseStatus` | DRAFT, FINALIZED, CANCELLED |
| `chiefComplaint`, `diagnosis`, `treatmentNotes`, … | text? | Clinical fields |

### 1.3 `UploadedFile` — storage metadata

Used by media module. Phase 3 links to requests via join table (not direct FK on file today).

---

## 2. Additive schema (Phase 3 — recommended)

### 2.1 CRM `Lead` table (foundation intake — path B)

```prisma
model Lead {
  id              String       @id @default(cuid())
  phone           String
  name            String?
  source          LeadSource   @default(OTHER)
  status          LeadStatus   @default(NEW)
  priority        LeadPriority @default(MEDIUM)
  assignedAdminId String?
  animalType      String?
  concern         String?
  notes           String?
  villageId       String?
  /// Set when converted to registered customer flow
  convertedUserId String?
  serviceRequestId String?     @unique
  convertedAt     DateTime?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  village         Village?     @relation(fields: [villageId], references: [id])
  serviceRequest  ServiceRequest? @relation(fields: [serviceRequestId], references: [id])
  activities      LeadActivity[]

  @@index([phone])
  @@index([status])
  @@index([assignedAdminId])
}

model LeadActivity {
  id           String           @id @default(cuid())
  leadId       String
  activityType LeadActivityType
  description  String
  performedBy  String
  createdAt    DateTime         @default(now())
  lead         Lead             @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@index([leadId])
}
```

**Enums** (align with `modules/leads/leads.types.ts`):

```prisma
enum LeadSource {
  AI_CHAT PHONE WEBSITE REFERRAL SOCIAL_MEDIA WALK_IN OTHER
}
enum LeadStatus {
  NEW CONTACTED QUALIFIED CONSULTATION_SCHEDULED CONVERTED LOST FOLLOW_UP
}
enum LeadPriority {
  LOW MEDIUM HIGH URGENT
}
enum LeadActivityType {
  CREATED CALLED MESSAGED STATUS_CHANGED ASSIGNED NOTE_ADDED CONVERTED
}
```

### 2.2 `ServiceRequest` additive columns (P3-03)

```prisma
model ServiceRequest {
  // ... existing
  leadId       String?        @unique
  lead         Lead?          @relation(fields: [leadId], references: [id])
  priority     RequestPriority @default(NORMAL)
  adminNote    String?        /// Internal admin-only
  timelineEvents ServiceRequestTimelineEvent[]
  attachments  ServiceRequestAttachment[]
}

enum RequestPriority {
  LOW NORMAL HIGH EMERGENCY
}
```

**Migration rule:** Backfill `priority = EMERGENCY` where `isEmergency = true`; else `NORMAL`.

### 2.3 Timeline (P3-07)

```prisma
model ServiceRequestTimelineEvent {
  id               String                    @id @default(cuid())
  serviceRequestId String
  eventType        ServiceRequestEventType
  actorUserId      String?
  actorRole        UserRole?
  note             String?
  metadataJson     Json?
  createdAt        DateTime                  @default(now())
  serviceRequest   ServiceRequest            @relation(fields: [serviceRequestId], references: [id], onDelete: Cascade)

  @@index([serviceRequestId, createdAt])
}

enum ServiceRequestEventType {
  CREATED
  ASSIGNED
  REASSIGNED
  ACCEPTED
  REJECTED
  STARTED
  NOTE_ADDED
  ATTACHMENT_ADDED
  CASE_OPENED
  CASE_UPDATED
  COMPLETED
  CANCELLED
}
```

**Write rule:** Insert in same transaction as status change (assignment module).

### 2.4 Attachments (P3-04)

```prisma
model ServiceRequestAttachment {
  id               String         @id @default(cuid())
  serviceRequestId String
  uploadedFileId   String
  sortOrder        Int            @default(0)
  caption          String?
  createdAt        DateTime       @default(now())
  serviceRequest   ServiceRequest @relation(fields: [serviceRequestId], references: [id], onDelete: Cascade)
  uploadedFile     UploadedFile   @relation(fields: [uploadedFileId], references: [id], onDelete: Restrict)

  @@unique([serviceRequestId, uploadedFileId])
  @@index([serviceRequestId])
}
```

**Extend `MobileUploadPurpose`:**

```prisma
enum MobileUploadPurpose {
  // ... existing
  SERVICE_REQUEST_SYMPTOM_PHOTO
  SERVICE_REQUEST_DOCUMENT
}
```

---

## 3. Entity relationship diagram

```
CustomerProfile ──< ServiceRequest >── DoctorProfile (assignedDoctor)
       │                    │
       │                    ├──< TreatmentCase
       │                    ├──< ServiceRequestTimelineEvent
       │                    ├──< ServiceRequestAttachment >── UploadedFile
       │                    │
AnimalProfile ───────────────┤
Village ─────────────────────┤
Lead (optional) ─────────────┘  (1:1 via leadId / serviceRequestId)
```

---

## 4. Role → table access

| Role | Read | Write |
|------|------|-------|
| Customer | Own `ServiceRequest`, timeline, attachments | Create request, cancel, add notes (timeline) |
| Doctor | Assigned requests, cases, timeline | Accept/reject, case, complete |
| Technician | Assigned AI requests | Parallel to doctor for AI_SERVICE |
| Admin | All requests, leads, timeline | Assign, CRM lead, internal notes |

---

## 5. Location strategy (P2 + P3)

| Field | Source |
|-------|--------|
| `villageId` | Customer picker / profile `primaryVillageId` default |
| `areaId` | Legacy Area tree (compat) |
| `locationText` | Free text override |
| Timeline metadata | Snapshot `{ villageLabelBn, divisionId, … }` on CREATED |

Validate via `modules/area` `AreaCatalogService`.

---

## 6. Priority mapping

| Input | Stored |
|-------|--------|
| `isEmergency: true` | `priority: EMERGENCY` |
| `urgency: "high"` (legacy) | `priority: HIGH` |
| Default | `NORMAL` |

Expose `priority` on DTO (additive); keep `isEmergency` for compat.

---

## 7. Migration waves

| Step | Migration | Risk |
|------|-----------|------|
| P3-02 | `Lead`, `LeadActivity` + enums | Low — new tables |
| P3-03 | `ServiceRequest.priority`, `adminNote`, `leadId` | Low — nullable |
| P3-04 | `ServiceRequestAttachment` + upload purpose enum | Low |
| P3-07 | `ServiceRequestTimelineEvent` + enum | Low |
| P3-08 | Backfill timeline from existing rows (script) | Medium — one-time |

**No migration** merging `ServiceRequest` into a new name.

---

## 8. Foundation module alignment

| Foundation type | Prisma model |
|-----------------|--------------|
| `modules/leads/leads.types.Lead` | `Lead` |
| `modules/leads/leads.types.LeadActivity` | `LeadActivity` |
| Assignment transitions | `ServiceRequest.status` + timeline |
| Case | `TreatmentCase` |

---

## 9. Out of scope (DB)

- Billing schema changes
- Merging `AiServiceRequest` into `ServiceRequest` (later phase)
- Dropping `areaId` from ServiceRequest
