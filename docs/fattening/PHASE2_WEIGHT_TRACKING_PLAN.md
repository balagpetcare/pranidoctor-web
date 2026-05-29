# Cattle Fattening V1 — Phase 2: Weight Tracking

**Status:** Implemented  
**Date:** 2026-05-23  
**Scope:** Weight records per animal per batch; progress dashboard (initial / current / gain)

## API

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/mobile/fattening/weight` | Create weight record |
| GET | `/api/mobile/fattening/weight/history?batchId=` | History + per-animal progress |

## WeightRecord

| Field | Type |
|-------|------|
| id | cuid |
| customerId | FK |
| animalId | FK |
| batchId | FK |
| weightKg | Decimal(10,3) |
| recordedAt | DateTime |
| note | String? |

## Progress rules

- **Initial:** first `WeightRecord` for animal+batch, else `AnimalProfile.weightKg`
- **Current:** latest record, else profile weight
- **Gain:** current − initial

## Flutter

- `FatteningWeightEntryPage` — `/farms/:farmId/fattening/:batchId/weight`
- `FatteningBatchProgressPage` — `.../progress`
- Offline: cache history + outbox `fattening_weight_create`

## Out of scope

Feed, ROI, ADG charts, web farmer UI.
