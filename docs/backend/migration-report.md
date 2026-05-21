# Database Migration Report

**Phase:** Database Implementation  
**Date:** 2026-05-21  
**Status:** Complete  
**Migration:** `20260521120000_foundation_core_tables`

---

## Overview

Implemented the core PostgreSQL database layer for the Prani Doctor backend using Prisma 7 with a formal migration system, modular seed structure, and foundation tables for users, roles, sessions, audit, and files.

---

## Schema Summary

| Table | Model | Primary Key | Soft Delete |
|-------|-------|-------------|-------------|
| `roles` | Role | UUID | `deletedAt` |
| `users` | User | UUID | `deletedAt` |
| `user_sessions` | UserSession | UUID | `deletedAt` |
| `refresh_tokens` | RefreshToken | UUID | — (revoked flag) |
| `audit_logs` | AuditLog | UUID | — (immutable) |
| `uploaded_files` | UploadedFile | UUID | `deletedAt` |

---

## Design Decisions

### UUID primary keys

All core tables use PostgreSQL `UUID` with `@default(uuid())`:

```prisma
id String @id @default(uuid()) @db.Uuid
```

### Timestamps

Every mutable table includes:

- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`

### Soft delete

Applied to: `roles`, `users`, `user_sessions`, `uploaded_files`

Pattern:

```typescript
import { activeOnly, softDeleteData } from '@shared/database';

await prisma.user.findMany({ where: { ...activeOnly } });
await prisma.user.update({ where: { id }, data: softDeleteData() });
```

Audit logs are **append-only** (no soft delete).

### Indexing strategy

| Table | Indexes |
|-------|---------|
| users | `roleId`, `status`, `tenantId`, `deletedAt`, `(roleId, status)`, `phone`, `email` |
| roles | `level`, `deletedAt` |
| user_sessions | `userId`, `(userId, status)`, `deviceId`, `expiresAt`, `status`, `tenantId` |
| refresh_tokens | `userId`, `sessionId`, `expiresAt`, `revoked` |
| audit_logs | `action`, `actorId`, `severity`, `createdAt`, `tenantId`, `(targetType, targetId)` |
| uploaded_files | `ownerUserId`, `(context, createdAt)`, `status`, `fileCategory`, `tenantId` |

---

## Entity Relationships

```
roles ──< users ──< user_sessions ──< refresh_tokens
          │
          ├──< audit_logs (actor)
          └──< uploaded_files (owner)
```

---

## Tables Detail

### roles

RBAC role definitions with hierarchy level and JSON permissions array.

| Column | Type | Notes |
|--------|------|-------|
| name | TEXT UNIQUE | `USER`, `ADMIN`, `SUPER_ADMIN`, etc. |
| level | INT | 1–7 hierarchy |
| permissions | JSONB | Permission string array |
| isSystem | BOOL | Prevents accidental deletion |

### users

| Column | Type | Notes |
|--------|------|-------|
| email | TEXT UNIQUE | Optional (OTP users) |
| phone | TEXT UNIQUE | E.164 format |
| passwordHash | TEXT | Optional (OTP-first auth) |
| roleId | UUID FK | → roles |
| tenantId | UUID | Multi-tenancy ready |
| status | ENUM | ACTIVE, SUSPENDED, etc. |

### user_sessions

PostgreSQL persistence for sessions (complements Redis hot cache from Phase 1.4).

| Column | Type | Notes |
|--------|------|-------|
| context | ENUM | MOBILE, ADMIN, DOCTOR, TECHNICIAN, API |
| status | ENUM | ACTIVE, REVOKED, EXPIRED |
| deviceId | TEXT | Multi-device support |
| mfaVerified | BOOL | MFA-ready |
| expiresAt | TIMESTAMP | TTL enforcement |

### refresh_tokens

Token rotation chain with `rotatedToId` self-reference.

### audit_logs

Immutable security audit trail aligned with Phase 1.4 audit service.

| Column | Type | Notes |
|--------|------|-------|
| action | TEXT | e.g. `AUTH_LOGIN`, `USER_UPDATE` |
| severity | ENUM | INFO, WARNING, CRITICAL |
| outcome | ENUM | SUCCESS, FAILURE, PARTIAL |
| details | JSONB | Arbitrary context |
| changes | JSONB | Field-level diff |

### uploaded_files

Replaces the interim `Media` model. Canonical file metadata table.

| Column | Type | Notes |
|--------|------|-------|
| fileId | TEXT UNIQUE | External ID for S3 key |
| storageKey | TEXT UNIQUE | `uploads/{context}/{yyyy}/{mm}/...` |
| fileCategory | ENUM | PROFILE_PHOTO, DOCUMENT, etc. |
| thumbnailKey | TEXT | WebP thumbnail path |
| compressedKey | TEXT | Compressed variant path |

---

## Migration System

### Prisma 7 configuration

`prisma.config.ts` (project root):

```typescript
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  datasource: { url: process.env['DATABASE_URL'] },
});
```

### Initial migration

```
prisma/migrations/
├── migration_lock.toml
├── README.md
└── 20260521120000_foundation_core_tables/
    └── migration.sql
```

### Commands

| Script | Command |
|--------|---------|
| Generate client | `npm run db:generate` |
| Dev migrate | `npm run db:migrate` |
| Deploy migrate | `npm run db:migrate:deploy` |
| Seed | `npm run db:seed` |
| Studio | `npm run db:studio` |

### Apply migration

```bash
# 1. Ensure PostgreSQL is running
docker compose up -d postgres

# 2. Copy and configure environment
cp .env.example .env

# 3. Apply migrations
npm run db:migrate:deploy

# 4. Seed reference data
npm run db:seed
```

---

## Seed Structure

```
prisma/
├── seed.ts                 # Orchestrator
└── seed-data/
    ├── roles.ts            # 7 system roles with permissions
    └── users.ts            # Dev admin + mobile user (non-prod)
```

### Seeded roles

| Role | Level | Description |
|------|-------|-------------|
| USER | 1 | Mobile customer |
| SUPPORT | 2 | Support agent |
| TECHNICIAN | 3 | Field technician |
| DOCTOR | 4 | Veterinarian |
| MANAGER | 5 | Operations manager |
| ADMIN | 6 | Platform admin |
| SUPER_ADMIN | 7 | Full access |

### Development users (non-production)

| User | Email/Phone | Role |
|------|-------------|------|
| Dev Admin | `admin@pranidoctor.local` | ADMIN |
| Dev Mobile | `+8801700000002` | USER |

Override via env: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_PHONE`.

---

## Enums Created

- `UserStatus` — ACTIVE, SUSPENDED, PENDING_VERIFICATION, INVITED, DELETED
- `AuthContext` — MOBILE, ADMIN, DOCTOR, TECHNICIAN, API
- `SessionStatus` — ACTIVE, REVOKED, EXPIRED
- `AuditSeverity` — INFO, WARNING, CRITICAL
- `AuditOutcome` — SUCCESS, FAILURE, PARTIAL
- `UploadedFileStatus` — PENDING, ACTIVE, DELETED
- `FileCategory` — PROFILE_PHOTO, COVER_IMAGE, NID_*, etc.

---

## Code Integration

| Component | Change |
|-----------|--------|
| `prisma.config.ts` | Prisma 7 CLI config with datasource URL |
| `prisma/schema.prisma` | Full foundation schema |
| `src/shared/database/soft-delete.ts` | Soft-delete helpers |
| `src/modules/media/media.repository.ts` | Uses `uploadedFile` model |
| `src/generated/prisma/` | Generated client output |

---

## Breaking Changes

| Before | After |
|--------|-------|
| `Media` model / `media` table | `UploadedFile` / `uploaded_files` |
| `HealthCheck` placeholder | Removed |
| `cuid()` IDs | `uuid()` IDs |
| `url` in schema datasource | `prisma.config.ts` datasource |

---

## Verification Checklist

- [x] Prisma schema with users, roles, sessions, audit, files
- [x] UUID primary keys on all core tables
- [x] `createdAt` / `updatedAt` timestamps
- [x] Soft delete via `deletedAt` where applicable
- [x] Indexes on foreign keys and query patterns
- [x] Migration SQL file created
- [x] `migration_lock.toml` for PostgreSQL
- [x] Modular seed structure (roles + dev users)
- [x] Prisma client generates successfully
- [x] Media repository updated for `uploaded_files`
- [x] Migration report documentation

---

## Next Steps

1. Run `npm run db:migrate:deploy` against development database
2. Run `npm run db:seed` to populate roles
3. Wire auth module repositories to `users` / `user_sessions` tables
4. Migrate Redis audit logs to `audit_logs` table (async worker)
5. Import full domain schema from `pranidoctor-web` in subsequent migrations
