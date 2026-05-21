# Phase 2 Freeze — User, Profile, Area Foundation

**Date:** 2026-05-21  
**Status:** **FROZEN (profile & area slice)**  
**Prerequisites:** [PHASE1_FREEZE.md](./PHASE1_FREEZE.md) (`P1_COMPLETE=YES`, `AUTH_COMPLETE=YES`)  
**Certificate:** [PHASE2_CERTIFICATE.md](./PHASE2_CERTIFICATE.md)  
**Execution:** [PHASE2_EXECUTION.md](./PHASE2_EXECUTION.md)

---

## Sign-off

```
PHASE2_PASS=YES
PHASE3_READY=YES
P2_COMPLETE=YES
PROFILE_FOUNDATION_FROZEN=YES
```

---

## 1. What is frozen

### 1.1 Domain capabilities (no breaking changes without version bump)

| Domain | Frozen routes / behavior | Owner module |
|--------|--------------------------|--------------|
| **Registration** | `POST /api/mobile/auth/register` — tokens + user; `CustomerProfile` on create | `legacy` credentials + `modules/profile` |
| **Profile** | `GET/PATCH /api/mobile/me` — `id`, `name`, `phone`, `email`, `area`, `locale`, photos | `modules/profile` |
| **Language** | `locale` on `GET/PATCH /api/mobile/me` (`bn-BD` \| `en-US`) | `modules/profile` |
| **Area** | `GET /api/mobile/locations/*`, `/api/locations/*` — hierarchy row shape | `modules/area` |
| **Doctor** | `GET /api/doctor/auth/me` — `user.doctorProfileId`, `providerStatus` | `modules/doctor` + P1 auth |
| **Technician** | `GET /api/technician/auth/me` — panel user shape | `modules/technician` + P1 auth |

### 1.2 Additive fields (Phase 2 — clients may adopt optionally)

| Surface | Additive |
|---------|----------|
| `GET /api/mobile/me` | `profileComplete?: boolean` |
| `PATCH /api/mobile/me` | `address: { divisionId, districtId, upazilaId, unionId, villageId, line1, postalCode }` |
| `GET /api/mobile/profile/dashboard-context` | `farmSummary?: { animalCount, activeAnimalCount, primaryVillageId, primaryVillageLabelBn }` |
| `CustomerProfile` (DB) | `primaryVillageId`, `profileCompletedAt` |

### 1.3 Still owned by Phase 1 (unchanged in P2)

- OTP, session, refresh, device registry
- Panel login/logout envelopes
- `modules/auth/i18n` error catalog

---

## 2. Backend modules (canonical)

```
src/modules/user/          — customer user Prisma access
src/modules/profile/       — customer profile, address, farm context, coverage, mobile/me adapter
src/modules/area/          — location catalog + hierarchy validation
src/modules/doctor/        — DoctorProfile reads
src/modules/technician/    — AiTechnicianProfile + area FK sync
```

Foundation wiring:

- `modules/users/users.repository.ts` — Prisma (no throw)
- `modules/doctors/doctors.repository.ts` — delegates to `modules/doctor`

---

## 3. Verification baseline (re-run before Phase 3 work)

```bash
cd pranidoctor-backend
npm run build
npm run openapi:generate
npm run p2:verify
npm run e2e:freeze
```

Optional full auth regression:

```bash
P2_INCLUDE_P1=1 npm run p2:verify
# or
npm run p1:12-verify
```

| Gate | Result (2026-05-21 freeze run) |
|------|--------------------------------|
| **Build** | PASS |
| **OpenAPI** | PASS (176 legacy paths) |
| **`p2:verify`** | **13/13** — `P2_PASS=YES` |
| **Module tests** | 46/46 (`src/modules/profile`, `src/modules/auth`) |
| **`e2e:freeze`** | 8/9 — web proxy skipped (web dev not on :3001) |

### 3.1 Domain matrix (`p2:verify`)

| Domain | Check | Result |
|--------|-------|--------|
| **register** | `POST /api/mobile/auth/register` | PASS |
| **profile** | `GET /api/mobile/me` frozen fields | PASS |
| **profile** | `dashboard-context` + `farmSummary` | PASS |
| **language** | `PATCH /api/mobile/me` `locale: en-US` | PASS |
| **area** | `GET /api/mobile/locations/divisions` | PASS |
| **doctor** | `GET /api/doctor/auth/me` (seed user) | PASS |
| **technician** | `GET /api/technician/auth/me` (seed user) | PASS |
| **user module** | `UsersRepository` / `DoctorsRepository` smoke | PASS |

---

## 4. Web (pranidoctor-web)

| Rule | Status |
|------|--------|
| API consumer only | FROZEN |
| No Prisma on web | FROZEN |
| Proxies pass-through compat routes | FROZEN |

Start web dev (`:3001`) before expecting `e2e:freeze` 9/9.

---

## 5. Phase 3 entry criteria

Phase 3 may proceed when:

1. This freeze doc sign-off holds (`PHASE2_PASS=YES`).
2. Phase 1 auth freeze remains valid (`P1_COMPLETE=YES`).
3. No compat route renames or envelope changes without explicit bump.

**Suggested Phase 3 scope (not started):** service requests, billing, operational workflows — see product roadmap.

---

## 6. Related documents

| Doc | Purpose |
|-----|---------|
| [PHASE2_PLAN.md](./PHASE2_PLAN.md) | Master plan |
| [PHASE2_API_MAP.md](./PHASE2_API_MAP.md) | Route ownership |
| [PHASE2_DB_MAP.md](./PHASE2_DB_MAP.md) | Schema |
| [PHASE2_SEQUENCE.md](./PHASE2_SEQUENCE.md) | Implementation order |
| [openapi.json](./openapi.json) | Generated contract snapshot |

---

## 7. Output block (CI / README)

```
PHASE2_PASS=YES
PHASE3_READY=YES
```
