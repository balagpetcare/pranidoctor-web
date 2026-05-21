# Phase 2 — Certificate (User + Profile + Area Foundation)

**Project:** Prani Doctor  
**Date:** 2026-05-21  
**Prerequisites:** [PHASE1_FREEZE.md](./PHASE1_FREEZE.md) (`P1_COMPLETE=YES`, `AUTH_COMPLETE=YES`)

---

## Sign-off

```
USER_READY=YES
PROFILE_READY=YES
AREA_READY=YES
DOCTOR_READY=YES
TECHNICIAN_READY=YES
P2_COMPLETE=YES
PROFILE_FOUNDATION_READY=YES
```

---

## Domain readiness

| Domain | Ready | Evidence |
|--------|-------|----------|
| **User** | YES | `modules/user` + `UsersRepository` Prisma CRUD / `findOrCreate` |
| **Profile** | YES | `modules/profile`, `GET/PATCH /api/mobile/me`, `profileComplete` additive |
| **Area** | YES | `modules/area`, location cascade + hierarchy validation |
| **Doctor** | YES | `modules/doctor`, `DoctorsRepository.findById/findByUserId` |
| **Technician** | YES | `modules/technician`, area FK validation + coverage service |

---

## Contract preservation

| Check | Result |
|-------|--------|
| Frozen `GET /api/mobile/me` fields | PASS (`id`, `name`, `phone`, `email`, `area`, `locale`, photos) |
| Frozen compat envelope | PASS |
| Auth routes untouched | PASS (no edits to OTP/session/refresh/device services) |
| Additive PATCH `address` | PASS |
| Additive `farmSummary` on dashboard-context | PASS |
| Build | PASS |
| `p2:verify` matrix | **10/10 PASS** |

---

## Artifacts

| Document | Path |
|----------|------|
| Plan | [PHASE2_PLAN.md](./PHASE2_PLAN.md) |
| API map | [PHASE2_API_MAP.md](./PHASE2_API_MAP.md) |
| DB map | [PHASE2_DB_MAP.md](./PHASE2_DB_MAP.md) |
| UI flow | [PHASE2_UI_FLOW.md](./PHASE2_UI_FLOW.md) |
| Sequence | [PHASE2_SEQUENCE.md](./PHASE2_SEQUENCE.md) |
| Execution | [PHASE2_EXECUTION.md](./PHASE2_EXECUTION.md) |
| OpenAPI | [openapi.json](./openapi.json) (regenerated) |

---

## Verify commands

```bash
cd pranidoctor-backend
npm run build
npm run p2:verify
npm run openapi:generate
# optional full auth regression:
P2_INCLUDE_P1=1 npm run p2:verify
```

---

## Mobile / web consumers

- **Flutter:** May consume additive `address` on PATCH me and `farmSummary` on dashboard-context.
- **Web:** Remains API proxy only; no Prisma on web.

---

**Certified:** Phase 2 foundation implementation complete per [PHASE2_SEQUENCE.md](./PHASE2_SEQUENCE.md) steps P2-01–P2-11 (P2-00 baseline via verify script).
