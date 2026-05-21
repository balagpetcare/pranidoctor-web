# Prani Doctor — Admin Panel UAT Checklist

**Product:** Prani Doctor Admin Panel  
**Repositories:** `pranidoctor-web` (UI + BFF) · `pranidoctor-backend` (API)  
**Date:** 2026-05-22  
**Version:** 1.0  
**Scope:** Manual User Acceptance Testing for `/admin/*`

---

## How to use this document

| Column | Meaning |
|--------|---------|
| **ID** | Unique test case reference |
| **Precondition** | State required before executing steps |
| **Steps** | Actions performed by the tester |
| **Expected** | Pass criteria — all must be true |
| **Pass / Fail** | Mark **P** or **F**; add notes in the Notes column |

**Sign-off:** Tester name, date, environment URL, build/commit, and overall result recorded in [UAT sign-off](#uat-sign-off).

---

## UAT environment setup

| # | Item | Required value |
|---|------|----------------|
| E1 | Web app running | `pranidoctor-web` dev/staging URL reachable |
| E2 | Backend API running | `BACKEND_URL` reachable; health OK |
| E3 | Database seeded | At least one `ADMIN` or `SUPER_ADMIN` user with `AdminProfile`, active status |
| E4 | Test data | ≥1 doctor (mixed statuses), ≥1 service request (mixed statuses), ≥1 billing record if billing tests run |
| E5 | Browser | Chrome or Edge (latest); cookies enabled |
| E6 | Network | Stable connection; no VPN blocking API |
| E7 | Secrets | `ADMIN_JWT_SECRET` (or `AUTH_SECRET` / `JWT_SECRET`) set; not placeholder in production |

**Base URL (fill in):** `_________________________________`

---

## Test accounts

| Role | Email / identifier | Password | Notes |
|------|-------------------|----------|-------|
| SUPER_ADMIN | *(from seed / ops)* | *(secure)* | Full panel + enterprise publish |
| ADMIN | *(from seed / ops)* | *(secure)* | Full panel; no `serviceInstance.publish` |
| Invalid | `wrong@example.com` | `wrongpassword` | Negative login tests |
| Non-panel user | Customer/doctor account | — | Must be rejected at login |

> **Note:** `SUPPORT` role exists in the permission matrix but **cannot log in** to the admin panel today (`resolveActor` rejects). Do not use SUPPORT for UAT login.

---

## Module maturity (expected outcomes)

| Area | Maturity | UAT focus |
|------|----------|-----------|
| Auth | Functional | Login, session, logout, guards |
| Dashboard | Functional | KPIs, charts, refresh |
| Users | **Blocked** | Placeholder UI + missing API documented |
| Doctors | Functional | List, CRUD, lifecycle actions |
| Roles | Read-only reference | Display matrix; no CRUD |
| Permissions | Read-only reference | Capability catalog; nav gating |
| Animals | **Blocked** | Placeholder UI |
| Appointments | Functional (via service requests) | List, filters, assign doctor/technician |
| Payments (Billing) | Functional | List, detail, commission settings |
| Notifications | Partial | In-app list + mark read; SMS snapshot |
| Reports | Partial | Summary + completed requests list |
| Settings | Partial | Hub + billing commission; roles/permissions read-only |

---

## 1. Auth

| ID | Precondition | Steps | Expected | Pass / Fail | Notes |
|----|--------------|-------|----------|-------------|-------|
| AUTH-01 | Not logged in; valid SUPER_ADMIN or ADMIN credentials known | 1. Open `/admin/login`<br>2. Enter email + password<br>3. Submit | Redirect to `/admin`; sidebar visible; user identity shown; no login error | | |
| AUTH-02 | Not logged in; valid BD phone (no `@`) + password known | 1. Open `/admin/login`<br>2. Enter phone as identifier + password<br>3. Submit | Login succeeds same as email flow | | |
| AUTH-03 | Not logged in | 1. Open `/admin/login`<br>2. Enter invalid credentials<br>3. Submit | Error message shown; remains on login; no session cookie set | | |
| AUTH-04 | Not logged in | 1. Navigate directly to `/admin` | Redirect to `/admin/login` (middleware gate) | | |
| AUTH-05 | Logged in | 1. Click logout (sidebar/header)<br>2. Try `/admin` | Redirect to login; protected routes inaccessible | | |
| AUTH-06 | Logged in; `?next=/admin/doctors` on login URL | 1. Log out<br>2. Open `/admin/login?next=/admin/doctors`<br>3. Log in | Lands on `/admin/doctors` (safe redirect only) | | |
| AUTH-07 | Logged in | 1. Wait ≥30 min with no mouse/keyboard activity (or set `NEXT_PUBLIC_ADMIN_IDLE_TIMEOUT_MS` lower in dev)<br>2. Interact with page | Idle logout; redirect to login with session cleared | | |
| AUTH-08 | Logged in | 1. Stay active >5 min<br>2. Observe network tab for `/api/admin/auth/me` | Periodic session refresh (~5 min); no unexpected logout while active | | |
| AUTH-09 | Customer or doctor credentials (non-panel) | 1. Attempt login at `/admin/login` | Login rejected (`invalid_credentials` or equivalent message) | | |
| AUTH-10 | Logged in; backend session revoked / user suspended (ops) | 1. Trigger revoke or suspend test account<br>2. Refresh `/admin` or wait for `/me` poll | User logged out; redirected to login | | |

---

## 2. Dashboard

| ID | Precondition | Steps | Expected | Pass / Fail | Notes |
|----|--------------|-------|----------|-------------|-------|
| DASH-01 | Logged in as panel admin | 1. Open `/admin` | Page loads without error; KPI cards visible (doctors, technicians, customers, service requests, revenue, etc.) | | |
| DASH-02 | Dashboard loaded | 1. Click manual refresh control | Data reloads; loading indicator shown briefly; KPI values update or remain consistent | | |
| DASH-03 | Dashboard loaded | 1. Wait for auto-refresh interval (~30s client cache) | Recent activity / stats refresh without full page reload errors | | |
| DASH-04 | Dashboard loaded | 1. Scroll to charts section | Charts render (or skeleton then content); no broken layout | | |
| DASH-05 | Dashboard loaded | 1. Click a quick-action link (e.g. service requests, doctors) | Navigates to correct module route | | |
| DASH-06 | Dashboard loaded; unread notifications exist | 1. Check notification badge/count on dashboard | Unread count matches notifications module (if data present) | | |
| DASH-07 | Backend temporarily unavailable (ops: stop API) | 1. Open `/admin`<br>2. Click refresh | Error banner/state shown; last cached data retained if applicable; retry works when API returns | | |
| DASH-08 | Mobile viewport 375px | 1. Open `/admin` on narrow screen | KPI grid stacks; tables scroll horizontally; no horizontal page overflow | | |
| DASH-09 | Logged in | 1. Open `/admin/analytics` | Analytics page loads; uses shared dashboard data; no duplicate fatal errors | | |

---

## 3. Users

> **Module status:** `/admin/users` and `/admin/customers` are **blocked** — no `GET /api/admin/users` or `GET /api/admin/customers`. UAT verifies correct placeholder behavior.

| ID | Precondition | Steps | Expected | Pass / Fail | Notes |
|----|--------------|-------|----------|-------------|-------|
| USR-01 | Logged in | 1. Open `/admin/users` | `AdminModuleUnavailable` shown; title “ইউজার”; missing API `GET /api/admin/users` documented | | |
| USR-02 | On users page | 1. Review module checklist | All features (API, table, filter, search, pagination, form, validation) marked blocked | | |
| USR-03 | On users page | 1. Click related link “কাস্টমার” | Navigates to `/admin/customers` | | |
| USR-04 | Logged in | 1. Open `/admin/customers` | Same blocked module pattern; missing API `GET /api/admin/customers` (or equivalent) shown | | |
| USR-05 | Logged in | 1. Open `/admin` dashboard | Customer count KPI visible (aggregate from backend) even though list module is blocked | | |
| USR-06 | Logged in | 1. Open `/admin/service-requests`<br>2. Open a request detail | Customer name/contact visible in request context (indirect user data) | | |

---

## 4. Doctors

| ID | Precondition | Steps | Expected | Pass / Fail | Notes |
|----|--------------|-------|----------|-------------|-------|
| DOC-01 | Logged in; ≥1 doctor in DB | 1. Open `/admin/doctors` | List loads with pagination (20/page); columns readable | | |
| DOC-02 | Doctors list loaded | 1. Search by name, email, phone, or license<br>2. Clear search | Results filter correctly; clear restores list | | |
| DOC-03 | Logged in | 1. Open `/admin/doctors/new`<br>2. Fill required fields (email, phone, password ≥8 chars, displayName, licenseNumber)<br>3. Submit | Doctor created (201); redirect to list or detail; new row appears | | |
| DOC-04 | On create form | 1. Submit with password &lt; 8 chars | Validation error; no create | | |
| DOC-05 | On create form | 1. Submit with negative experience years or negative visit fee | Validation error; no create | | |
| DOC-06 | Existing doctor | 1. Open `/admin/doctors/[id]`<br>2. Review profile, areas, categories | Detail loads; related data shown | | |
| DOC-07 | Existing doctor | 1. Open `/admin/doctors/[id]/edit`<br>2. Change display name or visit fee<br>3. Save | PATCH succeeds; detail reflects changes | | |
| DOC-08 | Doctor in `PENDING_VERIFICATION` | 1. From list or detail, click **Verify** | Status advances per workflow; success feedback | | |
| DOC-09 | Verified doctor | 1. Click **Approve** | Provider approved; status updated | | |
| DOC-10 | Approved doctor | 1. Click **Activate** | Account active for platform use | | |
| DOC-11 | Doctor eligible for reject | 1. Click **Reject**<br>2. Confirm dialog | Doctor rejected; account suspended per business rule | | |
| DOC-12 | Active doctor | 1. Click **Suspend**<br>2. Confirm | Doctor suspended; platform access blocked | | |
| DOC-13 | Doctor detail | 1. Update working areas (`PUT` working-areas)<br>2. Update service categories | Changes persist on reload | | |
| DOC-14 | Backend down | 1. Open `/admin/doctors` | `AdminErrorState` with retry; no uncaught crash | | |
| DOC-15 | Mobile 375px | 1. Open doctors list | Table scrolls; actions reachable | | |

---

## 5. Roles

> **Module status:** Read-only reference at `/admin/settings/roles`. No role CRUD API.

| ID | Precondition | Steps | Expected | Pass / Fail | Notes |
|----|--------------|-------|----------|-------------|-------|
| ROL-01 | Logged in | 1. Open `/admin/settings/roles` | Page loads; panel roles listed (`SUPER_ADMIN`, `ADMIN`, `SUPPORT`) | | |
| ROL-02 | On roles page | 1. Review enterprise capability matrix | Matrix matches `permissions.ts` (view/review/publish columns) | | |
| ROL-03 | On roles page | 1. Attempt to find create/edit/delete controls | No CRUD controls; UI states roles are seed/DB-defined | | |
| ROL-04 | Logged in as ADMIN | 1. Open roles page | Same read access as SUPER_ADMIN (reference only) | | |
| ROL-05 | From settings hub | 1. Open `/admin/settings`<br>2. Follow link to Roles | Navigation works; breadcrumb/header correct | | |

---

## 6. Permissions

> **Module status:** Read-only catalog at `/admin/settings/permissions`. Enforced capabilities: `serviceInstance.view`, `serviceInstance.review`, `serviceInstance.publish`.

| ID | Precondition | Steps | Expected | Pass / Fail | Notes |
|----|--------------|-------|----------|-------------|-------|
| PERM-01 | Logged in | 1. Open `/admin/settings/permissions` | Capability catalog loads; documents UI gates | | |
| PERM-02 | On permissions page | 1. Verify `serviceInstance.view` | Listed for SUPER_ADMIN, ADMIN, SUPPORT | | |
| PERM-03 | On permissions page | 1. Verify `serviceInstance.review` | SUPER_ADMIN + ADMIN only | | |
| PERM-04 | On permissions page | 1. Verify `serviceInstance.publish` | SUPER_ADMIN only | | |
| PERM-05 | Logged in as ADMIN | 1. Check sidebar for enterprise/service-instance review items | Items requiring `publish` hidden or disabled for ADMIN | | |
| PERM-06 | Logged in as SUPER_ADMIN | 1. Check enterprise review nav items | Visible when capability granted | | |
| PERM-07 | On permissions page | 1. Confirm note that other modules are open to all panel admins | Documented; matches nav (doctors, billing, etc. visible) | | |
| PERM-08 | Logged in as ADMIN | 1. Open `/admin/dev-tools/otp-logs` and `/admin/audit` via URL | Accessible only if role is SUPER_ADMIN or ADMIN; SUPPORT blocked if test account exists | | |

---

## 7. Animals

> **Module status:** `/admin/animals` blocked — no `GET /api/admin/animals`.

| ID | Precondition | Steps | Expected | Pass / Fail | Notes |
|----|--------------|-------|----------|-------------|-------|
| ANM-01 | Logged in | 1. Open `/admin/animals` | `AdminModuleUnavailable`; missing API documented | | |
| ANM-02 | On animals page | 1. Review blocked feature checklist | All list/CRUD features marked unavailable | | |
| ANM-03 | Logged in; service request with animal exists | 1. Open `/admin/service-requests`<br>2. View list row and detail | Animal name/species/type shown in request context | | |
| ANM-04 | Billing record with animal exists | 1. Open `/admin/billing/[id]` | Animal embedded in billing detail (read-only) | | |

---

## 8. Appointments

> **Appointments = Service Requests** (`/admin/appointments`, `/admin/service-requests`, `/admin/cases` share the same UI).

| ID | Precondition | Steps | Expected | Pass / Fail | Notes |
|----|--------------|-------|----------|-------------|-------|
| APT-01 | Logged in; ≥1 service request | 1. Open `/admin/appointments` | List loads; status tabs visible (All, PENDING, ACCEPTED, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED, REJECTED) | | |
| APT-02 | List loaded | 1. Open `/admin/service-requests` and `/admin/cases` | Same list component / equivalent data (shell parity) | | |
| APT-03 | List loaded | 1. Filter by service type<br>2. Filter by area | Results narrow correctly | | |
| APT-04 | List loaded | 1. Go to page 2 (if total &gt; 20) | Pagination works; offset/limit correct | | |
| APT-05 | PENDING or ASSIGNED request | 1. Open detail `/admin/service-requests/[id]`<br>2. Assign doctor | Assignment succeeds; status/assignee updated | | |
| APT-06 | Request not terminal | 1. Assign AI technician | Assignment succeeds when status allows | | |
| APT-07 | COMPLETED / CANCELLED / REJECTED request | 1. Attempt technician assign | Blocked with clear error (409/422) | | |
| APT-08 | Emergency request in data | 1. Find in list | Emergency flag/badge visible | | |
| APT-09 | Request detail | 1. Open timeline (if UI exposes) | Timeline loads or link works without crash | | |
| APT-10 | Backend down | 1. Open appointments list | Error state + retry | | |

---

## 9. Payments (Billing)

> Nav label: **Billing** (`/admin/billing`). Commission settings: `/admin/settings/billing`.

| ID | Precondition | Steps | Expected | Pass / Fail | Notes |
|----|--------------|-------|----------|-------------|-------|
| PAY-01 | Logged in; ≥1 billing record | 1. Open `/admin/billing` | List loads (25/page); revenue summary on page if shown | | |
| PAY-02 | Billing list | 1. Filter by payment status<br>2. Filter by payment method<br>3. Set date range<br>4. Search doctor name | Filters apply; totals consistent | | |
| PAY-03 | Billing list | 1. Open a row / detail `/admin/billing/[id]` | Read-only financial breakdown: fees, commission, payout, payment fields | | |
| PAY-04 | Detail view | 1. Verify linked service request and treatment case | Cross-links/data present | | |
| PAY-05 | Logged in | 1. Open `/admin/settings/billing`<br>2. Read current commission % | Current value displayed with explanation | | |
| PAY-06 | Settings billing | 1. Set commission to valid value (e.g. 15)<br>2. Save | PUT succeeds; value persists on reload | | |
| PAY-07 | Settings billing | 1. Enter commission &gt; 100 or &lt; 0<br>2. Save | Client validation blocks; no invalid save | | |
| PAY-08 | Dashboard | 1. Compare revenue KPIs with billing list totals | Figures directionally consistent (same currency BDT) | | |
| PAY-09 | Backend down | 1. Open billing list | Error state + retry | | |

---

## 10. Notifications

| ID | Precondition | Steps | Expected | Pass / Fail | Notes |
|----|--------------|-------|----------|-------------|-------|
| NOTIF-01 | Logged in | 1. Open `/admin/notifications` | Page loads; in-app notification list (up to 50) | | |
| NOTIF-02 | Unread notifications exist | 1. Toggle “unread only” filter | Only unread items shown | | |
| NOTIF-03 | Unread item present | 1. Mark one notification read | Item updates; unread count decreases | | |
| NOTIF-04 | Multiple unread | 1. Mark all read | All marked read; count zero | | |
| NOTIF-05 | Notifications page | 1. Review SMS provider status section | Status snapshot shown; no secrets/OTP plaintext | | |
| NOTIF-06 | Notifications page | 1. Review SMS logs section | Empty state or placeholder (no DB persistence) — no crash | | |
| NOTIF-07 | Dashboard | 1. Compare unread badge with notifications page | Counts align | | |
| NOTIF-08 | Logged in as ADMIN (not SUPER_ADMIN) | 1. Check nav for Audit / OTP dev tools | Hidden from nav for non–SUPER_ADMIN/ADMIN roles | | |
| NOTIF-09 | Logged in as SUPER_ADMIN or ADMIN; `OTP_DEBUG_PANEL_ENABLED=true` | 1. Open `/admin/dev-tools/otp-logs` | Page loads or env-gated message; no OTP codes in clear text | | |

---

## 11. Reports

> **Module status:** Partial — `/admin/reports` uses dashboard aggregates + completed service requests. `/admin/prescriptions` blocked.

| ID | Precondition | Steps | Expected | Pass / Fail | Notes |
|----|--------------|-------|----------|-------------|-------|
| RPT-01 | Logged in | 1. Open `/admin/reports` | Summary stats render; link to analytics present | | |
| RPT-02 | Reports page | 1. Review completed service requests section | List pre-filtered to `COMPLETED` status | | |
| RPT-03 | Reports page | 1. Open a completed request from list | Detail page loads | | |
| RPT-04 | Reports page | 1. Click analytics link | Navigates to `/admin/analytics` | | |
| RPT-05 | Logged in | 1. Open `/admin/prescriptions` | `AdminModuleUnavailable`; missing prescriptions API documented | | |
| RPT-06 | Backend down | 1. Open `/admin/reports` | Error state + retry on data sections | | |
| RPT-07 | Compare dashboard treatment/completed counts | 1. Open `/admin` then `/admin/reports` | Numbers consistent or explainable (timing/cache) | | |

---

## 12. Settings

| ID | Precondition | Steps | Expected | Pass / Fail | Notes |
|----|--------------|-------|----------|-------------|-------|
| SET-01 | Logged in | 1. Open `/admin/settings` | Settings hub loads with links to billing, roles, permissions, audit | | |
| SET-02 | Settings hub | 1. Navigate to Billing settings | `/admin/settings/billing` opens | | |
| SET-03 | Settings hub | 1. Navigate to Roles | `/admin/settings/roles` opens (read-only) | | |
| SET-04 | Settings hub | 1. Navigate to Permissions | `/admin/settings/permissions` opens (read-only) | | |
| SET-05 | Logged in as SUPER_ADMIN or ADMIN | 1. Follow audit link from settings | `/admin/audit` accessible | | |
| SET-06 | Logged in as ADMIN | 1. Update billing commission (see PAY-06)<br>2. Reload | Change persists | | |
| SET-07 | Mobile 375px | 1. Open settings hub and billing form | Form readable; no layout break | | |

---

## Cross-cutting checks

| ID | Precondition | Steps | Expected | Pass / Fail | Notes |
|----|--------------|-------|----------|-------------|-------|
| X-01 | Logged in | 1. Click each primary sidebar group from `ADMIN_NAV_GROUPS` | No 404; active nav highlight correct | | |
| X-02 | Logged in | 1. Use nav search (Ctrl+K)<br>2. Search “ডাক্তার” or “billing” | Matching routes listed; navigation works | | |
| X-03 | Logged in | 1. Toggle mobile sidebar | Overlay opens; body scroll locked; closes on navigate | | |
| X-04 | Logged in | 1. Switch Bengali UI labels | Sidebar labels in Bangla; page titles coherent | | |
| X-05 | Production build | 1. `npm run build` (or CI artifact)<br>2. Smoke test AUTH-01, DASH-01, DOC-01, APT-01, PAY-01 | No console fatal errors on critical paths | | |

---

## Defect log (template)

| Defect ID | Test ID | Severity | Summary | Steps to reproduce | Environment |
|-----------|---------|----------|---------|-------------------|-------------|
| | | P1 / P2 / P3 | | | |

**Severity:** P1 = blocker (cannot test area) · P2 = major (workaround exists) · P3 = minor/cosmetic

---

## UAT sign-off

| Field | Value |
|-------|-------|
| Environment | |
| Build / commit | |
| Tester | |
| Test date | |
| Total cases | 89 |
| Passed | |
| Failed | |
| Blocked (cannot test) | |
| Overall result | ☐ PASS ☐ PASS WITH ISSUES ☐ FAIL |

**Approver:** _________________________ **Date:** _____________

---

## References

- [ADMIN_QA.md](./ADMIN_QA.md) — QA pass results and fixes
- [ADMIN_API_MAPPING.md](./ADMIN_API_MAPPING.md) — API integration matrix
- [ADMIN_WEB_AUDIT.md](./ADMIN_WEB_AUDIT.md) — Route inventory
- Backend OpenAPI: `pranidoctor-backend/docs/openapi.json`

---

**ADMIN_UAT_READY**
