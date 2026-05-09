# Environment variables — Prani Doctor web

**Repository:** `pranidoctor-web`  
**Production site:** `https://pranidoctor.com/`

Copy `.env.example` to `.env`, then replace placeholders with real values. **Never commit `.env`.**

---

## Required for local development (minimum)

| Variable | Used by | Notes |
|----------|---------|--------|
| `DATABASE_URL` | Prisma, `src/lib/prisma.ts` | PostgreSQL connection string |
| `ADMIN_JWT_SECRET` | Admin panel JWT cookie (`src/lib/admin-auth/`) | **≥32 characters** after trim (or set `AUTH_SECRET` / `JWT_SECRET` to long values per fallback order in `secrets.ts`) |
| `MOBILE_JWT_SECRET` or `AUTH_SECRET` | Mobile OTP APIs (`src/lib/mobile-auth/secrets.ts`) | **≥32 characters** — required before `POST /api/mobile/auth/otp/*` works |

For a usable **admin login** after seeding, also set `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`, then run `npm run seed:admin` (see below).

---

## Local-only vs production

| Kind | Examples | Notes |
|------|-----------|--------|
| **Local-only** | `NODE_ENV=development`, `APP_URL=http://localhost:3000`, `SMS_PROVIDER=local`, `ENABLE_DEV_OTP=true`, `OTP_DEV_CODE`, `MAIL_ENABLED=false`, `PAYMENT_ENABLED=false` | Dev OTP and fixed codes must **never** ship enabled to production |
| **Change in production** | All JWT/`AUTH_SECRET` values, `DATABASE_URL`, payment/S3/SMS credentials, `NEXT_PUBLIC_*` pointing at prod URLs | Rotate secrets if exposed; use a secrets manager |

---

## Generating secrets (Node)

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Use distinct outputs for `ADMIN_JWT_SECRET`, `DOCTOR_JWT_SECRET`, `MOBILE_JWT_SECRET`, `TECHNICIAN_JWT_SECRET`, `AUTH_SECRET`, `JWT_SECRET`, and `NEXTAUTH_SECRET` where applicable. Each value used for signing should be **at least 32 characters** (the app enforces this for JWT helpers).

---

## Admin seed

```bash
npm run seed:admin
```

Requires `DATABASE_URL`, `ADMIN_SEED_EMAIL`, and `ADMIN_SEED_PASSWORD`. See `docs/ADMIN_CREDENTIAL_SETUP.md`.

---

## Verify the project

```bash
npx prisma validate
npx prisma generate
npm run lint
npm run build
```

---

## Code vs `.env` naming (important)

- **Admin session cookie name** is currently **`prani_admin_session`** in `src/lib/admin-auth/constants.ts`. A `SESSION_COOKIE_NAME` variable in `.env` is **reserved / future use** — the app does not read it yet.
- **SMS (implemented):** `SMS_PROVIDER` (`local` \| `noop` \| `http`), and for `http`: `SMS_HTTP_URL`, `SMS_HTTP_API_KEY`. Names like `SMS_BASE_URL` / `SMS_API_KEY` are placeholders for vendors or future wiring; align with your provider’s docs when integrating.
- **OTP timing / limits** for mobile are largely in `src/lib/mobile-auth/otp-constants.ts` (e.g. TTL 600s). Env vars such as `OTP_EXPIRES_MINUTES` are for **future** alignment or ops tooling unless you wire them in code.
- **NextAuth:** `NEXTAUTH_*` keys are placeholders unless you add NextAuth; they do not affect the current custom JWT flows.

---

## Feature flags and placeholders

Many keys in `.env.example` (payments, S3, mail, `FEATURE_*`) are **future-ready**. If a key is not read by code today, it is safe to leave as a placeholder until the feature is implemented.

---

## Related docs

- `docs/ADMIN_CREDENTIAL_SETUP.md` — panel admin credentials and JWT fallbacks
- `docs/MVP_AUDIT_AND_LAUNCH_CHECKLIST.md` — broader env checklist
