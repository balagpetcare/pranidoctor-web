# SCREEN HIERARCHY — Prani Doctor Mobile

**Version:** 1.0.0  
**Last Updated:** 2026-05-21  
**Scope:** Screen structure, navigation, route definitions

---

## Table of Contents

1. [Screen Hierarchy Overview](#1-screen-hierarchy-overview)
2. [Route Architecture](#2-route-architecture)
3. [Farmer App Screens](#3-farmer-app-screens)
4. [Doctor App Screens](#4-doctor-app-screens)
5. [AI Technician App Screens](#5-ai-technician-app-screens)
6. [Shared Screens](#6-shared-screens)
7. [Navigation Patterns](#7-navigation-patterns)
8. [Deep Linking](#8-deep-linking)
9. [Screen State Management](#9-screen-state-management)
10. [go_router Implementation](#10-go_router-implementation)

---

## 1. Screen Hierarchy Overview

### 1.1 Master Screen Tree

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SCREEN HIERARCHY                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ROOT                                                                           │
│  │                                                                              │
│  ├── 🔐 AUTH FLOW                                                               │
│  │   ├── Splash                                                                 │
│  │   ├── Onboarding                                                             │
│  │   ├── Language Selection                                                     │
│  │   ├── Phone Login                                                            │
│  │   ├── OTP Verification                                                       │
│  │   └── Profile Setup (multi-step)                                             │
│  │       ├── Basic Info                                                         │
│  │       ├── Location Selection                                                 │
│  │       └── Role-Specific Setup                                                │
│  │                                                                              │
│  ├── 👨‍🌾 FARMER FLOW (Role: CUSTOMER)                                           │
│  │   ├── Home (Tab: হোম)                                                        │
│  │   ├── Animals (Tab: প্রাণী)                                                   │
│  │   │   ├── Animal List                                                        │
│  │   │   ├── Animal Detail                                                      │
│  │   │   ├── Add Animal                                                         │
│  │   │   ├── Edit Animal                                                        │
│  │   │   └── Animal Health History                                              │
│  │   ├── New Request (Tab: ➕)                                                  │
│  │   │   ├── Service Type Selection                                             │
│  │   │   ├── Animal Selection                                                   │
│  │   │   ├── Problem Description                                                │
│  │   │   ├── Schedule Selection                                                 │
│  │   │   └── Confirmation                                                       │
│  │   ├── History (Tab: ইতিহাস)                                                  │
│  │   │   ├── Request List                                                       │
│  │   │   ├── Request Detail                                                     │
│  │   │   └── Request Tracking                                                   │
│  │   ├── Profile (Tab: প্রোফাইল)                                                 │
│  │   │   ├── Profile View                                                       │
│  │   │   ├── Edit Profile                                                       │
│  │   │   ├── Settings                                                           │
│  │   │   ├── Notifications                                                      │
│  │   │   └── Help & Support                                                     │
│  │   ├── Farm Management                                                        │
│  │   │   ├── Farm Dashboard                                                     │
│  │   │   ├── Dairy Management                                                   │
│  │   │   └── Fattening Management                                               │
│  │   ├── AI Chat                                                                │
│  │   ├── Emergency                                                              │
│  │   └── Telemedicine                                                           │
│  │                                                                              │
│  ├── 👨‍⚕️ DOCTOR FLOW (Role: DOCTOR)                                             │
│  │   ├── Home (Tab: হোম)                                                        │
│  │   │   ├── New Requests                                                       │
│  │   │   └── Today's Schedule                                                   │
│  │   ├── Cases (Tab: কেস)                                                       │
│  │   │   ├── Active Cases                                                       │
│  │   │   ├── Case Detail                                                        │
│  │   │   ├── Treatment Recording                                                │
│  │   │   └── Prescription                                                       │
│  │   ├── Earnings (Tab: আয়)                                                     │
│  │   │   ├── Earnings Summary                                                   │
│  │   │   └── Transaction History                                                │
│  │   ├── Reports (Tab: রিপোর্ট)                                                  │
│  │   │   └── Performance Reports                                                │
│  │   └── Profile (Tab: প্রোফাইল)                                                 │
│  │                                                                              │
│  ├── 👷 TECHNICIAN FLOW (Role: AI_TECHNICIAN)                                   │
│  │   ├── Home (Tab: হোম)                                                        │
│  │   │   ├── Today's Tasks                                                      │
│  │   │   └── Route Planning                                                     │
│  │   ├── Tasks (Tab: টাস্ক)                                                     │
│  │   │   ├── Task List                                                          │
│  │   │   ├── Task Detail                                                        │
│  │   │   └── Complete Task                                                      │
│  │   ├── Leads (Tab: লিড)                                                       │
│  │   │   ├── Lead List                                                          │
│  │   │   ├── Lead Detail                                                        │
│  │   │   └── Update Lead                                                        │
│  │   ├── Earnings (Tab: আয়)                                                     │
│  │   └── Profile (Tab: প্রোফাইল)                                                 │
│  │                                                                              │
│  └── 🔧 UTILITY SCREENS                                                         │
│      ├── Notification Center                                                    │
│      ├── Search                                                                 │
│      ├── Error Screen                                                           │
│      ├── No Network Screen                                                      │
│      └── Maintenance Screen                                                     │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Screen Count Summary

| App | Total Screens | Primary | Secondary | Utility |
|-----|---------------|---------|-----------|---------|
| Farmer | ~30 | 12 | 14 | 4 |
| Doctor | ~20 | 8 | 10 | 2 |
| Technician | ~18 | 8 | 8 | 2 |
| Shared | ~15 | 6 | 5 | 4 |

---

## 2. Route Architecture

### 2.1 Route Naming Convention

```dart
// Route naming pattern: /[role]/[feature]/[action]/[id]

// Examples:
// /farmer/animals                     - Animal list
// /farmer/animals/123                 - Animal detail (id: 123)
// /farmer/animals/123/edit            - Edit animal
// /farmer/animals/add                 - Add new animal
// /farmer/requests/new                - New request flow
// /farmer/requests/456                - Request detail
// /farmer/requests/456/track          - Track request
// /doctor/cases                       - Case list
// /doctor/cases/789                   - Case detail
// /doctor/cases/789/treatment         - Treatment recording
// /technician/leads                   - Lead list
// /technician/leads/101               - Lead detail
```

### 2.2 Route Configuration

```dart
// lib/routing/app_routes.dart

class AppRoutes {
  // Auth
  static const splash = '/';
  static const onboarding = '/onboarding';
  static const languageSelection = '/language';
  static const login = '/login';
  static const otp = '/otp';
  static const profileSetup = '/profile-setup';
  
  // Farmer Routes
  static const farmerHome = '/farmer';
  static const farmerAnimals = '/farmer/animals';
  static const farmerAnimalDetail = '/farmer/animals/:id';
  static const farmerAnimalAdd = '/farmer/animals/add';
  static const farmerAnimalEdit = '/farmer/animals/:id/edit';
  static const farmerAnimalHistory = '/farmer/animals/:id/history';
  
  static const farmerNewRequest = '/farmer/requests/new';
  static const farmerRequests = '/farmer/requests';
  static const farmerRequestDetail = '/farmer/requests/:id';
  static const farmerRequestTrack = '/farmer/requests/:id/track';
  
  static const farmerProfile = '/farmer/profile';
  static const farmerProfileEdit = '/farmer/profile/edit';
  static const farmerSettings = '/farmer/settings';
  
  static const farmerFarm = '/farmer/farm';
  static const farmerDairy = '/farmer/farm/dairy';
  static const farmerFattening = '/farmer/farm/fattening';
  
  static const farmerAiChat = '/farmer/ai-chat';
  static const farmerEmergency = '/farmer/emergency';
  static const farmerTelemedicine = '/farmer/telemedicine';
  
  // Doctor Routes
  static const doctorHome = '/doctor';
  static const doctorCases = '/doctor/cases';
  static const doctorCaseDetail = '/doctor/cases/:id';
  static const doctorTreatment = '/doctor/cases/:id/treatment';
  static const doctorPrescription = '/doctor/cases/:id/prescription';
  static const doctorEarnings = '/doctor/earnings';
  static const doctorReports = '/doctor/reports';
  static const doctorProfile = '/doctor/profile';
  
  // Technician Routes
  static const technicianHome = '/technician';
  static const technicianTasks = '/technician/tasks';
  static const technicianTaskDetail = '/technician/tasks/:id';
  static const technicianLeads = '/technician/leads';
  static const technicianLeadDetail = '/technician/leads/:id';
  static const technicianEarnings = '/technician/earnings';
  static const technicianProfile = '/technician/profile';
  
  // Shared Routes
  static const notifications = '/notifications';
  static const search = '/search';
  static const error = '/error';
  static const noNetwork = '/no-network';
  static const maintenance = '/maintenance';
  
  // Helper methods
  static String farmerAnimalDetailPath(String id) => '/farmer/animals/$id';
  static String farmerRequestDetailPath(String id) => '/farmer/requests/$id';
  static String doctorCaseDetailPath(String id) => '/doctor/cases/$id';
  static String technicianTaskDetailPath(String id) => '/technician/tasks/$id';
}
```

---

## 3. Farmer App Screens

### 3.1 Farmer Screen Details

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         FARMER APP SCREENS                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  HOME TAB                                                                        │
│  ────────                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  SCREEN: FarmerHomePage                                             │       │
│  │  ROUTE: /farmer                                                     │       │
│  │  FILE: lib/features/farmer/home/farmer_home_page.dart              │       │
│  │                                                                     │       │
│  │  Components:                                                        │       │
│  │  • EmergencyBanner                                                  │       │
│  │  • AnimalCarousel                                                   │       │
│  │  • QuickServiceGrid                                                 │       │
│  │  • RecentRequestsList                                               │       │
│  │                                                                     │       │
│  │  Navigation:                                                        │       │
│  │  → Animal Card → AnimalDetailPage                                  │       │
│  │  → Service Card → NewRequestPage                                   │       │
│  │  → Request Item → RequestDetailPage                                │       │
│  │  → Emergency Banner → EmergencyPage                                │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  ANIMALS TAB                                                                     │
│  ───────────                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  SCREEN: AnimalListPage                                             │       │
│  │  ROUTE: /farmer/animals                                             │       │
│  │  FILE: lib/features/farmer/animals/animal_list_page.dart           │       │
│  │                                                                     │       │
│  │  Components:                                                        │       │
│  │  • AnimalFilterChips (species filter)                              │       │
│  │  • AnimalGrid/List                                                  │       │
│  │  • AddAnimalFAB                                                     │       │
│  │                                                                     │       │
│  │  Sub-screens:                                                       │       │
│  │  → AnimalDetailPage (/farmer/animals/:id)                          │       │
│  │  → AddAnimalPage (/farmer/animals/add)                             │       │
│  │  → EditAnimalPage (/farmer/animals/:id/edit)                       │       │
│  │  → AnimalHealthHistoryPage (/farmer/animals/:id/history)           │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  NEW REQUEST FLOW                                                               │
│  ────────────────                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  FLOW: Multi-step wizard                                            │       │
│  │  ROUTE: /farmer/requests/new                                        │       │
│  │                                                                     │       │
│  │  Step 1: ServiceTypeSelectionPage                                   │       │
│  │    → Select Doctor/Technician/Emergency                             │       │
│  │                                                                     │       │
│  │  Step 2: AnimalSelectionPage                                        │       │
│  │    → Choose animal(s) for service                                   │       │
│  │                                                                     │       │
│  │  Step 3: ProblemDescriptionPage                                     │       │
│  │    → Voice/Text input + symptom chips + photos                      │       │
│  │                                                                     │       │
│  │  Step 4: ScheduleSelectionPage                                      │       │
│  │    → Now/Today/Schedule later                                       │       │
│  │                                                                     │       │
│  │  Step 5: RequestConfirmationPage                                    │       │
│  │    → Summary + Submit                                               │       │
│  │                                                                     │       │
│  │  Result: RequestSubmittedPage                                       │       │
│  │    → Success animation + tracking info                              │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  HISTORY TAB                                                                     │
│  ───────────                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  SCREEN: RequestHistoryPage                                         │       │
│  │  ROUTE: /farmer/requests                                            │       │
│  │  FILE: lib/features/farmer/requests/request_history_page.dart      │       │
│  │                                                                     │       │
│  │  Components:                                                        │       │
│  │  • StatusFilterTabs (সব/চলমান/সম্পন্ন)                              │       │
│  │  • RequestList                                                      │       │
│  │  • DateRangeFilter                                                  │       │
│  │                                                                     │       │
│  │  Sub-screens:                                                       │       │
│  │  → RequestDetailPage (/farmer/requests/:id)                        │       │
│  │  → RequestTrackingPage (/farmer/requests/:id/track)                │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  PROFILE TAB                                                                     │
│  ───────────                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  SCREEN: FarmerProfilePage                                          │       │
│  │  ROUTE: /farmer/profile                                             │       │
│  │  FILE: lib/features/farmer/profile/farmer_profile_page.dart        │       │
│  │                                                                     │       │
│  │  Sections:                                                          │       │
│  │  • ProfileHeader (avatar, name, phone)                              │       │
│  │  • StatsSection (animals, requests)                                 │       │
│  │  • MenuList (settings, notifications, help, logout)                 │       │
│  │                                                                     │       │
│  │  Sub-screens:                                                       │       │
│  │  → EditProfilePage (/farmer/profile/edit)                          │       │
│  │  → SettingsPage (/farmer/settings)                                 │       │
│  │  → NotificationsPage (/notifications)                              │       │
│  │  → HelpSupportPage (/help)                                         │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  SPECIAL SCREENS                                                                │
│  ───────────────                                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  SCREEN: EmergencyPage                                              │       │
│  │  ROUTE: /farmer/emergency                                           │       │
│  │  Priority: CRITICAL (no auth check delay)                           │       │
│  │                                                                     │       │
│  │  SCREEN: AiChatPage                                                 │       │
│  │  ROUTE: /farmer/ai-chat                                             │       │
│  │                                                                     │       │
│  │  SCREEN: TelemedicinePage                                           │       │
│  │  ROUTE: /farmer/telemedicine                                        │       │
│  │                                                                     │       │
│  │  SCREEN: FarmDashboardPage                                          │       │
│  │  ROUTE: /farmer/farm                                                │       │
│  │                                                                     │       │
│  │  SCREEN: DairyManagementPage                                        │       │
│  │  ROUTE: /farmer/farm/dairy                                          │       │
│  │                                                                     │       │
│  │  SCREEN: FatteningManagementPage                                    │       │
│  │  ROUTE: /farmer/farm/fattening                                      │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Farmer Navigation Structure

```dart
// Bottom navigation tabs
enum FarmerTab {
  home,      // হোম
  animals,   // প্রাণী
  newRequest,// ➕ (center FAB)
  history,   // ইতিহাস
  profile,   // প্রোফাইল
}

// Tab configuration
final farmerTabs = [
  TabConfig(
    tab: FarmerTab.home,
    label: 'হোম',
    icon: Icons.home_rounded,
    route: AppRoutes.farmerHome,
  ),
  TabConfig(
    tab: FarmerTab.animals,
    label: 'প্রাণী',
    icon: Icons.pets_rounded,
    route: AppRoutes.farmerAnimals,
  ),
  TabConfig(
    tab: FarmerTab.newRequest,
    label: 'নতুন',
    icon: Icons.add_rounded,
    route: AppRoutes.farmerNewRequest,
    isFloating: true,
  ),
  TabConfig(
    tab: FarmerTab.history,
    label: 'ইতিহাস',
    icon: Icons.history_rounded,
    route: AppRoutes.farmerRequests,
  ),
  TabConfig(
    tab: FarmerTab.profile,
    label: 'প্রোফাইল',
    icon: Icons.person_rounded,
    route: AppRoutes.farmerProfile,
  ),
];
```

---

## 4. Doctor App Screens

### 4.1 Doctor Screen Details

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DOCTOR APP SCREENS                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  HOME TAB                                                                        │
│  ────────                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  SCREEN: DoctorHomePage                                             │       │
│  │  ROUTE: /doctor                                                     │       │
│  │                                                                     │       │
│  │  Components:                                                        │       │
│  │  • OnlineStatusToggle                                               │       │
│  │  • EarningsSummaryCard                                              │       │
│  │  • NewRequestsList (with accept/decline)                            │       │
│  │  • TodayScheduleList                                                │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  CASES TAB                                                                       │
│  ─────────                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  SCREEN: CaseListPage                                               │       │
│  │  ROUTE: /doctor/cases                                               │       │
│  │                                                                     │       │
│  │  Filters: [সক্রিয়] [আজকের] [সম্পন্ন] [সব]                           │       │
│  │                                                                     │       │
│  │  Sub-screens:                                                       │       │
│  │  → CaseDetailPage (/doctor/cases/:id)                              │       │
│  │    • CustomerInfo                                                   │       │
│  │    • AnimalInfo                                                     │       │
│  │    • ProblemDescription                                             │       │
│  │    • LocationMap                                                    │       │
│  │    • ActionButtons (Navigate, Call, Start Treatment)                │       │
│  │                                                                     │       │
│  │  → TreatmentRecordingPage (/doctor/cases/:id/treatment)            │       │
│  │    • DiagnosisInput                                                 │       │
│  │    • TreatmentNotes                                                 │       │
│  │    • PrescriptionBuilder                                            │       │
│  │    • PhotoCapture                                                   │       │
│  │    • FollowUpScheduler                                              │       │
│  │                                                                     │       │
│  │  → PrescriptionPage (/doctor/cases/:id/prescription)               │       │
│  │    • MedicineSearch                                                 │       │
│  │    • DosageInput                                                    │       │
│  │    • DurationSelector                                               │       │
│  │    • PrescriptionPreview                                            │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  EARNINGS TAB                                                                    │
│  ────────────                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  SCREEN: DoctorEarningsPage                                         │       │
│  │  ROUTE: /doctor/earnings                                            │       │
│  │                                                                     │       │
│  │  Components:                                                        │       │
│  │  • EarningsSummaryCards (today, week, month)                        │       │
│  │  • TransactionList                                                  │       │
│  │  • WithdrawalButton (future)                                        │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  REPORTS TAB                                                                     │
│  ───────────                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  SCREEN: DoctorReportsPage                                          │       │
│  │  ROUTE: /doctor/reports                                             │       │
│  │                                                                     │       │
│  │  Reports:                                                           │       │
│  │  • Performance metrics                                              │       │
│  │  • Case statistics                                                  │       │
│  │  • Rating history                                                   │       │
│  │  • Response time analytics                                          │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Doctor Navigation Structure

```dart
enum DoctorTab {
  home,      // হোম
  cases,     // কেস
  earnings,  // আয়
  reports,   // রিপোর্ট
  profile,   // প্রোফাইল
}
```

---

## 5. AI Technician App Screens

### 5.1 Technician Screen Details

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         AI TECHNICIAN APP SCREENS                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  HOME TAB                                                                        │
│  ────────                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  SCREEN: TechnicianHomePage                                         │       │
│  │  ROUTE: /technician                                                 │       │
│  │                                                                     │       │
│  │  Components:                                                        │       │
│  │  • TaskProgressBar (completed/total)                                │       │
│  │  • NextTaskCard (with navigation)                                   │       │
│  │  • TodayTasksList                                                   │       │
│  │  • QuickActions (Mark arrived, Complete task)                       │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  TASKS TAB                                                                       │
│  ─────────                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  SCREEN: TaskListPage                                               │       │
│  │  ROUTE: /technician/tasks                                           │       │
│  │                                                                     │       │
│  │  Filters: [আজকের] [আগামীকাল] [এই সপ্তাহ] [সম্পন্ন]                   │       │
│  │                                                                     │       │
│  │  Sub-screens:                                                       │       │
│  │  → TaskDetailPage (/technician/tasks/:id)                          │       │
│  │    • CustomerInfo                                                   │       │
│  │    • ServiceDetails                                                 │       │
│  │    • AnimalList                                                     │       │
│  │    • NavigationButton                                               │       │
│  │    • ActionButtons                                                  │       │
│  │                                                                     │       │
│  │  → CompleteTaskPage (/technician/tasks/:id/complete)               │       │
│  │    • ServiceConfirmation                                            │       │
│  │    • PhotoCapture                                                   │       │
│  │    • NotesInput                                                     │       │
│  │    • CustomerSignature (future)                                     │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  LEADS TAB                                                                       │
│  ─────────                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  SCREEN: LeadListPage                                               │       │
│  │  ROUTE: /technician/leads                                           │       │
│  │                                                                     │       │
│  │  Filters: [নতুন] [যোগাযোগ করা] [আগ্রহী] [বুক করা] [হারানো]           │       │
│  │                                                                     │       │
│  │  Sub-screens:                                                       │       │
│  │  → LeadDetailPage (/technician/leads/:id)                          │       │
│  │    • CustomerInfo                                                   │       │
│  │    • InterestDetails                                                │       │
│  │    • CallHistory                                                    │       │
│  │    • NotesLog                                                       │       │
│  │    • StatusUpdate                                                   │       │
│  │    • BookServiceButton                                              │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  EARNINGS TAB                                                                    │
│  ────────────                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  SCREEN: TechnicianEarningsPage                                     │       │
│  │  ROUTE: /technician/earnings                                        │       │
│  │                                                                     │       │
│  │  Components:                                                        │       │
│  │  • EarningsSummary                                                  │       │
│  │  • CommissionBreakdown                                              │       │
│  │  • TransactionHistory                                               │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Shared Screens

### 6.1 Authentication Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| SplashPage | `/` | Initial load, session check |
| OnboardingPage | `/onboarding` | First-time user intro |
| LanguageSelectionPage | `/language` | বাংলা/English selection |
| PhoneLoginPage | `/login` | Phone number input |
| OtpVerificationPage | `/otp` | 6-digit OTP verify (`OTP_LENGTH=6`); 300s expiry countdown; resend after 60s cooldown |
| ProfileSetupPage | `/profile-setup` | Multi-step profile creation |

### 6.2 Utility Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| NotificationCenterPage | `/notifications` | All notifications |
| SearchPage | `/search` | Global search |
| ErrorPage | `/error` | Error display |
| NoNetworkPage | `/no-network` | Offline indicator |
| MaintenancePage | `/maintenance` | System maintenance |

### 6.3 Common Feature Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| AiChatPage | `/ai-chat` | AI assistant |
| EmergencyPage | `/emergency` | Emergency request |
| TelemedicinePage | `/telemedicine` | Video consultation |
| HelpSupportPage | `/help` | Help and FAQ |
| PaymentPage | `/payment` | Payment processing |

---

## 7. Navigation Patterns

### 7.1 Navigation Types

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         NAVIGATION PATTERNS                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. TAB NAVIGATION (Bottom Nav)                                                 │
│     • Primary navigation between main sections                                  │
│     • 4-5 tabs maximum                                                          │
│     • Center FAB for primary action (farmer)                                    │
│     • Badge indicators for notifications                                        │
│                                                                                  │
│  2. STACK NAVIGATION (Push/Pop)                                                 │
│     • Detail screens                                                            │
│     • Multi-step flows                                                          │
│     • Back button behavior                                                      │
│     • Preserve scroll position                                                  │
│                                                                                  │
│  3. MODAL NAVIGATION (Sheets)                                                   │
│     • Quick actions                                                             │
│     • Confirmations                                                             │
│     • Filters                                                                   │
│     • Short forms                                                               │
│                                                                                  │
│  4. DIALOG NAVIGATION                                                           │
│     • Alerts                                                                    │
│     • Confirmations                                                             │
│     • Quick selection                                                           │
│                                                                                  │
│  5. WIZARD NAVIGATION (Multi-step)                                              │
│     • New request flow                                                          │
│     • Profile setup                                                             │
│     • Treatment recording                                                       │
│     • Progress indicator                                                        │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Navigation Gestures

| Gesture | Action | Context |
|---------|--------|---------|
| Swipe left | Go back | Stack navigation |
| Swipe down | Dismiss | Bottom sheets, modals |
| Pull down | Refresh | Lists, feeds |
| Long press | Context menu | Cards, list items |
| Double tap | Quick action | Photos (zoom) |

### 7.3 Back Button Behavior

```dart
// Back button handling by screen type
enum BackBehavior {
  pop,           // Normal pop to previous screen
  popToRoot,     // Pop to tab root
  confirm,       // Show confirmation dialog
  saveAndPop,    // Save draft and pop
  preventPop,    // Block during critical operation
}

// Example configuration
final screenBackBehaviors = {
  AppRoutes.farmerNewRequest: BackBehavior.confirm,
  AppRoutes.doctorTreatment: BackBehavior.saveAndPop,
  AppRoutes.farmerEmergency: BackBehavior.preventPop, // During submission
};
```

---

## 8. Deep Linking

### 8.1 Deep Link Schema

```
pranidoctor://                           # App open
pranidoctor://farmer/requests/123        # Open specific request
pranidoctor://farmer/animals/456         # Open animal detail
pranidoctor://doctor/cases/789           # Open case detail
pranidoctor://emergency                  # Open emergency flow
pranidoctor://notifications              # Open notifications
```

### 8.2 Universal Links

```
https://pranidoctor.com/app/request/123
https://pranidoctor.com/app/animal/456
https://pranidoctor.com/app/case/789
```

### 8.3 Deep Link Handling

```dart
// lib/routing/deep_link_handler.dart

class DeepLinkHandler {
  static String? handleDeepLink(Uri uri) {
    final pathSegments = uri.pathSegments;
    
    if (pathSegments.isEmpty) {
      return AppRoutes.splash;
    }
    
    switch (pathSegments[0]) {
      case 'farmer':
        return _handleFarmerDeepLink(pathSegments.sublist(1));
      case 'doctor':
        return _handleDoctorDeepLink(pathSegments.sublist(1));
      case 'technician':
        return _handleTechnicianDeepLink(pathSegments.sublist(1));
      case 'emergency':
        return AppRoutes.farmerEmergency;
      case 'notifications':
        return AppRoutes.notifications;
      default:
        return AppRoutes.splash;
    }
  }
  
  static String? _handleFarmerDeepLink(List<String> segments) {
    if (segments.isEmpty) return AppRoutes.farmerHome;
    
    switch (segments[0]) {
      case 'requests':
        if (segments.length > 1) {
          return AppRoutes.farmerRequestDetailPath(segments[1]);
        }
        return AppRoutes.farmerRequests;
      case 'animals':
        if (segments.length > 1) {
          return AppRoutes.farmerAnimalDetailPath(segments[1]);
        }
        return AppRoutes.farmerAnimals;
      default:
        return AppRoutes.farmerHome;
    }
  }
}
```

---

## 9. Screen State Management

### 9.1 Screen States

```dart
// lib/core/models/screen_state.dart

enum ScreenStatus {
  initial,     // First load
  loading,     // Fetching data
  loaded,      // Data ready
  error,       // Error occurred
  empty,       // No data
  offline,     // No network
}

class ScreenState<T> {
  final ScreenStatus status;
  final T? data;
  final String? errorMessage;
  final String? errorCode;
  
  const ScreenState({
    this.status = ScreenStatus.initial,
    this.data,
    this.errorMessage,
    this.errorCode,
  });
  
  ScreenState<T> copyWith({
    ScreenStatus? status,
    T? data,
    String? errorMessage,
    String? errorCode,
  }) {
    return ScreenState<T>(
      status: status ?? this.status,
      data: data ?? this.data,
      errorMessage: errorMessage ?? this.errorMessage,
      errorCode: errorCode ?? this.errorCode,
    );
  }
  
  bool get isLoading => status == ScreenStatus.loading;
  bool get hasData => status == ScreenStatus.loaded && data != null;
  bool get hasError => status == ScreenStatus.error;
  bool get isEmpty => status == ScreenStatus.empty;
  bool get isOffline => status == ScreenStatus.offline;
}
```

### 9.2 Screen State Rendering

```dart
// lib/core/widgets/screen_state_builder.dart

class ScreenStateBuilder<T> extends StatelessWidget {
  final ScreenState<T> state;
  final Widget Function(T data) onLoaded;
  final Widget? onLoading;
  final Widget Function(String? error)? onError;
  final Widget? onEmpty;
  final Widget? onOffline;
  
  const ScreenStateBuilder({
    Key? key,
    required this.state,
    required this.onLoaded,
    this.onLoading,
    this.onError,
    this.onEmpty,
    this.onOffline,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    switch (state.status) {
      case ScreenStatus.initial:
      case ScreenStatus.loading:
        return onLoading ?? const LoadingIndicator();
      
      case ScreenStatus.loaded:
        return onLoaded(state.data as T);
      
      case ScreenStatus.error:
        return onError?.call(state.errorMessage) ?? 
               ErrorWidget(message: state.errorMessage);
      
      case ScreenStatus.empty:
        return onEmpty ?? const EmptyStateWidget();
      
      case ScreenStatus.offline:
        return onOffline ?? const OfflineWidget();
    }
  }
}
```

---

## 10. go_router Implementation

### 10.1 Router Configuration

```dart
// lib/routing/app_router.dart

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  
  return GoRouter(
    initialLocation: AppRoutes.splash,
    debugLogDiagnostics: true,
    refreshListenable: authState,
    
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      final isAuthRoute = state.matchedLocation.startsWith('/login') ||
                          state.matchedLocation.startsWith('/otp') ||
                          state.matchedLocation == '/onboarding';
      
      // Not logged in and not on auth route → redirect to login
      if (!isLoggedIn && !isAuthRoute) {
        return AppRoutes.login;
      }
      
      // Logged in and on auth route → redirect to home
      if (isLoggedIn && isAuthRoute) {
        return _getHomeRoute(authState.userRole);
      }
      
      return null; // No redirect
    },
    
    routes: [
      // Splash & Auth
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: AppRoutes.onboarding,
        builder: (context, state) => const OnboardingPage(),
      ),
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const PhoneLoginPage(),
      ),
      GoRoute(
        path: AppRoutes.otp,
        builder: (context, state) => const OtpVerificationPage(),
      ),
      
      // Farmer Shell
      ShellRoute(
        builder: (context, state, child) => FarmerShell(child: child),
        routes: [
          GoRoute(
            path: AppRoutes.farmerHome,
            builder: (context, state) => const FarmerHomePage(),
          ),
          GoRoute(
            path: AppRoutes.farmerAnimals,
            builder: (context, state) => const AnimalListPage(),
            routes: [
              GoRoute(
                path: 'add',
                builder: (context, state) => const AddAnimalPage(),
              ),
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return AnimalDetailPage(animalId: id);
                },
                routes: [
                  GoRoute(
                    path: 'edit',
                    builder: (context, state) {
                      final id = state.pathParameters['id']!;
                      return EditAnimalPage(animalId: id);
                    },
                  ),
                  GoRoute(
                    path: 'history',
                    builder: (context, state) {
                      final id = state.pathParameters['id']!;
                      return AnimalHealthHistoryPage(animalId: id);
                    },
                  ),
                ],
              ),
            ],
          ),
          GoRoute(
            path: AppRoutes.farmerNewRequest,
            builder: (context, state) => const NewRequestPage(),
          ),
          GoRoute(
            path: AppRoutes.farmerRequests,
            builder: (context, state) => const RequestHistoryPage(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final id = state.pathParameters['id']!;
                  return RequestDetailPage(requestId: id);
                },
                routes: [
                  GoRoute(
                    path: 'track',
                    builder: (context, state) {
                      final id = state.pathParameters['id']!;
                      return RequestTrackingPage(requestId: id);
                    },
                  ),
                ],
              ),
            ],
          ),
          GoRoute(
            path: AppRoutes.farmerProfile,
            builder: (context, state) => const FarmerProfilePage(),
          ),
          GoRoute(
            path: AppRoutes.farmerEmergency,
            builder: (context, state) => const EmergencyPage(),
          ),
          GoRoute(
            path: AppRoutes.farmerAiChat,
            builder: (context, state) => const AiChatPage(),
          ),
        ],
      ),
      
      // Doctor Shell (similar structure)
      // Technician Shell (similar structure)
      
      // Shared Routes
      GoRoute(
        path: AppRoutes.notifications,
        builder: (context, state) => const NotificationCenterPage(),
      ),
    ],
    
    errorBuilder: (context, state) => ErrorPage(error: state.error),
  );
});

String _getHomeRoute(UserRole? role) {
  switch (role) {
    case UserRole.customer:
      return AppRoutes.farmerHome;
    case UserRole.doctor:
      return AppRoutes.doctorHome;
    case UserRole.technician:
      return AppRoutes.technicianHome;
    default:
      return AppRoutes.login;
  }
}
```

### 10.2 Navigation Extensions

```dart
// lib/routing/navigation_extensions.dart

extension NavigationExtensions on BuildContext {
  // Go to route (replaces current)
  void goTo(String route) => GoRouter.of(this).go(route);
  
  // Push route (adds to stack)
  void pushTo(String route, {Object? extra}) => 
      GoRouter.of(this).push(route, extra: extra);
  
  // Pop current route
  void goBack() => GoRouter.of(this).pop();
  
  // Pop to root of current tab
  void popToRoot() {
    while (GoRouter.of(this).canPop()) {
      GoRouter.of(this).pop();
    }
  }
  
  // Navigate with result
  Future<T?> pushForResult<T>(String route, {Object? extra}) =>
      GoRouter.of(this).push<T>(route, extra: extra);
  
  // Pop with result
  void popWithResult<T>(T result) => GoRouter.of(this).pop(result);
}
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | UX Team | Initial release |

---

## Related Documents

| Document | Location |
|----------|----------|
| App Flow | `docs/uiux/APP_FLOW.md` |
| Design System | `docs/uiux/DESIGN_SYSTEM.md` |
| Component System | `docs/uiux/COMPONENT_SYSTEM.md` |
| Mobile UI Blueprint | `docs/uiux/MOBILE_UI_BLUEPRINT.md` |

---

*End of SCREEN_HIERARCHY.md*
