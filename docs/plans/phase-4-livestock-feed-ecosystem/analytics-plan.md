# Phase 4 — Analytics Plan

**Plan ID:** `PHASE_4_LIVESTOCK_FEED_ECOSYSTEM_MASTER_PLANNING_V1`  
**Status:** Planning only

---

## 1. Objectives

Provide farmers **actionable financial and operational insight** across livestock and feed:

- Feed expenses and trends
- Livestock-related expenses
- Monthly summaries
- Profit/loss (where income data exists)
- Cost per animal
- Feed efficiency (FCR, cost per liter milk, cost per kg gain)
- Charts and dashboard cards

**Privacy (admin):** aggregate anonymized stats only — see [admin-panel-plan.md](./admin-panel-plan.md).

---

## 2. Data Sources

| Metric domain | Primary tables | Existing API |
|---------------|----------------|--------------|
| Feed cost | `FeedRecord` | `/api/mobile/feeds/cost`, `/analytics` |
| Feed + inventory | `InventoryTransaction` RECEIPT | inventory module |
| Milk production | `MilkRecord` | `/api/mobile/milk/charts` |
| Finance | `FinanceRecord` | `/api/mobile/finance/*` |
| Weight / gain | `WeightRecord` | fattening APIs |
| Fattening ROI | `FatteningBatchRoi`, batch finance | `/fattening/batches/:id/roi` |
| Livestock count | `AnimalProfile` | livestock list |
| Health alerts | `VaccineRecord`, `HealthEvent` | vaccine/health APIs |

**New module:** `livestock-analytics` aggregates cross-domain — does not duplicate write paths.

---

## 3. Architecture

```
┌──────────────────────────────────────────────────────────┐
│              livestock-analytics module                   │
├──────────────────────────────────────────────────────────┤
│  FarmDashboardService                                     │
│  FeedCostAnalyticsService                                 │
│  FeedEfficiencyService                                    │
│  ProfitLossService                                        │
│  CostPerAnimalService                                     │
│  AnalyticsSnapshotJob (optional nightly)                  │
└──────────────────────────────────────────────────────────┘
         ▲ reads (no cross-module Prisma from routes)
         │
    feed, milk, finance, livestock, inventory modules
```

### Computation strategy

| Approach | When |
|----------|------|
| **On-demand query** | Dashboard default; date ranges ≤ 90 days |
| **Materialized snapshot** | Monthly rollups; admin platform stats |
| **Cached Redis** | Dashboard 5 min TTL per customer+farmRef |

---

## 4. Key Metrics Definitions

### 4.1 Feed expenses

```
feedCostBdt = SUM(FeedRecord.costBdt) + SUM(receipt costs linked to feed inventory)
```

If `costBdt` null on feed log, estimate using catalog `approxPriceBdt * amount`.

### 4.2 Livestock expenses

```
livestockExpenseBdt = SUM(FinanceRecord WHERE category IN (
  FEED, MEDICINE, VETERINARY, ANIMAL_PURCHASE, LABOR, TRANSPORT, OTHER_LIVESTOCK
))
```

Align with existing `ExpenseCategory` enum — extend if needed.

### 4.3 Monthly analytics

Per calendar month:

- Total feed cost
- Total milk liters (dairy)
- Feed cost per liter milk
- Active animal count (avg)
- Top 5 feeds by spend

### 4.4 Profit / loss

```
income = SUM(FinanceRecord.type=INCOME) + projected sale (fattening ROI optional)
expense = SUM(FinanceRecord.type=EXPENSE) + feed costs not double-counted
profit = income - expense
```

**Double-count guard:** If feed expense recorded in both `FeedRecord.costBdt` and `FinanceRecord` FEED, dedupe via `financeRecordId` link (Phase 4b) or user preference.

### 4.5 Cost per animal

```
costPerAnimal = totalExpenseBdt / activeAnimalCount
```

Optional breakdown by `animalType`.

Per-animal drill-down:

```
animalCost = SUM(feed for animal) + allocated share of farm expense (optional Phase 4c)
```

### 4.6 Feed efficiency

**Fattening FCR (Feed Conversion Ratio):**

```
FCR = totalFeedKg / totalWeightGainKg
```

**Dairy:**

```
feedCostPerLiter = feedCostBdt / milkLiters
```

**Poultry (future):**

```
FCR = feedKg / weightGainKg over broiler batch
```

---

## 5. API Endpoints

Base: `/api/mobile/analytics/livestock`

| Endpoint | Response |
|----------|----------|
| `GET /dashboard` | Summary cards |
| `GET /feed-cost` | Series + breakdown by feedType/catalog |
| `GET /feed-efficiency` | FCR, cost/L, benchmarks |
| `GET /cost-per-animal` | Table by animal |
| `GET /profit-loss` | P/L statement |
| `GET /charts/combined` | Multi-series for Flutter charts |

Query params: `farmRef`, `from`, `to`, `animalType`, `animalId`, `groupId`, `fatteningBatchId`

### Example dashboard DTO

```json
{
  "farmRef": "main",
  "period": { "from": "2026-05-01", "to": "2026-05-29" },
  "cards": {
    "activeAnimals": 11,
    "feedCostBdt": 12500,
    "milkLiters": 450.5,
    "feedCostPerLiter": 27.74,
    "totalExpenseBdt": 15700,
    "totalIncomeBdt": 22000,
    "netProfitBdt": 6300,
    "lowStockItems": 2,
    "vaccinesDue": 1
  },
  "charts": {
    "feedCostDaily": [{ "date": "2026-05-01", "value": 420 }],
    "milkDaily": [{ "date": "2026-05-01", "value": 15.5 }]
  }
}
```

---

## 6. Admin Analytics

`/api/admin/analytics/feed` and `/livestock`

| Metric | Aggregation |
|--------|-------------|
| Total feed records / month | COUNT |
| Catalog item adoption | COUNT inventory linked to catalogId |
| Animals registered by type | COUNT AnimalProfile |
| Avg feed logs per active user | |
| Top feeds nationally | anonymized GROUP BY feedType/catalog |

No customer PII in responses.

---

## 7. Flutter UI

### Screens

| Screen | Route | Widgets |
|--------|-------|---------|
| Farm dashboard | `/analytics` | Summary cards, period picker |
| Feed cost detail | `/analytics/feed` | Line chart, category pie |
| Feed efficiency | `/analytics/feed-efficiency` | FCR gauge, benchmarks |
| P/L | `/analytics/profit-loss` | Income/expense bars |
| Per animal | `/analytics/animals/:id` | Animal cost breakdown |

### Chart library

Use existing finance/milk chart patterns — keep consistent colors and BN axis labels.

### Period picker presets

- This week / this month / last month / custom range
- Bengali month names optional

---

## 8. Snapshot Table (optional optimization)

`FarmAnalyticsSnapshot` — see [database-schema-plan.md](./database-schema-plan.md)

Nightly job:

1. For each customer+farmRef with activity in last 30 days
2. Compute monthly metrics
3. Upsert snapshot row

Mobile reads snapshot for historical months; current month on-demand.

---

## 9. Benchmarks (Phase 4c)

Display contextual hints:

| Metric | Good benchmark (BD smallholder) |
|--------|--------------------------------|
| Feed cost/L milk | < 35 BDT |
| FCR fattening | 6–8 |
| Feed % of total expense | 50–70% |

Store benchmarks in config — not hardcoded in Flutter.

---

## 10. Events & Invalidation

| Event | Invalidate |
|-------|------------|
| feed-record.created/updated | feed analytics cache |
| finance record change | P/L cache |
| milk record change | efficiency cache |
| inventory receipt | feed cost (actual vs estimated) |

---

## 11. Related Documents

- [api-contracts.md](./api-contracts.md)
- [feed-engine-plan.md](./feed-engine-plan.md)
- [flutter-architecture.md](./flutter-architecture.md)
- [admin-panel-plan.md](./admin-panel-plan.md)
