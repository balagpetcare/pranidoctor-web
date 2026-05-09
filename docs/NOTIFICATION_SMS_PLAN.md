# Notification & SMS architecture — Prani Doctor

Scope: [Prani Doctor](https://pranidoctor.com/) — backend APIs, SMS plumbing, and **minimal web notification inbox** for admin/doctor panels. **Isolation:** no BPA/WPA, Quarbani 2026, or other project concepts.

---

## 1. Audit findings (current state)

### 1.1 Project structure

| Area | Finding |
|------|---------|
| Framework | Next.js **16** (`next` 16.2.6), App Router under `src/app/`. |
| API layout | Namespaced routes: `/api/admin/*`, `/api/doctor/*`, `/api/mobile/*`, `/api/technician/*`. Shared JSON helpers in `src/lib/api-response.ts` (`jsonOk`, `jsonError`). |
| Database | PostgreSQL via Prisma **7**; client generated to `src/generated/prisma`. |
| Auth | **Three panel flows** (httpOnly JWT cookies): admin (`prani_admin_session`), doctor (`prani_doctor_session`), technician (`prani_technician_session`). **Mobile customers** use `Authorization: Bearer <jwt>` with audience `mobile`, role `CUSTOMER` (`requireMobileCustomer` in `src/lib/mobile-auth/guard.ts`). API guards: `requireAdminApiActor`, `requireDoctorApiActor`, `requireTechnicianApiActor`. |
| Middleware | `src/middleware.ts` protects HTML `/admin` and `/doctor` routes; **`/api/*` is not middleware-guarded** — each route validates auth. |

### 1.2 Prisma — `Notification` model status

**Present and sufficient for MVP in-app notifications** (`prisma/schema.prisma`):

- `Notification`: `id`, `userId` → `User`, `type` (`NotificationType` enum), `title`, `body`, `readAt`, `metadataJson`, `createdAt`.
- `User.notifications` relation exists.
- Indexes: `[userId, readAt]`, `[type]`.

**Schema changes for Task Card 15:** **None required** for the MVP API (create/list/mark read). Future optional fields (e.g. `dedupeKey`, `expiresAt`) can be added later without blocking this card.

### 1.3 Environment pattern

- Secrets documented in existing auth plans (`ADMIN_JWT_SECRET`, `MOBILE_JWT_SECRET`, etc.).
- Task requested **`.env.example`**: was **missing** from the repo snapshot used for this work; **`/.env.example` is added** with **placeholder-only** variables for SMS and references to common Prisma/auth vars (no real secrets).

### 1.4 Scripts (`package.json`)

| Script | Purpose |
|--------|---------|
| `lint` | ESLint |
| `build` | `next build` |
| `test` | `vitest run` |
| `typecheck` | `tsc --noEmit` |
| `db:generate` / Prisma | `prisma generate` |

---

## 2. API route design

### 2.1 Endpoints (shared notifications inbox)

Implemented at **`/api/notifications`** (top-level, cross-channel), consistent with the task card while keeping **`/api/mobile/*`** reserved for mobile-specific resources.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/notifications` | List **my** notifications (pagination + optional unread filter). |
| POST | `/api/notifications` | Create a notification **for the authenticated user only** (`userId` from session — prevents spoofing). |
| PATCH | `/api/notifications/[id]/read` | Mark one notification read (ownership enforced). |
| PATCH | `/api/notifications/read-all` | Mark all **my** notifications read. |

### 2.2 Authentication

**New helper:** `requireNotificationViewer(request)` in `src/lib/notifications/guard.ts`.

- If `Authorization` contains `Bearer`, validate **mobile customer JWT only** (same semantics as other mobile APIs — invalid Bearer does **not** fall through to cookies, avoiding ambiguous auth).
- Otherwise resolve **one** panel session: doctor → admin → technician (first match wins after DB resolution).

**Documented limitation:** Support panel uses cookies; mobile app must send Bearer. Same pattern as existing split APIs.

---

## 3. SMS service architecture

### 3.1 Abstraction

- **`SmsProvider` interface** (`src/lib/sms/types.ts`): `sendSms(input): Promise<SmsSendResult>`.
- **`getSmsService()`** (`src/lib/sms/service.ts`): selects implementation from **`SMS_PROVIDER`** env.

### 3.2 Implementations

| Provider key | Behavior |
|----------------|----------|
| `local` (default in development when unset) | **Dev SMS logger**: logs destination + masked body to **stderr** with prefix `[sms][local]`. |
| `noop` | No-op; returns success without sending (tests / disable SMS). |
| `http` | **Production placeholder**: optional `fetch` POST to `SMS_HTTP_URL` with `SMS_HTTP_API_KEY` header when both set; if credentials missing, **does not throw** — returns `ok: false` with reason and logs clearly (placeholder until a real vendor is wired). |

**No external paid SMS SDK** added.

---

## 4. Dev/local SMS logger

- Provider `local` writes structured lines to `console.error` (visible in `next dev` terminal).
- Never logs full OTP in production helpers called from real flows — event helpers pass masked hint where applicable; OTP helper documents masking.

---

## 5. Production SMS placeholder / env design

| Variable | Purpose |
|----------|---------|
| `SMS_PROVIDER` | `local` \| `noop` \| `http` |
| `SMS_HTTP_URL` | Optional HTTPS endpoint for generic REST SMS gateway |
| `SMS_HTTP_API_KEY` | Optional API key sent as `Authorization: Bearer …` |

Missing URL/key when `SMS_PROVIDER=http`: graceful skip + log.

---

## 6. Event trigger map

| Event | In-app notification | SMS |
|-------|---------------------|-----|
| **OTP** | Optional metadata-only pattern via helper | Send OTP SMS via `SmsService` (mask code in logs for local provider). |
| **Request submitted** | Customer: “Request submitted” (`REQUEST_UPDATE`) | Customer phone if present. |
| **Doctor accepted** | Customer: request accepted | Customer SMS (placeholder copy). |
| **Request completed** | Customer: completed | Customer SMS (placeholder copy). |
| **Follow-up reminder (later)** | Placeholder helper — metadata notes scheduled follow-up | Placeholder SMS copy — actual scheduling out of scope |

Helpers live in `src/lib/notifications/events.ts`. Submit / doctor accept / doctor complete are **wired** (see §7.1).

---

## 7. Event integration (continuation) — integration points and status

### 7.1 Wired code paths

| Event | Where | What happens |
|-------|--------|----------------|
| **Request submitted** | `createServiceRequestForCustomer` (`src/lib/mobile-service-requests/service-request-service.ts`) | After insert, `notifyServiceRequestSubmitted(row.id)` (async; failures logged). |
| **Request submitted — admins** | `notifyServiceRequestSubmitted` (`src/lib/notifications/events.ts`) | In-app only: each active `ADMIN` / `SUPER_ADMIN` with `AdminProfile` gets `REQUEST_UPDATE` (`ADMIN_NEW_SERVICE_REQUEST`). No SMS. |
| **Doctor accepted** | `acceptServiceRequestForDoctor` (`src/lib/doctor-service-requests/doctor-service-request-service.ts`) | On transition to `ACCEPTED`, `notifyDoctorAcceptedRequest(requestId)`. |
| **Request completed** | `completeServiceRequestForDoctor` (same file) | On `COMPLETED` success path only, `notifyServiceRequestCompleted(requestId)`. Not called for idempotent `ALREADY_COMPLETED` returns. |

### 7.2 Placeholders / gaps

| Item | Reason |
|------|--------|
| **OTP** | No `/api/mobile/auth/*` OTP send/login route in repo. Use `notifyOtpSms` when built — **never return OTP `code` in JSON** in production. |
| **Doctor notified at submit** | `assignedDoctorId` is unset at creation; only admins get staff alerts until assignment UX exists. |
| **Technician accept/complete** | Technician APIs do not mirror doctor accept/complete in this codebase — no hooks added. |
| **Follow-up reminder** | `notifyFollowUpReminderLaterPlaceholder` only; no job runner in repo. |

### 7.3 SMS safety (local/dev)

- In `src/lib/sms/service.ts`, **`SMS_PROVIDER=http` is ignored when `NODE_ENV !== "production"`** (falls back to **local** stderr logger with a warning) so dev environments do not accidentally call a real HTTP SMS gateway.

### 7.4 Testing notes

- Side effects run **after** successful DB writes; notification/SMS errors are **`console.error` only** and do not fail HTTP handlers.
- Manual: submit mobile request → customer + admin inbox rows + optional customer SMS log; doctor accept → customer; doctor complete → customer.

---

## 8. Implementation checklist

- [x] Audit schema, auth, API conventions, env, scripts.
- [x] Document plan (this file).
- [x] Notification guard + Prisma service helpers.
- [x] API routes: GET/POST `/api/notifications`, PATCH `…/[id]/read`, PATCH `…/read-all`.
- [x] SMS module: interface, local logger, http placeholder, env-driven factory.
- [x] Event helper layer (OTP, request lifecycle, follow-up placeholder).
- [x] `.env.example` placeholders only.
- [x] **Continuation:** Wire service-request submit + doctor accept + doctor complete; admin in-app on submit; OTP documented; non-prod `http` SMS guard.
- [x] **Web UI:** `NotificationListPanel` + `/admin/notifications` + `/doctor/notifications` (nav link).

---

## 9. Testing checklist

- [ ] Manual: mobile Bearer — GET list / POST / PATCH read / PATCH read-all.
- [ ] Manual: doctor cookie session — same endpoints.
- [ ] Confirm `SMS_PROVIDER=local` logs SMS attempts when invoking OTP helper (dev).
- [x] Run `npm run lint`, `npm run build`, `npm test`, `npx prisma validate` (all succeeded after implementation).

---

## 10. Future improvements

- Push notifications (FCM/APNs) and notification preferences per channel.
- Admin/system ability to target arbitrary `userId` with audit log (not exposed on public API).
- Replace `http` placeholder with vendor-specific adapter (Twilio, SSL Wireless, etc.) behind same `SmsProvider` interface.
- Job queue for SMS retries and follow-up reminders (`followUpDate` on `TreatmentCase` / scheduled jobs).
- Link notifications to `serviceRequestId` via `metadataJson` conventions + deep links in apps.

---

## 11. Web notification UI (continuation)

### 11.1 UI audit findings

| Panel | Layout | Notes |
|-------|--------|--------|
| **Admin** | `src/app/admin/(dashboard)/layout.tsx` → `AdminDashboardShell` | Bengali nav; `/admin/notifications` was **placeholder** (`AdminPlaceholder`). |
| **Doctor** | `src/app/doctor/(dashboard)/layout.tsx` → `DoctorDashboardShell` | Bengali nav; **no** notifications route before this task. |
| **Customer (web)** | **None** — landing `src/app/page.tsx` links admin/doctor only; customers use **mobile app + Bearer JWT**. |
| **Technician** | No HTML dashboard in repo (API-only). | |

**API:** `GET/PATCH /api/notifications` exist and accept **panel cookies** (admin/doctor) or **mobile Bearer** (`requireNotificationViewer`).

### 11.2 Recommended minimal UI (implemented)

- Single reusable client component: `src/components/notifications/NotificationListPanel.tsx`.
- **List** from `GET /api/notifications` (limit 50, optional unread-only filter).
- **Unread/read** badge from `readAt`.
- **Mark one read:** `PATCH /api/notifications/[id]/read`.
- **Mark all read:** `PATCH /api/notifications/read-all`.
- Bengali copy; **emerald** accents on admin page, **teal** on doctor page (`accent` prop).
- **No** global dashboard redesign; **no** new UI libraries.

### 11.3 Routes implemented

| Route | Purpose |
|-------|---------|
| `/admin/notifications` | Real inbox (replaces placeholder). |
| `/doctor/notifications` | New inbox page; nav link added in `DoctorDashboardShell`. |

**Not implemented:** `/notifications` — no authenticated customer web session; mobile app should call the same API with Bearer token.

### 11.4 Mobile app (Flutter)

- **Implemented** in `pranidoctor-mobile`: `NotificationsListScreen`, repository + providers, `/notifications` route, হোম + প্রোফাইল entry — see `docs/MOBILE_NOTIFICATION_PLAN.md`.
- **Pending:** customer JWT persisted via login (`writeAccessToken`) when mobile auth ships.

---

## 12. Task Card 15 — Final verification summary

### 12.1 Completed (scope met)

| Area | Status |
|------|--------|
| Prisma `Notification` model | Used as-is (no breaking schema change for card). |
| `/api/notifications` CRUD-style inbox | GET / POST / PATCH read / PATCH read-all implemented. |
| `requireNotificationViewer` | Bearer mobile **or** panel cookies (doctor → admin → technician). |
| SMS abstraction | `local`, `noop`, `http` placeholder; **no paid SMS SDK**. |
| Event helpers + wiring | Submit (customer + admin in-app + customer SMS), doctor accept, doctor complete; OTP helper present (no route yet); follow-up stub. |
| Non-prod SMS guard | `SMS_PROVIDER=http` forced to local logger when `NODE_ENV !== "production"`. |
| Web inbox UI | `/admin/notifications`, `/doctor/notifications` + shared `NotificationListPanel`. |
| `.env.example` | SMS + auth placeholders documented. |

### 12.2 Pending / follow-up

| Item | Notes |
|------|--------|
| Manual QA | §9 manual checklist (mobile Bearer, doctor cookie, OTP local log). |
| OTP API route | Call `notifyOtpSms`; never return code in JSON. |
| Customer web `/notifications` | No session — intentional; mobile uses Bearer. |
| Technician panel inbox | Optional if technician HTML dashboard is added later. |
| Vendor-specific SMS | Replace or extend `http` placeholder with Twilio / SSL Wireless / etc. |

### 12.3 Known limitations

- **Doctor at submit:** No in-app alert to a specific doctor until admin assigns (`assignedDoctorId` unset at create).
- **Technician flows:** No notification hooks on technician accept/complete (API surface differs from doctor).
- **Follow-up reminders:** Stub only — no queue/cron.
- **Mobile auth:** Flutter `writeAccessToken` not wired — notifications API returns 401 until JWT is stored.

### 12.4 Production SMS setup notes

1. Set `NODE_ENV=production` on the server so `SMS_PROVIDER=http` is honored (non-production forces local logger).
2. Configure **`SMS_HTTP_URL`** (HTTPS) and **`SMS_HTTP_API_KEY`** for the generic REST placeholder, **or** implement a dedicated `SmsProvider` adapter for your vendor and register it in `createSmsService()` / env switch.
3. Until URL + key are set, `http` provider skips sends gracefully (`ok: false`, `MISSING_SMS_CREDENTIALS`).
4. Keep **`MOBILE_JWT_SECRET`** / **`AUTH_SECRET`** and DB credentials out of source control; use hosting secrets manager.

### 12.5 Mobile push notification — future plan

- **FCM (Android) / APNs (iOS):** device token registration API, store tokens per `User`, send from backend on events already wired in-app.
- **Deep links:** `metadataJson.serviceRequestId` → open service request in app.
- **Preferences:** per-channel toggles (SMS / push / in-app) — not in Task Card 15.

---

## 13. References

- Prisma: `model Notification` in `prisma/schema.prisma`.
- Mobile auth: `src/lib/mobile-auth/guard.ts`.
- Panel guards: `src/lib/admin-auth/api-guard.ts`, `src/lib/doctor-auth/api-guard.ts`, `src/lib/technician-auth/api-guard.ts`.
- Flutter mobile plan: `pranidoctor-mobile/docs/MOBILE_NOTIFICATION_PLAN.md`.
