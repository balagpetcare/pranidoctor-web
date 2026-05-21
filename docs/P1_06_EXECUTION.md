# P1-06 — Execution Report (Refresh, Session, Device)

**Date:** 2026-05-21  
**Scope:** `pranidoctor-backend` only — no web changes

---

## 1. Summary

P1-06 adds **Postgres-backed** refresh tokens, user sessions, and device registry; wires **mobile** login/OTP to issue optional `refreshToken`; implements **foundation** `POST /api/auth/token/refresh` and **logout-all** revocation.

---

## 2. Schema (additive)

**Migration:** `20260521180000_phase1_refresh_session_device`

| Model / enum | Purpose |
|--------------|---------|
| `AuthChannel` | `MOBILE`, `ADMIN_PANEL`, `DOCTOR_PANEL`, `TECHNICIAN_PANEL` |
| `SessionStatus` | `ACTIVE`, `REVOKED`, `EXPIRED` |
| `UserDevice` | `@@unique([userId, deviceKey])` |
| `UserSession` | Revocable session rows |
| `RefreshToken` | Hashed refresh with `rotatedToId` rotation chain |

---

## 3. Modules delivered

| Module | Path |
|--------|------|
| session-store | `session.service.ts` |
| refresh-token | `refresh-token.service.ts`, `refresh-token.config.ts` |
| device-registry | `device.service.ts` |
| mobile bundle | `mobile-auth-credentials.service.ts` |
| channel map | `auth-channel.util.ts` |
| Redis OTP prep | `otp/otp-store.interface.ts`, `otp/redis-otp.store.ts`, `otp/otp-storage.config.ts` |

---

## 4. Behavior

### Refresh

- Raw token: `pd_rt_<base64url>`; stored as `SHA-256(pepper:raw)` using `MOBILE_REFRESH_SECRET`.
- **Rotate** in transaction: revoke old, create new, link `rotatedToId`.
- **Reuse detection:** revoked token presented → revoke session + all refresh for session.
- Feature flag: `AUTH_REFRESH_ENABLED` (default on unless `false`).

### Session

- Created on mobile OTP verify, password login, register, and panel logins (DB row only).
- Access JWT may include additive `sid` claim (session id).
- **Logout-all:** `AuthService.revokeToken` → revoke all ACTIVE sessions + all refresh tokens for user.

### Device

- Upsert on mobile auth when `deviceKey` sent (optional body fields on verify/login).
- `DeviceService.registerOrUpdate` / `revoke` ready for P1-09 register route.

### Redis OTP

- `RedisOtpStore` implemented; **default remains Prisma** `MobileOtpChallenge` (`OTP_STORAGE=prisma`).
- Enable with `OTP_STORAGE=redis` and `REDIS_ENABLED=true`.

---

## 5. API changes (no renames)

| Route | Change |
|-------|--------|
| `POST /api/auth/token/refresh` | Live — invalid token → `400 TOKEN_INVALID` |
| `POST /api/auth/refresh` | Alias |
| `POST /api/auth/logout` | Revokes all mobile sessions + refresh when `userId` present |
| `POST /api/mobile/auth/otp/verify` | Optional `refreshToken`, `refreshExpiresInSeconds`, device fields |
| `POST /api/mobile/auth/login` | Optional `refreshToken` + device fields |

**Deferred:** `POST /api/mobile/auth/refresh` (P1-07), panel logout session revoke via JWT `sid` (P1-08).

---

## 6. Verification

| Command | Result |
|---------|--------|
| `npx prisma migrate deploy` | **PASS** |
| `npm run build` | **PASS** |
| `npx vitest run` (P1-06 + P1-02 tests) | **12/12 PASS** |
| `npm run openapi:generate` | **PASS** (172 legacy paths) |
| `npm run p1:auth-compat` | **2/2 PASS** |
| `npm run p1:06-verify` | **6/6 PASS** |
| `npm run e2e:freeze` | **9/9 PASS** |

---

## 7. Environment

| Variable | Purpose |
|----------|---------|
| `MOBILE_REFRESH_SECRET` | Refresh hash pepper (≥32 chars prod) |
| `AUTH_REFRESH_ENABLED` | Issue refresh in responses (`false` to disable) |
| `REFRESH_TOKEN_TTL_SECONDS` | Refresh row TTL (default 30d) |
| `OTP_STORAGE` | `prisma` \| `redis` \| `dual` (default `prisma`) |

---

## 8. Sign-off

```
P1_06_COMPLETE=YES
REFRESH_READY=YES
SESSION_READY=YES
DEVICE_READY=YES
BREAKING_CHANGE=NO
```
