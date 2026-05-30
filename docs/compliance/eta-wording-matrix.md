# ETA & Guarantee Wording Matrix

**Version:** 1.0  
**Date:** 2026-05-30  
**Reference:** `LEGAL_SAFE_MESSAGING_PLAN` §4

## Mobile — implemented replacements (EN)

| Key | Before (prohibited) | After (approved) |
|-----|---------------------|------------------|
| `homeCareAiDoctorEta` | Typical response: under 1 min | Automated guidance — not a live veterinarian |
| `homeCareCallDoctorEta` | Typical response: 5–15 min | We are attempting to connect you with an available veterinarian. Response times may vary. |
| `homeCareEmergencyVisitEta` | Typical response: 15–30 min | Emergency visit requests are reviewed when possible. Not an on-demand dispatch service. |
| `homeCareVideoConsultationEta` | Typical response: 10–20 min | Online consultation depends on doctor availability. Not for life-threatening emergencies. |
| `homeCareChatEta` | Typical response: under 5 min | Support response times may vary. Not emergency veterinary care. |
| `homeCareNearestServiceEta` | Based on your location | Service availability depends on your location and capacity |
| `homeInstantCareTitle` | Instant care | Urgent care options |
| `homeInstantCareSubtitle` | Choose the fastest way to get help. | Choose how you want to seek help. Availability is not guaranteed. |
| `emergencyAvailable` | Emergency available | Accepts emergency requests (when available) |
| `searchEmergencySubtitle` | Emergency doctors and services | Doctors who may accept emergency requests |
| `aiSymptomGuidanceNote` | _(new)_ | Guidance only — not a diagnosis. Response and booking times may vary. |

## Mobile — Bengali (BN)

Curated overrides in `pranidoctor_user/tool/i18n/build_localization.dart` (`_keyOverrides`). Regenerate with:

```bash
dart run tool/i18n/build_localization.dart
```

## Channels — no change required (already compliant)

| Channel | Example | Notes |
|---------|---------|-------|
| In-app notification | “Doctor accepted your request” | Factual status |
| SMS | “Your request (…) was submitted” | No ETA |
| OTP SMS | Verification code only | N/A |

## Prohibited patterns (admin CMS validator)

Validated on save for emergency limitation, vet disclaimer, AI disclaimer, AI escalation disclosure:

- `typical response`, `within N min`, `under N min`, `N–M min`
- `will arrive in`, `will respond within`, `estimated response time`
- Positive `guarantee` / `guaranteed` / `assured` / `promise` (negated forms allowed)
- `fastest way`, `instant vet`, `on-demand emergency clinic`
- `team dispatched`, `we are sending`

Implementation: `pranidoctor-backend/src/shared/compliance/messaging-compliance.ts`

## API contract

Per implementation scope: **no API contract file changes** in this release. Integrators must not rely on aspirational ETA fields documented elsewhere until explicitly shipped in DTOs.
