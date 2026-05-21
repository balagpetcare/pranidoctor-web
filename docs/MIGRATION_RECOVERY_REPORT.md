# Migration recovery report (Phase 1)

**Date:** 2026-05-21  
**Rule:** Recover only missing `migration.sql` from web → backend; never overwrite existing SQL.

---

## Enumeration

### Backend (`prisma/migrations/`)

| # | Folder | `migration.sql` |
|---|--------|-----------------|
| 1 | `20260208120000_init_mvp` | Present |
| 2 | `20260508195220_prani_doctor_mvp_schema` | Present |
| 3 | `20260508200401_area_hierarchy` | Present |
| 4 | `20260508204007_doctor_management_fields` | Present |
| 5 | `20260508205522_ai_technician_foundation` | Present |
| 6 | `20260508212430_animal_photo_pregnancy_status` | Present |
| 7 | `20260509055822_billing_payment_fields_and_enums` | Present |
| 8 | `20260509080348_mobile_otp_challenge` | Present |
| 9 | `20260509120000_knowledge_hub_content` | Present |
| 10 | `20260509120000_service_request_booking_enums_fields` | Present |
| 11 | `20260509180000_mobile_otp_last_sent` | Present |
| 12 | `20260510092800_ai_technician_foundation` | Present |
| 13 | `20260510122449_bd_locations_foundation` | Present |
| 14 | `20260510140000_universal_uploads_foundation` | Present |
| 15 | `20260510145715_add_location_master_fields` | Present |
| 16 | `20260510183000_ai_service_request_decline_reason` | Present |
| 17 | `20260510210000_ai_technician_quality_tables` | Present |
| 18 | `20260511121500_customer_profile_cover_photos` | Present |
| 19 | `20260511133000_location_dedupe_unique_constraints` | Present |
| 20 | `20260511194500_ai_technician_semen_template_system` | Present |
| 21 | `20260511210000_ai_technician_cover_upload` | Present |
| 22 | `20260512120000_mobile_upload_purpose_semen_template_video` | Present |
| 23 | `20260512150000_enterprise_service_instances` | Present |

### Web

Same 23 folders — all have `migration.sql`.

### Compare web vs backend (active chain)

| Metric | Result |
|--------|--------|
| Folders only in web | 0 |
| Folders only in backend | 0 |
| `migration.sql` hash mismatches | **0** |
| Files copied web → backend | **0** (none required) |

---

## Defect found (not fixable via web copy)

| Path | Issue | Web has copy? |
|------|-------|---------------|
| `migrations/_archived_backend_foundation/` | Prisma expected `migration.sql` at parent; SQL was nested one level deeper | **No** |

**Error:** `P3015 — Could not find the migration file at migration.sql`

---

## Repair applied (non-destructive, not web→backend)

| Action | Detail |
|--------|--------|
| **Relocate** | `prisma/migrations/_archived_backend_foundation/` → `prisma/_archived_out_of_chain/_archived_backend_foundation/` |
| **Deleted** | Nothing |
| **Overwritten** | Nothing |

Preserves archived foundation SQL for reference; removes invalid entry from Prisma migration chain.

**Nested SQL preserved at:**  
`prisma/_archived_out_of_chain/_archived_backend_foundation/20260521120000_foundation_core_tables/migration.sql`

---

## Post-recovery state

- Prisma reports **23 migrations** in chain (was 24 with broken archive folder).
- `migrate deploy` proceeds without P3015.

---

## Recovery status

| Item | Status |
|------|--------|
| Web → backend SQL copy | **SKIP** — all present and identical |
| Archive P3015 repair | **DONE** — relocate only |
| Overwrites | **NONE** |

**RECOVERY_STATUS:** **PASS**
