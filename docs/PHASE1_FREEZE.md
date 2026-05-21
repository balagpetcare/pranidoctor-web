# Phase 1 Freeze — Prani Doctor Auth & API Foundation

**Date:** 2026-05-21  
**Status:** **FROZEN (auth slice)**  
**Exit gate:** [P1_12_FINAL_CERTIFICATE.md](./P1_12_FINAL_CERTIFICATE.md)

---

## Sign-off

```
P1_COMPLETE=YES
AUTH_COMPLETE=YES
PHASE2_READY=YES
PHASE1_AUTH_FROZEN=YES
```

---

## 1. What is frozen

### 1.1 API contracts (no breaking changes without version bump)

| Surface | Envelope | Routes |
|---------|----------|--------|
| **Compat (production)** | `{ ok, data }` / `{ ok, error }` | `/api/admin|doctor|technician/auth/*`, `/api/mobile/auth/*`, `/api/mobile/me`, `/api/mobile/devices/*` |
| **Foundation (secondary)** | `{ success, data }` / `{ success, error }` | `/api/auth/otp/*`, `/api/auth/token/refresh`, `/api/auth/logout`, aliases |

See [API_CONTRACT_FREEZE.md](./API_CONTRACT_FREEZE.md) and [PHASE1_API_MAP.md](./PHASE1_API_MAP.md).

### 1.2 Auth capabilities delivered

| Capability | Owner | Step |
|------------|-------|------|
| Identity core (panel + mobile OTP) | `IdentityAuthService` | P1-03, P1-10 |
| Auth audit | `auth-audit.service` | P1-01 |
| Permissions registry | `permissions.registry` | P1-02 |
| Refresh tokens | `RefreshTokenService` | P1-06, P1-07 |
| Session hardening (`sid`) | `SessionService` + guards | P1-08 |
| Device registry | `DeviceService` | P1-09 |
| Foundation delegation | `AuthService` facade | P1-10 |
| i18n catalog (bn/en) | `modules/auth/i18n` | P1-11 |

### 1.3 Database (additive)

- `AuthAuditEvent`, `AuthAuditAction`
- `RefreshToken`, `UserSession`, `UserDevice`
- No destructive auth migrations in Phase 1

---

## 2. Mount order (runtime)

```
HTTP → compat-web (/api/* legacy routes)  [FIRST]
     → Express modules (/api/auth, /api/users, …)
```

Foundation `/api/auth` does not shadow compat mobile paths.

---

## 3. Verification baseline

Re-run before any auth change or Phase 2 feature work:

```bash
cd pranidoctor-backend
npm run build
npm run openapi:generate
npm run p1:12-verify      # matrix 10/10 + P1 script suite
npm run e2e:freeze        # infra + ping + openapi + web proxy
```

| Gate | Expected |
|------|----------|
| Build | PASS |
| Auth vitest | 44/44 |
| `p1:12-verify` | `P1_COMPLETE=YES` |
| `e2e:freeze` | 9/9 (redis/storage 503 acceptable in local dev) |

---

## 4. Intentional differences (frozen)

| Behavior | Compat | Foundation |
|----------|--------|------------|
| Invalid refresh HTTP status | **401** | **400** |
| OTP/login error language | Bengali (frozen) | English mapper (secondary) |
| Panel auth | Compat only | Not exposed on `/api/auth` |

---

## 5. Phase 1 documentation index

| Doc | Purpose |
|-----|---------|
| [PHASE1_IMPLEMENTATION_SEQUENCE.md](./PHASE1_IMPLEMENTATION_SEQUENCE.md) | Step order P1-00–P1-13 |
| [PHASE1_API_MAP.md](./PHASE1_API_MAP.md) | Route + contract map |
| [PHASE1_DB_MAP.md](./PHASE1_DB_MAP.md) | Schema map |
| [P1_12_FINAL_CERTIFICATE.md](./P1_12_FINAL_CERTIFICATE.md) | Exit verification |
| [E2E_CERTIFICATE.md](./E2E_CERTIFICATE.md) | Infra e2e freeze |

Per-step certificates: `P1_03` … `P1_11`, `P1_10` in `docs/`.

---

## 6. Phase 2 handoff

Phase 1 auth is **complete**. Phase 2 may:

- Implement domain repositories (users, doctors, leads, …) against frozen auth
- Add new **additive** mobile/admin fields (`refreshToken`, `locale`) — clients opt-in
- **Not** rename routes, merge envelopes, or change frozen OTP Bengali strings without a contract version bump

Notify mobile/web teams:

- Rotated `refreshToken` in foundation refresh response (additive)
- `GET/PATCH /api/mobile/me` `locale` field (P1-05 / P1-11)
- `Accept-Language` on device + refresh errors (not frozen OTP paths)

---

## 7. Relation to earlier certificates

[PHASE1_FREEZE_CERTIFICATE.md](./PHASE1_FREEZE_CERTIFICATE.md) (backend foundation scaffold, 2026-05-21) scored **implementation vs runtime** for the whole monolith. **This document** freezes the **completed P1-00–P1-12 auth program** verified by `p1:12-verify`, superseding auth “stub / pending” status from early Phase 1.

---

*Freeze version: 1.0 — Auth & contract slice. Update only via new certificate after failed regression.*
