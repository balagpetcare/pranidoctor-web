# Prani Doctor — development dummy seeder

This project is **Prani Doctor / Animal Doctors** only. The demo seeder does not reference other products or legacy datasets.

## What gets created

| Area | Details |
|------|---------|
| **App config** | `Setting` keys `mobile.app.config` (support phone/WhatsApp placeholders, feature toggles) and `mobile.feature.flags`. |
| **Service categories** | Upserts Bengali/English labels on existing slugs (`doctor-visit`, `emergency`, `ai-service`, `vaccination`, `online-consultation`) and adds `farm-visit` if missing. |
| **Areas** | Extra Bangladesh demo districts under `Area` (Narayanganj child of Dhaka Division; Chattogram, Cumilla, Rajshahi, Bogura, Rangpur, Sylhet, Khulna, Barishal as standalone districts). **Dhaka, Gazipur, Savar, Ashulia** come from the base seed (`npm run db:seed`). |
| **Animals** | Six livestock-focused profiles for the demo customer (`demo-seed-animal-*`): গরু, ছাগল, ভেড়া, মুরগি, হাঁস, মহিষ — plus Bengali `species` strings for search/copy. |
| **Users** | Customer (`customer@pranidoctor.test`). OTP UI uses **`01701022274`**; the DB stores **`8801701022274`** (normalized — must match the OTP user row). Five doctors, three AI technicians, one support user (`@pranidoctor.test`). |
| **Profiles** | Doctor and AI profiles with fees, emergency/online flags, village service area (`sample-service-village-001`), `Area` coverage, service categories, `metadataJson.demoSeed`. |
| **Service requests** | Eight fixed ids (`demo-seed-sr-*`) covering `PENDING`, `ASSIGNED`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, AI job, and **online consultation placeholder**. |
| **Billing / payment** | Two `BillingRecord` rows (`demo-seed-bill-paid`, `demo-seed-bill-unpaid`) and one `PaymentRecord` (`demo-seed-payment-paid`) linked to the completed visit. |
| **Notifications** | Seven demo notifications for the customer (`demo-seed-notif-*`). |

### Status mapping (mobile wording ↔ database)

| Product wording | `ServiceRequestStatus` |
|-----------------|-------------------------|
| Submitted | `PENDING` |
| Pending assignment | `ASSIGNED` (doctor assigned) |
| Accepted / on the way | `ACCEPTED` |
| In treatment | `IN_PROGRESS` |
| Completed | `COMPLETED` |
| Cancelled | `CANCELLED` |

## Prerequisites

1. PostgreSQL reachable via `DATABASE_URL` (see `.env`).
2. Migrations applied (`npm run db:migrate` or your deployment process).
3. **Base catalog seed** so villages and categories exist:

```bash
npm run db:generate
npm run db:seed
```

## Commands

| Script | Purpose |
|--------|---------|
| `npm run db:seed` | Default Prisma seed (`prisma/seed.ts`) — admin from env, geography, core categories. |
| `npm run db:seed:demo` | Full Prani Doctor demo dataset (`prisma/seed-demo.ts`). Idempotent upserts. |
| `npm run db:seed:reset-demo` | Deletes **only** demo ids / `@pranidoctor.test` users (`prisma/seed-demo-reset.ts`). |

### Production safety

- **`db:seed:demo`** exits with code `1` when `NODE_ENV=production` unless `ALLOW_DEMO_SEED_IN_PRODUCTION=true` (use only on a **disposable** database).
- **`db:seed:reset-demo`** is blocked in production unless `ALLOW_DEMO_RESET_IN_PRODUCTION=true`.

### Environment overrides

| Variable | Effect |
|----------|--------|
| `DEMO_SEED_STAFF_PASSWORD` | Password hash for doctors, AI techs, support (panel login). Default: `DemoSeed!ChangeMe123`. |
| `DEMO_SEED_CUSTOMER_PASSWORD` | Stored on customer user (mobile normally uses **OTP**, not this password). Default set for completeness. |
| `ALLOW_DEMO_SEED_IN_PRODUCTION` | Must be `true` to run demo seed when `NODE_ENV=production`. |
| `ALLOW_DEMO_RESET_IN_PRODUCTION` | Must be `true` to run reset in production (**dangerous**). |

## Demo login & test data

| Role | Identifier | Notes |
|------|------------|--------|
| Customer | Phone **`01701022274`** | Mobile app OTP login (dev SMS policy applies). |
| Customer | Email `customer@pranidoctor.test` | Useful for API tests; profile display name **Demo Customer**. |
| Doctors | `demo-doctor-1@pranidoctor.test` … `demo-doctor-5@pranidoctor.test` | Password from `DEMO_SEED_STAFF_PASSWORD` — **panel** / password-based flows. |
| AI technicians | `demo-ai-1@pranidoctor.test` … `demo-ai-3@pranidoctor.test` | Same staff password. |
| Support | `demo-support@pranidoctor.test` | Same staff password; role `SUPPORT`. |

## Public discovery APIs (no Bearer token)

These routes are **anonymous-friendly** so onboarding/home/doctor finder work **before** OTP login:

- `GET /api/mobile/app-config`
- `GET /api/mobile/service-categories`
- `GET /api/mobile/providers/doctors` and `GET /api/mobile/providers/doctors/[id]`
- `GET /api/mobile/providers/technicians` and `GET /api/mobile/providers/technicians/[id]`

Customer-specific routes (`/api/mobile/me`, `/notifications`, `/service-requests`, …) still require `Authorization: Bearer`.

## API endpoints to verify (mobile)

Replace origin with your dev server (e.g. `http://localhost:3000`).

**No auth:** `app-config`, `service-categories`, `providers/doctors`, `providers/technicians` (and detail routes).

**Bearer required:** `GET/PATCH /api/mobile/me`, `GET /api/mobile/notifications`, `GET /api/mobile/service-requests`, and related POST/PATCH routes used by the app.

## Reset demo data safely

1. Use **development** (or a dedicated disposable DB).
2. Run:

```bash
npm run db:seed:reset-demo
```

3. Recreate:

```bash
npm run db:seed:demo
```

Reset removes rows keyed by `prisma/demo-seed-shared.ts` (fixed ids and `@pranidoctor.test` emails). It does **not** delete `Setting` rows `mobile.app.config` / `mobile.feature.flags`; remove those manually if you need a clean slate.

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| `Missing prerequisite rows … Run db:seed first` | Run `npm run db:seed` so `sample-service-village-001` and service categories exist. |
| `DATABASE_URL is not set` | Load `.env` in the shell or run from project root; ensure `dotenv` can load (scripts use `import "dotenv/config"`). |
| OTP works but **notifications / requests empty** after seed | Ensure demo customer phone in DB is **`8801701022274`** (normalized). If you previously seeded `017…` only, run `npm run db:seed:reset-demo` then `npm run db:seed:demo`. Seed merges by **unique phone**. |
| Home shows empty categories before login | Confirm `GET /api/mobile/service-categories` returns **200** without Bearer (not 401). |
| Production abort | Intended — do not run demo seed against production data. |
| Reset leaves stray rows | Only demo-scoped rows are deleted; if you created extra data manually, clean it yourself. |

## Files

| File | Role |
|------|------|
| `prisma/seed-demo.ts` | Demo seed implementation. |
| `prisma/seed-demo-reset.ts` | Demo-only cleanup. |
| `prisma/demo-seed-shared.ts` | Shared ids/emails for seed + reset. |
