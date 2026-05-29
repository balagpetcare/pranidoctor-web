# Emergency Service Limitation Notice — Remaining Legal Risks

**Document type:** Legal risk register (engineering assessment — not legal advice)  
**Version:** 1.0.0  
**Date:** 2026-05-30  
**Audience:** Legal counsel, compliance, product leadership  
**Status:** Open items require counsel review before high-trust production claims

---

## 1. Risk summary

| Risk ID | Title | Likelihood | Impact | Residual risk after implementation |
|---------|-------|------------|--------|-----------------------------------|
| LR-EL-01 | Unsigned canonical limitation text | High | High | **High** |
| LR-EL-02 | Misleading response-time implications (instant care ETAs) | High | High | **High** |
| LR-EL-03 | User belief that emergency book = dispatch | Medium | High | **Medium** |
| LR-EL-04 | AI emergency conflated with platform emergency service | Medium | High | **Medium** |
| LR-EL-05 | Inadequate public disclosure (web / store) | Medium | Medium | **Medium** |
| LR-EL-06 | Emergency phone ≠ national emergency line | Medium | Medium | **Low–Medium** |
| LR-EL-07 | Ops SLA exposure via marketing or support scripts | Low | High | **Low** (if ops disciplined) |
| LR-EL-08 | Cross-track contradiction (vet / AI / emergency CMS) | Medium | Medium | **Low–Medium** |
| LR-EL-09 | Weak audit defensibility (no automated tests) | Medium | Medium | **Medium** |
| LR-EL-10 | Rural connectivity / failed booking delay to care | Medium | Medium | **Medium** (intrinsic) |

---

## 2. Risk detail

### LR-EL-01 — Unsigned canonical limitation text

**Description:** Default BN+EN strings ship from code/admin CMS without evidenced counsel approval or version registry entry (plan EL-01).

**Why it matters:** Limitation notices are primary defense against “platform failed to respond to emergency” claims. Unapproved wording may be incomplete for Bangladesh consumer/farm liability context.

**Mitigation in place:** Structured U1/U2/U3 tiers; admin versioning; acceptance audit.

**Remaining gap:** No signed compliance artifact in repo.

**Recommended action:** Legal review of `emergency-limitation-defaults.ts` + admin-published text; record approved version ID and date in compliance registry (same process as privacy/AI disclaimer).

---

### LR-EL-02 — Misleading response-time implications (instant care ETAs)

**Description:** Instant care sheet shows `homeCareCallDoctorEta` (“Typical response: 5–15 min”) and `homeCareEmergencyVisitEta` (“15–30 min”) **above** limitation banners that state wait times are **not** guaranteed.

**Why it matters:** Plan §3.3 and EL-02 explicitly prohibit implied SLAs. Juxtaposition creates **contradictory consumer impression** — stronger than missing copy alone.

**Mitigation in place:** U1 urgent + contextual limitation on same sheet.

**Remaining gap:** ETA strings unchanged; BN JSON still English ETA text.

**Recommended action:** Replace with neutral copy (e.g. “Availability varies”) or remove ETAs; counsel sign-off on replacement; grep store/marketing for similar claims.

**Priority:** **P0 legal/product**

---

### LR-EL-03 — User belief that emergency book = dispatch

**Description:** Users may interpret `EMERGENCY_DOCTOR` submission as activation of emergency services, especially combined with vet “emergency” interstitial.

**Why it matters:** Manual `PENDING` → admin assign pipeline means **no** guaranteed engagement; harm if user delays offline care.

**Mitigation in place:** U3 acceptance; U2 on book; server guard; vet `bookingEmergency` disclaimer.

**Remaining gap:** No push/inbox audit in this verification; marketing not audited.

**Recommended action:** Audit notification templates; train support; consider stronger pre-submit interstitial if counsel advises.

---

### LR-EL-04 — AI emergency conflated with platform emergency service

**Description:** AI keyword urgency (`emergency: true`) can feel like platform-confirmed emergency. Triage/chat paths show AI escalation disclosure but **not** emergency limitation U1/`aiEmergency` on `TriageCard`.

**Why it matters:** Plan EL-03 requires clear distinction between **AI advisory urgency** and **human emergency booking**.

**Mitigation in place:** Symptom checker `aiEmergency` banner; AI escalation E2 `emergency` trigger.

**Remaining gap:** Chat/triage emergency UX relies on AI escalation track only.

**Recommended action:** Add limitation strip when `result.emergency`; counsel-approved one-line distinction in AI paths.

---

### LR-EL-05 — Inadequate public disclosure (web / store)

**Description:** Plan §5.2 requires U3 on public `/legal/disclaimer` or `/terms` and store listing URL. **Not implemented** in static audit.

**Why it matters:** App-store and web visitors may not see limitation before install; weak transparency for regulators.

**Mitigation in place:** In-app U3 on first emergency accept; ops doc.

**Remaining gap:** Public BN+EN section; store metadata link.

**Recommended action:** Add “Not an emergency service” section to published privacy/terms; link from app settings.

---

### LR-EL-06 — Emergency phone ≠ national emergency line

**Description:** `MOBILE_EMERGENCY_PHONE` may route to support or configured line; `phoneDial` copy warns to verify appropriateness but does not name fallback behavior.

**Why it matters:** User may believe they reached official veterinary emergency services.

**Mitigation in place:** Pre-dial dialog (`phoneDial`).

**Remaining gap:** Ops documentation of number purpose not verified in user-facing copy.

**Recommended action:** Document in ops runbook; optional explicit “platform support line” label in dialog.

---

### LR-EL-07 — Ops SLA exposure via marketing or support

**Description:** Internal OPS-REQ-03 (~15 min) targets must never appear as user promises. Implementation does not expose them; **marketing/support** could still imply speed.

**Mitigation in place:** Limitation copy; ops plans marked internal.

**Recommended action:** Marketing checklist EL-02; forbid “instant vet” in campaigns (plan §3.3).

---

### LR-EL-08 — Cross-track contradiction (vet / AI / emergency CMS)

**Description:** Three parallel CMS tracks (vet disclaimer, AI escalation disclosure, emergency limitation) can drift if edited independently.

**Mitigation in place:** Cross-links in compliance docs; complementary defaults.

**Recommended action:** Quarterly copy alignment review; single “urgent care” editorial owner.

---

### LR-EL-09 — Weak audit defensibility

**Description:** Acceptance is logged, but no automated tests prove guard or event shape. Counsel may ask for reproducible evidence under dispute.

**Mitigation in place:** `LegalConsentEvent` schema; admin consent overview registry.

**Recommended action:** Add integration tests for accept + 403 guard; export sample audit report procedure in ops doc.

---

### LR-EL-10 — Rural connectivity / booking failure delays care

**Description:** Limitation text places duty on user to seek local care; app may be unusable offline when needed most.

**Why it matters:** Inherent product risk — limitation reduces but does not eliminate duty-of-care narratives.

**Mitigation in place:** U3 user responsibility clauses; offline cache of limitation text.

**Recommended action:** Maintain local vet contacts in onboarding (product, not legal copy alone).

---

## 3. Risk treatment priority (counsel + product)

| Priority | Risk IDs | Action |
|----------|----------|--------|
| **P0** | LR-EL-01, LR-EL-02 | Sign-off + fix ETA copy before scale |
| **P1** | LR-EL-03, LR-EL-04, LR-EL-05 | UX + public legal + notifications audit |
| **P2** | LR-EL-06, LR-EL-08, LR-EL-09 | Ops clarity, CMS governance, tests |
| **Ongoing** | LR-EL-07, LR-EL-10 | Marketing discipline, offline product strategy |

---

## 4. Acceptance vs liability scope

**What acceptance records:** User acknowledged **platform limitations** (not emergency service, no guaranteed response) at defined surfaces.

**What acceptance does not do:**

- Waive statutory consumer rights (jurisdiction-specific — counsel to confirm)
- Replace veterinary duty of care for licensed providers on platform
- Certify animal condition as emergency
- Bind minors or agents without authority (if applicable)

**Counsel should confirm** wording for Bangladesh farmers, Bengali enforceability, and relationship to existing Terms/Privacy.

---

## 5. Document control

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-05-30 | Initial register post-implementation static audit |

**Next review trigger:** Legal sign-off completed; LR-EL-02 resolved; staging E2E passed.

---

*This register is an engineering compliance artifact. It does not constitute legal advice.*
