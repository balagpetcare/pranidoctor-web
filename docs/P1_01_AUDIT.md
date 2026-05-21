# P1-01 — Auth Audit (Implementation)

**Date:** 2026-05-21  
**Module:** `auth-audit`  
**Policy:** Additive schema only; frozen routes and response envelopes unchanged

---

## 1. Database (additive)

**Migration:** `prisma/migrations/20260521120000_phase1_auth_audit`

| Model / enum | Purpose |
|--------------|---------|
| `AuthAuditAction` | LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, OTP_*, REFRESH_*, PERMISSION_DENIED, SESSION_REVOKED |
| `AuthAuditEvent` | Append-only audit rows |

**User relation:** `User.authAuditEvents` (optional FK, `onDelete: SetNull`)

No existing columns altered or removed.

---

## 2. Service

| File | Role |
|------|------|
| `src/modules/auth/auth-audit.service.ts` | `recordAuthAudit`, `recordAuthAuditFireAndForget`, `authRequestContext` |
| `src/legacy/web/lib/auth-audit/index.ts` | Legacy import path `@/lib/auth-audit` |

**Behavior:**

- Writes are **non-blocking** (`recordAuthAuditFireAndForget`) on hot paths
- Failures log `[pranidoctor][auth-audit] write failed` — never fail the HTTP response
- Stores IP / User-Agent from `x-forwarded-for`, `x-real-ip`, `user-agent`

---

## 3. Hooks (compat routes — envelope unchanged)

| Event | Channel | Routes / call sites |
|-------|---------|---------------------|
| `LOGIN_FAILURE` | `admin_panel` | `admin/auth/login` (invalid creds) |
| `LOGIN_SUCCESS` | `admin_panel` | `admin/auth/login` |
| `LOGOUT` | `admin_panel` | `admin/auth/logout` |
| `LOGIN_*` | `doctor_panel` | `doctor/auth/login` |
| `LOGOUT` | `doctor_panel` | `doctor/auth/logout` |
| `LOGIN_*` | `technician_panel` | `technician/auth/login` |
| `LOGOUT` | `technician_panel` | `technician/auth/logout` |
| `OTP_REQUEST` | `mobile` | `mobile/auth/otp/request` (+ `send-otp` re-export) |
| `OTP_VERIFY_SUCCESS` / `OTP_VERIFY_FAILURE` | `mobile` | `mobile/auth/otp/verify` |
| `LOGIN_*` | `mobile` | `mobile/auth/login` (password) |
| `PERMISSION_DENIED` | `admin_panel` | `assertAdminCan`, `admin-service-instance-service` |

**Retained:** `logAdminLoginFailure()` console logging (dual observability).

---

## 4. Channels (`identity-core`)

```ts
AUTH_CHANNELS = {
  adminPanel: 'admin_panel',
  doctorPanel: 'doctor_panel',
  technicianPanel: 'technician_panel',
  mobile: 'mobile',
}
```

---

## 5. Verification

```bash
cd pranidoctor-backend
npm run db:migrate:deploy
npm run build
npx tsx scripts/p1-auth-compat-verify.ts
```

After a successful admin login (when DB available):

```sql
SELECT action, channel, "userId", "createdAt"
FROM "AuthAuditEvent"
ORDER BY "createdAt" DESC
LIMIT 10;
```

---

## 6. P1-01 exit

| Criterion | Status |
|-----------|--------|
| Migration applied | YES |
| Service + legacy bridge | YES |
| Hooks on listed paths | YES |
| Response shape unchanged | YES |
| `BREAKING_CHANGE` | **NO** |
