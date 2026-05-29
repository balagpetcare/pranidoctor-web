# Phase 6 — Weight Tracking (Implemented)

See [PHASE6_WEIGHT_PLAN.md](./PHASE6_WEIGHT_PLAN.md) for full design.

## API

| Method | Path |
|--------|------|
| POST | `/api/mobile/fattening/weight` |
| GET | `/api/mobile/fattening/weight?batchId=` |
| GET | `/api/mobile/fattening/weight/history?batchId=` |
| GET | `/api/mobile/fattening/batches/:id/progress` |

## Rules

- Immutable records (create-only)
- Unique `(batchId, animalId, recordedOn)` — max 1 weigh-in per day
- `AnimalProfile.weightKg` synced from latest global `WeightRecord`

## Flutter

`lib/features/fattening/weight/` — entry, history, progress, `AnimalWeightCard`
