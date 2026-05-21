# P1-11 — Execution Report (Auth Localization)

**Project:** Prani Doctor  
**Date:** 2026-05-21  
**Scope:** `pranidoctor-backend` (i18n module + mobile me locale)

---

## 1. Summary

| Step | Delivered |
|------|-----------|
| **Error catalog** | `modules/auth/i18n/` — `AuthMessageKey`, `messages.bn-BD.ts`, `messages.en-US.ts` |
| **Locale resolver** | `parseAcceptLanguage`, `resolveRequestLocale`, frozen OTP/login BN policy |
| **Localized responses** | `authJsonError` / `compatAuthJsonError` + `Content-Language` header |
| **Bangla copy** | `OTP_MSG` / `CRED_MSG` re-exported from catalog (byte-stable BN) |
| **Locale exposure** | `GET/PATCH /api/mobile/me` → `data.locale` (`bn-BD` \| `en-US`) |

**Web:** No proxy changes (frozen paths).

---

## 2. New modules

| File | Purpose |
|------|---------|
| `i18n/locale.ts` | Accept-Language + profile locale resolution |
| `i18n/catalog.types.ts` | Message keys + `ERROR_CODE_TO_MESSAGE_KEY` |
| `i18n/messages.bn-BD.ts` | Bengali catalog + frozen `OTP_MSG` / `CRED_MSG` |
| `i18n/messages.en-US.ts` | English catalog |
| `i18n/compat-error.ts` | `authJsonError`, `compatAuthJsonError`, `authJsonOk` |
| `i18n/index.ts` | `resolveAuthMessage`, exports |
| `i18n/i18n.test.ts` | OTP/CRED parity + resolver tests |

---

## 3. Wired call sites

| Area | Change |
|------|--------|
| `compat/mobile-device.adapter.ts` | Localized device errors |
| `compat/mobile-auth.adapter.ts` | Refresh localized; OTP frozen BN; credentials EN via header |
| `legacy/.../mobile-auth/guard.ts` | Bearer/session errors + `profileLocale` on context |
| `compat/doctor|technician|admin-auth.adapter.ts` | Panel errors + `me(request)` |
| `permissions.registry.ts` | `PERMISSION_DENIED` localized |
| `legacy/.../otp-messages.ts` | Re-export from i18n |
| `legacy/.../customer-credentials-messages.ts` | Re-export from i18n |
| `routes/mobile/me/route.ts` | `locale` GET/PATCH |

---

## 4. API (additive)

### `GET /api/mobile/me`

```json
{ "ok": true, "data": { "locale": "bn-BD", ... } }
```

### `PATCH /api/mobile/me`

```json
{ "locale": "en-US" }
```

### Auth errors (unchanged envelope)

```json
{ "ok": false, "error": { "code": "TOKEN_INVALID", "message": "...", "details": { "locale": "en-US" } } }
```

Response header: `Content-Language: bn-BD` or `en-US`.

---

## 5. Frozen-route policy (verified)

| Route | `Accept-Language: en` | Result |
|-------|----------------------|--------|
| `POST /api/mobile/auth/otp/*` | ignored | BN message (frozen) |
| `POST /api/mobile/auth/login` | honored | EN credential messages |
| `POST /api/mobile/devices/register` | honored | EN device messages |
| `POST /api/mobile/auth/refresh` | honored | EN refresh messages |

---

## 6. Verification (2026-05-21)

```
npx prisma generate          PASS
npm run build                PASS
npx vitest run src/modules/auth/  41/41 PASS (incl. i18n 8/8)
npm run openapi:generate     PASS (176 paths)
npm run e2e:freeze          9/9 PASS
npm run p1:11-verify        9/9 PASS
npm run p1:verify           23/23 PASS
```

**Ops:** Restart backend on `:3000` after deploy so new routes and i18n module load.

---

## 7. Scripts

| Script | Purpose |
|--------|---------|
| `npm run p1:11-verify` | Locale catalog, Accept-Language, me PATCH round-trip |

---

## 8. References

- [P1_11_PLAN.md](./P1_11_PLAN.md)
- [P1_11_MESSAGE_MAP.md](./P1_11_MESSAGE_MAP.md)
- [P1_11_CERTIFICATE.md](./P1_11_CERTIFICATE.md)
