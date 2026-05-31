# Admin panel credentials (environment-only)

**Project:** Prani Doctor — `https://pranidoctor.com/`  
**Repository:** `pranidoctor-web`

This document describes how to create or rotate the **operator** account for the web admin panel using `.env` variables and the dedicated seed script. Credentials are **never** hardcoded in application source.

---

## What the admin panel checks

The admin login API (`POST /api/admin/auth/login`) verifies:

- `User.email` + `User.passwordHash` (bcrypt, same cost as seed scripts)
- `User.role` is `ADMIN` or `SUPER_ADMIN`
- `User.status` is `ACTIVE`
- An `AdminProfile` row exists for that user

Session cookies use a signed JWT. The signing secret must be at least **32 characters** after trimming.

---

## Required and recommended environment variables

### Database (required for seeding)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string for Prisma |

### Panel admin bootstrap (required for `npm run seed:admin`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `ADMIN_SEED_EMAIL` | Yes | Login email (stored normalized to lowercase) |
| `ADMIN_SEED_PASSWORD` | Yes | Plain password — hashed by the seed script; **never logged** |
| `ADMIN_SEED_NAME` | No | `AdminProfile.displayName` (default: `Prani Doctor Admin`) |
| `ADMIN_SEED_PHONE` | No | `User.phone` (optional; must stay unique in the DB if set) |

### Admin session JWT (required to log in after seeding)

At least one of these must be set to a **random string of 32+ characters**:

| Variable | Notes |
|----------|--------|
| `ADMIN_JWT_SECRET` | **Preferred** for the admin panel |
| `AUTH_SECRET` | Fallback used by several Next.js patterns |
| `JWT_SECRET` | Additional fallback if the two above are unset |

Other panels (doctor, technician, mobile) use their own secrets; see `.env.example`.

### Optional

| Variable | Purpose |
|----------|---------|
| `APP_URL` | Public site base URL (e.g. `http://localhost:3001` locally for Next.js, `https://pranidoctor.com` in production) for links and future features |

Copy `.env.example` to `.env` and fill in real values. **Do not commit `.env`.**

---

## How to create or update admin credentials

1. Set `DATABASE_URL` and the `ADMIN_SEED_*` variables in `.env` (use a strong password).
2. Set `ADMIN_JWT_SECRET` (or `AUTH_SECRET` / `JWT_SECRET`) to a long random value.
3. Run the admin-only seed (upserts by email, refreshes hash and profile fields):

   ```bash
   npm run seed:admin
   ```

The script:

- Validates required variables (throws if `ADMIN_SEED_EMAIL` or `ADMIN_SEED_PASSWORD` is missing)
- Hashes the password with **bcrypt cost 12** (same as login verification)
- Upserts the `User` and `AdminProfile`
- Sets `User.status` to `ACTIVE` and role to `ADMIN` (or keeps `SUPER_ADMIN` if that user already exists)
- Prints only safe messages (email and role — **never** the password)

### Full database seed (optional)

The main Prisma seed (`npm run db:seed` / `npm run seed`) also upserts a panel admin when **any** of these pairs are set, in order of precedence:

- `ADMIN_SEED_EMAIL` + `ADMIN_SEED_PASSWORD` (recommended)
- `DEFAULT_ADMIN_EMAIL` + `DEFAULT_ADMIN_PASSWORD`
- Legacy: `PRANI_SEED_ADMIN_EMAIL` + `PRANI_SEED_ADMIN_PASSWORD`

Display name and phone follow the same precedence as in `prisma/seed.ts` (see `.env.example` comments for older names).

---

## How to log in

1. Start the app (`npm run dev` or your production process).
2. Open the admin login page:

   - **Local:** `http://localhost:3001/admin/login`
   - **Production:** `https://pranidoctor.com/admin/login`

3. Sign in with the **same** `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` values from your `.env` (not the hash).

If login returns “server misconfigured”, verify an admin JWT secret (32+ characters) is set.

---

## Security notes

- **Never commit `.env`** or real credentials; use secret managers in production.
- **Change the production password** from any sample or initial seed value; rotate after sharing staging access.
- Use a **strong, unique password** (length and entropy); the sample in `.env.example` is for local setup only.
- Restrict who can run `seed:admin` in production (CI/CD or break-glass access only).
- Treat `ADMIN_JWT_SECRET` / `AUTH_SECRET` / `JWT_SECRET` like cryptographic keys: rotate if leaked.

---

## Related code (audit reference)

| Area | Location |
|------|-----------|
| Prisma `User`, `AdminProfile`, `UserRole`, `UserStatus` | `prisma/schema.prisma` |
| Admin login API | `src/app/api/admin/auth/login/route.ts` |
| JWT + cookie helpers | `src/lib/admin-auth/` |
| Dedicated admin seed | `prisma/seed-admin.ts` |
| Full seed (includes panel admin when env is set) | `prisma/seed.ts` |
