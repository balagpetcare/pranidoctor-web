# Cattle Fattening V1 — Phase 3: Batch Feeding

**Status:** Implemented  
**Date:** 2026-05-23

## Summary

Reuses existing **Feed** module with `FeedRecord.fatteningBatchId` FK to `FatteningBatch`. Adds **BatchFeedPlan** with `NORMAL` / `FATTENING` modes.

## API

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/mobile/feeds` | Create feed (`fatteningBatchId` in body) |
| GET | `/api/mobile/feeds?fatteningBatchId=` | List batch feeds |
| GET | `/api/mobile/fattening/batches/:id/feed-plan` | Get plan |
| PUT | `/api/mobile/fattening/batches/:id/feed-plan` | Upsert plan |
| GET | `/api/mobile/fattening/batches/:id/feed-dashboard` | Feed cost + daily feed dashboard |

## BatchFeedPlan

- `mode`: NORMAL | FATTENING
- `dailyAmountKg`, `dailyCostBdt` (targets)
- optional `feedType`, `unit`, `notes`

## Flutter

- `FatteningBatchFeedDashboardPage` — feed cost + daily feed + chart
- `FatteningLogFeedPage` — log feed via `FeedRepository`
- Routes under `/farms/:farmId/fattening/:batchId/feed-dashboard` and `/log-feed`
