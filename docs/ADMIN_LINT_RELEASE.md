# Admin Web — Release Lint Strategy

**Date:** 2026-05-22  
**Scope:** `pranidoctor-web` admin panel release gate  
**Baseline:** [ADMIN_PRODUCTION.md](./ADMIN_PRODUCTION.md), [ADMIN_P0_COMPLETE.md](./ADMIN_P0_COMPLETE.md)

---

## Verdict

# ADMIN_LINT_READY

Release lint gates **admin routes + changed files + build blockers** only. Full-repo ESLint (~2000+ legacy issues) remains **explicitly out of scope**.

| Gate | Status |
|------|--------|
| Release lint script (`lint:release`) | ✅ |
| CI uses release scope (not full repo) | ✅ |
| Admin route surface lint-clean | ✅ |
| Build/typecheck blockers in scope fixed | ✅ |

---

## 1. Problem

| Fact | Detail |
|------|--------|
| Full-repo ESLint | ~2055 problems — mostly mobile, doctor, legacy scripts |
| Admin surface | ~57 pages + 71 API proxies — manageable subset |
| Production requirement | CI must block bad admin code without forcing whole-repo cleanup |

**Rule:** Do **not** fix the entire repository for admin release.

---

## 2. Release lint tiers

```
┌─────────────────────────────────────────────────────────────┐
│ TIER A — Always linted (admin release surface)              │
│  src/app/admin/**                                           │
│  src/app/enterprise/**                                      │
│  src/app/api/admin/**                                       │
│  src/components/admin/**                                    │
│  src/components/admin-ui/**                                 │
│  src/components/enterprise/**                               │
│  src/lib/admin/**                                           │
│  src/lib/admin-auth/**                                      │
│  src/lib/admin-billing/**                                   │
│  src/lib/admin-semen/**                                     │
│  src/lib/logging/**                                         │
│  src/lib/monitoring/**                                      │
│  src/lib/env/production-validation.ts                       │
│  src/instrumentation.ts                                     │
│  src/instrumentation-client.ts                              │
│  src/lib/proxy-to-backend.ts                                │
│  src/middleware.ts                                          │
└─────────────────────────────────────────────────────────────┘
                              ∪
┌─────────────────────────────────────────────────────────────┐
│ TIER B — Git-changed lintable files (PR/push delta)         │
│  Any *.ts, *.tsx, *.js, *.jsx, *.mjs, *.cjs in diff       │
│  + untracked lintable files (local/CI working tree)         │
└─────────────────────────────────────────────────────────────┘
                              ∪
┌─────────────────────────────────────────────────────────────┐
│ TIER C — Build blockers (typecheck / release lint errors)   │
│  Fixed when introduced in Tiers A/B                         │
└─────────────────────────────────────────────────────────────┘

OUT OF SCOPE: npm run lint (full repo)
```

---

## 3. Commands

| Command | Purpose |
|---------|---------|
| `npm run lint:release` | **Release gate** — Tier A ∪ Tier B, `--max-warnings 0` |
| `npm run lint:release -- --admin-only` | Admin surface only (pre-release audit) |
| `npm run lint:release -- --changed-only` | Changed files only (narrow PR check) |
| `npm run lint:changed` | Legacy changed-files script (superseded in CI) |
| `npm run lint` | Full repo — **not** a release gate |

Implementation: `scripts/lint-release.mjs`

---

## 4. CI integration

File: `.github/workflows/ci.yml`

```yaml
lint:
  name: Lint (release scope)
  steps:
    - run: npm run lint:release
```

Build job still requires: `typecheck`, `test`, `lint`, `build`.

---

## 5. Policy

| Rule | Enforcement |
|------|-------------|
| No full-repo lint fix drive | Documented out of scope |
| Admin routes must pass release lint | Tier A always included |
| Touching non-admin code in PR | Tier B lints your diff only |
| Warnings fail release gate | `--max-warnings 0` on release script |
| React 19 hook rules | Fixed in admin UI (no blanket disables) |
| `@typescript-eslint/no-explicit-any` | Replace with typed DTOs in admin libs |

---

## 6. Fixes applied (this pass)

| Area | Change |
|------|--------|
| `scripts/lint-release.mjs` | New release gate (admin globs + git delta) |
| `.github/workflows/ci.yml` | `lint:release` replaces `lint:changed` |
| `package.json` | `"lint:release"` script |
| Admin UI hook lint | `AdminLayoutShell`, `AdminNavSearch`, `AdminLoginForm`, `AdminAuthProvider`, `use-idle-timeout` |
| Dashboard charts | `AdminChartPrimitives` — immutable reduce |
| Billing DTOs | Typed interfaces replace `any`/`unknown` stubs |
| Semen form | Removed unused dead stepper helpers |
| Semen/admin lib | `unknown` archived stubs; schema `any` removed |

---

## 7. Verification log (2026-05-22)

```bash
cd pranidoctor-web
npm run lint:release     # exit 0
npm run typecheck        # exit 0
npm test                 # 93 passed (22 files)
```

Admin release surface before fixes: **14 errors, 9 warnings** (15 files).  
After fixes: **0 errors, 0 warnings** in release scope.

---

## 8. Developer workflow

### Before opening admin PR

```bash
npm run lint:release
npm run typecheck
npm test
```

### Audit admin-only cleanliness

```bash
npm run lint:release -- --admin-only
```

### When changing shared infra (middleware, proxy, instrumentation)

Those paths are in Tier A — they are always linted on release.

---

## 9. Explicitly deferred (not release blockers)

| Item | Priority |
|------|----------|
| Full-repo ESLint cleanup | Post-release / module-by-module |
| Doctor/mobile panel lint gate | Separate release scope when needed |
| ESLint `--fix` automation on legacy dirs | Not scheduled |

---

## 10. Path to full-repo lint (future)

When ready outside admin release:

1. Add scoped configs per app (`eslint.admin.config.mjs`, etc.) — **already effectively done via lint:release**
2. Burn down mobile/doctor directories module-by-module
3. Switch CI `lint:release` → optional stricter job or expand Tier A globs

Until then: **ADMIN_LINT_READY** for admin production ship.

---

**Output:** `ADMIN_LINT_READY`
