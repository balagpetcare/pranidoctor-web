# Security Layer Implementation Report

**Phase:** 1.4  
**Date:** 2026-05-21  
**Status:** Complete

---

## Overview

This report documents the implementation of the security layer for the Prani Doctor backend. The security layer provides comprehensive authentication, authorization, session management, rate limiting, and audit logging capabilities.

---

## Components Implemented

### 1. JWT Service (`src/shared/security/jwt/`)

**Files:**
- `jwt.config.ts` - Token TTL configuration per context
- `jwt.service.ts` - Token generation and validation
- `index.ts` - Public exports

**Features:**
- Context-aware token generation (mobile, admin, doctor, technician, api)
- Separate access and refresh tokens
- Token pair generation with atomic creation
- Token validation with detailed error handling
- Automatic expiration detection
- Token decoding without validation
- Header extraction utility

**Token TTL Configuration:**
| Context | Access Token | Refresh Token |
|---------|-------------|---------------|
| Mobile | 15 minutes | 30 days |
| Admin | 30 minutes | 7 days |
| Doctor | 1 hour | 14 days |
| Technician | 8 hours | 30 days |
| API | 1 hour | N/A |

**Token Payload Structure:**
```typescript
interface TokenPayload {
  sub: string;       // User ID
  type: 'access' | 'refresh';
  ctx: AuthContext;  // Context (mobile, admin, etc.)
  role: UserRole;    // User role
  sid: string;       // Session ID
  did?: string;      // Device ID (optional)
  tid?: string;      // Tenant ID (optional)
  iat: number;       // Issued at
  exp: number;       // Expiration
}
```

**API:**
```typescript
generateTokenPair(options: GenerateTokenOptions): Promise<TokenPair>
generateAccessToken(options: GenerateTokenOptions): Promise<{ accessToken, expiresAt }>
validateAccessToken(token: string, context: AuthContext): Promise<ValidateTokenResult>
validateRefreshToken(token: string, context: AuthContext): Promise<ValidateTokenResult>
decodeToken(token: string): TokenPayload | null
extractTokenFromHeader(authHeader: string | undefined): string | null
```

---

### 2. Session Storage (`src/shared/security/session/`)

**Files:**
- `session.storage.ts` - Redis-based session management
- `index.ts` - Public exports

**Features:**
- Redis-backed session storage with TTL
- User session tracking (multiple sessions per user)
- Device-specific session mapping
- Session activity tracking
- Session revocation with reason tracking
- Bulk session revocation
- MFA verification state management
- Refresh token storage with rotation support

**Session Data Structure:**
```typescript
interface SessionData {
  id: string;
  userId: string;
  context: AuthContext;
  deviceId?: string;
  deviceInfo?: DeviceInfo;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  revoked: boolean;
  revokedAt?: Date;
  revokedReason?: string;
  mfaVerified?: boolean;
  mfaMethod?: 'otp' | 'totp' | 'biometric';
}
```

**API:**
```typescript
createSession(options: CreateSessionOptions): Promise<SessionData>
getSession(sessionId: string): Promise<SessionData | null>
updateSessionActivity(sessionId: string): Promise<void>
revokeSession(sessionId: string, reason?: string): Promise<boolean>
revokeAllUserSessions(userId: string, exceptSessionId?: string): Promise<number>
getUserSessions(userId: string): Promise<SessionData[]>
getDeviceSession(userId: string, deviceId: string): Promise<SessionData | null>
storeRefreshToken(options: StoreRefreshTokenOptions): Promise<string>
validateRefreshTokenStorage(userId, sessionId, token): Promise<{ valid, tokenData }>
rotateRefreshToken(userId, sessionId, newToken, ttl): Promise<string>
revokeRefreshToken(userId: string, sessionId: string): Promise<void>
setMfaVerified(sessionId: string, method: 'otp' | 'totp' | 'biometric'): Promise<void>
```

**Redis Key Structure:**
- `session:{sessionId}` - Session data
- `user:sessions:{userId}` - Set of user's session IDs
- `device:session:{userId}:{deviceId}` - Device to session mapping
- `refresh:{userId}:{sessionId}` - Refresh token data

---

### 3. RBAC Permission System (`src/shared/security/rbac/`)

**Files:**
- `permissions.ts` - Permission definitions and groups
- `rbac.service.ts` - Permission checking logic
- `index.ts` - Public exports

**Permissions Defined:**
| Category | Permissions |
|----------|-------------|
| Users | `users:read`, `users:write`, `users:delete`, `users:admin` |
| Doctors | `doctors:read`, `doctors:write`, `doctors:verify`, `doctors:admin` |
| Clinics | `clinics:read`, `clinics:write`, `clinics:admin` |
| Animals | `animals:read`, `animals:write`, `animals:medical:read`, `animals:medical:write` |
| Leads | `leads:read`, `leads:write`, `leads:assign`, `leads:convert`, `leads:admin` |
| AI | `ai:chat`, `ai:history:read`, `ai:admin` |
| Notifications | `notifications:read`, `notifications:send`, `notifications:admin` |
| Reports | `reports:read`, `reports:generate`, `reports:export` |
| Audit | `audit:read` |
| Settings | `settings:read`, `settings:write` |
| System | `system:admin`, `system:config` |

**Role Hierarchy:**
```
USER (1) < SUPPORT (2) < TECHNICIAN (3) < DOCTOR (4) < MANAGER (5) < ADMIN (6) < SUPER_ADMIN (7)
```

**Role Permissions:**
| Role | Permission Set |
|------|---------------|
| USER | Basic app access (animals, AI chat, notifications) |
| SUPPORT | User read, leads read/write, AI history |
| TECHNICIAN | Leads management, animals read, AI chat |
| DOCTOR | Medical records, reports, notifications |
| MANAGER | Team management, reports, settings read |
| ADMIN | Full management except system config |
| SUPER_ADMIN | All permissions |

**API:**
```typescript
getRolePermissions(role: UserRole): PermissionType[]
hasPermission(user: AuthUser, permission: PermissionType): boolean
hasAnyPermission(user: AuthUser, permissions: PermissionType[]): boolean
hasAllPermissions(user: AuthUser, permissions: PermissionType[]): boolean
hasRole(user: AuthUser, role: UserRole): boolean
hasAnyRole(user: AuthUser, roles: UserRole[]): boolean
hasMinimumRole(user: AuthUser, minimumRole: UserRole): boolean
isAdmin(user: AuthUser): boolean
isSuperAdmin(user: AuthUser): boolean
canAccessResource(user, resourceOwnerId, requiredPermission): boolean
canModifyResource(user, resourceOwnerId, writePermission, adminPermission): boolean
checkPermissions(user, required, requireAll): PermissionCheckResult
```

---

### 4. Rate Limiting (`src/shared/security/rate-limit/`)

**Files:**
- `rate-limit.config.ts` - Preset configurations
- `rate-limit.service.ts` - Rate limiting logic and middleware
- `index.ts` - Public exports

**Preset Configurations:**
| Preset | Points | Duration | Block Duration | Use Case |
|--------|--------|----------|----------------|----------|
| GLOBAL | 1000 | 60s | 60s | Global API limit |
| API_STANDARD | 100 | 60s | 60s | Standard endpoints |
| API_STRICT | 30 | 60s | 120s | Sensitive endpoints |
| AUTH_OTP_REQUEST | 5 | 1h | 1h | OTP requests |
| AUTH_OTP_VERIFY | 5 | 5m | 5m | OTP verification |
| AUTH_LOGIN | 10 | 15m | 15m | Login attempts |
| AUTH_REFRESH | 30 | 60s | 60s | Token refresh |
| AI_CHAT | 20 | 60s | 60s | AI chat requests |
| AI_CHAT_DAILY | 100 | 24h | 1h | Daily AI limit |
| UPLOAD | 10 | 60s | 120s | File uploads |
| NOTIFICATION_SEND | 50 | 60s | 60s | Notifications |
| SEARCH | 30 | 60s | 30s | Search queries |
| EXPORT | 5 | 1h | 1h | Data exports |

**Implementation:**
- Sliding window algorithm using Redis sorted sets
- User-based limiting when authenticated
- IP-based limiting for anonymous requests
- Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- `Retry-After` header on limit exceeded

**API:**
```typescript
checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult>
getRateLimitStatus(key: string, config: RateLimitConfig): Promise<{ count, remaining, resetAt }>
resetRateLimit(key: string, config: RateLimitConfig): Promise<void>
createRateLimitMiddleware(preset, keyGenerator?): Express Middleware

// Pre-configured middleware
rateLimitGlobal, rateLimitApi, rateLimitStrict
rateLimitOtpRequest, rateLimitOtpVerify, rateLimitLogin
rateLimitAiChat, rateLimitUpload, rateLimitSearch, rateLimitExport
```

---

### 5. Audit Logging (`src/shared/security/audit/`)

**Files:**
- `audit.types.ts` - Type definitions
- `audit.service.ts` - Audit logging logic
- `index.ts` - Public exports

**Audit Actions:**
| Category | Actions |
|----------|---------|
| Auth | LOGIN, LOGOUT, OTP_REQUEST, OTP_VERIFY, TOKEN_REFRESH, SESSION_REVOKE, MFA_VERIFY |
| User | CREATE, UPDATE, DELETE, ROLE_CHANGE |
| Doctor | CREATE, UPDATE, VERIFY, SUSPEND |
| Clinic | CREATE, UPDATE, STAFF_ADD, STAFF_REMOVE |
| Animal | CREATE, UPDATE, DELETE, MEDICAL_RECORD_ADD |
| Lead | CREATE, ASSIGN, CONVERT, STATUS_CHANGE |
| AI | CONVERSATION_START, CONVERSATION_END, EMERGENCY_ESCALATE |
| System | NOTIFICATION_SEND, SETTINGS_UPDATE, DATA_EXPORT, DATA_DELETE, PERMISSION_GRANT/REVOKE, SYSTEM_CONFIG_CHANGE |

**Severity Levels:**
- `INFO` - Standard operations
- `WARNING` - Role changes, verifications, data exports
- `CRITICAL` - Deletions, suspensions, session revokes, emergency escalations

**Audit Log Entry Structure:**
```typescript
interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: AuditAction;
  severity: AuditSeverity;
  outcome: AuditOutcome;
  
  actorId?: string;
  actorType: 'user' | 'system' | 'api' | 'scheduler';
  actorRole?: string;
  actorIp?: string;
  actorUserAgent?: string;
  
  targetType?: string;
  targetId?: string;
  resourceType?: string;
  resourceId?: string;
  
  details?: Record<string, unknown>;
  changes?: { field, oldValue, newValue }[];
  
  requestId?: string;
  traceId?: string;
  sessionId?: string;
  tenantId?: string;
  
  errorCode?: string;
  errorMessage?: string;
}
```

**Storage:**
- Redis-based with 90-day TTL
- Indexed by date, actor, and action
- Async logging option via BullMQ queue
- Automatic context enrichment from request context

**API:**
```typescript
createAuditLog(options: CreateAuditLogOptions): Promise<AuditLogEntry>
createAuditLogAsync(options: CreateAuditLogOptions): Promise<void>
getAuditLog(id: string): Promise<AuditLogEntry | null>
getAuditLogsByActor(actorId: string, limit?): Promise<AuditLogEntry[]>
getAuditLogsByAction(action: AuditAction, limit?): Promise<AuditLogEntry[]>
getAuditLogsByDate(date: Date, limit?): Promise<AuditLogEntry[]>

// Helper functions
auditAuth(action, options?): Promise<AuditLogEntry>
auditUser(action, userId, options?): Promise<AuditLogEntry>
auditDoctor(action, doctorId, options?): Promise<AuditLogEntry>
auditDataAccess(resourceType, resourceId, action, options?): Promise<AuditLogEntry>
```

---

### 6. Auth Middleware (`src/shared/security/middleware/`)

**Files:**
- `auth.middleware.ts` - Authentication and authorization middleware
- `index.ts` - Public exports

**Features:**
- Context-aware authentication
- Optional authentication mode
- MFA requirement support
- Session validation and activity tracking
- Automatic context propagation (userId, tenantId)
- Permission-based authorization
- Role-based authorization
- Role hierarchy checking
- Resource ownership verification

**Express Request Extension:**
```typescript
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      sessionId?: string;
    }
  }
}
```

**Pre-configured Middleware:**
```typescript
// Authentication
authMobile       // Mobile app authentication
authAdmin        // Admin panel authentication
authDoctor       // Doctor app authentication
authTechnician   // Technician app authentication
authApi          // API key authentication

// Optional authentication
optionalAuthMobile  // Mobile auth (continues if no token)
optionalAuthAdmin   // Admin auth (continues if no token)

// MFA
mfaRequired      // Requires MFA verification
```

**Custom Middleware:**
```typescript
authenticate(options: AuthOptions)
requirePermission(...permissions: PermissionType[])
requireAnyPermission(...permissions: PermissionType[])
requireRole(...roles: UserRole[])
requireMinimumRole(minimumRole: UserRole)
requireOwnershipOrPermission(getOwnerId, permission)
```

---

## Security Types (`src/shared/security/types.ts`)

**Core Types:**
- `AuthContext` - Authentication context (mobile, admin, doctor, technician, api)
- `UserRole` - User role enumeration
- `RoleHierarchy` - Numeric role level mapping
- `AuthUser` - Authenticated user data
- `TokenPayload` - JWT token payload
- `DeviceInfo` - Device information for sessions
- `SessionData` - Session storage structure
- `RefreshTokenData` - Refresh token storage structure

---

## Usage Examples

### Basic Authentication
```typescript
import { authMobile, requirePermission, Permission } from '@shared/security';

router.get('/animals',
  authMobile,
  requirePermission(Permission.ANIMALS_READ),
  animalController.list
);
```

### Optional Authentication
```typescript
router.get('/public-data',
  optionalAuthMobile,
  (req, res) => {
    if (req.user) {
      // Return personalized data
    } else {
      // Return public data
    }
  }
);
```

### Role-Based Access
```typescript
router.post('/doctors/verify',
  authAdmin,
  requireRole('ADMIN', 'SUPER_ADMIN'),
  doctorController.verify
);
```

### Ownership Check
```typescript
router.put('/animals/:id',
  authMobile,
  requireOwnershipOrPermission(
    (req) => req.params.ownerId,
    Permission.ANIMALS_WRITE
  ),
  animalController.update
);
```

### Rate Limiting
```typescript
import { rateLimitOtpRequest, rateLimitAiChat } from '@shared/security';

router.post('/auth/otp/request', rateLimitOtpRequest, authController.requestOtp);
router.post('/ai/chat', authMobile, rateLimitAiChat, aiController.chat);
```

### Audit Logging
```typescript
import { auditAuth, auditUser, createAuditLog } from '@shared/security';

// Simple auth audit
await auditAuth('AUTH_LOGIN', { outcome: 'SUCCESS' });

// User action audit
await auditUser('USER_UPDATE', userId, {
  changes: [{ field: 'email', oldValue, newValue }],
});

// Custom audit with details
await createAuditLog({
  action: 'LEAD_CONVERT',
  targetType: 'lead',
  targetId: leadId,
  details: { convertedTo: 'user', userId: newUserId },
});
```

---

## File Structure

```
src/shared/security/
├── types.ts                    # Core security types
├── index.ts                    # Main exports
├── jwt/
│   ├── jwt.config.ts          # Token TTL configuration
│   ├── jwt.service.ts         # Token operations
│   └── index.ts
├── session/
│   ├── session.storage.ts     # Redis session management
│   └── index.ts
├── rbac/
│   ├── permissions.ts         # Permission definitions
│   ├── rbac.service.ts        # Permission checking
│   └── index.ts
├── rate-limit/
│   ├── rate-limit.config.ts   # Rate limit presets
│   ├── rate-limit.service.ts  # Rate limiting logic
│   └── index.ts
├── audit/
│   ├── audit.types.ts         # Audit type definitions
│   ├── audit.service.ts       # Audit logging
│   └── index.ts
└── middleware/
    ├── auth.middleware.ts     # Auth middleware
    └── index.ts
```

---

## Future Readiness

### MFA Support
- Session tracks `mfaVerified` and `mfaMethod` fields
- `setMfaVerified()` function for marking MFA completion
- `mfaRequired` middleware for protected routes
- Supports OTP, TOTP, and biometric methods

### Multi-Device Support
- Device ID tracking in sessions and tokens
- Device-specific session mapping
- Per-device refresh tokens
- Ability to revoke specific device sessions

### Token Revocation
- Session-based revocation (revoke session = invalidate all tokens)
- Refresh token rotation on use
- Ability to revoke all user sessions
- Reason tracking for audit trail

### Multi-Tenancy
- `tenantId` field in tokens and sessions
- Context propagation to request context
- Ready for tenant-based permission checks

---

## Environment Variables

```env
# JWT Secrets (minimum 32 characters each)
ADMIN_JWT_SECRET=...
MOBILE_JWT_SECRET=...
DOCTOR_JWT_SECRET=...
TECHNICIAN_JWT_SECRET=...
MOBILE_REFRESH_SECRET=...
```

---

## Security Considerations

1. **Token Security**
   - HS256 signing algorithm
   - Separate secrets per context
   - Short access token TTL
   - Refresh token rotation

2. **Session Security**
   - Server-side session validation
   - Activity tracking
   - Immediate revocation support
   - Reason tracking for audits

3. **Rate Limiting**
   - Sliding window algorithm
   - User and IP-based limiting
   - Configurable per endpoint
   - Block duration on abuse

4. **Audit Trail**
   - All security events logged
   - Severity classification
   - 90-day retention
   - Request tracing integration

---

## Phase 1.4 Completion Checklist

- [x] JWT service with token generation/validation
- [x] Refresh token system with rotation
- [x] Device session management
- [x] RBAC permission registry
- [x] Rate limiting middleware
- [x] Audit log service
- [x] Auth middleware
- [x] Session storage
- [x] MFA ready infrastructure
- [x] Multi-device support
- [x] Revocation support
- [x] Security report documentation
