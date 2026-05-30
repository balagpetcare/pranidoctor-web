# Legal-Safe Messaging Policy

**Version:** 1.0  
**Date:** 2026-05-30  
**Status:** Active (implementation aligned with `LEGAL_SAFE_MESSAGING_PLAN`)  
**Applies to:** All user-facing channels — mobile UI, push, SMS, in-app notifications, AI output, admin CMS (emergency/vet/AI legal settings)

## Purpose

Prani Doctor is a **technology platform** connecting farmers with licensed veterinarians and field providers. It is **not** an emergency medical service, ambulance operator, or 24/7 clinic. Messaging must describe **process and variability**, not guaranteed timing, availability, or clinical outcomes.

## Core rules

1. **No numeric SLA copy** for human veterinary response or arrival (minutes, hours, ranges, “typical response”).
2. **No positive guarantees** of service, response, arrival, treatment, or recovery. Negated forms (“does not guarantee”) are required where limitations are stated.
3. **AI is educational** — not diagnosis, prescription, dispatch, or automatic booking.
4. **Emergency copy** must encourage **immediate in-person veterinary care** when life may be at risk, without implying the platform will dispatch help.
5. **One screen, one truth** — limitation banners and subtitles must not contradict each other.

## Enforcement

| Layer | Mechanism |
|-------|-----------|
| Mobile | Curated l10n keys (`lib/l10n/app_en.arb`, generated `assets/i18n`) |
| Admin CMS | Server validation on save — `messaging-compliance.ts` + admin legal services |
| AI prompts | System prompt clauses forbidding time/guarantee language |
| AI output | `stripProhibitedEtaPhrases()` in `sanitizeAssistantOutput()` |

## Related documents

- [ETA wording matrix](./eta-wording-matrix.md)
- [Messaging governance](./messaging-governance.md)
- Launch plan: `pranidoctor_user/docs/launch/legal-safe-messaging-plan.md`

## Change control

Copy changes that affect legal meaning require:

1. Update to [eta-wording-matrix.md](./eta-wording-matrix.md)
2. BN + EN review
3. Bump CMS `contentVersion` when admin defaults change
4. QA on Instant Care, emergency book, pending SR, AI triage result
