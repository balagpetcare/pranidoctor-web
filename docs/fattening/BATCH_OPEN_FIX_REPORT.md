# Fattening Batch Open + Filter + Sync — Fix Report

**Date:** 2026-05-23  
**Scope:** Batch list filters, batch detail open, offline/pending-sync batches (no weight feature changes)

---

## Root cause

### A. HTTP 405 “Service unavailable” on batch detail / list / filters

Compat Express routes use **lazy-loaded** handlers (`route-registry.ts`). Fattening route modules import `fattening-service.ts`, which imports `FatteningBatchGoalType` from `@/generated/prisma/client`.

When the Prisma client was **out of date** (missing Phase 5 enum `FatteningBatchGoalType`), the dynamic import failed. The registry still registered the path but returned **405 Method Not Allowed** for every HTTP verb on that route file.

**Verification:**

```text
Before prisma generate:
  import batches/route.ts → SyntaxError: does not provide export named 'FatteningBatchGoalType'
  GET /api/mobile/fattening/batches → 405

After npx prisma generate:
  GET /api/mobile/fattening/batches → 401 (handler loads; auth required)
```

**Action required:** Run `npx prisma generate` in `pranidoctor-backend` after schema/migration changes, then **restart the API server**.

### B. Filter chips showed wrong data / errors

`FatteningBatchListNotifier.build` did **not** watch `fatteningStatusFilterProvider`. On filter change, `invalidateSelf()` re-ran `build`, which returned the **full unfiltered cache** while the network request used `?status=DRAFT|ACTIVE`.

### C. “Pending sync” batch could not open

Offline `createBatch` wrote the batch to the **list cache** but not **detail cache**. `getBatch` always hit the network first (provider used `forceRefresh: true`). For local-only IDs the server returned 404/405 and there was no detail cache fallback.

---

## Fixes applied

### Backend (`pranidoctor-backend`)

| File | Change |
|------|--------|
| `src/modules/compat-web/route-registry.ts` | Register routes **deepest path first** so `/batches/:id/progress` etc. are not shadowed by `/batches/:id` |
| Prisma client | Regenerated via `npx prisma generate` (includes `FatteningBatchGoalType`) |

### Flutter (`pranidoctor_user`)

| File | Change |
|------|--------|
| `fattening_repository.dart` | Detail cache on create/upsert; `getBatch` cache-first when `!forceRefresh`; list API fallback applies **client-side status filter** to cached page |
| `fattening_providers.dart` | List `build` watches status filter + filters cached rows; detail provider returns **cached detail immediately**, background refresh without blocking |
| `fattening_feedback.dart` | User-facing errors: `AppException.message`, **Retry / Refresh / Open cached** |
| `batch_list_page.dart` | Filter chips only set status (watch triggers rebuild); improved error UI |
| `batch_detail_page.dart` | Improved error UI; `refreshFatteningAfterMutation(batchId:)` |
| `create_batch_page.dart`, `add_animal_page.dart` | Invalidate list + detail (+ qurbani) after mutations |

**Weight module:** Not modified (only backward-compatible optional `message` on shared `FatteningFeedback.error`).

---

## Routes verified

| Method | Path | Handler |
|--------|------|---------|
| GET | `/api/mobile/fattening/batches?farmId=&status=&page=` | List (status query optional) |
| POST | `/api/mobile/fattening/batches` | Create |
| GET | `/api/mobile/fattening/batches/:id` | Detail |
| POST | `/api/mobile/fattening/batches/:id/animals` | Add animals |
| POST | `/api/mobile/fattening/batches/:id/start` | Start batch |
| GET | `/api/mobile/fattening/batches/:id/qurbani` | Qurbani dashboard |

Nested paths (`progress`, `qurbani`, `animals`, `start`, …) are separate Express routes; registration order is now depth-sorted.

---

## Manual test checklist

1. **Backend:** `npx prisma generate` → restart API → `GET /api/mobile/fattening/batches?farmId=farm-…` returns **401** (not 405) without token.
2. **Create batch** (online) → **Add animals** → **Open detail** → animals and status visible.
3. **Create batch** (offline) → shows “Pending sync” → **Open detail** → opens from cache; banner “cached data”.
4. **Filters:** All / Draft / Active each call `GET …/batches?status=` (or no status for All); list matches selection; offline uses filtered cache.
5. **Start batch** (online, draft with animals) → status Active; detail refreshes.
6. **Qurbani batch** → open Qurbani tab from detail.
7. **Sync:** After connectivity returns, outbox drains; list/detail refresh via `fatteningListRefreshProvider`.

---

## Remaining risks

| Risk | Mitigation |
|------|------------|
| Stale Prisma client after pull | Run `npx prisma generate` + restart API in dev/CI |
| Lazy route load still hides import errors until first request | Watch API logs on first fattening call; consider startup self-test |
| Detail background refresh after cache-first does not auto-update UI until pull-to-refresh | Acceptable; user can Refresh on error screen |
| Local temp batch id replaced only after sync | Outbox `fatteningBatchCreate` must succeed; list/detail caches updated on server id in future sync handler |

---

## Files changed (summary)

- `pranidoctor-backend/src/modules/compat-web/route-registry.ts`
- `pranidoctor-backend/src/generated/prisma/*` (generated)
- `pranidoctor_user/lib/features/fattening/data/fattening_repository.dart`
- `pranidoctor_user/lib/features/fattening/presentation/fattening_providers.dart`
- `pranidoctor_user/lib/features/fattening/presentation/widgets/fattening_feedback.dart`
- `pranidoctor_user/lib/features/fattening/presentation/batch_list_page.dart`
- `pranidoctor_user/lib/features/fattening/presentation/batch_detail_page.dart`
- `pranidoctor_user/lib/features/fattening/presentation/create_batch_page.dart`
- `pranidoctor_user/lib/features/fattening/presentation/add_animal_page.dart`
- `pranidoctor_user/lib/features/fattening/presentation/batch_qurbani_page.dart`
- `pranidoctor_user/lib/features/fattening/presentation/batch_roi_page.dart`
- `pranidoctor_user/lib/features/fattening/presentation/batch_feed_dashboard_page.dart`
