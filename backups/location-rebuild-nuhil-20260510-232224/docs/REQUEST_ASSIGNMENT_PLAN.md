# Service request assignment — audit & implementation plan

**Project:** Prani Doctor / Animal Doctors ([pranidoctor.com](https://pranidoctor.com/))  
**Repo:** [github.com/balagpetcare/pranidoctor-web](https://github.com/balagpetcare/pranidoctor-web)  
**Scope:** Admin-driven assignment of **`ServiceRequest`** rows to **doctors** and/or **AI technicians**, aligned with existing enums and Task Card 12 (doctor case workflow).  
**Isolation:** This plan applies only to **pranidoctor-web** / Prani Doctor domain. It does **not** reference or assume BPA/WPA, Quarbani 2026, or other products.

**Last updated:** 2026-05-09 (integration audit: admin assign UI, doc sync, **`provider-assigned-list-tab`** shared helper)

---

## 0. Implementation status (backend foundation)

**Shipped in code:**

| Area | Details |
|------|---------|
| **Admin assign doctor** | **`POST /api/admin/service-requests/[id]/assign-doctor`** — JSON **`{ doctorProfileId }`**; admin session required; doctor must exist with **`ProviderStatus.ACTIVE`** and **`User.status = ACTIVE`**; from **`PENDING`** or **`ASSIGNED`** sets **`assignedDoctorId`**, **`status = ASSIGNED`**, **`assignedAt`**; **`ACCEPTED`/`IN_PROGRESS`** only same-doctor idempotent refresh; terminal statuses rejected (**409**). |
| **Admin assign technician** | **`POST /api/admin/service-requests/[id]/assign-technician`** — JSON **`{ aiTechnicianProfileId }`**; same admin guard; technician must be **ACTIVE** provider + active user; **`ACCEPTED`/`IN_PROGRESS`** allows **first** technician attach when **`assignedTechnicianId`** was null, else same-id idempotent or **409**. |
| **Technician auth (API)** | Cookie **`prani_technician_session`**; JWT claim **`role: "AI_TECHNICIAN"`**; secret **`TECHNICIAN_JWT_SECRET`** (else **`DOCTOR_JWT_SECRET`**, else **`AUTH_SECRET`**, min 32 chars). **`POST /api/technician/auth/login`**, **`POST .../logout`**, **`GET .../me`**. |
| **Technician assigned list/detail** | **`GET /api/technician/service-requests`** (`tab`, `limit`, `offset` — same semantics as doctor list); **`GET /api/technician/service-requests/[id]`** — scoped by **`assignedTechnicianId`**. |
| **Doctor assigned list** | Unchanged: **`GET /api/doctor/service-requests`** (already filters by **`assignedDoctorId`**). |

**Deferred (see §1.5, §3):** immutable **assignment event history** table; **`assignedByUserId`** on **`ServiceRequest`**; **`/technician` HTML** shell + **`middleware.ts`** matcher (API-only until pages exist).

**Prisma:** No migration for this foundation (uses existing **`assignedDoctorId`**, **`assignedTechnicianId`**, **`assignedAt`**).

---

## 1. Current findings

### 1.1 Prisma — `ServiceRequest`

| Field / relation | Notes |
|------------------|--------|
| **`assignedDoctorId`** | Optional FK → **`DoctorProfile`**. Indexed with **`status`**. |
| **`assignedTechnicianId`** | Optional FK → **`AiTechnicianProfile`**; DB column **`assignedAiTechnicianId`**. Indexed with **`status`**. |
| **`status`** | **`ServiceRequestStatus`** (default **`PENDING`**). |
| **`serviceType`** | **`ServiceRequestType`** (e.g. **`DOCTOR_HOME_VISIT`**, **`AI_SERVICE`**, …). |
| **`assignedAt`** | Present; suitable to set when admin (or system) records assignment. |
| **`startedAt`**, **`completedAt`**, **`cancelledAt`**, **`cancelReason`** | Lifecycle timestamps / notes already on the model. |
| **`areaId`**, **`villageId`** | Geographic context; links to **`Area`** / **`Village`**. |

**Conclusion:** The schema already supports **dual assignment** (doctor + technician) and timestamps needed for dispatch. No **mandatory** new columns for a first admin-assign MVP.

### 1.2 Prisma — `User` / roles

| Item | Notes |
|------|--------|
| **`UserRole`** | Includes **`ADMIN`**, **`SUPER_ADMIN`**, **`CUSTOMER`**, **`DOCTOR`**, **`AI_TECHNICIAN`**, **`SUPPORT`**. |
| **`User.status`** | **`UserStatus`** (e.g. **`ACTIVE`**, **`SUSPENDED`**, …). |

Assignment authorization should combine **role** (admin vs customer vs provider) with **provider operational state** where relevant (**`ProviderStatus`** on **`DoctorProfile`** / **`AiTechnicianProfile`**).

### 1.3 Prisma — `DoctorProfile` / `AiTechnicianProfile`

| Model | Assignment-relevant relations |
|-------|-------------------------------|
| **`DoctorProfile`** | **`assignedRequests`** → **`ServiceRequest[]`**; **`doctorServiceAreas`** (village-level); **`doctorProfileAreas`** / **`doctorProfileServiceCategories`** (coverage vs **`Area`** / **`ServiceCategory`**). |
| **`AiTechnicianProfile`** | **`assignedRequests`** → **`ServiceRequest[]`**; **`aiTechnicianServiceAreas`**; **`aiTechnicianProfileAreas`** / **`aiTechnicianProfileServiceCategories`**. |

These support **eligibility hints** in admin UI (filter doctors/technicians by category or geography) as product rules, not as hard DB constraints unless added later.

### 1.4 Service area models (summary)

- **`Village`**, **`Area`** (hierarchy), **`DoctorServiceArea`**, **`AiTechnicianServiceArea`**, **`DoctorProfileArea`**, **`AiTechnicianProfileArea`**, **`DoctorProfileServiceCategory`**, **`AiTechnicianProfileServiceCategory`** — all present and usable for **dispatch UX** and validation **in application code** (optional strict checks).

### 1.5 Audit / history / log models

| Model | Relevance to assignment |
|-------|-------------------------|
| **`Notification`** | User-scoped messages with **`metadataJson`**; could carry **`serviceRequestId`** in JSON for “you were assigned” pushes — **not** a structured assignment audit log. |
| **`Complaint`**, **`Review`**, etc. | Unrelated to assignment lineage. |

**Conclusion:** There is **no** dedicated **`ServiceRequestAssignmentHistory`** (or similar) table in the audited schema. Optional **`assignedByAdminUserId`** or a **`ServiceRequestEvent`** table would be **product-driven** additions if immutable audit is required.

### 1.6 Admin service request UI

| Path | Role |
|------|------|
| **`src/app/admin/(dashboard)/service-requests/page.tsx`** | Lists requests via **`ServiceRequestsList`**. |
| **`src/app/admin/(dashboard)/service-requests/[id]/page.tsx`** | Detail via **`ServiceRequestDetailPanel`**. |
| **`src/components/admin/service-requests/*`** | List + detail + **`ServiceRequestAssignmentActions`** (doctor/technician pickers, **`POST .../assign-doctor`** / **`assign-technician`**). |

### 1.7 Service request status enum / lifecycle (application)

**Enum (`ServiceRequestStatus`):** **`PENDING`**, **`ACCEPTED`**, **`ASSIGNED`**, **`IN_PROGRESS`**, **`COMPLETED`**, **`CANCELLED`**, **`REJECTED`**.

| Transition (today in code) | Where |
|----------------------------|--------|
| Create → **`PENDING`** | **`createServiceRequestForCustomer`** (`src/lib/mobile-service-requests/service-request-service.ts`). |
| Customer cancel → **`CANCELLED`** | Same module + **`/api/mobile/service-requests/[id]/cancel`**. |
| **Admin assign doctor / technician** | **`assignDoctorToServiceRequest`** / **`assignTechnicianToServiceRequest`** — sets FKs, **`assignedAt`**, and typically **`status = ASSIGNED`** from **`PENDING`** (see service rules). |
| Doctor accept → **`ASSIGNED` → `ACCEPTED`** | **`acceptServiceRequestForDoctor`** (`src/lib/doctor-service-requests/doctor-service-request-service.ts`). |
| Doctor reject → **`REJECTED`** | **`rejectServiceRequestForDoctor`**. |
| Doctor complete → **`COMPLETED`** + **`completedAt`** | **`completeServiceRequestForDoctor`**. |
| Treatment / prescription writes | Allowed when status ∈ **`{ ASSIGNED, ACCEPTED, IN_PROGRESS }`** (see **`DOCTOR_CASE_WORKFLOW_PLAN.md`**). |

### 1.8 Existing request APIs (summary)

| Area | Endpoints | Mutations on assignment? |
|------|-----------|---------------------------|
| **Mobile (customer)** | **`GET/POST /api/mobile/service-requests`**, **`GET /api/mobile/service-requests/[id]`**, **`POST .../cancel`** | Create (**`PENDING`**); cancel; **no** assign. |
| **Admin** | **`GET /api/admin/service-requests`**, **`GET /api/admin/service-requests/[id]`**, **`POST .../[id]/assign-doctor`**, **`POST .../[id]/assign-technician`** | Assign (see §0). |
| **Doctor** | **`GET /api/doctor/service-requests`**, **`GET .../[id]`**, accept / reject / complete / clinical | All scoped by **`assignedDoctorId`**. |
| **AI technician (provider)** | **`requireTechnicianApiActor()`**, **`/api/technician/auth/*`**, **`GET /api/technician/service-requests`**, **`GET /api/technician/service-requests/[id]`** — scoped by **`assignedTechnicianId`**. HTML **`/technician`** shell deferred. |

---

## 2. Existing `ServiceRequest` assignment capability

- **Storage:** **`assignedDoctorId`**, **`assignedTechnicianId`**, **`assignedAt`** are already on **`ServiceRequest`**.
- **Admin read path:** DTOs include **`assignedDoctor`** and **`assignedTechnician`** (display names) via **`adminInclude`** in **`service-request-admin-service.ts`**.
- **Doctor read path:** Doctor list/detail require **`assignedDoctorId ===`** current doctor profile; “new” tab uses statuses **`ASSIGNED`** and **`ACCEPTED`**.
- **Write path:** Admin **`POST .../assign-doctor`** and **`POST .../assign-technician`** (see §0). Customer create unchanged (**`PENDING`**).

---

## 3. Missing schema fields (if any)

**MVP (no migration):**

- Use **`assignedDoctorId`**, **`assignedTechnicianId`**, **`assignedAt`**, **`status`**, **`updatedAt`**.
- Optionally set **`assignedAt`** only when the **first** provider (doctor or technician per product rule) is assigned, or set on **any** assignment change — document the chosen rule in code comments.

**Optional future migrations (if product requires):**

| Addition | Purpose |
|----------|---------|
| **`assignedByUserId`** (FK → **`User`**) | Know which admin performed assignment. |
| **`ServiceRequestAssignmentEvent`** (or generic **`AuditLog`**) | Immutable history: actor, previous/new IDs, timestamps. |
| **`technicianAcceptedAt`** / **`doctorAcceptedAt`** | Only if **`updatedAt`** is insufficient for reporting. |

**Recommendation:** Ship **MVP without** new tables; add **`assignedByUserId`** or an **event table** when compliance or support tooling requires provable history.

---

## 4. Admin assignment workflow (target)

### 4.1 Assign doctor

1. Admin opens **`/admin/service-requests/[id]`** (existing page).
2. UI loads eligible **ACTIVE** doctors (reuse patterns from **`/api/admin/doctors`** list or a narrow “picker” endpoint).
3. Admin selects doctor → **`POST /api/admin/service-requests/[id]/assign-doctor`** (or **`PATCH`** with a small body — pick one REST style and keep it consistent).
4. Server:
   - **`requireAdminPanelApiAccess()`** (existing guard).
   - Validate request exists and is in an **assignable** status (e.g. **`PENDING`** only for first assignment, or **`PENDING`/`ACCEPTED`** per product — **must not** overwrite **`COMPLETED`**, **`CANCELLED`**, **`REJECTED`** without explicit policy).
   - Set **`assignedDoctorId`**, **`status = ASSIGNED`** (if transitioning from **`PENDING`**), set **`assignedAt`** if not already set (or always refresh **`assignedAt`** on reassignment — choose one rule).
5. Optionally enqueue **`Notification`** to the doctor’s **`User`** (future).

### 4.2 Assign AI technician

- Same pattern with **`assignedTechnicianId`**.
- **Product rule:** For **`AI_SERVICE`** requests, technician may be primary assignee; for doctor visits, technician may be **secondary** (both IDs set) or **exclusive** per **`serviceType`** — enforce in zod + service layer.

### 4.3 Change status to **`ASSIGNED`**

- Couple **`ASSIGNED`** with “at least one relevant provider assigned” **or** allow **`ASSIGNED`** only when **`assignedDoctorId`** is set for doctor-type requests (strict) vs allow **`ASSIGNED`** with only technician for **`AI_SERVICE`** (recommended split).

### 4.4 Optional assignment history

- **Phase 1:** Rely on **`updatedAt`** + optional **`Notification`** metadata.
- **Phase 2:** Append-only **`ServiceRequestAssignmentEvent`** or admin-only audit export.

---

## 5. Provider workflow (target)

### 5.1 Doctor

- **Already implemented (Task Card 12):** list (**`tab`**: new / active / completed), detail, accept, reject, treatment, prescription, complete — all keyed on **`assignedDoctorId`**.
- **Dependency:** Requests must reach **`ASSIGNED`** (or acceptable intermediate) with **`assignedDoctorId`** set; **admin assignment** closes the loop from customer **`PENDING`**.

### 5.2 AI technician

- **Implemented (API foundation):** JWT cookie session (**§0**), **`GET /api/technician/service-requests`**, **`GET /api/technician/service-requests/[id]`** — scoped by **`assignedTechnicianId`**. No HTML **`/technician`** shell or Edge middleware until pages ship.
- **Later:** Technician accept/start/complete parity (or **`AI_SERVICE`**-specific rules) as in **§5.4**.

### 5.3 Request detail

- **Admin:** read detail + **assignment UI** (**`ServiceRequestAssignmentActions`**).
- **Doctor:** existing **`GET /api/doctor/service-requests/[id]`**.
- **Technician:** **`GET /api/technician/service-requests/[id]`** — implemented; scoped to assignee (**§0**).

### 5.4 Accept / start / complete (later)

- **Doctor:** accept / complete already documented in **`DOCTOR_CASE_WORKFLOW_PLAN.md`**; **start → `IN_PROGRESS` + `startedAt`** still listed as not implemented.
- **Technician:** define whether **`ACCEPTED`** applies or only **`ASSIGNED` → `IN_PROGRESS`** — keep enums consistent with a single **`ServiceRequest`** state machine.

---

## 6. Required API endpoints (checklist)

### 6.1 Admin

| Endpoint | Purpose |
|----------|---------|
| **`POST /api/admin/service-requests/[id]/assign-doctor`** | Body: **`{ doctorProfileId: string }`**. Validates doctor exists, **`ProviderStatus.ACTIVE`** (recommended), status rules. |
| **`POST /api/admin/service-requests/[id]/assign-technician`** | Body: **`{ aiTechnicianProfileId: string }`**. Same guardrails. |
| *(Optional)* **`POST .../unassign-doctor`** / **unassign-technician** | Clears FK; must respect terminal statuses. |
| *(Optional)* **`GET /api/admin/service-requests/[id]/assignment-candidates`** | Returns filtered doctors/technicians for picker (or reuse list APIs with query params). |

### 6.2 Provider (doctor — largely done)

| Endpoint | Status |
|----------|--------|
| **`GET /api/doctor/service-requests`** | Exists. |
| **`GET /api/doctor/service-requests/[id]`** | Exists. |

### 6.3 Provider (technician — to build)

| Endpoint | Purpose |
|----------|---------|
| **`GET /api/technician/service-requests`** | List by **`assignedTechnicianId`** + tab/status filters. |
| **`GET /api/technician/service-requests/[id]`** | Detail scoped to assignee. |
| **Actions** | Accept / reject / complete / start — **only after** product signs off parity with doctor. |

### 6.4 Customer

- **No** new assignment endpoints; customers must **not** set **`assignedDoctorId`** / **`assignedTechnicianId`**.

---

## 7. Status lifecycle and Task Card 12

**Intended chain (doctor-led visit):**

1. Customer creates request → **`PENDING`**.
2. **Admin assigns doctor** → set **`assignedDoctorId`**, **`assignedAt`**, **`status = ASSIGNED`** (this document).
3. Doctor **accept** → **`ACCEPTED`** (existing).
4. *(Optional)* Doctor **start** → **`IN_PROGRESS`**, **`startedAt`** (planned in doctor workflow doc).
5. Doctor **complete** → **`COMPLETED`**, **`completedAt`** (existing).

**Task Card 12 alignment:**

- Doctor “new” inbox (**`ASSIGNED`**, **`ACCEPTED`**) **assumes** step 2 has happened. Without admin assignment, **`PENDING`** requests **never** appear in the doctor panel — **not a conflict**, but a **hard dependency**: assignment system **unblocks** Task Card 12 for real customer-submitted traffic.

**Technician / dual assignee:**

- **`serviceType === AI_SERVICE`** may primarily use **`assignedTechnicianId`** while doctor fields stay null — document per-request-type rules to avoid inconsistent **`ASSIGNED`** rows with no assignee.

---

## 8. Permission rules

| Actor | Permission |
|-------|------------|
| **Admin / Super admin** | Assign or reassign doctor and/or technician for requests in allowed statuses; read all requests (existing list/detail). |
| **Doctor** | Read/update only requests with **`assignedDoctorId ===`** own **`DoctorProfile.id`** (already enforced in doctor services). |
| **AI technician** | Read assigned requests via **`GET /api/technician/service-requests`** (+ detail); **no** technician accept/complete routes yet. |
| **Customer (mobile)** | Create, list own, get own, cancel per existing rules — **no** assignment. |
| **Anonymous** | No assignment. |

**Implementation note:** **`requireTechnicianApiActor()`** mirrors **`requireDoctorApiActor()`** for technician APIs.

---

## 9. Implementation checklist

### Phase A — Admin assignment (minimum viable)

- [x] Add **`assignDoctorToServiceRequest`** / **`assignTechnicianToServiceRequest`** in **`src/lib/admin-service-requests/service-request-assignment-service.ts`** with zod input on routes, status transitions, and idempotent rules where helpful.
- [x] Add **`POST`** route handlers **`assign-doctor`**, **`assign-technician`** under **`src/app/api/admin/service-requests/[id]/`** with admin guard.
- [x] Extend **`ServiceRequestDetailPanel`** + **`ServiceRequestsList`** with assign UI / assignment column (**`ServiceRequestAssignmentActions`**).
- [x] Document **assignable statuses** and **reassign** behavior in code + this doc (§0, service comments).
- [ ] Optional: set **`Notification`** for assigned provider user.

### Phase B — Technician provider APIs + UI

- [x] Technician auth (cookie/JWT) analogous to doctor — **`src/lib/technician-auth/*`**, **`/api/technician/auth/*`**.
- [x] List/detail scoped by **`assignedTechnicianId`** — **`GET /api/technician/service-requests`**, **`GET .../[id]`**.
- [ ] Align status filters with **`serviceType`** (optional product rule).
- [ ] **`/technician` HTML** + middleware matcher (deferred — API-only for now).

### Phase C — Hardening

- [ ] Optional DB migration for **`assignedByUserId`** or event table.
- [ ] Eligibility validation (category + geography) against profile join tables.
- [ ] Rate limits / audit export for support.

---

## 10. Test / build / lint checklist

After each phase:

- [x] **`npm run lint`**
- [x] **`npm run typecheck`**
- [x] **`npm run build`**
- [ ] If **`schema.prisma`** changes: **`npx prisma migrate dev`** (or equivalent) + **`npx prisma generate`**
- [ ] Manual: create **`PENDING`** request (mobile or seed) → admin assign → doctor sees in **new** tab → accept → complete path.

---

## 11. Conflict or overlap with Doctor Case Workflow

| Topic | Assessment |
|-------|------------|
| **Status `ASSIGNED`** | Doctor workflow **expects** requests to be **`ASSIGNED`** (or **`ACCEPTED`**) for inbox + accept. Admin assignment **must** set **`ASSIGNED`** when moving from **`PENDING`** with a doctor assigned — **complementary**, not conflicting. |
| **`ACCEPTED` without `ASSIGNED`** | If admin or legacy data sets **`ACCEPTED`** without going through **`ASSIGNED`**, doctor list today includes **`ACCEPTED`** in “new” — still OK. Avoid creating ambiguous rows without **`assignedDoctorId`**. |
| **Reassign after doctor accept** | Reassigning while **`ACCEPTED`/`IN_PROGRESS`** could strand the old doctor’s session; **policy**: either forbid reassignment after **`ACCEPTED`**, or clear acceptance and reset status — **must be explicit** in assignment service. |
| **Technician vs doctor fields** | Two FKs on one row: define whether both can be set simultaneously per **`serviceType`** to avoid contradicting clinical ownership rules. |

**Summary:** There is **no fundamental conflict** between assignment and Task Card 12; assignment is the **missing upstream** step that feeds the doctor panel. Technician work is **additional** surface area.

---

## 12. References (in-repo)

- **`prisma/schema.prisma`** — **`ServiceRequest`**, **`DoctorProfile`**, **`AiTechnicianProfile`**, enums.
- **`docs/DOCTOR_CASE_WORKFLOW_PLAN.md`** — Task Card 12 doctor lifecycle.
- **`src/lib/mobile-service-requests/service-request-service.ts`** — customer create (**`PENDING`**).
- **`src/lib/admin-service-requests/service-request-admin-service.ts`** — admin read.
- **`src/lib/doctor-service-requests/doctor-service-request-service.ts`** — doctor list/detail scoped by **`assignedDoctorId`**.
