# Phase 1 — Database Map (Authentication & Identity)

**Date:** 2026-05-21  
**Schema owner:** `pranidoctor-backend/prisma/schema.prisma`  
**Policy:** Additive only — no column drops, no enum value removals, no NOT NULL without default

---

## 1. Existing identity tables (read-only reference)

### 1.1 `User`

| Column | Type | Notes |
|--------|------|-------|
| `id` | cuid | PK |
| `email` | string unique | Login for panels |
| `phone` | string? unique | BD mobile normalized |
| `passwordHash` | string | bcrypt panels + optional mobile password |
| `role` | `UserRole` | Authoritative role |
| `status` | `UserStatus` | ACTIVE required for login |
| `createdAt` / `updatedAt` | DateTime | |

**Indexes:** `role`, `status`, `(role, status)`

### 1.2 Profile tables (1:1 with User)

| Model | Role | Phase 1 use |
|-------|------|-------------|
| `AdminProfile` | ADMIN, SUPER_ADMIN | Panel display |
| `DoctorProfile` | DOCTOR | Verification, clinic linkage |
| `AiTechnicianProfile` | AI_TECHNICIAN | Field ops identity |
| `CustomerProfile` | CUSTOMER | Mobile me; **`locale`** default `bn-BD` |

**CustomerProfile fields (identity-relevant):**

- `displayName`, `locale`, `addressJson`, `profilePhotoUrl`, `coverPhotoUrl`

### 1.3 `MobileOtpChallenge`

| Column | Purpose |
|--------|---------|
| `normalizedPhone` | unique key |
| `codeHash` | bcrypt/hash of OTP |
| `expiresAt` | TTL |
| `verifyAttempts` | lockout |
| `sendWindowStartedAt`, `sendsInWindow` | rate limit |
| `lastOtpSentAt` | resend cooldown |

**No FK to User** — phone-first challenge before user exists.

---

## 2. Enums (frozen values)

### `UserRole`

`ADMIN`, `CUSTOMER`, `DOCTOR`, `AI_TECHNICIAN`, `SUPPORT`, `SUPER_ADMIN`

### `UserStatus`

`ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`, `INVITED`, `DELETED`

Phase 1: no new enum members.

---

## 3. Missing primitives (gaps)

| Concept | In DB today | Phase 1 action |
|---------|-------------|----------------|
| Refresh token | No | Add `RefreshToken` model |
| Server session | No | Add optional `UserSession` model |
| Device | No | Add `UserDevice` model |
| Auth audit | No (only domain audits) | Add `AuthAuditEvent` model |
| Permission grant | No (code matrix only) | Phase 1a: code; Phase 1b optional `UserPermission` |

---

## 4. Proposed additive models

### 4.1 `RefreshToken`

```prisma
model RefreshToken {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash    String   @unique
  context      String   // "mobile" | "admin" | ...
  deviceId     String?  // optional link to UserDevice
  expiresAt    DateTime
  revokedAt    DateTime?
  createdAt    DateTime @default(now())
  lastUsedAt   DateTime?

  @@index([userId])
  @@index([expiresAt])
}
```

**Rules:**

- Store **hash** only (never raw token in DB).
- Rotate on refresh (invalidate old hash).
- Legacy mobile responses gain **optional** `refreshToken` string (plaintext once at issue).

### 4.2 `UserSession` (optional but recommended)

```prisma
model UserSession {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  channel      String   // "admin_panel" | "doctor_panel" | "technician_panel" | "mobile"
  sessionHash  String   @unique  // hash of JWT jti or cookie session id
  ipAddress    String?
  userAgent    String?
  expiresAt    DateTime
  revokedAt    DateTime?
  createdAt    DateTime @default(now())
  lastSeenAt   DateTime?

  @@index([userId, channel])
}
```

**Use:** `logout` revokes session row; `revoke all sessions` for support.

Panels may continue stateless JWT until session rows are wired — migration is backward compatible.

### 4.3 `UserDevice`

```prisma
model UserDevice {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  deviceKey     String   // client-stable id
  platform      String?  // "android" | "ios" | "web"
  pushToken     String?
  appVersion    String?
  lastActiveAt  DateTime @default(now())
  revokedAt     DateTime?
  createdAt     DateTime @default(now())

  @@unique([userId, deviceKey])
  @@index([userId])
}
```

### 4.4 `AuthAuditEvent`

```prisma
enum AuthAuditAction {
  LOGIN_SUCCESS
  LOGIN_FAILURE
  LOGOUT
  OTP_REQUEST
  OTP_VERIFY_SUCCESS
  OTP_VERIFY_FAILURE
  REFRESH_SUCCESS
  REFRESH_FAILURE
  PERMISSION_DENIED
  SESSION_REVOKED
}

model AuthAuditEvent {
  id          String          @id @default(cuid())
  action      AuthAuditAction
  userId      String?         // null for unknown phone OTP attempts
  role        UserRole?
  channel     String          // admin_panel | mobile | ...
  ipAddress   String?
  userAgent   String?
  metadata    Json?
  createdAt   DateTime        @default(now())

  @@index([userId, createdAt])
  @@index([action, createdAt])
}
```

**Retention:** Application-level job (Phase 2); Phase 1 only writes.

### 4.5 `UserPermission` (Phase 1b — optional)

Defer unless admin UI needs dynamic grants. Code matrix remains source of truth for Phase 1a.

---

## 5. `User` relation additions (additive)

On `User` model add relations only:

```prisma
refreshTokens   RefreshToken[]
userSessions    UserSession[]
userDevices     UserDevice[]
authAuditEvents AuthAuditEvent[]  // if FK to user; else audit stays denormalized
```

No changes to existing columns on `User`.

---

## 6. Data flows

### 6.1 Mobile OTP login

```
Phone → MobileOtpChallenge (upsert)
     → verify → User (find or create CUSTOMER)
     → CustomerProfile (ensure)
     → sign JWT (access)
     → [Phase 1] create RefreshToken row
     → AuthAuditEvent OTP_VERIFY_SUCCESS
```

### 6.2 Admin panel login

```
identifier → User (ADMIN|SUPER_ADMIN, ACTIVE)
          → bcrypt verify passwordHash
          → sign JWT → Set-Cookie
          → [Phase 1] UserSession row optional
          → AuthAuditEvent LOGIN_SUCCESS
```

### 6.3 Refresh

```
refreshToken (body) → hash lookup RefreshToken
                   → not revoked, not expired
                   → new access JWT + rotate refresh hash
                   → AuthAuditEvent REFRESH_SUCCESS
```

---

## 7. Migration sequence

| Migration | Contents |
|-----------|----------|
| `20260521_phase1_refresh_token` | `RefreshToken` + User relation |
| `20260521_phase1_auth_audit` | `AuthAuditAction` enum + `AuthAuditEvent` |
| `20260521_phase1_user_device` | `UserDevice` |
| `20260521_phase1_user_session` | `UserSession` (optional same release) |

**Rules:**

- Run only from `pranidoctor-backend`
- Sync types to web via existing `sync-prisma-from-backend` script (types only)
- Seed: no change required

---

## 8. What stays unchanged

- `MobileOtpChallenge` shape
- `User.email` / `phone` uniqueness
- Profile table PKs and required fields
- `ServiceInstanceAuditEvent` (separate domain)
- `Notification` model

---

## 9. Query patterns (implementation hints)

| Operation | Index used |
|-----------|------------|
| Login by email | `User.email` unique |
| Login by phone | `User.phone` unique |
| OTP by phone | `MobileOtpChallenge.normalizedPhone` unique |
| Active refresh | `RefreshToken.tokenHash` unique |
| User devices | `UserDevice(userId, deviceKey)` unique |
| Audit tail | `AuthAuditEvent(userId, createdAt)` |

---

## 10. Compliance checklist

- [ ] No dropped columns
- [ ] No enum removals
- [ ] New tables nullable FKs where optional
- [ ] `prisma migrate deploy` idempotent on staging
- [ ] Web repo does not run migrations
