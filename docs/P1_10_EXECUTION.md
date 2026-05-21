# P1-10 — Execution Record

**Project:** Prani Doctor  
**Date:** 2026-05-21  
**Mode:** IMPLEMENT  
**Backend:** `pranidoctor-backend`  
**Plan:** [P1_10_PLAN.md](./P1_10_PLAN.md) · [P1_10_DELEGATION_MAP.md](./P1_10_DELEGATION_MAP.md)

---

## 1. Summary

P1-10 completes **foundation delegation** and **route ownership cleanup** without changing frozen routes, envelopes, cookies, or web proxies.

| Deliverable | Status |
|-------------|--------|
| Thin `AuthService` facade | Done |
| Shared OTP credential issuer | Done |
| Foundation error mapping | Done |
| Refresh DTO includes rotated `refreshToken` | Done |
| Logout resolves Bearer `userId` | Done |
| `legacy-web/` duplicate removal (re-exports) | Done |
| `asyncHandler` on foundation auth routes | Done |
| `p1:10-verify` script | Done |

---

## 2. Code changes

### 2.1 Foundation facade

| File | Change |
|------|--------|
| `auth.service.ts` | Facade only: `identity.mobileOtp` + `issueCredentialsAfterOtpVerify` + `RefreshTokenService` + `logoutAllForUser`; propagates OTP failure codes |
| `mobile-auth-credentials.service.ts` | Added `issueCredentialsAfterOtpVerify()` — single credential path after OTP verify |
| `foundation-auth.mapper.ts` | Maps OTP failure codes → `AppError` (400/422/429/500) |
| `foundation-logout.helper.ts` | `resolveFoundationLogoutUserId()` from middleware or Bearer JWT |
| `auth.controller.ts` | Uses mapper; refresh/logout alignment |
| `auth.dto.ts` | `toRefreshTokenResponseDto(tokens)` includes optional `refreshToken` |
| `auth.types.ts` | Optional `failureCode`, `httpStatus`, `failureMessage` on OTP results |
| `auth.routes.ts` | Wrapped handlers with `asyncHandler` (fixes thrown `AppError` on foundation routes) |

### 2.2 Compat alignment

| File | Change |
|------|--------|
| `compat/mobile-auth.adapter.ts` | OTP verify uses `issueCredentialsAfterOtpVerify` (same as foundation) |

Compat adapters continue to use **`IdentityAuthService` only** — never `AuthService`.

### 2.3 Ownership cleanup

| Path | Change |
|------|--------|
| `modules/auth/legacy-web/*` | Replaced duplicate implementations with re-exports to canonical `legacy/web/lib` or `modules/auth` |
| `modules/auth/index.ts` | Updated module comment (no `_archived_foundation` import) |

### 2.4 Verification & docs

| File | Change |
|------|--------|
| `scripts/p1-10-verify.ts` | New — 9 checks (code, foundation, compat) |
| `scripts/p1-verify.ts` | Foundation refresh must return `data.refreshToken` |
| `scripts/generate-openapi.mjs` | Foundation `/api/auth/*` paths + delegation description |
| `package.json` | `"p1:10-verify"` script |
| `auth.service.test.ts` | Facade delegation unit tests |

**No changes** in `pranidoctor-web` app routes or proxies.

---

## 3. Delegation chain (implemented)

```
Compat route → compat/*.adapter → IdentityAuthService (+ issueCredentialsAfterOtpVerify)
Foundation   → AuthController   → AuthService (facade) → same services
```

Refresh and logout-all always use **`RefreshTokenService`** / **`logoutAllForUser`** — no parallel implementations.

---

## 4. Preserved contracts

| Rule | Verified |
|------|----------|
| No route rename | Yes |
| Compat `{ ok, data }` | `p1:auth-compat`, compat OTP regression |
| Foundation `{ success, data }` | `p1:10-verify` |
| Compat refresh invalid → **401** | Unchanged |
| Foundation refresh invalid → **400** `TOKEN_INVALID` | `p1:10-verify` |
| Panel cookies / JWT | `p1:07-08-verify` doctor/technician |
| No schema migration | Yes |

---

## 5. Verification results

Run with backend on `http://localhost:3000` (fresh `npm run dev` after code changes).

| Command | Result |
|---------|--------|
| `npm run build` | PASS |
| `npx vitest run src/modules/auth/` | 44/44 PASS |
| `npm run p1:10-verify` | 9/9 PASS |
| `npm run p1:07-08-verify` | 23/23 PASS |
| `npm run p1:auth-compat` | 2/2 PASS |
| `npm run e2e:freeze` | 9/9 PASS |
| `npm run openapi:generate` | PASS |

---

## 6. Operational notes

- **Restart backend** after deploying P1-10 so `auth.routes.ts` `asyncHandler` wiring is active; stale processes can return `500 INTERNAL_ERROR` on foundation routes.
- OTP HTTP may return **429** or **500** `OTP_REQUEST_FAILED` when SMS dispatch fails; delegation is still correct (structured foundation envelope).
- `legacy-web/` remains excluded from `tsconfig.build.json`; files are re-export stubs for legacy typecheck only.

---

## 7. Next step

**P1-12** — E2E auth certificate / Phase 1 release gate.
