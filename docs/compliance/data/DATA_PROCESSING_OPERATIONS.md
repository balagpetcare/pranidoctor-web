# Data Processing — Operations Guide

**Version:** 1.0.0  
**Date:** 2026-05-30  
**Status:** Implemented (documentation)  
**Audience:** Platform ops, support leads, release engineering, admin superusers

---

## Overview

This runbook implements [DATA_PROCESSING_POLICY.md](./DATA_PROCESSING_POLICY.md) day-to-day. It covers **administrative management** of classification, retention, audit, DSAR, erasure, and policy updates — without changing application APIs or architecture.

| Topic | Canonical doc |
|-------|---------------|
| Policy statement | [DATA_PROCESSING_POLICY.md](./DATA_PROCESSING_POLICY.md) |
| Classification | [DATA_CLASSIFICATION.md](./DATA_CLASSIFICATION.md) |
| Retention mapping | [RETENTION_MAPPING.md](./RETENTION_MAPPING.md) |
| Audit requirements | [AUDIT_REQUIREMENTS.md](./AUDIT_REQUIREMENTS.md) |
| RoPA | [ROPA_REGISTER.md](./ROPA_REGISTER.md) |
| Legal consent ops | [../legal/LEGAL_OPERATIONS.md](../legal/LEGAL_OPERATIONS.md) |

---

## 1. Administrative roles

| Role | Data processing duties |
|------|------------------------|
| **SUPER_ADMIN** | Approve erasure, legal hold release, retention config changes |
| **ADMIN** | Legal/disclaimer settings, consent audit review, AI ops |
| **SUPPORT** | Intake DSAR/erasure tickets; identity verification; no bulk export without approval |
| **Engineering on-call** | Incident containment, session revoke, kill switch |

**Rule:** Admin access to customer/clinical records is **need-to-know**. Document reason in support ticket until `ADMIN_DATA_ACCESS` audit ships.

---

## 2. Policy change management

### 2.1 Internal policy update

1. Draft change in `docs/compliance/data/` (PR review: engineering + legal).
2. Bump version in `DATA_PROCESSING_POLICY.md` and affected child docs.
3. Update [ROPA_REGISTER.md](./ROPA_REGISTER.md) review log if processing activities change.
4. If public impact: coordinate with [LEGAL_OPERATIONS.md](../legal/LEGAL_OPERATIONS.md) for privacy/terms publish.
5. Announce in `#ops` / release notes for support.

### 2.2 Retention period change

1. Edit RET-* periods in [RETENTION_MAPPING.md](./RETENTION_MAPPING.md) and summary in [../legal/DATA_RETENTION.md](../legal/DATA_RETENTION.md).
2. File engineering ticket for purge job threshold update (when jobs exist).
3. **Do not** retroactively delete data already past old TTL without legal sign-off.

### 2.3 New sub-processor

1. Add row to [ROPA_REGISTER.md](./ROPA_REGISTER.md) sub-processors.
2. Execute DPA before production traffic.
3. Update public [PRIVACY_POLICY.md](../legal/PRIVACY_POLICY.md) § processors.
4. Update Play Store / App Store data safety declarations.

---

## 3. Data subject access requests (DSAR)

**SLA:** 30 calendar days from verified identity.

### 3.1 Intake (support)

1. Create ticket: type `DSAR`, include user phone/email.
2. Verify identity: OTP to registered phone **or** in-app authenticated request.
3. Assign to ops lead; tag `data-processing`.

### 3.2 Fulfillment (ops + engineering)

| Step | Action |
|------|--------|
| 1 | Confirm user `User.id` in admin tools |
| 2 | Export: profile, animals, service requests (metadata), consent timeline |
| 3 | **Exclude** other customers’ data, doctor credentials, full admin logs |
| 4 | Deliver encrypted zip or secure link; record delivery date in ticket |
| 5 | Future: automated export API (backlog R-01) |

### 3.3 DSAR audit record (manual until A6 event)

Log in ticket: `userId`, `scope`, `deliveredAt`, `handlerAdminId`.

---

## 4. Erasure requests

**SLA:** 30 calendar days from verified identity.

### 4.1 Pre-checks

| Check | Action if fail |
|-------|----------------|
| Open billing dispute | Hold until resolved |
| Active service request | Complete or cancel first |
| Legal hold | Do not proceed — legal approval |
| Doctor account with open clinical duties | Provider offboarding workflow |

### 4.2 Erasure procedure (manual)

1. Verify identity (OTP).
2. Revoke all sessions: `UserSession`, `RefreshToken`, clear `UserDevice.pushToken`.
3. Set `User.status = DELETED`.
4. Anonymize `CustomerProfile` / `User` PII fields (name → `Deleted User`, phone → freed per schema rules).
5. **Retain** per [RETENTION_MAPPING.md](./RETENTION_MAPPING.md) §4: clinical, financial, consent/auth audit until TTL.
6. Delete: notifications, AI chat (when policy requires), offline sync items, media solely owned.
7. Request S3 delete for orphaned `UploadedFile` rows.
8. Stop marketing: `NotificationSettings.marketingEnabled=false`.
9. Withdraw AI consent via consent API if automated path unavailable.
10. Close ticket; record `ACCOUNT_ERASURE_COMPLETED` (manual log until A6).

### 4.3 Processor follow-up

| Processor | Action |
|-----------|--------|
| FCM | Token cleared on device revoke |
| LLM vendors | No standing delete API — stop new calls; retention per vendor policy |
| Sentry | Request project scrub if user email in crash |

---

## 5. Retention operations

### 5.1 Until automated jobs ship

| Category | Manual procedure | Frequency |
|----------|------------------|-----------|
| RET-OTP | DB query delete expired `MobileOtpChallenge` | Weekly |
| RET-NOTIFICATION | Delete `Notification` older than 12 months | Monthly |
| RET-CONSENT | Archive then delete `LegalConsentEvent` > 24 months | Quarterly |
| RET-AUTH-AUDIT | Delete `AuthAuditEvent` > 18 months | Quarterly |

**Always** log: job name, rows affected, run timestamp (no row content).

### 5.2 S3 orphan media

- Enable bucket lifecycle rule: abort incomplete multipart 7d; expire prefix `uploads/tmp/` 90d.
- Cross-check `UploadedFile` with no references — ops ticket.

### 5.3 Mobile cache

No server action — document user guidance: logout clears auth; reinstall clears local DB.

---

## 6. Audit operations

### 6.1 Consent audit review

**Admin path:** Settings → Legal (consent events)  
**API:** `GET /api/admin/legal-consent?consentType=AI_PROCESSING` (also `PRIVACY`, `VET_ADVICE`)

Monthly review:

- Spike in `VALIDATION_ERROR` / version mismatch on accept endpoints
- Users with null `privacyAcceptedVersion` while enforcement on

### 6.2 Auth audit review

Monitor failed login rate via admin audit or SQL on `AuthAuditEvent`.

### 6.3 AI governance

Review `AiGovernanceStateHistory` after any kill-switch toggle. Document reason in ticket.

### 6.4 Log sampling (quarterly)

Sample production info logs — confirm no DC-4 field values. Escalate to engineering if found.

---

## 7. Classification management

When shipping a feature:

1. Assign DC tier in design doc ([DATA_CLASSIFICATION.md](./DATA_CLASSIFICATION.md)).
2. Assign RET-* and RoPA ID.
3. PR checklist: logging review, retention note, consent gate if DC-4 + LLM.

**Admin data handling:**

- Do not download bulk customer exports to personal devices.
- Do not share admin credentials.
- Use admin panel only over HTTPS on managed devices.

---

## 8. Incident response (data breach)

| Step | Owner | Timebox |
|------|-------|---------|
| Contain (revoke, disable feature) | On-call | Immediate |
| Scope (which tiers, how many users) | Ops + eng | 4 hours |
| Notify legal/compliance | Support lead | 24 hours |
| User/regulator notification | Legal | Per counsel |
| Post-mortem + policy update | Engineering | 5 business days |

---

## 9. Admin UI reference (no new APIs)

| Task | Location |
|------|----------|
| Legal / privacy versions | Admin → Settings → Legal |
| AI disclaimer | Admin → Settings → AI Disclaimer |
| Veterinary disclaimer | Admin → Settings → Veterinary Disclaimer |
| Consent audit | Admin → Settings → Legal (events) / `GET /api/admin/legal-consent` |
| AI usage / kill switch | Admin → AI Ops |
| Service requests / customers | Admin dashboards (proxy to backend) |

---

## 10. Environment variables (processing-related)

| Variable | Purpose |
|----------|---------|
| `MOBILE_ENFORCE_PRIVACY_CONSENT` | Privacy API gate |
| `MOBILE_LEGAL_GATE_ENABLED` | Client legal gate |
| `STORAGE_DRIVER` | `disabled` turns off uploads in dev |
| `OTP_MODE` | `live` enables real SMS processing |
| Sentry / Crashlytics DSNs | Crash reporting — configure scrubbing before prod |

---

## 11. Verification checklist (ops)

- [ ] RoPA register reviewed this quarter
- [ ] Retention mapping matches deployed features
- [ ] DSAR/erasure SLA documented in support KB
- [ ] Sub-processor list matches live integrations
- [ ] Consent audit sampled monthly
- [ ] No bulk PII exports outside ticket trail

---

## 12. Support quick reference

| User report | First action |
|-------------|--------------|
| "Delete my account" | Open erasure ticket → §4 |
| "Send me my data" | Open DSAR ticket → §3 |
| "Stop marketing messages" | Confirm `marketingEnabled=false` |
| "Stop AI using my data" | AI consent withdraw + explain AI features disabled |
| "Wrong information" | Guide to profile/animal edit (rectification) |

---

*Engineering backlog for automation: see [data-processing-policy-plan.md](./data-processing-policy-plan.md) §12 and [../legal/COMPLIANCE_NOTES.md](../legal/COMPLIANCE_NOTES.md)*
