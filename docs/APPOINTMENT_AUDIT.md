# Appointment Workflow Audit — Prani Doctor

**Project:** Prani Doctor  
**Audited:** 2026-05-22  
**Repos:** `pranidoctor-web`, `pranidoctor-backend`, `pranidoctor_user`  
**Domain model:** There is no `Appointment` table. Doctor visits are **`ServiceRequest`**; CRM intake is **`Lead`**; AI bookings are **`AiServiceRequest`** (out of scope unless service type is AI).

---

## Requested flow

```
Lead → Appointment → Assign → Track → History → Cancel → Reschedule
```

| Step | Product meaning | Technical entity |
|------|-----------------|------------------|
| Lead | CRM / intake before booking | `Lead`, `LeadActivity` |
| Appointment | Scheduled service booking | `ServiceRequest` (create + `scheduledStart`/`scheduledEnd`) |
| Assign | Admin assigns doctor/technician; doctor accepts | `assignedDoctorId`, `assignedTechnicianId`, status `ASSIGNED` → `ACCEPTED` |
| Track | Role-based queues and status | Status enum + list/detail APIs |
| History | Audit trail | `ServiceRequestTimelineEvent`, `LeadActivity` |
| Cancel | Customer or ops cancels | `CANCELLED` + timeline; doctor uses `REJECTED` |
| Reschedule | Change visit window | `scheduledStart` / `scheduledEnd` (columns exist; no update API) |

---

## Status lifecycle (ServiceRequest)

```
PENDING → ASSIGNED → ACCEPTED → IN_PROGRESS → COMPLETED
              ↘ CANCELLED (customer)    ↘ REJECTED (doctor)
```

- **`IN_PROGRESS`** is set when the doctor saves the first treatment note (no explicit “start visit” API in web).
- Customer cancel allowed only in `PENDING`, `ASSIGNED`, `ACCEPTED` (`CUSTOMER_CANCELLABLE_STATUSES`).

---

## Per-repo findings

### pranidoctor-backend

| Step | Status | Evidence |
|------|--------|----------|
| **Lead** | Implemented | `src/modules/leads/` — `POST/GET/PATCH /api/leads`, assign, convert, activities |
| **Appointment** | Implemented (direct only) | `POST /api/mobile/service-requests` — `customer-lead.service.ts`; `scheduledStart`/`scheduledEnd` at create |
| **Assign** | Implemented | `POST /api/admin/service-requests/:id/assign-doctor`, `assign-technician`; `POST /api/doctor/.../accept`, `reject` |
| **Track** | Implemented | Role list/detail; treatment workflow `/api/cases/:id/*`; doctor tabs `new\|active\|completed` |
| **History** | Implemented | `GET .../timeline` for mobile, admin, doctor — `timeline.service.ts` |
| **Cancel** | Partial | Customer `POST/PATCH /api/mobile/service-requests/:id/cancel`; no admin cancel; doctor reject ≠ cancel |
| **Reschedule** | **Missing** | No `reschedule` in codebase; no PATCH for schedule fields |

**Critical gaps (backend):**

1. **Lead → ServiceRequest bridge** — Schema has `Lead.serviceRequestId` and `ServiceRequest.leadId` but no service writes the link; `convert` only sets `convertedUserId`.
2. **Reschedule** — No endpoint or timeline event type.
3. **Admin cancel** — No `POST /api/admin/service-requests/:id/cancel`.
4. **Leads auth** — `leads.routes.ts` has no auth middleware (unlike most legacy routes).

**Timeline routes (backend legacy, ready to proxy):**

- `src/legacy/web/routes/admin/service-requests/[id]/timeline/route.ts`
- `src/legacy/web/routes/doctor/service-requests/[id]/timeline/route.ts`
- `src/legacy/web/routes/mobile/service-requests/[id]/timeline/route.ts`

---

### pranidoctor-web

| Step | Status | Evidence |
|------|--------|----------|
| **Lead** | **Missing** | Schema `Lead` in generated Prisma; no `/admin/leads`, no `/api/leads` proxy |
| **Appointment** | Implemented (admin read) | `/admin/service-requests`, `/cases`, `/appointments` — same `ServiceRequestsPageShell` |
| **Assign** | Implemented | `ServiceRequestAssignmentActions.tsx` + assign-doctor/technician proxies |
| **Track** | Partial | Admin status tabs; doctor `requests/new\|active\|completed`; no map/GPS; no technician HTML app |
| **History** | **Missing** | No timeline proxy under `src/app/api/**/timeline`; detail shows static timestamps only |
| **Cancel** | **Missing (web)** | Mobile cancel proxy exists; no admin/doctor/customer web cancel UI |
| **Reschedule** | **Missing** | Zero matches for reschedule; detail shows `preferredTime` only, not `scheduledStart`/`scheduledEnd` |

**Architecture notes:**

- Web API routes use `proxyRouteToBackend` — no Prisma in handlers.
- `src/lib/*-service-request*-service.ts` admin/doctor services are **stubs**; DTO mapping lives in components + `mobile-service-requests/service-request-mapper.ts`.
- No Next.js server actions for this flow.

**Duplicate admin pages (same component, different titles):**

- `src/app/admin/(dashboard)/service-requests/page.tsx`
- `src/app/admin/(dashboard)/cases/page.tsx`
- `src/app/admin/(dashboard)/appointments/page.tsx`

**Assignment UI admission (history gap documented in UI):**

> “বিস্তারিত ইতিহাস এখনো সংরক্ষণ হয় না — শুধু সর্বশেষ বরাদ্দ।” — `ServiceRequestAssignmentActions.tsx`

Backend **does** persist timeline events; web cannot fetch them without proxy routes.

---

### pranidoctor_user (Flutter)

| Step | Status | Evidence |
|------|--------|----------|
| **Lead** | Partial | “Lead” = `POST /api/mobile/service-requests` via doctor book flow only |
| **Appointment** | Implemented | `book_consultation_page.dart` → `ServiceRequestRepository.createRequest()` |
| **Assign** | Read-only | Detail/inbox show `assignedDoctor`; admin assigns server-side |
| **Track** | Implemented | Inbox segments; detail timestamps; no polling for status |
| **History** | Implemented | `service_request_history_page.dart` + timeline API |
| **Cancel** | Implemented | Detail cancel while `PENDING`/`ASSIGNED`/`ACCEPTED` |
| **Reschedule** | **Missing** | No API path, repository method, or UI |

**Mobile gaps (non-blocking for web/admin completion):**

- `scheduledStart`/`scheduledEnd` parsed in DTO but not shown in UI.
- Preferred doctor stored as free text in `description`, not structured field.
- List fetches all requests then filters client-side.

Reference: `pranidoctor_user/docs/PHASE_APPOINTMENT_COMPLETE.md` (mobile subset marked complete 2026-05-22).

---

## Gap matrix (cross-stack)

| Step | Backend | Web | Mobile |
|------|---------|-----|--------|
| Lead | API yes; link to booking no | No UI/proxy | Doctor-book only |
| Appointment | Create yes | Admin list/detail yes | Create + inbox yes |
| Assign | Yes | Yes (admin); doctor accept | Read-only |
| Track | Yes | Partial (tables only) | Yes |
| History | API yes | **Proxy + UI missing** | Yes |
| Cancel | Customer only | **Admin/UI missing** | Yes (limited statuses) |
| Reschedule | **None** | **None** | **None** |

---

## API inventory (ServiceRequest — doctor visit)

### Implemented (backend; web proxies where noted)

| Method | Path | Web proxy |
|--------|------|-----------|
| POST | `/api/mobile/service-requests` | Yes |
| GET | `/api/mobile/service-requests` | Yes |
| GET | `/api/mobile/service-requests/:id` | Yes |
| POST/PATCH | `/api/mobile/service-requests/:id/cancel` | Yes |
| GET | `/api/mobile/service-requests/:id/timeline` | **No** |
| GET | `/api/admin/service-requests` | Yes |
| GET | `/api/admin/service-requests/:id` | Yes |
| POST | `/api/admin/service-requests/:id/assign-doctor` | Yes |
| POST | `/api/admin/service-requests/:id/assign-technician` | Yes |
| GET | `/api/admin/service-requests/:id/timeline` | **No** |
| GET | `/api/doctor/service-requests` | Yes |
| GET | `/api/doctor/service-requests/:id` | Yes |
| POST | `/api/doctor/service-requests/:id/accept` | Yes |
| POST | `/api/doctor/service-requests/:id/reject` | Yes |
| POST | `/api/doctor/service-requests/:id/complete` | Yes |
| GET | `/api/doctor/service-requests/:id/timeline` | **No** |

### Leads (backend only today)

| Method | Path |
|--------|------|
| POST | `/api/leads` |
| GET | `/api/leads` |
| GET | `/api/leads/:id` |
| PATCH | `/api/leads/:id` |
| POST | `/api/leads/:id/assign` |
| POST | `/api/leads/:id/convert` |
| GET | `/api/leads/:id/activities` |

### Missing (required for full flow)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/leads/:id/create-service-request` (or extend convert) | Lead → Appointment |
| PATCH or POST | `/api/*/service-requests/:id/reschedule` | Reschedule |
| POST | `/api/admin/service-requests/:id/cancel` | Admin cancel |
| — | Web proxies for all timeline GET routes | History on web |

---

## Key files

### Web

- `src/components/admin/service-requests/ServiceRequestsPageShell.tsx`
- `src/components/admin/service-requests/ServiceRequestDetailPanel.tsx`
- `src/components/admin/service-requests/ServiceRequestAssignmentActions.tsx`
- `src/components/doctor/DoctorCaseDetailPanel.tsx`
- `src/lib/proxy-to-backend.ts`
- `src/lib/mobile-service-requests/service-request-mapper.ts`

### Backend

- `src/modules/leads/`
- `src/modules/lead/customer-lead.service.ts`
- `src/modules/assignment/assignment.service.ts`
- `src/modules/timeline/timeline.service.ts`
- `prisma/schema.prisma` — `ServiceRequest`, `Lead`, `ServiceRequestTimelineEvent`

### Mobile

- `lib/features/service_requests/`
- `lib/features/doctors/presentation/book_consultation_page.dart`

---

## Recommendations (gap-only priority)

1. **P0 — Web history:** Add timeline proxy routes + timeline panel on admin and doctor detail (backend already writes events).
2. **P0 — Reschedule:** Backend `POST` reschedule + timeline event `RESCHEDULED` (extend enum if needed) + web admin action + mobile UI.
3. **P1 — Lead → Appointment:** Backend service linking `leadId`; admin “Create booking from lead” + `/api/leads` web proxy.
4. **P1 — Admin cancel:** Backend + admin detail action (with reason).
5. **P2 — Web lead CRM:** Minimal admin leads list/detail (assign, convert, activities).
6. **P2 — UX:** Show `scheduledStart`/`scheduledEnd` on admin detail; collapse duplicate `/admin/appointments` vs `/cases` nav or differentiate by filter.

---

## Verdict

**~70% complete** for the end-to-end appointment workflow. Core booking, assignment, doctor queue, mobile track/history/cancel are in place. **Blocking gaps for “complete”:** web timeline/history, reschedule (all stacks), lead→service-request bridge, admin cancel, web lead wiring.

*Audit complete — see `APPOINTMENT_COMPLETE.md` for implementation command and checklist.*
