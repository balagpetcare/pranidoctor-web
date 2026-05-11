# Mobile customer OTP and JWT (Prani Doctor)

Scope: **Prani Doctor / Animal Doctors** customer mobile login (`/api/mobile/auth/otp/*`) only.  
Not for BPA/WPA, Qurbani, or other products.

## Root behaviour

1. **JWT signing** — `MOBILE_JWT_SECRET` or `AUTH_SECRET` must be available for issuing Bearer tokens after OTP verify.
2. **OTP delivery** — controlled by `OTP_MODE`:
   - `dev`: OTP is **not** sent via SMS; the server logs the code to the **terminal** (local development only).
   - `live`: OTP is sent via the HTTP SMS adapter (`SMS_BASE_URL` + `SMS_API_KEY`, or legacy `SMS_HTTP_*`). OTP is **not** logged.

## Local development (Flutter + Next.js)

Use in **`.env`** (never commit `.env`; copy from `.env.example`):

| Variable | Example | Notes |
|----------|---------|--------|
| `NODE_ENV` | `development` | `next dev` default. |
| `APP_ENV` | `development` | With `ENABLE_DEV_OTP`, enables relaxed mobile JWT rules (see `src/lib/mobile-auth/secrets.ts`). |
| `ENABLE_DEV_OTP` | `true` | Must be `false` on production servers. |
| `DATABASE_URL` | PostgreSQL URL | Required for storing OTP challenges. |
| `OTP_MODE` | `dev` | No SMS gateway needed; read OTP from the terminal where `npm run dev` runs. |
| `MOBILE_JWT_SECRET` or `AUTH_SECRET` | 32+ random chars (recommended) | If unset and dev flags above apply, a **built-in dev-only** JWT secret is used (tokens invalid after secret change). |

Optional: set `MOBILE_JWT_SECRET` to a 16–31 character value only when the three dev flags apply; production builds still require ≥32 characters.

## Production (`https://pranidoctor.com`)

| Variable | Required | Notes |
|----------|----------|--------|
| `NODE_ENV` | `production` | Normal for `next start` / hosting. |
| `APP_ENV` | `production` | Recommended explicit flag. |
| `ENABLE_DEV_OTP` | `false` or unset | **Never** `true` in production. |
| `MOBILE_JWT_SECRET` | **Yes** (≥32 chars) | Prefer dedicated secret, not reused from other apps. |
| `OTP_MODE` | `live` | |
| `SMS_BASE_URL` + `SMS_API_KEY` | **Yes** when `OTP_MODE=live` | Or legacy `SMS_HTTP_URL` + `SMS_HTTP_API_KEY`. |
| `DATABASE_URL` | **Yes** | |

If `OTP_MODE=live` but SMS env is missing, the API returns `SMS_NOT_CONFIGURED` with a Bengali message (no API keys in the response).

## API base URL

- Mobile REST paths: `https://pranidoctor.com/api/mobile/...`
- Flutter: `--dart-define=API_BASE_URL=https://pranidoctor.com` for production builds.

## Phone numbers (Bangladesh)

The API normalizes to `8801XXXXXXXXX` (13 digits). Accepted inputs include:

- `01701022274`
- `8801701022274`
- `+8801701022274`

## Verification (PowerShell examples)

Request OTP (replace host and body as needed):

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/mobile/auth/otp/request" `
  -ContentType "application/json" `
  -Body '{"phone":"+8801701022274"}'
```

Watch the **terminal** running `npm run dev` for `[PraniDoctor OTP DEV]` when `OTP_MODE=dev`.

Verify (use the OTP from the terminal):

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/mobile/auth/otp/verify" `
  -ContentType "application/json" `
  -Body '{"phone":"+8801701022274","code":"123456"}'
```

## Related code

- `src/lib/mobile-auth/secrets.ts` — JWT secret resolution and dev OTP server gate.
- `src/lib/mobile-auth/otp-service.ts` — challenge create/verify, user bootstrap.
- `src/lib/mobile-auth/otp-dispatch.ts` — dev log vs live SMS.
- `src/lib/mobile-auth/otp-live-sms.ts` — live SMS HTTP placeholder.
- `src/lib/sms/providers/http-placeholder.ts` — generic POST body (customize for your SMS vendor).
