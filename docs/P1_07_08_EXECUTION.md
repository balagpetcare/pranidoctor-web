# P1-07 & P1-08 — Execution Report

**Project:** Prani Doctor  
**Date:** 2026-05-21  
**Scope:** `pranidoctor-backend` + one web proxy file

---

## 1. Summary

| Step | Delivered |
|------|-----------|
| **P1-07** | `POST /api/mobile/auth/refresh` compat route + `handleMobileRefresh` → `RefreshTokenService.rotate` |
| **P1-08** | Panel JWT `sid` claim; session guard on panel `me`/API guards and mobile Bearer; logout revokes by `sid` |

**Web:** `pranidoctor-web/src/app/api/mobile/auth/refresh/route.ts` (proxy only).

---

## 2. P1-07 — Mobile refresh

### Files

| File | Change |
|------|--------|
| `src/modules/auth/compat/mobile-auth.adapter.ts` | `handleMobileRefresh`, `mobileRefreshSchema` |
| `src/legacy/web/routes/mobile/auth/refresh/route.ts` | Thin re-export |
| `pranidoctor-web/src/app/api/mobile/auth/refresh/route.ts` | `proxyRouteToBackend` |

### Contract

- Request: `{ refreshToken }`
- Success: `{ ok, data: { accessToken, expiresInSeconds, tokenType: "Bearer", refreshToken?, refreshExpiresInSeconds? } }`
- Invalid: `401` + `TOKEN_INVALID`
- Reuses audit via `RefreshTokenService.rotate` (`REFRESH_SUCCESS` / `REFRESH_FAILURE`)

---

## 3. P1-08 — Session guard

### New modules

| File | Purpose |
|------|---------|
| `session-guard.config.ts` | `PANEL_JWT_SID_ENABLED`, `PANEL_SESSION_GUARD_ENABLED`, `MOBILE_SESSION_GUARD_ENABLED` |
| `session-guard.helper.ts` | `assertJwtSessionActive`, `touchJwtSession` |

### Panel JWT `sid`

| Token module | Change |
|--------------|--------|
| `panel-doctor-token.ts` | Optional `sid` sign/verify |
| `panel-technician-token.ts` | Same |
| `panel-admin-token.ts` | Same |

### Login / logout

| Service | Change |
|---------|--------|
| `recordPanelSession` | Returns `session.id` |
| `panel-*-auth.service` | Await session → sign JWT with `sid` when enabled |
| `revokePanelSession` | Revoke by `sid` or fallback `revokeLatestPanelSession` |
| Compat adapters | Pass `session?.sid` to logout; guard on `me` |

### Guards

| Guard | Change |
|-------|--------|
| `doctor-auth/api-guard.ts` | `assertJwtSessionActive` before actor resolve |
| `technician-auth/api-guard.ts` | Same |
| `mobile-auth/guard.ts` | Reject revoked `sid`; `touch` on success |

---

## 4. Verification (2026-05-21)

```
npm run build                 PASS
npx vitest run (auth P1-07/08) 12/12 PASS
npm run openapi:generate      PASS (173 legacy paths)
npm run p1:verify             18/18 PASS
npm run e2e:freeze            9/9 PASS
```

### `p1:verify` highlights

- Doctor/technician: login, me, logout, **me after logout 401**, session revoke
- Mobile: compat `POST /api/mobile/auth/refresh` 200, foundation refresh 200, device revoke, logout-all

**Ops:** Restart backend after deploy so `GET /health/db` and panel login use current `DATABASE_URL`. Seed demo users with `PRANI_SEED_DEMO=true npm run db:seed` for panel HTTP checks.

---

## 5. Environment

| Key | Default | Purpose |
|-----|---------|---------|
| `PANEL_JWT_SID_ENABLED` | on | Embed `sid` in panel JWT |
| `PANEL_SESSION_GUARD_ENABLED` | on | DB session check when `sid` present |
| `MOBILE_SESSION_GUARD_ENABLED` | on | Mobile Bearer session check |
| `PANEL_LOGOUT_REVOKE_SESSION` | on | Unchanged (P1-04/05) |
| `AUTH_REFRESH_ENABLED` | on | Required for refresh routes |

---

## 6. Rollback

| Flag | Effect |
|------|--------|
| `PANEL_JWT_SID_ENABLED=false` | Panel JWTs without `sid` |
| `PANEL_SESSION_GUARD_ENABLED=false` | JWT-only panel guards |
| `MOBILE_SESSION_GUARD_ENABLED=false` | JWT-only mobile guard |
| Remove `mobile/auth/refresh/route.ts` | Compat refresh 404 |

---

## 7. References

- [P1_07_08_PLAN.md](./P1_07_08_PLAN.md)
- [P1_07_REFRESH.md](./P1_07_REFRESH.md)
- [P1_08_SESSION_GUARD.md](./P1_08_SESSION_GUARD.md)
- Backend: `npm run p1:verify`, `npm run p1:07-08-verify`
