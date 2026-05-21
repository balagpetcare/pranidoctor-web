# APPOINTMENT_COMPLETE

**Project:** Prani Doctor  
**Status:** Gaps identified — run Composer command below to close  
**Audited:** 2026-05-22  
**Audit reference:** [APPOINTMENT_AUDIT.md](./APPOINTMENT_AUDIT.md)

---

## Completion checklist

Mark each when implemented and verified (local dev: backend + web + mobile against same API base).

| # | Step | Backend | Web | Mobile | Done |
|---|------|---------|-----|--------|------|
| 1 | Lead intake API | `/api/leads` exists | Proxy + admin list/detail | N/A (admin CRM) | ☐ |
| 2 | Lead → Appointment | `create-service-request` or convert creates `ServiceRequest` + `leadId` | Admin action on lead detail | Optional deep link after convert | ☐ |
| 3 | Appointment (create/read) | `POST /api/mobile/service-requests` | Admin list/detail (existing) | Book + inbox (existing) | ☑ |
| 4 | Assign | assign-doctor/technician + doctor accept | `ServiceRequestAssignmentActions` (existing) | Read-only assignee (existing) | ☑ |
| 5 | Track | Status + role queues | Admin tabs + doctor requests (existing) | Inbox segments (existing) | ☑ |
| 6 | History | Timeline GET (existing) | **Proxy + UI panel** | Timeline page (existing) | ☐ web |
| 7 | Cancel | Customer cancel (existing) | **Admin cancel proxy + UI** | Detail cancel (existing) | ☐ web/admin |
| 8 | Reschedule | **New endpoint + timeline event** | **Admin reschedule UI** | **Reschedule form** | ☐ |

---

## Gap implementation spec (gaps only)

### G1 — Web timeline proxies (History)

Mirror existing assign proxy pattern (`proxyRouteToBackend`).

Create:

- `src/app/api/admin/service-requests/[id]/timeline/route.ts` → GET
- `src/app/api/doctor/service-requests/[id]/timeline/route.ts` → GET
- `src/app/api/mobile/service-requests/[id]/timeline/route.ts` → GET (for parity)

UI:

- `ServiceRequestTimelinePanel.tsx` — fetch timeline, map `ServiceRequestEventType` to BN labels (reuse patterns from `service-request-labels.ts`).
- Mount on `ServiceRequestDetailPanel.tsx` (admin) and `DoctorCaseDetailPanel.tsx` (doctor).
- Remove or update the “ইতিহাস সংরক্ষণ হয় না” copy in `ServiceRequestAssignmentActions.tsx` once timeline is live.

### G2 — Reschedule (all stacks)

**Backend** (`pranidoctor-backend`):

- Add `POST /api/admin/service-requests/:id/reschedule` body: `{ scheduledStart, scheduledEnd, reason? }`.
- Add `POST /api/mobile/service-requests/:id/reschedule` for customer (only when status in `PENDING`, `ASSIGNED`, `ACCEPTED`).
- Validate window; append timeline event (add `RESCHEDULED` to `ServiceRequestEventType` if missing).
- Zod schemas + tests alongside `customer-lead.service.ts` / assignment module.

**Web:**

- Proxy routes for admin + mobile reschedule.
- Admin detail: show `scheduledStart`/`scheduledEnd`; “Reschedule” dialog.

**Mobile** (`pranidoctor_user`):

- `service_request_api_paths.dart` + `rescheduleRequest()` in repository.
- Detail page action + l10n; invalidate timeline + detail providers.

### G3 — Lead → ServiceRequest

**Backend:**

- `POST /api/leads/:id/create-service-request` (admin auth): creates `ServiceRequest` from lead fields, sets `leadId` + `Lead.serviceRequestId`, activity `BOOKING_CREATED`.
- Or extend `convert` with optional `createBooking: true` — pick one pattern, document in OpenAPI.

**Web:**

- Proxy `/api/leads/*` (list, get, patch, assign, convert, activities, create-service-request).
- Minimal admin pages: `/admin/leads`, `/admin/leads/[id]`.

### G4 — Admin cancel

**Backend:**

- `POST /api/admin/service-requests/:id/cancel` body `{ cancelReason? }` — allowed non-terminal statuses; timeline `CANCELLED`.

**Web:**

- Proxy + button on admin detail (confirm dialog).

### Out of scope (do not implement unless audit wrong)

- New `Appointment` Prisma model (use `ServiceRequest`).
- Technician HTML shell (API-only is fine).
- GPS/live map tracking.
- Collapsing `/admin/cases` vs `/appointments` nav (optional P2).

---

## Verification steps

1. **Lead:** Create lead via API → admin list shows it → create service request from lead → `leadId` populated on `ServiceRequest`.
2. **Appointment:** Mobile book → appears admin list `PENDING`.
3. **Assign:** Admin assign doctor → doctor sees `ASSIGNED` → accept → `ACCEPTED`.
4. **Track:** First treatment note → `IN_PROGRESS` → complete → `COMPLETED`.
5. **History:** Timeline shows CREATED → ASSIGNED → ACCEPTED → … on web admin + doctor + mobile.
6. **Cancel:** Customer cancel in `PENDING`; admin cancel in `ASSIGNED` (test reason stored).
7. **Reschedule:** Admin reschedules `ACCEPTED` request → `scheduledStart` updated → timeline `RESCHEDULED`.

---

## ONE Cursor Composer command

Copy everything inside the block below into **Cursor Composer** (one run). Do not split across agents unless a step fails.

```
@pranidoctor-web @pranidoctor-backend @pranidoctor_user

Prani Doctor — Complete appointment workflow (gaps only).

READ FIRST:
- docs/APPOINTMENT_AUDIT.md
- docs/APPOINTMENT_COMPLETE.md

RULES:
- Verify existing code before writing. Implement ONLY gaps listed in APPOINTMENT_COMPLETE.md § Gap implementation spec (G1–G4).
- Domain: ServiceRequest = appointment; Lead = CRM. No new Appointment model.
- Web: proxyRouteToBackend only — no Prisma in Next API routes.
- Match existing naming, Zod schemas, BN UI copy, and timeline/assignment patterns.
- Minimal diffs; no refactors of duplicate /admin/appointments vs /cases pages unless required for G3.

FLOW TO COMPLETE:
Lead → Appointment → Assign → Track → History → Cancel → Reschedule

TASKS (in order):

1) AUDIT VERIFY
   - Confirm audit matrix in APPOINTMENT_AUDIT.md still accurate; note any drift in APPOINTMENT_COMPLETE.md checklist.

2) G1 — Web History
   - Add timeline GET proxies (admin, doctor, mobile).
   - Add ServiceRequestTimelinePanel; wire admin + doctor detail.
   - Fix assignment UI text that claims history is not stored.

3) G2 — Reschedule
   - Backend: admin + mobile reschedule endpoints, validation, timeline RESCHEDULED event, enum migration if needed.
   - Web: proxies + admin detail schedule display + reschedule dialog.
   - Mobile: API path, repository method, detail UI, l10n.

4) G3 — Lead → Appointment
   - Backend: create ServiceRequest from lead with bidirectional link.
   - Web: /api/leads proxies + minimal /admin/leads list and [id] detail with “Create booking” action.

5) G4 — Admin cancel
   - Backend: POST admin cancel.
   - Web: proxy + admin detail cancel with reason.

6) DOCS
   - Update docs/APPOINTMENT_AUDIT.md (implementation status column).
   - Update docs/APPOINTMENT_COMPLETE.md: check all checklist rows ☑, set Status to COMPLETE, add “Shipped files” section.

7) SMOKE
   - Run backend tests if present for new routes; web lint on touched files.
   - Document manual verification steps performed.

OUTPUT (reply with exactly this structure):

## APPOINTMENT_COMPLETE

### Shipped
- bullet list per gap G1–G4 with repo + key files

### Checklist
- table from APPOINTMENT_COMPLETE.md with Done = ☑ for completed rows

### Verify
- which manual steps from § Verification steps were run

### Remaining
- only if something blocked; else “None”
```

---

## Shipped files (populate after Composer run)

_To be filled when implementation completes._

| Gap | Repo | Files |
|-----|------|-------|
| G1 | web | _pending_ |
| G2 | backend, web, mobile | _pending_ |
| G3 | backend, web | _pending_ |
| G4 | backend, web | _pending_ |

---

*Use the Composer command above to reach full APPOINTMENT_COMPLETE status.*
