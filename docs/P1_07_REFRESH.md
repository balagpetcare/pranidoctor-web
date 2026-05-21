# P1-07 — Mobile Refresh (Compat Route)

**Project:** Prani Doctor  
**Depends on:** P1-06 (`TOKEN_READY=YES`)  
**Date:** 2026-05-21

---

## 1. Objective

Add the **frozen compat** endpoint `POST /api/mobile/auth/refresh` so mobile clients never need the foundation `{ success, data }` envelope. Behavior must match `RefreshTokenService.rotate` already used by `POST /api/auth/token/refresh`.

**Non-goals:** New storage, route renames, schema migrations, UI work.

---

## 2. Route registration

| Layer | File | Action |
|-------|------|--------|
| Adapter | `pranidoctor-backend/src/modules/auth/compat/mobile-auth.adapter.ts` | Add `handleMobileRefresh` |
| Legacy route | `pranidoctor-backend/src/legacy/web/routes/mobile/auth/refresh/route.ts` | `export { handleMobileRefresh as POST }` |
| Compat mount | `compat-web` route registry | Auto-discovered (no manual Express route) |
| Web proxy | `pranidoctor-web/src/app/api/mobile/auth/refresh/route.ts` | `proxyRouteToBackend` only |

**Path frozen:** `POST /api/mobile/auth/refresh` (see [PHASE1_API_MAP.md](./PHASE1_API_MAP.md) §5).

---

## 3. Request contract (frozen compat)

### 3.1 Body

```json
{
  "refreshToken": "pd_rt_..."
}
```

| Field | Required | Validation |
|-------|----------|------------|
| `refreshToken` | Yes | Non-empty string, max 512 |

Zod schema (strict):

```ts
const mobileRefreshSchema = z.object({ refreshToken: z.string().min(1).max(512) }).strict();
```

Optional **ignored** fields (forward-compatible, same as otp/verify device hints pattern): none in v1.

### 3.2 Headers

| Header | Required |
|--------|----------|
| `Content-Type: application/json` | Yes |
| `Authorization` | No |

Refresh is **unauthenticated** — possession of `refreshToken` is the credential (same as foundation).

---

## 4. Response contract (frozen compat)

### 4.1 Success — 200

```json
{
  "ok": true,
  "data": {
    "accessToken": "<jwt>",
    "expiresInSeconds": 2592000,
    "tokenType": "Bearer",
    "refreshToken": "pd_rt_<new>",
    "refreshExpiresInSeconds": 2592000
  }
}
```

| Field | Required on success | Notes |
|-------|---------------------|-------|
| `accessToken` | Yes | Mobile customer JWT; includes `sid` when session active (P1-06) |
| `expiresInSeconds` | Yes | `MOBILE_SESSION_MAX_AGE` |
| `tokenType` | Yes | Always `"Bearer"` — **frozen** compat key |
| `refreshToken` | No | Present when rotation enabled (`AUTH_REFRESH_ENABLED`) |
| `refreshExpiresInSeconds` | No | TTL seconds for new refresh row |

**Symmetry with existing endpoints:**

- Same optional refresh fields as `POST /api/mobile/auth/otp/verify` and `POST /api/mobile/auth/login` ([P1_06_API.md](./P1_06_API.md) §6.3–6.4).

### 4.2 Failure — compat envelope

```json
{
  "ok": false,
  "error": {
    "code": "TOKEN_INVALID",
    "message": "Invalid or expired refresh token"
  }
}
```

| Code | HTTP | When |
|------|------|------|
| `INVALID_JSON` | 400 | Body not JSON |
| `VALIDATION_ERROR` | 422 | Zod failure |
| `TOKEN_INVALID` | **401** | Rotate returned `null` (not found, expired, revoked, reuse, inactive session) |
| `SERVER_MISCONFIGURED` | 500 | `AUTH_REFRESH_ENABLED=false` or missing refresh pepper |

**Foundation mapping (intentional difference):**

| Channel | Invalid refresh HTTP | Envelope |
|---------|---------------------|----------|
| `POST /api/auth/token/refresh` | 400 | `{ success: false, error: { code: TOKEN_INVALID } }` |
| `POST /api/mobile/auth/refresh` | **401** | `{ ok: false, error: { code: TOKEN_INVALID } }` |

Do **not** align HTTP status across channels in P1-07 — that would surprise existing foundation consumers.

### 4.3 Audit

Reuse existing actions (no new enum values):

- `REFRESH_SUCCESS` — on rotate OK
- `REFRESH_FAILURE` — on rotate null (metadata already includes `TOKEN_NOT_FOUND`, `TOKEN_REUSE`, etc.)

Pass `authRequestContext(request)` into `rotate(raw, ctx)` for IP/UA.

---

## 5. Implementation sketch

```ts
export async function handleMobileRefresh(request: Request): Promise<Response> {
  if (!getRefreshTokenService().isEnabled()) {
    return jsonError('SERVER_MISCONFIGURED', 'Refresh is not enabled on this server', 500);
  }

  // parse body → mobileRefreshSchema
  const rotated = await getRefreshTokenService().rotate(parsed.refreshToken, authRequestContext(request));
  if (!rotated) {
    return jsonError('TOKEN_INVALID', 'Invalid or expired refresh token', 401);
  }

  return jsonOk({
    accessToken: rotated.accessToken,
    expiresInSeconds: rotated.expiresIn,
    tokenType: 'Bearer' as const,
    refreshToken: rotated.refreshToken,
    refreshExpiresInSeconds: rotated.refreshExpiresIn,
  });
}
```

**No duplicate rotation logic** — single call to `RefreshTokenService.rotate`.

---

## 6. Refresh compatibility matrix

| Client call | Envelope | Service | Rotation |
|-------------|----------|---------|----------|
| `POST /api/auth/token/refresh` | `{ success, data }` | `AuthService.refreshToken` → `rotate` | Yes |
| `POST /api/auth/refresh` | alias | same | Yes |
| `POST /api/mobile/auth/refresh` | `{ ok, data }` | **P1-07** adapter → `rotate` | Yes |

### 6.1 Client migration (Flutter / mobile)

| App version | Behavior |
|-------------|----------|
| Legacy | No refresh route; relies on long-lived access JWT |
| P1-06+ | May read `refreshToken` from otp/verify/login; can call foundation URL if hard-coded |
| P1-07+ | Prefer **`POST /api/mobile/auth/refresh`** via web proxy or direct backend |

**Rotation policy (unchanged):**

1. Store latest `refreshToken` securely.
2. On access 401, call compat refresh.
3. Replace stored refresh when response includes new `refreshToken`.
4. On `TOKEN_INVALID`, force full OTP/login.

---

## 7. Session & device coupling (read-only in P1-07)

`RefreshTokenService.rotate` already:

1. Validates `RefreshToken` hash and `revoked` / `expiresAt`
2. Calls `SessionService.assertActive(sessionId)` — fails refresh if session revoked/expired
3. **Reuse detection:** revoked token presented → revokes session + all refresh for session
4. Preserves `deviceId` on rotated row
5. Issues new access JWT via `signMobileCustomerToken(userId, sessionId)` (includes `sid`)

P1-07 does not change this chain — only exposes it on the compat path.

**P1-08 follow-up:** optional `REFRESH_REJECT_REVOKED_DEVICE` when `device.revokedAt != null`.

---

## 8. OpenAPI & web

| Action | Owner |
|--------|-------|
| Regenerate `openapi.json` | Backend `npm run openapi:generate` — path count +1 |
| Web proxy | Single file under `src/app/api/mobile/auth/refresh/route.ts` |
| Web UI | **None** |

---

## 9. Tests

| Type | Location | Cases |
|------|----------|-------|
| Unit | `mobile-auth.adapter.test.ts` (new) | Valid body mapping; `TOKEN_INVALID`; misconfigured refresh |
| Integration | `scripts/p1-07-verify.ts` | HTTP compat refresh after `issueMobileCredentials` |
| Regression | `npm run p1:06-verify` | Foundation refresh still PASS |
| Combined | `npm run p1:verify` | Add compat refresh assertion |

### 9.1 `p1-07-verify` flows

1. Create ephemeral customer user
2. `issueMobileCredentials` → get `refreshToken`
3. `POST /api/mobile/auth/refresh` → 200, `ok: true`, new `accessToken`
4. Second rotate with new refresh → 200
5. Reuse first refresh → 401 `TOKEN_INVALID` + session revoked in DB
6. Invalid string → 401 `TOKEN_INVALID`

---

## 10. Rollback

| Switch | Effect |
|--------|--------|
| Remove legacy route file + adapter export | Route 404 — clients fall back to foundation path |
| `AUTH_REFRESH_ENABLED=false` | Both foundation and compat return misconfigured / omit refresh |

---

## 11. Output block

```
P1_07_READY=YES
ROUTE_ADDED=POST /api/mobile/auth/refresh
ENVELOPE={ ok, data }
FOUNDATION_UNCHANGED=POST /api/auth/token/refresh
BREAKING_CHANGE=NO
WEB_PROXY=1 file
```
