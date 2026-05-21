# P1-03 — Compatibility Report

**Date:** 2026-05-21  
**Policy:** Frozen routes, frozen compat envelope `{ ok, data }`

---

## 1. Envelope compliance

| Surface | Envelope | Status |
|---------|----------|--------|
| `/api/admin|doctor|technician|mobile/auth/*` | `{ ok, data }` / `{ ok: false, error }` | **PASS** |
| `/api/auth/*` (foundation) | `{ success, data }` | **PASS** (unchanged) |

`npm run p1:auth-compat` (2026-05-21):

| Check | Result |
|-------|--------|
| `GET /api/ping` → `ok: true` | PASS |
| `POST /api/admin/auth/login` (invalid creds) → `ok: false`, `error.code` string | PASS |

---

## 2. Route inventory (unchanged)

**15 compat auth handlers** — paths and HTTP methods identical to pre-P1-03.

| Path | Method | Handler source |
|------|--------|----------------|
| `/api/admin/auth/login` | POST | `handleAdminLogin` |
| `/api/admin/auth/logout` | POST | `handleAdminLogout` |
| `/api/admin/auth/me` | GET | `handleAdminMe` |
| `/api/doctor/auth/login` | POST | `handleDoctorLogin` |
| `/api/doctor/auth/logout` | POST | `handleDoctorLogout` |
| `/api/doctor/auth/me` | GET | `handleDoctorMe` |
| `/api/technician/auth/login` | POST | `handleTechnicianLogin` |
| `/api/technician/auth/logout` | POST | `handleTechnicianLogout` |
| `/api/technician/auth/me` | GET | `handleTechnicianMe` |
| `/api/mobile/auth/otp/request` | POST | `handleMobileOtpRequest` |
| `/api/mobile/auth/otp/verify` | POST | `handleMobileOtpVerify` |
| `/api/mobile/auth/send-otp` | POST | re-export otp/request |
| `/api/mobile/auth/verify-otp` | POST | re-export otp/verify |
| `/api/mobile/auth/login` | POST | `handleMobileLogin` |
| `/api/mobile/auth/register` | POST | `handleMobileRegister` |

OpenAPI legacy path count: **172** (unchanged).

---

## 3. Token / cookie compliance

| Panel | Cookie | JWT claims | Source module |
|-------|--------|------------|---------------|
| Admin | `prani_admin_token` | `sub`, `email`, `role` ADMIN/SUPER_ADMIN | `panel-admin-token.ts` |
| Doctor | `prani_doctor_session` | `sub`, `email`, `role` DOCTOR | `panel-doctor-token.ts` |
| Technician | `prani_technician_session` | `sub`, `email`, `role` AI_TECHNICIAN | `panel-technician-token.ts` |
| Mobile | Bearer | `aud: mobile`, `role: CUSTOMER`, 30d TTL | `mobile-jwt.ts` |

---

## 4. Error code preservation (admin)

| Code | Still used |
|------|------------|
| `invalid_credentials` | YES |
| `db_unavailable` | YES |
| `server_error` | YES |

Doctor/technician: `INVALID_CREDENTIALS`, `SERVER_MISCONFIGURED`, `VALIDATION_ERROR`, `INVALID_JSON` — unchanged.

Mobile OTP: `VALIDATION_ERROR`, `RESEND_COOLDOWN`, `RATE_LIMITED`, `WRONG_OTP`, `EXPIRED_OTP`, etc. — unchanged.

---

## 5. Audit & permissions

| Feature | Status |
|---------|--------|
| `AuthAuditEvent` writes on login/logout/OTP | YES (in services) |
| `permissions.registry` matrix | YES (unchanged) |
| `PERMISSION_DENIED` audit on admin deny | YES |

---

## 6. Breaking change assessment

| Risk area | Result |
|-----------|--------|
| JSON response shape on compat | No change |
| Route paths | No change |
| Cookie names | No change |
| Prisma schema | No change |
| Web repo | No change |

```
BREAKING_CHANGE=NO
AUTH_COMPAT=PASS
```

---

## 7. E2E freeze

`npm run e2e:freeze`: **9/9 PASS** (backend :3000, web proxy health 503 acceptable per script).

Compat router: `GET /health/modules` reports legacy route files > 0.
