# AI Escalation Disclosure — Compliance Verification Report

**Document type:** Compliance verification (static code + architecture audit)  
**Version:** 1.0.0  
**Date:** 2026-05-30  
**Scope:** AI escalation disclosure across `pranidoctor-backend`, `pranidoctor_user`, `pranidoctor-web`  
**Method:** Static code review, API/UI matrix vs `ai-escalation-disclosure-plan.md` §8 — no production runtime or legal sign-off  
**Related:** `ai-escalation-disclosure-plan.md`, `AI_ESCALATION_DISCLOSURE_OPERATIONS.md`, `ai-disclaimer-plan.md`, `veterinary-disclaimer-plan.md`

---

## Executive summary

AI escalation disclosure is **implemented on primary escalation paths** (chat, triage, symptom checker, manual escalate API) with CMS-managed copy, per-response API fields, mobile contextual strips, and audit metadata on escalation creation.

**Production readiness: conditional pass (74/100).** Suitable for **staging / controlled launch** with ops and compliance review. Blockers for full production sign-off: no legal counsel registry entry (EC-01), E1 banner not rendered in UI, secondary AI surfaces uncovered, no automated tests, and duplicate disclosure UI on triage result page.

| Validation area | Result | Score |
|-----------------|--------|-------|
| Visibility | Partial pass | 72/100 |
| User awareness | Pass with gaps | 78/100 |
| Auditability | Pass with gaps | 71/100 |
| Workflow coverage | Partial pass | 75/100 |

---

## 1. Validation matrix

### 1.1 Visibility

**Requirement:** Users see escalation disclosure (E2 contextual minimum) when AI signals human handoff, urgency, or ops review; E1/E3 available where planned.

| Surface | Escalation trigger shown | E2 strip / disclosure | E1 banner | Server fields | Verdict |
|---------|--------------------------|----------------------|-----------|---------------|---------|
| AI chat (assistant messages) | Yes (`escalationTrigger` / flags) | `AiEscalationDisclosureStrip` on bubble | No | `POST /api/ai/chat` | **Pass** |
| Triage (`TriageCard` in chat) | Yes | Strip when `escalationRequired` | No | `POST /api/ai/triage` | **Pass** |
| AI result page | Yes | Strip (+ duplicate via `TriageCard`) | No | Via triage | **Partial** (duplicate UI) |
| Symptom checker result | Yes | Strip + keyword note | No | `POST /api/ai/symptom-check` | **Pass** |
| AI hub (`/ai`) | N/A until escalation | AI disclaimer T1 only | **Not wired** — `aiEscalationDisclosureBannerProvider` unused | Bundle preloaded | **Partial** |
| Smart recommendations | Vet mention in copy only | No escalation strip | No | No escalation fields | **Fail** (plan P1) |
| Follow-ups / knowledge / alerts | No | No | No | No | **Fail** (plan P1) |
| Instant care sheet | Emergency path | `VetDisclaimerBanner` only | No escalation E1 | N/A | **Partial** (vet track, not AI escalation E1) |
| Settings / legal (E3 full) | N/A | Not linked in Flutter | — | `GET …/ai-escalation-disclosure` | **Partial** |
| Admin CMS | N/A | N/A | Editable | `GET/PUT …/ai-escalation-disclosure` | **Pass** |

**Evidence**

- Strip: `lib/features/ai/presentation/widgets/ai_escalation_disclosure_strip.dart`
- Integration: `ai_message_bubble.dart`, `triage_card.dart`, `symptom_checker_page.dart`, `ai_result_page.dart`
- Preload: `ai_disclaimer_gate.dart` loads `aiEscalationDisclosureProvider` with disclaimer bundle
- E1 gap: `aiEscalationDisclosureBannerProvider` defined in `ai_escalation_disclosure_providers.dart` — **no consumer**

**Plan checklist (§8.2)**

| ID | Check | Static verdict |
|----|-------|----------------|
| EU-01 | Emergency + E2 + CTA | **Pass** (code path: emergency trigger + red styling + find vet) |
| EU-02 | Low confidence + E2 | **Pass** (`lowConfidence` + find vet + human review) |
| EU-03 | Support labeled non-clinical | **Pass** (`supportVsVet` under support button; `aiEscalateSupport` i18n updated) |
| EU-04 | Instant care AI vs emergency | **Partial** — vet disclaimer only, not escalation E1 |

**Visibility verdict:** **Partial pass** — core escalation UX covered; persistent E1 and secondary routes missing.

---

### 1.2 User awareness

**Requirement:** Users understand limitations (no auto vet, no emergency dispatch, support ≠ clinical), with clear actions.

| Theme (plan §3) | Implementation | Verdict |
|-----------------|----------------|---------|
| Human review not pre-display | E2 `humanReview`, `policyRefusal` defaults + API | **Pass** |
| Escalation ≠ booking | E2 `escalationRecorded`, strip CTAs to Services | **Pass** |
| Emergency limitation | E2 `emergency` + `keywordLimitation` subtitle | **Pass** |
| Support vs vet | E2 `supportVsVet` + relabeled support button | **Pass** |
| Primary CTA hierarchy | Find vet (Filled) → platform review (Outlined) → support (Text) | **Pass** |
| BN parity | Defaults BN+EN in backend; managed bundle; i18n CTAs BN | **Pass** |
| Offline fallback | Cached `ai_escalation_disclosure_snapshot` | **Pass** |
| API text overrides CMS | `apiDisclosure` preferred over bundle | **Pass** |

**Awareness gaps**

| Gap | Impact |
|-----|--------|
| E3 `full` text not shown in app settings | Users cannot read comprehensive escalation policy in-app |
| `aiEscalationHint` on bubble removed (replaced by strip) | **Positive** — reduces vague one-liner |
| Triage result page shows **two** disclosure strips (`TriageCard` + page-level) | UX noise; awareness unchanged |
| Smart rec “consult vet” without escalation framing | Users may think platform schedules vet |

**User awareness verdict:** **Pass with gaps** — messaging is substantially clearer on escalation states; E3 and secondary surfaces remain.

---

### 1.3 Auditability

**Requirement:** Escalation events and disclosure version traceable for compliance and ops.

| Check | Implementation | Verdict |
|-------|----------------|---------|
| Disclosure version in API | `escalationDisclosureVersion` on chat/triage/symptom/escalate when trigger set | **Pass** |
| Trigger in API | `escalationTrigger` enum string | **Pass** |
| Admin content version | `contentVersion` in `mobile.ai.escalation.disclosure.config` | **Pass** |
| Escalation record audit | `AiSafetyAuditLog` action `ESCALATION_CREATED` with `detailJson.escalationTrigger`, `escalationDisclosureVersion` | **Pass** |
| Auto-escalation from chat/triage | Still creates `AiEscalationRecord` + audit via `createEscalationInternal` | **Pass** (workflow preserved) |
| Chat/triage non-create audits | `LOW_CONFIDENCE`, `TRIAGE_ESCALATION` logs **without** disclosure version in `detailJson` | **Partial** |
| Legal consent event for escalation | None (informational disclosure — intentional) | **Acceptable** |
| Admin escalation queue | `AiGovernancePanel` — separate from disclosure CMS | **Pass** (ops) |
| Automated tests | **None** for escalation disclosure paths | **Fail** |
| Legal sign-off registry (EC-01) | Not evidenced in repo | **Fail** (process) |

**Evidence**

```425:427:pranidoctor-backend/src/modules/ai-veterinary-core/ai-veterinary-core.service.ts
        escalationTrigger: disclosureTrigger,
        escalationDisclosureVersion: disclosureFields.escalationDisclosureVersion ?? null,
```

**Auditability verdict:** **Pass with gaps** — escalation creation is auditable; broader AI safety audits could include disclosure version; no test or legal gate.

---

### 1.4 Workflow coverage

**Requirement:** Disclosure integrated without changing AI safety / escalation behavior (plan §5 preserved).

| Workflow | Escalation behavior preserved | Disclosure added | Verdict |
|----------|------------------------------|------------------|---------|
| AI chat — policy refusal | `POLICY_REFUSAL` record + refusal | `policyRefusal` E2 | **Pass** |
| AI chat — low confidence | `<0.55` → `LOW_CONFIDENCE` record | `lowConfidence` E2 | **Pass** |
| AI chat — human redirect | `humanRedirect` flag | `humanReview` E2 | **Pass** |
| AI triage — HIGH / emergency | `AiEscalationRecord` + `escalationRequired` | `high` / `emergency` E2 | **Pass** |
| Symptom checker — HIGH / emergency | **No** `AiEscalationRecord` (unchanged) | E2 only | **Pass** (per plan P2 deferral) |
| `POST /api/ai/escalate` | `DOCTOR_REQUEST` etc. | `escalationRecorded` + audit | **Pass** |
| Mobile human review button | Calls `escalateToHuman()` → API | Wired on strip + result page | **Pass** |
| Doctor booking | Manual `/services` | CTA only — no auto-link | **Pass** |
| Support ticket | Separate route | Labeled non-clinical | **Pass** |
| Ops monitoring | OPS-ESC-01/02 unchanged | N/A | **Pass** |
| Smart recommendations | Rule-based only | No disclosure | **Fail** |
| Voice → chat | Inherits chat if same session | Same as chat if escalates | **Pass** (indirect) |

**Plan behavioral checks (§8.3)**

| ID | Check | Static verdict |
|----|-------|----------------|
| EB-01 | Triage emergency → `EMERGENCY_SYMPTOM` | **Pass** (`urgencyLevel >= 10` in service) |
| EB-02 | Symptom HIGH → `escalationRequired` + UI E2 | **Pass** |
| EB-03 | `POST /api/ai/escalate` + audit | **Pass** |
| EB-04 | Policy refusal + record | **Pass** |

**Workflow coverage verdict:** **Partial pass** — all **safety-critical** AI escalation workflows covered; **recommendation / follow-up** workflows not.

---

## 2. Component inventory

### 2.1 Backend

| Component | Path | Status |
|-----------|------|--------|
| Defaults (8 triggers + banner + full) | `src/legacy/web/lib/ai-escalation-disclosure/ai-escalation-disclosure-defaults.ts` | OK |
| Config loader | `ai-escalation-disclosure-config.ts` | OK |
| Mobile bundle | `ai-escalation-disclosure.service.ts` | OK |
| Resolver | `src/modules/ai/disclaimer/ai-escalation-disclosure.resolver.ts` | OK |
| Core integration | `ai-veterinary-core.service.ts` | OK |
| Symptom check integration | `symptom-checker.service.ts` | OK |
| Mobile route | `routes/mobile/legal/ai-escalation-disclosure/route.ts` | OK |
| Admin route | `routes/admin/settings/ai-escalation-disclosure/route.ts` | OK |

### 2.2 Mobile

| Component | Path | Status |
|-----------|------|--------|
| DTO + triggers | `ai_escalation_disclosure_dto.dart` | OK |
| Repository + cache | `ai_escalation_disclosure_repository.dart` | OK |
| Providers | `ai_escalation_disclosure_providers.dart` | OK (E1 unused) |
| Strip widget | `ai_escalation_disclosure_strip.dart` | OK |
| Chat DTO wiring | `ai_dto.dart`, `ai_repository.dart` | OK |

### 2.3 Web admin

| Component | Path | Status |
|-----------|------|--------|
| Admin panel | `AiEscalationDisclosureAdminPanel.tsx` | OK |
| Settings page | `settings/ai-escalation-disclosure/page.tsx` | OK |
| API proxy | `api/admin/settings/ai-escalation-disclosure/route.ts` | OK |
| Settings hub link | `settings/page.tsx` | OK |

---

## 3. Gap summary and remediation

| # | Gap | Severity | Remediation |
|---|-----|----------|-------------|
| G1 | Legal counsel sign-off (EC-01) not recorded | **High** | Add signed version to compliance registry |
| G2 | E1 banner provider unused — no persistent escalation notice on AI hub | **Medium** | Add `MaterialBanner` or subtitle on `AiHomePage` using `aiEscalationDisclosureBannerProvider` |
| G3 | Smart recommendations / follow-ups lack escalation framing | **Medium** | T2 line when copy mentions vet (plan §4.1) |
| G4 | E3 `full` not linked in settings | **Low** | Settings “AI escalation policy” screen |
| G5 | Duplicate strip on `AiResultPage` + `TriageCard` | **Low** | Remove page-level strip or strip inside card only |
| G6 | `AiSafetyAuditLog` for `LOW_CONFIDENCE` / `TRIAGE_ESCALATION` omit disclosure version | **Low** | Append `escalationDisclosureVersion` to those `detailJson` payloads |
| G7 | No automated tests | **Medium** | Contract tests for disclosure fields + admin parse |
| G8 | Instant care: vet disclaimer only (EU-04 partial) | **Low** | Optional one-line AI vs emergency under AI Doctor tile |
| G9 | Symptom checker ops blind spot (no `AiEscalationRecord`) | **Medium** (ops) | Product decision: optional record creation (plan P2) |

---

## 4. Sign-off checklist (from plan §8 + ops runbook)

| Item | Status |
|------|--------|
| EC-01 Legal BN+EN approved | **Not verified** |
| EC-02 No unqualified “instant vet” in escalation copy | **Pass** (defaults reviewed) |
| EC-03 Keyword limitation on emergency UI | **Pass** |
| EU-01 – EU-03 | **Pass** (EU-04 partial) |
| EB-01 – EB-04 | **Pass** (static) |
| Admin panel save/load | **Pass** (code) |
| Workflow preservation | **Pass** |
| Runtime E2E on staging | **Not run** (this report) |

---

## 5. Recommendations

### Before production

1. Obtain legal sign-off on canonical BN+EN (defaults or admin-published text).
2. Run staging E2E: emergency triage keyword → red strip → find vet; low-confidence chat → human review API call.
3. Wire E1 banner on AI hub or chat entry (one sentence: escalations do not book vets).

### Next release (P1)

4. Smart recommendations footer when action mentions veterinarian.
5. Remove duplicate disclosure on `AiResultPage`.
6. Add API/contract tests for `escalationDisclosure*` fields.

### Ops alignment

7. Train support: “Request platform review” creates `AiEscalationRecord`, not a vet visit.
8. On `contentVersion` bump, announce in ops runbook — mobile cache TTL may delay text refresh until next AI call or disclosure GET.

---

## 6. Conclusion

AI Escalation Disclosure meets the **intent** of the compliance plan for **visibility on escalation states**, **user awareness of limitations**, **auditability of manual/auto escalation records**, and **preservation of AI safety workflows**. It does **not yet** fully satisfy the plan’s **surface matrix** (E1 everywhere, secondary routes, legal gate, automated verification).

**Overall compliance status:** **Conditional pass — approve for staging; complete G1–G3 before broad production.**

---

*End of verification report. Re-run after legal sign-off and E2E staging validation.*
