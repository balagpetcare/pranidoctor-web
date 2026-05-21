# TABLE STRUCTURE — Prani Doctor Database

**Version:** 1.1.0  
**Last Updated:** 2026-05-21  
**Database:** PostgreSQL 16+  
**ORM:** Prisma 7+

---

## Table of Contents

1. [Database Design Principles](#1-database-design-principles)
2. [ID Strategy](#2-id-strategy)
3. [Soft Delete Strategy](#3-soft-delete-strategy)
4. [Index Strategy](#4-index-strategy)
5. [Partitioning Strategy](#5-partitioning-strategy)
6. [Money and Decimal Fields](#6-money-and-decimal-fields)
7. [Timestamp Conventions](#7-timestamp-conventions)
8. [JSON Field Strategy](#8-json-field-strategy)
9. [Table Catalog by Domain](#9-table-catalog-by-domain)
10. [Enum Definitions](#10-enum-definitions)
11. [Constraint Patterns](#11-constraint-patterns)
12. [Migration Guidelines](#12-migration-guidelines)

---

## 1. Database Design Principles

### 1.1 Core Principles

| Principle | Implementation |
|-----------|----------------|
| **Normalization** | 3NF for transactional data, denormalize for read-heavy |
| **Referential Integrity** | Foreign keys with appropriate ON DELETE actions |
| **Soft Delete** | `status` enum or `deletedAt` timestamp |
| **Audit Trail** | `createdAt`, `updatedAt` on all tables |
| **Multi-Tenant Ready** | `tenantId` fields documented (not active in MVP) |
| **Partition Ready** | Time-based tables designed for future partitioning |

### 1.2 tenantId Field Standard (MVP)

MVP is **single-tenant**: `tenantId` is **nullable** on tenant-scoped tables and **not enforced** in queries. Authoritative table list: `MULTI_TENANT_STRATEGY.md` §5.2 (tenant-scoped) and §5.3 (shared reference — **no** `tenantId`).

| Category | `tenantId` | Examples |
|----------|------------|----------|
| Tenant-scoped | `String?` nullable | `User`, `ServiceRequest`, `AnimalProfile`, `BillingRecord`, `Notification` |
| Shared reference | Absent | `Division`, `District`, `Village`, `LivestockBreed` |
| Tenant-customizable | `String?` nullable | `ServiceCategory`, `ContentPost`, `SemenServiceTemplate` |
| AI memory (MVP) | `String?` when added | `AiConversation` |
| AI audit | `String?` when multi-tenant | `AiUsageRecord` |

Index pattern when enabled: `@@index([tenantId])`, `@@index([tenantId, status])` — see `MULTI_TENANT_STRATEGY.md` §6.1.

### 1.3 Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Table (Prisma) | PascalCase | `ServiceRequest` |
| Table (PostgreSQL) | Same as Prisma or `@@map()` | `TreatmentRecord` |
| Column | camelCase | `assignedDoctorId` |
| Foreign Key | `[entity]Id` | `customerId`, `villageId` |
| Enum | PascalCase | `ServiceRequestStatus` |
| Enum Value | SCREAMING_SNAKE | `IN_PROGRESS` |
| Index | `[Table]_[columns]_idx` | `ServiceRequest_status_idx` |
| Unique Constraint | `[Table]_[columns]_key` | `User_email_key` |

### 1.3 Column Ordering Standard

```
1. id (Primary Key)
2. Foreign Keys (ordered by importance)
3. Status/Type enums
4. Core business fields
5. Optional/nullable fields
6. JSON fields
7. Timestamps (createdAt, updatedAt, deletedAt)
```

---

## 2. ID Strategy

### 2.1 Primary Key Design

| Strategy | Implementation | Use Case |
|----------|----------------|----------|
| **cuid()** | Prisma `@default(cuid())` | All new tables (default) |
| **uuid** | `@default(uuid())` | External integration tables |
| **Serial** | PostgreSQL SERIAL | Never used (avoid for distributed) |

### 2.2 CUID Rationale

```
Advantages:
- Collision-resistant across distributed systems
- Sortable by creation time (roughly)
- URL-safe (no special characters)
- 25 characters (shorter than UUID)
- No coordination required between nodes

Format: c[timestamp][random]
Example: clvx7abc1000008la5e6r9hkw
```

### 2.3 ID Field Definition

```prisma
model Example {
  id String @id @default(cuid())  // Standard pattern
}

// For external system integration
model ExternalEntity {
  id         String @id @default(uuid())
  externalId String @unique  // Their system's ID
}
```

---

## 3. Soft Delete Strategy

### 3.1 Soft Delete Patterns

| Pattern | Implementation | Use Case |
|---------|----------------|----------|
| **Status Enum** | `status` field with `DELETED` value | Entities with lifecycle states |
| **DeletedAt** | `deletedAt DateTime?` | Simple soft delete |
| **Active Flag** | `active Boolean @default(true)` | Toggle visibility |
| **Hard Delete** | `onDelete: Cascade` | Child records of soft-deleted parent |

### 3.2 Pattern Selection Guide

```
Use Status Enum when:
- Entity has meaningful lifecycle states
- e.g., User (ACTIVE, SUSPENDED, DELETED)
- e.g., ServiceRequest (PENDING → COMPLETED → CANCELLED)

Use DeletedAt when:
- Simple archival needed
- Restore functionality required
- e.g., ServiceInstance.deletedAt

Use Active Flag when:
- Toggle on/off without deletion
- e.g., AnimalProfile.active
- e.g., Division.isActive
```

### 3.3 Query Patterns

```typescript
// Status enum pattern
const activeUsers = await prisma.user.findMany({
  where: { status: { not: 'DELETED' } }
});

// DeletedAt pattern
const activeInstances = await prisma.serviceInstance.findMany({
  where: { deletedAt: null }
});

// Active flag pattern
const activeAnimals = await prisma.animalProfile.findMany({
  where: { active: true }
});
```

### 3.4 Soft Delete by Table

| Table | Strategy | Field | Values |
|-------|----------|-------|--------|
| User | Status Enum | `status` | `ACTIVE`, `SUSPENDED`, `DELETED` |
| AnimalProfile | Active Flag | `active` | `true`, `false` |
| Division/District/etc. | Active Flag | `isActive` | `true`, `false` |
| ServiceInstance | DeletedAt | `deletedAt` | `null` or timestamp |
| ServiceInstanceMedia | DeletedAt | `deletedAt` | `null` or timestamp |
| UploadedFile | Status Enum | `status` | `ACTIVE`, `DELETED` |

---

## 4. Index Strategy

### 4.1 Index Types

| Type | Use Case | Prisma Syntax |
|------|----------|---------------|
| **Single Column** | Frequent WHERE clause | `@@index([fieldName])` |
| **Composite** | Multi-column queries | `@@index([field1, field2])` |
| **Unique** | Constraint + index | `@unique` or `@@unique([...])` |
| **Partial** | Conditional index | Raw SQL migration |

### 4.2 Index Guidelines

```
ALWAYS index:
- Foreign keys (automatic in many DBs, explicit in Prisma)
- Status/type enum fields used in WHERE
- Fields used in ORDER BY
- Fields used in JOIN conditions

CONSIDER indexing:
- Frequently filtered nullable fields
- Date ranges for time-based queries
- Combined filter patterns (composite)

AVOID indexing:
- Columns with low cardinality (unless composite)
- Columns rarely used in queries
- Tables with mostly INSERTs (write-heavy)
```

### 4.3 Index Catalog

#### Identity Domain

```prisma
model User {
  @@index([role])
  @@index([status])
  @@index([role, status])
}

model DoctorProfile {
  @@index([providerStatus])
}

model AiTechnicianProfile {
  @@index([providerStatus])
  @@index([status])
  @@index([reviewedById])
  @@index([districtId])
  @@index([upazilaId])
  @@index([unionId])
}
```

#### Geography Domain

```prisma
model Division {
  @@index([isActive])
  @@index([nameBn])
  @@index([nameEn])
  @@index([code])
}

model District {
  @@index([divisionId])
  @@index([isActive])
  @@index([divisionId, code])
  @@index([divisionId, nameBn])
  @@index([divisionId, nameEn])
}

model Upazila {
  @@index([districtId])
  @@index([isActive])
  @@index([districtId, code])
  @@index([districtId, nameBn])
  @@index([districtId, nameEn])
}

model Union {
  @@index([upazilaId])
  @@index([isActive])
  @@index([upazilaId, code])
  @@index([upazilaId, nameBn])
  @@index([upazilaId, nameEn])
}

model Village {
  @@index([unionId])
  @@index([unionId, nameBn])
  @@index([unionId, nameEn])
  @@index([isActive])
}

model Area {
  @@index([parentId])
  @@index([type])
  @@index([isActive])
  @@index([parentId, type])
}
```

#### Service Domain

```prisma
model ServiceRequest {
  @@index([status])
  @@index([customerId])
  @@index([animalId])
  @@index([assignedDoctorId, status])
  @@index([assignedTechnicianId, status])
  @@index([serviceType, status])
  @@index([areaId, serviceCategoryId])
  @@index([villageId])
}

model AnimalProfile {
  @@index([customerId])
}

model TreatmentCase {
  @@index([serviceRequestId])
  @@index([doctorId])
  @@index([aiTechnicianId])
  @@index([status])
}

model Prescription {
  @@index([serviceRequestId])
  @@index([doctorId])
  @@index([aiTechnicianId])
}

model PrescriptionItem {
  @@index([prescriptionId])
}
```

#### Financial Domain

```prisma
model BillingRecord {
  @@index([customerId])
  @@index([doctorId])
  @@index([aiTechnicianId])
  @@index([status])
}

model PaymentRecord {
  @@index([billingRecordId])
  @@index([serviceRequestId])
  @@index([status])
  @@index([externalId])
}
```

#### AI Technician Domain

```prisma
model AiTechnicianService {
  @@index([aiTechnicianId])
  @@index([status])
  @@index([animalType])
  @@index([semenServiceTemplateId])
}

model AiServiceRequest {
  @@index([customerUserId])
  @@index([technicianProfileId])
  @@index([status])
  @@index([createdAt])
}

model AiServiceRecord {
  @@index([technicianProfileId])
  @@index([customerUserId])
  @@index([serviceDate])
}

model AiTechnicianReview {
  @@index([technicianProfileId])
  @@index([customerUserId])
  @@index([visibility])
}

model AiTechnicianComplaint {
  @@index([technicianProfileId])
  @@index([customerUserId])
  @@index([status])
  @@index([aiServiceRequestId])
}
```

#### Enterprise Domain

```prisma
model ServiceInstance {
  @@index([status, submittedAt])
  @@index([aiTechnicianProfileId, semenServiceTemplateId])
  @@index([tenantId, deploymentBranch])
  @@index([deploymentBranch])
  @@index([deletedAt])
  @@index([payloadFingerprint])
  @@index([semenServiceTemplateId])
}

model ServiceInstanceMedia {
  @@index([serviceInstanceId])
  @@index([sortOrder])
  @@index([uploadedFileId])
}

model ServiceInstanceStatusLog {
  @@index([serviceInstanceId, createdAt])
  @@index([actorUserId])
}

model ServiceInstanceReview {
  @@index([serviceInstanceId, createdAt])
  @@index([reviewerUserId])
}

model ServiceInstancePublishLog {
  @@index([serviceInstanceId, createdAt])
  @@index([actorUserId])
}

model ServiceInstanceAuditEvent {
  @@index([serviceInstanceId, createdAt])
  @@index([actorUserId])
}
```

---

## 5. Partitioning Strategy

### 5.1 Partition Candidates

| Table | Partition Key | Strategy | Trigger |
|-------|---------------|----------|---------|
| ServiceRequest | `createdAt` | Range (monthly) | >10M rows |
| AiServiceRequest | `createdAt` | Range (monthly) | >5M rows |
| Notification | `createdAt` | Range (monthly) | >50M rows |
| PaymentRecord | `createdAt` | Range (monthly) | >5M rows |
| AuditLog (future) | `createdAt` | Range (monthly) | >100M rows |
| ServiceInstanceAuditEvent | `createdAt` | Range (monthly) | >10M rows |

### 5.2 Partition Preparation

```sql
-- Future: Convert ServiceRequest to partitioned table
-- Step 1: Create partitioned table structure
CREATE TABLE service_request_partitioned (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP NOT NULL,
  -- ... other columns
) PARTITION BY RANGE (created_at);

-- Step 2: Create monthly partitions
CREATE TABLE service_request_2026_01 
  PARTITION OF service_request_partitioned
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE service_request_2026_02 
  PARTITION OF service_request_partitioned
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ... continue for each month
```

### 5.3 Prisma Compatibility Note

```
Prisma does not natively support table partitioning.
Partitioning must be done via:
1. Raw SQL migrations
2. Database-level automation
3. Partition management scripts

Application code remains unchanged (Prisma queries work normally).
```

---

## 6. Money and Decimal Fields

### 6.1 Decimal Precision Standards

| Use Case | Precision | Scale | Prisma Type |
|----------|-----------|-------|-------------|
| Currency (BDT) | 14 | 2 | `@db.Decimal(14, 2)` |
| Small currency | 12 | 2 | `@db.Decimal(12, 2)` |
| Percentage | 5 | 2 | `@db.Decimal(5, 2)` |
| Weight (kg) | 10 | 3 | `@db.Decimal(10, 3)` |
| Quantity | 12 | 3 | `@db.Decimal(12, 3)` |
| Coordinates | 10 | 7 | `@db.Decimal(10, 7)` |

### 6.2 Money Field Pattern

```prisma
model BillingRecord {
  serviceFee         Decimal? @db.Decimal(14, 2)
  travelCost         Decimal? @db.Decimal(14, 2)
  medicineCost       Decimal? @db.Decimal(14, 2)
  discountAmount     Decimal? @db.Decimal(14, 2)
  totalCollected     Decimal? @db.Decimal(14, 2)
  platformCommission Decimal? @db.Decimal(14, 2)
  providerPayout     Decimal? @db.Decimal(14, 2)
  currency           String   @default("BDT")
}

model PaymentRecord {
  amount   Decimal @db.Decimal(14, 2)
  currency String  @default("BDT")
}
```

### 6.3 Calculation Rules

```typescript
// ALWAYS use Decimal/BigNumber for money calculations
import { Decimal } from '@prisma/client/runtime/library';

// BAD: Floating point
const total = price * quantity;

// GOOD: Decimal arithmetic
const total = new Decimal(price).mul(new Decimal(quantity));

// Rounding: Always round to 2 decimal places for BDT
const rounded = total.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
```

---

## 7. Timestamp Conventions

### 7.1 Standard Timestamps

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `createdAt` | DateTime | `@default(now())` | Record creation time |
| `updatedAt` | DateTime | `@updatedAt` | Last modification time |
| `deletedAt` | DateTime? | null | Soft delete marker |

### 7.2 Business Timestamps

| Field | Purpose | Example Tables |
|-------|---------|----------------|
| `submittedAt` | When request was submitted | ServiceRequest |
| `assignedAt` | When assigned to provider | ServiceRequest |
| `startedAt` | When work began | ServiceRequest |
| `completedAt` | When work finished | ServiceRequest |
| `cancelledAt` | When cancelled | ServiceRequest |
| `issuedAt` | When invoice issued | BillingRecord |
| `paidAt` | When payment received | BillingRecord, PaymentRecord |
| `verifiedAt` | When verified by admin | DoctorProfile, AiTechnicianProfile |
| `publishedAt` | When made public | ContentPost, ServiceInstance |
| `archivedAt` | When archived | ServiceInstance |
| `expiresAt` | Expiration time | MobileOtpChallenge |

### 7.3 Timestamp Patterns

```prisma
// Audit trail pattern
model AnyTable {
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Soft delete pattern
model SoftDeleteTable {
  deletedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Lifecycle timestamps
model ServiceRequest {
  submittedAt  DateTime  @default(now())
  assignedAt   DateTime?
  startedAt    DateTime?
  completedAt  DateTime?
  cancelledAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

---

## 8. JSON Field Strategy

### 8.1 JSON Usage Guidelines

| Use Case | Appropriate | Store As |
|----------|-------------|----------|
| Unstructured metadata | Yes | `Json?` |
| Address components | Yes | `Json?` (addressJson) |
| API response cache | Yes | `Json?` (metadataJson) |
| Payload snapshots | Yes | `Json` |
| Frequently queried | No | Separate columns |
| Relational data | No | Normalized tables |

### 8.2 JSON Field Catalog

| Table | Field | Purpose |
|-------|-------|---------|
| CustomerProfile | `addressJson` | Flexible address structure |
| AiTechnicianProfile | `metadataJson` | Tags, preferences |
| Area | `metadataJson` | Extra geography data |
| SemenServiceTemplate | `tagsJson` | Search tags |
| ServiceInstance | `payloadJson` | Worker submission data |
| ServiceInstance | `lockedSnapshotJson` | Approved frozen copy |
| ServiceInstance | `validationResultJson` | Validation results |
| PaymentRecord | `metadataJson` | Gateway response |
| Notification | `metadataJson` | Notification context |
| Setting | `valueJson` | Configuration values |
| ServiceInstanceStatusLog | `metadataJson` | Transition context |
| ServiceInstanceAuditEvent | `detailsJson` | Audit details |

### 8.3 JSON Query Patterns

```typescript
// Prisma JSON filtering (PostgreSQL)
const results = await prisma.setting.findMany({
  where: {
    valueJson: {
      path: ['enabled'],
      equals: true
    }
  }
});

// JSON contains
const tags = await prisma.semenServiceTemplate.findMany({
  where: {
    tagsJson: {
      array_contains: ['premium']
    }
  }
});
```

---

## 9. Table Catalog by Domain

### 9.1 Identity Domain Tables

| Table | Rows Estimate | Growth Rate | Audit |
|-------|---------------|-------------|-------|
| User | 100K | Medium | createdAt, updatedAt |
| AdminProfile | 100 | Low | createdAt, updatedAt |
| CustomerProfile | 100K | Medium | createdAt, updatedAt |
| DoctorProfile | 5K | Low | createdAt, updatedAt |
| AiTechnicianProfile | 10K | Medium | createdAt, updatedAt |
| MobileOtpChallenge | 50K active | High churn | createdAt, updatedAt, expiresAt |

### 9.2 Geography Domain Tables

| Table | Rows Estimate | Growth Rate | Audit |
|-------|---------------|-------------|-------|
| Division | 8 | None | createdAt, updatedAt |
| District | 64 | None | createdAt, updatedAt |
| Upazila | 500 | Rare | createdAt, updatedAt |
| Union | 4,500 | Rare | createdAt, updatedAt |
| Village | 50,000+ | Rare | createdAt, updatedAt |
| Area | 60,000+ | Rare | createdAt, updatedAt |

### 9.3 Service Domain Tables

| Table | Rows Estimate | Growth Rate | Partition Candidate |
|-------|---------------|-------------|---------------------|
| ServiceCategory | 20 | Low | No |
| AnimalProfile | 500K | High | No |
| ServiceRequest | 10M+ | Very High | Yes (createdAt) |
| TreatmentCase | 5M+ | High | Linked to ServiceRequest |
| Prescription | 5M+ | High | Linked to ServiceRequest |
| PrescriptionItem | 20M+ | High | Linked to Prescription |

### 9.4 Financial Domain Tables

| Table | Rows Estimate | Growth Rate | Partition Candidate |
|-------|---------------|-------------|---------------------|
| BillingRecord | 5M+ | High | Linked to ServiceRequest |
| PaymentRecord | 5M+ | High | Yes (createdAt) |
| Setting | 100 | Low | No |

### 9.5 AI Technician Domain Tables

| Table | Rows Estimate | Growth Rate | Notes |
|-------|---------------|-------------|-------|
| AiTechnicianDocument | 100K | Medium | Per technician |
| AiTechnicianService | 50K | Medium | Listings |
| TechnicianSemenInventory | 100K | Medium | Stock tracking |
| AiServiceRequest | 5M+ | High | Partition candidate |
| AiServiceRecord | 2M+ | High | Linked to request |
| AiTechnicianReview | 1M+ | Medium | |
| AiTechnicianComplaint | 100K | Low | |
| SemenProvider | 50 | Low | Master data |
| LivestockBreed | 100 | Low | Master data |
| SemenServiceTemplate | 500 | Low | Admin templates |
| SemenServiceTemplateBreedMix | 2K | Low | |
| SemenServiceTemplateMedia | 2K | Low | |

### 9.6 Content Domain Tables

| Table | Rows Estimate | Growth Rate | Notes |
|-------|---------------|-------------|-------|
| ContentCategory | 50 | Low | Master data |
| ContentPost | 5K | Medium | Knowledge hub |

### 9.7 Media Domain Tables

| Table | Rows Estimate | Growth Rate | Notes |
|-------|---------------|-------------|-------|
| UploadedFile | 1M+ | High | All uploads |

### 9.8 Notification Domain Tables

| Table | Rows Estimate | Growth Rate | Partition Candidate |
|-------|---------------|-------------|---------------------|
| Notification | 50M+ | Very High | Yes (createdAt) |

### 9.9 AI Domain Tables (MVP)

| Table | Rows Estimate | Growth Rate | Notes |
|-------|---------------|-------------|-------|
| AiConversation | 1M+ | High | Session summaries (`session_summary`) |
| AiMessage | 5M+ | Very High | Optional full transcript |
| AiUsageRecord | 10M+ | Very High | **AI audit owner table** — all provider calls |
| AiCostAlert | 10K | Low | Cost threshold alerts |

**AI audit ownership:** `AiUsageRecord` is the canonical audit table for orchestrator, emergency engine, and cost optimization. Implemented by `AiAuditLogger` (see `COST_OPTIMIZATION.md` §8, `AI_ORCHESTRATOR.md` §11). Do not duplicate as `AiRequestLog` / `AiResponseAudit`.

**`AiUsageRecord` columns (summary):** `requestId`, `userId`, `pipeline`, `model`, `inputTokens`, `outputTokens`, `totalTokens`, `costUsd`, `cached`, `latencyMs`, `moderationAction`, `moderationIssues`, `timestamp`.

### 9.10 Enterprise Service Instance Tables

| Table | Rows Estimate | Growth Rate | Notes |
|-------|---------------|-------------|-------|
| ServiceInstance | 100K | Medium | Worker submissions |
| ServiceInstanceMedia | 500K | Medium | |
| ServiceInstanceStatusLog | 500K | Medium | Audit |
| ServiceInstanceReview | 200K | Medium | Admin reviews |
| ServiceInstancePublishLog | 100K | Medium | Publish history |
| ServiceInstanceAuditEvent | 1M+ | High | Full audit trail |

### 9.11 Junction Tables

| Table | Left | Right | Unique Constraint |
|-------|------|-------|-------------------|
| DoctorServiceArea | DoctorProfile | Village | (doctorId, villageId) |
| AiTechnicianServiceArea | AiTechnicianProfile | Village | (aiTechnicianId, villageId) |
| DoctorProfileArea | DoctorProfile | Area | (doctorId, areaId) |
| AiTechnicianProfileArea | AiTechnicianProfile | Area | (aiTechnicianId, areaId) |
| DoctorProfileServiceCategory | DoctorProfile | ServiceCategory | (doctorId, serviceCategoryId) |
| AiTechnicianProfileServiceCategory | AiTechnicianProfile | ServiceCategory | (aiTechnicianId, serviceCategoryId) |
| AiTechnicianDivisionServiceArea | AiTechnicianProfile | Division/District/etc. | Composite |

---

## 10. Enum Definitions

### 10.1 User Domain Enums

```prisma
enum UserRole {
  ADMIN
  CUSTOMER
  DOCTOR
  AI_TECHNICIAN
  SUPPORT
  SUPER_ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  PENDING_VERIFICATION
  INVITED
  DELETED
}

enum ProviderStatus {
  PENDING_VERIFICATION
  ACTIVE
  SUSPENDED
  REJECTED
}

enum Gender {
  MALE
  FEMALE
  UNKNOWN
  OTHER
}
```

### 10.2 Animal Domain Enums

```prisma
enum AnimalCategory {
  PET
  LIVESTOCK
  OTHER
}

enum AnimalType {
  CATTLE
  GOAT
  POULTRY
  DOG
  CAT
  OTHER
}

enum PregnancyStatus {
  UNKNOWN
  NOT_APPLICABLE
  NOT_PREGNANT
  PREGNANT
}
```

### 10.3 Service Request Enums

```prisma
enum ServiceRequestType {
  DOCTOR_HOME_VISIT
  EMERGENCY_DOCTOR
  AI_SERVICE
  ONLINE_CONSULTATION_LATER
}

enum ServiceRequestStatus {
  PENDING
  ACCEPTED
  ASSIGNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  REJECTED
}
```

### 10.4 Clinical Enums

```prisma
enum TreatmentCaseStatus {
  DRAFT
  FINALIZED
  CANCELLED
}

enum PrescriptionStatus {
  ACTIVE
  VOIDED
}
```

### 10.5 Financial Enums

```prisma
enum BillingStatus {
  DRAFT
  ISSUED
  PARTIALLY_PAID
  PAID
  VOIDED
  REFUNDED
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  CAPTURED
  FAILED
  REFUNDED
  CANCELLED
  UNPAID      // Invoice-level
  PARTIAL     // Invoice-level
  PAID        // Invoice-level
}

enum PaymentMethod {
  CASH
  BKASH
  NAGAD
  CARD
  BANK_TRANSFER
  OTHER
  ROCKET
  BANK
}
```

### 10.6 AI Technician Enums

```prisma
enum AiTechnicianStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  NEEDS_CORRECTION
  APPROVED
  PUBLISHED
  REJECTED
  SUSPENDED
}

enum AiTechnicianDocumentType {
  NID_FRONT
  NID_BACK
  PROFILE_PHOTO
  COVER_IMAGE
  TRAINING_CERTIFICATE
  AI_CERTIFICATE
  COMPANY_ID
  EXPERIENCE_PROOF
  OTHER
}

enum AiTechnicianDocumentReviewStatus {
  PENDING_REVIEW
  APPROVED
  REJECTED
}

enum AiTechnicianServiceStatus {
  DRAFT
  PENDING_REVIEW
  ACTIVE
  INACTIVE
  REJECTED
}

enum AiServiceRequestStatus {
  PENDING
  ACCEPTED
  DECLINED
  ON_THE_WAY
  ARRIVED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum AiPaymentStatus {
  UNPAID
  CASH_PAID
  MANUAL_PAID
  DUE
  REFUNDED
}

enum AiTechnicianReviewVisibility {
  VISIBLE
  HIDDEN
}

enum AiTechnicianComplaintStatus {
  OPEN
  UNDER_REVIEW
  RESOLVED
  REJECTED
}
```

### 10.7 Content Enums

```prisma
enum ContentApprovalStatus {
  DRAFT
  PENDING_REVIEW
  APPROVED
  REJECTED
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
  HIDDEN
}

enum ComplaintStatus {
  OPEN
  IN_REVIEW
  RESOLVED
  REJECTED
  CLOSED
}

enum NotificationType {
  REQUEST_UPDATE
  PAYMENT
  CHAT
  SYSTEM
  MARKETING
  COMPLAINT
  REVIEW
}
```

### 10.8 Media Enums

```prisma
enum MobileUploadPurpose {
  AI_TECHNICIAN_NID_FRONT
  AI_TECHNICIAN_NID_BACK
  AI_TECHNICIAN_PROFILE_PHOTO
  AI_TECHNICIAN_COVER_IMAGE
  AI_TECHNICIAN_TRAINING_CERTIFICATE
  AI_TECHNICIAN_AI_CERTIFICATE
  AI_TECHNICIAN_OTHER
  CUSTOMER_PROFILE_PHOTO
  CUSTOMER_COVER_IMAGE
  ADMIN_SEMEN_PROVIDER_LOGO
  ADMIN_SEMEN_TEMPLATE_COVER
  ADMIN_SEMEN_TEMPLATE_GALLERY
  ADMIN_SEMEN_TEMPLATE_VIDEO
  AI_SERVICE_INSTANCE_COVER
  AI_SERVICE_INSTANCE_GALLERY
  AI_SERVICE_INSTANCE_VIDEO
  AI_SERVICE_INSTANCE_DOCUMENT
}

enum UploadedFileStatus {
  ACTIVE
  DELETED
}
```

### 10.9 Enterprise Enums

```prisma
enum ServiceInstanceStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  NEEDS_CORRECTION
  APPROVED
  REJECTED
  PUBLISHED
  ARCHIVED
}

enum ServiceInstanceMediaKind {
  COVER
  GALLERY
  VIDEO_UPLOAD
  VIDEO_URL
  DOCUMENT
}

enum ServiceInstanceMediaModerationStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ServiceInstanceReviewDecision {
  APPROVE
  REJECT
  REQUEST_CORRECTION
  COMMENT
}

enum ServiceInstanceReviewVisibility {
  INTERNAL
  WORKER_VISIBLE
}

enum ServiceInstancePublishAction {
  PUBLISH
  UNPUBLISH
  ROLLBACK
}

enum ServiceInstanceAuditAction {
  CREATE
  EDIT
  SUBMIT
  REVIEW
  APPROVE
  REJECT
  PUBLISH
  ARCHIVE
  ROLLBACK
  STATUS_CHANGE
}
```

### 10.10 Geography Enums

```prisma
enum AreaType {
  DIVISION
  DISTRICT
  UPAZILA
  UNION
  VILLAGE
  SERVICE_AREA
}
```

### 10.11 Semen Service Enums

```prisma
enum SemenProductKind {
  NORMAL
  SEXED
  PREMIUM
  IMPORTED
  LOCAL
  OTHER
}

enum SemenProviderVerificationStatus {
  UNVERIFIED
  PARTNER
  OFFICIAL
}

enum SemenTemplateApprovalStatus {
  DRAFT
  PENDING_REVIEW
  APPROVED
  REJECTED
}

enum SemenTemplateMediaKind {
  COVER
  GALLERY
  VIDEO_UPLOAD
  VIDEO_URL
}
```

---

## 11. Constraint Patterns

### 11.1 Unique Constraints

```prisma
// Single column unique
model User {
  email String @unique
  phone String? @unique
}

// Composite unique
model DoctorServiceArea {
  @@unique([doctorId, villageId])
}

// Unique with nullable (PostgreSQL handles nulls)
model AiTechnicianService {
  @@unique([aiTechnicianId, semenServiceTemplateId])
}
```

### 11.2 Foreign Key Actions

| Action | Use Case |
|--------|----------|
| `Cascade` | Child deleted when parent deleted (e.g., profile → user) |
| `Restrict` | Prevent deletion if children exist (e.g., category → posts) |
| `SetNull` | Set FK to null on parent delete (e.g., assigned provider) |

```prisma
model TreatmentCase {
  doctor DoctorProfile? @relation(fields: [doctorId], references: [id], onDelete: Restrict)
  serviceRequest ServiceRequest @relation(fields: [serviceRequestId], references: [id], onDelete: Cascade)
}

model ServiceRequest {
  assignedDoctor DoctorProfile? @relation(fields: [assignedDoctorId], references: [id], onDelete: SetNull)
}
```

### 11.3 Check Constraints (Raw SQL)

```sql
-- Ensure XOR: doctor OR technician, not both
ALTER TABLE "TreatmentRecord" ADD CONSTRAINT "treatment_provider_xor" 
CHECK (
  ("doctorId" IS NOT NULL AND "aiTechnicianId" IS NULL) OR
  ("doctorId" IS NULL AND "aiTechnicianId" IS NOT NULL) OR
  ("doctorId" IS NULL AND "aiTechnicianId" IS NULL)
);

-- Ensure positive amounts
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "payment_amount_positive"
CHECK ("amount" > 0);

-- Ensure valid rating range
ALTER TABLE "Review" ADD CONSTRAINT "review_rating_range"
CHECK ("rating" >= 1 AND "rating" <= 5);
```

---

## 12. Migration Guidelines

### 12.0 Migration Naming Convention

Align with Prisma defaults and `docs/PRISMA_MIGRATION_RULES.md`:

| Element | Convention | Example |
|---------|------------|---------|
| Folder name | `YYYYMMDDHHMMSS_snake_case` | `20260521143000_add_ai_usage_record` |
| `--name` argument | snake_case, verb + object | `add_ai_usage_record` |
| One concern per migration | Single logical change | Avoid mixed unrelated DDL |

```bash
npx prisma migrate dev --name add_ai_usage_record
```

Never rename or edit applied migration folders.

### 12.1 Migration Checklist

```markdown
Before creating migration:
- [ ] Schema validated (`npx prisma validate`)
- [ ] Existing data analyzed for impact
- [ ] Backup created (`pg_dump`)
- [ ] Rollback plan documented

After creating migration:
- [ ] Review generated SQL
- [ ] Test on staging
- [ ] Document breaking changes
- [ ] Update seed data if needed

Deployment:
- [ ] Use `npm run db:deploy:safe`
- [ ] Monitor for errors
- [ ] Verify application health
```

### 12.2 Safe Migration Patterns

```prisma
// Adding nullable column (safe)
model User {
  newField String?  // Start nullable
}

// Making column non-null (two migrations)
// Migration 1: Add with default
model User {
  newField String @default("default_value")
}
// Migration 2: Remove default after backfill
model User {
  newField String  // No default
}

// Renaming column (use @map to preserve data)
model User {
  displayName String @map("name")  // Old column was "name"
}

// Renaming table (use @@map)
model TreatmentCase {
  @@map("TreatmentRecord")  // Old table name
}
```

### 12.3 Dangerous Operations

| Operation | Risk | Mitigation |
|-----------|------|------------|
| Drop column | Data loss | Soft delete first, archive data |
| Drop table | Data loss | Full backup, archive |
| Rename column | App breakage | Use `@map()` |
| Change type | Data truncation | Create new column, migrate, drop old |
| Add NOT NULL | Fails on null data | Add nullable, backfill, then constrain |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Database Team | Initial release |
| 1.1.0 | 2026-05-21 | Architecture | tenantId standard, AI tables §9.9, migration naming §12.0 |

---

## Related Documents

| Document | Location |
|----------|----------|
| ERD | `docs/database/ERD.md` |
| Role System | `docs/database/ROLE_SYSTEM.md` |
| Multi-Tenant Strategy | `docs/database/MULTI_TENANT_STRATEGY.md` |
| Migration Rules | `docs/PRISMA_MIGRATION_RULES.md` |

---

*End of TABLE_STRUCTURE.md*
