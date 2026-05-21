# PHASE 7 — BANGLA VOICE ASSISTANT

**Document type:** Conversational systems architecture plan  
**Date:** 2026-05-21  
**Authority:** [PROJECT_FREEZE.md](./PROJECT_FREEZE.md) — freeze rules **override** all work  
**Prerequisites:** [PHASE6_AI.md](./PHASE6_AI.md), [PHASE5_TREATMENT.md](./PHASE5_TREATMENT.md)  
**Implementation repo:** `pranidoctor-backend/src/modules/voice-assistant/` (**new**, independent voice layer)

**Principle:** Voice is a **transport + orchestration layer**. STT/TTS adapters are **decoupled** from AI providers. AI is invoked only via frozen **AI Veterinary Core** orchestration — never directly from STT.

---

## Freeze Validation

```
DATABASE_FROZEN=true
API_FROZEN=true
MIGRATION_FROZEN=true   (additive only)
DEPENDENCY_FROZEN=true
```

| Gate | Status | Notes |
|------|--------|-------|
| `modules/ai-veterinary-core/**` | **BLOCKED** (edit) | P6 frozen — call `getAiVeterinaryCoreService()` only |
| `modules/auth/**`, frozen P3/P5 | **BLOCKED** (edit) | Delegation only |
| `legacy/web/routes/**` | **BLOCKED** (edit) | Compat unchanged |
| New `modules/voice-assistant/**` | **ALLOWED** | Voice layer |
| Mount `/api/voice/*` | **ALLOWED** | Foundation `{ success, data }` |
| Additive Prisma models | **ALLOWED** | Session + transcript metadata |
| External STT/TTS SDK | **BLOCKED** | Adapter + normalizer stub |
| Raw audio storage (default) | **BLOCKED** | Transcript metadata only |
| Background recording | **BLOCKED** | Explicit session only |
| Autonomous diagnosis | **BLOCKED** | AI safety inherited |

---

## Modules

### SPEECH_TO_TEXT

| Field | Detail |
|-------|--------|
| **Purpose** | Normalize farmer utterances to text for downstream chat |
| **Ownership** | `VoiceTranscript`, STT adapter |
| **Boundaries** | **No AI calls** — output normalized text only |
| **Adapters** | `SttAdapter` (client transcript ingest + Bangla/Banglish normalize) |
| **Rollback** | Disable `/voice/stt`; client-side STT fallback |

### VOICE_CHAT

| Field | Detail |
|-------|--------|
| **Purpose** | Voice → transcript → AI → response → audio/transcript |
| **Ownership** | `VoiceSession` orchestration |
| **Flow** | STT record → `AiVeterinaryCoreService.chat()` → TTS adapter |
| **Boundaries** | Never auto-diagnose; low-token short answers |
| **Adapters** | TTS stub (transcript-first in low bandwidth) |
| **Rollback** | Close sessions; transcript-only mode |

### VOICE_NAVIGATION

| Field | Detail |
|-------|--------|
| **Purpose** | Spoken UI commands (open case, back, repeat, cancel, help) |
| **Ownership** | `VoiceNavigationEvent` |
| **Boundaries** | Explicit actions only — no hidden commands |
| **Adapters** | Bangla + Banglish alias table |
| **Rollback** | Disable navigation endpoint |

---

## Bangla Optimization

| Feature | Strategy |
|---------|----------|
| Bangla native | Primary locale `bn` |
| Banglish fallback | Normalizer maps common romanized tokens |
| Noisy environment | Confidence threshold + retry prompt |
| Short utterance | Min-length retry; partial transcript support |
| Rural accent | Lenient token matching; no rejection on low confidence alone |

**Confidence handling:** `< 0.45` → retry suggested · `0.45–0.69` → confirm UX · `≥ 0.70` → proceed

**Retry strategy:** Max 3 attempts per utterance slot; fallback to text input hint

**Fallback UX:** Transcript visibility + replay + large-button tap-to-talk

---

## Speech To Text

| Mode | Support |
|------|---------|
| Streaming | `partial: true` transcripts stored incrementally |
| Upload | Metadata-only (`durationMs`, `sizeBytes`, `codec`) — no blob stored |
| Output | `normalizedText`, `confidence`, `retrySuggested` |

---

## Voice Chat

```
voice → STT → normalized text → AI core chat → response → TTS/transcript
```

| Feature | Support |
|---------|---------|
| Interruption | `interrupt: true` marks session INTERRUPTED |
| Resume | `resume: true` restores ACTIVE |
| Short answers | `lowTokenMode` truncates AI reply for voice |
| Low bandwidth | `TRANSCRIPT_ONLY` skips audio payload |

---

## Voice Navigation

| Command | Bangla aliases | Action |
|---------|----------------|--------|
| open case | `কেস খুল`, `case kholo` | `OPEN_CASE` |
| back | `পিছনে`, `pichon`, `back` | `BACK` |
| repeat | `আবার`, `abar`, `repeat` | `REPEAT` |
| cancel | `বাতিল`, `cancel` | `CANCEL` |
| help | `সাহায্য`, `help` | `HELP` |

---

## Low Bandwidth Mode

| Mode | Behavior |
|------|----------|
| `FULL` | Transcript + optional audio hint |
| `LOW` | Compressed audio metadata; shorter responses |
| `TRANSCRIPT_ONLY` | Text only — targets 2G/3G/weak WiFi |

Features: adaptive bitrate hints · queued upload metadata · offline draft contract (Flutter)

---

## API Contract

**Base path:** `/api/voice` · **Auth:** `authMobile`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/stt` | Normalize utterance / partial transcript |
| POST | `/chat` | Voice chat orchestration |
| POST | `/navigation` | Spoken navigation command |
| GET | `/session` | Session state + transcripts |

---

## Flutter Integration

**Path:** `pranidoctor_user/lib/core/voice/`

| File | Purpose |
|------|---------|
| `voice_dto.dart` | STT, chat, navigation, session DTOs |
| `voice_repository_contract.dart` | HTTP contract |
| `voice_audio_contract.dart` | Microphone + codec abstraction |
| `voice_queue_contract.dart` | Offline upload queue |
| `voice_ux_contract.dart` | Tap-to-talk, push-to-hold, waveform states |

---

## Privacy

| Stored | Not stored (default) |
|--------|----------------------|
| Transcript metadata | Raw audio blobs |
| Confidence, duration, size | Provider internals |
| Navigation audit | Forced uploads |

**Retention:** configurable via `Setting` key `voice.transcript_retention_days` (default 30)

---

## Verification

```bash
npm run test -- --run src/modules/voice-assistant
npm run build
npm run voice:verify
```

---

**Next:** [PHASE7_VOICE_IMPLEMENTATION.md](./PHASE7_VOICE_IMPLEMENTATION.md)
