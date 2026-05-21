# Web API consumer mode report (Phase 3)

**Date:** 2026-05-21  
**Backend API:** `http://localhost:3000` (Express)  
**Web UI:** Next.js (run on port **3001** recommended to avoid clash with backend :3000)

---

## Environment

### `.env.example` updates

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BACKEND_URL=http://localhost:3000
# DATABASE_URL optional on web (commented)
```

### Production / local `.env`

Add (user-maintained):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BACKEND_URL=http://localhost:3000
```

Existing `NEXT_PUBLIC_API_BASE_URL` retained for backward compatibility.

---

## New modules

| File | Role |
|------|------|
| `src/lib/api-client.ts` | `apiRequest()`, `fetchBackendHealth()`, `getBackendApiBase()` |
| `src/lib/prisma.ts` | **Deprecated** — guarded direct DB; set `WEB_API_ONLY=true` to block |
| `next.config.ts` | `BACKEND_URL` env + optional rewrite `/backend-api/*` → backend |

---

## Health routes migrated (no direct DB)

| Route | Before | After |
|-------|--------|-------|
| `/api/health` | `prisma.$queryRaw` | `fetchBackendHealth()` |
| `/api/mobile/health` | `prisma.$queryRaw` | `fetchBackendHealth()` |
| `/api/admin/health` | `prisma.$queryRaw` | `fetchBackendHealth()` |

Response includes `mode: "api-consumer"` and `database: "via-backend"`.

---

## Prisma import status (transitional)

| Category | Count (approx.) | Status |
|----------|-----------------|--------|
| `@/lib/prisma` (direct DB) | ~60 files | **Unmigrated** — still use `DATABASE_URL` |
| `@/generated/prisma/*` (types/enums) | ~120+ files | **Allowed** — synced from backend |
| Health probes | 3 | **Migrated** to API client |

**WEB_API_READY:** **PARTIAL** — infrastructure + health done; domain services still hit Postgres via `prisma` until ported to backend HTTP APIs.

---

## Recommended dev workflow

```powershell
# Terminal 1 — backend (canonical DB + API)
cd D:\PraniDoctor\pranidoctor-backend
npm run dev:no-docker

# Terminal 2 — web UI (port 3001)
cd D:\PraniDoctor\pranidoctor-web
$env:PORT=3001
npm run dev
```

---

## Next migration steps

1. Port `src/lib/mobile-auth/*` → `POST /api/auth/otp/*` on backend.
2. Replace `@/lib/prisma` in services with `apiRequest()` per domain.
3. Set `WEB_API_ONLY=true` in web `.env` to enforce no direct DB.
4. Remove `@prisma/adapter-pg`, `pg`, and `src/lib/prisma.ts` when imports reach zero.
