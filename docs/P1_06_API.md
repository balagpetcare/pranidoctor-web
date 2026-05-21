# P1-06 — API Plan (Routes & Contracts)

**Project:** Prani Doctor  
**Policy:** No route rename · No envelope change · Additive fields only  
**Date:** 2026-05-21

---

## 1. Sign-off

```
ROUTES_AFFECTED=5
NEW_ROUTES_IN_P1_06=0
ENVELOPE_CHANGE=NO
```

| Field | Value |
|-------|--------|
| **ROUTES_AFFECTED** | **5** behavior/response updates (paths unchanged) |
| **NEW_ROUTES_IN_P1_06** | **0** (compat refresh route = **P1-07**) |
| **ENVELOPE_CHANGE** | **NO** |

---

## 2. Frozen envelopes (unchanged)

### Compat (panels + mobile)

```json
{ "ok": true, "data": { } }
{ "ok": false, "error": { "code": "STRING", "message": "STRING", "details": {} } }
```

### Foundation `/api/auth`

```json
{ "success": true, "data": { } }
{ "success": false, "error": { "code": "STRING", "message": "STRING", "requestId": "..." } }
```

---

## 3. Routes affected in P1-06

Paths are **not renamed**. Changes are **behavior** or **additive `data` keys**.

| # | Method | Path | Change type | P1-06 behavior |
|---|--------|------|-------------|----------------|
| 1 | POST | `/api/auth/token/refresh` | **Implement** | Was stub → validates refresh, rotates, returns new tokens |
| 2 | POST | `/api/auth/refresh` | **Implement** | Alias of #1 |
| 3 | POST | `/api/auth/logout` | **Implement** | Was noop → revoke sessions + refresh for authenticated user |
| 4 | POST | `/api/mobile/auth/otp/verify` | **Additive `data`** | Optional `refreshToken`, `refreshExpiresInSeconds` |
| 5 | POST | `/api/mobile/auth/login` | **Additive `data`** | Optional `refreshToken` (password login) |

**Foundation verify alias:**

| Method | Path | Change |
|--------|------|--------|
| POST | `/api/auth/otp/verify` | Same as mobile verify via `AuthService` — optional refresh in `data.tokens` |

---

## 4. Routes unchanged (explicit)

No modifications to path, method, or required request body:

| Group | Paths |
|-------|-------|
| Admin panel | `POST/GET /api/admin/auth/login`, `logout`, `me` |
| Doctor panel | `POST/GET /api/doctor/auth/login`, `logout`, `me` |
| Technician panel | `POST/GET /api/technician/auth/login`, `logout`, `me` |
| Mobile OTP | `POST /api/mobile/auth/otp/request`, `send-otp` |
| Mobile register | `POST /api/mobile/auth/register` |
| Foundation OTP request | `POST /api/auth/otp/request` |
| Mobile me | `GET /api/mobile/me` |

Panel routes may **insert `UserSession` rows** server-side with **no response change** in P1-06.

---

## 5. New routes (out of P1-06 — documented for continuity)

| Method | Path | Step | Envelope |
|--------|------|------|----------|
| POST | `/api/mobile/auth/refresh` | **P1-07** | `{ ok, data: { accessToken, expiresInSeconds, refreshToken? } }` |
| POST | `/api/mobile/devices/register` | **P1-09** | `{ ok, data: { deviceId } }` |
| GET | `/api/mobile/devices` | **P1-09** (optional) | List devices |
| DELETE | `/api/mobile/devices/:id` | **P1-09** (optional) | Revoke device |

**Web:** No new `src/app/api/.../route.ts` proxies in P1-06.

---

## 6. Request / response contracts

### 6.1 Foundation — refresh (implement P1-06)

**Request** (existing validator — unchanged):

```json
{ "refreshToken": "<raw-refresh-token>" }
```

**Response 200** (existing DTO shape — fill stub):

```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "expiresIn": 2592000,
    "refreshToken": "<new-raw-refresh-optional-rotation>"
  }
}
```

**Response 400** (existing):

```json
{
  "success": false,
  "error": { "code": "TOKEN_INVALID", "message": "Invalid refresh token", "requestId": "..." }
}
```

**Audit:** `REFRESH_SUCCESS` / `REFRESH_FAILURE`

---

### 6.2 Foundation — logout (implement P1-06)

**Request:** Bearer access JWT and/or authenticated `userId` on request context (controller today reads `userId`).

**Response 200** (unchanged):

```json
{ "success": true, "data": { "message": "Logged out successfully" } }
```

**Behavior:** `revokeAll` for mobile context — all `UserSession` ACTIVE → REVOKED; all active `RefreshToken` revoked; Redis session keys deleted when enabled.

**Audit:** `LOGOUT`, `SESSION_REVOKED`

---

### 6.3 Mobile compat — otp/verify (additive fields)

**Request** (frozen):

```json
{ "phone": "01XXXXXXXXX", "code": "123456" }
```

**Optional additive request** (ignored by old clients):

```json
{
  "phone": "01XXXXXXXXX",
  "code": "123456",
  "deviceKey": "client-uuid",
  "platform": "android",
  "pushToken": "...",
  "appVersion": "1.0.0"
}
```

**Response 200** (existing keys preserved):

```json
{
  "ok": true,
  "data": {
    "accessToken": "<jwt>",
    "expiresInSeconds": 2592000,
    "tokenType": "Bearer",
    "refreshToken": "<raw-refresh>",
    "refreshExpiresInSeconds": 2592000
  }
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `accessToken` | Yes | Unchanged |
| `expiresInSeconds` | Yes | Unchanged |
| `tokenType` | Yes | `"Bearer"` — unchanged |
| `refreshToken` | **No** | **New optional** — omit if feature flag off |
| `refreshExpiresInSeconds` | **No** | **New optional** |

**Frozen error codes** on failure paths: unchanged (`VALIDATION_ERROR`, OTP codes, etc.).

---

### 6.4 Mobile compat — login (additive)

Same optional `refreshToken` / `refreshExpiresInSeconds` in `data` after password login success.

---

### 6.5 Foundation — otp/verify

Maps to `AuthService.verifyOtp` — `data.tokens.refreshToken` populated when issuance enabled (today returns empty string).

```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": 2592000
    },
    "user": { "id": "...", "phone": "...", "isNewUser": false }
  }
}
```

---

## 7. Token & session semantics (API layer)

| Token | Transport | Revocation in P1-06 |
|-------|-----------|---------------------|
| Panel access JWT | httpOnly cookie | Cookie clear on logout; DB session row revoked (row only, JWT still valid until exp — **full invalidation P1-08**) |
| Mobile access JWT | `Authorization: Bearer` | Revoked when session revoked **if** guard checks `sid` (**P1-08**); P1-06 issues optional `sid` claim |
| Refresh token | JSON body only | Revoked in DB on logout/rotate |

### Rotation policy (client contract)

1. Client stores `refreshToken` securely (Keychain/Keystore).  
2. On 401 access, call foundation refresh or P1-07 compat refresh.  
3. Replace stored refresh with rotated value when response includes new `refreshToken`.  
4. If refresh fails with `TOKEN_INVALID`, force re-OTP.

### Logout-all

| Client action | API |
|---------------|-----|
| User taps logout (mobile) | `POST /api/auth/logout` with Bearer |
| User taps logout (panel) | Existing `POST */auth/logout` — cookie clear; P1-08 adds session revoke |
| Support revoke all (future) | Internal/admin API — **not P1-06** |

---

## 8. Redis OTP (API-visible behavior)

| Env | Client-visible |
|-----|----------------|
| `OTP_STORAGE=prisma` | Identical to today |
| `OTP_STORAGE=redis` + `REDIS_ENABLED=true` | Same JSON responses; lower DB write load on challenge rows |

**No new OTP endpoints.** Rate limit still returns **429** with existing Bengali messages.

---

## 9. Error codes

### Frozen (do not rename)

- Mobile OTP: `VALIDATION_ERROR`, `SERVER_MISCONFIGURED`, service-specific OTP codes  
- Admin login: `invalid_credentials`, `db_unavailable`, `server_error`  
- Admin permission: `FORBIDDEN`  

### Foundation (already used by controller)

| Code | HTTP | When |
|------|------|------|
| `TOKEN_INVALID` | 400 | Bad/expired/revoked refresh |
| `OTP_INVALID` | 400 | Verify failure (unchanged) |
| `OTP_RATE_LIMITED` | 429 | Request throttle (unchanged) |

**P1-11** may add localized messages; P1-06 uses existing English foundation messages.

---

## 10. OpenAPI impact

| Action | P1-06 |
|--------|-------|
| Regenerate `openapi.json` | After implementation — document optional fields on verify/login |
| Legacy path count | **172** unchanged (no new paths) |
| Foundation paths | Document response bodies for refresh/logout (may already be stubbed in spec) |

---

## 11. Contract test matrix (P1-06 additions)

Extend `scripts/p1-03-verify.ts` → `p1-06-verify.ts`:

| # | Test | Expect |
|---|------|--------|
| 1 | OTP verify success (dev OTP) | `ok: true`, `accessToken` present |
| 2 | OTP verify response | `refreshToken` present when `AUTH_REFRESH_ENABLED=true` |
| 3 | Foundation refresh with valid refresh | `success: true`, new `accessToken` |
| 4 | Foundation refresh invalid | `TOKEN_INVALID` |
| 5 | Foundation logout with Bearer | Sessions revoked in DB |
| 6 | Rotate twice | Only latest refresh works |
| 7 | Reuse revoked refresh | All session tokens revoked (if reuse detection on) |
| 8 | Frozen admin login envelope | Still `ok: false` with frozen codes |
| 9 | `p1:auth-compat` | Still 2/2 PASS |

---

## 12. Environment variables

| Key | Purpose | Default |
|-----|---------|---------|
| `MOBILE_REFRESH_SECRET` | Refresh hash pepper | Required in prod |
| `REFRESH_TOKEN_TTL_SECONDS` | Refresh row TTL | `2592000` (30d) |
| `AUTH_REFRESH_ENABLED` | Issue refresh in responses | `true` in staging |
| `OTP_STORAGE` | `prisma` \| `redis` \| `dual` | `prisma` |
| `REDIS_ENABLED` | Required for redis OTP | `false` dev |

Existing: `MOBILE_JWT_SECRET`, `OTP_*` vars — unchanged.

---

## 13. Web proxy impact

**None in P1-06.** Existing proxies forward bodies and headers unchanged.

When **P1-07** adds `/api/mobile/auth/refresh`, web adds one proxy file only.

---

## 14. Client migration notes (Flutter / mobile)

| Version | Behavior |
|---------|----------|
| Old app | Ignores unknown `refreshToken` field; long-lived access JWT still works |
| New app | Persist refresh; call refresh endpoint before OTP |

**No forced upgrade** in P1-06.

---

## 15. ROUTES_AFFECTED summary (machine-readable)

```
ROUTES_AFFECTED_COUNT=5
ROUTES_BEHAVIOR_IMPLEMENT=POST /api/auth/token/refresh,POST /api/auth/refresh,POST /api/auth/logout
ROUTES_ADDITIVE_DATA=POST /api/mobile/auth/otp/verify,POST /api/mobile/auth/login
ROUTES_DEFERRED_P1_07=POST /api/mobile/auth/refresh
ROUTES_DEFERRED_P1_09=POST /api/mobile/devices/register
ENVELOPE_CHANGE=NO
```

---

## 16. References

- [P1_06_PLAN.md](./P1_06_PLAN.md)  
- [P1_06_DB.md](./P1_06_DB.md)  
- [PHASE1_API_MAP.md](./PHASE1_API_MAP.md) §4–6  
- [API_CONTRACT_FREEZE.md](./API_CONTRACT_FREEZE.md)  
- [P1_03_CERTIFICATE.md](./P1_03_CERTIFICATE.md)
