# Data Processing Policy — Prani Doctor Platform

**Document type:** Internal data processing policy (canonical statement)  
**Version:** 1.0.0  
**Effective date:** 2026-05-30  
**Status:** Approved — operational controls in `DATA_PROCESSING_OPERATIONS.md`  
**Owner:** Platform Engineering + Legal/Compliance liaison  
**Scope:** All processing of personal and veterinary-adjacent data across Prani Doctor repositories

**Related documents**

| Document | Path |
|----------|------|
| Implementation plan | [data-processing-policy-plan.md](./data-processing-policy-plan.md) |
| Operations runbook | [DATA_PROCESSING_OPERATIONS.md](./DATA_PROCESSING_OPERATIONS.md) |
| Data classification | [DATA_CLASSIFICATION.md](./DATA_CLASSIFICATION.md) |
| Retention mapping | [RETENTION_MAPPING.md](./RETENTION_MAPPING.md) |
| Audit requirements | [AUDIT_REQUIREMENTS.md](./AUDIT_REQUIREMENTS.md) |
| RoPA register | [ROPA_REGISTER.md](./ROPA_REGISTER.md) |
| Governance report | [DATA_GOVERNANCE_REPORT.md](./DATA_GOVERNANCE_REPORT.md) |
| Public privacy policy | [../legal/PRIVACY_POLICY.md](../legal/PRIVACY_POLICY.md) |
| Retention schedule (summary) | [../legal/DATA_RETENTION.md](../legal/DATA_RETENTION.md) |

---

## 1. Purpose

This policy defines how Prani Doctor **collects, uses, stores, shares, retains, and deletes** data across the platform. It applies to engineering, operations, support, and admin users who handle production systems or customer data.

Public-facing commitments remain in the **Privacy Policy** and **Terms of Service**. This document is the **internal authoritative policy** for processing activities, classification, retention, access, audit, and administration.

---

## 2. Scope

| In scope | Out of scope |
|----------|--------------|
| Farmer/customer mobile app data | Anonymous market research not linked to users |
| Doctor and AI technician provider data | Third-party clinic systems outside the platform |
| Admin and support access | Employee HR records of Prani Doctor staff (separate HR policy) |
| AI advisory and voice processing | Foundation-model training on user content (prohibited without opt-in) |
| Notifications, media, analytics, audit logs | — |

**Repositories:** `pranidoctor-backend`, `pranidoctor_user`, `pranidoctor-web`.

---

## 3. Principles

1. **Lawfulness & transparency** — process data for documented purposes; disclose in privacy policy.
2. **Purpose limitation** — no secondary use (e.g. marketing from clinical notes) without consent.
3. **Data minimization** — collect and retain only what is necessary.
4. **Accuracy** — users may rectify profile and farm records via the app.
5. **Storage limitation** — retain per [RETENTION_MAPPING.md](./RETENTION_MAPPING.md); purge when TTL expires.
6. **Integrity & confidentiality** — RBAC, encryption in transit, private object storage, signed URLs.
7. **Accountability** — audit consent and auth events; operational runbook for DSAR and erasure.

---

## 4. Processing purposes

All processing must map to a **RoPA purpose ID** in [ROPA_REGISTER.md](./ROPA_REGISTER.md).

| ID | Purpose | Primary lawful basis (draft — counsel to confirm) |
|----|---------|---------------------------------------------------|
| P-01 | Account & authentication | Contract / legitimate interest (security) |
| P-02 | Service booking & dispatch | Contract |
| P-03 | Clinical treatment & prescriptions | Contract |
| P-04 | Farm management | Contract |
| P-05 | AI advisory (LLM) | Consent + contract |
| P-06 | AI field technician (insemination) service | Contract |
| P-07 | Notifications | Contract / consent (marketing) |
| P-08 | Billing & payments | Contract / legal obligation |
| P-09 | Security & fraud prevention | Legitimate interest |
| P-10 | Legal & consent proof | Legal obligation |
| P-11 | Platform operations & analytics | Legitimate interest |
| P-12 | Crash & reliability | Legitimate interest |
| P-13 | Offline sync | Contract |
| P-14 | Media storage | Contract |

**Prohibited processing**

- Sale of personal data.
- Use of clinical content for unrelated advertising.
- Training public foundation models on user content without explicit opt-in and executed DPA.
- Continuous GPS tracking without disclosure and consent.

---

## 5. Data classification

All stored or transmitted data must be assigned a **classification tier** per [DATA_CLASSIFICATION.md](./DATA_CLASSIFICATION.md).

| Tier | Label | Handling summary |
|------|-------|------------------|
| **DC-1** | Public | No access restriction; still protect integrity |
| **DC-2** | Internal | Staff-only; no customer PII |
| **DC-3** | Confidential | PII; role-scoped access; no logging of field values |
| **DC-4** | Restricted | Clinical, credentials, financial; minimum necessary; enhanced audit target |

---

## 6. Retention

- **Canonical schedule:** [../legal/DATA_RETENTION.md](../legal/DATA_RETENTION.md)
- **Model-level mapping:** [RETENTION_MAPPING.md](./RETENTION_MAPPING.md)
- **Retention category IDs:** `RET-*` (see retention mapping)

Retention jobs are **documented**; automated purge workers are tracked in engineering backlog (see plan §12). Until jobs ship, ops follows manual procedures in [DATA_PROCESSING_OPERATIONS.md](./DATA_PROCESSING_OPERATIONS.md).

**Clinical carve-out:** Prescriptions, treatment cases, and billing may survive account erasure where law or care continuity requires — user linkage is **anonymized** where permitted.

---

## 7. Access control

| Role | Access principle |
|------|------------------|
| Customer | Own data only; API scoped by auth |
| Doctor | Assigned service requests and clinical tools |
| AI technician | Assigned field jobs and own profile |
| Admin | Least privilege via capability matrix; break-glass documented |

**Technical controls (as-built):** JWT/session auth, refresh rotation, consent gates (privacy, AI, vet disclaimer), upload owner checks, signed S3 URLs, admin `requireAdminPanelApiAccess`.

**Target:** Universal admin **data-access audit** for customer/clinical reads (see [AUDIT_REQUIREMENTS.md](./AUDIT_REQUIREMENTS.md) §4).

---

## 8. Deletion & user rights

| Right | Policy | Current channel |
|-------|--------|-----------------|
| Access / copy (DSAR) | 30-day SLA | Support → ops runbook |
| Rectification | Self-serve in app | Profile, animals, farm modules |
| Erasure | Verified identity; clinical carve-out | Support (no self-serve API yet) |
| Restrict processing | AI kill switch; marketing opt-out | Partial |
| Withdraw consent | Consent withdraw API + version tracking | Mobile settings / consent APIs |
| Object to marketing | `NotificationSettings.marketingEnabled` | App settings |

Deletion types: **hard delete**, **soft delete**, **anonymize**, **revoke**, **processor delete** — see plan §7.

---

## 9. Sub-processors

| Processor | Purpose | Data categories |
|-----------|---------|-----------------|
| OpenAI / Anthropic | LLM inference | AI prompts, context summaries |
| Google (FCM) | Push | Device tokens, notification payload |
| SMS provider | OTP | Phone number |
| Sentry / Crashlytics | Crash reports | Stack traces, device metadata |
| Cloud host / S3 | Hosting & media | All persisted categories |

International transfer may occur. Public privacy policy must disclose transfers and safeguards. DPAs required before production AI at scale.

---

## 10. Audit

Minimum audit requirements: [AUDIT_REQUIREMENTS.md](./AUDIT_REQUIREMENTS.md).

**Mandatory today:** append-only `LegalConsentEvent`, `AuthAuditEvent`, clinical timeline events, AI safety/governance history where applicable.

**Log hygiene:** Never log passwords, OTP codes, full chat bodies, or prescription text at info level.

---

## 11. Incident & breach

1. Contain (revoke sessions, disable feature flags as needed).
2. Assess scope using classification tiers and RoPA.
3. Notify legal/compliance within **24 hours** of confirmed personal-data breach.
4. User/regulator notification per Bangladesh Digital Security Act duties and counsel advice.
5. Post-incident review; update this policy if controls failed.

---

## 12. Policy review

| Trigger | Action |
|---------|--------|
| New major feature | RoPA + classification update |
| New sub-processor | DPA + privacy policy update |
| Retention job deployed | Update RETENTION_MAPPING implementation column |
| Regulatory change | Legal review of lawful bases |

**Review cadence:** Quarterly minimum, or before each production release affecting data flows.

---

## 13. Roles & responsibilities

| Role | Responsibility |
|------|----------------|
| **Legal / Compliance** | Approve lawful bases, public text, DPAs, breach notifications |
| **Engineering** | Implement controls, retention jobs, audit hooks |
| **Platform Ops** | Run retention/erasure procedures, monitor drift |
| **Support** | Intake DSAR/erasure tickets; identity verification |
| **Admin users** | Follow least privilege; no export of bulk PII without approval |

Administrative procedures: [DATA_PROCESSING_OPERATIONS.md](./DATA_PROCESSING_OPERATIONS.md).

---

*Approved for internal use. Does not replace legal advice.*
