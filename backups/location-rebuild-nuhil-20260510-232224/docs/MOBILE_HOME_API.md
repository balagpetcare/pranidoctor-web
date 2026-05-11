# Mobile customer API — home screen wiring

Minimal routes added or extended for the Flutter customer app. All responses use `{ ok: true, data: ... }` unless noted.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/mobile/me` | Bearer mobile JWT | Profile: `name`, `phone`, `email`, `area` (from `CustomerProfile.addressJson.areaLabel`), `role`, `profilePhotoUrl` |
| PATCH | `/api/mobile/me` | Bearer | Partial update: `name`, `email`, `area` (stored as `addressJson.areaLabel`) |
| GET | `/api/mobile/app-config` | Bearer | `emergencyPhone` from env `MOBILE_EMERGENCY_PHONE` (optional) |
| GET | `/api/mobile/service-categories` | Bearer | Existing — category `id` / `slug` for home filters |
| GET | `/api/mobile/providers/doctors` | Bearer | Existing — list now includes `profilePhotoUrl` when set on `DoctorProfile` |
| GET | `/api/mobile/notifications` | Bearer | List + `total` (same semantics as panel `/api/notifications`) |
| PATCH | `/api/mobile/notifications/:id/read` | Bearer | Mark one read |
| PATCH | `/api/mobile/notifications/read-all` | Bearer | Mark all read; returns `updatedCount` |

`area` on the customer profile is MVP JSON (`addressJson.areaLabel`) — no Prisma migration.
