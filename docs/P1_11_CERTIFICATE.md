# P1-11 Certificate — Auth Localization

**Project:** Prani Doctor  
**Date:** 2026-05-21

---

## 1. Sign-off

| Field | Value |
|-------|--------|
| **P1_11_PASS** | **YES** |
| **LOCALE_READY** | **YES** |
| **DEVICE_READY** | **YES** (unchanged) |
| **SESSION_HARDENED** | **YES** (unchanged) |
| **BREAKING_CHANGE** | **NO** |

---

## 2. Checklist

| Requirement | Status |
|-------------|--------|
| Central auth error catalog (`bn-BD` + `en-US`) | PASS |
| `resolveAuthMessage` + locale resolver | PASS |
| `Accept-Language` on device + refresh + guards | PASS |
| Frozen OTP BN strings unchanged | PASS |
| `error.code` unchanged on all routes | PASS |
| `{ ok, data }` / `{ ok, false, error }` envelope preserved | PASS |
| `GET/PATCH /api/mobile/me` expose `locale` | PASS |
| `Content-Language` response header | PASS |
| `npm run p1:11-verify` | PASS (9/9) |

---

## 3. Domain coverage

| Domain | Catalog keys | Localized routes |
|--------|--------------|------------------|
| Auth common | `INVALID_JSON`, `VALIDATION_ERROR`, … | Device, refresh, me, panels |
| OTP | `OTP_*` | Frozen BN on `otp/*` |
| Credentials | `CRED_*` | Login/register (EN via header) |
| Session | `UNAUTHORIZED`, `TOKEN_INVALID`, … | Guard, refresh |
| Device | `DEVICE_*` | `devices/*` |
| Permission | `PERMISSION_DENIED`, panel `FORBIDDEN_*` | Admin + panel me |

---

## 4. Automated results

```
npm run build              PASS
vitest (auth)              41/41 PASS
npm run openapi:generate   PASS (176 paths)
npm run e2e:freeze         9/9 PASS
npm run p1:11-verify       9/9 PASS
npm run p1:verify          23/23 PASS
```

---

## 5. Next step

**P1-12** — E2E auth certificate / Phase 1 release gate.

---

## 6. References

- [P1_11_EXECUTION.md](./P1_11_EXECUTION.md)
- [P1_11_MESSAGE_MAP.md](./P1_11_MESSAGE_MAP.md)
- [P1_09_CERTIFICATE.md](./P1_09_CERTIFICATE.md)
