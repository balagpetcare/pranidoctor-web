# Emergency Service Limitation Notice — Compliance Verification Report

**Document type:** Compliance verification (static code + architecture audit)  
**Version:** 1.0.0  
**Date:** 2026-05-30  
**Scope:** Emergency limitation notice across `pranidoctor-backend`, `pranidoctor_user`, `pranidoctor-web`  
**Method:** Static code review, UI/API matrix vs `emergency-service-limitation-plan.md` §8 — no production runtime, legal sign-off, or marketing audit outside repo  
**Related:** `emergency-service-limitation-plan.md`, `EMERGENCY_LIMITATION_OPERATIONS.md`, `veterinary-disclaimer-plan.md`, `ai-escalation-disclosure-plan.md`

---

## Executive summary

Emergency service limitation is **implemented on primary human-urgent paths** (instant care, emergency booking, discovery filter, pending emergency SR, symptom-checker AI emergency) with CMS-managed copy, first-booking acceptance, server guard, and `LegalConsentEvent` audit.

**Overall compliance status: conditional pass (71/100).** Suitable for **staging / controlled launch** with compliance review. Blockers for broad production: legal sign-off (EL-01), **conflicting ETA copy** on instant care tiles, AI triage/chat emergency missing U1 urgent tier, no public-web U3 section, no automated tests, and migration not evidenced as deployed.

| Validation area | Result | Score |
|-----------------|--------|-------|
| Visibility | Partial pass | 68/100 |
| User awareness | Pass with gaps | 70/100 |
| Audit logs | Pass with gaps | 76/100 |
| Compliance coverage | Partial pass | 70/100 |

See also: `EMERGENCY_LIMITATION_PRODUCTION_READINESS_REPORT.md`, `EMERGENCY_LIMITATION_REMAINING_LEGAL_RISKS.md`.

---

## 1. Validation matrix

### 1.1 Visibility

**Requirement:** Users see limitation copy (U1 urgent and/or U2 contextual) at emergency/urgent touchpoints per plan §5.1.

| Surface | Plan priority | U1 urgent | U2 contextual | Vet / AI parallel | Verdict |
|---------|---------------|-----------|---------------|-------------------|---------|
| Instant care sheet | P0 | `EmergencyLimitationBanner(urgent: true)` | `instantCare` | Vet banner + emergency styling | **Pass** |
| Phone dial (instant care) | P0 | — | `phoneDial` dialog before `tel:` | — | **Pass** |
| Book consultation — emergency | P0 | Urgent + `bookingEmergency` | Same | Vet banner + accept sheet | **Pass** |
| Services — emergency filter | P1 | — | `discoveryEmergency` | — | **Pass** |
| SR detail — pending + emergency | P1 | — | `requestPending` | Vet contextual | **Pass** |
| Symptom checker — `emergency: true` | P0 | **Not shown** | `aiEmergency` only | AI escalation strip (E2) | **Partial** |
| AI triage card (chat) | P0 | **Not shown** | **Not shown** | AI escalation strip only | **Fail** |
| AI result page | P0 | **Not shown** | **Not shown** | Duplicate escalation strips | **Fail** |
| Book consultation — online | — | — | **Not wired** (`bookingOnline` in CMS only) | Vet `bookingOnline` | **Partial** |
| Platform banner (U0) | — | `emergencyLimitationBannerTextProvider` **unused** | — | — | **Fail** |
| Home emergency tile subtitle | P2 | Not implemented | ETA l10n still shows times | — | **Fail** (P2) |
| Public web `/legal`, `/terms` | §5.2 | — | U3 not added | — | **Fail** |
| Admin CMS | — | Editable | All 7 contexts | `EmergencyLimitationAdminPanel` | **Pass** |

**Evidence (mobile)**

- Widget: `lib/features/emergency_limitation/presentation/widgets/emergency_limitation_banner.dart`
- Wiring: `instant_care_sheet.dart`, `book_consultation_page.dart`, `services_page.dart`, `service_request_detail_page.dart`, `symptom_checker_page.dart`
- Preload: `ai_disclaimer_gate.dart`, `showInstantCareSheet` → `emergencyLimitationProvider.future`

**Plan checklist (§8.2 UI)**

| ID | Check | Static verdict |
|----|-------|----------------|
| EU-01 | Instant care emergency path | **Pass** (U1 + contextual + phone dialog) |
| EU-02 | Emergency book submit | **Pass** (vet + limitation banners + acceptance) |
| EU-03 | AI emergency result | **Partial** — escalation E2 yes; U1 urgent **missing** on triage/chat |
| EU-04 | Pending emergency SR | **Pass** |

**Visibility verdict:** **Partial pass** — human urgent flows covered; AI triage/chat and public legal gaps remain.

---

### 1.2 User awareness

**Requirement:** Users understand the platform is not emergency dispatch, response times are not guaranteed, and they must seek in-person care when critical (plan §3).

| Theme (plan §3) | Implementation | Verdict |
|-----------------|----------------|---------|
| Not emergency service / no dispatch | U1/U3 defaults; guard on `EMERGENCY_DOCTOR` | **Pass** |
| No guaranteed response time | U2 `requestPending`, `discoveryEmergency`, U3 full | **Pass** (where shown) |
| Profile flags ≠ live availability | `discoveryEmergency` copy | **Pass** |
| AI urgency ≠ dispatch | `aiEmergency` + AI escalation strip | **Partial** (triage/chat) |
| First emergency acceptance | `showEmergencyLimitationAcceptSheet` + server guard | **Pass** |
| BN + EN CMS | Defaults BN+EN in `emergency-limitation-defaults.ts` | **Pass** |
| Offline cache | `emergency_limitation_snapshot` | **Pass** |
| Phone number appropriateness | `phoneDial` dialog | **Pass** |

**Awareness gaps**

| Gap | Impact | Severity |
|-----|--------|----------|
| `homeCareCallDoctorEta` / `homeCareEmergencyVisitEta` (“Typical response: 5–15 min”, “15–30 min”) on instant care tiles | **Contradicts** non-guarantee messaging (plan §3.3, EL-02) | **High** |
| U3 `full` not reachable from Settings | Users cannot read comprehensive limitation in-app | **Medium** |
| Stacked vet + emergency banners on emergency book | Verbose but increases awareness | **Low** (UX) |
| No acceptance before instant care open (only before emergency **book**) | Aligns with plan (phone = U2 only) | **Acceptable** |
| `FIRST_EMERGENCY_USE` surface in schema but **unused** in Flutter | Minor audit granularity gap | **Low** |

**User awareness verdict:** **Pass with gaps** — core messaging is correct in CMS-driven banners; **instant care ETA strings undermine** limitation intent.

---

### 1.3 Audit logs

**Requirement:** Acceptance traceable; admin can see consent type; workflows preserved.

| Check | Implementation | Verdict |
|-------|----------------|---------|
| Consent type | `LegalConsentType.EMERGENCY_SERVICE` | **Pass** |
| Append-only events | `LegalConsentEvent` via `recordLegalConsentFireAndForget` | **Pass** |
| Metadata | `kind: EMERGENCY_LIMITATION_ACCEPT`, `surface`, optional `serviceRequestId` | **Pass** |
| User settings snapshot | `emergencyAcceptedVersion` / `emergencyAcceptedAt` | **Pass** |
| Consent registry | `CONSENT_REGISTRY` entry `emergency` | **Pass** |
| Admin consent API | `buildConsentStatus` maps all registry entries | **Pass** |
| Dedicated accept endpoint | `POST /api/mobile/legal/emergency-limitation/accept` | **Pass** |
| Settings sync fallback | `acceptEmergencyVersion` on sync body | **Pass** |
| API guard audit trail | `ForbiddenError` `LEGAL_CONSENT_REQUIRED` with version in body | **Pass** |
| SR create audit of limitation version | **No** event on create — only disclaimer fields in response | **Partial** |
| Automated tests | **None** for limitation module | **Fail** |
| Migration deployed | SQL present; runtime deploy **not verified** | **Not verified** |

**Evidence**

```192:210:pranidoctor-backend/src/legacy/web/lib/mobile-settings/mobile-settings-service.ts
  if (body.acceptEmergencyVersion === legal.emergencyLimitationVersion) {
    data.emergencyAcceptedVersion = legal.emergencyLimitationVersion;
    data.emergencyAcceptedAt = now;
    recordLegalConsentFireAndForget({
      userId,
      consentType: "EMERGENCY_SERVICE",
      version: legal.emergencyLimitationVersion,
      ...
      metadata: {
        surface: body.acceptEmergencySurface ?? "SETTINGS",
        kind: "EMERGENCY_LIMITATION_ACCEPT",
```

**Audit logs verdict:** **Pass with gaps** — acceptance is auditable; no automated verification or legal registry entry.

---

### 1.4 Compliance coverage (plan vs implementation)

| Plan phase | Scope | Status |
|------------|-------|--------|
| **P0** | U1/U2/U3 CMS + instant care + emergency book + AI emergency alignment | **Partial** — CMS + instant + book OK; AI triage/chat U1 missing |
| **P1** | Discovery + pending SR; `app-config` brief | **Partial** — UI OK; `emergencyLimitationBrief` **not implemented** |
| **P2** | First-emergency registry + marketing audit | Registry **done**; marketing/inbox audit **not run** |
| **P3** | Pending >10 min banner | **Not implemented** (future) |

**Behavioral checks (§8.3) — static**

| ID | Check | Verdict |
|----|-------|---------|
| EB-01 | `EMERGENCY_DOCTOR` → `PENDING` only | **Pass** (unchanged `createServiceRequestForCustomer`) |
| EB-02 | No auto-assign on create | **Pass** |
| EB-03 | Emergency filter = `acceptsEmergency` | **Pass** (unchanged discovery) |
| EB-04 | `MOBILE_EMERGENCY_PHONE` in user copy | **Partial** — `phoneDial` only; ops runbook not extended |

**Content checks (§8.1)**

| ID | Check | Verdict |
|----|-------|---------|
| EL-01 | Legal BN+EN approved | **Fail** (process) |
| EL-02 | No dispatch / implied SLA in app | **Fail** — instant care ETA strings |
| EL-03 | AI vs booking emergency distinguished | **Partial** — symptom checker yes; triage/chat weak |

**Workflow preservation**

| Workflow | Changed? | Verdict |
|----------|----------|---------|
| SR assignment / ops SLAs | No | **Pass** |
| AI safety / escalation records | No | **Pass** |
| Vet disclaimer track | Complementary | **Pass** |

**Compliance coverage verdict:** **Partial pass** — P0/P1 mobile largely met; web legal, app-config, AI surfaces, and EL-02 remain open.

---

## 2. Component inventory

### 2.1 Backend

| Component | Path | Status |
|-----------|------|--------|
| Defaults (U0/U1/U3 + 7 U2) | `src/legacy/web/lib/emergency-limitation/emergency-limitation-defaults.ts` | OK |
| Config loader | `emergency-limitation-config.ts` | OK |
| Mobile bundle service | `emergency-limitation.service.ts` | OK |
| Guard | `src/modules/emergency-limitation/emergency-limitation-guard.ts` | OK |
| Admin service | `admin-emergency-limitation-service.ts` | OK |
| Mobile GET/accept | `routes/mobile/legal/emergency-limitation/` | OK |
| Admin GET/PUT | `routes/admin/settings/emergency-limitation/route.ts` | OK |
| Prisma fields + enum | `schema.prisma`, migration `20260601200000_emergency_limitation` | OK (deploy TBD) |
| SR create fields | `limitationNotice`, `limitationContext` | OK |

### 2.2 Mobile

| Component | Path | Status |
|-----------|------|--------|
| DTO + contexts | `emergency_limitation_dto.dart` | OK |
| Repository + cache | `emergency_limitation_repository.dart` | OK |
| Providers | `emergency_limitation_providers.dart` | OK (banner provider unused) |
| Banner + accept sheet | `emergency_limitation_banner.dart` | OK |
| Workflow wiring | 5 surfaces (see §1.1) | Partial |

### 2.3 Web admin

| Component | Path | Status |
|-----------|------|--------|
| Admin panel | `EmergencyLimitationAdminPanel.tsx` | OK |
| Settings page | `settings/emergency-limitation/page.tsx` | OK |
| API proxy | `api/admin/settings/emergency-limitation/route.ts` | OK |
| Settings hub link | `settings/page.tsx` | OK |

---

## 3. Gap summary

| # | Gap | Severity | Remediation |
|---|-----|----------|-------------|
| G1 | Legal sign-off (EL-01) not recorded | **High** | Counsel review + compliance registry |
| G2 | Instant care ETA implies response times (EL-02) | **High** | Replace l10n with non-SLA wording or remove ETAs |
| G3 | AI triage/chat emergency without U1 / `aiEmergency` | **High** | Add `EmergencyLimitationBanner` to `TriageCard` / `AiResultPage` when `emergency` |
| G4 | Public web U3 section missing | **Medium** | Add section to `/privacy` or `/terms` |
| G5 | Platform banner unused | **Low** | Optional global strip on home/services |
| G6 | `bookingOnline` contextual not wired | **Low** | Banner when online consult selected |
| G7 | `app-config.emergencyLimitationBrief` not implemented | **Low** | P1 backend field |
| G8 | No automated tests | **Medium** | Vitest + Flutter widget/API tests |
| G9 | Inbox/push “help coming” copy audit | **Medium** | Manual grep + product review (EU inbox P0) |
| G10 | `consent-service.test.ts` stale (no vet/emergency fields) | **Low** | Update fixture |

---

## 4. Sign-off checklist

| Item | Status |
|------|--------|
| EL-01 Legal BN+EN approved | **Not verified** |
| EL-02 No implied SLA in user-facing copy | **Fail** (instant care ETAs) |
| EL-03 AI vs booking emergency distinguished | **Partial** |
| EU-01 – EU-04 | **Pass** except EU-03 partial |
| EB-01 – EB-04 | **Pass** (static) |
| Admin panel save/load | **Pass** (code) |
| Workflow preservation | **Pass** |
| Runtime E2E on staging | **Not run** |
| DB migration applied | **Not verified** |

---

## 5. Conclusion

Emergency Service Limitation Notice meets the **intent** of the compliance plan for **human urgent workflows**, **first-emergency acceptance**, **auditability of consent**, and **preserved booking/ops behavior**. It does **not yet** fully satisfy the plan’s **AI urgent surface matrix**, **public legal placement**, **EL-02 marketing/UX consistency**, or **legal/process gates**.

**Recommendation:** **Conditional pass — approve for staging; resolve G1–G3 before broad production.**

---

*End of verification report. Re-run after legal sign-off, migration deploy, ETA copy fix, and staging E2E.*
