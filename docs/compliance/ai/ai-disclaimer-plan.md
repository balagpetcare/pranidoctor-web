# AI Disclaimer — Compliance Implementation Plan

**Document type:** Compliance / legal engineering plan  
**Version:** 1.1.0  
**Date:** 2026-05-30  
**Status:** **Implemented** — see `AI_DISCLAIMER_OPERATIONS.md` for runbook  
**Scope:** All AI-powered (generative and assistive) functionality across Prani Doctor  
**Repositories:** `pranidoctor_user` (Flutter), `pranidoctor-web` (Next.js public legal + admin), `pranidoctor-backend` (API, orchestrator, safety guardrails)

**Related documents**

| Document | Path |
|----------|------|
| Operations runbook | `docs/compliance/ai/AI_DISCLAIMER_OPERATIONS.md` |
| Privacy Policy plan | `docs/compliance/legal/privacy-policy-plan.md` |
| Public veterinary disclaimer | `pranidoctor-web/src/app/legal/disclaimer/page.tsx` |
| Phase 8 AI master plan | `pranidoctor_user/docs/phase-8-ai-smart-ecosystem-master-plan.md` |
| Launch compliance audit | `pranidoctor_user/docs/launch/PHASE_7_LAUNCH_PREP_PLAN.md` (§6) |
| AI orchestrator | `pranidoctor-backend/docs/ai/AI_ORCHESTRATOR.md` (if present) |

---

## 1. Executive summary

Prani Doctor exposes multiple **AI-assisted** capabilities to farmers: conversational chat, voice input, symptom triage, structured symptom checking, disease knowledge retrieval, farm health dashboards, smart recommendations, feed ration intelligence, and (planned/partial) farm briefings and queries. These features combine **external LLM calls** (OpenAI / Anthropic with rules fallback) with **deterministic rule engines** (triage keywords, symptom graph, feed pipeline, smart recommendations).

**Current posture:** Informational disclaimers exist in fragments — a persistent banner on two Flutter screens, per-response API disclaimer fields, hardcoded footers on symptom checker and feed ration pages, and a public `/legal/disclaimer` page. There is **no unified disclaimer framework**, **no first-use acceptance gate**, **inconsistent bilingual text**, and **several surfaces with no disclaimer at all**.

This plan defines a **production-ready AI disclaimer strategy** covering limitations, non-diagnostic language, human review, confidence/accuracy caveats, user responsibility, and veterinary escalation — with placement, acceptance, compliance, and verification guidance. **Implementation is deferred** until legal counsel approves canonical text.

**Naming clarification:** `AI Technician` / `AiTechnicianProfile` refers to **Artificial Insemination field technicians**, not generative AI. Those workflows require separate **service-provider disclaimers** (clinical field work performed by humans), not LLM disclaimers. This document covers **machine-assisted guidance only**.

---

## 2. AI feature inventory (as-built)

### 2.1 Feature matrix

| Feature | User surface | Backend path | Uses external LLM? | Current disclaimer |
|---------|--------------|--------------|--------------------|--------------------|
| **AI chat** | Flutter `AiChatPage`, home quick actions | `POST /api/ai/chat` | Yes | Banner + API `disclaimer` per response (not rendered on bubbles) |
| **AI chat v2** (RAG) | Not wired in Flutter yet | `POST /api/ai/chat/v2` | Yes (+ knowledge RAG) | Inherits core `AI_DISCLAIMER` |
| **Voice → chat** | Flutter `AiVoiceInputPage` → chat | `POST /api/voice/stt` → core chat | Yes (text only to LLM) | Propagates chat disclaimer |
| **AI triage** (free-text) | Inline in chat (`TriageCard`), `AiResultPage` | `POST /api/ai/triage` | No (keyword rules) | API disclaimer + static `aiDisclaimer` in card |
| **Symptom checker** (structured) | Flutter `SymptomCheckerPage` | `POST /api/ai/symptom-check` | No (graph + RAG fallback) | Session footer + per-differential disclaimer |
| **Disease / knowledge guidance** | Flutter `KnowledgeSearchPage` | `GET /api/ai/knowledge/search`, `/:slug` | No (DB search) | **None in UI** |
| **Smart recommendations** | Flutter `SmartRecommendationsPage` | `GET /api/ai/smart-recommendations` | No (rule-based) | **None** |
| **Smart alerts** | Flutter `SmartAlertsPage` (routed, unlinked) | `GET /api/ai/smart-alerts` | No | **None** |
| **Follow-up suggestions** | Flutter `FollowUpSuggestionsPage` (routed, unlinked) | `GET /api/ai/follow-ups` | No | **None** |
| **Farm health dashboard** | Flutter `FarmHealthDashboardPage` | `GET /api/ai/farm-health` | No (aggregates) | **None** |
| **Farm briefing** | API only (Flutter path defined, unused) | `POST /api/ai/briefing/daily` | Yes | API disclaimer field |
| **Farm query** | API only (Flutter path defined, unused) | `POST /api/ai/farm-query` | Yes | API disclaimer field |
| **Feed ration intelligence** | Flutter `DailyRationPage` | `GET /api/mobile/recommendations/daily` | No (rules engine) | Backend `disclaimerBn` at page footer |
| **Escalation to human** | Triage/symptom CTA → Services; chat shows hint | `POST /api/ai/escalate` | No | Implicit via CTAs; API exists but Flutter uses support ticket |
| **Admin AI ops** | Web admin dashboards | `/api/admin/ai-ops/*` | N/A (monitoring) | Admin-only; no farmer-facing disclaimer needed |
| **Public legal page** | Web `/legal/disclaimer` | Static | N/A | High-level AI paragraph |

### 2.2 Data flows relevant to disclaimers

| Input type | Features consuming it | Disclaimer implication |
|------------|----------------------|------------------------|
| Free-text symptoms | Chat, triage, symptom checker | Must state non-diagnostic; urgency ≠ diagnosis |
| Structured symptom codes | Symptom checker | Differentials labeled "educational only" |
| Livestock health records | Chat v2, farm health, smart recs, feed engine | Accuracy depends on user-entered data |
| Farm aggregates (herd score, risk) | Farm health, briefing, farm query | Scores are heuristic, not clinical assessment |
| Voice transcript | Voice → chat | Same as chat; STT errors possible |
| Knowledge articles | Knowledge search, RAG in chat | Editorial content ≠ personalized diagnosis |
| Media metadata (triage) | Triage only | Metadata stored; **no vision LLM** — disclaimer should not imply image analysis |

### 2.3 Safety mechanisms already in backend (inform disclaimer copy)

| Mechanism | Location | Relevance to disclaimers |
|-----------|----------|--------------------------|
| Diagnosis/prescription refusal | `ai-safety.guardrails.ts` | Supports non-diagnostic statement; UI should mirror refusal behavior |
| Output sanitization | Same | Diagnosis phrases replaced — disclaimer should explain why wording may be generic |
| Confidence escalation threshold `0.55` | `AI_CONFIDENCE_ESCALATION_THRESHOLD` | Supports confidence-limitation disclosure |
| Auto-escalation on HIGH/emergency triage | `ai-veterinary-core.service.ts`, symptom checker | Supports veterinary escalation requirements |
| Kill switch (rules-only fallback) | Orchestrator + admin governance | Accuracy may degrade — admin concern; optional user notice if LLM disabled |
| No `DIAGNOSIS` memory kind | Memory TTL config | Reinforces non-diagnostic design |

### 2.4 Current disclaimer text (canonical sources to reconcile)

| Source | English | Bengali | Gap |
|--------|---------|---------|-----|
| Core chat API | "This is educational guidance only — consult a veterinarian for medical decisions." | "এটি শিক্ষামূলক সহায়তা মাত্র — চিকিৎসা সিদ্ধান্তের জন্য প্রাণী চিকিৎসকের পরামর্শ নিন।" | Does not cover confidence, accuracy, user data responsibility |
| Flutter banner (`aiDisclaimer`) | "AI guidance is informational only — not a substitute for a veterinarian." | **Broken** — mixed EN/BN in `assets/i18n/bn.json` | Must fix; shorter than API text |
| Symptom checker session | "This is not a medical diagnosis — assistive information only." | "এটি চিকিৎসা নির্ণয় নয় — শুধুমাত্র সহায়ক তথ্য।" | Good non-diagnostic; missing escalation for emergency |
| Symptom differential (each) | "Educational only — not confirmed without a veterinarian" | BN equivalent present | Per-item — good pattern |
| Farm briefing | "Assistive information only — not a diagnosis." | BN present | Not shown in UI yet |
| Farm query | "Data-assisted guidance — consult a vet for critical decisions." | BN present | Not shown in UI yet |
| Feed ration | — | "এটি সাধারণ নির্দেশিকা মাত্র; পশুচিকিৎসকের পরামর্শের বিকল্প নয়।" | BN only in UI; EN missing on mobile |
| Public web page | "AI chat, feed recommendations, and triage tools offer educational guidance only…" | **English only** | Incomplete feature list; no BN version |
| Mobile ToS default (backend settings) | "AI guidance is informational only and not a substitute for professional veterinary care." | Verify BN in settings API | Not enforced at first AI use |

---

## 3. Disclaimer content strategy

Legal counsel must approve final wording. Below defines **required themes** and **draft intent** per dimension.

### 3.1 AI limitations

**Must communicate:**

- AI is an **assistive tool**, not a veterinary professional.
- Responses are **generated** (LLM) or **rule-derived** (triage, symptom graph, feed rules) and may be incomplete.
- The system **cannot examine the animal** physically, perform lab tests, or verify user-reported facts.
- **Language support:** BN/EN quality may vary; voice/STT may mis-transcribe.
- **Offline/queued chat** may deliver stale guidance when synced later.

**Draft short form (banner):**  
*"Prani Doctor AI provides general livestock guidance. It cannot see or examine your animal and may be wrong or incomplete."*

**Draft long form (first-use modal / legal page):**  
Expand with LLM vs rules distinction, no image diagnosis (even if photos attached as metadata), and that kill-switch/rules fallback may produce generic answers.

### 3.2 Non-diagnostic statement

**Must communicate:**

- Output is **not a veterinary diagnosis**, **not a prescription**, and **not a treatment plan**.
- Differential conditions (symptom checker) are **educational possibilities**, not confirmed disease.
- Triage urgency labels (**LOW / MEDIUM / HIGH / emergency**) indicate **when to seek care**, not what disease is present.
- Smart recommendations and feed rations are **management suggestions**, not medical orders.

**Must align with backend guardrails:** Refusal messages ("I cannot diagnose or prescribe…") should use the **same legal vocabulary** as static disclaimers to avoid user confusion.

**Prohibited UI patterns (verify in compliance QA):**

- Labels like "Diagnosis," "Your animal has," "Prescribe," "Take this medicine"
- Presenting differential title without adjacent educational disclaimer
- Percentage scores (herd health, feed intelligence) styled like clinical certainty

### 3.3 Human review requirements

**Must communicate:**

- **Licensed veterinarians** on the platform provide clinical services separately from AI.
- AI output is **not reviewed by a veterinarian before display** unless explicitly stated (future: human-in-loop features).
- Escalation records and support tickets **do not automatically connect to a vet** — user must book/request service.
- Admin AI ops (prompt/knowledge editing) is internal governance, not clinical validation for individual users.

**Placement:** Chat when `escalationRecommended` or `humanRedirect`; triage/symptom checker when `escalationRequired`; farm health when risk score exceeds threshold (future).

### 3.4 Confidence limitations

**Must communicate:**

- **Chat confidence** is a heuristic (backend range ~0.35–0.78); low confidence triggers escalation suggestion — not a statistical measure of correctness.
- **Symptom checker confidence** reflects symptom match weights, not diagnostic probability.
- **Smart recommendation confidence** (0.75–0.95 fixed) is **priority scoring**, not medical certainty.
- **Feed intelligence scores** (nutrition, affordability, etc.) are **rule-engine fit metrics**, not health outcomes.
- **Voice STT confidence** affects transcript accuracy; not shown today — should be disclosed if confirm/retry flows added.

**UI guidance:** If scores are shown, label as *"Match score"* or *"Priority"* — never *"Accuracy"* or *"Certainty"*. Symptom checker currently hides confidence in UI — if exposed later, pair with limitation text.

### 3.5 Accuracy limitations

**Must communicate:**

- Guidance depends on **accuracy and completeness of user input** (symptoms, species, weight, health history).
- Knowledge base and RAG content may be **outdated** or not specific to the user's region/herd.
- LLM providers may **hallucinate** facts; backend sanitization reduces but does not eliminate risk.
- Rule engines use **keyword/symptom lists** that cannot cover every presentation or rare conditions.
- **False negatives** in triage (missing emergency) are possible — emergency disclaimer must tell users to seek immediate care if animal appears critically ill regardless of AI result.

### 3.6 User responsibility

**Must communicate:**

- User is responsible for **observing the animal** and making final care decisions.
- User must **not delay emergency care** while waiting for AI responses.
- User must provide **honest, accurate information**; misuse may lead to harmful guidance.
- User should **verify critical recommendations** (medications, withdrawal periods, dosages) with a licensed veterinarian.
- Acceptance of feed ration plans (`POST …/recommendations/accept`) implies user reviewed disclaimer — acceptance event should be auditable (see §5).

### 3.7 Veterinary escalation requirements

**Must communicate:**

| Trigger (system) | Required user-facing message intent |
|------------------|-------------------------------------|
| Emergency keywords / `emergency: true` | Seek **immediate** in-person veterinary care; do not rely on app |
| `HIGH` triage / symptom bucket | Contact veterinarian **as soon as possible** |
| `escalationRecommended` (low LLM confidence) | AI uncertain — **human veterinarian consultation advised** |
| Policy refusal (diagnosis/prescription request) | AI cannot help with this — **use doctor consultation feature** |
| Red flags in symptom checker | Highlighted symptoms require **prompt professional attention** |

**CTA requirements:** Every escalation state needs a **primary action** (Find vet / Request doctor / Emergency services) and **secondary action** (Continue with AI at own risk — if legally permitted).

**Regulatory context (Bangladesh):** Copy should reference **licensed veterinarian** / **প্রাণী চিকিৎসক** consistently; teleconsultation limitations cross-link to doctor disclaimer on public page.

---

## 4. Unified disclaimer taxonomy

Proposed **three tiers** (counsel to finalize):

| Tier | ID | Purpose | Length |
|------|-----|---------|--------|
| **T1 — Persistent** | `ai.disclaimer.banner` | Always visible in AI contexts | 1–2 sentences |
| **T2 — Contextual** | `ai.disclaimer.{feature}` | Feature-specific addition (symptom, feed, triage) | 1–2 sentences |
| **T3 — Comprehensive** | `ai.disclaimer.full` | First-use acceptance, settings, public legal page | Full sections §3.1–3.7 |

**Locale:** All tiers require **canonical BN + EN** from a single content source (recommended: backend `MobileLegalConfig` or CMS), not hardcoded per screen.

### 4.1 Feature → tier mapping

| Feature | T1 banner | T2 contextual | T3 link |
|---------|-----------|---------------|---------|
| AI home hub | ✓ | — | "Learn more" |
| AI chat | ✓ | On escalation/refusal | Modal first use |
| Voice input | ✓ (or inherit chat) | STT accuracy note | — |
| Triage (chat) | ✓ | Urgency ≠ diagnosis | — |
| Symptom checker | ✓ | Non-diagnosis footer (existing) + differential per-item | First use |
| Knowledge search | ✓ | "General information only" | — |
| Smart recommendations | ✓ | "Automated farm reminders, not vet advice" | — |
| Smart alerts | ✓ | Same as recs | — |
| Follow-ups | ✓ | "Based on prior AI session" | — |
| Farm health dashboard | ✓ | Score heuristic disclaimer | — |
| Feed daily ration | ✓ | Existing `disclaimerBn` + EN | Accept gate |
| Farm briefing / query (future) | ✓ | API disclaimer rendered | — |
| Conversation history | ✓ (read-only) | "Past AI messages not re-validated" | — |

---

## 5. Placement strategy

### 5.1 Flutter mobile app (`pranidoctor_user`)

| Location | Component / route | Placement rule | Priority |
|----------|-------------------|----------------|----------|
| AI Assistant hub | `AiHomePage` `/ai` | T1 banner top; T3 link in app bar or footer | P0 — exists (banner only) |
| AI chat | `AiChatPage` `/home/ai-chat` | T1 banner; render **per-message API disclaimer** on assistant bubbles when present; escalation strip when `escalationRecommended` | P0 — partial |
| Voice input | `AiVoiceInputPage` | T1 banner or subtitle before mic; optional STT note | P1 |
| Triage result | `TriageCard`, `AiResultPage` | T2 urgency disclaimer + emergency callout if HIGH/emergency | P0 — partial |
| Symptom checker | `SymptomCheckerPage` | T1 on entry; T2 on result (existing footer); keep per-differential disclaimer | P0 — partial |
| Knowledge search | `KnowledgeSearchPage` | T1 banner; T2 on each result card | P1 — missing |
| Smart recommendations | `SmartRecommendationsPage` | T1 banner | P1 — missing |
| Farm health | `FarmHealthDashboardPage` | T1 banner; T2 near scores | P1 — missing |
| Feed ration | `DailyRationPage` | T1 + existing footer disclaimer; show EN when locale EN | P0 — partial |
| Home entry points | `ai_section`, `home_care_action_bar`, `instant_care_sheet` | Optional compact T1 on first navigation only (if no global acceptance) | P2 |
| Onboarding slide 3 | `onboarding_page` | Add "AI is not a vet" subtitle — marketing must not overclaim | P2 |
| Settings | `AiSettingsPage`, legal settings | Link to T3; toggle does **not** disable disclaimer | P1 |
| Offline queued AI | Outbox sync toast | "AI response generated while offline — verify before acting" | P2 |

### 5.2 Public web (`pranidoctor-web`)

| Location | Rule |
|----------|------|
| `/legal/disclaimer` | Expand §AI-assisted features to list **all** features (§2.1); add BN page `/legal/disclaimer/bn` or locale toggle |
| `/terms` | Cross-link AI disclaimer; state acceptance covers AI use |
| App Store / Play listing | URL must resolve to T3 content (launch blocker per launch audit) |
| Admin AI ops | Internal docs only; no farmer disclaimer |

### 5.3 Backend API (`pranidoctor-backend`)

| Rule | Detail |
|------|--------|
| Every AI response DTO | Include `disclaimer` (T1 or T2) — **already on most LLM paths**; extend to smart recs, alerts, follow-ups, farm-health, knowledge search |
| Standard field | Add optional `disclaimerVersion` for audit |
| Error/refusal payloads | Include same disclaimer + `humanRedirect` flag |
| OpenAPI / mobile contract | Document disclaimer fields as required |

### 5.4 Timing rules

| Moment | Requirement |
|--------|-------------|
| **Before first AI interaction** | T3 acceptance (see §6) OR documented implied consent via ToS (counsel decision) |
| **Before showing triage/symptom result** | T2 visible without scrolling on standard phone viewport |
| **Before feed ration accept** | User must scroll to disclaimer or check box |
| **On escalation/refusal** | Escalation copy **replaces** subtle banner — must be visually prominent |
| **Every session resume** | T1 banner remains; no repeated T3 unless version bumped |

---

## 6. Acceptance strategy

### 6.1 Current state

- **No** AI-specific consent API or Flutter flow (`consent` grep: zero matches in `lib/`).
- General ToS acceptance hooks planned in `terms-of-service-plan.md` but **not enforced** at onboarding.
- Feed ration **accept** API exists without documented disclaimer acceptance coupling.

### 6.2 Recommended model (counsel to choose)

**Option A — Bundled ToS (lower friction)**  
AI disclaimer is a **section inside Terms of Service**. Accepting ToS at registration covers AI. Requires ToS acceptance gate (see legal plan) before any AI route.

**Option B — First-use AI modal (higher clarity)**  
On first entry to `/ai` or first `POST /api/ai/*`, show T3 with checkbox *"I understand AI does not diagnose or prescribe"* → persist acceptance.

**Option C — Hybrid (recommended)**  
ToS includes AI summary; **first AI use** shows non-dismissible T3 modal until accepted; **version bumps** re-prompt.

### 6.3 Acceptance persistence design (documentation only)

| Field | Purpose |
|-------|---------|
| `userId` / `customerId` | Subject |
| `disclaimerVersion` | e.g. `2026-05-30.1` |
| `locale` | BN / EN shown |
| `acceptedAt` | Timestamp |
| `surface` | `REGISTRATION`, `FIRST_AI_USE`, `FEED_RATION_ACCEPT`, `SETTINGS_REVIEW` |
| `deviceId` | Optional audit |
| `ipHash` | Optional compliance |

**API sketch (not implemented):**

- `GET /api/mobile/legal/ai-disclaimer` — returns T3 content + version + `acceptanceRequired`
- `POST /api/mobile/legal/ai-disclaimer/accept` — records acceptance
- Middleware on `/api/ai/*`: return `428 Precondition Required` with disclaimer payload if not accepted (configurable rollout)

### 6.4 Re-acceptance triggers

- Disclaimer **version** increment in CMS/config
- Material change to AI scope (e.g. vision model added)
- Regulatory requirement

### 6.5 Feed ration accept coupling

Before `POST /api/mobile/recommendations/accept`:

- Client shows T2 feed disclaimer (BN + EN)
- Request includes `disclaimerVersionAccepted`
- Backend rejects accept if version mismatch

---

## 7. Compliance requirements

### 7.1 Regulatory and store policy

| Requirement | Action |
|-------------|--------|
| Google Play **Health / medical disclaimer** | T3 linked from store listing; in-app on all AI surfaces |
| Google Play **Data safety** | Disclose AI inputs (symptoms, livestock data) sent to third-party LLM if applicable |
| Apple App Store **health guidance** | Same as above |
| Bangladesh consumer protection | Clear BN language; no misleading "doctor replacement" marketing (onboarding slide review) |
| Telemedicine boundaries | Cross-link doctor disclaimer; AI distinct from `DOCTOR_HOME_VISIT` / teleconsult |

### 7.2 Internal policy alignment

| Area | Requirement |
|------|-------------|
| Prompt templates | `farmer_chat`, `symptom_checker`, `farm_assistant` must retain non-diagnose instructions; prompt admin changes require compliance review |
| Knowledge base publishing | Admin publish workflow should tag content "general education" not "clinical guideline" |
| AI kill switch | Ops runbook: if LLM disabled, optionally show user notice "Automated responses may be limited" |
| Escalation monitoring | Unreviewed `EMERGENCY_SYMPTOM` escalations (existing ops monitor) — disclaimer does not replace ops response SLA |
| Audit trail | Log disclaimer version shown per session (`AiAudit` extension) |
| Data retention | Chat/voice retention policy disclosed in Privacy Policy |

### 7.3 Artificial Insemination (AI Technician) — separate track

| Item | Note |
|------|------|
| Service requests with `heatSymptoms`, `healthIssueNote` | Human technician service — use **service terms**, not LLM disclaimer |
| Marketing "AI Technician" vs "AI Doctor" | Prevent confusion with generative AI; consider renaming in UX copy to "AI Service" / "কৃত্রিম প্রজনন টেকনিশিয়ান" where ambiguous |

### 7.4 Accessibility and UX

- Disclaimers must meet **readable contrast** and **font size** minimums (not muted micro-text).
- T1 banner should not push primary actions below fold on small devices — use collapsible banner after first scroll if needed.
- Screen reader: announce disclaimer on entering AI screens.

### 7.5 Content governance

| Role | Responsibility |
|------|----------------|
| Legal counsel | Approve T1/T2/T3 canonical text BN+EN |
| Compliance owner | Version registry, change log |
| Engineering | Single source fetch, no drift between API and UI |
| Localization | Fix known BN bug in `aiDisclaimer`; native review for medical tone |
| Product | Ensure onboarding/marketing matches disclaimer limits |

---

## 8. Gap analysis summary

| Gap | Severity | Feature(s) |
|-----|----------|------------|
| No first-use AI acceptance | **High** | All AI |
| Inconsistent disclaimer strings (API vs banner vs public page) | **High** | All |
| Broken Bengali `aiDisclaimer` in Flutter i18n | **High** | Chat, banner |
| Chat per-message disclaimer not rendered | **Medium** | Chat |
| Missing disclaimers on knowledge, smart recs, alerts, follow-ups, farm health | **Medium** | Phase 8 |
| Confidence/urgency shown without limitation context | **Medium** | Feed scores, farm health (if expanded) |
| Public disclaimer page incomplete vs feature set | **Medium** | Web |
| No EN feed disclaimer on mobile | **Low** | Feed ration |
| `/api/ai/escalate` not used in UI | **Low** | Escalation audit trail |
| Chat v2, farm briefing/query not in UI — disclaimer plan ahead of launch | **Low** | Future |

---

## 9. Verification plan

### 9.1 Static content verification

| ID | Check | Method | Pass criteria |
|----|-------|--------|---------------|
| DC-01 | Canonical T1/T2/T3 BN+EN approved | Legal sign-off document | Signed version registry entry |
| DC-02 | No mixed-language strings | i18n lint / manual review | Zero EN fragments in BN files |
| DC-03 | Public URL resolves | HTTP GET `/legal/disclaimer` | 200; content matches T3 |
| DC-04 | API disclaimer fields | OpenAPI / contract test | All AI endpoints in §2.1 return non-empty `disclaimer` |

### 9.2 UI placement verification (Flutter)

| ID | Check | Method | Pass criteria |
|----|-------|--------|---------------|
| DP-01 | T1 visible on all AI routes | Widget/integration test matrix | Each route in §5.1 contains `AiDisclaimerBanner` or successor |
| DP-02 | Triage/emergency escalation | E2E fixture: emergency keyword | Red callout + vet CTA before dismiss |
| DP-03 | Symptom checker differentials | Snapshot test | Each differential shows per-item disclaimer |
| DP-04 | Feed accept gate | E2E | Accept disabled until disclaimer acknowledged |
| DP-05 | Chat bubble disclaimer | Integration test | Assistant messages render API `disclaimer` when set |
| DP-06 | No prohibited diagnosis labels | Grep / UI audit | Zero "Diagnosis" labels in farmer AI UI |

### 9.3 Acceptance flow verification

| ID | Check | Method | Pass criteria |
|----|-------|--------|---------------|
| AC-01 | First AI use blocked without accept | API + UI test | 428 or modal until `POST accept` |
| AC-02 | Acceptance persisted | DB query | Record with version + timestamp |
| AC-03 | Version bump re-prompts | Config test | Old acceptance → prompt again |
| AC-04 | ToS integration | Cross-test with legal plan | Single or hybrid model documented and working |

### 9.4 Behavioral / safety alignment

| ID | Check | Method | Pass criteria |
|----|-------|--------|---------------|
| BH-01 | Diagnosis request refused | POST chat "prescribe antibiotic" | Refusal + disclaimer + humanRedirect |
| BH-02 | Low confidence escalation | Mock confidence < 0.55 | `escalationRecommended: true` + UI strip |
| BH-03 | HIGH triage auto-escalation | POST triage with HIGH symptom | `escalationRequired: true` |
| BH-04 | Kill switch behavior | Admin toggle LLM off | Chat still returns rules fallback + disclaimer |

### 9.5 Compliance audit cadence

| Activity | Frequency | Owner |
|----------|-----------|-------|
| Full placement audit (§5 matrix) | Each major release | QA + Compliance |
| i18n disclaimer diff review | Each localization PR | Localization |
| Prompt/knowledge change review | Each admin publish | Compliance + Vet advisor |
| Store listing URL check | Pre-submission | Release manager |
| Post-incident review (AI harm/near-miss) | Ad hoc | Incident response |

### 9.6 Sign-off checklist (pre-production)

- [ ] Legal counsel approved T1/T2/T3 BN+EN
- [ ] All §2.1 features mapped to disclaimer tiers
- [ ] Acceptance model chosen and implemented per §6
- [ ] Public disclaimer URL live in production
- [ ] Flutter BN strings validated by native speaker
- [ ] DC-01 through BH-04 pass in staging
- [ ] Play/Data safety disclosures updated
- [ ] Ops runbook includes disclaimer version bump procedure

---

## 10. Implementation phases (reference — do not execute from this doc)

| Phase | Scope | Repos |
|-------|-------|-------|
| **P0** | Canonical content + i18n fix + T1 on missing screens + chat bubble disclaimer | user, backend, web |
| **P1** | Acceptance API + first-use modal + API disclaimer on remaining endpoints | backend, user |
| **P2** | T3 public page BN + version registry + feed accept coupling + audit fields | web, backend, user |
| **P3** | Confidence labeling UX + onboarding copy + offline notice | user |

---

## 11. Appendix A — Screen / file reference

### Flutter

| File | Role |
|------|------|
| `lib/features/ai/presentation/widgets/ai_disclaimer_banner.dart` | T1 banner |
| `lib/features/ai/presentation/ai_chat_page.dart` | Chat |
| `lib/features/ai/presentation/widgets/triage_card.dart` | Triage |
| `lib/features/ai/presentation/phase8/symptom_checker_page.dart` | Symptom checker |
| `lib/features/feed_recommendations/presentation/daily_ration_page.dart` | Feed ration |
| `assets/i18n/en.json`, `bn.json` | `aiDisclaimer` strings |

### Backend

| File | Role |
|------|------|
| `src/modules/ai-veterinary-core/ai-veterinary-core.types.ts` | `AI_DISCLAIMER` |
| `src/modules/ai/symptom-checker/symptom-checker.service.ts` | Symptom disclaimers |
| `src/modules/ai/assistant/ai-assistant.service.ts` | Briefing/query disclaimers |
| `src/modules/ai-veterinary-core/safety/ai-safety.guardrails.ts` | Refusal + escalation |
| `src/modules/feed-recommendation/rules/bd-v2-default.json` | Feed `disclaimerBn` |

### Web

| File | Role |
|------|------|
| `src/app/legal/disclaimer/page.tsx` | Public T3 |

---

## 12. Appendix B — Escalation copy matrix (draft intent)

| State | EN intent | BN intent |
|-------|-----------|-----------|
| Emergency | "Possible emergency — contact a veterinarian immediately. Do not wait for AI." | "সম্ভাব্য জরুরি অবস্থা — অবিলম্বে প্রাণী চিকিৎসকের সহায়তা নিন।" |
| HIGH urgency | "Urgent — arrange veterinary care as soon as possible." | "জরুরি — যত তাড়াতাড়ি সম্ভব চিকিৎসকের পরামর্শ নিন।" |
| Low AI confidence | "AI is not confident — consider speaking with a veterinarian." | "AI নিশ্চিত নয় — চিকিৎসকের পরামর্শ বিবেচনা করুন।" |
| Policy refusal | "AI cannot provide diagnoses or prescriptions — use Doctor consultation." | "AI নির্ণয় বা ওষুধ লিখতে পারে না — চিকিৎসক পরামর্শ নিন।" |

---

*End of plan. Implementation requires legal approval and tracking in compliance roadmap.*
