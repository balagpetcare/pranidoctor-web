# PHASE 0 MEDIUM FIXES — Documentation Harmonization

**Version:** 1.0.0  
**Date:** 2026-05-21  
**Source:** `PHASE0_FINAL_REVIEW.md` §10.3, §13.2  
**Scope:** Documentation alignment only — no architecture redesign

---

## Executive Summary

Medium-priority conflicts and naming drift were resolved by **harmonizing canonical conventions** across governance, API, database, AI, and DevOps docs. Implementation code is unchanged in this pass.

| Area | Status | Canonical source |
|------|--------|------------------|
| Pagination keys | Resolved | `API_CONTRACT_V1.md` §4 |
| `tenantId` usage | Resolved | `TABLE_STRUCTURE.md` §1.2 + `MULTI_TENANT_STRATEGY.md` §5 |
| AI audit table ownership | Resolved | `AiUsageRecord` — `TABLE_STRUCTURE.md` §9.9 |
| Response structure | Verified aligned | `API_CONTRACT_V1.md` §3 |
| API version consistency | Clarified | `API_VERSIONING.md` §1.2 + `API_CONTRACT_V1.md` header |
| Environment variable naming | Clarified | `MASTER_SYSTEM_RULES.md` §13.5, `ENV_SETUP.md` |
| DTO naming | Clarified | `MASTER_SYSTEM_RULES.md` §13.2 |
| Migration naming | Clarified | `TABLE_STRUCTURE.md` §12.0, `PRISMA_MIGRATION_RULES.md` §0 |
| Upload naming | Clarified | `MASTER_SYSTEM_RULES.md` §13.4, `API_CONTRACT_V1.md` §10.0 |
| Role hierarchy | Clarified | `ROLE_SYSTEM.md` §1.2 + `AUTH_FLOW.md` §6.1 |

---

## Validation Results

### 1. Pagination key consistency (CONF-M001)

**Issue:** `MASTER_SYSTEM_RULES` API-005 used `items`; `API_CONTRACT_V1` uses `data` + `meta`.

**Resolution:**

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

| Document | Change |
|----------|--------|
| `MASTER_SYSTEM_RULES.md` | API-005 updated to `data` + `meta` |
| `API_CONTRACT_V1.md` | Unchanged (already canonical) |
| `SYSTEM_ARCHITECTURE.md` | Already uses `data` + `meta` |

**Note:** Admin UI “toolbar pagination” refers to UI controls, not JSON key names.

---

### 2. tenantId usage (CONF-M002)

**Issue:** Strategy doc listed tables; `TABLE_STRUCTURE` did not centralize rules.

**Resolution:**

| Rule | Value |
|------|-------|
| MVP mode | Single-tenant; `tenantId String?` nullable |
| Enforcement | Not applied in queries until Phase 2 |
| Tenant-scoped | Per `MULTI_TENANT_STRATEGY.md` §5.2 |
| Shared reference | No `tenantId` (§5.3) |
| Indexes (future) | `@@index([tenantId])`, composite with `status` |

| Document | Change |
|----------|--------|
| `TABLE_STRUCTURE.md` | New §1.2 tenantId Field Standard |
| `MULTI_TENANT_STRATEGY.md` | Cross-ref to TABLE_STRUCTURE |
| `DATABASE_ARCHITECTURE.md` | Pointer to §1.2 |

---

### 3. AI audit table ownership (CONF-M003)

**Issue:** Orchestrator referenced `AiAuditLogger`; no single table owner in `TABLE_STRUCTURE`. Review suggested `AiRequestLog` / `AiResponseAudit`.

**Resolution:** One canonical audit table — **`AiUsageRecord`** (plus **`AiCostAlert`** for thresholds). Schema authority: `COST_OPTIMIZATION.md` §8.1.

| Component | Responsibility |
|-----------|----------------|
| `AiUsageRecord` | Every AI provider call (tokens, cost, latency, moderation) |
| `AiAuditLogger` | Writer used by orchestrator + emergency engine |
| `AiRequestLog` / `AiResponseAudit` | **Not used** — avoid duplicate tables |

| Document | Change |
|----------|--------|
| `TABLE_STRUCTURE.md` | New §9.9 AI Domain Tables |
| `COST_OPTIMIZATION.md` | Ownership note at §8 |
| `AI_ORCHESTRATOR.md` | Auditable principle points to §9.9 |

---

### 4. Response structure

**Validated:** No change required.

| Field | Success | Error |
|-------|---------|-------|
| Envelope | `{ success: true, data, meta? }` | `{ success: false, error: { code, message, details?, field? } }` |
| Sources | `MASTER_SYSTEM_RULES.md` §5.2, `API_CONTRACT_V1.md` §3, `ERROR_STANDARD.md` |

Optional `message` on success remains permitted by API-003; not used in contract examples.

---

### 5. API version consistency

**Validated + clarified:**

| Concept | MVP value |
|---------|-----------|
| Contract doc | `API_CONTRACT_V1.md` (doc revision 1.1.0) |
| Runtime paths | `/api/mobile/*`, `/api/admin/*` — **v1 implicit** |
| Response header | `X-API-Version: v1` |
| Future | `/api/v1/mobile/*` when v2 ships |

| Document | Change |
|----------|--------|
| `API_CONTRACT_V1.md` | Header: API version + header requirement |
| `API_VERSIONING.md` | Cross-ref to contract + header |

---

### 6. Environment variable naming

**Issue:** `ENV_SETUP.md` listed all JWT vars without mapping to auth context; risk of conflating mobile Bearer with doctor/technician web cookies.

**Resolution:**

| Variable | Context |
|----------|---------|
| `ADMIN_JWT_SECRET` | Admin panel |
| `MOBILE_JWT_SECRET` | Mobile OTP Bearer (`/api/mobile/*`) |
| `DOCTOR_JWT_SECRET` | Doctor web panel |
| `TECHNICIAN_JWT_SECRET` | Technician web API/cookie |
| `AUTH_SECRET` / `JWT_SECRET` | Dev fallback only |

| Document | Change |
|----------|--------|
| `MASTER_SYSTEM_RULES.md` | New §13.5 matrix |
| `ENV_SETUP.md` | Table replaces flat list |

---

### 7. DTO naming

**Resolution (canonical):**

| Layer | Pattern | Example |
|-------|---------|---------|
| TS response | `{Entity}Dto` | `ServiceRequestDto` |
| TS write | `{Entity}CreateInput` / `UpdateInput` | `CreateServiceRequestInput` |
| Zod | `{entity}CreateSchema` | `serviceRequestCreateSchema` |
| Flutter file | `{entity}_dto.dart` | `service_request_dto.dart` |
| Flutter class | `{Entity}Dto` | `ServiceRequestDto` |

| Document | Change |
|----------|--------|
| `MASTER_SYSTEM_RULES.md` | §13.2 expanded |

---

### 8. Migration naming

**Resolution:**

| Element | Convention |
|---------|------------|
| Folder | `YYYYMMDDHHMMSS_snake_case` |
| `--name` | `add_ai_usage_record` (verb + object) |
| Safety | `PRISMA_MIGRATION_RULES.md` |

| Document | Change |
|----------|--------|
| `TABLE_STRUCTURE.md` | §12.0 Migration Naming Convention |
| `PRISMA_MIGRATION_RULES.md` | §0 Migration naming |
| `MASTER_SYSTEM_RULES.md` | §13.3 migration row |

---

### 9. Upload naming

**Resolution:**

| Layer | Convention |
|-------|------------|
| Routes | `/api/mobile/uploads`, `/api/mobile/uploads/{id}/complete` |
| Model | `UploadedFile` |
| Object key | `uploads/{context}/{yyyy}/{mm}/{fileId}.{ext}` |
| Context | `farmer`, `doctor`, `ai-tech`, `admin` |
| Bucket | `pranidoctor-uploads` |
| Errors | `UPLOAD_*` |

| Document | Change |
|----------|--------|
| `MASTER_SYSTEM_RULES.md` | §13.4 Upload Naming |
| `API_CONTRACT_V1.md` | §10.0 + diagram paths fixed |

---

### 10. Role hierarchy

**Validated:** Enum order differs from privilege level; levels are explicit in code.

| Role | Level |
|------|-------|
| SUPER_ADMIN | 5 |
| ADMIN | 4 |
| SUPPORT | 3 |
| DOCTOR | 2 |
| AI_TECHNICIAN | 2 |
| CUSTOMER | 1 |

| Document | Change |
|----------|--------|
| `ROLE_SYSTEM.md` | §1.2 level table + enum comments |
| `AUTH_FLOW.md` | Already defines `ROLE_HIERARCHY` (unchanged) |

---

## Additional Medium Fixes (DevOps / UX)

### CONF-M004 — External backup storage

| Document | Change |
|----------|--------|
| `VPS_STRUCTURE.md` | New §9.5 External Backup Storage (Hetzner / S3 / B2) |

### CONF-M005 — Voice component scope

| Document | Change |
|----------|--------|
| `COMPONENT_SYSTEM.md` | §4.5 scope note: Phase 2+ STT; MVP idle UI optional |

Component already existed; gap was **scope clarity**, not missing spec.

---

## Conflict Resolution Matrix

| ID | Title | Status |
|----|-------|--------|
| CONF-M001 | Pagination `items` vs `data` | Resolved |
| CONF-M002 | tenantId consistency | Resolved |
| CONF-M003 | AI audit table | Resolved |
| CONF-M004 | Backup / VPS external storage | Resolved |
| CONF-M005 | Voice component scope | Resolved |

---

## Files Modified

| File | Version bump |
|------|--------------|
| `docs/core/MASTER_SYSTEM_RULES.md` | — |
| `docs/api/API_CONTRACT_V1.md` | 1.1.0 (prior) |
| `docs/api/API_VERSIONING.md` | — |
| `docs/database/TABLE_STRUCTURE.md` | 1.1.0 |
| `docs/database/MULTI_TENANT_STRATEGY.md` | — |
| `docs/database/DATABASE_ARCHITECTURE.md` | — |
| `docs/database/ROLE_SYSTEM.md` | — |
| `docs/ai/AI_ORCHESTRATOR.md` | — |
| `docs/ai/COST_OPTIMIZATION.md` | — |
| `docs/ENV_SETUP.md` | — |
| `docs/devops/VPS_STRUCTURE.md` | 1.1.0 |
| `docs/uiux/COMPONENT_SYSTEM.md` | — |
| `docs/PRISMA_MIGRATION_RULES.md` | — |

---

## Engineering Checklist (Post-Docs)

- [ ] List handlers return `{ success, data, meta }` — never top-level `items`
- [ ] Add `tenantId String?` only on tables in MULTI_TENANT §5.2 when touching schema
- [ ] AI logging writes to `AiUsageRecord` via `AiAuditLogger`
- [ ] Set distinct JWT secrets per context in production `.env`
- [ ] Name new migrations `YYYYMMDDHHMMSS_snake_case`
- [ ] Upload keys use `uploads/{context}/...` prefix
- [ ] API responses set `X-API-Version: v1`

---

## Related Documents

| Document | Role |
|----------|------|
| `PHASE0_FINAL_REVIEW.md` | Original findings |
| `PHASE0_ARCHITECTURE_PATCH_V1.md` | High-priority OTP + AI memory patch |
| `MASTER_SYSTEM_RULES.md` | Governance canonical |
| `API_CONTRACT_V1.md` | API canonical |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Architecture | Medium-priority doc harmonization |

---

*End of PHASE0_MEDIUM_FIXES.md*
