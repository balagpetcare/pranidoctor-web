# P1-12 — Final Auth Certificate (Phase 1 Exit)

**Project:** Prani Doctor  
**Issued:** 2026-05-21  
**Mode:** VERIFY  
**Verifier:** `npm run p1:12-verify` + full Phase 1 script suite  
**Backend:** `http://localhost:3000` (Express compat + foundation modules)

---

## Sign-off

```
P1_COMPLETE=YES
AUTH_COMPLETE=YES
PHASE2_READY=YES
```

---

## 1. Domain verification

| Domain | Matrix (HTTP) | Script suite | Status |
|--------|---------------|--------------|--------|
| **OTP** | #4 request, #5 verify, #9 foundation | `p1:10-verify`, `p1:03-verify` | PASS |
| **Login** | #1–3 admin, #6 mobile me, #8 doctor | `p1:03-verify`, `p1:04-05-verify`, `p1:07-08-verify` | PASS |
| **Logout** | Foundation Bearer + admin logout | `p1:07-08-verify`, `p1:10-verify` | PASS |
| **Refresh** | #7 mobile rotate | `p1:06-verify`, `p1:10-verify`, `p1:07-08-verify` | PASS |
| **Device** | — | `p1:09-verify` (13/13) | PASS |
| **Permission** | #10 cross-panel / unauth gate | `p1:11-verify` (panel INVALID_CREDENTIALS bn/en) | PASS |
| **Locale** | — | `p1:11-verify` (19/19) | PASS |

---

## 2. Contract matrix ([PHASE1_API_MAP.md](./PHASE1_API_MAP.md) §10)

| # | Check | Result |
|---|--------|--------|
| 1 | Admin login valid | PASS |
| 2 | Admin bad password `invalid_credentials` | PASS |
| 3 | Admin me with cookie | PASS |
| 4 | Mobile OTP request `sent: true` | PASS |
| 5 | Mobile OTP verify `accessToken` | PASS (dev OTP via admin otp-logs API) |
| 6 | Mobile me Bearer | PASS |
| 7 | Mobile refresh | PASS |
| 8 | Doctor login | PASS |
| 9 | Foundation `/api/auth/otp/request` | PASS |
| 10 | Permission / auth gate | PASS (401/403 compat envelope) |

**Score:** 10/10

---

## 3. Full verification run

| Command | Result |
|---------|--------|
| `npm run build` | PASS |
| `npm run openapi:generate` | PASS (176 legacy + foundation `/api/auth/*`) |
| `npx vitest run src/modules/auth/` | 44/44 PASS |
| `npm run p1:12-verify` | PASS (matrix 10/10 + suite 8 scripts) |
| `npm run e2e:freeze` | 9/9 PASS |

### Phase 1 script suite (orchestrated by `p1:12-verify`)

| Script | Checks |
|--------|--------|
| `p1:auth-compat` | 2/2 |
| `p1:03-verify` | 13/13 |
| `p1:07-08-verify` | 23/23 |
| `p1:04-05-verify` | 11/11 |
| `p1:06-verify` | 14/14 |
| `p1:09-verify` | 13/13 |
| `p1:10-verify` | 9/9 |
| `p1:11-verify` | 19/19 |

---

## 4. Preserved contracts

| Rule | Verified |
|------|----------|
| No route rename | YES |
| Compat `{ ok, data }` | YES |
| Foundation `{ success, data }` | YES |
| Frozen OTP/login BN strings | YES (`p1:11-verify`) |
| Panel session cookies | YES |
| No web proxy changes in P1-12 | YES |

---

## 5. Phase 1 step completion

| Step | Certificate |
|------|-------------|
| P1-00 … P1-02 | Baseline / audit / permissions |
| P1-03 | [P1_03_CERTIFICATE.md](./P1_03_CERTIFICATE.md) |
| P1-04–05 | [P1_04_05_CERTIFICATE.md](./P1_04_05_CERTIFICATE.md) |
| P1-06 | [P1_06_CERTIFICATE.md](./P1_06_CERTIFICATE.md) |
| P1-07–08 | [P1_07_08_CERTIFICATE.md](./P1_07_08_CERTIFICATE.md) |
| P1-09 | [P1_09_CERTIFICATE.md](./P1_09_CERTIFICATE.md) |
| P1-10 | [P1_10_CERTIFICATE.md](./P1_10_CERTIFICATE.md) |
| P1-11 | [P1_11_CERTIFICATE.md](./P1_11_CERTIFICATE.md) |
| **P1-12** | **This document** |

P1-13 (technician login page) remains **optional** and is not required for Phase 1 exit.

---

## 6. How to re-run

```bash
cd pranidoctor-backend
npm run dev   # :3000

# Full gate
npm run build
npm run openapi:generate
npm run p1:12-verify
npm run e2e:freeze
```

---

## 7. References

- [PHASE1_FREEZE.md](./PHASE1_FREEZE.md)
- [API_CONTRACT_FREEZE.md](./API_CONTRACT_FREEZE.md)
- [E2E_CERTIFICATE.md](./E2E_CERTIFICATE.md)
- [PHASE1_IMPLEMENTATION_SEQUENCE.md](./PHASE1_IMPLEMENTATION_SEQUENCE.md)
