# Phase 3 — Certificate (Lead + Case + Assignment + Timeline)

**Project:** Prani Doctor  
**Date:** 2026-05-21  
**Prerequisites:** [PHASE2_FREEZE.md](./PHASE2_FREEZE.md), [PHASE1_FREEZE.md](./PHASE1_FREEZE.md)

---

## Sign-off

```
LEAD_READY=YES
CASE_READY=YES
ASSIGN_READY=YES
WORKFLOW_READY=YES
P3_COMPLETE=YES
PHASE4_READY=YES
```

---

## Domain readiness

| Domain | Ready | Evidence |
|--------|-------|----------|
| **Lead** | YES | `modules/lead` customer intake; `LeadsRepository` CRM; `POST /api/leads` |
| **Assignment** | YES | `modules/assignment` admin assign + doctor accept/reject + timeline hooks |
| **Case** | YES | `modules/case` treatment case create + `CASE_OPENED` event |
| **Timeline** | YES | `ServiceRequestTimelineEvent` table + mobile/doctor/admin GET routes |
| **Doctor queue** | YES | `modules/doctor-queue` list by tab (compat path unchanged) |

---

## Contract preservation

| Check | Result |
|-------|--------|
| Frozen service-request DTO shapes | PASS |
| Auth/session/device/OTP untouched | PASS |
| Compat envelope `{ ok, data }` | PASS |
| Additive timeline GET only | PASS |
| Build | PASS |
| `p2:verify` regression | **13/13 PASS** |
| `p3:verify` matrix | **17/17 PASS** |

---

## Workflow certificate

End-to-end path verified on dev backend (`:3000`):

| Step | Event |
|------|-------|
| Customer creates request | `CREATED` |
| Admin assigns doctor | `ASSIGNED` |
| Doctor accepts | `ACCEPTED` |
| Doctor opens treatment case | `CASE_OPENED` |
| Doctor completes with billing | `COMPLETED` |

---

## Artifacts

| Document | Path |
|----------|------|
| Plan | [PHASE3_PLAN.md](./PHASE3_PLAN.md) |
| Execution | [PHASE3_EXECUTION.md](./PHASE3_EXECUTION.md) |
| API map | [PHASE3_API_MAP.md](./PHASE3_API_MAP.md) |
| DB map | [PHASE3_DB_MAP.md](./PHASE3_DB_MAP.md) |
| OpenAPI | [openapi.json](./openapi.json) (179 compat paths) |

---

## Verify commands

```bash
cd pranidoctor-backend
npm run build
npm run p3:verify
npm run p2:verify
npm run openapi:generate
npm run e2e:freeze
```

---

## Mobile / web consumers

- **Flutter:** May consume additive `GET …/timeline` on service-request detail.
- **Web admin:** Assign + timeline audit on request detail (additive fields only).
- **Billing:** Complete route unchanged; compat billing payload still required.
