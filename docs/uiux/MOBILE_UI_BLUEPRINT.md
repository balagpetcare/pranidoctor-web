# MOBILE UI BLUEPRINT — Prani Doctor

**Version:** 1.1.0  
**Last Updated:** 2026-05-21  
**Scope:** Complete mobile UI specifications, wireframes, interaction patterns

---

## Table of Contents

1. [Blueprint Overview](#1-blueprint-overview)
2. [Screen Specifications](#2-screen-specifications)
3. [Interaction Patterns](#3-interaction-patterns)
4. [Voice-First UI](#4-voice-first-ui)
5. [Offline UX Patterns](#5-offline-ux-patterns)
6. [Low-Literacy Design](#6-low-literacy-design)
7. [Loading UX](#7-loading-ux)
8. [Error UX](#8-error-ux)
9. [Notification UX](#9-notification-ux)
10. [AI Chat UX](#10-ai-chat-ux)
11. [Emergency UX](#11-emergency-ux)
12. [Telemedicine UX](#12-telemedicine-ux)
13. [Performance Guidelines](#13-performance-guidelines)
14. [Implementation Checklist](#14-implementation-checklist)

---

## 1. Blueprint Overview

### 1.1 Design Priorities

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DESIGN PRIORITY MATRIX                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PRIORITY 1: CRITICAL                                                           │
│  ─────────────────────                                                          │
│  • Emergency access (1-tap)                                                     │
│  • Core service request flow                                                    │
│  • Offline functionality                                                        │
│  • Bangla language support                                                      │
│                                                                                  │
│  PRIORITY 2: HIGH                                                               │
│  ─────────────────                                                              │
│  • Voice input support                                                          │
│  • Low-literacy accommodations                                                  │
│  • Animal management                                                            │
│  • Request tracking                                                             │
│                                                                                  │
│  PRIORITY 3: MEDIUM                                                             │
│  ──────────────────                                                             │
│  • AI chat assistant                                                            │
│  • Farm management                                                              │
│  • Doctor/Technician apps                                                       │
│  • Analytics & reports                                                          │
│                                                                                  │
│  PRIORITY 4: FUTURE                                                             │
│  ────────────────────                                                           │
│  • Telemedicine video                                                           │
│  • Marketplace                                                                  │
│  • Advanced analytics                                                           │
│  • Multi-language (beyond Bangla/English)                                       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Device Targets

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         TARGET DEVICES                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PRIMARY TARGET: Budget Android (80% of users)                                  │
│  ───────────────────────────────────────────────                                │
│  • Screen: 5.5" - 6.5" (720p - 1080p)                                          │
│  • RAM: 2-4 GB                                                                  │
│  • Android: 10+ (API 29+)                                                       │
│  • Network: 2G/3G/4G, frequently offline                                        │
│  • Storage: Limited (< 2GB free)                                                │
│                                                                                  │
│  REFERENCE DEVICES:                                                             │
│  • Samsung Galaxy A13 (720 × 1600, 6.6")                                       │
│  • Xiaomi Redmi 10A (720 × 1600, 6.5")                                         │
│  • Realme C35 (1080 × 2408, 6.6")                                              │
│                                                                                  │
│  DESIGN CONSTRAINTS:                                                            │
│  ├── Max APK size: 30MB (ideally < 20MB)                                       │
│  ├── Max memory usage: 150MB                                                    │
│  ├── Startup time: < 3 seconds                                                  │
│  ├── Frame rate: 60fps (minimum 30fps)                                         │
│  └── Offline storage: < 50MB initial cache                                     │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Screen Size Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Small phone | < 360dp | Single column, compact |
| Normal phone | 360-400dp | Single column, standard |
| Large phone | 400-600dp | Single column, comfortable |
| Tablet (future) | 600dp+ | Two column, expanded |

---

## 2. Screen Specifications

### 2.1 Splash Screen

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│                         🐄                                │
│                                                            │
│                    প্রাণী ডাক্তার                           │
│                                                            │
│                    ━━━━━━░░░░░░░░                          │
│                    Loading...                              │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│                    v1.0.0                                  │
└────────────────────────────────────────────────────────────┘

SPECIFICATIONS:
├── Duration: 2 seconds max
├── Logo: Center aligned, 96dp
├── App name: 24sp, SemiBold
├── Progress: Linear, indeterminate
├── Background: Primary gradient or white
└── Version: 12sp, bottom aligned
```

### 2.2 Login Screen

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                         🐄                                │
│                    প্রাণী ডাক্তার                           │
│                                                            │
│  ────────────────────────────────────────────────────────  │
│                                                            │
│                    স্বাগতম!                                │
│              আপনার ফোন নম্বর দিন                           │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🇧🇩 +880   │   01X-XXXX-XXXX                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   ওটিপি পাঠান                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│                                                            │
│                                                            │
│  ────────────────────────────────────────────────────────  │
│                                                            │
│  চালিয়ে যাওয়ার মাধ্যমে আপনি আমাদের শর্তাবলী মেনে          │
│  নিচ্ছেন।                                                  │
│                                                            │
└────────────────────────────────────────────────────────────┘

SPECIFICATIONS:
├── Phone input: With country flag, auto-format
├── Button: Full width, 48dp height, primary color
├── Keyboard: Numeric only
├── Validation: Real-time BD phone format check
└── Error: Inline below input
```

### 2.3 OTP Screen

```
┌────────────────────────────────────────────────────────────┐
│  ←                                                         │
│                                                            │
│                    ওটিপি যাচাই                             │
│                                                            │
│         +880 1712-345-678 নম্বরে কোড পাঠানো হয়েছে         │
│                                                            │
│                                                            │
│         ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐              │
│         │ _ │ │ _ │ │ _ │ │ _ │ │ _ │ │ _ │              │
│         └───┘ └───┘ └───┘ └───┘ └───┘ └───┘              │
│                                                            │
│                                                            │
│                       ০৫:০০                                │
│                                                            │
│                  কোড পাননি?                                │
│                 পুনরায় পাঠান                               │
│                                                            │
│                                                            │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    যাচাই করুন                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘

SPECIFICATIONS:
├── OTP boxes: 6 digits (OTP_LENGTH=6), 48×56dp each (fits 6 on mobile)
├── Auto-advance on digit entry
├── Countdown: 300 seconds (5 minutes), Bangla numerals — matches OTP_EXPIRY_SECONDS
├── Resend: Disabled during OTP_RESEND_COOLDOWN_SECONDS (60s)
├── Auto-submit: When all 6 digits entered
├── Validation: `^\d{6}$` before API call
└── Error: Shake animation + red border + Bengali OTP_INVALID message
```

### 2.4 Farmer Home Screen

```
┌────────────────────────────────────────────────────────────┐
│  ≡     প্রাণী ডাক্তার              🔔 ২          👤        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🚨 জরুরি সাহায্য প্রয়োজন?            [এখনই কল করুন] │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  আমার প্রাণীরা                              সব দেখুন ▶    │
│                                                            │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐          │
│  │  🐄   │  │  🐄   │  │  🐐   │  │  ➕   │          │
│  │ লালু  │  │ কালু  │  │ ছাগু │  │ নতুন │          │
│  │  গরু  │  │  গরু  │  │ ছাগল │  │  যোগ │          │
│  └────────┘  └────────┘  └────────┘  └────────┘          │
│                                                            │
│  দ্রুত সেবা                                                │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   🩺    │  │   💉    │  │   🤖    │  │   📞    │  │
│  │ ডাক্তার │  │টেকনিশিয়ান│  │   AI   │  │ টেলিমেডি.│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                            │
│  সাম্প্রতিক অনুরোধ                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🟢 লালুর চিকিৎসা            ২৩ মে • সম্পন্ন        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🟡 ছাগুর টিকা                        চলমান         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
├────────────────────────────────────────────────────────────┤
│   🏠        🐄        ➕        📋        👤              │
│   হোম      প্রাণী     নতুন     ইতিহাস    প্রোফাইল         │
└────────────────────────────────────────────────────────────┘

SPECIFICATIONS:
├── Emergency banner: Always visible, red gradient
├── Animal carousel: Horizontal scroll, 88dp cards
├── Service grid: 2×2, 80dp cards
├── Recent list: Vertical scroll, card style
├── Bottom nav: 5 items, center FAB
├── FAB: 56dp, elevated, primary color
└── Pull to refresh: Supported
```

### 2.5 Service Request Flow - Step 1

```
┌────────────────────────────────────────────────────────────┐
│  ←     নতুন সেবা অনুরোধ                                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Step 1 of 4                                               │
│                                                            │
│  কোন সেবা প্রয়োজন?                                         │
│                                                            │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │        🩺                                           │  │
│  │      ডাক্তার                                        │  │
│  │    চিকিৎসা/পরামর্শ                                  │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │        💉                                           │  │
│  │    AI টেকনিশিয়ান                                    │  │
│  │    টিকা/কৃমিনাশক/প্রজনন                             │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   🚨                                                │  │
│  │   জরুরি সেবা                                        │  │
│  │   এখনই দরকার                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    পরবর্তী                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘

SPECIFICATIONS:
├── Progress: Step indicator with dots
├── Cards: Selectable, single selection
├── Selected state: Green border, light green bg
├── Emergency card: Red accent
├── Button: Disabled until selection
└── Animation: Card scale on tap
```

### 2.6 Service Request Flow - Step 3 (Problem Description)

```
┌────────────────────────────────────────────────────────────┐
│  ←     সমস্যা বর্ণনা                                       │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Step 3 of 4                                               │
│                                                            │
│  সমস্যা বলুন                                    🎤 ভয়েস   │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │  গরু খাচ্ছে না, দুই দিন ধরে। একটু জ্বর মনে হচ্ছে...  │  │
│  │                                                      │  │
│  │                                                      │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  সাধারণ সমস্যা:                                            │
│  [খাচ্ছে না] [জ্বর] [পায়খানা] [পা ফোলা] [দুর্বল]          │
│                                                            │
│  ছবি যোগ করুন (ঐচ্ছিক)                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │  📸    │  │  🖼️    │  │  ➕    │                    │
│  │ ক্যামেরা │  │ গ্যালারি │  │         │                    │
│  └─────────┘  └─────────┘  └─────────┘                    │
│                                                            │
│       ┌───────────────────────────────────────┐           │
│       │                                       │           │
│       │              🎤                       │           │
│       │         ভয়েসে বলুন                   │           │
│       │                                       │           │
│       └───────────────────────────────────────┘           │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    পরবর্তী                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘

SPECIFICATIONS:
├── Text area: Multi-line, 120dp min height
├── Symptom chips: Wrap layout, tappable
├── Voice button: Prominent, 64dp
├── Photo grid: Max 3 photos, 80dp each
├── Voice input: Modal overlay
└── Character count: Optional, max 500
```

---

## 3. Interaction Patterns

### 3.1 Touch Interactions

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         TOUCH INTERACTION GUIDE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  TAP                                                                            │
│  ───                                                                            │
│  • Primary action (buttons, cards, list items)                                  │
│  • Feedback: Ripple effect + scale (0.98)                                       │
│  • Duration: 150ms                                                              │
│                                                                                  │
│  LONG PRESS (500ms)                                                             │
│  ─────────────────                                                              │
│  • Context menu                                                                 │
│  • Voice input activation                                                       │
│  • Multi-select mode                                                            │
│  • Feedback: Haptic + visual highlight                                          │
│                                                                                  │
│  SWIPE HORIZONTAL                                                               │
│  ────────────────                                                               │
│  • Back navigation (left to right)                                              │
│  • Delete action (right to left on list items)                                  │
│  • Tab switching                                                                │
│                                                                                  │
│  SWIPE VERTICAL                                                                 │
│  ──────────────                                                                 │
│  • Pull to refresh (top)                                                        │
│  • Dismiss bottom sheet (down)                                                  │
│  • Scroll content                                                               │
│                                                                                  │
│  DOUBLE TAP                                                                     │
│  ──────────                                                                     │
│  • Zoom images                                                                  │
│  • Quick like/favorite (future)                                                 │
│                                                                                  │
│  PINCH                                                                          │
│  ─────                                                                          │
│  • Zoom images/maps                                                             │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Feedback Patterns

| Action | Visual | Haptic | Audio |
|--------|--------|--------|-------|
| Tap | Ripple + Scale | Light | None |
| Long Press | Highlight | Medium | None |
| Success | Green checkmark | Success | Optional chime |
| Error | Red shake | Error | None |
| Loading | Spinner/Shimmer | None | None |
| Voice start | Pulsing mic | Medium | Beep |
| Voice end | Check animation | Light | Beep |

### 3.3 Gesture Areas

```
┌────────────────────────────────────────────────────────────┐
│  ▲ Status bar - System gestures                           │
├────────────────────────────────────────────────────────────┤
│  ◄ Edge swipe back (16dp)                                 │
│                                                            │
│                                                            │
│                     CONTENT AREA                           │
│                                                            │
│               Standard gestures apply                      │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  ▼ Bottom nav - Tab switching                             │
└────────────────────────────────────────────────────────────┘
```

---

## 4. Voice-First UI

### 4.1 Voice Input States

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         VOICE INPUT STATES                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  STATE 1: IDLE                      STATE 2: LISTENING                          │
│  ┌───────────────────────┐         ┌───────────────────────┐                   │
│  │                       │         │                       │                   │
│  │         🎤            │         │     🔴 ▓▓▓▓░░         │                   │
│  │                       │         │                       │                   │
│  │    ভয়েসে বলুন         │         │      শুনছি...         │                   │
│  │                       │         │                       │                   │
│  └───────────────────────┘         └───────────────────────┘                   │
│                                                                                  │
│  STATE 3: PROCESSING                STATE 4: ERROR                              │
│  ┌───────────────────────┐         ┌───────────────────────┐                   │
│  │                       │         │                       │                   │
│  │         ⏳            │         │         ❌            │                   │
│  │                       │         │                       │                   │
│  │    প্রক্রিয়া করছি...   │         │   বুঝতে পারিনি       │                   │
│  │                       │         │   আবার বলুন          │                   │
│  └───────────────────────┘         └───────────────────────┘                   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Voice Modal Overlay

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                                                            │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │                        🎤                           │  │
│  │                                                      │  │
│  │               ━━━━▓▓▓▓░░░░━━━━                      │  │
│  │                                                      │  │
│  │                    শুনছি...                         │  │
│  │                                                      │  │
│  │   "আমার গরু খাচ্ছে না দুই দিন ধরে..."               │  │
│  │                                                      │  │
│  │                                                      │  │
│  │           ━━━━━━━━━━━━━━━━━━━━━━                    │  │
│  │                                                      │  │
│  │   [       বাতিল       ]  [       সম্পন্ন       ]    │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘

SPECIFICATIONS:
├── Background: Semi-transparent overlay (50% black)
├── Modal: White card, rounded corners (24dp)
├── Waveform: Animated, responds to audio level
├── Transcript: Real-time, scrollable
├── Buttons: Cancel (secondary), Done (primary)
└── Auto-submit: After 2 seconds of silence
```

### 4.3 Voice Command Reference

| Command (Bangla) | Action |
|------------------|--------|
| "ডাক্তার ডাকো" | Start doctor request |
| "জরুরি সাহায্য" | Open emergency |
| "আমার গরু দেখাও" | Show animal list |
| "নতুন প্রাণী যোগ করো" | Add animal |
| "AI সাথে কথা বলো" | Open AI chat |
| "বাতিল" | Cancel current action |
| "পিছনে যাও" | Go back |
| "হোম" | Go to home |

---

## 5. Offline UX Patterns

### 5.1 Offline Detection Banner

```
┌────────────────────────────────────────────────────────────┐
│  ⚠️  অফলাইন • সীমিত সুবিধা                    [আবার চেষ্টা] │
└────────────────────────────────────────────────────────────┘

SPECIFICATIONS:
├── Position: Top of screen, below app bar
├── Color: Warning yellow background
├── Height: 48dp
├── Dismiss: Auto-dismiss when online
└── Retry: Manual retry button
```

### 5.2 Offline Content Indicators

```
CACHED CONTENT                    UNAVAILABLE CONTENT
┌──────────────────────────┐     ┌──────────────────────────┐
│                          │     │  ░░░░░░░░░░░░░░░░░░░░░  │
│  Regular card with       │     │  ░░░░░░░░░░░░░░░░░░░░░  │
│  cached data             │     │  ░░░░░░░░░░░░░░░░░░░░░  │
│                          │     │                          │
│  📱 ক্যাশড ডেটা          │     │  অনলাইনে দেখুন          │
└──────────────────────────┘     └──────────────────────────┘
```

### 5.3 Offline Queue Indicator

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  🔄 ২টি পরিবর্তন সিঙ্ক হয়নি                                │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⏳ নতুন সেবা অনুরোধ                    অপেক্ষায়     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⏳ প্রাণীর তথ্য আপডেট                  অপেক্ষায়     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  নেটওয়ার্ক হলে স্বয়ংক্রিয় সিঙ্ক হবে                        │
│                                                            │
│  [            এখনই সিঙ্ক করুন            ]                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 5.4 Sync Status Animations

| State | Animation | Icon |
|-------|-----------|------|
| Pending | Pulsing | ⏳ |
| Syncing | Rotating | 🔄 |
| Success | Checkmark appear | ✅ |
| Failed | Shake | ❌ |

---

## 6. Low-Literacy Design

### 6.1 Icon-First Approach

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         LOW-LITERACY GUIDELINES                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PRINCIPLE: Icons + Voice > Text                                                │
│                                                                                  │
│  ✓ GOOD:                              ✗ AVOID:                                 │
│  ┌─────────────────┐                  ┌─────────────────┐                      │
│  │      🩺         │                  │                 │                      │
│  │    ডাক্তার      │                  │   চিকিৎসা সেবা  │                      │
│  └─────────────────┘                  │   অনুরোধ করুন  │                      │
│  (Large icon + Short label)           └─────────────────┘                      │
│                                       (Text only, no visual)                    │
│                                                                                  │
│  ICON SIZE GUIDELINES:                                                          │
│  ├── Primary actions: 48-64dp icons                                            │
│  ├── Secondary actions: 32-40dp icons                                          │
│  ├── Status indicators: 16-24dp icons                                          │
│  └── Always use filled icons (not outline)                                     │
│                                                                                  │
│  COLOR CODING:                                                                  │
│  ├── Green = Positive/Success/Go                                               │
│  ├── Red = Urgent/Emergency/Stop                                               │
│  ├── Yellow = Warning/Pending                                                  │
│  ├── Blue = Information/In Progress                                            │
│  └── Gray = Disabled/Inactive                                                  │
│                                                                                  │
│  LABEL GUIDELINES:                                                              │
│  ├── Max 2-3 words per label                                                   │
│  ├── Use common Bangla words                                                   │
│  ├── Avoid technical jargon                                                    │
│  └── Provide voice alternative                                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Status Visualization

```
STATUS CARDS WITH VISUAL PROGRESSION:

┌────────────────────────────────────────────────────────────┐
│                                                            │
│  অনুরোধের অবস্থা                                           │
│                                                            │
│      ●━━━━━━━●━━━━━━━○━━━━━━━○━━━━━━━○                    │
│      ✓       ✓       ◆                                     │
│   অনুরোধ    ডাক্তার   ডাক্তার  চিকিৎসা  সম্পন্ন           │
│   পাঠানো    পাওয়া   আসছেন     চলছে                       │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  🚗 ডাক্তার আসছেন                                  │   │
│  │                                                    │   │
│  │  ডাঃ করিম সাহেব                                   │   │
│  │  আনুমানিক সময়: ১৫ মিনিট                           │   │
│  │                                                    │   │
│  │  [    📞 কল করুন    ]  [    📍 লোকেশন    ]        │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 6.3 Simplified Inputs

```
AMOUNT INPUT (Visual):
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  পরিমাণ নির্বাচন করুন                                      │
│                                                            │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │ ৫০০ │  │১০০০ │  │২০০০ │  │৫০০০ │  │অন্য │       │
│  │  ৳   │  │  ৳   │  │  ৳   │  │  ৳   │  │     │       │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘       │
│                                                            │
└────────────────────────────────────────────────────────────┘

DATE SELECTION (Visual):
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  কবে সেবা চান?                                             │
│                                                            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │    আজ     │  │  আগামীকাল  │  │   পরের    │          │
│  │   ২১ মে   │  │   ২২ মে    │  │   সপ্তাহ   │          │
│  └────────────┘  └────────────┘  └────────────┘          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 7. Loading UX

### 7.1 Loading Patterns

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         LOADING PATTERNS                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. SKELETON LOADING (Preferred for lists/cards)                               │
│  ┌────────────────────────────────────────────────────────┐                    │
│  │  ┌─────┐  ░░░░░░░░░░░░░░░░░░░░                       │                    │
│  │  │ ░░░ │  ░░░░░░░░░░░░                               │                    │
│  │  └─────┘                                              │                    │
│  ├────────────────────────────────────────────────────────┤                    │
│  │  ┌─────┐  ░░░░░░░░░░░░░░░░░░░░                       │                    │
│  │  │ ░░░ │  ░░░░░░░░░░░░                               │                    │
│  │  └─────┘                                              │                    │
│  └────────────────────────────────────────────────────────┘                    │
│                                                                                  │
│  2. SPINNER (For quick operations < 3s)                                        │
│  ┌────────────────────────────────────────────────────────┐                    │
│  │                                                        │                    │
│  │                        ⟳                              │                    │
│  │                   লোড হচ্ছে...                         │                    │
│  │                                                        │                    │
│  └────────────────────────────────────────────────────────┘                    │
│                                                                                  │
│  3. PROGRESS BAR (For known duration)                                          │
│  ┌────────────────────────────────────────────────────────┐                    │
│  │                                                        │                    │
│  │  আপলোড হচ্ছে...                                        │                    │
│  │  ━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░  65%                  │                    │
│  │                                                        │                    │
│  └────────────────────────────────────────────────────────┘                    │
│                                                                                  │
│  4. PULL TO REFRESH                                                            │
│  ┌────────────────────────────────────────────────────────┐                    │
│  │                    ↓                                   │                    │
│  │              রিফ্রেশ করতে টানুন                         │                    │
│  │                                                        │                    │
│  │  ┌────────────────────────────────────────────────┐   │                    │
│  │  │  Content                                       │   │                    │
│  │  └────────────────────────────────────────────────┘   │                    │
│  └────────────────────────────────────────────────────────┘                    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Loading Message Guidelines

| Duration | Pattern | Message |
|----------|---------|---------|
| < 1s | None or instant | - |
| 1-3s | Spinner | "লোড হচ্ছে..." |
| 3-10s | Spinner + Message | "ডাক্তার খুঁজছি..." |
| > 10s | Progress + Message | "আপলোড হচ্ছে... 45%" |

### 7.3 Shimmer Effect Specifications

```dart
// Shimmer configuration
const shimmerBaseColor = Color(0xFFE5E7EB);    // gray-200
const shimmerHighlightColor = Color(0xFFF9FAFB); // gray-50
const shimmerDuration = Duration(milliseconds: 1500);
```

---

## 8. Error UX

### 8.1 Error Types & Handling

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ERROR HANDLING MATRIX                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ERROR TYPE          UI PATTERN              USER MESSAGE (Bangla)             │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  Network Error       Banner + Retry          "নেটওয়ার্ক সমস্যা, আবার চেষ্টা করুন"│
│                                                                                  │
│  Validation Error    Inline + Shake          "সঠিক ফোন নম্বর দিন"              │
│                                                                                  │
│  Server Error        Dialog                   "সার্ভারে সমস্যা, কিছুক্ষণ পর আবার │
│                                              চেষ্টা করুন"                       │
│                                                                                  │
│  Auth Error          Dialog + Redirect       "সেশন শেষ, আবার লগইন করুন"        │
│                                                                                  │
│  Not Found           Empty State             "কোন তথ্য পাওয়া যায়নি"           │
│                                                                                  │
│  Permission          Dialog                   "অনুমতি প্রয়োজন"                  │
│                                                                                  │
│  Payment Error       Dialog + Support        "পেমেন্ট ব্যর্থ, সাপোর্টে যোগাযোগ   │
│                                              করুন"                              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Error Screen Template

```
┌────────────────────────────────────────────────────────────┐
│  ←                                                         │
│                                                            │
│                                                            │
│                                                            │
│                                                            │
│                         😕                                │
│                                                            │
│                   কিছু ভুল হয়েছে                          │
│                                                            │
│         সার্ভারে সমস্যা হয়েছে। অনুগ্রহ করে কিছুক্ষণ        │
│              পর আবার চেষ্টা করুন।                          │
│                                                            │
│                                                            │
│           [      🔄 আবার চেষ্টা করুন      ]               │
│                                                            │
│                   সাহায্য দরকার?                           │
│                 📞 হেল্পলাইনে কল করুন                       │
│                                                            │
│                                                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 8.3 Inline Validation

```
VALID INPUT:
┌────────────────────────────────────────────────────────────┐
│  ফোন নম্বর                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  01712-345-678                                  ✓   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘

INVALID INPUT:
┌────────────────────────────────────────────────────────────┐
│  ফোন নম্বর                                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  01212-345-67                                   ✗   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ❌ সঠিক ফোন নম্বর দিন (১১ ডিজিট)                          │
└────────────────────────────────────────────────────────────┘
```

---

## 9. Notification UX

### 9.1 Notification Types

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         NOTIFICATION DESIGN                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PUSH NOTIFICATION (System)                                                     │
│  ┌───────────────────────────────────────────────────────────────────┐         │
│  │  🐄 প্রাণী ডাক্তার                                    এখনই        │         │
│  │  ডাক্তার আসছেন!                                                    │         │
│  │  ডাঃ করিম সাহেব ১৫ মিনিটের মধ্যে পৌঁছাবেন                         │         │
│  └───────────────────────────────────────────────────────────────────┘         │
│                                                                                  │
│  IN-APP NOTIFICATION (Banner)                                                   │
│  ┌───────────────────────────────────────────────────────────────────┐         │
│  │  ✓ অনুরোধ সফল হয়েছে                                              │         │
│  └───────────────────────────────────────────────────────────────────┘         │
│                                                                                  │
│  NOTIFICATION CENTER ITEM                                                       │
│  ┌───────────────────────────────────────────────────────────────────┐         │
│  │  🔴  ডাক্তার আসছেন                                   ১০ মি. আগে   │         │
│  │      ডাঃ করিম সাহেব ১৫ মিনিটের মধ্যে পৌঁছাবেন                     │         │
│  └───────────────────────────────────────────────────────────────────┘         │
│                                                                                  │
│  BADGE INDICATOR                                                                │
│  ┌───────┐                                                                      │
│  │ 🔔 3  │  Red badge with count                                               │
│  └───────┘                                                                      │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Notification Priority

| Priority | Visual | Sound | Vibrate | Wake Screen |
|----------|--------|-------|---------|-------------|
| Critical | Heads-up | Yes | Long | Yes |
| High | Banner | Yes | Short | No |
| Medium | Badge | Optional | No | No |
| Low | Silent | No | No | No |

---

## 10. AI Chat UX

### 10.1 Chat Interface

```
┌────────────────────────────────────────────────────────────┐
│  ←  AI সাহায্যকারী                        📞 ডাক্তার ডাকুন │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🤖                                                   │  │
│  │ আসসালামু আলাইকুম! আমি প্রাণী ডাক্তার AI।            │  │
│  │ আপনার প্রাণীর কোন সমস্যা? আমাকে বলুন।               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│                ┌──────────────────────────────────────────┐│
│                │ আমার গরু সকাল থেকে খাচ্ছে না            👤││
│                └──────────────────────────────────────────┘│
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🤖                                                   │  │
│  │ বুঝতে পারলাম। কয়েকটা প্রশ্ন করি:                    │  │
│  │                                                      │  │
│  │ ১. গরুর জ্বর আছে কি?                                │  │
│  │ ২. পায়খানার অবস্থা কেমন?                            │  │
│  │ ৩. পানি খাচ্ছে কি?                                  │  │
│  │                                                      │  │
│  │ [হ্যাঁ জ্বর আছে] [জ্বর নেই] [বুঝতে পারছি না]        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│                ┌──────────────────────────────────────────┐│
│                │ হ্যাঁ জ্বর আছে মনে হচ্ছে               👤││
│                └──────────────────────────────────────────┘│
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🤖 ⚠️ AI পরামর্শ                                    │  │
│  │                                                      │  │
│  │ আপনার গরুর জ্বর ও খাদ্যে অরুচি থাকতে পারে           │  │
│  │ সাধারণ জ্বর বা সংক্রমণ।                             │  │
│  │                                                      │  │
│  │ 💡 এই মুহূর্তে:                                      │  │
│  │ • গরুকে ছায়ায় রাখুন                                │  │
│  │ • পরিষ্কার পানি দিন                                 │  │
│  │                                                      │  │
│  │ [   🩺 ডাক্তার ডাকুন   ] [   আরও প্রশ্ন   ]         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐ │
│ │  লিখুন অথবা ভয়েসে বলুন...                 📷   🎤    │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 10.2 AI Disclaimer

```
┌────────────────────────────────────────────────────────────┐
│  ⚠️ গুরুত্বপূর্ণ তথ্য                                       │
│                                                            │
│  এই পরামর্শ AI দ্বারা তৈরি এবং শুধুমাত্র প্রাথমিক           │
│  ধারণার জন্য। নিশ্চিত রোগ নির্ণয় ও চিকিৎসার জন্য          │
│  অবশ্যই পশু ডাক্তারের পরামর্শ নিন।                         │
│                                                            │
│  জরুরি অবস্থায় অপেক্ষা না করে সরাসরি ডাক্তার ডাকুন।       │
│                                                            │
│                        [বুঝেছি]                            │
└────────────────────────────────────────────────────────────┘
```

---

## 11. Emergency UX

### 11.1 Emergency Button Design

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         EMERGENCY BUTTON SPECS                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  HOME SCREEN BANNER:                                                            │
│  ┌───────────────────────────────────────────────────────────────────┐         │
│  │  🚨 জরুরি সাহায্য প্রয়োজন?                      [এখনই কল করুন]  │         │
│  └───────────────────────────────────────────────────────────────────┘         │
│  • Height: 64dp                                                                 │
│  • Background: Red gradient (#DC2626 → #B91C1C)                                │
│  • Always visible at top                                                        │
│  • No dismiss option                                                            │
│                                                                                  │
│  FLOATING EMERGENCY BUTTON (On detail screens):                                │
│  ┌─────────────────┐                                                           │
│  │      🚨        │                                                           │
│  │    জরুরি       │                                                           │
│  └─────────────────┘                                                           │
│  • Size: 72dp × 72dp                                                           │
│  • Position: Bottom-right                                                       │
│  • Shadow: Elevated (level 4)                                                   │
│  • Animation: Pulse every 3 seconds                                            │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 11.2 Emergency Flow

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    🚨 জরুরি সাহায্য                        │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │               🎤 সমস্যা বলুন                         │  │
│  │          (ট্যাপ করে বলতে শুরু করুন)                  │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  অথবা দ্রুত নির্বাচন করুন:                                 │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ পেট ফোলা │  │ রক্তক্ষরণ │  │ পড়ে গেছে│  │ বাচ্চা   │  │
│  │          │  │          │  │          │  │ আটকে গেছে│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                            │
│  কোন প্রাণী?                                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │  🐄    │  │  🐐    │  │  🐔    │  │  অন্য  │     │
│  │  গরু   │  │  ছাগল  │  │  মুরগি │  │        │     │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘     │
│                                                            │
│  📍 আপনার লোকেশন: চান্দিনা, কুমিল্লা                       │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            🚨 জরুরি অনুরোধ পাঠান                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  📞 সরাসরি কল করুন: 09678-XXXXXX                          │
│                                                            │
└────────────────────────────────────────────────────────────┘

SPECIFICATIONS:
├── No multi-step flow (single screen)
├── Auto-fill location
├── Large touch targets (64dp+)
├── Voice input prominent
├── Direct call fallback always visible
└── Submit without confirmation
```

---

## 12. Telemedicine UX

### 12.1 Video Call Interface

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                      │  │
│  │                                                      │  │
│  │                                                      │  │
│  │                    👨‍⚕️                               │  │
│  │               ডাঃ করিম সাহেব                        │  │
│  │                                                      │  │
│  │                                                      │  │
│  │                                                      │  │
│  │                                                      │  │
│  │  ┌─────────────┐                                    │  │
│  │  │     👤     │  আপনি                               │  │
│  │  └─────────────┘                                    │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│         ০৫:২৩                                              │
│                                                            │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐         │
│  │   🎤   │  │   📷   │  │   🔄   │  │   ✕   │         │
│  │  মিউট  │  │ক্যামেরা │  │ ফ্লিপ  │  │  শেষ  │         │
│  └────────┘  └────────┘  └────────┘  └────────┘         │
│                                                            │
└────────────────────────────────────────────────────────────┘

SPECIFICATIONS:
├── Remote video: Full screen
├── Self video: 120×160dp, draggable
├── Controls: Bottom bar, auto-hide after 3s
├── Timer: Top-left
├── Mute indicator: Red icon when muted
└── Network indicator: Show quality
```

### 12.2 Pre-Call Checklist

```
┌────────────────────────────────────────────────────────────┐
│  ←  ভিডিও কল প্রস্তুতি                                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ডাক্তারের সাথে কল শুরু করার আগে নিশ্চিত করুন:             │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✓  ক্যামেরা কাজ করছে                               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✓  মাইক্রোফোন কাজ করছে                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ✓  পর্যাপ্ত আলো আছে                                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ⚠️  নেটওয়ার্ক: দুর্বল                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  💡 টিপস:                                                  │
│  • প্রাণীকে ক্যামেরার সামনে রাখুন                         │
│  • শান্ত জায়গায় থাকুন                                    │
│  • ভালো আলোতে থাকুন                                       │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               📹 কল শুরু করুন                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 13. Performance Guidelines

### 13.1 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| App startup | < 3s | Cold start to interactive |
| Screen transition | < 300ms | Page to page |
| Image load | < 500ms | Placeholder to image |
| List scroll | 60fps | No jank |
| Touch response | < 100ms | Tap to visual feedback |
| Memory usage | < 150MB | Peak usage |

### 13.2 Image Optimization

```
IMAGE SIZE GUIDELINES:
├── Thumbnails: 100×100px, WebP, quality 70%
├── List images: 300×300px, WebP, quality 80%
├── Detail images: 800×800px max, WebP, quality 85%
├── Full screen: 1080px max width, WebP, quality 90%
└── Always lazy load below fold

PLACEHOLDER STRATEGY:
├── Low-res blur placeholder (< 1KB)
├── Skeleton rectangle for cards
├── Animal emoji for animal avatars
└── Color placeholder matching theme
```

### 13.3 Animation Optimization

```dart
// Animation best practices
const animationGuidelines = {
  'maxDuration': Duration(milliseconds: 300),
  'useNativeDriver': true,
  'avoidJank': 'No layout changes during animation',
  'respectReducedMotion': true,
  'frameRate': 60,
};
```

---

## 14. Implementation Checklist

### 14.1 Screen Implementation Checklist

| Screen | Layout | Interactions | Offline | Voice | A11y | Bangla | Test |
|--------|--------|--------------|---------|-------|------|--------|------|
| Splash | ☐ | ☐ | ☐ | N/A | ☐ | ☐ | ☐ |
| Login | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| OTP | ☐ | ☐ | ☐ | N/A | ☐ | ☐ | ☐ |
| Profile Setup | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Farmer Home | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Animal List | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Animal Detail | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| New Request | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Request History | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Request Detail | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Emergency | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| AI Chat | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Profile | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Doctor Home | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Case Detail | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Treatment | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

### 14.2 Quality Checklist

```
PRE-RELEASE CHECKLIST:
──────────────────────

[ ] ACCESSIBILITY
    [ ] All images have alt text
    [ ] All buttons have semantic labels
    [ ] Touch targets ≥ 48dp
    [ ] Color contrast ≥ 4.5:1
    [ ] Screen reader tested

[ ] LOCALIZATION
    [ ] All strings in Bangla
    [ ] Date/time in Bangla format
    [ ] Numbers in Bangla numerals
    [ ] Currency in BDT format

[ ] OFFLINE
    [ ] Core features work offline
    [ ] Clear offline indicators
    [ ] Sync queue working
    [ ] Data persistence verified

[ ] PERFORMANCE
    [ ] Startup < 3s
    [ ] No memory leaks
    [ ] Smooth scrolling (60fps)
    [ ] Images optimized

[ ] ERROR HANDLING
    [ ] Network errors handled
    [ ] Validation errors shown
    [ ] Graceful degradation
    [ ] Retry mechanisms working

[ ] DEVICE TESTING
    [ ] Budget Android tested
    [ ] Different screen sizes
    [ ] Different Android versions
    [ ] Low memory conditions
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
| Screen Hierarchy | `docs/uiux/SCREEN_HIERARCHY.md` |
| Component System | `docs/uiux/COMPONENT_SYSTEM.md` |

---

*End of MOBILE_UI_BLUEPRINT.md*
