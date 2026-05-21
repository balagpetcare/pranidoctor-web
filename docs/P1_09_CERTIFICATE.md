# P1-09 Certificate — Mobile Device Registry

**Project:** Prani Doctor  
**Date:** 2026-05-21

---

## 1. Sign-off

| Field | Value |
|-------|--------|
| **P1_09_PASS** | **YES** |
| **DEVICE_READY** | **YES** |
| **SESSION_HARDENED** | **YES** (unchanged) |
| **TOKEN_READY** | **YES** (unchanged) |
| **BREAKING_CHANGE** | **NO** |

---

## 2. P1-09-A checklist (required)

| Requirement | Status |
|-------------|--------|
| `POST /api/mobile/devices/register` live | PASS |
| Bearer via `requireMobileCustomer` | PASS |
| Compat `{ ok, data }` envelope | PASS |
| `deviceKey` validation (Zod) | PASS |
| Audit `DEVICE_REGISTERED` | PASS |
| Bind `deviceId` to JWT `sid` session | PASS |
| Web proxy register route | PASS |
| `npm run p1:09-verify` | PASS (10/10) |
| OpenAPI includes device paths | PASS (+3) |

---

## 3. P1-09-B checklist (optional — delivered)

| Requirement | Status |
|-------------|--------|
| `GET /api/mobile/devices` | PASS |
| `DELETE /api/mobile/devices/:id` | PASS |
| `REFRESH_REJECT_REVOKED_DEVICE` on rotate | PASS (flag-gated) |
| Audit `DEVICE_REVOKED` | PASS |
| Cascade session + refresh revoke | PASS (default on) |

---

## 4. Automated results

```
npm run build              PASS
vitest (auth, excl. archived)  33/33 PASS
npm run openapi:generate   PASS (176 paths)
npm run e2e:freeze         9/9 PASS
npm run p1:09-verify       10/10 PASS
npm run p1:verify          23/23 PASS
```

---

## 5. Reuse confirmation

| P1 subsystem | Reused in P1-09 |
|--------------|-----------------|
| Session (`UserSession`, `sid`) | Device bind on register |
| Audit (`AuthAuditEvent`) | `DEVICE_REGISTERED`, `DEVICE_REVOKED` |
| Refresh (`RefreshTokenService`) | Attach `deviceId`; revoke on device delete; optional reject |

---

## 6. Next step

**P1-11** — i18n auth error catalog (`NEXT_STEP` from unified `p1:verify`).
