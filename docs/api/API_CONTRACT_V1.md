# API CONTRACT V1 — Prani Doctor

**Version:** 1.1.0  
**Last Updated:** 2026-05-21  
**Base URL:** `https://api.pranidoctor.com` (Production)  
**Protocol:** REST over HTTPS  
**Format:** JSON  
**API version:** `v1` (implicit on `/api/mobile/*` and `/api/admin/*`; see `API_VERSIONING.md`)

All JSON responses SHOULD include `X-API-Version: v1`.

---

## Table of Contents

1. [API Overview](#1-api-overview)
2. [Route Architecture](#2-route-architecture)
3. [Request/Response Standards](#3-requestresponse-standards)
4. [Pagination Standard](#4-pagination-standard)
5. [Filtering Standard](#5-filtering-standard)
6. [Search Standard](#6-search-standard)
7. [Mobile API Endpoints](#7-mobile-api-endpoints)
8. [Admin API Endpoints](#8-admin-api-endpoints)
9. [Public API Endpoints](#9-public-api-endpoints)
10. [Upload API](#10-upload-api)
11. [AI Service Endpoints](#11-ai-service-endpoints)
12. [Emergency Endpoints](#12-emergency-endpoints)
13. [Offline Sync Endpoints](#13-offline-sync-endpoints)
14. [Rate Limiting](#14-rate-limiting)
15. [OpenAPI/Swagger Integration](#15-openapiswagger-integration)

---

## 1. API Overview

### 1.1 Design Principles

| Principle | Implementation |
|-----------|----------------|
| **REST-first** | Resource-oriented URLs, HTTP verbs, status codes |
| **Mobile-optimized** | Minimal payloads, efficient pagination, offline support |
| **Secure by default** | HTTPS only, JWT auth, input validation |
| **Consistent** | Uniform response structure across all endpoints |
| **Versionable** | Path-based versioning ready |
| **GraphQL-ready** | Schema design supports future GraphQL layer |

### 1.2 HTTP Methods

| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| `GET` | Retrieve resources | Yes | Yes |
| `POST` | Create resources | No | No |
| `PUT` | Full update | Yes | No |
| `PATCH` | Partial update | Yes | No |
| `DELETE` | Remove resources | Yes | No |

### 1.3 Content Types

```
Request:  Content-Type: application/json
Response: Content-Type: application/json; charset=utf-8

File Upload: Content-Type: multipart/form-data
```

---

## 2. Route Architecture

### 2.1 URL Structure

```
Base Pattern: /api/{context}/{resource}/{id?}/{action?}

Contexts:
├── /api/admin/*      # Admin panel APIs (JWT cookie auth)
├── /api/mobile/*     # Mobile app APIs (JWT bearer auth)
├── /api/public/*     # Public APIs (rate-limited, no auth)
└── /api/health       # Health check endpoint
```

### 2.2 Route Naming Conventions

| Convention | Example | Usage |
|------------|---------|-------|
| Plural nouns | `/api/mobile/animals` | Collections |
| Kebab-case | `/api/mobile/service-requests` | Multi-word resources |
| Nested resources | `/api/mobile/animals/{id}/medical-records` | Child resources |
| Actions | `/api/mobile/auth/otp/request` | Non-CRUD operations |
| Query params | `/api/mobile/animals?status=active` | Filtering |

### 2.3 Current Route Map

```
/api/
├── health                          # Public health check
│
├── admin/
│   ├── auth/
│   │   ├── login                   # POST: Admin login
│   │   └── me                      # GET: Current admin info
│   ├── health                      # GET: Admin service health
│   ├── ai-technician-applications/
│   │   ├── [list]                  # GET: List applications
│   │   └── {id}/
│   │       ├── [single]            # GET/PATCH: Application details
│   │       └── transition          # POST: Status transition
│   ├── ai-technician-complaints/
│   │   ├── [list]                  # GET: List complaints
│   │   └── {id}/status             # PATCH: Update status
│   ├── service-instances/
│   │   ├── [list]                  # GET: List instances
│   │   └── {id}/
│   │       ├── [single]            # GET/PATCH: Instance details
│   │       ├── review              # POST: Admin review
│   │       ├── status              # PATCH: Status change
│   │       └── publish             # POST: Publish action
│   ├── semen-providers/
│   │   ├── [list]                  # GET/POST: Providers
│   │   └── {id}                    # GET/PATCH/DELETE: Provider
│   ├── semen-service-templates/
│   │   ├── [list]                  # GET/POST: Templates
│   │   └── {id}/
│   │       ├── [single]            # GET/PATCH/DELETE: Template
│   │       └── approve             # POST: Approve template
│   ├── livestock-breeds/
│   │   ├── [list]                  # GET/POST: Breeds
│   │   └── {id}                    # GET/PATCH/DELETE: Breed
│   ├── locations/
│   │   ├── stats                   # GET: Location statistics
│   │   ├── pending-verification    # GET: Unverified locations
│   │   ├── duplicates              # GET: Duplicate detection
│   │   ├── missing-coords          # GET: Missing coordinates
│   │   └── import-report           # GET: Import status
│   └── uploads/
│       ├── [list]                  # GET/POST: File management
│       └── {id}                    # GET/DELETE: Single file
│
├── mobile/
│   ├── auth/
│   │   ├── otp/
│   │   │   ├── request             # POST: Request OTP
│   │   │   └── verify              # POST: Verify OTP
│   │   ├── login                   # POST: Phone login
│   │   └── register                # POST: New registration
│   ├── me                          # GET/PATCH: Current user profile
│   ├── profile/
│   │   └── dashboard-context       # GET: Dashboard data
│   ├── providers/
│   │   ├── doctors/{id}            # GET: Doctor profile
│   │   └── technicians/{id}        # GET: Technician profile
│   ├── locations/
│   │   ├── divisions               # GET: All divisions
│   │   ├── districts               # GET: Districts by division
│   │   ├── upazilas                # GET: Upazilas by district
│   │   ├── unions                  # GET: Unions by upazila
│   │   ├── villages                # GET: Villages by union
│   │   └── search                  # GET: Search locations
│   ├── ai-technician/              # AI Technician role endpoints
│   │   ├── me                      # GET/PATCH: Technician profile
│   │   ├── apply                   # POST: Start application
│   │   ├── submit                  # POST: Submit for review
│   │   ├── dashboard               # GET: Dashboard stats
│   │   ├── settings                # GET/PATCH: Settings
│   │   ├── documents/
│   │   │   ├── [list]              # GET/POST: Documents
│   │   │   └── {id}                # GET/DELETE: Document
│   │   ├── service-areas/
│   │   │   ├── [list]              # GET/POST: Coverage areas
│   │   │   └── {id}                # DELETE: Remove area
│   │   ├── services/
│   │   │   ├── [list]              # GET/POST: Service listings
│   │   │   ├── from-template       # POST: Create from template
│   │   │   └── {id}/
│   │   │       ├── [single]        # GET/PATCH/DELETE: Service
│   │   │       └── semen-inventory/
│   │   │           ├── [list]      # GET/POST: Inventory
│   │   │           └── {lotId}     # PATCH/DELETE: Lot
│   │   ├── semen-templates/
│   │   │   ├── [list]              # GET: Available templates
│   │   │   └── {id}                # GET: Template details
│   │   ├── service-instances/
│   │   │   ├── [list]              # GET/POST: Worker instances
│   │   │   └── {id}/
│   │   │       ├── [single]        # GET/PATCH: Instance
│   │   │       └── submit          # POST: Submit for review
│   │   ├── requests/
│   │   │   ├── [list]              # GET: Incoming requests
│   │   │   └── {id}/
│   │   │       ├── [single]        # GET: Request details
│   │   │       ├── accept          # POST: Accept request
│   │   │       ├── decline         # POST: Decline request
│   │   │       ├── status          # PATCH: Update status
│   │   │       └── complete        # POST: Complete service
│   │   └── reviews                 # GET: Received reviews
│   ├── ai-services/                # Farmer-facing AI endpoints
│   │   ├── technicians/
│   │   │   ├── [list]              # GET: Search technicians
│   │   │   └── {id}                # GET: Technician details
│   │   └── requests/
│   │       ├── [list]              # POST: Create AI request
│   │       ├── me                  # GET: My requests
│   │       └── {id}/
│   │           ├── [single]        # GET: Request details
│   │           ├── record          # GET/POST: Service record
│   │           ├── review          # POST: Submit review
│   │           └── complaint       # POST: File complaint
│   └── uploads/
│       ├── [multipart]             # POST: Upload file
│       ├── profile-image           # POST: Profile photo
│       ├── cover-image             # POST: Cover photo
│       └── {id}                    # GET: Retrieve file
│
├── locations/                      # Shared location endpoints
│   ├── divisions                   # GET: All divisions
│   ├── districts                   # GET: Districts
│   ├── upazilas                    # GET: Upazilas
│   ├── unions                      # GET: Unions
│   ├── villages                    # GET: Villages
│   ├── search                      # GET: Search
│   └── tree                        # GET: Full hierarchy
│
└── public/                         # Future public endpoints
    └── (rate-limited, no auth)
```

---

## 3. Request/Response Standards

### 3.1 Standard Success Response

```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
    cursor?: string;
  };
}
```

**Example: Single Resource**
```json
{
  "success": true,
  "data": {
    "id": "clvx7abc1000008la5e6r9hkw",
    "displayName": "রহিম উদ্দিন",
    "phone": "01712345678",
    "status": "ACTIVE",
    "createdAt": "2026-05-21T10:30:00.000Z"
  }
}
```

**Example: Collection**
```json
{
  "success": true,
  "data": [
    { "id": "clvx7abc1...", "name": "..." },
    { "id": "clvx7abc2...", "name": "..." }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

### 3.2 Standard Error Response

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;        // Machine-readable code
    message: string;     // Human-readable message (Bengali preferred)
    details?: Record<string, unknown>;  // Additional context
    field?: string;      // For validation errors
  };
}
```

**Example: Validation Error**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ফোন নম্বর সঠিক নয়",
    "details": {
      "field": "phone",
      "expected": "01XXXXXXXXX format",
      "received": "12345"
    }
  }
}
```

### 3.3 HTTP Status Code Usage

| Code | Meaning | Usage |
|------|---------|-------|
| `200` | OK | Successful GET, PUT, PATCH |
| `201` | Created | Successful POST creating resource |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Invalid request body/params |
| `401` | Unauthorized | Missing/invalid authentication |
| `403` | Forbidden | Authenticated but not authorized |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource |
| `422` | Unprocessable | Semantic validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Error | Server error (logged, alert sent) |

### 3.4 Request Headers

**Required Headers:**
```http
Content-Type: application/json
Accept: application/json
```

**Authentication Headers:**
```http
# Mobile API
Authorization: Bearer <jwt_token>

# Admin API (alternative)
Cookie: admin-token=<jwt_token>
```

**Optional Headers:**
```http
Accept-Language: bn-BD      # Preferred language
X-Request-ID: <uuid>        # Correlation ID for tracing
X-Device-ID: <device_id>    # Mobile device identifier
X-App-Version: 1.2.3        # App version for compatibility
```

### 3.5 Response Headers

```http
Content-Type: application/json; charset=utf-8
X-Request-ID: <uuid>
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1621234567
```

---

## 4. Pagination Standard

### 4.1 Offset-Based Pagination (Default)

**Request:**
```http
GET /api/mobile/ai-technician/requests?page=2&pageSize=20
```

**Query Parameters:**
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `page` | integer | 1 | - | Page number (1-indexed) |
| `pageSize` | integer | 20 | 100 | Items per page |

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 150,
    "page": 2,
    "pageSize": 20,
    "hasMore": true,
    "totalPages": 8
  }
}
```

### 4.2 Cursor-Based Pagination (For Large Datasets)

**Request:**
```http
GET /api/mobile/notifications?cursor=eyJpZCI6ImNs...&limit=20
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `cursor` | string | null | Opaque cursor from previous response |
| `limit` | integer | 20 | Items to fetch |
| `direction` | string | "next" | "next" or "prev" |

**Response:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "hasMore": true,
    "nextCursor": "eyJpZCI6ImNs...",
    "prevCursor": "eyJpZCI6ImNr..."
  }
}
```

### 4.3 When to Use Which

| Scenario | Pagination Type |
|----------|-----------------|
| Small collections (<10K) | Offset |
| Displaying total count | Offset |
| Real-time/infinite scroll | Cursor |
| Large datasets (>100K) | Cursor |
| Notifications/feeds | Cursor |

---

## 5. Filtering Standard

### 5.1 Query Parameter Filters

**Simple Equality:**
```http
GET /api/mobile/requests?status=PENDING
GET /api/mobile/animals?category=LIVESTOCK&animalType=CATTLE
```

**Multiple Values (OR):**
```http
GET /api/mobile/requests?status=PENDING,ACCEPTED
```

**Range Filters:**
```http
GET /api/admin/billing?amount_gte=1000&amount_lte=5000
GET /api/mobile/requests?createdAt_gte=2026-01-01&createdAt_lte=2026-12-31
```

**Boolean Filters:**
```http
GET /api/mobile/technicians?isAvailable=true&acceptsEmergency=true
```

### 5.2 Filter Operators

| Operator | Suffix | Example | Meaning |
|----------|--------|---------|---------|
| Equals | (none) | `status=ACTIVE` | Exact match |
| Not equals | `_ne` | `status_ne=DELETED` | Not equal |
| Greater than | `_gt` | `amount_gt=100` | > value |
| Greater/equal | `_gte` | `amount_gte=100` | >= value |
| Less than | `_lt` | `amount_lt=1000` | < value |
| Less/equal | `_lte` | `amount_lte=1000` | <= value |
| Contains | `_contains` | `name_contains=রহিম` | Substring match |
| Starts with | `_startsWith` | `phone_startsWith=017` | Prefix match |
| In list | `_in` | `status_in=PENDING,ACTIVE` | One of values |
| Not in | `_notIn` | `status_notIn=DELETED` | Not one of |
| Is null | `_isNull` | `assignedDoctorId_isNull=true` | Null check |

### 5.3 Sorting

```http
GET /api/mobile/requests?sortBy=createdAt&sortOrder=desc
GET /api/mobile/technicians?sortBy=rating&sortOrder=desc
```

**Parameters:**
| Parameter | Values | Default |
|-----------|--------|---------|
| `sortBy` | Field name | varies by endpoint |
| `sortOrder` | `asc`, `desc` | `desc` for dates, `asc` for names |

**Multiple Sort (comma-separated):**
```http
GET /api/mobile/technicians?sortBy=rating,createdAt&sortOrder=desc,desc
```

---

## 6. Search Standard

### 6.1 Text Search

```http
GET /api/mobile/ai-services/technicians?q=রহিম&district=dhaka
```

**Parameters:**
| Parameter | Description |
|-----------|-------------|
| `q` | Search query (searches relevant fields) |
| `searchFields` | Optional: specific fields to search |

### 6.2 Location-Based Search

```http
GET /api/mobile/ai-services/technicians?district=dhaka&upazila=savar
GET /api/mobile/ai-services/technicians?lat=23.8103&lng=90.4125&radius=10
```

**Geographic Parameters:**
| Parameter | Description |
|-----------|-------------|
| `division` | Division slug or ID |
| `district` | District slug or ID |
| `upazila` | Upazila slug or ID |
| `union` | Union slug or ID |
| `village` | Village slug or ID |
| `lat` | Latitude for radius search |
| `lng` | Longitude for radius search |
| `radius` | Radius in kilometers (default: 10) |

### 6.3 Autocomplete

```http
GET /api/mobile/locations/search?q=ঢাকা&type=district&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "...", "name": "ঢাকা", "nameBn": "ঢাকা", "type": "DISTRICT" },
    { "id": "...", "name": "ঢাকা উত্তর", "nameBn": "ঢাকা উত্তর", "type": "UPAZILA" }
  ]
}
```

---

## 7. Mobile API Endpoints

### 7.1 Authentication Endpoints

#### OTP Policy (System Standard)

| Field | Value | Validation / Behavior |
|-------|-------|----------------------|
| `OTP_LENGTH` | `6` | Verify `code` must be exactly 6 numeric digits |
| Expiry | `300` s | Returned as `expiresIn` on request |
| Resend cooldown | `60` s | Returned as `resendAvailableIn` |
| Max verify attempts | `5` | Error `OTP_MAX_ATTEMPTS` |
| Max sends per hour | `5` | Error `OTP_RATE_LIMIT` |
| Masking | No OTP in JSON | Never include `code` in API responses |

See `docs/api/AUTH_FLOW.md` §3.0 for full policy.

#### POST /api/mobile/auth/otp/request
Request OTP for phone login.

**Request:**
```json
{
  "phone": "01712345678"
}
```

**Validation:** `phone` must match Bangladesh mobile `^01[3-9]\d{8}$`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "phone": "01712345678",
    "expiresIn": 300,
    "resendAvailableIn": 60,
    "otpLength": 6
  }
}
```

> `otpLength` is informational for clients; server always generates 6-digit codes.

#### POST /api/mobile/auth/otp/verify
Verify OTP and get tokens.

**Request:**
```json
{
  "phone": "01712345678",
  "code": "123456"
}
```

**Validation:**
- `phone`: `^01[3-9]\d{8}$`
- `code`: `.length(6)` and `^\d{6}$` (see `OTP_LENGTH=6`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800,
    "user": {
      "id": "clvx7abc1...",
      "phone": "01712345678",
      "role": "CUSTOMER",
      "profile": {
        "id": "clvx7xyz...",
        "displayName": "রহিম উদ্দিন"
      }
    }
  }
}
```

### 7.2 Profile Endpoints

#### GET /api/mobile/me
Get current user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clvx7abc1...",
    "email": "user@example.com",
    "phone": "01712345678",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "profile": {
      "id": "clvx7xyz...",
      "displayName": "রহিম উদ্দিন",
      "locale": "bn-BD",
      "profilePhotoUrl": "https://...",
      "addressJson": {...}
    }
  }
}
```

#### PATCH /api/mobile/me
Update current user profile.

**Request:**
```json
{
  "displayName": "রহিম উদ্দিন (আপডেট)",
  "addressJson": {
    "district": "ঢাকা",
    "upazila": "সাভার"
  }
}
```

### 7.3 Animal Endpoints (Customer)

#### GET /api/mobile/animals
List customer's animals.

**Query Parameters:**
- `category`: LIVESTOCK, PET, OTHER
- `animalType`: CATTLE, GOAT, POULTRY, etc.
- `active`: true/false

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clvx7abc...",
      "name": "শ্যামলী",
      "species": "Cow",
      "breed": "Shahiwal",
      "category": "LIVESTOCK",
      "animalType": "CATTLE",
      "gender": "FEMALE",
      "dateOfBirth": "2023-06-15",
      "weightKg": "350.5",
      "pregnancyStatus": "NOT_PREGNANT",
      "photoUrl": "https://...",
      "active": true
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}
```

#### POST /api/mobile/animals
Create new animal profile.

**Request:**
```json
{
  "name": "শ্যামলী",
  "species": "Cow",
  "breed": "Shahiwal",
  "category": "LIVESTOCK",
  "animalType": "CATTLE",
  "gender": "FEMALE",
  "dateOfBirth": "2023-06-15",
  "weightKg": 350.5
}
```

### 7.4 Service Request Endpoints (Customer)

#### POST /api/mobile/requests
Create service request.

**Request:**
```json
{
  "animalId": "clvx7abc...",
  "serviceCategoryId": "clvx7cat...",
  "serviceType": "DOCTOR_HOME_VISIT",
  "villageId": "clvx7vil...",
  "problemOrSymptom": "গরু খাচ্ছে না, জ্বর আছে",
  "description": "২ দিন ধরে এই অবস্থা",
  "preferredTime": "সকাল ১০টা",
  "isEmergency": false,
  "locationText": "বাড়ি নং ১২৩, গ্রাম রোড"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clvx7req...",
    "status": "PENDING",
    "submittedAt": "2026-05-21T10:30:00.000Z",
    "estimatedFee": "500.00"
  }
}
```

---

## 8. Admin API Endpoints

### 8.1 Authentication

#### POST /api/admin/auth/login
Admin login with email/password.

**Request:**
```json
{
  "email": "admin@pranidoctor.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clvx7adm...",
      "email": "admin@pranidoctor.com",
      "role": "ADMIN",
      "profile": {
        "displayName": "System Admin"
      }
    }
  }
}
```

**Note:** Token is set as HttpOnly cookie `admin-token`.

#### GET /api/admin/auth/me
Get current admin user.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clvx7adm...",
    "email": "admin@pranidoctor.com",
    "role": "ADMIN",
    "status": "ACTIVE"
  }
}
```

### 8.2 AI Technician Application Management

#### GET /api/admin/ai-technician-applications
List applications with filters.

**Query Parameters:**
- `status`: DRAFT, SUBMITTED, UNDER_REVIEW, NEEDS_CORRECTION, APPROVED, REJECTED
- `district`: District name or ID
- `page`, `pageSize`

#### POST /api/admin/ai-technician-applications/{id}/transition
Change application status.

**Request:**
```json
{
  "toStatus": "APPROVED",
  "note": "All documents verified successfully",
  "correctionNote": null
}
```

### 8.3 Service Instance Management

#### GET /api/admin/service-instances
List service instances for review.

**Query Parameters:**
- `status`: DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, PUBLISHED, REJECTED
- `technicianId`: Filter by technician
- `templateId`: Filter by template

#### POST /api/admin/service-instances/{id}/review
Submit review for instance.

**Request:**
```json
{
  "decision": "APPROVE",
  "body": "Listing meets all requirements",
  "visibility": "WORKER_VISIBLE"
}
```

#### POST /api/admin/service-instances/{id}/publish
Publish approved instance.

**Request:**
```json
{
  "action": "PUBLISH"
}
```

---

## 9. Public API Endpoints

### 9.1 Health Check

#### GET /api/health
Basic health check.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-05-21T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

#### GET /api/admin/health
Admin service health (includes DB check).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "redis": "connected",
    "timestamp": "2026-05-21T10:30:00.000Z"
  }
}
```

### 9.2 Location Endpoints (Public/Cached)

#### GET /api/locations/divisions
Get all divisions.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clvx7div1...",
      "name": "Dhaka",
      "nameBn": "ঢাকা",
      "slug": "dhaka",
      "sortOrder": 1
    },
    ...
  ]
}
```

#### GET /api/locations/tree
Get full location hierarchy.

**Query Parameters:**
- `maxDepth`: 1-5 (default: 3)
- `divisionId`: Start from specific division

---

## 10. Upload API

### 10.0 Upload Naming Standard

| Layer | Convention |
|-------|------------|
| Mobile route | `POST /api/mobile/uploads`, `POST /api/mobile/uploads/{id}/complete` |
| Admin route | `POST /api/admin/uploads` (same envelope) |
| Prisma model | `UploadedFile` |
| Object key | `uploads/{context}/{yyyy}/{mm}/{fileId}.{ext}` |
| Context | `farmer`, `doctor`, `ai-tech`, `admin` (maps from `purpose`) |
| Bucket | `pranidoctor-uploads` (MinIO dev / S3 prod) |
| Errors | `UPLOAD_*` codes in `ERROR_STANDARD.md` §3.7 |

### 10.1 Presigned URL Upload Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UPLOAD FLOW                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Client                    2. Server                    3. S3/Storage    │
│  ────────                     ─────────                    ──────────────   │
│                                                                              │
│  POST /api/mobile/uploads                                                    │
│  { purpose, mimeType }  ────▶  Generate presigned URL                       │
│                                Create UploadedFile record                   │
│                         ◀────  { id, uploadUrl, storageKey }                │
│                                                                              │
│  PUT {uploadUrl}                                                             │
│  [file bytes]           ─────────────────────────────────▶ Store file       │
│                                                                              │
│  POST /api/mobile/uploads/{id}/complete                                      │
│  { }                    ────▶  Verify upload                                │
│                                Update record status                         │
│                         ◀────  { file metadata }                            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Direct Multipart Upload

#### POST /api/mobile/uploads
Upload file directly.

**Request (multipart/form-data):**
```
Content-Type: multipart/form-data

file: [binary data]
purpose: AI_TECHNICIAN_NID_FRONT
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clvx7upl...",
    "storageKey": "uploads/ai-tech/2026/05/abc123.jpg",
    "originalName": "nid_front.jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": 245678,
    "publicUrl": "https://cdn.pranidoctor.com/uploads/..."
  }
}
```

### 10.3 Upload Purpose Types

| Purpose | Max Size | Allowed Types | Description |
|---------|----------|---------------|-------------|
| `AI_TECHNICIAN_NID_FRONT` | 5MB | image/* | NID front side |
| `AI_TECHNICIAN_NID_BACK` | 5MB | image/* | NID back side |
| `AI_TECHNICIAN_PROFILE_PHOTO` | 5MB | image/* | Profile photo |
| `AI_TECHNICIAN_COVER_IMAGE` | 10MB | image/* | Cover banner |
| `AI_TECHNICIAN_TRAINING_CERTIFICATE` | 10MB | image/*, application/pdf | Training cert |
| `CUSTOMER_PROFILE_PHOTO` | 5MB | image/* | Customer avatar |
| `CUSTOMER_COVER_IMAGE` | 10MB | image/* | Customer cover |
| `AI_SERVICE_INSTANCE_COVER` | 10MB | image/* | Listing cover |
| `AI_SERVICE_INSTANCE_GALLERY` | 10MB | image/* | Listing gallery |
| `AI_SERVICE_INSTANCE_VIDEO` | 100MB | video/* | Listing video |
| `AI_SERVICE_INSTANCE_DOCUMENT` | 20MB | application/pdf | Supporting doc |

### 10.4 Image Processing

Images are automatically processed:
- Resized to max dimensions (2048x2048 for general, 512x512 for avatars)
- Converted to WebP format (with JPEG fallback)
- Thumbnails generated (150x150, 300x300)
- EXIF data stripped
- Orientation corrected

---

## 11. AI Service Endpoints

### 11.1 Search Technicians

#### GET /api/mobile/ai-services/technicians
Search available AI technicians.

**Query Parameters:**
- `district`: Filter by district
- `upazila`: Filter by upazila
- `animalType`: CATTLE, GOAT, etc.
- `isAvailable`: true/false
- `acceptsEmergency`: true/false
- `q`: Search query
- `sortBy`: rating, distance, price
- `page`, `pageSize`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clvx7tech...",
      "userId": "clvx7user...",
      "displayName": "করিম উদ্দিন",
      "profilePhotoUrl": "https://...",
      "rating": 4.8,
      "totalReviews": 156,
      "experienceYears": 5,
      "serviceFeeBdt": "500.00",
      "acceptsEmergency": true,
      "isAvailable": true,
      "coverageAreas": ["সাভার", "ধামরাই"],
      "services": [
        {
          "id": "clvx7svc...",
          "title": "কৃত্রিম প্রজনন সেবা",
          "animalType": "CATTLE",
          "basePrice": "500.00"
        }
      ]
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "pageSize": 20
  }
}
```

### 11.2 Create AI Service Request

#### POST /api/mobile/ai-services/requests
Create new AI service booking.

**Request:**
```json
{
  "technicianProfileId": "clvx7tech...",
  "serviceId": "clvx7svc...",
  "animalType": "CATTLE",
  "breed": "Shahiwal",
  "animalAge": "৩ বছর",
  "lastHeatDate": "2026-05-15",
  "heatSymptoms": "স্বাভাবিক হিট লক্ষণ দেখা যাচ্ছে",
  "previousAiHistory": "আগে ১ বার সার্ভিস নিয়েছি",
  "healthIssueNote": null,
  "district": "ঢাকা",
  "upazila": "সাভার",
  "unionOrArea": "বিরুলিয়া",
  "addressDetail": "বাড়ি নং ১২৩",
  "preferredTime": "সকাল ৮-১০টা",
  "isEmergency": false
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clvx7req...",
    "status": "PENDING",
    "estimatedFee": "550.00",
    "technician": {
      "displayName": "করিম উদ্দিন",
      "phone": "01712345678"
    },
    "createdAt": "2026-05-21T10:30:00.000Z"
  }
}
```

### 11.3 AI Technician Request Actions

#### POST /api/mobile/ai-technician/requests/{id}/accept
Accept incoming request.

**Request:**
```json
{
  "estimatedArrivalTime": "2026-05-21T14:00:00.000Z",
  "note": "১ ঘণ্টার মধ্যে পৌঁছাব"
}
```

#### POST /api/mobile/ai-technician/requests/{id}/complete
Complete service and submit record.

**Request:**
```json
{
  "serviceDate": "2026-05-21",
  "breedOrSemenType": "Shahiwal Cross",
  "semenBatch": "BRAC-2026-0521",
  "heatObservation": "স্বাভাবিক হিট",
  "inseminationTime": "2026-05-21T14:30:00.000Z",
  "serviceNote": "সফলভাবে সার্ভিস সম্পন্ন",
  "nextFollowUpDate": "2026-06-21",
  "pregnancyCheckDate": "2026-07-21",
  "totalFee": "550.00"
}
```

---

## 12. Emergency Endpoints

### 12.1 Emergency Service Request

#### POST /api/mobile/requests/emergency
Create emergency service request (bypasses normal queue).

**Request:**
```json
{
  "animalId": "clvx7ani...",
  "serviceCategoryId": "clvx7cat...",
  "serviceType": "EMERGENCY_DOCTOR",
  "villageId": "clvx7vil...",
  "problemOrSymptom": "গরু হঠাৎ পড়ে গেছে, শ্বাসকষ্ট হচ্ছে",
  "emergencyNotes": "জরুরি ভিত্তিতে সাহায্য প্রয়োজন",
  "locationText": "বাড়ি নং ১২৩",
  "contactPhone": "01712345678"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clvx7emrg...",
    "status": "PENDING",
    "isEmergency": true,
    "urgency": "CRITICAL",
    "estimatedResponseTime": "30 মিনিট",
    "assignedProviders": [
      {
        "type": "DOCTOR",
        "displayName": "ডাঃ রহমান",
        "phone": "01812345678",
        "eta": "25 মিনিট"
      }
    ],
    "submittedAt": "2026-05-21T10:30:00.000Z"
  }
}
```

### 12.2 Emergency Response Flow

```
EMERGENCY REQUEST FLOW:
────────────────────────

1. Request submitted with isEmergency=true
   └─▶ Auto-elevated to CRITICAL urgency
   
2. System broadcasts to all available providers in area
   └─▶ SMS notification to nearby doctors/technicians
   └─▶ Push notification to app
   
3. First responder accepts
   └─▶ Customer notified with ETA
   └─▶ Other notifications cancelled
   
4. If no response in 10 minutes
   └─▶ Expand search radius
   └─▶ Escalate to admin dashboard
   └─▶ Admin can manually assign
```

### 12.3 Emergency Status Updates

#### PATCH /api/mobile/requests/{id}/emergency-status
Update emergency request status.

**Request:**
```json
{
  "status": "ON_THE_WAY",
  "eta": "15 মিনিট",
  "currentLocation": {
    "lat": 23.8103,
    "lng": 90.4125
  }
}
```

---

## 13. Offline Sync Endpoints

### 13.1 Sync Architecture

```
OFFLINE SYNC FLOW:
──────────────────

Mobile App                          Server
──────────                          ──────

1. Queue operations locally
   (Create, Update, Delete)
   
2. Network available
   └─▶ POST /api/mobile/sync
       Send pending operations  ─────▶  Process operations
                                        Detect conflicts
                                        Apply changes
                                ◀─────  Return results

3. Handle response
   └─▶ Update local IDs
   └─▶ Resolve conflicts
   └─▶ Clear synced operations
```

### 13.2 Sync Endpoint

#### POST /api/mobile/sync
Sync offline operations.

**Request:**
```json
{
  "deviceId": "device-uuid-123",
  "lastSyncVersion": "v1234567890",
  "operations": [
    {
      "localId": "local-123",
      "operationType": "CREATE",
      "entityType": "AnimalProfile",
      "payload": {
        "name": "শ্যামলী",
        "species": "Cow",
        "breed": "Shahiwal"
      },
      "clientCreatedAt": "2026-05-21T10:30:00.000Z"
    },
    {
      "localId": "local-456",
      "operationType": "UPDATE",
      "entityType": "AnimalProfile",
      "entityId": "clvx7abc...",
      "payload": {
        "weightKg": 360.5
      },
      "clientCreatedAt": "2026-05-21T10:35:00.000Z"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "syncVersion": "v1234567899",
    "processedAt": "2026-05-21T10:40:00.000Z",
    "results": [
      {
        "localId": "local-123",
        "status": "COMPLETED",
        "serverEntityId": "clvx7new...",
        "serverVersion": 1
      },
      {
        "localId": "local-456",
        "status": "CONFLICT",
        "conflictType": "VERSION",
        "serverVersion": {
          "weightKg": 355.0,
          "updatedAt": "2026-05-21T10:32:00.000Z"
        },
        "resolution": "SERVER_WINS"
      }
    ],
    "serverChanges": [
      {
        "entityType": "Notification",
        "changeType": "CREATE",
        "data": {...}
      }
    ]
  }
}
```

### 13.3 Delta Sync

#### GET /api/mobile/sync/delta
Get changes since last sync.

**Query Parameters:**
- `since`: ISO timestamp or sync version
- `entityTypes`: Comma-separated entity types

**Response (200):**
```json
{
  "success": true,
  "data": {
    "syncVersion": "v1234567899",
    "changes": [
      {
        "entityType": "ServiceRequest",
        "entityId": "clvx7req...",
        "changeType": "UPDATE",
        "changedFields": ["status", "assignedAt"],
        "data": {
          "id": "clvx7req...",
          "status": "ASSIGNED",
          "assignedAt": "2026-05-21T11:00:00.000Z"
        }
      }
    ],
    "deletions": [
      {
        "entityType": "Notification",
        "entityId": "clvx7not..."
      }
    ]
  }
}
```

---

## 14. Rate Limiting

### 14.1 Rate Limit Tiers

| Tier | Context | Limit | Window |
|------|---------|-------|--------|
| **Public** | Unauthenticated | 60 req | 1 minute |
| **Authenticated** | Mobile users | 300 req | 1 minute |
| **Provider** | Doctors/Technicians | 500 req | 1 minute |
| **Admin** | Admin panel | 1000 req | 1 minute |

### 14.2 Endpoint-Specific Limits

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `POST /auth/otp/request` | 5 | 1 hour | Per phone number |
| `POST /auth/otp/verify` | 10 | 10 min | Per phone number |
| `POST /uploads` | 20 | 1 hour | Per user |
| `POST /requests` | 10 | 1 hour | Per customer |
| `GET /locations/*` | 100 | 1 min | Cached responses |

### 14.3 Rate Limit Headers

```http
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 295
X-RateLimit-Reset: 1621234567
Retry-After: 45
```

### 14.4 Rate Limit Response (429)

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন",
    "details": {
      "limit": 300,
      "remaining": 0,
      "resetAt": "2026-05-21T10:31:00.000Z",
      "retryAfter": 45
    }
  }
}
```

---

## 15. OpenAPI/Swagger Integration

### 15.1 OpenAPI Specification Location

```
/api/docs           # Swagger UI (development only)
/api/openapi.json   # OpenAPI 3.0 spec
/api/openapi.yaml   # OpenAPI 3.0 spec (YAML)
```

### 15.2 OpenAPI Base Structure

```yaml
openapi: "3.0.3"
info:
  title: "Prani Doctor API"
  version: "1.0.0"
  description: "Veterinary service platform API for Bangladesh"
  contact:
    email: "api@pranidoctor.com"
  license:
    name: "Proprietary"

servers:
  - url: "https://api.pranidoctor.com"
    description: "Production"
  - url: "https://staging-api.pranidoctor.com"
    description: "Staging"
  - url: "http://localhost:3000"
    description: "Development"

tags:
  - name: "auth"
    description: "Authentication endpoints"
  - name: "mobile"
    description: "Mobile app endpoints"
  - name: "admin"
    description: "Admin panel endpoints"
  - name: "ai-services"
    description: "AI technician service endpoints"

security:
  - bearerAuth: []
  - cookieAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: "http"
      scheme: "bearer"
      bearerFormat: "JWT"
    cookieAuth:
      type: "apiKey"
      in: "cookie"
      name: "admin-token"
```

### 15.3 GraphQL Readiness

The REST API is designed with GraphQL migration in mind:

| REST Pattern | GraphQL Equivalent |
|--------------|-------------------|
| Nested includes | Field selection |
| `?fields=id,name` | Explicit fields in query |
| Pagination meta | Connection edges |
| Error codes | Custom error extensions |

**Future GraphQL Endpoint:**
```
POST /api/graphql
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
| Auth Flow | `docs/api/AUTH_FLOW.md` |
| Error Standards | `docs/api/ERROR_STANDARD.md` |
| API Versioning | `docs/api/API_VERSIONING.md` |
| Database ERD | `docs/database/ERD.md` |

---

*End of API_CONTRACT_V1.md*
