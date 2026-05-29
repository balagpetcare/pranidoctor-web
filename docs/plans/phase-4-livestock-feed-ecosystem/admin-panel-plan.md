# Phase 4 — Admin Panel Plan

**Plan ID:** `PHASE_4_LIVESTOCK_FEED_ECOSYSTEM_MASTER_PLANNING_V1`  
**Status:** Planning only  
**Stack:** Next.js App Router (`pranidoctor-web`), Bengali-first admin UI

---

## 1. Current Admin State

| Area | Path | Status |
|------|------|--------|
| Feed catalog list/create/edit | `/admin/feed-catalog` | **Implemented** — `FeedCatalogList`, `FeedCatalogForm` |
| Feed items (legacy) | `/admin/feed-items` | Parallel — consolidate into catalog |
| Livestock breeds | `/admin/livestock-breeds` | Partial — API exists |
| Feed analytics | `/api/admin/analytics/feed` | Scaffold |
| Livestock analytics | `/api/admin/analytics/livestock` | Scaffold |
| Admin nav | `admin-nav.tsx` | Feed catalog linked |

---

## 2. Target Admin IA

```
Admin Dashboard
├── খাবার মাস্টার (Feed Master)
│   ├── ক্যাটালগ (Feed Catalog)          ← primary
│   ├── ক্যাটাগরি (Categories)           ← enum meta UI
│   ├── সিড ম্যানেজমেন্ট (Seed)          ← run/report
│   └── পুষ্টি ও উপযুক্ততা (Nutrition)   ← bulk edit
├── পশু জাত (Livestock Breeds)
├── ভেন্ডর (Vendors)                     ← new
│   ├── ভেন্ডর তালিকা
│   ├── পণ্য ক্যাটালগ
│   └── যাচাইকরণ (Approval)
├── বিশ্লেষণ (Analytics)
│   ├── খাবার ব্যবহার
│   ├── পশু পরিসংখ্যান
│   └── প্ল্যাটফর্ম সারাংশ
└── (existing) Users, Doctors, Semen, ...
```

---

## 3. Feed Catalog CRUD (extend existing)

### List page enhancements

| Feature | Detail |
|---------|--------|
| Filters | category, isActive, isSeeded, search (BN/EN/code) |
| Columns | code, nameBn, category, unit, price, seasonal, active |
| Bulk actions | Activate/deactivate selected |
| Export | CSV of catalog for review |

### Form enhancements

| Field group | Fields |
|-------------|--------|
| Identity | code (immutable after create), nameBn, nameEn |
| Classification | category, defaultUnit, moistureType |
| Pricing | approxPriceBdt, price history link |
| Nutrition | CP%, TDN%, Ca, P, fiber — structured form → `nutritionJson` |
| Suitability | animal types multi-select, age range, purpose |
| Seasonal | isSeasonal, seasonNotesBn/En |
| Restrictions | toxic flag, max daily %, contraindications |
| Meta | sortOrder, isActive |

### Validation

- Zod schema shared with backend (`src/shared/feed-catalog/schemas.ts`)
- code slug: `bd-[a-z0-9-]+`
- nameBn required; nameEn required

---

## 4. Category CRUD

Categories are **enum values** — admin UI is a **meta editor**, not a dynamic table.

**Component:** `FeedCategoryMetaList`

| Column | Source |
|--------|--------|
| Enum value | ROUGHAGE, GREEN, ... |
| Label BN | i18n map |
| Label EN | i18n map |
| Description BN | editable copy |
| Icon | optional |

`GET/PATCH /api/admin/feed-categories` — stores overrides in `Setting` key `feedCategoryMeta` or dedicated table if needed later.

---

## 5. Seed Management

### UI: `/admin/feed-catalog/seed`

| Action | Behavior |
|--------|----------|
| Preview diff | Compare DB vs seed file counts |
| Run seed | POST `/api/admin/feed-catalog/seed/run` |
| View report | Last run: created, updated, skipped, errors |
| Environment | Show `FEED_CATALOG_PRICE_MULTIPLIER` read-only |

### Seed source

- `pranidoctor-backend/prisma/seeds/feed_catalog.seed.ts`
- Asset mirror: `pranidoctor_user/assets/seeds/feed_catalog.json` (Flutter offline bootstrap — optional)

### Approval workflow for seed changes

1. Admin edits seed file in repo (dev process)
2. Staging seed run → review report
3. Production seed run with SUPER_ADMIN role

---

## 6. Vendor Management

### Pages

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin/vendors` | `VendorList` | Search, filter by district, verification status |
| `/admin/vendors/new` | `VendorForm` | Create vendor |
| `/admin/vendors/[id]` | `VendorDetail` | Profile + products tab |
| `/admin/vendors/[id]/products/new` | `VendorProductForm` | Link to FeedCatalog or custom name |

### Vendor form fields

- name, nameBn, phone, district (area picker), address, notes
- verificationStatus: PENDING → VERIFIED / REJECTED
- isActive

### Approval system

| Status | Who | Actions |
|--------|-----|---------|
| PENDING | New vendor | Await admin |
| VERIFIED | ADMIN | Visible on mobile |
| REJECTED | ADMIN | Hidden; reason stored |

**Audit:** log status transitions with admin user id + timestamp.

### Product catalog

- Link optional `feedCatalogId`
- displayName, unit, unitWeightKg
- Price history table with effective dates

---

## 7. Analytics Dashboard

### Feed analytics (`/admin/analytics/feed`)

| Widget | Data |
|--------|------|
| Top catalog items by linked inventory count | aggregate query |
| Feed category distribution | chart |
| Seeded vs custom catalog ratio | |
| Regional price variance | future |

**Component:** extend `FeedAnalyticsDashboard.tsx`

### Livestock analytics (`/admin/analytics/livestock`)

| Widget | Data |
|--------|------|
| Animals by type (platform aggregate) | anonymized counts |
| Active farmers with livestock | |
| Avg animals per farmer | |
| Milk + feed module adoption | |

**Privacy:** no PII, no individual farm names — counts only.

---

## 8. Livestock Breeds Admin

Extend existing `/admin/livestock-breeds`:

| Field | Detail |
|-------|--------|
| slug | unique |
| nameEn, nameBn | |
| animalType | |
| description | optional |
| isActive | |

Mobile read-only API consumes same data.

---

## 9. Component Structure

```
src/components/admin/
├── feed-catalog/          # EXISTS
│   ├── FeedCatalogList.tsx
│   ├── FeedCatalogForm.tsx
│   ├── FeedCatalogSeedPanel.tsx    # NEW
│   └── feed-catalog-options.ts
├── feed/
│   ├── FeedAnalyticsDashboard.tsx
│   └── FeedCategoryMetaList.tsx    # NEW
├── livestock/
│   ├── LivestockBreedList.tsx
│   └── LivestockBreedForm.tsx
├── vendors/                          # NEW
│   ├── VendorList.tsx
│   ├── VendorForm.tsx
│   ├── VendorProductList.tsx
│   └── VendorApprovalBadge.tsx
└── analytics/
    └── LivestockAnalyticsDashboard.tsx  # NEW
```

---

## 10. API Routes (Web)

```
src/app/api/admin/
├── feed-catalog/           # EXISTS
├── feed-catalog/seed/run   # NEW
├── feed-categories/        # EXISTS — extend PATCH
├── livestock-breeds/       # EXISTS
├── vendors/                # NEW
├── vendors/[id]/
├── vendors/[id]/products/
└── analytics/
    ├── feed/               # EXISTS
    └── livestock/          # EXISTS — implement queries
```

Backend: mirror in `pranidoctor-backend/src/legacy/web/routes/admin/` or new module controllers.

---

## 11. Role Permissions

| Action | ADMIN | SUPER_ADMIN |
|--------|-------|-------------|
| View catalog | ✓ | ✓ |
| Edit catalog | ✓ | ✓ |
| Run seed (prod) | — | ✓ |
| Verify vendor | ✓ | ✓ |
| View aggregate analytics | ✓ | ✓ |
| Export platform data | — | ✓ |

Use existing `requireAdmin` + role check middleware.

---

## 12. UX Notes

- Admin UI lang="bn" on feed sections (existing pattern)
- Confirm dialogs for seed run and vendor verification
- Toast on save; inline field errors from Zod
- Loading/error empty states via `AdminLoadingState`, `AdminErrorState`, `AdminEmptyState`

---

## 13. Related Documents

- [api-contracts.md](./api-contracts.md)
- [feed-engine-plan.md](./feed-engine-plan.md)
- [analytics-plan.md](./analytics-plan.md)
