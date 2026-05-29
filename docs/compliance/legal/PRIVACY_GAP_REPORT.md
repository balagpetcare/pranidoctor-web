# Privacy Policy — Gap Report

**Date:** 30 May 2026  
**Baseline:** [PRIVACY_COMPLIANCE_REPORT.md](./PRIVACY_COMPLIANCE_REPORT.md)  
**Purpose:** Prioritized gaps blocking full privacy compliance and production hardening

---

## Summary

| Priority | Open gaps | Must fix before production enforce |
|----------|-----------|-----------------------------------|
| **P0** | 5 | Yes |
| **P1** | 6 | Recommended |
| **P2** | 5 | Post-launch acceptable |

---

## P0 — Launch blockers

### GAP-P0-01: Version string drift across sources

**Impact:** Users who accepted documented policy v`2026-05-30` appear non-compliant when server defaults to v`2026-06-01`. Mass re-consent prompts; audit confusion.

**Locations:**
- `PRIVACY_POLICY.md`, `privacy-policy-content.ts` → `2026-05-30`
- `legal-defaults.ts`, `legal-document-seed.ts` → `2026-06-01`
- `consent-service.test.ts` assumes `2026-05-30` accepted against `DEFAULT_LEGAL`

**Remediation:**
1. Pick one canonical version (recommend **`2026-05-30`** until content actually changes).
2. Align `DEFAULT_*_VERSION`, seed, web page, markdown, and `mobile.legal.config` DB row.
3. Fix unit test fixtures to match.

**Owner:** Backend + Web + Docs  
**Effort:** Small (1–2 hours)

---

### GAP-P0-02: Server privacy enforcement disabled by default

**Impact:** With `MOBILE_ENFORCE_PRIVACY_CONSENT=false`, users can call protected APIs without accepting privacy — client-only gates are bypassable.

**Evidence:** `.env.example` default `false`; compliance notes say production should be `true`.

**Remediation:**
1. Set `MOBILE_ENFORCE_PRIVACY_CONSENT=true` in production/staging env.
2. Optionally enable `LEGAL_ENFORCEMENT_ENABLED=true` when terms hard-gate is desired.
3. Verify allowlist in `isPrivacyConsentExemptPath` covers all pre-consent flows.
4. Run smoke test: unauthenticated consent → 403 `LEGAL_CONSENT_REQUIRED`.

**Owner:** DevOps / Backend  
**Effort:** Small (config + verification)

---

### GAP-P0-03: Doctor legal acceptance — no UI, no enforcement

**Impact:** Doctors may access farmer/clinical data without recorded acceptance of provider terms. Fails “Doctor access” validation.

**Evidence:**
- APIs: `doctor/legal/status`, `doctor/legal/accept` exist
- No pages under `pranidoctor-web/src/app/doctor/`
- No legal middleware on doctor API routes
- `requiredDocumentKeysForRole('DOCTOR')` = provider ToS only (no privacy doc)

**Remediation:**
1. Add doctor legal gate page (block dashboard until `allAccepted`).
2. Wire `GET /api/doctor/me` → redirect if `legal.pendingDocuments.length > 0`.
3. Add BFF proxies if doctor panel uses web API routes.
4. Document whether doctors fall under platform `PRIVACY-POLICY` or separate provider addendum — add to required docs if needed.

**Owner:** Web (doctor panel) + Backend  
**Effort:** Medium (2–4 days)

---

### GAP-P0-04: Consent unit tests failing (import resolution)

**Impact:** Regression risk on consent logic; CI may fail if test suite expanded.

**Evidence:**
```
Error: Cannot find module '../../../modules/legal/document-keys.js'
  from legal-consent-audit.ts
```

**Remediation:**
1. Fix relative import path or Vitest alias for `@/modules/legal/*`.
2. Update test fixture versions after GAP-P0-01 fix.
3. Ensure `consent-service.test.ts` passes in CI.

**Owner:** Backend  
**Effort:** Small (< 1 hour)

---

### GAP-P0-05: External legal / operational (from COMPLIANCE_NOTES)

| Item | Status |
|------|--------|
| LLM vendor DPAs executed | Not verified |
| Play Store Data Safety form updated | Not verified |
| Production `/privacy` URL live | Not verified in this audit |

**Remediation:** Legal/ops checklist before public launch — outside codebase but **P0 for store submission**.

---

## P1 — High priority (pre-GA)

### GAP-P1-01: No registration-time privacy acceptance

**Impact:** Account exists before consent; weaker demonstrability of informed consent at signup.

**Remediation:** Checkbox + link on `RegisterPage`; optional `acceptPrivacyVersion` on register API; audit with method `CHECKBOX_REGISTER`.

---

### GAP-P1-02: Consent withdraw — API only, no user UI

**Impact:** AI opt-out and withdrawal rights not practically exercisable in-app.

**Evidence:** `ConsentRepository.withdraw` unused by any presentation widget.

**Remediation:** Add withdraw actions on Privacy / AI consent pages with confirmation dialog; re-gate AI after withdraw.

---

### GAP-P1-03: Dual audit tables without unified admin view

**Impact:** Support/compliance investigations require manual correlation between `LegalConsentEvent` and `LegalAcceptanceEvent`.

**Remediation:** Admin “user consent timeline” query or API joining both by `userId`.

---

### GAP-P1-04: Self-serve data export API

**Impact:** Access/portability rights handled manually via support — does not scale.

**Reference:** COMPLIANCE_NOTES R-01.

---

### GAP-P1-05: Automated account erasure / retention purge

**Impact:** Retention policy in `DATA_RETENTION.md` not enforced automatically.

**Reference:** COMPLIANCE_NOTES R-02, R-03.

---

### GAP-P1-06: Migrations must be applied in target environments

**Impact:** Missing tables (`LegalConsentEvent`, `LegalDocument`, etc.) break acceptance and audit.

**Migrations:**
- `20260530180000_legal_consent`
- `20260601180000_legal_document_registry`

**Remediation:** Confirm applied in staging/production; run `legal-document-seed` where appropriate.

---

## P2 — Medium priority (post-launch or optional hardening)

### GAP-P2-01: Terms server hard-gate optional

Terms `hardGate: false` in registry — only privacy is API-enforced by default. Acceptable if intentional; enable via `LEGAL_ENFORCEMENT_ENABLED` + `legalGateEnabled` when product requires.

---

### GAP-P2-02: Provider privacy addendum for doctors/technicians

Clinical data access by providers may warrant dedicated privacy schedule beyond provider ToS.

---

### GAP-P2-03: Admin web legal acceptance for staff roles

`TOS-ADMIN` seeded; admin `/me` returns legal summary — verify admin dashboard gate if handling customer PII.

---

### GAP-P2-04: Enterprise submitter legal flows

`TOS-ENTERPRISE` in registry — confirm enterprise portal acceptance if live.

---

### GAP-P2-05: Locale parity for legal documents

Registry supports `bn-BD` and `en-US`; mobile legal config is single-locale summaries — ensure Bengali farmers see appropriate language.

---

## Gap closure matrix

| ID | Gap | Blocks production? | Est. effort |
|----|-----|-------------------|-------------|
| P0-01 | Version drift | Yes | S |
| P0-02 | Enforcement off | Yes (strict mode) | S |
| P0-03 | Doctor UX + gate | Yes | M |
| P0-04 | Tests failing | Yes (CI) | S |
| P0-05 | Legal/ops external | Yes (store) | Ops |
| P1-01 | Registration consent | Recommended | M |
| P1-02 | Withdraw UI | Recommended | S |
| P1-03 | Unified audit view | No | M |
| P1-04 | Data export | No (Phase 2) | L |
| P1-05 | Retention jobs | No (Phase 2) | L |
| P1-06 | Migration apply | Yes if missing | S |

---

## Recommended remediation order

1. **P0-01** — Align all version strings (immediate, unblocks testing)
2. **P0-04** — Fix tests
3. **P1-06** — Confirm migrations + seed in staging
4. **P0-02** — Enable enforcement in staging; validate mobile flows
5. **P0-03** — Doctor legal gate (minimum viable: block dashboard + accept page)
6. **P1-02** — Withdraw UI for AI consent
7. **P1-01** — Registration checkbox
8. **P0-05** — Legal/ops sign-off

---

## Related documents

- [PRIVACY_COMPLIANCE_REPORT.md](./PRIVACY_COMPLIANCE_REPORT.md)
- [PRIVACY_PRODUCTION_READINESS_REPORT.md](./PRIVACY_PRODUCTION_READINESS_REPORT.md)
- [privacy-policy-plan.md](./privacy-policy-plan.md)
