# TypeScript Typecheck Report

**Project:** Prani Doctor Backend (`pranidoctor-backend`)  
**Date:** 2026-05-21  
**Goal:** Reduce TypeScript errors from **244 → 0**  
**Status:** **PASSED**

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| TypeScript errors (`tsc --noEmit`) | 244 | **0** |
| `npm run typecheck` | FAIL | **PASS** |
| `npm run build` | FAIL | **PASS** |

---

## Validation Commands

```bash
cd pranidoctor-backend
npm run typecheck   # tsc --noEmit
npm run build       # npm run typecheck && tsc
```

Build now runs typecheck first (`package.json` `build` script).

---

## Type Contracts Added

| File | Purpose |
|------|---------|
| `src/shared/types/object.utils.ts` | `StripUndefined<T>`, `omitUndefined()`, `omitUndefinedDeep()`, `setIfDefined()` |
| `src/shared/types/contracts.ts` | `Defined`, `ExpressParam`, `JsonValue`, `JsonRecord` |
| `src/shared/http/params.ts` | `requireParam()` — normalizes Express `string \| string[]` route params |

Exported from `src/shared/types/index.ts`.

---

## Fix Categories

### 1. `exactOptionalPropertyTypes` (largest group)

Optional properties cannot be explicitly set to `undefined`. Fixed by:

- `omitUndefined()` on DTO mappers, controller bodies, filters, and service calls
- `omitUndefinedDeep()` for nested objects (AI chat context, user profile preferences)
- Conditional assignment in security layer (sessions, audit, auth user)

### 2. Express route params (`string | string[]`)

All module controllers use `requireParam()` instead of `req.params.id!`.

### 3. Infrastructure typing

| Area | Fix |
|------|-----|
| **Redis** | Named import `{ Redis }` from `ioredis`; typed callback parameters |
| **pino-http** | Named import `{ pinoHttp }`; `IncomingMessage` / `ServerResponse` types |
| **BullMQ** | Removed invalid `timeout` from `JobsOptions`; bulk jobs omit undefined `opts` |
| **Prisma JSON** | `metadata as unknown as Prisma.InputJsonValue` in media repository |

### 4. Security / shared

| File | Fix |
|------|-----|
| `rbac.service.ts` | `readonly PermissionType[]` for role permission maps |
| `session.storage.ts` | `omitUndefined` for session and refresh token payloads |
| `auth.middleware.ts` | Conditional spread for `deviceId` / `tenantId` |
| `audit.service.ts` | `omitUndefined` for optional audit fields |
| `app.error.ts` | Assign `details` only when defined |
| `request-context.ts` / `context.middleware.ts` | `omitUndefined` for optional context fields |
| `startup-validation.ts` | `omitUndefined` for optional `error` on health checks |
| `event-bus.ts` | Conditional `metadata` on domain events |

### 5. Module stubs (unused parameters)

Repository and service stub implementations prefix unused parameters with `_` per `noUnusedParameters`.

### 6. Unused imports / locals

Removed or corrected unused logger imports, JWT config imports, and duplicate DTO imports.

### 7. Config schema

`jwtSecretSchema` wired into JWT fields in `config.schema.ts`; removed unused loader helpers.

---

## Files Touched (high level)

- **Shared:** `types/`, `http/params.ts`, `middleware/`, `context/`, `errors/`, `events/`, `config/`, `security/**`
- **Infra:** `redis/`, `cache/`, `queue/`
- **Modules:** `ai`, `animals`, `auth`, `clinics`, `doctors`, `leads`, `media`, `notifications`, `users`
- **API:** `health.service.ts`
- **Entry:** `server.ts`
- **Build:** `package.json` (build runs typecheck)

---

## Rules Compliance

| Rule | Status |
|------|--------|
| `strict: true` | Maintained |
| No `any` | No new `any` introduced |
| No `@ts-ignore` | None used |
| `exactOptionalPropertyTypes` | Satisfied via `omitUndefined` / `StripUndefined` |

Targeted `as Type` assertions used only where Zod-inferred nested optionals cannot be structurally narrowed (AI `StartConversationDto`, `ChatRequest`, `UpdateUserProfileDto`).

---

## Remaining Errors Count

**0**

---

## Related Phase 1 Items (out of scope for this task)

- Auth/users repository Prisma implementations (still stubbed)
- Full Docker E2E verification on all developer machines
- Phase 1 freeze certificate blockers unrelated to TypeScript

See `docs/PHASE1_FREEZE_CERTIFICATE.md` in the backend repo when present.
