# ROLE SYSTEM — Prani Doctor

**Version:** 1.0.0  
**Last Updated:** 2026-05-21  
**Scope:** User roles, permissions, authorization, provider management

---

## Table of Contents

1. [Role Hierarchy](#1-role-hierarchy)
2. [Role Definitions](#2-role-definitions)
3. [Permission Matrix](#3-permission-matrix)
4. [Provider Status Lifecycle](#4-provider-status-lifecycle)
5. [Doctor-Area Mapping](#5-doctor-area-mapping)
6. [AI Technician Management](#6-ai-technician-management)
7. [Lead Lifecycle](#7-lead-lifecycle)
8. [Authorization Patterns](#8-authorization-patterns)
9. [API Route Protection](#9-api-route-protection)
10. [Future Role Extensions](#10-future-role-extensions)

---

## 1. Role Hierarchy

### 1.1 Role Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ROLE HIERARCHY                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                          ┌──────────────────┐                               │
│                          │   SUPER_ADMIN    │                               │
│                          │  Full Control    │                               │
│                          └────────┬─────────┘                               │
│                                   │                                          │
│                          ┌────────▼─────────┐                               │
│                          │     ADMIN        │                               │
│                          │  Operations      │                               │
│                          └────────┬─────────┘                               │
│                                   │                                          │
│              ┌────────────────────┼────────────────────┐                    │
│              │                    │                    │                    │
│     ┌────────▼─────────┐ ┌───────▼────────┐ ┌────────▼─────────┐          │
│     │    SUPPORT       │ │    DOCTOR      │ │  AI_TECHNICIAN   │          │
│     │  Customer Help   │ │  Clinical      │ │  Field Service   │          │
│     └──────────────────┘ └────────────────┘ └──────────────────┘          │
│                                                                              │
│                          ┌──────────────────┐                               │
│                          │    CUSTOMER      │                               │
│                          │  Service User    │                               │
│                          └──────────────────┘                               │
│                                                                              │
│  Note: Hierarchy indicates privilege level, not direct inheritance          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Role Enumeration

Privilege levels (for `hasMinimumRole` checks) match `AUTH_FLOW.md` §6.1:

| Role | Level | Notes |
|------|-------|-------|
| `SUPER_ADMIN` | 5 | Full platform |
| `ADMIN` | 4 | Operations |
| `SUPPORT` | 3 | Limited admin |
| `DOCTOR` | 2 | Clinical provider (peer with technician) |
| `AI_TECHNICIAN` | 2 | Field provider (peer with doctor) |
| `CUSTOMER` | 1 | Service consumer |

```prisma
enum UserRole {
  SUPER_ADMIN    // Level 5 — Platform owner, full system access
  ADMIN          // Level 4 — Operations team
  SUPPORT        // Level 3 — Customer support
  DOCTOR         // Level 2 — Veterinary doctor
  AI_TECHNICIAN  // Level 2 — Field technician
  CUSTOMER       // Level 1 — End user (farmer)
}
```

### 1.3 Role Distribution (Expected)

| Role | User Count | Profile Table | Login Method |
|------|------------|---------------|--------------|
| SUPER_ADMIN | 1-3 | AdminProfile | Email + Password |
| ADMIN | 5-20 | AdminProfile | Email + Password |
| SUPPORT | 10-50 | (uses User directly) | Email + Password |
| DOCTOR | 1,000-10,000 | DoctorProfile | Email + Password / OTP |
| AI_TECHNICIAN | 5,000-50,000 | AiTechnicianProfile | Phone + OTP |
| CUSTOMER | 100,000+ | CustomerProfile | Phone + OTP |

---

## 2. Role Definitions

### 2.1 SUPER_ADMIN

```yaml
Description: Platform owner with unrestricted access
System Key: SUPER_ADMIN
Access Level: Full platform control

Capabilities:
  - All ADMIN capabilities
  - Create/manage admin users
  - Access audit logs
  - Modify system settings
  - View financial reports
  - Emergency system controls
  - Database maintenance operations
  - API key management

Restrictions:
  - Cannot modify own role
  - Actions logged for compliance

Profile: AdminProfile (optional, uses User directly)
```

### 2.2 ADMIN

```yaml
Description: Operations team member
System Key: ADMIN
Access Level: Operations management

Capabilities:
  Provider Management:
    - Verify/approve doctors
    - Verify/approve AI technicians
    - Suspend/reactivate providers
    - Review provider documents
  
  Service Management:
    - View all service requests
    - Reassign providers
    - Handle escalations
    - Process refunds
  
  Content Management:
    - Approve/reject content posts
    - Manage content categories
    - Manage semen service templates
  
  Geography Management:
    - Manage area hierarchy
    - Update provider coverage
  
  Reporting:
    - View operational reports
    - Export data

Restrictions:
  - Cannot create super admins
  - Cannot access payment gateway credentials
  - Cannot modify audit logs

Profile: AdminProfile
```

### 2.3 SUPPORT

```yaml
Description: Customer support agent
System Key: SUPPORT
Access Level: Customer assistance

Capabilities:
  - View customer profiles (read-only)
  - View service requests
  - View payment status
  - Handle complaints
  - Send notifications
  - Basic troubleshooting

Restrictions:
  - Cannot modify customer data
  - Cannot verify providers
  - Cannot access financial details
  - Cannot manage content

Profile: None (uses User directly)
```

### 2.4 DOCTOR

```yaml
Description: Registered veterinary doctor
System Key: DOCTOR
Access Level: Clinical workflow

Capabilities:
  Own Profile:
    - Update profile information
    - Set availability
    - Define service areas
    - Set visit fees
  
  Service Requests:
    - View assigned requests
    - Accept/decline requests
    - Update request status
    - Create treatment records
    - Write prescriptions
  
  Clinical:
    - Access patient (animal) records
    - Create billing records
    - View payment status
  
  Reviews:
    - View own reviews
    - Respond to reviews

Restrictions:
  - Cannot access other doctors' data
  - Cannot modify customer billing
  - Cannot access admin functions
  - Requires verification to accept requests

Profile: DoctorProfile
Provider Status: ProviderStatus enum
```

### 2.5 AI_TECHNICIAN

```yaml
Description: Artificial insemination technician
System Key: AI_TECHNICIAN
Access Level: Field coordination

Capabilities:
  Own Profile:
    - Update profile information
    - Upload documents
    - Set availability
    - Define service areas
    - Create service listings
  
  Service Requests:
    - View assigned requests
    - Accept/decline AI requests
    - Update request status
    - Create service records
    - Submit service completion
  
  Inventory:
    - Manage semen inventory
    - Track stock levels
  
  Reviews:
    - View own reviews

Restrictions:
  - Cannot access doctor functions
  - Cannot modify customer data
  - Cannot access admin functions
  - Requires verification to accept requests
  - Limited to AI/technician services

Profile: AiTechnicianProfile
Provider Status: AiTechnicianStatus enum (extended lifecycle)
```

### 2.6 CUSTOMER

```yaml
Description: End user (farmer) consuming services
System Key: CUSTOMER
Access Level: Service consumer

Capabilities:
  Own Profile:
    - Update profile information
    - Manage animal profiles
    - View service history
  
  Service Requests:
    - Create new requests
    - View own requests
    - Cancel pending requests
    - Rate completed services
    - File complaints
  
  Payments:
    - View invoices
    - Make payments
    - View payment history
  
  Content:
    - View knowledge hub articles

Restrictions:
  - Cannot access other users' data
  - Cannot access provider data
  - Cannot access admin functions

Profile: CustomerProfile
```

---

## 3. Permission Matrix

### 3.1 Resource Permissions

| Resource | SUPER_ADMIN | ADMIN | SUPPORT | DOCTOR | AI_TECH | CUSTOMER |
|----------|-------------|-------|---------|--------|---------|----------|
| **Users** |
| Create Admin | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| View All Users | ✓ | ✓ | Read | ✗ | ✗ | ✗ |
| Edit Any User | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Edit Own Profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Providers** |
| Verify Providers | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Suspend Providers | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| View Provider Docs | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Service Requests** |
| View All | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| View Assigned | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| View Own | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Reassign | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Update Status | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| **Clinical** |
| Create Treatment | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Create Prescription | ✗ | ✗ | ✗ | ✓ | Limited | ✗ |
| View Medical Records | ✓ | Limited | ✗ | ✓ | Limited | Own |
| **Billing** |
| Create Invoice | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| View All Invoices | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Process Refunds | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Content** |
| Create Content | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Approve Content | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| View Published | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Geography** |
| Manage Areas | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| View Areas | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Settings** |
| System Settings | ✓ | Read | ✗ | ✗ | ✗ | ✗ |
| Audit Logs | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |

### 3.2 Action Permissions

| Action | Required Role(s) | Additional Conditions |
|--------|------------------|----------------------|
| Login (Admin Panel) | SUPER_ADMIN, ADMIN, SUPPORT | Valid credentials |
| Login (Mobile - Customer) | CUSTOMER | Valid OTP |
| Login (Mobile - Doctor) | DOCTOR | Verified provider |
| Login (Mobile - Technician) | AI_TECHNICIAN | Verified provider |
| Create Service Request | CUSTOMER | Has animal profile |
| Accept Service Request | DOCTOR, AI_TECHNICIAN | Verified, covers area |
| Complete Service Request | DOCTOR, AI_TECHNICIAN | Currently assigned |
| Create Treatment Case | DOCTOR, AI_TECHNICIAN | Has active request |
| Approve Content | ADMIN, SUPER_ADMIN | Content in review |
| Verify Provider | ADMIN, SUPER_ADMIN | Provider pending |

---

## 4. Provider Status Lifecycle

### 4.1 Doctor Provider Status

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    DOCTOR PROVIDER STATUS LIFECYCLE                            │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌──────────────────────┐                                                    │
│   │ PENDING_VERIFICATION │  Initial state after registration                  │
│   └──────────┬───────────┘                                                    │
│              │                                                                 │
│              │ Admin Review                                                    │
│              │                                                                 │
│   ┌──────────▼───────────┐      ┌───────────────────┐                        │
│   │       ACTIVE         │◀────▶│     SUSPENDED     │                        │
│   │   Can accept work    │      │  Temporarily off  │                        │
│   └──────────────────────┘      └───────────────────┘                        │
│              │                           ▲                                     │
│              │                           │                                     │
│              ▼                           │                                     │
│   ┌──────────────────────┐               │                                     │
│   │      REJECTED        │───────────────┘                                     │
│   │  Application denied  │   (Can reapply → PENDING)                          │
│   └──────────────────────┘                                                    │
│                                                                                │
│   ProviderStatus Enum:                                                        │
│   - PENDING_VERIFICATION: Awaiting admin review                               │
│   - ACTIVE: Verified and operational                                          │
│   - SUSPENDED: Temporarily disabled (admin action)                            │
│   - REJECTED: Application denied                                              │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 AI Technician Status (Extended Lifecycle)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│               AI TECHNICIAN STATUS LIFECYCLE (Extended)                        │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   ┌─────────────┐                                                             │
│   │    DRAFT    │  Profile being created                                      │
│   └──────┬──────┘                                                             │
│          │ Submit                                                              │
│          ▼                                                                     │
│   ┌─────────────┐                                                             │
│   │  SUBMITTED  │  Awaiting initial review                                    │
│   └──────┬──────┘                                                             │
│          │                                                                     │
│          ▼                                                                     │
│   ┌─────────────┐                                                             │
│   │UNDER_REVIEW │  Admin reviewing documents                                  │
│   └──────┬──────┘                                                             │
│          │                                                                     │
│   ┌──────┼──────────────────────────────────────┐                            │
│   │      │                                      │                            │
│   │      ▼                                      ▼                            │
│   │ ┌───────────────┐                    ┌─────────────┐                     │
│   │ │NEEDS_CORRECTION│◀───────────────────│  REJECTED   │                    │
│   │ │  Fix issues   │                    │  Denied     │                     │
│   │ └──────┬────────┘                    └─────────────┘                     │
│   │        │ Resubmit                                                        │
│   │        └─────────────────────┐                                           │
│   │                              │                                           │
│   └──────────────────────────────┼───────────────────────┐                   │
│                                  │                       │                   │
│                                  ▼                       │                   │
│                           ┌─────────────┐                │                   │
│                           │  APPROVED   │                │                   │
│                           │ Verified OK │                │                   │
│                           └──────┬──────┘                │                   │
│                                  │ Publish               │                   │
│                                  ▼                       │                   │
│                           ┌─────────────┐         ┌──────┴──────┐            │
│                           │  PUBLISHED  │◀───────▶│  SUSPENDED  │            │
│                           │ Live & active│         │ Temp off    │            │
│                           └─────────────┘         └─────────────┘            │
│                                                                                │
│   AiTechnicianStatus Enum:                                                    │
│   - DRAFT: Profile incomplete                                                 │
│   - SUBMITTED: Pending first review                                           │
│   - UNDER_REVIEW: Admin actively reviewing                                    │
│   - NEEDS_CORRECTION: Issues found, awaiting fix                              │
│   - APPROVED: Verified, ready to publish                                      │
│   - PUBLISHED: Live on platform                                               │
│   - REJECTED: Application denied                                              │
│   - SUSPENDED: Temporarily disabled                                           │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Status Transition Rules

| From Status | To Status | Actor | Conditions |
|-------------|-----------|-------|------------|
| DRAFT | SUBMITTED | Technician | All required docs uploaded |
| SUBMITTED | UNDER_REVIEW | Admin | Assigned for review |
| UNDER_REVIEW | NEEDS_CORRECTION | Admin | Issues found |
| UNDER_REVIEW | APPROVED | Admin | All checks passed |
| UNDER_REVIEW | REJECTED | Admin | Application denied |
| NEEDS_CORRECTION | SUBMITTED | Technician | Corrections made |
| APPROVED | PUBLISHED | Admin/System | Ready to go live |
| PUBLISHED | SUSPENDED | Admin | Policy violation |
| SUSPENDED | PUBLISHED | Admin | Issue resolved |
| Any | DRAFT | Technician | Profile withdrawal |

---

## 5. Doctor-Area Mapping

### 5.1 Coverage Model

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    DOCTOR-AREA COVERAGE MODEL                                  │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   DoctorProfile                                                               │
│        │                                                                       │
│        │  1:N via junction tables                                             │
│        │                                                                       │
│   ┌────┴────────────────────────────────────────────────┐                    │
│   │                                                      │                    │
│   ▼                                                      ▼                    │
│   DoctorServiceArea                              DoctorProfileArea            │
│   (Village-level, legacy)                        (Area tree, modern)          │
│   ─────────────────────                          ────────────────────         │
│   • doctorId (FK)                                • doctorId (FK)              │
│   • villageId (FK)                               • areaId (FK)                │
│   • priority                                     • priority                   │
│   • @@unique(doctorId, villageId)               • @@unique(doctorId, areaId) │
│                                                                                │
│   Also links to:                                                              │
│   DoctorProfileServiceCategory                                                │
│   ─────────────────────────────                                               │
│   • doctorId (FK)                                                             │
│   • serviceCategoryId (FK)                                                    │
│   • @@unique(doctorId, serviceCategoryId)                                     │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Coverage Assignment Flow

```
1. Doctor Registration
   └─▶ Admin approves doctor
       └─▶ Admin assigns service areas
           └─▶ Doctor becomes available in those areas

2. Service Request Matching
   └─▶ Customer creates request with location
       └─▶ System queries:
           - DoctorServiceArea (village match)
           - DoctorProfileArea (area tree match)
           - DoctorProfileServiceCategory (service match)
           - DoctorProfile.providerStatus = ACTIVE
           - DoctorProfile.acceptsEmergency (if emergency)
       └─▶ Returns ranked list of available doctors
```

### 5.3 Priority System

```typescript
// Priority assignment query (conceptual)
const matchingDoctors = await prisma.doctorProfile.findMany({
  where: {
    providerStatus: 'ACTIVE',
    OR: [
      { doctorServiceAreas: { some: { villageId: requestVillageId } } },
      { doctorProfileAreas: { some: { area: { id: requestAreaId } } } }
    ],
    doctorProfileServiceCategories: {
      some: { serviceCategoryId: requestServiceCategoryId }
    }
  },
  include: {
    doctorServiceAreas: {
      where: { villageId: requestVillageId },
      select: { priority: true }
    },
    doctorProfileAreas: {
      where: { areaId: requestAreaId },
      select: { priority: true }
    }
  },
  orderBy: [
    // Lower priority number = higher preference
    // Sort by assigned priority, then by verification date
  ]
});
```

### 5.4 Coverage Update Rules

| Action | Actor | Validation |
|--------|-------|------------|
| Add coverage area | Admin | Doctor verified |
| Remove coverage area | Admin | No active requests in area |
| Set priority | Admin | Valid priority range |
| Self-update areas | Doctor | Requires admin approval |

---

## 6. AI Technician Management

### 6.1 AI Technician Coverage Model

```
┌───────────────────────────────────────────────────────────────────────────────┐
│               AI TECHNICIAN COVERAGE MODEL                                     │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   AiTechnicianProfile                                                         │
│        │                                                                       │
│        │  Multiple coverage mechanisms                                        │
│        │                                                                       │
│   ┌────┴──────────────────────────────────────────────────────────┐          │
│   │                    │                    │                     │          │
│   ▼                    ▼                    ▼                     ▼          │
│   AiTechnician     AiTechnician        AiTechnician          AiTechnician   │
│   ServiceArea      ProfileArea         DivisionService       Profile        │
│   (Village)        (Area tree)         Area (Division)       ServiceCategory│
│                                                                                │
│   Hierarchy:                                                                  │
│   1. Division-level coverage (broadest)                                       │
│   2. Area tree coverage (flexible)                                            │
│   3. Village-level coverage (most specific)                                   │
│                                                                                │
│   Service Categories:                                                         │
│   • ai-service (Artificial Insemination)                                      │
│   • semen-service (Semen delivery)                                            │
│   • pregnancy-check                                                           │
│   • general-technician-service                                                │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 AI Technician Document Workflow

```
┌───────────────────────────────────────────────────────────────────────────────┐
│               DOCUMENT VERIFICATION WORKFLOW                                   │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   Required Documents:                                                         │
│   ├─ NID_FRONT (mandatory)                                                    │
│   ├─ NID_BACK (mandatory)                                                     │
│   ├─ PROFILE_PHOTO (mandatory)                                                │
│   ├─ TRAINING_CERTIFICATE (recommended)                                       │
│   └─ AI_CERTIFICATE (recommended for AI services)                             │
│                                                                                │
│   Document Status Flow:                                                       │
│                                                                                │
│   ┌─────────────────┐                                                         │
│   │ PENDING_REVIEW  │  Uploaded, awaiting review                              │
│   └────────┬────────┘                                                         │
│            │                                                                   │
│   ┌────────┼────────┐                                                         │
│   │        │        │                                                         │
│   ▼        ▼        │                                                         │
│   ┌──────┐ ┌──────┐ │                                                         │
│   │APPRVD│ │REJECTD│─┘  Re-upload → PENDING_REVIEW                            │
│   └──────┘ └──────┘                                                           │
│                                                                                │
│   Storage: UploadedFile + AiTechnicianDocument (metadata)                     │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Service Instance Moderation

```
┌───────────────────────────────────────────────────────────────────────────────┐
│               SERVICE INSTANCE MODERATION                                      │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   Technician creates ServiceInstance (service listing)                        │
│        │                                                                       │
│        ▼                                                                       │
│   DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → PUBLISHED                    │
│                            │                                                   │
│                            └──▶ NEEDS_CORRECTION → (resubmit)                 │
│                            └──▶ REJECTED                                      │
│                                                                                │
│   Review includes:                                                            │
│   • ServiceInstanceMedia moderation                                           │
│   • Pricing validation                                                        │
│   • Service description check                                                 │
│   • Inventory verification                                                    │
│                                                                                │
│   Audit Trail:                                                                │
│   • ServiceInstanceStatusLog (status changes)                                 │
│   • ServiceInstanceReview (admin comments)                                    │
│   • ServiceInstancePublishLog (publish/unpublish)                             │
│   • ServiceInstanceAuditEvent (detailed audit)                                │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Lead Lifecycle

### 7.1 Lead Concept (Future Implementation)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    LEAD LIFECYCLE (Future)                                     │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   A "Lead" represents a potential customer or provider before conversion.     │
│                                                                                │
│   Lead Types:                                                                 │
│   • Customer Lead: Potential farmer (pre-registration)                        │
│   • Provider Lead: Potential doctor/technician (application)                  │
│                                                                                │
│   Lead Lifecycle:                                                             │
│                                                                                │
│   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐          │
│   │    NEW     │──▶│ CONTACTED  │──▶│ QUALIFIED  │──▶│ CONVERTED  │          │
│   └────────────┘   └────────────┘   └────────────┘   └────────────┘          │
│         │                │                │                │                  │
│         │                │                │                │                  │
│         ▼                ▼                ▼                │                  │
│   ┌──────────────────────────────────────────┐            │                  │
│   │               LOST                        │◀───────────┘                  │
│   │  (unresponsive, not interested, etc.)    │                               │
│   └──────────────────────────────────────────┘                               │
│                                                                                │
│   Proposed Tables (not yet implemented):                                      │
│   • Lead (id, type, source, status, contactInfo, notes, assignedTo)          │
│   • LeadActivity (id, leadId, type, description, actorId, timestamp)         │
│   • LeadSource (id, name, campaign, channel)                                  │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Current Lead-like Patterns

```typescript
// Current implementation uses status fields instead of separate Lead table

// Provider Lead (via AiTechnicianProfile)
// Status: DRAFT → SUBMITTED = Lead captured
// Status: APPROVED → PUBLISHED = Lead converted

// Customer Lead (implicit)
// MobileOtpChallenge created = Potential lead
// CustomerProfile created = Lead converted

// Service Lead (via ServiceRequest)
// Status: PENDING = Active lead
// Status: COMPLETED = Converted
// Status: CANCELLED = Lost
```

---

## 8. Authorization Patterns

### 8.1 Token-Based Authorization

```typescript
// JWT Token Structure

// Admin Token (HttpOnly Cookie)
interface AdminJwtPayload {
  userId: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'SUPPORT';
  email: string;
  exp: number;  // 24 hours
  iat: number;
}

// Mobile Token (Authorization Header)
interface MobileJwtPayload {
  userId: string;
  role: 'CUSTOMER' | 'DOCTOR' | 'AI_TECHNICIAN';
  phone?: string;
  profileId: string;  // CustomerProfile, DoctorProfile, or AiTechnicianProfile ID
  exp: number;  // 7 days
  iat: number;
}
```

### 8.2 Authorization Middleware

```typescript
// Admin authorization middleware pattern
export async function authorizeAdmin(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AdminAuthResult> {
  const token = request.cookies.get('admin-token')?.value;
  
  if (!token) {
    return { authorized: false, error: 'NO_TOKEN' };
  }
  
  const payload = verifyAdminToken(token);
  
  if (!payload || !allowedRoles.includes(payload.role)) {
    return { authorized: false, error: 'FORBIDDEN' };
  }
  
  // Check user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { status: true, role: true }
  });
  
  if (!user || user.status !== 'ACTIVE') {
    return { authorized: false, error: 'USER_INACTIVE' };
  }
  
  return { authorized: true, user: payload };
}
```

### 8.3 Resource-Level Authorization

```typescript
// Example: Service request access control
async function canAccessServiceRequest(
  userId: string,
  userRole: UserRole,
  requestId: string
): Promise<boolean> {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    include: {
      customer: { select: { userId: true } },
      assignedDoctor: { select: { userId: true } },
      assignedTechnician: { select: { userId: true } }
    }
  });
  
  if (!request) return false;
  
  switch (userRole) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
    case 'SUPPORT':
      return true;  // Full access
      
    case 'CUSTOMER':
      return request.customer?.userId === userId;  // Own requests only
      
    case 'DOCTOR':
      return request.assignedDoctor?.userId === userId;  // Assigned only
      
    case 'AI_TECHNICIAN':
      return request.assignedTechnician?.userId === userId;  // Assigned only
      
    default:
      return false;
  }
}
```

### 8.4 Data Filtering Patterns

```typescript
// Automatic data filtering by role
function buildServiceRequestFilter(userId: string, role: UserRole) {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return {};  // No filter
      
    case 'SUPPORT':
      return { status: { not: 'DRAFT' } };  // Exclude drafts
      
    case 'CUSTOMER':
      return { customer: { userId } };  // Own requests
      
    case 'DOCTOR':
      return { 
        assignedDoctor: { userId },
        status: { in: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] }
      };
      
    case 'AI_TECHNICIAN':
      return { 
        assignedTechnician: { userId },
        status: { in: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] }
      };
      
    default:
      return { id: 'NEVER_MATCH' };  // Deny all
  }
}
```

---

## 9. API Route Protection

### 9.1 Route Protection Matrix

| Route Pattern | Required Auth | Required Roles | Notes |
|---------------|---------------|----------------|-------|
| `/api/admin/*` | Admin JWT | SUPER_ADMIN, ADMIN | Admin panel APIs |
| `/api/admin/super/*` | Admin JWT | SUPER_ADMIN | Super admin only |
| `/api/mobile/auth/*` | None | - | Public auth endpoints |
| `/api/mobile/customer/*` | Mobile JWT | CUSTOMER | Customer APIs |
| `/api/mobile/doctor/*` | Mobile JWT | DOCTOR | Doctor APIs |
| `/api/mobile/technician/*` | Mobile JWT | AI_TECHNICIAN | Technician APIs |
| `/api/mobile/provider/*` | Mobile JWT | DOCTOR, AI_TECHNICIAN | Shared provider APIs |
| `/api/public/*` | Rate-limited | - | Public APIs |

### 9.2 Middleware Configuration

```typescript
// Route protection middleware example
export const routeConfig = {
  '/api/admin/users': {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    auth: 'admin',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    rateLimit: { window: 60, max: 100 }
  },
  '/api/admin/providers/verify': {
    methods: ['POST'],
    auth: 'admin',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    rateLimit: { window: 60, max: 50 }
  },
  '/api/mobile/customer/requests': {
    methods: ['GET', 'POST'],
    auth: 'mobile',
    roles: ['CUSTOMER'],
    rateLimit: { window: 60, max: 100 }
  },
  '/api/public/areas': {
    methods: ['GET'],
    auth: 'none',
    rateLimit: { window: 60, max: 200 }
  }
};
```

### 9.3 Response Format for Auth Errors

```typescript
// Unauthorized (401)
{
  success: false,
  error: {
    code: "UNAUTHORIZED",
    message: "Authentication required"
  }
}

// Forbidden (403)
{
  success: false,
  error: {
    code: "FORBIDDEN",
    message: "Insufficient permissions",
    details: {
      requiredRoles: ["ADMIN", "SUPER_ADMIN"],
      currentRole: "SUPPORT"
    }
  }
}

// Account Suspended (403)
{
  success: false,
  error: {
    code: "ACCOUNT_SUSPENDED",
    message: "Your account has been suspended"
  }
}
```

---

## 10. Future Role Extensions

### 10.1 Planned Roles

| Role | Purpose | Expected Timeline |
|------|---------|-------------------|
| MARKETPLACE_ADMIN | Manage marketplace listings | Phase 3 |
| FINANCE | Financial operations, payouts | Phase 3 |
| CONTENT_MODERATOR | Content review only | Phase 2 |
| REGIONAL_MANAGER | Area-specific admin | Phase 4 |
| API_KEY (service) | Machine-to-machine auth | Phase 2 |

### 10.2 Permission System Evolution

```
Current: Role-based (RBAC)
  └─ Fixed roles with hardcoded permissions

Future Phase 1: Enhanced RBAC
  └─ Permission groups per role
  └─ Admin can toggle permissions

Future Phase 2: Attribute-Based (ABAC)
  └─ Dynamic rules based on context
  └─ Example: "Can edit if owner AND status is DRAFT"

Future Phase 3: Policy-Based
  └─ External policy engine
  └─ Complex multi-tenant rules
```

### 10.3 Role Audit Table (Planned)

```prisma
// Future: Track role changes
model RoleAuditLog {
  id          String   @id @default(cuid())
  userId      String
  oldRole     UserRole?
  newRole     UserRole
  changedById String
  reason      String?
  ipAddress   String?
  createdAt   DateTime @default(now())
  
  user      User @relation("RoleAuditTarget", fields: [userId], references: [id])
  changedBy User @relation("RoleAuditActor", fields: [changedById], references: [id])
  
  @@index([userId, createdAt])
  @@index([changedById])
}
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Security Team | Initial release |

---

## Related Documents

| Document | Location |
|----------|----------|
| ERD | `docs/database/ERD.md` |
| Table Structure | `docs/database/TABLE_STRUCTURE.md` |
| Multi-Tenant Strategy | `docs/database/MULTI_TENANT_STRATEGY.md` |
| Master System Rules | `docs/core/MASTER_SYSTEM_RULES.md` |

---

*End of ROLE_SYSTEM.md*
