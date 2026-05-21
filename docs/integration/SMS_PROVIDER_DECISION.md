# SMS Provider Decision — Prani Doctor

**Version:** 1.0.0  
**Date:** 2026-05-21  
**Status:** Approved for implementation planning  
**Governance:** `docs/core/MASTER_SYSTEM_RULES.md` (Bangladesh domain, OTP security, provider abstraction)  
**Related:** `docs/api/AUTH_FLOW.md` §3.0, `docs/OTP_LOCAL_AND_LIVE.md`, `docs/NOTIFICATION_SMS_PLAN.md`, `docs/PHASE0_FINAL_REVIEW.md` (R-002)

---

## Table of Contents

1. [Decision Summary](#1-decision-summary)
2. [Requirements](#2-requirements)
3. [Options Evaluated](#3-options-evaluated)
4. [Comparison Matrix](#4-comparison-matrix)
5. [OTP-Specific Requirements](#5-otp-specific-requirements)
6. [Retry Strategy](#6-retry-strategy)
7. [Webhooks & Delivery Reports](#7-webhooks--delivery-reports)
8. [Monitoring & Alerting](#8-monitoring--alerting)
9. [Environment Configuration](#9-environment-configuration)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Risks & Mitigations](#11-risks--mitigations)

---

## 1. Decision Summary

Prani Doctor serves **Bangladesh mobile users** (`01XXXXXXXXX`). SMS is business-critical for **mobile OTP login** (customer, doctor, AI technician apps) and secondary for **transactional notifications** (request status, emergency alerts).

### 1.1 Chosen Stack

| Tier | Provider class | Recommendation | Role |
|------|----------------|----------------|------|
| **MVP (local dev)** | Built-in | `OTP_MODE=dev` + `SMS_PROVIDER=local` | Terminal OTP; no paid SMS |
| **MVP (staging)** | Local Bangladesh gateway (sandbox) | **SSL Wireless** or equivalent BTRC-registered aggregator | Validate live path before prod |
| **Production (primary)** | Local Bangladesh gateway | **SSL Wireless** (preferred) or **MiM SMS** / **Grameenphone Corporate Messaging** | OTP + transactional SMS |
| **Production (fallback)** | Second local gateway **or** Twilio | **Hybrid:** secondary local aggregator first; Twilio only as break-glass | Failover when primary API/downstream fails |
| **Fallback (not primary)** | Twilio | International API, high cost for BD routes | Disaster recovery / ops testing only |

**Do not use Twilio as the primary production provider** for Bangladesh OTP: cost is ~50–100× local rates and delivery depends on international routing to Grameenphone/Robi/Banglalink/Teletalk.

### 1.2 Architecture Fit (No Redesign)

Existing code already supports this decision:

| Layer | Location | Notes |
|-------|----------|-------|
| OTP live send | `src/lib/mobile-auth/otp-live-sms.ts` | `SMS_BASE_URL` + `SMS_API_KEY` HTTP adapter |
| General SMS | `src/lib/sms/service.ts` | `SmsProvider` + `local` / `noop` / `http` |
| Abstraction | `src/lib/sms/types.ts` | `sendSms({ to, body, referenceId })` |

**Next implementation step:** add vendor-specific providers under `src/lib/sms/providers/` (e.g. `ssl-wireless.ts`) without changing the interface.

---

## 2. Requirements

From `MASTER_SYSTEM_RULES.md` and auth docs:

| Requirement | Detail |
|-------------|--------|
| Geography | Bangladesh MSISDN only for MVP (`8801…`) |
| Language | Bengali OTP template with `{{code}}` (6 digits) |
| Security | Never log plain OTP in production; never return OTP in JSON |
| Latency | OTP request API must not block on SMS > ~2s (send async after DB write) |
| Compliance | Sender ID / masking registered with BTRC via local aggregator |
| Abstraction | All sends through `SmsProvider`; no vendor SDK in route handlers |
| Dev safety | `SMS_PROVIDER=http` ignored when `NODE_ENV !== production` |

---

## 3. Options Evaluated

### 3.1 Twilio

| Aspect | Assessment |
|--------|------------|
| **Strengths** | Mature REST API, global docs, Verify API (optional), delivery webhooks, excellent monitoring dashboards |
| **Weaknesses for BD** | High per-SMS cost on BD routes; sender ID rules differ from local masking; support latency for BD-specific issues |
| **OTP** | Twilio Verify can host OTP logic — **rejected** for MVP (duplicates in-house `MobileOtpChallenge` + policy in AUTH_FLOW) |
| **Verdict** | **Fallback / break-glass only**, not primary |

**Indicative pricing (check vendor page before contract):**

- Outbound SMS to Bangladesh: ~**$0.59 / segment** (Twilio public pricing page, international route).
- At ~৳125 USD/BDT ≈ **৳74+ per OTP SMS** vs local **৳0.30–0.50**.

### 3.2 Local Bangladesh SMS Gateway

Representative vendors (evaluate contracts in parallel):

| Vendor | Profile | Typical use |
|--------|---------|-------------|
| **SSL Wireless** | Long-running BD infrastructure player; bank/telco integrations; HTTP APIs | **Recommended primary** — aligns with `AUTH_FLOW.md` env example `ssl_wireless` |
| **MiM SMS** | Bulk + OTP API, masking/non-masking tiers | Strong **secondary** local fallback |
| **Grameenphone Corporate Messaging** | Direct operator; slab pricing | Good at scale; longer onboarding |
| **BudgetSMS / other aggregators** | International hub terminating in BD | Middle ground; verify DLR quality |

| Aspect | Assessment |
|--------|------------|
| **Strengths** | Lowest cost, best domestic delivery, Bengali/Unicode, masked sender IDs (`PraniDoc`), local support |
| **Weaknesses** | Per-vendor API shapes; weaker sandbox docs than Twilio; webhook formats vary |
| **Verdict** | **Production primary** |

**Indicative pricing (negotiated; verify quotes):**

| Type | Range (BDT / SMS) |
|------|-------------------|
| Non-masking transactional | ৳0.26 – 0.35 |
| Masking / branded sender | ৳0.45 – 0.55 |
| OTP-dedicated routes | ৳0.35 – 0.48 |

**Volume example (OTP only):** 50,000 logins/month × ৳0.40 ≈ **৳20,000/month** vs Twilio ≈ **৳3.7M/month** at ৳74/SMS.

### 3.3 Hybrid Provider

**Pattern:** Primary local gateway → on failure, retry once on **secondary local** gateway → if both fail, optional Twilio or queue for manual ops.

| Aspect | Assessment |
|--------|------------|
| **Strengths** | Best delivery SLA in BD; avoids single-vendor outage; cost stays local-first |
| **Weaknesses** | Two contracts, two integrations, deduplication discipline on retries |
| **Verdict** | **Production target** after MVP stabilizes (Phase 1b) |

```
                    ┌─────────────────┐
  OTP request ─────▶│  SmsRouter      │
                    │  (app layer)    │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
      ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
      │ SSL Wireless │ │ MiM / GP     │ │ Twilio       │
      │  (primary)   │ │ (fallback 1) │ │ (break-glass)│
      └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 4. Comparison Matrix

| Criterion | Twilio | Local BD gateway | Hybrid (local + local + Twilio) |
|-----------|--------|------------------|-----------------------------------|
| **Cost (OTP)** | Very high | Low | Low (Twilio rarely used) |
| **Delivery (BD MNOs)** | Good, not optimal | Best | Best |
| **OTP latency** | ~2–8 s typical | ~1–5 s typical | Primary path same as local |
| **Sender masking** | Limited / international | Full BTRC process | Primary local masking |
| **API maturity** | Excellent | Good (varies) | Two integrations |
| **Webhook / DLR** | Standard | Vendor-specific | Primary + secondary parsers |
| **Monitoring** | Built-in + export | Logs + custom metrics | Unified app metrics |
| **MVP effort** | Low (SDK optional) | Medium (adapter per vendor) | Higher |
| **Ops in Bangladesh** | Remote support | Local AM/support | Local-first |

---

## 5. OTP-Specific Requirements

Aligned with `AUTH_FLOW.md` §3.0:

| Topic | Policy | SMS implication |
|-------|--------|-----------------|
| Message body | 6-digit numeric in Bengali template | Keep SMS < 160 GSM chars or Unicode segment rules |
| Template | `SMS_OTP_TEMPLATE_BN` with `{{code}}` | Register template with aggregator if required |
| Expiry | 300 s | SMS must arrive within ~60 s p95 |
| Resend | 60 s cooldown, 5/hour | Do not bypass with multi-provider spam |
| Failure | User sees Bengali error; no OTP in JSON | Log `SEND_REJECTED`, masked phone only |
| Duplicate send | Same challenge | Use `referenceId: "otp"` + provider idempotency if supported |

**Recommended OTP SMS text (default in code):**

```
প্রাণী ডাক্তার যাচাইকরণ কোড: {{code}}
```

**Sender ID:** `PraniDoc` or approved masked name (vendor registration required before production).

---

## 6. Retry Strategy

### 6.1 Application-Level (Canonical)

| Event | Action |
|-------|--------|
| Primary HTTP 5xx / timeout | **One** immediate retry on same provider (exponential backoff 2s max) |
| Primary 4xx (invalid number) | No retry; return `OTP_INVALID` / validation error |
| Primary failure after retry | If hybrid enabled → **one** attempt on fallback local provider |
| Fallback failure | Return `SMS_SEND_FAILED` (Bengali); user may tap resend after cooldown |
| User resend | New challenge row; new SMS — not a “retry” of same provider message |

**Rules:**

- Max **2 provider attempts** per user-initiated `/otp/request` (primary + fallback).
- Never retry with Twilio automatically unless `SMS_FALLBACK_PROVIDER=twilio` explicitly set.
- Never log OTP on retry paths.

### 6.2 User-Initiated Resend

Handled by existing rate limits (`OTP_RESEND_COOLDOWN_SECONDS`, `OTP_MAX_SENDS_PER_HOUR`) — independent of provider retry.

### 6.3 Future Queue (Optional)

For notification SMS (non-OTP), failed sends may enqueue to BullMQ for delayed retry — out of scope for OTP hot path.

---

## 7. Webhooks & Delivery Reports

### 7.1 MVP

| Capability | MVP |
|------------|-----|
| Outbound send ACK | Synchronous HTTP response `providerMessageId` |
| Delivery receipt (DLR) | **Optional** — log only if vendor pushes webhook |
| Webhook endpoint | `POST /api/public/sms/webhook/{vendor}` (rate-limited, signature verified) |

**MVP minimum:** treat `ok: true` from send API as “accepted by aggregator”; monitor undelivered rate via vendor dashboard manually.

### 7.2 Production

| Capability | Target |
|------------|--------|
| DLR webhook | Parse vendor payload → update `SmsDeliveryLog` table (future) |
| Signature | HMAC or shared secret per vendor |
| Idempotency | Dedupe by `providerMessageId` |
| Failed DLR | Alert if OTP DLR failure rate > 5% over 15 min |

### 7.3 Twilio (Fallback)

Use Twilio status callback URL → same normalizer → `status: delivered | failed`.

---

## 8. Monitoring & Alerting

Per `MASTER_SYSTEM_RULES.md` §28 and `MONITORING.md`:

### 8.1 Metrics (Application)

| Metric | Labels | Alert threshold |
|--------|--------|-----------------|
| `sms_send_total` | `provider`, `purpose=otp\|notify`, `result=ok\|fail` | — |
| `sms_send_latency_ms` | `provider` | p95 > 5000 ms |
| `otp_request_total` | `result` | — |
| `otp_sms_failed_total` | `provider`, `reason` | > 2% of sends over 10 min |
| `sms_fallback_used_total` | `from`, `to` | Spike → vendor incident |

### 8.2 Logs (Structured)

```json
{
  "event": "sms_send",
  "provider": "ssl_wireless",
  "purpose": "otp",
  "phoneMasked": "017***74",
  "referenceId": "otp",
  "ok": true,
  "providerMessageId": "…",
  "latencyMs": 840
}
```

**Never include:** `body`, plain `code`, API keys.

### 8.3 Dashboards & Alerts

| Severity | Condition | Channel |
|----------|-----------|---------|
| P1 | OTP SMS failure rate > 10% for 5 min | Slack + email |
| P2 | Primary provider 5xx for 3 min | Slack |
| P3 | Fallback usage > 20% of volume | Slack (vendor degradation) |
| P3 | p95 latency > 5 s | Slack |

**Admin UI:** existing `getSmsAdminStatusSnapshot()` — extend to show primary/fallback configured (no secrets).

### 8.4 Synthetic Check

Daily cron (staging/prod): send test OTP to ops MSISDN with `SMS_PROVIDER=noop` override in non-prod — or vendor “ping” API if available.

---

## 9. Environment Configuration

Canonical variables (extend `.env.example`; never commit secrets):

### 9.1 MVP — Local Development

```bash
OTP_MODE=dev
SMS_PROVIDER=local
NODE_ENV=development
# No SMS_BASE_URL required
```

### 9.2 MVP — Staging (Live SMS Test)

```bash
OTP_MODE=live
SMS_PROVIDER=http                    # Until ssl-wireless adapter ships
SMS_BASE_URL=https://sandbox…/send
SMS_API_KEY=***
SMS_OTP_TEMPLATE_BN=প্রাণী ডাক্তার যাচাইকরণ কোড: {{code}}
SMS_SENDER_ID=PraniDoc
```

### 9.3 Production — Primary (Local)

```bash
OTP_MODE=live
SMS_PROVIDER=ssl_wireless            # After adapter implemented
SMS_BASE_URL=https://…               # Vendor send URL
SMS_API_KEY=***
SMS_API_SECRET=***                   # If vendor uses separate secret
SMS_SENDER_ID=PraniDoc
```

### 9.4 Production — Hybrid Fallback

```bash
SMS_FALLBACK_ENABLED=true
SMS_FALLBACK_PROVIDER=mimsms         # or twilio
SMS_FALLBACK_BASE_URL=https://…
SMS_FALLBACK_API_KEY=***
# Twilio-only break-glass:
# SMS_FALLBACK_PROVIDER=twilio
# TWILIO_ACCOUNT_SID=***
# TWILIO_AUTH_TOKEN=***
# TWILIO_FROM=+1…
```

### 9.5 Variable Ownership

| Variable | Used by | Notes |
|----------|---------|-------|
| `OTP_MODE` | `otp-dispatch.ts` | `dev` \| `live` |
| `SMS_BASE_URL` / `SMS_API_KEY` | `otp-live-sms.ts` | Live OTP (preferred names) |
| `SMS_HTTP_URL` / `SMS_HTTP_API_KEY` | `getSmsService()` http provider | Notification SMS |
| `SMS_PROVIDER` | `getSmsService()` | `local` \| `noop` \| `http` \| future vendor keys |

**Harmonization task:** align OTP path to use `getSmsService()` with vendor adapter so one router handles retry/fallback (implementation Phase 1b).

---

## 10. Implementation Roadmap

| Phase | Scope | Provider |
|-------|-------|----------|
| **0 (now)** | Dev OTP terminal; HTTP placeholder | `local` + `otp-live-sms` HTTP |
| **1a (MVP launch)** | SSL Wireless adapter + masked sender registration | Primary local |
| **1b** | `SmsRouter` with retry + secondary local | Hybrid local-local |
| **2** | DLR webhooks + `SmsDeliveryLog` | Primary + metrics |
| **3** | Twilio break-glass + runbook | Optional fallback |

**Deliverables per phase:**

1. `src/lib/sms/providers/ssl-wireless.ts` — map vendor JSON ↔ `SmsSendInput`
2. `docs/integration/SSL_WIRELESS_API.md` — payload samples (when contract signed)
3. Admin SMS status: primary/fallback health in notifications settings
4. Runbook: `docs/integration/SMS_FAILOVER_RUNBOOK.md` (Phase 1b)

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Local vendor outage | Medium | High | Hybrid second local; status page monitoring |
| Sender ID not approved in time | Medium | High | Start BTRC/masking paperwork in sprint 0 |
| API shape mismatch | Medium | Medium | HTTP placeholder → dedicated adapter; contract test |
| Twilio cost spike if misconfigured | Low | High | Disable Twilio in prod unless `SMS_FALLBACK_PROVIDER=twilio` |
| OTP SMS delay > expiry | Low | Medium | Async send; alert p95 latency; 300 s expiry |
| SMS pumping / fraud | Medium | Medium | `OTP_MAX_SENDS_PER_HOUR`, CAPTCHA later |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Integration | Initial provider decision |

---

## Related Documents

| Document | Path |
|----------|------|
| Master rules | `docs/core/MASTER_SYSTEM_RULES.md` |
| OTP policy | `docs/api/AUTH_FLOW.md` §3.0 |
| OTP env | `docs/OTP_LOCAL_AND_LIVE.md`, `docs/MOBILE_OTP_ENV.md` |
| Notification SMS | `docs/NOTIFICATION_SMS_PLAN.md` |
| Phase 0 risk | `docs/PHASE0_FINAL_REVIEW.md` R-002 |

---

*End of SMS_PROVIDER_DECISION.md*
