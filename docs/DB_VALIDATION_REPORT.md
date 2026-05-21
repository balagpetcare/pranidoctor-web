# Database validation report (Phase 2)

**Date:** 2026-05-21  
**Authority:** `pranidoctor-backend` (BACKEND-FIRST)  
**Database:** `postgresql://***@localhost:5432/pranidoctor_db?schema=public`

---

## Commands (backend)

| Command | Exit | Result |
|---------|------|--------|
| `npx prisma validate` | 0 | Schema valid |
| `npx prisma generate` | 0 | Client → `src/generated/prisma` |
| `npx prisma migrate status` (pre-deploy) | 1 | 23 pending (empty `_prisma_migrations`) |
| `npx prisma migrate deploy` | 0 | **23 migrations applied** |
| `npx prisma migrate status` (post-deploy) | 0 | **Database schema is up to date!** |

---

## Applied migrations (23)

1. `20260208120000_init_mvp`
2. `20260508195220_prani_doctor_mvp_schema`
3. `20260508200401_area_hierarchy`
4. `20260508204007_doctor_management_fields`
5. `20260508205522_ai_technician_foundation`
6. `20260508212430_animal_photo_pregnancy_status`
7. `20260509055822_billing_payment_fields_and_enums`
8. `20260509080348_mobile_otp_challenge`
9. `20260509120000_knowledge_hub_content`
10. `20260509120000_service_request_booking_enums_fields`
11. `20260509180000_mobile_otp_last_sent`
12. `20260510092800_ai_technician_foundation`
13. `20260510122449_bd_locations_foundation`
14. `20260510140000_universal_uploads_foundation`
15. `20260510145715_add_location_master_fields`
16. `20260510183000_ai_service_request_decline_reason`
17. `20260510210000_ai_technician_quality_tables`
18. `20260511121500_customer_profile_cover_photos`
19. `20260511133000_location_dedupe_unique_constraints`
20. `20260511194500_ai_technician_semen_template_system`
21. `20260511210000_ai_technician_cover_upload`
22. `20260512120000_mobile_upload_purpose_semen_template_video`
23. `20260512150000_enterprise_service_instances`

**Not applied (intentionally out of chain):**  
`_archived_backend_foundation` — relocated to `prisma/_archived_out_of_chain/`

---

## Failures captured (pre-repair)

| Error | Cause | Resolution |
|-------|-------|------------|
| **P3015** | `_archived_backend_foundation/` without top-level `migration.sql` | Archive relocated |
| **P1000** (web) | Web `.env` password mismatch for `postgres` user | Align web `DATABASE_URL` (manual) |

---

## Drift

| Check | Result |
|-------|--------|
| Migration history vs filesystem | **No drift** after deploy |
| Schema vs database | **Up to date** (backend) |
| Backend vs web migration SQL | **Identical** (23 files) |

---

## Web validation (read-only)

| Command | Exit | Result |
|---------|------|--------|
| `npx prisma validate` | 0 | Valid |
| `npx prisma generate` | 0 | Client generated |
| `npx prisma migrate status` | 1 | **P1000** auth — cannot verify from web until `.env` fixed |

---

## Validation status

| Scope | Status |
|-------|--------|
| Backend validate/generate/deploy/status | **PASS** |
| Web validate/generate | **PASS** |
| Web migrate status | **BLOCKED** (credentials) |

**VALIDATION_STATUS:** **PASS** (backend authoritative); web DB CLI blocked on env.
