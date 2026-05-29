# Phase 4: Livestock Feed Ecosystem — System Overview

**Plan ID:** `PHASE_4_LIVESTOCK_FEED_ECOSYSTEM_MASTER_PLANNING_V1`  
**Version:** 1.1.0  
**Date:** 2026-05-29  
**Status:** Planning only — no implementation

---

## Executive Summary

Phase 4 delivers a **complete livestock and feed ecosystem** for Bangladesh livestock farmers inside the existing Prani Doctor platform. The goal is not a greenfield rewrite: it **extends and unifies** modules that already exist in partial form across three repos (`pranidoctor_user`, `pranidoctor-backend`, `pranidoctor-web`).

This document is the entry point. Detailed design lives in sibling files:

| Document | Scope |
|----------|-------|
| [backend-architecture.md](./backend-architecture.md) | Module boundaries, folder structure, service responsibilities |
| [flutter-architecture.md](./flutter-architecture.md) | Feature layout, Riverpod, offline, navigation |
| [database-schema-plan.md](./database-schema-plan.md) | Prisma evolution, migrations, entity map |
| [api-contracts.md](./api-contracts.md) | Mobile + admin endpoint catalog, DTOs |
| [admin-panel-plan.md](./admin-panel-plan.md) | Admin CRUD, seed, vendor, analytics UI |
| [feed-engine-plan.md](./feed-engine-plan.md) | Master catalog, inventory, recommendation engine |
| [livestock-health-plan.md](./livestock-health-plan.md) | Animals, health, vaccine, timeline |
| [analytics-plan.md](./analytics-plan.md) | Finance, feed efficiency, P/L |
| [multilingual-plan.md](./multilingual-plan.md) | BN-first UX, glossary, API i18n |
| [implementation-roadmap.md](./implementation-roadmap.md) | Phased delivery, migration strategy |
| [testing-checklist.md](./testing-checklist.md) | QA matrix per module |

---

## Current-State Architecture Audit (2026-05-29)

### What already exists

| Capability | Backend | Web proxy | Flutter | Maturity |
|------------|---------|-----------|---------|----------|
| Animal CRUD (`AnimalProfile`) | `legacy/web/routes/mobile/animals/*` | Yes | `features/animals/` | **Production** — list, CRUD, photo, offline |
| Farm context (profile-derived) | `profile/farm-context`, `/me` | Yes | `features/farm/` | **Partial** — single farm per customer |
| Milk records | `/api/mobile/milk/*` | Yes | `features/milk/` | **Production** |
| Feed consumption logs | `/api/mobile/feeds/*` | Yes | `features/feed/` | **Production** — optional inventory deduct |
| Feed master catalog | `FeedCatalog` + admin routes | `admin/feed-catalog` | `features/feed_catalog/` | **Production** — seed data, multi-select |
| Farm inventory (feed + medicine) | `src/modules/inventory/` | `/api/mobile/inventory/*` | `features/inventory/` | **Production** — stock engine, ledger |
| Fattening batches | `/api/mobile/fattening/*` | Yes | `features/fattening/` | **Production** — weight, ROI, qurbani |
| Finance | `/api/mobile/finance/*` | Yes | `features/finance/` | **Production** |
| Health events | `/api/mobile/health/*` | Yes | `features/health/` | **Production** |
| Vaccines | `/api/mobile/vaccines/*` | Yes | `features/vaccine/` | **Production** |
| Breed master | `LivestockBreed` (semen use) | `admin/livestock-breeds` | Static `animal_breeds.dart` | **Partial** — not wired to animal form |
| Auth / location / doctor / emergency | Core modules | Yes | Core features | **Production** |
| Multilingual | Auth i18n catalog | — | Custom JSON l10n (`assets/i18n/`) | **Production** — BN + EN |

### Gaps vs Phase 4 target

| Gap | Current | Target |
|-----|---------|--------|
| Dedicated `Livestock` model | `AnimalProfile` only | Evolve `AnimalProfile` + optional `LivestockExtension` — **do not duplicate** |
| Species coverage | `AnimalType`: CATTLE, GOAT, POULTRY, DOG, CAT, OTHER | Add SHEEP, DUCK, PIGEON; poultry sub-types |
| Farm entity | Profile `villageId` composite | Optional `FarmUnit` table for multi-farm (Phase 4b) |
| QR / ear tag | `microchipOrTag` string | QR generation + scan deep-link |
| Multi-image gallery | Single `photoUrl` | `AnimalMedia` join table |
| Feed nutrition engine | `nutritionJson` on catalog only | Rule-based recommendation module |
| Feed suitability matrix | Not modeled | `FeedCatalogSuitability` + restrictions |
| Seasonal feed | Not modeled | `FeedSeasonality` on catalog |
| Unit conversion | Fixed enums | Conversion service (kg ↔ mon ↔ seer ↔ bag) |
| Supplier / vendor | Not modeled | `FeedVendor` + marketplace prep |
| Expiry tracking | Not on inventory | `InventoryLot` with expiry |
| Wastage | ADJUSTMENT only | Explicit `WASTAGE` movement type |
| Livestock API scaffold | Web `lib/livestock/*` references **non-existent** Prisma `Livestock` model | **Remove or align** to `AnimalProfile` evolution |
| Analytics dashboard | Per-module charts | Unified livestock + feed analytics hub |
| Admin feed analytics | Partial | Full dashboard |

### Critical architectural decision

**Evolve `AnimalProfile` as the livestock registry** rather than introducing a parallel `Livestock` table (web scaffold is planning-only and must not drive schema). New fields and related tables attach to `AnimalProfile`. See [database-schema-plan.md](./database-schema-plan.md).

---

## Business Context

### Target users

- **Smallholder farmers** (1–5 animals): simple onboarding, Bengali labels, offline drafts
- **Medium farms** (5–50): inventory, daily feed logs, cost visibility
- **Commercial / fattening**: batch ROI, weight ADG, feed efficiency
- **Cooperatives** (future): shared inventory, bulk purchase

### Bangladesh-specific requirements

- Local breeds (Red Chittagong, Black Bengal, Sahiwal crosses)
- Seasonal scarcity (monsoon roughage, winter concentrate shift)
- Local feed terms: *kura*, *bhushi*, *khari*, *oil cake*, *bran*
- Units: kg, mon (40 kg), seer, bag (vendor-specific weight)
- Bengali-first UI; English for admin and export
- Rural offline: cache livestock + inventory; queue feed logs

---

## Target System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 PHASE 4 — LIVESTOCK FEED ECOSYSTEM (TARGET)                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────────────────────────────┐     ┌──────────┐
│ Flutter App  │────▶│  API Layer (Express + Next proxies)   │────▶│ Postgres │
│ BN-first UX  │     │  /api/mobile/*  /api/admin/*          │     │ Prisma   │
└──────────────┘     └──────────────────────────────────────┘     └──────────┘
        │                              │
        │         ┌────────────────────┼────────────────────┐
        │         ▼                    ▼                    ▼
        │   ┌───────────┐      ┌─────────────┐      ┌──────────────┐
        │   │ livestock │      │ feed +      │      │ analytics +  │
        │   │  module   │      │ inventory   │      │ finance      │
        │   └───────────┘      └─────────────┘      └──────────────┘
        │         │                    │                    │
        │         └──────────┬─────────┴──────────┬─────────┘
        │                    ▼                    ▼
        │            ┌──────────────┐      ┌──────────────┐
        │            │ feed-engine  │      │ vendors      │
        │            │ (recommend)  │      │ (marketplace │
        │            └──────────────┘      │  prep)       │
        │                                  └──────────────┘
        ▼
┌──────────────┐
│ Offline      │  LocalCache + Outbox + SyncCoordinator (existing)
│ sync layer   │
└──────────────┘
```

---

## Module Breakdown (Target)

### 1. Livestock Management
- Registry: species, breed, gender, age, weight, pregnancy, purpose, health status
- Identity: ear tag, QR code
- Grouping: farm ref, pen/batch (fattening integration)
- Media: profile + gallery
- Timeline: unified animal history (feed, milk, health, vaccine, weight, finance)

### 2. Feed Master System
- Platform catalog (`FeedCatalog`) with BN/EN names, category, nutrition, price reference
- Suitability by animal type + life stage
- Seasonal flags and restrictions (toxic / limit feeds)
- Bangladesh seed (~100+ items) — extend existing seed

### 3. Feed Inventory
- Per-farm stock (`InventoryItem` + `InventoryBalance` + ledger)
- Purchase receipts, consumption (linked to `FeedRecord`), wastage, expiry lots
- Unit conversion at movement time
- Low-stock alerts → notification module

### 4. Feed Recommendation Engine
- Rule-based V1 (no ML dependency)
- Inputs: animal type, age, weight, milk yield, pregnancy, disease flags, season
- Outputs: daily ration suggestion, nutrition estimate, cost estimate

### 5. Expense & Analytics
- Aggregate `FinanceRecord`, `FeedRecord`, milk, fattening ROI
- Feed efficiency (FCR), cost per animal, cost per liter
- Monthly summaries and charts

### 6. Marketplace Preparation
- Vendor + product catalog models (no checkout in Phase 4)
- Price comparison hooks, location-based vendor list

### 7. Admin Panel
- Feed catalog CRUD (exists — extend nutrition/suitability)
- Category management, seed runner, vendor admin, analytics, approval workflow

### 8. Flutter App
- Livestock hub (evolve animals feature)
- Feed + inventory flows (exists — unify navigation)
- Analytics dashboard tab
- Offline drafts, image upload, search/filter

---

## Integration with Existing Systems

| Existing module | Integration |
|-----------------|-------------|
| **Auth / users** | `customerId` scopes all livestock data |
| **Location / area** | `farmRef` + `villageId` on profile; future `FarmUnit` |
| **Doctor / emergency** | `ServiceRequest` + `TreatmentCase` → health timeline |
| **AI veterinary** | Recommendation context + safety disclaimers |
| **Notifications** | Low stock, vaccine due, feed reminder |
| **Media / uploads** | Animal images via existing upload service |
| **Offline architecture** | Reuse outbox kinds pattern per entity |

---

## Non-Functional Requirements

| Area | Target |
|------|--------|
| API list latency | < 500 ms p95 |
| Analytics | < 2 s (pre-aggregated snapshots where needed) |
| Recommendation | < 3 s (cached rules) |
| Pagination | Default 20, max 100 |
| Audit | Admin + inventory movements logged |
| Migrations | Additive only; no destructive drops in production |
| Roles | CUSTOMER (mobile), ADMIN/SUPER_ADMIN (panel) |

---

## Risk Summary

| Risk | Mitigation |
|------|------------|
| Duplicate livestock models (`AnimalProfile` vs scaffold `Livestock`) | Single evolution path; deprecate web scaffold |
| FeedRecord vs Inventory drift | Stock engine as single writer; idempotent consumption |
| Monolithic service creep | Enforce module folders + no cross-repo imports |
| BN translation drift | Glossary + CI key audit (see multilingual-plan) |
| Offline conflict on inventory | Idempotency keys + last-write-wins on metadata only |

Full risk matrix: [implementation-roadmap.md](./implementation-roadmap.md#risk-analysis).

---

## Success Metrics

- ≥ 5 livestock records per active farmer (90-day)
- Daily feed log rate ≥ 40% of active users
- Feed cost visibility (finance + feed linked) ≥ 60% of inventory users
- API error rate < 0.1%; sync success > 99%

---

**Next step:** Read [implementation-roadmap.md](./implementation-roadmap.md) for phased delivery order.
