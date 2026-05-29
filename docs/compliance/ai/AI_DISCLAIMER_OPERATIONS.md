# AI Disclaimer — Operations Guide

**Version:** 1.0.0  
**Date:** 2026-05-30  
**Status:** Implemented

---

## Overview

Prani Doctor AI disclaimers are managed centrally and delivered to the mobile app via API. Acceptance is versioned, audited, and enforced on Express `/api/ai/*` routes when `enforceAcceptance` is enabled.

| Layer | Location |
|-------|----------|
| Content config (T1/T2) | `Setting` key `mobile.ai.disclaimer.config` |
| Consent version + T3 text | `Setting` key `mobile.legal.config` (`aiConsentVersion`, `aiConsentContent`) |
| User acceptance | `MobileUserSettings.aiAcceptedVersion` / `aiAcceptedAt` |
| Audit trail | `LegalConsentEvent` (`consentType: AI_PROCESSING`, `metadata.surface`) |
| Admin UI | Admin → Settings → AI Disclaimer |
| Mobile API | `GET /api/mobile/legal/ai-disclaimer`, `POST …/accept` |

---

## Content tiers

| Tier | Purpose | Admin field |
|------|---------|-------------|
| **T1** | Persistent banner on AI screens | `banner.en` / `banner.bn` |
| **T2 chat** | Chat-specific contextual | `contextual.chat` |
| **T2 recommendations** | Smart recommendations | `contextual.recommendations` |
| **T2 advisory** | Symptom checker, farm health, triage | `contextual.advisory` |
| **T3** | First-use modal + settings page | `consentTitle`, `consentContent` |

API responses on AI endpoints also include a `disclaimer` string resolved from T2 for the relevant feature.

---

## Versioning workflow

1. Edit disclaimer text in **Admin → Settings → AI Disclaimer**.
2. To **force re-acceptance**, increment **`consentVersion`** (maps to `aiConsentVersion` in legal config).
3. Optionally increment **`contentVersion`** for display-only changes (logged in API payload; does not alone re-prompt).
4. Save — existing users with older `aiAcceptedVersion` see the acceptance gate on next AI entry.

---

## Acceptance surfaces (audit metadata)

| Surface | When recorded |
|---------|----------------|
| `FIRST_AI_USE` | Default on dedicated accept endpoint |
| `AI_HOME` | AI hub gate |
| `AI_CHAT` | Chat route gate |
| `AI_RECOMMENDATIONS` | Smart recommendations gate |
| `AI_ADVISORY` | Symptom checker / farm health gate |
| `SETTINGS` | AI consent settings page |

Query audit: `GET /api/admin/legal-consent?consentType=AI_PROCESSING`

---

## Enforcement

| Gate | Behavior |
|------|----------|
| Express `/api/ai/*` | `requireMobileAiConsent` — blocks if privacy or AI consent missing (when enforcement on) |
| Mobile legacy routes | Privacy only when `MOBILE_ENFORCE_PRIVACY_CONSENT=true` |
| Flutter | `AiDisclaimerGate` on AI routes — modal + placeholder until accepted |

Response when blocked: `403 LEGAL_CONSENT_REQUIRED` with `{ missing: ['ai'], aiConsentVersion }`.

To **disable** acceptance requirement (e.g. staging): uncheck **Require acceptance** in admin or set `enforceAcceptance: false` in config.

---

## Rollout checklist

- [ ] Legal review of T1/T2/T3 BN+EN text
- [ ] Set production `consentVersion` and publish via admin
- [ ] Verify `GET /api/mobile/legal/ai-disclaimer` returns expected payload
- [ ] Test first AI visit → modal → accept → chat works
- [ ] Bump version in staging and confirm re-prompt
- [ ] Confirm audit rows in admin legal consent log
- [ ] Play Store / privacy policy references updated

---

## Troubleshooting

| Issue | Check |
|-------|-------|
| User stuck on gate after accept | `MobileUserSettings.aiAcceptedVersion` matches `aiConsentVersion` |
| API 403 on chat | Privacy + AI consent both required; check settings sync |
| Stale banner text | Flutter cache TTL — pull-to-refresh or `forceRefresh` on disclaimer provider |
| Admin save not reflected | `mobile.ai.disclaimer.config` and `mobile.legal.config` rows in `Setting` table |

---

## Related docs

- `docs/compliance/ai/ai-disclaimer-plan.md` — strategy & verification matrix
- `docs/compliance/legal/ACCEPTANCE_STRATEGY.md` — privacy/terms/AI acceptance flows
