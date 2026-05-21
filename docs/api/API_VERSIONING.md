# API VERSIONING — Prani Doctor

**Version:** 1.0.0  
**Last Updated:** 2026-05-21  
**Scope:** Version strategy, deprecation policy, migration, changelog

---

## Table of Contents

1. [Versioning Strategy](#1-versioning-strategy)
2. [Version Indicators](#2-version-indicators)
3. [Breaking vs Non-Breaking Changes](#3-breaking-vs-non-breaking-changes)
4. [Deprecation Policy](#4-deprecation-policy)
5. [Version Migration](#5-version-migration)
6. [Client Compatibility](#6-client-compatibility)
7. [Changelog Management](#7-changelog-management)
8. [GraphQL Readiness](#8-graphql-readiness)
9. [Implementation Guide](#9-implementation-guide)

---

## 1. Versioning Strategy

### 1.1 Strategy Selection

| Strategy | Description | Chosen |
|----------|-------------|--------|
| **URL Path** | `/api/v1/resource` | ✓ (Primary) |
| Query Parameter | `/api/resource?version=1` | ✗ |
| Header | `Accept-Version: v1` | ✓ (Fallback) |
| Content Type | `Accept: application/vnd.pranidoctor.v1+json` | ✗ |

### 1.2 Current Versioning State

```
CURRENT STATE (MVP):
────────────────────

/api/mobile/*  → v1 implicit (no version in path) — contract: API_CONTRACT_V1.md
/api/admin/*   → v1 implicit (no version in path)
/api/public/*  → v1 implicit (no version in path)

Response header on all JSON: X-API-Version: v1

FUTURE STATE (When v2 needed):
──────────────────────────────

/api/v1/mobile/*  → v1 explicit
/api/v2/mobile/*  → v2 endpoints
/api/mobile/*     → Redirects to latest stable (v1)
```

### 1.3 Version Numbering

```
Format: v{MAJOR}

Examples:
  v1 - Initial API version
  v2 - First breaking change version
  v3 - Second breaking change version

Semantic Versioning for API:
  MAJOR: Breaking changes (new URL version)
  MINOR: Additive changes (no new version)
  PATCH: Bug fixes (no new version)
```

### 1.4 Version Lifecycle

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         VERSION LIFECYCLE                                      │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌─────────────┐                                                             │
│   │   ALPHA     │  Internal testing only                                      │
│   │  (v2-alpha) │  Not available to clients                                   │
│   └──────┬──────┘                                                             │
│          │                                                                     │
│          ▼                                                                     │
│   ┌─────────────┐                                                             │
│   │    BETA     │  Early access for partners                                  │
│   │  (v2-beta)  │  Breaking changes still possible                            │
│   └──────┬──────┘                                                             │
│          │                                                                     │
│          ▼                                                                     │
│   ┌─────────────┐                                                             │
│   │   STABLE    │  Production ready                                           │
│   │    (v2)     │  No breaking changes                                        │
│   └──────┬──────┘                                                             │
│          │                                                                     │
│          │  (When v3 becomes stable)                                          │
│          ▼                                                                     │
│   ┌─────────────┐                                                             │
│   │ DEPRECATED  │  Still supported, migration encouraged                      │
│   │    (v2)     │  12-month support window                                    │
│   └──────┬──────┘                                                             │
│          │                                                                     │
│          │  (After deprecation period)                                        │
│          ▼                                                                     │
│   ┌─────────────┐                                                             │
│   │   SUNSET    │  Removed from production                                    │
│   │    (v2)     │  Returns 410 Gone                                           │
│   └─────────────┘                                                             │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Version Indicators

### 2.1 Response Headers

All API responses include version information:

```http
HTTP/1.1 200 OK
X-API-Version: v1
X-API-Deprecation: sunset=2027-06-01  # If deprecated
Deprecation: @1717200000             # Unix timestamp (RFC 8594)
Link: </api/v2/resource>; rel="successor-version"
```

### 2.2 Response Body Version Info

Optional version metadata in response:

```json
{
  "success": true,
  "data": {...},
  "meta": {
    "apiVersion": "v1",
    "deprecationNotice": null  // Or deprecation message if applicable
  }
}
```

### 2.3 Client Version Headers

Clients can specify preferred version:

```http
# Primary method: URL path
GET /api/v1/mobile/animals

# Fallback method: Header
GET /api/mobile/animals
Accept-Version: v1
```

---

## 3. Breaking vs Non-Breaking Changes

### 3.1 Breaking Changes (Require New Version)

| Change Type | Example | Version Impact |
|-------------|---------|----------------|
| Remove endpoint | DELETE `/api/mobile/legacy-endpoint` | v2 |
| Remove field | Remove `oldField` from response | v2 |
| Rename field | `name` → `displayName` | v2 |
| Change field type | `id: number` → `id: string` | v2 |
| Change response structure | Wrap in `data` | v2 |
| Remove enum value | Remove `LEGACY_STATUS` | v2 |
| Change validation rules | Make optional → required | v2 |
| Change auth mechanism | Cookie → Bearer | v2 |
| Change error format | New error structure | v2 |

### 3.2 Non-Breaking Changes (No Version Bump)

| Change Type | Example | Version Impact |
|-------------|---------|----------------|
| Add endpoint | Add `/api/mobile/new-feature` | None |
| Add optional field | Add `newField?: string` | None |
| Add enum value | Add `NEW_STATUS` to enum | None |
| Add query parameter | Add `?newFilter=value` | None |
| Loosen validation | Required → optional | None |
| Performance improvements | Faster response | None |
| Bug fixes | Fix incorrect data | None |
| Add new error code | Add `NEW_ERROR_CODE` | None |

### 3.3 Gray Area Changes

| Change | Decision | Reasoning |
|--------|----------|-----------|
| Change field default | Case-by-case | May affect client logic |
| Add required field to create | Breaking | Existing clients will fail |
| Change pagination defaults | Non-breaking | Document clearly |
| Null → empty array | Breaking | Type changes |
| Empty string → null | Breaking | Type changes |

### 3.4 Change Decision Flow

```
Is this change...

1. Removing something?
   └─▶ YES → BREAKING → New version

2. Changing the type of something?
   └─▶ YES → BREAKING → New version

3. Making something required that was optional?
   └─▶ YES (request field) → BREAKING → New version
   └─▶ NO (response field) → Non-breaking

4. Adding something new?
   └─▶ Request field (required) → BREAKING
   └─▶ Request field (optional) → Non-breaking
   └─▶ Response field → Non-breaking
   └─▶ Endpoint → Non-breaking

5. Changing behavior?
   └─▶ Error where success before → BREAKING
   └─▶ Success where error before → Usually non-breaking
```

---

## 4. Deprecation Policy

### 4.1 Deprecation Timeline

```
DEPRECATION TIMELINE:
─────────────────────

T-0:   Deprecation announced
       - Deprecation headers added
       - Documentation updated
       - Changelog entry
       - Client notification

T+3mo: First reminder
       - In-app notification
       - Email to active users

T+6mo: Second reminder
       - Warning log entries
       - Dashboard alert

T+9mo: Final warning
       - Response includes warning
       - Aggressive notification

T+12mo: SUNSET
        - Endpoint returns 410 Gone
        - Redirect to v2 if possible
```

### 4.2 Deprecation Notice Format

**Response Header:**
```http
Deprecation: @1717200000
Sunset: Sat, 01 Jun 2027 00:00:00 GMT
Link: </api/v2/mobile/animals>; rel="successor-version"
X-Deprecation-Notice: This endpoint will be removed on 2027-06-01. Use /api/v2/mobile/animals instead.
```

**Response Body (Optional):**
```json
{
  "success": true,
  "data": {...},
  "meta": {
    "deprecation": {
      "notice": "This endpoint is deprecated",
      "sunsetDate": "2027-06-01",
      "successor": "/api/v2/mobile/animals",
      "migrationGuide": "https://docs.pranidoctor.com/api/migration/v1-to-v2"
    }
  }
}
```

### 4.3 Sunset Response

After deprecation period ends:

```http
HTTP/1.1 410 Gone

{
  "success": false,
  "error": {
    "code": "API_VERSION_SUNSET",
    "message": "This API version is no longer available",
    "details": {
      "sunsetDate": "2027-06-01",
      "successor": "/api/v2/mobile/animals",
      "migrationGuide": "https://docs.pranidoctor.com/api/migration/v1-to-v2"
    }
  }
}
```

---

## 5. Version Migration

### 5.1 Migration Guide Structure

```markdown
# Migration Guide: v1 → v2

## Overview
Summary of breaking changes and migration timeline.

## Breaking Changes

### 1. Authentication
**v1:** Cookie-based session
**v2:** Bearer token in Authorization header

**Migration:**
```typescript
// v1
fetch('/api/v1/mobile/me', { credentials: 'include' })

// v2
fetch('/api/v2/mobile/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### 2. Response Structure
**v1:** Data at root level
**v2:** Data wrapped in `data` field

**Migration:**
```typescript
// v1
const animals = response.animals;

// v2
const animals = response.data.animals;
```

## Field Mapping

| v1 Field | v2 Field | Type Change |
|----------|----------|-------------|
| `name` | `displayName` | Same |
| `created_at` | `createdAt` | Same |
| `phone_number` | `phone` | Same |
```

### 5.2 Dual-Version Support Period

During migration, both versions are available:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    DUAL-VERSION SUPPORT                                        │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   Request                      Server                        Response         │
│   ───────                      ──────                        ────────         │
│                                                                                │
│   GET /api/v1/animals    ────▶ Route to v1 handler    ────▶ v1 format        │
│                                                                                │
│   GET /api/v2/animals    ────▶ Route to v2 handler    ────▶ v2 format        │
│                                                                                │
│   GET /api/animals       ────▶ Route to latest (v1)   ────▶ v1 format        │
│   (no version)                 + Deprecation warning                          │
│                                                                                │
│   Database Layer:                                                             │
│   Both handlers can share the same Prisma client and business logic.         │
│   Only the request/response transformation differs.                           │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Version Adapter Pattern

```typescript
// src/lib/versioning/adapter.ts

interface VersionAdapter<TRequest, TResponse> {
  version: string;
  transformRequest(input: unknown): TRequest;
  transformResponse(output: TResponse): unknown;
}

// v1 adapter
const v1AnimalAdapter: VersionAdapter<AnimalInput, Animal> = {
  version: 'v1',
  transformRequest(input: unknown) {
    const v1Input = input as V1AnimalInput;
    return {
      ...v1Input,
      displayName: v1Input.name, // v1 uses 'name'
    };
  },
  transformResponse(animal: Animal) {
    return {
      ...animal,
      name: animal.displayName, // v1 expects 'name'
      created_at: animal.createdAt, // v1 uses snake_case
    };
  },
};

// v2 adapter (passthrough)
const v2AnimalAdapter: VersionAdapter<AnimalInput, Animal> = {
  version: 'v2',
  transformRequest: (input) => input as AnimalInput,
  transformResponse: (animal) => animal,
};
```

---

## 6. Client Compatibility

### 6.1 Mobile App Version Matrix

| App Version | Minimum API | Recommended API |
|-------------|-------------|-----------------|
| 1.0.0 - 1.5.x | v1 | v1 |
| 2.0.0 - 2.5.x | v1 | v2 |
| 3.0.0+ | v2 | v2 |

### 6.2 Client Version Header

Clients should send their version:

```http
GET /api/mobile/animals
X-App-Version: 2.1.0
X-Platform: android
X-Device-ID: device-uuid-123
```

### 6.3 Version Negotiation

```typescript
// Server can adjust response based on client version
async function handleRequest(request: NextRequest) {
  const appVersion = request.headers.get('X-App-Version');
  const apiVersion = detectApiVersion(request);
  
  // Check compatibility
  if (!isCompatible(appVersion, apiVersion)) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'CLIENT_VERSION_INCOMPATIBLE',
        message: 'Please update your app',
        details: {
          minimumAppVersion: '2.0.0',
          currentAppVersion: appVersion,
          downloadUrl: 'https://play.google.com/store/apps/...'
        }
      }
    }, { status: 426 }); // Upgrade Required
  }
  
  // Process request with appropriate version
  return processWithVersion(request, apiVersion);
}
```

### 6.4 Force Update Mechanism

```json
// Response when client is too old
{
  "success": false,
  "error": {
    "code": "FORCE_UPDATE_REQUIRED",
    "message": "আপনার অ্যাপ আপডেট করুন",
    "details": {
      "minimumVersion": "2.0.0",
      "currentVersion": "1.0.0",
      "updateUrl": "https://play.google.com/store/apps/details?id=com.pranidoctor",
      "updateRequired": true,
      "updateMessage": "নতুন ফিচার এবং বাগ ফিক্স পেতে অ্যাপ আপডেট করুন"
    }
  }
}
```

---

## 7. Changelog Management

### 7.1 Changelog Format

```markdown
# API Changelog

## [Unreleased]
### Added
- New endpoint: `POST /api/mobile/voice-requests`

### Changed
- Increased rate limit for authenticated users to 500/min

### Deprecated
- `GET /api/mobile/legacy-search` (use `/api/mobile/search` instead)

### Fixed
- Fixed pagination cursor for large result sets

---

## [v1.5.0] - 2026-06-15
### Added
- Emergency service endpoints
- AI service request flow

### Changed
- Response pagination now includes `hasMore` field

---

## [v1.0.0] - 2026-05-01
### Added
- Initial API release
- Authentication endpoints
- Mobile customer endpoints
- Admin panel endpoints
```

### 7.2 Changelog API Endpoint

```http
GET /api/public/changelog

{
  "success": true,
  "data": {
    "currentVersion": "v1",
    "latestRelease": "1.5.0",
    "entries": [
      {
        "version": "1.5.0",
        "date": "2026-06-15",
        "changes": {
          "added": ["Emergency endpoints", "AI service flow"],
          "changed": ["Pagination includes hasMore"],
          "deprecated": [],
          "fixed": []
        }
      }
    ]
  }
}
```

### 7.3 Change Notification

Clients can subscribe to API changes:

```http
POST /api/public/changelog/subscribe
{
  "email": "developer@client.com",
  "webhookUrl": "https://client.com/api-updates",
  "notifyOn": ["breaking", "deprecation", "major"]
}
```

---

## 8. GraphQL Readiness

### 8.1 REST to GraphQL Migration Path

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    REST → GRAPHQL MIGRATION PATH                               │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   PHASE 1: Current (REST Only)                                                │
│   ────────────────────────────                                                │
│   /api/mobile/*  → REST endpoints                                             │
│   /api/admin/*   → REST endpoints                                             │
│                                                                                │
│   PHASE 2: GraphQL Introduction                                               │
│   ─────────────────────────────                                               │
│   /api/mobile/*  → REST endpoints (maintained)                                │
│   /api/graphql   → GraphQL endpoint (new)                                     │
│                                                                                │
│   Both share same:                                                            │
│   - Business logic (services)                                                 │
│   - Data layer (Prisma)                                                       │
│   - Authentication                                                            │
│                                                                                │
│   PHASE 3: GraphQL Primary                                                    │
│   ────────────────────────                                                    │
│   /api/graphql   → Primary endpoint                                           │
│   /api/v1/*      → Deprecated REST (for backward compat)                      │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Schema Design for GraphQL

Current REST design supports future GraphQL:

```graphql
# Future GraphQL schema based on current REST

type Query {
  # Mirrors GET endpoints
  me: User!
  animal(id: ID!): Animal
  animals(filter: AnimalFilter, pagination: Pagination): AnimalConnection!
  serviceRequest(id: ID!): ServiceRequest
  serviceRequests(filter: ServiceRequestFilter, pagination: Pagination): ServiceRequestConnection!
}

type Mutation {
  # Mirrors POST/PUT/PATCH/DELETE endpoints
  createAnimal(input: CreateAnimalInput!): Animal!
  updateAnimal(id: ID!, input: UpdateAnimalInput!): Animal!
  deleteAnimal(id: ID!): Boolean!
  createServiceRequest(input: CreateServiceRequestInput!): ServiceRequest!
}

type Subscription {
  # Future real-time updates
  serviceRequestStatusChanged(requestId: ID!): ServiceRequest!
  notificationReceived: Notification!
}

# Connection pattern for pagination (matches REST cursor pagination)
type AnimalConnection {
  edges: [AnimalEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type AnimalEdge {
  cursor: String!
  node: Animal!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### 8.3 REST ↔ GraphQL Mapping

| REST Endpoint | GraphQL Equivalent |
|---------------|-------------------|
| `GET /animals` | `query { animals { edges { node { ... } } } }` |
| `GET /animals/:id` | `query { animal(id: "...") { ... } }` |
| `POST /animals` | `mutation { createAnimal(input: {...}) { ... } }` |
| `PATCH /animals/:id` | `mutation { updateAnimal(id: "...", input: {...}) { ... } }` |
| `DELETE /animals/:id` | `mutation { deleteAnimal(id: "...") }` |

---

## 9. Implementation Guide

### 9.1 Version Detection Middleware

```typescript
// src/lib/middleware/version.ts

type ApiVersion = 'v1' | 'v2';

interface VersionContext {
  version: ApiVersion;
  isDeprecated: boolean;
  sunsetDate?: Date;
}

export function detectApiVersion(request: NextRequest): VersionContext {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  
  // Check URL path: /api/v1/... or /api/v2/...
  const pathVersion = pathParts.find(p => /^v\d+$/.test(p)) as ApiVersion | undefined;
  
  // Check header: Accept-Version: v1
  const headerVersion = request.headers.get('Accept-Version') as ApiVersion | null;
  
  // Determine version (path takes precedence)
  const version = pathVersion || headerVersion || 'v1';
  
  // Check if deprecated
  const deprecatedVersions: Record<ApiVersion, Date | null> = {
    'v1': null, // new Date('2027-06-01'), // Uncomment when deprecating
    'v2': null,
  };
  
  const sunsetDate = deprecatedVersions[version];
  
  return {
    version,
    isDeprecated: sunsetDate !== null,
    sunsetDate: sunsetDate || undefined,
  };
}

export function addVersionHeaders(
  response: NextResponse,
  context: VersionContext
): NextResponse {
  response.headers.set('X-API-Version', context.version);
  
  if (context.isDeprecated && context.sunsetDate) {
    response.headers.set('Deprecation', `@${Math.floor(context.sunsetDate.getTime() / 1000)}`);
    response.headers.set('Sunset', context.sunsetDate.toUTCString());
    response.headers.set(
      'X-Deprecation-Notice',
      `This API version will be removed on ${context.sunsetDate.toISOString().split('T')[0]}`
    );
  }
  
  return response;
}
```

### 9.2 Version Router

```typescript
// src/lib/routing/version-router.ts

type HandlerMap = {
  v1: (req: NextRequest, ctx: any) => Promise<NextResponse>;
  v2?: (req: NextRequest, ctx: any) => Promise<NextResponse>;
};

export function versionedHandler(handlers: HandlerMap) {
  return async (request: NextRequest, context: any): Promise<NextResponse> => {
    const versionContext = detectApiVersion(request);
    
    // Get handler for version
    const handler = handlers[versionContext.version];
    
    if (!handler) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'API_VERSION_NOT_FOUND',
          message: `API version ${versionContext.version} not available`,
          details: {
            availableVersions: Object.keys(handlers),
          },
        },
      }, { status: 404 });
    }
    
    // Execute handler
    const response = await handler(request, context);
    
    // Add version headers
    return addVersionHeaders(response, versionContext);
  };
}

// Usage in route file
export const GET = versionedHandler({
  v1: async (request, context) => {
    // v1 implementation
    const data = await getAnimalsV1(request);
    return NextResponse.json({ success: true, data });
  },
  v2: async (request, context) => {
    // v2 implementation (different response format)
    const data = await getAnimalsV2(request);
    return NextResponse.json({ success: true, data });
  },
});
```

### 9.3 File Structure for Versioning

```
src/
├── app/
│   └── api/
│       ├── v1/                    # Explicit v1 routes
│       │   └── mobile/
│       │       └── animals/
│       │           └── route.ts
│       ├── v2/                    # Future v2 routes
│       │   └── mobile/
│       │       └── animals/
│       │           └── route.ts
│       └── mobile/                # Default routes (alias to v1)
│           └── animals/
│               └── route.ts       # Redirects or aliases to v1
├── lib/
│   ├── versioning/
│   │   ├── detect.ts             # Version detection
│   │   ├── adapter.ts            # Version adapters
│   │   └── deprecation.ts        # Deprecation handling
│   └── handlers/
│       ├── v1/                    # v1 business logic
│       │   └── animals.ts
│       └── v2/                    # v2 business logic
│           └── animals.ts
└── types/
    ├── v1/                        # v1 type definitions
    │   └── animals.ts
    └── v2/                        # v2 type definitions
        └── animals.ts
```

### 9.4 OpenAPI Specification per Version

```yaml
# openapi-v1.yaml
openapi: "3.0.3"
info:
  title: "Prani Doctor API"
  version: "1.0.0"
servers:
  - url: "https://api.pranidoctor.com/api/v1"
paths:
  /mobile/animals:
    get:
      summary: "List animals (v1)"
      # v1 schema...

---

# openapi-v2.yaml
openapi: "3.0.3"
info:
  title: "Prani Doctor API"
  version: "2.0.0"
servers:
  - url: "https://api.pranidoctor.com/api/v2"
paths:
  /mobile/animals:
    get:
      summary: "List animals (v2)"
      # v2 schema with changes...
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
| Error Standards | `docs/api/ERROR_STANDARD.md` |
| Master Rules | `docs/core/MASTER_SYSTEM_RULES.md` |

---

*End of API_VERSIONING.md*
