# PHASE 7 — BANGLA VOICE ASSISTANT IMPLEMENTATION

**Date:** 2026-05-21  
**Role:** Principal Conversational Systems Architect  
**Authority:** [PROJECT_FREEZE.md](./PROJECT_FREEZE.md) · Plan: [PHASE7_VOICE.md](./PHASE7_VOICE.md)

---

## Summary

Delivered an independent Bangla voice layer for farmers and low-literacy users:

1. **STT adapter** — Bangla/Banglish normalization, confidence retry (no AI calls)
2. **Voice chat orchestration** — transcript → AI Veterinary Core → TTS/transcript-first
3. **Voice navigation** — explicit Bangla/Banglish command aliases
4. **Low bandwidth modes** — FULL / LOW (16kbps) / TRANSCRIPT_ONLY
5. **Privacy** — transcript metadata only; `retainAudio: false` default
6. **Flutter contracts** — DTOs, repository, audio, queue, UX accessibility
7. **13 unit tests** + `voice:verify` gate

---

## Verification

| Gate | Command | Result |
|------|---------|--------|
| Voice tests | `npm run test -- --run src/modules/voice-assistant` | **13/13 PASS** |
| Build | `npm run build` | **PASS** |
| Voice verify | `npm run voice:verify` | **8/8 PASS** |

```
VOICE_ASSISTANT_VERIFY=PASS
VOICE_COMPLETE=YES
FREEZE_COMPLIANT=YES
```

---

## REPORT

### Created

| Component | Path |
|-----------|------|
| Module | `src/modules/voice-assistant/voice-assistant.module.ts` |
| Orchestrator | `src/modules/voice-assistant/voice-assistant.service.ts` |
| STT | `stt/bangla-normalizer.ts`, `stt/stt.adapter.ts` |
| TTS | `tts/tts.adapter.ts` |
| Navigation | `navigation/voice-navigation.engine.ts` |
| Repository | `repository/voice.repository.ts` |
| Verify | `scripts/voice-verify.ts` |
| Flutter | `pranidoctor_user/lib/core/voice/*` |

### Endpoints

| Method | Path |
|--------|------|
| POST | `/api/voice/stt` |
| POST | `/api/voice/chat` |
| POST | `/api/voice/navigation` |
| GET | `/api/voice/session?sessionId=` |

### Voice

| Module | Role |
|--------|------|
| SPEECH_TO_TEXT | Normalize utterances; streaming/upload metadata; partial transcripts |
| VOICE_CHAT | STT → AI core → transcript-first TTS; interrupt/resume |
| VOICE_NAVIGATION | OPEN_CASE, BACK, REPEAT, CANCEL, HELP |

### Flutter

| File | Purpose |
|------|---------|
| `voice_dto.dart` | STT, chat, navigation, session DTOs |
| `voice_repository_contract.dart` | HTTP paths |
| `voice_audio_contract.dart` | Microphone + compressed chunk (no background record) |
| `voice_ux_contract.dart` | Tap-to-talk, push-to-hold, waveform states, Bangla labels |

### Bandwidth

| Mode | Target |
|------|--------|
| TRANSCRIPT_ONLY | 2G — text only |
| LOW | 3G — opus 16kbps hint |
| FULL | WiFi — opus 32kbps hint |

Queue uploads + offline draft via `VoiceQueueContract`.

### Migration

| Item | Detail |
|------|--------|
| Migration | `20260521220000_phase7_voice_assistant` |
| Tables | `VoiceSession`, `VoiceTranscript`, `VoiceNavigationEvent` |
| Retention | Transcript metadata; configurable 30d default in plan |

### Blocked

| Item | Reason |
|------|--------|
| Raw audio storage (default) | Privacy policy |
| Background recording | Forbidden |
| Direct AI provider from STT | Architecture |
| External STT/TTS SDK | DEPENDENCY_FROZEN |
| Autonomous diagnosis | AI safety inherited |

### Accessibility

| Feature | Implementation |
|---------|----------------|
| Large buttons | `VoiceUxContract.largeButtonMinSize = 72` |
| Bangla labels | `labelsBn` map |
| Replay | `replayEnabled = true` |
| Transcript visibility | `transcriptVisible = true` |
| Retry hints | STT confidence fallback messages in Bangla |

---

## Compatibility

| Surface | Policy |
|---------|--------|
| `ai-veterinary-core` | Called via service only — not edited |
| Treatment / P3 modules | Unchanged |
| Legacy routes | Unchanged |
