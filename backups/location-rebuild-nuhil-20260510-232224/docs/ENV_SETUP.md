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
| **Local-only** | `NODE_ENV=development`, `APP_URL=http://localhost:3000`, `OTP_MODE=dev`, `SMS_PROVIDER=local`, `MAIL_ENABLED=false`, `PAYMENT_ENABLED=false` | `OTP_MODE=dev` logs OTP to the server terminal — **never** use in production |
| **Change in production** | `OTP_MODE=live`, SMS credentials, all JWT/`AUTH_SECRET` values, `DATABASE_URL`, payment/S3 credentials, `NEXT_PUBLIC_*` pointing at prod URLs | Rotate secrets if exposed; use a secrets manager |

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
- **SMS (implemented):** `SMS_PROVIDER` (`local` \| `noop` \| `http`), and for `http`: `SMS_HTTP_URL`, `SMS_HTTP_API_KEY`. **Live mobile OTP** (`OTP_MODE=live`) uses `SMS_BASE_URL` (or `SMS_HTTP_URL`) and `SMS_API_KEY` (or `SMS_HTTP_API_KEY`) via `src/lib/mobile-auth/otp-live-sms.ts`.
- **Mobile OTP:** `OTP_MODE`, `OTP_TTL_MINUTES`, `OTP_LENGTH`, `OTP_MAX_ATTEMPTS`, `OTP_RESEND_COOLDOWN_SECONDS`, `OTP_MAX_SENDS_PER_HOUR`, `OTP_SEND_WINDOW_MINUTES`, `OTP_DEBUG_PANEL_ENABLED` — see `src/lib/mobile-auth/otp-env.ts` and `docs/OTP_LOCAL_AND_LIVE.md`.
- **NextAuth:** `NEXTAUTH_*` keys are placeholders unless you add NextAuth; they do not affect the current custom JWT flows.

---

## Feature flags and placeholders

Many keys in `.env.example` (payments, S3, mail, `FEATURE_*`) are **future-ready**. If a key is not read by code today, it is safe to leave as a placeholder until the feature is implemented.

---

## Related docs

- `docs/ADMIN_CREDENTIAL_SETUP.md` — panel admin credentials and JWT fallbacks
- `docs/OTP_LOCAL_AND_LIVE.md` — dev vs live OTP, local testing, SMS activation
