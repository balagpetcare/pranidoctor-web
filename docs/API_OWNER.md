# API ownership — Production

**Owner:** `pranidoctor-web` (`D:\PraniDoctor\pranidoctor-web`)  
**Role:** Production monolith — UI + **171 HTTP API route handlers**

**Staging mirror:** `pranidoctor-backend` — Express scaffold only; **not** production API.

Cutover is **deferred**. See [CUTOVER_DEFER_PLAN.md](./CUTOVER_DEFER_PLAN.md).

## Rules

- All client traffic (admin, mobile, doctor, technician) hits `/api/*` in this repo.
- Do **not** point production `BACKEND_API_URL` at staging Express until release criteria pass.
- Schema and migrations: [prisma/SCHEMA_OWNER.md](../prisma/SCHEMA_OWNER.md)
