# Admin Web — Production Readiness

**Date:** 2026-05-22  
**Scope:** `pranidoctor-web` admin panel (`/admin/*`, `/enterprise/*`)  
**Docs reviewed:** ADMIN_WEB_AUDIT, ADMIN_API_MAPPING, ADMIN_AUTH_COMPLETE, ADMIN_LAYOUT_COMPLETE, ADMIN_MODULE_COMPLETE, ADMIN_DASHBOARD_COMPLETE, ADMIN_QA

---

## Verdict

# ADMIN_WEB_NOT_READY

The admin web **builds and deploys**, auth and QA baselines are solid, and **P1 hardening was applied** (SEO + security headers). It is **not** production-ready for unattended operation until **monitoring**, **structured logging**, and **production env validation** are in place.

| Gate | Status |
|------|--------|
| **Ship existing admin features** | ✅ With ops checklist below |
| **Unattended production (SLO/alerting)** | ❌ No APM or log aggregation |
| **CI quality gate** | ❌ ESLint not clean; no GitHub Actions |

---

## Evidence summary

| Area | Result | Evidence |
|------|--------|----------|
| **Build** | ✅ PASS | `npm run build` exit **0** (2026-05-22) |
| **Types** | ✅ PASS | `npm run typecheck` exit **0** |
| **Tests** | ✅ PASS | `npm test` — **79/79** tests, **18** files |
| **Security** | ⚠️ PARTIAL | JWT middleware, httpOnly cookies, role guards; headers added; gaps below |
| **Env** | ⚠️ PARTIAL | `.env.example` + runtime secret length checks; no deploy validator |
| **Monitoring** | ❌ FAIL | No Sentry/Datadog/OpenTelemetry integration |
| **Logging** | ❌ FAIL | `console.*` only; no request correlation / log levels |
| **Bundle** | ⚠️ PARTIAL | Build succeeds; Prisma CJS warnings in client graph |
| **SEO** | ✅ PASS | `robots: noindex,nofollow` on `/admin` + `/enterprise` |
| **Performance** | ✅ PASS | Dashboard lazy load, 30s SSR cache, 15s client cache, 30s poll |

---

## 1. Build

### Command & result

```bash
cd pranidoctor-web
npm run typecheck   # exit 0
npm run build       # exit 0, ~69s (Turbopack)
```

### Output facts (2026-05-22)

- **155** app routes compiled
- **57** admin `page.tsx` routes under `/admin`
- **6** enterprise review routes under `/enterprise`
- **71** admin API proxy routes (`/api/admin/*`)
- Admin dashboard routes are **dynamic (ƒ)** — correct for auth + live data
- `/admin/login` is **static (○)** — OK for login shell

### Warnings (non-blocking)

| Warning | Impact |
|---------|--------|
| `middleware` → `proxy` deprecation (Next 16) | Future migration; works today |
| Prisma `export *` CJS in client graph (3×) | Extra runtime code; `@/generated/prisma` imported in client components (e.g. `AreaForm`) |

**Recommendation:** Import enums from `@/generated/prisma/browser` only in client components.

---

## 2. Security

### Implemented ✅

| Control | Location | Evidence |
|---------|----------|----------|
| Edge JWT guard | `src/middleware.ts` | Redirects unauthenticated `/admin`, `/enterprise` HTML |
| Server actor check | `ensureAdminDashboardAccess()` | `(dashboard)/layout.tsx` calls backend `/me` |
| httpOnly session cookie | `src/lib/admin-auth/cookies.ts` | `secure: true` when `NODE_ENV=production` |
| JWT secret length | `src/lib/admin-auth/secrets.ts` | ≥32 chars required in production |
| Idle timeout | `AdminAuthProvider` + `session-config.ts` | Default 30 min |
| Session refresh | `GET /api/admin/auth/me` | 5 min poll |
| Dev-tools role gate | `ensureAdminRole(SUPER_ADMIN, ADMIN)` | audit + OTP pages |
| OTP plain-text blocked in prod | `shouldExposePlainOtpInDebugPanel()` | Returns false when `NODE_ENV=production` |
| **Security headers (added)** | `next.config.ts` | `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` on `/admin`, `/enterprise` |
| `.env` gitignored | `.gitignore` | `.env`, `.env.*` excluded |

### Gaps ❌ / ⚠️

| Gap | Severity | Notes |
|-----|----------|-------|
| No Content-Security-Policy | P1 | Add CSP when inline scripts audited |
| OTP debug panel env flag | P0 ops | `OTP_DEBUG_PANEL_ENABLED=true` in `.env.example` — **must be false** in prod |
| `OTP_MODE=dev` in prod | P0 ops | `warnIfProdDevOtpMode()` warns once; must set `OTP_MODE=live` |
| Weak example secrets in `.env.example` | P0 ops | Replace all secrets before deploy |
| No rate-limit at Next layer | P2 | Backend owns auth rate limits |
| Per-route role guards incomplete | P2 | Most routes rely on backend `requireAdminPanelApiAccess` |
| API routes not in middleware | ℹ By design | `/api/admin/*` proxied; backend validates JWT |

### Production security checklist

```bash
# Required before go-live
NODE_ENV=production
ADMIN_JWT_SECRET=<random ≥32 chars>
OTP_MODE=live
OTP_DEBUG_PANEL_ENABLED=false
ENABLE_DEV_OTP=false
APP_ENV=production
BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
# HTTPS termination at load balancer; secure cookies auto-enabled
```

---

## 3. Environment

### Documented variables (`.env.example`)

| Category | Key vars | Admin relevance |
|----------|----------|-----------------|
| Backend | `BACKEND_URL`, `NEXT_PUBLIC_API_URL` | All admin data proxied |
| Auth | `ADMIN_JWT_SECRET`, `AUTH_SECRET`, `JWT_SECRET` | Panel sessions |
| Admin UX | `NEXT_PUBLIC_ADMIN_IDLE_TIMEOUT_MS`, `NEXT_PUBLIC_ADMIN_SESSION_REFRESH_MS` | Client session |
| OTP/SMS | `OTP_MODE`, `OTP_DEBUG_PANEL_ENABLED` | Dev-tools panel |
| Features | `FEATURE_ADMIN_PANEL=true` | Toggle placeholder |

### Runtime validation

| Check | Status |
|-------|--------|
| JWT secret length (prod ≥32) | ✅ `getAdminJwtSecret()` |
| Backend URL fallback | ✅ `next.config.ts` + `proxy-to-backend.ts` |
| Startup env schema (zod/envalid) | ❌ Not implemented |
| Secrets in repo | ✅ `.env` gitignored |

**Recommendation:** Add `scripts/validate-production-env.mjs` run in deploy pipeline.

---

## 4. Monitoring

| Capability | Status | Evidence |
|------------|--------|----------|
| Health endpoint | ✅ | `GET /api/admin/health` — checks backend reachability |
| Uptime / APM (Sentry, Datadog) | ❌ | No dependency in `package.json` |
| Error tracking (client) | ❌ | No error boundary reporting service |
| Metrics (Prometheus) | ❌ | Not configured |
| Alerting | ❌ | Not configured |

### Minimal monitoring to reach READY

1. Wire **Sentry** (or equivalent) for Next.js server + client
2. Alert on `GET /api/admin/health` ≠ 200
3. Alert on backend 5xx rate from admin proxy routes

---

## 5. Logging

| Aspect | Status | Evidence |
|--------|--------|----------|
| Structured JSON logs | ❌ | No pino/winston |
| Request correlation IDs | ❌ | Not propagated in `proxy-to-backend.ts` |
| Admin login audit | ⚠️ | `admin-login-errors.ts` → `console.info` |
| SMS / OTP logs | ⚠️ | Local logger provider; console in dev |
| Log level env | ⚠️ | `# LOG_LEVEL=debug` commented in `.env.example` only |

**Recommendation:** Forward Next.js server logs to CloudWatch/Datadog; never log JWT, OTP, or passwords.

---

## 6. Bundle

| Metric | Finding |
|--------|---------|
| Build tool | Turbopack (Next 16.2.6) |
| Heavy deps in admin graph | `@tiptap/*` (knowledge hub), `lucide-react` (tree-shaken icons), `date-fns` |
| Code splitting | Dashboard charts/doctor/revenue lazy via `next/dynamic` |
| Prisma in client bundle | ⚠️ Warning — use `prisma/browser` for enums |
| `@next/bundle-analyzer` | ❌ Not configured |

### Build warning excerpt

```
unexpected export * ... src/generated/prisma/index.js [app-client]
Import traces: AreaForm.tsx, otp-logs/page.tsx
```

**Recommendation:** Add `@next/bundle-analyzer` to CI on release branches; target admin first-load JS < 200 KB gzip.

---

## 7. SEO

Admin panels must **not** be indexed.

| Route | Before QA | After fix |
|-------|-----------|-----------|
| `/admin/*` | Inherited public root metadata | ✅ `robots: { index: false, follow: false }` in `src/app/admin/layout.tsx` |
| `/enterprise/*` | Same | ✅ `src/app/enterprise/layout.tsx` |

Root `src/app/layout.tsx` still describes public site — admin routes override via nested layouts.

**No sitemap entries** for admin (correct).

---

## 8. Performance

| Optimization | Status | Location |
|--------------|--------|----------|
| SSR cache (30s) | ✅ | `unstable_cache` in `dashboard-stats.ts` |
| Route revalidate | ✅ | `export const revalidate = 30` on `/admin` |
| Client cache (15s) | ✅ | `dashboard-client-cache.ts` |
| Live poll (30s) | ✅ | `use-admin-dashboard-realtime.ts` |
| Lazy dashboard sections | ✅ | Charts, doctor stats, revenue |
| Skeleton loaders | ✅ | `AdminDashboardSkeleton` |
| Shared dashboard hook | ✅ | Analytics/reports use `useDashboardPageData` |

### Expected behaviour

- First paint: KPI + activity from SSR
- Charts load after lazy chunk (~100–300ms)
- Repeat navigation to analytics within 15s: cache hit, no spinner

**Not measured:** Lighthouse scores, TTFB under load — run before high-traffic launch.

---

## Fixes applied (this pass)

| # | File | Change |
|---|------|--------|
| 1 | `src/app/admin/layout.tsx` | `metadata.robots` noindex/nofollow |
| 2 | `src/app/enterprise/layout.tsx` | Same + enterprise title template |
| 3 | `next.config.ts` | Security headers for panel routes |

---

## Production deploy checklist

### P0 — Blockers (must complete)

- [ ] Set production secrets (≥32 char `ADMIN_JWT_SECRET`)
- [ ] `OTP_MODE=live`, `OTP_DEBUG_PANEL_ENABLED=false`, `ENABLE_DEV_OTP=false`
- [ ] HTTPS + `BACKEND_URL` pointing to production API
- [ ] Confirm backend `pranidoctor-backend` deployed and `/api/admin/health` upstream OK
- [ ] Add monitoring + alerting (health + error rate)
- [ ] Verify admin login/logout on staging with production-like env

### P1 — Strongly recommended

- [ ] Add CI: `typecheck`, `test`, `build` on every PR
- [ ] Structured logging + correlation IDs
- [ ] CSP header after script audit
- [ ] Bundle analyzer on release
- [ ] Migrate Prisma client imports to `browser` entry in client components
- [ ] ESLint gate (currently **1106 errors** repo-wide — not admin-specific)

### P2 — Post-launch

- [ ] Next 16 `middleware` → `proxy` migration
- [ ] Per-module backend APIs for blocked admin modules (users, animals)
- [ ] `ensureAdminCapability` on enterprise review page

---

## Test & build log (evidence)

```
npm run typecheck     → exit 0
npm run build         → exit 0 (31s compile + 17s TS + 155 pages)
npm test              → 79 passed (18 files)
npm run lint          → exit 1 (2055 problems — pre-existing, mostly non-admin)
```

Admin-specific tests:

- `admin-nav-permissions.test.ts` — 3 passed
- `dashboard-client-cache.test.ts` — 3 passed
- `admin-breadcrumbs.test.ts` — 3 passed
- `remember-login.test.ts` — passed

---

## Path to ADMIN_WEB_READY

Complete **all P0 blockers** above, then re-run:

```bash
npm run typecheck && npm test && npm run build
curl -f https://<host>/api/admin/health
```

When monitoring is live and production env is validated, update this doc verdict to **ADMIN_WEB_READY**.

---

**Output:** `ADMIN_WEB_NOT_READY`
