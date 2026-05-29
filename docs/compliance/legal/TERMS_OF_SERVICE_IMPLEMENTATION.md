# Terms of Service — Implementation Report

**Status:** Implemented (v1)  
**Date:** 2026-06-01  
**Plan reference:** [terms-of-service-plan.md](./terms-of-service-plan.md)

---

## Summary

Production ToS framework added across backend, admin web, and Flutter user app. Existing mobile settings legal APIs and `MobileUserSettings` fields are **preserved and extended**. Acceptance is recorded in an **immutable audit table** with optional auth audit correlation.

---

## Architecture

```
LegalDocument (registry, versioned, bn/en)
        │
        ▼
LegalAcceptanceEvent (immutable audit per user + document + version)
        │
        ├──► MobileUserSettings (customer snapshot — backward compat)
        └──► AuthAuditEvent (LEGAL_ACCEPTED when channel known)
```

### Document keys

| Key | Audience | Roles |
|-----|----------|-------|
| `TOS-CUSTOMER` | Flutter farmers | `CUSTOMER` |
| `PRIVACY-POLICY` | All customers | `CUSTOMER` |
| `TOS-PROVIDER-DOCTOR` | Doctor panel | `DOCTOR` |
| `TOS-PROVIDER-TECHNICIAN` | Technician panel | `AI_TECHNICIAN` |
| `TOS-ADMIN` | Admin console | `ADMIN`, `SUPER_ADMIN`, `SUPPORT` |

Current published version: **`2026-06-01`**.

---

## API surface (additive)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/mobile/settings` | Mobile customer | Unchanged shape + extended `legal` block |
| POST | `/api/mobile/settings/sync` | Mobile customer | Unchanged + `acceptDocumentKeys[]` |
| GET | `/api/mobile/legal/status` | Mobile customer | Full compliance status |
| GET | `/api/mobile/legal/documents/:key` | Mobile customer | Document by key |
| GET | `/api/admin/legal/status` | Admin panel | Admin compliance status |
| POST | `/api/admin/legal/accept` | Admin panel | Accept admin AUP |
| GET | `/api/admin/legal/documents/:key` | Admin panel | Document by key |
| GET | `/api/doctor/legal/status` | Doctor panel | Doctor compliance status |
| POST | `/api/doctor/legal/accept` | Doctor panel | Accept provider agreement |
| GET | `/api/doctor/legal/documents/:key` | Doctor panel | Document by key |

`GET /api/admin/auth/me` and `GET /api/doctor/auth/me` include optional **`legal`** summary (additive).

---

## Re-acceptance

When a `LegalDocument` row is published with `requiresReaccept = true` and a newer `version`, users whose latest `LegalAcceptanceEvent` for that key is older must accept again.

Legacy `MobileUserSettings.termsAcceptedVersion` / `privacyAcceptedVersion` still satisfy acceptance when they match the current published version (transition compatibility).

---

## Enforcement

| Layer | Default | Control |
|-------|---------|---------|
| API middleware | Off | `LEGAL_ENFORCEMENT_ENABLED=true` |
| Flutter nav gate | On | `/reconsent` when `legalGateEnabled` and privacy/terms stale |
| Admin dashboard | On | Modal until admin AUP accepted |
| Register checkbox | On | Blocks submit without consent |

---

## Files (primary)

| Area | Path |
|------|------|
| Schema | `pranidoctor-backend/prisma/schema.prisma` |
| Migration | `pranidoctor-backend/prisma/migrations/20260601120000_legal_acceptance/` |
| Legal module | `pranidoctor-backend/src/modules/legal/` |
| Mobile settings | `pranidoctor-backend/src/legacy/web/lib/mobile-settings/` |
| Admin legal routes | `pranidoctor-backend/src/legacy/web/routes/admin/legal/` |
| Doctor legal routes | `pranidoctor-backend/src/legacy/web/routes/doctor/legal/` |
| Mobile legal routes | `pranidoctor-backend/src/legacy/web/routes/mobile/legal/` |
| Admin UI | `pranidoctor-web/src/components/admin/legal/` |
| Flutter | `lib/routing/legal_consent_gate.dart`, `lib/features/settings/presentation/re_consent_page.dart` |

---

## Operational runbook

See [LEGAL_OPERATIONS.md](./LEGAL_OPERATIONS.md).
