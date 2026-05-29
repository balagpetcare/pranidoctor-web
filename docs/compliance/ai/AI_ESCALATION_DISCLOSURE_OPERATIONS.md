# AI Escalation Disclosure — Operations Runbook

**Version:** 1.0.0  
**Date:** 2026-05-30  
**Status:** Implemented  
**Plan:** `docs/compliance/ai/ai-escalation-disclosure-plan.md`

---

## 1. Overview

AI escalation disclosure copy explains **human review limits**, **when AI suggests a veterinarian**, and **what escalations do not do** (no auto-assign, no emergency dispatch). Content is admin-managed and returned on AI API responses when escalation flags are set.

| Tier | Setting path | Use |
|------|--------------|-----|
| E1 banner | `banner` | Optional persistent AI contexts |
| E2 contextual | `contextual.{trigger}` | Chat, triage, symptom checker strips |
| E3 full | `full` | Reference / future settings link |

**Setting key:** `mobile.ai.escalation.disclosure.config`

---

## 2. Admin management

| Action | Path |
|--------|------|
| Edit copy | Admin → Settings → **AI Escalation Disclosure** (`/admin/settings/ai-escalation-disclosure`) |
| API | `GET/PUT /api/admin/settings/ai-escalation-disclosure` |

**After copy changes:**

1. Bump `contentVersion` (e.g. `2026-05-30.2`).
2. Save in admin panel.
3. Mobile refreshes on next `GET /api/mobile/legal/ai-escalation-disclosure` or when AI responses include new `escalationDisclosureVersion`.

---

## 3. Mobile API

| Endpoint | Purpose |
|----------|---------|
| `GET /api/mobile/legal/ai-escalation-disclosure` | Full bundle for offline cache |

**Per-response fields (when escalation applies):**

- `escalationDisclosure` — localized E2 text
- `escalationTrigger` — `emergency`, `high`, `lowConfidence`, `policyRefusal`, etc.
- `escalationDisclosureVersion` — matches admin `contentVersion`

**Endpoints returning fields:**

- `POST /api/ai/chat`
- `POST /api/ai/triage`
- `POST /api/ai/symptom-check`
- `POST /api/ai/escalate`

---

## 4. Audit trail

`AiSafetyAuditLog` entries for `ESCALATION_CREATED` include:

- `escalationTrigger`
- `escalationDisclosureVersion`

Ops alerts unchanged: `OPS-ESC-01` (backlog), `OPS-ESC-02` (unreviewed emergency symptom).

---

## 5. Workflow integration (preserved)

| Workflow | Behavior |
|----------|----------|
| AI chat safety | Same refusal / confidence / escalation records |
| Triage | Same keyword risk + `AiEscalationRecord` on HIGH |
| Symptom checker | Same risk rules; disclosure only added to response |
| `POST /api/ai/escalate` | Same; response includes disclosure |
| Doctor booking | Still via Services — not auto-triggered by disclosure UI |

**Mobile CTAs:**

- Primary: Find veterinarian → `/services`
- Optional: Request platform review → `POST /api/ai/escalate` (`DOCTOR_REQUEST`)
- Support: labeled as non-clinical (E2 `supportVsVet`)

---

## 6. Verification checklist

- [ ] Admin panel loads/saves all eight E2 triggers + banner + full
- [ ] Emergency triage chat returns `escalationTrigger: emergency`
- [ ] Low-confidence chat returns `lowConfidence`
- [ ] Symptom checker HIGH shows strip + find vet
- [ ] `ESCALATION_CREATED` audit includes disclosure version
- [ ] BN strings render on device locale `bn`

---

## 7. Related docs

- `docs/compliance/ai/AI_ESCALATION_DISCLOSURE_VERIFICATION_REPORT.md`
- `docs/compliance/ai/ai-disclaimer-plan.md`
- `docs/compliance/veterinary/veterinary-disclaimer-plan.md`
- `pranidoctor-backend/docs/production/operations/escalation-monitoring-plan.md`
