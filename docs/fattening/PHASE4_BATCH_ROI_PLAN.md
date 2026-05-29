# Cattle Fattening V1 — Phase 4: Batch ROI

**Status:** Implemented  
**Date:** 2026-05-23

## Summary

Reuses **Finance** (`FinanceRecord.fatteningBatchId`) and **Feed** (`FeedRecord.fatteningBatchId`) to compute batch profit.

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/mobile/fattening/batches/:id/roi` | ROI breakdown |
| PUT | `/api/mobile/fattening/batches/:id/roi` | Set purchase + projected sale |

## Calculation

| Line | Source |
|------|--------|
| **Purchase** | Manual `FatteningBatchRoi.purchaseCostBdt`, else sum of batch-linked finance expenses (excluding FEED & MEDICINE) |
| **Feed** | Sum `FeedRecord.costBdt` for `fatteningBatchId` |
| **Treatment** | Sum finance `MEDICINE` expenses with `fatteningBatchId` |
| **Projected sale** | Manual `FatteningBatchRoi.projectedSaleBdt` |
| **Profit** | `projectedSale - (purchase + feed + treatment)` |

## Flutter

- `FatteningBatchRoiPage` — cost panel + profit card
- Route: `/farms/:farmId/fattening/:batchId/roi`

## Finance reuse

Create expenses with optional `fatteningBatchId` (medicine → treatment line; other categories → purchase fallback when manual purchase unset).
