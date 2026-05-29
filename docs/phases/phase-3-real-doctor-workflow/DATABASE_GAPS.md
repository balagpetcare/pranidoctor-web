# Phase 3: Database Gaps Analysis

## Executive Summary

This document identifies all database schema changes required for the Real Doctor Workflow implementation. Changes are organized by module and prioritized by dependency order.

---

## 1. New Models Required

### 1.1 Doctor Availability System

```prisma
// Doctor real-time availability status
model DoctorAvailability {
  id                String    @id @default(uuid())
  doctorId          String    @unique
  doctor            DoctorProfile @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  
  // Current status
  status            DoctorRealTimeStatus @default(OFFLINE)
  statusUpdatedAt   DateTime  @default(now())
  statusExpiresAt   DateTime?
  temporaryNote     String?
  
  // Capacity tracking
  maxConcurrentCases Int      @default(1)
  activeCaseCount   Int       @default(0)
  
  // Last seen for heartbeat
  lastHeartbeatAt   DateTime?
  
  // Metadata
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([status])
  @@index([doctorId])
  @@index([statusUpdatedAt])
  @@map("doctor_availability")
}

enum DoctorRealTimeStatus {
  ONLINE_AVAILABLE
  ONLINE_LIMITED
  ONLINE_EMERGENCY_ONLY
  BUSY_WITH_CASE
  ON_BREAK
  OFFLINE
}

// Weekly recurring schedule
model DoctorAvailabilitySchedule {
  id                String    @id @default(uuid())
  doctorId          String
  doctor            DoctorProfile @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  
  dayOfWeek         Int       // 0-6, Sunday = 0
  startTime         String    // "HH:mm" format
  endTime           String    // "HH:mm" format
  isAvailable       Boolean   @default(true)
  maxConcurrentCases Int     @default(1)
  serviceTypes      ServiceRequestType[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([doctorId, dayOfWeek])
  @@index([doctorId])
  @@map("doctor_availability_schedule")
}

// Exception dates (holidays, time off)
model DoctorAvailabilityException {
  id                String    @id @default(uuid())
  doctorId          String
  doctor            DoctorProfile @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  
  exceptionDate     DateTime  @db.Date
  isAvailable       Boolean   @default(false)
  reason            String?
  
  createdAt         DateTime  @default(now())
  
  @@unique([doctorId, exceptionDate])
  @@index([doctorId])
  @@map("doctor_availability_exception")
}
```

### 1.2 Consultation Session Management

```prisma
model ConsultationSession {
  id                String    @id @default(uuid())
  
  // Relations
  serviceRequestId  String    @unique
  serviceRequest    ServiceRequest @relation(fields: [serviceRequestId], references: [id], onDelete: Cascade)
  doctorId          String
  doctor            DoctorProfile @relation(fields: [doctorId], references: [id])
  customerId        String
  customer          CustomerProfile @relation(fields: [customerId], references: [id])
  animalId          String
  animal            Animal @relation(fields: [animalId], references: [id])
  
  // Status
  status            ConsultationSessionStatus @default(CREATED)
  endReason         ConsultationEndReason?
  
  // Communication
  communicationType CommunicationType @default(CHAT)
  channelId         String?   // For Twilio/Agora
  
  // Timing
  createdAt         DateTime  @default(now())
  startedAt         DateTime?
  endedAt           DateTime?
  durationSeconds   Int?
  
  // Quality metrics
  connectionQuality Json?     // ConnectionQualityLog[]
  interruptions     Json?     // InterruptionLog[]
  
  // Clinical data references
  examinationDataId String?
  diagnosisId       String?
  prescriptionId    String?
  
  // Metadata
  metadata          Json?     // Flexible additional data
  
  updatedAt         DateTime  @updatedAt
  
  @@index([doctorId, status])
  @@index([customerId, status])
  @@index([serviceRequestId])
  @@index([status, createdAt])
  @@map("consultation_sessions")
}

enum ConsultationSessionStatus {
  CREATED
  WAITING_FOR_CUSTOMER
  ACTIVE
  PAUSED
  ENDED
  CLOSED
}

enum ConsultationEndReason {
  COMPLETED
  CANCELLED_BY_DOCTOR
  CANCELLED_BY_CUSTOMER
  TIMEOUT
  DISCONNECTED
  TECHNICAL_ERROR
  EMERGENCY_TRANSFER
}

enum CommunicationType {
  CHAT
  VOICE
  VIDEO
}
```

### 1.3 Examination Data

```prisma
model ExaminationData {
  id                String    @id @default(uuid())
  
  // Relations
  consultationSessionId String  @unique
  consultationSession   ConsultationSession @relation(fields: [consultationSessionId], references: [id], onDelete: Cascade)
  serviceRequestId    String
  
  // Vital Signs
  temperature       Float?    // Celsius
  pulseRate         Int?      // BPM
  respiratoryRate   Int?      // Breaths per minute
  weight            Float?    // kg
  bodyConditionScore Int?     // 1-9 scale
  
  // General Examination
  generalAppearance String?
  skinCoatCondition String?
  mucousMembranes   String?
  lymphNodes        String?
  
  // System-wise examination (stored as JSON for flexibility)
  digestiveSystem   Json?     // SystemExamination
  respiratorySystem Json?
  cardiovascularSystem Json?
  nervousSystem     Json?
  musculoskeletalSystem Json?
  urogenitalSystem  Json?
  
  // Additional findings
  abnormalFindings  String?
  notes             String?
  
  // Attachments
  attachmentIds     String[]  // References to MedicalAttachment
  
  // Audit
  recordedByDoctorId String
  recordedAt        DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([serviceRequestId])
  @@index([recordedByDoctorId])
  @@map("examination_data")
}
```

### 1.4 Medical Attachments

```prisma
model MedicalAttachment {
  id                String    @id @default(uuid())
  
  // Relations
  serviceRequestId  String
  serviceRequest    ServiceRequest @relation(fields: [serviceRequestId], references: [id], onDelete: Cascade)
  uploadedById      String
  uploadedByRole    UserRole
  
  // File info
  type              MedicalAttachmentType
  fileUrl           String
  thumbnailUrl      String?
  originalFilename  String
  mimeType          String
  sizeBytes         Int
  
  // Clinical context
  description       String?
  takenAt           DateTime?
  locationContext   String?   // e.g., "Left hind leg"
  
  // Privacy
  isPrivate         Boolean   @default(false)
  
  // Audit
  uploadedAt        DateTime  @default(now())
  deletedAt         DateTime?
  deletedById       String?
  
  @@index([serviceRequestId])
  @@index([uploadedById])
  @@index([type])
  @@index([uploadedAt])
  @@map("medical_attachments")
}

enum MedicalAttachmentType {
  // Clinical
  EXAMINATION_PHOTO
  WOUND_PHOTO
  SKIN_CONDITION_PHOTO
  EYE_EXAM_PHOTO
  EAR_EXAM_PHOTO
  
  // Diagnostic
  X_RAY
  ULTRASOUND
  LAB_REPORT
  BLOOD_TEST
  URINE_TEST
  FECAL_TEST
  
  // Documentation
  PREVIOUS_PRESCRIPTION
  VACCINATION_RECORD
  MEDICAL_HISTORY_DOC
  
  // Other
  VIDEO
  AUDIO
  OTHER
}
```

### 1.5 Follow-up System

```prisma
model FollowupSchedule {
  id                String    @id @default(uuid())
  
  // Relations
  parentServiceRequestId String
  parentServiceRequest   ServiceRequest @relation("ParentRequest", fields: [parentServiceRequestId], references: [id])
  
  childServiceRequestId String? @unique
  childServiceRequest   ServiceRequest? @relation("FollowupRequest")
  
  doctorId            String
  doctor            DoctorProfile @relation(fields: [doctorId], references: [id])
  customerId        String
  customer          CustomerProfile @relation(fields: [customerId], references: [id])
  animalId          String
  animal            Animal @relation(fields: [animalId], references: [id])
  
  // Schedule
  scheduledAt       DateTime
  followupType      FollowupType @default(ROUTINE_CHECK)
  reminderHoursBefore Int[]     @default([24, 2])
  
  // Status
  status            FollowupStatus @default(SCHEDULED)
  completedAt       DateTime?
  completedByDoctorId String?
  
  // Outcome
  outcomeNotes      String?
  nextFollowupId    String?   @unique
  nextFollowup      FollowupSchedule? @relation("FollowupChain", fields: [nextFollowupId], references: [id])
  prevFollowup      FollowupSchedule? @relation("FollowupChain")
  
  // Reminder tracking
  remindersSent     Json?     // { "24h": true, "2h": false }
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([doctorId, status])
  @@index([customerId, status])
  @@index([scheduledAt])
  @@index([parentServiceRequestId])
  @@map("followup_schedules")
}

enum FollowupType {
  ROUTINE_CHECK
  MEDICATION_REVIEW
  WOUND_CHECK
  VACCINATION
  LAB_REVIEW
  CUSTOM
}

enum FollowupStatus {
  SCHEDULED
  REMINDER_SENT
  CUSTOMER_CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
  RESCHEDULED
}
```

### 1.6 Doctor Earnings & Payouts

```prisma
model DoctorEarning {
  id                String    @id @default(uuid())
  
  // Relations
  doctorId          String
  doctor            DoctorProfile @relation(fields: [doctorId], references: [id])
  serviceRequestId  String
  serviceRequest    ServiceRequest @relation(fields: [serviceRequestId], references: [id])
  
  // Earnings breakdown
  consultationFee   Decimal   @db.Decimal(10, 2)
  travelFee         Decimal   @db.Decimal(10, 2) @default(0)
  medicineCommission Decimal  @db.Decimal(10, 2) @default(0)
  bonus             Decimal   @db.Decimal(10, 2) @default(0)
  penalty           Decimal   @db.Decimal(10, 2) @default(0)
  
  // Calculations
  grossTotal        Decimal   @db.Decimal(10, 2)
  platformFee       Decimal   @db.Decimal(10, 2)
  netEarning        Decimal   @db.Decimal(10, 2)
  
  // Status
  status            EarningStatus @default(PENDING)
  
  // Payout reference
  payoutId          String?
  payout            PayoutBatch? @relation(fields: [payoutId], references: [id])
  
  // Timing
  earnedAt          DateTime  @default(now())
  paidAt            DateTime?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@unique([doctorId, serviceRequestId])
  @@index([doctorId, status])
  @@index([status, earnedAt])
  @@index([payoutId])
  @@map("doctor_earnings")
}

enum EarningStatus {
  PENDING
  APPROVED
  IN_PAYOUT
  PAID
  HOLD
  DISPUTED
  REFUNDED
}

model PayoutBatch {
  id                String    @id @default(uuid())
  
  // Batch info
  batchName         String
  periodStart       DateTime
  periodEnd         DateTime
  
  // Totals
  totalDoctors      Int
  totalAmount       Decimal   @db.Decimal(12, 2)
  
  // Status
  status            PayoutStatus @default(PENDING)
  processedAt       DateTime?
  processedById     String?
  
  // Payment method
  paymentMethod     String?   // bank_transfer, mobile_money, etc.
  transactionRef    String?
  
  // Relations
  earnings          DoctorEarning[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([status, periodStart])
  @@map("payout_batches")
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}
```

### 1.7 Doctor Performance Metrics

```prisma
model DoctorPerformanceMetrics {
  id                String    @id @default(uuid())
  
  doctorId          String    @unique
  doctor            DoctorProfile @relation(fields: [doctorId], references: [id], onDelete: Cascade)
  
  // Response metrics
  avgResponseTimeSeconds Int?  // Time to accept assignment
  totalAssignments    Int       @default(0)
  acceptedAssignments Int       @default(0)
  rejectedAssignments Int       @default(0)
  timeoutCount      Int       @default(0)
  
  // Consultation metrics
  totalConsultations Int      @default(0)
  completedConsultations Int  @default(0)
  cancelledConsultations Int  @default(0)
  avgConsultationDurationSeconds Int?
  
  // Quality metrics
  customerRating    Float?    // 1-5 average
  totalRatings      Int       @default(0)
  fiveStarCount     Int       @default(0)
  
  // Financial metrics
  totalEarnings     Decimal   @db.Decimal(12, 2) @default(0)
  
  // Time windows
  calculatedAt      DateTime  @default(now())
  periodStart       DateTime
  periodEnd         DateTime
  
  // Historical (daily snapshots)
  snapshotDate      DateTime? @db.Date
  
  @@index([doctorId, calculatedAt])
  @@index([snapshotDate])
  @@map("doctor_performance_metrics")
}
```

### 1.8 Lead Assignment Queue

```prisma
model LeadAssignmentQueue {
  id                String    @id @default(uuid())
  
  serviceRequestId  String    @unique
  serviceRequest    ServiceRequest @relation(fields: [serviceRequestId], references: [id], onDelete: Cascade)
  
  // Queue status
  status            LeadQueueStatus @default(PENDING)
  priority          Int       @default(0)  // Higher = more urgent
  
  // Assignment tracking
  assignedDoctorId  String?
  assignedAt        DateTime?
  
  // Attempt tracking
  attemptCount      Int       @default(0)
  lastAttemptAt     DateTime?
  nextAttemptAt     DateTime?
  
  // Doctor history (who was tried)
  attemptedDoctorIds String[]
  
  // Timeout
  expiresAt         DateTime
  
  // Result
  resolution        LeadResolution?
  resolvedAt        DateTime?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([status, priority, createdAt])
  @@index([status, nextAttemptAt])
  @@index([assignedDoctorId])
  @@map("lead_assignment_queue")
}

enum LeadQueueStatus {
  PENDING
  ASSIGNING
  ASSIGNED
  TIMEOUT
  EXPIRED
  CANCELLED
}

enum LeadResolution {
  DOCTOR_ACCEPTED
  DOCTOR_REJECTED
  DOCTOR_TIMEOUT
  NO_DOCTOR_AVAILABLE
  CUSTOMER_CANCELLED
  ADMIN_OVERRIDE
}
```

### 1.9 Audit Log for Clinical Actions

```prisma
model ClinicalAuditLog {
  id                String    @id @default(uuid())
  
  // What happened
  action            ClinicalAction
  entityType        String    // "TreatmentCase", "Prescription", etc.
  entityId          String
  serviceRequestId  String?
  
  // Who did it
  actorId           String
  actorRole         UserRole
  actorName         String?   // Denormalized for display
  
  // Context
  beforeState       Json?     // Previous state snapshot
  afterState        Json?     // New state snapshot
  metadata          Json?     // Additional context
  
  // Where/When
  ipAddress         String?
  userAgent         String?
  createdAt         DateTime  @default(now())
  
  @@index([entityType, entityId])
  @@index([serviceRequestId])
  @@index([actorId, createdAt])
  @@index([createdAt])
  @@map("clinical_audit_logs")
}

enum ClinicalAction {
  // Consultation
  CONSULTATION_STARTED
  CONSULTATION_PAUSED
  CONSULTATION_RESUMED
  CONSULTATION_ENDED
  
  // Treatment
  TREATMENT_CASE_CREATED
  TREATMENT_CASE_UPDATED
  TREATMENT_CASE_FINALIZED
  
  // Prescription
  PRESCRIPTION_CREATED
  PRESCRIPTION_MODIFIED
  PRESCRIPTION_VOIDED
  
  // Followup
  FOLLOWUP_SCHEDULED
  FOLLOWUP_COMPLETED
  FOLLOWUP_CANCELLED
  
  // Attachments
  ATTACHMENT_UPLOADED
  ATTACHMENT_DELETED
  
  // Assignment
  CASE_ASSIGNED
  CASE_ACCEPTED
  CASE_REJECTED
  CASE_REASSIGNED
}
```

---

## 2. Existing Model Modifications

### 2.1 DoctorProfile Additions

```prisma
model DoctorProfile {
  // ... existing fields ...
  
  // NEW FIELDS
  // Performance tracking
  rating            Float?    @default(0)  // 1-5
  totalRatings      Int       @default(0)
  responseTimeAvg   Int?      // Average seconds to respond
  
  // Availability preferences
  defaultMaxConcurrentCases Int @default(1)
  emergencyResponseTimeMinutes Int @default(15)
  
  // Financial
  commissionRate    Decimal   @db.Decimal(4, 2) @default(0.20)  // 20% default
  payoutMethod      String?   // bank, mobile_money
  payoutDetails     Json?     // Account info (encrypted)
  
  // Relations to new models
  availability      DoctorAvailability?
  availabilitySchedules DoctorAvailabilitySchedule[]
  availabilityExceptions DoctorAvailabilityException[]
  consultationSessions ConsultationSession[]
  earnings          DoctorEarning[]
  performanceMetrics DoctorPerformanceMetrics?
  
  // ... existing relations ...
}
```

### 2.2 ServiceRequest Additions

```prisma
model ServiceRequest {
  // ... existing fields ...
  
  // NEW FIELDS
  // Priority and queue
  priorityScore     Int       @default(0)
  isEmergency       Boolean   @default(false)
  
  // Assignment tracking
  assignmentAttempts Int      @default(0)
  lastAssignmentAt  DateTime?
  
  // Consultation reference
  consultationSessionId String? @unique
  consultationSession ConsultationSession?
  
  // Followup chain
  parentRequestId   String?
  parentRequest     ServiceRequest? @relation("FollowupChain", fields: [parentRequestId], references: [id])
  followupRequests  ServiceRequest[] @relation("FollowupChain")
  
  // Relations to new models
  leadQueueEntry    LeadAssignmentQueue?
  followupSchedules FollowupSchedule[] @relation("ParentRequest")
  followupAsChild   FollowupSchedule? @relation("FollowupRequest")
  medicalAttachments MedicalAttachment[]
  doctorEarnings    DoctorEarning[]
  
  // ... existing relations ...
}
```

### 2.3 TreatmentCase Additions

```prisma
model TreatmentCase {
  // ... existing fields ...
  
  // NEW FIELDS
  // Structured data references
  examinationDataId String?
  examinationData   ExaminationData?
  
  // Versioning
  version           Int       @default(1)
  isLatestVersion   Boolean   @default(true)
  previousVersionId String?
  
  // Soft delete
  deletedAt         DateTime?
  deletedById       String?
  deleteReason      String?
  
  // ... existing relations ...
}
```

### 2.4 Prescription Additions

```prisma
model Prescription {
  // ... existing fields ...
  
  // NEW FIELDS
  // Validation status
  validationStatus  PrescriptionValidationStatus @default(PENDING)
  validationErrors  Json?     // Array of error messages
  
  // Immutability
  isFinalized       Boolean   @default(false)
  finalizedAt       DateTime?
  
  // Void tracking
  voidedAt          DateTime?
  voidedById        String?
  voidReason        String?
  
  // Followup reference
  followupScheduleId String?
  
  // ... existing relations ...
}

enum PrescriptionValidationStatus {
  PENDING
  VALIDATING
  VALID
  INVALID
  WARNING
}
```

---

## 3. Index Optimization

### 3.1 New Indexes for Performance

```prisma
// ServiceRequest - for assignment queries
@@index([status, isEmergency, createdAt])
@@index([assignedDoctorId, status, createdAt])
@@index([serviceCategoryId, status])
@@index([customerId, status, createdAt])

// DoctorProfile - for availability queries
@@index([providerStatus, acceptsEmergency])
@@index([providerStatus, acceptsOnlineConsultation])

// TreatmentCase - for history queries
@@index([animalId, createdAt])
@@index([doctorId, createdAt])
@@index([isLatestVersion, deletedAt])

// Prescription - for validation workflow
@@index([validationStatus, createdAt])
@@index([isFinalized, voidedAt])
```

---

## 4. Migration Strategy

### 4.1 Migration Order

1. **Phase 1: Foundation Tables** (No dependencies)
   - `DoctorAvailability`
   - `DoctorAvailabilitySchedule`
   - `DoctorAvailabilityException`
   - `MedicalAttachment`
   - `ClinicalAuditLog`

2. **Phase 2: Core Workflow** (Depends on Phase 1)
   - `ConsultationSession`
   - `ExaminationData`
   - `FollowupSchedule`
   - `LeadAssignmentQueue`

3. **Phase 3: Financial** (Depends on Phase 2)
   - `DoctorEarning`
   - `PayoutBatch`

4. **Phase 4: Analytics** (Depends on all above)
   - `DoctorPerformanceMetrics`

5. **Phase 5: Alterations** (Last)
   - Add columns to existing tables
   - Create indexes
   - Set up foreign keys

### 4.2 Data Migration Scripts

```typescript
// Migration: Populate initial doctor availability
async function migrateDoctorAvailability() {
  const doctors = await prisma.doctorProfile.findMany();
  
  for (const doctor of doctors) {
    await prisma.doctorAvailability.create({
      data: {
        doctorId: doctor.id,
        status: 'OFFLINE',
        maxConcurrentCases: doctor.defaultMaxConcurrentCases || 1,
      }
    });
  }
}

// Migration: Create default schedules for existing doctors
async function migrateDefaultSchedules() {
  const doctors = await prisma.doctorProfile.findMany();
  
  for (const doctor of doctors) {
    // Create default availability: Mon-Sat, 9AM-6PM
    for (let day = 1; day <= 6; day++) {
      await prisma.doctorAvailabilitySchedule.create({
        data: {
          doctorId: doctor.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '18:00',
          isAvailable: true,
          serviceTypes: ['DOCTOR_HOME_VISIT', 'ONLINE_CONSULTATION_LATER'],
        }
      });
    }
  }
}

// Migration: Backfill performance metrics
async function migratePerformanceMetrics() {
  const doctors = await prisma.doctorProfile.findMany();
  
  for (const doctor of doctors) {
    // Calculate historical metrics from existing data
    const metrics = await calculateHistoricalMetrics(doctor.id);
    
    await prisma.doctorPerformanceMetrics.create({
      data: {
        doctorId: doctor.id,
        ...metrics,
        periodStart: new Date('2024-01-01'),
        periodEnd: new Date(),
      }
    });
  }
}
```

---

## 5. Rollback Plan

### 5.1 Rollback Order (Reverse of Migration)

1. Remove foreign key constraints
2. Drop new columns from existing tables
3. Drop new tables (in reverse dependency order)

### 5.2 Safety Checks

```sql
-- Verify no data loss before dropping
SELECT COUNT(*) as row_count, 'DoctorAvailability' as table_name FROM doctor_availability
UNION ALL
SELECT COUNT(*), 'ConsultationSession' FROM consultation_sessions
UNION ALL
SELECT COUNT(*), 'DoctorEarning' FROM doctor_earnings;
```

---

## 6. Validation Checklist

- [ ] All foreign key constraints properly defined
- [ ] Cascade delete rules appropriate
- [ ] Indexes cover all query patterns
- [ ] Enum values match application code
- [ ] Default values set for new columns
- [ ] Nullable vs non-nullable correctly specified
- [ ] Decimal precision adequate for currency
- [ ] JSON fields have consistent structure
- [ ] Unique constraints prevent duplicates
- [ ] Soft delete fields present where needed

---

**Version**: 1.0.0
**Last Updated**: 2026-05-28
**Status**: Ready for Migration Implementation
