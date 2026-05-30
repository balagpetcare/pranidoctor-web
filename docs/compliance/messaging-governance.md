# Messaging Governance

**Version:** 1.0  
**Date:** 2026-05-30

## Ownership

| Role | Responsibility |
|------|----------------|
| Product | Approve UX copy keys and flows |
| Compliance / Legal | Approve BN+EN canonical strings |
| Engineering | Enforce validators, prompts, sanitization |
| Ops / Admin CMS | Avoid pasting ETA or guarantee language into legal settings |

## Source-of-truth map

| Content type | Source | Runtime |
|--------------|--------|---------|
| Mobile UI strings | `pranidoctor_user/lib/l10n/app_en.arb` → `assets/i18n/*.json` | Flutter `AppLocalizations` |
| Emergency limitation | `mobile.emergency.limitation.config` | API + `emergency_limitation` feature |
| Veterinary disclaimer | `mobile.vet.disclaimer.config` | API + `vet_disclaimer` feature |
| AI disclaimer | `mobile.ai.disclaimer.config` | API + AI banners |
| AI escalation | `mobile.ai.escalation.disclosure.config` | API + escalation strips |
| AI system prompts | `AiPromptTemplate` DB seed | `ai-prompt.service.ts` |
| Notifications / SMS | Code in `notifications/events.ts` | Event-driven |

## Admin CMS save path

```
Admin PUT → admin-*-service → assert*Messaging() → prisma.setting.upsert
                ↓ on violation
         422 VALIDATION_ERROR + violations[]
```

Files:

- `src/shared/compliance/messaging-compliance.ts`
- `src/legacy/web/lib/admin-legal/messaging-compliance-admin.ts`
- `src/legacy/web/lib/admin-legal/messaging-compliance-route.ts`

## AI governance

1. **Prompts** — `DEFAULT_PROMPTS` include explicit bans on response/arrival guarantees.
2. **Output** — `stripProhibitedEtaPhrases()` strips common SLA phrases from model output before display.
3. **Triage** — Emergency recommendation clarifies app does not dispatch services.
4. **UI** — Symptom checker appends `aiSymptomGuidanceNote` under API recommendation.

## QA checklist (release)

- [ ] Instant Care sheet: no minute-based subtitles; limitation + vet banners visible
- [ ] Doctor profile: “Accepts emergency requests (when available)” chip
- [ ] Universal search emergency row: qualified subtitle
- [ ] Symptom checker result: guidance note under recommendation
- [ ] Admin CMS: saving text with “Typical response: 5 min” returns 422
- [ ] EN + BN spot-check on above screens

## CI recommendation (P1)

Add grep gate on `assets/i18n` and `app_en.arb` for:

`Typical response`, `under \d+ min`, `guarantee` (allowlist negated phrases in CMS defaults only via separate path)

## Incident response

If non-compliant copy reaches production:

1. Patch CMS `Setting` or deploy mobile hotfix strings
2. Record `contentVersion` bump and consent impact assessment
3. Log sample `Notification` bodies if channel was affected
