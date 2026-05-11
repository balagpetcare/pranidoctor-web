# Mobile OTP — dev vs live (Prani Doctor web)

**Repository:** `pranidoctor-web`  
**Customer app:** calls `POST /api/mobile/auth/otp/request` and `POST /api/mobile/auth/otp/verify` (aliases: `/api/mobile/auth/send-otp`, `/api/mobile/auth/verify-otp`).

## Environment

| Variable | Purpose |
|----------|---------|
| `OTP_MODE` | `dev` (default if unset or not `live`) — no real SMS; OTP in server logs. `live` — send via HTTP SMS gateway. |
| `MOBILE_OTP_TTL_MINUTES` | Preferred challenge lifetime in minutes (default **15** when unset). Overrides `OTP_TTL_MINUTES`. |
| `OTP_TTL_MINUTES` | Legacy alias — used only when `MOBILE_OTP_TTL_MINUTES` is unset (default **15**). |
| `OTP_LENGTH` | Numeric code length (default 6). |
| `OTP_MAX_ATTEMPTS` | Wrong tries before invalidation (default 5). |
| `OTP_RESEND_COOLDOWN_SECONDS` | Min gap between sends per phone (default 60). |
| `OTP_MAX_SENDS_PER_HOUR` | Max sends per phone per rolling window (default 5). |
| `OTP_SEND_WINDOW_MINUTES` | Rolling window for hourly cap (default 60). |
| `OTP_DEBUG_PANEL_ENABLED` | When `true` and `NODE_ENV=production`, allows admin OTP debug UI/API (still **no plain OTP** in prod builds). |

### Live SMS (`OTP_MODE=live`)

Set gateway URL and key (either pair):

- `SMS_BASE_URL` + `SMS_API_KEY`, or  
- `SMS_HTTP_URL` + `SMS_HTTP_API_KEY` (legacy names).

Optional message templates:

- `SMS_OTP_TEMPLATE_BN` — Bengali; use `{{code}}`.
- `SMS_OTP_TEMPLATE` — fallback if BN unset.

Reserved for future vendor-specific wiring (read in `.env.example` only today):

- `SMS_PROVIDER`, `SMS_API_SECRET`, `SMS_SENDER_ID`

Live mode **does not** log the OTP. On misconfiguration the API returns a Bengali error and the server logs a safe developer message.

## How to test locally (terminal OTP)

1. **Database:** `DATABASE_URL` set; run migrations (includes `lastOtpSentAt` on `MobileOtpChallenge`).
2. **Secrets:** `MOBILE_JWT_SECRET` (or `AUTH_SECRET`) ≥ 32 chars.
3. **`.env`:** `OTP_MODE=dev`, `NODE_ENV=development` (typical for `next dev`).
4. **Start backend:** `npm run dev` (from `pranidoctor-web`).
5. **Mobile app:** point API base URL at this server; open customer login.
6. Enter a valid BD mobile number; tap send OTP.
7. **Read OTP** in the terminal line:  
   `[PraniDoctor OTP DEV] phone=01XXXXXXXXX otp=XXXXXX expiresIn=15m`
8. Enter the code in the app and complete login.

Optional: open admin **(ডেভ) OTP লগ** at `/admin/dev-tools/otp-logs` (signed-in admin) to see recent dev sends in non-production (plain OTP shown only when not a production build and `OTP_MODE=dev`).

## Enabling real SMS later

1. Choose an HTTP-capable gateway and obtain URL + API key.
2. Set `OTP_MODE=live`.
3. Set `SMS_BASE_URL` and `SMS_API_KEY` (or `SMS_HTTP_*`).
4. Adjust `SMS_OTP_TEMPLATE_BN` for your provider’s rules if needed.
5. Deploy with `NODE_ENV=production` and **never** set `OTP_MODE=dev`.
6. Keep `OTP_DEBUG_PANEL_ENABLED=false` in production unless you explicitly need the UI; even then, plain OTP is never exposed in production builds.

## Security rules

- **Production:** use `OTP_MODE=live` only; do not rely on dev logs.
- **Never** return the OTP in JSON for customer APIs (current code does not).
- OTP is stored as a **bcrypt hash** in `MobileOtpChallenge`.
- Plain OTP appears in **stdout** only in dev mode.
- Admin debug log memory is **process-local** and cleared on restart; not a durable audit trail.

## API errors (Bengali)

Customers see messages such as:

- Wrong code: `ভুল যাচাইকরণ কোড। আবার চেষ্টা করুন।`
- Expired: `কোডের মেয়াদ শেষ হয়েছে। নতুন কোড পাঠান।`
- Too many attempts: `অনেকবার ভুল কোড দেওয়া হয়েছে। নতুন কোড পাঠান।`
- Resend cooldown: includes remaining seconds.

## Database migration

Apply Prisma migrations so `MobileOtpChallenge.lastOtpSentAt` exists (resend cooldown).

```bash
npx prisma migrate deploy
# or during development:
npm run db:migrate
```
