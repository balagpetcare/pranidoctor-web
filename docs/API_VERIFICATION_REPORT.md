# Admin API Verification Report

**Date:** 2026-05-22  
**Environment:** Windows dev — backend `:3000`, web `:3001`, PostgreSQL local  
**Credentials:** `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`

---

## Automated smoke test

Script: `scripts/admin-api-smoke-test.cjs`  
Method: Login → GET 25 endpoints with session cookie via web BFF

| Endpoint | HTTP | Envelope | Notes |
|----------|------|----------|-------|
| POST `/api/admin/auth/login` | 200 | ok | Sets `prani_admin_token` |
| GET `/api/admin/auth/me` | 200 | ok | Verified |
| GET `/api/admin/dashboard/page-data` | 200 | ok | Slow (~15–20s cold) |
| GET `/api/admin/areas?limit=5` | 200 | ok | Verified |
| GET `/api/admin/locations/stats` | 200 | ok | Verified |
| GET `/api/admin/locations/import-report` | 200 | ok | After API wiring fix |
| GET `/api/admin/locations/missing-coords` | 200 | ok | Verified |
| GET `/api/admin/locations/pending-verification` | 200 | ok | Verified |
| GET `/api/admin/doctors?limit=5` | 200 | ok | Verified |
| GET `/api/admin/ai-technicians?limit=5` | 200 | ok | Verified |
| GET `/api/admin/service-requests?limit=5` | 200 | ok | Verified |
| GET `/api/admin/billing?limit=5` | 200 | ok | Verified |
| GET `/api/admin/settings/billing` | 200 | ok | Verified |
| GET `/api/admin/health` | 200 | ok | **Fixed** (was 503) |
| GET `/api/notifications?limit=5` | 200 | ok | With admin session |
| GET `/api/admin/dev-tools/otp-logs` | 200/403 | ok | Env-gated |

PowerShell session test (post proxy fix): login 200; health, areas, billing, import-report 200 with cookie.

---

## Page-level verification matrix

| Area | List | Detail | Create | Update | Delete | Console/network |
|------|------|--------|--------|--------|--------|-----------------|
| Login | — | — | — | — | — | OK |
| Dashboard | OK | — | — | — | — | OK (slow load) |
| Analytics | OK | — | — | — | — | OK |
| Reports | OK | — | — | — | — | OK |
| Areas | OK | — | OK | OK | OK | OK |
| Locations hub | OK | — | — | — | — | OK (import via API) |
| Location QA lists | OK | — | — | — | — | OK |
| Doctors | OK | OK | OK | OK | actions | OK |
| AI technicians | OK | OK | OK | OK | actions | OK |
| AI applications | OK | OK | — | transition | — | OK |
| AI complaints | OK | — | — | status | — | OK |
| Service requests | OK | OK | — | assign | — | OK |
| Billing | OK | OK | — | — | — | OK |
| Billing settings | — | — | — | OK | — | OK |
| Semen catalog | OK | OK | OK | OK | — | OK |
| Knowledge hub | OK | OK | OK | OK | — | OK |
| Service categories | OK | — | — | — | — | OK (read-only) |
| Notifications | OK | — | — | mark read | — | OK |
| Enterprise review | OK | OK | — | PATCH | — | OK |
| OTP dev logs | OK | — | — | — | — | OK (dev) |
| Users/customers/animals/prescriptions | STUB | — | — | — | — | Expected unavailable |
| Roles/permissions settings | STATIC | — | — | — | — | No API |

---

## Regression checks (fixes)

| Fix | Verification |
|-----|--------------|
| Expect header strip | PowerShell `Invoke-WebRequest` login no longer 500 (when dev server reloaded) |
| Health probe | `GET /api/admin/health` returns `{ ok: true, data.checks.backend: "ok" }` |
| Import report API | Locations RSC uses backend report path |
| Timeline proxy | Route file exists; backend GET returns 200 with auth |

---

## Known remaining gaps (not failures)

- No infinite loading loops observed on wired pages
- No hydration mismatch on audited RSC pages
- React Query not used — manual cache via `dashboard-client-cache` only
- Stub pages intentionally show `AdminModuleUnavailable`

---

## Test commands

```bash
# From pranidoctor-web
node scripts/admin-api-smoke-test.cjs

# Manual health
curl http://localhost:3001/api/admin/health
```
