# Prani Doctor Database Schema Plan

This document audits the current Prisma schema in `pranidoctor-web`, defines MVP database goals for **Prani Doctor / Animal Doctors** only, and proposes exact future schema changes. It does **not** modify `schema.prisma`.

---

## 1. Project scope and isolation rule

- **Scope:** Database planning for [Prani Doctor](https://pranidoctor.com/) (animal health / veterinary services platform).
- **Isolation:** This plan applies only to Prani Doctor / Animal Doctors. It must not reuse concepts, naming, business rules, or schema patterns from BPA/WPA, Quarbani 2026, or any other project.
- **Assumptions (best-effort):** Bangladesh administrative geography (Division → District → Upazila → Union → Village/ward) is the intended hierarchy for area-based matching; currency defaults to BDT; PostgreSQL remains the provider.

---

## 2. Current schema audit

### 2.1 Files and folders reviewed

| Path | Status |
|------|--------|
| `prisma/schema.prisma` | Present — single source of truth |
| `prisma/migrations/` | **Empty** (no migration SQL committed) |
| `prisma/seed.ts` | Seeds admin user, `ServiceCategory`, placeholder `Area`, `Setting` |
| `src/lib/prisma.ts` | Prisma client with `@prisma/adapter-pg` |
| `src/app/api/` | Present (e.g. `admin/auth/login`, `admin/health`, `mobile/health`) |
| `src/app/admin/` | Dashboard stats query Prisma models |
| `package.json` | Scripts: `db:migrate`, `db:push`, `db:seed`, etc. |
| `docs/` | This file created for schema planning |

### 2.2 Existing models

| Model | Purpose |
|-------|---------|
| `User` | Auth identity: email, optional phone, password hash, role, status |
| `AdminProfile` | Admin display name, 1:1 with `User` |
| `DoctorProfile` | License, specialization, verification |
| `CustomerProfile` | Display name, locale, optional `addressJson` |
| `AnimalProfile` | Pet/livestock record under customer |
| `Area` | Self-referential tree (`parentId`), name + unique `slug` |
| `ServiceCategory` | Catalog for requests |
| `ServiceRequest` | Customer request: animal, area, category, optional assigned doctor, status |
| `TreatmentRecord` | Linked to request + doctor + animal; diagnosis/procedures |
| `Prescription` | Linked to request + doctor + animal; instructions, validity |
| `BillingRecord` | Linked to request + doctor + customer; currency, subtotal/tax/total, status |
| `Notification` | User notifications with string `type`, optional `metadataJson` |
| `Setting` | Key/value JSON configuration |

### 2.3 Existing enums

| Enum | Values |
|------|--------|
| `UserRole` | `ADMIN`, `CUSTOMER`, `DOCTOR` |
| `UserStatus` | `ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION` |
| `AnimalCategory` | `PET`, `LIVESTOCK`, `OTHER` |
| `ServiceRequestStatus` | `SUBMITTED`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `TreatmentRecordStatus` | `DRAFT`, `FINALIZED` |
| `PrescriptionStatus` | `ACTIVE`, `VOIDED` |
| `BillingRecordStatus` | `DRAFT`, `ISSUED`, `PAID`, `VOIDED` |

### 2.4 Relations and indexes (summary)

- **User ↔ profiles:** One optional profile per role (`AdminProfile`, `DoctorProfile`, `CustomerProfile`) — usable pattern for MVP extension (add more profile tables).
- **CustomerProfile → AnimalProfile:** `customerId` indexed — good.
- **Area:** Self-relation `AreaHierarchy`; index on `parentId`; unique `slug`.
- **ServiceRequest:** FKs to customer, animal, area, category, optional doctor; indexes on `status`, `customerId`, `[assignedDoctorId, status]`, `[areaId, serviceCategoryId]`.
- **TreatmentRecord / Prescription / BillingRecord:** Indexed on common FKs as applicable.

### 2.5 What is usable as-is

- Core **User + role-specific profiles** pattern fits MVP if `UserRole` is extended and new profiles are added.
- **Decimal money** on `BillingRecord` (`@db.Decimal(14, 2)`) is the right direction for BDT.
- **Notification** shape (title, body, readAt, metadata JSON) aligns with MVP needs once `type` becomes an enum.
- **Setting** key/value JSON for app configuration.
- **ServiceCategory** + **ServiceRequest** as the booking/request spine — extend with type, AI assignment, schedule, and richer lifecycle.

### 2.6 What needs to change

- **Roles:** Add `AI_TECHNICIAN`, `SUPPORT`, `SUPER_ADMIN` (and clarify whether `ADMIN` vs `SUPER_ADMIN` for panel permissions).
- **Area model:** Current generic `Area` tree is flexible but lacks explicit Bangladesh levels and typed joins for provider coverage. Either evolve `Area` with `level`/`kind` enum + optional external codes, or introduce explicit `Division`…`Village` models with FK chain (heavier migration).
- **Provider service areas:** No join tables for doctor/AI technician ↔ service areas.
- **Service request:** No first-class **request type** (doctor visit / emergency / AI / online); no **assigned AI technician**; schedule/emergency fields are only loose strings (`urgency`, `preferredWindow`).
- **Treatment:** Name `TreatmentRecord` vs product language “Treatment case”; no AI technician as provider; symptoms not separated from chief complaint.
- **Prescription:** No **line items** (`PrescriptionItem`).
- **Billing:** MVP wants fee breakdown (service, travel, medicine, discount, commission, payout) vs current aggregate `subtotal`/`tax`/`total`.
- **Payments:** No **PaymentRecord** (gateway/reference/status history).
- **Reviews, complaints, content:** Missing entirely.
- **Enums:** Several domains still use `String` (`Notification.type`, animal `sex`, `urgency`) where enums improve integrity.

### 2.7 Migration risks

| Risk | Detail |
|------|--------|
| **No committed migrations** | Database may have been created via `db push` or out-of-band SQL; first real migration must baseline against actual DB or accept `migrate diff` from empty. |
| **Enum value additions** | Adding enum members is usually safe in PostgreSQL; **removing/renaming** enum values requires careful SQL or data migration. |
| **Role expansion** | Existing rows must get valid `UserRole`; new enum values need application and seed updates before strict checks. |
| **Renaming models** | Renaming `TreatmentRecord` → `TreatmentCase` breaks API/client imports until code is updated; prefer `@map` table names or phased rename. |
| **Billing shape change** | Replacing `subtotal`/`tax`/`total` with many fee fields requires data mapping or nullable overlap period. |
| **Area refactor** | Changing hierarchy affects all `ServiceRequest.areaId` FKs and seeds; needs backfill plan. |

---

## 3. MVP database goals

| Goal | Database implication |
|------|---------------------|
| **Admin panel** | `User` + `AdminProfile`; consider `SUPER_ADMIN` vs `ADMIN`; dashboard aggregates (requests, billing, complaints). |
| **Customer mobile app** | `CustomerProfile`, `AnimalProfile`, `ServiceRequest`, `Notification`, `Review`, `Complaint`, `PaymentRecord`. |
| **Doctor workflow** | `DoctorProfile`, `DoctorServiceArea`, assignments on `ServiceRequest`, `TreatmentCase`, `Prescription`, billing/payout fields. |
| **AI technician workflow** | `AiTechnicianProfile`, `AiTechnicianServiceArea`, assignment on `ServiceRequest`, optional provider on `TreatmentCase`. |
| **Area-based matching** | Normalized geography or typed `Area` + provider↔area M:N with unique constraints. |
| **Service request lifecycle** | `ServiceRequestType`, richer `ServiceRequestStatus` (add states if needed, e.g. `DISPATCHED`, `AWAITING_PAYMENT`), timestamps (`submittedAt`, `assignedAt`, `startedAt`, `completedAt`, `cancelledAt`). |
| **Treatment case history** | `TreatmentCase` (or evolved `TreatmentRecord`) per request + animal + provider(s). |
| **Prescription** | Header + `PrescriptionItem` lines. |
| **Billing and provider payout** | `BillingRecord` (or renamed) with commission and payout; link to request/case. |
| **Payment record** | `PaymentRecord` for attempts/success, gateway refs, reconciliation. |
| **Review/rating** | `Review` customer→provider (doctor or AI tech), moderation `ReviewStatus`. |
| **Complaint/dispute** | `Complaint` with status, links to request/billing when present. |
| **Content/tutorial** | `ContentPost` (or `Tutorial`) with slug, type, animal type, media URLs, `ContentStatus`. |
| **Notification** | Typed notifications via `NotificationType`; keep `metadataJson` for payloads. |

---

## 4. Required enums

### 4.1 UserRole (required set)

```
ADMIN
CUSTOMER
DOCTOR
AI_TECHNICIAN
SUPPORT
SUPER_ADMIN
```

**Note:** Existing schema has only `ADMIN`, `CUSTOMER`, `DOCTOR`. Migration must extend the enum and assign roles for any new user types.

### 4.2 Additional planned enums

| Enum | Suggested values (MVP) |
|------|-------------------------|
| `UserStatus` | Keep `ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`; optional `DELETED` / `INVITED` if product needs soft-delete or invite flow |
| `ProviderStatus` | `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`, `REJECTED` — for doctor and AI technician onboarding |
| `Gender` | `MALE`, `FEMALE`, `UNKNOWN` (or `OTHER`) — for users and/or animals |
| `AnimalType` | Align with product taxonomy (e.g. `CATTLE`, `GOAT`, `POULTRY`, `DOG`, `CAT`, `OTHER`) — can coexist with `species` string for precision |
| `ServiceRequestType` | `DOCTOR_VISIT`, `EMERGENCY`, `AI_SERVICE`, `ONLINE_CONSULTATION` |
| `ServiceRequestStatus` | Extend current set if lifecycle needs: e.g. add `PENDING_PAYMENT`, `DISPATCHED`, `NO_SHOW` — **finalize with product** |
| `TreatmentCaseStatus` | Map from current `TreatmentRecordStatus`: `DRAFT`, `FINALIZED`; optional `CANCELLED` |
| `BillingStatus` | Align with `BillingRecordStatus` or rename: `DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `VOIDED`, `REFUNDED` (subset for MVP) |
| `PaymentStatus` | `PENDING`, `AUTHORIZED`, `CAPTURED`, `FAILED`, `REFUNDED`, `CANCELLED` |
| `PaymentMethod` | `CASH`, `BKASH`, `NAGAD`, `CARD`, `BANK_TRANSFER`, `OTHER` |
| `ComplaintStatus` | `OPEN`, `IN_REVIEW`, `RESOLVED`, `REJECTED`, `CLOSED` |
| `NotificationType` | `REQUEST_UPDATE`, `PAYMENT`, `CHAT`, `SYSTEM`, `MARKETING`, `COMPLAINT`, `REVIEW` (tune to actual channels) |
| `ContentStatus` | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `ReviewStatus` | `PENDING`, `APPROVED`, `REJECTED`, `HIDDEN` |

**Naming alignment:** Either rename `BillingRecordStatus` → `BillingStatus` in Prisma for consistency, or keep `BillingRecordStatus` as alias and document the mapping.

---

## 5. Required models and relationships

### A. User system

- **User** — extend `UserRole`; optional `phoneVerifiedAt`, `emailVerifiedAt` later.
- **AdminProfile** — keep; optionally add `isSuper` flag **or** rely purely on `SUPER_ADMIN` role (prefer single source of truth: role enum).
- **CustomerProfile** — keep; strengthen address model over time vs only `addressJson`.
- **DoctorProfile** — add `ProviderStatus`, optional geo/service defaults.
- **AiTechnicianProfile** — new; similar verification fields as doctor where relevant.
- **SupportProfile** — optional; if support agents need profile fields beyond `User`; otherwise `User` + `SUPPORT` role may suffice.

### B. Area system

**Options:**

1. **Keep `Area`, add `AreaLevel` enum** (`DIVISION`, `DISTRICT`, `UPAZILA`, `UNION`, `VILLAGE`, `SERVICE_ZONE`) + optional `code` (BBS codes) — lowest disruption; migrate seed to real hierarchy.
2. **Replace with explicit models** `Division`, `District`, `Upazila`, `Union`, `Village` — clearest semantics; more tables and joins.

**Recommendation for MVP:** Option 1 (evolve `Area`) with strict `slug`/`level` conventions and seed data for Bangladesh; allows gradual migration without rewriting every FK immediately.

### C. Provider service area mapping

- **DoctorServiceArea** — `doctorId`, `areaId`, optional `priority`, `@@unique([doctorId, areaId])`, indexes for lookup by `areaId`.
- **AiTechnicianServiceArea** — same for `aiTechnicianId`.

### D. Animal profile

- Link remains **CustomerProfile** (via `customerId`).
- Add **weight** (Decimal or Float), **Gender** enum for animal (or reuse `Gender`), **AnimalType** enum; keep **breed**, **notes**; consider deprecating free-text `species` in favor of `AnimalType` + breed string.

### E. Service request

Fields/concepts:

- `requestedBy` / **customerId** (existing)
- **animalId**, **type** (`ServiceRequestType`), **status** (`ServiceRequestStatus`)
- **areaId** (or finer location FK later)
- **assignedDoctorId** (optional), **assignedAiTechnicianId** (optional)
- **schedule:** `scheduledStart`, `scheduledEnd`, `timezone` (or store UTC only)
- **emergency:** `isEmergency`, `emergencyNotes`, maybe `triageLevel` enum later
- **notes:** general + link to symptoms string or normalized later
- **Lifecycle timestamps:** align with status transitions

### F. Treatment case

- **`TreatmentCase`** as evolution of **`TreatmentRecord`**: same linkage to `ServiceRequest`, `animalId`; **provider** as either `doctorId` OR `aiTechnicianId` (mutually exclusive check in app or partial DB check).
- Fields: **diagnosis**, **symptoms**, **treatment notes** (merge `procedures`/`followUpNotes` naming), **followUpDate**, **status** (`TreatmentCaseStatus`).

### G. Prescription

- **Prescription** header: request, animal, prescriber (doctor; AI prescribing policy is product/legal — schema can allow optional AI prescriber with app rules).
- **PrescriptionItem**: medicine name, dosage, duration, instruction, quantity (Decimal/int as appropriate).

### H. Billing

`BillingRecord` extended (or replaced) with:

- `serviceFee`, `travelCost`, `medicineCost`, `discountAmount`
- `totalCollected` (or derive from sum minus discount — document formula)
- `platformCommission`, `providerPayout`
- `status` (`BillingStatus`)
- FKs: service request, treatment case (optional), customer, primary provider for payout context

### I. Payment record

- **PaymentRecord**: `billingId` or `serviceRequestId`, `method`, `amount`, `currency`, `externalId`/reference, `status`, `paidAt`, optional `metadataJson`.

### J. Review/rating

- **Review**: `customerId`, **provider** (`doctorId` XOR `aiTechnicianId`), `serviceRequestId` (optional uniqueness per request), `rating` (Int 1–5), `comment`, `status` (`ReviewStatus`), `createdAt`.

### K. Content/tutorial

- **ContentPost**: `title`, `slug` unique, `category`/`type`, `animalType` optional, body/content (text or JSON), `videoUrl`, `imageUrl`, `status`, `authorUserId` (admin/editor).

### L. Complaint/dispute

- **Complaint**: `customerId`, optional `doctorId`/`aiTechnicianId`, optional `adminAssigneeId`, `serviceRequestId`, `billingRecordId`, `status`, `resolutionNotes`, timestamps.

### M. Notification

- Keep model; change **type** from `String` to **`NotificationType`** enum; retain **metadataJson**.

---

## 6. Proposed final Prisma model list

**Enums (target list):**

`UserRole`, `UserStatus`, `ProviderStatus`, `Gender`, `AnimalCategory` (keep or merge with `AnimalType`), `AnimalType`, `AreaLevel` (if using evolved Area), `ServiceRequestType`, `ServiceRequestStatus`, `TreatmentCaseStatus`, `PrescriptionStatus`, `BillingStatus`, `PaymentStatus`, `PaymentMethod`, `ComplaintStatus`, `NotificationType`, `ContentStatus`, `ReviewStatus`

**Models (target list):**

`User`, `AdminProfile`, `CustomerProfile`, `DoctorProfile`, `AiTechnicianProfile`, `SupportProfile` (optional), `AnimalProfile`, `Area`, `ServiceCategory`, `DoctorServiceArea`, `AiTechnicianServiceArea`, `ServiceRequest`, `TreatmentCase` (or renamed table from `TreatmentRecord`), `Prescription`, `PrescriptionItem`, `BillingRecord`, `PaymentRecord`, `Review`, `Complaint`, `ContentPost`, `Notification`, `Setting`

---

## 7. Exact Prisma schema change proposal (readable — not applied)

### 7.1 New enums

- Extend **`UserRole`**: `AI_TECHNICIAN`, `SUPPORT`, `SUPER_ADMIN`.
- Add **`ProviderStatus`**, **`Gender`**, **`AnimalType`** (if not merging into existing `AnimalCategory`).
- Add **`ServiceRequestType`**: `DOCTOR_VISIT`, `EMERGENCY`, `AI_SERVICE`, `ONLINE_CONSULTATION`.
- Extend **`ServiceRequestStatus`** as needed for lifecycle (additive preferred).
- Add **`TreatmentCaseStatus`** (or rename `TreatmentRecordStatus`).
- Introduce **`BillingStatus`** or extend **`BillingRecordStatus`** with payout-related states if needed.
- Add **`PaymentStatus`**, **`PaymentMethod`**.
- Add **`ComplaintStatus`**, **`NotificationType`**, **`ContentStatus`**, **`ReviewStatus`**.
- Optional **`AreaLevel`** if keeping unified `Area` tree.

### 7.2 New models

- `AiTechnicianProfile` — `userId` unique, verification fields, relation to `User`.
- `DoctorServiceArea`, `AiTechnicianServiceArea` — as in section 5C.
- `PrescriptionItem` — FK to `Prescription`, line fields, `@@index([prescriptionId])`.
- `PaymentRecord` — FK to billing and/or request; amount Decimal; reference fields.
- `Review` — customer + provider XOR + optional request; `@@unique` constraints where business rules require one review per completed service.
- `Complaint` — FKs and status.
- `ContentPost` — slug unique, author FK to `User`.

### 7.3 Existing models to modify

- **`User`**: `role` enum extended; optional relations `aiTechnicianProfile`, `supportProfile`.
- **`Area`**: add `level` / `kind` / `code` fields if using Option 1.
- **`AnimalProfile`**: add weight; enum for sex/gender; `AnimalType` optional field.
- **`ServiceRequest`**: `type`, `assignedAiTechnicianId`, schedule/emergency fields, extra timestamps.
- **`TreatmentRecord`** → **`TreatmentCase`** (or keep model name, add AI provider FK): add `aiTechnicianId` nullable, `symptoms`, rename fields for clarity; consider `@@map("TreatmentRecord")` during transition.
- **`Prescription`**: optional items relation; optional second prescriber type if legally allowed.
- **`BillingRecord`**: replace or supplement aggregates with fee breakdown + `platformCommission` + `providerPayout`; link to `TreatmentCase` optional.
- **`Notification`**: `type` → `NotificationType`.

### 7.4 Existing models to keep

`User`, `AdminProfile`, `CustomerProfile`, `DoctorProfile`, `ServiceCategory`, `Setting`, core `ServiceRequest` pattern, `Notification` (with type change), `Setting`.

### 7.5 Gradual deprecation

- **`TreatmentRecord`**: rename to `TreatmentCase` in API after DB migration; use Prisma `@@map` to old table name during transition.
- **`Area`**: do not drop until new hierarchy is seeded and requests repointed if switching models.
- **Billing fields `subtotal`/`tax`**: keep nullable during parallel run with new columns, then backfill and remove in a later migration.

### 7.6 Relation rules

- One `User` has at most one profile matching **active business role** (enforce in application; DB check optional).
- `ServiceRequest` belongs to one customer and one animal; optional one doctor and optional one AI technician (business rules define exclusivity for certain `ServiceRequestType`s).
- `PaymentRecord` belongs to a billing record and/or service request for traceability.
- `Review` references one provider type per row.

### 7.7 Indexes and unique constraints

- `DoctorServiceArea`: `@@unique([doctorId, areaId])`; `@@index([areaId])`.
- `AiTechnicianServiceArea`: `@@unique([aiTechnicianId, areaId])`; `@@index([areaId])`.
- `PaymentRecord`: `@@index([billingRecordId])`, `@@index([status])`, unique on `externalId` **if** gateway IDs are globally unique (partial unique index may need raw SQL).
- `Review`: `@@unique([customerId, serviceRequestId])` if one review per request.
- `ContentPost`: `slug` `@unique`.
- `ServiceRequest`: additional indexes on `[type, status]`, `[assignedAiTechnicianId, status]` when column exists.

### 7.8 Decimal usage for money

- All monetary fields: `@db.Decimal(14, 2)` (or `(12, 2)` for smaller sums); **currency** on billing/payment rows (default `BDT`).
- **Quantity** for medicines: `Decimal` if fractional doses; `Int` if always whole units.

### 7.9 JSON usage

- Keep **`metadataJson`** on `Notification`, **`valueJson`** on `Setting`, **`metadataJson`** on `Area` only where unstructured extras are needed; prefer columns for queryable MVP fields.

---

## 8. Migration strategy

### 8.1 Safe migration approach

1. **Baseline:** If production DB exists without migrations, generate initial migration from current schema or use `prisma migrate diff` against shadow DB; commit migration history going forward.
2. **Additive-first:** Add enums and nullable columns before backfill; deploy app that writes dual fields if needed.
3. **Data backfill:** Scripts (tsx) to populate new FKs from old strings (e.g. map `Area` slugs to levels).

### 8.2 Backward compatibility

- Keep old columns nullable while new code paths populate new fields.
- API layer accepts legacy shapes until mobile/web clients ship.

### 8.3 Seed update plan

- Extend `seed.ts` with: sample AI technician user (optional), extra areas under Dhaka, `ServiceCategory` entries for new request types if distinct from categories.
- Document dev passwords only for local environments.

### 8.4 Data preservation

- Never drop `TreatmentRecord`/`BillingRecord` rows without export; use soft migrations.
- Money history: preserve old totals when splitting into fee lines for audit.

### 8.5 Rollback risk notes

- Enum changes in PostgreSQL are easy to add, harder to remove — avoid destructive enum edits in hot paths.
- Dropping columns loses financial audit trail — prefer deprecated columns until finance sign-off.

---

## Seed Data Plan

This section defines **development-oriented** seed data for Prani Doctor. Production deployments must not rely on default passwords or demo users.

### Minimum development admin / super admin

- **One** panel user with `UserRole.ADMIN` or `UserRole.SUPER_ADMIN`, `UserStatus.ACTIVE`, plus `AdminProfile`.
- **Default role:** `ADMIN` (matches seed default); `SUPER_ADMIN` also works for panel login when `AdminProfile` exists (see Application Compatibility Audit).
- **Idempotency:** Upsert by **email** so re-runs update fields without duplicating users.

### Minimum geography (Division → Village)

- One chain: **Division** → **District** → **Upazila** → **Union** → **Village** (service leaf), using stable **slugs** for `upsert` keys.
- Optional legacy **`Area`** tree retained for backward compatibility with older `ServiceRequest.areaId` references.

### Minimum service categories

`ServiceCategory` rows are catalog labels (distinct from `ServiceRequestType`). Seed ensures at least these **four** labels exist, keyed by slug:

| Slug | Display name (intent) |
|------|------------------------|
| `doctor-visit` | Doctor Visit |
| `emergency` | Emergency |
| `ai-service` | AI Service |
| `online-consultation` | Online Consultation |

Additional categories (e.g. vaccination, livestock) may remain as optional catalog entries for UI variety.

### Minimum doctor profile (optional, dev-only)

- Only when explicitly enabled (e.g. demo flag env).
- **User** `DOCTOR` + **DoctorProfile** (`licenseNumber`, `ProviderStatus.ACTIVE` for local testing).
- **Never** enable default demo doctor seed in production without strong secrets and review.

### Minimum AI technician profile (optional, dev-only)

- Only when the same demo flag is enabled.
- **User** `AI_TECHNICIAN` + **AiTechnicianProfile** (`ProviderStatus.ACTIVE`).

### Minimum content / tutorial (optional, dev-only)

- **ContentPost** with `ContentStatus.DRAFT` or `PUBLISHED`, author = seeded admin user.
- Only when demo/content flag is enabled so CI and production do not get stray tutorials.

### Do **not** seed in production (unless explicitly configured)

- Default **plaintext-equivalent** passwords printed to logs.
- Demo **doctor**, **AI technician**, or **customer** users without audited secrets.
- **ServiceRequest** / **TreatmentCase** / **BillingRecord** demo rows (no fake requests unless product approves a dedicated `PRANI_SEED_REQUESTS_DEMO` and non-prod guard).

### Environment variables (seed)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Required for Prisma (see `prisma.config.ts`). |
| `PRANI_SEED_ADMIN_EMAIL` | Admin panel user email (default: dev-only fallback in seed code). |
| `PRANI_SEED_ADMIN_PASSWORD` | Admin password for bcrypt hash. **Required for creating/updating admin in production.** |
| `PRANI_SEED_ADMIN_PHONE` | Optional unique phone on `User`. |
| `PRANI_SEED_ADMIN_ROLE` | `ADMIN` or `SUPER_ADMIN` (default: `ADMIN`; both work for admin panel login when `AdminProfile` exists). |
| `PRANI_SEED_DEMO` | If `"true"`, seed optional demo doctor, AI technician, and draft content (keep **false** in production). |
| `PRANI_SEED_DOCTOR_EMAIL` / `PRANI_SEED_DOCTOR_PASSWORD` | Demo doctor credentials when demo mode on. |
| `PRANI_SEED_AI_TECH_EMAIL` / `PRANI_SEED_AI_TECH_PASSWORD` | Demo AI technician credentials when demo mode on. |

---

## Application Compatibility Audit

Audit performed after schema MVP migration (`TreatmentCase`, `BillingStatus`, geography models, extended `UserRole`).

### Broken references found

- **Admin login** (`src/app/api/admin/auth/login/route.ts`) previously allowed only `UserRole.ADMIN`. Users with `UserRole.SUPER_ADMIN` and `AdminProfile` could not sign in.
- **JWT** (`src/lib/admin-auth/jwt.ts`) embedded only `role: "ADMIN"` and verification rejected other roles.

### Files updated

- `src/lib/admin-auth/jwt.ts` — session payload allows `ADMIN` \| `SUPER_ADMIN`; `signAdminToken` takes explicit panel role.
- `src/app/api/admin/auth/login/route.ts` — accepts `ADMIN` or `SUPER_ADMIN` with `AdminProfile`; issues JWT with matching session role.

### API routes impacted

- `POST /api/admin/auth/login` — behavior extended; existing `ADMIN` users unchanged.

### Admin pages impacted

- None beyond login/session behavior (middleware still checks presence of a valid admin JWT only).

### TypeScript types impacted

- `AdminJwtPayload.role` is now `"ADMIN" \| "SUPER_ADMIN"`.

### Fix strategy

- Align session JWT with Prisma admin roles used for the panel (`ADMIN`, `SUPER_ADMIN`). Other roles (`CUSTOMER`, `DOCTOR`, etc.) remain excluded from admin routes.
- No Prisma relation renames required in remaining app code: dashboard stats already used `treatmentCase`, `BillingStatus`, etc.

### TODO (not built in this pass)

- Admin `/me` response could expose `role` for UI if needed.
- Provider/mobile APIs remain minimal (`/api/mobile/health`); full CRUD remains future work.

---

## 9. Implementation checklist (next command)

- [x] Update `prisma/schema.prisma` per sections 7–8
- [x] Run `npx prisma format`
- [x] Generate migration (`npx prisma migrate dev` — migration `20260508195220_prani_doctor_mvp_schema`)
- [x] Update `prisma/seed.ts` for new enums/models (geography chain + legacy `Area`)
- [x] Update TypeScript imports (`dashboard-stats.ts` uses `TreatmentCaseStatus`, `BillingStatus`, `prisma.treatmentCase`)
- [x] Run `npm run lint`
- [x] Run `npm run build`
- [x] Smoke-test admin login and APIs touching changed models (recommended manual pass)
- [x] Extend admin auth to recognize `SUPER_ADMIN` parallel to `ADMIN`

---

## 10. Implementation status (schema applied)

**Status:** Implemented in `prisma/schema.prisma` with generated client and applied migration on the developer database used during this task.

**Enums implemented**

- `UserRole`: `ADMIN`, `CUSTOMER`, `DOCTOR`, `AI_TECHNICIAN`, `SUPPORT`, `SUPER_ADMIN`
- `UserStatus`: extended with `INVITED`, `DELETED`
- `ProviderStatus`, `Gender`, `AnimalType`
- `ServiceRequestType`, extended `ServiceRequestStatus`
- `TreatmentCaseStatus` (replaces prior `TreatmentRecordStatus` in schema)
- `BillingStatus` (replaces prior `BillingRecordStatus` in schema)
- `PaymentStatus`, `PaymentMethod`, `ComplaintStatus`, `NotificationType`, `ContentStatus`, `ReviewStatus`
- Retained: `AnimalCategory`, `PrescriptionStatus`

**Models implemented**

- User system: `User`, `AdminProfile`, `CustomerProfile`, `DoctorProfile`, `AiTechnicianProfile`
- Geography: `Division`, `District`, `Upazila`, `Union`, `Village`; legacy `Area` retained for backward compatibility
- Coverage: `DoctorServiceArea`, `AiTechnicianServiceArea` (both keyed to `Village`)
- Core domain: `AnimalProfile`, `ServiceCategory`, `ServiceRequest`, `TreatmentCase` (`@@map("TreatmentRecord")`), `Prescription`, `PrescriptionItem`, `BillingRecord`, `PaymentRecord`, `Review`, `ContentPost`, `Complaint`, `Notification`, `Setting`

**Not implemented (still optional per earlier plan)**

- `SupportProfile` — only `UserRole.SUPPORT` is present; no separate profile table.

---

## 11. Deviations from the original plan

1. **Area strategy:** The written plan (section 5B) leaned toward evolving the single `Area` model first. The product implementation task required explicit `Division` → `Village` tables **and** retention of legacy `Area` for existing seeds and requests. New work should prefer `Village` + provider join tables; `Area` is transitional.
2. **DoctorServiceArea / AiTechnicianServiceArea:** Plan text referenced `areaId`; implementation uses **`villageId`** as the leaf coverage unit for clearer Bangladesh matching.
3. **Review uniqueness:** A composite `@@unique([customerId, serviceRequestId])` was omitted because `serviceRequestId` is optional and PostgreSQL unique semantics with `NULL` are ambiguous; a composite **`@@index([customerId, serviceRequestId])`** is used instead. Add a **partial unique index** (where `serviceRequestId` is not null) in a follow-up migration if the product requires strictly one review per request.
4. **Enum renames:** `BillingRecordStatus` and `TreatmentRecordStatus` were replaced by **`BillingStatus`** and **`TreatmentCaseStatus`** in Prisma (not kept as parallel aliases).

---

## 12. Migration notes

- Migration folder: `prisma/migrations/20260508195220_prani_doctor_mvp_schema/migration.sql`
- PostgreSQL recreated enum-backed columns for **`BillingRecord.status`**, **`TreatmentRecord.status`** (table name unchanged; model is `TreatmentCase`), and **`Notification.type`** using drop/add pattern. Prisma emitted warnings about potential data loss if those columns had contained values other than defaults — acceptable for early MVP/dev; **production** databases with real notification or billing history should review and backfill before applying the same pattern.
- Existing `TreatmentRecord` rows: `doctorId` became nullable; new nullable columns `aiTechnicianId`, `symptoms`, `treatmentNotes`, `followUpDate` added.
- Existing `BillingRecord` rows: legacy `subtotal`/`tax`/`total` made nullable; new fee fields added as nullable.
- Existing `Prescription` rows: `doctorId` preserved where present; `aiTechnicianId` added nullable.

---

## 13. Remaining TODOs

- Wire admin and mobile APIs to `Village` + `ServiceRequest.villageId`; backfill from legacy `Area` where needed.
- Enforce “doctor XOR AI technician” for `TreatmentCase`, `Prescription`, and `BillingRecord` in application or DB checks.
- Backfill `BillingRecord` fee columns from legacy `subtotal`/`tax`/`total` where appropriate; then deprecate legacy aggregates.
- Add partial unique index on reviews when `serviceRequestId` is non-null.
- Consider seeding a sample `AiTechnicianProfile` user for QA (optional).

---

## Document control

| Version | Date | Notes |
|---------|------|-------|
| 1.0 | 2026-05-09 | Initial audit and MVP plan for Prani Doctor |
| 1.1 | 2026-05-09 | Implementation status, migration `20260508195220_prani_doctor_mvp_schema`, deviations |
| 1.3 | 2026-05-09 | Application Compatibility Audit; admin JWT supports `SUPER_ADMIN` |
