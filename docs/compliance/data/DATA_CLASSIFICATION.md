# Data Classification Mapping — Prani Doctor

**Version:** 1.0.0  
**Date:** 2026-05-30  
**Status:** Approved  
**Parent policy:** [DATA_PROCESSING_POLICY.md](./DATA_PROCESSING_POLICY.md)

---

## 1. Classification tiers

| Tier | Code | Description | Examples | Default controls |
|------|------|-------------|----------|------------------|
| **Public** | DC-1 | Intended for public disclosure | Published content, location reference names (division names) | Integrity protection |
| **Internal** | DC-2 | Business operations without customer PII | Aggregated KPIs, feature flags, Prometheus metrics | Staff authentication |
| **Confidential** | DC-3 | Personal data (PII) | Name, phone, email, address hierarchy, device tokens | RBAC, TLS, no value logging |
| **Restricted** | DC-4 | High-sensitivity: clinical, auth secrets, financial | Symptoms, Rx, password hashes, billing, AI chat with health context | Minimum necessary, enhanced audit target, signed URLs |

**Rule:** Classify at the **highest tier** present in a record or payload.

---

## 2. Handling requirements by tier

| Requirement | DC-1 | DC-2 | DC-3 | DC-4 |
|-------------|------|------|------|------|
| Encrypt in transit (TLS) | Recommended | Yes | Yes | Yes |
| Encrypt at rest | Optional | Yes | Yes | Yes |
| Role-based access | No | Yes | Yes | Yes |
| Log field values | Yes | Aggregates only | **No** | **No** |
| Mobile local cache | N/A | Limited | TTL cache OK | Minimize; no long-term Rx/chat |
| Third-party share | N/A | Anonymized only | DPA + purpose limit | DPA + consent where required |
| Retention | N/A | Per RET-* | Per RET-* | Per RET-* + clinical carve-out |
| Erasure on account delete | N/A | Purge aggregates | Anonymize/delete | Anonymize clinical link; retain facts if required |

---

## 3. Domain classification matrix

| Domain | Tier | RoPA | Primary models / stores | Notes |
|--------|------|------|-------------------------|-------|
| Location reference (Division→Village) | DC-1 | P-02 | `Division`, `District`, … | Admin-maintained; no user PII |
| Content posts (published) | DC-1 | P-04 | `ContentPost` | Public CMS |
| Service categories, breeds catalog | DC-1 / DC-2 | P-02 | `ServiceCategory`, `LivestockBreed` | Reference |
| Feature flags, app config | DC-2 | P-11 | `Setting` | No user content |
| Admin analytics aggregates | DC-2 | P-11 | Analytics repos, `AiUsageDailyRollup` | Aggregated; rollups may hold counts only |
| Prometheus / HTTP metrics | DC-2 | P-11 | Time-series | Normalize route labels |
| User identity | DC-3 | P-01 | `User`, `*Profile` | Phone unique |
| Customer address / village | DC-3 | P-02, P-04 | `CustomerProfile`, `ServiceRequest.locationText` | Hierarchy selection |
| Device & session | DC-3 | P-01, P-07 | `UserDevice`, `UserSession`, `RefreshToken` | Security-sensitive |
| Animal profile (non-clinical fields) | DC-3 | P-04 | `AnimalProfile` | Linked to farmer |
| Farm ERP (milk, feed, finance) | DC-3 | P-04 | `MilkRecord`, `FeedRecord`, `FinanceRecord`, … | Business PII linkage |
| Notifications (in-app) | DC-3 | P-07 | `Notification` | May reference events |
| Uploaded media metadata | DC-3 | P-14 | `UploadedFile` | Bytes in S3 |
| Offline sync queue | DC-3 | P-13 | `OfflineSyncItem.payloadJson` | May contain PII — minimize TTL |
| Legal consent events | DC-3 | P-10 | `LegalConsentEvent` | No policy full text in metadata |
| OTP challenges | DC-4 | P-01 | `MobileOtpChallenge` | Hashed code; short TTL |
| Password hashes | DC-4 | P-01 | `User.passwordHash` | bcrypt |
| Service request clinical intent | DC-4 | P-02, P-03 | `ServiceRequest.problemOrSymptom` | Pre-visit symptoms |
| Treatment / consultation / Rx | DC-4 | P-03 | `TreatmentCase`, `Prescription`, `TreatmentNote`, … | Veterinary medical |
| AI chat & triage | DC-4 | P-05 | `AiAssistantMessage`, `AiTriageRecord` | LLM context |
| Voice transcripts | DC-4 | P-05 | `VoiceTranscript` | Audio off by default |
| AI technician job / breeding | DC-4 | P-06 | `AiServiceRequest`, `AiServiceRecord` | Field service |
| Billing & payments | DC-4 | P-08 | `BillingRecord`, `PaymentRecord` | Financial |
| Auth audit | DC-4 | P-09 | `AuthAuditEvent` | Security |
| Crash reports (vendor) | DC-3 / DC-4 | P-12 | Sentry/Crashlytics | Scrub PII before send |

---

## 4. Prisma model quick reference

| Model | Tier | Retention cat. |
|-------|------|----------------|
| `User` | DC-3 | RET-ACCOUNT |
| `CustomerProfile`, `DoctorProfile`, `AiTechnicianProfile`, `AdminProfile` | DC-3 | RET-ACCOUNT |
| `MobileOtpChallenge` | DC-4 | RET-OTP |
| `UserSession`, `RefreshToken` | DC-4 | RET-SESSION |
| `UserDevice` | DC-3 | RET-DEVICE |
| `MobileUserSettings`, `LegalConsentEvent` | DC-3 / DC-4 | RET-CONSENT |
| `AnimalProfile` | DC-3 | RET-ACCOUNT |
| `ServiceRequest` | DC-4 | RET-CLINICAL |
| `TreatmentCase`, `TreatmentWorkflow`, `TreatmentConsultation`, `TreatmentFollowup`, `TreatmentNote` | DC-4 | RET-CLINICAL |
| `Prescription`, `PrescriptionItem` | DC-4 | RET-CLINICAL |
| `BillingRecord`, `PaymentRecord` | DC-4 | RET-FINANCIAL |
| `AiAssistantSession`, `AiAssistantMessage`, `AiAssistantMemory` | DC-4 | RET-AI-CHAT |
| `AiTriageRecord`, `AiEscalationRecord`, `AiSafetyAuditLog` | DC-4 | RET-AI-CHAT |
| `AiUsageRecord`, `AiUsageDailyRollup` | DC-2 / DC-3 | RET-AI-METRICS |
| `VoiceSession`, `VoiceTranscript` | DC-4 | RET-VOICE |
| `Notification`, `NotificationSettings` | DC-3 | RET-NOTIFICATION |
| `UploadedFile` | DC-3 | RET-MEDIA |
| `OfflineSyncItem`, `OfflineSyncSession` | DC-3 | RET-OFFLINE |
| `AuthAuditEvent` | DC-4 | RET-AUTH-AUDIT |
| `Division` … `Village`, `Area` | DC-1 | RET-REFERENCE |
| `Setting` | DC-2 | RET-CONFIG |
| Health/milk/vaccine/farm modules | DC-3 / DC-4 | RET-FARM |

Full retention linkage: [RETENTION_MAPPING.md](./RETENTION_MAPPING.md).

---

## 5. API & log classification

| Surface | Typical payload tier | Logging rule |
|---------|---------------------|--------------|
| `POST /api/mobile/auth/*` | DC-4 | Log outcome only; never OTP |
| `POST /api/ai/*` | DC-4 | No message body in Pino |
| `POST /api/mobile/service-requests` | DC-4 | Log IDs + status; not symptoms |
| `GET /api/admin/*` (customer detail) | DC-3 / DC-4 | Target: access audit event |
| Mobile local cache keys | DC-3 | TTL per `LocalCacheContract` |
| Queue job payloads | DC-3 max | Avoid clinical text in Redis |

---

## 6. Labeling convention (future code)

When adding config or admin exports, use metadata:

```json
{
  "dataClassification": "DC-4",
  "retentionCategory": "RET-CLINICAL",
  "ropaPurposeId": "P-03"
}
```

No code change required for policy approval — convention for future features.

---

## 7. Verification checklist

- [ ] New Prisma models added to §4 table before merge
- [ ] New third-party integration assigned tier + RoPA ID
- [ ] Log review confirms no DC-4 field values at info level
- [ ] Admin export features gated by role and documented

---

*See [DATA_PROCESSING_OPERATIONS.md](./DATA_PROCESSING_OPERATIONS.md) for admin handling procedures.*
