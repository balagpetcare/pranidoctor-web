# P1-06 Certificate — Refresh, Session, Device

**Project:** Prani Doctor  
**Phase:** P1-06  
**Date:** 2026-05-21

---

## 1. Sign-off

| Field | Value |
|-------|--------|
| **P1_06_PASS** | **YES** |
| **P1_06_COMPLETE** | **YES** |
| **TOKEN_READY** | **YES** |
| **REFRESH_READY** | **YES** |
| **SESSION_READY** | **YES** |
| **DEVICE_READY** | **YES** |
| **BREAKING_CHANGE** | **NO** |

---

## 2. Checklist

| Requirement | Status |
|-------------|--------|
| `RefreshToken` model + rotation | PASS |
| `UserSession` + revoke / logout-all | PASS |
| `UserDevice` registry service | PASS |
| Foundation refresh implemented | PASS |
| Legacy compat envelopes preserved | PASS |
| Mobile JWT signing preserved | PASS |
| Optional `refreshToken` on otp/verify | PASS |
| Redis OTP store prepared (not default) | PASS |
| Panel session rows on login | PASS |
| Build + OpenAPI + e2e | PASS |

---

## 3. Automated results (verify run 2026-05-21)

```
npm run build                 PASS
npm run openapi:generate      PASS (172 paths)
npm run p1:auth-compat        2/2 PASS
npm run p1:06-verify          14/14 PASS
npm run e2e:freeze            9/9 PASS
vitest (auth P1-06 tests)     12/12 PASS
```

### 3.1 P1-06 flow verification (`npm run p1:06-verify`)

| Flow | Result |
|------|--------|
| Login (mobile credentials / session + access) | PASS |
| Refresh (rotate + HTTP `/api/auth/token/refresh`) | PASS |
| Logout (single session revoke) | PASS |
| Logout-all (sessions + refresh cleared) | PASS |
| Device revoke (register + revoke) | PASS |
| Compat admin login/logout envelopes | PASS |
| Foundation invalid refresh rejected | PASS |

---

## 4. Constraints verified

| Rule | Result |
|------|--------|
| No route rename | YES |
| No envelope shape change | YES |
| No schema breaking | YES (additive only) |
| No web changes | YES |
| `_archived_foundation` not activated | YES |

---

## 5. Next steps

| Step | Work |
|------|------|
| **P1-07** | `POST /api/mobile/auth/refresh` compat route |
| **P1-08** | Panel logout revokes `UserSession`; guard checks JWT `sid` |
| **P1-09** | `POST /api/mobile/devices/register` |

---

## 6. References

- [P1_06_PLAN.md](./P1_06_PLAN.md)
- [P1_06_DB.md](./P1_06_DB.md)
- [P1_06_API.md](./P1_06_API.md)
- [P1_06_EXECUTION.md](./P1_06_EXECUTION.md)
- Backend: `npm run p1:06-verify`

---

*Certificate issued after P1-06 implementation. Web repo unchanged.*
