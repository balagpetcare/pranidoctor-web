# User Consent Flow — Compliance Verification Report

**Report date:** 2026-05-30  
**Scope:** Mobile customer consent (capture, versioning, audit, re-consent, withdrawal)  
**Related docs:**  
- Plan: `user-consent-flow-plan.md` (v1.1.0)  
- Implementation: `USER_CONSENT_IMPLEMENTATION.md`  
- Legal notes: `../legal/COMPLIANCE_NOTES.md`

---

## Executive summary

| Validation area | Result | Confidence |
|-----------------|--------|------------|
| Consent capture | **PARTIAL PASS** | High (code + unit tests) |
| Versioning | **PASS** | High |
| Audit logs | **PARTIAL PASS** | High |
| Re-consent handling | **PARTIAL PASS** | High |
| Withdrawal handling | **PARTIAL PASS** | Medium |

**Overall:** The user consent flow is **operationally implemented** for mobile customers with version-aware storage, append-only audit events, re-consent UX, and a withdrawal API. Several gaps remain before this can be treated as **fully audit-ready** for regulatory review: dual audit systems, incomplete vet-consent coverage in APIs/UI, missing explicit grant metadata, no registration-time capture, and limited automated integration coverage.

---

## Verification methodology

1. **Static code review** across `pranidoctor-backend`, `pranidoctor_user`, and `pranidoctor-web`.
2. **Unit tests:** `consent-service.test.ts` (2/2 passed, 2026-05-30).
3. **Typecheck spot-check:** `tsc --noEmit` surfaced consent-related TS errors (documented below).
4. **Schema/migration review:** `LegalConsentEvent`, `MobileUserSettings`, `LegalAcceptanceEvent`.
5. **Cross-reference** against `user-consent-flow-plan.md` acceptance criteria.

No live-environment penetration or end-to-end mobile device test was run in this verification pass.

---

## 1. Consent capture

**Result: PARTIAL PASS**

### What works

| Mechanism | Evidence |
|-----------|----------|
| Privacy acceptance | `POST /api/mobile/settings/sync` with `acceptPrivacyVersion` matching current config → writes `privacyAcceptedVersion` + `privacyAcceptedAt` |
| Terms acceptance | Same sync path via `acceptTermsVersion` |
| AI processing consent | `acceptAiVersion` + dedicated `AiConsentPage` (Flutter) |
| Vet advice disclaimer | `acceptVetVersion` + `vet-disclaimer.service.ts` |
| Version equality gate | Accept only when client-sent version **exactly equals** published version (prevents stale accept) |
| Settings read-back | `GET /api/mobile/settings` exposes `legal.*` acceptance flags for client gating |
| Dedicated status API | `GET /api/mobile/consent/status` returns registry + `reconsentRequired[]` |

**Backend capture path** (`mobile-settings-service.ts`):

```126:186:pranidoctor-backend/src/legacy/web/lib/mobile-settings/mobile-settings-service.ts
  if (body.acceptPrivacyVersion === legal.privacyVersion) {
    data.privacyAcceptedVersion = legal.privacyVersion;
    data.privacyAcceptedAt = now;
    recordLegalConsentFireAndForget({ ... });
  }
  // ... terms, AI, vet — same pattern
```

**Flutter capture surfaces:**

- `ReConsentPage` — privacy + terms on version bump
- `PrivacyPage` / terms pages — individual accept
- `AiConsentPage` — AI consent
- Vet disclaimer — service-request flow via `acceptVetVersion`

### Gaps

| Gap | Severity | Detail |
|-----|----------|--------|
| No registration-time consent | Medium | Auth/register flows do not capture legal acceptance; first capture happens post-login via settings/re-consent |
| Grant audit lacks explicit action | Low | Grant events write to `LegalConsentEvent` without `metadata.action: "GRANTED"` (withdraw uses `WITHDRAWN`) |
| Invalid audit payload fields | Medium | `recordLegalConsentFireAndForget` calls pass `role` / `method` not in `RecordLegalConsentInput` — **TS2353 errors**; fields are silently dropped at compile time if build is forced |
| Dual capture systems | Medium | `LegalAcceptanceEvent` + `LegalDocument` registry exists (`modules/legal/`) but **mobile sync does not write there**; only panel flows use `recordLegalAcceptance` |

---

## 2. Versioning

**Result: PASS**

### What works

| Component | Behavior |
|-----------|----------|
| Canonical config | `Setting` key `mobile.legal.config` via `loadLegalConfig()` |
| Default versions | `legal-defaults.ts`: privacy/terms/AI `2026-06-01`, vet `2026-05-30.1` |
| Registry mapping | `consent-registry.ts` maps each `LegalConsentType` → config field + settings columns |
| Stale detection | Strict string equality: `acceptedVersion === requiredVersion` |
| Admin bump | Admin legal settings update config version → existing acceptances become stale |
| DB enum evolution | Migration `20260530190000_vet_disclaimer` adds `VET_ADVICE` to `LegalConsentType` |

**Version resolution** (`consent-service.ts`):

```47:50:pranidoctor-backend/src/legacy/web/lib/mobile-settings/consent-service.ts
  const acceptedVersion = row[entry.settingsVersionField];
  const acceptedAt = row[entry.settingsAtField];
  const accepted = acceptedVersion != null && acceptedVersion === requiredVersion;
```

### Gaps

| Gap | Severity | Detail |
|-----|----------|--------|
| `requiredVersions` DTO omits vet | Low | `ConsentStatusDto.requiredVersions` lists privacy/terms/AI only; vet version available per-record but not in summary object |
| Parallel `LegalDocument` versions | Low | Document registry versions are independent of `mobile.legal.config` strings — potential drift if both are used |

---

## 3. Audit logs

**Result: PARTIAL PASS**

### What works

| Requirement | Implementation |
|-------------|----------------|
| Append-only store | `LegalConsentEvent` — no update/delete paths in codebase |
| Per-event identity | `userId`, `consentType`, `version`, `channel`, `createdAt` |
| Request context | IP + User-Agent captured via `authRequestContext(request)` on sync/withdraw |
| Withdrawal marker | `metadata: { action: "WITHDRAWN", reason? }` |
| Admin visibility | `GET /api/admin/legal-consent` — paginated event list |
| Admin overview | `GET /api/admin/consent/overview` — acceptance counts vs current versions |
| Resilience | `recordLegalConsentEvent` catches errors, logs warning, never throws |

**Audit write** (`legal-consent-audit.ts`):

```16:36:pranidoctor-backend/src/legacy/web/lib/mobile-settings/legal-consent-audit.ts
/** Append-only consent audit — never throws. */
export async function recordLegalConsentEvent(input: RecordLegalConsentInput): Promise<void> {
  try {
    await prisma.legalConsentEvent.create({ ... });
  } catch (error) {
    console.warn(`[legal-consent] audit write failed ...`);
  }
}
```

**Schema** (initial migration):

```9:20:pranidoctor-backend/prisma/migrations/20260530180000_legal_consent/migration.sql
CREATE TABLE IF NOT EXISTS "LegalConsentEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "consentType" "LegalConsentType" NOT NULL,
  "version" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'MOBILE',
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ...
);
```

### Gaps

| Gap | Severity | Detail |
|-----|----------|--------|
| No unified audit trail | **High** | Mobile → `LegalConsentEvent`; panel/provider → `LegalAcceptanceEvent` + `AuthAuditEvent.LEGAL_ACCEPTED`. Compliance queries must join two systems |
| Grant events lack `action` | Medium | Distinguishing grant vs re-grant requires inferring from settings timestamps or absence of `WITHDRAWN` |
| Silent audit failure | Medium | Fire-and-forget + swallow errors — acceptance persists even if audit row fails |
| Admin overview excludes vet | Low | Counts only privacy/terms/AI |
| No retention/immutability policy in code | Low | Append-only by convention; no DB trigger preventing deletes |

---

## 4. Re-consent handling

**Result: PARTIAL PASS**

### What works

| Layer | Behavior |
|-------|----------|
| Server stale detection | `buildConsentStatus()` → `reconsentRequired: ['privacy','terms','ai','vet']` for stale/missing |
| Flutter hard gate | `legalGateEnabled && needsLegalGate` → redirect to `/reconsent` (`nav_guard.dart`, `legal_consent_gate.dart`) |
| Re-consent UX | `ReConsentPage` accepts privacy + terms in one action via settings sync |
| AI soft/hard gate | AI routes redirect to `/settings/ai-consent`; Express `requireMobileAiConsent` when `enforceAcceptance` |
| Privacy API gate | `MOBILE_ENFORCE_PRIVACY_CONSENT` + `requireMobilePrivacyConsent` on AI routes |
| Exempt paths | Settings, auth, health, `/mobile/me` exempt from privacy gate |
| Onboarding preserved | Onboarding slides unchanged; no legal text at first launch |
| Admin trigger | Bumping version in admin legal settings invalidates prior acceptances |

**Flutter gate logic:**

```121:122:pranidoctor_user/lib/features/settings/data/settings_dto.dart
  bool get needsLegalGate =>
      legalGateEnabled && (!privacyAccepted || !termsAccepted);
```

**Note:** Re-consent hard gate covers **privacy + terms only**. AI and vet stale states are handled via separate routes (AI chat gate, vet disclaimer flow), not `/reconsent`.

### Gaps

| Gap | Severity | Detail |
|-----|----------|--------|
| Gate can be disabled | Medium | `MOBILE_LEGAL_GATE_ENABLED=false` disables client re-consent gate |
| Terms not server-enforced globally | Medium | `LEGAL_ENFORCEMENT_ENABLED` controls server-side terms gate separately from privacy |
| Vet not in re-consent page | Low | Stale vet acceptance does not block via `/reconsent` |
| Consent status API unused in gate | Low | Flutter gate reads settings bundle, not `GET /api/mobile/consent/status` |

---

## 5. Withdrawal handling

**Result: PARTIAL PASS**

### What works

| Component | Behavior |
|-----------|----------|
| Withdraw API | `POST /api/mobile/consent/withdraw` — clears version + timestamp on `MobileUserSettings` |
| Audit on withdraw | Writes `LegalConsentEvent` with `metadata.action: "WITHDRAWN"` |
| Supported types (API) | `PRIVACY`, `TERMS`, `AI_PROCESSING` |
| Registry support | `withdrawConsentForUser` supports all registry types including `VET_ADVICE` |
| Flutter UI | `PrivacyPage._withdraw()` calls consent repository with confirmation dialog |
| Post-withdraw state | Returns updated `ConsentStatusDto`; client invalidates settings |

**Withdraw service** (`consent-service.ts`):

```105:130:pranidoctor-backend/src/legacy/web/lib/mobile-settings/consent-service.ts
  await prisma.mobileUserSettings.upsert({
    ...
    [entry.settingsVersionField]: null,
    [entry.settingsAtField]: null,
  });
  await recordLegalConsentEvent({
    ...
    metadata: { action: 'WITHDRAWN', ...(reason ? { reason } : {} ) },
  });
```

### Gaps

| Gap | Severity | Detail |
|-----|----------|--------|
| Route schema excludes vet | **Medium** | Withdraw route Zod enum: `["PRIVACY","TERMS","AI_PROCESSING"]` — `VET_ADVICE` rejected at API layer despite service support |
| UI withdrawal incomplete | Medium | Only privacy withdraw in Flutter; no terms/AI/vet withdraw UI |
| Post-withdraw enforcement unclear | Medium | Withdrawing privacy clears acceptance but user may retain session until next API gate hit |
| No withdrawal → account restriction policy | Low | No documented workflow for degraded access after privacy withdrawal |

---

## Test results

| Test | Result | Notes |
|------|--------|-------|
| `consent-service.test.ts` | **2/2 PASS** | Stale detection, reconsent list includes terms/ai/vet |
| Flutter analyze (consent files) | **PASS** | No issues reported in prior implementation pass |
| Backend `tsc --noEmit` (consent-related) | **FAIL** | `role`/`method` excess properties in `mobile-settings-service.ts`; unrelated admin-legal TS errors |
| Integration tests (withdraw/status routes) | **NOT RUN** | No dedicated route-level tests found |
| E2E mobile re-consent | **NOT RUN** | Manual QA recommended |

---

## Compliance matrix (plan vs implementation)

| Plan requirement | Status | Notes |
|------------------|--------|-------|
| Version-aware consent registry | ✅ | `consent-registry.ts` (4 types) |
| Acceptance timestamps | ✅ | `*AcceptedAt` columns on `MobileUserSettings` |
| Append-only audit | ✅ | `LegalConsentEvent` |
| Re-consent on version bump | ✅ | Admin config + Flutter `/reconsent` |
| Withdrawal with audit | ⚠️ | API + privacy UI; vet blocked at route |
| Admin visibility | ✅ | Audit table + overview counts |
| Preserve onboarding | ✅ | Unchanged |
| Preserve existing APIs | ✅ | Settings sync extended, not replaced |
| Registration consent | ❌ | Not implemented |
| Single audit source of truth | ❌ | Dual `LegalConsentEvent` / `LegalAcceptanceEvent` |

---

## Risk register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| R1 | Audit grant events indistinguishable from re-grants | Medium | Medium | Add `metadata.action: "GRANTED"` on sync accept |
| R2 | Audit write fails silently | Low | High | Alert on `[legal-consent] audit write failed`; optional sync transaction |
| R3 | Dual audit systems confuse compliance reporting | Medium | High | Wire mobile sync to `LegalAcceptanceEvent` OR document mobile-only trail |
| R4 | Vet withdraw unavailable via API | Medium | Low | Add `VET_ADVICE` to withdraw route schema |
| R5 | Client gate disabled in production misconfig | Low | High | Enforce gate via server-side middleware for all protected routes |
| R6 | No consent at registration | Medium | Medium | Add optional post-OTP legal step before home |

---

## Remediation recommendations

### P0 — Before external audit

1. **Fix TS audit payload** — Remove invalid `role`/`method` from `recordLegalConsentFireAndForget` calls; add `metadata.action: "GRANTED"` and `metadata.surface` consistently.
2. **Unify or document audit trail** — Either bridge mobile sync to `recordLegalAcceptance()` or formally declare `LegalConsentEvent` as the mobile customer system of record in compliance docs.
3. **Add `VET_ADVICE` to withdraw route** — Align Zod schema with `consent-registry.ts` and `withdrawConsentForUser`.

### P1 — UX and coverage

4. Add withdraw actions for terms and AI in Flutter settings (with appropriate warnings).
5. Include `vetDisclaimerVersion` in `requiredVersions` and admin overview counts.
6. Add integration tests for `GET /api/mobile/consent/status` and `POST /api/mobile/consent/withdraw`.

### P2 — Hardening

7. Registration or first-login consent step (privacy + terms) before `/home`.
8. Monitoring/alert on failed audit writes.
9. Document withdrawal → access degradation policy (session, API 403 behavior).

---

## Evidence index

| Artifact | Path |
|----------|------|
| Consent registry | `pranidoctor-backend/src/legacy/web/lib/mobile-settings/consent-registry.ts` |
| Consent service | `pranidoctor-backend/src/legacy/web/lib/mobile-settings/consent-service.ts` |
| Audit writer | `pranidoctor-backend/src/legacy/web/lib/mobile-settings/legal-consent-audit.ts` |
| Settings sync (capture) | `pranidoctor-backend/src/legacy/web/lib/mobile-settings/mobile-settings-service.ts` |
| Status route | `pranidoctor-backend/src/legacy/web/routes/mobile/consent/status/route.ts` |
| Withdraw route | `pranidoctor-backend/src/legacy/web/routes/mobile/consent/withdraw/route.ts` |
| Admin overview | `pranidoctor-backend/src/legacy/web/routes/admin/consent/overview/route.ts` |
| AI consent middleware | `pranidoctor-backend/src/modules/auth/mobile-legal-consent.middleware.ts` |
| Flutter gate | `pranidoctor_user/lib/routing/legal_consent_gate.dart` |
| Flutter re-consent | `pranidoctor_user/lib/features/settings/presentation/re_consent_page.dart` |
| Flutter withdraw UI | `pranidoctor_user/lib/features/settings/presentation/privacy_page.dart` |
| Admin UI | `pranidoctor-web/src/components/admin/legal/AdminLegalSettingsForm.tsx` |
| Unit tests | `pranidoctor-backend/src/legacy/web/lib/mobile-settings/consent-service.test.ts` |
| Parallel legal system | `pranidoctor-backend/src/modules/legal/legal-acceptance.service.ts` |

---

## Sign-off checklist

- [x] Consent capture paths identified and traced
- [x] Version comparison logic verified
- [x] Audit append-only behavior confirmed
- [x] Re-consent trigger and UX verified
- [x] Withdrawal API and partial UI verified
- [ ] Integration tests for consent APIs
- [ ] Unified audit trail decision documented
- [ ] Registration-time consent (if required by policy)
- [ ] Production env flags verified (`MOBILE_ENFORCE_PRIVACY_CONSENT`, `MOBILE_LEGAL_GATE_ENABLED`, `LEGAL_ENFORCEMENT_ENABLED`)

---

**Verified by:** Automated code review + unit tests (Cursor agent, 2026-05-30)  
**Next review:** After P0 remediations or next legal document version bump
