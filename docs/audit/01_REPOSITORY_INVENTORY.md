# Repository Inventory — Prani Doctor (Current State)

**Audit date:** 2026-05-21  
**Auditor mode:** read-only snapshot (no fixes applied)  
**Scope:** `pranidoctor-backend`, `pranidoctor-web`, `pranidoctor_user`

---

## Executive summary

| Repository | Local path | Remote (git) | Purpose | Tech stack | Entry points | Current health |
|------------|------------|--------------|---------|------------|--------------|----------------|
| **pranidoctor-backend** | `D:\PraniDoctor\pranidoctor-backend` | `github.com/balagpetcare/pranidoctor_backend` · branch `main` | Canonical API + Prisma DB owner; Express modular monolith with legacy Next-compat routes | Node ≥20, Express 5, TypeScript 5.8, Prisma 7, PostgreSQL 16, Redis 7, BullMQ, Vitest | `src/server.ts` (API), `src/worker.ts` (jobs), prod `dist/server.js` | **Good** — `npm run build` PASS; phase gates `P3_PASS=YES`, `P2_PASS=YES`; legacy Vitest `@/` alias suites fail (pre-existing) |
| **pranidoctor-web** | `D:\PraniDoctor\pranidoctor-web` | `github.com/balagpetcare/pranidoctor-web` · branch `main` | Admin / doctor / enterprise web UI; API proxy to backend; location-master tooling & docs hub | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Vitest | `next dev` / `next start` · `src/app/**` | **Good** — `npm run typecheck` PASS; 176 Next `route.ts` handlers remain; Prisma on web is non-canonical sync copy |
| **pranidoctor_user** | `D:\PraniDoctor\pranidoctor_user` | **Not a git repository** | Flutter end-user (farmer/customer) mobile app | Flutter SDK ^3.11.5, Dart, Riverpod, go_router, Dio, Hive, Firebase | `lib/main.dart` → `lib/app/bootstrap.dart` | **Good** — `flutter analyze` clean; Android scaffold present; **no `ios/` tree** |

---

## Cross-repository architecture (as documented in code)

```
pranidoctor-backend  ── canonical Prisma schema, migrations, seeds, Express API (:3000)
        ▲
        │  NEXT_PUBLIC_API_URL / BACKEND_URL proxy
        │
pranidoctor-web      ── Next.js panels + legacy API routes (transition) (:3001 typical)
        ▲
        │  REST (Dio)
        │
pranidoctor_user     ── Flutter customer app (early scaffold)
```

**Note:** Production traffic is still documented as flowing through Next.js route handlers in `pranidoctor-web` until Express cutover (`docs/CUTOVER_DEFER_PLAN.md`, `pranidoctor-backend/ARCHITECTURE.md`). Backend Express registers **179** legacy compat routes plus foundation module routers.

---

# 1. pranidoctor-backend

## 1.1 Repository structure (top level)

```
pranidoctor-backend/
├── docker/                  # Production Dockerfile
├── prisma/                  # Canonical schema, migrations, seeds
├── scripts/                 # Verify, OpenAPI, bootstrap, env tools
├── shims/next-compat/       # Local `next` package shim for legacy route imports
├── src/
│   ├── api/                 # Health, docs (Swagger)
│   ├── compat/              # NextResponse / api-response shims
│   ├── generated/prisma/    # Generated Prisma client
│   ├── infra/               # Redis, queue, cache
│   ├── legacy/web/          # Ported Next routes + lib (compat layer)
│   ├── modules/             # Domain modules (auth, lead, timeline, …)
│   ├── shared/              # Config, DB, logger, middleware, errors
│   └── types/
├── dist/                    # Compiled output (present after build)
├── docs/openapi.json        # Generated OpenAPI snapshot
├── openapi.json             # Root OpenAPI copy
├── app.ts / server.ts / worker.ts
├── docker-compose.yml
├── package.json / package-lock.json
├── tsconfig.json / tsconfig.build.json
├── vitest.config.ts
├── eslint.config.js / .prettierrc
├── .env / .env.example
└── ARCHITECTURE.md / README.md
```

## 1.2 Folder map (`src/`)

| Path | Role |
|------|------|
| `src/modules/auth/` | Identity, OTP, session, refresh, device, panel auth |
| `src/modules/user/`, `profile/`, `area/` | Phase 2 profile & location foundation |
| `src/modules/lead/`, `assignment/`, `case/`, `timeline/`, `doctor-queue/` | Phase 3 care pipeline |
| `src/modules/leads/` | Foundation CRM `/api/leads` |
| `src/modules/doctor/`, `doctors/`, `technician/` | Provider profiles |
| `src/modules/users/`, `animals/`, `clinics/`, `ai/`, `media/`, `notifications/` | Foundation / supporting domains |
| `src/modules/compat-web/` | Legacy Next route registry + Express adapter |
| `src/legacy/web/routes/` | **179** `route.ts` compat handlers |
| `src/legacy/web/lib/` | Business logic ported from web |
| `src/shared/` | Config (Zod), Prisma singleton, Pino logger, errors |
| `src/infra/` | Redis client, BullMQ queues, cache service |
| `src/api/docs/` | Swagger UI + OpenAPI serve |

## 1.3 Build system

| Item | Detail |
|------|--------|
| Package manager | **npm** (`package-lock.json`) |
| Node | `>=20.0.0` |
| Module system | ESM (`"type": "module"`) |
| Compile | `tsc -p tsconfig.build.json` (excludes `src/legacy/**` from emit; loaded at runtime via `tsx`) |
| Dev runtime | `tsx watch src/server.ts` |
| Prod runtime | `node dist/server.js` |
| Typecheck | `tsconfig.build.json` (modules) + optional `tsconfig.json` (legacy) |
| Lint / format | ESLint 9, Prettier 3 |

**Key scripts:** `dev`, `build`, `start`, `worker`, `test`, `db:*`, `openapi:generate`, `e2e:freeze`, `p1:*`, `p2:verify`, `p3:verify`, `docker:*`, `bootstrap`, `env:validate`, `validate:startup`.

## 1.4 Docker

| Asset | Purpose |
|-------|---------|
| `docker-compose.yml` | **postgres**, **redis**, **minio**, **minio-init**; optional **api** service (`profile: production`) |
| `docker/Dockerfile` | Multi-stage Node 20 Alpine → `node dist/server.js` on port 3000 |
| `.dockerignore` | Present |

Default dev: `npm run docker:up` → postgres + redis + minio (not full API container).

## 1.5 Environment files

| File | Notes |
|------|-------|
| `.env` | Local secrets (present; not audited) |
| `.env.example` | Documents `DATABASE_URL`, `REDIS_ENABLED`, JWT secrets, OTP, storage drivers, CORS, rate limits |

Config loader: `src/shared/config/` (Zod-validated).

## 1.6 Scripts inventory (`scripts/`)

| Category | Files |
|----------|-------|
| **Phase verify** | `p1-verify.ts`, `p1-03-verify.ts` … `p1-12-verify.ts`, `p1-auth-compat-verify.ts`, `p2-verify.ts`, `p3-verify.ts` |
| **OpenAPI / E2E** | `generate-openapi.mjs`, `e2e-freeze-verify.ts` |
| **Startup / env** | `validate-startup.ts`, `wait-for-services.ts`, `env-validate.ts`, `resolve-env.mjs`, `runtime-verification.ts` |
| **Bootstrap** | `bootstrap.sh`, `bootstrap.ps1` |
| **Maintenance** | `fix-legacy-imports.mjs`, `fix-controllers.mjs`, `fix-dtos.mjs`, `fix-dto-returns.mjs`, `fix-require-param.mjs`, `prisma-production-guard.mjs` |

## 1.7 Dependency inventory (summary)

**Runtime (selected):** `@prisma/client` 7.8, `express` 5.1, `pg`, `ioredis`, `bullmq`, `jose`, `bcryptjs`, `zod` 3.25, `@aws-sdk/client-s3`, `pino`, `multer`, `sharp`, `swagger-ui-express`, local `next` shim.

**Dev (selected):** `typescript` 5.8, `tsx`, `vitest` 4.1, `prisma` 7.8, ESLint + Prettier.

**Total lockfile packages:** see `package-lock.json` (npm ci in Docker).

## 1.8 CI/CD

| System | Status |
|--------|--------|
| GitHub Actions (`.github/workflows`) | **Not present** |
| GitLab CI | **Not present** |
| Vercel / Render / K8s manifests | **Not present** in repo |

Verification is **local script-driven** (`p1`–`p3`, `e2e:freeze`).

## 1.9 Deployment configs

| Mechanism | Location |
|-----------|----------|
| Docker production image | `docker/Dockerfile` + compose `api` service |
| Compose infra only | `docker compose up -d postgres redis minio` |
| Process manager / K8s | **Not in repo** |

## 1.10 Testing

| Layer | Tooling | Notes |
|-------|---------|-------|
| Unit / module | Vitest | **14** test files under `src/modules/` (mostly auth + profile) |
| Legacy web lib | Vitest | **12** suites fail on `@/` path alias resolution (pre-existing) |
| Integration / phase | `scripts/p2-verify.ts`, `p3-verify.ts`, `e2e-freeze-verify.ts` | HTTP matrix against `:3000` |
| E2E browser | **None** in repo |

**Latest documented gates:** `P3_PASS=YES` (17/17), `P2_PASS=YES` (13/13), `e2e:freeze` 8/9 (web proxy skipped without web on `:3001`).

## 1.11 Existing documentation

| Location | Content |
|----------|---------|
| `README.md` | Setup, stack, quick start |
| `ARCHITECTURE.md` | Backend-first Prisma ownership, legacy port notes |
| `prisma/SCHEMA_OWNER.md` | Schema governance |
| `docs/openapi.json` | Generated API snapshot |
| `pranidoctor-web/docs/` | Phase plans, freeze certs (cross-repo) |

## 1.12 Git state (snapshot)

| Field | Value |
|-------|-------|
| Branch | `main` |
| Latest commit (local) | `ee5ecd8 Initial backend upload` |
| Remote | `https://github.com/balagpetcare/pranidoctor_backend.git` |

Local workspace contains Phase 1–3 implementation beyond initial commit message (not re-audited for uncommitted delta).

---

# 2. pranidoctor-web

## 2.1 Repository structure (top level)

```
pranidoctor-web/
├── src/
│   ├── app/                 # Next.js App Router (admin, doctor, enterprise, api)
│   ├── components/
│   ├── lib/                 # Domain libs (admin-*, mobile-*, doctor-*, …)
│   ├── generated/prisma/    # Synced Prisma client copy (non-canonical)
│   └── types/
├── public/
├── docs/                    # ~222 markdown files (plans, phases, architecture)
├── scripts/                 # Location pipeline, Prisma sync, diagnostics
├── data/                    # Location CSV / master data
├── archive/                 # Archived artifacts
├── backups/                 # Location / Prisma backups
├── docker-compose.yml       # Local Postgres + MinIO
├── next.config.ts
├── package.json / package-lock.json
├── vitest.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── tsconfig.json
├── .env / .env.example
├── AGENTS.md / CLAUDE.md
└── README.md
```

## 2.2 Folder map (`src/app/`)

| Segment | Role |
|---------|------|
| `src/app/admin/` | Admin panel UI |
| `src/app/doctor/` | Doctor panel UI |
| `src/app/enterprise/` | Enterprise / AI service review UI |
| `src/app/api/` | **176** Next.js Route Handlers (legacy production API surface) |

## 2.3 Folder map (`src/lib/` — selected)

| Prefix | Domain |
|--------|--------|
| `admin-*` | Admin auth, doctors, billing, service requests, semen, areas |
| `doctor-*` | Doctor auth, clinical workflows |
| `mobile-*` | Customer mobile API helpers (auth, animals, service requests, …) |
| `technician-*` | AI technician panel |
| `locations/` | BD location master helpers |
| `notifications/`, `sms/`, `storage/` | Cross-cutting |

## 2.4 Build system

| Item | Detail |
|------|--------|
| Package manager | **npm** |
| Framework | **Next.js 16.2.6** (App Router) |
| UI | React 19, Tailwind CSS 4, TipTap, react-hook-form, lucide-react |
| Dev | `next dev` (typical port **3001** when backend on 3000) |
| Prod | `next build` → `next start` |
| Postinstall | `node scripts/copy-prisma-client-from-backend.mjs` |
| Typecheck | `tsc --noEmit` — **PASS** (2026-05-21 audit) |

**Location tooling scripts:** extensive `locations:*` npm scripts under `scripts/locations/`.

## 2.5 Docker

| Service | Image | Ports |
|---------|-------|-------|
| `db` | postgres:16-alpine | 5432 |
| `minio` | quay.io/minio/minio | 9000, 9001 |
| `minio-init` | minio/mc | bucket bootstrap |

**No** Dockerfile for Next.js app in repo. `npm run db:up` → `docker compose up -d`.

## 2.6 Environment files

| File | Notes |
|------|-------|
| `.env` | Local config (present) |
| `.env.example` | `BACKEND_URL`, `NEXT_PUBLIC_API_URL`, JWT/OTP/SMS keys, admin seed, storage — **169+ lines** of documented vars |

Web operates as **API consumer**; `DATABASE_URL` commented optional in example.

## 2.7 Scripts inventory (`scripts/` — selected)

| Script | Purpose |
|--------|---------|
| `copy-prisma-client-from-backend.mjs` | Sync generated client from backend |
| `sync-prisma-from-backend.ps1` | Full schema sync |
| `import-locations.ts`, `generate-master-csv-from-hdx-tmp.ts` | Location master pipeline |
| `locations/*` | Normalize, dedupe, QA, nuhil migration helpers |
| `proxy-all-api-routes.mjs` | API route utilities |
| `prisma-migration-guard.ts` | Migration safety |
| `diagnostics/` | SQL / data quality |

## 2.8 Dependency inventory (summary)

**Runtime (selected):** `next` 16.2.6, `react` 19, `@prisma/client` 7.8 (synced), `axios`, `jose`, `jsonwebtoken`, `@tiptap/*`, `zod` 4.4, `@aws-sdk/client-s3`, `sharp`.

**Dev:** `typescript` 5, `vitest` 4.1, `eslint-config-next`, `tailwindcss` 4, `tsx`.

## 2.9 CI/CD

**None configured** in repository (no `.github/`, GitLab, or cloud deploy manifests).

## 2.10 Deployment configs

| Item | Status |
|------|--------|
| `next.config.ts` | Rewrites `/backend-api/*` → `${BACKEND_URL}/api/*` |
| Docker app image | **Not present** |
| Vercel / nginx / K8s | **Not in repo** |

## 2.11 Testing

| Layer | Count / tool |
|-------|----------------|
| Vitest unit | **14** `*.test.ts` under `src/lib/` |
| Phase / E2E | Consumes backend `e2e:freeze` (web proxy check) |
| Playwright / Cypress | **None** |

## 2.12 Existing documentation

| Area | Scale |
|------|-------|
| `docs/` | **~222 files** — phase plans (P0–P3), API maps, architecture, devops, UI/UX, Prisma migration history |
| Phase freeze certs | `PHASE1_FREEZE.md`, `PHASE2_FREEZE.md`, `PHASE3_FREEZE.md` |
| Root reports | Multiple `*_REPORT.md` delivery notes |

## 2.13 Git state (snapshot)

| Field | Value |
|-------|-------|
| Branch | `main` |
| Latest commit (local) | `963f6cb Initial project upload` |
| Remote | `https://github.com/balagpetcare/pranidoctor-web.git` |

---

# 3. pranidoctor_user

## 3.1 Repository structure (top level)

```
pranidoctor_user/
├── android/                 # Android native project (only mobile platform present)
├── lib/                     # Dart application code
├── test/                    # widget_test.dart
├── docs/                    # DEVELOPER_SETUP.md, MASTER_APP_ARCHITECTURE_PLAN.md
├── pubspec.yaml / pubspec.lock
├── l10n.yaml
├── analysis_options.yaml
├── README.md                # Default Flutter starter text
└── .metadata
```

**Missing:** `ios/`, `.git/` — not version-controlled in workspace.

## 3.2 Folder map (`lib/`)

```
lib/
├── main.dart
├── app/                     # bootstrap, app shell, env
├── core/
│   ├── cache/               # Hive bootstrap
│   ├── error/               # freezed exceptions / ApiResult
│   ├── models/              # DTOs (json_serializable)
│   ├── network/             # Dio provider
│   └── session/             # Riverpod session controller
├── features/
│   ├── auth/                # login, auth repository
│   ├── home/, inbox/, services/, settings/
│   ├── calls/               # video call gateway stub
│   ├── media/               # upload coordinator
│   └── notifications/       # FCM service
├── routing/                 # go_router + shell scaffold
├── theme/
└── l10n/                    # app_en.arb + generated localizations
```

## 3.3 Build system

| Item | Detail |
|------|--------|
| Package manager | **pub** (`pubspec.yaml` / `pubspec.lock`) |
| SDK | Dart **^3.11.5** |
| Codegen | `build_runner`, `freezed`, `json_serializable` |
| l10n | `flutter gen-l10n` via `l10n.yaml` |
| Analyze | `flutter analyze` — **No issues found** (2026-05-21) |
| Platforms | **Android only** scaffolded |

## 3.4 Docker

**None.**

## 3.5 Environment files

Configuration via **`AppEnv.fromEnvironment()`** (`lib/app/app_env.dart`) — dart-define / build-time flags (no `.env` file in repo).

## 3.6 Scripts

No npm/shell automation. Standard Flutter commands:

```bash
flutter pub get
flutter run
flutter test
dart run build_runner build
```

## 3.7 Dependency inventory

| Category | Packages |
|----------|----------|
| State / routing | `flutter_riverpod`, `go_router` |
| Network | `dio` |
| Local storage | `hive`, `hive_flutter`, `flutter_secure_storage` |
| Auth / push | `firebase_core`, `firebase_messaging`, `google_sign_in`, `flutter_facebook_auth` |
| Models | `freezed_annotation`, `json_annotation`, `intl` |

## 3.8 CI/CD

**None** (no git remote, no pipeline files).

## 3.9 Deployment configs

| Target | Status |
|--------|--------|
| Android | `android/app/build.gradle.kts`, package `com.pranidoctor.user.pranidoctor_user` |
| iOS | **Not present** |
| Store / Fastlane | **Not in repo** |

## 3.10 Testing

| File | Scope |
|------|-------|
| `test/widget_test.dart` | Default Flutter widget smoke test |
| Integration / golden | **None** |

## 3.11 Existing documentation

| File | Content |
|------|---------|
| `docs/DEVELOPER_SETUP.md` | Flutter setup, Firebase notes, API base URL |
| `docs/MASTER_APP_ARCHITECTURE_PLAN.md` | Enterprise mobile architecture plan |
| `README.md` | Generic Flutter starter (stale vs actual project) |

## 3.12 Git state

**Not a git repository** in current workspace — no remotes, branches, or commit history.

---

# 4. Shared concerns

## 4.1 Database & Prisma

| Item | Owner |
|------|-------|
| Canonical `schema.prisma` | `pranidoctor-backend/prisma/` |
| Prisma models (count) | **59** models |
| Migrations | **27** timestamped folders under `prisma/migrations/` |
| Seeds | `seed.ts`, `seed-admin.ts`, `seed-demo.ts`, `seed-data/` |
| Web copy | `pranidoctor-web/src/generated/prisma/` via postinstall sync |

## 4.2 API surface duplication (intentional transition)

| Surface | Route handlers | Notes |
|---------|----------------|-------|
| Backend Express legacy | **179** `route.ts` | Registered via `modules/compat-web/route-registry.ts` |
| Web Next.js API | **176** `route.ts` | Documented production path until cutover |
| OpenAPI snapshot | **179** legacy paths | `npm run openapi:generate` (backend) |

## 4.3 Phase verification baseline (documented 2026-05-21)

| Gate | Result |
|------|--------|
| Backend build | PASS |
| Web typecheck | PASS |
| `p3:verify` | 17/17 — lead → assign → accept → case → resolve + timeline |
| `p2:verify` | 13/13 |
| `e2e:freeze` | 8/9 (web proxy needs web on `:3001`) |
| Flutter analyze | PASS |

## 4.4 Documentation hub

Primary documentation lives in **`pranidoctor-web/docs/`** (plans, freezes, API maps). Backend keeps minimal `docs/openapi.json`. Mobile keeps **2** docs files.

---

## 5. Risks & gaps (inventory only — no fixes)

| Gap | Repos affected |
|-----|----------------|
| No CI/CD pipelines | backend, web |
| Dual API stacks (Next + Express) | backend, web |
| `pranidoctor_user` not under git | mobile |
| No iOS project | mobile |
| Legacy Vitest `@/` failures | backend |
| Web README still references local Prisma migrate | web (docs drift) |
| Git commits say "Initial upload" while local tree is far ahead | backend, web |

---

## Output block

```
INVENTORY_COMPLETE
```
