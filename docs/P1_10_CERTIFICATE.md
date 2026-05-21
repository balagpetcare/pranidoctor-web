# P1-10 Certificate — Foundation Delegation

**Project:** Prani Doctor  
**Issued:** 2026-05-21  
**Phase:** P1-10 IMPLEMENT  
**Execution:** [P1_10_EXECUTION.md](./P1_10_EXECUTION.md)

---

## Sign-off

```
P1_10_PASS=YES
AUTH_DELEGATED=YES
```

---

## Scope certified

| Item | Certificate |
|------|-------------|
| Foundation `/api/auth/*` delegates to `IdentityAuthService` + token services | YES |
| `AuthService` is a thin facade (no `AUTH_MIGRATION_PENDING`, no compat import) | YES |
| Compat auth uses `IdentityAuthService` + shared `issueCredentialsAfterOtpVerify` | YES |
| Foundation refresh returns rotated `refreshToken` in `data` when enabled | YES |
| Foundation logout revokes via Bearer JWT | YES |
| `legacy-web/` duplicates removed (re-export only) | YES |
| Frozen routes, envelopes, cookies, web proxies | PRESERVED |

---

## Prerequisites (unchanged)

| Gate | Status |
|------|--------|
| P1-03 `AUTH_READY` | YES |
| P1-11 `LOCALE_READY` | YES |

---

## Verification snapshot

| Script | Checks |
|--------|--------|
| `npm run p1:10-verify` | 9/9 |
| `npm run p1:07-08-verify` | 23/23 |
| `npm run p1:auth-compat` | 2/2 |
| `npm run e2e:freeze` | 9/9 |
| `npx vitest run src/modules/auth/` | 44/44 |

---

## References

- [P1_10_PLAN.md](./P1_10_PLAN.md)
- [P1_10_DELEGATION_MAP.md](./P1_10_DELEGATION_MAP.md)
- [API_CONTRACT_FREEZE.md](./API_CONTRACT_FREEZE.md)
- [P1_03_CERTIFICATE.md](./P1_03_CERTIFICATE.md)
- [P1_11_CERTIFICATE.md](./P1_11_CERTIFICATE.md)

---

**NEXT_STEP=P1-12** (E2E auth certificate)
