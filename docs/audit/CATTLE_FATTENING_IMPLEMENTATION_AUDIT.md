# Cattle Fattening Implementation Audit

**Audit date:** 2026-05-23  
**Scope:** `pranidoctor_user` (Flutter), `pranidoctor-web` (Next.js), `pranidoctor-backend` (Express + Prisma)  
**Mode:** Read-only inspection — no code changes  
**Git branches checked:** All repos on `main` only (`pranidoctor-web` also has remote `feature/demo-dummy-seeder`; no local fattening branch)

---

# Executive Summary

The **Cattle Fattening / Cow Fattening System** described in product docs (`FatteningManagementPage`, `FatteningBatch`, `WeightRecord`, Qurbani batch dashboards, growth projections, market readiness, ROI) is **not implemented as a dedicated module**. What exists today is a **farm operations foundation** (animals, feed, milk, finance, local-only batches, composite farm profile) that partially overlaps fattening workflows but does not deliver fattening-specific UX, data models, or APIs.

| Layer | Fattening-specific | Adjacent / reusable |
|-------|-------------------|---------------------|
| Documentation & UX specs | ✅ Detailed (Phase 2+) | — |
| Database (`FatteningBatch`, `WeightRecord`, `SaleRecord`) | ❌ Not in schema | `FeedRecord`, `FinanceRecord`, `AnimalProfile.weightKg` |
| Backend API | ❌ No `/fattening`, `/batches`, `/weight` routes | `/api/mobile/feeds/*`, `/finance/*`, `/animals/*` |
| Flutter UI | ❌ No fattening/growth screens or routes | Feed, finance, batches (local), farm, animals |
| Web admin / farmer UI | ❌ None | Admin livestock breeds (semen), mobile API proxies |
| Seed data | ❌ No fattening batches or weight history | Cattle animals with `weightKg`, finance, farm catalog in `Setting` |

**Overall Completion: 18%**

Breakdown: ~0% dedicated fattening module + ~35% reusable farm stack weighted by fattening relevance ≈ **18%** of the documented fattening target (dashboard, batch lifecycle, weight history, growth/ROI, Qurbani planning, market readiness, recommendations).

**Evidence anchor:** Planned fattening is explicitly deferred in `docs/PHASE0_FINAL_REVIEW.md` (Phase 2+). ERD lists `FatteningBatch` / `WeightRecord` under **FUTURE DOMAIN PLACEHOLDERS** (`docs/database/ERD.md` §15). Zero code matches for `FatteningBatch`, `FatteningAnimal`, `WeightRecord`, `fattening`, `qurbani`, `market readiness`, or `growth tracking` in application source (only docs + unused l10n keys).

---

# Existing Modules

| Feature Name | Exact File Paths | Backend Endpoints | DB Tables / Entities | Flutter Screens | Shared Services | Status | Completion % | Missing Pieces | Reuse Opportunity |
|--------------|------------------|-------------------|----------------------|-----------------|-----------------|--------|--------------|----------------|-------------------|
| **Fattening Management (planned)** | Docs: `docs/uiux/APP_FLOW.md` §11, `docs/uiux/SCREEN_HIERARCHY.md`, `docs/architecture/SYSTEM_ARCHITECTURE.md` §21.1 | None | None (`FatteningBatch`, `FatteningAnimal`, `WeightRecord`, `SaleRecord` — doc-only) | None (planned route `/farmer/farm/fattening` not in `lib/routing/app_router.dart`) | None | **NOT_STARTED** | 0% | Entire module: dashboard, batch progress, weight timeline, Qurbani target dates, sale/ROI panel | — |
| **Fattening drawer labels (unused)** | `pranidoctor_user/lib/l10n/app_en.arb`, `app_localizations.dart`, `app_localizations_en.dart` (`drawerFatteningSection`, `drawerGrowthRecords`) | — | — | Not wired in `lib/features/home/presentation/widgets/drawer_menu.dart` | — | **NOT_STARTED** | 5% | Navigation targets, screens, backend | l10n keys ready |
| **Animal profile + static weight** | Flutter: `lib/features/animals/presentation/animal_form_page.dart`, `animal_detail_page.dart`, `lib/features/animals/data/animal_dto.dart` · Backend: `src/legacy/web/lib/mobile-animals/animal-service.ts`, `schemas.ts`, `animal-mapper.ts` | `GET/POST/PATCH /api/mobile/animals`, `GET/PATCH /api/mobile/animals/:id` | `AnimalProfile.weightKg` (`prisma/schema.prisma`) | `/animals`, `/animals/create`, `/animals/:id`, `/animals/:id/edit` | `AnimalRepository`, mobile animal mapper | **PARTIAL** | 25% | Weight **history**, growth curve, target weight, ADG, body-condition | Single current-weight field is starting point for fattening animals |
| **Feed management** | Flutter: `lib/features/feed/**` · Backend: `src/legacy/web/lib/mobile-feeds/**`, `routes/mobile/feeds/**` · Web proxy: `pranidoctor-web/src/app/api/mobile/feeds/**` · Migration: `prisma/migrations/20260522140000_phase4_feed_records/` | `GET/POST /api/mobile/feeds`, `GET/PATCH/DELETE /api/mobile/feeds/:id`, `GET /api/mobile/feeds/cost`, `GET /api/mobile/feeds/analytics` | `FeedRecord`, enums `FeedType`, `FeedUnit` | `/feeds`, `/feeds/create`, `/feeds/cost`, `/feeds/analytics` | `FeedRepository`, `feed-service.ts` analytics (`costPerKg`, `costPerAnimal`) | **MOSTLY_DONE** | 85% | Ration planner, feeding schedule, fattening-specific recommendations; `batchId` is free-text (no `Batch` FK) | Core input for feed-cost side of fattening ROI |
| **Finance / profit** | Flutter: `lib/features/finance/**` · Backend: `src/legacy/web/lib/mobile-finance/**`, `routes/mobile/finance/**` · Web: `src/app/api/mobile/finance/**` · Migration: `20260522160000_phase4_finance_records/` | `GET/POST /api/mobile/finance/expenses`, `.../income`, `GET /finance/profit`, `.../charts`, `.../reports` | `FinanceRecord`, `ExpenseCategory`, `IncomeSource` (`ANIMAL_SALES`, `FEED`, etc.) | `/finance`, `/finance/expenses`, `/finance/income`, `/finance/profit`, `/finance/reports` | `FinanceRepository`, `profitForCustomer()` | **MOSTLY_DONE** | 75% | Per-animal/per-batch purchase price, projected sale, fattening ROI dashboard; no `SaleRecord` entity | Expense/income/profit powers “total cost vs estimated sale” from APP_FLOW §11 |
| **Groups / batches (local-first)** | Flutter: `lib/features/batches/**` · Report: `pranidoctor_user/docs/USER_APP_08_BATCH_REPORT.md` | **None** — `BatchApiPaths` expects `/api/mobile/batches` but no backend routes exist | None — `FeedRecord.batchId` / `batchName` only (no `Batch` table) | `/batches`, `/batches/create`, `/batches/:id` | Hive cache, outbox (`batch_create`, `batch_move`, `batch_merge`) | **PARTIAL** | 40% | Server persistence, fattening batch metadata (start/target date, Qurbani season, target weight) | Closest UI analog to `FatteningBatch`; extend rather than replace |
| **Farm profile (composite)** | Flutter: `lib/features/farm/**` · Report: `docs/USER_APP_06_FARM_REPORT.md` | Composite: `GET /api/mobile/profile/dashboard-context`, `GET/PATCH /api/mobile/me`, `POST /api/mobile/uploads/cover-image`, `GET /api/mobile/animals` | No `FarmProfile` table; `farmRef` string on `FeedRecord`, `MilkRecord`, `FinanceRecord`, `HealthEvent`, `VaccineRecord`, `FarmTreatment` | `/farms`, `/farms/create`, `/farms/:id` | `FarmRepository` | **PARTIAL** | 35% | Multi-farm CRUD, farm type (`dairy` / `fattening`) per `docs/PHASE2_DB_MAP.md` P2-10 | Farm drawer section hosts feed/milk/batch entry points |
| **Milk management (dairy, not fattening)** | Flutter: `lib/features/milk/**` · Backend: `src/legacy/web/lib/mobile-milk/**` · Migration: `20260522120000_phase4_milk_records/` | `/api/mobile/milk/*` | `MilkRecord` | `/milk`, `/milk/summary`, `/milk/charts` | `MilkRepository` | **COMPLETE** (for dairy scope) | N/A for fattening | Not applicable to fattening bulls/steers | Shared chart widgets (`MilkSimpleBarChart` reused in feed/finance) |
| **Health records** | Flutter: `lib/features/health/**` · Backend: `routes/mobile/health/**` · Migration: `20260522170000_phase5_health_vaccine_treatment/` | `/api/mobile/health/history`, `/health/timeline`, etc. | `HealthEvent`, `FarmTreatment` | `/health`, `/health/history`, `/health/analytics` | Health repository + timeline | **MOSTLY_DONE** | 70% | Fattening **health score** algorithm; animal detail shows placeholder (`animalHealthScorePlaceholder`: "Coming soon") | Health timeline for fattening cattle |
| **Vaccine schedule & reminders** | Flutter: `lib/features/vaccine/**` · Backend: `routes/mobile/vaccines/**`, `vaccines/reminders` | `/api/mobile/vaccines/*` | `VaccineRecord` | `/vaccines`, `/vaccines/schedule`, `/vaccines/reminders` | Vaccine providers | **MOSTLY_DONE** | 65% | Fattening-specific reminders (weigh-in, market date) | Reminder/schedule UX pattern |
| **Treatment / farm treatment** | Flutter: `lib/features/treatment/**` · Backend: `routes/mobile/treatments/**` | `/api/mobile/treatments/*` | `FarmTreatment` | `/treatments/*` | Treatment repository | **PARTIAL** | 55% | Medicine cost rollup into fattening ROI | Treatment cost line in APP_FLOW fattening dashboard |
| **Livestock breeds (admin reference)** | Web: `src/components/admin/semen/LivestockBreedsList.tsx` · Backend: `routes/admin/livestock-breeds/**` | `/api/admin/livestock-breeds` | `LivestockBreed` | None (admin web only) | Admin semen services | **COMPLETE** (admin scope) | 20% for fattening | Breed-specific ADG/target weight tables | Breed master for growth benchmarks |
| **Cattle in seeds** | `scripts/seed/user_app_seed.ts`, `src/modules/dev/seeds/animal.seed.ts`, `prisma/seed-demo.ts` | — | `AnimalProfile` with `animalType: CATTLE`, `weightKg` helper | — | Seed helpers | **PARTIAL** | 30% | `FeedRecord` / weight history / fattening batch seed scenarios | Demo cattle with weights for QA |

---

# Missing Modules

| Module (from product docs) | Planned In | Status | Priority for Fattening |
|----------------------------|------------|--------|------------------------|
| Fattening dashboard (Qurbani batch progress, cattle list, weight progress bars) | `docs/uiux/APP_FLOW.md` §11.1 | **NOT_STARTED** | P0 |
| `FatteningBatch` entity + API | `docs/architecture/SYSTEM_ARCHITECTURE.md`, `docs/database/ERD.md` | **NOT_STARTED** | P0 |
| `WeightRecord` + growth tracking timeline | Same + APP_FLOW weight UI | **NOT_STARTED** | P0 |
| Weight calculator / estimate weight | Search: no matches in codebase | **NOT_STARTED** | P1 |
| Growth projections / ADG | SYSTEM_ARCHITECTURE “Growth projections” | **NOT_STARTED** | P1 |
| `FatteningAnimal` extension (initial weight, target weight, purchase cost) | SYSTEM_ARCHITECTURE | **NOT_STARTED** | P0 |
| `SaleRecord` + sale planning | SYSTEM_ARCHITECTURE | **NOT_STARTED** | P1 |
| Market readiness score | No matches | **NOT_STARTED** | P2 |
| Qurbani / Korbani / Eid season batch naming & targets | APP_FLOW mock (“কুরবানি ২০২৬”) | **NOT_STARTED** (docs only) | P1 |
| Fattening ROI dashboard (purchase + feed + treatment vs estimated sale) | APP_FLOW §11 cost panel | **NOT_STARTED** as unified view; pieces in finance + feed | P0 |
| AI / rule-based feed & sale recommendations | No fattening recommendation code | **NOT_STARTED** | P2 |
| `/api/mobile/batches` backend | Flutter expects it; `USER_APP_08_BATCH_REPORT.md` confirms missing | **NOT_STARTED** | P0 |
| `/api/mobile/farms` dedicated CRUD | `USER_APP_06_FARM_REPORT.md`, `PHASE2_DB_MAP.md` | **NOT_STARTED** | P1 |
| Web farmer fattening pages | `SCREEN_HIERARCHY.md` `/farmer/farm/fattening` | **NOT_STARTED** | P2 (mobile-first today) |
| Feed / milk seed data in `user_app_seed.ts` | Inspected seed script | **NOT_STARTED** | P1 for demo |
| Feature flags for fattening rollout | `infra.flags.ts` — no farm/fattening flags | **NOT_STARTED** | P2 |

---

# Reusable Components

| Component | Location | Fattening Use |
|-----------|----------|---------------|
| Feed CRUD + cost/analytics | `lib/features/feed/**`, `mobile-feeds/feed-service.ts` | Feed cost section of fattening dashboard; `efficiency.costPerKg` |
| Finance profit/charts/reports | `lib/features/finance/**`, `mobile-finance/finance-service.ts` | Net profit, `ANIMAL_SALES` income category |
| Local batch UI + outbox pattern | `lib/features/batches/**`, `sync_coordinator.dart` | Promote to server-backed `FatteningBatch` |
| Animal CRUD + `weightKg` | `lib/features/animals/**`, `mobile-animals/*` | Base animal; add weight history child records |
| Farm drawer + routes | `drawer_menu.dart`, `app_router.dart` | Add “Fattening” + “Growth” under Farm section |
| Bar charts | `lib/features/milk/presentation/widgets/milk_simple_chart.dart` | Weight gain / feed cost trends |
| Offline-first repository pattern | Feed, finance, batch modules | Standard for new fattening repo |
| `farmRef` string on records | `FeedRecord`, `FinanceRecord`, etc. | Link costs to farm until `FarmProfile` exists |
| Vaccine reminder UX | `lib/features/vaccine/presentation/vaccine_reminder_page.dart` | Weigh-in / market-date reminders |
| Health timeline | `lib/features/health/**` | Clinical events affecting market readiness |
| Unused l10n | `drawerFatteningSection`, `drawerGrowthRecords` | Wire to new routes |
| Cattle seed weights | `animal.seed.ts` `weightKg()` | Seed weight history + batches |
| Admin `LivestockBreed` | `prisma/schema.prisma`, admin UI | Breed-level growth benchmarks |

---

# Risk

| Risk | Severity | Evidence |
|------|----------|----------|
| **Product/docs vs code gap** | High | Fattening marked Phase 2+ in `PHASE0_FINAL_REVIEW.md` but farm sub-modules shipped without fattening; stakeholders may assume fattening exists because feed/finance/batches exist |
| **Batch split-brain** | High | Flutter batches are Hive-only; `FeedRecord.batchId` has no FK; merging batch concepts incorrectly will corrupt analytics |
| **Weight as single field** | Medium | `AnimalProfile.weightKg` overwrites on edit — no audit trail for growth (APP_FLOW requires initial → current → target) |
| **ROI manually composed** | Medium | User must cross finance + feed + animal screens; no per-batch fattening P&L |
| **No fattening seed/demo data** | Medium | `user_app_seed.ts` seeds finance + cattle weights but not feeds or weight series — fattening QA blocked |
| **Stale platform audit** | Low | `docs/audit/03_FEATURE_MATRIX.md` (2026-05-21) states “Flutter scaffold only”; USER_APP_06–11 reports (2026-05-22) supersede for farm modules |
| **No feature flags** | Low | Cannot gradual-rollout fattening module |
| **Qurbani seasonality** | Medium | Business logic for Eid targets entirely undocumented in code |

---

# Recommended Next Steps

1. **Schema (P0):** Add `FatteningBatch`, `WeightRecord`, optional `FatteningAnimalMeta` (purchaseCostBdt, initialWeightKg, targetWeightKg, targetSaleDate, purpose enum `FATTENING`/`QURBANI`). Migration only — no breaking changes to `AnimalProfile`.
2. **Backend API (P0):** Implement `/api/mobile/batches` (align with Flutter `AnimalBatch` DTO) **or** rename route to `/api/mobile/fattening/batches` and adapter in Flutter. Add `/api/mobile/weight-records` CRUD + list by animal/batch.
3. **Flutter (P0):** New feature folder `lib/features/fattening/` with dashboard matching APP_FLOW §11; wire `drawerFatteningSection` + `drawerGrowthRecords` in `drawer_menu.dart`; route `/fattening` or `/farms/:id/fattening`.
4. **ROI aggregation (P0):** Backend endpoint `GET /api/mobile/fattening/batches/:id/summary` aggregating `FinanceRecord` (purchase, feed via `FeedRecord`, treatment), projected sale — reuse `profitForCustomer` patterns.
5. **Seeds (P1):** Extend `user_app_seed.ts` with fattening batch, weight time-series, feed records linked to batch.
6. **Defer (P2):** Weight calculator, AI recommendations, market readiness score, web farmer panel — after core batch + weight loop works.

---

# Final Verdict

## **Continue Existing**

Do **not** greenfield a parallel stack or refactor feed/finance/animal modules. The correct path is to **extend the existing farm operations layer** (animals, feed, finance, local batches, composite farm) with fattening-specific entities, APIs, and screens. Documentation and partial infrastructure are aligned with this approach; only the fattening domain layer is missing.

---

## Appendix A — Search Evidence Summary

| Concept | Application code hits | Notes |
|---------|----------------------|-------|
| `fattening` / `FatteningBatch` | 0 in backend; l10n + docs only in Flutter/web | No runtime implementation |
| `cattle` / `CATTLE` | Widespread | Generic livestock, not fattening |
| `feed` / `FeedRecord` | Full stack | Phase 4 complete |
| `weight` / `weightKg` | `AnimalProfile` single field | No `WeightRecord` |
| `growth` | l10n `drawerGrowthRecords` only | No growth module |
| `qurbani` / `korbani` | 0 in app code | APP_FLOW Bengali mock only |
| `ROI` / `market readiness` | 0 | Finance profit ≠ fattening ROI |
| `batch` (farm groups) | Flutter local + `FeedRecord.batchId` string | No backend batch API |
| TODO/FIXME/WIP (fattening) | None found | — |
| Feature flags (fattening) | None | Only storage/redis flags |

---

## Appendix B — Key Backend Endpoints (existing, reusable)

```
GET/POST        /api/mobile/animals
GET/PATCH       /api/mobile/animals/:id
GET/POST        /api/mobile/feeds
GET/PATCH/DELETE /api/mobile/feeds/:id
GET             /api/mobile/feeds/cost
GET             /api/mobile/feeds/analytics
GET/POST        /api/mobile/finance/expenses
GET/POST        /api/mobile/finance/income
GET             /api/mobile/finance/profit
GET             /api/mobile/finance/charts
GET             /api/mobile/finance/reports
GET/POST        /api/mobile/milk (+ summary, charts)
GET/POST        /api/mobile/health/history
GET/POST        /api/mobile/vaccines (+ reminders)
GET/POST        /api/mobile/treatments
GET             /api/mobile/profile/dashboard-context
GET/PATCH       /api/mobile/me
```

**Not implemented (Flutter expects):**

```
/api/mobile/batches
/api/mobile/batches/:id
/api/mobile/batches/:id/move
/api/mobile/batches/merge
/api/mobile/farms (dedicated)
```

---

## Appendix C — Documentation References

| Document | Path | Relevance |
|----------|------|-----------|
| Fattening Management Flow | `pranidoctor-web/docs/uiux/APP_FLOW.md` §11 | Target UX (Qurbani batch, weight bars, cost/ profit) |
| Screen hierarchy | `pranidoctor-web/docs/uiux/SCREEN_HIERARCHY.md` | Planned `FatteningManagementPage` route |
| System architecture | `pranidoctor-web/docs/architecture/SYSTEM_ARCHITECTURE.md` §21.1 | Target models & features |
| ERD future placeholders | `pranidoctor-web/docs/database/ERD.md` §15 | `FatteningBatch`, `WeightRecord` |
| Phase 0 review | `pranidoctor-web/docs/PHASE0_FINAL_REVIEW.md` | Fattening = Phase 2+ |
| Phase 2 DB map | `pranidoctor-web/docs/PHASE2_DB_MAP.md` | Optional `FarmProfile` type dairy/fattening |
| Home redesign plan | `pranidoctor_user/docs/ui/home_redesign_plan.md` §6.3 | Drawer should retain fattening entry (not yet wired) |
| Batch module report | `pranidoctor_user/docs/USER_APP_08_BATCH_REPORT.md` | Backend batches missing |
| Feed module report | `pranidoctor_user/docs/USER_APP_10_FEED_REPORT.md` | Feed stack complete |
| Finance module report | `pranidoctor_user/docs/USER_APP_11_FINANCE_REPORT.md` | Finance stack complete |

---

*Report generated by workspace audit — read-only, 2026-05-23.*
