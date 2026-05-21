# Admin Runtime Certificate

**Project:** Prani Doctor Web  
**Repository:** `pranidoctor-web`  
**Issued:** 2026-05-22  
**Build:** Next.js 16.2.6 (Turbopack)

---

## Certification status

```
ADMIN_RUNTIME_CERTIFIED
```

---

## Certified guarantees

1. **Prisma isolation** — Generated Prisma client is not imported by admin/doctor client UI components. Enum values use local domain contracts under `src/lib/domain/`.
2. **Browser shim safety** — `@/generated/prisma/browser` re-exports `index-browser.js` only (postinstall script enforced).
3. **Node runtime isolation** — `node:fs` / `node:path` confined to `import "server-only"` modules.
4. **Auth proxy** — Panel HTML routes guarded via `src/proxy.ts` (admin, enterprise, doctor).
5. **Observability** — Error boundaries emit single structured logs; request/correlation IDs attached in proxy.
6. **Production build** — `npm run build` completes with zero TypeScript errors.

---

## Validation evidence

| Step | Command / action | Outcome |
|------|------------------|---------|
| Production build | `npm run build` | Exit 0 — 158 routes compiled |
| Dev server | `npm run dev` | `/admin` 200 via `proxy.ts` |
| Client Prisma grep | No `@/generated/prisma/browser` in active UI | Clean |
| Proxy registration | Build route table | `ƒ Proxy (Middleware)` |
| Dashboard timestamp | SSR `generatedAt` coercion | No `toISOString` crash |

---

## Preserved (unchanged behavior)

- Server-side rendering for admin pages
- JWT cookie auth (admin + doctor panels)
- Dashboard client cache and poll interval
- Backend API proxy pattern (no direct Prisma in web API handlers)
- Error boundary fallback UI (`AdminErrorState`)

---

## Sign-off checklist

- [x] Server ↔ client boundary audit complete
- [x] Prisma removed from client UI import graph
- [x] Filesystem APIs server-guarded
- [x] Middleware migrated to proxy (Next 16)
- [x] Error boundary logging deduplicated
- [x] Production build green
- [x] Documentation generated (`ADMIN_BOUNDARY_AUDIT.md`)

---

## Operator notes

After `npm install`, the postinstall script regenerates `browser.ts`. Verify it contains:

```ts
export * from "./index-browser.js";
```

If admin enum values change in backend Prisma schema, update matching constants in `src/lib/domain/` (or re-run domain sync as part of schema migration).

Manual UAT: login at `/admin/login` → dashboard → refresh → logout.

---

**Certificate ID:** `ADMIN-BOUNDARY-20260522`  
**Related:** [ADMIN_BOUNDARY_AUDIT.md](./ADMIN_BOUNDARY_AUDIT.md)
