# PHASE 8 — OFFLINE ARCHITECTURE IMPLEMENTATION

**Date:** 2026-05-21  
**Role:** Principal Offline Systems Architect  
**Authority:** [PROJECT_FREEZE.md](./PROJECT_FREEZE.md) · Plan: [PHASE8_OFFLINE.md](./PHASE8_OFFLINE.md)

---

## Summary

Delivered offline-first infrastructure for unreliable Bangladesh connectivity:

1. **LOCAL_CACHE** — TTL registry, LRU eviction (skips pending queue)
2. **SYNC_ENGINE** — ordered, idempotent batch sync with delta/foreground/background modes
3. **RETRY_ENGINE** — exponential backoff (30s → 1h cap), dead queue after 5 attempts
4. **OFFLINE_LEAD** — queue offline lead drafts; sync creates unassigned CRM `Lead`
5. **Conflict resolution** — SERVER_WINS / LOCAL_WINS / MERGE_REQUIRED per entity
6. **Flutter contracts** — DTOs, repository, sync coordinator, connectivity, storage, cache
7. **14 unit tests** + `offline:verify` gate

---

## Verification

| Gate | Command | Result |
|------|---------|--------|
| Offline tests | `npm run test -- --run src/modules/offline-architecture` | **14/14 PASS** |
| Build | `npm run build` | **PASS** |
| Offline verify | `npm run offline:verify` | **9/9 PASS** |

```
OFFLINE_ARCHITECTURE_VERIFY=PASS
OFFLINE_COMPLETE=YES
FREEZE_COMPLIANT=YES
```

---

## REPORT

### Created

| Component | Path |
|-----------|------|
| Sync module | `src/modules/offline-architecture/sync.module.ts` |
| Offline module | `src/modules/offline-architecture/offline.module.ts` |
| Orchestrator | `offline-architecture.service.ts` |
| Sync engine | `sync/sync-engine.service.ts` |
| Retry engine | `retry/retry-engine.ts` |
| Local cache | `cache/local-cache.service.ts` |
| Conflict resolver | `conflict/conflict-resolver.ts` |
| Repository | `repository/offline.repository.ts` |
| Verify | `scripts/offline-verify.ts` |
| Flutter | `pranidoctor_user/lib/core/offline/*` |

### Cache

| Domain | TTL | Eviction |
|--------|-----|----------|
| Auth snapshot | 24h | On token refresh |
| Area data | 7d | Seed version bump |
| Case draft | 30d | Post-sync |
| Voice draft | 7d | Session close |
| Profile | 24h | MERGE conflict |

Server stores sync payloads only — client Hive remains source for cached reads.

### Sync

| Mode | Behavior |
|------|----------|
| Foreground | User-initiated drain |
| Background | App resume |
| Delta | `since` filter |
| Batch | Max 25 items |

Dedup: `(userId, idempotencyKey)` · Order: `clientSequence`

### Retry

| Parameter | Value |
|-----------|-------|
| Base delay | 30s |
| Max delay | 1h |
| Max attempts | 5 |
| Dead status | After max |

`POST /sync/retry` supports pause/resume and optional dead-queue retry.

### Offline

| Feature | Implementation |
|---------|----------------|
| Lead create | `OFFLINE_LEAD` entity → `Lead` (NEW, no assignment) |
| Media | Metadata only in `mediaMetadataJson` |
| Queue UX | queued · syncing · failed · resolved |
| Connectivity | ONLINE / DEGRADED / OFFLINE + manual override |

### Migration

| Item | Detail |
|------|--------|
| Migration | `20260521230000_phase8_offline_architecture` |
| Tables | `OfflineSyncSession`, `OfflineSyncItem`, `OfflineLeadDraft`, `OfflineConflictRecord` |

### Blocked

| Item | Reason |
|------|--------|
| Hidden sync | User-visible states required |
| Offline assignment | Forbidden |
| Auth redesign | P1 frozen |
| Plain-text tokens | Storage contract enforces secure box |
| Destructive cleanup | TTL eviction skips pending |
| New dependencies | DEPENDENCY_FROZEN |

### Performance

| Target | Strategy |
|--------|----------|
| Battery | Background interval ≥ 60s |
| Bandwidth | Delta sync + batch cap 25 |
| Startup | Warm area cache client-side |
| Low-end Android | Sequential processing |

---

## Endpoints

| Method | Path |
|--------|------|
| GET | `/api/sync/status` |
| POST | `/api/sync` |
| POST | `/api/sync/retry` |
| GET | `/api/offline/queue` |

Foundation envelope: `{ success, data }` · `authMobile` required.

---

## Compatibility

- No frozen module edits (P1–P7)
- Additive Prisma only
- CRM `Lead` create on sync — no P3 pipeline bypass
- Flutter contracts only — Dio wiring remains incremental (R-015)
