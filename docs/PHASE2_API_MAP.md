# Phase 2 — API Map (User, Profile, Area)

**Date:** 2026-05-21  
**Envelope:** Compat `{ ok, data }` unless noted. Foundation `{ success, data }`.  
**OpenAPI source:** [openapi.json](./openapi.json) (176+ legacy paths)

---

## 1. Legend

| Owner | Meaning |
|-------|---------|
| **FROZEN** | Path + success shape locked — additive `data` fields only |
| **COMPAT-P2** | Compat route; handler refactored to call Phase 2 module |
| **FOUNDATION** | Express module `/api/users` or `/api/doctors` |
| **AUTH-P1** | Phase 1 auth — reuse only |

---

## 2. Registration & user creation

| Method | Path | Owner | Auth | Phase 2 service chain |
|--------|------|-------|------|------------------------|
| POST | `/api/mobile/auth/otp/request` | AUTH-P1 FROZEN | — | `IdentityAuthService.mobileOtp` |
| POST | `/api/mobile/auth/otp/verify` | AUTH-P1 FROZEN | — | OTP verify → `user-core.ensureCustomer` + `customer-profile.bootstrap` |
| POST | `/api/mobile/auth/register` | AUTH-P1 FROZEN | — | `registerCustomerWithPassword` → profile bootstrap |
| POST | `/api/mobile/auth/login` | AUTH-P1 FROZEN | — | credentials → profile bootstrap if missing |

**Registration `data` (frozen):** tokens + user object per existing handler; no field removals.

**Phase 2 additive (optional):** `isNewUser`, `profileComplete: boolean` on register/verify responses.

---

## 3. Customer profile & address

| Method | Path | Owner | Auth | Notes |
|--------|------|-------|------|-------|
| GET | `/api/mobile/me` | FROZEN | Bearer | `id`, `name`, `phone`, `email`, `area`, `locale`, photos |
| PATCH | `/api/mobile/me` | FROZEN | Bearer | `name`, `email`, `area`, `locale` optional |
| GET | `/api/mobile/profile/dashboard-context` | COMPAT-P2 | Bearer | Multi-role; farmer/tech/doctor tabs |
| POST | `/api/mobile/uploads/profile-image` | FROZEN | Bearer | Media module |

**PATCH additive body (Phase 2):**

```json
{
  "address": {
    "divisionId": "string",
    "districtId": "string",
    "upazilaId": "string",
    "unionId": "string",
    "villageId": "string",
    "line1": "string"
  }
}
```

Compat `area` string remains supported (maps to `addressJson.areaLabel`).

---

## 4. Farm context (logical profile)

| Method | Path | Owner | Auth | Notes |
|--------|------|-------|------|-------|
| GET | `/api/mobile/profile/dashboard-context` | COMPAT-P2 | Bearer | Additive `farmSummary` for CUSTOMER |
| GET | `/api/mobile/animals` | FROZEN* | Bearer | Animal list — links to farm UX |
| POST | `/api/mobile/animals` | FROZEN* | Bearer | Add animal |

\*Exists in OpenAPI; treat as frozen for Phase 2 regression only.

**Additive `farmSummary` example:**

```json
{
  "animalCount": 3,
  "activeAnimalCount": 2,
  "primaryVillageId": "cuid?",
  "primaryVillageLabelBn": "string?"
}
```

---

## 5. Language / locale

| Method | Path | Field | Owner |
|--------|------|-------|-------|
| GET/PATCH | `/api/mobile/me` | `locale` | FROZEN (P1-11) |
| All mobile profile/location errors | — | `error.code` frozen | `auth/i18n` |

**Header:** `Accept-Language` on PATCH me, location search, profile validation errors (not OTP).

---

## 6. Area hierarchy (read)

### 6.1 Mobile (customer picker — FROZEN paths)

| Method | Path | Query | Owner |
|--------|------|-------|-------|
| GET | `/api/mobile/locations/divisions` | — | COMPAT-P2 |
| GET | `/api/mobile/locations/districts` | `divisionId` | COMPAT-P2 |
| GET | `/api/mobile/locations/upazilas` | `districtId` | COMPAT-P2 |
| GET | `/api/mobile/locations/unions` | `upazilaId` | COMPAT-P2 |
| GET | `/api/mobile/locations/villages` | `unionId` | COMPAT-P2 |
| GET | `/api/mobile/locations/search` | `q`, `limit` | COMPAT-P2 |

**Row shape (stable):** `{ id, slug, code, nameEn, nameBn, latitude?, longitude?, isVerified }`

### 6.2 Public / admin catalog

| Method | Path | Owner |
|--------|------|-------|
| GET | `/api/locations/divisions` | COMPAT-P2 |
| GET | `/api/locations/districts` | COMPAT-P2 |
| GET | `/api/locations/upazilas` | COMPAT-P2 |
| GET | `/api/locations/unions` | COMPAT-P2 |
| GET | `/api/locations/villages` | COMPAT-P2 |
| GET | `/api/locations/search` | COMPAT-P2 |
| GET | `/api/locations/tree` | COMPAT-P2 |
| GET | `/api/admin/locations/stats` | FROZEN |
| GET | `/api/admin/locations/missing-coords` | FROZEN |
| GET | `/api/admin/locations/pending-verification` | FROZEN |

---

## 7. Doctor

### 7.1 Panel auth (FROZEN)

| Method | Path | Owner |
|--------|------|-------|
| POST | `/api/doctor/auth/login` | AUTH-P1 |
| POST | `/api/doctor/auth/logout` | AUTH-P1 |
| GET | `/api/doctor/auth/me` | AUTH-P1 |

**`me` user object (frozen keys):** `id`, `email`, `displayName`, `doctorProfileId`, `role`, `providerStatus`, …

### 7.2 Doctor profile & areas (compat operational)

| Method | Path | Owner | Notes |
|--------|------|-------|-------|
| GET | `/api/doctor/service-requests` | legacy | Out of P2 core |
| GET | `/api/doctor/tutorials` | legacy | Onboarding content |

### 7.3 Admin doctor management (FROZEN)

| Method | Path | Owner |
|--------|------|-------|
| GET/POST | `/api/admin/doctors` | legacy admin |
| PATCH | `/api/admin/doctors/{id}/*` | visit-fee, categories, availability, … |

**Phase 2:** Shared `doctor-profile.service` used by admin services — no path changes.

### 7.4 Foundation doctors module

| Method | Path | Owner | Notes |
|--------|------|-------|-------|
| GET | `/api/doctors` | FOUNDATION | List/filter (secondary) |
| GET | `/api/doctors/{id}` | FOUNDATION | By profile id |
| PATCH | `/api/doctors/{id}` | FOUNDATION | Admin/service use |

---

## 8. Technician

### 8.1 Panel auth (FROZEN)

| Method | Path | Owner |
|--------|------|-------|
| POST | `/api/technician/auth/login` | AUTH-P1 |
| POST | `/api/technician/auth/logout` | AUTH-P1 |
| GET | `/api/technician/auth/me` | AUTH-P1 |

**`me` user object (frozen):** `id`, `email`, `displayName`, `aiTechnicianProfileId`, `providerStatus`, …

### 8.2 Technician profile & coverage

| Method | Path | Owner | Notes |
|--------|------|-------|-------|
| GET/PATCH | `/api/admin/ai-technicians/{id}/*` | legacy admin | Review workflow |
| GET | `/api/admin/ai-technicians/{id}/village-service-areas` | legacy | Village coverage |

**Phase 2:** `technician-profile.service` + `provider-areas` for FK validation (district/upazila/union).

---

## 9. Foundation users module

| Method | Path | Owner | Auth |
|--------|------|-------|------|
| GET | `/api/users/me` | FOUNDATION | Bearer (future) / session TBD |
| GET | `/api/users/{id}` | FOUNDATION | Admin token |
| PATCH | `/api/users/{id}` | FOUNDATION | Admin |
| GET | `/api/users` | FOUNDATION | Admin list |

**Note:** Mobile production continues `/api/mobile/me`; foundation is for tooling and Phase 3+ admin API consolidation.

---

## 10. Auth reuse matrix (Phase 2 must not break)

| Capability | Used by Phase 2 |
|------------|-----------------|
| `requireMobileCustomer` | `/api/mobile/me`, animals, uploads, dashboard-context (customer) |
| `requireMobileProfileDashboardContextUser` | dashboard-context |
| Panel session cookies | doctor/technician `me` |
| `IdentityAuthService` | OTP/register only |
| `DeviceService` | Unchanged |
| `locale` + `authJsonError` | Profile/location validation |

---

## 11. Web proxy map (pranidoctor-web)

| Backend path | Web proxy (typical) |
|--------------|---------------------|
| `/api/mobile/me` | `src/app/api/mobile/me/**` |
| `/api/mobile/locations/**` | `src/app/api/mobile/locations/**` |
| `/api/mobile/auth/register` | `src/app/api/mobile/auth/register/**` |
| `/api/doctor/auth/*` | `src/app/api/doctor/auth/**` |
| `/api/technician/auth/*` | `src/app/api/technician/auth/**` |
| `/api/locations/**` | `src/app/api/locations/**` (if present) |

No proxy changes required for frozen-path parity.

---

## 12. Contract test matrix (Phase 2 exit)

| # | Request | Expect |
|---|---------|--------|
| 1 | `GET /api/mobile/me` Bearer | 200, frozen keys |
| 2 | `PATCH /api/mobile/me` `{ locale }` | 200 |
| 3 | `GET /api/mobile/locations/divisions` | 200 array |
| 4 | `GET /api/mobile/locations/villages?unionId=` | 200 array |
| 5 | `POST /api/mobile/auth/register` valid | 200 + tokens |
| 6 | `GET /api/doctor/auth/me` cookie | 200 + `doctorProfileId` |
| 7 | `GET /api/technician/auth/me` cookie | 200 + `aiTechnicianProfileId` |
| 8 | `PATCH /api/mobile/me` invalid `villageId` | 422 `VALIDATION_ERROR` |
| 9 | `GET /api/users/me` foundation | 200 or documented 501→200 when wired |
| 10 | `GET /api/mobile/profile/dashboard-context` | 200 role-specific |

---

## 13. OpenAPI

Regenerate after implementation:

```bash
cd pranidoctor-backend && npm run openapi:generate
```

Tag new foundation paths under `Module-users`, `Module-doctors`. Annotate compat location/profile routes with `Compat-P2` delegation notes in descriptions.
