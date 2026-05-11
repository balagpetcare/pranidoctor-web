# Prani Doctor — Customer Animal Profile (Task Card 09)

Plan for letting **customers** create and manage **animal profiles** via mobile APIs. Scope: [Prani Doctor](https://pranidoctor.com/) only — no reuse of other projects’ naming, schema, or flows.

---

## 1. Current repository status (audit)

### 1.1 Database / Prisma

| Item | Status |
|------|--------|
| `AnimalProfile` model | **Present** in `prisma/schema.prisma` |
| Relation to customer | **`customerId` → `CustomerProfile`** (`onDelete: Cascade`) |
| Prisma client | Generated under `src/generated/prisma/` |
| Migrations | Follow team practice (`docs/DATABASE_SCHEMA_PLAN.md` notes migration baseline risks) |

### 1.2 API — mobile

| Route | Status |
|-------|--------|
| `GET /api/mobile/health` | **Implemented** — DB ping, `{ scope: "mobile", database: "up" }` |
| `GET/POST /api/mobile/animals` | **Not implemented** |
| `GET/PATCH /api/mobile/animals/[id]` | **Not implemented** |
| Deactivate endpoint | **Not implemented** |

### 1.3 API — admin (reference only)

- Extensive **`/api/admin/...`** routes exist (doctors, AI technicians, areas, auth, etc.).
- Admin APIs use **`requireAdminPanelApiAccess()`** (`src/lib/admin-auth/api-guard.ts`) and **HTTP-only session cookie** (`getAdminSession()` reading `ADMIN_SESSION_COOKIE`).
- **No** `/api/admin/animals` routes were found in the tree at audit time; admin “Animals” UI may still be a placeholder.

### 1.4 Authentication — relevant facts

| Mechanism | Purpose | Animal APIs |
|-----------|-----------|-------------|
| Admin JWT + cookie | Admin panel + `/api/admin/*` | **Must not** be used as proof of access for customer animal CRUD |
| Mobile customer auth | Customer Bearer JWT (planned / future) | **Required** before production use of animal endpoints |
| `src/middleware.ts` | Protects **`/admin` HTML** only | Does **not** run on `/api/mobile/*` |

**Gap:** There is **no** implemented mobile customer login/session issuance in this repo at audit time (aligned with `docs/PRANI_DOCTOR_MASTER_ROADMAP.md`: mobile auth beyond health is missing). Animal routes must still be designed so **only `UserRole.CUSTOMER`** sessions can access them, and every query scopes by **`customerProfile.id`** derived from the authenticated user.

### 1.5 Application code touching `AnimalProfile`

- **No** hand-written `src/` usage surfaced besides Prisma-generated types (no dedicated animal service module yet).
- Downstream models **`ServiceRequest`**, **`TreatmentCase`**, **`Prescription`** reference `AnimalProfile` (`animalId`, `onDelete: Restrict` on service requests — **blocks hard delete** if requests exist).

### 1.6 Mobile app (`pranidoctor_mobile`)

- **Dio** + **`Authorization: Bearer <token>`** (`lib/src/core/network/dio_provider.dart`).
- **`ApiClient`** wrapper (`lib/src/core/network/api_client.dart`) — thin GET/POST; no animal models or routes yet.
- **Session** (`session_notifier.dart`) — role enum + token storage; **no** real auth API wired.
- **`docs/MOBILE_APP_FOUNDATION_PLAN.md`** describes foundation; animal management screens are **out of scope** of that card.

---

## 2. Prisma `AnimalProfile` — current fields vs product fields

### 2.1 Current fields (`prisma/schema.prisma`)

| Field | Type | Notes |
|-------|------|--------|
| `id` | `String` (cuid) | Primary key |
| `customerId` | `String` | FK → `CustomerProfile` |
| `name` | `String` | Display name |
| `species` | `String` | **Required** free-text (e.g. legacy / display) |
| `breed` | `String?` | Optional |
| `category` | `AnimalCategory` | `PET` \| `LIVESTOCK` \| `OTHER` (default `OTHER`) |
| `animalType` | `AnimalType?` | `CATTLE` \| `GOAT` \| `POULTRY` \| `DOG` \| `CAT` \| `OTHER` |
| `weightKg` | `Decimal?` | Optional |
| `dateOfBirth` | `DateTime?` | Optional |
| `sex` | `String?` | Free-text — overlaps semantically with `gender` |
| `gender` | `Gender?` | `MALE` \| `FEMALE` \| `UNKNOWN` \| `OTHER` |
| `microchipOrTag` | `String?` | Identifier / tag |
| `notes` | `String?` | Optional |
| `active` | `Boolean` | Default `true` — **use for soft deactivate** |
| `createdAt` / `updatedAt` | `DateTime` | Standard |

Enums already exist: `AnimalCategory`, `AnimalType`, `Gender`.

### 2.2 Gaps vs Task Card 09 field list

| Required concept | In schema today? | Proposal |
|------------------|------------------|----------|
| Animal type | **Yes** — `animalType` + `category`; also redundant **`species`** string | API: prefer **`animalType`** + **`category`**; keep **`species`** for backward compatibility or map from type until clients migrate |
| Name / tag | **Yes** — `name`, `microchipOrTag` | Expose both; document “tag” = `microchipOrTag` |
| Breed | **Yes** | — |
| Age / DOB | **DOB yes**; no “age” column | API: return **`dateOfBirth`** + computed **`ageYears`** / **`ageMonths`** (optional) in JSON only |
| Sex | **Partial** — `sex` string + `gender` enum | Validation plan: **pick one canonical field** for API (recommend **`gender`** enum); optionally sync or deprecate `sex` |
| Pregnancy status | **No** | Add **`pregnancyStatus`** (nullable enum or boolean + unknown) **or** store under **`notes`** short-term — prefer schema enum when product needs filters |
| Notes | **Yes** | — |
| Photo placeholder | **No** | Add **`photoUrl`** `String?` (nullable URL placeholder until upload pipeline exists) |
| Active / inactive | **Yes** — `active` | Use for list filters + deactivate |

### 2.3 Referential integrity note

- **`ServiceRequest.animal`**: `onDelete: Restrict` — **do not** rely on hard `DELETE` for animals that have requests; use **`active: false`** (and optionally hide inactive in pickers).

---

## 3. Required API endpoints (contract sketch)

All routes under **`/api/mobile/animals`**; all responses use the existing envelope: **`{ ok: true, data: T }`** or **`{ ok: false, error: { code, message, details? } }`** (`src/lib/api-response.ts`, `src/types/api.ts`).

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/mobile/animals` | List current customer’s animals (see query flags below) |
| `POST` | `/api/mobile/animals` | Create animal for authenticated customer |
| `GET` | `/api/mobile/animals/[id]` | Single animal **if owned** by customer |
| `PATCH` | `/api/mobile/animals/[id]` | Partial update **if owned** |
| `PATCH` | `/api/mobile/animals/[id]/deactivate` **or** `DELETE` | Set **`active: false`** (recommended **PATCH** for explicit soft-delete semantics) |

Optional query for `GET` list: **`includeInactive=true`** (default `false`) so retired animals stay recoverable.

---

## 4. Authentication and authorization

### 4.1 Rules

1. **Authenticated customer only** — resolve `User` → **`CustomerProfile`** (`userId` unique on `CustomerProfile`).
2. **Ownership** — every `find`/`update` must include **`where: { id, customerId }`** with the profile id from the session.
3. **Reject non-customer tokens** — if JWT/`sub` is **`ADMIN`**, **`DOCTOR`**, **`AI_TECHNICIAN`**, etc., return **403** (or **401** if using a single “wrong audience” policy — be consistent across mobile routes).
4. **Admin panel cookie** — must **not** grant access to `/api/mobile/animals` (different auth stack).
5. **Doctors/admins** must not mutate customer animals **via these routes** — enforced by **role check**, not only by absence of UI.

### 4.2 Implementation direction (no code in this doc)

- Introduce **`getMobileCustomerSession()`** (Bearer JWT): verify signature, **`role === CUSTOMER`**, **`status === ACTIVE`**, load **`customerProfile`** by `userId`.
- Separate JWT secret vs admin (**e.g.** `MOBILE_JWT_SECRET` or namespaced claims) vs reusing **`AUTH_SECRET`** with distinct `aud` — document in `.env.example` when implemented.

---

## 5. Field plan (request/response mapping)

### 5.1 Create (`POST`) / Update (`PATCH`) body

| Logical field | Map to DB | Validation notes |
|---------------|-----------|------------------|
| Type | `animalType`, `category` | Enum strings; require **`animalType`** or **`category`** policy (choose minimal required set — e.g. `animalType` required, `category` default `OTHER`) |
| Name | `name` | Trim; length bounds (e.g. 1–120) |
| Tag | `microchipOrTag` | Optional; max length |
| Breed | `breed` | Optional |
| Date of birth | `dateOfBirth` | ISO 8601 date; not future |
| Sex | Prefer `gender` enum | If both sent, reject or define precedence |
| Pregnancy | New field or notes | If female + livestock — optional enum when schema added |
| Notes | `notes` | Max length (e.g. 2–5k) |
| Photo | `photoUrl` | Optional URL string until upload API exists |
| Weight | `weightKg` | Optional; positive decimal |

### 5.2 List/detail response (`AnimalDto`)

Suggested stable JSON shape (camelCase):

```json
{
  "id": "clx...",
  "customerId": "clx...",
  "name": "Lalu",
  "species": "..." ,
  "category": "LIVESTOCK",
  "animalType": "GOAT",
  "breed": "...",
  "weightKg": "12.500",
  "dateOfBirth": "2023-04-01T00:00:00.000Z",
  "ageYears": 2,
  "sex": null,
  "gender": "MALE",
  "microchipOrTag": "BD-123",
  "notes": null,
  "photoUrl": null,
  "pregnancyStatus": null,
  "active": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

- **`weightKg`**: serialize `Decimal` as string for JSON precision.
- **`ageYears`** / **`ageMonths`**: computed in handler, not stored.
- **`pregnancyStatus`**: `null` until schema migration lands.

---

## 6. Validation plan

- **Library:** `zod` (matches existing admin routes).
- **Shared schemas:** `createAnimalBodySchema`, `patchAnimalBodySchema`, `listAnimalsQuerySchema` in e.g. `src/lib/mobile-animals/schemas.ts`.
- **Rules:**
  - Reject unknown enum values with **422** + `flatten()`.
  - Enforce string max lengths to limit abuse.
  - **PATCH:** partial updates only; omit means “leave unchanged”.
  - **Deactivate:** idempotent — setting `active: false` twice is OK.

---

## 7. Deactivate endpoint behavior

- **Preferred:** `PATCH /api/mobile/animals/[id]/deactivate` with optional body `{ "reason": "..." }` (reason stored only if schema extended — otherwise ignore).
- **Implementation:** `update({ where: { id, customerId }, data: { active: false } })`.
- **Avoid:** `DELETE` as hard delete — conflicts with **`ServiceRequest`** FK restrict.

---

## 8. Mobile app integration plan

1. **After mobile auth API exists:** store access token; existing Dio interceptor attaches Bearer.
2. **Models:** Dart classes mirroring `AnimalDto`; parse `weightKg` as `String` or `num`.
3. **Screens (incremental):** list → detail → create/edit → deactivate confirmation.
4. **Offline / errors:** surface `error.code` from API envelope for localized BN copy.
5. **Environment:** `API_BASE_URL` via `--dart-define` (already in foundation doc).

---

## 9. Test / build / lint plan (web)

| Step | Command / action |
|------|------------------|
| Lint | `npm run lint` |
| Unit tests | `npm run test` (Vitest — extend with `src/lib/mobile-animals/*.test.ts` for schemas/session helpers) |
| Build | `npm run build` |
| Prisma | After schema changes: `npx prisma migrate dev` (or team-approved workflow) + `npm run db:generate` |
| Manual | Authenticated customer calls via HTTP client; verify admin cookie cannot access mobile routes |

---

## 10. Risks and compatibility

| Risk | Mitigation |
|------|------------|
| No mobile JWT yet | Implement **customer auth** first or feature-flag animal routes in staging |
| `species` required in DB | On **POST**, default **`species`** from `animalType`/`category` label if client omits — until migration makes `species` optional |
| **`sex` vs `gender`** duplication | API docs: single source of truth; optional DB cleanup later |
| **Hard delete** | Never expose `DELETE` that removes rows if requests reference animal |
| **Decimal serialization** | Use string in JSON for `weightKg` |
| **Admin accidentally using mobile API** | Role guard + separate base path + integration test |

---

## 11. Final implementation checklist

- [x] Add **`photoUrl`** (and **`pregnancyStatus`** if product requires filtering) to `AnimalProfile` + migrate.
- [x] Implement **mobile customer JWT** verification helper and **`requireMobileCustomer()`** guard.
- [x] Add **`src/lib/mobile-animals/`** — schemas, service (`list/create/get/update/deactivate`).
- [x] Implement route handlers: `animals/route.ts`, `animals/[id]/route.ts`, `animals/[id]/deactivate/route.ts`.
- [x] Ensure **Prisma queries always filter** `customerId` from session.
- [x] **403/401** for wrong role; **404** for wrong id (avoid id enumeration — optional: 404 if not owner).
- [ ] Update **`docs/PRANI_DOCTOR_MASTER_ROADMAP.md`** or API index when endpoints ship.
- [x] Mobile: API models + screens + deactivate flow (**`pranidoctor-mobile`** — see mobile repo / plan).
- [x] Vitest for zod schemas + guard helpers; run **lint**, **test**, **build**.

---

## 12. Document history

| Date | Change |
|------|--------|
| 2026-05-09 | Initial audit and plan (Task Card 09) |
| 2026-05-09 | §13 implementation adjustment (backend) |
| 2026-05-09 | §14 verification report (backend/API) |

---

## 13. Implementation adjustment (2026-05-09)

The repo did **not** yet expose a mobile customer login endpoint at implementation time. Customer animal APIs use **`Authorization: Bearer <JWT>`** verified by **`src/lib/mobile-auth/`** (`audience: "mobile"`, claim `role: "CUSTOMER"`), with **`MOBILE_JWT_SECRET`** or **`AUTH_SECRET`** (min 32 chars). Tokens can be issued via **`signMobileCustomerToken`** from server-side code or a future **`POST /api/mobile/auth/...`** route.

Schema additions applied for this card: **`photoUrl`** (`String?`), **`pregnancyStatus`** (`PregnancyStatus` enum), migration `20260508212430_animal_photo_pregnancy_status`.

List endpoint supports **`?includeInactive=true`**; default excludes inactive animals. Ordering: **`active` descending** (active first), then **`createdAt` descending**.

---

## 14. Verification Report (2026-05-09) — Backend / API final check

### What passed

| Area | Result |
|------|--------|
| **Prisma schema** | `AnimalProfile` includes `customerId`, enums (`AnimalType`, `AnimalCategory`, `Gender`, `PregnancyStatus`), `photoUrl`, `active`, relations + `@@index([customerId])`. `ServiceRequest.animal` remains **`onDelete: Restrict`** — aligns with soft deactivate (no hard delete API). |
| **Migrations / generate** | Migration folders present through **`20260508212430_animal_photo_pregnancy_status`**. `npx prisma generate` completed successfully (Prisma 7.8.0 → `src/generated/prisma`). |
| **Ownership security** | All animal queries use **`customerProfileId`** from **`requireMobileCustomer`** — never from request body. Create sets **`customerId`** only from session context. |
| **Mobile auth** | **`requireMobileCustomer`**: Bearer JWT, **`verifyMobileJwt`** (`aud: mobile`, `role: CUSTOMER`), DB check **`UserRole.CUSTOMER`**, **`UserStatus.ACTIVE`**, **`customerProfile`** exists. Admin cookie session does not apply. |
| **Endpoints** | **`GET/POST /api/mobile/animals`**, **`GET/PATCH /api/mobile/animals/[id]`**, **`PATCH /api/mobile/animals/[id]/deactivate`** implemented; deactivate uses soft **`active: false`** only. |
| **Client body safety** | **`createAnimalBodySchema`** / **`patchAnimalBodySchema`** use **`.strict()`** — unknown keys (e.g. `customerId`, `userId`) rejected at validation. |
| **Response shape** | **`jsonOk({ animals })`**, **`jsonOk({ animal })`** — matches **`ApiSuccess<T>`** and mobile client parsing (`data.animals`, `data.animal`). **`AnimalJsonDto`** includes camelCase fields + **`weightKg`** as string + computed **`ageYears`/`ageMonths`**. |
| **Demo data** | No seeded or hard-coded animal rows in route handlers; data is DB-backed only. |
| **TypeScript / tooling** | **`npm run build`** completed (TS check passed). **`npm run lint`** passed. **`npm test`** (Vitest): **9** tests in **3** files passed. |

### What failed

- **None** in this verification run.

### What was fixed during verification

- **Nothing** — audit was read-only; **no code changes** were required for issues found.

### Remaining TODOs (product / ops)

| Item | Notes |
|------|--------|
| **Customer login API** | **`POST /api/mobile/auth/login`** (or equivalent) to issue **`signMobileCustomerToken`** — animals routes remain unusable from mobile without a stored Bearer token. |
| **Roadmap / API index** | Optional: mention **`/api/mobile/animals`** in **`docs/PRANI_DOCTOR_MASTER_ROADMAP.md`**. |
| **Route integration tests** | Optional Vitest/HTTP tests for **`/api/mobile/animals`** (currently schema/unit coverage only). |

### Mobile compatibility notes

- **Envelope:** `{ ok: true, data: { … } }` — mobile must unwrap **`data`** (Flutter repo already does).
- **`customerId` in JSON:** Returned **read-only** for transparency; **`patchAnimalBodySchema`** does **not** allow `customerId` — ownership cannot be reassigned via API.
- **Deactivate:** **`PATCH …/deactivate`** — mobile should prefer this over relying solely on **`PATCH …/[id]`** with `active: false` (both exist; dedicated endpoint matches product wording).
- **401/403:** Mobile should treat **`UNAUTHORIZED`** / **`FORBIDDEN`** and redirect or clear tokens when login exists.

### Commands run (summary)

| Command | Exit | Summary |
|---------|------|---------|
| `npm run lint` | **0** | ESLint clean |
| `npm run build` | **0** | Next.js production build + TypeScript OK |
| `npx prisma generate` | **0** | Client regenerated |
| `npm test` | **0** | Vitest **9** passed |

**Warning (existing):** Next.js build notes **`middleware` → `proxy`** deprecation — not introduced by animal APIs.


