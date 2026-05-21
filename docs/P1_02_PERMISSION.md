# P1-02 — Permissions Registry (Implementation)

**Date:** 2026-05-21  
**Module:** `permissions-registry`  
**Policy:** Re-export only from legacy path; matrix logic unchanged

---

## 1. Canonical source

| File | Role |
|------|------|
| `src/modules/auth/permissions.registry.ts` | `ROLE_MATRIX`, `adminCan`, `assertAdminCan`, `getAdminCapabilityMatrix` |
| `src/legacy/web/lib/admin-auth/permissions.ts` | Re-exports registry (frozen import path `@/lib/admin-auth/permissions`) |

---

## 2. Capability matrix (unchanged)

| Role | view | review | publish |
|------|------|--------|---------|
| `SUPER_ADMIN` | yes | yes | yes |
| `ADMIN` | yes | yes | no |
| `SUPPORT` | yes | no | no |
| Other roles | — | — | — |

**Forbidden response (frozen):**

```json
{
  "ok": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "এই কাজের জন্য অনুমতি নেই",
    "details": { "capability": "serviceInstance.view" }
  }
}
```

---

## 3. Audit on deny (P1-01 integration)

`assertAdminCan` and `admin-service-instance-service` call `recordAuthAuditFireAndForget` with:

- `action: PERMISSION_DENIED`
- `channel: admin_panel`
- `metadata: { capability }`

---

## 4. Doctor / technician (documented, not matrix-based)

| Panel | Enforcement (legacy) |
|-------|----------------------|
| Doctor | `UserRole.DOCTOR`, `UserStatus.ACTIVE`, `DoctorProfile.providerStatus === ACTIVE` |
| Technician | `UserRole.AI_TECHNICIAN`, active profile, `ProviderStatus.ACTIVE` |

Documented in registry file header comments for Phase 1b RBAC expansion.

---

## 5. Types

`AdminPanelActor` is defined in the registry (same shape as `panel-classify.ts`) and re-exported from legacy `permissions.ts` for consumers.

---

## 6. Tests

```bash
cd pranidoctor-backend
npx vitest run src/modules/auth/permissions.registry.test.ts
```

| Test | Expect |
|------|--------|
| SUPER_ADMIN publish | allowed |
| SUPPORT view | allowed |
| SUPPORT publish | denied |
| Matrix keys | match frozen capabilities |

**Result:** PASS (3 tests)

---

## 7. P1-02 exit

| Criterion | Status |
|-----------|--------|
| Single registry source | YES |
| Legacy re-export | YES |
| `adminCan` behavior identical | YES |
| Unit tests | PASS |
| `BREAKING_CHANGE` | **NO** |
