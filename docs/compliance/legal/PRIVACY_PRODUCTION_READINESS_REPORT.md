# Privacy Policy — Production Readiness Report

**Assessment date:** 30 May 2026  
**Release target:** Prani Doctor platform (mobile + web + backend)  
**Inputs:** [PRIVACY_COMPLIANCE_REPORT.md](./PRIVACY_COMPLIANCE_REPORT.md), [PRIVACY_GAP_REPORT.md](./PRIVACY_GAP_REPORT.md)

---

## Decision

| Mode | Recommendation | Rationale |
|------|----------------|-----------|
| **Soft launch** (client gates only, enforcement off) | **Conditional GO** | Farmer UX complete; audit trail works; documented risk |
| **Production with API enforcement** | **NO-GO** | P0 gaps: version drift, enforcement config, doctor surface |
| **App store submission (Play / App Store)** | **NO-GO** | Data Safety + DPA + version alignment required |

**Overall:** **Conditional GO for controlled beta** · **NO-GO for full production enforcement** until P0 checklist below is complete.

---

## Readiness scorecard

| Dimension | Score (0–5) | Production ready? |
|-----------|-------------|-------------------|
| Policy documentation | 5 | ✅ |
| Public visibility | 4 | ⚠️ Verify live URL |
| Mobile acceptance UX | 4 | ✅ |
| Mobile server enforcement | 2 | ❌ Default off |
| Version consistency | 2 | ❌ Drift |
| Audit & admin ops | 4 | ✅ |
| AI consent linkage | 4 | ✅ |
| User data rights (automated) | 1 | ❌ |
| Doctor/provider compliance | 1 | ❌ |
| Test / CI confidence | 2 | ❌ |

**Weighted average:** **2.9 / 5** — below production bar (4.0 target).

---

## Pre-production checklist

### Must complete (P0)

- [ ] **Align privacy version** across `PRIVACY_POLICY.md`, web `/privacy`, `legal-defaults.ts`, DB `mobile.legal.config`, and `LegalDocument` seed
- [ ] **Apply migrations** `20260530180000_legal_consent`, `20260601180000_legal_document_registry` on staging/production
- [ ] **Run legal document seed** in each environment after migration
- [ ] **Fix `consent-service.test.ts`** import path; confirm green in CI
- [ ] **Set production env:**
  - `MOBILE_ENFORCE_PRIVACY_CONSENT=true`
  - `MOBILE_PRIVACY_POLICY_URL=https://pranidoctor.com/privacy` (or actual domain)
  - Confirm `MOBILE_LEGAL_GATE_ENABLED` intent (default: client hard-gates privacy+terms)
- [ ] **Verify live `/privacy`** returns 200 with correct version header/content
- [ ] **Doctor legal MVP:** accept page + dashboard block until provider ToS accepted
- [ ] **Legal sign-off:** LLM vendor DPAs, Play Data Safety form

### Strongly recommended (P1)

- [ ] Consent **withdraw UI** on mobile (AI + privacy)
- [ ] Registration **privacy checkbox** + audit
- [ ] Staging **smoke test script** (see below)
- [ ] Admin runbook for version bump + comms to users

### Post-GA (P2)

- [ ] Self-serve data export API
- [ ] Retention purge cron jobs
- [ ] Unified admin consent timeline per user
- [ ] Provider privacy addendum for doctors

---

## Staging smoke test plan

Execute after P0 remediation in staging with `MOBILE_ENFORCE_PRIVACY_CONSENT=true`.

### Mobile (farmer)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Fresh user login without prior accept | Banner or redirect to `/reconsent` |
| 2 | Call protected API (e.g. farm list) without accept | `403 LEGAL_CONSENT_REQUIRED` |
| 3 | Accept privacy on Settings → Privacy | `legal.privacyAccepted=true`; `LegalConsentEvent` row |
| 4 | Open AI home without AI consent | Redirect to AI consent |
| 5 | Accept AI consent | AI chat succeeds |
| 6 | Admin bumps `privacyVersion` | User redirected to `/reconsent` on next launch |
| 7 | Accept re-consent | New audit event with new version |
| 8 | `POST /api/mobile/consent/withdraw` type AI | AI routes blocked again |

### Admin

| Step | Action | Expected |
|------|--------|----------|
| 1 | Open Admin → Settings → Legal | Loads settings, audit, overview |
| 2 | Update privacy version + save | PUT succeeds; overview counts reflect stale users |
| 3 | View legal-consent audit | Recent PRIVACY events visible |

### Doctor (after P0-03)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Doctor login with pending ToS | Blocked on legal accept screen |
| 2 | Accept provider ToS | Dashboard accessible; `LegalAcceptanceEvent` row |
| 3 | Protected doctor API without accept | 403 or redirect |

### Public web

| Step | Action | Expected |
|------|--------|----------|
| 1 | GET `/privacy` | 200, version matches `mobile.legal.config` |
| 2 | GET `/terms` | 200 (if linked from privacy footer) |

---

## Environment configuration reference

### Production recommended values

```env
MOBILE_PRIVACY_POLICY_URL=https://pranidoctor.com/privacy
MOBILE_TERMS_OF_SERVICE_URL=https://pranidoctor.com/terms
MOBILE_ENFORCE_PRIVACY_CONSENT=true
MOBILE_LEGAL_GATE_ENABLED=true
# Optional: also hard-gate terms at API layer
LEGAL_ENFORCEMENT_ENABLED=false
```

### Rollout strategy

1. **Week 1 — Staging:** P0 fixes + smoke tests + enforcement on
2. **Week 2 — Production soft:** Deploy code; `MOBILE_ENFORCE_PRIVACY_CONSENT=false` initially; monitor acceptance rates via admin overview
3. **Week 3 — Production strict:** Flip enforcement to `true` after >90% active users accepted current version (or forced re-consent campaign)
4. **Parallel:** Doctor legal gate before enabling doctor access to new clinical features

---

## Risk register (production)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Version drift causes mass re-consent | High (current) | Medium | P0-01 alignment |
| API bypass without enforcement | High (current) | High | P0-02 |
| Doctor accesses data without recorded consent | High | High | P0-03 |
| Audit failure on DB error | Low | Medium | `legal-consent-audit` swallows errors — monitor logs |
| User cannot withdraw AI consent in UI | Medium | Medium | P1-02 |
| Support overload for data requests | Medium | Low | Document support@ process; plan export API |

---

## Sign-off template

| Role | Name | Date | Status |
|------|------|------|--------|
| Engineering | | | ☐ P0 complete |
| Product | | | ☐ UX acceptable |
| Legal / DPO | | | ☐ Policy + DPAs |
| DevOps | | | ☐ Env + migrations |
| QA | | | ☐ Smoke tests pass |

---

## Conclusion

The privacy implementation delivers a **solid Phase 1 foundation** for mobile customers: published policy, versioned acceptance, audit events, admin tooling, and client/server AI linkage. **Production enforcement and multi-role compliance are not ready** until version alignment, server gates, doctor UX, and external legal items are closed.

**Next action:** Execute P0 checklist in [PRIVACY_GAP_REPORT.md](./PRIVACY_GAP_REPORT.md), then re-run this readiness assessment.

---

## Related documents

- [PRIVACY_COMPLIANCE_REPORT.md](./PRIVACY_COMPLIANCE_REPORT.md)
- [PRIVACY_GAP_REPORT.md](./PRIVACY_GAP_REPORT.md)
- [ACCEPTANCE_STRATEGY.md](./ACCEPTANCE_STRATEGY.md)
- [DATA_RETENTION.md](./DATA_RETENTION.md)
- [COMPLIANCE_NOTES.md](./COMPLIANCE_NOTES.md)
