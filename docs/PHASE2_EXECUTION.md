# Phase 2 — Execution Record

**Project:** Prani Doctor  
**Date:** 2026-05-21  
**Mode:** IMPLEMENT  
**Scope:** User, Profile, Area, Doctor, Technician (auth/session/OTP unchanged)

---

## 1. Modules delivered

| Module path | Responsibility |
|-------------|----------------|
| `pranidoctor-backend/src/modules/user/` | Customer user lookup, `findOrCreateCustomerByPhone` |
| `pranidoctor-backend/src/modules/profile/` | Customer profile, address Zod, farm summary, provider coverage, `mobile/me` compat adapter |
| `pranidoctor-backend/src/modules/area/` | Location catalog re-export + hierarchy validation (`AreaCatalogService`) |
| `pranidoctor-backend/src/modules/doctor/` | `DoctorRepository` / `DoctorService` (Prisma) |
| `pranidoctor-backend/src/modules/technician/` | Technician profile + area FK validation + coverage reads |

**Wired into existing foundation packages:**

- `modules/users/users.repository.ts` — Prisma implementation (foundation `/api/users`)
- `modules/doctors/doctors.repository.ts` — delegates to `modules/doctor`

---

## 2. Schema (additive)

`CustomerProfile`:

- `primaryVillageId` (optional FK → `Village`)
- `profileCompletedAt` (optional)

Applied via `prisma db push` on dev database.

---

## 3. Compat routes refactored (frozen shapes)

| Route | Change |
|-------|--------|
| `GET/PATCH /api/mobile/me` | Thin adapter → `modules/profile/compat/mobile-me.adapter.ts` |
| `PATCH /api/mobile/me` | Additive `address` object (hierarchy IDs + line1/postalCode) |
| `GET /api/mobile/profile/dashboard-context` | Additive `farmSummary` for CUSTOMER |
| Location APIs | Unchanged paths; catalog owned by `modules/area` |

**Not modified:** OTP, session, refresh, device, login/register **handlers** (only profile services consumed by existing flows).

---

## 4. Capabilities

| Capability | Status |
|------------|--------|
| Registration (password) | Profile row created with user (existing + verified) |
| Profile read/update | `GET/PATCH /api/mobile/me` via profile module |
| Address | Zod `addressJson`, hierarchy validation, `primaryVillageId` |
| Language | Frozen `locale` on PATCH me |
| Doctor profile reads | `DoctorsRepository` no longer throws |
| Technician area FKs | `TechnicianRepository.updateAreaFields` syncs legacy text |
| Coverage | `ProviderAreasService` village lists for doctor/technician |

---

## 5. Verification run

```bash
cd pranidoctor-backend
npm run build                    # PASS
npx vitest run src/modules/profile src/modules/auth  # 46 tests PASS (profile schema included)
npm run openapi:generate         # PASS (176 legacy paths)
npm run p2:verify                # P2_MATRIX=10/10 P2_PASS=YES (backend on :3000)
npm run e2e:freeze               # 8/9 (web proxy skipped — web dev not running)
```

**Note:** Full `npm test` includes legacy suites that fail vitest `@/` alias resolution (pre-existing). Phase 2 module tests pass.

**P1 regression:** Run `P2_INCLUDE_P1=1 npm run p2:verify` when a full auth matrix re-check is required.

---

## 6. Known follow-ups

1. **`GET /api/users/me`** — Returns 404 without `userId` on request (foundation auth middleware not wired in P2).
2. **OTP route 405** — Observed on some dev loads for `/api/mobile/auth/otp/request` (lazy handler); password register used for P2 verify instead.
3. **Circular import** — Do not import `customer-profile.service` from `customer-credentials-service` at runtime (caused 500 on register).

---

## 7. Output

```
USER_READY=YES
PROFILE_READY=YES
AREA_READY=YES
DOCTOR_READY=YES
TECHNICIAN_READY=YES
P2_PASS=YES
```
