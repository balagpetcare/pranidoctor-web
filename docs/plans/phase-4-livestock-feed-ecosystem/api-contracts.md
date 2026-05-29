# Phase 4 — API Contracts

**Plan ID:** `PHASE_4_LIVESTOCK_FEED_ECOSYSTEM_MASTER_PLANNING_V1`  
**Status:** Planning only  
**Base:** `/api/mobile/*` (customer JWT), `/api/admin/*` (admin session)

---

## 1. Conventions

| Item | Rule |
|------|------|
| Casing | camelCase JSON |
| Dates | `YYYY-MM-DD` business dates; ISO-8601 datetimes for timestamps |
| Money | BDT decimal, 2 places (`amountBdt`, `costBdt`) |
| Quantities | Decimal max 3 places |
| Pagination | `page` (1-based), `limit` (default 20, max 100) |
| Farm scope | `farmRef` required on farm-scoped resources |
| Errors | `{ "ok": false, "error": { "code", "message", "details?" } }` |
| Success | `{ "ok": true, "data": ... }` or paginated `{ items, total, page, limit, hasMore }` |
| Idempotency | Header `Idempotency-Key` on POST movements + offline sync |

### Standard error codes

| Code | HTTP |
|------|------|
| `VALIDATION_ERROR` | 400 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `CONFLICT` | 409 |
| `INSUFFICIENT_STOCK` | 409 |
| `RATE_LIMITED` | 429 |

---

## 2. Livestock API

> **Note:** Evolves existing `/api/mobile/animals/*`. New paths alias old during transition.

### 2.1 List livestock

`GET /api/mobile/livestock`

| Query | Type | Description |
|-------|------|-------------|
| `farmRef` | string? | Filter by farm |
| `animalType` | enum? | CATTLE, GOAT, SHEEP, ... |
| `status` | enum? | ACTIVE, SOLD, DECEASED, ... |
| `purpose` | enum? | DAIRY, MEAT, ... |
| `gender` | enum? | |
| `groupId` | string? | |
| `breedId` | string? | |
| `healthStatus` | enum? | |
| `search` | string? | name, ear tag |
| `includeInactive` | bool | default false |
| `page`, `limit` | int | |
| `sortBy` | string | createdAt, name, updatedAt |
| `sortOrder` | asc/desc | |

**Response:** `Paginated<LivestockDto>`

### 2.2 Create livestock

`POST /api/mobile/livestock`

**Body:** `CreateLivestockDto`

```json
{
  "name": "লালু",
  "animalType": "CATTLE",
  "breedId": "clx...",
  "gender": "FEMALE",
  "purpose": "DAIRY",
  "farmRef": "farm-main",
  "groupId": null,
  "dateOfBirth": "2022-03-15",
  "weightKg": 350.5,
  "earTagNumber": "BD-2024-001",
  "pregnancyStatus": "NOT_PREGNANT",
  "healthStatus": "HEALTHY",
  "purchaseDate": null,
  "purchasePriceBdt": null,
  "notes": "",
  "photoUrl": "https://..."
}
```

### 2.3 Get / update / deactivate

| Method | Path | Body |
|--------|------|------|
| `GET` | `/api/mobile/livestock/:id` | — |
| `PATCH` | `/api/mobile/livestock/:id` | `UpdateLivestockDto` |
| `PATCH` | `/api/mobile/livestock/:id/deactivate` | `{ "reason"?: string }` |

**Legacy alias:** `/api/mobile/animals/:id` — same handlers.

### 2.4 Media

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/mobile/livestock/:id/media` | Gallery list |
| `POST` | `/api/mobile/livestock/:id/media` | Add image `{ url, caption? }` |
| `DELETE` | `/api/mobile/livestock/:id/media/:mediaId` | Remove |

### 2.5 Timeline

`GET /api/mobile/livestock/:id/timeline`

| Query | Description |
|-------|-------------|
| `from`, `to` | Date range |
| `types` | comma-separated: feed,milk,health,vaccine,weight,finance,event |
| `page`, `limit` | |

**Response item:**

```json
{
  "id": "...",
  "type": "feed",
  "occurredAt": "2026-05-28",
  "titleBn": "খাবার রেকর্ড",
  "summary": "12 kg concentrate",
  "refId": "feed-record-id",
  "metadata": {}
}
```

### 2.6 QR

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/mobile/livestock/:id/qr` | `{ payload, deepLink }` |
| `GET` | `/api/mobile/livestock/lookup?tag=:earTag` | Resolve by ear tag |

### 2.7 Groups

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/mobile/livestock/groups?farmRef=` | List groups |
| `POST` | `/api/mobile/livestock/groups` | Create |
| `PATCH` | `/api/mobile/livestock/groups/:id` | Update |
| `DELETE` | `/api/mobile/livestock/groups/:id` | Soft delete |

### 2.8 Breeds (read-only mobile)

`GET /api/mobile/livestock/breeds?animalType=CATTLE`

**Response:** `{ items: LivestockBreedDto[] }`

---

## 3. Feed Master (Catalog) API

### Mobile read

`GET /api/mobile/feed-catalog`

| Query | Description |
|-------|-------------|
| `category` | ROUGHAGE, CONCENTRATE, ... |
| `animalType` | Filter suitability |
| `search` | nameBn, nameEn, code |
| `page`, `limit` | |

**Dto:** `FeedCatalogItemDto`

```json
{
  "id": "...",
  "code": "bd-mustard-oilcake",
  "nameBn": "সরিষার খৈল",
  "nameEn": "Mustard oil cake",
  "category": "CONCENTRATE",
  "defaultUnit": "KG",
  "approxPriceBdt": 42.0,
  "nutrition": { "cpPercent": 38, "tdnPercent": 75 },
  "moistureType": "DRY",
  "isSeasonal": false,
  "restrictions": { "toxic": false, "maxPercentDaily": 30 }
}
```

---

## 4. Feed Records API (existing — extended)

Base: `/api/mobile/feeds`

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/feeds` | + `feedCatalogId`, `inventoryItemId` filters |
| `POST` | `/feeds` | + `feedCatalogId`, `deductStock`, `inventoryItemId` |
| `GET` | `/feeds/:id` | |
| `PATCH` | `/feeds/:id` | |
| `DELETE` | `/feeds/:id` | |
| `GET` | `/feeds/cost` | Daily/weekly/monthly |
| `GET` | `/feeds/analytics` | Trends, per-animal |

**Create body extension:**

```json
{
  "animalId": "...",
  "farmRef": "...",
  "feedType": "CONCENTRATE",
  "feedCatalogId": "...",
  "inventoryItemId": "...",
  "deductStock": true,
  "amount": 5.5,
  "unit": "KG",
  "costBdt": 230,
  "recordedDate": "2026-05-29",
  "notes": ""
}
```

---

## 5. Inventory API (existing — extended)

Base: `/api/mobile/inventory`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/inventory` | Summary |
| `GET` | `/inventory/feed` | Feed items list |
| `GET` | `/inventory/medicine` | Medicine list |
| `POST` | `/inventory/add` | Receipt / create item |
| `POST` | `/inventory/consume` | Manual consumption |
| `POST` | `/inventory/wastage` | **NEW** — wastage movement |
| `GET` | `/inventory/feed/:id` | Detail + movements |
| `GET` | `/inventory/feed/:id/lots` | **NEW** — lots with expiry |
| `GET` | `/inventory/suppliers?farmRef=` | **NEW** |
| `POST` | `/inventory/suppliers` | **NEW** |

**Wastage body:**

```json
{
  "farmRef": "...",
  "inventoryItemId": "...",
  "quantity": 2.5,
  "unit": "KG",
  "reason": "SPOILAGE",
  "recordedDate": "2026-05-29",
  "notes": ""
}
```

---

## 6. Feed Recommendation API

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/mobile/recommendations/daily?animalId=&date=` | Daily ration |
| `POST` | `/api/mobile/recommendations/preview` | What-if without save |
| `POST` | `/api/mobile/recommendations/accept` | Save `FeedRationPlan` |
| `GET` | `/api/mobile/recommendations/history?animalId=` | Past plans |

**Daily ration response:**

```json
{
  "animalId": "...",
  "planDate": "2026-05-29",
  "ruleVersion": "bd-cattle-dairy-v1",
  "items": [
    {
      "feedCatalogId": "...",
      "nameBn": "ভুসি",
      "amountKg": 2.0,
      "costBdt": 80,
      "nutritionContribution": { "cpG": 180, "tdnMcal": 1.2 }
    }
  ],
  "totals": {
    "dryMatterKg": 8.5,
    "cpPercent": 16.2,
    "estimatedCostBdt": 320
  },
  "warnings": ["Monsoon: increase dry roughage"],
  "disclaimerBn": "..."
}
```

---

## 7. Analytics API

Base: `/api/mobile/analytics/livestock`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/dashboard?farmRef=&from=&to=` | Summary cards |
| `GET` | `/feed-efficiency?farmRef=&from=&to=` | FCR, cost/kg gain |
| `GET` | `/cost-per-animal?farmRef=&from=&to=` | |
| `GET` | `/profit-loss?farmRef=&from=&to=` | Income vs expense |
| `GET` | `/charts/feed-cost?period=monthly` | Chart series |

**Dashboard response:**

```json
{
  "farmRef": "...",
  "period": { "from": "2026-05-01", "to": "2026-05-29" },
  "animalCount": { "total": 12, "active": 11, "byType": { "CATTLE": 5, "GOAT": 4 } },
  "milkLiters": 450.5,
  "feedCostBdt": 12500,
  "otherExpenseBdt": 3200,
  "lowStockCount": 2,
  "vaccineDueCount": 1
}
```

---

## 8. Vendors API (read-only mobile V1)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/mobile/vendors?districtId=&search=` | List verified vendors |
| `GET` | `/api/mobile/vendors/:id` | Detail + products |
| `GET` | `/api/mobile/vendors/:id/products` | Product catalog |

---

## 9. Admin API

### 9.1 Feed catalog (exists — extend)

Base: `/api/admin/feed-catalog`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | List + filter |
| `POST` | `/` | Create |
| `GET` | `/:id` | Detail |
| `PATCH` | `/:id` | Update incl. nutrition, suitability |
| `POST` | `/seed/run` | Trigger seed job |
| `GET` | `/seed/status` | Last seed report |

### 9.2 Feed categories

Categories are enum — admin UI maps to enum values. Optional future `FeedCategoryMeta` table for BN labels.

`GET /api/admin/feed-categories` — returns enum + display labels.

### 9.3 Livestock breeds

| Method | Path | Description |
|--------|------|-------------|
| `GET/POST` | `/api/admin/livestock-breeds` | CRUD |
| `PATCH` | `/api/admin/livestock-breeds/:id` | |

### 9.4 Vendors

| Method | Path | Description |
|--------|------|-------------|
| `GET/POST` | `/api/admin/vendors` | |
| `PATCH` | `/api/admin/vendors/:id` | Verify/reject |
| `GET/POST` | `/api/admin/vendors/:id/products` | |

### 9.5 Analytics (admin aggregate)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/admin/analytics/livestock` | Platform stats |
| `GET` | `/api/admin/analytics/feed` | Catalog usage, top feeds |

---

## 10. DTO Structure Summary

### LivestockDto

```typescript
interface LivestockDto {
  id: string;
  customerId: string;
  farmRef: string | null;
  name: string;
  animalType: AnimalType;
  customSpeciesLabel: string | null;
  breedId: string | null;
  breedNameBn: string | null;
  gender: Gender;
  purpose: LivestockPurpose | null;
  lifecycleStatus: LivestockStatus | null;
  healthStatus: LivestockHealthStatus | null;
  dateOfBirth: string | null;
  ageMonths: number | null;
  weightKg: number | null;
  lastWeightAt: string | null;
  earTagNumber: string | null;
  qrCodePayload: string | null;
  pregnancyStatus: PregnancyStatus | null;
  lactationNumber: number | null;
  photoUrl: string | null;
  groupId: string | null;
  groupName: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Shared pagination

```typescript
interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

---

## 11. Web Proxy Mapping

Each mobile route has mirror under `pranidoctor-web/src/app/api/mobile/**` forwarding to backend or calling shared services during migration.

Admin routes: `pranidoctor-web/src/app/api/admin/**`

---

## 12. Related Documents

- [backend-architecture.md](./backend-architecture.md)
- [database-schema-plan.md](./database-schema-plan.md)
- Existing: `pranidoctor_user/docs/plans/farm_inventory/05-api-contract.md`
