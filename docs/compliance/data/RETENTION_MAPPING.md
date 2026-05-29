# Retention Mapping — Prani Doctor Platform

**Version:** 1.0.0  
**Date:** 2026-05-30  
**Status:** Approved  
**Summary schedule:** [../legal/DATA_RETENTION.md](../legal/DATA_RETENTION.md)  
**Parent policy:** [DATA_PROCESSING_POLICY.md](./DATA_PROCESSING_POLICY.md)

---

## 1. Retention categories (`RET-*`)

| Category ID | Human label | Retention period | Deletion method | Job / implementation |
|-------------|-------------|------------------|-----------------|----------------------|
| **RET-ACCOUNT** | Active user & profile | Account lifetime | Erasure workflow | Manual + planned `ErasureWorker` |
| **RET-ERASURE-BUFFER** | Post-erasure PII buffer | 30 days after verified erasure | Anonymize / cascade | Planned |
| **RET-OTP** | OTP challenges | ≤ 10 minutes | DB expiry | ✅ `MobileOtpChallenge.expiresAt` |
| **RET-SESSION** | Sessions & refresh tokens | Until expiry or revoke | Automatic | ✅ |
| **RET-DEVICE** | Device registry | Revoke + **90 days** | Batch delete | Planned |
| **RET-CLINICAL** | Service, treatment, Rx | **7–10 years** (legal review) | Archive / anonymize on erasure | Policy; no TTL job |
| **RET-FINANCIAL** | Billing & payments | Statutory (align with tax law) | Archive | Policy |
| **RET-AI-CHAT** | AI messages, triage, voice text | **18 months** inactive session | Anonymize / delete | Planned |
| **RET-AI-METRICS** | AI usage detail | **24 months** | Aggregate then purge detail | Planned |
| **RET-VOICE** | Voice transcripts | **90 days** (no audio default) | Batch delete | Planned |
| **RET-NOTIFICATION** | In-app notifications | **12 months** | Batch delete | Planned |
| **RET-CONSENT** | Legal consent audit | **24 months** | Batch delete | Planned |
| **RET-AUTH-AUDIT** | Auth audit events | **18 months** | Batch delete | Planned |
| **RET-OFFLINE** | Terminal offline sync items | **30 days** | Batch delete | Planned |
| **RET-MEDIA** | Orphan uploads | **90 days** unreferenced | S3 lifecycle + DB | Planned |
| **RET-MEDIA-ACTIVE** | Referenced media | Life of reference | With entity delete | ✅ API delete |
| **RET-FARM** | Farm ERP records | Account lifetime | User delete APIs / erasure | ✅ Per-module DELETE |
| **RET-REFERENCE** | Location & catalog | Indefinite | Admin only | N/A |
| **RET-CONFIG** | Platform settings | Indefinite | Admin versioned update | N/A |
| **RET-CRASH** | Crash reports (vendor) | **90 days** | Vendor retention settings | Ops |
| **RET-METRICS** | Prometheus / logs | **14–30 days** hot | Ops rotation | Ops |
| **RET-LOCAL** | Mobile SQLite cache | **24h–7d** | Client TTL | ✅ `LocalCacheContract` |

---

## 2. Model → retention category map

### Identity & authentication

| Model / store | Classification | Retention | On account erasure |
|---------------|----------------|-----------|-------------------|
| `User` | DC-3 | RET-ACCOUNT | `status=DELETED` → RET-ERASURE-BUFFER |
| `CustomerProfile`, `DoctorProfile`, `AiTechnicianProfile`, `AdminProfile` | DC-3 | RET-ACCOUNT | Anonymize or cascade |
| `MobileUserSettings` | DC-3 | RET-ACCOUNT | Delete with user |
| `MobileOtpChallenge` | DC-4 | RET-OTP | Hard delete (expired) |
| `UserSession`, `RefreshToken` | DC-4 | RET-SESSION | Revoke immediately |
| `UserDevice` | DC-3 | RET-DEVICE | Clear push token; delete after 90d |
| `AuthAuditEvent` | DC-4 | RET-AUTH-AUDIT | **Retain** until TTL |

### Clinical & service

| Model | Classification | Retention | On account erasure |
|-------|----------------|-----------|-------------------|
| `ServiceRequest` | DC-4 | RET-CLINICAL | Anonymize customer link if permitted |
| `ServiceRequestTimelineEvent` | DC-4 | RET-CLINICAL | With request |
| `TreatmentCase`, `TreatmentWorkflow`, `TreatmentConsultation`, `TreatmentFollowup`, `TreatmentNote` | DC-4 | RET-CLINICAL | Anonymize author/customer refs |
| `Prescription`, `PrescriptionItem` | DC-4 | RET-CLINICAL | Retain clinical facts |
| `Review` | DC-3 | RET-CLINICAL | Anonymize or delete |
| `Lead`, `LeadActivity` | DC-3 | RET-CLINICAL / RET-FARM | Delete or anonymize |

### Financial

| Model | Classification | Retention | On account erasure |
|-------|----------------|-----------|-------------------|
| `BillingRecord`, `PaymentRecord` | DC-4 | RET-FINANCIAL | **Retain** per tax law |

### Farm management

| Model | Classification | Retention | On account erasure |
|-------|----------------|-----------|-------------------|
| `AnimalProfile` | DC-3 | RET-FARM | Deactivate or delete if no restrict |
| `HealthEvent`, `VaccineRecord`, `MilkRecord`, `FeedRecord`, `FinanceRecord` | DC-3/DC-4 | RET-FARM | User DELETE APIs |
| `FatteningBatch`, `WeightRecord`, … | DC-3 | RET-FARM | User DELETE APIs |
| `FarmTreatment` (mobile journal) | DC-3 | RET-FARM | User DELETE APIs |

### AI & voice

| Model | Classification | Retention | On account erasure |
|-------|----------------|-----------|-------------------|
| `AiAssistantSession`, `AiAssistantMessage`, `AiAssistantMemory` | DC-4 | RET-AI-CHAT | Purge / anonymize |
| `AiTriageRecord`, `AiEscalationRecord` | DC-4 | RET-AI-CHAT | Purge / anonymize |
| `AiSafetyAuditLog` | DC-4 | RET-AI-CHAT | Align with session TTL |
| `AiUsageRecord` | DC-3 | RET-AI-METRICS | Purge detail; keep rollups |
| `AiUsageDailyRollup` | DC-2 | RET-AI-METRICS | Longer aggregate retention |
| `AiGovernanceStateHistory` | DC-2 | RET-CONFIG | Indefinite (low volume) |
| `VoiceSession`, `VoiceTranscript`, `VoiceNavigationEvent` | DC-4 | RET-VOICE | Delete per TTL |

### AI technician (field service)

| Model | Classification | Retention | On account erasure |
|-------|----------------|-----------|-------------------|
| `AiServiceRequest`, `AiServiceRecord` | DC-4 | RET-CLINICAL | Service-life + billing rules |
| `AiTechnicianDocument` | DC-4 | RET-MEDIA-ACTIVE | Admin moderation lifecycle |

### Notifications & consent

| Model | Classification | Retention | On account erasure |
|-------|----------------|-----------|-------------------|
| `Notification` | DC-3 | RET-NOTIFICATION | Cascade delete |
| `NotificationSettings` | DC-3 | RET-ACCOUNT | Delete with user |
| `LegalConsentEvent` | DC-3 | RET-CONSENT | **Retain** until TTL |

### Media & offline

| Model / store | Classification | Retention | On account erasure |
|---------------|----------------|-----------|-------------------|
| `UploadedFile` + S3 object | DC-3 | RET-MEDIA-ACTIVE | Delete API + S3 remove |
| Unreferenced S3 keys | DC-3 | RET-MEDIA | Lifecycle purge |
| `OfflineSyncSession`, `OfflineSyncItem` | DC-3 | RET-OFFLINE | Purge terminal rows |
| `OfflineLeadDraft`, `OfflineConflictRecord` | DC-3 | RET-OFFLINE | Purge |

### Reference & config

| Model | Classification | Retention |
|-------|----------------|-----------|
| `Division` … `Village`, `Area`, `ServiceCategory` | DC-1 | RET-REFERENCE |
| `Setting` | DC-2 | RET-CONFIG |
| `ContentPost`, `ContentCategory` | DC-1 | RET-REFERENCE |

---

## 3. Mobile local cache → retention

| Cache key (Flutter) | TTL | Classification |
|---------------------|-----|----------------|
| `LocalCacheContract.profileKey` | 24h | DC-3 |
| `LocalCacheContract.aiDisclaimerKey`, `vetDisclaimerKey` | app config TTL | DC-2 |
| `LocalCacheContract.serviceRequestsListKey` | 24h | DC-4 |
| `LocalCacheContract.aiConversationKey` | 24h | DC-4 |
| Outbox payloads | Until sync | DC-3 |

Source: `pranidoctor_user/lib/core/offline/local_cache_contract.dart`.

---

## 4. Erasure action matrix

| Retention category | Account erasure action |
|--------------------|------------------------|
| RET-ACCOUNT | Anonymize PII fields; `User.status=DELETED` |
| RET-CLINICAL | Anonymize customer/doctor **linkage**; retain clinical content |
| RET-FINANCIAL | **Retain** |
| RET-CONSENT, RET-AUTH-AUDIT | **Retain** until category TTL |
| RET-AI-CHAT, RET-VOICE | **Delete** or anonymize |
| RET-MEDIA-ACTIVE | Delete if solely owned; else dereference |
| RET-NOTIFICATION | Delete |
| RET-OFFLINE | Delete pending items |

---

## 5. Purge job registry (planned)

| Job name | Category | Frequency | Owner |
|----------|----------|-----------|-------|
| `purge-expired-otp` | RET-OTP | Hourly | Backend worker |
| `purge-stale-devices` | RET-DEVICE | Daily | Backend worker |
| `purge-old-notifications` | RET-NOTIFICATION | Weekly | Backend worker |
| `purge-legal-consent-events` | RET-CONSENT | Monthly | Backend worker |
| `purge-auth-audit-events` | RET-AUTH-AUDIT | Monthly | Backend worker |
| `purge-inactive-ai-sessions` | RET-AI-CHAT | Weekly | Backend worker |
| `purge-ai-usage-detail` | RET-AI-METRICS | Monthly | Backend worker |
| `purge-voice-transcripts` | RET-VOICE | Weekly | Backend worker |
| `purge-offline-sync-terminal` | RET-OFFLINE | Daily | Backend worker |
| `s3-orphan-lifecycle` | RET-MEDIA | S3 rule | Ops |

**Config target:** `Setting` key `platform.retention.config` (JSON) — not yet implemented; periods above are policy defaults.

---

## 6. Legal hold

When `legalHold=true` on a user or service request (future flag):

- Suspend all purge jobs touching linked rows.
- Document hold reason and expiry in support ticket.
- Release hold only with legal/compliance approval.

---

## 7. Verification checklist

- [ ] New models assigned RET-* and erasure action before production
- [ ] Clinical models never hard-deleted by automated job without legal review
- [ ] Purge jobs log count + category only (no row content)
- [ ] `DATA_RETENTION.md` summary stays in sync when RET-* periods change

---

*Operational procedures: [DATA_PROCESSING_OPERATIONS.md](./DATA_PROCESSING_OPERATIONS.md)*
