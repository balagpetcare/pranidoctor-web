# AI Disclaimer Admin Bug Report

**Date:** 2026-05-30  
**Page:** Admin → Settings → AI Disclaimer (`/admin/settings/ai-disclaimer`)  
**Symptom:** `Invalid response from server` on page load (and save would fail after load was fixed)

---

## Root cause

Two independent issues combined to break the AI Disclaimer admin panel:

### 1. BFF proxy response body never delivered (primary — page load)

**Component:** `pranidoctor-web` backend proxy (`src/lib/proxy-to-backend.ts`)

The Next.js BFF proxies `/api/admin/*` to the Express backend. For responses large enough to be compressed (`compression()` middleware on the backend), upstream fetch **auto-decompresses** the body but the proxy **re-forwarded** `content-encoding: gzip` (or `br`) and streamed `upstream.body` unchanged.

In the Next.js App Router runtime this produced HTTP **200** with headers claiming compressed content while the stream never completed. The browser/`readAdminJson()` could not parse JSON and threw:

```text
Invalid response from server
```

(from `src/lib/admin/read-admin-json.ts` — `res.json()` catch block)

**Why AI Disclaimer specifically:** GET payload (~1.4 KB JSON) exceeds the compression threshold; smaller admin endpoints (401/short JSON) often bypass compression and appeared to work.

### 2. PUT body included read-only `updatedAt` (secondary — save)

**Component:** `src/components/admin/settings/AiDisclaimerAdminPanel.tsx`

`onSave()` sent the full GET DTO including `updatedAt`. Backend `adminAiDisclaimerPutSchema` is `.strict()` and rejects unknown keys → **422** `VALIDATION_ERROR: Invalid body`.

---

## Affected files

| File | Role |
|------|------|
| `pranidoctor-web/src/lib/proxy-to-backend.ts` | BFF proxy — **fixed** (buffer body, strip encoding headers) |
| `pranidoctor-web/src/components/admin/settings/AiDisclaimerAdminPanel.tsx` | Admin UI — **fixed** (PUT sends writable fields only) |
| `pranidoctor-web/src/lib/admin/read-admin-json.ts` | Error surface (`Invalid response from server`) |
| `pranidoctor-web/src/app/api/admin/settings/ai-disclaimer/route.ts` | BFF route (proxy only) |
| `pranidoctor-backend/src/legacy/web/routes/admin/settings/ai-disclaimer/route.ts` | Canonical GET/PUT handler |
| `pranidoctor-backend/src/legacy/web/lib/admin-legal/admin-ai-disclaimer-service.ts` | Service + DB (`setting` table, keys `mobile.ai.disclaimer.config`, legal config) |
| `pranidoctor-backend/src/legacy/web/lib/ai-disclaimer/schemas.ts` | PUT validation schema |

---

## Exact error

**User-visible (load):**

```text
Invalid response from server
```

**Network (before fix):**

- `GET /api/admin/settings/ai-disclaimer` → **200**
- Response headers included `content-encoding: gzip`
- Response body empty / stream hung → client JSON parse failure

**Network (save, after load fix, before panel fix):**

- `PUT /api/admin/settings/ai-disclaimer` → **422**
- Body: `{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "Invalid body", "details": { "formErrors": ["Unrecognized key(s) in object: 'updatedAt'"] } } }`

---

## Fix applied

### Proxy (`proxy-to-backend.ts`)

After upstream fetch:

1. Buffer body with `await upstream.arrayBuffer()`
2. Remove `transfer-encoding`, `content-encoding`, and `content-length` from forwarded headers
3. Return buffered body in a new `Response`

This matches the existing `proxyRouteToBackendNext()` pattern and prevents compressed-header / decompressed-body mismatch.

### Admin panel (`AiDisclaimerAdminPanel.tsx`)

`onSave()` now sends only writable fields:

- `contentVersion`, `enforceAcceptance`, `consentVersion`, `consentTitle`, `consentContent`, `banner`, `contextual`

Read-only `updatedAt` is excluded from PUT.

---

## Verification steps

Run with backend on `:3000` and web admin on `:3001` (local dev).

| Step | Command / action | Expected |
|------|------------------|----------|
| Load settings | Open `/admin/settings/ai-disclaimer` or `GET /api/admin/settings/ai-disclaimer` (authenticated) | `200`, `{ ok: true, data: { contentVersion, banner, contextual, consentVersion, ... } }` |
| Save settings | Edit fields → Save | `200`, success message, `updatedAt` refreshed |
| Bump consent version | Change **Consent version** → Save | Persisted on reload; drives mobile re-prompt |
| Force re-acceptance | Set **Require acceptance** + new consent version → Save | Config stored with `enforceAcceptance: true` |
| Refresh page | Hard refresh | Values match last save |
| Reload persisted values | Navigate away and back | GET returns same stored config |

**Automated smoke (2026-05-30):**

```bash
node tmp-test-ai-disclaimer-full.mjs   # removed after run
```

Results:

- GET via BFF: `ok: true`, consent version loaded
- PUT via BFF: `200`, consent version updated
- Reload: persisted `consentVersion` + `updatedAt`
- Restore: original consent version saved successfully

---

## Investigation checklist (completed)

| # | Check | Result |
|---|--------|--------|
| 1 | Frontend page | `AiDisclaimerAdminPanel` @ `/admin/settings/ai-disclaimer` |
| 2 | API endpoint | `GET/PUT /api/admin/settings/ai-disclaimer` |
| 3 | Network | 200 with undeliverable compressed body (pre-fix) |
| 4 | Request payload | PUT included invalid `updatedAt` (pre-fix) |
| 5 | Response schema | `{ ok, data }` — correct when body arrives |
| 6 | Backend route | Registered via legacy route registry |
| 7 | Controller/service | `getAdminAiDisclaimerSettings` / `updateAdminAiDisclaimerSettings` execute OK |
| 8 | Database | `setting` table via Prisma — OK |
| 9 | Validation | 422 on unknown `updatedAt` (fixed client-side) |
| 10 | Auth | 401 without session; 200 with admin cookie |
| 11 | Serialization | No backend JSON errors; issue was BFF transport |

**Ruled out:** 404, 403, 500 from handler, missing migration, env misconfig (backend reachable; auth OK).

---

## Follow-up (optional)

- Same PUT `updatedAt` pattern exists on `VetDisclaimerAdminPanel` and similar settings panels — consider shared `buildPutBody()` helper or `.strip()` on backend PUT schemas.
- Add a unit test for `proxyOnce()` ensuring `content-encoding` is not forwarded after buffering.
