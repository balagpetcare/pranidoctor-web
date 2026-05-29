# Phase 3: Flutter Mobile App Gaps Analysis

## Executive Summary

This document defines all Flutter screen requirements, state management needs, and API integrations for the Real Doctor Workflow. Organized by user role (Customer vs Doctor) and workflow phase.

---

## 1. Customer App Screens

### 1.1 Request Creation Flow

#### Emergency Request Screen
```dart
// Screen: EmergencyRequestScreen
// Route: /emergency/request
// State: EmergencyRequestNotifier (Riverpod)

class EmergencyRequestScreen extends ConsumerWidget {
  // UI Components:
  // - Emergency banner (red, pulsing)
  // - Animal selector (quick select)
  // - Symptom quick-pick chips
  // - Photo/video attachment (camera)
  // - Location confirmation
  // - Emergency confirmation dialog
  // - Submit button (large, red)
  
  // State Management:
  // - Form validation
  // - Location loading state
  // - Submission loading
  // - Error handling (retry)
  
  // API Calls:
  // - POST /api/mobile/service-requests (isEmergency=true)
  // - GET /api/mobile/animals (quick select)
  
  // Edge Cases:
  // - No location permission
  // - Network unavailable
  // - No animals registered
}
```

#### Standard Request Screen
```dart
// Screen: CreateServiceRequestScreen
// Route: /requests/create
// State: ServiceRequestFormNotifier

class CreateServiceRequestScreen extends ConsumerWidget {
  // UI Components:
  // - Step indicator (3 steps)
  // - Step 1: Animal selection
  // - Step 2: Service type (home visit, online, etc.)
  // - Step 3: Problem description + attachments
  // - Step 4: Schedule (now/later)
  // - Step 5: Location confirmation
  // - Step 6: Review & submit
  
  // State Management:
  // - Multi-step form state
  // - Validation per step
  // - Draft auto-save
  // - Image compression before upload
  
  // API Calls:
  // - GET /api/mobile/animals
  // - GET /api/mobile/providers/doctors (availability check)
  // - POST /api/mobile/service-requests
  // - POST /api/doctor/attachments/upload-url (for images)
}
```

### 1.2 Request Tracking Screens

#### Active Request Screen (Live Tracking)
```dart
// Screen: ActiveRequestScreen
// Route: /requests/:id/active
// State: ActiveRequestNotifier (Stream-based)

class ActiveRequestScreen extends ConsumerWidget {
  // UI Components:
  // - Status timeline (vertical stepper)
  // - Doctor info card (when assigned)
  // - Real-time map (doctor location)
  // - Chat button (when consultation active)
  // - Call button (emergency only)
  // - Cancel request button
  // - Countdown timer (assignment timeout)
  
  // State Management:
  // - WebSocket/SSE connection for real-time updates
  // - Polling fallback
  // - Doctor location tracking
  // - Timer management
  
  // API Calls:
  // - GET /api/mobile/service-requests/:id (polling)
  // - POST /api/mobile/service-requests/:id/cancel
  // - WebSocket: /ws/requests/:id
  
  // States to Handle:
  // - PENDING: "Finding available doctors..."
  // - ASSIGNED: "Dr. Ahmed assigned, waiting for acceptance..."
  // - ACCEPTED: "Dr. Ahmed accepted! Preparing for consultation..."
  // - IN_PROGRESS: "Consultation in progress"
  // - COMPLETED: "Case completed"
}
```

#### Request List Screen
```dart
// Screen: RequestListScreen
// Route: /requests
// State: RequestListNotifier

class RequestListScreen extends ConsumerWidget {
  // UI Components:
  // - Tab bar: Active | Completed | Cancelled
  // - Pull-to-refresh
  // - Request cards with:
  //   - Status badge
  //   - Animal thumbnail
  //   - Date/time
  //   - Doctor name (if assigned)
  //   - Quick actions
  // - Empty states per tab
  // - Floating action button (new request)
  
  // State Management:
  // - Pagination
  // - Filter state
  // - Refresh state
  // - Error retry
  
  // API Calls:
  // - GET /api/mobile/service-requests?status=&page=
}
```

### 1.3 Consultation Screens

#### Consultation Chat Screen
```dart
// Screen: ConsultationChatScreen
// Route: /consultations/:id/chat
// State: ChatNotifier (Stream-based)

class ConsultationChatScreen extends ConsumerWidget {
  // UI Components:
  // - Chat bubble list
  // - Message input with:
  //   - Text input
  //   - Image attachment button
  //   - Camera button
  //   - Voice note button
  // - Doctor info header
  // - Consultation timer
  // - End consultation button
  // - Connection status indicator
  
  // State Management:
  // - Real-time message sync
  // - Message queue (offline support)
  // - Typing indicators
  // - Image upload progress
  // - Read receipts
  
  // API Calls:
  // - WebSocket for messages
  // - POST /api/doctor/attachments/upload-url
  // - POST /api/doctor/consultations/:id/end
}
```

#### Video/Voice Call Screen
```dart
// Screen: ConsultationCallScreen
// Route: /consultations/:id/call
// State: CallNotifier (Agora/Twilio integration)

class ConsultationCallScreen extends ConsumerWidget {
  // UI Components:
  // - Video view (local + remote)
  // - Mute/unmute button
  // - Video on/off button
  // - Speaker/earpiece toggle
  // - End call button
  // - Connection quality indicator
  // - Minimize call button
  
  // State Management:
  // - Call connection state
  // - Audio/video device state
  // - Network quality monitoring
  // - Call duration timer
  
  // Integration:
  // - Agora SDK or Twilio
  // - Token refresh
}
```

### 1.4 Post-Consultation Screens

#### Prescription View Screen
```dart
// Screen: PrescriptionDetailScreen
// Route: /prescriptions/:id
// State: PrescriptionNotifier

class PrescriptionDetailScreen extends ConsumerWidget {
  // UI Components:
  // - Doctor info header
  // - Prescription date
  // - Medicine list with:
  //   - Name
  //   - Dosage
  //   - Frequency
  //   - Duration
  //   - Instructions
  // - General instructions
  // - Download/print button
  // - Share button
  // - Pharmacy finder button (future)
  
  // State Management:
  // - PDF generation state
  // - Share intent handling
  
  // API Calls:
  // - GET /api/mobile/prescriptions/:id
}
```

#### Prescription List Screen
```dart
// Screen: PrescriptionListScreen
// Route: /prescriptions
// State: PrescriptionListNotifier

class PrescriptionListScreen extends ConsumerWidget {
  // UI Components:
  // - Tab bar: Active | Past
  // - Prescription cards:
  //   - Doctor name
  //   - Animal name
  //   - Date
  //   - Medicine count
  //   - Status badge
  // - Search/filter
  // - Empty state
  
  // API Calls:
  // - GET /api/mobile/prescriptions
}
```

#### Follow-up Management Screen
```dart
// Screen: FollowupListScreen
// Route: /followups
// State: FollowupListNotifier

class FollowupListScreen extends ConsumerWidget {
  // UI Components:
  // - Calendar view (optional)
  // - Upcoming follow-ups list
  // - Past follow-ups list
  // - Follow-up cards:
  //   - Date/time
  //   - Animal
  //   - Doctor
  //   - Type
  //   - Status
  // - Reschedule button
  // - Cancel button
  // - Add to calendar button
  
  // State Management:
  // - Date/time picker
  // - Reschedule confirmation
  
  // API Calls:
  // - GET /api/mobile/followups/upcoming
  // - POST /api/mobile/followups/:id/reschedule
}
```

### 1.5 Animal & History Screens

#### Animal Profile Screen
```dart
// Screen: AnimalProfileScreen
// Route: /animals/:id
// State: AnimalProfileNotifier

class AnimalProfileScreen extends ConsumerWidget {
  // UI Components:
  // - Animal photo (editable)
  // - Basic info card
  // - Medical history summary
  // - Vaccination records
  // - Recent consultations list
  // - Edit button
  // - Delete button
  
  // API Calls:
  // - GET /api/mobile/animals/:id
  // - GET /api/doctor/animals/:id/history
}
```

#### Medical History Screen
```dart
// Screen: MedicalHistoryScreen
// Route: /animals/:id/history
// State: MedicalHistoryNotifier

class MedicalHistoryScreen extends ConsumerWidget {
  // UI Components:
  // - Timeline view
  // - Filter chips: All | Consultations | Prescriptions | Vaccinations
  // - Event cards with icons
  // - Expandable details
  // - Search by date/doctor
  
  // API Calls:
  // - GET /api/doctor/animals/:id/history
}
```

---

## 2. Doctor App Screens

### 2.1 Doctor Dashboard

#### Doctor Home Dashboard
```dart
// Screen: DoctorDashboardScreen
// Route: /doctor/dashboard
// State: DoctorDashboardNotifier

class DoctorDashboardScreen extends ConsumerWidget {
  // UI Components:
  // - Availability toggle (big, prominent)
  // - Status indicator with color
  // - Today's stats cards:
  //   - Pending assignments
  //   - Active consultations
  //   - Completed today
  //   - Today's earnings
  // - Quick actions row:
  //   - View requests
  //   - View schedule
  //   - View earnings
  // - Recent assignments list
  // - Performance summary
  // - Notifications bell
  
  // State Management:
  // - Real-time availability sync
  // - Heartbeat timer
  // - Stats refresh
  
  // API Calls:
  // - GET /api/doctor/availability
  // - POST /api/doctor/availability/status
  // - POST /api/doctor/availability/heartbeat
  // - GET /api/doctor/earnings/summary?period=today
}
```

#### Availability Management Screen
```dart
// Screen: AvailabilityManagementScreen
// Route: /doctor/availability
// State: AvailabilityNotifier

class AvailabilityManagementScreen extends ConsumerWidget {
  // UI Components:
  // - Current status card with quick toggle
  // - Status options:
  //   - Online (Available)
  //   - Online (Limited)
  //   - Online (Emergency Only)
  //   - On Break
  //   - Offline
  // - Weekly schedule editor:
  //   - Day selection
  //   - Time range picker
  //   - Service type toggles
  //   - Max concurrent cases
  // - Exception dates (holidays)
  // - Save button
  
  // State Management:
  // - Form validation
  // - Unsaved changes warning
  // - Schedule conflict detection
  
  // API Calls:
  // - GET /api/doctor/availability/schedule
  // - PUT /api/doctor/availability/schedule
  // - POST /api/doctor/availability/exceptions
}
```

### 2.2 Assignment & Request Screens

#### Assignment Requests Screen
```dart
// Screen: AssignmentRequestsScreen
// Route: /doctor/assignments
// State: AssignmentRequestsNotifier (Stream-based)

class AssignmentRequestsScreen extends ConsumerWidget {
  // UI Components:
  // - Incoming request banner (overlay when new)
  // - Request cards with:
  //   - Priority badge
  //   - Emergency indicator
  //   - Distance
  //   - Estimated earning
  //   - Animal type & breed
  //   - Customer area
  //   - Countdown timer
  // - Accept/Reject buttons
  // - Swipe to dismiss
  
  // State Management:
  // - Real-time request stream
  // - Auto-expire handling
  // - Sound/vibration on new request
  // - Accept loading state
  
  // API Calls:
  // - GET /api/doctor/assignments/available
  // - POST /api/doctor/assignments/:id/accept
  // - POST /api/doctor/assignments/:id/reject
  // - WebSocket: /ws/assignments
}
```

#### My Cases Screen
```dart
// Screen: DoctorCasesScreen
// Route: /doctor/cases
// State: DoctorCasesNotifier

class DoctorCasesScreen extends ConsumerWidget {
  // UI Components:
  // - Tab bar: New | Active | Completed
  // - Case cards:
  //   - Status badge
  //   - Animal info
  //   - Customer location
  //   - Scheduled time
  //   - Action buttons (contextual)
  // - Pull-to-refresh
  // - Search/filter
  
  // Actions by Status:
  // - ASSIGNED: Accept/Reject
  // - ACCEPTED: Start Consultation
  // - IN_PROGRESS: Continue/End
  // - COMPLETED: View Summary
  
  // API Calls:
  // - GET /api/doctor/service-requests
}
```

#### Case Detail Screen
```dart
// Screen: DoctorCaseDetailScreen
// Route: /doctor/cases/:id
// State: DoctorCaseDetailNotifier

class DoctorCaseDetailScreen extends ConsumerWidget {
  // UI Components:
  // - Status timeline
  // - Customer info card
  // - Animal info card
  // - Location with map
  // - Problem description
  // - Attachments grid
  // - Action buttons based on status:
  //   - Accept/Reject
  //   - Start Consultation
  //   - View Patient History
  //   - Add Examination
  //   - Add Prescription
  //   - Schedule Follow-up
  //   - Complete Case
  // - Notes section
  
  // State Management:
  // - Status-driven UI
  // - Action loading states
  // - Confirmation dialogs
  
  // API Calls:
  // - GET /api/doctor/service-requests/:id
  // - GET /api/doctor/animals/:animalId/history
  // - All action APIs
}
```

### 2.3 Consultation Screens

#### Doctor Consultation Screen
```dart
// Screen: DoctorConsultationScreen
// Route: /doctor/consultations/:id
// State: DoctorConsultationNotifier

class DoctorConsultationScreen extends ConsumerWidget {
  // UI Components:
  // - Tab bar: Chat | Examination | Prescription | Notes
  // 
  // Chat Tab:
  // - Message list
  // - Input with attachments
  // 
  // Examination Tab:
  // - Vital signs form
  // - System examination checkboxes
  // - Photo upload
  // - Save button
  // 
  // Prescription Tab:
  // - Medicine list editor
  // - Add medicine button
  // - Instructions field
  // - Preview
  // 
  // Notes Tab:
  // - Private notes
  // - Shared notes
  // 
  // Bottom bar:
  // - Consultation timer
  // - Pause/Resume
  // - End Consultation
  
  // State Management:
  // - Tab state
  // - Form auto-save
  // - Real-time chat
  // - Consultation state machine
  
  // API Calls:
  // - All consultation APIs
  // - WebSocket for chat
}
```

#### Examination Form Screen
```dart
// Screen: ExaminationFormScreen
// Route: /doctor/cases/:id/examination
// State: ExaminationFormNotifier

class ExaminationFormScreen extends ConsumerWidget {
  // UI Components:
  // - Vital signs section:
  //   - Temperature (°C)
  //   - Pulse (BPM)
  //   - Respiratory rate
  //   - Weight (kg)
  //   - Body condition score (1-9 slider)
  // - General examination:
  //   - Appearance
  //   - Skin/coat
  //   - Mucous membranes
  //   - Lymph nodes
  // - System-wise (expandable):
  //   - Digestive
  //   - Respiratory
  //   - Cardiovascular
  //   - Nervous
  //   - Musculoskeletal
  // - Abnormal findings (text)
  // - Photos section
  // - Save button
  
  // State Management:
  // - Form validation
  // - Auto-save draft
  // - Photo upload queue
  
  // API Calls:
  // - POST /api/doctor/service-requests/:id/examination
  // - POST /api/doctor/attachments/upload-url
}
```

#### Prescription Editor Screen
```dart
// Screen: PrescriptionEditorScreen
// Route: /doctor/cases/:id/prescription
// State: PrescriptionEditorNotifier

class PrescriptionEditorScreen extends ConsumerWidget {
  // UI Components:
  // - Medicine list:
  //   - Medicine name (autocomplete)
  //   - Generic name
  //   - Dosage
  //   - Frequency
  //   - Duration
  //   - Route
  //   - Instructions
  //   - Delete button
  // - Add medicine button
  // - General instructions
  // - Valid until date
  // - Preview button
  // - Save draft button
  // - Finalize button
  // - Validation errors display
  
  // State Management:
  // - Medicine search debounce
  // - Form validation
  // - Draft auto-save
  // - Finalize confirmation
  
  // API Calls:
  // - POST /api/doctor/service-requests/:id/prescriptions
  // - PATCH /api/doctor/prescriptions/:id
  // - POST /api/doctor/prescriptions/:id/finalize
}
```

### 2.4 Follow-up Screens

#### Schedule Follow-up Screen
```dart
// Screen: ScheduleFollowupScreen
// Route: /doctor/cases/:id/followup
// State: FollowupSchedulerNotifier

class ScheduleFollowupScreen extends ConsumerWidget {
  // UI Components:
  // - Follow-up type selector:
  //   - Routine check
  //   - Medication review
  //   - Wound check
  //   - Vaccination
  //   - Lab review
  //   - Custom
  // - Date/time picker
  // - Reminder settings (24h, 2h)
  // - Notes field
  // - Create service request toggle
  // - Schedule button
  
  // State Management:
  // - Date validation (must be future)
  // - Type-specific defaults
  
  // API Calls:
  // - POST /api/doctor/service-requests/:id/followups
}
```

### 2.5 Earnings & Performance Screens

#### Doctor Earnings Screen
```dart
// Screen: DoctorEarningsScreen
// Route: /doctor/earnings
// State: DoctorEarningsNotifier

class DoctorEarningsScreen extends ConsumerWidget {
  // UI Components:
  // - Period selector (week/month/year)
  // - Summary cards:
  //   - Total earnings
  //   - Consultation fees
  //   - Travel fees
  //   - Medicine commission
  // - Earnings chart
  // - Transaction list:
  //   - Date
  //   - Animal
  //   - Service type
  //   - Amount
  //   - Status
  // - Payout history button
  // - Withdraw button (future)
  
  // State Management:
  // - Period change
  // - Pagination
  
  // API Calls:
  // - GET /api/doctor/earnings/summary
  // - GET /api/doctor/earnings
}
```

#### Performance Metrics Screen
```dart
// Screen: DoctorPerformanceScreen
// Route: /doctor/performance
// State: DoctorPerformanceNotifier

class DoctorPerformanceScreen extends ConsumerWidget {
  // UI Components:
  // - Period selector
  // - Rating card (big number)
  // - Response time chart
  // - Stats grid:
  //   - Acceptance rate
  //   - Completion rate
  //   - Avg consultation time
  //   - Total consultations
  // - Ranking card:
  //   - District rank
  //   - Overall rank
  // - Comparison chart (anonymized)
  // - Tips for improvement
  
  // API Calls:
  // - GET /api/doctor/performance
}
```

---

## 3. Shared/Common Screens

### 3.1 Authentication

```dart
// LoginScreen - Existing
// OTPVerificationScreen - Existing
// ProfileSetupScreen - Existing
```

### 3.2 Notifications

```dart
// Screen: NotificationsScreen
// Route: /notifications

class NotificationsScreen extends ConsumerWidget {
  // UI Components:
  // - Notification list:
  //   - Icon by type
  //   - Title
  //   - Message
  //   - Time
  //   - Read/unread indicator
  // - Swipe to dismiss
  // - Mark all read
  // - Empty state
  
  // Types:
  // - Assignment received
  // - Assignment accepted
  // - Consultation started
  // - Prescription added
  // - Follow-up reminder
  // - Payment received
  // - System message
}
```

### 3.3 Settings

```dart
// Screen: SettingsScreen
// Route: /settings

class SettingsScreen extends ConsumerWidget {
  // UI Components:
  // - Profile section
  // - Notification preferences
  // - Language selector (future)
  // - Help & support
  // - Terms & privacy
  // - Logout
  // - App version
}
```

---

## 4. State Management Architecture

### 4.1 Riverpod Providers Structure

```dart
// Core Providers
final doctorProfileProvider = FutureProvider<DoctorProfile>((ref) async {
  final api = ref.read(apiClientProvider);
  return api.getCurrentDoctor();
});

final availabilityProvider = StreamProvider<AvailabilityStatus>((ref) {
  final ws = ref.read(websocketProvider);
  return ws.availabilityStream;
});

// Feature Notifiers
@riverpod
class DoctorDashboardNotifier extends _$DoctorDashboardNotifier {
  @override
  Future<DashboardData> build() async {
    final api = ref.read(apiClientProvider);
    return api.getDashboardData();
  }
  
  Future<void> toggleAvailability(AvailabilityStatus status) async {
    // Optimistic update
    // API call
    // Refresh
  }
}

@riverpod
class AssignmentRequestsNotifier extends _$AssignmentRequestsNotifier {
  @override
  Stream<List<AssignmentRequest>> build() {
    // WebSocket stream
    // Polling fallback
  }
  
  Future<void> acceptRequest(String requestId) async {
    // Loading state
    // API call
    // Navigation on success
  }
}

@riverpod
class ConsultationNotifier extends _$ConsultationNotifier {
  @override
  Future<ConsultationSession> build(String sessionId) async {
    // Load session
    // Connect to WebSocket
  }
  
  Future<void> sendMessage(String message) async {
    // Optimistic update
    // WebSocket send
    // Error handling with retry
  }
  
  Future<void> endConsultation() async {
    // Confirmation dialog
    // API call
    // Navigation
  }
}
```

### 4.2 Offline Support Strategy

```dart
// Offline queue for critical actions
class OfflineActionQueue {
  // Persisted to local storage
  // Retry on connectivity restore
  // Actions:
  // - Accept assignment
  // - Send chat message
  // - Update examination
  // - Save prescription
}

// Cache strategy
class CacheManager {
  // TTL-based caching
  // Cache keys:
  // - doctor_profile
  // - cases_list
  // - prescriptions
  // - earnings_summary
}
```

---

## 5. API Integration Patterns

### 5.1 HTTP Client Setup

```dart
@riverpod
ApiClient apiClient(ApiClientRef ref) {
  final dio = Dio();
  
  // Interceptors:
  // - Auth token injection
  // - Request/response logging
  // - Error handling
  // - Retry logic
  // - Offline detection
  
  return ApiClient(dio);
}

class ApiClient {
  // Standardized error handling
  // Response parsing
  // Token refresh
  // Rate limit handling
}
```

### 5.2 WebSocket Integration

```dart
@riverpod
WebSocketManager websocket(WebSocketRef ref) {
  return WebSocketManager(
    url: Config.wsUrl,
    tokenProvider: () => ref.read(authTokenProvider),
  );
}

class WebSocketManager {
  // Auto-reconnect
  // Heartbeat
  // Message routing
  // Connection state
}
```

---

## 6. UI/UX Specifications

### 6.1 Design System

```dart
// Colors
class AppColors {
  static const primary = Color(0xFF2E7D32);  // Veterinary green
  static const emergency = Color(0xFFD32F2F); // Emergency red
  static const warning = Color(0xFFF57C00);   // Warning orange
  static const success = Color(0xFF388E3C);   // Success green
  static const offline = Color(0xFF757575);   // Offline grey
  static const online = Color(0xFF4CAF50);    // Online green
  static const busy = Color(0xFFFFA000);      // Busy amber
}

// Typography
class AppTypography {
  static const headline1 = TextStyle(...);
  static const headline2 = TextStyle(...);
  static const body = TextStyle(...);
  static const caption = TextStyle(...);
}

// Spacing
class AppSpacing {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 16.0;
  static const lg = 24.0;
  static const xl = 32.0;
}
```

### 6.2 Animation Specifications

```dart
// Page transitions
const pageTransition = Duration(milliseconds: 300);

// Loading states
const shimmerDuration = Duration(milliseconds: 1500);

// Success feedback
const successAnimation = Duration(milliseconds: 500);

// Real-time indicators
const pulseAnimation = Duration(milliseconds: 1000);
```

---

## 7. Testing Requirements

### 7.1 Unit Tests

```dart
// Notifier tests
// - State transitions
// - Error handling
// - Loading states

// Service tests
// - API mocking
// - Response parsing
// - Error scenarios
```

### 7.2 Widget Tests

```dart
// Screen tests
// - Golden files for UI
// - Interaction testing
// - Accessibility

// Component tests
// - Form validation
// - Button states
// - Loading indicators
```

### 7.3 Integration Tests

```dart
// End-to-end flows
// - Complete consultation flow
// - Assignment acceptance flow
// - Offline recovery flow
```

---

## 8. Implementation Priority

### Phase 1: Foundation (Week 1-2)
- [ ] Doctor dashboard with availability toggle
- [ ] Assignment requests screen
- [ ] Case list screen
- [ ] Basic case detail

### Phase 2: Consultation (Week 3-4)
- [ ] Chat screen
- [ ] Examination form
- [ ] Prescription editor
- [ ] Consultation lifecycle

### Phase 3: Completion (Week 5-6)
- [ ] Follow-up scheduling
- [ ] Earnings screen
- [ ] Performance metrics
- [ ] Medical history

### Phase 4: Polish (Week 7-8)
- [ ] Offline support
- [ ] Push notifications
- [ ] Deep linking
- [ ] Performance optimization

---

**Version**: 1.0.0
**Last Updated**: 2026-05-28
**Status**: Ready for Implementation
