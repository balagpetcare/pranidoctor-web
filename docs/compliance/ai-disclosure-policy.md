# AI Disclosure Policy

**Version:** 1.0.0  
**Date:** 2026-05-30  
**Status:** Active — implemented with unified compliance framework  
**Related:** `docs/launch/ai-compliance-plan.md`, `docs/compliance/ai/ai-disclaimer-plan.md`

---

## Purpose

Define how Prani Doctor discloses AI limitations to farmers across mobile AI features. This policy complements the AI Disclaimer CMS (T1/T2/T3) and applies to all machine-assisted guidance — not human AI Technician marketplace services.

---

## Required disclosure themes

Every AI surface must communicate:

1. **Assistive tool** — AI supports decision-making; it is not a licensed veterinarian.
2. **Accuracy limits** — outputs may be wrong, incomplete, or outdated; STT/voice may mis-transcribe.
3. **No physical exam** — the system cannot see, examine, or test the animal.
4. **Non-diagnostic** — output is not diagnosis, prescription, or treatment plan.
5. **User responsibility** — farmers must seek professional care when symptoms are serious.

---

## Disclosure tiers

| Tier | Channel | When shown |
|------|---------|------------|
| **T1** | Persistent banner | All AI-enabled screens (`AiCompliancePageBody`) |
| **T2** | Contextual banner | Chat, recommendations, advisory features |
| **T3** | Acceptance modal | First AI use when `enforceAcceptance` is on |
| **Inline** | Per AI output | Every assistant message / result via `AiOutputComplianceWrapper` |
| **Fallback** | Hardcoded EN/BN | When CMS unavailable (`AiComplianceFallbackCopy`) |

---

## Approved wording (canonical defaults)

Managed via **Admin → AI Disclaimer**. Engineering fallbacks match `docs/launch/ai-compliance-plan.md` §D.

**Banner (EN):**  
*"Prani Doctor AI provides general livestock guidance. It cannot see or examine your animal, run tests, or verify what you report. Answers may be wrong, incomplete, or outdated."*

**Inline (EN):**  
*"This is educational guidance only — not a veterinary diagnosis, prescription, or treatment plan."*

---

## Surfaces in scope

| Surface | T1/T2 | T3 gate | Inline wrapper |
|---------|-------|---------|----------------|
| AI hub | ✅ | ✅ | N/A |
| AI chat | ✅ | ✅ | ✅ per message |
| AI voice input | ✅ | ✅ | inherits chat |
| AI triage / result | ✅ | ✅ | ✅ |
| Symptom checker | ✅ | ✅ | ✅ |
| Smart recommendations | ✅ | ✅ | footer on cards |
| Farm health | ✅ | ✅ | dashboard banner |
| Knowledge search | ✅ | ✅ | per result |
| Smart alerts / follow-ups | ✅ | ✅ | per item |

---

## Server enforcement

- `requireMobileAiConsent` on `/api/ai/*` and `/api/voice/*`
- Every generative/rules response includes `disclaimer` and optional `compliance` metadata
- Admin **AI Compliance Rules** can disable banner surfacing or audit (not safety logic)

---

## Prohibited UI patterns

- Labels: "Diagnosis", "Your animal has", "Prescribe", "Take this medicine"
- Clinical certainty styling (green checks on differentials)
- Response-time guarantees on emergency paths without non-guarantee qualifier

---

## Change control

1. Legal approves copy changes in AI Disclaimer CMS.
2. Bump `consentVersion` when re-acceptance required.
3. Bump `contentVersion` for display-only updates.
4. Update this policy when new AI surfaces ship.
