# P1-09 — Execution Report (Mobile Device Registry)

**Project:** Prani Doctor  
**Date:** 2026-05-21  
**Scope:** `pranidoctor-backend` + web device proxies

---

## 1. Summary

| Step | Delivered |
|------|-----------|
| **Register** | `POST /api/mobile/devices/register` — Bearer auth, Zod validation, session/refresh attach |
| **List** | `GET /api/mobile/devices` — active devices for user |
| **Revoke** | `DELETE /api/mobile/devices/:id` — revoke + cascade sessions/refresh |
| **Refresh guard** | `REFRESH_REJECT_REVOKED_DEVICE` rejects rotate when `deviceId` revoked |
| **Audit** | Additive enum `DEVICE_REGISTERED`, `DEVICE_REVOKED` |

**Web proxies:** `src/app/api/mobile/devices/register/route.ts`, `devices/route.ts`, `devices/[id]/route.ts`.

---

## 2. Backend modules

| File | Purpose |
|------|---------|
| `device.config.ts` | `DEVICE_REGISTER_BIND_SESSION`, `REFRESH_REJECT_REVOKED_DEVICE`, `DEVICE_REVOKE_CASCADE_SESSIONS` |
| `device-session.helper.ts` | `bindDeviceToSession`, `attachDeviceToActiveRefreshTokens` |
| `device.service.ts` | `registerOrUpdate` (`replaced`), `listActiveForUser`, `revokeWithCascade`, `isActive` |
| `compat/mobile-device.adapter.ts` | `handleMobileDeviceRegister`, `handleMobileDeviceList`, `handleMobileDeviceRevoke` |
| `refresh-token.service.ts` | Device revoked check on rotate; `revokeForDevice` |
| `legacy/.../mobile-auth/guard.ts` | Expose `sessionId` (`sid`) on `MobileCustomerContext` |

### Legacy routes

| Route file | Handler |
|------------|---------|
| `routes/mobile/devices/register/route.ts` | POST register |
| `routes/mobile/devices/route.ts` | GET list |
| `routes/mobile/devices/[id]/route.ts` | DELETE revoke |

### Migration

`prisma/migrations/20260521190000_phase1_device_audit_actions/migration.sql` — additive `AuthAuditAction` values.

---

## 3. API contracts (frozen)

### POST `/api/mobile/devices/register`

- Auth: `Authorization: Bearer <mobile JWT>`
- Body: `{ deviceKey, platform?, pushToken?, appVersion? }` (`platform`: `android` \| `ios` \| `web`)
- Success: `{ ok: true, data: { deviceId, deviceKey, registered: true, replaced? } }`
- Errors: `422` validation, `401` unauthorized

### GET `/api/mobile/devices`

- Success: `{ ok: true, data: { devices: [{ id, deviceKey, platform, appVersion, lastActiveAt, hasPushToken }] } }`

### DELETE `/api/mobile/devices/:id`

- Success: `{ ok: true, data: { revoked: true, deviceId, sessionsRevoked? } }`
- `404` when device missing or already revoked

---

## 4. Verification (2026-05-21)

```
npx prisma migrate deploy     PASS (device audit enum)
npx prisma generate           PASS
npm run build                 PASS
npx vitest run src/modules/auth/ --exclude '**/_archived_foundation/**'  33/33 PASS
npm run openapi:generate      PASS (176 legacy paths; +3 device routes)
npm run e2e:freeze            9/9 PASS
npm run p1:09-verify          10/10 PASS
npm run p1:verify             23/23 PASS
```

**Note:** Restart backend on `:3000` after deploy so compat routes and generated Prisma client match. Stale process caused `500` with `{ success: false }` envelope before restart.

---

## 5. Environment flags

| Variable | Default | Effect |
|----------|---------|--------|
| `DEVICE_REGISTER_BIND_SESSION` | on (unless `false`/`0`) | Set `UserSession.deviceId` on register |
| `DEVICE_REVOKE_CASCADE_SESSIONS` | on | Revoke sessions + refresh tokens for device |
| `REFRESH_REJECT_REVOKED_DEVICE` | off | When `true`, `rotate` fails if linked device revoked |

---

## 6. Related docs

- [P1_09_PLAN.md](./P1_09_PLAN.md)
- [P1_09_DEVICE_FLOW.md](./P1_09_DEVICE_FLOW.md)
- [P1_07_08_EXECUTION.md](./P1_07_08_EXECUTION.md)
