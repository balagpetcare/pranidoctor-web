# Admin login hydration fix

## Problem

`/admin/login` (`AdminLoginForm`) triggered a React hydration mismatch:

- **Server:** no `localStorage` → remember helper hidden, identifier empty, checkbox unchecked.
- **Client (first paint):** `loadRememberedIdentifier()` / `hasRememberedIdentifier()` ran during initial state and in JSX → helper visible, fields prefilled when a value was saved.

Failure surfaced at the remember-me helper block (`hasRememberedIdentifier()` in render).

## Root cause

Browser storage was read in three SSR-unsafe places:

1. `useState(() => loadRememberedIdentifier() ?? "")`
2. `useState(() => hasRememberedIdentifier())`
3. Conditional render: `{hasRememberedIdentifier() ? … : null}`

`remember-login.ts` correctly uses `localStorage`, but those calls must not affect the first render tree on the server or during hydration.

## Fix

**Stable initial render (server + client hydration):**

| State | Initial value |
|-------|----------------|
| `identifier` | `""` |
| `remember` | `false` |
| `showRememberHelper` | `false` |

**Mount-only restore** (`useEffect`):

- Read `loadRememberedIdentifier()` once after mount.
- If present: set identifier, check “Remember me”, show Bengali helper text.

**Render:**

- Helper visibility uses `showRememberHelper` state only (no storage reads in JSX).

**On login without remember:**

- `clearRememberedIdentifier()` and `setShowRememberHelper(false)` so UI stays consistent before redirect.

## Constraints preserved

- SSR enabled (no `dynamic(..., { ssr: false })`).
- No `suppressHydrationWarning`.
- Remember me checkbox, save/clear behavior, and accessibility unchanged.
- No visual redesign.

## Files changed

- `src/components/admin/AdminLoginForm.tsx`

## Manual validation

1. **Fresh visit** — Open `/admin/login`: no hydration error in console; helper hidden if nothing saved.
2. **Refresh** — Hard refresh: still no hydration warning.
3. **Remember me** — Log in with “Remember me” checked; return to login: identifier prefilled, checkbox checked, helper visible (brief empty flash possible before `useEffect`).
4. **Login without remember** — Clear storage on submit; helper hidden on next visit.
5. **Logout** — Log out from admin; login page loads without hydration errors.

## Storage reference

Key: `prani_admin_remember_identifier` (`src/lib/admin-auth/remember-login.ts`). Stores identifier only, never password or tokens.
