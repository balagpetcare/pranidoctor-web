# Architecture Freeze

**Date:** 2026-05-21  
**Policy:** Backend-first — feature development proceeds against frozen contracts

## Frozen topology

```
pranidoctor-web (UI + proxy)
    │
    │  HTTP  BACKEND_URL / NEXT_PUBLIC_API_URL
    ▼
pranidoctor-backend (canonical API + Prisma)
    │
    ▼
PostgreSQL
```

| Repo | Owns |
|------|------|
| `pranidoctor-backend` | Prisma schema, migrations, seeds, business logic, `/health`, `/api/docs` |
| `pranidoctor-web` | Next.js UI, API proxies, enum types, archived reference code |

## Frozen components

| Component | Path | Notes |
|-----------|------|-------|
| Compat router | `backend/src/modules/compat-web/` | 172 legacy routes, lazy-loaded |
| Legacy lib | `backend/src/legacy/web/lib/` | Prisma services |
| Web proxy | `web/src/lib/proxy-to-backend.ts` | No DB |
| Web prisma guard | `web/src/lib/prisma.ts` | Throws if used |
| Archive | `web/archive/web-deprecated/` | Do not delete until soak complete |
| OpenAPI | `backend/openapi.json` | `npm run openapi:generate` |

## Explicit non-goals (frozen out)

- No Prisma schema changes from web  
- No web-side migrations  
- No moving folders between repos  
- No rewriting legacy response envelopes  
- No deleting `archive/web-deprecated/` until ops sign-off  

## Feature development workflow

1. Implement API change in **backend** (`legacy/web/routes` or module).  
2. Run `npm run openapi:generate` and verify `/api/docs`.  
3. If web needs new path, add `src/app/api/.../route.ts` proxy (or use `api-client`).  
4. Run `npm run build` on both repos.  
5. Run `npm run e2e:freeze` before release.

## Health & observability

- Ops probes: `/health`, `/health/db`, `/ready`  
- Compat smoke: `/api/ping`  
- Docs: `/api/docs`  

See [HEALTHCHECKS.md](./HEALTHCHECKS.md), [API_REFERENCE.md](./API_REFERENCE.md).

## Sign-off metrics

```
ARCHITECTURE_LOCKED=YES
API_DOCS_READY=YES
E2E_READY=YES
FEATURE_READY=YES
```

| Metric | Value |
|--------|-------|
| WEB_API_READY | YES |
| PRISMA_DEPENDENCY_COUNT (web) | 0 |
| Legacy routes | 172 |
| OpenAPI paths | 172+ health + modules |

## Related documents

- [API_CONTRACT_FREEZE.md](./API_CONTRACT_FREEZE.md)
- [WEB_API_VALIDATION.md](./WEB_API_VALIDATION.md)
- [API_PORT_COMPLETION.md](./API_PORT_COMPLETION.md)
- [SCHEMA_OWNERSHIP_LOCK.md](./SCHEMA_OWNERSHIP_LOCK.md)
