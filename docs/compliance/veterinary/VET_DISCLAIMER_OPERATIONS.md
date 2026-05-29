# Veterinary Advice Disclaimer — Operations Guide

**Version:** 1.0.0  
**Date:** 2026-05-30  
**Status:** Implemented

---

## Overview

Veterinary advice disclaimers cover **licensed doctor consultations**, **treatment journal**, **instant care**, and related platform limitations — separate from the [AI disclaimer](./AI_DISCLAIMER_OPERATIONS.md) (LLM-specific).

| Layer | Location |
|-------|----------|
| Content config (V0–V3) | `Setting` key `mobile.vet.disclaimer.config` |
| Consent version + modal title | `Setting` key `mobile.legal.config` (`vetDisclaimerVersion`, `vetDisclaimerTitle`) |
| User acceptance | `MobileUserSettings.vetAcceptedVersion` / `vetAcceptedAt` |
| Audit trail | `LegalConsentEvent` (`consentType: VET_ADVICE`, `metadata.surface`) |
| Admin UI | Admin → Settings → Veterinary Disclaimer |
| Mobile API | `GET /api/mobile/legal/vet-disclaimer`, `POST …/accept` |

---

## Content tiers

| Tier | Purpose | Admin field |
|------|---------|-------------|
| **V0** | Platform banner | `banner.en` / `banner.bn` |
| **V1 bookingHome** | Home visit booking | `contextual.bookingHome` |
| **V1 bookingEmergency** | Emergency booking | `contextual.bookingEmergency` |
| **V1 bookingOnline** | Online/async consult | `contextual.bookingOnline` |
| **V1 treatmentJournal** | Farmer self-log | `contextual.treatmentJournal` |
| **V1 prescriptionView** | Prescription display | `contextual.prescriptionView` |
| **V1 feedRation** | Feed guidance cross-link | `contextual.feedRation` |
| **V1 instantCare** | Instant care sheet | `contextual.instantCare` |
| **V3 emergency** | Emergency interstitial | `emergency.en` / `emergency.bn` |
| **V2 full** | Acceptance modal body | `full.en` / `full.bn` |

Service request API responses include optional `disclaimer` and `disclaimerContext` for consultation visibility.

---

## Versioning workflow

1. Edit text in **Admin → Settings → Veterinary Disclaimer**.
2. To **force re-acceptance**, increment **`consentVersion`** (`vetDisclaimerVersion` in legal config).
3. Optionally increment **`contentVersion`** for display-only tracking.
4. Save — users with stale `vetAcceptedVersion` are prompted on next consultation booking (when enforcement is on).

---

## Acceptance surfaces (audit metadata)

| Surface | When recorded |
|---------|----------------|
| `FIRST_VET_USE` | Default on dedicated accept endpoint |
| `BOOKING_HOME` | Home visit booking |
| `BOOKING_EMERGENCY` | Emergency doctor booking |
| `BOOKING_ONLINE` | Online consultation booking |
| `TREATMENT_JOURNAL` | Treatment form (future gate) |
| `INSTANT_CARE` | Instant care sheet |
| `SERVICE_REQUEST_DETAIL` | Detail view acknowledgment |
| `SETTINGS` | Settings sync fallback |

Query audit: `GET /api/admin/legal-consent?consentType=VET_ADVICE`

---

## Enforcement

| Gate | Behavior |
|------|----------|
| `POST /api/mobile/service-requests` | Blocks doctor consultation types when `enforceAcceptance` and vet consent missing → `403 LEGAL_CONSENT_REQUIRED` |
| Flutter booking | Shows contextual banner + acceptance sheet before submit |
| Flutter detail | Persistent contextual banner on active consultations |

To **disable** enforcement (staging): uncheck **Require acceptance** in admin.

---

## Rollout checklist

- [ ] Legal review of V0–V3 BN+EN text
- [ ] Publish consent version via admin
- [ ] Verify `GET /api/mobile/legal/vet-disclaimer`
- [ ] Walk verification checklist in `VET_DISCLAIMER_VERIFICATION_REPORT.md` §7
- [ ] Test emergency + online booking acceptance flow
- [ ] Verify audit rows in legal consent admin
- [ ] Confirm AI disclaimer remains separate (`AI_PROCESSING` vs `VET_ADVICE`)

---

## Related documents

- Plan: `docs/compliance/veterinary/veterinary-disclaimer-plan.md`
- AI disclaimer ops: `docs/compliance/ai/AI_DISCLAIMER_OPERATIONS.md`
- Public page: `/legal/disclaimer`
