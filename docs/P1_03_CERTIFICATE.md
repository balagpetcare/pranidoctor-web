# P1-03 Certificate — Legacy Auth Port Verification

**Project:** Prani Doctor  
**Phase:** P1-03 — Port legacy auth into foundation `AuthService` / panel services  
**Date:** 2026-05-21  
**Verifier:** Automated + manual review (backend `pranidoctor-backend`)

---

## 1. Sign-off

| Field | Value |
|-------|--------|
| **P1_03_PASS** | **YES** |
| **AUTH_READY** | **YES** |
| **SESSION_READY** | **YES** (stateless JWT panel cookies; DB `UserSession` revoke deferred **P1-08**) |
| **OTP_READY_NEXT** | **P1-06** — refresh tokens + Redis-backed OTP rate limits in production; mobile password login/register still via legacy `customer-credentials-service` in compat adapter |
| **NEXT_STEP** | **P1-04** — continue thin compat routes / **P1-05** locale headers / **P1-06** refresh + mobile token lifecycle |

**BREAKING_CHANGE** = **NO** — frozen `{ ok, data }` / `{ ok: false, error }` compat envelopes preserved.

---

## 2. Scope verified

| Area | Status | Evidence |
|------|--------|----------|
| **Login** | PASS | Invalid credentials return frozen error envelope on all three panels (`db_unavailable` or `invalid_credentials` / `INVALID_CREDENTIALS`) |
| **Logout** | PASS | `POST */auth/logout` → `200`, `{ ok: true, data: { signedOut: true } }`, `Set-Cookie` clears session |
| **Token** | PASS | Panel JWT signing via `tokens/panel-*-token.ts`; mobile OTP issues Bearer JWT; `refreshToken` foundation stub returns `null` (P1-06) |
| **Permissions** | PASS | `permissions.registry.ts` + `assertAdminCan` unit tests; P1-02 matrix unchanged |
| **Audit** | PASS | `AuthAuditEvent` table readable; fire-and-forget on login/logout/OTP/permission deny |

---

## 3. Role / route matrix

### 3.1 Compat panels (`{ ok, data }` envelope)

| Panel | Login | Logout | Me (session) |
|-------|-------|--------|--------------|
| **Admin** | `POST /api/admin/auth/login` | `POST /api/admin/auth/logout` | `GET /api/admin/auth/me` |
| **Doctor** | `POST /api/doctor/auth/login` | `POST /api/doctor/auth/logout` | `GET /api/doctor/auth/me` |
| **Technician** | `POST /api/technician/auth/login` | `POST /api/technician/auth/logout` | `GET /api/technician/auth/me` |

**Cookies:** `prani_admin_token`, `prani_doctor_session`, `prani_technician_session` (httpOnly, SameSite=lax).

### 3.2 Mobile compat (`/api/mobile/auth/*`)

| Route | Handler | Notes |
|-------|---------|-------|
| `POST .../otp/request` | `mobile-auth.adapter` | Live OTP (not `AUTH_MIGRATION_PENDING`) |
| `POST .../otp/verify` | `mobile-auth.adapter` | Issues mobile JWT |
| `POST .../login`, `.../register` | `mobile-auth.adapter` | Password path still legacy credentials service |
| `send-otp` / `verify-otp` | Aliases to otp routes | Frozen paths |

### 3.3 Foundation (`{ success, data }` envelope)

Mounted at `/api/auth/*`:

| Method | Path | Status |
|--------|------|--------|
| POST | `/otp/request` | Live (rate limit / validation) |
| POST | `/otp/verify` | Live |
| POST | `/login` | Alias → verify OTP |
| POST | `/token/refresh`, `/refresh` | Stub until P1-06 |
| POST | `/logout` | Noop until P1-08 |

---

## 4. Automated verification (2026-05-21)

| Command | Result |
|---------|--------|
| `npm run build` | **PASS** |
| `npm run openapi:generate` | **PASS** — 172 legacy paths |
| `npm run p1:auth-compat` | **2/2 PASS** |
| `npm run p1:verify` | **13/13 PASS** |
| `npm run e2e:freeze` | **9/9 PASS** |
| `npx vitest run` (auth, excl. `_archived_foundation`) | **17/17 PASS** |

### 4.1 `npm run p1:verify` detail

```
admin     — login invalid envelope, logout, me 401
doctor    — login invalid envelope, logout, me 401
technician— login invalid envelope, logout, me 401
foundation— /api/auth/otp/request live, /api/ping
database  — Prisma SELECT 1
audit     — AuthAuditEvent.count()
```

### 4.2 Environment notes

- **`GET /health/db`** may return **503** while direct Prisma from scripts succeeds — treat as ops/health-probe wiring, not a P1-03 regression.
- **`REDIS_ENABLED=false`** — OTP rate limiting may return **429** from in-process guards; production should enable Redis (P1-06).
- Panel login with invalid credentials against a live DB returns **401** `invalid_credentials` / `INVALID_CREDENTIALS`; when DB unreachable, **503** `db_unavailable` with correct envelope.

---

## 5. Verify remediation (same session)

During certificate run, two runtime gaps were fixed:

1. **`NextResponse` cookie shim** — `compatJsonOk` / `NextResponse.json` + `cookies.set()` so panel logout/login set `Set-Cookie` on Express (plain `Response` had no `.cookies`).
2. **Doctor / technician DB errors** — `isAuthDatabaseConnectivityError` shared helper; login returns `503 db_unavailable` instead of uncaught **500**.

Files: `src/compat/next-server.ts`, `src/compat/compat-api-response.ts`, `src/modules/auth/db-connectivity.ts`, panel compat adapters.

---

## 6. Architecture compliance

| Rule | Status |
|------|--------|
| Backend owns Prisma / auth logic | YES |
| Web proxies only (`WEB_API_READY`) | Unchanged |
| 15 compat routes thin re-exports | YES |
| `_archived_foundation` not activated | YES |
| Additive `AuthAuditEvent` only | YES |

---

## 7. Deferred (not P1-03 blockers)

| Item | Target phase |
|------|----------------|
| `UserSession` DB revoke on logout | P1-08 |
| Foundation `refreshToken` implementation | P1-06 |
| Redis OTP / session store | P1-06 + ops |
| Mobile password register/login full port | P1-03+ / credentials module |
| i18n error catalog for auth codes | P1-11 |

---

## 8. References

- `docs/P1_03_AUTH_PORT_PLAN.md`
- `docs/P1_03_API_COMPAT.md`
- `docs/P1_03_MIGRATION_PLAN.md`
- `docs/P1_03_EXECUTION.md`
- `docs/P1_03_COMPAT_REPORT.md`
- Backend script: `pranidoctor-backend/scripts/p1-03-verify.ts`

---

*Certificate issued after P1-03 implementation + verification. Web repo unchanged.*
