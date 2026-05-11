# AI Technician — semen templates & inventory — manual QA

Use alongside [`AI_TECHNICIAN_API.md`](./AI_TECHNICIAN_API.md) (HTTP reference) and [`AI_TECHNICIAN_QA_CHECKLIST.md`](./AI_TECHNICIAN_QA_CHECKLIST.md) (core module).

**Prereqs:** Admin session for `/admin/*` and `/api/admin/*`; mobile JWT for `/api/mobile/ai-technician/*` as an **APPROVED** or **PUBLISHED** technician (catalog / from-template / inventory require `canManageTechnicianServices`).

---

## Admin — masters

- [ ] **Providers list** — `GET /api/admin/semen-providers` returns `{ total, providers[] }`; filters `q`, `isActive`, pagination behave.
- [ ] **Provider CRUD** — Create with valid `slug` / `name`; optional `logoUploadedFileId` rejects inactive file (`LOGO_FILE_NOT_FOUND`); duplicate slug returns **409** `DUPLICATE`.
- [ ] **Breeds list** — `GET /api/admin/livestock-breeds` with `animalType`, `q`, `isActive`.
- [ ] **Breed CRUD** — Create / patch; `slug` uniqueness enforced by DB.

---

## Admin — templates

- [ ] **List** — `GET /api/admin/semen-service-templates` with `q`, `animalType`, `semenProviderId`, `approvalStatus`, `isActive`.
- [ ] **Create** — Valid `breedMix` sums to **100**; mismatch returns validation / `BREED_MIX_SUM` on patch; wrong breed id → `BREED_NOT_FOUND`; breed `animalType` ≠ template → `BREED_ANIMAL_TYPE_MISMATCH`.
- [ ] **Offer XOR** — Both `defaultOfferPrice` and `defaultDiscountPercent` non-empty → **422** `OFFER_DISCOUNT_BOTH` (or Zod on create).
- [ ] **`OTHER` kind** — Missing `otherSemenLabel` fails validation.
- [ ] **Media** — At most one `COVER`; `VIDEO_URL` requires `externalUrl`; `VIDEO_UPLOAD` / `COVER` / `GALLERY` require `uploadedFileId` referencing an **ACTIVE** `UploadedFile` or `MEDIA_FILE_NOT_FOUND`.
- [ ] **Approve / reject** — `POST /api/admin/semen-service-templates/[id]/approve` with `requireAdminApiActor`: `APPROVE` succeeds; `REJECT` without `rejectedReason` fails; with reason persists `rejectedReason`.
- [ ] **Patch** — Partial updates preserve invariants (breed sum, offer XOR, provider exists).

---

## Mobile — catalog & service creation

- [ ] **Catalog** — `GET /api/mobile/ai-technician/semen-templates` only returns **APPROVED** + **active** templates; filters `providerId`, `breedId`, `animalType`; `limit` max 50; `{ total, templates[] }`.
- [ ] **Detail** — `GET …/semen-templates/[id]` 404 for draft / inactive / wrong id.
- [ ] **From template** — `POST …/services/from-template` with `templateId` only creates **DRAFT** service with `title` = template `internalName`, `breedOrSemenType` = mix label, `description` from short description; optional fees and `initialInventoryLot` create linked lot.
- [ ] **Duplicate** — Second `POST` same `templateId` for same technician → **409** `DUPLICATE_TEMPLATE_SERVICE`.
- [ ] **Offer XOR** — Body with both `offerPrice` and `discountPercent` → **422** (`OFFER_DISCOUNT_BOTH` or Zod).
- [ ] **Profile gate** — Non-approved technician → **403** `NOT_ALLOWED` on catalog / from-template / inventory (where applicable).

---

## Mobile — services & inventory

- [ ] **GET services** — Template-backed row includes `semenServiceTemplateId`, `semenTemplateLocked`, `stockSummary`, `offerPrice`, `discountPercent`.
- [ ] **PATCH template-backed** — Can update allowed fields only; cannot change locked copy; **REJECTED** service → `NOT_EDITABLE`.
- [ ] **Inventory GET** — `GET …/services/[id]/semen-inventory` returns `{ lots }` for template-backed service; non-template → `NOT_SEMEN_SERVICE`.
- [ ] **Inventory POST** — Creates lot; `reservedQuantity > currentQuantity` → `INVALID_STOCK`.
- [ ] **Inventory PATCH** — `PATCH …/semen-inventory/[lotId]` updates subset / `isActive` (smoke via API client if UI absent).

---

## Public farmer — listings

- [ ] **Technician list** — Each `serviceListings[]` item includes `stockSummary`, `semenServiceTemplateId`, `semenTemplateLocked` when applicable; strings for money fields.
- [ ] **Visibility** — Only **ACTIVE** + `isAvailable: true` services appear in public list/detail queries (existing AI services rules).

---

## Regression (do not break)

- [ ] AI technician **application** flow (`apply`, `documents`, `submit`) unchanged.
- [ ] **Manual** (non-template) service create / patch / delete still behaves for **DRAFT** services.
- [ ] Farmer **booking** and technician **job** lifecycle unchanged for non-semen jobs.
