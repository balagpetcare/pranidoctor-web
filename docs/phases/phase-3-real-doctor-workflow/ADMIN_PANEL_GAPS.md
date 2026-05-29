# Phase 3: Admin Panel Gaps Analysis

## Executive Summary

This document defines all admin panel UI components, screens, and functionality required for managing the Real Doctor Workflow. Organized by functional area with detailed specifications.

---

## 1. Doctor Management Enhancements

### 1.1 Doctor Monitoring Dashboard

```typescript
// Page: /admin/doctors/monitoring
// Component: DoctorMonitoringDashboard

interface DoctorMonitoringDashboardProps {
  // Real-time doctor status overview
}

// Features:
// - Live status grid showing all doctors
// - Status filters: Online | Busy | Offline | On Break
// - Quick actions: Message | Suspend | View Cases
// - Performance indicators per doctor
// - Alert for doctors offline > 30 min during shift
// - Emergency availability count

// Data Requirements:
// - GET /api/admin/doctors?status=&page=
// - WebSocket: /ws/admin/doctor-status
// - Real-time heartbeat data

// UI Components:
// - DoctorStatusCard: Photo, name, status badge, current case, last seen
// - StatusFilterChips: Toggle filters
// - QuickActionMenu: Dropdown with actions
// - AlertBanner: For anomalies
```

### 1.2 Doctor Detail - Enhanced View

```typescript
// Page: /admin/doctors/[id]
// Component: EnhancedDoctorDetailPanel

// New Tabs:
// 1. Overview (existing)
// 2. Availability Schedule
// 3. Performance Metrics
// 4. Active Cases
// 5. Case History
// 6. Earnings & Payouts
// 7. Audit Log

// Tab: Availability Schedule
// - Weekly calendar view
// - Exception dates list
// - Current status with manual override
// - Availability history chart

// Tab: Performance Metrics
// - Response time trends
// - Acceptance rate chart
// - Customer ratings
// - Ranking comparison
// - Improvement suggestions

// Tab: Active Cases
// - Current assignments
// - Consultation status
// - Time in current status
// - Quick reassignment

// Tab: Earnings & Payouts
// - Earnings summary
// - Transaction history
// - Pending payouts
// - Payout batch history
```

### 1.3 Doctor Performance Analytics

```typescript
// Page: /admin/analytics/doctors
// Component: DoctorAnalyticsDashboard

// Features:
// - Comparison table of all doctors
// - Sortable columns:
//   - Name
//   - Status
//   - Acceptance Rate
//   - Avg Response Time
//   - Customer Rating
//   - Monthly Earnings
//   - Cases Completed
// - Export to CSV/Excel
// - Filter by area, specialization, date range
// - Benchmark lines (top 25%, average)

// Visualizations:
// - Bar chart: Cases per doctor
// - Line chart: Response time trends
// - Scatter plot: Rating vs Earnings
// - Heatmap: Activity by hour/day
```

### 1.4 Doctor Suspension & Controls

```typescript
// Component: DoctorControlPanel

// Actions:
// - Suspend Doctor
//   - Reason selection
//   - Duration: Temporary | Permanent
//   - Auto-resume date
//   - Customer notification
// 
// - Force Offline
//   - Immediate status change
//   - Reason logging
// 
// - Reassign All Cases
//   - Bulk reassign active cases
//   - Target doctor selection
//   - Priority preservation
// 
// - Send Broadcast Message
//   - To specific doctor or all
//   - SMS + Push + Email options

// Modal: SuspendDoctorModal
interface SuspendDoctorModalProps {
  doctorId: string;
  doctorName: string;
  currentStatus: DoctorStatus;
  activeCases: number;
}
```

---

## 2. Assignment Queue Management

### 2.1 Live Assignment Queue

```typescript
// Page: /admin/assignments/queue
// Component: AssignmentQueueMonitor

// Real-time Queue Display:
// - Incoming requests stream
// - Assignment status per request
// - Doctor assignment attempts
// - Timeout warnings
// - Failed assignments

// Columns:
// - Request ID
// - Customer (anonymized)
// - Animal Type
// - Service Type
// - Priority Score
// - Status: Pending | Assigning | Assigned | Timeout
// - Assigned Doctor
// - Attempt Count
// - Time in Queue
// - Actions: Assign | Reassign | Cancel

// Auto-refresh: 5 seconds
// Sound alert: New emergency request

// Actions:
// - Manual Assign: Override algorithm
// - Force Reassign: Change assigned doctor
// - Cancel Request: With reason
// - Escalate: Increase priority
```

### 2.2 Assignment Algorithm Configuration

```typescript
// Page: /admin/settings/assignment
// Component: AssignmentAlgorithmConfig

// Configuration Options:
// - Scoring Weights (sliders 0-100):
//   - Availability: 30
//   - Proximity: 25
//   - Performance: 20
//   - Workload: 15
//   - Specialization: 10
// 
// - Timing Settings:
//   - Assignment timeout: 120 seconds
//   - Reassignment attempts: 3
//   - Broadcast pool size: 5
// 
// - Emergency Settings:
//   - Bypass availability check: true/false
//   - Broadcast to all online: true/false
//   - Priority boost: 50 points
// 
// - Area Matching:
//   - Strict area match required: true/false
//   - Expand search radius after timeout: true/false

// Save/Reset buttons
// Preview algorithm with test request
```

### 2.3 Reassignment Interface

```typescript
// Component: ReassignmentPanel

// Triggered from:
// - Assignment queue
// - Doctor detail (active cases)
// - Service request detail

// Interface:
// - Current assignment info
// - Reason for reassignment (dropdown)
// - New doctor selector:
//   - Search by name
//   - Filter by availability
//   - Filter by area
//   - Show workload
// - Priority preservation toggle
// - Customer notification toggle
// - Preview of new assignment
// - Confirm button

// API: POST /api/admin/service-requests/:id/reassign-doctor
```

---

## 3. Service Request Supervision

### 3.1 Enhanced Request List

```typescript
// Page: /admin/service-requests
// Component: EnhancedServiceRequestList

// Enhanced Filters:
// - Status: All | Pending | Assigned | In Progress | Completed | Cancelled | Timeout
// - Priority: Emergency | High | Normal | Low
// - Service Type: Home Visit | Online | Emergency
// - Date Range: Today | Week | Month | Custom
// - Area: Division | District | Upazila | Union
// - Doctor: Specific doctor or Unassigned
// - Customer: Search by phone/name

// Enhanced Columns:
// - Request ID (clickable)
// - Created Time
// - Customer (masked)
// - Animal
// - Service Type
// - Status with visual indicator
// - Assigned Doctor
// - Time in Status
// - Priority Badge
// - Actions: View | Reassign | Cancel

// Bulk Actions:
// - Select multiple requests
// - Bulk reassign
// - Bulk cancel
// - Export selected

// Visual Indicators:
// - Emergency: Red pulse animation
// - Timeout warning: Orange
// - Long wait: Yellow highlight
```

### 3.2 Request Detail - Supervision View

```typescript
// Page: /admin/service-requests/[id]
// Component: SupervisionRequestDetail

// New Sections:
// 1. Assignment Timeline
//    - Each assignment attempt
//    - Doctor response times
//    - Reassignment history
// 
// 2. Consultation Monitor
//    - Live session status
//    - Duration
//    - Connection quality
//    - Chat transcript (read-only)
// 
// 3. Clinical Data
//    - Examination data
//    - Prescriptions
//    - Attachments
// 
// 4. Audit Trail
//    - All status changes
//    - Who did what when
//    - IP addresses
// 
// 5. Financial Summary
//    - Service fee
//    - Doctor earnings
//    - Platform commission

// Admin Actions:
// - Force Status Change (with reason)
// - Join Consultation (observer mode)
// - Message Doctor/Customer
// - Emergency Reassign
// - Refund Processing
```

### 3.3 Emergency Request Handling

```typescript
// Component: EmergencyRequestPanel

// Emergency-specific UI:
// - Red alert banner
// - Immediate action buttons
// - Bypass normal queue
// - Direct doctor call option
// - Escalation path

// Features:
// - Auto-escalation after 2 minutes
// - Broadcast to all available doctors
// - Admin notification (SMS/email)
// - One-click reassignment
// - Emergency contact display

// Page: /admin/emergencies
// - Active emergencies list
// - Resolved emergencies
// - Response time analytics
// - Emergency protocol documentation
```

---

## 4. Consultation Monitoring

### 4.1 Live Consultations Dashboard

```typescript
// Page: /admin/consultations/live
// Component: LiveConsultationsDashboard

// Grid View:
// - Active consultation cards
// - Doctor name & photo
// - Customer (anonymized)
// - Animal type
// - Duration timer
// - Status: Active | Paused
// - Connection quality indicator

// Actions per consultation:
// - Monitor (observer mode)
// - Message doctor
// - Force end (emergency)
// - Reassign

// Statistics:
// - Total active consultations
// - Average duration
// - Paused count
// - Connection issues count

// Auto-refresh: 10 seconds
```

### 4.2 Consultation Detail View

```typescript
// Component: ConsultationMonitorDetail

// Read-only view of:
// - Chat transcript (real-time)
// - Examination data entered
// - Prescriptions created
// - Session timeline
// - Connection quality log

// Admin Actions:
// - Send message to doctor (system alert)
// - Send message to customer (system alert)
// - Flag for review
// - Force end with reason

// Recording/Transcript:
// - Voice call recording (if enabled)
// - Video session log
// - Download transcript
```

---

## 5. Follow-up Management

### 5.1 Follow-up Schedule Overview

```typescript
// Page: /admin/followups
// Component: FollowupScheduleDashboard

// Calendar View:
// - Month/week/day views
// - Follow-up appointments
// - Color-coded by type
// - Doctor assignment

// List View:
// - Upcoming follow-ups
// - Overdue follow-ups (red)
// - Completed follow-ups
// - Cancelled follow-ups

// Filters:
// - Date range
// - Doctor
// - Follow-up type
// - Status

// Actions:
// - Reschedule
// - Reassign doctor
// - Mark complete
// - Cancel with reason
```

### 5.2 Follow-up Detail

```typescript
// Component: FollowupDetailPanel

// Display:
// - Parent case reference
// - Scheduled date/time
// - Doctor assigned
// - Customer info
// - Animal info
// - Follow-up type
// - Reminder status
// - Completion status

// History:
// - Reminder sent log
// - Customer confirmations
// - Reschedule history
```

---

## 6. Earnings & Payout Management

### 6.1 Earnings Overview Dashboard

```typescript
// Page: /admin/billing/earnings
// Component: EarningsDashboard

// Summary Cards:
// - Total earnings (period)
// - Pending approval
// - In payout
// - Paid out
// - Disputed

// Charts:
// - Earnings by doctor (bar)
// - Earnings trend (line)
// - Earnings by service type (pie)
// - Payout status distribution

// Filters:
// - Date range
// - Doctor
// - Status
// - Service type

// Table:
// - Doctor name
// - Period
// - Consultation fees
// - Travel fees
// - Commission
// - Net earnings
// - Status
// - Actions
```

### 6.2 Payout Batch Management

```typescript
// Page: /admin/billing/payouts
// Component: PayoutBatchManager

// Batch List:
// - Batch name
// - Period
// - Total doctors
// - Total amount
// - Status
// - Created date
// - Processed date

// Create Batch:
// - Period selection
// - Doctor filter (all or specific)
// - Preview totals
// - Confirm creation

// Process Batch:
// - Review all earnings
// - Approve/reject individual items
// - Bulk approve
// - Export for bank
// - Mark as processed
// - Upload proof

// Individual Payout:
// - View doctor earnings detail
// - Adjust amounts (with reason)
// - Hold/release
// - Mark paid with reference
```

### 6.3 Earning Adjustment Interface

```typescript
// Component: EarningAdjustmentModal

// Use Cases:
// - Add bonus
// - Apply penalty
// - Correct calculation error
// - Refund processing

// Fields:
// - Doctor selector
// - Service request reference
// - Adjustment type: Bonus | Penalty | Correction
// - Amount
// - Reason (required)
// - Supporting notes
// - Approval checkbox

// Audit:
// - Who created adjustment
// - When
// - Original amount
// - New amount
```

---

## 7. Performance & Analytics

### 7.1 System Performance Dashboard

```typescript
// Page: /admin/analytics/system
// Component: SystemPerformanceDashboard

// Real-time Metrics:
// - Active doctors
// - Active consultations
// - Queue length
// - Average response time
// - Assignment success rate

// Historical Charts:
// - Requests per hour/day/week
// - Completion rate trends
// - Cancellation reasons
// - Doctor utilization
// - Customer satisfaction

// Alerts:
// - Response time > 5 min
// - Assignment failure rate > 10%
// - Doctor availability < 20%
// - Queue backlog

// Export:
// - Generate reports
// - Schedule automated reports
```

### 7.2 Doctor Performance Reports

```typescript
// Page: /admin/analytics/doctor-performance
// Component: DoctorPerformanceReport

// Individual Doctor Report:
// - Period selector
// - Summary statistics
// - Trend charts
// - Case breakdown
// - Earnings summary
// - Customer feedback

// Comparative Report:
// - Multiple doctor selection
// - Side-by-side comparison
// - Ranking tables
// - Benchmark analysis

// Export Formats:
// - PDF (formatted report)
// - Excel (raw data)
// - CSV (for analysis)
```

### 7.3 Customer Satisfaction Analytics

```typescript
// Page: /admin/analytics/satisfaction
// Component: SatisfactionAnalytics

// Metrics:
// - Overall rating distribution
// - Rating by doctor
// - Rating by service type
// - Rating trends
// - Review text analysis

// Feedback Management:
// - Review moderation
// - Response to reviews
// - Flag inappropriate
// - Feature requests tracking
```

---

## 8. Audit & Compliance

### 8.1 Audit Log Viewer

```typescript
// Page: /admin/audit/logs
// Component: AuditLogViewer

// Filter Options:
// - Date range
// - Actor (user)
// - Action type
// - Entity type
// - Entity ID
// - Service request ID

// Log Entry Display:
// - Timestamp
// - Actor name & role
// - Action
// - Entity type & ID
// - Before/after state (expandable)
// - IP address
// - User agent

// Export:
// - Filtered results to CSV
// - PDF report

// Retention:
// - Auto-archive after 1 year
// - Compliance export
```

### 8.2 Clinical Data Audit

```typescript
// Page: /admin/audit/clinical
// Component: ClinicalAuditViewer

// Specialized for clinical actions:
// - Prescription changes
// - Diagnosis updates
// - Treatment modifications
// - Attachment uploads/deletions

// Compliance Features:
// - Immutable log
// - Digital signatures (future)
// - Data integrity checks
// - Export for regulatory
```

---

## 9. Configuration & Settings

### 9.1 Workflow Configuration

```typescript
// Page: /admin/settings/workflow
// Component: WorkflowSettings

// Consultation Settings:
// - Max consultation duration
// - Auto-end after timeout
// - Pause timeout
// - Reconnection grace period

// Assignment Settings:
// - Algorithm weights
// - Timeout values
// - Retry attempts
// - Broadcast settings

// Notification Settings:
// - Doctor notification preferences
// - Customer notification preferences
// - Admin alert thresholds
// - SMS vs Push priorities

// Earnings Settings:
// - Commission rates
// - Payout schedule
// - Minimum payout amount
// - Penalty rules
```

### 9.2 Emergency Protocols

```typescript
// Page: /admin/settings/emergency
// Component: EmergencyProtocolConfig

// Escalation Levels:
// - Level 1: Broadcast to area doctors
// - Level 2: Broadcast to all online
// - Level 3: Admin notification
// - Level 4: External emergency contact

// Auto-escalation Timing:
// - Level 1: Immediate
// - Level 2: After 2 minutes
// - Level 3: After 5 minutes
// - Level 4: After 10 minutes

// Contact Configuration:
// - Emergency contact list
// - Notification methods
// - On-call admin schedule
```

---

## 10. UI Components Library

### 10.1 Status Badges

```typescript
// Component Library

// DoctorStatusBadge
// - ONLINE_AVAILABLE: Green
// - ONLINE_LIMITED: Yellow-Green
// - ONLINE_EMERGENCY_ONLY: Orange
// - BUSY_WITH_CASE: Blue
// - ON_BREAK: Yellow
// - OFFLINE: Gray

// RequestStatusBadge
// - PENDING: Gray
// - ASSIGNED: Blue
// - ACCEPTED: Light Blue
// - IN_PROGRESS: Purple
// - COMPLETED: Green
// - CANCELLED: Red
// - TIMEOUT: Orange

// PriorityBadge
// - EMERGENCY: Red pulse
// - HIGH: Orange
// - NORMAL: Blue
// - LOW: Gray
```

### 10.2 Data Tables

```typescript
// Enhanced DataTable Component

// Features:
// - Sortable columns
// - Filterable columns
// - Pagination
// - Bulk selection
// - Row actions
// - Export
// - Column visibility toggle
// - Responsive design

// Presets:
// - DoctorTable
// - RequestTable
// - EarningsTable
// - AuditLogTable
```

### 10.3 Real-time Indicators

```typescript
// Real-time Components

// LiveIndicator
// - Pulsing dot
// - "Live" label
// - Last update time

// ConnectionQuality
// - Signal bars
// - Latency ms
// - Status: Excellent | Good | Fair | Poor

// TimerDisplay
// - Count up (duration)
// - Count down (timeout)
// - Color change near timeout
```

---

## 11. Implementation Priority

### Phase 1: Foundation (Week 1-2)
- [ ] Doctor monitoring dashboard
- [ ] Enhanced request list with filters
- [ ] Assignment queue monitor
- [ ] Basic reassignment interface

### Phase 2: Supervision (Week 3-4)
- [ ] Live consultations dashboard
- [ ] Request detail supervision view
- [ ] Emergency handling panel
- [ ] Follow-up schedule view

### Phase 3: Financial (Week 5-6)
- [ ] Earnings dashboard
- [ ] Payout batch management
- [ ] Earning adjustment interface
- [ ] Financial reports

### Phase 4: Analytics (Week 7-8)
- [ ] System performance dashboard
- [ ] Doctor performance reports
- [ ] Audit log viewer
- [ ] Configuration panels

---

**Version**: 1.0.0
**Last Updated**: 2026-05-28
**Status**: Ready for Implementation
