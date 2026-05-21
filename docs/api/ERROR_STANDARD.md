# ERROR STANDARD — Prani Doctor API

**Version:** 1.1.0  
**Last Updated:** 2026-05-21  
**Scope:** Error codes, response formats, localization, logging

---

## Table of Contents

1. [Error Response Structure](#1-error-response-structure)
2. [HTTP Status Code Usage](#2-http-status-code-usage)
3. [Error Code Catalog](#3-error-code-catalog)
4. [Validation Errors](#4-validation-errors)
5. [Error Localization](#5-error-localization)
6. [Error Logging](#6-error-logging)
7. [Client Error Handling](#7-client-error-handling)
8. [Error Monitoring](#8-error-monitoring)
9. [Implementation Guide](#9-implementation-guide)

---

## 1. Error Response Structure

### 1.1 Standard Error Format

```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message (localized)
    details?: ErrorDetails; // Additional context
    field?: string;         // For single-field validation errors
    requestId?: string;     // For support/debugging
  };
}

interface ErrorDetails {
  [key: string]: unknown;   // Flexible detail structure
}
```

### 1.2 Error Response Examples

**Simple Error:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "রিসোর্স খুঁজে পাওয়া যায়নি",
    "requestId": "req_abc123def456"
  }
}
```

**Validation Error (Single Field):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ফোন নম্বর সঠিক নয়",
    "field": "phone",
    "details": {
      "expected": "01XXXXXXXXX format",
      "received": "12345"
    }
  }
}
```

**Validation Error (Multiple Fields):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন",
    "details": {
      "fieldErrors": [
        {
          "field": "phone",
          "code": "INVALID_FORMAT",
          "message": "ফোন নম্বর সঠিক নয়"
        },
        {
          "field": "name",
          "code": "REQUIRED",
          "message": "নাম আবশ্যক"
        }
      ]
    }
  }
}
```

**Rate Limit Error:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": "2026-05-21T10:31:00.000Z",
      "retryAfter": 45
    }
  }
}
```

---

## 2. HTTP Status Code Usage

### 2.1 Status Code Reference

| Code | Name | Usage | Retry |
|------|------|-------|-------|
| **2xx Success** |
| 200 | OK | Successful GET, PUT, PATCH | N/A |
| 201 | Created | Successful POST | N/A |
| 204 | No Content | Successful DELETE | N/A |
| **4xx Client Error** |
| 400 | Bad Request | Invalid request syntax/params | Fix request |
| 401 | Unauthorized | Missing/invalid authentication | Re-authenticate |
| 403 | Forbidden | Valid auth, no permission | N/A |
| 404 | Not Found | Resource doesn't exist | N/A |
| 409 | Conflict | Resource already exists | N/A |
| 422 | Unprocessable | Semantic validation failed | Fix data |
| 429 | Too Many Requests | Rate limit exceeded | Wait & retry |
| **5xx Server Error** |
| 500 | Internal Error | Unexpected server error | Retry with backoff |
| 502 | Bad Gateway | Upstream service failed | Retry with backoff |
| 503 | Service Unavailable | Service overloaded/maintenance | Retry later |
| 504 | Gateway Timeout | Upstream timeout | Retry with backoff |

### 2.2 Status Code Decision Tree

```
Request received
    │
    ├─▶ Malformed JSON/params? ──▶ 400 Bad Request
    │
    ├─▶ No authentication? ──▶ 401 Unauthorized
    │
    ├─▶ Invalid/expired token? ──▶ 401 Unauthorized
    │
    ├─▶ Valid auth but wrong role? ──▶ 403 Forbidden
    │
    ├─▶ Resource doesn't exist? ──▶ 404 Not Found
    │
    ├─▶ Rate limit exceeded? ──▶ 429 Too Many Requests
    │
    ├─▶ Validation failed? ──▶ 422 Unprocessable Entity
    │   (semantic, business rules)
    │
    ├─▶ Conflict (duplicate)? ──▶ 409 Conflict
    │
    ├─▶ Server error? ──▶ 500 Internal Server Error
    │
    └─▶ Success ──▶ 200/201/204
```

---

## 3. Error Code Catalog

### 3.1 Authentication Errors (AUTH_*)

| Code | HTTP | Message (BN) | Description |
|------|------|--------------|-------------|
| `AUTH_REQUIRED` | 401 | লগইন করুন | No authentication provided |
| `AUTH_INVALID_TOKEN` | 401 | অবৈধ টোকেন | Token malformed or invalid |
| `AUTH_EXPIRED_TOKEN` | 401 | সেশন মেয়াদোত্তীর্ণ | Token has expired |
| `AUTH_INVALID_CREDENTIALS` | 401 | ইমেইল বা পাসওয়ার্ড ভুল | Wrong email/password |
| `AUTH_ACCOUNT_INACTIVE` | 403 | অ্যাকাউন্ট নিষ্ক্রিয় | Account suspended/deleted |
| `AUTH_ACCOUNT_LOCKED` | 403 | অ্যাকাউন্ট লক করা হয়েছে | Too many failed attempts |
| `AUTH_SESSION_EXPIRED` | 401 | সেশন শেষ হয়ে গেছে | Admin session expired |
| `AUTH_REFRESH_INVALID` | 401 | রিফ্রেশ টোকেন অবৈধ | Invalid refresh token |

### 3.2 Authorization Errors (AUTHZ_*)

| Code | HTTP | Message (BN) | Description |
|------|------|--------------|-------------|
| `AUTHZ_FORBIDDEN` | 403 | অনুমতি নেই | Role not authorized |
| `AUTHZ_ROLE_REQUIRED` | 403 | এই কাজের অনুমতি নেই | Specific role required |
| `AUTHZ_OWNER_ONLY` | 403 | শুধুমাত্র মালিক | Must be resource owner |
| `AUTHZ_PROVIDER_NOT_VERIFIED` | 403 | অ্যাকাউন্ট যাচাই হয়নি | Provider not verified |
| `AUTHZ_PROVIDER_SUSPENDED` | 403 | অ্যাকাউন্ট স্থগিত | Provider suspended |

### 3.3 OTP Errors (OTP_*)

**Canonical OTP length:** `OTP_LENGTH=6`. Validation errors for `code` must reference 6-digit requirement.

| Code | HTTP | Message (BN) | Description |
|------|------|--------------|-------------|
| `OTP_NOT_FOUND` | 400 | OTP পাওয়া যায়নি | No OTP requested for this phone |
| `OTP_EXPIRED` | 400 | OTP মেয়াদোত্তীর্ণ হয়েছে। নতুন OTP চান | OTP expired (`OTP_EXPIRY_SECONDS=300`) |
| `OTP_INVALID` | 400 | ভুল OTP। {remaining}টি চেষ্টা বাকি | Wrong code; must be 6 digits |
| `OTP_INVALID_LENGTH` | 422 | OTP অবশ্যই ৬ সংখ্যার হতে হবে | `code` length ≠ 6 |
| `OTP_INVALID_FORMAT` | 422 | OTP শুধুমাত্র সংখ্যা হতে হবে | `code` contains non-digits |
| `OTP_MAX_ATTEMPTS` | 429 | অনেক বার ভুল চেষ্টা। নতুন OTP চান | Exceeded `OTP_MAX_ATTEMPTS=5` |
| `OTP_RATE_LIMIT` | 429 | অনুগ্রহ করে পরে আবার চেষ্টা করুন | Exceeded `OTP_MAX_SENDS_PER_HOUR=5` |
| `OTP_COOLDOWN` | 429 | {n} সেকেন্ড অপেক্ষা করুন | Resend before `OTP_RESEND_COOLDOWN_SECONDS` |

**Validation error example (`OTP_INVALID_LENGTH`):**

```json
{
  "success": false,
  "error": {
    "code": "OTP_INVALID_LENGTH",
    "message": "OTP অবশ্যই ৬ সংখ্যার হতে হবে",
    "field": "code",
    "details": {
      "expectedLength": 6,
      "receivedLength": 4
    }
  }
}
```

### 3.4 Validation Errors (VALIDATION_*)

| Code | HTTP | Message (BN) | Description |
|------|------|--------------|-------------|
| `VALIDATION_ERROR` | 422 | তথ্য সঠিক নয় | Generic validation failure |
| `VALIDATION_REQUIRED` | 422 | এই ফিল্ড আবশ্যক | Required field missing |
| `VALIDATION_FORMAT` | 422 | ফরম্যাট সঠিক নয় | Invalid format |
| `VALIDATION_MIN_LENGTH` | 422 | খুব ছোট | Below minimum length |
| `VALIDATION_MAX_LENGTH` | 422 | খুব বড় | Exceeds maximum length |
| `VALIDATION_RANGE` | 422 | সীমার বাইরে | Value out of range |
| `VALIDATION_ENUM` | 422 | অবৈধ মান | Value not in allowed list |
| `VALIDATION_UNIQUE` | 409 | ইতিমধ্যে বিদ্যমান | Duplicate value |
| `VALIDATION_PHONE` | 422 | ফোন নম্বর সঠিক নয় | Invalid phone format |
| `VALIDATION_EMAIL` | 422 | ইমেইল সঠিক নয় | Invalid email format |

### 3.5 Resource Errors (RESOURCE_*)

| Code | HTTP | Message (BN) | Description |
|------|------|--------------|-------------|
| `RESOURCE_NOT_FOUND` | 404 | খুঁজে পাওয়া যায়নি | Resource doesn't exist |
| `RESOURCE_ALREADY_EXISTS` | 409 | ইতিমধ্যে বিদ্যমান | Duplicate resource |
| `RESOURCE_DELETED` | 410 | মুছে ফেলা হয়েছে | Resource was deleted |
| `RESOURCE_LOCKED` | 423 | লক করা আছে | Resource is locked |
| `RESOURCE_STATE_CONFLICT` | 409 | অবস্থা পরিবর্তন করা যাচ্ছে না | Invalid state transition |

### 3.6 Business Logic Errors (BIZ_*)

| Code | HTTP | Message (BN) | Description |
|------|------|--------------|-------------|
| `BIZ_SERVICE_UNAVAILABLE` | 503 | সেবা অনুপলব্ধ | Service temporarily down |
| `BIZ_AREA_NOT_COVERED` | 422 | এই এলাকায় সেবা নেই | Area not in coverage |
| `BIZ_PROVIDER_NOT_AVAILABLE` | 422 | কোন প্রোভাইডার নেই | No provider available |
| `BIZ_REQUEST_EXPIRED` | 422 | অনুরোধ মেয়াদোত্তীর্ণ | Request has expired |
| `BIZ_PAYMENT_REQUIRED` | 402 | পেমেন্ট প্রয়োজন | Payment required |
| `BIZ_INSUFFICIENT_BALANCE` | 422 | ব্যালেন্স নেই | Insufficient balance |
| `BIZ_ALREADY_ASSIGNED` | 409 | ইতিমধ্যে নিযুক্ত | Already assigned |
| `BIZ_CANNOT_CANCEL` | 422 | বাতিল করা যাচ্ছে না | Cannot cancel at this stage |

### 3.7 Upload Errors (UPLOAD_*)

| Code | HTTP | Message (BN) | Description |
|------|------|--------------|-------------|
| `UPLOAD_FILE_REQUIRED` | 400 | ফাইল আবশ্যক | No file provided |
| `UPLOAD_SIZE_EXCEEDED` | 413 | ফাইল খুব বড় | File too large |
| `UPLOAD_TYPE_NOT_ALLOWED` | 415 | ফাইল টাইপ গ্রহণযোগ্য নয় | File type not allowed |
| `UPLOAD_FAILED` | 500 | আপলোড ব্যর্থ | Upload processing failed |
| `UPLOAD_QUOTA_EXCEEDED` | 429 | আপলোড সীমা শেষ | Upload quota exceeded |

### 3.8 System Errors (SYS_*)

| Code | HTTP | Message (BN) | Description |
|------|------|--------------|-------------|
| `SYS_INTERNAL_ERROR` | 500 | সিস্টেম ত্রুটি | Unexpected server error |
| `SYS_DATABASE_ERROR` | 500 | ডাটাবেজ ত্রুটি | Database operation failed |
| `SYS_EXTERNAL_SERVICE` | 502 | বাহ্যিক সেবা ত্রুটি | External API failed |
| `SYS_TIMEOUT` | 504 | সময় শেষ | Operation timed out |
| `SYS_MAINTENANCE` | 503 | রক্ষণাবেক্ষণ চলছে | System under maintenance |
| `SYS_RATE_LIMIT` | 429 | অনুরোধ সীমা ছাড়িয়েছে | Rate limit exceeded |

---

## 4. Validation Errors

### 4.1 Zod Validation Error Mapping

```typescript
import { ZodError, ZodIssue } from 'zod';

function mapZodError(error: ZodError): ApiErrorResponse {
  const fieldErrors = error.issues.map((issue: ZodIssue) => ({
    field: issue.path.join('.'),
    code: mapZodCode(issue.code),
    message: getLocalizedMessage(issue),
  }));
  
  return {
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন',
      details: {
        fieldErrors,
      },
    },
  };
}

function mapZodCode(zodCode: string): string {
  const codeMap: Record<string, string> = {
    invalid_type: 'VALIDATION_FORMAT',
    invalid_string: 'VALIDATION_FORMAT',
    too_small: 'VALIDATION_MIN_LENGTH',
    too_big: 'VALIDATION_MAX_LENGTH',
    invalid_enum_value: 'VALIDATION_ENUM',
    custom: 'VALIDATION_ERROR',
  };
  
  return codeMap[zodCode] || 'VALIDATION_ERROR';
}
```

### 4.2 Validation Response Format

**Single Field Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ফোন নম্বর সঠিক নয়",
    "field": "phone",
    "details": {
      "constraint": "regex",
      "pattern": "^01[3-9]\\d{8}$"
    }
  }
}
```

**Multiple Field Errors:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন",
    "details": {
      "fieldErrors": [
        {
          "field": "phone",
          "code": "VALIDATION_PHONE",
          "message": "ফোন নম্বর সঠিক নয়"
        },
        {
          "field": "email",
          "code": "VALIDATION_FORMAT",
          "message": "ইমেইল ফরম্যাট সঠিক নয়"
        },
        {
          "field": "animals[0].name",
          "code": "VALIDATION_REQUIRED",
          "message": "পশুর নাম আবশ্যক"
        }
      ]
    }
  }
}
```

### 4.3 Common Validation Schemas

```typescript
// Phone number validation (Bangladesh)
const phoneSchema = z.string()
  .regex(/^01[3-9]\d{8}$/, 'ফোন নম্বর সঠিক নয়');

// Email validation
const emailSchema = z.string()
  .email('ইমেইল ফরম্যাট সঠিক নয়');

// Required string
const requiredString = z.string()
  .min(1, 'এই ফিল্ড আবশ্যক');

// Amount validation (BDT)
const amountSchema = z.number()
  .positive('পরিমাণ ধনাত্মক হতে হবে')
  .max(10000000, 'পরিমাণ খুব বেশি');

// Date validation
const dateSchema = z.string()
  .datetime('তারিখ ফরম্যাট সঠিক নয়');

// ID validation (cuid)
const idSchema = z.string()
  .min(20, 'অবৈধ ID')
  .max(30, 'অবৈধ ID');
```

---

## 5. Error Localization

### 5.1 Message Localization Strategy

```typescript
// Error messages in multiple languages
const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  'bn-BD': {
    'AUTH_REQUIRED': 'লগইন করুন',
    'AUTH_INVALID_TOKEN': 'অবৈধ টোকেন',
    'VALIDATION_ERROR': 'তথ্য সঠিক নয়',
    'RESOURCE_NOT_FOUND': 'খুঁজে পাওয়া যায়নি',
    'SYS_INTERNAL_ERROR': 'সিস্টেম ত্রুটি, পরে আবার চেষ্টা করুন',
    // ... more
  },
  'en-US': {
    'AUTH_REQUIRED': 'Please log in',
    'AUTH_INVALID_TOKEN': 'Invalid token',
    'VALIDATION_ERROR': 'Invalid data provided',
    'RESOURCE_NOT_FOUND': 'Resource not found',
    'SYS_INTERNAL_ERROR': 'System error, please try again later',
    // ... more
  },
};

function getLocalizedErrorMessage(
  code: string,
  locale: string = 'bn-BD'
): string {
  const messages = ERROR_MESSAGES[locale] || ERROR_MESSAGES['bn-BD'];
  return messages[code] || ERROR_MESSAGES['bn-BD'][code] || code;
}
```

### 5.2 Request Locale Detection

```typescript
function getRequestLocale(request: NextRequest): string {
  // 1. Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const preferred = acceptLanguage.split(',')[0].split(';')[0].trim();
    if (preferred.startsWith('bn')) return 'bn-BD';
    if (preferred.startsWith('en')) return 'en-US';
  }
  
  // 2. Default to Bengali
  return 'bn-BD';
}
```

### 5.3 Localized Error Response

```typescript
function createErrorResponse(
  code: string,
  httpStatus: number,
  details?: ErrorDetails,
  request?: NextRequest
): NextResponse {
  const locale = request ? getRequestLocale(request) : 'bn-BD';
  const message = getLocalizedErrorMessage(code, locale);
  
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
        requestId: request?.headers.get('X-Request-ID') || generateRequestId(),
      },
    },
    { status: httpStatus }
  );
}
```

---

## 6. Error Logging

### 6.1 Logging Strategy

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         ERROR LOGGING STRATEGY                                 │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   Error Severity          Logging Action             Alert                    │
│   ──────────────          ──────────────             ─────                    │
│                                                                                │
│   4xx Client Errors                                                           │
│   └─ 400/422 Validation   Log: WARN                  No                      │
│   └─ 401 Unauthorized     Log: WARN + audit          Rate-based              │
│   └─ 403 Forbidden        Log: WARN + audit          Rate-based              │
│   └─ 404 Not Found        Log: INFO                  No                      │
│   └─ 429 Rate Limit       Log: WARN                  Threshold               │
│                                                                                │
│   5xx Server Errors                                                           │
│   └─ 500 Internal         Log: ERROR + stack         Immediate               │
│   └─ 502/504 Gateway      Log: ERROR                 Threshold               │
│   └─ 503 Unavailable      Log: WARN                  System check            │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Log Structure

```typescript
interface ErrorLog {
  // Identification
  requestId: string;
  timestamp: string;
  
  // Error details
  error: {
    code: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
  
  // Request context
  request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: unknown;
    query?: Record<string, string>;
  };
  
  // User context
  user?: {
    id: string;
    role: string;
    phone?: string;
    email?: string;
  };
  
  // Response info
  response: {
    status: number;
    duration: number;
  };
}
```

### 6.3 Error Logger Implementation

```typescript
// src/lib/logger/error-logger.ts

import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
});

export function logError(
  error: unknown,
  request: NextRequest,
  user?: { id: string; role: string },
  responseStatus: number = 500,
  duration: number = 0
): void {
  const isAppError = error instanceof AppError;
  const errorCode = isAppError ? error.code : 'SYS_INTERNAL_ERROR';
  const errorMessage = isAppError ? error.message : 'Internal server error';
  
  const logLevel = responseStatus >= 500 ? 'error' : 'warn';
  
  const logData: ErrorLog = {
    requestId: request.headers.get('X-Request-ID') || generateRequestId(),
    timestamp: new Date().toISOString(),
    error: {
      code: errorCode,
      message: errorMessage,
      ...(responseStatus >= 500 && error instanceof Error && {
        stack: error.stack,
      }),
    },
    request: {
      method: request.method,
      url: request.url,
      headers: sanitizeHeaders(Object.fromEntries(request.headers)),
    },
    ...(user && { user }),
    response: {
      status: responseStatus,
      duration,
    },
  };
  
  logger[logLevel](logData, `[${errorCode}] ${errorMessage}`);
}

// Remove sensitive headers
function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  const sanitized = { ...headers };
  
  for (const header of sensitiveHeaders) {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  }
  
  return sanitized;
}
```

### 6.4 Sensitive Data Handling

```typescript
// Never log these fields
const SENSITIVE_FIELDS = [
  'password',
  'passwordHash',
  'codeHash',
  'accessToken',
  'refreshToken',
  'apiKey',
  'nidNumber',
  'creditCard',
];

function sanitizeBody(body: unknown): unknown {
  if (typeof body !== 'object' || body === null) {
    return body;
  }
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(body)) {
    if (SENSITIVE_FIELDS.includes(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeBody(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
```

---

## 7. Client Error Handling

### 7.1 Flutter Error Handling

```dart
// lib/core/error/api_exception.dart

class ApiException implements Exception {
  final String code;
  final String message;
  final int? statusCode;
  final Map<String, dynamic>? details;
  final String? field;
  
  ApiException({
    required this.code,
    required this.message,
    this.statusCode,
    this.details,
    this.field,
  });
  
  factory ApiException.fromResponse(Response response) {
    final body = response.data;
    
    if (body is Map && body['error'] != null) {
      final error = body['error'];
      return ApiException(
        code: error['code'] ?? 'UNKNOWN_ERROR',
        message: error['message'] ?? 'Unknown error',
        statusCode: response.statusCode,
        details: error['details'],
        field: error['field'],
      );
    }
    
    return ApiException(
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      statusCode: response.statusCode,
    );
  }
  
  bool get isAuthError => code.startsWith('AUTH_');
  bool get isValidationError => code.startsWith('VALIDATION_');
  bool get isNetworkError => code == 'NETWORK_ERROR';
  bool get isServerError => statusCode != null && statusCode! >= 500;
  
  String get userFriendlyMessage {
    // Return localized message for common errors
    switch (code) {
      case 'AUTH_EXPIRED_TOKEN':
        return 'Your session has expired. Please log in again.';
      case 'NETWORK_ERROR':
        return 'Please check your internet connection.';
      default:
        return message;
    }
  }
}
```

### 7.2 Error Interceptor

```dart
// lib/core/network/error_interceptor.dart

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioError err, ErrorInterceptorHandler handler) {
    // Network errors
    if (err.type == DioErrorType.connectionTimeout ||
        err.type == DioErrorType.receiveTimeout ||
        err.type == DioErrorType.other) {
      return handler.reject(
        DioError(
          requestOptions: err.requestOptions,
          error: ApiException(
            code: 'NETWORK_ERROR',
            message: 'Network connection failed',
          ),
        ),
      );
    }
    
    // API errors
    if (err.response != null) {
      final apiError = ApiException.fromResponse(err.response!);
      
      // Handle specific errors
      if (apiError.code == 'AUTH_EXPIRED_TOKEN') {
        // Trigger logout or refresh
        _handleExpiredToken();
      }
      
      return handler.reject(
        DioError(
          requestOptions: err.requestOptions,
          response: err.response,
          error: apiError,
        ),
      );
    }
    
    handler.next(err);
  }
  
  void _handleExpiredToken() {
    // Emit event to auth provider
    authEventBus.emit(AuthEvent.sessionExpired);
  }
}
```

### 7.3 UI Error Display

```dart
// lib/core/widgets/error_display.dart

class ErrorDisplay extends StatelessWidget {
  final ApiException error;
  final VoidCallback? onRetry;
  
  const ErrorDisplay({
    required this.error,
    this.onRetry,
  });
  
  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          _getIcon(),
          size: 64,
          color: Colors.grey,
        ),
        SizedBox(height: 16),
        Text(
          error.userFriendlyMessage,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodyLarge,
        ),
        if (onRetry != null && _isRetryable()) ...[
          SizedBox(height: 16),
          ElevatedButton(
            onPressed: onRetry,
            child: Text('আবার চেষ্টা করুন'),
          ),
        ],
      ],
    );
  }
  
  IconData _getIcon() {
    if (error.isNetworkError) return Icons.wifi_off;
    if (error.isServerError) return Icons.cloud_off;
    if (error.isAuthError) return Icons.lock;
    return Icons.error_outline;
  }
  
  bool _isRetryable() {
    return error.isNetworkError || error.isServerError;
  }
}
```

---

## 8. Error Monitoring

### 8.1 Monitoring Strategy

| Error Type | Monitoring Action |
|------------|-------------------|
| 5xx errors | Alert + count metric |
| 401/403 spike | Security alert |
| 429 rate limits | Capacity alert |
| Validation errors | Log for analysis |
| External service | SLA tracking |

### 8.2 Alert Thresholds

```typescript
const ALERT_THRESHOLDS = {
  // 5xx errors
  serverErrors: {
    threshold: 10,
    window: '5m',
    action: 'page',
  },
  
  // Authentication failures
  authFailures: {
    threshold: 100,
    window: '5m',
    action: 'warn',
  },
  
  // Rate limit hits
  rateLimits: {
    threshold: 1000,
    window: '5m',
    action: 'warn',
  },
  
  // Error rate percentage
  errorRate: {
    threshold: 5, // 5%
    window: '5m',
    action: 'page',
  },
};
```

### 8.3 Error Dashboard Metrics

```typescript
// Metrics to track
const ERROR_METRICS = [
  'api_errors_total',           // Counter: total errors
  'api_errors_by_code',         // Counter: errors by code
  'api_errors_by_endpoint',     // Counter: errors by endpoint
  'api_error_rate',             // Gauge: error rate %
  'api_validation_errors',      // Counter: validation errors
  'api_auth_failures',          // Counter: auth failures
  'api_response_time_p95',      // Histogram: latency
];
```

---

## 9. Implementation Guide

### 9.1 AppError Class

```typescript
// src/lib/error/app-error.ts

export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

// Factory functions for common errors
export const Errors = {
  unauthorized: (message?: string) => 
    new AppError('AUTH_REQUIRED', message || 'Authentication required', 401),
  
  forbidden: (message?: string) => 
    new AppError('AUTHZ_FORBIDDEN', message || 'Permission denied', 403),
  
  notFound: (resource: string) => 
    new AppError('RESOURCE_NOT_FOUND', `${resource} not found`, 404),
  
  conflict: (message: string) => 
    new AppError('RESOURCE_ALREADY_EXISTS', message, 409),
  
  validation: (message: string, field?: string, details?: Record<string, unknown>) => 
    new AppError('VALIDATION_ERROR', message, 422, { field, ...details }),
  
  rateLimit: (retryAfter: number) => 
    new AppError('SYS_RATE_LIMIT', 'Rate limit exceeded', 429, { retryAfter }),
  
  internal: (message?: string) => 
    new AppError('SYS_INTERNAL_ERROR', message || 'Internal server error', 500),
};
```

### 9.2 Error Handler Middleware

```typescript
// src/lib/middleware/error-handler.ts

export async function withErrorHandler<T>(
  handler: () => Promise<T>,
  request: NextRequest
): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    const result = await handler();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Handle known errors
    if (error instanceof AppError) {
      logError(error, request, undefined, error.statusCode, duration);
      return createErrorResponse(
        error.code,
        error.statusCode,
        error.details,
        request
      );
    }
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const appError = new AppError(
        'VALIDATION_ERROR',
        'Validation failed',
        422,
        { fieldErrors: mapZodErrors(error) }
      );
      logError(appError, request, undefined, 422, duration);
      return createErrorResponse('VALIDATION_ERROR', 422, appError.details, request);
    }
    
    // Handle Prisma errors
    if (isPrismaError(error)) {
      const appError = mapPrismaError(error);
      logError(appError, request, undefined, appError.statusCode, duration);
      return createErrorResponse(
        appError.code,
        appError.statusCode,
        appError.details,
        request
      );
    }
    
    // Unknown errors - log full details
    logError(error, request, undefined, 500, duration);
    
    // Return generic error to client
    return createErrorResponse('SYS_INTERNAL_ERROR', 500, undefined, request);
  }
}
```

### 9.3 Route Handler Example

```typescript
// src/app/api/mobile/animals/route.ts

import { withErrorHandler } from '@/lib/middleware/error-handler';
import { mobileAuthMiddleware } from '@/lib/middleware/mobile-auth';
import { Errors } from '@/lib/error/app-error';

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const user = await mobileAuthMiddleware(request);
    
    const animals = await prisma.animalProfile.findMany({
      where: {
        customer: { userId: user.sub },
        active: true,
      },
    });
    
    return animals;
  }, request);
}

export async function POST(request: NextRequest) {
  return withErrorHandler(async () => {
    const user = await mobileAuthMiddleware(request);
    
    const body = await request.json();
    const validated = animalCreateSchema.parse(body);
    
    // Check customer profile exists
    const profile = await prisma.customerProfile.findUnique({
      where: { userId: user.sub },
    });
    
    if (!profile) {
      throw Errors.notFound('Customer profile');
    }
    
    const animal = await prisma.animalProfile.create({
      data: {
        ...validated,
        customerId: profile.id,
      },
    });
    
    return animal;
  }, request);
}
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | API Team | Initial release |

---

## Related Documents

| Document | Location |
|----------|----------|
| API Contract | `docs/api/API_CONTRACT_V1.md` |
| Auth Flow | `docs/api/AUTH_FLOW.md` |
| Master Rules | `docs/core/MASTER_SYSTEM_RULES.md` |

---

*End of ERROR_STANDARD.md*
