# Audit Requirements — Data Processing

**Version:** 1.0.0  
**Date:** 2026-05-30  
**Status:** Approved  
**Parent policy:** [DATA_PROCESSING_POLICY.md](./DATA_PROCESSING_POLICY.md)

---

## 1. Purpose

Define **what must be audited**, **minimum event fields**, **retention**, and **implementation status** for Prani Doctor data processing accountability.

---

## 2. Audit tiers

| Tier | Description | Examples |
|------|-------------|----------|
| **A1 — Regulatory** | Proof of consent and legal compliance | `LegalConsentEvent` |
| **A2 — Security** | Authentication and access control | `AuthAuditEvent` |
| **A3 — Clinical workflow** | Care pipeline state changes | `ServiceRequestTimelineEvent`, treatment audit |
| **A4 — AI governance** | Safety, escalation, kill switch | `AiSafetyAuditLog`, `AiGovernanceStateHistory` |
| **A5 — Operations** | Admin actions, monitoring | Admin monitoring events, settings changes |
| **A6 — Target** | Not yet mandatory | `DataAccessLog`, erasure proof |

---

## 3. Required audit systems (as-built)

| System | Tier | Storage | Append-only | Retention cat. | Admin query |
|--------|------|---------|-------------|----------------|-------------|
| `LegalConsentEvent` | A1 | PostgreSQL | ✅ Design | RET-CONSENT | `GET /api/admin/legal-consent` |
| `AuthAuditEvent` | A2 | PostgreSQL | ✅ | RET-AUTH-AUDIT | Admin audit routes |
| `ServiceRequestTimelineEvent` | A3 | PostgreSQL | ✅ | RET-CLINICAL | Service detail APIs |
| Treatment audit (`appendTreatmentAudit`) | A3 | PostgreSQL | ✅ | RET-CLINICAL | Doctor panel |
| `AiSafetyAuditLog` | A4 | PostgreSQL | ✅ | RET-AI-CHAT | AI ops |
| `AiGovernanceStateHistory` | A4 | PostgreSQL | ✅ | RET-CONFIG | Admin AI ops |
| `ServiceInstanceAuditEvent` | A5 | PostgreSQL | ✅ | RET-CLINICAL | Admin semen/AI tech |
| Admin monitoring events | A5 | Web → API | ✅ | RET-METRICS | Admin monitoring |
| `AiUsageRecord` | A5 | PostgreSQL | N/A (metrics) | RET-AI-METRICS | Admin AI ops |

---

## 4. Event catalog — required fields

### A1 — Legal consent (`LegalConsentEvent`)

| Field | Required | Notes |
|-------|----------|-------|
| `userId` | Yes | Data subject |
| `consentType` | Yes | `PRIVACY`, `TERMS`, `AI_PROCESSING`, `VET_ADVICE` |
| `version` | Yes | Must match legal config version accepted |
| `channel` | Yes | Default `MOBILE` |
| `ipAddress`, `userAgent` | Recommended | From `authRequestContext` |
| `metadata.surface` | Recommended | e.g. `BOOKING_EMERGENCY`, `AI_CHAT` |
| `metadata.kind` | Recommended | e.g. `AI_DISCLAIMER_ACCEPT` |
| `createdAt` | Yes | Server timestamp |

**Must NOT log:** Full policy text, chat content, symptoms.

**Gap:** Admin list API omits `metadata` in select — compliance should query DB or extend API.

### A2 — Authentication (`AuthAuditEvent`)

| Field | Required | Notes |
|-------|----------|-------|
| `userId` | When known | Nullable on failed login |
| `action` | Yes | e.g. `LOGIN_SUCCESS`, `OTP_REQUEST` |
| `ipAddress`, `userAgent` | Recommended | |
| `metadata` | Optional | Reason codes, device id |
| `createdAt` | Yes | |

**Retention:** RET-AUTH-AUDIT (18 months).

### A3 — Service timeline

| Field | Required |
|-------|----------|
| `serviceRequestId` | Yes |
| `eventType` / status transition | Yes |
| `actorId` / role | Recommended |
| `createdAt` | Yes |

### A4 — AI safety

| Field | Required |
|-------|----------|
| `sessionId`, `userId` | When available |
| `action` | Yes (refusal, escalation, …) |
| `detailJson` | Structured codes only — no raw user message |

### A5 — Admin monitoring (web)

| Field | Required |
|-------|----------|
| Event name (normalized) | Yes |
| Admin user id | Yes |
| Route / action | Normalized — no query string PII |
| Timestamp | Yes |

---

## 5. Target audit events (A6 — implement in future phases)

| Event ID | Trigger | Min fields | Priority |
|----------|---------|------------|----------|
| `ADMIN_DATA_ACCESS` | Admin views customer/clinical detail | adminId, targetUserId, resourceType, resourceId, ip | P1 |
| `ACCOUNT_ERASURE_REQUESTED` | Support ticket opened | userId, ticketId, requester | P1 |
| `ACCOUNT_ERASURE_COMPLETED` | Erasure job done | userId, categoriesProcessed, anonymizedIds | P1 |
| `DSAR_EXPORT_DELIVERED` | Portable export sent | userId, scope, adminId | P1 |
| `RETENTION_PURGE_RUN` | Batch job completes | jobName, rowsDeleted, category | P2 |
| `MEDIA_SIGNED_URL_ISSUED` | Optional high-sensitivity download | fileId, requesterId, purpose | P3 |

---

## 6. Log hygiene (application logs)

| Do log | Do not log |
|--------|------------|
| Request ID, user ID, resource ID | Passwords, OTP, refresh tokens |
| HTTP method, normalized route, status | Request/response bodies (DC-4) |
| Error codes, latency | Chat messages, symptoms, Rx text |
| Consent type + version on accept | Full BN/EN policy bodies |

**Applies to:** Pino (backend), admin BFF logs, mobile crash breadcrumbs.

---

## 7. Tamper resistance

| Control | Status |
|---------|--------|
| Application never DELETEs `LegalConsentEvent` | ✅ By design |
| DB role restrictions on audit tables | ⚠️ Verify in production |
| Separate backup retention for audit tables | Ops |
| Admin cannot edit consent events via API | ✅ No update routes |

---

## 8. Compliance reports (queries)

| Report | Source | Filter |
|--------|--------|--------|
| Users on stale privacy version | `MobileUserSettings` vs legal config | `consentType=PRIVACY` |
| AI consent adoption | `LegalConsentEvent` | `AI_PROCESSING` |
| Vet disclaimer accepts | `LegalConsentEvent` | `VET_ADVICE` |
| Failed login spike | `AuthAuditEvent` | `LOGIN_FAILURE`, time window |
| AI kill switch changes | `AiGovernanceStateHistory` | All |

**Example SQL (consent):**

```sql
SELECT "consentType", "version", COUNT(*) AS n
FROM "LegalConsentEvent"
WHERE "createdAt" > NOW() - INTERVAL '30 days'
GROUP BY 1, 2
ORDER BY 1, 2;
```

---

## 9. Verification checklist

- [ ] Every new consent type writes `LegalConsentEvent` once per accept (no duplicate paths)
- [ ] Auth flows write `AuthAuditEvent` for success and failure
- [ ] AI refusal/escalation writes `AiSafetyAuditLog` without user message body
- [ ] Production logs sampled — no DC-4 content at info level
- [ ] Admin legal-consent API extended to return `metadata` (when implemented)
- [ ] Quarterly audit table row-count vs retention policy review

---

*Admin procedures: [DATA_PROCESSING_OPERATIONS.md](./DATA_PROCESSING_OPERATIONS.md)*
