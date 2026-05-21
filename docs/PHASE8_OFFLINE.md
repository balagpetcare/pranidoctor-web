# PHASE 8 — OFFLINE ARCHITECTURE

**Document type:** Offline systems architecture plan  
**Date:** 2026-05-21  
**Authority:** [PROJECT_FREEZE.md](./PROJECT_FREEZE.md) — freeze rules **override** all work  
**Prerequisites:** [PHASE7_VOICE.md](./PHASE7_VOICE.md), [PHASE6_AI.md](./PHASE6_AI.md), [PHASE5_TREATMENT.md](./PHASE5_TREATMENT.md)  
**Implementation repo:** `pranidoctor-backend/src/modules/offline-architecture/` (**new**, offline-first infrastructure)

**Principle:** Offline is **infrastructure**, not a business-logic rewrite. Server remains source of truth. Client caches are **snapshots + queues**. Sync is explicit, ordered, idempotent, and never silently overwrites.

---

## Freeze Validation

```
DATABASE_FROZEN=true
API_FROZEN=true
MIGRATION_FROZEN=true   (additive only)
DEPENDENCY_FROZEN=true
```

| Gate | Status | Notes |
|------|--------|-------|
| `modules/auth/**`, P2/P3/P5/P6/P7 | **BLOCKED** (edit) | Read/delegate only |
| `legacy/web/routes/**` | **BLOCKED** (edit) | Compat unchanged |
| New `modules/offline-architecture/**` | **ALLOWED** | Sync + queue layer |
| Mount `/api/sync/*`, `/api/offline/*` | **ALLOWED** | Foundation `{ success, data }` |
| Additive Prisma models | **ALLOWED** | Queue + conflict metadata |
| Hidden background sync | **BLOCKED** | User-visible sync states |
| Destructive local cleanup | **BLOCKED** | Eviction is TTL-scoped only |
| Server ownership changes | **BLOCKED** | No source-of-truth migration |
| New npm/pub dependencies | **BLOCKED** | Hive + existing stack only |
| Offline doctor assignment | **BLOCKED** | Leads queue only |

---

## Modules

### LOCAL_CACHE

| Field | Detail |
|-------|--------|
| **Responsibilities** | TTL metadata, eviction policy, cache key registry for auth/area/case/voice/profile snapshots |
| **Ownership** | Client Hive boxes; server stores sync payloads only |
| **Boundaries** | **No source-of-truth changes** — cache is read replica + draft |
| **Rollback** | Disable cache writes; online-only reads |

### SYNC_ENGINE

| Field | Detail |
|-------|--------|
| **Responsibilities** | Background/foreground/delta/batch sync; ordered execution; deduplication; idempotency |
| **Ownership** | `OfflineSyncItem`, `OfflineSyncSession` |
| **Boundaries** | **No silent overwrite** — conflicts surfaced |
| **Rollback** | Pause sync; drain queue manually |

### RETRY_ENGINE

| Field | Detail |
|-------|--------|
| **Responsibilities** | Exponential backoff, dead queue, pause/resume, attempt tracking |
| **Ownership** | `OfflineSyncItem.attemptCount`, `nextRetryAt` |
| **Boundaries** | **No infinite retry** — max 5 attempts → DEAD |
| **Rollback** | `POST /sync/retry` with manual override |

### OFFLINE_LEAD

| Field | Detail |
|-------|--------|
| **Responsibilities** | Create lead offline, attach media metadata, queue upload, restore on reconnect |
| **Ownership** | `OfflineLeadDraft` + CRM `Lead` on successful sync |
| **Boundaries** | **No assignment offline** — `assignedAdminId` always null at create |
| **Rollback** | Mark drafts FAILED; no lead deletion |

---

## Offline Strategy

| Mode | Behavior |
|------|----------|
| **ONLINE** | Real-time API; sync drains queue in background |
| **DEGRADED** | Transcript-first; batch sync; reduced payload |
| **OFFLINE** | Local cache reads; queue writes only |

**Transitions:** Automatic from connectivity probe · **Manual override** via `manualOverride: true` on sync status update

### Conflict rules

| Entity | Strategy |
|--------|----------|
| Auth snapshot | SERVER_WINS |
| Area data | SERVER_WINS |
| Profile | MERGE_REQUIRED |
| Case draft | LOCAL_WINS |
| Voice draft | LOCAL_WINS |
| Offline lead | LOCAL_WINS (create) |

### Recovery rules

1. On reconnect → foreground sync of PENDING items in `clientSequence` order  
2. FAILED items → retry engine schedules `nextRetryAt`  
3. CONFLICT items → user resolves; no auto-merge on PROFILE  
4. DEAD items → visible in queue; manual retry only  

---

## Local Cache

| Domain | TTL | Eviction |
|--------|-----|----------|
| Auth snapshot | 24h | On logout / token refresh |
| Area data | 7d | On seed version bump |
| Case draft | 30d | After successful sync |
| Voice draft | 7d | After session close |
| Profile | 24h | On MERGE_REQUIRED conflict |

**Cleanup:** LRU within quota; never delete unsynced drafts

---

## Sync Engine

| Mode | Use |
|------|-----|
| Foreground | User taps “sync now” |
| Background | App resume + connectivity restore |
| Delta | `since` timestamp — changed items only |
| Batch | Up to 25 items per request |

**Rules:** Ordered by `clientSequence` · Dedupe by `(userId, idempotencyKey)` · Idempotent replays return prior result

---

## Retry Engine

| Parameter | Value |
|-----------|-------|
| Base delay | 30s |
| Max delay | 1h |
| Max attempts | 5 |
| Dead queue | Status `DEAD` after max |

**Tracking:** `attemptCount`, `lastError`, `lastAttemptAt`, `nextRetryAt`

---

## Offline Lead

```
offline create → OfflineLeadDraft (QUEUED) → sync → Lead (NEW, unassigned) → SYNCED
```

- Media: metadata only (`mime`, `sizeBytes`, `localPath` hash) — no blob upload in P8  
- Restore: `GET /offline/queue` returns draft + serverLeadId when synced  

---

## API Contract

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/sync/status` | Connectivity mode, pending/dead counts |
| POST | `/sync` | Enqueue + process sync batch |
| POST | `/sync/retry` | Retry FAILED/dead items |
| GET | `/offline/queue` | List queued/syncing/failed items |

Foundation envelope: `{ success, data }` · `authMobile` required

---

## Flutter Integration

| Artifact | Purpose |
|----------|---------|
| `offline_dto.dart` | Sync status, items, queue DTOs |
| `offline_repository_contract.dart` | HTTP paths |
| `sync_coordinator_contract.dart` | Foreground/background orchestration |
| `connectivity_contract.dart` | ONLINE/DEGRADED/OFFLINE probe |
| `storage_contract.dart` | Encrypted token storage + cache separation |
| `local_cache_contract.dart` | Hive box keys + TTL |

**UX states:** queued · syncing · failed · resolved

**Platform:** Android first; low-end device targets

---

## Storage

| Store | Content | Encryption |
|-------|---------|------------|
| Secure storage | Refresh/access tokens | Required — never plain Hive |
| Cache boxes | Area, drafts, snapshots | Non-sensitive only |
| Queue box | Pending sync payloads | PII minimized |

**Quota:** 32MB cache soft limit; eviction skips pending queue

---

## Performance

| Target | Strategy |
|--------|----------|
| Battery | Batch sync; no polling < 60s |
| Bandwidth | Delta sync; compressed payloads |
| Startup | Warm area cache; lazy profile |
| Low-end Android | Max 25 items/batch; sequential processing |

---

## Rollback

1. Unmount sync/offline modules  
2. Migration additive — tables remain but unused  
3. Client falls back to online-only (existing behavior)

---

PHASE8_PLAN_COMPLETE
