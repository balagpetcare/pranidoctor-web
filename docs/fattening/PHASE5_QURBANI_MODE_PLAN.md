# Cattle Fattening V1 — Phase 5: Qurbani Mode

**Status:** Implemented  
**Date:** 2026-05-23

## Summary

Adds structured **QURBANI** goal type with **countdown** to `targetDate` and **readiness** score for the batch.

## Data model

- `FatteningBatchGoalType`: `NORMAL` | `QURBANI`
- `FatteningBatch.goalType` (default `NORMAL`)
- `goal` string remains optional notes

## API

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/mobile/fattening/batches/:id/qurbani` | Countdown + readiness dashboard |
| POST | `/api/mobile/fattening/batches` | `goalType: QURBANI` requires `targetDate` |

## Readiness (0–100%)

- **Weight:** average of `currentKg / 450kg` per animal (cap 100%)
- **Time:** elapsed % from `startDate` → `targetDate`
- **Score:** `60%` weight + `40%` time when both exist
- **Status:** `NOT_STARTED` | `ON_TRACK` | `AT_RISK` | `READY` | `OVERDUE`

## Flutter

- Create batch: Normal / Qurbani segmented control
- `FatteningBatchQurbaniPage` — countdown hero + readiness ring + per-animal bars
- Route: `/farms/:farmId/fattening/:batchId/qurbani`
