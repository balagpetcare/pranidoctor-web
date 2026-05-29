# Legal Compliance — Operations Guide

**Audience:** Platform ops, release engineering  
**Last updated:** 2026-06-01

---

## Publishing a new legal version

1. **Draft** updated text with legal counsel (bn-BD + en-US).
2. **Insert** new `LegalDocument` rows (do not edit published rows in place).
3. Set `requiresReaccept = true` for material changes only.
4. Update `Setting` key `legal.current.{DOCUMENT_KEY}.{locale}` → new version (or rely on latest `effectiveAt`).
5. Update `mobile.legal.config` `termsVersion` / `privacyVersion` for backward-compatible mobile clients.
6. Deploy backend → web public pages → mobile app (if copy changed in-app).
7. Monitor acceptance drift via admin Launch Ops → Legal compliance section.

---

## Rollback

| Action | Steps |
|--------|-------|
| Disable enforcement | Set `LEGAL_ENFORCEMENT_ENABLED=false` on API; set `mobile.feature.flags.legalGateEnabled=false` in settings |
| Revert document version | Publish previous content as new version with `requiresReaccept=false` |
| Never delete | `LegalAcceptanceEvent` rows are append-only |

---

## Verification checklist

- [ ] `GET /api/mobile/legal/status` returns `allAccepted: true` after test user accepts
- [ ] `LegalAcceptanceEvent` row created with correct `documentKey`, `version`, `acceptedAt`
- [ ] `AuthAuditEvent` with `LEGAL_ACCEPTED` when acceptance via authenticated session
- [ ] Admin user blocked by modal until `TOS-ADMIN` accepted
- [ ] Doctor panel status shows pending until provider schedule accepted
- [ ] Flutter redirects to `/legal/accept` when pending
- [ ] Public `/terms` page shows version `2026-06-01`

---

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LEGAL_ENFORCEMENT_ENABLED` | `false` | API middleware blocks Class C routes when stale |
| `MOBILE_TERMS_OF_SERVICE_URL` | `https://pranidoctor.com/terms` | Fallback URL in legal config |
| `MOBILE_PRIVACY_POLICY_URL` | `https://pranidoctor.com/privacy` | Fallback URL |

---

## Support scenarios

| User report | Resolution |
|-------------|------------|
| "Can't use app after update" | Check `legal/status`; guide to Settings → Terms or `/legal/accept` |
| "Already accepted" | Query latest `LegalAcceptanceEvent`; compare to current `LegalDocument.version` |
| Provider can't accept cases | Verify `TOS-PROVIDER-DOCTOR` acceptance via doctor legal status |
| Data access / erasure request | Follow [DATA_PROCESSING_OPERATIONS.md](../data/DATA_PROCESSING_OPERATIONS.md) §3–§5 |

---

## Data processing (DSAR, erasure, retention)

Operational procedures for data subject requests, account erasure, retention purges, and incident response:

- **Runbook:** [DATA_PROCESSING_OPERATIONS.md](../data/DATA_PROCESSING_OPERATIONS.md)
- **Policy:** [DATA_PROCESSING_POLICY.md](../data/DATA_PROCESSING_POLICY.md)
- **Retention mapping:** [RETENTION_MAPPING.md](../data/RETENTION_MAPPING.md)

---

## Audit queries (PostgreSQL)

```sql
-- Users not on current customer ToS
SELECT u.id, u.phone, m."termsAcceptedVersion"
FROM "User" u
LEFT JOIN "MobileUserSettings" m ON m."userId" = u.id
WHERE u.role = 'CUSTOMER'
  AND (m."termsAcceptedVersion" IS DISTINCT FROM '2026-06-01');

-- Recent acceptances
SELECT "documentKey", "version", COUNT(*) 
FROM "LegalAcceptanceEvent"
WHERE "acceptedAt" > NOW() - INTERVAL '7 days'
GROUP BY 1, 2;
```
