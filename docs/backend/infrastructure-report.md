# Infrastructure Report — Phase 1.3

**Generated:** 2026-05-21
**Phase:** 1.3 — Infrastructure
**Location:** `D:\PraniDoctor\pranidoctor-backend\`

---

## 1. Executive Summary

Phase 1.3 implements the core infrastructure layer with:
- Request context with trace ID propagation
- Structured logging with automatic context injection
- Async-safe error handling
- Redis cache service with common patterns
- BullMQ job queue with retry strategies
- Enhanced health checks with dependency monitoring

---

## 2. Request Context

**Location:** `src/shared/context/`

### Features

- **AsyncLocalStorage**: Thread-safe request context
- **Automatic Propagation**: Context flows through async operations
- **Trace IDs**: Unique identifiers for distributed tracing

### Context Data

```typescript
interface RequestContextData {
  requestId: string;   // Unique per request (nanoid 21)
  traceId: string;     // For distributed tracing (nanoid 16)
  spanId: string;      // For span tracking (nanoid 8)
  userId?: string;     // Set after authentication
  tenantId?: string;   // For multi-tenant support
  startTime: number;   // Request start timestamp
  path?: string;       // Request path
  method?: string;     // HTTP method
  ip?: string;         // Client IP
  userAgent?: string;  // User agent string
}
```

### Usage

```typescript
import {
  getRequestId,
  getTraceId,
  getUserId,
  setUserId,
  getElapsedTime,
} from '@shared/context';

// In middleware (automatic via contextMiddleware)
// In any async code:
const requestId = getRequestId();
const elapsed = getElapsedTime();

// After auth:
setUserId(user.id);
```

### Headers

| Request Header | Response Header | Description |
|----------------|-----------------|-------------|
| `X-Request-Id` | `X-Request-Id` | Request identifier (forwarded or generated) |
| `X-Trace-Id` | `X-Trace-Id` | Trace identifier for distributed tracing |

---

## 3. Central Logger

**Location:** `src/shared/logger/`

### Features

- **Pino**: High-performance JSON logger
- **Context Injection**: Automatic trace IDs in every log
- **Redaction**: Sensitive data automatically masked
- **Structured Output**: JSON in production, pretty in development

### Automatic Context Injection

Every log automatically includes:

```json
{
  "level": "info",
  "time": "2026-05-21T06:50:00.000Z",
  "requestId": "V1StGXR8_Z5jdHi6B-myT",
  "traceId": "abc123def456ghi7",
  "spanId": "span1234",
  "userId": "clxyz...",
  "msg": "User logged in",
  "service": "pranidoctor-api",
  "version": "1.0.0",
  "env": "production"
}
```

### Log Functions

```typescript
import {
  logInfo,
  logWarn,
  logError,
  logDebug,
  logFatal,
} from '@shared/logger';

logInfo('User created', { userId: user.id });
logWarn('Rate limit approaching', { remaining: 10 });
logError('Database query failed', error, { query: 'findUser' });
logDebug('Cache hit', { key: 'user:123' });
logFatal('Unrecoverable error', error);
```

### Redacted Fields

Automatically masked in logs:
- `password`, `passwordHash`
- `secret`, `token`
- `authorization`, `cookie`
- `otp`, `code`
- All nested variants (`*.password`, etc.)

---

## 4. Error Handling

**Location:** `src/shared/errors/`

### Error Classes

| Class | Code | Status |
|-------|------|--------|
| `BadRequestError` | `BAD_REQUEST` | 400 |
| `UnauthorizedError` | `UNAUTHORIZED` | 401 |
| `ForbiddenError` | `FORBIDDEN` | 403 |
| `NotFoundError` | `NOT_FOUND` | 404 |
| `ConflictError` | `CONFLICT` | 409 |
| `ValidationError` | `VALIDATION_FAILED` | 422 |
| `TooManyRequestsError` | `RATE_LIMIT_EXCEEDED` | 429 |
| `InternalServerError` | `INTERNAL_ERROR` | 500 |
| `ServiceUnavailableError` | `SERVICE_UNAVAILABLE` | 503 |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed for body",
    "details": {
      "errors": [
        { "field": "phone", "message": "Invalid phone number", "code": "invalid_string" }
      ],
      "target": "body"
    },
    "requestId": "V1StGXR8_Z5jdHi6B-myT"
  }
}
```

### Async Handler

```typescript
import { asyncHandler } from '@shared/middleware';

// Wraps async route handlers to catch errors
router.get('/users', asyncHandler(async (req, res) => {
  const users = await userService.findAll();
  res.json(users);
}));
```

---

## 5. Response Wrapper

**Location:** `src/shared/utils/response.ts`

### Functions

```typescript
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
  sendNoContent,
  sendMessage,
} from '@shared/utils';

// Standard success response
sendSuccess(res, { user });

// 201 Created
sendCreated(res, { user });

// Paginated response
sendPaginated(res, {
  data: users,
  meta: { total: 100, page: 1, pageSize: 20, hasMore: true },
});

// 204 No Content
sendNoContent(res);

// Message response
sendMessage(res, 'Operation completed');
```

### Success Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... },
  "requestId": "V1StGXR8_Z5jdHi6B-myT"
}
```

---

## 6. Validation System

**Location:** `src/shared/validation/`

### Middleware

```typescript
import {
  validateBody,
  validateQuery,
  validateParams,
  validateAll,
} from '@shared/validation';

// Single target
router.post('/users',
  validateBody(createUserSchema),
  controller.create
);

// Multiple targets
router.get('/users/:id/animals',
  ...validateAll({
    params: idParamsSchema,
    query: paginationSchema,
  }),
  controller.list
);
```

### Common Schemas

| Schema | Description |
|--------|-------------|
| `bdPhoneSchema` | Bangladesh phone validation + normalization |
| `otpCodeSchema` | 6-digit OTP validation |
| `cuidSchema` | CUID format validation |
| `paginationSchema` | page, pageSize with defaults |
| `dateRangeSchema` | from/to date validation |
| `bdtAmountSchema` | BDT currency (2 decimals, max 10M) |
| `emailSchema` | Email format validation |

---

## 7. Config Loader

**Location:** `src/shared/config/`

### Features

- **Zod Validation**: Type-safe configuration
- **Environment Mapping**: Process.env to typed config
- **Caching**: Single load, cached thereafter
- **Production Guards**: Prevents default secrets in production

### Helper Functions

```typescript
import {
  getConfig,
  requireConfig,
  isProduction,
  isDevelopment,
  isTest,
} from '@shared/config';

const config = getConfig();
if (isProduction()) {
  // Production-specific logic
}
```

---

## 8. Redis Cache Service

**Location:** `src/infra/cache/`

### Features

- **Prefixed Keys**: Automatic namespacing
- **JSON Serialization**: Automatic encode/decode
- **Error Resilience**: Graceful degradation on Redis failures
- **Pattern Deletion**: Bulk cache invalidation
- **Get-or-Set**: Cache-aside pattern built-in

### API

```typescript
import { getCacheService, CacheKeys, CacheTTL } from '@infra/cache';

const cache = getCacheService();

// Basic operations
await cache.set('key', value, CacheTTL.STANDARD);
const value = await cache.get<User>('key');
await cache.del('key');

// Cache-aside pattern
const user = await cache.getOrSet(
  CacheKeys.user(id),
  () => userRepository.findById(id),
  CacheTTL.USER
);

// Rate limiting
const count = await cache.incr(CacheKeys.otpRateLimit(phone), CacheTTL.OTP_RATE_LIMIT);

// Bulk operations
const users = await cache.mget<User>(['user:1', 'user:2']);
await cache.mset([['user:1', user1], ['user:2', user2]], CacheTTL.USER);

// Pattern deletion
await cache.delPattern('user:*');
```

### Predefined Keys

```typescript
CacheKeys.user(id)              // user:{id}
CacheKeys.userByPhone(phone)    // user:phone:{phone}
CacheKeys.doctor(id)            // doctor:{id}
CacheKeys.clinic(id)            // clinic:{id}
CacheKeys.otpChallenge(phone)   // otp:challenge:{phone}
CacheKeys.otpRateLimit(phone)   // otp:rate:{phone}
CacheKeys.conversationContext() // ai:context:{id}
CacheKeys.session(sessionId)    // session:{id}
```

### TTL Constants

| Constant | Value | Use Case |
|----------|-------|----------|
| `SHORT` | 60s | Temporary data |
| `MEDIUM` | 5m | Frequently changing |
| `STANDARD` | 1h | Default |
| `LONG` | 24h | Stable data |
| `WEEK` | 7d | Long-term cache |
| `OTP_CHALLENGE` | 5m | OTP expiry |
| `SESSION` | 24h | User sessions |

---

## 9. BullMQ Queue System

**Location:** `src/infra/queue/`

### Features

- **Named Queues**: Predefined queue types
- **Job Retry**: Exponential backoff
- **Priority Queues**: Job prioritization
- **Rate Limiting**: Per-queue rate limits
- **Dead Letter**: Failed job retention
- **Scheduling**: Delayed and repeating jobs

### Queue Definitions

| Queue | Concurrency | Attempts | Timeout | Use Case |
|-------|-------------|----------|---------|----------|
| `notification` | 10 | 3 | - | General notifications |
| `sms` | 5 | 5 | - | SMS with rate limit |
| `email` | 10 | 5 | - | Email delivery |
| `push` | 20 | 3 | - | Push notifications |
| `ai:completion` | 5 | 2 | 60s | AI responses |
| `ai:embedding` | 10 | 3 | 30s | Vector embeddings |
| `ai:summary` | 3 | 2 | 120s | Conversation summaries |
| `report` | 2 | 2 | 5m | Report generation |
| `export` | 2 | 2 | 10m | Data export |
| `cleanup` | 1 | 1 | - | Maintenance tasks |
| `backup` | 1 | 3 | 1h | Database backups |

### API

```typescript
import {
  addJob,
  addBulkJobs,
  scheduleJob,
  scheduleRepeatingJob,
  createWorker,
  getQueueStats,
  QueueNames,
} from '@infra/queue';

// Add job
await addJob(QueueNames.SMS, 'send-otp', {
  phone: '+8801712345678',
  code: '123456',
});

// Add with options
await addJob(QueueNames.NOTIFICATION, 'welcome', data, {
  priority: 1,
  delay: 5000,
  attempts: 5,
});

// Bulk add
await addBulkJobs(QueueNames.EMAIL, [
  { name: 'welcome', data: user1 },
  { name: 'welcome', data: user2 },
]);

// Schedule delayed job
await scheduleJob(QueueNames.NOTIFICATION, 'reminder', data, 3600000); // 1 hour

// Schedule repeating job (cron)
await scheduleRepeatingJob(QueueNames.CLEANUP, 'expired-sessions', {}, '0 0 * * *');

// Create worker
createWorker(QueueNames.SMS, async (job) => {
  const { phone, message } = job.data;
  await smsProvider.send(phone, message);
  return { sent: true };
});

// Get stats
const stats = await getQueueStats(QueueNames.SMS);
// { waiting: 5, active: 2, completed: 100, failed: 3, delayed: 10 }
```

### Retry Strategy

```
Attempt 1: Immediate
Attempt 2: 1s delay
Attempt 3: 2s delay (exponential)
Attempt 4: 4s delay
Attempt 5: 8s delay
...
```

---

## 10. Health Service

**Location:** `src/api/health/`

### Endpoints

| Endpoint | Description | Success | Failure |
|----------|-------------|---------|---------|
| `GET /health` | Full health check | 200 | 503 |
| `GET /ready` | Readiness probe | 200 | 503 |
| `GET /live` | Liveness probe | 200 | - |
| `GET /health/dependencies` | Dependency status | 200 | - |
| `GET /health/system` | System info (dev only) | 200 | - |

### Health Response

```json
{
  "status": "healthy",
  "timestamp": "2026-05-21T06:50:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "checks": [
    { "name": "database", "status": "healthy", "latency": 5 },
    { "name": "redis", "status": "healthy", "latency": 2 },
    { "name": "queues", "status": "healthy", "latency": 1 },
    { "name": "memory", "status": "healthy", "latency": 0,
      "details": { "heapUsedMB": 120, "heapTotalMB": 256, "heapUsagePercent": 47 }
    },
    { "name": "eventLoop", "status": "healthy", "latency": 0.05 }
  ]
}
```

### Status Rules

| Condition | Status |
|-----------|--------|
| All checks healthy | `healthy` |
| Any check degraded | `degraded` |
| Any check unhealthy | `unhealthy` |

### Readiness vs Liveness

- **Readiness**: Can accept traffic? (DB + Redis must be healthy)
- **Liveness**: Is process alive? (Always 200 if responding)

---

## 11. File Structure

```
src/
├── api/
│   └── health/
│       ├── health.routes.ts
│       ├── health.service.ts    # Enhanced with all checks
│       ├── health.types.ts
│       └── index.ts
├── infra/
│   ├── cache/
│   │   ├── cache.keys.ts        # Key patterns and TTLs
│   │   ├── cache.service.ts     # Cache operations
│   │   └── index.ts
│   ├── queue/
│   │   ├── queue.config.ts      # Queue definitions
│   │   ├── queue.service.ts     # Enhanced queue service
│   │   ├── queue.types.ts
│   │   └── index.ts
│   └── redis/
│       ├── redis.client.ts
│       └── index.ts
└── shared/
    ├── config/
    │   ├── config.loader.ts     # Enhanced with helpers
    │   ├── config.schema.ts
    │   └── index.ts
    ├── context/
    │   ├── request-context.ts   # AsyncLocalStorage context
    │   └── index.ts
    ├── errors/
    │   ├── app.error.ts
    │   ├── error.handler.ts     # Enhanced with context
    │   ├── http.errors.ts
    │   └── index.ts
    ├── logger/
    │   ├── logger.ts            # Enhanced with context mixin
    │   ├── sanitizer.ts
    │   └── index.ts
    ├── middleware/
    │   ├── async-handler.ts     # New async wrapper
    │   ├── context.middleware.ts # New context setup
    │   ├── logger.middleware.ts
    │   ├── request-id.middleware.ts
    │   └── index.ts
    ├── utils/
    │   ├── pagination.ts
    │   ├── response.ts          # New response helpers
    │   └── index.ts
    └── validation/
        ├── common.schemas.ts
        ├── validate.middleware.ts # New validation middleware
        └── index.ts
```

---

## 12. Implementation Checklist

| Component | Status |
|-----------|--------|
| Request context (AsyncLocalStorage) | ✅ |
| Trace ID generation | ✅ |
| Context middleware | ✅ |
| Logger with context mixin | ✅ |
| Structured log format | ✅ |
| Log redaction | ✅ |
| Error handler with context | ✅ |
| Async handler wrapper | ✅ |
| Response wrapper | ✅ |
| Validation middleware | ✅ |
| Config helpers | ✅ |
| Cache service | ✅ |
| Cache keys/TTL constants | ✅ |
| Queue configuration | ✅ |
| Job retry strategies | ✅ |
| Queue stats | ✅ |
| Health checks (DB, Redis, Queue, Memory) | ✅ |
| Dependency status endpoint | ✅ |
| System info endpoint (dev) | ✅ |

---

## 13. Next Steps

1. **Phase 1.4**: Import Prisma schema and implement repositories
2. **Phase 1.5**: Implement authentication middleware
3. **Phase 2**: Integrate external providers
4. **Phase 2+**: Add rate limiting middleware

---

**Phase 1.3 Status: COMPLETE**

Infrastructure layer is production-ready.
