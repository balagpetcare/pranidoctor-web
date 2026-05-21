# P1-07 & P1-08 Certificate — Mobile Refresh + Session Guard

**Project:** Prani Doctor  
**Date:** 2026-05-21

---

## 1. Sign-off

| Field | Value |
|-------|--------|
| **P1_07_PASS** | **YES** |
| **P1_08_PASS** | **YES** |
| **SESSION_HARDENED** | **YES** |
| **TOKEN_READY** | **YES** (unchanged) |
| **AUTH_COMPLETE** | **YES** (unchanged) |
| **BREAKING_CHANGE** | **NO** |

---

## 2. P1-07 checklist

| Requirement | Status |
|-------------|--------|
| `POST /api/mobile/auth/refresh` live | PASS |
| Compat `{ ok, data }` envelope | PASS |
| Delegates to `RefreshTokenService.rotate` | PASS |
| Audit refresh success/failure | PASS |
| Foundation `/api/auth/token/refresh` unchanged | PASS |
| Web proxy only (no UI) | PASS |
| OpenAPI path count +1 (173) | PASS |

---

## 3. P1-08 checklist

| Requirement | Status |
|-------------|--------|
| Panel JWT optional `sid` on login | PASS |
| Logout revokes session by `sid` | PASS |
| Panel `me` rejects revoked session | PASS |
| Doctor/technician API guards session-aware | PASS |
| Mobile Bearer guard checks `sid` | PASS |
| Legacy cookies without `sid` still accepted | PASS (legacy path) |
| No schema migration | PASS |
| No route rename | PASS |

---

## 4. Automated results

```
npm run build              PASS
vitest (auth)              12/12 PASS
npm run openapi:generate   PASS (173 paths)
npm run p1:verify          18/18 PASS
npm run e2e:freeze         9/9 PASS
```

---

## 5. Constraints verified

| Rule | Result |
|------|--------|
| No route rename | YES |
| No envelope shape break | YES |
| No schema breaking change | YES |
| No UI changes | YES (proxy only) |
| Reuse refresh / device / audit services | YES |

---

## 6. Next steps

| Step | Work |
|------|------|
| **P1-09** | `POST /api/mobile/devices/register` |
| **P1-11** | i18n auth error catalog |

---

## 7. References

- [P1_07_08_PLAN.md](./P1_07_08_PLAN.md)
- [P1_07_08_EXECUTION.md](./P1_07_08_EXECUTION.md)
- [P1_07_REFRESH.md](./P1_07_REFRESH.md)
- [P1_08_SESSION_GUARD.md](./P1_08_SESSION_GUARD.md)
- [P1_06_CERTIFICATE.md](./P1_06_CERTIFICATE.md)
- [P1_04_05_CERTIFICATE.md](./P1_04_05_CERTIFICATE.md)

---

*Certificate issued after P1-07/08 implementation and verification.*
