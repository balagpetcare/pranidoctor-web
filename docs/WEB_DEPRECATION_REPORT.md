# Web Deprecation Report (Phase 4)

**Date:** 2026-05-21  
**Policy:** Copy to archive — **do not delete** source of truth without backup.

## Archive location

`archive/web-deprecated/src/lib/`

## Modules archived (46 files)

Prisma-backed service implementations moved out of active `src/lib/`:

- `service-instances/*` (audit, admin/mobile instance services)
- `storage/*` (upload-service, upload-download)
- `admin-semen/*` (templates, providers, breeds) — templates replaced by thin API client
- `mobile-profile/*`, `mobile-auth/*` (except JWT/helpers), `mobile-customer/*`
- `mobile-ai-technician/*`, `mobile-ai-services/*`
- `locations/location-master-admin.ts`, `location-master-service.ts`, `location-hierarchy-validation.ts`
- `mobile-locations/*`, `mobile-api/*`, `mobile-providers/*`, `mobile-animals/*`
- `notifications/*` (service + events)
- `doctor-service-requests/*`, `technician-service-requests/*`, `mobile-service-requests/*`
- `admin-service-requests/*`, `admin-billing/*`, `admin-doctors/*`, `admin-ai-technicians/*`
- `admin-ai-technician-applications/*`, `knowledge-hub/service.ts`

## Active stubs in `src/lib/`

Each archived module has a **type-only stub** (`export type X = any`) so UI components keeping `import type { Dto } from '@/lib/...'` continue to compile.

## Not archived (still active)

- Schemas, mappers without Prisma, JWT, cookies, constants, UI helpers
- `mobile-service-requests/service-request-mapper.ts` (types/mapper only)
- `proxy-to-backend.ts`, `server-internal.ts`, `api-client.ts`
- Panel `panel-access.ts` (backend fetch)

## Safe deletion gate

| Check | Status |
|-------|--------|
| Archive copy exists | YES |
| Web `@/lib/prisma` imports | 0 |
| Web build | PASS |
| Backend owns migrations | YES |

**DELETE_READY:** YES for archived tree after you confirm production traffic on backend for 7+ days (see validation metrics below).
