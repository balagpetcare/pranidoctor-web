# Emergency Escalation Policy

**Version:** 1.0.0  
**Date:** 2026-05-30  
**Status:** Active  
**Related:** `docs/launch/ai-compliance-plan.md`, `docs/compliance/emergency/emergency-service-limitation-plan.md`, `docs/compliance/ai/ai-escalation-disclosure-plan.md`

---

## Purpose

Define when and how Prani Doctor surfaces **emergency** and **urgent veterinary escalation** during AI-assisted workflows — without implying dispatch, guaranteed response, or automated vet assignment.

---

## Detection (rules-based — not LLM)

Emergency signals originate from `assessSymptomRisk()` keyword/symptom rules (EN/BN):

| Level | Examples | System flags |
|-------|----------|--------------|
| **Emergency** | not breathing, unconscious, severe bleeding, bloat, convulsion | `emergency: true`, urgency ≥ 10 |
| **High** | high fever, collapse, bloody discharge | escalation required, E2 `high` |
| **Medium** | ≥3 symptoms | advisory urgency |
| **Low** | default | standard disclaimer only |

Chat compliance layer additionally evaluates user message text via the same rules for **metadata only** — it does not change LLM diagnosis logic.

---

## User experience stack (priority order)

When `emergency: true` or compliance `showUrgentBanner`:

1. **U1** — `EmergencyLimitationBanner(urgent: true)` + `aiEmergency` context
2. **E2** — `AiEscalationDisclosureStrip` with `emergency` trigger + Find vet CTA
3. **Inline disclaimer** — non-diagnostic educational text
4. **T1/T2** — persistent AI limitation banner (page level)

Emergency UX **visually overrides** normal AI messaging (error-container styling, live region semantics).

---

## Approved emergency messaging

**U1 / E2 (EN):**  
*"This may be an emergency. Prani Doctor does not dispatch emergency services. Contact a veterinarian or emergency clinic immediately. If the animal cannot breathe, is unconscious, or bleeding severely, do not wait for an app response."*

Managed via **Admin → Emergency Limitation** and **AI Escalation Disclosure** CMS panels.

---

## Escalation paths (user expectations)

| Path | What happens | Disclosure requirement |
|------|--------------|------------------------|
| **E2 Find vet** | Opens services discovery | Support ≠ clinical (`supportVsVet`) |
| **Platform review** | Creates `AiEscalationRecord` for ops | Not automatic vet assignment |
| **Emergency doctor book** | Creates pending service request | U1/U2 + vet disclaimer |
| **Phone dial** | `tel:` with pre-call dialog | U2 `phoneDial` context |

---

## Surfaces — emergency UX coverage

| Surface | U1 urgent | E2 strip | Status |
|---------|-----------|----------|--------|
| Symptom checker emergency result | ✅ | ✅ | Implemented |
| AI triage / result | ✅ | ✅ | Implemented |
| AI chat (keyword emergency in message) | ✅ | ✅ | Implemented |
| Instant care / emergency book | ✅ | vet track | Existing |
| AI triage in chat inline card | ✅ | ✅ | Implemented |

---

## Audit & ops

Backend records:

- `COMPLIANCE_EMERGENCY_TRIGGERED` — `AiSafetyAuditLog`
- `COMPLIANCE_ESCALATION_TRIGGERED` — when escalation required
- `EMERGENCY_SYMPTOM` — `AiEscalationRecord` when triage urgency ≥ 10

Ops monitors unreviewed emergency escalations (OPS-ESC-02).

---

## Admin controls

**Admin → AI Compliance Rules:**

- `emergencyDetectionEnabled` — toggles U1/E2 surfacing (safety rules still run)
- `auditEnabled` — compliance audit writes
- `enabled` — master compliance presentation switch

Emergency **wording** remains in Emergency Limitation + Escalation Disclosure CMS.

---

## Prohibited

- Promising response times on same screen as U1 without "not guaranteed"
- Implying AI urgency triggers dispatch or ambulance
- Labeling keyword detection as confirmed diagnosis
