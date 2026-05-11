# Task 10 — Doctor & AI Technician Finder (Provider Finder)

**Task title:** Task Card 10 — Doctor & AI Technician Finder  
**Goal:** Enable Prani Doctor **customers** (mobile, authenticated) to discover **doctors** and **AI technicians** by area and service-oriented filters, with list + detail APIs on the web repo and list + detail screens on the mobile repo; call, book, and public rating remain **placeholders** or **out of scope** for this card.

**Project:** [Prani Doctor](https://pranidoctor.com/)  
**Repos:** [pranidoctor-web](https://github.com/balagpetcare/pranidoctor-web), [pranidoctor-mobile](https://github.com/balagpetcare/pranidoctor-mobile)  
**Final status:** **COMPLETE** (2026-05-09) — backend APIs, mobile MVP UI, documentation, and integration verification pass delivered. Mobile companion: **`pranidoctor-mobile/docs/PROVIDER_FINDER_MOBILE_PLAN.md`**.  
**Date:** 2026-05-09 (audit → backend → mobile → integration → completion report)

---

## 0. Final completion status (Task Card 10)

### Final backend status

- **Delivered:** `GET /api/mobile/providers/doctors`, `GET /api/mobile/providers/technicians`, optional detail `GET …/doctors/[id]`, `GET …/technicians/[id]` under `src/app/api/mobile/providers/`.
- **Auth:** `requireMobileCustomer` (Bearer JWT, `CUSTOMER` role); JSON envelope `jsonOk` / `jsonError`.
- **Data:** Prisma-backed listing for **`DoctorProfile`** / **`AiTechnicianProfile`** with **`ProviderStatus.ACTIVE`** only; area subtree for `areaId` / `areaSlug`; filters per §8.3 / §14; no `User` email/phone/`userId` in responses; `rating` always `null`; doctor detail omits **`licenseNumber`**.
- **Query hardening:** `animalType` case-insensitive; `areaId` / `serviceCategoryId` validated as **cuid** when present; invalid combinations (e.g. both area keys) → **422**.
- **Seed (local demo):** `prisma/seed.ts` links demo doctor to **`DoctorProfileArea`** + **`doctor-visit`** category where applicable for filter smoke tests.

### Final mobile status

- **Delivered:** `ProviderFinderRepository`, Riverpod providers, four screens (doctor/technician list + detail), filter panel, home entry points, `go_router` routes under `/providers/…`.
- **UX:** Loading / empty / error states; Bengali copy; theme-aligned cards; **কল** / **বুক** = SnackBar placeholders only; rating line shows **শীঘ্রই** when API `rating` is null.
- **Safety:** Unknown `areaSlug` coerced for dropdown + stripped before HTTP (`_coerceQuery`).

### API endpoints (reference)

| Method | Path |
|--------|------|
| `GET` | `/api/mobile/providers/doctors` |
| `GET` | `/api/mobile/providers/technicians` |
| `GET` | `/api/mobile/providers/doctors/[id]` |
| `GET` | `/api/mobile/providers/technicians/[id]` |

### Mobile screens (reference)

| Screen | Route |
|--------|-------|
| Doctor list | `/providers/doctors` |
| Doctor detail | `/providers/doctors/:doctorId` |
| Technician list | `/providers/technicians` |
| Technician detail | `/providers/technicians/:technicianId` |

### Filters supported (list APIs)

`areaId`, `areaSlug` (mutually exclusive), `animalType`, `homeVisit`, `emergency`, `onlineConsultation`, `serviceCategoryId`, `limit`, `offset`, `page` — see **§8.3** and **§14**.

### Card fields supported (list JSON)

**Doctor:** `id`, `name`, `degreeOrQualification`, `serviceType`, `areaText`, `fee`, `availability`, `homeVisit`, `emergency`, `onlineConsultation`, `phone` (null), `callAction`, `bookAction`, `rating` (null).  
**Technician:** same core set + `supportedAnimalTypes`; `onlineConsultation` always `false` on card.

### Test / build / lint (final reproducible run)

| Check | Result |
|-------|--------|
| `npx prisma validate` | Pass |
| `npx prisma generate` | Pass |
| `npm run lint` | Pass |
| `npm test` | **16** passed |
| `npm run build` | Pass |

### Known limitations

- **Manual E2E** with live server + JWT + curl optional for operators (§10 checklist).
- **Village-only** provider coverage vs **profile-area** area filter (see §11).
- **Customer JWT issuance** not part of this card (`POST /api/mobile/auth/login` still future).
- **Rating aggregation** not implemented; field stays `null`.

### Task Card 10 — changed files (web repo, scoped)

| Path |
|------|
| `src/lib/mobile-providers/schemas.ts` |
| `src/lib/mobile-providers/schemas.test.ts` |
| `src/lib/mobile-providers/provider-service.ts` |
| `src/app/api/mobile/providers/doctors/route.ts` |
| `src/app/api/mobile/providers/doctors/[id]/route.ts` |
| `src/app/api/mobile/providers/technicians/route.ts` |
| `src/app/api/mobile/providers/technicians/[id]/route.ts` |
| `prisma/seed.ts` (demo doctor profile area + `doctor-visit` link) |
| `docs/PROVIDER_FINDER_PLAN.md` |

*Note: `git status` on the web repo may list additional modified or untracked files from other MVP work; the table above is the **Task Card 10** scope.*

### Next task recommendation

**Customer mobile authentication** — issue JWT (`POST /api/mobile/auth/login` or agreed equivalent), persist token, wire **`LoginEntryScreen`**; then optional **`GET /api/mobile/areas`** for a real area picker.

---

## 1. Current audit result

### 1.1 pranidoctor-web

| Area | Finding |
|------|---------|
| **Prisma — User** | `User` has `email`, `phone`, `passwordHash`, `role` (`UserRole` includes `DOCTOR`, `AI_TECHNICIAN`, `CUSTOMER`, …), `status`, relations to `doctorProfile`, `aiTechnicianProfile`, `customerProfile`. |
| **Prisma — DoctorProfile** | Rich MVP fields: `displayName`, `licenseNumber`, `degree`, `specialization`, `experienceYears`, `bio`, `profilePhotoUrl`, `visitFeeBdt`, `acceptsEmergency`, `acceptsOnlineConsultation`, `providerStatus`, `verifiedAt`. Relations: `doctorServiceAreas` (legacy **Village**), `doctorProfileAreas` (**Area** tree), `doctorProfileServiceCategories`, `reviews`. **No** explicit `acceptsHomeVisit` boolean. |
| **Prisma — AI technician** | Model is **`AiTechnicianProfile`** (not `TechnicianProfile`): `displayName`, `certification`, `bio`, `serviceFeeBdt`, `acceptsEmergency`, `metadataJson`, `providerStatus`, `verifiedAt`. Relations mirror doctor: `aiTechnicianServiceAreas` (Village), `aiTechnicianProfileAreas`, `aiTechnicianProfileServiceCategories`, `reviews`. |
| **Prisma — Area** | Unified tree `Area` (`AreaType`: division … `SERVICE_AREA`) with hierarchy `parentId`. Coexists with normalized `Division` → `District` → `Upazila` → `Union` → `Village`. `ServiceRequest` has optional `areaId` and `villageId`. |
| **Prisma — ServiceCategory** | Catalog rows with `name`, `slug`, `description`; linked to providers via join tables and to `ServiceRequest`. |
| **Prisma — “ServiceArea”** | No single model named `ServiceArea`. Coverage is **`DoctorServiceArea`** / **`AiTechnicianServiceArea`** (doctor/tech ↔ **Village**) plus **`DoctorProfileArea`** / **`AiTechnicianProfileArea`** (provider ↔ **`Area`**). |
| **Prisma — AnimalProfile** | `AnimalProfile` has `species`, `breed`, `category` (`AnimalCategory`), **`animalType`** (`AnimalType?`: CATTLE, GOAT, …), health fields, `customerId`. **Not** linked to doctors/technicians directly. |
| **Prisma — ServiceRequest** | Ties customer, animal, category, optional `areaId`/`villageId`, `requestType` (`DOCTOR_VISIT`, `EMERGENCY`, `AI_SERVICE`, `ONLINE_CONSULTATION`), `assignedDoctorId` / `assignedAiTechnicianId`, flags like `isEmergency`. Relevant for future “book from finder” flows, not required for read-only finder MVP. |
| **Prisma — Review / rating** | **`Review`** exists with `rating` (Int), `doctorId` / `aiTechnicianId`, `customerId`, `status` (`ReviewStatus`: PENDING, APPROVED, …). Public aggregates are possible later; **this task defers rating in API responses** per product rule unless explicitly enabled later. |
| **API — mobile** | Implemented: `GET /api/mobile/health`, `GET|POST /api/mobile/animals`, `GET|PATCH /api/mobile/animals/[id]`, `PATCH /api/mobile/animals/[id]/deactivate`, **`GET /api/mobile/providers/doctors`**, **`GET /api/mobile/providers/technicians`**, **`GET /api/mobile/providers/doctors/[id]`**, **`GET /api/mobile/providers/technicians/[id]`** (all require **`requireMobileCustomer`** Bearer JWT). **No** `POST /api/mobile/auth/login` in tree yet. |
| **API — admin** | Full CRUD-style admin for **`/api/admin/doctors`** (list, create, `[id]` detail, approve/reject/verify/suspend/activate, visit fee, emergency, online consultation) and **`/api/admin/ai-technicians`** (parallel). **`/api/admin/areas`**, **`/api/admin/service-categories`**. All guarded by admin session (`requireAdminPanelApiAccess`). |
| **Auth — mobile API** | `src/lib/mobile-auth/`: `verifyMobileJwt`, `signMobileCustomerToken`, **`requireMobileCustomer`** — Bearer only, `role === CUSTOMER`, active user + `customerProfile`. Admin cookies **do not** authorize mobile routes. |
| **Auth — middleware** | `src/middleware.ts` matches **`/admin` HTML only**; does not run on `/api/*`. |
| **Seed / migrations** | `prisma/seed.ts`: upserts **service categories** (including `doctor-visit`, `emergency`, `ai-service`, `online-consultation`, …), builds **`Area`** tree (e.g. Dhaka division path + Ashulia union sample), normalized geography + demo village. With `PRANI_SEED_DEMO=true`: demo **doctor** (`DoctorServiceArea` to demo village; **no** `DoctorProfileArea` in snippet — AI gets **`AiTechnicianProfileArea`** + village link + `ai-service` category). Demo credentials via env (`PRANI_SEED_DOCTOR_*`, `PRANI_SEED_AI_TECH_*`). |
| **Tests** | **`vitest`** (`npm test` → `vitest run`), `vitest.config.ts`, tests under `src/**/*.test.ts` (e.g. `src/lib/admin-auth/*.test.ts`, `src/lib/mobile-animals/schemas.test.ts`). |
| **Lint / build** | `npm run lint` (eslint), `npm run build` (next build), Prisma scripts `db:generate`, `db:migrate`, `db:seed`. |

### 1.2 pranidoctor-mobile

| Area | Finding |
|------|---------|
| **Folder structure** | `lib/main.dart`, `lib/src/app/` (`app.dart`, `router.dart`, `theme.dart`, `screen_padding.dart`), `lib/src/core/` (`config`, `network`, `storage`), `lib/src/features/` (`auth`, `splash`, `onboarding`, `home`, `session`, `animals` with `data` / `application` / `presentation`). |
| **API client** | `ApiClient` + `dioProvider`: base URL from `AppConfig.apiBaseUrl`, JSON headers, **`Authorization: Bearer`** from `TokenStorage` when present. Matches web `{ ok, data }` pattern (see animals repository). |
| **Auth / session** | `SessionNotifier` + `AppRole` (customer/doctor); **`LoginEntryScreen`** explicitly **UI-only** — “Continue” goes to home **without** real OTP/login. `TokenStorage` exists but customer flow does not obtain JWT yet. |
| **Screens / navigation** | `go_router`: splash → onboarding → login → **`HomeShellScreen`** (`/home`) with **bottom `NavigationBar`**: Home, Requests placeholder, **Animals** (`AnimalsTabScreen`), Profile placeholder. Separate routes for **doctor** login/home. |
| **Models** | Example: `AnimalProfile` + `AnimalProfileRepository` with `_unwrap` for API envelope; feature-scoped models under `features/animals/data/`. |
| **Theme / UI** | `AppTheme` — Material 3, teal seed, cards 16px radius, filled buttons; `pdScreenPadding` / `pdReadableMaxWidth` for layout. Home menu tiles are local **InkWell** widgets, not shared design-system package. |
| **Area selection** | **No** dedicated customer area-picker screen in mobile repo. Home strings include “ডাক্তার খুঁজুন” / “AI টেকনিশিয়ান খুঁজুন” with **empty `onTap`** on `HomeScreen`. |

---

## 2. Existing models and missing fields

### 2.1 Present and usable for finder MVP

- Provider identity: `DoctorProfile` / `AiTechnicianProfile` + `User` (for internal IDs; **do not expose** email/phone in public cards without product decision).
- Fees: `visitFeeBdt` (doctor), `serviceFeeBdt` (AI tech).
- Flags: `acceptsEmergency`, `acceptsOnlineConsultation` (doctor only for online; AI has emergency only in schema).
- Coverage: **`Area`** via `*ProfileArea` and/or **`Village`** via `*ServiceArea` tables.
- Categories: `*ProfileServiceCategory` → `ServiceCategory.slug` / name.
- Listing guard: `providerStatus === ACTIVE` (and optionally `verifiedAt` set) for customer-facing lists.

### 2.2 Gaps and fallbacks (additive preferred)

| Need | Schema reality | Proposed MVP behavior |
|------|----------------|------------------------|
| **TechnicianProfile name** | Use **`AiTechnicianProfile`** | No rename; API path uses `technicians` as friendly segment mapping to this model. |
| **Home visit** | No `acceptsHomeVisit` on `DoctorProfile` | **Filter (optional):** treat “home visit” as “offers field visit” = linked to **`doctor-visit`** (or `livestock-health-check`) **service category** OR `visitFeeBdt != null`. Document as heuristic; later add **`acceptsHomeVisit Boolean @default(true)`** if product needs a hard switch. |
| **Animal type filter** | No provider ↔ `AnimalType` M2M | **Filter:** interpret as narrowing by **`serviceCategorySlug`** / `serviceCategoryId` (admin-managed mapping), and/or **`metadataJson`** on AI tech (already used in seed for `livestockFocus`). **Fallback:** ignore filter with `422` + message, or no-op filter — pick one in implementation (recommend: **no-op** with debug log for MVP). |
| **Area filter** | Two graphs (Village vs Area) | Accept **`areaId`** (UUID of `Area`) as primary mobile param; resolve matching providers via `DoctorProfileArea` / `AiTechnicianProfileArea`. **Optional:** `villageId` for legacy `*ServiceArea` rows; implementation can OR both sets of IDs for same logical region if admin maintains links. |
| **Availability** | No schedule table | Return **string placeholder** derived from `preferredWindow`-style product copy or static `"availability": "contact_for_slots"` until scheduling schema exists. |
| **Rating** | `Review` + `rating` exist | **Do not** return rating in MVP responses; optional follow-up: average of **`Review.status === APPROVED`** only. |

---

## 3. Proposed backend / API design

### 3.1 Principles

- **Additive:** new route handlers under `src/app/api/mobile/providers/...`, new small service module (e.g. `src/lib/mobile-providers/`) mirroring `mobile-animals` style: Zod query schemas + Prisma queries.
- **Auth:** Use **`requireMobileCustomer`** for consistency with animals (finder is customer-only). If product later wants **public** finder, introduce optional auth or rate limiting — **not** in initial MVP unless requested.
- **Envelope:** Existing **`jsonOk` / `jsonError`** (`{ ok, data }` / `{ ok, error }`).
- **Pagination:** Query `limit` (cap e.g. 50), `cursor` or `offset` — recommend **offset** for MVP parity with admin list APIs.

### 3.2 Query resolution (doctors)

1. `WHERE providerStatus = ACTIVE` (+ optional `verifiedAt IS NOT NULL` if desired).
2. If `areaId`: `EXISTS` join on `DoctorProfileArea` where `areaId = :areaId` OR descendant areas (optional recursive CTE / “path under area” — **MVP:** exact `areaId` match first; document expansion as phase 2).
3. Filters: `acceptsEmergency`, `acceptsOnlineConsultation` map to boolean columns.
4. “Home visit”: apply heuristic from §2.2 when `homeVisit=true`.
5. “Animal type”: optional category / metadata filter per §2.2.
6. Select: display fields + primary area label (first prioritized `DoctorProfileArea` or denormalized string built from `Area.name` / `nameBn`).

### 3.3 Query resolution (technicians)

Same pattern against `AiTechnicianProfile` + `AiTechnicianProfileArea` / `AiTechnicianServiceArea`, `acceptsEmergency`, `serviceFeeBdt`, categories, `metadataJson` for coarse livestock tags.

### 3.4 Detail endpoints (optional)

- `GET .../doctors/[id]` and `GET .../technicians/[id]`: same auth; return extended bio, full area list, service categories; still **omit** phone and rating unless product approves.

---

## 4. Proposed mobile screen design

### 4.1 Entry points

- Wire **`HomeScreen`** menu: “ডাক্তার খুঁজুন” → `DoctorFinderScreen` (or shared shell with `kind: doctor`).
- “AI টেকনিশিয়ান খুঁজুন” → `TechnicianFinderScreen` (same pattern, `kind: technician`).

### 4.2 Screen layout (MVP)

1. **AppBar** with title + optional filter icon (sheet).
2. **Chips or dropdowns** for: area (needs **`GET` public or mobile areas** — if missing, use **text field for `areaId`** dev-only or add thin `GET /api/mobile/areas?parentId=` in a follow-up task), animal type (maps to category or disabled with tooltip), toggles: home visit / emergency / online (hide online for technicians).
3. **ListView** of **cards** (reuse `Card` from theme): photo placeholder, name, degree/cert line, area line, fee, availability text, row with **Call** / **Book** as `OutlinedButton` / `FilledButton` (placeholders: `onPressed: null` or snackbar “শীঘ্রই”).
4. **Empty / error** states consistent with animals feature (Bengali copy).

### 4.3 Architecture

- `features/providers/data/` — DTOs + `ProviderFinderRepository` (clone `_unwrap` pattern from `AnimalProfileRepository`).
- `features/providers/application/` — Riverpod `AsyncNotifier` for list + filters.
- **Routing:** add `GoRoute` paths under `/home` or push from home without new shell tab (keep 4 tabs unchanged).

---

## 5. API endpoint list

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | **`/api/mobile/providers/doctors`** | Paginated searchable list of active doctors for authenticated customer. |
| `GET` | **`/api/mobile/providers/technicians`** | Same for `AiTechnicianProfile`. |
| `GET` *(optional)* | **`/api/mobile/providers/doctors/[id]`** | Public-safe detail for one doctor profile id. |
| `GET` *(optional)* | **`/api/mobile/providers/technicians/[id]`** | Same for AI technician. |

---

## 6. Supported filters

| Filter | Doctors | Technicians | Notes |
|--------|---------|-------------|--------|
| **`areaId`** | Yes | Yes | Match `*ProfileArea` (MVP: exact). |
| **`villageId`** *(optional)* | Yes | Yes | Match `*ServiceArea` if product uses villages. |
| **`animalType`** | Optional / heuristic | Optional / heuristic | Map to categories or metadata; may be **soft** filter. |
| **`homeVisit`** | Heuristic | N/A (field visit implied) | See §2.2. |
| **`emergency`** | `acceptsEmergency === true` | Same | |
| **`onlineConsultation`** | `acceptsOnlineConsultation === true` | Always false in schema | API ignores or returns empty when true. |
| **`ratingMin` / sort by rating** | **Deferred** | **Deferred** | `Review` exists; **do not implement** aggregation in MVP. |
| **`q`** | Search `displayName`, `degree`, `specialization` | Search `displayName`, `certification`, `bio` | Optional text search. |

---

## 7. Response card fields (per item)

| Field | Source (doctor / tech) |
|-------|-------------------------|
| **`id`** | `DoctorProfile.id` / `AiTechnicianProfile.id` |
| **`name`** | `displayName` or fallback “ভেটেরিনারিয়ান” / “টেকনিশিয়ান” |
| **`degreeOrServiceType`** | `degree` + `specialization` (doctor) / `certification` + primary `ServiceCategory.name` (tech) |
| **`areaLabel`** | First prioritized linked `Area.name` or `nameBn`, else village name via join |
| **`feeBdt`** | `visitFeeBdt` / `serviceFeeBdt` as string (decimal) |
| **`availability`** | Placeholder string until scheduling model |
| **`actions`** | Metadata object: `{ "call": { "enabled": false, "reason": "placeholder" }, "book": { "enabled": false, "providerId", "kind": "doctor" \| "technician" } }` |

**Do not include** in MVP: raw phone, email, internal `userId`.

---

## 8. Backend implementation (delivered)

### 8.1 Auth and envelope

- All four routes use **`requireMobileCustomer`** (same as animals): `Authorization: Bearer <JWT>` with `role: CUSTOMER`, active user, existing `CustomerProfile`.
- Responses use **`jsonOk` / `jsonError`**: `{ "ok": true, "data": … }` or `{ "ok": false, "error": { "code", "message", "details?" } }`.

### 8.2 Final API route paths

| Method | Path |
|--------|------|
| `GET` | `/api/mobile/providers/doctors` |
| `GET` | `/api/mobile/providers/technicians` |
| `GET` | `/api/mobile/providers/doctors/[id]` |
| `GET` | `/api/mobile/providers/technicians/[id]` |

### 8.3 Query parameters (list endpoints)

| Param | Type | Notes |
|-------|------|--------|
| `areaId` | string | Active `Area.id`; matches **`DoctorProfileArea` / `AiTechnicianProfileArea`** where `areaId` is in the **subtree** (selected area + all active descendants). Mutually exclusive with `areaSlug`. |
| `areaSlug` | string | Active `Area.slug`; resolved to root id, then same subtree rule as `areaId`. |
| `animalType` | enum string | Prisma **`AnimalType`** (e.g. `CATTLE`, `DOG`). **Doctors:** filter by linked **`ServiceCategory.slug`** heuristics. **Technicians:** filter by `metadataJson` text match (safe pattern from enum only). **`OTHER`:** no technician metadata filter; doctor filter uses broad category slugs. |
| `homeVisit` | `true` \| `false` | **Doctors:** `true` = `visitFeeBdt` set OR linked slug `doctor-visit` / `livestock-health-check`; `false` = neither. **Technicians:** `true` = `serviceFeeBdt` set OR linked `ai-service`; `false` = neither. |
| `emergency` | `true` \| `false` | When `true`, `acceptsEmergency` must be true. |
| `onlineConsultation` | `true` \| `false` | **Doctors:** when `true`, `acceptsOnlineConsultation` must be true. **Technicians:** when `true`, list is **empty** (no schema field). |
| `serviceCategoryId` | string | CUID of `ServiceCategory`; provider must be linked via join table. |
| `limit` | number | Default **20**, max **50**. |
| `offset` | number | Default **0** (admin-style pagination). |
| `page` | number | 1-based; if set, **`offset` = (page − 1) × limit** (overrides explicit `offset` when both sent — `page` wins in parser order: prefer sending only one). |

**Implementation note:** If both **`page`** and **`offset`** are provided, **`page`** is applied last in code (`offset` is overwritten from `page`). Prefer a single style from the client.

### 8.4 List response shape

**Doctors** — `data`:

```json
{
  "doctors": [
    {
      "id": "…",
      "name": "…",
      "degreeOrQualification": "DVM · Large animals",
      "serviceType": "Doctor Visit",
      "areaText": "আশুলিয়া ইউনিয়ন",
      "fee": "1500.00",
      "availability": "সময়সূচি শীঘ্রই যুক্ত হবে — যোগাযোগের মাধ্যমে নিশ্চিত করুন",
      "homeVisit": true,
      "emergency": false,
      "onlineConsultation": false,
      "phone": null,
      "callAction": { "enabled": false, "phone": null, "reason": "phone_not_exposed_yet" },
      "bookAction": { "enabled": false, "providerId": "…", "kind": "doctor", "reason": "booking_flow_not_implemented" },
      "rating": null
    }
  ],
  "pagination": { "limit": 20, "offset": 0, "total": 1, "hasMore": false }
}
```

**Technicians** — `data`:

```json
{
  "technicians": [
    {
      "id": "…",
      "name": "…",
      "serviceType": "AI Service",
      "supportedAnimalTypes": ["cattle", "goat"],
      "areaText": "আশুলিয়া ইউনিয়ন",
      "fee": "1200.00",
      "availability": "সময়সূচি শীঘ্রই যুক্ত হবে — যোগাযোগের মাধ্যমে নিশ্চিত করুন",
      "homeVisit": true,
      "emergency": true,
      "onlineConsultation": false,
      "phone": null,
      "callAction": { "enabled": false, "phone": null, "reason": "phone_not_exposed_yet" },
      "bookAction": { "enabled": false, "providerId": "…", "kind": "technician", "reason": "booking_flow_not_implemented" },
      "rating": null
    }
  ],
  "pagination": { "limit": 20, "offset": 0, "total": 1, "hasMore": false }
}
```

### 8.5 Detail response shape

- **`GET …/doctors/[id]`** → `{ "doctor": { …list card fields…, "bio", "profilePhotoUrl", "experienceYears", "areas": [...], "villages": [...], "serviceCategories": [...] } }`  
  **`licenseNumber`** is **not** returned on mobile (avoid oversharing internal verification data).

- **`GET …/technicians/[id]`** → `{ "technician": { …list card fields…, "bio", "certification", "metadataJson", "areas", "villages", "serviceCategories" } }`

### 8.6 Example requests (curl)

Replace `BASE` and `TOKEN` (mint via `signMobileCustomerToken` in server/dev).

```bash
curl -sS -H "Authorization: Bearer TOKEN" \
  "BASE/api/mobile/providers/doctors?limit=10&offset=0"

curl -sS -H "Authorization: Bearer TOKEN" \
  "BASE/api/mobile/providers/doctors?areaSlug=ashulia-union-area&homeVisit=true"

curl -sS -H "Authorization: Bearer TOKEN" \
  "BASE/api/mobile/providers/technicians?animalType=CATTLE&emergency=true"

curl -sS -H "Authorization: Bearer TOKEN" \
  "BASE/api/mobile/providers/doctors/DOCTOR_PROFILE_ID"
```

### 8.7 Provider listing rules

- Only **`ProviderStatus.ACTIVE`** rows are returned.
- **`verifiedAt`** is **not** required for listing (only status); tighten later if product requires.

---

## 9. Implementation checklist

**Web backend**

- [x] `src/lib/mobile-providers/` — Zod schemas + Prisma list/detail + `requireMobileCustomer` routes.
- [x] `GET` list + `[id]` detail for doctors and technicians.
- [x] Area subtree expansion for `areaId` / `areaSlug`.
- [x] Demo seed: **`DoctorProfileArea`** + **`DoctorProfileServiceCategory`** (`doctor-visit`) for demo doctor so area and home-visit filters work locally.

**Still open**

- [ ] Optional: mention routes in **`docs/PRANI_DOCTOR_MASTER_ROADMAP.md`**.

---

## 10. Test checklist (web)

- [x] **`npm run lint`**
- [x] **`npm test`** (includes `src/lib/mobile-providers/schemas.test.ts` — **16** tests as of integration pass)
- [x] **`npm run build`**
- [x] **`npx prisma validate`** / **`npx prisma generate`**
- [ ] **Manual:** JWT + curl against running `next dev` with seeded DB

---

## 11. Risk / compatibility notes (updated)

- **Village-only coverage:** List **area** filter uses **`DoctorProfileArea` / `AiTechnicianProfileArea`** only (not `DoctorServiceArea` village rows). Providers with **only** village links will **not** match `areaId` / `areaSlug` until **`…ProfileArea`** rows exist. Demo doctor seed now adds **`DoctorProfileArea`** to **`ashulia-union-area`**.
- **Customer JWT:** Same as animals — shell login on mobile still needs a real token path for QA.
- **Technicians + `onlineConsultation=true`:** Returns an **empty list** (by design).
- **Rating:** **`rating` is always `null`** on list/detail until product approves aggregates.

---

## 12. Changed files (backend delivery)

| Path | Role |
|------|------|
| `src/lib/mobile-providers/schemas.ts` | Zod query schema for list endpoints |
| `src/lib/mobile-providers/schemas.test.ts` | Vitest coverage for query schema |
| `src/lib/mobile-providers/provider-service.ts` | Prisma queries, serialization, area subtree, technician metadata filter |
| `src/app/api/mobile/providers/doctors/route.ts` | `GET` list |
| `src/app/api/mobile/providers/doctors/[id]/route.ts` | `GET` detail |
| `src/app/api/mobile/providers/technicians/route.ts` | `GET` list |
| `src/app/api/mobile/providers/technicians/[id]/route.ts` | `GET` detail |
| `prisma/seed.ts` | Demo doctor: `DoctorProfileArea` + `doctor-visit` category link |
| `docs/PROVIDER_FINDER_PLAN.md` | This document |

---

## 13. Next task recommendation

**Customer mobile auth** (`POST /api/mobile/auth/login` or equivalent) + token persistence so provider and animal APIs work end-to-end without manual JWT. Then optional **`GET /api/mobile/areas`** for a real area picker.

---

## 14. Integration verification (cross-repo pass, 2026-05-09)

### 14.1 Backend behavior verified (code + automated tests)

| Topic | Result |
|-------|--------|
| **Query params** | `areaId`, `areaSlug` (mutually exclusive, 422 if both), `animalType` (case-insensitive, invalid → 422), `homeVisit` / `emergency` / `onlineConsultation` (`true`/`false` only), `serviceCategoryId` (**cuid** when present; malformed → 422), `limit` / `offset` / `page`. |
| **Missing filters** | Omitted params → no filter applied for that dimension. |
| **Empty results** | Valid query with no rows → empty `doctors` or `technicians` array, `pagination.total: 0`, `hasMore: false`. |
| **Technicians + `onlineConsultation=true`** | Empty list (no DB field). |
| **Response shape** | Shared fields: `id`, `name`, `areaText`, `fee`, `availability`, `homeVisit`, `emergency`, `onlineConsultation`, `phone: null`, `callAction`, `bookAction`, `rating: null`. Doctors add `degreeOrQualification`, `serviceType`; technicians add `serviceType`, `supportedAnimalTypes`. |
| **Privacy** | List/detail serializers do **not** attach `User.email`, `User.phone`, or `userId`; `phone` on card is always **`null`**; `licenseNumber` omitted on doctor detail. |

### 14.2 Mobile behavior verified (code + automated checks)

| Topic | Result |
|-------|--------|
| **Filter UI** | Dropdown `value` coerced to known area slug for display; repository strips unknown `areaSlug` before HTTP so requests stay valid. |
| **Call / Book** | SnackBar placeholders only; no booking or dialer integration. |
| **Navigation** | `HomeScreen` → list → detail via `go_router`; existing shell/tabs unchanged. |

### 14.3 Automated command results (this pass)

**Web (`pranidoctor-web`):** `npx prisma validate` OK · `npx prisma generate` OK · `npm run lint` OK · `npm test` (**16** passed) · `npm run build` OK.

**Mobile (`pranidoctor-mobile`):** `flutter pub get` OK · `flutter analyze` OK · `flutter test` OK · `flutter build apk --debug` OK.

### 14.4 Bugs fixed during this pass

| Repo | Fix |
|------|-----|
| **Web** | `animalType` query: **case-insensitive** (`cattle` → `CATTLE`). `areaId` / `serviceCategoryId`: **cuid** validation to avoid odd Prisma errors on garbage IDs. Vitest: mutual-exclusion test uses valid cuid; added tests for animalType + serviceCategoryId. |
| **Mobile** | **Dropdown safety:** unknown `areaSlug` no longer breaks `DropdownButton`; **repository** drops unknown slugs before API call. |

### 14.5 Files touched in integration pass

| Repo | Path |
|------|------|
| Web | `src/lib/mobile-providers/schemas.ts`, `src/lib/mobile-providers/schemas.test.ts` |
| Mobile | `lib/src/features/providers/data/provider_finder_repository.dart`, `lib/src/features/providers/presentation/widgets/provider_filter_panel.dart` |

---

## Document history

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | 2026-05-09 | Audit (Task 10) | Initial audit + plan only. |
| 1.1 | 2026-05-09 | Task 10 backend | Web APIs + seed + tests + doc update. |
| 1.2 | 2026-05-09 | Integration pass | Query hardening + cross-repo verification log. |
| 1.3 | 2026-05-09 | Task 10 completion | §0 final completion status + scoped changed-files note. |
