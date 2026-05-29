# Phase 4 — Testing Checklist

**Plan ID:** `PHASE_4_LIVESTOCK_FEED_ECOSYSTEM_MASTER_PLANNING_V1`  
**Status:** Planning only — execute during implementation phases

---

## 1. How to Use

- Check items when verified on **staging** before production
- Record: tester, date, build/version, pass/fail
- Severity: **P0** (block release), **P1** (fix before rollout), **P2** (fix soon)

---

## 2. Backend API Tests

### 2.1 Livestock (P0)

| # | Test | Expected |
|---|------|----------|
| L-01 | POST create cattle with required fields | 201 + LivestockDto |
| L-02 | Duplicate ear tag same customer | 409 CONFLICT |
| L-03 | PATCH update weight | weightKg + lastWeightAt updated |
| L-04 | Deactivate animal | active=false; excluded from default list |
| L-05 | List filters animalType, search | Correct subset |
| L-06 | GET breeds by animalType | Only matching breeds |
| L-07 | POST group + assign animal | groupId set |
| L-08 | POST media + DELETE media | Gallery count correct |
| L-09 | GET timeline mixed types | Sorted DESC, paginated |
| L-10 | GET QR payload | Valid deep link format |
| L-11 | Legacy GET /animals still works | Same data as /livestock |

### 2.2 Feed catalog (P0)

| # | Test | Expected |
|---|------|----------|
| FC-01 | Mobile list active only | isActive=false excluded |
| FC-02 | Filter by category | Correct items |
| FC-03 | Filter by animalType suitability | Restricted items excluded |
| FC-04 | Admin PATCH nutrition | nutritionJson saved |
| FC-05 | Admin deactivate | Mobile list excludes |
| FC-06 | Seed run idempotent | Second run: 0 duplicate codes |

### 2.3 Feed records (P0)

| # | Test | Expected |
|---|------|----------|
| FR-01 | Create feed log without inventory | 201, no stock change |
| FR-02 | Create with deductStock=true | Consumption tx; balance reduced |
| FR-03 | Insufficient stock + deduct | 409 INSUFFICIENT_STOCK |
| FR-04 | GET cost aggregation | Matches sum of costBdt |
| FR-05 | Idempotent retry same Idempotency-Key | Single record |

### 2.4 Inventory (P0)

| # | Test | Expected |
|---|------|----------|
| INV-01 | Create item from feedCatalogId | displayName + feedType mapped |
| INV-02 | Receipt increases balance | RECEIPT tx |
| INV-03 | Wastage decreases balance | WASTAGE tx |
| INV-04 | FIFO lot deduct | Earliest expiry lot reduced first |
| INV-05 | Low stock threshold | isLowStock=true; event emitted |
| INV-06 | Unit conversion bag→kg | Normalized kg in tx metadata |
| INV-07 | Supplier CRUD | Linked on receipt |

### 2.5 Recommendations (P1)

| # | Test | Expected |
|---|------|----------|
| REC-01 | Daily ration dairy cow | items + totals + disclaimer |
| REC-02 | Pregnant female | Ration adjusted |
| REC-03 | SICK health status | Warning present |
| REC-04 | Toxic feed excluded | Not in items |
| REC-05 | Accept plan persists | FeedRationPlan row |

### 2.6 Analytics (P1)

| # | Test | Expected |
|---|------|----------|
| AN-01 | Dashboard cards match raw SQL | feedCost, milkLiters |
| AN-02 | Feed cost per liter | Correct formula |
| AN-03 | FCR fattening batch | feedKg/gainKg |
| AN-04 | Empty period | Zeroes, no 500 |
| AN-05 | farmRef scoping | Other farm excluded |

### 2.7 Vendors (P2)

| # | Test | Expected |
|---|------|----------|
| V-01 | Unverified vendor hidden mobile | 404 or filtered |
| V-02 | Verified vendor list by district | Correct list |
| V-03 | Admin reject vendor | Status REJECTED |

### 2.8 Auth & permissions (P0)

| # | Test | Expected |
|---|------|----------|
| A-01 | Customer A cannot read Customer B animal | 403/404 |
| A-02 | Admin catalog without session | 401 |
| A-03 | CUSTOMER cannot POST admin catalog | 403 |

---

## 3. Flutter App Tests

### 3.1 Livestock UI (P0)

| # | Test | Expected |
|---|------|----------|
| FL-01 | Create animal offline → sync online | Appears on server |
| FL-02 | Draft recovery on form back | Fields restored |
| FL-03 | Breed picker loads BN names | Correct locale |
| FL-04 | Gallery upload | Image visible after save |
| FL-05 | QR page share | Share sheet works |
| FL-06 | Timeline pull-to-refresh | Updates |
| FL-07 | Search by ear tag | Finds animal |
| FL-08 | Deactivate confirm dialog | Animal inactive |

### 3.2 Feed & inventory UI (P0)

| # | Test | Expected |
|---|------|----------|
| FF-01 | Feed create from catalog multi-select | Correct feedType |
| FF-02 | Deduct stock toggle | 409 shows BN error |
| FF-03 | Inventory receipt with supplier | Balance updated |
| FF-04 | Wastage entry | Balance reduced |
| FF-05 | Low stock banner on home | Shows when threshold hit |
| FF-06 | Expiry warning on lot | UI badge within 7 days |

### 3.3 Recommendations UI (P1)

| # | Test | Expected |
|---|------|----------|
| FRU-01 | Open daily ration | Items render BN names |
| FRU-02 | Log this feed CTA | Prefills feed form |
| FRU-03 | Disclaimer visible | BN text |

### 3.4 Analytics UI (P1)

| # | Test | Expected |
|---|------|----------|
| FA-01 | Dashboard period change | Charts update |
| FA-02 | Offline cached dashboard | Shows stale badge |
| FA-03 | Empty farm state | BN empty state |

### 3.5 Multilingual (P1)

| # | Test | Expected |
|---|------|----------|
| I18N-01 | Switch EN → BN | All Phase 4 labels update |
| I18N-02 | No missing key warnings | Console clean |
| I18N-03 | API error INSUFFICIENT_STOCK BN | User-friendly message |

### 3.6 Regression (P0)

| # | Test | Expected |
|---|------|----------|
| REG-01 | Doctor service request still works | Unchanged |
| REG-02 | Milk logging | Unchanged |
| REG-03 | Fattening batch flow | Unchanged |
| REG-04 | OTP login | Unchanged |

---

## 4. Admin Panel Tests

| # | Test | Expected |
|---|------|----------|
| AD-01 | Feed catalog create/edit | Saves + lists |
| AD-02 | Nutrition form validation | Rejects invalid % |
| AD-03 | Seed run panel | Report displayed |
| AD-04 | Vendor verify/reject | Status badge updates |
| AD-05 | Analytics feed dashboard | Loads without PII |
| AD-06 | Livestock breed CRUD | Mobile API reflects |

---

## 5. Database & Migration Tests

| # | Test | Expected |
|---|------|----------|
| DB-01 | Migration apply on empty DB | Success |
| DB-02 | Migration apply on production copy | Success, no data loss |
| DB-03 | Backfill ear tag script | Idempotent |
| DB-04 | Enum ADD VALUE | Old rows valid |
| DB-05 | Rollback script in dev | Documented |

---

## 6. Performance Tests

| # | Test | Target |
|---|------|--------|
| PERF-01 | GET livestock list 100 animals | < 500ms p95 |
| PERF-02 | GET timeline 90 days | < 800ms p95 |
| PERF-03 | GET analytics dashboard | < 2s p95 |
| PERF-04 | GET recommendation daily | < 3s p95 |
| PERF-05 | 50 concurrent feed creates | No deadlocks |

---

## 7. Security Tests

| # | Test | Expected |
|---|------|----------|
| SEC-01 | SQL injection in search params | Rejected/safe |
| SEC-02 | farmRef mismatch body vs auth | 403 |
| SEC-03 | Admin audit log on catalog change | Row created |
| SEC-04 | Inventory audit on wastage | Row created |

---

## 8. Offline & Sync Tests

| # | Test | Expected |
|---|------|----------|
| OFF-01 | Airplane mode feed create | Queued in outbox |
| OFF-02 | Reconnect sync | Server record created |
| OFF-03 | Conflict on inventory deduct | User notified, no duplicate |
| OFF-04 | Catalog cache stale | Refresh on connect |

---

## 9. Automated Test Commands

### Backend

```bash
cd pranidoctor-backend
pnpm test
pnpm exec vitest run src/modules/inventory
pnpm exec vitest run src/modules/livestock  # after creation
```

### Flutter

```bash
cd pranidoctor_user
dart analyze lib/features/animals lib/features/feed lib/features/inventory
flutter test test/animals/
flutter test test/feed/
```

### Web admin

```bash
cd pranidoctor-web
pnpm lint
pnpm build
```

---

## 10. Sign-off Template

| Area | P0 pass | P1 pass | Signed by | Date |
|------|---------|---------|-----------|------|
| Livestock API | | | | |
| Feed engine | | | | |
| Inventory | | | | |
| Recommendations | | | | |
| Analytics | | | | |
| Flutter app | | | | |
| Admin panel | | | | |
| Migrations | | | | |

**Release blocked if any P0 fails.**

---

## 11. Related Documents

- [implementation-roadmap.md](./implementation-roadmap.md)
- [api-contracts.md](./api-contracts.md)
- Existing: `pranidoctor_user/docs/plans/farm_inventory/08-verification.md`
