# Data Processing Policy — Data Governance Report

**Document type:** Compliance verification (documentation + as-built audit)  
**Version:** 1.0.0  
**Date:** 2026-05-30  
**Scope:** Data processing policy documentation suite and platform alignment across `pranidoctor-backend`, `pranidoctor_user`, `pranidoctor-web`  
**Method:** Static review of policy docs vs Prisma schema (132 models), worker/audit code paths, admin ops surfaces — no production runtime test  
**Related:** [DATA_PROCESSING_POLICY.md](./DATA_PROCESSING_POLICY.md), [data-processing-policy-plan.md](./data-processing-policy-plan.md), [DATA_PROCESSING_OPERATIONS.md](./DATA_PROCESSING_OPERATIONS.md)

---

## Executive summary

The **Data Processing Policy documentation suite is complete and internally consistent** for core platform domains (identity, clinical, farm ERP, AI, consent, media, offline). It satisfies the approved **documentation-first** deliverable without API or architecture changes.

**Governance readiness: conditional pass (62/100).** Policy and runbooks are suitable for **controlled staging and manual compliance operations**. Production-grade data governance requires legal sign-off on RoPA/legal bases, explicit mapping of ~68 unlisted Prisma models, automated retention/erasure jobs, and A6 audit events (`DataAccessLog`, erasure proof).

| Validation area | Result | Score |
|-----------------|--------|-------|
| Retention coverage | Partial pass | 52/100 |
| Data classification coverage | Partial pass | 50/100 |
| Audit requirements | Pass with gaps | 74/100 |
| Operational readiness | Conditional pass | 68/100 |

**Verdict:** **Documentation implementation verified.** **Operational automation not verified** — backlog items R-01–R-03 in [COMPLIANCE_NOTES.md](../legal/COMPLIANCE_NOTES.md) remain open.

---

## 1. Documentation deliverables

| Deliverable | Path | Status |
|-------------|------|--------|
| Canonical policy | [DATA_PROCESSING_POLICY.md](./DATA_PROCESSING_POLICY.md) | ✅ Present |
| Classification mapping | [DATA_CLASSIFICATION.md](./DATA_CLASSIFICATION.md) | ✅ Present |
| Retention mapping | [RETENTION_MAPPING.md](./RETENTION_MAPPING.md) | ✅ Present |
| Audit requirements | [AUDIT_REQUIREMENTS.md](./AUDIT_REQUIREMENTS.md) | ✅ Present |
| RoPA register | [ROPA_REGISTER.md](./ROPA_REGISTER.md) | ✅ Present |
| Operations runbook | [DATA_PROCESSING_OPERATIONS.md](./DATA_PROCESSING_OPERATIONS.md) | ✅ Present |
| Plan status | [data-processing-policy-plan.md](./data-processing-policy-plan.md) v1.1 **Implemented** | ✅ Present |
| Cross-links | `DATA_RETENTION.md`, `COMPLIANCE_NOTES.md`, `LEGAL_OPERATIONS.md` | ✅ Present |

---

## 2. Retention coverage

### 2.1 RET-* category framework

**Requirement:** Every major data domain has a defined retention category, period, deletion method, and implementation status.

| Check | Result | Verdict |
|-------|--------|---------|
| RET-* categories defined (22 categories) | [RETENTION_MAPPING.md](./RETENTION_MAPPING.md) §1 | **Pass** |
| Summary schedule synced | [DATA_RETENTION.md](../legal/DATA_RETENTION.md) v1.1 | **Pass** |
| Erasure action matrix | RETENTION_MAPPING §4 | **Pass** |
| Purge job registry documented | §5 — 10 jobs named | **Pass** (policy) |
| `platform.retention.config` Setting key | Documented as not implemented | **Pass** (honest) |
| Legal hold procedure | §6 — future flag | **Partial** |

### 2.2 Prisma model mapping

**Method:** Compared 132 `model` declarations in `pranidoctor-backend/prisma/schema.prisma` against backtick-quoted model names in `RETENTION_MAPPING.md`.

| Metric | Value |
|--------|-------|
| Total Prisma models | **132** |
| Explicitly named in retention mapping | **64** (48.5%) |
| Unmapped (no backtick reference) | **68** (51.5%) |

**Unmapped models (grouped by inferred category — not yet in docs):**

| Inferred RET-* | Examples (unmapped) |
|----------------|---------------------|
| RET-REFERENCE | `District`, `Upazila`, `Union`, `LivestockBreed`, `FeedCatalog`, `FeedItem`, `AiKnowledgeEntry`, … |
| RET-ACCOUNT / profile junction | `DoctorServiceArea`, `DoctorProfileArea`, `AiTechnicianProfileServiceCategory`, … |
| RET-CLINICAL / field service | `SemenProvider`, `SemenServiceTemplate*`, `ServiceInstance*`, `AiTechnicianService`, … |
| RET-FARM | `Livestock`, `LivestockHealthRecord`, `FeedInventory`, `FeedPurchase`, `BatchFeedPlan`, `FatteningBatchAnimal`, … |
| RET-AI-METRICS | `AiUsageUserDailyRollup`, `AiUsageCustomerDailyRollup` |
| RET-CONSENT (parallel legal track) | `LegalDocument`, `LegalAcceptanceEvent` |
| RET-ACCOUNT (support) | `SupportTicket`, `SupportTicketMessage`, `SupportTicketAttachment` |
| RET-CONFIG / ops | `AiGovernanceState`, `AiPromptTemplate`, `RegionalOutbreakSignal`, … |

**Coverage verdict:** Core paths (User, clinical, AI chat, farm modules listed in plan §3) are mapped. **Phase 4 livestock/feed ecosystem**, **semen/service-instance marketplace**, **support tickets**, and **parallel legal document acceptance** are **under-documented** at model granularity.

### 2.3 Implementation vs policy

| RET-* | Policy claim | Code verification | Verdict |
|-------|--------------|-------------------|---------|
| RET-OTP | ✅ `MobileOtpChallenge.expiresAt` | `expiresAt` indexed on model | **Pass** |
| RET-SESSION | ✅ automatic expiry | `UserSession.expiresAt`, `RefreshToken.expiresAt` | **Pass** |
| RET-LOCAL | ✅ client TTL | `LocalCacheContract` TTLs in Flutter | **Partial** — see §2.4 |
| RET-ACCOUNT erasure | Planned worker | No `ErasureWorker`; manual runbook only | **Fail** (automation) |
| RET-* purge jobs (10) | Planned | `worker.ts`: *"No job processors registered yet"* | **Fail** (automation) |
| RET-MEDIA orphan | S3 lifecycle | Not verified in repo | **Unknown** |
| RET-CRASH / RET-METRICS | Ops/vendor | Sentry/Crashlytics docs only | **Ops** |

**Retention automation score:** 2/10 documented jobs have passive TTL (OTP/session/local cache); **0/10 purge cron jobs** implemented.

### 2.4 Mobile cache TTL discrepancy

| Doc claim ([RETENTION_MAPPING.md](./RETENTION_MAPPING.md) §3) | Code (`local_cache_contract.dart`) |
|----------------------------------------------------------------|-------------------------------------|
| `profileKey` TTL **24h** | `profileTtl = Duration(minutes: 30)` |
| Generic data **24h** | `dataTtl = Duration(minutes: 30)` |
| Legal/disclaimer keys "app config TTL" | `appConfigTtl = Duration(hours: 12)` |

**Verdict:** Policy understates refresh frequency for profile/list caches (30 min, not 24h). **Low risk** (shorter TTL is stricter) but docs should be corrected in a follow-up edit.

---

## 3. Data classification coverage

### 3.1 Tier framework (DC-1–DC-4)

| Check | Result | Verdict |
|-------|--------|---------|
| Four tiers defined with handling matrix | [DATA_CLASSIFICATION.md](./DATA_CLASSIFICATION.md) §1–§2 | **Pass** |
| Domain matrix (§3) | 25+ domains | **Pass** |
| API/log classification rules | §5 | **Pass** |
| Labeling convention for future code | §6 JSON metadata | **Pass** |

### 3.2 Prisma model mapping

| Metric | Value |
|--------|-------|
| Models explicitly named in classification doc | **51** (38.6%) |
| Unmapped | **81** (61.4%) |

Same unmapped clusters as retention (semen, service instances, Phase 4 livestock/feed, support, smart AI ecosystem). Many unmapped models would inherit **RET-FARM** / **DC-3** or **RET-REFERENCE** / **DC-1** by domain — but **inheritance is not documented**, so PR reviewers lack a single checklist row per model.

### 3.3 RoPA linkage (P-01–P-14)

| Check | Result | Verdict |
|-------|--------|---------|
| 14 processing activities registered | [ROPA_REGISTER.md](./ROPA_REGISTER.md) | **Pass** |
| Sub-processor table | OpenAI/Anthropic, FCM, SMS, Sentry, S3 | **Pass** (DPA status "Required") |
| Legal basis marked "draft" | All rows | **Pending legal** |
| Phase 4 / semen / support activities | Not separate RoPA rows | **Partial** — folded into P-04/P-06 |

**Classification verdict:** **Framework pass; inventory partial pass.** Suitable for engineering guidance on core flows; **not exhaustive** for full schema.

---

## 4. Audit requirements

### 4.1 Tier A1–A5 (required systems)

| System | Tier | Storage | Append-only | Admin query | Code evidence | Verdict |
|--------|------|---------|-------------|-------------|---------------|---------|
| `LegalConsentEvent` | A1 | PostgreSQL | ✅ Design | `GET /api/admin/legal-consent` | `legal-consent-audit.ts` | **Pass** |
| `AuthAuditEvent` | A2 | PostgreSQL | ✅ | Admin audit / SQL | `auth-audit.service.ts`, OTP flows | **Pass** |
| `ServiceRequestTimelineEvent` | A3 | PostgreSQL | ✅ | Service APIs | `timeline.service.ts` | **Pass** |
| Treatment audit | A3 | PostgreSQL | ✅ | Doctor panel | `appendTreatmentAudit` in treatment-workflow | **Pass** |
| `AiSafetyAuditLog` | A4 | PostgreSQL | ✅ | AI ops | `ai-audit.service.ts`, veterinary repo | **Pass** |
| `AiGovernanceStateHistory` | A4 | PostgreSQL | ✅ | Admin AI ops | `ai-governance.service.ts` | **Pass** |
| `ServiceInstanceAuditEvent` | A5 | PostgreSQL | ✅ | Admin semen/AI tech | `audit-service.ts` | **Pass** |
| Admin monitoring events | A5 | Web → logs | ✅ | Server logs | `/api/admin/monitoring/events` | **Pass** |
| `AiUsageRecord` | A5 | PostgreSQL | Metrics | Admin AI ops | Schema + usage module | **Pass** |

### 4.2 Consent audit depth

| Check | Implementation | Verdict |
|-------|----------------|---------|
| PRIVACY, TERMS, AI_PROCESSING, VET_ADVICE → `LegalConsentEvent` | `consent-registry.ts` (4 types); settings sync + dedicated accept routes | **Pass** |
| VET_ADVICE metadata (surface, serviceRequestId) | `mobile-settings-service.ts` on accept | **Pass** |
| Admin list returns `metadata` | `listLegalConsentEvents` **omits** `metadata`, `userAgent` | **Fail** |
| Admin overview includes vet acceptance | `getAdminConsentOverview` counts privacy/terms/AI only | **Partial** |
| AI accept duplicate path | Settings sync + `POST …/ai-disclaimer/accept` both audit | **Partial** (duplicate risk) |

### 4.3 Parallel legal audit track (gap)

| System | Purpose | In AUDIT_REQUIREMENTS.md | Verdict |
|--------|---------|--------------------------|---------|
| `LegalAcceptanceEvent` | Admin/doctor ToS acceptance (`legal-acceptance.service.ts`) | **Not listed** | **Gap** |
| `LegalDocument` | Versioned legal CMS | **Not listed** | **Gap** |

Mobile consent uses `LegalConsentEvent`; admin/doctor legal gate uses `LegalAcceptanceEvent`. Policy should document **both** under A1 or cross-reference [LEGAL_OPERATIONS.md](../legal/LEGAL_OPERATIONS.md).

### 4.4 Tier A6 (target — not implemented)

| Event ID | Status | Verdict |
|----------|--------|---------|
| `ADMIN_DATA_ACCESS` | Not implemented | **Open P1** |
| `ACCOUNT_ERASURE_REQUESTED` / `COMPLETED` | Manual ticket only | **Open P1** |
| `DSAR_EXPORT_DELIVERED` | Manual ticket only | **Open P1** |
| `RETENTION_PURGE_RUN` | No jobs | **Open P2** |

### 4.5 Log hygiene

| Check | Status | Verdict |
|-------|--------|---------|
| Auth audit never throws | `recordAuthAudit` try/catch | **Pass** |
| Consent audit never throws | `recordLegalConsentEvent` try/catch | **Pass** |
| DC-4 bodies excluded from Pino (policy) | Not statically verified | **Unknown** |
| Crash reporting scrubbing | Documented in ops | **Ops** |

**Audit verdict:** **Pass with gaps (74/100)** — core append-only stores and consent/auth trails exist; admin visibility and A6 events incomplete.

---

## 5. Operational readiness

### 5.1 Runbook & roles

| Check | Location | Verdict |
|-------|----------|---------|
| DSAR procedure + 30-day SLA | DATA_PROCESSING_OPERATIONS §3 | **Pass** |
| Erasure procedure + pre-checks | §4 | **Pass** |
| Manual retention until jobs ship | §5 | **Pass** |
| Incident response | §8 | **Pass** |
| Role matrix (SUPER_ADMIN, ADMIN, SUPPORT) | §1 | **Pass** |
| Policy change management | §2 | **Pass** |

### 5.2 Admin surfaces (no new APIs required)

| Task | Documented path | Verified in code | Verdict |
|------|-----------------|------------------|---------|
| Legal / privacy versions | Admin → Settings → Legal | `AdminLegalSettingsForm.tsx` | **Pass** |
| Consent audit list | `GET /api/admin/legal-consent` | Route + form table | **Pass** |
| Consent overview | `GET /api/admin/consent/overview` | Missing vet counts | **Partial** |
| AI ops / kill switch | Admin → AI Ops | AI governance service | **Pass** |
| Vet disclaimer admin | Admin → Settings → Veterinary Disclaimer | Separate compliance track | **Pass** |
| DSAR / erasure | Support ticket + manual SQL | No admin UI (by design) | **Pass** (manual) |

### 5.3 Automation & legal gates

| Gate | Status | Verdict |
|------|--------|---------|
| Retention purge worker | Not registered | **Blocker for prod scale** |
| Account erasure worker | Not implemented | **Blocker for self-serve erasure** |
| DSAR export API | Not implemented | **Manual only** |
| RoPA legal sign-off | Draft bases | **Blocker for external audit** |
| LLM vendor DPAs | Not in repo | **P0 legal** |
| Legal hold flag on User | Documented as future | **Not implemented** |

### 5.4 Support KB alignment

Runbook references support scenarios (delete account, export data, stop AI). **No dedicated support KB article path verified** — ops should publish ticket templates referencing [DATA_PROCESSING_OPERATIONS.md](./DATA_PROCESSING_OPERATIONS.md) §12.

**Operational readiness verdict:** **Conditional pass (68/100)** — team can operate manually with trained support; not ready for high-volume DSAR/erasure or unattended retention compliance.

---

## 6. Gap register (prioritized)

| ID | Gap | Area | Severity | Remediation |
|----|-----|------|----------|-------------|
| DG-01 | 68/132 Prisma models not in retention mapping | Retention | **High** | Add Phase 4 / semen / support appendix to RETENTION_MAPPING |
| DG-02 | 81/132 models not in classification table | Classification | **High** | Extend DATA_CLASSIFICATION §4 or domain inheritance rules |
| DG-03 | Zero retention purge jobs | Retention | **High** | Implement worker jobs per §5 registry |
| DG-04 | No erasure/DSAR automation | Operations | **High** | R-01, R-02 backlog |
| DG-05 | `LegalAcceptanceEvent` omitted from audit doc | Audit | **Medium** | Update AUDIT_REQUIREMENTS A1 |
| DG-06 | Admin consent API omits `metadata` | Audit | **Medium** | Extend `listLegalConsentEvents` select |
| DG-07 | Admin overview omits vet disclaimer counts | Operations | **Medium** | Extend `getAdminConsentOverview` |
| DG-08 | Mobile cache TTL doc mismatch | Retention | **Low** | Fix RETENTION_MAPPING §3 to match `LocalCacheContract` |
| DG-09 | RoPA / legal bases not counsel-approved | Legal | **High** | Legal review queue |
| DG-10 | No compliance integration tests for retention | Audit | **Medium** | P4 automation |

---

## 7. Recommendations

### P0 — Before external audit or Play Store data safety attestation

1. Legal review and sign-off on [ROPA_REGISTER.md](./ROPA_REGISTER.md) lawful bases and retention periods (especially RET-CLINICAL 7–10y).
2. Execute and file LLM/SMS/cloud DPAs; update RoPA sub-processor status column.
3. Map **SupportTicket**, **ServiceInstance***, **Livestock***, and **LegalAcceptanceEvent** in retention + classification docs.

### P1 — Before production scale

1. Ship retention purge jobs (start with RET-OTP, RET-NOTIFICATION, RET-AUTH-AUDIT).
2. Implement erasure worker aligned with RETENTION_MAPPING §4 matrix.
3. Extend admin consent API/UI: `metadata`, `VET_ADVICE` overview counts.
4. Add `ADMIN_DATA_ACCESS` audit on admin customer/clinical reads.

### P2 — Maturity

1. DSAR self-serve export API.
2. `platform.retention.config` Setting for tunable TTLs without redeploy.
3. Quarterly automated report: model coverage vs schema diff.

---

## 8. Verification checklist (summary)

| Item | Status |
|------|--------|
| Policy documentation suite complete | ✅ |
| RET-* categories defined | ✅ |
| Core clinical/identity/AI models mapped | ✅ |
| Full schema model coverage | ❌ (48.5%) |
| Purge jobs implemented | ❌ |
| A1–A5 audit systems exist | ✅ |
| A6 target events | ❌ |
| Operations runbook publishable | ✅ |
| Legal / RoPA sign-off | ⏳ Pending |
| Production unattended compliance | ❌ |

---

## 9. Score methodology

| Area | Weight | Score | Weighted |
|------|--------|-------|----------|
| Retention coverage | 30% | 52 | 15.6 |
| Classification coverage | 25% | 50 | 12.5 |
| Audit requirements | 25% | 74 | 18.5 |
| Operational readiness | 20% | 68 | 13.6 |
| **Total** | 100% | — | **60.2 → 62/100** |

Scores reflect **documentation-first implementation** validated against codebase. Automation and legal sign-off cap the total until P0/P1 items close.

---

*Next review: After first retention worker ships or quarterly (2026-08-30), whichever is sooner.*
