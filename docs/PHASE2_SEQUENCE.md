# Phase 2 — Implementation Sequence

**Date:** 2026-05-21  
**Prerequisites:** [PHASE1_FREEZE.md](./PHASE1_FREEZE.md) (`P1_COMPLETE=YES`)  
**Plan:** [PHASE2_PLAN.md](./PHASE2_PLAN.md)

---

## Sign-off

```
PHASE2_READY=YES
MODULE_COUNT=10
IMPLEMENTATION_ORDER=P2-00,P2-01,P2-02,P2-03,P2-04,P2-05,P2-06,P2-07,P2-08,P2-09,P2-10,P2-11
```

---

## Module registry (10)

| # | Module ID | Package path (target) |
|---|-----------|------------------------|
| 1 | `user-core` | `modules/users/` (repository + service) |
| 2 | `customer-profile` | `modules/profile/customer-profile.service.ts` |
| 3 | `customer-address` | `modules/profile/customer-address.service.ts` |
| 4 | `location-catalog` | `modules/locations/` |
| 5 | `doctor-profile` | `modules/doctors/` + panel DTO helpers |
| 6 | `technician-profile` | `modules/technicians/` (new thin module) |
| 7 | `provider-areas` | `modules/profile/provider-areas.service.ts` |
| 8 | `farm-context` | `modules/profile/farm-context.service.ts` |
| 9 | `foundation-users` | `modules/users/` routes/controller |
| 10 | `profile-compat` | `modules/profile/compat/*.adapter.ts` |

---

## IMPLEMENTATION_ORDER

Execute in order. Run contract checks between waves.

| Step | ID | Work package | Depends on | Est. |
|------|-----|--------------|------------|------|
| 1 | **P2-00** | Baseline & frozen regression | P1-12 | 0.5d |
| 2 | **P2-01** | `user-core` — wire `UsersRepository` | P2-00 | 1d |
| 3 | **P2-02** | `customer-profile` — bootstrap + serialize me | P2-01 | 1d |
| 4 | **P2-03** | `customer-address` — Zod schema + optional `primaryVillageId` migration | P2-02 | 1d |
| 5 | **P2-04** | `location-catalog` — port master service to module | P2-00 | 1d |
| 6 | **P2-05** | `profile-compat` — mobile/me + register hooks | P2-02, P2-03, P2-04 | 1d |
| 7 | **P2-06** | `doctor-profile` — wire `DoctorsRepository` read + panel DTO | P2-01 | 1d |
| 8 | **P2-07** | `technician-profile` — FK validation + me alignment | P2-01, P2-04 | 1d |
| 9 | **P2-08** | `provider-areas` — village coverage reads | P2-06, P2-07 | 0.5d |
| 10 | **P2-09** | `farm-context` — dashboard-context additive | P2-02 | 0.5d |
| 11 | **P2-10** | `foundation-users` + `/api/users` facade | P2-01, P2-02 | 0.5d |
| 12 | **P2-11** | Verify script + certificate + OpenAPI | P2-05–P2-10 | 1d |

**Total estimate:** ~10–11 engineering days (1 developer).

**Optional:** `P2-12` — `FarmProfile` table (only if product approves) — +1d

---

## Step details

### P2-00 — Baseline

**Tasks:**

1. Run `npm run p1:12-verify` and `npm run e2e:freeze` — record baseline.
2. Snapshot `GET /api/mobile/me` and location list responses (golden JSON).
3. Document `UsersRepository` / `DoctorsRepository` stub status.

**Exit:** Checklist in `docs/P2_00_BASELINE.md` (create at implement time).

---

### P2-01 — user-core

**Tasks:**

1. Implement `UsersRepository` with Prisma (CRUD + `findByPhone`, `findByEmail`).
2. Implement `findOrCreateByPhone` for CUSTOMER role.
3. Unit tests with test DB or mocks.

**Exit:** `UsersService` methods do not throw.

---

### P2-02 — customer-profile

**Tasks:**

1. `ensureCustomerProfile(userId, hints?)` after auth events.
2. `serializeMobileMe(user)` — single function used by compat route.
3. Integrate with OTP verify + register (call sites in auth adapters).

**Exit:** New OTP user always has `CustomerProfile`.

---

### P2-03 — customer-address

**Tasks:**

1. Zod schema for `addressJson`.
2. `resolveAddressHierarchy(ids)` via location-catalog.
3. PATCH merge logic (compat `area` + additive `address` object).
4. Migration: `CustomerProfile.primaryVillageId` optional FK.

**Exit:** Invalid `villageId` → 422; valid → `GET me` shows label.

---

### P2-04 — location-catalog

**Tasks:**

1. Move `legacy/web/lib/locations/location-master-service.ts` logic to `modules/locations/`.
2. Legacy routes re-export or call adapter.
3. Keep response shapes identical.

**Exit:** `p2:verify` location cascade PASS.

---

### P2-05 — profile-compat

**Tasks:**

1. Refactor `mobile/me/route.ts` to thin adapter.
2. Wire register path to `customer-profile.bootstrap`.
3. No envelope or path changes.

**Exit:** Frozen me contract tests PASS.

---

### P2-06 — doctor-profile

**Tasks:**

1. Implement `DoctorsRepository.findByUserId` + `findById`.
2. Align `panel-doctor-auth.service` DTO with module.
3. Admin doctor services may import shared validators (no route change).

**Exit:** `GET /api/doctor/auth/me` unchanged shape.

---

### P2-07 — technician-profile

**Tasks:**

1. Create `modules/technicians/` (or extend doctors module pattern).
2. Validate district/upazila/union FK on admin PATCH.
3. Sync legacy text fields on write.

**Exit:** `GET /api/technician/auth/me` unchanged shape.

---

### P2-08 — provider-areas

**Tasks:**

1. Read APIs for doctor/technician village lists (internal helpers).
2. Used by admin UI and future onboarding — no new public route required in P2.

**Exit:** Service functions tested.

---

### P2-09 — farm-context

**Tasks:**

1. Extend `buildMobileProfileDashboardContext` with `farmSummary` for CUSTOMER.
2. Additive only — existing keys preserved.

**Exit:** Dashboard context JSON includes animal counts.

---

### P2-10 — foundation-users

**Tasks:**

1. Wire `UsersController` to real service.
2. `GET/PATCH /api/users/me` for secondary clients (document auth middleware).

**Exit:** Foundation users returns 200 (not 501).

---

### P2-11 — Verification & docs

**Tasks:**

1. Add `scripts/p2-verify.ts` (matrix from PHASE2_API_MAP §12).
2. `npm run p2:verify` in package.json.
3. `docs/P2_11_CERTIFICATE.md`, update OpenAPI.
4. Regenerate `docs/openapi.json`.

**Exit:** `P2_COMPLETE=YES`, `PROFILE_FOUNDATION_READY=YES`.

---

## Parallelization

```
P2-00 ──┬──► P2-01 ──► P2-02 ──► P2-03 ──► P2-05
        ├──► P2-04 ─────────────────────────────┘
        └──► P2-06 ──► P2-07 ──► P2-08
                 P2-02 ──► P2-09
                 P2-01 ──► P2-10
        All ──► P2-11
```

---

## Verification commands (exit gate)

```bash
cd pranidoctor-backend
npm run build
npm run p1:12-verify    # auth regression
npm run p2:verify       # Phase 2 matrix (create in P2-11)
npm run openapi:generate
npm run e2e:freeze
```

---

## Definition of done (Phase 2)

- [ ] All steps P2-00–P2-11 complete
- [ ] `UsersRepository` and `DoctorsRepository` implemented
- [ ] Compat profile + location paths unchanged (frozen fields)
- [ ] Additive migrations deployed
- [ ] `PHASE2_*` docs merged
- [ ] Mobile team notified of additive `address` + `farmSummary` fields

---

## Output block (CI / README)

```
PHASE2_READY=YES
MODULE_COUNT=10
IMPLEMENTATION_ORDER=P2-00,P2-01,P2-02,P2-03,P2-04,P2-05,P2-06,P2-07,P2-08,P2-09,P2-10,P2-11
```
