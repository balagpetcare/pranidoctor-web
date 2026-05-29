# Phase 3: API Gaps Analysis

## Executive Summary

This document defines all API endpoints required for the Real Doctor Workflow, organized by module and role. Each endpoint includes method, path, request/response schemas, authentication requirements, and rate limiting.

---

## 1. Doctor Availability APIs

### 1.1 Real-time Status Management

#### Update Availability Status
```
POST /api/doctor/availability/status
Auth: Doctor JWT
Rate Limit: 30/min

Request:
{
  "status": "ONLINE_AVAILABLE" | "ONLINE_LIMITED" | "ONLINE_EMERGENCY_ONLY" | "BUSY_WITH_CASE" | "ON_BREAK" | "OFFLINE",
  "temporaryNote": "string?",
  "statusDurationMinutes": "number?"  // Auto-revert after
}

Response: {
  "ok": true,
  "data": {
    "status": "ONLINE_AVAILABLE",
    "statusUpdatedAt": "2026-05-28T10:00:00Z",
    "statusExpiresAt": "2026-05-28T11:00:00Z"
  }
}

Errors:
- 400: Invalid status transition
- 429: Rate limited
```

#### Heartbeat (Keep Alive)
```
POST /api/doctor/availability/heartbeat
Auth: Doctor JWT
Rate Limit: 60/min

Request: {}  // Empty, just updates timestamp

Response: {
  "ok": true,
  "data": {
    "lastHeartbeatAt": "2026-05-28T10:00:00Z",
    "activeCaseCount": 1,
    "pendingAssignments": 2
  }
}

Note: Called every 30 seconds when doctor is online
```

#### Get Current Availability
```
GET /api/doctor/availability
Auth: Doctor JWT

Response: {
  "ok": true,
  "data": {
    "status": "ONLINE_AVAILABLE",
    "maxConcurrentCases": 2,
    "activeCaseCount": 1,
    "lastHeartbeatAt": "2026-05-28T10:00:00Z",
    "temporaryNote": null,
    "statusExpiresAt": null
  }
}
```

### 1.2 Schedule Management

#### Get Weekly Schedule
```
GET /api/doctor/availability/schedule
Auth: Doctor JWT

Response: {
  "ok": true,
  "data": {
    "schedules": [
      {
        "id": "uuid",
        "dayOfWeek": 1,
        "startTime": "09:00",
        "endTime": "18:00",
        "isAvailable": true,
        "maxConcurrentCases": 2,
        "serviceTypes": ["DOCTOR_HOME_VISIT", "ONLINE_CONSULTATION_LATER"]
      }
    ],
    "exceptions": [
      {
        "id": "uuid",
        "exceptionDate": "2026-06-01",
        "isAvailable": false,
        "reason": "Public Holiday"
      }
    ]
  }
}
```

#### Update Weekly Schedule
```
PUT /api/doctor/availability/schedule
Auth: Doctor JWT
Rate Limit: 10/min

Request:
{
  "schedules": [
    {
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "18:00",
      "isAvailable": true,
      "maxConcurrentCases": 2,
      "serviceTypes": ["DOCTOR_HOME_VISIT"]
    }
  ]
}

Response: {
  "ok": true,
  "data": { "updatedCount": 6 }
}

Validation:
- dayOfWeek: 0-6
- startTime < endTime
- maxConcurrentCases: 1-5
```

#### Add Schedule Exception
```
POST /api/doctor/availability/exceptions
Auth: Doctor JWT

Request:
{
  "exceptionDate": "2026-06-01",
  "isAvailable": false,
  "reason": "Personal leave"
}

Response: {
  "ok": true,
  "data": { "id": "uuid" }
}
```

#### Delete Schedule Exception
```
DELETE /api/doctor/availability/exceptions/:id
Auth: Doctor JWT

Response: {
  "ok": true,
  "data": { "deleted": true }
}
```

---

## 2. Lead Assignment APIs

### 2.1 Doctor Assignment Endpoints

#### Get Available Assignments (Doctor View)
```
GET /api/doctor/assignments/available
Auth: Doctor JWT
Query: ?lat=&lng=&radius=&serviceType=

Response: {
  "ok": true,
  "data": {
    "assignments": [
      {
        "serviceRequestId": "uuid",
        "priority": 100,
        "isEmergency": false,
        "distanceKm": 2.5,
        "estimatedEarning": 500.00,
        "expiresAt": "2026-05-28T10:02:00Z",
        "customerInfo": {
          "name": "A**** H***",
          "area": "Dhanmondi"
        },
        "animalInfo": {
          "type": "COW",
          "breed": "Sahiwal"
        }
      }
    ]
  }
}
```

#### Accept Assignment
```
POST /api/doctor/assignments/:serviceRequestId/accept
Auth: Doctor JWT
Rate Limit: 10/min
Idempotency Key Required

Request:
{
  "idempotencyKey": "uuid"
}

Response: {
  "ok": true,
  "data": {
    "serviceRequestId": "uuid",
    "status": "ACCEPTED",
    "consultationSessionId": "uuid",
    "nextSteps": ["START_CONSULTATION"]
  }
}

Errors:
- 409: Already assigned to another doctor
- 410: Assignment expired
- 423: Doctor at max capacity
```

#### Reject Assignment
```
POST /api/doctor/assignments/:serviceRequestId/reject
Auth: Doctor JWT

Request:
{
  "reason": "TOO_FAR" | "BUSY" | "NOT_AVAILABLE" | "OTHER",
  "note": "string?"
}

Response: {
  "ok": true,
  "data": { "rejected": true }
}
```

### 2.2 Admin Assignment Control

#### Manual Assign Doctor
```
POST /api/admin/service-requests/:id/assign-doctor
Auth: Admin JWT

Request:
{
  "doctorId": "uuid",
  "priority": 100,
  "note": "Emergency case - priority assignment",
  "bypassAvailability": false
}

Response: {
  "ok": true,
  "data": {
    "serviceRequestId": "uuid",
    "assignedDoctorId": "uuid",
    "status": "ASSIGNED",
    "doctorNotified": true
  }
}
```

#### Reassign Doctor
```
POST /api/admin/service-requests/:id/reassign-doctor
Auth: Admin JWT

Request:
{
  "newDoctorId": "uuid",
  "reason": "DOCTOR_UNAVAILABLE" | "CUSTOMER_REQUEST" | "EMERGENCY" | "OTHER",
  "note": "string"
}

Response: {
  "ok": true,
  "data": {
    "serviceRequestId": "uuid",
    "previousDoctorId": "uuid",
    "newDoctorId": "uuid",
    "status": "ASSIGNED"
  }
}
```

#### Get Assignment Queue Status
```
GET /api/admin/assignments/queue
Auth: Admin JWT
Query: ?status=&priority=&page=&limit=

Response: {
  "ok": true,
  "data": {
    "queue": [
      {
        "id": "uuid",
        "serviceRequestId": "uuid",
        "status": "ASSIGNING",
        "priority": 100,
        "attemptCount": 2,
        "assignedDoctorId": "uuid",
        "assignedAt": "2026-05-28T10:00:00Z",
        "expiresAt": "2026-05-28T10:02:00Z"
      }
    ],
    "stats": {
      "pending": 5,
      "assigning": 3,
      "timeout": 2
    }
  }
}
```

---

## 3. Consultation Session APIs

### 3.1 Session Lifecycle

#### Start Consultation
```
POST /api/doctor/consultations/:serviceRequestId/start
Auth: Doctor JWT

Request:
{
  "communicationType": "CHAT" | "VOICE" | "VIDEO",
  "channelId": "string?"  // For external provider
}

Response: {
  "ok": true,
  "data": {
    "sessionId": "uuid",
    "status": "ACTIVE",
    "startedAt": "2026-05-28T10:00:00Z",
    "communicationType": "CHAT",
    "channelId": "string"
  }
}

Errors:
- 403: Case not assigned to this doctor
- 409: Session already active
```

#### Pause Consultation
```
POST /api/doctor/consultations/:sessionId/pause
Auth: Doctor JWT

Request:
{
  "reason": "CUSTOMER_NOT_RESPONDING" | "TECHNICAL_ISSUE" | "BREAK" | "OTHER"
}

Response: {
  "ok": true,
  "data": {
    "sessionId": "uuid",
    "status": "PAUSED",
    "pausedAt": "2026-05-28T10:05:00Z",
    "autoResumeAt": "2026-05-28T10:15:00Z"
  }
}
```

#### Resume Consultation
```
POST /api/doctor/consultations/:sessionId/resume
Auth: Doctor JWT

Response: {
  "ok": true,
  "data": {
    "sessionId": "uuid",
    "status": "ACTIVE",
    "resumedAt": "2026-05-28T10:10:00Z",
    "totalPausedDuration": 300
  }
}
```

#### End Consultation
```
POST /api/doctor/consultations/:sessionId/end
Auth: Doctor JWT

Request:
{
  "endReason": "COMPLETED" | "CANCELLED" | "TRANSFERRED" | "TECHNICAL_ERROR",
  "summary": "string?",
  "followupRequired": boolean,
  "followupDate": "date?"
}

Response: {
  "ok": true,
  "data": {
    "sessionId": "uuid",
    "status": "ENDED",
    "endedAt": "2026-05-28T10:30:00Z",
    "durationSeconds": 1800,
    "nextStep": "CREATE_TREATMENT_CASE"
  }
}
```

### 3.2 Session Status

#### Get Session Status
```
GET /api/doctor/consultations/:sessionId
Auth: Doctor JWT

Response: {
  "ok": true,
  "data": {
    "id": "uuid",
    "serviceRequestId": "uuid",
    "status": "ACTIVE",
    "communicationType": "CHAT",
    "channelId": "string",
    "createdAt": "2026-05-28T10:00:00Z",
    "startedAt": "2026-05-28T10:00:00Z",
    "durationSeconds": 1800,
    "customerJoined": true,
    "connectionQuality": {
      "score": 4.5,
      "latency": 120
    }
  }
}
```

#### Get Active Session for Request
```
GET /api/doctor/service-requests/:serviceRequestId/session
Auth: Doctor JWT

Response: {
  "ok": true,
  "data": {
    "sessionId": "uuid",
    "status": "ACTIVE",
    "canStart": false,
    "canEnd": true
  }
}
```

### 3.3 Customer Session APIs

#### Join Consultation (Customer)
```
POST /api/mobile/consultations/:sessionId/join
Auth: Customer JWT

Response: {
  "ok": true,
  "data": {
    "sessionId": "uuid",
    "channelId": "string",
    "token": "string",  // For Twilio/Agora
    "doctorName": "Dr. Ahmed",
    "status": "ACTIVE"
  }
}
```

#### Get Customer Active Session
```
GET /api/mobile/consultations/active
Auth: Customer JWT

Response: {
  "ok": true,
  "data": {
    "sessionId": "uuid",
    "serviceRequestId": "uuid",
    "doctorName": "Dr. Ahmed",
    "status": "ACTIVE",
    "startedAt": "2026-05-28T10:00:00Z",
    "canJoin": true
  }
}
```

---

## 4. Examination & Clinical Data APIs

### 4.1 Examination Data

#### Create/Update Examination
```
POST /api/doctor/service-requests/:serviceRequestId/examination
Auth: Doctor JWT

Request:
{
  // Vital Signs
  "temperature": 38.5,
  "pulseRate": 72,
  "respiratoryRate": 24,
  "weight": 450.5,
  "bodyConditionScore": 6,
  
  // General
  "generalAppearance": "Alert, responsive",
  "skinCoatCondition": "Normal, no parasites",
  "mucousMembranes": "Pink, moist",
  "lymphNodes": "Not enlarged",
  
  // Systems
  "digestiveSystem": {
    "isNormal": false,
    "abnormalities": "Reduced rumen motility",
    "notes": "Mild bloat observed"
  },
  "respiratorySystem": {
    "isNormal": true,
    "abnormalities": null,
    "notes": null
  },
  
  // Other
  "abnormalFindings": "Slight lameness in left hind leg",
  "notes": "Animal appears stressed",
  "attachmentIds": ["uuid", "uuid"]
}

Response: {
  "ok": true,
  "data": {
    "examinationId": "uuid",
    "recordedAt": "2026-05-28T10:15:00Z",
    "autoSaved": true
  }
}
```

#### Get Examination Data
```
GET /api/doctor/service-requests/:serviceRequestId/examination
Auth: Doctor JWT

Response: {
  "ok": true,
  "data": {
    "id": "uuid",
    "temperature": 38.5,
    "pulseRate": 72,
    // ... all examination fields
    "recordedByDoctorId": "uuid",
    "recordedAt": "2026-05-28T10:15:00Z",
    "attachments": [
      {
        "id": "uuid",
        "type": "EXAMINATION_PHOTO",
        "thumbnailUrl": "string"
      }
    ]
  }
}
```

### 4.2 Diagnosis

#### Save Diagnosis
```
POST /api/doctor/service-requests/:serviceRequestId/diagnosis
Auth: Doctor JWT

Request:
{
  "primaryDiagnosis": "Rumen Acidosis",
  "secondaryDiagnoses": ["Mild dehydration"],
  "diagnosisCode": "ICD-10 code?",
  "severity": "MODERATE" | "MILD" | "SEVERE",
  "differentialDiagnoses": ["Rumen impaction", "Traumatic reticulitis"],
  "notes": "Based on history of grain overload"
}

Response: {
  "ok": true,
  "data": {
    "diagnosisId": "uuid",
    "recordedAt": "2026-05-28T10:20:00Z"
  }
}
```

---

## 5. Prescription APIs

### 5.1 Prescription Management

#### Create Prescription
```
POST /api/doctor/service-requests/:serviceRequestId/prescriptions
Auth: Doctor JWT
Rate Limit: 30/min

Request:
{
  "validUntil": "2026-06-28",
  "instructions": "Give all medications with food",
  "items": [
    {
      "medicineName": "Sodium Bicarbonate",
      "genericName": "NaHCO3",
      "dosage": "100g",
      "frequency": "Twice daily",
      "duration": "5 days",
      "instruction": "Dissolve in warm water and drench",
      "quantity": "1 kg",
      "route": "ORAL"
    },
    {
      "medicineName": "Electrolyte Powder",
      "dosage": "50g per liter",
      "frequency": "Ad libitum",
      "duration": "7 days",
      "quantity": "2 kg"
    }
  ]
}

Response: {
  "ok": true,
  "data": {
    "prescriptionId": "uuid",
    "validationStatus": "VALID",
    "warnings": [],
    "isFinalized": false
  }
}

Validation:
- Max 10 items per prescription
- Medicine name required
- Duration max 30 days
```

#### Update Prescription (Before Finalization)
```
PATCH /api/doctor/prescriptions/:id
Auth: Doctor JWT

Request:
{
  "items": [...],  // Full replacement
  "instructions": "updated instructions"
}

Response: {
  "ok": true,
  "data": {
    "prescriptionId": "uuid",
    "version": 2,
    "validationStatus": "VALID"
  }
}

Errors:
- 403: Prescription already finalized (>24h old)
```

#### Finalize Prescription
```
POST /api/doctor/prescriptions/:id/finalize
Auth: Doctor JWT

Response: {
  "ok": true,
  "data": {
    "prescriptionId": "uuid",
    "isFinalized": true,
    "finalizedAt": "2026-05-28T10:30:00Z",
    "immutable": true
  }
}
```

#### Void Prescription
```
POST /api/doctor/prescriptions/:id/void
Auth: Doctor JWT

Request:
{
  "reason": "INCORRECT_DOSAGE" | "WRONG_MEDICINE" | "DUPLICATE" | "OTHER",
  "note": "Correct dosage is 50g, not 100g"
}

Response: {
  "ok": true,
  "data": {
    "prescriptionId": "uuid",
    "voided": true,
    "voidedAt": "2026-05-28T11:00:00Z"
  }
}
```

### 5.2 Prescription Retrieval

#### Get Prescription Detail
```
GET /api/doctor/prescriptions/:id
Auth: Doctor JWT

Response: {
  "ok": true,
  "data": {
    "id": "uuid",
    "serviceRequestId": "uuid",
    "status": "ACTIVE",
    "isFinalized": true,
    "finalizedAt": "2026-05-28T10:30:00Z",
    "validUntil": "2026-06-28",
    "instructions": "Give all medications with food",
    "items": [...],
    "doctorName": "Dr. Ahmed",
    "createdAt": "2026-05-28T10:25:00Z"
  }
}
```

#### Get Customer Prescriptions
```
GET /api/mobile/prescriptions
Auth: Customer JWT
Query: ?animalId=&page=&limit=

Response: {
  "ok": true,
  "data": {
    "prescriptions": [
      {
        "id": "uuid",
        "doctorName": "Dr. Ahmed",
        "animalName": "Lakshmi",
        "createdAt": "2026-05-28",
        "isActive": true,
        "itemCount": 3
      }
    ]
  }
}
```

---

## 6. Follow-up APIs

### 6.1 Follow-up Management

#### Schedule Follow-up
```
POST /api/doctor/service-requests/:serviceRequestId/followups
Auth: Doctor JWT

Request:
{
  "scheduledAt": "2026-06-04T10:00:00Z",
  "followupType": "MEDICATION_REVIEW",
  "reminderHoursBefore": [24, 2],
  "notes": "Check if bloat has resolved",
  "createServiceRequest": true  // Auto-create SR for followup
}

Response: {
  "ok": true,
  "data": {
    "followupId": "uuid",
    "scheduledAt": "2026-06-04T10:00:00Z",
    "status": "SCHEDULED",
    "serviceRequestId": "uuid"  // If created
  }
}
```

#### Get Follow-ups for Case
```
GET /api/doctor/service-requests/:serviceRequestId/followups
Auth: Doctor JWT

Response: {
  "ok": true,
  "data": {
    "followups": [
      {
        "id": "uuid",
        "scheduledAt": "2026-06-04T10:00:00Z",
        "status": "SCHEDULED",
        "followupType": "MEDICATION_REVIEW",
        "remindersSent": { "24h": true, "2h": false }
      }
    ]
  }
}
```

#### Complete Follow-up
```
POST /api/doctor/followups/:id/complete
Auth: Doctor JWT

Request:
{
  "outcomeNotes": "Bloat resolved, animal eating normally",
  "scheduleNext": {
    "scheduledAt": "2026-06-11",
    "followupType": "ROUTINE_CHECK"
  }
}

Response: {
  "ok": true,
  "data": {
    "followupId": "uuid",
    "status": "COMPLETED",
    "completedAt": "2026-06-04T10:15:00Z",
    "nextFollowupId": "uuid"
  }
}
```

### 6.2 Customer Follow-up APIs

#### Get Upcoming Follow-ups
```
GET /api/mobile/followups/upcoming
Auth: Customer JWT

Response: {
  "ok": true,
  "data": {
    "followups": [
      {
        "id": "uuid",
        "scheduledAt": "2026-06-04T10:00:00Z",
        "animalName": "Lakshmi",
        "doctorName": "Dr. Ahmed",
        "followupType": "MEDICATION_REVIEW",
        "canReschedule": true
      }
    ]
  }
}
```

#### Reschedule Follow-up
```
POST /api/mobile/followups/:id/reschedule
Auth: Customer JWT

Request:
{
  "newScheduledAt": "2026-06-05T10:00:00Z",
  "reason": "SCHEDULE_CONFLICT"
}

Response: {
  "ok": true,
  "data": {
    "followupId": "uuid",
    "newScheduledAt": "2026-06-05T10:00:00Z",
    "status": "RESCHEDULED"
  }
}
```

---

## 7. Medical Attachment APIs

### 7.1 Upload & Management

#### Get Upload URL
```
POST /api/doctor/attachments/upload-url
Auth: Doctor JWT
Rate Limit: 30/min

Request:
{
  "serviceRequestId": "uuid",
  "filename": "wound_photo.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 2048000,
  "type": "WOUND_PHOTO"
}

Response: {
  "ok": true,
  "data": {
    "uploadUrl": "https://storage...",
    "attachmentId": "uuid",
    "expiresAt": "2026-05-28T10:05:00Z"
  }
}

Validation:
- Max file size: 10MB
- Allowed types: image/*, application/pdf, video/*
```

#### Confirm Upload
```
POST /api/doctor/attachments/:id/confirm
Auth: Doctor JWT

Request:
{
  "fileUrl": "https://cdn.../file.jpg",
  "thumbnailUrl": "https://cdn.../thumb.jpg",
  "description": "Left hind leg wound - day 1",
  "takenAt": "2026-05-28T09:00:00Z",
  "locationContext": "Left hind leg, lateral aspect",
  "isPrivate": false
}

Response: {
  "ok": true,
  "data": {
    "attachmentId": "uuid",
    "status": "ACTIVE"
  }
}
```

#### List Attachments
```
GET /api/doctor/service-requests/:serviceRequestId/attachments
Auth: Doctor JWT
Query: ?type=&isPrivate=

Response: {
  "ok": true,
  "data": {
    "attachments": [
      {
        "id": "uuid",
        "type": "WOUND_PHOTO",
        "thumbnailUrl": "string",
        "fileUrl": "string",
        "description": "Left hind leg wound",
        "uploadedBy": "Dr. Ahmed",
        "uploadedAt": "2026-05-28T10:00:00Z",
        "isPrivate": false
      }
    ]
  }
}
```

#### Delete Attachment (Soft Delete)
```
DELETE /api/doctor/attachments/:id
Auth: Doctor JWT

Response: {
  "ok": true,
  "data": {
    "attachmentId": "uuid",
    "deleted": true,
    "deletedAt": "2026-05-28T11:00:00Z"
  }
}
```

---

## 8. Patient History APIs

### 8.1 History Retrieval

#### Get Patient History
```
GET /api/doctor/animals/:animalId/history
Auth: Doctor JWT

Response: {
  "ok": true,
  "data": {
    "animal": {
      "id": "uuid",
      "name": "Lakshmi",
      "type": "COW",
      "breed": "Sahiwal",
      "age": { "years": 5, "months": 2 }
    },
    "summary": {
      "totalConsultations": 12,
      "totalPrescriptions": 8,
      "lastVisitDate": "2026-04-15",
      "regularMedications": ["Deworming - quarterly"],
      "knownAllergies": ["Penicillin"],
      "chronicConditions": ["None"]
    },
    "timeline": [
      {
        "id": "uuid",
        "eventType": "CONSULTATION",
        "date": "2026-05-28T10:00:00Z",
        "title": "Rumen Acidosis Treatment",
        "doctorName": "Dr. Ahmed",
        "isEmergency": false
      }
    ]
  }
}
```

#### Get History Detail
```
GET /api/doctor/animals/:animalId/history/:eventId
Auth: Doctor JWT
Query: ?eventType=

Response: {
  "ok": true,
  "data": {
    // Full details based on event type
  }
}
```

---

## 9. Earnings & Payout APIs

### 9.1 Doctor Earnings

#### Get Earnings Summary
```
GET /api/doctor/earnings/summary
Auth: Doctor JWT
Query: ?period=month&year=2026&month=5

Response: {
  "ok": true,
  "data": {
    "period": "2026-05",
    "totalEarnings": 45000.00,
    "totalConsultations": 45,
    "breakdown": {
      "consultationFees": 40000.00,
      "travelFees": 3000.00,
      "medicineCommission": 2000.00,
      "bonuses": 500.00,
      "penalties": -500.00
    },
    "status": {
      "pending": 5000.00,
      "approved": 35000.00,
      "paid": 5000.00
    }
  }
}
```

#### Get Earnings Detail
```
GET /api/doctor/earnings
Auth: Doctor JWT
Query: ?status=&page=&limit=&startDate=&endDate=

Response: {
  "ok": true,
  "data": {
    "earnings": [
      {
        "id": "uuid",
        "serviceRequestId": "uuid",
        "date": "2026-05-28",
        "consultationFee": 1000.00,
        "travelFee": 200.00,
        "netEarning": 960.00,
        "status": "APPROVED",
        "animalName": "Lakshmi",
        "serviceType": "DOCTOR_HOME_VISIT"
      }
    ]
  }
}
```

#### Get Payout History
```
GET /api/doctor/earnings/payouts
Auth: Doctor JWT

Response: {
  "ok": true,
  "data": {
    "payouts": [
      {
        "id": "uuid",
        "batchName": "May 2026 - Week 4",
        "periodStart": "2026-05-22",
        "periodEnd": "2026-05-28",
        "totalAmount": 15000.00,
        "status": "COMPLETED",
        "processedAt": "2026-05-29T10:00:00Z",
        "transactionRef": "TXN123456"
      }
    ]
  }
}
```

### 9.2 Admin Payout Management

#### Create Payout Batch
```
POST /api/admin/payouts/batches
Auth: Admin JWT

Request:
{
  "batchName": "May 2026 - Week 4",
  "periodStart": "2026-05-22",
  "periodEnd": "2026-05-28",
  "doctorIds": ["uuid", "uuid"]  // Optional: specific doctors
}

Response: {
  "ok": true,
  "data": {
    "batchId": "uuid",
    "totalDoctors": 25,
    "totalAmount": 375000.00,
    "status": "PENDING"
  }
}
```

#### Process Payout Batch
```
POST /api/admin/payouts/batches/:id/process
Auth: Admin JWT

Request:
{
  "paymentMethod": "bank_transfer",
  "confirm": true
}

Response: {
  "ok": true,
  "data": {
    "batchId": "uuid",
    "status": "PROCESSING",
    "processedCount": 25,
    "failedCount": 0
  }
}
```

---

## 10. Performance & Analytics APIs

### 10.1 Doctor Performance

#### Get Performance Metrics
```
GET /api/doctor/performance
Auth: Doctor JWT
Query: ?period=month&year=2026&month=5

Response: {
  "ok": true,
  "data": {
    "period": "2026-05",
    "responseMetrics": {
      "avgResponseTimeSeconds": 45,
      "totalAssignments": 50,
      "acceptanceRate": 0.92,
      "timeoutRate": 0.04
    },
    "consultationMetrics": {
      "totalConsultations": 45,
      "completionRate": 0.98,
      "avgDurationMinutes": 25
    },
    "qualityMetrics": {
      "customerRating": 4.7,
      "totalRatings": 42,
      "fiveStarPercentage": 0.85
    },
    "ranking": {
      "districtRank": 3,
      "totalDistrictDoctors": 25,
      "overallRank": 45
    }
  }
}
```

### 10.2 Admin Analytics

#### Get Doctor Performance List
```
GET /api/admin/analytics/doctors
Auth: Admin JWT
Query: ?sortBy=&order=&page=&limit=&areaId=

Response: {
  "ok": true,
  "data": {
    "doctors": [
      {
        "doctorId": "uuid",
        "name": "Dr. Ahmed",
        "rating": 4.7,
        "acceptanceRate": 0.92,
        "totalConsultations": 45,
        "avgResponseTime": 45,
        "status": "ONLINE_AVAILABLE"
      }
    ]
  }
}
```

#### Get System Analytics
```
GET /api/admin/analytics/system
Auth: Admin JWT
Query: ?period=day&date=

Response: {
  "ok": true,
  "data": {
    "requests": {
      "total": 150,
      "emergency": 15,
      "completed": 140,
      "cancelled": 10
    },
    "doctors": {
      "online": 25,
      "busy": 18,
      "offline": 12
    },
    "assignment": {
      "successRate": 0.95,
      "avgAssignmentTime": 120
    }
  }
}
```

---

## 11. Admin Override APIs

### 11.1 Emergency Controls

#### Emergency Reassign
```
POST /api/admin/emergency/reassign
Auth: Admin JWT

Request:
{
  "serviceRequestId": "uuid",
  "newDoctorId": "uuid",
  "reason": "EMERGENCY",
  "notifyCustomer": true
}

Response: {
  "ok": true,
  "data": {
    "serviceRequestId": "uuid",
    "newDoctorId": "uuid",
    "reassigned": true,
    "customerNotified": true
  }
}
```

#### Force Close Case
```
POST /api/admin/service-requests/:id/force-close
Auth: Admin JWT

Request:
{
  "reason": "CUSTOMER_UNREACHABLE" | "DOCTOR_UNREACHABLE" | "FRAUD_DETECTED" | "OTHER",
  "note": "Customer phone not responding for 24 hours",
  "refundCustomer": true,
  "payDoctor": false
}

Response: {
  "ok": true,
  "data": {
    "serviceRequestId": "uuid",
    "status": "CLOSED",
    "refundProcessed": true,
    "doctorPayout": 0
  }
}
```

---

## 12. Rate Limiting Summary

| Endpoint Category | Rate Limit | Burst |
|-------------------|------------|-------|
| Availability Status | 30/min | 5 |
| Heartbeat | 60/min | 10 |
| Assignment Accept/Reject | 10/min | 3 |
| Prescription Create | 30/min | 5 |
| Attachment Upload | 30/min | 5 |
| All Other Doctor APIs | 100/min | 20 |
| Customer APIs | 60/min | 10 |
| Admin APIs | 200/min | 50 |

---

## 13. Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| ASSIGNMENT_EXPIRED | Assignment no longer valid | 410 |
| DOCTOR_UNAVAILABLE | Doctor cannot take assignment | 423 |
| MAX_CAPACITY | Doctor at concurrent limit | 423 |
| CASE_NOT_ASSIGNED | Doctor not assigned to case | 403 |
| SESSION_ACTIVE | Consultation already in progress | 409 |
| PRESCRIPTION_FINALIZED | Cannot modify finalized prescription | 403 |
| INVALID_STATUS_TRANSITION | Cannot change to requested status | 400 |
| UPLOAD_TOO_LARGE | File exceeds size limit | 413 |
| UNSUPPORTED_FILE_TYPE | MIME type not allowed | 415 |

---

**Version**: 1.0.0
**Last Updated**: 2026-05-28
**Status**: Ready for Implementation
