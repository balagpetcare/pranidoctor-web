# PHASE 1 BACKEND FOUNDATION — Module Contract

**Version:** 1.0.0  
**Status:** PLAN ONLY — NO IMPLEMENTATION  
**Date:** 2026-05-21  
**Scope:** Module interfaces, DTO rules, validation rules, error policy, event contracts

---

## Table of Contents

1. [Module Contract Overview](#1-module-contract-overview)
2. [DTO Rules](#2-dto-rules)
3. [Validation Rules](#3-validation-rules)
4. [Error Policy](#4-error-policy)
5. [Event Flow](#5-event-flow)
6. [Logging Flow](#6-logging-flow)
7. [Module API Specifications](#7-module-api-specifications)
8. [Cross-Module Communication](#8-cross-module-communication)

---

## 1. Module Contract Overview

### 1.1 Module Interface Pattern

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          MODULE CONTRACT STRUCTURE                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         PUBLIC INTERFACE                                  │   │
│  │                                                                           │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │   │
│  │  │    Service      │  │     DTOs        │  │     Events      │          │   │
│  │  │  (Public API)   │  │ (Data Shapes)   │  │  (Published)    │          │   │
│  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘          │   │
│  │           │                    │                    │                    │   │
│  │           └────────────────────┴────────────────────┘                    │   │
│  │                               │                                          │   │
│  │                          index.ts (exports)                              │   │
│  │                                                                           │   │
│  └───────────────────────────────┬──────────────────────────────────────────┘   │
│                                  │                                               │
│  ┌───────────────────────────────┼──────────────────────────────────────────┐   │
│  │                         INTERNAL IMPLEMENTATION                           │   │
│  │                                                                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │   │
│  │  │ Repository  │  │   Schemas   │  │  Internal   │  │   Private   │    │   │
│  │  │  (Data)     │  │ (Validation)│  │  Services   │  │   Types     │    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │   │
│  │                                                                           │   │
│  │                    ⚠️ NOT EXPORTED - Module Internal Only               │   │
│  │                                                                           │   │
│  └───────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Module Contract Checklist

Every module MUST have:

- [ ] `index.ts` — Public exports only
- [ ] `{module}.service.ts` — Public service interface
- [ ] `dto/` — Request/response data transfer objects
- [ ] `schemas/` — Zod validation schemas
- [ ] `events/` — Published event definitions
- [ ] `__tests__/` — Unit tests for public API

Every module MAY have:

- [ ] `repository.ts` — Internal database access
- [ ] `services/` — Additional internal services
- [ ] `types.ts` — Internal type definitions

---

## 2. DTO Rules

### 2.1 DTO Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Create input | `Create{Entity}Dto` | `CreateUserDto` |
| Update input | `Update{Entity}Dto` | `UpdateUserDto` |
| Response | `{Entity}ResponseDto` | `UserResponseDto` |
| List response | `{Entity}ListResponseDto` | `UserListResponseDto` |
| Query params | `{Entity}QueryDto` | `UserQueryDto` |

### 2.2 DTO Structure Pattern

```typescript
// src/modules/users/dto/create-user.dto.ts

export interface CreateUserDto {
  email: string;
  phone: string;
  role: UserRole;
  displayName?: string;
}

// Response DTO - what we send back
export interface UserResponseDto {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  displayName: string | null;
  createdAt: string; // ISO date string
  updatedAt: string;
}

// List response with pagination
export interface UserListResponseDto {
  data: UserResponseDto[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}
```

### 2.3 DTO Transformation Rules

```typescript
// Entity → DTO transformation

// RULE: Never expose internal fields
// ✗ passwordHash, internalNotes, etc.

// RULE: Convert dates to ISO strings
// ✓ createdAt: entity.createdAt.toISOString()

// RULE: Flatten simple relations
// ✓ customerName: entity.customer.displayName

// RULE: Omit deep relations by default
// ✗ customer: { user: { ... } }

// RULE: Use explicit select in queries
// ✓ prisma.user.findUnique({ select: { ... } })

// Transformer function
export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone ?? '',
    role: user.role,
    status: user.status,
    displayName: null, // Fetched separately if needed
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
```

### 2.4 DTO Layer Mapping

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DTO LAYER MAPPING                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   HTTP Request                                                                   │
│        │                                                                         │
│        ▼                                                                         │
│   ┌──────────────────┐                                                          │
│   │  Request Body    │  → JSON parsing                                          │
│   └────────┬─────────┘                                                          │
│            │                                                                     │
│            ▼                                                                     │
│   ┌──────────────────┐                                                          │
│   │  Zod Schema      │  → Validation + transformation                           │
│   └────────┬─────────┘                                                          │
│            │                                                                     │
│            ▼                                                                     │
│   ┌──────────────────┐                                                          │
│   │  Create{X}Dto    │  → Type-safe service input                               │
│   └────────┬─────────┘                                                          │
│            │                                                                     │
│            ▼                                                                     │
│   ┌──────────────────┐                                                          │
│   │  Service Layer   │  → Business logic                                        │
│   └────────┬─────────┘                                                          │
│            │                                                                     │
│            ▼                                                                     │
│   ┌──────────────────┐                                                          │
│   │  Prisma Entity   │  → Database result                                       │
│   └────────┬─────────┘                                                          │
│            │                                                                     │
│            ▼                                                                     │
│   ┌──────────────────┐                                                          │
│   │  ResponseDto     │  → Sanitized output                                      │
│   └────────┬─────────┘                                                          │
│            │                                                                     │
│            ▼                                                                     │
│   HTTP Response                                                                  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Validation Rules

### 3.1 Zod Schema Conventions

```typescript
// src/modules/users/schemas/create-user.schema.ts

import { z } from 'zod';
import { bdPhoneSchema, emailSchema } from '@shared/validation';
import { UserRole } from '@generated/prisma';

export const createUserSchema = z.object({
  email: emailSchema,
  phone: bdPhoneSchema,
  role: z.nativeEnum(UserRole),
  displayName: z.string().min(2).max(100).optional(),
});

// Infer type from schema
export type CreateUserInput = z.infer<typeof createUserSchema>;
```

### 3.2 Schema Naming Convention

| Schema Type | Pattern | Example |
|-------------|---------|---------|
| Create | `create{Entity}Schema` | `createUserSchema` |
| Update | `update{Entity}Schema` | `updateUserSchema` |
| Query | `{entity}QuerySchema` | `userQuerySchema` |
| Params | `{entity}ParamsSchema` | `userParamsSchema` |

### 3.3 Validation Middleware Pattern

```typescript
// src/shared/middleware/validate.middleware.ts

import { RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '@shared/errors';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate<T extends ZodSchema>(
  schema: T,
  target: ValidationTarget = 'body'
): RequestHandler {
  return async (req, res, next) => {
    try {
      const data = req[target];
      const validated = await schema.parseAsync(data);
      req[target] = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError('VALIDATION_FAILED', formatZodErrors(error)));
      } else {
        next(error);
      }
    }
  };
}

function formatZodErrors(error: z.ZodError) {
  return error.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
    code: e.code,
  }));
}
```

### 3.4 Common Validation Patterns

```typescript
// src/shared/validation/common.schemas.ts

// Bangladesh phone
export const bdPhoneSchema = z
  .string()
  .regex(/^01[3-9]\d{8}$/, 'Invalid Bangladesh mobile number')
  .transform((v) => v.replace(/\s/g, ''));

// OTP code
export const otpCodeSchema = z
  .string()
  .length(6)
  .regex(/^\d{6}$/, 'OTP must be 6 digits');

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// Date range
export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
    { message: 'Start date must be before end date', path: ['endDate'] }
  );

// Money (BDT)
export const bdtAmountSchema = z
  .number()
  .positive()
  .max(10_000_000)
  .transform((v) => Math.round(v * 100) / 100);

// Search query
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  ...paginationSchema.shape,
});
```

---

## 4. Error Policy

### 4.1 Error Class Hierarchy

```
AppError (base)
├── HttpError
│   ├── BadRequestError (400)
│   ├── UnauthorizedError (401)
│   ├── ForbiddenError (403)
│   ├── NotFoundError (404)
│   ├── ConflictError (409)
│   ├── ValidationError (422)
│   └── TooManyRequestsError (429)
├── DomainError
│   ├── InsufficientBalanceError
│   ├── ServiceUnavailableError
│   └── BusinessRuleViolationError
└── InternalError (500)
```

### 4.2 Error Response Format

```typescript
// Standard error response
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable: "VALIDATION_FAILED"
    message: string;        // Human-readable (Bengali preferred)
    details?: unknown;      // Additional context
    requestId?: string;     // For support correlation
  };
}

// Example validation error
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "ইনপুট বৈধ নয়",
    "details": [
      { "field": "phone", "message": "Invalid Bangladesh mobile number" }
    ],
    "requestId": "req_abc123"
  }
}
```

### 4.3 Error Code Catalog

| Code | HTTP | Description |
|------|------|-------------|
| `AUTH_REQUIRED` | 401 | No authentication token |
| `INVALID_TOKEN` | 401 | Token invalid or expired |
| `INSUFFICIENT_PERMISSIONS` | 403 | Role not authorized |
| `RESOURCE_NOT_FOUND` | 404 | Entity does not exist |
| `RESOURCE_NOT_OWNED` | 403 | User doesn't own resource |
| `VALIDATION_FAILED` | 422 | Schema validation failed |
| `DUPLICATE_ENTRY` | 409 | Unique constraint violated |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `OTP_INVALID` | 400 | Wrong OTP code |
| `OTP_EXPIRED` | 400 | OTP past expiry |
| `OTP_MAX_ATTEMPTS` | 400 | Too many verify attempts |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### 4.4 Error Handler

```typescript
// src/shared/errors/error.handler.ts

export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = req.headers['x-request-id'] as string;
  
  // Known application errors
  if (error instanceof AppError) {
    logger.warn({
      msg: 'Application error',
      code: error.code,
      requestId,
      path: req.path,
    });
    
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        requestId,
      },
    });
  }
  
  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error, res, requestId);
  }
  
  // Unexpected errors - log full stack
  logger.error({
    msg: 'Unhandled error',
    error: error.message,
    stack: error.stack,
    requestId,
    path: req.path,
  });
  
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId,
    },
  });
}
```

---

## 5. Event Flow

### 5.1 Event Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EVENT FLOW                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────┐                                                              │
│   │   Service    │  publishes                                                   │
│   │   Action     │ ─────────────┐                                               │
│   └──────────────┘              │                                               │
│                                 ▼                                               │
│                        ┌─────────────────┐                                      │
│                        │   Event Bus     │                                      │
│                        │  (In-Process)   │                                      │
│                        └────────┬────────┘                                      │
│                                 │                                               │
│         ┌───────────────────────┼───────────────────────┐                      │
│         │                       │                       │                      │
│         ▼                       ▼                       ▼                      │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐               │
│  │ Notification │       │    Audit     │       │    Queue     │               │
│  │   Handler    │       │   Handler    │       │   Handler    │               │
│  └──────┬───────┘       └──────┬───────┘       └──────┬───────┘               │
│         │                      │                      │                        │
│         ▼                      ▼                      ▼                        │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐               │
│  │ Send SMS/    │       │ Write Audit  │       │ Queue        │               │
│  │ Push Notif   │       │ Log          │       │ Background   │               │
│  └──────────────┘       └──────────────┘       │ Job          │               │
│                                                 └──────────────┘               │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Event Type Definitions

```typescript
// src/shared/events/event.types.ts

export interface DomainEvent<T = unknown> {
  type: string;
  timestamp: Date;
  payload: T;
  metadata: {
    correlationId: string;
    causationId?: string;
    userId?: string;
  };
}

// Module-specific events
// src/modules/clinics/events/clinics.events.ts

export const ClinicsEvents = {
  SERVICE_REQUEST_CREATED: 'clinics.service-request.created',
  SERVICE_REQUEST_ASSIGNED: 'clinics.service-request.assigned',
  SERVICE_REQUEST_COMPLETED: 'clinics.service-request.completed',
  SERVICE_REQUEST_CANCELLED: 'clinics.service-request.cancelled',
  TREATMENT_RECORDED: 'clinics.treatment.recorded',
  BILLING_CREATED: 'clinics.billing.created',
  PAYMENT_RECEIVED: 'clinics.payment.received',
} as const;

export interface ServiceRequestCreatedEvent {
  requestId: string;
  customerId: string;
  animalId: string;
  serviceType: ServiceRequestType;
  isEmergency: boolean;
}

export interface ServiceRequestAssignedEvent {
  requestId: string;
  providerId: string;
  providerType: 'doctor' | 'technician';
}
```

### 5.3 Event Bus Implementation

```typescript
// src/shared/events/event-bus.ts

import { EventEmitter } from 'events';
import { DomainEvent } from './event.types';
import { logger } from '@shared/logger';
import { generateCuid } from '@shared/utils';

class EventBus {
  private emitter = new EventEmitter();
  
  publish<T>(eventType: string, payload: T, metadata?: Partial<DomainEvent['metadata']>) {
    const event: DomainEvent<T> = {
      type: eventType,
      timestamp: new Date(),
      payload,
      metadata: {
        correlationId: metadata?.correlationId ?? generateCuid(),
        causationId: metadata?.causationId,
        userId: metadata?.userId,
      },
    };
    
    logger.debug({ msg: 'Event published', eventType, correlationId: event.metadata.correlationId });
    
    // Async emit - don't block publisher
    setImmediate(() => {
      this.emitter.emit(eventType, event);
    });
  }
  
  subscribe<T>(eventType: string, handler: (event: DomainEvent<T>) => Promise<void>) {
    this.emitter.on(eventType, async (event: DomainEvent<T>) => {
      try {
        await handler(event);
      } catch (error) {
        logger.error({
          msg: 'Event handler failed',
          eventType,
          error: (error as Error).message,
          correlationId: event.metadata.correlationId,
        });
      }
    });
  }
}

export const eventBus = new EventBus();
```

### 5.4 Event Handler Registration

```typescript
// src/modules/notifications/events/notifications.handlers.ts

import { eventBus } from '@shared/events';
import { ClinicsEvents, ServiceRequestCreatedEvent } from '@modules/clinics';
import { notificationService } from '../notification.service';

export function registerNotificationHandlers() {
  // Service request created → notify customer
  eventBus.subscribe<ServiceRequestCreatedEvent>(
    ClinicsEvents.SERVICE_REQUEST_CREATED,
    async (event) => {
      await notificationService.notifyServiceRequestCreated(event.payload);
    }
  );
  
  // Service request assigned → notify provider
  eventBus.subscribe(
    ClinicsEvents.SERVICE_REQUEST_ASSIGNED,
    async (event) => {
      await notificationService.notifyProviderAssigned(event.payload);
    }
  );
}
```

---

## 6. Logging Flow

### 6.1 Log Levels

| Level | When to Use |
|-------|-------------|
| `error` | Unrecoverable errors, exceptions |
| `warn` | Recoverable issues, deprecations |
| `info` | Business events, state changes |
| `debug` | Development details |
| `trace` | Verbose debugging |

### 6.2 Structured Logging Format

```typescript
// src/shared/logger/logger.ts

import pino from 'pino';
import { config } from '@shared/config';

export const logger = pino({
  level: config.logLevel,
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: config.appName,
    env: config.nodeEnv,
  },
});

// Usage examples
logger.info({ msg: 'User created', userId: 'xyz', role: 'CUSTOMER' });
logger.error({ msg: 'Database error', error: err.message, query: 'findUser' });
logger.warn({ msg: 'Slow query', duration: 500, model: 'ServiceRequest' });
```

### 6.3 Request Logging

```typescript
// src/shared/middleware/logger.middleware.ts

export const requestLogger: RequestHandler = (req, res, next) => {
  const requestId = generateRequestId();
  req.headers['x-request-id'] = requestId;
  
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    logger.info({
      msg: 'HTTP Request',
      requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      userId: (req as any).user?.sub,
    });
  });
  
  next();
};
```

### 6.4 Log Context Pattern

```typescript
// Create child logger with context
function createContextLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

// In service
class UserService {
  private log = createContextLogger({ module: 'users' });
  
  async createUser(data: CreateUserDto) {
    this.log.info({ msg: 'Creating user', email: data.email });
    
    const user = await this.repository.create(data);
    
    this.log.info({ msg: 'User created', userId: user.id });
    
    return user;
  }
}
```

---

## 7. Module API Specifications

### 7.1 Auth Module API

```typescript
// src/modules/auth/auth.service.ts

export interface IAuthService {
  // OTP Flow
  requestOtp(phone: string): Promise<OtpRequestResponseDto>;
  verifyOtp(phone: string, code: string): Promise<TokenPairDto>;
  
  // Admin Login
  adminLogin(email: string, password: string): Promise<AdminLoginResponseDto>;
  
  // Token Management
  refreshToken(refreshToken: string): Promise<TokenPairDto>;
  revokeToken(jti: string): Promise<void>;
  
  // Session
  validateSession(token: string): Promise<AuthenticatedUser | null>;
}
```

### 7.2 Users Module API

```typescript
// src/modules/users/user.service.ts

export interface IUserService {
  // CRUD
  findById(id: string): Promise<UserResponseDto | null>;
  findByPhone(phone: string): Promise<UserResponseDto | null>;
  create(data: CreateUserDto): Promise<UserResponseDto>;
  update(id: string, data: UpdateUserDto): Promise<UserResponseDto>;
  
  // Profile
  getProfile(userId: string, profileType: string): Promise<ProfileResponseDto>;
  updateProfile(userId: string, data: UpdateProfileDto): Promise<ProfileResponseDto>;
  
  // List
  list(query: UserQueryDto): Promise<UserListResponseDto>;
}
```

### 7.3 Clinics Module API

```typescript
// src/modules/clinics/clinics.service.ts

export interface IClinicsService {
  // Service Requests
  createRequest(customerId: string, data: CreateServiceRequestDto): Promise<ServiceRequestResponseDto>;
  getRequest(id: string): Promise<ServiceRequestResponseDto>;
  updateRequestStatus(id: string, status: ServiceRequestStatus, actorId: string): Promise<void>;
  assignProvider(requestId: string, providerId: string, providerType: string): Promise<void>;
  
  // AI Technicians
  getTechnician(id: string): Promise<AiTechnicianResponseDto>;
  listTechnicians(query: TechnicianQueryDto): Promise<TechnicianListResponseDto>;
  
  // Billing
  createBilling(requestId: string, data: CreateBillingDto): Promise<BillingResponseDto>;
  recordPayment(billingId: string, data: RecordPaymentDto): Promise<void>;
}
```

---

## 8. Cross-Module Communication

### 8.1 Allowed Communication Patterns

| From | To | Pattern | Example |
|------|-----|---------|---------|
| API Route | Module Service | Direct import | `await authService.verifyOtp()` |
| Module A | Module B (read) | Public service | `await userService.findById(id)` |
| Module A | Module B (write) | Event | `eventBus.publish('user.created', ...)` |
| Worker | Module | Direct import | `await notificationService.send()` |

### 8.2 Forbidden Patterns

```typescript
// ✗ FORBIDDEN: Direct repository import from another module
import { userRepository } from '@modules/users/internal/user.repository';

// ✗ FORBIDDEN: Direct Prisma query for another module's entities
const user = await prisma.user.findUnique({ ... }); // in clinics module

// ✗ FORBIDDEN: Circular dependency
// users → clinics → users

// ✓ ALLOWED: Through public service
import { UserService } from '@modules/users';
const user = await userService.findById(id);

// ✓ ALLOWED: Through events
eventBus.publish(ClinicsEvents.SERVICE_REQUEST_CREATED, { ... });
```

### 8.3 Dependency Injection Pattern

```typescript
// src/modules/clinics/clinics.module.ts

import { UserService } from '@modules/users';
import { NotificationService } from '@modules/notifications';
import { ClinicsService } from './clinics.service';
import { ClinicsRepository } from './clinics.repository';

export function createClinicsModule(deps: {
  userService: UserService;
  notificationService: NotificationService;
}) {
  const repository = new ClinicsRepository();
  const service = new ClinicsService(repository, deps.userService);
  
  return {
    service,
  };
}
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
| Folder Structure | `docs/backend/02-folder-structure.md` |
| API Contract | `docs/api/API_CONTRACT_V1.md` |
| Error Standard | `docs/api/ERROR_STANDARD.md` |
| Master System Rules | `docs/core/MASTER_SYSTEM_RULES.md` |

---

*End of 06-module-contract.md*
