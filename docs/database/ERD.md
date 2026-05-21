# ENTITY RELATIONSHIP DIAGRAM — Prani Doctor

**Version:** 1.1.0  
**Last Updated:** 2026-05-21  
**Database:** PostgreSQL 16+  
**ORM:** Prisma 7+

---

## Table of Contents

1. [Overview](#1-overview)
2. [Domain Model Summary](#2-domain-model-summary)
3. [Core Domain ERD](#3-core-domain-erd)
4. [Identity Domain](#4-identity-domain)
5. [Geography Domain](#5-geography-domain)
6. [Service Domain](#6-service-domain)
7. [Clinical Domain](#7-clinical-domain)
8. [Financial Domain](#8-financial-domain)
9. [AI Technician Domain](#9-ai-technician-domain)
10. [Content Domain](#10-content-domain)
11. [Media Domain](#11-media-domain)
12. [Notification Domain](#12-notification-domain)
13. [Enterprise Service Instance Domain](#13-enterprise-service-instance-domain)
14. [AI Memory Domains (MVP vs Phase 2)](#14-ai-memory-domains-mvp-vs-phase-2)
15. [Future Domains](#15-future-domains)
16. [Relationship Summary](#16-relationship-summary)

---

## 1. Overview

### 1.1 Database Philosophy

```
PRINCIPLE: Domain-Driven Design with Prisma Mapping

- Each bounded context has its own entity cluster
- Relationships cross domains via ID references
- Soft delete via deletedAt/status fields
- Audit trail via createdAt/updatedAt + dedicated audit tables
- UUID-like IDs via cuid() for distributed safety
```

### 1.2 Entity Count Summary

| Domain | Entity Count | Primary Entities |
|--------|--------------|------------------|
| Identity | 5 | User, CustomerProfile, DoctorProfile, AiTechnicianProfile, AdminProfile |
| Geography | 6 | Division, District, Upazila, Union, Village, Area |
| Service | 5 | ServiceRequest, ServiceCategory, AnimalProfile, TreatmentCase, Prescription |
| Financial | 3 | BillingRecord, PaymentRecord, Setting |
| AI Technician | 12 | AiTechnicianService, AiServiceRequest, AiServiceRecord, etc. |
| Content | 2 | ContentPost, ContentCategory |
| Media | 1 | UploadedFile |
| Notification | 2 | Notification, MobileOtpChallenge |
| Enterprise | 8 | ServiceInstance, ServiceInstanceMedia, etc. |
| **Total** | **44+** | |

---

## 2. Domain Model Summary

### 2.1 High-Level Domain Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRANI DOCTOR DATA MODEL                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐     │
│  │    IDENTITY     │      │   GEOGRAPHY     │      │    SERVICE      │     │
│  │    DOMAIN       │      │    DOMAIN       │      │    DOMAIN       │     │
│  │                 │      │                 │      │                 │     │
│  │ • User          │      │ • Division      │      │ • ServiceReq    │     │
│  │ • CustomerProf  │◀────▶│ • District      │◀────▶│ • AnimalProfile │     │
│  │ • DoctorProf    │      │ • Upazila       │      │ • TreatmentCase │     │
│  │ • AiTechProf    │      │ • Union         │      │ • Prescription  │     │
│  │ • AdminProf     │      │ • Village       │      │ • ServiceCat    │     │
│  │                 │      │ • Area          │      │                 │     │
│  └────────┬────────┘      └────────┬────────┘      └────────┬────────┘     │
│           │                        │                        │              │
│           │    ┌───────────────────┴───────────────────┐    │              │
│           │    │                                       │    │              │
│           ▼    ▼                                       ▼    ▼              │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐     │
│  │   FINANCIAL     │      │  AI TECHNICIAN  │      │    CLINICAL     │     │
│  │    DOMAIN       │      │    DOMAIN       │      │    DOMAIN       │     │
│  │                 │      │                 │      │                 │     │
│  │ • BillingRecord │◀────▶│ • AiTechService │◀────▶│ • TreatmentCase │     │
│  │ • PaymentRecord │      │ • AiServiceReq  │      │ • Prescription  │     │
│  │ • Setting       │      │ • AiServiceRec  │      │ • PrescripItem  │     │
│  │                 │      │ • AiTechReview  │      │                 │     │
│  └─────────────────┘      │ • AiTechComplnt │      └─────────────────┘     │
│                           │ • SemenTemplate │                              │
│                           │ • Inventory     │                              │
│                           └─────────────────┘                              │
│                                                                              │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐     │
│  │    CONTENT      │      │     MEDIA       │      │  NOTIFICATION   │     │
│  │    DOMAIN       │      │    DOMAIN       │      │    DOMAIN       │     │
│  │                 │      │                 │      │                 │     │
│  │ • ContentPost   │      │ • UploadedFile  │      │ • Notification  │     │
│  │ • ContentCat    │      │                 │      │ • OtpChallenge  │     │
│  │                 │      │                 │      │                 │     │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                    ENTERPRISE SERVICE INSTANCE                   │       │
│  │                         DOMAIN                                   │       │
│  │                                                                  │       │
│  │  • ServiceInstance    • ServiceInstanceMedia                    │       │
│  │  • StatusLog          • Review      • PublishLog    • AuditEvent│       │
│  │                                                                  │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Domain ERD

### 3.1 Primary Entity Relationships (ASCII)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                            CORE ENTITIES                                       │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│                              ┌─────────────┐                                   │
│                              │    User     │                                   │
│                              │─────────────│                                   │
│                              │ id (PK)     │                                   │
│                              │ email       │                                   │
│                              │ phone       │                                   │
│                              │ role        │                                   │
│                              │ status      │                                   │
│                              └──────┬──────┘                                   │
│                                     │                                          │
│            ┌────────────────────────┼────────────────────────┐                │
│            │                        │                        │                │
│            ▼                        ▼                        ▼                │
│   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐      │
│   │ CustomerProfile │      │  DoctorProfile  │      │AiTechnicianProf │      │
│   │─────────────────│      │─────────────────│      │─────────────────│      │
│   │ id (PK)         │      │ id (PK)         │      │ id (PK)         │      │
│   │ userId (FK,UQ)  │      │ userId (FK,UQ)  │      │ userId (FK,UQ)  │      │
│   │ displayName     │      │ licenseNumber   │      │ nidNumber       │      │
│   │ addressJson     │      │ specialization  │      │ certification   │      │
│   └────────┬────────┘      │ providerStatus  │      │ providerStatus  │      │
│            │               └────────┬────────┘      └────────┬────────┘      │
│            │                        │                        │                │
│            ▼                        │                        │                │
│   ┌─────────────────┐               │                        │                │
│   │  AnimalProfile  │               │                        │                │
│   │─────────────────│               │                        │                │
│   │ id (PK)         │               │                        │                │
│   │ customerId (FK) │               │                        │                │
│   │ name, species   │               │                        │                │
│   │ breed, category │               │                        │                │
│   └────────┬────────┘               │                        │                │
│            │                        │                        │                │
│            │         ┌──────────────┴──────────────┐         │                │
│            │         │                             │         │                │
│            ▼         ▼                             ▼         ▼                │
│         ┌───────────────────────────────────────────────────────┐            │
│         │                  ServiceRequest                        │            │
│         │───────────────────────────────────────────────────────│            │
│         │ id (PK)                                                │            │
│         │ customerId (FK) ─────────────────────────────────────▶│            │
│         │ animalId (FK) ───────────────────────────────────────▶│            │
│         │ assignedDoctorId (FK, nullable) ────────────────────▶ │            │
│         │ assignedTechnicianId (FK, nullable) ────────────────▶ │            │
│         │ areaId (FK, nullable)                                  │            │
│         │ villageId (FK, nullable)                               │            │
│         │ serviceCategoryId (FK)                                 │            │
│         │ status, serviceType, urgency, isEmergency              │            │
│         └───────────────────────────────────────────────────────┘            │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Service Request → Clinical Flow

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                       SERVICE REQUEST → CLINICAL FLOW                          │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌─────────────────┐                                                         │
│   │ ServiceRequest  │                                                         │
│   │─────────────────│                                                         │
│   │ id (PK)         │                                                         │
│   │ status          │                                                         │
│   └────────┬────────┘                                                         │
│            │                                                                   │
│            │ 1:N                                                               │
│            ▼                                                                   │
│   ┌─────────────────┐        1:N         ┌─────────────────┐                  │
│   │  TreatmentCase  │───────────────────▶│  BillingRecord  │                  │
│   │  (TreatmentRec) │                    │─────────────────│                  │
│   │─────────────────│                    │ id (PK)         │                  │
│   │ id (PK)         │                    │ serviceReqId(FK)│                  │
│   │ serviceReqId(FK)│                    │ treatmentCaseId │                  │
│   │ animalId (FK)   │                    │ doctorId (FK)   │                  │
│   │ doctorId (FK)   │                    │ customerId (FK) │                  │
│   │ diagnosis       │                    │ status          │                  │
│   │ procedures      │                    │ total           │                  │
│   └────────┬────────┘                    └────────┬────────┘                  │
│            │                                      │                            │
│            │ (linked via serviceRequestId)        │ 1:N                        │
│            │                                      ▼                            │
│   ┌────────▼────────┐                    ┌─────────────────┐                  │
│   │  Prescription   │                    │  PaymentRecord  │                  │
│   │─────────────────│                    │─────────────────│                  │
│   │ id (PK)         │                    │ id (PK)         │                  │
│   │ serviceReqId(FK)│                    │ billingRecId(FK)│                  │
│   │ doctorId (FK)   │                    │ method          │                  │
│   │ animalId (FK)   │                    │ amount          │                  │
│   │ instructions    │                    │ status          │                  │
│   └────────┬────────┘                    └─────────────────┘                  │
│            │                                                                   │
│            │ 1:N                                                               │
│            ▼                                                                   │
│   ┌─────────────────┐                                                         │
│   │PrescriptionItem │                                                         │
│   │─────────────────│                                                         │
│   │ id (PK)         │                                                         │
│   │ prescriptionId  │                                                         │
│   │ medicineName    │                                                         │
│   │ dosage          │                                                         │
│   └─────────────────┘                                                         │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Identity Domain

### 4.1 User Entity Hierarchy

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                            IDENTITY DOMAIN                                     │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│                              ┌─────────────────┐                              │
│                              │      User       │                              │
│                              │─────────────────│                              │
│                              │ id              │ PK, cuid()                   │
│                              │ email           │ UNIQUE, NOT NULL             │
│                              │ phone           │ UNIQUE, nullable             │
│                              │ passwordHash    │ NOT NULL                     │
│                              │ role            │ UserRole enum                │
│                              │ status          │ UserStatus enum              │
│                              │ createdAt       │ timestamp                    │
│                              │ updatedAt       │ timestamp                    │
│                              └────────┬────────┘                              │
│                                       │                                        │
│       ┌───────────────┬───────────────┼───────────────┬───────────────┐       │
│       │               │               │               │               │       │
│       ▼               ▼               ▼               ▼               ▼       │
│ ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│ │AdminProf  │  │CustomerPr │  │DoctorProf │  │AiTechProf │  │(Support)  │   │
│ │───────────│  │───────────│  │───────────│  │───────────│  │ No Prof   │   │
│ │ userId    │  │ userId    │  │ userId    │  │ userId    │  │ Uses User │   │
│ │ 1:1 UQ    │  │ 1:1 UQ    │  │ 1:1 UQ    │  │ 1:1 UQ    │  │ directly  │   │
│ └───────────┘  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │
│                                                                                │
│  RULE: One User → At most one profile per role type                           │
│        Application enforces single active profile                             │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Profile Extensions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PROFILE ENTITY DETAILS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CustomerProfile                  DoctorProfile                             │
│  ─────────────────                ─────────────────                         │
│  • displayName                    • displayName                             │
│  • locale (bn-BD)                 • licenseNumber                           │
│  • addressJson                    • degree, specialization                  │
│  • profilePhotoUrl                • experienceYears                         │
│  • coverPhotoUrl                  • visitFeeBdt                             │
│                                   • acceptsEmergency                        │
│  Relations:                       • acceptsOnlineConsultation               │
│  • animals[] 1:N                  • providerStatus                          │
│  • serviceRequests[] 1:N          • verifiedAt                              │
│  • billingRecords[] 1:N                                                     │
│  • reviews[] 1:N                  Relations:                                │
│  • complaints[] 1:N               • assignedRequests[] 1:N                  │
│                                   • treatmentCases[] 1:N                    │
│                                   • prescriptions[] 1:N                     │
│                                   • billingRecords[] 1:N                    │
│                                   • doctorServiceAreas[] M:N                │
│                                   • reviews[] 1:N                           │
│                                                                              │
│  AiTechnicianProfile              AdminProfile                              │
│  ─────────────────────            ─────────────────                         │
│  • displayName, phone, email      • displayName                             │
│  • nidNumber, dateOfBirth                                                   │
│  • gender, presentAddress         (Minimal - auth purposes)                 │
│  • district, upazila, unionOrArea                                           │
│  • experienceYears                                                          │
│  • trainingProvider               Links to normalized geography:            │
│  • certificateNumber              • districtId → District                   │
│  • bio, serviceFeeBdt             • upazilaId → Upazila                     │
│  • acceptsEmergency               • unionId → Union                         │
│  • status (AiTechnicianStatus)                                              │
│  • providerStatus                 Relations:                                │
│  • verifiedAt, reviewedById       • documents[] 1:N                         │
│                                   • technicianServices[] 1:N                │
│                                   • aiServiceRequests[] 1:N                 │
│                                   • divisionCoverageAreas[] M:N             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Geography Domain

### 5.1 Bangladesh Administrative Hierarchy

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         GEOGRAPHY DOMAIN (Normalized)                          │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌─────────────────┐                                                         │
│   │    Division     │  8 Divisions in Bangladesh                              │
│   │─────────────────│                                                         │
│   │ id (PK)         │                                                         │
│   │ name, nameBn    │                                                         │
│   │ nameEn, slug    │ UNIQUE                                                  │
│   │ code            │                                                         │
│   │ sortOrder       │                                                         │
│   │ isActive        │                                                         │
│   │ lat, lng        │ Optional centroid                                       │
│   └────────┬────────┘                                                         │
│            │ 1:N                                                               │
│            ▼                                                                   │
│   ┌─────────────────┐                                                         │
│   │    District     │  64 Districts                                           │
│   │─────────────────│                                                         │
│   │ id (PK)         │                                                         │
│   │ divisionId (FK) │                                                         │
│   │ name, nameBn    │                                                         │
│   │ slug (UNIQUE)   │                                                         │
│   │ code            │                                                         │
│   └────────┬────────┘                                                         │
│            │ 1:N                                                               │
│            ▼                                                                   │
│   ┌─────────────────┐                                                         │
│   │    Upazila      │  ~500 Upazilas                                          │
│   │─────────────────│                                                         │
│   │ id (PK)         │                                                         │
│   │ districtId (FK) │                                                         │
│   │ name, nameBn    │                                                         │
│   │ slug (UNIQUE)   │                                                         │
│   └────────┬────────┘                                                         │
│            │ 1:N                                                               │
│            ▼                                                                   │
│   ┌─────────────────┐                                                         │
│   │     Union       │  ~4,500 Unions                                          │
│   │─────────────────│                                                         │
│   │ id (PK)         │                                                         │
│   │ upazilaId (FK)  │                                                         │
│   │ name, nameBn    │                                                         │
│   │ slug (UNIQUE)   │                                                         │
│   └────────┬────────┘                                                         │
│            │ 1:N                                                               │
│            ▼                                                                   │
│   ┌─────────────────┐                                                         │
│   │    Village      │  Leaf service unit                                      │
│   │─────────────────│                                                         │
│   │ id (PK)         │                                                         │
│   │ unionId (FK)    │                                                         │
│   │ name, nameBn    │                                                         │
│   │ slug (UNIQUE)   │                                                         │
│   └─────────────────┘                                                         │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Unified Area Tree (Legacy + Modern)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         UNIFIED AREA TREE                                      │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌─────────────────┐                                                         │
│   │      Area       │  Self-referential tree (coexists with normalized)       │
│   │─────────────────│                                                         │
│   │ id (PK)         │                                                         │
│   │ name, nameBn    │                                                         │
│   │ slug (UNIQUE)   │                                                         │
│   │ code            │                                                         │
│   │ type            │ AreaType enum (DIVISION, DISTRICT, etc.)                │
│   │ parentId (FK)   │ Self-reference to Area                                  │
│   │ sortOrder       │                                                         │
│   │ isActive        │                                                         │
│   │ metadataJson    │                                                         │
│   └────────┬────────┘                                                         │
│            │                                                                   │
│            │ Self-relation: parent ◀──▶ children[]                            │
│            │                                                                   │
│   Used by:                                                                    │
│   • ServiceRequest.areaId (legacy)                                            │
│   • DoctorProfileArea (M:N)                                                   │
│   • AiTechnicianProfileArea (M:N)                                             │
│                                                                                │
│   AreaType enum:                                                              │
│   • DIVISION                                                                  │
│   • DISTRICT                                                                  │
│   • UPAZILA                                                                   │
│   • UNION                                                                     │
│   • VILLAGE                                                                   │
│   • SERVICE_AREA (custom zone)                                                │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Provider-Area Mappings

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                      PROVIDER-AREA JUNCTION TABLES                             │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌─────────────────────────┐      ┌─────────────────────────┐                │
│  │   DoctorServiceArea     │      │ AiTechnicianServiceArea │                │
│  │─────────────────────────│      │─────────────────────────│                │
│  │ id (PK)                 │      │ id (PK)                 │                │
│  │ doctorId (FK)           │      │ aiTechnicianId (FK)     │                │
│  │ villageId (FK)          │      │ villageId (FK)          │                │
│  │ priority                │      │ priority                │                │
│  │ @@unique(doctorId,      │      │ @@unique(aiTechnicianId,│                │
│  │          villageId)     │      │          villageId)     │                │
│  └─────────────────────────┘      └─────────────────────────┘                │
│                                                                                │
│  ┌─────────────────────────┐      ┌─────────────────────────┐                │
│  │   DoctorProfileArea     │      │AiTechnicianProfileArea  │                │
│  │─────────────────────────│      │─────────────────────────│                │
│  │ id (PK)                 │      │ id (PK)                 │                │
│  │ doctorId (FK)           │      │ aiTechnicianId (FK)     │                │
│  │ areaId (FK)             │      │ areaId (FK)             │                │
│  │ priority                │      │ priority                │                │
│  │ @@unique(doctorId,      │      │ @@unique(aiTechnicianId,│                │
│  │          areaId)        │      │          areaId)        │                │
│  └─────────────────────────┘      └─────────────────────────┘                │
│                                                                                │
│  ┌─────────────────────────────────────┐                                      │
│  │ AiTechnicianDivisionServiceArea     │  Division-level coverage             │
│  │─────────────────────────────────────│                                      │
│  │ id (PK)                             │                                      │
│  │ aiTechnicianId (FK)                 │                                      │
│  │ district (text)                     │  Legacy text                         │
│  │ upazila (text)                      │                                      │
│  │ unionOrArea (text, nullable)        │                                      │
│  │ districtId (FK, nullable)           │  Normalized FK                       │
│  │ upazilaId (FK, nullable)            │                                      │
│  │ unionId (FK, nullable)              │                                      │
│  │ isActive                            │                                      │
│  └─────────────────────────────────────┘                                      │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Service Domain

### 6.1 Service Request Entity

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         SERVICE REQUEST ENTITY                                 │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ServiceRequest                                                              │
│   ──────────────                                                              │
│   id                    String    PK, cuid()                                  │
│   customerId            String    FK → CustomerProfile                         │
│   animalId              String    FK → AnimalProfile                          │
│   areaId                String?   FK → Area (legacy)                          │
│   villageId             String?   FK → Village (preferred)                    │
│   serviceCategoryId     String    FK → ServiceCategory                        │
│   serviceType           Enum      ServiceRequestType                          │
│   assignedDoctorId      String?   FK → DoctorProfile                          │
│   assignedTechnicianId  String?   FK → AiTechnicianProfile                    │
│   status                Enum      ServiceRequestStatus                        │
│   urgency               String?                                               │
│   problemOrSymptom      String?   @map("symptoms")                            │
│   description           String?                                               │
│   preferredTime         String?   @map("preferredWindow")                     │
│   locationText          String?   @map("locationNotes")                       │
│   scheduledStart        DateTime?                                             │
│   scheduledEnd          DateTime?                                             │
│   isEmergency           Boolean   default(false)                              │
│   emergencyNotes        String?                                               │
│   submittedAt           DateTime  default(now())                              │
│   assignedAt            DateTime?                                             │
│   startedAt             DateTime?                                             │
│   completedAt           DateTime?                                             │
│   cancelledAt           DateTime?                                             │
│   cancelReason          String?                                               │
│   createdAt             DateTime  default(now())                              │
│   updatedAt             DateTime  @updatedAt                                  │
│                                                                                │
│   Relations:                                                                  │
│   • customer → CustomerProfile                                                │
│   • animal → AnimalProfile                                                    │
│   • area → Area (nullable)                                                    │
│   • village → Village (nullable)                                              │
│   • serviceCategory → ServiceCategory                                         │
│   • assignedDoctor → DoctorProfile (nullable)                                 │
│   • assignedTechnician → AiTechnicianProfile (nullable)                       │
│   • treatmentCases[] 1:N                                                      │
│   • prescriptions[] 1:N                                                       │
│   • billingRecords[] 1:N                                                      │
│   • paymentRecords[] 1:N                                                      │
│   • reviews[] 1:N                                                             │
│   • complaints[] 1:N                                                          │
│   • linkedAiServiceRequest (1:1 optional)                                     │
│                                                                                │
│   Indexes:                                                                    │
│   • @@index([status])                                                         │
│   • @@index([customerId])                                                     │
│   • @@index([animalId])                                                       │
│   • @@index([assignedDoctorId, status])                                       │
│   • @@index([assignedTechnicianId, status])                                   │
│   • @@index([serviceType, status])                                            │
│   • @@index([areaId, serviceCategoryId])                                      │
│   • @@index([villageId])                                                      │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Animal Profile Entity

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         ANIMAL PROFILE ENTITY                                  │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   AnimalProfile                                                               │
│   ─────────────                                                               │
│   id              String          PK, cuid()                                  │
│   customerId      String          FK → CustomerProfile                         │
│   name            String                                                      │
│   species         String          e.g., "Cow", "Goat"                         │
│   breed           String?                                                     │
│   category        AnimalCategory  PET | LIVESTOCK | OTHER                     │
│   animalType      AnimalType?     CATTLE | GOAT | POULTRY | DOG | CAT | OTHER │
│   weightKg        Decimal?        @db.Decimal(10, 3)                          │
│   dateOfBirth     DateTime?                                                   │
│   sex             String?         Legacy                                      │
│   gender          Gender?         Normalized enum                             │
│   microchipOrTag  String?                                                     │
│   notes           String?                                                     │
│   photoUrl        String?                                                     │
│   pregnancyStatus PregnancyStatus?                                            │
│   active          Boolean         default(true) — soft delete                 │
│   createdAt       DateTime        default(now())                              │
│   updatedAt       DateTime        @updatedAt                                  │
│                                                                                │
│   Relations:                                                                  │
│   • customer → CustomerProfile                                                │
│   • serviceRequests[] 1:N                                                     │
│   • treatmentCases[] 1:N                                                      │
│   • prescriptions[] 1:N                                                       │
│                                                                                │
│   Indexes:                                                                    │
│   • @@index([customerId])                                                     │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Clinical Domain

### 7.1 Treatment Case Entity

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                       TREATMENT CASE ENTITY                                    │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   TreatmentCase (@@map("TreatmentRecord"))                                    │
│   ─────────────────────────────────────────                                   │
│   id               String              PK, cuid()                             │
│   serviceRequestId String              FK → ServiceRequest                     │
│   animalId         String              FK → AnimalProfile                      │
│   doctorId         String?             FK → DoctorProfile                      │
│   aiTechnicianId   String?             FK → AiTechnicianProfile               │
│   status           TreatmentCaseStatus DRAFT | FINALIZED | CANCELLED          │
│   chiefComplaint   String?                                                    │
│   symptoms         String?                                                    │
│   diagnosis        String?                                                    │
│   procedures       String?                                                    │
│   treatmentNotes   String?                                                    │
│   followUpNotes    String?                                                    │
│   followUpDate     DateTime?                                                  │
│   recordedAt       DateTime            default(now())                         │
│   createdAt        DateTime            default(now())                         │
│   updatedAt        DateTime            @updatedAt                             │
│                                                                                │
│   Relations:                                                                  │
│   • serviceRequest → ServiceRequest                                           │
│   • animal → AnimalProfile                                                    │
│   • doctor → DoctorProfile (nullable)                                         │
│   • aiTechnician → AiTechnicianProfile (nullable)                             │
│   • billingRecords[] 1:N                                                      │
│                                                                                │
│   Business Rule: doctorId XOR aiTechnicianId (app-enforced)                   │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Prescription Entities

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                        PRESCRIPTION ENTITIES                                   │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   Prescription                        PrescriptionItem                        │
│   ────────────                        ────────────────                        │
│   id               PK                 id               PK                     │
│   serviceRequestId FK                 prescriptionId   FK → Prescription      │
│   doctorId         FK?                medicineName     String                 │
│   aiTechnicianId   FK?                dosage           String?                │
│   animalId         FK                 duration         String?                │
│   status           Enum               instruction      String?                │
│   instructions     String?            quantity         Decimal?               │
│   validUntil       DateTime?          createdAt        DateTime               │
│   createdAt        DateTime           updatedAt        DateTime               │
│   updatedAt        DateTime                                                   │
│                                                                                │
│   Relations:                                                                  │
│   Prescription.items[] → PrescriptionItem[]                                   │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Financial Domain

### 8.1 Billing Record Entity

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                        BILLING RECORD ENTITY                                   │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   BillingRecord                                                               │
│   ─────────────                                                               │
│   id                  String        PK, cuid()                                │
│   serviceRequestId    String        FK → ServiceRequest                        │
│   treatmentCaseId     String?       FK → TreatmentCase                         │
│   doctorId            String?       FK → DoctorProfile                         │
│   aiTechnicianId      String?       FK → AiTechnicianProfile                   │
│   customerId          String        FK → CustomerProfile                       │
│   status              BillingStatus DRAFT → ISSUED → PAID                     │
│   currency            String        default("BDT")                            │
│                                                                                │
│   Legacy aggregates (nullable during migration):                              │
│   • subtotal          Decimal?      @db.Decimal(14, 2)                        │
│   • tax               Decimal?      @db.Decimal(14, 2)                        │
│   • total             Decimal?      @db.Decimal(14, 2)                        │
│                                                                                │
│   Fee breakdown (MVP):                                                        │
│   • serviceFee        Decimal?      @db.Decimal(14, 2)                        │
│   • travelCost        Decimal?      @db.Decimal(14, 2)                        │
│   • medicineCost      Decimal?      @db.Decimal(14, 2)                        │
│   • discountAmount    Decimal?      @db.Decimal(14, 2)                        │
│   • totalCollected    Decimal?      @db.Decimal(14, 2)                        │
│   • platformCommission Decimal?     @db.Decimal(14, 2)                        │
│   • providerPayout    Decimal?      @db.Decimal(14, 2)                        │
│                                                                                │
│   Settlement:                                                                 │
│   • paymentMethod     PaymentMethod? Primary method                           │
│   • paymentStatus     PaymentStatus  UNPAID → PARTIAL → PAID                  │
│   • issuedAt          DateTime?                                               │
│   • paidAt            DateTime?                                               │
│   • notes             String?                                                 │
│                                                                                │
│   Relations:                                                                  │
│   • paymentRecords[] 1:N                                                      │
│   • complaints[] 1:N                                                          │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Payment Record Entity

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                        PAYMENT RECORD ENTITY                                   │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   PaymentRecord                                                               │
│   ─────────────                                                               │
│   id               String        PK, cuid()                                   │
│   billingRecordId  String?       FK → BillingRecord                           │
│   serviceRequestId String?       FK → ServiceRequest                          │
│   status           PaymentStatus PENDING → CAPTURED → FAILED                  │
│   method           PaymentMethod CASH | BKASH | NAGAD | CARD | BANK           │
│   amount           Decimal       @db.Decimal(14, 2)                           │
│   currency         String        default("BDT")                               │
│   externalId       String?       Gateway reference                            │
│   paidAt           DateTime?                                                  │
│   metadataJson     Json?         Gateway response                             │
│   createdAt        DateTime      default(now())                               │
│   updatedAt        DateTime      @updatedAt                                   │
│                                                                                │
│   Indexes:                                                                    │
│   • @@index([billingRecordId])                                                │
│   • @@index([serviceRequestId])                                               │
│   • @@index([status])                                                         │
│   • @@index([externalId])                                                     │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. AI Technician Domain

### 9.1 AI Technician Service Flow

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    AI TECHNICIAN SERVICE FLOW                                  │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌────────────────────┐                                                      │
│   │ SemenServiceTemp   │  Admin-authored template                             │
│   │ (Admin Locked)     │                                                      │
│   └─────────┬──────────┘                                                      │
│             │                                                                  │
│             │ References                                                       │
│             ▼                                                                  │
│   ┌────────────────────┐                                                      │
│   │ AiTechnicianService│  Technician listing                                  │
│   │────────────────────│                                                      │
│   │ aiTechnicianId  FK │                                                      │
│   │ semenTemplateId FK │  Links to admin template                             │
│   │ title              │                                                      │
│   │ animalType         │                                                      │
│   │ basePrice          │                                                      │
│   │ offerPrice         │                                                      │
│   │ discountPercent    │                                                      │
│   │ status             │                                                      │
│   │ isAvailable        │                                                      │
│   └─────────┬──────────┘                                                      │
│             │                                                                  │
│             │ 1:N                                                              │
│             ▼                                                                  │
│   ┌────────────────────┐        ┌────────────────────┐                       │
│   │ AiServiceRequest   │───────▶│  AiServiceRecord   │  1:1                  │
│   │────────────────────│        │────────────────────│                       │
│   │ customerUserId  FK │        │ aiServiceReqId  FK │                       │
│   │ technicianId    FK │        │ technicianId    FK │                       │
│   │ serviceId       FK │        │ serviceDate        │                       │
│   │ animalType         │        │ semenBatch         │                       │
│   │ status             │        │ inseminationTime   │                       │
│   │ estimatedFee       │        │ totalFee           │                       │
│   │ paymentStatus      │        │ paymentStatus      │                       │
│   └────────┬───────────┘        └────────────────────┘                       │
│            │                                                                   │
│            │ 1:1                                                               │
│            ▼                                                                   │
│   ┌────────────────────┐        ┌────────────────────┐                       │
│   │ AiTechnicianReview │        │AiTechnicianComplnt │                       │
│   │────────────────────│        │────────────────────│                       │
│   │ aiServiceReqId  FK │        │ aiServiceReqId  FK │                       │
│   │ technicianId    FK │        │ technicianId    FK │                       │
│   │ customerUserId  FK │        │ customerUserId  FK │                       │
│   │ rating             │        │ category           │                       │
│   │ comment            │        │ message            │                       │
│   │ visibility         │        │ status             │                       │
│   └────────────────────┘        └────────────────────┘                       │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Semen Service Template Hierarchy

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    SEMEN SERVICE TEMPLATE HIERARCHY                            │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌────────────────────┐                                                      │
│   │   SemenProvider    │  e.g., BRAC, ACI, DLS                               │
│   │────────────────────│                                                      │
│   │ id, slug           │                                                      │
│   │ name, nameBn       │                                                      │
│   │ logoUploadedFileId │  FK → UploadedFile                                  │
│   │ verificationStatus │                                                      │
│   └─────────┬──────────┘                                                      │
│             │ 1:N                                                              │
│             ▼                                                                  │
│   ┌────────────────────┐                                                      │
│   │SemenServiceTemplate│                                                      │
│   │────────────────────│                                                      │
│   │ id                 │                                                      │
│   │ semenProviderId FK │                                                      │
│   │ internalName       │                                                      │
│   │ animalType         │                                                      │
│   │ semenProductKind   │  NORMAL | SEXED | PREMIUM | IMPORTED                │
│   │ defaultBasePrice   │                                                      │
│   │ approvalStatus     │  DRAFT → PENDING_REVIEW → APPROVED                  │
│   │ approvedById    FK │  → User (admin)                                      │
│   └─────────┬──────────┘                                                      │
│             │                                                                  │
│   ┌─────────┴─────────────────────────────────┐                              │
│   │ 1:N                                       │ 1:N                          │
│   ▼                                           ▼                              │
│   ┌────────────────────┐           ┌────────────────────┐                   │
│   │TemplateBreedMix   │           │TemplateMedia       │                   │
│   │────────────────────│           │────────────────────│                   │
│   │ templateId      FK │           │ templateId      FK │                   │
│   │ breedId         FK │           │ kind               │ COVER | GALLERY  │
│   │ percentage         │           │ uploadedFileId  FK │                   │
│   └────────────────────┘           │ externalUrl        │                   │
│                                    └────────────────────┘                   │
│                                                                                │
│   ┌────────────────────┐                                                      │
│   │  LivestockBreed    │                                                      │
│   │────────────────────│                                                      │
│   │ id, slug           │                                                      │
│   │ nameEn, nameBn     │                                                      │
│   │ animalType         │                                                      │
│   └────────────────────┘                                                      │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Content Domain

### 10.1 Content Management ERD

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         CONTENT DOMAIN                                         │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌────────────────────┐        ┌────────────────────┐                       │
│   │  ContentCategory   │◀───────│    ContentPost     │                       │
│   │────────────────────│  1:N   │────────────────────│                       │
│   │ id                 │        │ id                 │                       │
│   │ nameBn             │        │ title              │                       │
│   │ nameEn             │        │ slug (UNIQUE)      │                       │
│   │ slug (UNIQUE)      │        │ summary            │                       │
│   │ description        │        │ body (TEXT)        │                       │
│   │ sortOrder          │        │ coverImageUrl      │                       │
│   │ isActive           │        │ categoryId      FK │                       │
│   └────────────────────┘        │ authorId        FK │  → User               │
│                                 │ approvalStatus     │  ContentApprovalStatus│
│                                 │ rejectionReason    │                       │
│                                 │ publishedAt        │                       │
│                                 │ isPublished        │                       │
│                                 └────────────────────┘                       │
│                                                                                │
│   ContentApprovalStatus: DRAFT → PENDING_REVIEW → APPROVED / REJECTED        │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Media Domain

### 11.1 Uploaded File Entity

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                          MEDIA DOMAIN                                          │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   UploadedFile                                                                │
│   ────────────                                                                │
│   id            String             PK, cuid()                                 │
│   ownerUserId   String             FK → User                                   │
│   bucket        String             S3 bucket name                             │
│   storageKey    String             UNIQUE, object path                        │
│   originalName  String             Original filename                          │
│   mimeType      String             e.g., image/jpeg                           │
│   sizeBytes     Int                File size                                  │
│   fileCategory  MobileUploadPurpose                                           │
│   publicUrl     String?            CDN URL if public                          │
│   checksum      String?            MD5/SHA256                                 │
│   width         Int?               For images                                 │
│   height        Int?               For images                                 │
│   status        UploadedFileStatus ACTIVE | DELETED                           │
│   createdAt     DateTime           default(now())                             │
│   updatedAt     DateTime           @updatedAt                                 │
│                                                                                │
│   MobileUploadPurpose enum values:                                            │
│   • AI_TECHNICIAN_NID_FRONT / _BACK                                          │
│   • AI_TECHNICIAN_PROFILE_PHOTO / COVER_IMAGE                                │
│   • AI_TECHNICIAN_TRAINING_CERTIFICATE / AI_CERTIFICATE                      │
│   • CUSTOMER_PROFILE_PHOTO / COVER_IMAGE                                     │
│   • ADMIN_SEMEN_PROVIDER_LOGO                                                │
│   • ADMIN_SEMEN_TEMPLATE_COVER / GALLERY / VIDEO                             │
│   • AI_SERVICE_INSTANCE_COVER / GALLERY / VIDEO / DOCUMENT                   │
│                                                                                │
│   Relations (1:1 via unique FK):                                              │
│   • aiTechnicianDocument → AiTechnicianDocument                               │
│   • semenProviderLogo → SemenProvider                                         │
│   • semenTemplateMedia → SemenServiceTemplateMedia                            │
│   • serviceInstanceMedia[] → ServiceInstanceMedia                             │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 12. Notification Domain

### 12.1 Notification Entities

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                       NOTIFICATION DOMAIN                                      │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   Notification                       MobileOtpChallenge                       │
│   ────────────                       ───────────────────                      │
│   id            PK                   id               PK                      │
│   userId        FK → User            normalizedPhone  UNIQUE                  │
│   type          NotificationType     codeHash         NOT NULL                │
│   title         String               expiresAt        DateTime                │
│   body          String               verifyAttempts   Int (default 0)         │
│   readAt        DateTime?            sendWindowStartedAt DateTime?            │
│   metadataJson  Json?                sendsInWindow    Int (default 0)         │
│   createdAt     DateTime             lastOtpSentAt    DateTime?               │
│                                      createdAt        DateTime                │
│   Indexes:                           updatedAt        DateTime                │
│   • @@index([userId, readAt])                                                 │
│   • @@index([type])                  Index: @@index([expiresAt])             │
│                                                                                │
│   NotificationType enum:                                                      │
│   • REQUEST_UPDATE                                                            │
│   • PAYMENT                                                                   │
│   • CHAT                                                                      │
│   • SYSTEM                                                                    │
│   • MARKETING                                                                 │
│   • COMPLAINT                                                                 │
│   • REVIEW                                                                    │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 13. Enterprise Service Instance Domain

### 13.1 Service Instance Workflow ERD

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    ENTERPRISE SERVICE INSTANCE DOMAIN                          │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌────────────────────┐                                                      │
│   │  ServiceInstance   │  Worker submission for admin review → publish        │
│   │────────────────────│                                                      │
│   │ id                 │                                                      │
│   │ semenTemplateId FK │  → SemenServiceTemplate                              │
│   │ aiTechnicianId  FK │  → AiTechnicianProfile                               │
│   │ status             │  ServiceInstanceStatus                               │
│   │ schemaVersion      │  Versioned payload schema                            │
│   │ payloadJson        │  Worker's pricing/details                            │
│   │ lockedSnapshotJson │  Approved frozen copy                                │
│   │ validationResultJson│                                                     │
│   │ duplicateOfId   FK │  Self-ref for duplicate detection                    │
│   │ payloadFingerprint │  Hash for dedup                                      │
│   │ correctionNote     │  Admin feedback                                      │
│   │ adminInternalNote  │  Internal admin notes                                │
│   │ submittedAt        │                                                      │
│   │ publishedAt        │                                                      │
│   │ lastReviewedById FK│  → User (admin)                                      │
│   │ publishedServiceId │  → AiTechnicianService (1:1)                         │
│   │ tenantId           │  Multi-tenant ready                                  │
│   │ deploymentBranch   │  Environment targeting                               │
│   │ deletedAt          │  Soft delete                                         │
│   │ version            │  Optimistic locking                                  │
│   └─────────┬──────────┘                                                      │
│             │                                                                  │
│   ┌─────────┼─────────────────────────────────────┐                          │
│   │         │                                     │                          │
│   ▼         ▼                                     ▼                          │
│   ┌──────────────────┐  ┌────────────────────┐  ┌────────────────────┐      │
│   │InstanceMedia     │  │InstanceStatusLog   │  │ InstanceReview     │      │
│   │──────────────────│  │────────────────────│  │────────────────────│      │
│   │ serviceInstId FK │  │ serviceInstId   FK │  │ serviceInstId   FK │      │
│   │ kind             │  │ fromStatus         │  │ reviewerUserId  FK │      │
│   │ uploadedFileId FK│  │ toStatus           │  │ decision           │      │
│   │ externalUrl      │  │ actorUserId     FK │  │ body (TEXT)        │      │
│   │ sortOrder        │  │ actorRole          │  │ visibility         │      │
│   │ moderationStatus │  │ reason (TEXT)      │  │ createdAt          │      │
│   │ moderationNote   │  │ ipAddress          │  └────────────────────┘      │
│   │ deletedAt        │  │ userAgent          │                              │
│   └──────────────────┘  │ metadataJson       │                              │
│                         └────────────────────┘                              │
│                                                                                │
│   ┌────────────────────┐  ┌────────────────────┐                             │
│   │ InstancePublishLog │  │ InstanceAuditEvent │                             │
│   │────────────────────│  │────────────────────│                             │
│   │ serviceInstId   FK │  │ serviceInstId   FK │                             │
│   │ action             │  │ action             │                             │
│   │ actorUserId     FK │  │ actorUserId     FK │                             │
│   │ previousServiceId  │  │ ipAddress          │                             │
│   │ newServiceId       │  │ userAgent          │                             │
│   │ payloadSnapshotJson│  │ detailsJson        │                             │
│   │ createdAt          │  │ createdAt          │                             │
│   └────────────────────┘  └────────────────────┘                             │
│                                                                                │
│   ServiceInstanceStatus enum:                                                 │
│   DRAFT → SUBMITTED → UNDER_REVIEW → NEEDS_CORRECTION → APPROVED → PUBLISHED │
│                                    → REJECTED                                 │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 14. AI Memory Domains (MVP vs Phase 2)

### 14.1 MVP — AI Memory (In Scope)

Required for MVP AI chat and orchestrator context injection. Tables align with `docs/ai/MEMORY_SYSTEM.md` §3.2 (MVP subset).

| Module | Storage | Tables / Keys | Purpose |
|--------|---------|---------------|---------|
| `conversation_context` | Redis | `ctx:{sessionId}` | Active session messages, entities, state |
| `session_summary` | PostgreSQL | `AiConversation` | Archived conversation summaries on session end |
| `prompt_cache` | Redis | `prompt:{hash}` | Cached system prompts and repeated context blocks |

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         MVP AI MEMORY (Phase 0 / MVP)                          │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  conversation_context (Redis, session TTL)                                     │
│  ├── Current messages, entities, conversation state                            │
│  └── Feeds Context Builder before each AI request                              │
│                                                                                │
│  session_summary (PostgreSQL: AiConversation)                                  │
│  ├── summary, topic, messageCount, entitiesJson, outcomeType                   │
│  └── Written on session close; read for recent context (limit 5)               │
│                                                                                │
│  prompt_cache (Redis)                                                          │
│  ├── Cached prompt fragments and token-optimized context                       │
│  └── TTL per COST_OPTIMIZATION policy                                          │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

**MVP entities (implemented in Prisma for MVP):**

- `AiConversation` — session archive / summary store
- `AiMessage` — optional per-message persistence when audit requires full transcript

**Out of MVP scope:** `AiMemoryEntry`, vector embeddings, `AiUserContext` personalization store, semantic search.

### 14.2 Phase 2 — Extended AI Memory (Future)

Deferred until post-MVP. Documented in `MEMORY_SYSTEM.md`; not required for Phase 0 freeze.

| Module | Storage | Tables | Purpose |
|--------|---------|--------|---------|
| `long_term_memory` | PostgreSQL | `AiMemoryEntry` (scope: user/animal/system) | Persistent facts, preferences, patterns |
| `vector_memory` | PostgreSQL + vector index | `AiMemoryEntry.embeddingVector` | Semantic retrieval across memories |
| `personalization` | PostgreSQL | `AiUserContext` | User prefs, common topics, active animals cache |

---

## 15. Future Domains

### 15.1 Planned Entity Clusters

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         FUTURE DOMAIN PLACEHOLDERS                             │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  LEAD MANAGEMENT                   FARM MANAGEMENT                            │
│  ─────────────────                 ───────────────────                        │
│  • Lead                            • Farm                                     │
│  • LeadSource                      • DairyAnimal (extends AnimalProfile)      │
│  • LeadStatus                      • MilkRecord                               │
│  • LeadActivity                    • BreedingRecord                           │
│  • LeadConversion                  • FatteningBatch                           │
│                                    • WeightRecord                             │
│                                    • FeedRecord                               │
│                                                                                │
│  WALLET SYSTEM                     SUBSCRIPTION SYSTEM                        │
│  ─────────────────                 ─────────────────────                      │
│  • Wallet                          • SubscriptionPlan                         │
│  • WalletTransaction               • Subscription                             │
│  • Payout                          • SubscriptionInvoice                      │
│  • PayoutBatch                     • SubscriptionBenefit                      │
│                                                                                │
│  VOICE ASSISTANT                   APPOINTMENT SYSTEM                         │
│  ─────────────────                 ─────────────────────                      │
│  • VoiceRequest                    • Appointment                              │
│  • VoiceTranscript                 • AppointmentSlot                          │
│  • VoiceIntent                     • ProviderSchedule                         │
│                                    • RecurringAvailability                    │
│                                                                                │
│  AI MEMORY (Phase 2)               OFFLINE SYNC                               │
│  ─────────────────                 ─────────────────                          │
│  • AiMemoryEntry                   • SyncOperation                            │
│  • AiUserContext                   • SyncConflict                             │
│  • AiContext (semantic)            • ClientDeviceState                        │
│  • AiSuggestion                                                               │
│  (MVP: AiConversation, AiMessage — see §14.1)                                 │
│                                                                                │
│  AUDIT SYSTEM                      TELEMEDICINE                               │
│  ─────────────────                 ─────────────────                          │
│  • AuditLog                        • VideoCallSession                         │
│  • DataAccessLog                   • ChatConversation                         │
│  • ChangeHistory                   • ChatMessage                              │
│                                    • CallRecording                            │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 16. Relationship Summary

### 16.1 Cardinality Matrix

| Parent Entity | Child Entity | Cardinality | FK Location |
|---------------|--------------|-------------|-------------|
| User | AdminProfile | 1:1 | AdminProfile.userId |
| User | CustomerProfile | 1:1 | CustomerProfile.userId |
| User | DoctorProfile | 1:1 | DoctorProfile.userId |
| User | AiTechnicianProfile | 1:1 | AiTechnicianProfile.userId |
| User | Notification | 1:N | Notification.userId |
| User | UploadedFile | 1:N | UploadedFile.ownerUserId |
| CustomerProfile | AnimalProfile | 1:N | AnimalProfile.customerId |
| CustomerProfile | ServiceRequest | 1:N | ServiceRequest.customerId |
| DoctorProfile | ServiceRequest | 1:N | ServiceRequest.assignedDoctorId |
| DoctorProfile | TreatmentCase | 1:N | TreatmentCase.doctorId |
| AiTechnicianProfile | AiTechnicianService | 1:N | AiTechnicianService.aiTechnicianId |
| AiTechnicianProfile | AiServiceRequest | 1:N | AiServiceRequest.technicianProfileId |
| Division | District | 1:N | District.divisionId |
| District | Upazila | 1:N | Upazila.districtId |
| Upazila | Union | 1:N | Union.upazilaId |
| Union | Village | 1:N | Village.unionId |
| Area | Area (self) | 1:N | Area.parentId |
| ServiceRequest | TreatmentCase | 1:N | TreatmentCase.serviceRequestId |
| ServiceRequest | Prescription | 1:N | Prescription.serviceRequestId |
| ServiceRequest | BillingRecord | 1:N | BillingRecord.serviceRequestId |
| BillingRecord | PaymentRecord | 1:N | PaymentRecord.billingRecordId |
| Prescription | PrescriptionItem | 1:N | PrescriptionItem.prescriptionId |
| SemenProvider | SemenServiceTemplate | 1:N | SemenServiceTemplate.semenProviderId |
| SemenServiceTemplate | AiTechnicianService | 1:N | AiTechnicianService.semenServiceTemplateId |
| SemenServiceTemplate | ServiceInstance | 1:N | ServiceInstance.semenServiceTemplateId |
| ServiceInstance | ServiceInstanceMedia | 1:N | ServiceInstanceMedia.serviceInstanceId |

### 16.2 Junction Tables (M:N)

| Table | Left Entity | Right Entity |
|-------|-------------|--------------|
| DoctorServiceArea | DoctorProfile | Village |
| AiTechnicianServiceArea | AiTechnicianProfile | Village |
| DoctorProfileArea | DoctorProfile | Area |
| AiTechnicianProfileArea | AiTechnicianProfile | Area |
| DoctorProfileServiceCategory | DoctorProfile | ServiceCategory |
| AiTechnicianProfileServiceCategory | AiTechnicianProfile | ServiceCategory |
| SemenServiceTemplateBreedMix | SemenServiceTemplate | LivestockBreed |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Database Team | Initial release |
| 1.1.0 | 2026-05-21 | Architecture | AI memory MVP/Phase 2 split (§14) |

---

## Related Documents

| Document | Location |
|----------|----------|
| Table Structure | `docs/database/TABLE_STRUCTURE.md` |
| Database Architecture | `docs/database/DATABASE_ARCHITECTURE.md` |
| Role System | `docs/database/ROLE_SYSTEM.md` |
| Multi-Tenant Strategy | `docs/database/MULTI_TENANT_STRATEGY.md` |
| Memory System | `docs/ai/MEMORY_SYSTEM.md` |
| Prisma Schema | `prisma/schema.prisma` |

---

*End of ERD.md*
