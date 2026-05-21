# Auth Repository Implementation Report

**Project:** Prani Doctor Backend  
**Date:** 2026-05-21  
**Status:** Complete  
**Acceptance:** Auth repository and service are no longer stubbed

---

## Summary

| Area | Before | After |
|------|--------|-------|
| `AuthRepository` | 6 OTP methods throwing `Not implemented` | Full data layer: users, sessions, refresh tokens, OTP, device lookup |
| `AuthService` | Stub OTP / token flows | Wired to repository + shared JWT + Redis session storage |
| Tests | None | 11 unit tests (`auth.repository.test.ts`) |
| `npm run typecheck` | — | Pass |
| `npm run build` | — | Pass |

---

## Architecture (no business duplication)

| Layer | Responsibility |
|-------|----------------|
| **`AuthRepository`** | Prisma (users, `user_sessions`, `refresh_tokens`) + Redis (OTP challenges, send history) |
| **`session.storage`** | Hot session + refresh token cache in Redis (unchanged) |
| **`jwt.service`** | Token generation and validation (unchanged) |
| **`AuthService`** | Orchestrates repository, JWT, and Redis session helpers |

The repository does not generate JWTs, send SMS, or enforce rate limits beyond counting OTP sends in Redis. Those remain in the service and shared security modules.

---

## Repository API

### Users

| Method | Storage | Notes |
|--------|---------|-------|
| `findUserByPhone` | PostgreSQL | Soft-delete aware |
| `findUserByEmail` | PostgreSQL | Email normalized to lowercase |
| `findUserById` | PostgreSQL | Includes role |
| `findUserBySocialIdentity` | — | Returns `null` until social identity table exists |
| `createUser` | PostgreSQL | Default role `USER`; supports phone and/or email |
| `touchLastLogin` | PostgreSQL | Updates `lastLoginAt` |

### Sessions (PostgreSQL)

| Method | Notes |
|--------|-------|
| `createSession` | Persists `user_sessions` row (same ID as Redis session) |
| `findSessionById` | Active, non-deleted sessions |
| `findSessionByDevice` | Device lookup for mobile re-login |
| `updateSessionActivity` | Updates `lastActiveAt` |
| `revokeSession` | Sets `REVOKED` + reason |
| `revokeAllSessionsForUser` | Bulk revoke with optional except session |

### Refresh tokens (PostgreSQL)

| Method | Notes |
|--------|-------|
| `storeRefreshToken` | Stores SHA-256 hash only |
| `findRefreshTokenByHash` | Active, non-revoked lookup |
| `findActiveRefreshTokenForSession` | Latest token for rotation |
| `rotateRefreshToken` | Transaction: revoke old, create new, link `rotatedToId` |
| `revokeRefreshTokensForSession` | Per-session revoke |
| `revokeAllRefreshTokensForUser` | Logout-all support |

### OTP (Redis)

| Method | Key pattern | Notes |
|--------|-------------|-------|
| `createOtpChallenge` | `otp:challenge:{phone}` | TTL = expiry; records send in sorted set |
| `findOtpChallenge` | Same | JSON payload |
| `incrementOtpAttempts` | Same | Updates attempts in place |
| `markOtpVerified` | Same | Sets `verified: true` |
| `deleteOtpChallenge` | Same | After successful verify |
| `countRecentOtpRequests` | `otp:sends:{phone}` | ZSET count since timestamp |

Uses `CacheKeys` + `config.redis.prefix` from existing cache conventions.

---

## Login channels

| Channel | Support |
|---------|---------|
| **Mobile OTP** | Full — `requestOtp` / `verifyOtp` via repository OTP + user create/find |
| **Email login** | Repository ready — `findUserByEmail`, `passwordHash` on user; password verify stays in service when added |
| **Social login** | Extension point — `findUserBySocialIdentity` + `SocialAuthProvider` types; DB table deferred |

---

## Auth service flows

### `requestOtp`

1. `countRecentOtpRequests` (hourly cap from config)
2. Generate code, hash, `createOtpChallenge`
3. Emit `auth.otp.requested` event
4. Dev mode logs OTP to console

### `verifyOtp`

1. Load challenge, validate expiry / attempts / hash
2. `findUserByPhone` or `createUser`
3. `createRedisSession` + `repository.createSession`
4. `generateTokenPair` + store refresh in Redis and Postgres
5. `touchLastLogin`, `deleteOtpChallenge`, emit `auth.otp.verified`

### `refreshToken`

1. JWT validate refresh token
2. Redis storage check, fallback to Postgres hash lookup
3. Rotate tokens in DB + Redis when active row exists

### `revokeToken`

1. Redis session revoke (single or all)
2. Postgres session + refresh token revoke

---

## Files added / updated

| File | Purpose |
|------|---------|
| `src/modules/auth/auth.repository.types.ts` | Persistence contracts |
| `src/modules/auth/auth.repository.mappers.ts` | Prisma ↔ domain mappers |
| `src/modules/auth/auth.repository.ts` | Full implementation |
| `src/modules/auth/auth.service.ts` | Non-stub service orchestration |
| `src/modules/auth/auth.repository.test.ts` | Unit tests (mocked Prisma + Redis) |
| `vitest.config.ts` | Test runner config |

---

## Tests

```bash
cd pranidoctor-backend
npm run test -- src/modules/auth/auth.repository.test.ts
```

**11 tests** covering:

- `findUserByPhone` (found / not found)
- `createUser` (success / validation error)
- OTP create / find / rate count
- Session create / device lookup
- Refresh token store
- Social identity placeholder

---

## Validation

```bash
npm run typecheck   # 0 errors
npm run build       # pass
npm run test        # auth.repository.test.ts pass
```

---

## Remaining errors count (TypeScript)

**0**

---

## Next steps (optional)

1. Email/password login endpoint using `findUserByEmail` + `passwordHash`
2. `user_identities` table for Google/Apple/Facebook via `findUserBySocialIdentity`
3. Integration tests with Testcontainers (Postgres + Redis)
4. SMS provider integration in `requestOtp` (service layer only)
