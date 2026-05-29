# AI Disclaimer — Verification Report

**Document type:** Compliance verification (code + architecture audit)  
**Version:** 1.0.0  
**Date:** 2026-05-30  
**Scope:** AI disclaimer implementation across `pranidoctor-backend`, `pranidoctor_user`, `pranidoctor-web`  
**Method:** Static code review, route/middleware tracing, UI surface matrix — no production runtime test  
**Related:** `ai-disclaimer-plan.md`, `AI_DISCLAIMER_OPERATIONS.md`

---

## Executive summary

The AI disclaimer framework is **substantially implemented** and suitable for **controlled staging / soft launch** with ops oversight. Core requirements — CMS-managed copy, acceptance persistence, server enforcement on `/api/ai/*`, admin editing, and audit append — are in place.

**Production readiness: conditional pass (72/100).** Remaining gaps are secondary AI surfaces without UI disclaimers, voice API consent bypass, client/server `enforceAcceptance` mismatch, duplicate audit writes, missing automated tests, and T3 Bengali parity.

| Validation area | Result | Score |
|-----------------|--------|-------|
| Visibility before AI usage | Partial pass | 68/100 |
| Acceptance tracking | Pass | 88/100 |
| Audit logs | Pass with gaps | 75/100 |
| Version tracking | Pass | 85/100 |
| Admin controls | Pass | 82/100 |

---

## 1. Validation matrix

### 1.1 Visibility before AI usage

**Requirement:** Users see disclaimer (T1/T2) before or during AI interaction; acceptance (T3) before first use when enforcement is on.

| Surface | Gate (`AiDisclaimerGate`) | T1/T2 banner | Server `/api/ai` consent | Verdict |
|---------|---------------------------|--------------|--------------------------|---------|
| AI hub (`/ai`) | Yes | Yes (generic T1) | Yes | **Pass** |
| AI chat (`/home/ai-chat`) | Yes | Yes (T2 chat) | Yes (chat/triage core) | **Pass** |
| Smart recommendations | Yes | Yes (T2 recs) | Yes | **Pass** |
| Symptom checker | Yes | Yes (T2 advisory footer) | Yes | **Pass** |
| Farm health dashboard | Yes | Yes (T2 advisory) | Yes | **Pass** |
| Voice input (`/home/ai-chat/voice`) | Via chat parent only | No dedicated banner | **No** — `/api/voice/*` lacks `requireMobileAiConsent` | **Fail** |
| Knowledge search (`/ai/knowledge`) | No | No | Yes (API only) | **Partial** |
| Smart alerts (`/ai/alerts`) | No | No | Yes | **Partial** |
| Follow-ups (`/ai/follow-ups`) | No | No | Yes | **Partial** |
| AI history / AI settings | No | No | N/A (read-only / prefs) | **Acceptable** |
| Home quick actions → chat | Redirect/gate via chat route | N/A | Yes | **Pass** |
| Per-message chat disclaimer | N/A | Rendered on assistant bubbles | API field present | **Pass** |

**Client navigation behavior**

- `nav_guard.dart` redirects unaccepted users on AI routes to **`/settings/ai-consent`** (settings page), not the in-flow modal.
- `AiDisclaimerGate` shows a blocking sheet + placeholder when `acceptanceRequired` is true — **may not run** if router redirect fires first.
- AI home shows a consent card when `!aiConsentAccepted`; chat button guarded; **voice button is not guarded** on home.

**Evidence**

- Gate wiring: `lib/routing/app_router.dart` (`AiDisclaimerGate` on hub, chat, symptom, recs, farm health)
- Banners: `ai_chat_page.dart`, `smart_recommendations_page.dart`, `farm_health_dashboard_page.dart`, `symptom_checker_page.dart`
- Voice gap: `voice-assistant.routes.ts` — `authenticateMobileCustomer` only

**Visibility verdict:** **Partial pass** — primary flows (chat, recommendations, advisory) covered; secondary Phase 8 routes and voice API exposed.

---

### 1.2 Acceptance tracking

**Requirement:** Persist who accepted which version and when.

| Check | Implementation | Verdict |
|-------|----------------|---------|
| User record | `MobileUserSettings.aiAcceptedVersion`, `aiAcceptedAt` | **Pass** |
| Accept via settings sync | `POST /api/mobile/settings/sync` + `acceptAiVersion` | **Pass** |
| Dedicated accept API | `POST /api/mobile/legal/ai-disclaimer/accept` with `version` + `surface` | **Pass** |
| Version mismatch rejected | Accept route returns `409` if version ≠ `legal.aiConsentVersion` | **Pass** |
| Flutter persistence | `AiDisclaimerRepository.accept()` + settings fallback | **Pass** |
| Cache invalidation | `aiDisclaimerProvider` refresh; settings page invalidates on accept | **Pass** |
| Settings bundle exposes status | `legal.aiConsentAccepted`, `aiConsentRequired` | **Pass** |

**Issue — duplicate audit on dedicated accept**

`POST …/ai-disclaimer/accept` calls `syncMobileSettingsForUser` (which records `LegalConsentEvent`) **and** calls `recordLegalConsentFireAndForget` again → **two audit rows per accept**.

**Acceptance verdict:** **Pass** (tracking works; audit duplication is a quality issue).

---

### 1.3 Audit logs

**Requirement:** Append-only log of AI disclaimer/consent acceptance with version and context.

| Check | Implementation | Verdict |
|-------|----------------|---------|
| Storage | `LegalConsentEvent` (`consentType: AI_PROCESSING`) | **Pass** |
| Metadata | `metadata: { surface, kind: 'AI_DISCLAIMER_ACCEPT' }` on sync/accept | **Pass** |
| IP / user-agent | Captured via `authRequestContext` | **Pass** |
| Admin query API | `GET /api/admin/legal-consent?consentType=AI_PROCESSING` | **Pass** |
| Admin UI | `AdminLegalSettingsForm` — recent 20 events on **Settings → Legal** | **Pass** |
| Metadata in admin list | `listLegalConsentEvents` select **omits** `metadata` | **Partial** |
| Automated tests | None found for disclaimer/consent paths | **Fail** |

**Acceptance surfaces logged:** `FIRST_AI_USE`, `AI_HOME`, `AI_CHAT`, `AI_RECOMMENDATIONS`, `AI_ADVISORY`, `SETTINGS` (schema in `schemas.ts`).

**Audit verdict:** **Pass with gaps** — logging works; admin visibility of `surface` incomplete; no test coverage.

---

### 1.4 Version tracking

**Requirement:** Separate content versioning from consent versioning; re-prompt on consent bump.

| Field | Source | Purpose | Verdict |
|-------|--------|---------|---------|
| `consentVersion` / `aiConsentVersion` | `mobile.legal.config` | Acceptance gate; stored on user row | **Pass** |
| `contentVersion` | `mobile.ai.disclaimer.config` | Display-only tier versioning | **Pass** |
| Mobile DTO | `GET /api/mobile/legal/ai-disclaimer` returns both + `accepted` | **Pass** |
| Re-prompt logic | `aiAcceptedVersion !== aiConsentVersion` → not accepted | **Pass** |
| Admin bump | AI Disclaimer admin edits `consentVersion` | **Pass** |

**Issue — T3 Bengali**

`getAiDisclaimerForUser` sets `full.bn` = `full.en` (single `aiConsentContent` string). T1/T2 have proper BN; T3 modal does not.

**Version verdict:** **Pass** (mechanism sound; BN T3 gap).

---

### 1.5 Admin controls

| Capability | Location | Verdict |
|------------|----------|---------|
| Edit T1/T2 + enforcement | Admin → Settings → **AI Disclaimer** (`AiDisclaimerAdminPanel`) | **Pass** |
| Edit T3 title/content + consent version | Same panel (syncs `mobile.legal.config`) | **Pass** |
| Edit legal URLs / privacy / terms | Admin → Settings → **Legal** (`AdminLegalSettingsForm`) | **Pass** |
| View consent audit | Legal settings page — recent events | **Pass** |
| Filter AI-only audit | API supports `consentType=AI_PROCESSING`; UI shows mixed types | **Partial** |
| BFF proxy | `/api/admin/settings/ai-disclaimer` → backend | **Pass** |
| Seed defaults | `DEFAULT_AI_DISCLAIMER_CONFIG` in backend | **Pass** |

**Admin verdict:** **Pass** — ops can manage copy, enforcement flag, and consent version without deploy.

---

## 2. AI compliance report

### 2.1 Regulatory / policy alignment

| Requirement | Status | Notes |
|-------------|--------|-------|
| Non-diagnostic language in managed copy | **Met** | Default T1/T2/T3 state educational-only positioning |
| User acknowledgment before AI | **Met** (when `enforceAcceptance: true`) | Server + client gates |
| Versioned consent | **Met** | `aiConsentVersion` on user + event log |
| Audit trail | **Met** | `LegalConsentEvent` append-only |
| Bilingual disclaimers (BN market) | **Partial** | T1/T2 BN OK; T3 BN missing; i18n fallback fixed |
| Play Store medical disclaimer | **Partial** | In-app present; public URL cross-check still ops task |
| Privacy policy AI disclosure | **Partial** | Default `aiConsentContent` mentions LLM providers — legal review pending |

### 2.2 Control effectiveness

```
┌─────────────────────────────────────────────────────────────┐
│                    AI disclaimer control flow                │
├─────────────────────────────────────────────────────────────┤
│  Admin edits copy/version  →  Setting table (DB)            │
│         ↓                                                    │
│  Mobile GET ai-disclaimer  →  Flutter banners + gate        │
│         ↓                                                    │
│  User accepts  →  MobileUserSettings + LegalConsentEvent      │
│         ↓                                                    │
│  API /api/ai/*  →  requireMobileAiConsent (if enforced)     │
└─────────────────────────────────────────────────────────────┘
```

**Effective for:** chat, triage, symptom check, recommendations, farm health, farm briefing/query (API).

**Not effective for:** `/api/voice/*` (no consent middleware).

### 2.3 Compliance score

**Overall compliance posture: 74/100 — Adequate for pilot; legal sign-off required for production.**

---

## 3. Risk report

| ID | Risk | Severity | Likelihood | Impact | Mitigation |
|----|------|----------|------------|--------|------------|
| R1 | Voice API bypasses AI consent middleware | **High** | Medium | User gets AI/STT without recorded acceptance | Add `requireMobileAiConsent` to `voice-assistant.routes.ts` |
| R2 | Knowledge/alerts/follow-ups lack UI disclaimers | **Medium** | Medium | User sees AI output without visible disclaimer | Add `AiDisclaimerGate` + banner to remaining Phase 8 routes |
| R3 | Flutter nav treats AI consent always required; ignores `enforceAcceptance` | **Medium** | Low (staging) | Staging with enforcement off still blocks AI routes in app | Gate `needsAiConsent` on `enforceAcceptance` from disclaimer API |
| R4 | Duplicate audit entries on accept endpoint | **Low** | High | Inflated metrics, compliance noise | Remove duplicate `recordLegalConsent` in accept route OR skip sync audit |
| R5 | T3 consent modal English-only in BN locale | **Medium** | High (BD users) | Weaker informed consent for Bengali farmers | Add `aiConsentContentBn` to legal config |
| R6 | Dual UX paths (router → settings vs gate modal) | **Low** | Medium | Confusing consent UX | Unify on gate modal OR remove redundant redirect |
| R7 | No automated verification tests | **Medium** | High | Regressions undetected | Add backend + widget tests per plan §9 |
| R8 | Home voice button skips chat consent check | **Medium** | Medium | Voice use without chat-level acknowledgment | Guard voice navigation same as chat |
| R9 | Admin audit list hides `metadata.surface` | **Low** | Medium | Harder incident investigation | Include metadata in list API + UI |
| R10 | Cached disclaimer stale after admin bump | **Low** | Low | Brief wrong copy until refresh | Document TTL; force refresh on AI entry |

---

## 4. Readiness assessment

### 4.1 Component readiness

| Component | Ready? | Blocker |
|-----------|--------|---------|
| Backend content CMS | Yes | — |
| Mobile accept + persist | Yes | — |
| Server enforcement `/api/ai/*` | Yes | Voice module excluded |
| Admin disclaimer editor | Yes | — |
| Admin audit visibility | Mostly | Surface metadata not shown |
| Documentation / runbook | Yes | `AI_DISCLAIMER_OPERATIONS.md` |
| Automated tests | **No** | No disclaimer-specific tests |
| Legal text sign-off | **Unknown** | Counsel review not evidenced in repo |

### 4.2 Environment recommendation

| Environment | Recommendation |
|-------------|----------------|
| **Local / dev** | Ready — use admin panel to seed disclaimer config |
| **Staging** | **Ready** — enable `enforceAcceptance`, walk through accept → chat → audit |
| **Production** | **Conditional** — resolve R1, R2, R5 before general availability |

### 4.3 Pre-production checklist (from verification)

- [x] T1/T2 managed copy API exists
- [x] Acceptance persisted on user settings
- [x] Audit events written on accept
- [x] Consent version mismatch rejected
- [x] Admin can edit disclaimer + bump version
- [x] Primary AI screens show banners
- [x] Chat/triage/recs/symptom/farm-health API consent enforced
- [ ] Voice API consent enforced
- [ ] All Phase 8 AI routes show disclaimers
- [ ] T3 Bengali content
- [ ] No duplicate audit on accept
- [ ] Automated test suite (DC/DP/AC IDs from plan)
- [ ] Legal counsel sign-off on canonical text

### 4.4 Readiness score

| Dimension | Score |
|-----------|-------|
| Engineering completeness | **78/100** |
| Compliance controls | **74/100** |
| Operational readiness | **70/100** |
| Test / QA confidence | **45/100** |
| **Weighted overall** | **72/100** |

**Assessment:** **Staging-ready / production-conditional.** Safe to enable for internal QA and limited pilot if voice and secondary routes are restricted or fixed within the same release train.

---

## 5. Recommended remediation (priority order)

1. **P0** — Add `requireMobileAiConsent` to `/api/voice/*` routes.
2. **P0** — Add `AiDisclaimerGate` + banner to knowledge search, alerts, follow-ups.
3. **P1** — Fix duplicate audit on `POST …/ai-disclaimer/accept`.
4. **P1** — Respect `enforceAcceptance` in Flutter `legalConsentGateProvider` / nav redirect.
5. **P1** — Bengali T3 content (`aiConsentContentBn`).
6. **P2** — Guard voice button on AI home; unify consent UX (modal vs settings redirect).
7. **P2** — Expose `metadata` in admin audit list; filter AI_PROCESSING in UI.
8. **P2** — Add integration tests: accept flow, 403 without consent, version bump re-prompt.

---

## 6. Verification evidence index

| Artifact | Path |
|----------|------|
| Disclaimer defaults | `pranidoctor-backend/src/legacy/web/lib/ai-disclaimer/ai-disclaimer-defaults.ts` |
| Mobile disclaimer API | `pranidoctor-backend/src/legacy/web/routes/mobile/legal/ai-disclaimer/` |
| Accept + audit | `…/ai-disclaimer/accept/route.ts`, `legal-consent-audit.ts` |
| AI route guard | `pranidoctor-backend/src/modules/auth/mobile-legal-consent.middleware.ts` |
| Flutter gate/banner | `pranidoctor_user/lib/features/ai/presentation/widgets/` |
| Flutter providers | `ai_disclaimer_providers.dart`, `ai_disclaimer_repository.dart` |
| Admin panel | `pranidoctor-web/src/components/admin/settings/AiDisclaimerAdminPanel.tsx` |
| Ops runbook | `docs/compliance/ai/AI_DISCLAIMER_OPERATIONS.md` |

---

*End of verification report.*
