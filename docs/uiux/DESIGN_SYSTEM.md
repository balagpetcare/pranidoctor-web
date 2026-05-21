# DESIGN SYSTEM — Prani Doctor Mobile

**Version:** 1.0.0  
**Last Updated:** 2026-05-21  
**Scope:** Design tokens, typography, colors, spacing, icons, accessibility

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Design Tokens](#2-design-tokens)
3. [Color System](#3-color-system)
4. [Typography System](#4-typography-system)
5. [Spacing System](#5-spacing-system)
6. [Icon Strategy](#6-icon-strategy)
7. [Elevation & Shadows](#7-elevation--shadows)
8. [Border & Radius](#8-border--radius)
9. [Motion & Animation](#9-motion--animation)
10. [Accessibility](#10-accessibility)
11. [Dark Mode Strategy](#11-dark-mode-strategy)
12. [Flutter Implementation](#12-flutter-implementation)

---

## 1. Design Philosophy

### 1.1 Core Principles

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DESIGN PHILOSOPHY                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  1. BANGLA-FIRST                                                    │       │
│  │     • Primary language is Bengali (বাংলা)                           │       │
│  │     • All UI text defaults to Bangla                                │       │
│  │     • Bangla-optimized typography                                   │       │
│  │     • Right-to-Left (RTL) not needed (Bangla is LTR)               │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  2. LOW-LITERACY FRIENDLY                                           │       │
│  │     • Icons + Voice > Text wherever possible                        │       │
│  │     • Large touch targets (min 48dp)                                │       │
│  │     • Visual hierarchy over text density                            │       │
│  │     • Color-coded status indicators                                 │       │
│  │     • Consistent iconography                                        │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  3. RURAL USABILITY                                                 │       │
│  │     • Works on low-end devices (2GB RAM)                           │       │
│  │     • Optimized for slow networks (2G/3G)                          │       │
│  │     • Sunlight-readable contrast                                    │       │
│  │     • One-handed operation                                         │       │
│  │     • Offline-first experience                                      │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  4. VOICE-FIRST PREPARATION                                         │       │
│  │     • Every input supports voice alternative                        │       │
│  │     • Visual feedback for voice commands                            │       │
│  │     • Voice button prominently placed                               │       │
│  │     • Confirmations via voice + visual                              │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  5. EMERGENCY PRIORITY                                              │       │
│  │     • Emergency actions always visible                              │       │
│  │     • One-tap emergency access                                      │       │
│  │     • High contrast emergency indicators                            │       │
│  │     • No confirmation for emergencies                               │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Target Devices

| Device Class | RAM | Screen | Priority |
|--------------|-----|--------|----------|
| Budget Android | 2-3GB | 5.5"-6" HD | Primary |
| Mid-range Android | 4-6GB | 6"-6.5" FHD | Secondary |
| iOS (iPhone) | 4GB+ | 5.4"-6.7" | Tertiary |

### 1.3 Design Constraints

| Constraint | Specification |
|------------|---------------|
| Min touch target | 48dp × 48dp |
| Min font size | 14sp (Bangla), 12sp (numbers) |
| Max line length | 45 characters (Bangla) |
| Min contrast ratio | 4.5:1 (text), 3:1 (large text) |
| Animation duration | <300ms (respect reduced motion) |

---

## 2. Design Tokens

### 2.1 Token Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         TOKEN HIERARCHY                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PRIMITIVE TOKENS (Base Values)                                                 │
│  ──────────────────────────────                                                 │
│  Raw values: colors, sizes, fonts                                               │
│  Example: green-500: #22C55E                                                    │
│                                                                                  │
│                    │                                                             │
│                    ▼                                                             │
│                                                                                  │
│  SEMANTIC TOKENS (Meaning)                                                      │
│  ─────────────────────────                                                      │
│  Purpose-based mapping                                                          │
│  Example: color-success: green-500                                              │
│                                                                                  │
│                    │                                                             │
│                    ▼                                                             │
│                                                                                  │
│  COMPONENT TOKENS (Specific Use)                                                │
│  ──────────────────────────────                                                 │
│  Component-level decisions                                                      │
│  Example: button-primary-bg: color-primary                                      │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Token Naming Convention

```
[category]-[property]-[variant]-[state]

Examples:
- color-text-primary
- color-text-primary-disabled
- spacing-md
- radius-lg
- font-size-lg
- font-weight-bold
```

---

## 3. Color System

### 3.1 Brand Colors

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         BRAND COLORS                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PRIMARY GREEN (প্রাণী/Nature)                                                   │
│  ────────────────────────────                                                   │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                            │
│  │ 50    │ │ 100   │ │ 500   │ │ 700   │ │ 900   │                            │
│  │#F0FDF4│ │#DCFCE7│ │#22C55E│ │#15803D│ │#14532D│                            │
│  │       │ │       │ │PRIMARY│ │       │ │       │                            │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘                            │
│                                                                                  │
│  SECONDARY BROWN (মাটি/Earth)                                                   │
│  ──────────────────────────                                                     │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                            │
│  │ 50    │ │ 100   │ │ 500   │ │ 700   │ │ 900   │                            │
│  │#FEFCE8│ │#FEF9C3│ │#A16207│ │#854D0E│ │#713F12│                            │
│  │       │ │       │ │SECOND.│ │       │ │       │                            │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘                            │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Semantic Colors

```dart
// lib/theme/colors.dart

class AppColors {
  // Primary
  static const primary = Color(0xFF22C55E);
  static const primaryLight = Color(0xFFDCFCE7);
  static const primaryDark = Color(0xFF15803D);
  
  // Secondary
  static const secondary = Color(0xFFA16207);
  static const secondaryLight = Color(0xFFFEF9C3);
  static const secondaryDark = Color(0xFF854D0E);
  
  // Status Colors
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const error = Color(0xFFEF4444);
  static const info = Color(0xFF3B82F6);
  
  // Emergency
  static const emergency = Color(0xFFDC2626);
  static const emergencyLight = Color(0xFFFEE2E2);
  static const emergencyDark = Color(0xFF991B1B);
  
  // Urgency Levels
  static const urgencyCritical = Color(0xFFDC2626);
  static const urgencyHigh = Color(0xFFF97316);
  static const urgencyMedium = Color(0xFFF59E0B);
  static const urgencyLow = Color(0xFF22C55E);
  
  // Neutral
  static const white = Color(0xFFFFFFFF);
  static const black = Color(0xFF000000);
  static const gray50 = Color(0xFFF9FAFB);
  static const gray100 = Color(0xFFF3F4F6);
  static const gray200 = Color(0xFFE5E7EB);
  static const gray300 = Color(0xFFD1D5DB);
  static const gray400 = Color(0xFF9CA3AF);
  static const gray500 = Color(0xFF6B7280);
  static const gray600 = Color(0xFF4B5563);
  static const gray700 = Color(0xFF374151);
  static const gray800 = Color(0xFF1F2937);
  static const gray900 = Color(0xFF111827);
  
  // Text
  static const textPrimary = gray900;
  static const textSecondary = gray600;
  static const textTertiary = gray400;
  static const textInverse = white;
  static const textDisabled = gray300;
  
  // Background
  static const bgPrimary = white;
  static const bgSecondary = gray50;
  static const bgTertiary = gray100;
  static const bgOverlay = Color(0x80000000); // 50% black
  
  // Border
  static const borderDefault = gray200;
  static const borderFocus = primary;
  static const borderError = error;
  
  // Surface
  static const surfaceCard = white;
  static const surfaceElevated = white;
}
```

### 3.3 Color Usage Guidelines

| Use Case | Color | When |
|----------|-------|------|
| **Primary Action** | `primary` | Main CTA buttons, active states |
| **Secondary Action** | `secondary` | Less prominent actions |
| **Success** | `success` | Completed, positive feedback |
| **Warning** | `warning` | Caution, attention needed |
| **Error** | `error` | Errors, destructive actions |
| **Emergency** | `emergency` | Emergency indicators, urgent |
| **Info** | `info` | Informational, neutral notice |

### 3.4 Status Color Mapping

```
Request Status → Color Mapping
───────────────────────────────

PENDING         → warning (yellow)
PROCESSING      → info (blue)
ASSIGNED        → primary (green)
IN_PROGRESS     → primary (green)
COMPLETED       → success (green)
CANCELLED       → gray
EMERGENCY       → emergency (red)

Urgency Level → Color Mapping
────────────────────────────

CRITICAL        → urgencyCritical (red)
HIGH            → urgencyHigh (orange)
MEDIUM          → urgencyMedium (yellow)
LOW             → urgencyLow (green)
```

---

## 4. Typography System

### 4.1 Font Stack

```dart
// lib/theme/typography.dart

class AppTypography {
  // Font Families
  static const fontFamilyPrimary = 'NotoSansBengali';    // Bangla text
  static const fontFamilySecondary = 'NotoSans';         // English/Numbers
  static const fontFamilyMono = 'RobotoMono';            // Code/Numbers
  
  // Font Weights
  static const fontWeightRegular = FontWeight.w400;
  static const fontWeightMedium = FontWeight.w500;
  static const fontWeightSemiBold = FontWeight.w600;
  static const fontWeightBold = FontWeight.w700;
}
```

### 4.2 Type Scale

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         TYPE SCALE                                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  TOKEN          SIZE    LINE HEIGHT    WEIGHT      USE CASE                     │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  displayLarge   32sp    40sp (1.25)    Bold        Hero headings                │
│  displayMedium  28sp    36sp (1.29)    Bold        Page titles                  │
│  displaySmall   24sp    32sp (1.33)    SemiBold    Section headers             │
│                                                                                  │
│  headlineLarge  22sp    28sp (1.27)    SemiBold    Card titles                 │
│  headlineMedium 20sp    26sp (1.30)    SemiBold    Subsection headers          │
│  headlineSmall  18sp    24sp (1.33)    Medium      Small headers               │
│                                                                                  │
│  titleLarge     18sp    24sp (1.33)    SemiBold    List titles                 │
│  titleMedium    16sp    22sp (1.38)    Medium      List items                  │
│  titleSmall     14sp    20sp (1.43)    Medium      Small titles                │
│                                                                                  │
│  bodyLarge      16sp    24sp (1.50)    Regular     Primary body                │
│  bodyMedium     14sp    21sp (1.50)    Regular     Secondary body              │
│  bodySmall      12sp    18sp (1.50)    Regular     Captions                    │
│                                                                                  │
│  labelLarge     14sp    20sp (1.43)    Medium      Button text                 │
│  labelMedium    12sp    16sp (1.33)    Medium      Small labels                │
│  labelSmall     10sp    14sp (1.40)    Medium      Tiny labels                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Typography Implementation

```dart
// lib/theme/typography.dart

class AppTextStyles {
  // Display styles
  static TextStyle displayLarge = TextStyle(
    fontFamily: AppTypography.fontFamilyPrimary,
    fontSize: 32,
    height: 1.25,
    fontWeight: AppTypography.fontWeightBold,
    color: AppColors.textPrimary,
  );
  
  static TextStyle displayMedium = TextStyle(
    fontFamily: AppTypography.fontFamilyPrimary,
    fontSize: 28,
    height: 1.29,
    fontWeight: AppTypography.fontWeightBold,
    color: AppColors.textPrimary,
  );
  
  static TextStyle displaySmall = TextStyle(
    fontFamily: AppTypography.fontFamilyPrimary,
    fontSize: 24,
    height: 1.33,
    fontWeight: AppTypography.fontWeightSemiBold,
    color: AppColors.textPrimary,
  );
  
  // Headline styles
  static TextStyle headlineLarge = TextStyle(
    fontFamily: AppTypography.fontFamilyPrimary,
    fontSize: 22,
    height: 1.27,
    fontWeight: AppTypography.fontWeightSemiBold,
    color: AppColors.textPrimary,
  );
  
  static TextStyle headlineMedium = TextStyle(
    fontFamily: AppTypography.fontFamilyPrimary,
    fontSize: 20,
    height: 1.30,
    fontWeight: AppTypography.fontWeightSemiBold,
    color: AppColors.textPrimary,
  );
  
  static TextStyle headlineSmall = TextStyle(
    fontFamily: AppTypography.fontFamilyPrimary,
    fontSize: 18,
    height: 1.33,
    fontWeight: AppTypography.fontWeightMedium,
    color: AppColors.textPrimary,
  );
  
  // Body styles
  static TextStyle bodyLarge = TextStyle(
    fontFamily: AppTypography.fontFamilyPrimary,
    fontSize: 16,
    height: 1.50,
    fontWeight: AppTypography.fontWeightRegular,
    color: AppColors.textPrimary,
  );
  
  static TextStyle bodyMedium = TextStyle(
    fontFamily: AppTypography.fontFamilyPrimary,
    fontSize: 14,
    height: 1.50,
    fontWeight: AppTypography.fontWeightRegular,
    color: AppColors.textSecondary,
  );
  
  static TextStyle bodySmall = TextStyle(
    fontFamily: AppTypography.fontFamilyPrimary,
    fontSize: 12,
    height: 1.50,
    fontWeight: AppTypography.fontWeightRegular,
    color: AppColors.textTertiary,
  );
  
  // Label styles
  static TextStyle labelLarge = TextStyle(
    fontFamily: AppTypography.fontFamilyPrimary,
    fontSize: 14,
    height: 1.43,
    fontWeight: AppTypography.fontWeightMedium,
    color: AppColors.textPrimary,
  );
  
  static TextStyle labelMedium = TextStyle(
    fontFamily: AppTypography.fontFamilyPrimary,
    fontSize: 12,
    height: 1.33,
    fontWeight: AppTypography.fontWeightMedium,
    color: AppColors.textSecondary,
  );
  
  static TextStyle labelSmall = TextStyle(
    fontFamily: AppTypography.fontFamilyPrimary,
    fontSize: 10,
    height: 1.40,
    fontWeight: AppTypography.fontWeightMedium,
    color: AppColors.textTertiary,
  );
}
```

### 4.4 Bangla Typography Guidelines

| Guideline | Rule |
|-----------|------|
| Min font size | 14sp for body text |
| Line height | 1.5x or more for readability |
| Letter spacing | 0 (Bangla doesn't need tracking) |
| Word spacing | Standard (Bangla uses inherent spacing) |
| Max width | 45 characters per line |
| Alignment | Left align (Bangla is LTR) |

---

## 5. Spacing System

### 5.1 Spacing Scale

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SPACING SCALE                                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  TOKEN      VALUE     PIXELS    USE CASE                                        │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  none       0         0px       No spacing                                      │
│  xxxs       2         2px       Hairline spacing                                │
│  xxs        4         4px       Tight spacing, icons                            │
│  xs         8         8px       Related elements                                │
│  sm         12        12px      Component internal padding                      │
│  md         16        16px      Standard spacing                                │
│  lg         20        20px      Section spacing                                 │
│  xl         24        24px      Card padding                                    │
│  xxl        32        32px      Section dividers                                │
│  xxxl       48        48px      Major sections                                  │
│  huge       64        64px      Page-level spacing                              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Spacing Implementation

```dart
// lib/theme/spacing.dart

class AppSpacing {
  static const double none = 0;
  static const double xxxs = 2;
  static const double xxs = 4;
  static const double xs = 8;
  static const double sm = 12;
  static const double md = 16;
  static const double lg = 20;
  static const double xl = 24;
  static const double xxl = 32;
  static const double xxxl = 48;
  static const double huge = 64;
  
  // Insets (EdgeInsets helpers)
  static const allNone = EdgeInsets.zero;
  static const allXxs = EdgeInsets.all(xxs);
  static const allXs = EdgeInsets.all(xs);
  static const allSm = EdgeInsets.all(sm);
  static const allMd = EdgeInsets.all(md);
  static const allLg = EdgeInsets.all(lg);
  static const allXl = EdgeInsets.all(xl);
  
  // Horizontal
  static const horizontalXs = EdgeInsets.symmetric(horizontal: xs);
  static const horizontalMd = EdgeInsets.symmetric(horizontal: md);
  static const horizontalLg = EdgeInsets.symmetric(horizontal: lg);
  static const horizontalXl = EdgeInsets.symmetric(horizontal: xl);
  
  // Vertical
  static const verticalXs = EdgeInsets.symmetric(vertical: xs);
  static const verticalMd = EdgeInsets.symmetric(vertical: md);
  static const verticalLg = EdgeInsets.symmetric(vertical: lg);
  
  // Screen padding (safe area aware)
  static const screenPadding = EdgeInsets.symmetric(horizontal: md, vertical: lg);
  static const screenPaddingHorizontal = EdgeInsets.symmetric(horizontal: md);
}
```

### 5.3 Layout Grid

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         LAYOUT GRID                                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  MOBILE GRID (360dp - 428dp)                                                    │
│  ──────────────────────────                                                     │
│  Columns: 4                                                                     │
│  Margin: 16dp                                                                   │
│  Gutter: 16dp                                                                   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐      │
│  │                                                                      │      │
│  │  ├─16dp─┼─ Col 1 ─┼─16dp─┼─ Col 2 ─┼─16dp─┼─ Col 3 ─┼─16dp─┼─ Col 4 ─┼─16dp─┤│
│  │                                                                      │      │
│  └──────────────────────────────────────────────────────────────────────┘      │
│                                                                                  │
│  TABLET GRID (600dp+)                                                           │
│  ────────────────────                                                           │
│  Columns: 8                                                                     │
│  Margin: 24dp                                                                   │
│  Gutter: 24dp                                                                   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Icon Strategy

### 6.1 Icon Library

```dart
// Primary: Material Symbols (Rounded)
// Secondary: Custom icons for animals
// Fallback: Material Icons

class AppIcons {
  // Navigation
  static const home = Icons.home_rounded;
  static const back = Icons.arrow_back_rounded;
  static const menu = Icons.menu_rounded;
  static const close = Icons.close_rounded;
  static const more = Icons.more_vert_rounded;
  
  // Actions
  static const add = Icons.add_rounded;
  static const edit = Icons.edit_rounded;
  static const delete = Icons.delete_rounded;
  static const search = Icons.search_rounded;
  static const filter = Icons.filter_list_rounded;
  static const refresh = Icons.refresh_rounded;
  static const share = Icons.share_rounded;
  
  // Communication
  static const call = Icons.call_rounded;
  static const message = Icons.message_rounded;
  static const notification = Icons.notifications_rounded;
  static const chat = Icons.chat_rounded;
  static const video = Icons.videocam_rounded;
  
  // Status
  static const success = Icons.check_circle_rounded;
  static const error = Icons.error_rounded;
  static const warning = Icons.warning_rounded;
  static const info = Icons.info_rounded;
  static const pending = Icons.schedule_rounded;
  
  // Medical
  static const doctor = Icons.medical_services_rounded;
  static const treatment = Icons.healing_rounded;
  static const prescription = Icons.receipt_long_rounded;
  static const emergency = Icons.emergency_rounded;
  static const vaccine = Icons.vaccines_rounded;
  
  // Animals (Custom SVG or Icon Font)
  static const cow = 'assets/icons/cow.svg';
  static const goat = 'assets/icons/goat.svg';
  static const chicken = 'assets/icons/chicken.svg';
  static const duck = 'assets/icons/duck.svg';
  static const sheep = 'assets/icons/sheep.svg';
  
  // Features
  static const voice = Icons.mic_rounded;
  static const camera = Icons.camera_alt_rounded;
  static const location = Icons.location_on_rounded;
  static const calendar = Icons.calendar_today_rounded;
  static const payment = Icons.payment_rounded;
  static const history = Icons.history_rounded;
  
  // AI
  static const ai = Icons.psychology_rounded;
  static const robot = Icons.smart_toy_rounded;
}
```

### 6.2 Icon Sizes

| Size Token | Value | Use Case |
|------------|-------|----------|
| `xs` | 16dp | Inline icons, small badges |
| `sm` | 20dp | List item icons |
| `md` | 24dp | Standard icons, buttons |
| `lg` | 32dp | Card icons, featured |
| `xl` | 40dp | Empty states, highlights |
| `xxl` | 48dp | Large buttons, hero icons |
| `huge` | 64dp | Illustrations, onboarding |

### 6.3 Animal Icon Style Guide

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ANIMAL ICONS                                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  STYLE REQUIREMENTS:                                                            │
│  • Filled style (not outline)                                                   │
│  • Rounded corners                                                              │
│  • Single color (uses theme color)                                              │
│  • Recognizable at 24dp                                                         │
│  • Simple silhouette                                                            │
│                                                                                  │
│  SUPPORTED ANIMALS:                                                             │
│                                                                                  │
│    🐄 গরু (Cow)           Primary: Holstein/Local breed silhouette             │
│    🐐 ছাগল (Goat)         Standard goat profile                                │
│    🐔 মুরগি (Chicken)     Side profile chicken                                 │
│    🦆 হাঁস (Duck)         Duck profile                                         │
│    🐑 ভেড়া (Sheep)        Sheep silhouette                                     │
│    🐃 মহিষ (Buffalo)      Water buffalo                                        │
│                                                                                  │
│  EMOJI FALLBACK:                                                                │
│  If custom icons unavailable, use emoji + background color                      │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Elevation & Shadows

### 7.1 Elevation Scale

```dart
// lib/theme/elevation.dart

class AppElevation {
  // Level 0: Flat (no shadow)
  static const level0 = <BoxShadow>[];
  
  // Level 1: Subtle lift (cards, buttons)
  static const level1 = [
    BoxShadow(
      color: Color(0x0D000000), // 5% black
      blurRadius: 3,
      offset: Offset(0, 1),
    ),
    BoxShadow(
      color: Color(0x1A000000), // 10% black
      blurRadius: 2,
      offset: Offset(0, 1),
    ),
  ];
  
  // Level 2: Cards, dropdowns
  static const level2 = [
    BoxShadow(
      color: Color(0x14000000), // 8% black
      blurRadius: 10,
      offset: Offset(0, 4),
    ),
    BoxShadow(
      color: Color(0x0D000000), // 5% black
      blurRadius: 4,
      offset: Offset(0, 2),
    ),
  ];
  
  // Level 3: Dialogs, floating buttons
  static const level3 = [
    BoxShadow(
      color: Color(0x1A000000), // 10% black
      blurRadius: 20,
      offset: Offset(0, 8),
    ),
    BoxShadow(
      color: Color(0x0F000000), // 6% black
      blurRadius: 8,
      offset: Offset(0, 4),
    ),
  ];
  
  // Level 4: Bottom sheets, modals
  static const level4 = [
    BoxShadow(
      color: Color(0x24000000), // 14% black
      blurRadius: 30,
      offset: Offset(0, 12),
    ),
    BoxShadow(
      color: Color(0x14000000), // 8% black
      blurRadius: 10,
      offset: Offset(0, 4),
    ),
  ];
}
```

### 7.2 Elevation Usage

| Elevation | Use Case | Example |
|-----------|----------|---------|
| Level 0 | Flat elements | Inline content |
| Level 1 | Interactive cards | List items, buttons |
| Level 2 | Raised cards | Content cards |
| Level 3 | Floating elements | FAB, dropdowns |
| Level 4 | Overlays | Modals, bottom sheets |

---

## 8. Border & Radius

### 8.1 Border Radius Scale

```dart
// lib/theme/radius.dart

class AppRadius {
  static const none = 0.0;
  static const xs = 4.0;     // Subtle rounding
  static const sm = 8.0;     // Buttons, inputs
  static const md = 12.0;    // Cards
  static const lg = 16.0;    // Large cards
  static const xl = 20.0;    // Bottom sheets
  static const xxl = 24.0;   // Modals
  static const full = 9999.0; // Pills, circles
  
  // BorderRadius helpers
  static final borderNone = BorderRadius.circular(none);
  static final borderXs = BorderRadius.circular(xs);
  static final borderSm = BorderRadius.circular(sm);
  static final borderMd = BorderRadius.circular(md);
  static final borderLg = BorderRadius.circular(lg);
  static final borderXl = BorderRadius.circular(xl);
  static final borderXxl = BorderRadius.circular(xxl);
  static final borderFull = BorderRadius.circular(full);
  
  // Top-only (for bottom sheets)
  static final topXl = BorderRadius.vertical(top: Radius.circular(xl));
  static final topXxl = BorderRadius.vertical(top: Radius.circular(xxl));
}
```

### 8.2 Border Width

```dart
class AppBorder {
  static const thin = 1.0;
  static const medium = 2.0;
  static const thick = 3.0;
  
  static Border defaultBorder = Border.all(
    color: AppColors.borderDefault,
    width: thin,
  );
  
  static Border focusBorder = Border.all(
    color: AppColors.borderFocus,
    width: medium,
  );
  
  static Border errorBorder = Border.all(
    color: AppColors.borderError,
    width: thin,
  );
}
```

---

## 9. Motion & Animation

### 9.1 Duration Scale

```dart
// lib/theme/animation.dart

class AppAnimation {
  // Durations
  static const instantMs = 0;
  static const fastMs = 150;
  static const normalMs = 250;
  static const slowMs = 350;
  static const verySlowMs = 500;
  
  static const instant = Duration.zero;
  static const fast = Duration(milliseconds: 150);
  static const normal = Duration(milliseconds: 250);
  static const slow = Duration(milliseconds: 350);
  static const verySlow = Duration(milliseconds: 500);
  
  // Curves
  static const curveDefault = Curves.easeInOut;
  static const curveEnter = Curves.easeOut;
  static const curveExit = Curves.easeIn;
  static const curveEmphasize = Curves.easeOutCubic;
  static const curveSpring = Curves.elasticOut;
}
```

### 9.2 Animation Guidelines

| Animation Type | Duration | Curve | Use Case |
|---------------|----------|-------|----------|
| Fade | 150ms | easeOut | Opacity changes |
| Slide | 250ms | easeInOut | Page transitions |
| Scale | 200ms | easeOut | Button press |
| Color | 200ms | easeInOut | State changes |
| Loading | 500ms+ | linear | Progress indicators |

### 9.3 Reduced Motion Support

```dart
// Always check for reduced motion preference
final bool reduceMotion = MediaQuery.of(context).disableAnimations;

Duration getAnimationDuration(Duration standard) {
  return reduceMotion ? Duration.zero : standard;
}
```

---

## 10. Accessibility

### 10.1 Accessibility Requirements

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| Color contrast | WCAG 2.1 AA (4.5:1) | All text meets ratio |
| Touch target | 48dp × 48dp minimum | All interactive elements |
| Focus visible | Clearly visible | 2dp primary border |
| Screen reader | Full support | Semantic labels |
| Font scaling | 200% support | Responsive text |
| Reduced motion | Respect preference | Check MediaQuery |

### 10.2 Semantic Labels (Bangla)

```dart
// lib/l10n/accessibility.dart

class AccessibilityLabels {
  // Navigation
  static const back = 'পিছনে যান';
  static const home = 'হোম স্ক্রিনে যান';
  static const menu = 'মেনু খুলুন';
  static const close = 'বন্ধ করুন';
  
  // Actions
  static const add = 'যোগ করুন';
  static const edit = 'সম্পাদনা করুন';
  static const delete = 'মুছে ফেলুন';
  static const submit = 'জমা দিন';
  static const cancel = 'বাতিল করুন';
  
  // Status
  static const loading = 'লোড হচ্ছে';
  static const success = 'সফল হয়েছে';
  static const error = 'ত্রুটি হয়েছে';
  
  // Emergency
  static const emergency = 'জরুরি সাহায্য';
  static const emergencyCall = 'জরুরি কল করুন';
  
  // Voice
  static const voiceInput = 'ভয়েসে বলুন';
  static const voiceListening = 'শুনছি';
}
```

### 10.3 Color Blind Support

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         COLOR BLIND CONSIDERATIONS                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  NEVER rely on color alone for meaning:                                         │
│                                                                                  │
│  ✓ CORRECT: Icon + Color + Text                                                │
│    [🟢 ✓ সম্পন্ন] (green check icon + green color + "completed" text)          │
│                                                                                  │
│  ✗ INCORRECT: Color only                                                        │
│    [🟢 ...] (just a green dot with no other indicator)                         │
│                                                                                  │
│  STATUS INDICATORS:                                                             │
│  • Always include icon + text label                                             │
│  • Use patterns for charts (stripes, dots)                                      │
│  • Ensure 3:1 contrast between adjacent colors                                  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 11. Dark Mode Strategy

### 11.1 Dark Mode Colors

```dart
// lib/theme/dark_colors.dart

class AppDarkColors {
  // Primary (stays similar, adjusted for dark)
  static const primary = Color(0xFF4ADE80);
  static const primaryLight = Color(0xFF166534);
  static const primaryDark = Color(0xFF86EFAC);
  
  // Text
  static const textPrimary = Color(0xFFF9FAFB);
  static const textSecondary = Color(0xFF9CA3AF);
  static const textTertiary = Color(0xFF6B7280);
  static const textInverse = Color(0xFF111827);
  
  // Background
  static const bgPrimary = Color(0xFF111827);
  static const bgSecondary = Color(0xFF1F2937);
  static const bgTertiary = Color(0xFF374151);
  
  // Surface
  static const surfaceCard = Color(0xFF1F2937);
  static const surfaceElevated = Color(0xFF374151);
  
  // Border
  static const borderDefault = Color(0xFF374151);
  static const borderFocus = primary;
}
```

### 11.2 Dark Mode Implementation

```dart
// lib/theme/theme.dart

ThemeData getLightTheme() => ThemeData(
  brightness: Brightness.light,
  primaryColor: AppColors.primary,
  scaffoldBackgroundColor: AppColors.bgPrimary,
  // ... rest of light theme
);

ThemeData getDarkTheme() => ThemeData(
  brightness: Brightness.dark,
  primaryColor: AppDarkColors.primary,
  scaffoldBackgroundColor: AppDarkColors.bgPrimary,
  // ... rest of dark theme
);
```

### 11.3 Dark Mode Priority

```
PRIORITY: LOW for MVP

Reason:
- Rural users often use phones in bright sunlight
- Dark mode less useful outdoors
- Focus on high contrast light mode first

FUTURE: Phase 2
- Implement after core features complete
- Test with rural user base first
```

---

## 12. Flutter Implementation

### 12.1 Theme Configuration

```dart
// lib/theme/app_theme.dart

import 'package:flutter/material.dart';
import 'colors.dart';
import 'typography.dart';
import 'spacing.dart';
import 'radius.dart';

class AppTheme {
  static ThemeData get light => ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    primaryColor: AppColors.primary,
    scaffoldBackgroundColor: AppColors.bgSecondary,
    
    colorScheme: ColorScheme.light(
      primary: AppColors.primary,
      secondary: AppColors.secondary,
      error: AppColors.error,
      background: AppColors.bgPrimary,
      surface: AppColors.surfaceCard,
      onPrimary: AppColors.textInverse,
      onSecondary: AppColors.textInverse,
      onError: AppColors.textInverse,
      onBackground: AppColors.textPrimary,
      onSurface: AppColors.textPrimary,
    ),
    
    textTheme: TextTheme(
      displayLarge: AppTextStyles.displayLarge,
      displayMedium: AppTextStyles.displayMedium,
      displaySmall: AppTextStyles.displaySmall,
      headlineLarge: AppTextStyles.headlineLarge,
      headlineMedium: AppTextStyles.headlineMedium,
      headlineSmall: AppTextStyles.headlineSmall,
      titleLarge: AppTextStyles.titleLarge,
      titleMedium: AppTextStyles.titleMedium,
      titleSmall: AppTextStyles.titleSmall,
      bodyLarge: AppTextStyles.bodyLarge,
      bodyMedium: AppTextStyles.bodyMedium,
      bodySmall: AppTextStyles.bodySmall,
      labelLarge: AppTextStyles.labelLarge,
      labelMedium: AppTextStyles.labelMedium,
      labelSmall: AppTextStyles.labelSmall,
    ),
    
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.bgPrimary,
      foregroundColor: AppColors.textPrimary,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: AppTextStyles.titleLarge,
    ),
    
    cardTheme: CardTheme(
      color: AppColors.surfaceCard,
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: AppRadius.borderMd,
      ),
    ),
    
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.textInverse,
        minimumSize: const Size(double.infinity, 48),
        padding: AppSpacing.horizontalMd,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.borderSm,
        ),
        textStyle: AppTextStyles.labelLarge,
      ),
    ),
    
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.primary,
        minimumSize: const Size(double.infinity, 48),
        padding: AppSpacing.horizontalMd,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.borderSm,
        ),
        side: BorderSide(color: AppColors.primary),
        textStyle: AppTextStyles.labelLarge,
      ),
    ),
    
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.bgPrimary,
      border: OutlineInputBorder(
        borderRadius: AppRadius.borderSm,
        borderSide: BorderSide(color: AppColors.borderDefault),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: AppRadius.borderSm,
        borderSide: BorderSide(color: AppColors.borderDefault),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: AppRadius.borderSm,
        borderSide: BorderSide(color: AppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: AppRadius.borderSm,
        borderSide: BorderSide(color: AppColors.error),
      ),
      contentPadding: AppSpacing.allMd,
      hintStyle: AppTextStyles.bodyMedium,
      labelStyle: AppTextStyles.bodyMedium,
    ),
    
    bottomNavigationBarTheme: BottomNavigationBarThemeData(
      backgroundColor: AppColors.bgPrimary,
      selectedItemColor: AppColors.primary,
      unselectedItemColor: AppColors.textTertiary,
      type: BottomNavigationBarType.fixed,
      elevation: 8,
      selectedLabelStyle: AppTextStyles.labelSmall,
      unselectedLabelStyle: AppTextStyles.labelSmall,
    ),
  );
}
```

### 12.2 File Structure

```
lib/theme/
├── app_theme.dart          # Main theme configuration
├── colors.dart             # Color definitions
├── dark_colors.dart        # Dark mode colors
├── typography.dart         # Text styles
├── spacing.dart            # Spacing constants
├── radius.dart             # Border radius
├── elevation.dart          # Shadows
├── animation.dart          # Animation constants
└── icons.dart              # Icon definitions
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Design Team | Initial release |

---

## Related Documents

| Document | Location |
|----------|----------|
| App Flow | `docs/uiux/APP_FLOW.md` |
| Screen Hierarchy | `docs/uiux/SCREEN_HIERARCHY.md` |
| Component System | `docs/uiux/COMPONENT_SYSTEM.md` |
| Mobile UI Blueprint | `docs/uiux/MOBILE_UI_BLUEPRINT.md` |

---

*End of DESIGN_SYSTEM.md*
