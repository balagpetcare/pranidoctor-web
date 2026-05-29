# Emergency Service Limitation Notice — Operations Runbook

**Version:** 1.0.0  
**Date:** 2026-05-30  
**Status:** Implemented  
**Plan:** `docs/compliance/emergency/emergency-service-limitation-plan.md`

---

## 1. Overview

The emergency limitation notice explains that Prani Doctor is **not** an emergency dispatch service, that **response times are not guaranteed**, and that users must seek **immediate in-person care** when life is at risk. Copy is admin-managed; acceptance is tracked for first emergency doctor booking when enforcement is enabled.

| Tier | Field | Use |
|------|-------|-----|
| Banner | `banner` | Optional platform-wide strip |
| U1 urgent | `urgent` | Instant care, emergency booking submit |
| U2 contextual | `contextual.{key}` | Discovery, pending SR, AI emergency, phone dial |
| U3 full | `full` | First `EMERGENCY_DOCTOR` acceptance modal |

**Setting key:** `mobile.emergency.limitation.config`  
**Consent version:** `mobile.legal.config` → `emergencyLimitationVersion`

---

## 2. Admin management

| Action | Path |
|--------|------|
| Edit copy | Admin → Settings → **Emergency Limitation Notice** (`/admin/settings/emergency-limitation`) |
| API | `GET/PUT /api/admin/settings/emergency-limitation` |

**After copy changes:**

1. Bump `contentVersion` for cache invalidation.
2. Bump `consentVersion` when legal requires re-acceptance.
3. Save in admin panel.

---

## 3. Mobile API

| Endpoint | Purpose |
|----------|---------|
| `GET /api/mobile/legal/emergency-limitation` | Full bundle (`limitation` object) |
| `POST /api/mobile/legal/emergency-limitation/accept` | Record acceptance + audit |
| Settings sync | `acceptEmergencyVersion` on `POST /api/mobile/settings/sync` |

**Create service request (`EMERGENCY_DOCTOR`):**

- Guard: `LEGAL_CONSENT_REQUIRED` if acceptance missing and `enforceAcceptance` true
- Response fields: `limitationNotice`, `limitationContext` (alongside vet disclaimer fields)

---

## 4. Audit trail

`LegalConsentEvent` with:

- `consentType`: `EMERGENCY_SERVICE`
- `metadata.kind`: `EMERGENCY_LIMITATION_ACCEPT`
- `metadata.surface`: e.g. `BOOKING_EMERGENCY`, `FIRST_EMERGENCY_USE`, `PHONE_DIAL`

Stored on `MobileUserSettings.emergencyAcceptedVersion` / `emergencyAcceptedAt`.

Admin consent overview includes registry key `emergency`.

---

## 5. Workflow integration (preserved)

| Workflow | Behavior |
|----------|----------|
| `EMERGENCY_DOCTOR` create | Still `PENDING`; manual admin assign unchanged |
| AI emergency urgency | AI escalation disclosure + U2 `aiEmergency` strip (no dispatch) |
| Instant care / `tel:` | Vet disclaimer + U1/U2; phone dial confirmation dialog |
| Doctor discovery `emergency=true` | Still `acceptsEmergency` filter only |
| Ops SLAs (15 min internal) | **Not** exposed to users in this notice |

---

## 6. Related documents

| Document | Path |
|----------|------|
| Compliance plan | `emergency-service-limitation-plan.md` |
| Veterinary disclaimer | `../veterinary/veterinary-disclaimer-plan.md` |
| AI escalation disclosure | `../ai/ai-escalation-disclosure-plan.md` |
| Ops escalation | `pranidoctor-backend/docs/production/operations/escalation-monitoring-plan.md` |

---

## 7. Verification checklist

| ID | Check |
|----|-------|
| EL-01 | Legal approval of BN+EN canonical text |
| EU-01 | Instant care shows U1 + contextual |
| EU-02 | Emergency book requires acceptance when enforced |
| EU-03 | AI emergency shows `aiEmergency` contextual |
| EU-04 | Pending emergency SR shows `requestPending` |
| EB-01 | `EMERGENCY_DOCTOR` still creates `PENDING` only |

**Reports (2026-05-30 static audit):**

| Document | Purpose |
|----------|---------|
| `EMERGENCY_LIMITATION_VERIFICATION_REPORT.md` | Compliance verification matrix |
| `EMERGENCY_LIMITATION_PRODUCTION_READINESS_REPORT.md` | Go/no-go and deploy checklist |
| `EMERGENCY_LIMITATION_REMAINING_LEGAL_RISKS.md` | Open legal risk register |

---

*Coordinate copy with vet disclaimer and AI escalation tracks to avoid contradictory promises.*
