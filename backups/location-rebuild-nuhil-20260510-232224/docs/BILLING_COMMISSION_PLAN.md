# Billing & Commission — Plan (Task Card 13 Phase 1)

**Project:** [Prani Doctor](https://pranidoctor.com/) · Repo: `balagpetcare/pranidoctor-web`  
**Scope:** Billing model audit, planning, and **calculation core** only (no billing APIs in this phase).

---

## 1. Audit findings

### 1.1 Prisma schema overview

- **`BillingRecord`** already exists with fee breakdown and commission amounts:
  - `serviceFee`, `travelCost`, `medicineCost`, `discountAmount`, `totalCollected`, `platformCommission`, `providerPayout`
  - Legacy aggregates: `subtotal`, `tax`, `total` (nullable during migration)
  - Lifecycle: `status` uses **`BillingStatus`** (`DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `VOIDED`, `REFUNDED`) — this is **invoice / billing workflow**, not the same as customer payment settlement labels in the MVP list below.
- **`PaymentRecord`** models individual payment attempts/lines with **`PaymentMethod`** and **`PaymentStatus`** (gateway-oriented legacy values). It remains the place for multi-tender / partial payment lines; **`BillingRecord`** gains optional summary fields for the **primary / aggregate** payment method and **MVP payment status** at invoice level.
- **`Setting`** (`key` + `valueJson`) is the right store for **`PLATFORM_COMMISSION_RATE`**.
- **Related models (links only):**
  - **`User`** / **`DoctorProfile`** / **`CustomerProfile`**: `BillingRecord` references `customerId`, optional `doctorId`, `aiTechnicianId`.
  - **`AnimalProfile`**: linked via `ServiceRequest` → `BillingRecord.serviceRequestId` (no direct FK from billing to animal).
  - **`ServiceRequest`**: `billingRecords` one-to-many.
  - **`TreatmentCase`** (`TreatmentRecord` table): optional `treatmentCaseId` on `BillingRecord`.
  - **`Prescription`**: no direct FK to billing; costs may roll into `medicineCost` in product logic later.

### 1.2 Codebase search (application source)

| Area | Result |
|------|--------|
| **`BillingRecord` usage** | No imports/usages in non-generated `src/` — billing is schema-ready; **helpers/services/APIs not wired yet**. |
| **`paymentMethod` / `paymentStatus` on `BillingRecord`** | **Were missing** from `BillingRecord`; **`PaymentRecord`** already uses `method` + `status`. |
| **`serviceFee`, `travelCost`, `medicineCost`, `platformCommission`, `providerPayout`, `totalCollected`** | Present on **`BillingRecord`** in schema; **not referenced in app TS** outside generated client. |
| **Doctor earnings / commission setting** | **`DoctorProfile.visitFeeBdt`** exists as a **catalog fee**, not earnings. No runtime commission rate in code; **`Setting`** intended for **`PLATFORM_COMMISSION_RATE`**. |

### 1.3 Conclusion

- **Safe approach:** Extend existing **`PaymentMethod`** / **`PaymentStatus`** enums **additively** (new enum values only), add **`paymentMethod`** / **`paymentStatus`** on **`BillingRecord`**, keep **`discountAmount`** as the persisted discount field (alias **`discount`** in calculation API/docs).
- **No destructive drops** of columns or enum values in Phase 1.

---

## 2. Existing `BillingRecord` fields (current)

| Field | Notes |
|-------|--------|
| `id`, `serviceRequestId`, `treatmentCaseId`, `doctorId`, `aiTechnicianId`, `customerId` | Relations |
| `status` | **`BillingStatus`** — invoice lifecycle |
| `currency` | Default `BDT` |
| `subtotal`, `tax`, `total` | Legacy / transitional |
| `serviceFee`, `travelCost`, `medicineCost` | Fee breakdown |
| `discountAmount` | Customer-facing discount (maps to **`discount`** in formulas) |
| `totalCollected`, `platformCommission`, `providerPayout` | Totals |
| `issuedAt`, `paidAt`, `notes`, `createdAt`, `updatedAt` | Audit |
| `paymentRecords`, `complaints` | Relations |

---

## 3. Missing / added in Phase 1

| Need | Resolution |
|------|------------|
| **`discount`** field name | Use existing **`discountAmount`** in DB; calculation helper exposes **`discount`** in its **result object** for clarity. |
| **`paymentMethod`**, **`paymentStatus`** on invoice | **Added** nullable `paymentMethod` and **`paymentStatus`** with safe default **`UNPAID`** (see enums). |
| **`PaymentMethod` MVP list** | Extended enum: **`ROCKET`**, **`BANK`** added; **`CARD`**, **`BANK_TRANSFER`** retained for **`PaymentRecord`** compatibility. |
| **`PaymentStatus` MVP list** | Extended enum: **`UNPAID`**, **`PARTIAL`**, **`PAID`** added alongside existing gateway statuses. |

---

## 4. Safe Prisma migration strategy

1. **Enums:** `ALTER TYPE ... ADD VALUE` via Prisma Migrate — additive only.
2. **`BillingRecord`:** Add nullable `paymentMethod`; add `paymentStatus` with **`@default(UNPAID)`** so new rows are MVP-safe.
3. **No** removal of **`BillingStatus`**, **`tax`/`total`**, or **`PaymentRecord`** fields.
4. **Post-deploy:** Phase 2 APIs should align **`BillingRecord.status`** (`BillingStatus`) with **`paymentStatus`** (`PaymentStatus`) rules (e.g. when marking `PAID`).

---

## 5. Billing calculation rule

**Inputs (money numbers, same currency — BDT MVP):**

- `serviceFee`, `travelCost`, `medicineCost`, `discount`, `commissionRate` (0–1, e.g. `0.1`)
- Optional `discountAppliedToServiceFee`: if omitted, default **`min(max(discount, 0), serviceFee)`** (discount is allocated to the service component first, capped by `serviceFee`).

**Platform commission business rule**

- Commission applies **mainly on `serviceFee`**, **not** on `medicineCost` or `travelCost` by default.
- **`medicineCost`** and **`travelCost`** are **not** included in **`commissionBase`** unless product rules change later.

**Formulas**

- `subtotal = serviceFee + travelCost + medicineCost`
- `totalCollected = max(subtotal - discount, 0)`
- `commissionBase = max(serviceFee - discountAppliedToServiceFee, 0)`
- `platformCommission = commissionBase * commissionRate`
- `providerPayout = totalCollected - platformCommission`

**Edge case (documented):** If `discount` exceeds `subtotal`, `totalCollected` can be `0` while `commissionBase` may still be positive; callers should validate discounts in Phase 2 UI/API or clamp if business rules require.

---

## 6. MVP enums (invoice-level)

### 6.1 Payment methods (`PaymentMethod`)

`CASH`, `BKASH`, `NAGAD`, **`ROCKET`**, **`BANK`**, `OTHER`  
(Legacy: `CARD`, `BANK_TRANSFER` retained on **`PaymentRecord`**.)

### 6.2 Payment statuses (`PaymentStatus`)

`UNPAID`, **`PARTIAL`**, `PAID`, `REFUNDED`, `CANCELLED`  
(Legacy gateway values remain for **`PaymentRecord`**.)

---

## 7. Platform commission setting

- **Key:** `PLATFORM_COMMISSION_RATE`
- **`valueJson`:** numeric rate **0–1** (e.g. `0.1`) or `{ "rate": 0.1 }` / `{ "value": 0.1 }` (parsed by shared helper).
- **Default if missing/invalid:** **10%** (`0.1`).

**Implementation:** `src/lib/platform-commission-rate.ts` (+ optional seed upsert in `prisma/seed.ts`).

---

## 8. Admin requirements (Phase 1 foundation)

- Read/update **`PLATFORM_COMMISSION_RATE`** via **`Setting`** (admin UI/API in later phases).
- See **`BillingRecord`** commission columns for reconciliation reports (Phase 2+).

## 9. Doctor requirements (Phase 1 foundation)

- **`providerPayout`** and **`platformCommission`** computed consistently via **`calculateBillingTotals`** (`src/lib/billing-calculation.ts`).
- Doctor-facing earnings summaries deferred to **Phase 2**.

## 10. API requirements (Phase 2 — not in this phase)

- CRUD/patch billing on completion flow; map **`discount`** ↔ **`discountAmount`**; set **`paymentMethod`** / **`paymentStatus`**; persist calculated amounts.

---

## 11. Test / build checklist

| Command | Purpose |
|---------|---------|
| `npx prisma validate` | Schema valid |
| `npx prisma generate` | Client regenerated |
| `npx prisma migrate dev` | Apply migration (when DB available) |
| `npm run lint` | ESLint |
| `npm run build` | Next.js build |
| `npm run test` | Vitest (billing helper tests) |

---

## 12. Changed files report format (for Phase 1 PR)

```
## Changed files
- prisma/schema.prisma
- prisma/migrations/20260509055822_billing_payment_fields_and_enums/migration.sql
- prisma/seed.ts (PLATFORM_COMMISSION_RATE upsert)
- docs/BILLING_COMMISSION_PLAN.md
- src/lib/billing-calculation.ts
- src/lib/billing-calculation.test.ts
- src/lib/platform-commission-rate.ts
- src/generated/prisma/** (regenerated via `npx prisma generate`)
```

---

## 13. Recommended next task

**Task Card 13 Phase 2 — Billing API + Doctor completion integration**

Wire **`BillingRecord`** create/update from doctor/admin flows; synchronize **`BillingStatus`** vs **`paymentStatus`**; aggregate **`PaymentRecord`** lines where needed.

---

## 14. Phase 2 — Doctor billing API & completion integration

### 14.1 Audit (Phase 2)

| Area | Finding |
|------|---------|
| **Completion endpoint** | `POST /api/doctor/service-requests/[id]/complete` calls `completeServiceRequestForDoctor(doctorProfileId, requestId)` with **no body**. |
| **Service logic** | `completeServiceRequestForDoctor` sets `ServiceRequest` to **`COMPLETED`** + `completedAt` after ≥1 **finalized** `TreatmentCase` for that doctor. No **`BillingRecord`** creation. |
| **Doctor UI** | `DoctorCaseDetailPanel` completes via POST **without** billing payload. |
| **Authorization** | `requireDoctorApiActor()` ensures authenticated doctor; service scopes by **`assignedDoctorId === doctorProfileId`**. |
| **Safest integration point** | Extend **`completeServiceRequestForDoctor`** (single transaction): finalize completion **and** create **`BillingRecord`** using **`calculateBillingTotals`** + **`getPlatformCommissionRate`**. Require billing JSON for **new** completions only. |

### 14.2 API endpoint design

| Method | Path | Purpose |
|--------|------|---------|
| **POST** | `/api/doctor/service-requests/[id]/complete` | Complete assigned case **with billing**. Same path as before; body required unless request is **already `COMPLETED`** (idempotent replay). |
| **GET** | `/api/doctor/earnings/summary` | Aggregated earnings for the signed-in doctor. |

### 14.3 Request body — complete (`application/json`)

Required when the request is **not** already completed:

| Field | Type | Rules |
|-------|------|--------|
| `serviceFee` | number | Required, **≥ 0**, finite |
| `travelCost` | number | Optional in UX; defaults **0** if omitted / null |
| `medicineCost` | number | Defaults **0** |
| `discount` | number | Defaults **0** |
| `paymentMethod` | `PaymentMethod` enum string | Required |
| `paymentStatus` | `PaymentStatus` enum string | Required (MVP: `UNPAID`, `PARTIAL`, `PAID`, `REFUNDED`, `CANCELLED`) |

Negative amounts are **rejected** with `400 VALIDATION_ERROR`.

### 14.4 Response body — complete

Success (`200`): `{ ok: true, data: { request: DoctorServiceRequestDetailDto, billing: DoctorBillingDto | null, meta?: { alreadyCompleted?: boolean } } }`

- **`billing`** populated when a **`BillingRecord`** exists for this completion (create path or loaded for **`alreadyCompleted`**).
- **`billing`** includes computed **`commissionBase`** (not persisted as its own column; derivable from fee + discount).

### 14.5 Authorization rules

- **`requireDoctorApiActor`** on both routes.
- Complete: **`ServiceRequest.assignedDoctorId`** must equal session **`doctorProfileId`**.
- Earnings: aggregate **`BillingRecord.doctorId === doctorProfileId`** only.

### 14.6 Billing create rules

- Run **`calculateBillingTotals`** with **`getPlatformCommissionRate(prisma)`**.
- **`BillingRecord`**: link **`serviceRequestId`**, **`customerId`** from request, **`doctorId`**, optional **`treatmentCaseId`** (latest **finalized** treatment case for this doctor + request).
- **`BillingStatus`** derived from **`paymentStatus`** (see mapper).
- **`issuedAt`**: set on create; **`paidAt`**: set when **`paymentStatus`** is **`PAID`** or **`PARTIAL`**.
- **One billing per doctor per request**: if a **`BillingRecord`** already exists for **`(serviceRequestId, doctorId)`**, return **`409 BILLING_EXISTS`** (no silent duplicate).
- **Already completed**: return **`ALREADY_COMPLETED`** without requiring billing body; include existing **`billing`** if present.

### 14.7 Error handling

| Code | HTTP | When |
|------|------|------|
| `VALIDATION_ERROR` | 400 | Invalid JSON or Zod failures |
| `UNAUTHORIZED` | 401 | Not logged in |
| `FORBIDDEN` | 403 | Not a doctor panel user |
| `NOT_FOUND` | 404 | Wrong id / not assigned |
| `BILLING_REQUIRED` | 422 | Completion path without billing payload |
| `BILLING_EXISTS` | 409 | Billing row already exists for this case |
| `INVALID_STATUS` | 409 | Request not completable |
| `TREATMENT_REQUIRED` | 422 | No finalized treatment note |

### 14.8 Doctor earnings summary (`GET /api/doctor/earnings/summary`)

Response shape:

```json
{
  "totalCollected": 0,
  "totalPlatformCommission": 0,
  "totalProviderPayout": 0,
  "paidCount": 0,
  "unpaidCount": 0,
  "currentMonthEarnings": 0
}
```

Definitions:

- **Totals**: sum over **`BillingRecord`** for **`doctorId`** (`totalCollected`, `platformCommission`, `providerPayout`).
- **paidCount**: **`paymentStatus === PAID`**.
- **unpaidCount**: **`paymentStatus`** in **`UNPAID`** or **`PARTIAL`** (not fully settled).
- **currentMonthEarnings**: sum **`providerPayout`** where **`BillingRecord.createdAt`** falls in the **current calendar month** (server-local month via `date-fns` `startOfMonth` / `endOfMonth`).

### 14.9 Phase 2 test checklist

- `npx prisma validate` / `npx prisma generate`
- `npm run lint` / `npm run build` / `npm run test`
- Vitest: billing completion schema / **`mapPaymentStatusToBillingStatus`** / earnings pure helpers where extracted

### 14.10 Phase 2 changed-files template

```
docs/BILLING_COMMISSION_PLAN.md
src/app/api/doctor/service-requests/[id]/complete/route.ts
src/app/api/doctor/earnings/summary/route.ts
src/lib/doctor-service-requests/complete-billing-schema.ts
src/lib/doctor-service-requests/doctor-service-request-service.ts
src/lib/doctor-service-requests/doctor-detail-include.ts
src/lib/doctor-service-requests/doctor-earnings-service.ts
src/components/doctor/DoctorCaseDetailPanel.tsx
src/lib/doctor-service-requests/*.test.ts (if added)
```

---

## 15. Phase 3 — Admin billing management & commission setting

### 15.1 Admin UI audit (Phase 3)

| Area | Finding |
|------|---------|
| **Layout / shell** | `AdminDashboardShell` — Bangla `labelBn` nav, emerald accents, `/admin/billing` nav entry already present. |
| **Auth** | `ensureAdminDashboardAccess` on dashboard layout; APIs use **`requireAdminPanelApiAccess()`**. |
| **Settings** | `/admin/settings` was **`AdminPlaceholder`**; replaced with a **settings hub** linking to **`/admin/settings/billing`**. |
| **Billing list** | `/admin/billing` was placeholder; replaced with **`AdminBillingList`** (table + filters). |
| **Commission UI** | New **`/admin/settings/billing`** + **`AdminBillingSettingsForm`** (GET/PUT APIs). |
| **Style** | Matches existing admin patterns (`ServiceRequestsList`: filters card, table, pagination, `adminFetch` / `readAdminJson`). |

### 15.2 Commission setting UI plan

- **Route:** `/admin/settings/billing`.
- **Behavior:** Load **`GET /api/admin/settings/billing`**; form edits **whole percent 0–100**; save **`PUT /api/admin/settings/billing`** with `{ commissionPercent }`.
- **Copy:** Explain commission applies mainly to **service fee**, not medicine/travel (same text as API `explanation`).

### 15.3 Billing list UI plan

- **Route:** `/admin/billing`.
- **Columns:** Request/case id (link to detail), doctor, customer, fee breakdown, totals, payment method/status, **createdAt**.
- **Filters:** `paymentStatus`, `paymentMethod`, **date range** (`dateFrom` / `dateTo` as `YYYY-MM-DD`), **doctorSearch** (case-insensitive contains on doctor `displayName`).
- **Pagination:** `limit` / `offset` (default page size 25).

### 15.4 Billing detail UI plan

- **Route:** `/admin/billing/[id]`.
- **Content:** Full amounts, payment fields, **commission formula** (breakdown lines from stored amounts), links to **service request**, **doctor**, customer email, animal/treatment when present.

### 15.5 Admin API plan

| Method | Path | Role |
|--------|------|------|
| GET | `/api/admin/billing` | Paginated list + filters |
| GET | `/api/admin/billing/[id]` | Detail DTO |
| GET | `/api/admin/settings/billing` | Commission settings + explanation |
| PUT | `/api/admin/settings/billing` | Update **`PLATFORM_COMMISSION_RATE`** (`valueJson`: `{ rate }` fraction) |

### 15.6 Access control rules

- All routes above require **`requireAdminPanelApiAccess`** (same as other `/api/admin/*` handlers).
- No role split beyond “admin panel user” (consistent with existing admin APIs).

### 15.7 Phase 3 test / build checklist

- `npx prisma validate` / `npx prisma generate`
- `npm run lint` / `npm run build` / `npm run test`
- Vitest: **`admin-billing/schemas.test.ts`** for Zod commission percent and date query shapes.

### 15.8 Phase 3 changed-files template

```
docs/BILLING_COMMISSION_PLAN.md
src/lib/admin-billing/schemas.ts
src/lib/admin-billing/schemas.test.ts
src/lib/admin-billing/admin-billing-service.ts
src/lib/admin-billing/admin-billing-settings-service.ts
src/app/api/admin/billing/route.ts
src/app/api/admin/billing/[id]/route.ts
src/app/api/admin/settings/billing/route.ts
src/app/admin/(dashboard)/billing/page.tsx
src/app/admin/(dashboard)/billing/[id]/page.tsx
src/app/admin/(dashboard)/settings/page.tsx
src/app/admin/(dashboard)/settings/billing/page.tsx
src/components/admin/billing/AdminBillingList.tsx
src/components/admin/billing/AdminBillingDetail.tsx
src/components/admin/billing/AdminBillingSettingsForm.tsx
```

---

## 16. Phase 4 — Final hardening, consistency & regression

### 16.1 Audit summary (billing scope)

| Area | Status |
|------|--------|
| **`BillingRecord` vs APIs/UI** | List/detail DTOs map `discountAmount` → `discount`; decimals normalized via `Number`; aligns with Prisma model. |
| **Doctor completion → billing** | `completeServiceRequestForDoctor` creates **`BillingRecord`** in one transaction with **`calculateBillingTotals`** + **`getPlatformCommissionRate(tx)`** (reads **`PLATFORM_COMMISSION_RATE`** from `Setting`). |
| **Admin commission → calculation** | Runtime rate from **`getPlatformCommissionRate`** / **`resolvePlatformCommissionRate`**; admin **`PUT /api/admin/settings/billing`** persists `{ rate }` under **`PLATFORM_COMMISSION_SETTING_KEY`**. |
| **Doctor earnings** | **`currentMonthEarnings`** sums **`providerPayout`** only (not **`totalCollected`**). Lifetime totals expose collected, commission, and payout separately. |
| **Commission base** | **`calculateBillingTotals`**: `commissionBase = max(serviceFee − discountAppliedToServiceFee, 0)` — **medicineCost** and **travelCost** are **not** in the base (see tests + admin formula block). |
| **Auth** | Admin billing/settings APIs: **`requireAdminPanelApiAccess`**. Doctor complete + earnings: **`requireDoctorApiActor`**. |

### 16.2 What was implemented (Task Card 13 — all phases)

- **Phase 1:** Prisma enums/fields for invoice-level payment method/status; **`calculateBillingTotals`**, **`platform-commission-rate`**, seed/settings key, Vitest for totals.
- **Phase 2:** **`POST /api/doctor/service-requests/[id]/complete`** with billing body; **`GET /api/doctor/earnings/summary`**; doctor UI billing form + earnings strip.
- **Phase 3:** Admin **`/admin/billing`**, **`/admin/billing/[id]`**, **`/admin/settings/billing`**; **`GET/PUT`** admin settings billing; **`GET`** admin billing list/detail APIs.
- **Phase 4:** Regression pass; **`calculateBillingTotals`** clamps **`commissionRate`** to **[0, 1]** at calculation time; **`providerPayout`** floored at **0** after subtraction; admin list query default **`limit`** aligned to **25**; extended tests.

### 16.3 Final business rules

1. **Platform commission** applies to **service fee after discount allocated to the service component** (`commissionBase`). **Medicine** and **travel** line items are **excluded** from that base by default.
2. **`totalCollected`** = `max(serviceFee + travelCost + medicineCost − discount, 0)`.
3. **`providerPayout`** = **`totalCollected − platformCommission`**, stored and shown as money ≥ **0** when computed through **`calculateBillingTotals`**.
4. **`PLATFORM_COMMISSION_RATE`** in **`Setting.valueJson`** is a **fraction 0–1**; admin UI edits **whole percent 0–100**.
5. **One billing row** per **`(serviceRequestId, doctorId)`** for doctor completion; duplicate returns **`BILLING_EXISTS`**.

### 16.4 Final API list

| Method | Path | Access |
|--------|------|--------|
| POST | `/api/doctor/service-requests/[id]/complete` | Doctor |
| GET | `/api/doctor/earnings/summary` | Doctor |
| GET | `/api/admin/billing` | Admin panel |
| GET | `/api/admin/billing/[id]` | Admin panel |
| GET | `/api/admin/settings/billing` | Admin panel |
| PUT | `/api/admin/settings/billing` | Admin panel |

### 16.5 Final UI route list (billing-related)

| Route | Purpose |
|--------|---------|
| `/admin/billing` | Billing list + filters |
| `/admin/billing/[id]` | Billing detail + commission explanation |
| `/admin/settings/billing` | Commission % + copy |
| `/admin/settings` | Settings hub (link to billing) |
| `/doctor` | Earnings summary strip (uses earnings API) |
| `/doctor/requests/[id]` | Case detail + complete + billing breakdown |

### 16.6 Known limitations

- **Discount allocation:** MVP uses **discount applied to service fee first** up to **`min(discount, serviceFee)`** unless extended later for split allocation rules.
- **Invoice `BillingStatus` vs `paymentStatus`:** Mapped at creation; changing payment later may need a dedicated patch flow (future).
- **Multi-line payments:** **`PaymentRecord`** lines not yet aggregated into invoice UX (Phase 1 notes).
- **Edge case (documented in §5):** If **`discount > subtotal`**, **`totalCollected`** is **0** while **`commissionBase`** could still be **> 0** under extreme inputs; UI/API should discourage inconsistent discounts or add server-side validation later.

### 16.7 Future improvements

- Customer-facing invoice PDF / share link (**Task Card 14**).
- Partial payment updates and **`PaymentRecord`** reconciliation.
- Optional admin **recalculate** from stored inputs vs stored commission (audit).
- Timezone-aware **current month** for earnings if product requires **Asia/Dhaka** explicitly.

### 16.8 QA checklist (release)

- [ ] **`npx prisma validate`** / **`npx prisma generate`**
- [ ] **`npm run lint`** / **`npm run build`** / **`npm run test`**
- [ ] Doctor: complete case with fees → **`BillingRecord`** row matches **`calculateBillingTotals`**.
- [ ] Admin: change commission → new completions use new rate; existing rows unchanged (historical).
- [ ] Admin: billing list filters + pagination; detail shows formula lines.
- [ ] Earnings: **`currentMonthEarnings`** tracks **`providerPayout`** sum for current calendar month.

---

## 17. Recommended next task

**Task Card 14 — Invoice / Receipt / Payment Confirmation**

(Customer- and operator-facing receipt generation, payment confirmation UX, and alignment with **`BillingRecord`** / **`paymentStatus`**.)

