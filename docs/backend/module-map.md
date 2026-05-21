# Module Map — Prani Doctor Backend

**Generated:** 2026-05-21
**Phase:** 1.2 — Modular System
**Location:** `D:\PraniDoctor\pranidoctor-backend\src\modules\`

---

## 1. Module Overview

| Module | Version | Dependencies | Description |
|--------|---------|--------------|-------------|
| `auth` | 1.0.0 | *none* | OTP authentication, JWT tokens, sessions |
| `users` | 1.0.0 | auth | User management and profiles |
| `doctors` | 1.0.0 | auth, users | Doctor verification and scheduling |
| `leads` | 1.0.0 | auth, users | Lead tracking and conversion |
| `animals` | 1.0.0 | auth, users | Animal records and medical history |
| `clinics` | 1.0.0 | auth, users, doctors | Clinic management and services |
| `notifications` | 1.0.0 | auth, users | SMS, Email, Push, In-App notifications |
| `ai` | 1.0.0 | auth, users, notifications | AI chat and conversation management |

---

## 2. Dependency Graph

```
                    ┌─────────────┐
                    │    auth     │
                    │ (no deps)   │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────────┐
    │  users   │    │  users   │    │    users     │
    └────┬─────┘    └────┬─────┘    └──────┬───────┘
         │               │                 │
    ┌────┴────┐    ┌─────┴─────┐    ┌──────┴───────┐
    │         │    │           │    │              │
    ▼         ▼    ▼           ▼    ▼              ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐
│doctors │ │ leads  │ │animals │ │clinics │ │notifications │
└───┬────┘ └────────┘ └────────┘ └───┬────┘ └──────┬───────┘
    │                                │             │
    └────────────────┬───────────────┘             │
                     │                             │
                     ▼                             │
                ┌─────────┐                        │
                │ clinics │◄───────────────────────┘
                └────┬────┘
                     │
                     ▼
                ┌─────────┐
                │   ai    │
                └─────────┘
```

### Initialization Order (Topological Sort)

1. `auth` — No dependencies
2. `users` — Depends on auth
3. `doctors` — Depends on auth, users
4. `leads` — Depends on auth, users
5. `animals` — Depends on auth, users
6. `clinics` — Depends on auth, users, doctors
7. `notifications` — Depends on auth, users
8. `ai` — Depends on auth, users, notifications

---

## 3. Module Structure

Each module follows the same structure:

```
modules/{name}/
├── {name}.types.ts        # Domain types and interfaces
├── {name}.dto.ts          # Data Transfer Objects
├── {name}.validator.ts    # Zod validation schemas
├── {name}.repository.ts   # Data access layer
├── {name}.service.ts      # Business logic
├── {name}.controller.ts   # HTTP handlers
├── {name}.routes.ts       # Express routes
├── {name}.events.ts       # Domain events
├── {name}.module.ts       # Module definition
└── index.ts               # Public exports
```

---

## 4. Module Details

### 4.1 Auth Module

**Path:** `src/modules/auth/`

**Purpose:** Authentication and authorization

**Key Types:**
- `OtpChallenge` — OTP verification state
- `TokenPayload` — JWT token structure
- `AuthTokens` — Access/refresh token pair

**Routes:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/otp/request` | Request OTP code |
| POST | `/api/auth/otp/verify` | Verify OTP and get tokens |
| POST | `/api/auth/token/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout and revoke token |

**Events:**
- `auth.otp.requested`
- `auth.otp.verified`
- `auth.login`
- `auth.logout`

---

### 4.2 Users Module

**Path:** `src/modules/users/`

**Purpose:** User management and profiles

**Key Types:**
- `User` — Core user entity
- `UserProfile` — Extended profile data
- `UserPreferences` — User settings

**Routes:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | Get current user |
| GET | `/api/users/me/profile` | Get user profile |
| PATCH | `/api/users/me/profile` | Update profile |
| GET | `/api/users/` | List users (admin) |
| GET | `/api/users/:id` | Get user by ID |
| PATCH | `/api/users/:id` | Update user |

**Events:**
- `user.created`
- `user.updated`
- `user.deleted`

---

### 4.3 Doctors Module

**Path:** `src/modules/doctors/`

**Purpose:** Doctor management and verification

**Key Types:**
- `Doctor` — Doctor entity with specialization
- `DoctorSchedule` — Availability schedule
- `DoctorSpecialization` — Enum of specialties

**Routes:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/doctors/` | Register as doctor |
| GET | `/api/doctors/` | List doctors |
| GET | `/api/doctors/:id` | Get doctor details |
| PATCH | `/api/doctors/:id` | Update doctor |
| POST | `/api/doctors/:id/verify` | Verify doctor (admin) |
| GET | `/api/doctors/:id/schedule` | Get schedule |
| PUT | `/api/doctors/:id/schedule` | Set schedule |

**Events:**
- `doctor.created`
- `doctor.updated`
- `doctor.verified`

---

### 4.4 Leads Module

**Path:** `src/modules/leads/`

**Purpose:** Lead tracking and conversion

**Key Types:**
- `Lead` — Potential customer
- `LeadActivity` — Activity timeline
- `LeadSource` — Origin of lead

**Routes:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/leads/` | Create lead |
| GET | `/api/leads/` | List leads |
| GET | `/api/leads/:id` | Get lead details |
| PATCH | `/api/leads/:id` | Update lead |
| POST | `/api/leads/:id/assign` | Assign lead |
| POST | `/api/leads/:id/convert` | Convert to user |
| GET | `/api/leads/:id/activities` | Get activity history |

**Events:**
- `lead.created`
- `lead.assigned`
- `lead.status.changed`
- `lead.converted`

---

### 4.5 Animals Module

**Path:** `src/modules/animals/`

**Purpose:** Animal records and medical history

**Key Types:**
- `Animal` — Pet/livestock entity
- `AnimalMedicalRecord` — Medical history entry
- `AnimalSpecies` — Species categories

**Routes:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/animals/` | Register animal |
| GET | `/api/animals/` | List animals |
| GET | `/api/animals/owner/:ownerId` | Get by owner |
| GET | `/api/animals/:id` | Get animal |
| PATCH | `/api/animals/:id` | Update animal |
| DELETE | `/api/animals/:id` | Delete animal |
| GET | `/api/animals/:id/medical-records` | Get records |
| POST | `/api/animals/medical-records` | Add record |

**Events:**
- `animal.created`
- `animal.updated`

---

### 4.6 Clinics Module

**Path:** `src/modules/clinics/`

**Purpose:** Clinic management and services

**Key Types:**
- `Clinic` — Veterinary clinic entity
- `ClinicService` — Services offered
- `ClinicStaff` — Staff members
- `OperatingHours` — Business hours

**Routes:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/clinics/` | Create clinic |
| GET | `/api/clinics/` | List clinics |
| GET | `/api/clinics/slug/:slug` | Get by slug |
| GET | `/api/clinics/:id` | Get clinic |
| PATCH | `/api/clinics/:id` | Update clinic |
| GET | `/api/clinics/:id/services` | Get services |
| POST | `/api/clinics/services` | Add service |
| DELETE | `/api/clinics/services/:serviceId` | Remove service |
| GET | `/api/clinics/:id/staff` | Get staff |
| POST | `/api/clinics/staff` | Add staff |
| DELETE | `/api/clinics/staff/:staffId` | Remove staff |

**Events:**
- `clinic.created`
- `clinic.updated`

---

### 4.7 Notifications Module

**Path:** `src/modules/notifications/`

**Purpose:** Multi-channel notifications

**Key Types:**
- `Notification` — Notification entity
- `NotificationTemplate` — Message templates
- `NotificationChannel` — SMS, Email, Push, In-App

**Routes:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/notifications/send` | Send notification |
| POST | `/api/notifications/sms` | Send SMS directly |
| POST | `/api/notifications/push` | Send push notification |
| GET | `/api/notifications/` | List all (admin) |
| GET | `/api/notifications/me` | Get my notifications |
| GET | `/api/notifications/me/unread-count` | Unread count |
| POST | `/api/notifications/read` | Mark as read |
| POST | `/api/notifications/read-all` | Mark all as read |

**Events:**
- `notification.created`
- `notification.sent`
- `notification.failed`

---

### 4.8 AI Module

**Path:** `src/modules/ai/`

**Purpose:** AI-powered veterinary chat

**Key Types:**
- `AiConversation` — Chat session
- `AiMessage` — Individual message
- `EmergencyLevel` — Urgency classification
- `AiUsageRecord` — Token usage tracking

**Routes:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/ai/conversations` | Start conversation |
| POST | `/api/ai/chat` | Send message |
| GET | `/api/ai/conversations` | List conversations |
| GET | `/api/ai/conversations/:id` | Get conversation |
| POST | `/api/ai/conversations/:id/end` | End conversation |
| GET | `/api/ai/conversations/:id/messages` | Get messages |

**Events:**
- `ai.conversation.started`
- `ai.conversation.ended`
- `ai.message.sent`
- `ai.emergency.detected`

---

## 5. Module Infrastructure

### 5.1 Module Registry

**Location:** `src/shared/module/module-registry.ts`

Manages module lifecycle:
- Registration with dependency validation
- Topological initialization order
- Service lookup across modules
- Graceful shutdown

```typescript
import { moduleRegistry } from '@shared/module';

// Register module
moduleRegistry.register(authModule);

// Get service from another module
const usersService = moduleRegistry.getService<UsersServiceInterface>('users', 'UsersService');
```

### 5.2 Dependency Guard

**Location:** `src/shared/module/dependency-guard.ts`

Validates module dependencies:
- Detects circular dependencies
- Ensures all dependencies exist
- Calculates initialization order

### 5.3 Module Loader

**Location:** `src/shared/module/module-loader.ts`

Auto-loads and mounts modules:

```typescript
import { loadModules } from '@shared/module';
import { createAllModules } from '@modules';

await loadModules(app, createAllModules(), { apiPrefix: '/api' });
```

### 5.4 Base Module

**Location:** `src/shared/module/base-module.ts`

Abstract base class for all modules:
- Provides router instance
- Manages service registration
- Defines module lifecycle hooks

---

## 6. Cross-Module Communication

### Rules

1. **Service Layer Only**: Cross-module calls must go through the service layer
2. **No Direct Imports**: Never import repository or controller from another module
3. **Event-Driven**: Use events for loose coupling between modules
4. **Dependency Declaration**: All dependencies must be declared in metadata

### Patterns

**Getting a Service:**

```typescript
// In AiService
import { moduleRegistry } from '@shared/module';
import type { NotificationsServiceInterface } from '@modules/notifications';

const notificationsService = moduleRegistry.getService<NotificationsServiceInterface>(
  'notifications',
  'NotificationsService'
);

await notificationsService.send({ ... });
```

**Emitting Events:**

```typescript
// In AuthService
import { eventBus, EventTypes } from '@shared/events';

await eventBus.publish(EventTypes.AUTH_LOGIN, payload, 'auth');
```

**Subscribing to Events:**

```typescript
// In NotificationsModule.initialize()
import { eventBus, EventTypes } from '@shared/events';

eventBus.subscribe(EventTypes.AI_EMERGENCY_DETECTED, async (event) => {
  // Send emergency notification
});
```

---

## 7. Event Types

All domain events are defined in `src/shared/events/event.types.ts`:

| Event | Source Module | Description |
|-------|---------------|-------------|
| `user.created` | users | New user registered |
| `user.updated` | users | User profile changed |
| `user.deleted` | users | User deleted |
| `auth.otp.requested` | auth | OTP code sent |
| `auth.otp.verified` | auth | OTP verified |
| `auth.login` | auth | User logged in |
| `auth.logout` | auth | User logged out |
| `doctor.created` | doctors | Doctor registered |
| `doctor.updated` | doctors | Doctor updated |
| `doctor.verified` | doctors | Doctor verified |
| `lead.created` | leads | New lead |
| `lead.assigned` | leads | Lead assigned |
| `lead.status.changed` | leads | Lead status updated |
| `lead.converted` | leads | Lead converted to user |
| `animal.created` | animals | Animal registered |
| `animal.updated` | animals | Animal updated |
| `clinic.created` | clinics | Clinic created |
| `clinic.updated` | clinics | Clinic updated |
| `ai.conversation.started` | ai | Chat started |
| `ai.conversation.ended` | ai | Chat ended |
| `ai.message.sent` | ai | Message exchanged |
| `ai.emergency.detected` | ai | Emergency condition |
| `notification.created` | notifications | Notification queued |
| `notification.sent` | notifications | Notification delivered |
| `notification.failed` | notifications | Delivery failed |

---

## 8. Implementation Status

| Component | Status |
|-----------|--------|
| Module infrastructure | ✅ Complete |
| Auth module structure | ✅ Complete |
| Users module structure | ✅ Complete |
| Doctors module structure | ✅ Complete |
| Leads module structure | ✅ Complete |
| Animals module structure | ✅ Complete |
| Clinics module structure | ✅ Complete |
| AI module structure | ✅ Complete |
| Notifications module structure | ✅ Complete |
| Repository implementations | ⏳ Phase 1.3 (DB migration) |
| Service business logic | ⏳ Phase 1.3+ |
| AI provider integration | ⏳ Phase 2 |
| SMS provider integration | ⏳ Phase 2 |
| Push notification integration | ⏳ Phase 2 |

---

## 9. Next Steps

1. **Phase 1.3**: Import Prisma schema and implement repositories
2. **Phase 1.4**: Complete service business logic
3. **Phase 2**: Integrate external providers (AI, SMS, Push)
4. **Phase 2+**: Add authentication middleware to routes
