# Phase 3 — API Map (Lead, Case, Assignment, Timeline)

**Date:** 2026-05-21  
**Envelope:** Compat `{ ok, data }` unless noted. Foundation `{ success, data }`.  
**OpenAPI source:** [openapi.json](./openapi.json)

---

## 1. Legend

| Owner | Meaning |
|-------|---------|
| **FROZEN** | Path + success shape locked — additive `data` fields only |
| **COMPAT-P3** | Compat route; handler refactored to Phase 3 module |
| **FOUNDATION** | Express `/api/leads` |
| **ADDITIVE-P3** | New path or new fields — optional for clients |
| **AUTH-P1** | Phase 1 auth — reuse only |
| **PROFILE-P2** | Phase 2 profile/area — reuse only |

---

## 2. End-to-end flow (API chain)

```
Customer                    Admin                      Doctor
   │                          │                          │
   │ POST mobile/service-requests                         │
   │ ─────────────────────────► PENDING                   │
   │                          │ POST assign-doctor       │
   │                          │ ───────► ASSIGNED        │
   │                          │                          │ GET service-requests?tab=new
   │                          │                          │ POST accept → ACCEPTED/IN_PROGRESS
   │                          │                          │ POST treatment-cases → Case
   │                          │                          │ POST complete → COMPLETED
   │ GET …/timeline (additive)│ GET admin …/timeline     │ GET doctor …/timeline
```

---

## 3. Customer (farmer) — lead intake

| Method | Path | Owner | Auth | Phase 3 module |
|--------|------|-------|------|----------------|
| POST | `/api/mobile/service-requests` | FROZEN | Bearer | `lead` → create |
| GET | `/api/mobile/service-requests` | FROZEN | Bearer | `lead` → list |
| GET | `/api/mobile/service-requests/{id}` | FROZEN | Bearer | `lead` → detail |
| POST | `/api/mobile/service-requests/{id}/cancel` | FROZEN | Bearer | `assignment` → cancel |
| GET | `/api/mobile/service-requests/{id}/timeline` | **ADDITIVE-P3** | Bearer | `timeline` → read |

**POST body (frozen core):**

```json
{
  "animalId": "string",
  "serviceCategoryId": "string",
  "serviceType": "DOCTOR_HOME_VISIT",
  "problemOrSymptom": "string",
  "description": "string?",
  "villageId": "string?",
  "areaId": "string?",
  "locationText": "string?",
  "preferredTime": "string?",
  "scheduledStart": "ISO8601?",
  "scheduledEnd": "ISO8601?"
}
```

**POST additive (Phase 3):**

```json
{
  "attachmentFileIds": ["uploadedFileId"],
  "priority": "HIGH"
}
```

**Response DTO (frozen fields preserved):** existing `toServiceRequestDto` keys.

**Additive response fields:**

```json
{
  "priority": "NORMAL",
  "attachmentCount": 0,
  "timelinePreview": [{ "eventType": "CREATED", "createdAt": "…" }]
}
```

---

## 4. Admin — assignment & CRM leads

### 4.1 Service requests (operational)

| Method | Path | Owner | Auth | Module |
|--------|------|-------|------|--------|
| GET | `/api/admin/service-requests` | COMPAT-P3 | Admin cookie | `lead` list all |
| GET | `/api/admin/service-requests/{id}` | COMPAT-P3 | Admin cookie | `lead` detail |
| POST | `/api/admin/service-requests/{id}/assign-doctor` | FROZEN | Admin cookie | `assignment` |
| POST | `/api/admin/service-requests/{id}/assign-technician` | FROZEN | Admin cookie | `assignment` |
| GET | `/api/admin/service-requests/{id}/timeline` | ADDITIVE-P3 | Admin cookie | `timeline` |
| PATCH | `/api/admin/service-requests/{id}` | ADDITIVE-P3 | Admin cookie | `assignment` + `adminNote` |

**assign-doctor body (frozen):**

```json
{ "doctorProfileId": "string" }
```

### 4.2 Foundation CRM leads

| Method | Path | Owner | Auth | Module |
|--------|------|-------|------|--------|
| POST | `/api/leads` | FOUNDATION | Admin JWT / future | `lead` |
| GET | `/api/leads` | FOUNDATION | Admin | `lead` |
| GET | `/api/leads/{id}` | FOUNDATION | Admin | `lead` |
| PATCH | `/api/leads/{id}` | FOUNDATION | Admin | `lead` |
| POST | `/api/leads/{id}/assign` | FOUNDATION | Admin | `lead` |
| POST | `/api/leads/{id}/convert` | FOUNDATION | Admin | `lead` → ServiceRequest |
| GET | `/api/leads/{id}/activities` | FOUNDATION | Admin | `lead` |

**Convert creates:** `User` (if needed) + `CustomerProfile` + `ServiceRequest` + links `leadId`.

---

## 5. Doctor — queue & case

| Method | Path | Owner | Auth | Module |
|--------|------|-------|------|--------|
| GET | `/api/doctor/service-requests` | FROZEN | Doctor cookie | `doctor-queue` |
| GET | `/api/doctor/service-requests/{id}` | FROZEN | Doctor cookie | `doctor-queue` + detail |
| POST | `/api/doctor/service-requests/{id}/accept` | FROZEN | Doctor cookie | `assignment` |
| POST | `/api/doctor/service-requests/{id}/reject` | FROZEN | Doctor cookie | `assignment` |
| POST | `/api/doctor/service-requests/{id}/complete` | FROZEN | Doctor cookie | `assignment` |
| POST | `/api/doctor/service-requests/{id}/treatment-cases` | FROZEN | Doctor cookie | `case` |
| GET | `/api/doctor/service-requests/{id}/timeline` | ADDITIVE-P3 | Doctor cookie | `timeline` |

**GET query (frozen):**

| Param | Values |
|-------|--------|
| `tab` | `new` \| `active` \| `completed` |
| `limit`, `offset` | pagination |

**Queue sort (additive):** `sort=priority` → emergency first.

---

## 6. Technician — parallel queue

| Method | Path | Owner | Auth | Module |
|--------|------|-------|------|--------|
| GET | `/api/technician/service-requests` | FROZEN | Tech cookie | `doctor-queue` (shared) |
| GET | `/api/technician/service-requests/{id}` | FROZEN | Tech cookie | `doctor-queue` |
| POST | `/api/technician/service-requests/{id}/accept` | COMPAT-P3* | Tech cookie | `assignment` |
| GET | `/api/technician/service-requests/{id}/timeline` | ADDITIVE-P3 | Tech cookie | `timeline` |

\*Accept route may exist or be added — verify OpenAPI at implement time; do not break existing technician list.

---

## 7. Timeline API (additive contract)

**GET** `…/service-requests/{id}/timeline`

**Response:**

```json
{
  "ok": true,
  "data": {
    "requestId": "cuid",
    "events": [
      {
        "id": "cuid",
        "eventType": "CREATED",
        "actorRole": "CUSTOMER",
        "actorDisplayName": "string?",
        "note": "string?",
        "metadata": {},
        "createdAt": "ISO8601"
      }
    ]
  }
}
```

**POST** `…/timeline/notes` (optional P3-09):

```json
{ "note": "string" }
```

Roles: customer (own request), doctor (assigned), admin (all).

---

## 8. Attachments

| Method | Path | Owner | Module |
|--------|------|-------|--------|
| POST | `/api/mobile/uploads` | FROZEN* | `media` — purpose `SERVICE_REQUEST_SYMPTOM_PHOTO` |
| POST | `/api/mobile/service-requests` | COMPAT-P3 | `lead` — link `attachmentFileIds` |

\*Extend purpose enum; upload envelope frozen.

---

## 9. Priority & location fields

| Field | Where | Owner |
|-------|-------|-------|
| `priority` | Request DTO (additive) | `lead` |
| `isEmergency` | Request DTO (frozen) | compat |
| `villageId` | Create body | `lead` + `area` validate |
| `locationText` | Create body (frozen) | `lead` |
| `problemOrSymptom`, `description` | Create body (frozen) | `lead` |

---

## 10. Module ownership matrix

| Route group | lead | assignment | doctor-queue | case | timeline |
|-------------|------|------------|--------------|------|----------|
| mobile/service-requests | ● | ● cancel | — | — | ● read |
| admin/service-requests | ● list | ● assign | — | — | ● read |
| doctor/service-requests | — | ● accept/reject/complete | ● list | ● treatment | ● read |
| technician/service-requests | — | ● | ● list | — | ● read |
| /api/leads | ● CRM | — | — | — | ● activities |

---

## 11. Error codes (additive catalog)

| Code | HTTP | When |
|------|------|------|
| `INVALID_TRANSITION` | 409 | Status change not allowed |
| `INVALID_ASSIGNEE` | 422 | Doctor/tech not eligible |
| `NOT_FOUND` | 404 | Request/lead missing |
| `FORBIDDEN` | 403 | Wrong role or not assignee |
| `TERMINAL_STATUS` | 409 | Assign on COMPLETED/CANCELLED |
| `INVALID_VILLAGE` | 422 | villageId FK (from P2 area module) |

Reuse P1 compat envelope; messages via `Accept-Language` on non-auth paths.

---

## 12. Verification matrix (for `p3:verify`)

| # | Domain | Check |
|---|--------|-------|
| 1 | register/customer | Auth still works (P1 regression sample) |
| 2 | lead | POST mobile service-request → PENDING |
| 3 | area | villageId on create validated |
| 4 | assignment | Admin assign-doctor → ASSIGNED |
| 5 | doctor-queue | Doctor GET tab=new includes request |
| 6 | assignment | Doctor accept → IN_PROGRESS or ACCEPTED |
| 7 | case | POST treatment-cases → row created |
| 8 | timeline | GET timeline ≥ 2 events (CREATED, ASSIGNED) |
| 9 | language | Error message Accept-Language on validation |
| 10 | resolution | Doctor complete → COMPLETED |
| 11 | technician | Tech list assigned (if seed) |
| 12 | foundation | POST /api/leads (admin) → 201 |

---

## 13. Foundation vs compat summary

| Client | Primary API |
|--------|-------------|
| Flutter farmer | `/api/mobile/service-requests/*` |
| Doctor panel | `/api/doctor/service-requests/*` |
| Technician panel | `/api/technician/service-requests/*` |
| Admin panel | `/api/admin/service-requests/*` + optional `/api/leads` |
| Integrators | `/api/leads` foundation |

**Rule:** Phase 3 implements modules behind **existing compat paths first**; foundation leads second.
