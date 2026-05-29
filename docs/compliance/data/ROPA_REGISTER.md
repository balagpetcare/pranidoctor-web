# Record of Processing Activities (RoPA)

**Version:** 1.0.0  
**Date:** 2026-05-30  
**Controller:** Prani Doctor (platform operator — legal entity name per counsel)  
**Parent policy:** [DATA_PROCESSING_POLICY.md](./DATA_PROCESSING_POLICY.md)

---

## Processing activities register

| ID | Activity name | Data subjects | Categories | Recipients | Purpose | Legal basis (draft) | Retention | Transfers |
|----|---------------|---------------|------------|------------|---------|---------------------|-----------|-----------|
| **P-01** | Account & authentication | All users | Identity, credentials, device, IP/UA | Platform | Register, login, session security | Contract / LI | RET-ACCOUNT, RET-SESSION, RET-AUTH-AUDIT | Local DB |
| **P-02** | Service booking & dispatch | Customers, doctors | Profile, location, animal, symptoms | Assigned doctor/technician | Book and track veterinary services | Contract | RET-CLINICAL | Local DB |
| **P-03** | Clinical treatment & Rx | Customers, doctors | Diagnosis, Rx, notes, attachments | Doctor, customer (limited view) | Document veterinary care | Contract | RET-CLINICAL (7–10y) | Local DB |
| **P-04** | Farm management | Customers | Animal, milk, feed, health, finance | Platform | Livestock ERP features | Contract | RET-FARM | Local DB |
| **P-05** | AI advisory (LLM) | Customers | Chat, triage, voice text, context summaries | OpenAI, Anthropic | Educational livestock guidance | Consent | RET-AI-CHAT, RET-VOICE | **International** |
| **P-06** | AI field technician service | Customers, technicians | Breeding/job details, location area | Assigned technician | Artificial insemination field service | Contract | RET-CLINICAL | Local DB |
| **P-07** | Notifications | Customers | Push token, message title/body | Google FCM, SMS gateway | Transactional & optional marketing | Contract / consent | RET-NOTIFICATION | **International** (FCM) |
| **P-08** | Billing & payments | Customers, doctors | Amounts, status, references | Payment processor (future) | Invoicing and settlement | Contract / legal | RET-FINANCIAL | TBD |
| **P-09** | Security & fraud | All users | IP, UA, auth outcomes | Platform | Prevent abuse | Legitimate interest | RET-AUTH-AUDIT | Local DB |
| **P-10** | Legal & consent proof | Customers | Consent type, version, metadata | Platform | Demonstrate compliance | Legal obligation | RET-CONSENT | Local DB |
| **P-11** | Platform analytics | Admins (aggregates) | Counts, token usage, KPIs | Platform | Operate and improve service | LI | RET-AI-METRICS, RET-METRICS | Local DB |
| **P-12** | Crash & reliability | Customers | Stack traces, device info | Sentry, Crashlytics | Stability | LI | RET-CRASH | **International** |
| **P-13** | Offline sync | Customers | Mutation payloads in queue | Platform | Resilience when offline | Contract | RET-OFFLINE | Local DB + device |
| **P-14** | Media storage | All uploaders | Files, MIME, dimensions | S3/MinIO | Profile, clinical attachments, documents | Contract | RET-MEDIA-ACTIVE, RET-MEDIA | Cloud region per host |

---

## Sub-processors summary

| Processor | Activities | DPA status |
|-----------|------------|------------|
| OpenAI / Anthropic | P-05 | Required — legal |
| Google (FCM) | P-07 | Terms + DPA review |
| SMS provider | P-01, P-07 | BTRC compliance |
| Sentry / Crashlytics | P-12 | DPA + scrubbing config |
| Cloud / S3 provider | P-14, all DB | Infrastructure agreement |

---

## Data subject rights (summary)

| Right | Activities affected | Process |
|-------|---------------------|---------|
| Access | All | DSAR — [DATA_PROCESSING_OPERATIONS.md](./DATA_PROCESSING_OPERATIONS.md) §3 |
| Rectification | P-01, P-04 | In-app edit |
| Erasure | Most except RET-FINANCIAL, RET-CLINICAL carve-out | Support ticket |
| Restrict | P-05, P-07 marketing | Consent withdraw, notification settings |
| Object | P-07 marketing | `marketingEnabled=false` |

---

## Review log

| Date | Reviewer | Change |
|------|----------|--------|
| 2026-05-30 | Platform engineering | Initial RoPA from as-built inventory |

**Next review:** 2026-08-30 or before major feature release.

---

*Detailed inventory: [data-processing-policy-plan.md](./data-processing-policy-plan.md) §3*
