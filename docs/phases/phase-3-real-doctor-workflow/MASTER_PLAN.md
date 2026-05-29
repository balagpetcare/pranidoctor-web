# Phase 3: Real Doctor Workflow - Master Plan

## Executive Summary

This document defines the complete production-grade Real Doctor Workflow for the Prani Doctor veterinary telemedicine platform. This phase transforms the existing basic doctor assignment system into a comprehensive, real-world veterinary workflow supporting emergency calls, live consultations, prescriptions, follow-ups, and complete medical record management.

## Current State Analysis

### Existing Implementation (From Codebase Audit)

| Component | Status | Gaps Identified |
|-----------|--------|-----------------|
| DoctorProfile | ✅ Implemented | Missing availability schedule, performance metrics |
| ServiceRequest | ✅ Implemented | Missing priority queue, auto-assignment logic |
| TreatmentCase | ✅ Implemented | Missing vital signs, structured examination data |
| Prescription | ✅ Implemented | Missing dosage validation, drug interaction checks |
| TreatmentWorkflow | ✅ Implemented | Missing real-time status sync, timeout handling |
| DoctorServiceArea | ✅ Implemented | Legacy village-level, needs Area tree integration |
| BillingRecord | ✅ Implemented | Missing earnings calculation, payout workflow |

### Architecture Strengths
- P5 Treatment Workflow state machine implemented
- Multi-role JWT authentication (Admin/Doctor/Customer/AI Technician)
- Bangladesh geography hierarchy (Division→District→Upazila→Union→Village)
- Proxy pattern to backend for API consistency
- Prisma ORM with proper relations

### Critical Gaps
1. No real-time doctor availability tracking
2. No intelligent lead assignment algorithm
3. Missing consultation session lifecycle management
4. No medical attachment handling
5. Incomplete earnings/payout workflow
6. Missing doctor performance analytics
7. No emergency consultation prioritization
8. Missing offline/online state management
9. No consultation timer/timeout handling
10. Incomplete notification triggers

---

## Real Doctor Workflow Architecture

### 1. Core Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REAL DOCTOR WORKFLOW v3.0                           │
└─────────────────────────────────────────────────────────────────────────────┘

[EMERGENCY FLOW]                    [STANDARD FLOW]                    [SCHEDULED FLOW]
       │                                   │                                  │
       ▼                                   ▼                                  ▼
┌──────────────┐                 ┌──────────────┐                 ┌──────────────┐
│  EMERGENCY   │                 │   CUSTOMER   │                 │   CUSTOMER   │
│    CALL      │                 │    REQUEST   │                 │   BOOKS APPT │
└──────┬───────┘                 └──────┬───────┘                 └──────┬───────┘
       │                                │                                  │
       ▼                                ▼                                  ▼
┌──────────────┐                 ┌──────────────┐                 ┌──────────────┐
│ PRIORITY QUEUE│                │ AVAILABILITY │                 │   SCHEDULE   │
│   (P0-P1)    │                 │    CHECK     │                 │   CONFIRM    │
└──────┬───────┘                 └──────┬───────┘                 └──────┬───────┘
       │                                │                                  │
       ▼                                ▼                                  ▼
┌──────────────┐                 ┌──────────────┐                 ┌──────────────┐
│ AUTO-ASSIGN  │                 │ LEAD ROUTING │                 │  DOCTOR      │
│  (BROADCAST) │                 │  ENGINE      │                 │  ACCEPTS     │
└──────┬───────┘                 └──────┬───────┘                 └──────┬───────┘
       │                                │                                  │
       └────────────────────────────────┼──────────────────────────────────┘
                                      │
                                      ▼
                           ┌──────────────────┐
                           │  DOCTOR ACCEPTS  │
                           └────────┬─────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
            ┌──────────┐    ┌──────────┐    ┌──────────┐
            │  REJECT  │    │ CONSULT  │    │  TIMEOUT │
            │(reassign)│    │  START   │    │(reassign)│
            └────┬─────┘    └────┬─────┘    └────┬─────┘
                 │               │               │
                 │               ▼               │
                 │      ┌──────────────┐         │
                 │      │   SESSION    │         │
                 │      │   ACTIVE     │         │
                 │      └──────┬───────┘         │
                 │             │                 │
                 │    ┌────────┼────────┐         │
                 │    ▼        ▼        ▼         │
                 │ ┌──────┐ ┌──────┐ ┌──────┐     │
                 │ │CHAT  │ │CALL  │ │VIDEO │     │
                 │ │ACTIVE│ │ACTIVE│ │ACTIVE│     │
                 │ └──┬───┘ └──┬───┘ └──┬───┘     │
                 │    └────┬───┘        │         │
                 │         ▼            │         │
                 │  ┌──────────────┐     │         │
                 │  │  EXAMINATION │     │         │
                 │  │   RECORDED   │     │         │
                 │  └──────┬───────┘     │         │
                 │         │              │         │
                 │         ▼              │         │
                 │  ┌──────────────┐      │         │
                 │  │ DIAGNOSIS &  │      │         │
                 │  │  PRESCRIPTION│      │         │
                 │  └──────┬───────┘      │         │
                 │         │               │         │
                 │         ▼               │         │
                 │  ┌──────────────┐       │         │
                 │  │   FOLLOWUP   │◄──────┘         │
                 │  │   SCHEDULED  │                 │
                 │  └──────┬───────┘                 │
                 │         │                         │
                 └─────────┼─────────────────────────┘
                           ▼
                    ┌──────────────┐
                    │   CASE       │
                    │   CLOSED     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   BILLING    │
                    │  GENERATED   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   EARNINGS   │
                    │   CREDITED   │
                    └──────────────┘
```

### 2. Module Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MODULE DEPENDENCY GRAPH                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   DoctorCore    │────▶│  Availability   │────▶│   Assignment    │
│   (Profile)     │     │   (Schedule)    │     │   (LeadRouter)  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐           │
         │              │   Consultation  │◄────────────┘
         │              │   (Session Mgr) │
         │              └────────┬────────┘
         │                       │
         │         ┌─────────────┼─────────────┐
         │         ▼             ▼             ▼
         │  ┌──────────┐  ┌──────────┐  ┌──────────┐
         │  │Treatment │  │Prescrip- │  │ Followup │
         │  │  Case    │  │  tion    │  │          │
         │  └────┬─────┘  └────┬─────┘  └────┬─────┘
         │       └─────────────┴─────────────┘
         │                       │
         │                       ▼
         │              ┌─────────────────┐
         │              │ Medical Records │
         │              │  (History Mgr)  │
         │              └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   Earnings      │◀────│   Billing       │
│   (Payout Mgr)  │     │   (Invoice Mgr) │
└─────────────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│   Analytics     │
│   (Metrics Mgr) │
└─────────────────┘
```

---

## 3. Detailed Workflow Specifications

### 3.1 Doctor Availability Engine

#### States
```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ OFFLINE  │───▶│  ONLINE  │───▶│  BUSY    │───▶│ ON_BREAK │
│          │◀───│          │◀───│          │◀───┤          │
└──────────┘    └────┬─────┘    └──────────┘    └──────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌─────────┐  ┌─────────┐  ┌─────────┐
   │AVAILABLE│  │LIMITED  │  │EMERGENCY│
   │FOR ALL  │  │CAPACITY │  │ONLY     │
   └─────────┘  └─────────┘  └─────────┘
```

#### Availability Schedule Model
```typescript
interface DoctorAvailabilitySchedule {
  // Weekly recurring schedule
  regularHours: {
    dayOfWeek: 0-6;  // Sunday = 0
    startTime: "HH:mm";
    endTime: "HH:mm";
    isAvailable: boolean;
    maxConcurrentCases: number;
    serviceTypes: ServiceRequestType[];
  }[];
  
  // Exception dates (holidays, time off)
  exceptions: {
    date: Date;
    isAvailable: boolean;
    reason?: string;
  }[];
  
  // Real-time overrides
  currentStatus: DoctorRealTimeStatus;
  statusExpiresAt?: Date;
  temporaryNote?: string;
}

enum DoctorRealTimeStatus {
  ONLINE_AVAILABLE = "ONLINE_AVAILABLE",
  ONLINE_LIMITED = "ONLINE_LIMITED", 
  ONLINE_EMERGENCY_ONLY = "ONLINE_EMERGENCY_ONLY",
  BUSY_WITH_CASE = "BUSY_WITH_CASE",
  ON_BREAK = "ON_BREAK",
  OFFLINE = "OFFLINE"
}
```

#### Availability Rules
1. **Emergency Override**: Emergency requests bypass availability checks
2. **Concurrent Limit**: Doctors can set max active consultations (default: 1)
3. **Area Matching**: Only show doctors covering customer's area
4. **Service Type**: Doctor must support the requested service type
5. **Time Window**: For scheduled appointments, check against regular hours

### 3.2 Lead Assignment Engine

#### Assignment Algorithm
```
INPUT: ServiceRequest with location, serviceType, isEmergency, priority
OUTPUT: Ranked list of eligible doctors

ALGORITHM:
1. FILTER PHASE:
   - Area coverage match (DoctorProfileArea)
   - Service type supported (DoctorProfileServiceCategory)
   - Provider status = ACTIVE
   - Not suspended
   - Accepts emergency (if isEmergency=true)

2. SCORING PHASE (100-point scale):
   - Availability (30 pts): ONLINE_AVAILABLE=30, ONLINE_LIMITED=20, BUSY=10
   - Proximity (25 pts): Based on area hierarchy match depth
   - Performance (20 pts): Rating-based score
   - Workload (15 pts): Inverse of active case count
   - Specialization (10 pts): Exact match bonus

3. SORT: Descending by total score

4. ASSIGNMENT:
   - Emergency: Broadcast to top 5 simultaneously
   - Standard: Assign to top 1, timeout after 2 min, reassign
   - Scheduled: Direct assignment with confirmation
```

#### Auto-Assignment Config
```typescript
interface LeadAssignmentConfig {
  // Timing
  assignmentTimeoutSeconds: number;      // Default: 120
  reassignmentAttempts: number;          // Default: 3
  broadcastPoolSize: number;               // Default: 5
  
  // Scoring weights
  weights: {
    availability: number;
    proximity: number;
    performance: number;
    workload: number;
    specialization: number;
  };
  
  // Emergency settings
  emergency: {
    broadcastToAllOnline: boolean;
    bypassAvailabilityCheck: boolean;
    priorityBoost: number;
  };
}
```

### 3.3 Consultation Session Lifecycle

#### Session States
```
┌─────────────┐
│   CREATED   │ ── Request accepted by doctor
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   WAITING   │ ── Customer joining/confirming
│  FOR_CUSTOMER│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   ACTIVE    │ ── Both parties connected
└──────┬──────┘
       │
       ├─────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌─────────────┐                       ┌─────────────┐
│  PAUSED     │ ── Temporary hold     │   ENDED     │ ── Normal completion
│             │                       │             │
└──────┬──────┘                       └──────┬──────┘
       │                                     │
       ▼                                     ▼
┌─────────────┐                       ┌─────────────┐
│  RESUMED    │                       │   CLOSED    │ ── Final state
└─────────────┘                       │             │
                                      │  Sub-states:
                                      │  - COMPLETED
                                      │  - CANCELLED
                                      │  - TIMEOUT
                                      │  - DISCONNECTED
                                      └─────────────┘
```

#### Session Data Model
```typescript
interface ConsultationSession {
  id: string;
  serviceRequestId: string;
  doctorId: string;
  customerId: string;
  animalId: string;
  
  // Timing
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  durationSeconds?: number;
  
  // Status
  status: ConsultationSessionStatus;
  endReason?: ConsultationEndReason;
  
  // Communication
  communicationType: CommunicationType;  // CHAT, VOICE, VIDEO
  channelId?: string;  // For Twilio/Agora integration
  
  // Clinical data
  examinationData?: ExaminationData;
  diagnosis?: DiagnosisData;
  prescription?: PrescriptionData;
  
  // Quality metrics
  connectionQuality?: ConnectionQualityLog[];
  interruptions?: InterruptionLog[];
}

interface ExaminationData {
  // Vital Signs
  temperature?: number;  // Celsius
  pulseRate?: number;   // BPM
  respiratoryRate?: number;  // Breaths per minute
  weight?: number;      // kg
  bodyConditionScore?: 1-9;  // Standard BCS
  
  // Physical Examination
  generalAppearance?: string;
  skinCoatCondition?: string;
  mucousMembranes?: string;
  lymphNodes?: string;
  
  // System-wise examination
  digestiveSystem?: SystemExamination;
  respiratorySystem?: SystemExamination;
  cardiovascularSystem?: SystemExamination;
  nervousSystem?: SystemExamination;
  musculoskeletalSystem?: SystemExamination;
  
  // Attachments
  attachmentIds: string[];
}

interface SystemExamination {
  isNormal: boolean;
  abnormalities?: string;
  notes?: string;
}
```

### 3.4 Prescription Engine

#### Prescription Workflow
```
┌──────────────┐
│   DRAFT      │ ── Doctor creating prescription
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  VALIDATING  │ ── System checks (auto)
└──────┬───────┘
       │
       ├─▶ [Valid] ──▶ ┌──────────────┐
       │               │   ACTIVE     │ ── Prescription live
       │               └──────┬───────┘
       │                      │
       │                      ▼
       │               ┌──────────────┐
       │               │   FILLED     │ ── Medicine dispensed
       │               └──────┬───────┘
       │                      │
       │                      ▼
       │               ┌──────────────┐
       │               │  COMPLETED   │ ── Course finished
       │               └──────────────┘
       │
       └─▶ [Invalid] ──▶ ┌──────────────┐
                         │   REJECTED   │ ── Errors found
                         └──────────────┘
```

#### Prescription Validation Rules
```typescript
interface PrescriptionValidationRules {
  // Dosage validation
  dosage: {
    requireUnit: boolean;
    validUnits: string[];  // ["mg", "ml", "tablet", "capsule", "teaspoon"]
    maxDosagePerDay: number;  // Warn if exceeded
  };
  
  // Duration validation
  duration: {
    maxDays: number;  // 30 days default
    requireEndDate: boolean;
  };
  
  // Drug interaction (future)
  drugInteractions: {
    checkEnabled: boolean;
    databaseSource?: string;
  };
  
  // Species-specific warnings
  speciesSpecific: {
    checkContraindications: boolean;
    warnOnOffLabelUse: boolean;
  };
}
```

### 3.5 Follow-up Workflow

#### Follow-up Types
```typescript
enum FollowupType {
  ROUTINE_CHECK = "ROUTINE_CHECK",           // Standard follow-up
  MEDICATION_REVIEW = "MEDICATION_REVIEW",   // Check medication response
  WOUND_CHECK = "WOUND_CHECK",               // Post-surgical/procedure
  VACCINATION = "VACCINATION",               // Next dose scheduling
  LAB_REVIEW = "LAB_REVIEW",                 // Review test results
  CUSTOM = "CUSTOM"                          // Doctor defined
}

interface FollowupSchedule {
  id: string;
  parentServiceRequestId: string;
  scheduledAt: Date;
  followupType: FollowupType;
  
  // Reminder settings
  reminderHoursBefore: number[];  // [24, 2] = 24hr and 2hr before
  
  // Status
  status: FollowupStatus;
  completedAt?: Date;
  completedByDoctorId?: string;
  
  // Outcome
  outcomeNotes?: string;
  nextFollowupId?: string;  // Chain follow-ups
}
```

### 3.6 Medical Attachment System

#### Attachment Categories
```typescript
enum MedicalAttachmentType {
  // Clinical
  EXAMINATION_PHOTO = "EXAMINATION_PHOTO",
  WOUND_PHOTO = "WOUND_PHOTO",
  SKIN_CONDITION_PHOTO = "SKIN_CONDITION_PHOTO",
  EYE_EXAM_PHOTO = "EYE_EXAM_PHOTO",
  EAR_EXAM_PHOTO = "EAR_EXAM_PHOTO",
  
  // Diagnostic
  X_RAY = "X_RAY",
  ULTRASOUND = "ULTRASOUND",
  LAB_REPORT = "LAB_REPORT",
  BLOOD_TEST = "BLOOD_TEST",
  URINE_TEST = "URINE_TEST",
  FECAL_TEST = "FECAL_TEST",
  
  // Documentation
  PREVIOUS_PRESCRIPTION = "PREVIOUS_PRESCRIPTION",
  VACCINATION_RECORD = "VACCINATION_RECORD",
  MEDICAL_HISTORY_DOC = "MEDICAL_HISTORY_DOC",
  
  // Other
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  OTHER = "OTHER"
}

interface MedicalAttachment {
  id: string;
  serviceRequestId: string;
  uploadedBy: string;  // userId
  uploadedByRole: UserRole;
  
  type: MedicalAttachmentType;
  fileUrl: string;
  thumbnailUrl?: string;
  
  // Metadata
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  
  // Clinical context
  description?: string;
  takenAt?: Date;  // When photo/video was taken
  locationContext?: string;  // e.g., "Left hind leg"
  
  // Privacy
  isPrivate: boolean;  // Only visible to doctors
  
  // Audit
  uploadedAt: Date;
  deletedAt?: Date;
  deletedBy?: string;
}
```

### 3.7 Patient History Aggregation

#### History View Model
```typescript
interface PatientHistoryView {
  animalId: string;
  animalProfile: AnimalProfile;
  
  // Summary statistics
  summary: {
    totalConsultations: number;
    totalPrescriptions: number;
    lastVisitDate?: Date;
    regularMedications: string[];
    knownAllergies: string[];
    chronicConditions: string[];
  };
  
  // Timeline
  timeline: HistoryEvent[];
  
  // Categorized records
  records: {
    consultations: ConsultationSummary[];
    prescriptions: PrescriptionSummary[];
    vaccinations: VaccinationRecord[];
    labResults: LabResultSummary[];
  };
}

interface HistoryEvent {
  id: string;
  eventType: "CONSULTATION" | "PRESCRIPTION" | "VACCINATION" | "LAB_TEST" | "FOLLOWUP";
  date: Date;
  title: string;
  description: string;
  doctorName: string;
  serviceRequestId: string;
  isEmergency: boolean;
}
```

---

## 4. Notification Matrix

### Event Triggers

| Event | Customer | Doctor | Admin | Channel | Priority |
|-------|----------|--------|-------|---------|----------|
| Request Created | - | Broadcast (area) | Dashboard | Push | High |
| Doctor Assigned | SMS+Push | Push | - | Push | High |
| Doctor Accepted | Push | - | Dashboard | Push | High |
| Consultation Started | Push | - | - | Push | Normal |
| Prescription Added | Push+Email | - | - | Push | Normal |
| Followup Scheduled | Push | Push | - | Push | Normal |
| Followup Reminder (24h) | Push | Push | - | Push | Normal |
| Followup Reminder (2h) | SMS+Push | Push | - | SMS | High |
| Case Completed | Push+Email | - | Dashboard | Push | Normal |
| Payment Received | - | Push | Dashboard | Push | Normal |
| Emergency Request | SMS+Push | Broadcast All | SMS+Push | SMS | Critical |
| Doctor Timeout | SMS | - | Dashboard | Push | High |
| Reassignment | SMS+Push | New Doctor | Dashboard | Push | High |

---

## 5. Security & RBAC

### Doctor Permissions
```typescript
const DoctorPermissions = {
  // Consultation
  VIEW_ASSIGNED_CASES: "doctor:cases:view",
  ACCEPT_CASE: "doctor:cases:accept",
  REJECT_CASE: "doctor:cases:reject",
  START_CONSULTATION: "doctor:consultation:start",
  END_CONSULTATION: "doctor:consultation:end",
  
  // Clinical
  CREATE_TREATMENT_CASE: "doctor:treatment:create",
  UPDATE_TREATMENT_CASE: "doctor:treatment:update",
  CREATE_PRESCRIPTION: "doctor:prescription:create",
  VIEW_PATIENT_HISTORY: "doctor:history:view",
  
  // Attachments
  UPLOAD_ATTACHMENT: "doctor:attachment:upload",
  VIEW_ATTACHMENTS: "doctor:attachment:view",
  
  // Personal
  VIEW_OWN_EARNINGS: "doctor:earnings:view",
  UPDATE_AVAILABILITY: "doctor:availability:update",
  UPDATE_PROFILE: "doctor:profile:update",
};
```

### Data Access Rules
1. **Doctor can only view**: Their assigned cases, their earnings, their performance
2. **Doctor can only edit**: Cases assigned to them, their own profile, their availability
3. **Patient history**: Visible only to assigned doctor during active case
4. **Attachments**: Private attachments only visible to doctors
5. **Prescriptions**: Immutable after 24 hours (void only)

---

## 6. Edge Cases & Error Recovery

### Edge Case Handling

| Scenario | Detection | Recovery Action |
|----------|-----------|-----------------|
| Doctor goes offline mid-consultation | Heartbeat timeout | Auto-pause, notify customer, 5-min grace period |
| Customer disconnects | Connection lost | 2-min wait, then mark for callback |
| Both disconnect | Dual timeout | Case suspended, admin notified |
| Doctor rejects all assignments | Rejection streak | Temporarily reduce priority, notify admin |
| Payment failure post-consultation | Billing webhook | Mark for manual review, don't block doctor payout |
| Prescription drug not found | Validation error | Allow free-text entry with warning |
| Duplicate request | Same customer+animal+time | Merge or reject with explanation |
| Doctor double-booked | Concurrent assignment | Prevent via availability lock |
| Emergency during standard case | Priority conflict | Allow parallel emergency acceptance |

### Error Recovery Flow
```
ERROR DETECTED
      │
      ▼
┌─────────────┐
│ CLASSIFY    │
│ ERROR TYPE  │
└──────┬──────┘
       │
       ├─▶ RETRYABLE ──▶ Queue for retry (max 3)
       │
       ├─▶ RECOVERABLE ──▶ Initiate recovery workflow
       │
       └─▶ CRITICAL ──▶ Alert admin + log incident
```

---

## 7. Production Readiness Checklist

### Performance
- [ ] Database query optimization (< 100ms for common queries)
- [ ] Connection pooling configured
- [ ] Redis caching for doctor availability
- [ ] CDN for medical attachments
- [ ] Rate limiting on all endpoints

### Reliability
- [ ] Circuit breakers for external services
- [ ] Graceful degradation when services down
- [ ] Automatic retry with exponential backoff
- [ ] Dead letter queue for failed jobs
- [ ] Health check endpoints

### Monitoring
- [ ] Doctor availability metrics
- [ ] Assignment success rate
- [ ] Consultation completion rate
- [ ] Average response time
- [ ] Error rate by endpoint
- [ ] Business metrics dashboard

### Security
- [ ] All endpoints authenticated
- [ ] RBAC enforced
- [ ] Input validation on all APIs
- [ ] File upload scanning
- [ ] SQL injection prevention (Prisma)
- [ ] XSS protection

### Compliance
- [ ] Medical data encryption at rest
- [ ] Audit logging for all clinical actions
- [ ] Data retention policies
- [ ] GDPR/privacy compliance
- [ ] Medical record immutability

---

## 8. Future Scalability Notes

### Phase 4+ Considerations
1. **AI Triage**: Pre-consultation symptom checker
2. **Video Consultation**: WebRTC integration
3. **IoT Integration**: Vital signs from smart devices
4. **Pharmacy Integration**: Direct prescription to pharmacy
5. **Lab Integration**: Digital lab result ingestion
6. **Insurance**: Pet insurance claim processing
7. **Multi-language**: Bengali interface support
8. **Offline Mode**: Full offline consultation capability

### Technical Debt Prevention
- Keep business logic in backend services
- Use event-driven architecture for loose coupling
- Design for horizontal scaling from day 1
- Abstract external integrations (SMS, Push, Payment)
- Version all APIs

---

## 9. Implementation Phases

### Phase 3A: Foundation (Week 1-2)
- Availability engine
- Lead assignment algorithm
- Basic consultation session

### Phase 3B: Clinical Core (Week 3-4)
- Examination data structure
- Prescription engine
- Medical attachments

### Phase 3C: Workflow Completion (Week 5-6)
- Follow-up system
- Patient history
- Case timeline

### Phase 3D: Polish (Week 7-8)
- Notifications
- Earnings calculation
- Admin monitoring
- Performance optimization

---

## Document References

- API_GAPS.md - Detailed API endpoint specifications
- DATABASE_GAPS.md - Schema changes and migrations
- FLUTTER_GAPS.md - Mobile screen requirements
- ADMIN_PANEL_GAPS.md - Admin UI specifications
- WORKFLOW_STATES.md - Complete state machine definitions
- IMPLEMENTATION_SEQUENCE.md - Prioritized task list

---

**Version**: 1.0.0
**Last Updated**: 2026-05-28
**Status**: Planning Complete - Ready for Implementation
