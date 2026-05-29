# Data Retention Schedule — Prani Doctor



**Version:** 1.1  

**Date:** 2026-05-30  

**Status:** Policy approved — see [RETENTION_MAPPING.md](../data/RETENTION_MAPPING.md) for model-level detail



---



## Principles



1. Retain data only as long as needed for service delivery, legal obligation, or dispute resolution.

2. Minimize sensitive data in logs and third-party processors.

3. Anonymize where full deletion is not legally permitted (e.g. clinical records).



---



## Retention category index (`RET-*`)



Full definitions and Prisma model mapping: **[RETENTION_MAPPING.md](../data/RETENTION_MAPPING.md)**.



| Category | Period | Implementation |

|----------|--------|----------------|

| RET-ACCOUNT | Account lifetime | Manual + planned job |

| RET-ERASURE-BUFFER | 30 days post-erasure | Planned |

| RET-OTP | ≤ 10 minutes | ✅ |

| RET-SESSION | Until expiry/revoke | ✅ |

| RET-DEVICE | Revoke + 90 days | Planned |

| RET-CLINICAL | 7–10 years (legal review) | Policy only |

| RET-FINANCIAL | Statutory | Policy |

| RET-AI-CHAT | 18 months inactive | Planned |

| RET-AI-METRICS | 24 months detail | Planned |

| RET-VOICE | 90 days | Planned |

| RET-NOTIFICATION | 12 months | Planned |

| RET-CONSENT | 24 months | Planned |

| RET-AUTH-AUDIT | 18 months | Planned |

| RET-OFFLINE | 30 days terminal | Planned |

| RET-MEDIA (orphan) | 90 days | Planned |

| RET-LOCAL (mobile cache) | 24h–7d | ✅ |



---



## Schedule (summary)



| Data category | Retention period | Deletion method | Implementation |

|---------------|------------------|-----------------|----------------|

| Active user profile | Account lifetime | Erasure workflow | Manual + planned job |

| Deleted account PII | 30 days after verified erasure | Anonymize / cascade | Planned |

| OTP challenges | ≤ 10 minutes | DB expiry + cleanup | ✅ `expiresAt` |

| Auth sessions | Until expiry or revoke | Automatic | ✅ |

| Refresh tokens | Until expiry or revoke | Automatic | ✅ |

| Device registry | Until revoke + 90 days | Batch delete | Planned |

| Service / treatment / Rx | 7–10 years (legal review) | Archive | Policy only |

| AI chat messages | 18 months inactive | Anonymize/delete | Planned |

| AI usage metrics (`AiUsageRecord`) | 24 months detail | Aggregate then purge | Planned |

| Voice transcripts | 90 days (no audio by default) | Batch delete | Planned |

| Notifications | 12 months | Batch delete | Planned |

| `LegalConsentEvent` | 24 months | Batch delete | Planned |

| `AuthAuditEvent` | 18 months | Batch delete | Planned |

| Offline sync queue (terminal) | 30 days | Batch delete | Planned |

| Uploaded media (orphan) | 90 days unreferenced | S3 lifecycle | Planned |

| Local mobile cache | 24h–7d | Client TTL | ✅ |

| Crash reports (Sentry/Crashlytics) | 90 days | Vendor settings | Ops |



---



## Clinical and financial carve-outs



Prescriptions, billing records, and treatment cases may be retained after account erasure where Bangladesh law or veterinary record-keeping requires. Erasure requests **anonymize** user linkage where permitted rather than deleting clinical fact records tied to animal care.



---



## Related documents



- [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) §8

- [privacy-policy-plan.md](./privacy-policy-plan.md) §4 Retention mapping

- [DATA_PROCESSING_POLICY.md](../data/DATA_PROCESSING_POLICY.md)

- [RETENTION_MAPPING.md](../data/RETENTION_MAPPING.md) — model-level mapping

- [DATA_PROCESSING_OPERATIONS.md](../data/DATA_PROCESSING_OPERATIONS.md) — purge & erasure procedures

- [data-processing-policy-plan.md](../data/data-processing-policy-plan.md) — full inventory


