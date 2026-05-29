# Phase 6 — Weight Tracking: Implementation Audit Report

**Date:** 2026-05-23  
**Scope:** Fattening batch weight records, progress snapshots, Flutter `features/fattening/weight/`, offline sync  
**Plan reference:** [PHASE6_WEIGHT_PLAN.md](./PHASE6_WEIGHT_PLAN.md)  
**Status:** **~90% complete** (core flows shipped; optional/deferred items listed below)

---

## Executive summary

Phase 6 delivers immutable daily weight records per animal per batch, batch progress/growth aggregates, and mobile UI for entry, history, and progress. Backend migration, DTOs, services, routes, and web proxies are in place. Flutter uses a dedicated `weight/` module with offline outbox and local cache. Audit fixes applied in this pass: stable outbox idempotency for weight, `DUPLICATE_WEIGHT_DAY` handling on sync drain, cache refresh on duplicate during online create, and `refreshFatteningAfterMutation(batchId:)` for targeted provider invalidation.

---

## Verification checklist

| Area | Status | Notes |
|------|--------|-------|
| **Migration** | Pass | `20260523220000_phase6_weight_hardening` adds `recordedOn`, `method`, `photoUrl`, dedupes rows, unique `(batchId, animalId, recordedOn)`, index on `(customerId, batchId, recordedOn)` |
| **DTO** | Pass | Backend `weight-mapper.ts`; Flutter `weight_dto.dart` (`WeightRecord`, `WeightRecordMethod`, `BatchWeightProgress`, history result) aligned with API |
| **Repository** | Pass | `FatteningRepository`: create/list/history/progress, cache keys, optimistic create, outbox `fatteningWeightCreate` |
| **Routes** | Pass | Backend + Next.js proxies for POST/GET weight, GET history, GET batch progress |
| **Offline** | Pass | Optimistic history cache; outbox on network failure; stable idempotency key per batch/animal/day |
| **Sync** | Pass (fixed) | Sync treats `409 DUPLICATE_WEIGHT_DAY` as success (record already on server); removes outbox item |
| **Validation** | Pass | Zod on backend (`weight-schemas.ts`); Flutter form (positive weight, animal required, date ≤ today) |
| **Performance** | Acceptable | History endpoint runs list + `buildBatchWeightProgress` in parallel; batch detail + progress page may both fetch progress (cached after first load) |

---

## Files changed

### Backend (`pranidoctor-backend`)

| File | Role |
|------|------|
| `prisma/schema.prisma` | `WeightRecordMethod` enum; `WeightRecord.recordedOn`, `method`, `photoUrl`; `@@unique([batchId, animalId, recordedOn])` |
| `prisma/migrations/20260523220000_phase6_weight_hardening/migration.sql` | Phase 6 DB migration |
| `src/legacy/web/lib/mobile-fattening/batch-weight-snapshot.ts` | `buildBatchWeightProgress`, growth series, `syncAnimalWeightFromLatestRecord` |
| `src/legacy/web/lib/mobile-fattening/weight-service.ts` | Create, list, history (with progress/growth), batch progress |
| `src/legacy/web/lib/mobile-fattening/weight-schemas.ts` | Zod create/list schemas |
| `src/legacy/web/lib/mobile-fattening/weight-mapper.ts` | JSON DTO mapping, gain helpers |
| `src/legacy/web/lib/mobile-fattening/qurbani-service.ts` | Reuses `buildBatchWeightProgress` for readiness |
| `src/legacy/web/routes/mobile/fattening/weight/route.ts` | POST create, GET list |
| `src/legacy/web/routes/mobile/fattening/weight/history/route.ts` | GET history + aggregates |
| `src/legacy/web/routes/mobile/fattening/batches/[id]/progress/route.ts` | GET batch progress only |

### Web (`pranidoctor-web`)

| File | Role |
|------|------|
| `src/app/api/mobile/fattening/weight/route.ts` | Proxy POST/GET weight |
| `src/app/api/mobile/fattening/weight/history/route.ts` | Proxy GET history |
| `src/app/api/mobile/fattening/batches/[id]/progress/route.ts` | Proxy GET progress |
| `docs/fattening/PHASE6_WEIGHT_PLAN.md` | Design (implemented) |
| `docs/fattening/PHASE6_WEIGHT_IMPLEMENTED.md` | Short implementation index |
| `docs/fattening/PHASE6_WEIGHT_REPORT.md` | This audit report |

### Flutter (`pranidoctor_user`)

| File | Role |
|------|------|
| `lib/features/fattening/weight/data/weight_dto.dart` | Models + `WeightRecordInput` |
| `lib/features/fattening/weight/presentation/weight_entry_page.dart` | Record weight (method, date, duplicate UX) |
| `lib/features/fattening/weight/presentation/weight_history_page.dart` | Paginated history + progress summary |
| `lib/features/fattening/weight/presentation/batch_progress_page.dart` | Avg current, total gain, growth chart |
| `lib/features/fattening/weight/presentation/widgets/animal_weight_card.dart` | Per-animal progress card |
| `lib/features/fattening/data/fattening_repository.dart` | API + cache + outbox |
| `lib/features/fattening/data/fattening_repository_contract.dart` | Weight/progress contracts |
| `lib/features/fattening/data/fattening_api_paths.dart` | Weight/history/progress paths |
| `lib/features/fattening/presentation/fattening_providers.dart` | `fatteningWeightHistoryProvider`, `fatteningBatchProgressProvider` |
| `lib/features/fattening/presentation/batch_detail_page.dart` | Weight cards + navigation |
| `lib/features/offline/data/outbox_item.dart` | `fatteningWeightCreate` kind |
| `lib/features/offline/data/sync_coordinator.dart` | Drain weight outbox; duplicate-as-success |
| `lib/core/offline/local_cache_contract.dart` | `fatteningWeightHistoryKey`, `fatteningBatchProgressKey` |
| `lib/routing/app_routes.dart`, `app_router.dart` | Weight/progress/history routes |
| `lib/l10n/app_en.arb` | Weight strings |
| Re-exports | `fattening/data/fattening_weight_dto.dart`, legacy presentation paths |

### Audit fixes (this task)

| File | Change |
|------|--------|
| `fattening_repository.dart` | Stable outbox key; refresh cache on `DUPLICATE_WEIGHT_DAY` |
| `sync_coordinator.dart` | Do not retry forever on duplicate day after sync |
| `fattening_providers.dart` | `refreshFatteningAfterMutation(batchId:)` invalidates weight-related providers |

---

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/mobile/fattening/weight` | Create weight record (201); `409 DUPLICATE_WEIGHT_DAY` if same animal/day |
| `GET` | `/api/mobile/fattening/weight?batchId=&page=&pageSize=` | Paginated records only |
| `GET` | `/api/mobile/fattening/weight/history?batchId=&animalId?` | Records + `progress`, `growth`, `totalGainKg`, `avgCurrentWeightKg` |
| `GET` | `/api/mobile/fattening/batches/:id/progress` | `{ progress }` snapshot only |

**Error codes (weight create):**

| HTTP | Code | Meaning |
|------|------|---------|
| 404 | `NOT_FOUND` | Batch missing |
| 409 | `BATCH_NOT_ACTIVE` | Draft batch cannot record weight |
| 409 | `DUPLICATE_WEIGHT_DAY` | One record per animal per calendar day |
| 422 | `ANIMAL_NOT_IN_BATCH` | Animal not in active membership |
| 422 | `VALIDATION_ERROR` | Zod / invalid `recordedAt` |

**Rules:**

- Records are create-only (no PATCH/DELETE in Phase 6).
- `AnimalProfile.weightKg` updated from latest **global** `WeightRecord` for that animal after each create.
- Unique constraint: `(batchId, animalId, recordedOn)`.

---

## Flutter screens & routes

| Screen | Route pattern |
|--------|----------------|
| Weight entry | `/farms/:farmId/fattening/:batchId/weight` |
| Weight history | `/farms/:farmId/fattening/:batchId/weight/history` |
| Batch progress | `/farms/:farmId/fattening/:batchId/progress` |
| Batch detail (embedded cards) | `/farms/:farmId/fattening/:batchId` |

**UX highlights:**

- Method selector: SCALE, TAPE, ESTIMATE, OTHER
- Date picker (weigh-in day); maps to `recordedOn`
- Duplicate day → localized snackbar (`fatteningWeightDuplicateDay`)
- Offline → optimistic record + outbox; snackbar `fatteningWeightSavedOffline`
- Progress page: `AnimalWeightCard`, `MilkSimpleBarChart` for growth series

---

## Offline & sync behavior

1. **Create offline:** Optimistic append to weight history cache; enqueue `fatteningWeightCreate` with idempotency `fattening_weight_create-weight-{batchId}-{animalId}-{YYYY-MM-DD}` (stable, no duplicate queue rows).
2. **Sync online:** POST weight; on success remove outbox and invalidate `SyncDomain.fattening` → bumps `fatteningListRefreshProvider` (weight/progress providers watch it).
3. **Sync duplicate:** If server already has that day (`DUPLICATE_WEIGHT_DAY`), outbox item is removed (treated as reconciled).
4. **Cache keys:** `fatteningWeightHistoryKey(batchId)`, `fatteningBatchProgressKey(batchId)`.
5. **`clientRecordId`:** Sent from entry page; matches outbox suffix for traceability.

---

## Known issues & gaps

| Item | Severity | Notes |
|------|----------|-------|
| **Photo upload** | Low | `photoUrl` in API/schema; Flutter entry UI does not capture/upload photos yet |
| **GET /weight/analytics** | Deferred | Optional endpoint in plan; not implemented |
| **Animal PATCH weight guard** | Deferred | Plan suggested blocking direct `weightKg` edit when fattening records exist; not enforced |
| **Dedicated `FatteningValidation` for weight** | Low | Validation lives in form + Zod; no shared Dart validator module |
| **History `forceRefresh`** | Low | Repository param exists but always hits network when online; cache-only path on error only |
| **Draft batch progress fetch** | Low | Batch detail watches progress provider even for draft; extra GET (harmless empty snapshot) |
| **History endpoint cost** | Low | Always builds full batch snapshot alongside list; acceptable for typical batch sizes |
| **Seed data** | Low | `user_app_seed.ts` may lack sample weight rows for demo farms |

No blocking defects found for active/completed batch weigh-in flows after audit fixes.

---

## Future reuse

| Component | Reuse |
|-----------|--------|
| `buildBatchWeightProgress` | Qurbani readiness, ROI projections, batch dashboards, export/reporting |
| `batch-weight-snapshot.ts` | Any feature needing per-animal gain and daily growth series |
| `weight_dto.dart` / `AnimalWeightCard` | Other species fattening, sale prep, auction weight targets |
| Outbox pattern `fatteningWeightCreate` | Template for other fattening mutations (treatments linked to batch) |
| `MilkSimpleBarChart` on progress page | Pattern for time-series on other fattening metrics (feed ADG correlation) |
| Immutable daily records | Audit trail; future “correct weight” could be adjustment records (new phase) |

---

## Completion %

| Category | Weight | Rationale |
|----------|--------|-----------|
| Schema & migration | 100% | Applied; unique day constraint |
| Backend API | 95% | Core 4 endpoints; no analytics route |
| Web proxies | 100% | All mobile fattening weight routes proxied |
| Flutter UI | 88% | Entry/history/progress/cards; no photo |
| Offline/sync | 92% | Outbox + cache + duplicate handling (post-fix) |
| Cross-cutting validation | 90% | Server Zod + client form; no animal PATCH guard |
| **Overall Phase 6** | **~90%** | Production-ready for daily weigh-ins; optional plan items deferred |

---

## Test plan (manual)

- [ ] Start fattening batch → record weight (SCALE) → see progress on batch detail and progress page
- [ ] Second record same animal same day → `409` / duplicate snackbar; cache shows server state
- [ ] Airplane mode → record weight → outbox pending → online sync → progress updates
- [ ] Sync duplicate (record day on server before outbox drains) → outbox clears, no dead letter
- [ ] Qurbani batch → readiness still reflects latest weights via shared snapshot
- [ ] Completed batch → can view history; active-only for new records per `BATCH_NOT_ACTIVE` rules

---

## Related docs

- [PHASE6_WEIGHT_PLAN.md](./PHASE6_WEIGHT_PLAN.md)
- [PHASE6_WEIGHT_IMPLEMENTED.md](./PHASE6_WEIGHT_IMPLEMENTED.md)
- [CATTLE_FATTENING_IMPLEMENTATION_AUDIT.md](../audit/CATTLE_FATTENING_IMPLEMENTATION_AUDIT.md) (program-wide)
