# Compliance Notes — Privacy Implementation

**Date:** 2026-05-30  
**Implementation status:** Phase 1 shipped (documentation + consent infrastructure); **Data Processing Policy** documentation suite v1.0 (2026-05-30)

---

## What was implemented

| Capability | Location |
|------------|----------|
| **Data processing policy (internal)** | `docs/compliance/data/DATA_PROCESSING_POLICY.md` |
| **Classification mapping** | `docs/compliance/data/DATA_CLASSIFICATION.md` |
| **Retention mapping (models)** | `docs/compliance/data/RETENTION_MAPPING.md` |
| **Audit requirements** | `docs/compliance/data/AUDIT_REQUIREMENTS.md` |
| **RoPA register** | `docs/compliance/data/ROPA_REGISTER.md` |
| **Data processing ops runbook** | `docs/compliance/data/DATA_PROCESSING_OPERATIONS.md` |
| **Data governance report** | `docs/compliance/data/DATA_GOVERNANCE_REPORT.md` (62/100 — conditional pass) |
| Canonical privacy policy (markdown) | `docs/compliance/legal/PRIVACY_POLICY.md` |
| Public policy page | `pranidoctor-web` `/privacy` |
| Version config in DB | `Setting` key `mobile.legal.config` |
| User acceptance fields | `MobileUserSettings.privacyAcceptedVersion`, `aiAcceptedVersion`, etc. |
| Consent audit trail | `LegalConsentEvent` model |
| Mobile accept API | `POST /api/mobile/settings/sync` |
| Mobile document APIs | `GET .../privacy`, `.../terms`, `.../ai-consent` |
| Admin legal CRUD | `GET/PUT /api/admin/settings/legal` |
| Admin consent audit | `GET /api/admin/legal-consent` |
| Privacy API gate | `MOBILE_ENFORCE_PRIVACY_CONSENT` + allowlist |
| AI consent gate | Express middleware on `/api/ai/*` |
| Consent registry | `consent-registry.ts` + `consent-service.ts` |
| Consent status API | `GET /api/mobile/consent/status` |
| Consent withdraw API | `POST /api/mobile/consent/withdraw` |
| Admin overview | `GET /api/admin/consent/overview` |
| Mobile re-consent UX | `ReConsentPage` + router gate |

---

## Residual gaps (not in this phase)

| ID | Gap | Priority |
|----|-----|----------|
| R-01 | Self-serve data export API | P1 |
| R-02 | Automated account erasure job | P1 |
| R-03 | Retention purge cron jobs | P1 |
| R-04 | LLM vendor DPAs on file | P0 legal |
| R-05 | Play Store Data Safety form update | P0 launch |
| R-06 | Terms acceptance enforcement (optional) | P2 |
| R-07 | Doctor-facing provider privacy addendum | P2 |

---

## Regulatory context (Bangladesh)

- **Digital Security Act 2018** — lawful collection, security, breach notification duties
- **ICT Act** — electronic records and transactions
- **BTRC** — SMS template/OTP rules when `OTP_MODE=live`

GDPR-style rights (access, erasure, portability) are implemented as **process + support channel** until automated tooling ships.

---

## Environment variables

| Variable | Default (dev) | Production |
|----------|-----------------|------------|
| `MOBILE_PRIVACY_POLICY_URL` | `https://pranidoctor.com/privacy` | Same |
| `MOBILE_ENFORCE_PRIVACY_CONSENT` | `false` | `true` |
| `MOBILE_TERMS_OF_SERVICE_URL` | `https://pranidoctor.com/terms` | Same |

---

## Audit queries

```sql
-- Recent privacy acceptances
SELECT * FROM "LegalConsentEvent"
WHERE "consentType" = 'PRIVACY'
ORDER BY "createdAt" DESC LIMIT 50;

-- Users on outdated privacy version
SELECT u.id, s."privacyAcceptedVersion", c."privacyVersion"
FROM "User" u
JOIN "MobileUserSettings" s ON s."userId" = u.id
CROSS JOIN (
  SELECT value_json->>'privacyVersion' AS "privacyVersion"
  FROM "Setting" WHERE key = 'mobile.legal.config'
) c
WHERE s."privacyAcceptedVersion" IS DISTINCT FROM c."privacyVersion";
```

---

## Change log

| Date | Change |
|------|--------|
| 2026-05-30 | Initial privacy compliance implementation |
