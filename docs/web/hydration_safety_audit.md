# Admin dashboard hydration safety audit

**Stack:** Next.js App Router, React 19, SSR + streaming (Turbopack in dev).  
**Date:** 2026-05-12  
**Scope:** Admin client components, forms, and layout primitives that participate in SSR + hydration.

---

## 1. Executive summary

Hydration mismatches occurred when **server HTML assumed async resources were ready** (or used one boolean for `disabled`) while the **browser’s first paint** still treated those resources as loading. React surfaces this as `disabled={null}` (server) vs `disabled={true}` (client) on native controls such as `<select>` and `<input>`.

Mitigations applied:

1. **`useClientMountReady`** — deterministic `false` on the server and on the first client render; flips to `true` after a microtask so list “busy” flags align across the hydration boundary.
2. **`FormAsyncControlSkeleton`** — replaces loading-phase `<select>` / `<input>` nodes so we do not rely on `disabled` toggles while data is in flight.
3. **Submit gating** — primary save actions stay disabled until reference lists are ready where needed.

No global SSR disable, no `suppressHydrationWarning`, and existing flows (create/edit semen template, service request assignment) are preserved.

---

## 2. Root cause analysis

### Primary cause: async list state vs first paint

Patterns that risk mismatch:

- `useState(true)` for `*Loading` **should** match server and client, but **streaming**, **framework timing**, and **effect ordering** can still produce trees where the server shell and the client’s first pass disagree on whether a list has finished loading.
- Encoding “loading” as **`disabled={loading}` on a real `<select>`** couples **DOM attributes** to **network timing**. Any divergence between server-rendered HTML and the client’s first React pass triggers hydration warnings.

### Secondary causes (audited; not all fixed in code)

| Risk | Location / pattern | Severity | Action |
|------|---------------------|----------|--------|
| `toLocaleString` / `format(date)` | Semen template audit block, lists, panels | Low–medium | Server and client can differ for edge TZ/ICU builds; prefer ISO in SSR or client-only formatting if mismatches appear. |
| `Date.now()` in filenames | `SemenTemplateMediaSection` (upload only) | None for SSR | Only runs in event handlers. |
| `typeof window` in utilities | `cropUtils.ts` | None for SSR | Used for canvas pixel ratio with server fallback. |
| `Math.random()` | Not used in admin form render paths | None | — |
| Theme from `localStorage` | `AdminThemeProvider` | Was risk | Already uses `DEFAULT_ADMIN_THEME` on first paint + `queueMicrotask` to read storage. |
| `crypto.randomUUID()` | Breed row keys on **user action** | None | Not in initial render. |

---

## 3. Hydration audit checklist (tasks 1–10)

1. **Sources identified:** Async-loaded selects/inputs (`ProviderSelect`, semen breed grid, service request doctor/technician pickers), and any future `disabled={loading}` on SSR’d controls.
2. **SSR/client inconsistency:** Loading flags observable on client before stable parity with streamed HTML.
3. **Refactor:** Central hook + skeleton placeholder pattern (hydration-safe architecture).
4. **Identical server / initial client HTML:** `useClientMountReady === false` forces the same “lists busy” branch on server and first client render; skeletons match on both sides.
5. **Mounted / hydrated guards:** `useClientMountReady()` in `src/lib/admin/use-client-mount-ready.ts`.
6. **Deterministic initial states:** Busy = `!clientMountReady || *Loading` for semen lists; `pickersLocked` for assignment pickers.
7. **Loading attribute mismatches:** Avoid `disabled` on missing or not-yet-interactive controls by swapping in skeletons during load.
8. **Skeletons:** `FormAsyncControlSkeleton` in `src/components/admin-ui/FormAsyncControlSkeleton.tsx`.
9. **Audit pass:** No `suppressHydrationWarning` in repo; no `useMediaQuery` in admin components; `window`/`Date`/`random` usages reviewed (see table).
10. **App Router / Turbopack / streaming:** Solution stays compatible — no `dynamic(..., { ssr: false })` for whole forms; only existing lazy chunks unchanged.

---

## 4. Fixed file list

| File | Change |
|------|--------|
| `src/lib/admin/use-client-mount-ready.ts` | **New** — reusable post-mount gate. |
| `src/components/admin-ui/FormAsyncControlSkeleton.tsx` | **New** — accessible pulse placeholder. |
| `src/components/admin-ui/index.ts` | Export skeleton component. |
| `src/components/admin/semen-template/ProviderSelect.tsx` | Loading path renders skeleton (no `disabled` select); loaded path renders `<select>`. |
| `src/components/admin/semen/SemenServiceTemplateForm.tsx` | Uses `useClientMountReady`; `providersListBusy` / `breedsListBusy`; breed row skeletons; submit disabled until lists ready. |
| `src/components/admin/service-requests/ServiceRequestAssignmentActions.tsx` | `pickersLocked` + skeletons for doctor/technician selects; button disabled uses `pickersLocked`. |

---

## 5. Components reviewed without code change (low hydration risk)

- **`DoctorProfileForm` / `TechnicianProfileForm`:** Full-page `AdminLoadingState` until `loadingRefs` clears — no partial disabled selects on SSR.
- **`SemenProviderForm` / `LivestockBreedForm` / `KnowledgeHubPostForm` (edit):** Gated by `loading` or stable empty category list on create.
- **Lists / panels** (`*List.tsx`, detail panels): Spinner or skeleton at root; mismatches unlikely unless inner `disabled` toggles are added later.

---

## 6. Future prevention guidelines

1. **Never bind `disabled` on SSR’d native controls directly to network completion** without also gating on `useClientMountReady()` or an equivalent `getServerSnapshot`-consistent store.
2. **Prefer skeleton or deferred subtree** over a disabled `<select>` for “options loading” — fewer boolean attributes in the diff, clearer UX.
3. **One hook per feature area:** Import `useClientMountReady` from `@/lib/admin/use-client-mount-ready` instead of ad-hoc `useState` + `useEffect` copies.
4. **Dates in SSR HTML:** Prefer fixed timezone + `Intl` with explicit options, or render ISO strings server-side and format in a small client-only child if QA finds locale drift.
5. **Auth-dependent UI:** If JWT/session is only known on the client, default SSR branch to “logged out” UI and upgrade after mount (same gate pattern).
6. **Responsive hooks:** If you add `matchMedia`, use `useSyncExternalStore` with matching server snapshot or render a static server layout tier.
7. **Code review checklist:** For every `use client` form: “Does first server render equal first client render for every DOM attribute?”

---

## 7. Compatibility notes

- **App Router:** Client components still SSR to HTML; fixes operate on that boundary.
- **React hydration:** First client render intentionally matches server; updates occur after `queueMicrotask`.
- **Turbopack:** Avoids reliance on module order for initial boolean state; uses explicit gate.
- **Streaming:** Busy/skeleton phase is stable until the client commits and data effects run.

---

## 8. Verification

After deploy or locally:

1. Open `/admin/semen-service-templates/new` with devtools console — expect **no** hydration mismatch for `ProviderSelect` or breed controls.
2. Open a service request with assignment actions — expect **no** mismatch on doctor/technician pickers.
3. Hard refresh and throttle network — UI should show skeletons, then real controls, without console errors.

---

*End of report.*
