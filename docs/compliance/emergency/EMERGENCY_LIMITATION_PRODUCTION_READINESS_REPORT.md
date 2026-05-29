# Emergency Service Limitation Notice — Production Readiness Report

**Document type:** Production readiness assessment  
**Version:** 1.0.0  
**Date:** 2026-05-30  
**Based on:** `EMERGENCY_LIMITATION_VERIFICATION_REPORT.md` (static audit)  
**Overall readiness:** **Conditional go** — staging and pilot OK; **not** full national production without listed blockers

---

## 1. Readiness scorecard

| Dimension | Weight | Score | Weighted |
|-----------|--------|-------|----------|
| Feature completeness (plan P0/P1) | 25% | 72 | 18.0 |
| Technical deployability | 20% | 80 | 16.0 |
| User safety / awareness | 25% | 62 | 15.5 |
| Audit & compliance ops | 15% | 78 | 11.7 |
| Legal & policy gates | 15% | 45 | 6.8 |
| **Total** | 100% | — | **68.0 / 100** |

**Interpretation:** Above **60** = acceptable for **controlled rollout**. Below **80** = not “production-hardened” for scale without remediation.

---

## 2. Go / no-go criteria

### 2.1 Ready now (staging / pilot)

| Criterion | Evidence | Status |
|-----------|----------|--------|
| CMS editable without deploy | Admin `GET/PUT` emergency-limitation | **Ready** |
| Mobile loads bundle + cache | `GET /api/mobile/legal/emergency-limitation` | **Ready** |
| Emergency book blocked without acceptance (when enforced) | `emergency-limitation-guard.ts` | **Ready** |
| Consent events written | `EMERGENCY_SERVICE` + metadata | **Ready** |
| Core workflows unchanged | No assign/dispatch logic changes | **Ready** |
| Ops runbook exists | `EMERGENCY_LIMITATION_OPERATIONS.md` | **Ready** |

### 2.2 Blockers for full production

| Blocker | Owner | ETA guidance |
|---------|-------|--------------|
| **B1** Legal sign-off on BN+EN canonical text | Legal / compliance | Before marketing scale |
| **B2** Fix instant care ETA strings (EL-02) | Product + mobile i18n | Before any “emergency” campaign |
| **B3** AI triage/chat emergency U1 visibility (EU-03) | Mobile | Same release as B2 preferred |
| **B4** Apply Prisma migration in all environments | DevOps | Pre-staging smoke test |
| **B5** Staging E2E (book emergency, accept, audit row) | QA | One sprint |

### 2.3 Recommended before scale (non-blocking)

| Item | Priority |
|------|----------|
| Public web U3 limitation section | P1 |
| Automated API/accept tests | P1 |
| `app-config.emergencyLimitationBrief` | P2 |
| Inbox/push copy audit | P1 |
| Settings screen linking U3 `full` text | P2 |

---

## 3. Deployment checklist

### 3.1 Backend

- [ ] Run migration `20260601200000_emergency_limitation` on staging → production
- [ ] `npx prisma generate` on deploy artifact
- [ ] Smoke: `GET /api/mobile/legal/emergency-limitation` (auth customer)
- [ ] Smoke: `POST` accept → row in `LegalConsentEvent` with `EMERGENCY_SERVICE`
- [ ] Smoke: `POST /api/mobile/service-requests` with `EMERGENCY_DOCTOR` without accept → `403 LEGAL_CONSENT_REQUIRED` (when `enforceAcceptance: true`)
- [ ] Confirm `mobile.legal.config` includes `emergencyLimitationVersion` after admin save

### 3.2 Mobile

- [ ] Build with `emergency_limitation` feature; verify offline cache key
- [ ] Test instant care: banners + phone dialog
- [ ] Test emergency book: double accept (vet + emergency) if both enforced
- [ ] Test discovery filter banner
- [ ] Test pending emergency SR detail banner
- [ ] **Verify** instant care subtitles after B2 fix

### 3.3 Web admin

- [ ] Open `/admin/settings/emergency-limitation`; save copy bump `contentVersion`
- [ ] Proxy route reaches backend (not Next.js Prisma)

### 3.4 Monitoring (no new alerts required)

- Existing ops alerts (OPS-REQ-03, OPS-ESC-02) remain **internal** — do not surface SLA minutes to users
- Optional: dashboard count of `LegalConsentEvent` where `consentType = EMERGENCY_SERVICE` per day

---

## 4. Rollback plan

| Action | Effect |
|--------|--------|
| Set `enforceAcceptance: false` in admin CMS | Stops blocking emergency book; copy still visible |
| Revert mobile release | Falls back to vet disclaimer + AI escalation only |
| Keep migration | Safe to leave columns/events; no data loss on rollback |

---

## 5. Release communication

**Support / ops**

- Emergency booking = **request**, not dispatch
- Acceptance event query: `LegalConsentEvent` + `metadata.kind = EMERGENCY_LIMITATION_ACCEPT`

**Users**

- No release notes promising faster emergency response
- If `consentVersion` bumped, users re-accept on next emergency book

---

## 6. Production readiness decision

| Environment | Decision | Rationale |
|-------------|----------|-----------|
| **Development** | **Go** | Full stack implemented |
| **Staging** | **Go** | Complete E2E + legal review |
| **Pilot / limited production** | **Go with conditions** | After B4 + B5; monitor consent errors |
| **Full production / marketing scale** | **No-go until B1–B3** | ETA conflict and AI gap create misleading-claim risk |

---

## 7. Post-launch verification (30 days)

1. Sample audit: 20 `EMERGENCY_SERVICE` events have `surface` populated
2. Zero user-facing copy claiming “instant” or guaranteed minutes (spot check BN+EN)
3. Support ticket themes: “doctor not arrived” — ensure scripts reference limitation notice
4. Admin copy changes reflected in mobile within cache TTL (force refresh test)

---

*End of production readiness report.*
