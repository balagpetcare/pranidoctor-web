# PHASE 1 BACKEND FOUNDATION — Security Design

**Version:** 1.0.0  
**Status:** PLAN ONLY — NO IMPLEMENTATION  
**Date:** 2026-05-21  
**Scope:** Authentication, authorization, data protection, security policies

---

## Table of Contents

1. [Security Overview](#1-security-overview)
2. [Authentication Strategy](#2-authentication-strategy)
3. [Authorization Policy](#3-authorization-policy)
4. [Input Validation](#4-input-validation)
5. [Data Protection](#5-data-protection)
6. [Rate Limiting](#6-rate-limiting)
7. [Audit Logging](#7-audit-logging)
8. [Secret Management](#8-secret-management)

---

## 1. Security Overview

### 1.1 Defense in Depth Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            SECURITY LAYERS                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  LAYER 1: NETWORK (Caddy/Nginx)                                                 │
│  ├── TLS termination (HTTPS only)                                               │
│  ├── DDoS protection (rate limiting at edge)                                    │
│  └── IP allowlisting (admin panel)                                              │
│                                                                                  │
│  LAYER 2: API GATEWAY                                                           │
│  ├── Request validation (size, content-type)                                    │
│  ├── Rate limiting (per IP, per user)                                           │
│  └── CORS enforcement                                                           │
│                                                                                  │
│  LAYER 3: AUTHENTICATION MIDDLEWARE                                             │
│  ├── JWT verification                                                           │
│  ├── Token expiry check                                                         │
│  └── Session validation                                                         │
│                                                                                  │
│  LAYER 4: AUTHORIZATION MIDDLEWARE                                              │
│  ├── Role-based access control (RBAC)                                           │
│  ├── Resource ownership validation                                              │
│  └── Permission guards                                                          │
│                                                                                  │
│  LAYER 5: SERVICE LAYER                                                         │
│  ├── Business rule validation                                                   │
│  ├── Input sanitization                                                         │
│  └── Output filtering                                                           │
│                                                                                  │
│  LAYER 6: DATA LAYER                                                            │
│  ├── Parameterized queries (Prisma)                                             │
│  ├── Field-level encryption (sensitive data)                                    │
│  └── Database constraints                                                       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Security Principles

```
PRINCIPLE S-001: Least Privilege
  → Grant minimum permissions required
  → Default deny, explicit allow
  → Time-bound access where possible

PRINCIPLE S-002: Defense in Depth
  → Multiple security layers
  → No single point of failure
  → Redundant validation

PRINCIPLE S-003: Fail Secure
  → Deny access on errors
  → Log security failures
  → Alert on anomalies

PRINCIPLE S-004: Secure by Default
  → Secure configuration out of box
  → Explicit opt-out required
  → Safe defaults for all settings
```

---

## 2. Authentication Strategy

### 2.1 Authentication Matrix

| Context | Method | Token Type | Storage | Lifetime |
|---------|--------|------------|---------|----------|
| Mobile Customer | Phone + OTP | JWT Bearer | Authorization header | 7 days |
| Mobile Doctor | Phone + OTP | JWT Bearer | Authorization header | 7 days |
| Mobile Technician | Phone + OTP | JWT Bearer | Authorization header | 7 days |
| Admin Panel | Email + Password | JWT | HttpOnly Cookie | 24 hours |
| API Integration | API Key | Static token | Authorization header | Until revoked |

### 2.2 JWT Configuration

```typescript
// src/shared/config/jwt.config.ts

export const jwtConfig = {
  // Separate secrets per context
  secrets: {
    mobile: {
      access: process.env.MOBILE_JWT_SECRET!,    // ≥32 chars
      refresh: process.env.MOBILE_REFRESH_SECRET!, // ≥32 chars
    },
    admin: {
      access: process.env.ADMIN_JWT_SECRET!,     // ≥32 chars
    },
    doctor: {
      access: process.env.DOCTOR_JWT_SECRET!,    // ≥32 chars
    },
    technician: {
      access: process.env.TECHNICIAN_JWT_SECRET!, // ≥32 chars
    },
  },
  
  // Token lifetimes
  expiry: {
    mobileAccess: '7d',
    mobileRefresh: '30d',
    adminAccess: '24h',
    doctorAccess: '7d',
    technicianAccess: '7d',
  },
  
  // Algorithm (HS256 for symmetric)
  algorithm: 'HS256' as const,
  
  // Issuer claim
  issuer: 'pranidoctor-api',
};
```

### 2.3 JWT Payload Structure

```typescript
// Mobile Access Token
interface MobileAccessTokenPayload {
  sub: string;          // User ID
  iat: number;          // Issued at
  exp: number;          // Expiration
  jti: string;          // JWT ID (for revocation)
  role: UserRole;       // CUSTOMER | DOCTOR | AI_TECHNICIAN
  phone: string;        // Normalized phone
  profileId: string;    // Profile record ID
  profileType: string;  // CustomerProfile | DoctorProfile | etc.
  providerStatus?: ProviderStatus;
}

// Admin Access Token
interface AdminAccessTokenPayload {
  sub: string;          // User ID
  iat: number;
  exp: number;
  jti: string;
  role: UserRole;       // ADMIN | SUPER_ADMIN | SUPPORT
  email: string;
  sessionId: string;    // For session invalidation
}
```

### 2.4 OTP Security Policy

| Policy | Value | Rationale |
|--------|-------|-----------|
| OTP Length | 6 digits | Balance security/usability |
| OTP Expiry | 300 seconds | Prevent replay attacks |
| Verify Attempts | 5 max | Prevent brute force |
| Resend Cooldown | 60 seconds | Prevent spam |
| Rate Limit | 5/hour/phone | Prevent abuse |
| Hash Algorithm | bcrypt (cost 10) | Secure storage |
| Never in Response | ✓ | Prevent exposure |

### 2.5 Password Policy (Admin)

```typescript
// src/modules/auth/schemas/password.schema.ts

export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain special character');

// Password hashing
const BCRYPT_ROUNDS = 12;
```

---

## 3. Authorization Policy

### 3.1 Role Hierarchy

```
                    ┌──────────────────┐
                    │   SUPER_ADMIN    │  Level 100
                    │  (Full control)  │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐         ┌────────▼────────┐
    │      ADMIN        │         │     SUPPORT     │  Level 50
    │ (Operations mgmt) │         │ (Customer help) │
    └─────────┬─────────┘         └────────┬────────┘
              │                            │
    ┌─────────┴─────────────────────┬──────┴───────┐
    │                               │              │
┌───▼────────┐   ┌──────────────┐   │    ┌────────▼────────┐
│   DOCTOR   │   │ AI_TECHNICIAN│   │    │    CUSTOMER     │  Level 10
│(Clinical)  │   │ (Field work) │   │    │ (Service user)  │
└────────────┘   └──────────────┘   │    └─────────────────┘
                                    │
                              Inherits basic
                              read permissions
```

### 3.2 Permission Matrix

| Resource | CUSTOMER | DOCTOR | AI_TECH | SUPPORT | ADMIN | SUPER |
|----------|----------|--------|---------|---------|-------|-------|
| Own profile | CRUD | CRUD | CRUD | R | CRUD | CRUD |
| Other profiles | — | R(assigned) | R(assigned) | R | RU | CRUD |
| Service requests | CR(own) | RU(assigned) | RU(assigned) | R | RUD | CRUD |
| Prescriptions | R(own) | CRUD(own) | R | R | RUD | CRUD |
| Billing | R(own) | RU(own) | R(own) | R | CRUD | CRUD |
| System settings | — | — | — | R | RU | CRUD |
| Audit logs | — | — | — | R | R | R |
| User management | — | — | — | — | RU | CRUD |

### 3.3 Route Guards

```typescript
// src/shared/middleware/auth.middleware.ts

export function requireAuth(allowedRoles?: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = extractBearerToken(req);
    
    if (!token) {
      throw new UnauthorizedError('AUTH_REQUIRED');
    }
    
    const payload = await verifyToken(token);
    
    if (!payload) {
      throw new UnauthorizedError('INVALID_TOKEN');
    }
    
    if (allowedRoles && !allowedRoles.includes(payload.role)) {
      throw new ForbiddenError('INSUFFICIENT_PERMISSIONS');
    }
    
    req.user = payload;
    next();
  };
}

// Usage in routes
router.get(
  '/admin/users',
  requireAuth([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  usersController.list
);

router.get(
  '/mobile/profile',
  requireAuth([UserRole.CUSTOMER, UserRole.DOCTOR, UserRole.AI_TECHNICIAN]),
  profileController.get
);
```

### 3.4 Resource Ownership Validation

```typescript
// src/shared/middleware/ownership.middleware.ts

export function requireOwnership(resourceType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const resourceId = req.params.id;
    const userId = req.user!.sub;
    const userRole = req.user!.role;
    
    // Admin bypass
    if ([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(userRole)) {
      return next();
    }
    
    const isOwner = await checkOwnership(resourceType, resourceId, userId);
    
    if (!isOwner) {
      throw new ForbiddenError('RESOURCE_NOT_OWNED');
    }
    
    next();
  };
}
```

---

## 4. Input Validation

### 4.1 Validation Strategy

```
Request → Size Check → Content-Type → Schema Validation → Sanitization → Handler
                                            │
                                            ▼
                                     ┌─────────────┐
                                     │    Zod      │
                                     │   Schema    │
                                     └─────────────┘
```

### 4.2 Common Validation Schemas

```typescript
// src/shared/validation/common.schemas.ts

import { z } from 'zod';

// Bangladesh phone validation
export const bdPhoneSchema = z
  .string()
  .regex(/^01[3-9]\d{8}$/, 'Invalid Bangladesh phone number');

// CUID validation (Prisma default IDs)
export const cuidSchema = z.string().cuid();

// UUID validation
export const uuidSchema = z.string().uuid();

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

// Date range
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).refine(
  (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
  { message: 'Start date must be before end date' }
);

// Money (BDT)
export const bdtAmountSchema = z
  .number()
  .positive()
  .max(10_000_000) // 1 crore max
  .transform((v) => Math.round(v * 100) / 100); // 2 decimal places

// OTP code
export const otpCodeSchema = z
  .string()
  .length(6)
  .regex(/^\d{6}$/, 'OTP must be 6 digits');

// Email
export const emailSchema = z.string().email().toLowerCase();

// Safe string (no HTML/script)
export const safeStringSchema = z
  .string()
  .transform((v) => v.replace(/<[^>]*>/g, '').trim());
```

### 4.3 Validation Middleware

```typescript
// src/shared/middleware/validate.middleware.ts

import { z, ZodSchema } from 'zod';

export function validate<T extends ZodSchema>(schema: T, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const validated = await schema.parseAsync(data);
      
      if (source === 'body') req.body = validated;
      else if (source === 'query') req.query = validated;
      else req.params = validated;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('VALIDATION_FAILED', error.errors);
      }
      throw error;
    }
  };
}

// Usage
router.post(
  '/auth/otp/verify',
  validate(otpVerifySchema),
  authController.verifyOtp
);
```

---

## 5. Data Protection

### 5.1 Sensitive Data Classification

| Data Type | Sensitivity | Protection |
|-----------|-------------|------------|
| Password | Critical | bcrypt hash (cost 12) |
| OTP code | High | bcrypt hash (cost 10) |
| Phone number | Medium | Masked in logs, visible to assigned |
| Email | Medium | Visible to owner + admin |
| Medical records | High | Role-restricted, audit logged |
| Financial data | High | Encrypted, audit logged |
| Address | Medium | Visible to assigned + owner |

### 5.2 Data Masking

```typescript
// src/shared/utils/mask.utils.ts

export function maskPhone(phone: string): string {
  // 01712345678 → 0171***5678
  return phone.replace(/(\d{4})(\d{3})(\d{4})/, '$1***$3');
}

export function maskEmail(email: string): string {
  // user@example.com → u***@example.com
  const [local, domain] = email.split('@');
  return `${local[0]}***@${domain}`;
}

export function maskNid(nid: string): string {
  // 1234567890123 → 123*******123
  return nid.replace(/^(.{3})(.*)(.{3})$/, (_, start, middle, end) => 
    start + '*'.repeat(middle.length) + end
  );
}
```

### 5.3 Logging Sanitization

```typescript
// src/shared/logger/sanitizer.ts

const SENSITIVE_FIELDS = [
  'password', 'passwordHash', 'secret', 'token', 'otp', 'code',
  'authorization', 'cookie', 'apiKey', 'nidNumber', 'creditCard',
];

export function sanitizeForLogging(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForLogging);
  }
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    
    if (SENSITIVE_FIELDS.some((f) => lowerKey.includes(f))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
```

---

## 6. Rate Limiting

### 6.1 Rate Limit Tiers

| Endpoint Category | Limit | Window | Key |
|-------------------|-------|--------|-----|
| OTP Request | 5 | 1 hour | phone |
| OTP Verify | 5 | 5 min | phone |
| Admin Login | 5 | 15 min | IP + email |
| API Read | 100 | 1 min | user ID |
| API Write | 30 | 1 min | user ID |
| Public API | 60 | 1 min | IP |
| Search | 20 | 1 min | user ID |
| File Upload | 10 | 1 hour | user ID |

### 6.2 Rate Limiter Implementation

```typescript
// src/shared/middleware/rate-limit.middleware.ts

import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '@shared/cache';

const rateLimiters: Record<string, RateLimiterRedis> = {};

function getRateLimiter(name: string, points: number, duration: number) {
  if (!rateLimiters[name]) {
    rateLimiters[name] = new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: `ratelimit:${name}:`,
      points,
      duration,
    });
  }
  return rateLimiters[name];
}

export function rateLimit(config: {
  name: string;
  points: number;
  duration: number;
  keyGenerator?: (req: Request) => string;
}) {
  const limiter = getRateLimiter(config.name, config.points, config.duration);
  
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = config.keyGenerator?.(req) ?? req.ip;
    
    try {
      const result = await limiter.consume(key);
      
      res.setHeader('X-RateLimit-Limit', config.points);
      res.setHeader('X-RateLimit-Remaining', result.remainingPoints);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + result.msBeforeNext).toISOString());
      
      next();
    } catch (error) {
      if (error instanceof Error && 'msBeforeNext' in error) {
        res.setHeader('Retry-After', Math.ceil((error as any).msBeforeNext / 1000));
      }
      throw new TooManyRequestsError('RATE_LIMIT_EXCEEDED');
    }
  };
}

// Usage
router.post(
  '/auth/otp/request',
  rateLimit({
    name: 'otp-request',
    points: 5,
    duration: 3600, // 1 hour
    keyGenerator: (req) => req.body.phone,
  }),
  authController.requestOtp
);
```

---

## 7. Audit Logging

### 7.1 Audit Events

| Event Category | Events |
|----------------|--------|
| Authentication | login_success, login_failed, logout, token_refresh |
| Authorization | permission_denied, role_changed |
| Data Access | record_viewed, record_exported, sensitive_accessed |
| Data Mutation | record_created, record_updated, record_deleted |
| Security | password_changed, otp_verified, api_key_created |
| System | config_changed, feature_toggled |

### 7.2 Audit Log Schema

```typescript
// src/shared/audit/audit.types.ts

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  
  // Actor
  actorId: string | null;
  actorRole: string | null;
  actorIp: string;
  actorUserAgent: string;
  
  // Action
  action: string;
  category: 'auth' | 'data' | 'security' | 'system';
  
  // Target
  resourceType: string;
  resourceId: string | null;
  
  // Details
  details: Record<string, unknown>;
  
  // Result
  success: boolean;
  errorCode?: string;
}
```

### 7.3 Audit Service

```typescript
// src/shared/audit/audit.service.ts

export class AuditService {
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const auditEntry: AuditLogEntry = {
      id: generateCuid(),
      timestamp: new Date(),
      ...entry,
    };
    
    // Async write to audit log (don't block request)
    setImmediate(async () => {
      await this.writeToDatabase(auditEntry);
      
      // High-priority events also go to monitoring
      if (this.isHighPriority(entry.action)) {
        await this.sendToMonitoring(auditEntry);
      }
    });
  }
  
  private isHighPriority(action: string): boolean {
    return [
      'login_failed', 'permission_denied', 'password_changed',
      'api_key_created', 'role_changed',
    ].includes(action);
  }
}

// Usage
auditService.log({
  actorId: user.id,
  actorRole: user.role,
  actorIp: req.ip,
  actorUserAgent: req.headers['user-agent'] ?? '',
  action: 'record_updated',
  category: 'data',
  resourceType: 'ServiceRequest',
  resourceId: request.id,
  details: { previousStatus: 'PENDING', newStatus: 'ACCEPTED' },
  success: true,
});
```

---

## 8. Secret Management

### 8.1 Secret Categories

| Category | Secrets | Storage |
|----------|---------|---------|
| JWT | ADMIN_JWT_SECRET, MOBILE_JWT_SECRET, etc. | Env var |
| Database | DATABASE_URL | Env var |
| External APIs | OPENAI_API_KEY, SMS_API_KEY | Env var |
| Storage | S3_ACCESS_KEY, S3_SECRET_KEY | Env var |
| Internal | SESSION_SECRET | Env var |

### 8.2 Secret Requirements

```
RULE: Minimum length ≥ 32 characters for JWT secrets
RULE: Unique secret per authentication context
RULE: Never commit secrets to version control
RULE: Rotate secrets on suspected exposure
RULE: Use different secrets per environment
```

### 8.3 Secret Validation

```typescript
// src/shared/config/secrets.validator.ts

export function validateSecrets() {
  const required = [
    'ADMIN_JWT_SECRET',
    'MOBILE_JWT_SECRET',
    'DOCTOR_JWT_SECRET',
    'TECHNICIAN_JWT_SECRET',
    'DATABASE_URL',
  ];
  
  const missing = required.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required secrets: ${missing.join(', ')}`);
  }
  
  // Validate JWT secret length
  const jwtSecrets = [
    'ADMIN_JWT_SECRET',
    'MOBILE_JWT_SECRET',
    'DOCTOR_JWT_SECRET',
    'TECHNICIAN_JWT_SECRET',
  ];
  
  for (const key of jwtSecrets) {
    if (process.env[key]!.length < 32) {
      throw new Error(`${key} must be at least 32 characters`);
    }
  }
  
  // Warn if secrets appear to be defaults
  for (const key of jwtSecrets) {
    if (process.env[key]!.includes('CHANGE_ME') || process.env[key]!.includes('secret')) {
      console.warn(`WARNING: ${key} appears to be a default value`);
    }
  }
}
```

### 8.4 Environment File Template

```bash
# .env.example

# ============================================
# JWT Secrets (generate with: openssl rand -base64 32)
# ============================================
ADMIN_JWT_SECRET=      # ≥32 chars, admin panel
MOBILE_JWT_SECRET=     # ≥32 chars, customer app
DOCTOR_JWT_SECRET=     # ≥32 chars, doctor app
TECHNICIAN_JWT_SECRET= # ≥32 chars, technician app
MOBILE_REFRESH_SECRET= # ≥32 chars, refresh tokens

# ============================================
# Database
# ============================================
DATABASE_URL=postgresql://user:password@localhost:5432/pranidoctor

# ============================================
# Redis
# ============================================
REDIS_URL=redis://localhost:6379

# ============================================
# External Services
# ============================================
OPENAI_API_KEY=
SMS_API_KEY=
SMS_API_SECRET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Architecture | Initial Phase 1 plan |

---

## Related Documents

| Document | Path |
|----------|------|
| System Architecture | `docs/backend/01-system-architecture.md` |
| Auth Flow | `docs/api/AUTH_FLOW.md` |
| Error Standard | `docs/api/ERROR_STANDARD.md` |
| Master System Rules | `docs/core/MASTER_SYSTEM_RULES.md` |

---

*End of 04-security-design.md*
