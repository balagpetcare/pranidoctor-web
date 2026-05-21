# Integration Matrix — Backend · Web · Flutter

**Generated:** 2026-05-22  
**Repositories compared:**

| Alias | Path | Role |
|-------|------|------|
| **backend-api** | `D:\PraniDoctor\pranidoctor-backend` | Express API (foundation modules + legacy compat) |
| **pranidoctor-web** | `D:\PraniDoctor\pranidoctor-web` | Next.js BFF — 179 `/api/*` proxy routes + admin/doctor UI |
| **prani_doctor_user** | `D:\PraniDoctor\pranidoctor_user` | Flutter end-user mobile app |

**Related docs:** `pranidoctor_user/docs/FLUTTER_CURRENT_STATE.md`, `pranidoctor-web/docs/PHASE*.md`, `pranidoctor-backend/openapi.json`

---

## Architecture Context

The platform exposes **two API layers** on the backend:

| Layer | Prefix examples | Web Next.js proxy | Flutter contracts |
|-------|-----------------|-------------------|-------------------|
| **Legacy compat** | `/api/mobile/*`, `/api/admin/*`, `/api/doctor/*` | ✅ 179 route files | ❌ Not declared |
| **Foundation modules** | `/api/auth`, `/api/ai`, `/api/area`, `/api/cases`, `/api/voice`, `/api/sync` | ❌ No Next.js routes | ✅ Contracts in `lib/core/*` |

**Implication:** Flutter is aligned to **foundation** paths (direct to backend). Web admin/doctor panels use **legacy compat** paths. Mobile customer flows today live under `/api/mobile/*` (legacy) — **not yet wired in Flutter**.

---

## Status Legend

| Column | Values |
|--------|--------|
| **Web Status** | **Full** = proxy route + UI consumes · **Proxy-only** = route exists, no web UI · **Absent** = no Next.js route · **Stub** = UI placeholder, API missing · **N/A** = out of web persona |
| **Flutter Status** | **Implemented** = Dio HTTP call · **Partial** = SDK/infra only · **Contract-only** = path in `*ApiPaths`, no HTTP · **Absent** = not declared · **Stub** = placeholder UI/local only |
| **Reusable** | Shared artifacts both clients can reuse (backend contract, DTO shape, proxy pattern) |
| **Missing** | Primary gap blocking integration |
| **Priority** | **P0** critical path · **P1** next sprint · **P2** important · **P3** later / other persona |

---

## Summary Scorecard

| Domain | Backend | Web | Flutter | Integration gap |
|--------|---------|-----|---------|-----------------|
| Health / ops | ✅ | ✅ probes | ❌ | Low — ops only |
| Mobile auth (OTP) | ✅ legacy | Proxy-only | ❌ Absent | **P0** — blocks real login |
| Foundation auth | ✅ | Absent | ❌ Absent | **P0** — choose auth surface |
| Identity / devices | ✅ | Partial (devices proxy) | ❌ | **P1** |
| Area engine | ✅ foundation | Absent | Contract-only | **P1** |
| Legacy locations | ✅ | Proxy-only | ❌ (uses `/api/area` in contracts) | **P1** — path mismatch |
| AI veterinary chat | ✅ partial | Absent | Contract-only | **P1** |
| Voice assistant | ✅ partial | Absent | Contract-only | **P2** |
| Offline sync | ✅ | Absent | Contract-only | **P2** |
| Treatment / cases | ✅ doctor-only | Doctor UI (legacy) | Contract-only | **P3** — wrong persona |
| Mobile service requests | ✅ | Proxy-only | ❌ | **P0** — core user journey |
| Mobile animals | ✅ | Proxy-only | ❌ | **P1** |
| Mobile providers | ✅ | Proxy-only | ❌ | **P1** |
| Mobile uploads | ✅ | Proxy-only | Stub coordinator | **P1** |
| Mobile notifications | ✅ | Proxy-only | Partial (FCM only) | **P1** |
| Admin / doctor panels | ✅ | Full | N/A | Complete for web persona |
| Foundation media | Stub 503 | Absent | ❌ | **P2** — use legacy uploads |

**Cross-stack integration completion (end-user mobile path): ~12%**  
**Web admin/doctor path: ~75%**  
**Flutter ↔ foundation backend alignment (contracts only): ~35%**

---

## Matrix — End-User Mobile Critical Path (P0–P1)

| API | Web Status | Flutter Status | Reusable | Missing | Priority |
|-----|------------|----------------|----------|---------|----------|
| `POST /api/mobile/auth/otp/request` | Proxy-only | Absent | Backend handler + web proxy ready; mirror in Flutter auth repo | Flutter OTP UI + repository; path not in contracts | **P0** |
| `POST /api/mobile/auth/otp/verify` | Proxy-only | Absent | Same | Token exchange + session persistence | **P0** |
| `POST /api/mobile/auth/login` | Proxy-only | Absent | Alias to verify on backend | Wire after OTP flow | **P0** |
| `POST /api/mobile/auth/register` | Proxy-only | Absent | Backend ready | Registration screen + repo | **P0** |
| `POST /api/mobile/auth/refresh` | Proxy-only | Absent | Backend + web proxy | Dio 401 refresh interceptor | **P0** |
| `POST /api/auth/otp/request` | Absent | Absent | Foundation module on backend (parallel to mobile) | Decide: foundation vs legacy mobile auth for Flutter | **P0** |
| `POST /api/auth/otp/verify` | Absent | Absent | Foundation `{ success, data }` envelope | Web BFF proxy or direct backend URL in Flutter | **P0** |
| `POST /api/auth/token/refresh` | Absent | Absent | Backend ready | Same auth-surface decision | **P0** |
| Google / Facebook OAuth → backend | N/A | Stub (SDK only) | `AuthRepository` skeleton | Backend token exchange endpoint + UI wiring | **P0** |
| Bearer `Authorization` on Dio | N/A | Absent | Pattern in web `adminFetch` / cookies | Flutter Dio interceptor | **P0** |
| `GET /api/mobile/me` | Proxy-only | Absent | Backend + proxy | Profile repository + home header | **P0** |
| `PATCH /api/mobile/me` | Proxy-only | Absent | Backend + proxy | Profile edit screen | **P1** |
| `GET /api/mobile/profile/dashboard-context` | Proxy-only | Absent | Backend ready | Home dashboard data | **P1** |
| `GET /api/mobile/app-config` | Proxy-only | Absent | Backend ready | Feature flags / remote config | **P1** |
| `GET /api/mobile/service-categories` | Proxy-only | Absent | Backend ready | Services catalog screen | **P0** |
| `GET /api/mobile/service-requests` | Proxy-only | Absent | Backend + proxy | Inbox/history list | **P0** |
| `POST /api/mobile/service-requests` | Proxy-only | Absent | Backend ready | Book service flow | **P0** |
| `GET /api/mobile/service-requests/:id` | Proxy-only | Absent | Backend ready | Request detail | **P0** |
| `GET /api/mobile/service-requests/:id/timeline` | Proxy-only | Absent | Backend ready | Status timeline UI | **P1** |
| `POST /api/mobile/service-requests/:id/cancel` | Proxy-only | Absent | Backend ready | Cancel action | **P1** |
| `GET /api/mobile/providers/doctors` | Proxy-only | Absent | Backend ready | Provider browse | **P1** |
| `GET /api/mobile/providers/doctors/:id` | Proxy-only | Absent | Backend ready | Doctor detail | **P1** |
| `GET /api/mobile/providers/technicians` | Proxy-only | Absent | Backend ready | AI tech browse | **P1** |
| `GET /api/mobile/providers/technicians/:id` | Proxy-only | Absent | Backend ready | Tech detail | **P1** |
| `GET /api/mobile/animals` | Proxy-only | Absent | Backend ready | Animals list | **P1** |
| `POST /api/mobile/animals` | Proxy-only | Absent | Backend ready | Add animal form | **P1** |
| `GET/PATCH /api/mobile/animals/:id` | Proxy-only | Absent | Backend ready | Animal detail/edit | **P1** |
| `POST /api/mobile/uploads` | Proxy-only | Stub | Backend + `MediaUploadCoordinator` placeholder | Dio multipart upload impl | **P1** |
| `POST /api/mobile/uploads/profile-image` | Proxy-only | Absent | Backend ready | Profile photo | **P1** |
| `GET /api/mobile/uploads/:id` | Proxy-only | Absent | Backend ready | Media display | **P1** |
| `GET /api/mobile/notifications` | Proxy-only | Absent | Backend ready | Inbox notifications tab | **P1** |
| `PATCH /api/mobile/notifications/:id/read` | Proxy-only | Absent | Backend ready | Read state | **P1** |
| `PATCH /api/mobile/notifications/read-all` | Proxy-only | Absent | Backend ready | Mark all read | **P2** |
| `POST /api/mobile/devices/register` | Proxy-only | Partial (FCM token local) | Backend + web proxy | POST FCM token after login | **P1** |
| `GET /api/mobile/devices` | Proxy-only | Absent | Backend ready | Device management settings | **P2** |
| `DELETE /api/mobile/devices/:id` | Proxy-only | Absent | Backend ready | Revoke device | **P2** |

---

## Matrix — Foundation Modules (Flutter contracts ↔ Backend)

> These paths are declared in Flutter `lib/core/*` contracts. **Web has no Next.js proxy routes** — clients hit backend directly (or web must add BFF routes).

| API | Web Status | Flutter Status | Reusable | Missing | Priority |
|-----|------------|----------------|----------|---------|----------|
| `GET /api/area/divisions` | Absent | Contract-only | `AreaRepositoryContract` + `AreaNodeDto` match backend | Dio `AreaRepository` impl | **P1** |
| `GET /api/area/divisions/:id/districts` | Absent | Contract-only | DTOs aligned | Cascading picker widget | **P1** |
| `GET /api/area/districts/:id/upazilas` | Absent | Contract-only | Same | Same | **P1** |
| `GET /api/area/upazilas/:id/unions` | Absent | Contract-only | Same | Same | **P1** |
| `GET /api/area/unions/:id/villages` | Absent | Contract-only | Same | Same | **P1** |
| `GET /api/area/search` | Absent | Contract-only | Same | Search UI | **P1** |
| `GET /api/area/seed/version` | Absent | Absent | Backend only | Add to Flutter contract for cache invalidation | **P2** |
| `GET /api/mobile/locations/*` (legacy tree) | Proxy-only | Absent | Overlaps foundation area | **Path strategy:** migrate Flutter to `/api/area` or call legacy via web BFF | **P1** |
| `GET /api/locations/*` (shared legacy) | Proxy-only | Absent | Public location tree | Not needed if Flutter uses `/api/area` | **P3** |
| `POST /api/ai/chat` | Absent | Contract-only | `AiRepositoryContract` + DTOs match backend | Repository + chat UI | **P1** |
| `POST /api/ai/triage` | Absent | Contract-only | DTOs aligned | Triage flow UI | **P1** |
| `GET /api/ai/memory` | Absent | Contract-only | Contract ready | Memory management (optional v1) | **P2** |
| `DELETE /api/ai/memory` | Absent | Contract-only | Contract ready | Same | **P2** |
| `POST /api/ai/escalate` | Absent | Contract-only | Contract ready | Human handoff UI | **P2** |
| `POST /api/voice/stt` | Absent | Contract-only | `VoiceRepositoryContract` + DTOs | Audio capture + STT repo (backend accepts transcript) | **P2** |
| `POST /api/voice/chat` | Absent | Contract-only | DTOs aligned | Voice chat UI | **P2** |
| `POST /api/voice/navigation` | Absent | Contract-only | DTOs aligned | Voice nav commands | **P3** |
| `GET /api/voice/session` | Absent | Contract-only | DTOs aligned | Session restore | **P2** |
| `GET /api/sync/status` | Absent | Contract-only | `OfflineRepositoryContract` + DTOs | Sync coordinator impl | **P2** |
| `POST /api/sync` | Absent | Contract-only | DTOs aligned | Queue drain + conflict UI | **P2** |
| `POST /api/sync/retry` | Absent | Contract-only | DTOs aligned | Retry engine | **P2** |
| `GET /api/offline/queue` | Absent | Contract-only | DTOs aligned | Offline queue screen | **P2** |
| `GET /api/cases/:id/treatment` | Absent | Contract-only | `TreatmentRepositoryContract` | **Doctor persona** — not end-user v1 | **P3** |
| `POST /api/cases/:id/consultation` | Absent | Contract-only | Contract ready | Doctor app, not `pranidoctor_user` | **P3** |
| `POST /api/cases/:id/diagnosis` | Absent | Contract-only | Contract ready | Doctor app | **P3** |
| `POST /api/cases/:id/prescription` | Absent | Contract-only | Contract ready | Doctor app | **P3** |
| `POST /api/cases/:id/followup` | Absent | Contract-only | Contract ready | Doctor app | **P3** |
| `POST /api/cases/:id/close` | Absent | Contract-only | Contract ready | Doctor app | **P3** |
| `GET/POST /api/cases/:id/notes` | Absent | Contract-only | Contract ready | Doctor app | **P3** |
| `GET /api/identity/capabilities` | Absent | Absent | Backend ready | Capability gating | **P2** |
| `GET /api/identity/profile/summary` | Absent | Absent | Backend ready | Profile summary (alternative to `/api/mobile/me`) | **P1** |
| `GET /api/identity/session/devices` | Absent | Absent | Backend ready | Device list (foundation) | **P2** |
| `POST /api/identity/session/devices/:id/revoke` | Absent | Absent | Backend ready | Revoke session | **P2** |
| `GET /api/users/me` | Absent | Absent | Backend foundation | User DTO (`UserProfileDto` example exists) | **P1** |
| `GET/PATCH /api/users/me/profile` | Absent | Absent | Backend ready | Profile CRUD | **P1** |

---

## Matrix — Mobile AI Services (Customer)

| API | Web Status | Flutter Status | Reusable | Missing | Priority |
|-----|------------|----------------|----------|---------|----------|
| `POST /api/mobile/ai-services/requests` | Proxy-only | Absent | Backend ready | AI service booking (semen/AI product) | **P1** |
| `GET /api/mobile/ai-services/requests/me` | Proxy-only | Absent | Backend ready | My AI service requests | **P1** |
| `GET /api/mobile/ai-services/requests/:id` | Proxy-only | Absent | Backend ready | Request detail | **P1** |
| `GET /api/mobile/ai-services/requests/:id/record` | Proxy-only | Absent | Backend ready | Service record view | **P2** |
| `POST /api/mobile/ai-services/requests/:id/complaint` | Proxy-only | Absent | Backend ready | Complaint form | **P2** |
| `POST /api/mobile/ai-services/requests/:id/review` | Proxy-only | Absent | Backend ready | Review/rating | **P2** |
| `GET /api/mobile/ai-services/technicians` | Proxy-only | Absent | Backend ready | Browse AI technicians | **P1** |
| `GET /api/mobile/ai-services/technicians/:id` | Proxy-only | Absent | Backend ready | Technician profile | **P1** |

---

## Matrix — Mobile Tutorials / Content

| API | Web Status | Flutter Status | Reusable | Missing | Priority |
|-----|------------|----------------|----------|---------|----------|
| `GET /api/mobile/tutorials` | Proxy-only | Absent | Backend ready | Knowledge hub list in mobile | **P2** |
| `GET /api/mobile/tutorials/categories` | Proxy-only | Absent | Used by doctor KH web form | Category filter | **P2** |
| `GET /api/mobile/tutorials/:slugOrId` | Proxy-only | Absent | Backend ready | Article/detail view | **P2** |

---

## Matrix — Web Admin & Doctor (Reference — Flutter N/A)

| API group | Web Status | Flutter Status | Reusable | Missing | Priority |
|-----------|------------|----------------|----------|---------|----------|
| `/api/admin/auth/*` | **Full** | N/A | Login/session pattern | — | N/A |
| `/api/admin/dashboard/page-data` | **Full** | N/A | RSC + client cache pattern | — | N/A |
| `/api/admin/areas/*` | **Full** | N/A | CRUD components | — | N/A |
| `/api/admin/doctors/*` | **Full** | N/A | Provider admin forms | — | N/A |
| `/api/admin/ai-technicians/*` | **Full** | N/A | Technician admin | — | N/A |
| `/api/admin/service-requests/*` | **Full** | N/A | Assignment actions | — | N/A |
| `/api/admin/semen-*`, `/livestock-breeds` | **Full** | N/A | Catalog admin | — | N/A |
| `/api/admin/billing/*` | **Full** | N/A | Billing settings | — | N/A |
| `/api/admin/tutorials/*`, `/content-categories/*` | **Full** | N/A | Knowledge hub admin | — | N/A |
| `/api/admin/locations/*` | **Full** (partial routes unused) | N/A | Location QA tools | Duplicates/import-report UI gaps | **P3** |
| `/api/doctor/auth/*` | **Full** | N/A | Doctor login | — | N/A |
| `/api/doctor/service-requests/*` | **Full** | N/A | Case management UI | — | N/A |
| `/api/doctor/service-requests/:id/treatment-cases` | **Full** | N/A | Clinical workflow (legacy) | Overlaps foundation `/api/cases` | **P3** |
| `/api/doctor/service-requests/:id/prescriptions` | **Full** | N/A | Prescriptions (legacy) | — | N/A |
| `/api/doctor/tutorials/*` | **Full** | N/A | Doctor KH | — | N/A |
| `/api/doctor/earnings/summary` | **Full** | N/A | Earnings widget | — | N/A |
| `/api/notifications/*` (shared) | **Full** | N/A | Notification panel pattern | Flutter should use `/api/mobile/notifications` | N/A |
| `/api/admin/users`, `/customers`, `/animals`, `/prescriptions` | **Stub** (UI only) | N/A | Page shells exist | Backend routes not implemented | **P3** |
| `/api/admin/audit/auth` | **Stub** | N/A | Audit hub UI | Backend route missing | **P3** |

---

## Matrix — Backend Foundation Stubs (Avoid for Now)

| API | Web Status | Flutter Status | Reusable | Missing | Priority |
|-----|------------|----------------|----------|---------|----------|
| `/api/media/*` | Absent | Absent | Foundation stub (503) | Use `/api/mobile/uploads` instead | **P3** |
| `/api/animals/*` (foundation) | Absent | Absent | Stub — throws | Use `/api/mobile/animals` | **P3** |
| `/api/clinics/*` | Absent | Absent | Stub — unimplemented | Not in mobile scope v1 | **P3** |
| `/api/notifications/*` (foundation) | Absent | Absent | Stub — throws | Use legacy `/api/mobile/notifications` | **P3** |
| `/api/doctors/*` (foundation create) | Absent | Absent | Partial (read works) | Admin uses legacy paths | **P3** |
| `/api/leads/*` | Absent | Absent | Backend implemented | Offline lead capture in Flutter contracts | **P2** |

---

## Matrix — Health & Infrastructure

| API | Web Status | Flutter Status | Reusable | Missing | Priority |
|-----|------------|----------------|----------|---------|----------|
| `GET /health`, `/ready`, `/live` | **Full** (custom probes) | Absent | `fetchBackendHealth` pattern | Optional mobile health check | **P3** |
| `GET /api/health` | **Full** | Absent | Legacy compat probe | — | **P3** |
| `GET /api/mobile/health` | **Full** (custom) | Absent | Connectivity check before sync | Dio health interceptor | **P2** |
| `GET /api/docs` | N/A | Absent | OpenAPI on backend | Client codegen from openapi.json | **P2** |

---

## Reusable Assets Inventory

| Asset | Location | Web uses | Flutter uses | Notes |
|-------|----------|----------|--------------|-------|
| Legacy mobile API handlers | `pranidoctor-backend/src/legacy/web/routes/mobile/**` | Via proxy | ❌ | **Primary mobile integration surface today** |
| Foundation module routes | `pranidoctor-backend/src/modules/**` | Direct backend only | Contracts only | Flutter-aligned paths |
| Next.js BFF proxy | `pranidoctor-web/src/lib/proxy-to-backend.ts` | All 179 routes | Could target same origin | Flutter may skip BFF, call backend URL |
| `ApiResult<T>` / `AppException` | Flutter `lib/core/error/` | N/A (TS equivalents in web) | Pattern ready | Mirror backend error envelope |
| Area DTOs | Flutter `area_dto.dart` ↔ backend area module | N/A | Contract-only | **High reuse** — implement repository |
| AI DTOs | Flutter `ai_dto.dart` ↔ `/api/ai/*` | N/A | Contract-only | **High reuse** |
| Voice DTOs | Flutter `voice_dto.dart` | N/A | Contract-only | **High reuse** |
| Offline DTOs | Flutter `offline_dto.dart` | N/A | Contract-only | **High reuse** |
| Treatment DTOs | Flutter `treatment_dto.dart` | Doctor legacy UI | Contract-only | Wrong persona for end-user app |
| `UserProfileDto` | Flutter example model | N/A | Unused | Wire to `/api/users/me/profile` |
| Phase integration docs | `pranidoctor-web/docs/PHASE*.md` | Authoritative API specs | Referenced in audit | Source of truth for foundation APIs |
| OpenAPI spec | `pranidoctor-backend/openapi.json` | Partial coverage | Could generate clients | Foundation modules incomplete in spec |

---

## Critical Path Mismatches

### 1. Auth surface split

| Surface | Backend | Web | Flutter |
|---------|---------|-----|---------|
| Legacy mobile OTP | `/api/mobile/auth/*` | Proxied | Not declared |
| Foundation OTP | `/api/auth/*` | Not proxied | Not declared |
| OAuth social | Stub provider on `/api/identity` | N/A | SDK stub only |

**Decision needed:** Flutter should call **`/api/mobile/auth/*` via web BFF** (same-origin, cookies) **or** **`/api/auth/*` direct to backend** with Bearer tokens. Contracts currently specify neither.

### 2. Location API split

| Surface | Backend | Web | Flutter |
|---------|---------|-----|---------|
| Legacy | `/api/mobile/locations/*` | Proxied | Not declared |
| Foundation | `/api/area/*` | Not proxied | Contract-only |

Flutter contracts target **`/api/area/*`**. Legacy mobile apps would use **`/api/mobile/locations/*`**. Same data, different paths — pick one for implementation.

### 3. Treatment / cases split

| Surface | Backend | Web | Flutter |
|---------|---------|-----|---------|
| Legacy doctor | `/api/doctor/service-requests/:id/treatment-cases` | Full UI | N/A |
| Foundation | `/api/cases/:id/*` | Absent | Contract-only |

Flutter `TreatmentRepositoryContract` targets **doctor foundation API** — inappropriate for end-user app v1. Customer journey uses **`/api/mobile/service-requests/*`**.

### 4. Foundation APIs bypass web BFF

Flutter foundation contracts (`/api/ai`, `/api/voice`, `/api/sync`, `/api/area`) have **no Next.js proxy**. Mobile must use `API_BASE_URL` pointing at **backend origin**, not web origin, unless web adds proxy routes.

---

## Recommended Integration Order

| Step | APIs to wire | Owner | Priority |
|------|--------------|-------|----------|
| 1 | Auth: OTP + refresh + Bearer interceptor | Flutter | **P0** |
| 2 | `GET/PATCH /api/mobile/me`, dashboard-context | Flutter | **P0** |
| 3 | Service categories + service requests CRUD | Flutter | **P0** |
| 4 | `/api/area/*` repository + location picker | Flutter | **P1** |
| 5 | Uploads + device registration + notifications | Flutter | **P1** |
| 6 | Animals + providers browse | Flutter | **P1** |
| 7 | `/api/ai/*` chat + triage | Flutter | **P1** |
| 8 | Mobile AI services (`/api/mobile/ai-services/*`) | Flutter | **P1** |
| 9 | Optional: Next.js proxy for foundation modules | Web | **P2** |
| 10 | `/api/sync/*` + offline queue | Flutter | **P2** |
| 11 | `/api/voice/*` | Flutter | **P2** |
| 12 | Tutorials content | Flutter | **P2** |

---

## Counts

| Metric | Count |
|--------|-------|
| Backend legacy compat route files | 179 |
| Backend foundation module endpoint groups | 16 modules |
| Flutter declared foundation API paths | 28 templates (~30 HTTP ops) |
| Flutter APIs with live HTTP implementation | **0** |
| Web routes with full UI consumption | ~50 |
| Web proxy-only routes (mobile/technician/foundation gap) | ~120 |
| Web stub UI pages (no backend route) | 4 |
| Foundation routes absent from web Next.js | All `/api/{auth,ai,area,cases,voice,sync,offline,identity,users,leads}` |

---

*Matrix complete. No code changes were made.*
