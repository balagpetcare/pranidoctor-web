# EMERGENCY ENGINE — Prani Doctor AI

**Version:** 1.0.0  
**Last Updated:** 2026-05-21  
**Scope:** Emergency detection, medical triage, escalation protocols

---

## Table of Contents

1. [Emergency System Overview](#1-emergency-system-overview)
2. [Emergency Detection](#2-emergency-detection)
3. [Medical Triage Pipeline](#3-medical-triage-pipeline)
4. [Urgency Classification](#4-urgency-classification)
5. [Escalation Protocols](#5-escalation-protocols)
6. [Provider Assignment](#6-provider-assignment)
7. [Alert System](#7-alert-system)
8. [Audit & Compliance](#8-audit--compliance)
9. [Implementation Guide](#9-implementation-guide)

---

## 1. Emergency System Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        EMERGENCY ENGINE SYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                      INPUT CHANNELS                                     │    │
│  │                                                                         │    │
│  │   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐          │    │
│  │   │  Mobile   │  │   Voice   │  │   Chat    │  │   Admin   │          │    │
│  │   │    App    │  │   Call    │  │    Bot    │  │  Manual   │          │    │
│  │   └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘          │    │
│  │         └───────────────┴───────────────┴─────────────┘                │    │
│  │                                │                                        │    │
│  └────────────────────────────────┼────────────────────────────────────────┘    │
│                                   │                                              │
│                                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                    EMERGENCY DETECTION ENGINE                           │    │
│  │                                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │  Keyword    │  │   Pattern   │  │   Context   │  │   Image     │   │    │
│  │  │  Detector   │──│   Matcher   │──│   Analyzer  │──│   Scanner   │   │    │
│  │  │             │  │             │  │             │  │  (Future)   │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                                         │    │
│  │  Output: EmergencySignal (detected: boolean, confidence: number)       │    │
│  │                                                                         │    │
│  └────────────────────────────────┬────────────────────────────────────────┘    │
│                                   │                                              │
│                                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                    MEDICAL TRIAGE ENGINE                                │    │
│  │                                                                         │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │    │
│  │  │                  AI TRIAGE PIPELINE                             │   │    │
│  │  │                                                                 │   │    │
│  │  │  Input ──▶ Symptom Analysis ──▶ Risk Assessment ──▶ Output     │   │    │
│  │  │                                                                 │   │    │
│  │  └─────────────────────────────────────────────────────────────────┘   │    │
│  │                                                                         │    │
│  │  Output: TriageResult (urgency, serviceType, responseTime)             │    │
│  │                                                                         │    │
│  └────────────────────────────────┬────────────────────────────────────────┘    │
│                                   │                                              │
│                 ┌─────────────────┴─────────────────┐                           │
│                 │                                   │                           │
│                 ▼ CRITICAL/HIGH                     ▼ MEDIUM/LOW               │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐          │
│  │    EMERGENCY ESCALATION      │    │     STANDARD ROUTING         │          │
│  │                              │    │                              │          │
│  │  • Immediate notification    │    │  • Normal queue             │          │
│  │  • Provider broadcast        │    │  • Scheduled assignment     │          │
│  │  • Admin alert               │    │  • Standard workflow        │          │
│  │  • Fast-track assignment     │    │                              │          │
│  │                              │    │                              │          │
│  └──────────────────────────────┘    └──────────────────────────────┘          │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Principles

| Principle | Implementation |
|-----------|----------------|
| **Err on caution** | When uncertain, escalate to human review |
| **Speed over perfection** | Fast response > perfect triage for emergencies |
| **Redundant detection** | Multiple detection methods in parallel |
| **Human oversight** | All critical decisions require human verification |
| **Audit trail** | Complete logging of all emergency decisions |
| **Fail-safe** | If AI fails, default to emergency protocol |

### 1.3 Response Time Targets

| Urgency | Detection | Notification | Provider Response |
|---------|-----------|--------------|-------------------|
| CRITICAL | <2 seconds | <30 seconds | <30 minutes |
| HIGH | <5 seconds | <2 minutes | <2 hours |
| MEDIUM | <10 seconds | <5 minutes | <8 hours |
| LOW | <30 seconds | <15 minutes | <24 hours |

---

## 2. Emergency Detection

### 2.1 Detection Methods

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       EMERGENCY DETECTION METHODS                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  METHOD 1: KEYWORD DETECTION (Fast, Rule-based)                                 │
│  ────────────────────────────────────────────────                               │
│  • Bengali emergency keywords                                                   │
│  • English emergency keywords                                                   │
│  • Phonetic variations                                                          │
│  • Urgency modifiers                                                            │
│                                                                                  │
│  METHOD 2: PATTERN MATCHING (Medium, Heuristic)                                 │
│  ─────────────────────────────────────────────                                  │
│  • Symptom combinations                                                         │
│  • Temporal patterns ("suddenly", "just now")                                   │
│  • Severity indicators                                                          │
│  • Multi-symptom correlation                                                    │
│                                                                                  │
│  METHOD 3: AI ANALYSIS (Slower, Contextual)                                     │
│  ───────────────────────────────────────────                                    │
│  • Full context understanding                                                   │
│  • Medical reasoning                                                            │
│  • Confidence scoring                                                           │
│  • Explanation generation                                                       │
│                                                                                  │
│  COMBINATION STRATEGY:                                                          │
│  • Keyword detection runs first (immediate flag if critical keyword found)      │
│  • Pattern matching runs in parallel                                            │
│  • AI analysis runs for full context                                            │
│  • Final decision combines all signals                                          │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Emergency Keywords Database

```typescript
// src/lib/ai/emergency/keywords.ts

export const EMERGENCY_KEYWORDS = {
  critical: {
    bengali: [
      'জরুরি', 'মরে যাচ্ছে', 'মৃত্যু', 'রক্ত পড়ছে', 'শ্বাস বন্ধ',
      'পড়ে গেছে', 'খিঁচুনি', 'অজ্ঞান', 'বিষ', 'দুর্ঘটনা',
      'এখনই', 'তীব্র ব্যথা', 'পেট ফুলে গেছে', 'বাছুর আসছে', 'ডেলিভারি',
    ],
    english: [
      'emergency', 'dying', 'dead', 'bleeding', 'not breathing',
      'collapsed', 'seizure', 'unconscious', 'poison', 'accident',
      'immediately', 'severe pain', 'bloated', 'calving', 'delivery',
    ],
    animalSpecific: {
      CATTLE: ['bloat', 'milk fever', 'dystocia', 'prolapse'],
      GOAT: ['enterotoxemia', 'bloat', 'kidding problem'],
      POULTRY: ['mass mortality', 'outbreak', 'sudden death'],
    },
  },
  
  high: {
    bengali: [
      'জ্বর বেশি', 'খাচ্ছে না', 'দুর্বল', 'পায়খানা', 'বমি',
      'পা ফুলেছে', 'চোখ লাল', 'কাশি', 'পেট ব্যথা',
    ],
    english: [
      'high fever', 'not eating', 'weak', 'diarrhea', 'vomiting',
      'swollen leg', 'red eyes', 'coughing', 'abdominal pain',
    ],
  },
  
  modifiers: {
    urgency: ['এখনই', 'দ্রুত', 'জরুরি', 'immediately', 'urgent', 'asap', 'now'],
    severity: ['তীব্র', 'মারাত্মক', 'খুব', 'severe', 'extreme', 'very'],
    temporal: ['হঠাৎ', 'এইমাত্র', 'সকাল থেকে', 'suddenly', 'just now', 'since morning'],
  },
};

export const EMERGENCY_PATTERNS = [
  {
    pattern: /(bloat|পেট ফুল).*(breath|শ্বাস)/i,
    urgency: 'CRITICAL',
    condition: 'Bloat with respiratory distress',
  },
  {
    pattern: /(not standing|দাঁড়াতে পারছে না).*(shaking|কাঁপছে)/i,
    urgency: 'CRITICAL',
    condition: 'Possible milk fever or neurological emergency',
  },
  {
    pattern: /(blood|রক্ত).*(heavy|অনেক|profuse)/i,
    urgency: 'CRITICAL',
    condition: 'Hemorrhage',
  },
  {
    pattern: /(calving|বাচ্চা).*(stuck|আটকে|problem|সমস্যা)/i,
    urgency: 'CRITICAL',
    condition: 'Dystocia',
  },
  {
    pattern: /(fever|জ্বর).*(high|বেশি).*(days|দিন)/i,
    urgency: 'HIGH',
    condition: 'Prolonged fever',
  },
  {
    pattern: /(not eating|খাচ্ছে না).*(days|দিন)/i,
    urgency: 'HIGH',
    condition: 'Prolonged anorexia',
  },
];
```

### 2.3 Emergency Detector Implementation

```typescript
// src/lib/ai/emergency/emergency-detector.ts

export interface EmergencySignal {
  detected: boolean;
  confidence: number;
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | null;
  triggers: EmergencyTrigger[];
  suggestedAction: string;
}

export interface EmergencyTrigger {
  type: 'keyword' | 'pattern' | 'ai_analysis';
  match: string;
  urgency: string;
  confidence: number;
}

export class EmergencyDetector {
  async detect(input: EmergencyDetectionInput): Promise<EmergencySignal> {
    const triggers: EmergencyTrigger[] = [];
    
    // 1. Keyword detection (fastest)
    const keywordTriggers = this.detectKeywords(input.text);
    triggers.push(...keywordTriggers);
    
    // 2. Pattern matching
    const patternTriggers = this.detectPatterns(input.text);
    triggers.push(...patternTriggers);
    
    // 3. Check for immediate critical detection
    const criticalTriggers = triggers.filter(t => t.urgency === 'CRITICAL');
    if (criticalTriggers.length > 0) {
      // Immediate escalation for critical keywords/patterns
      return {
        detected: true,
        confidence: 0.95,
        urgencyLevel: 'CRITICAL',
        triggers: criticalTriggers,
        suggestedAction: 'IMMEDIATE_ESCALATION',
      };
    }
    
    // 4. AI analysis for context (if not clearly critical)
    if (input.includeAiAnalysis !== false) {
      const aiTrigger = await this.analyzeWithAi(input);
      if (aiTrigger) {
        triggers.push(aiTrigger);
      }
    }
    
    // 5. Combine signals
    return this.combineSignals(triggers);
  }
  
  private detectKeywords(text: string): EmergencyTrigger[] {
    const triggers: EmergencyTrigger[] = [];
    const lowerText = text.toLowerCase();
    
    // Check critical keywords
    for (const keyword of EMERGENCY_KEYWORDS.critical.bengali) {
      if (lowerText.includes(keyword.toLowerCase())) {
        triggers.push({
          type: 'keyword',
          match: keyword,
          urgency: 'CRITICAL',
          confidence: 0.9,
        });
      }
    }
    
    for (const keyword of EMERGENCY_KEYWORDS.critical.english) {
      if (lowerText.includes(keyword.toLowerCase())) {
        triggers.push({
          type: 'keyword',
          match: keyword,
          urgency: 'CRITICAL',
          confidence: 0.9,
        });
      }
    }
    
    // Check high urgency keywords
    for (const keyword of EMERGENCY_KEYWORDS.high.bengali) {
      if (lowerText.includes(keyword.toLowerCase())) {
        triggers.push({
          type: 'keyword',
          match: keyword,
          urgency: 'HIGH',
          confidence: 0.7,
        });
      }
    }
    
    // Check urgency modifiers (boost confidence if found)
    let hasUrgencyModifier = false;
    for (const modifier of EMERGENCY_KEYWORDS.modifiers.urgency) {
      if (lowerText.includes(modifier.toLowerCase())) {
        hasUrgencyModifier = true;
        break;
      }
    }
    
    if (hasUrgencyModifier && triggers.length > 0) {
      triggers[0].confidence = Math.min(triggers[0].confidence + 0.1, 1.0);
    }
    
    return triggers;
  }
  
  private detectPatterns(text: string): EmergencyTrigger[] {
    const triggers: EmergencyTrigger[] = [];
    
    for (const patternDef of EMERGENCY_PATTERNS) {
      if (patternDef.pattern.test(text)) {
        triggers.push({
          type: 'pattern',
          match: patternDef.condition,
          urgency: patternDef.urgency,
          confidence: 0.85,
        });
      }
    }
    
    return triggers;
  }
  
  private async analyzeWithAi(input: EmergencyDetectionInput): Promise<EmergencyTrigger | null> {
    const response = await this.aiOrchestrator.process<EmergencyAnalysis>({
      type: 'emergency_detection',
      priority: 'critical',
      system: EMERGENCY_DETECTION_PROMPT,
      prompt: `Analyze for emergency: ${input.text}
Animal: ${input.animalInfo?.species || 'Unknown'}
Additional context: ${input.context || 'None'}`,
      jsonMode: true,
      maxTokens: 200,
    });
    
    if (response.data.isEmergency) {
      return {
        type: 'ai_analysis',
        match: response.data.reasoning,
        urgency: response.data.urgencyLevel,
        confidence: response.data.confidence,
      };
    }
    
    return null;
  }
  
  private combineSignals(triggers: EmergencyTrigger[]): EmergencySignal {
    if (triggers.length === 0) {
      return {
        detected: false,
        confidence: 0,
        urgencyLevel: null,
        triggers: [],
        suggestedAction: 'NORMAL_PROCESSING',
      };
    }
    
    // Find highest urgency
    const urgencyOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    let highestUrgency = 'LOW';
    let maxConfidence = 0;
    
    for (const trigger of triggers) {
      const currentIndex = urgencyOrder.indexOf(trigger.urgency);
      const highestIndex = urgencyOrder.indexOf(highestUrgency);
      
      if (currentIndex < highestIndex) {
        highestUrgency = trigger.urgency;
      }
      
      if (trigger.confidence > maxConfidence) {
        maxConfidence = trigger.confidence;
      }
    }
    
    // Multiple trigger types increase confidence
    const triggerTypes = new Set(triggers.map(t => t.type));
    if (triggerTypes.size > 1) {
      maxConfidence = Math.min(maxConfidence + 0.1, 1.0);
    }
    
    return {
      detected: true,
      confidence: maxConfidence,
      urgencyLevel: highestUrgency as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
      triggers,
      suggestedAction: this.getSuggestedAction(highestUrgency, maxConfidence),
    };
  }
  
  private getSuggestedAction(urgency: string, confidence: number): string {
    if (urgency === 'CRITICAL') {
      return 'IMMEDIATE_ESCALATION';
    }
    if (urgency === 'HIGH' && confidence > 0.7) {
      return 'PRIORITY_PROCESSING';
    }
    if (confidence < 0.5) {
      return 'HUMAN_REVIEW';
    }
    return 'STANDARD_TRIAGE';
  }
}
```

---

## 3. Medical Triage Pipeline

### 3.1 Triage Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         MEDICAL TRIAGE PIPELINE                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  INPUT                                                              │       │
│  │  ─────                                                              │       │
│  │  • Symptom description (Bengali/English)                           │       │
│  │  • Animal profile (species, breed, age, weight)                    │       │
│  │  • Emergency signal (from detection)                               │       │
│  │  • Customer urgency perception                                     │       │
│  │  • Images (optional)                                               │       │
│  └───────────────────────────────────┬─────────────────────────────────┘       │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  STAGE 1: SYMPTOM EXTRACTION                                        │       │
│  │  ───────────────────────────                                        │       │
│  │  • Parse symptom keywords                                          │       │
│  │  • Normalize terminology                                           │       │
│  │  • Extract temporal info (duration, onset)                         │       │
│  │  • Identify severity modifiers                                     │       │
│  └───────────────────────────────────┬─────────────────────────────────┘       │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  STAGE 2: RISK ASSESSMENT                                           │       │
│  │  ────────────────────────                                           │       │
│  │  • Life-threatening potential                                      │       │
│  │  • Progression risk                                                │       │
│  │  • Reversibility window                                            │       │
│  │  • Contagion risk                                                  │       │
│  │  • Zoonotic potential                                              │       │
│  └───────────────────────────────────┬─────────────────────────────────┘       │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  STAGE 3: URGENCY CLASSIFICATION                                    │       │
│  │  ─────────────────────────────                                      │       │
│  │  • Apply decision matrix                                           │       │
│  │  • Consider animal factors (age, pregnancy)                        │       │
│  │  • Factor in symptom combination                                   │       │
│  │  • Assign urgency level                                            │       │
│  └───────────────────────────────────┬─────────────────────────────────┘       │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  STAGE 4: SERVICE ROUTING                                           │       │
│  │  ───────────────────────                                            │       │
│  │  • Determine service type                                          │       │
│  │  • Set response time target                                        │       │
│  │  • Generate care instructions                                      │       │
│  │  • Flag for human review if needed                                 │       │
│  └───────────────────────────────────┬─────────────────────────────────┘       │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  OUTPUT                                                             │       │
│  │  ──────                                                             │       │
│  │  {                                                                 │       │
│  │    urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',               │       │
│  │    serviceType: 'EMERGENCY_DOCTOR' | 'DOCTOR_HOME_VISIT' | ...,   │       │
│  │    maxResponseTime: number (minutes),                              │       │
│  │    possibleConditions: [...],                                      │       │
│  │    immediateCareAdvice: string,                                    │       │
│  │    warningSignsToWatch: [...],                                     │       │
│  │    confidence: number,                                             │       │
│  │    requiresHumanReview: boolean                                    │       │
│  │  }                                                                 │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Triage Service Implementation

```typescript
// src/lib/ai/emergency/triage-service.ts

export class TriageService {
  constructor(
    private readonly emergencyDetector: EmergencyDetector,
    private readonly aiOrchestrator: AiOrchestrator,
    private readonly escalationManager: EscalationManager,
    private readonly auditLogger: AiAuditLogger,
  ) {}
  
  async triage(input: TriageInput): Promise<TriageResult> {
    const requestId = generateRequestId();
    const startTime = Date.now();
    
    try {
      // 1. Emergency pre-check
      const emergencySignal = await this.emergencyDetector.detect({
        text: input.symptoms,
        animalInfo: input.animalProfile,
        context: input.additionalNotes,
      });
      
      // 2. Fast-track critical emergencies
      if (emergencySignal.urgencyLevel === 'CRITICAL' && emergencySignal.confidence > 0.85) {
        const result = this.createCriticalTriageResult(emergencySignal, input);
        await this.handleCriticalEmergency(requestId, result, input);
        return result;
      }
      
      // 3. Full AI triage
      const aiResult = await this.runAiTriage(requestId, input, emergencySignal);
      
      // 4. Apply safety checks
      const safeResult = this.applySafetyChecks(aiResult, emergencySignal);
      
      // 5. Determine escalation
      const escalation = await this.escalationManager.evaluate(safeResult, {
        requestId,
        userId: input.userId,
        emergencySignal,
      });
      
      // 6. Audit log
      await this.auditLogger.logTriage({
        requestId,
        input: this.sanitizeInput(input),
        emergencySignal,
        result: safeResult,
        escalation,
        latencyMs: Date.now() - startTime,
      });
      
      return {
        ...safeResult,
        requestId,
        escalation,
      };
    } catch (error) {
      // Fail-safe: default to high urgency
      await this.auditLogger.logTriageError({
        requestId,
        input: this.sanitizeInput(input),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return this.createFailsafeTriageResult(input);
    }
  }
  
  private async runAiTriage(
    requestId: string,
    input: TriageInput,
    emergencySignal: EmergencySignal
  ): Promise<TriageOutput> {
    const response = await this.aiOrchestrator.process<TriageOutput>({
      requestId,
      type: 'triage',
      priority: emergencySignal.detected ? 'high' : 'medium',
      prompt: this.buildTriagePrompt(input, emergencySignal),
      jsonMode: true,
    });
    
    return response.data;
  }
  
  private applySafetyChecks(
    result: TriageOutput,
    emergencySignal: EmergencySignal
  ): TriageOutput {
    // Rule: If emergency detected but AI said LOW, bump to at least MEDIUM
    if (emergencySignal.detected && result.urgency === 'LOW') {
      result.urgency = 'MEDIUM';
      result.requiresHumanReview = true;
      result.safetyCheckApplied = 'Upgraded from LOW due to emergency signal';
    }
    
    // Rule: Low confidence always requires review
    if (result.confidence < 0.6) {
      result.requiresHumanReview = true;
    }
    
    // Rule: Certain conditions always escalate
    const criticalConditions = ['Anthrax', 'Rabies', 'Bloat', 'Dystocia', 'Hemorrhage'];
    const hasCriticalCondition = result.possibleConditions?.some(c => 
      criticalConditions.some(cc => c.name.toLowerCase().includes(cc.toLowerCase()))
    );
    
    if (hasCriticalCondition && result.urgency !== 'CRITICAL') {
      result.urgency = 'CRITICAL';
      result.safetyCheckApplied = 'Upgraded due to critical condition detection';
    }
    
    return result;
  }
  
  private async handleCriticalEmergency(
    requestId: string,
    result: TriageResult,
    input: TriageInput
  ): Promise<void> {
    // Trigger immediate notifications
    await this.escalationManager.triggerCriticalAlert({
      requestId,
      userId: input.userId,
      location: input.location,
      symptoms: input.symptoms,
      animal: input.animalProfile,
      triageResult: result,
    });
  }
  
  private createCriticalTriageResult(
    signal: EmergencySignal,
    input: TriageInput
  ): TriageResult {
    return {
      urgency: 'CRITICAL',
      serviceType: 'EMERGENCY_DOCTOR',
      maxResponseTime: 30, // 30 minutes
      possibleConditions: signal.triggers.map(t => ({
        name: t.match,
        confidence: t.confidence,
        source: t.type,
      })),
      immediateCareAdvice: this.getCriticalCareAdvice(input.animalProfile?.species),
      warningSignsToWatch: ['Any worsening of symptoms'],
      confidence: signal.confidence,
      requiresHumanReview: false, // Critical = immediate action
      fastTracked: true,
      reasoning: `Emergency detected via ${signal.triggers.map(t => t.type).join(', ')}`,
    };
  }
  
  private createFailsafeTriageResult(input: TriageInput): TriageResult {
    return {
      urgency: 'HIGH',
      serviceType: 'DOCTOR_HOME_VISIT',
      maxResponseTime: 120, // 2 hours
      possibleConditions: [],
      immediateCareAdvice: 'প্রাণীকে শান্ত রাখুন। পশু চিকিৎসকের সাথে যোগাযোগ করুন।',
      warningSignsToWatch: ['Any new symptoms', 'Worsening condition'],
      confidence: 0,
      requiresHumanReview: true,
      failsafe: true,
      reasoning: 'AI triage failed - defaulting to safe urgency level',
    };
  }
  
  private getCriticalCareAdvice(species?: string): string {
    const baseAdvice = 'জরুরি! প্রাণীকে নড়াচড়া করাবেন না। পানি বা খাবার দেবেন না যদি না নিশ্চিত হন।';
    
    switch (species) {
      case 'CATTLE':
        return `${baseAdvice} গরু দাঁড়িয়ে থাকলে বসতে দেবেন না।`;
      case 'GOAT':
        return `${baseAdvice} অন্য ছাগল থেকে আলাদা রাখুন।`;
      default:
        return baseAdvice;
    }
  }
}
```

---

## 4. Urgency Classification

### 4.1 Classification Matrix

| Urgency | Life Threat | Response Time | Service Type | Examples |
|---------|-------------|---------------|--------------|----------|
| **CRITICAL** | Immediate | ≤30 min | Emergency Doctor | Bloat, hemorrhage, dystocia, collapse |
| **HIGH** | Potential | ≤2 hours | Priority Doctor | High fever 24h+, severe lameness, not eating 48h+ |
| **MEDIUM** | Low | ≤8 hours | Scheduled Doctor | Mild fever, skin issues, moderate lameness |
| **LOW** | None | ≤24 hours | Routine/Technician | Vaccination, deworming, minor wounds |

### 4.2 Decision Rules

```typescript
// src/lib/ai/emergency/urgency-classifier.ts

export const URGENCY_RULES: UrgencyRule[] = [
  // CRITICAL rules
  {
    urgency: 'CRITICAL',
    conditions: [
      { symptom: 'bloat', with: 'respiratory_distress' },
      { symptom: 'hemorrhage', severity: 'severe' },
      { symptom: 'collapse', any: true },
      { symptom: 'dystocia', any: true },
      { symptom: 'seizures', any: true },
      { symptom: 'unable_to_stand', with: 'muscle_tremors' },
      { symptom: 'prolapse', any: true },
    ],
  },
  
  // HIGH rules
  {
    urgency: 'HIGH',
    conditions: [
      { symptom: 'fever', duration: '> 24 hours' },
      { symptom: 'not_eating', duration: '> 48 hours' },
      { symptom: 'severe_diarrhea', duration: '> 12 hours' },
      { symptom: 'lameness', severity: 'severe' },
      { symptom: 'eye_injury', any: true },
      { symptom: 'snake_bite', any: true },
      { symptom: 'difficult_breathing', severity: 'moderate' },
    ],
  },
  
  // MEDIUM rules
  {
    urgency: 'MEDIUM',
    conditions: [
      { symptom: 'fever', duration: '< 24 hours' },
      { symptom: 'mild_diarrhea', any: true },
      { symptom: 'skin_lesions', severity: 'moderate' },
      { symptom: 'lameness', severity: 'mild' },
      { symptom: 'reduced_appetite', any: true },
      { symptom: 'coughing', severity: 'mild' },
    ],
  },
  
  // LOW rules (default)
  {
    urgency: 'LOW',
    conditions: [
      { symptom: 'vaccination_needed', any: true },
      { symptom: 'deworming_needed', any: true },
      { symptom: 'minor_wound', any: true },
      { symptom: 'routine_checkup', any: true },
      { symptom: 'breeding_service', any: true },
    ],
  },
];

export class UrgencyClassifier {
  classify(symptoms: ExtractedSymptoms, context: ClassificationContext): UrgencyLevel {
    // Check rules in order (CRITICAL → LOW)
    for (const rule of URGENCY_RULES) {
      if (this.matchesRule(symptoms, rule, context)) {
        return rule.urgency;
      }
    }
    
    // Default to MEDIUM if no match (fail-safe)
    return 'MEDIUM';
  }
  
  private matchesRule(
    symptoms: ExtractedSymptoms,
    rule: UrgencyRule,
    context: ClassificationContext
  ): boolean {
    for (const condition of rule.conditions) {
      if (this.matchesCondition(symptoms, condition, context)) {
        return true;
      }
    }
    return false;
  }
  
  private matchesCondition(
    symptoms: ExtractedSymptoms,
    condition: RuleCondition,
    context: ClassificationContext
  ): boolean {
    const hasSymptom = symptoms.list.includes(condition.symptom);
    if (!hasSymptom) return false;
    
    // Check 'with' requirement
    if (condition.with) {
      if (!symptoms.list.includes(condition.with)) return false;
    }
    
    // Check severity
    if (condition.severity) {
      const symptomSeverity = symptoms.severities[condition.symptom];
      if (symptomSeverity !== condition.severity) return false;
    }
    
    // Check duration
    if (condition.duration) {
      const symptomDuration = symptoms.durations[condition.symptom];
      if (!this.matchesDuration(symptomDuration, condition.duration)) return false;
    }
    
    return true;
  }
}
```

### 4.3 Animal-Specific Modifiers

```typescript
// Modifiers that can increase urgency

export const ANIMAL_MODIFIERS: AnimalModifier[] = [
  // Pregnancy increases urgency
  {
    condition: 'pregnant',
    upgrade: 1, // Upgrade urgency by 1 level
    reason: 'Pregnant animals require faster response',
  },
  
  // Young animals are more vulnerable
  {
    condition: 'age_under_3_months',
    upgrade: 1,
    reason: 'Young animals are more vulnerable',
  },
  
  // Old animals have lower reserves
  {
    condition: 'age_over_10_years',
    upgrade: 1,
    reason: 'Older animals have reduced resilience',
  },
  
  // Multiple animals affected = outbreak concern
  {
    condition: 'multiple_animals_affected',
    upgrade: 2,
    reason: 'Potential outbreak - public health concern',
  },
  
  // Dairy cattle have economic impact
  {
    condition: 'dairy_cattle',
    context: 'mastitis',
    upgrade: 1,
    reason: 'Dairy cattle mastitis impacts production',
  },
];
```

---

## 5. Escalation Protocols

### 5.1 Escalation Levels

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        ESCALATION PROTOCOLS                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  LEVEL 1: AUTOMATED RESPONSE                                                    │
│  ─────────────────────────────                                                  │
│  • AI processes and responds                                                    │
│  • Standard routing to available provider                                       │
│  • No special notification                                                      │
│  • Applies to: LOW, MEDIUM (high confidence)                                    │
│                                                                                  │
│  LEVEL 2: PRIORITY ROUTING                                                      │
│  ──────────────────────────                                                     │
│  • Fast-track to available provider                                             │
│  • Provider notification sent                                                   │
│  • SLA tracking activated                                                       │
│  • Applies to: HIGH, MEDIUM (low confidence)                                    │
│                                                                                  │
│  LEVEL 3: BROADCAST + ESCALATION                                                │
│  ──────────────────────────────                                                 │
│  • Broadcast to multiple providers                                              │
│  • Admin dashboard alert                                                        │
│  • SMS to available doctors                                                     │
│  • Customer immediate callback if no response                                   │
│  • Applies to: CRITICAL                                                         │
│                                                                                  │
│  LEVEL 4: CRISIS MANAGEMENT                                                     │
│  ──────────────────────────                                                     │
│  • All level 3 actions                                                          │
│  • Escalate to management                                                       │
│  • Consider external resources                                                  │
│  • Public health notification (if applicable)                                   │
│  • Applies to: Outbreak, zoonotic disease                                       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Escalation Timeline

```typescript
// src/lib/ai/emergency/escalation-timeline.ts

export const ESCALATION_TIMELINES = {
  CRITICAL: {
    initial: {
      actions: ['notify_providers', 'admin_alert', 'sms_broadcast'],
      timeout: 0, // Immediate
    },
    tier1: {
      actions: ['expand_search_radius', 'callback_customer'],
      timeout: 5 * 60 * 1000, // 5 minutes
    },
    tier2: {
      actions: ['escalate_to_management', 'consider_external'],
      timeout: 15 * 60 * 1000, // 15 minutes
    },
  },
  
  HIGH: {
    initial: {
      actions: ['notify_providers', 'push_notification'],
      timeout: 0,
    },
    tier1: {
      actions: ['admin_alert', 'expand_search'],
      timeout: 30 * 60 * 1000, // 30 minutes
    },
    tier2: {
      actions: ['escalate_to_admin'],
      timeout: 60 * 60 * 1000, // 1 hour
    },
  },
  
  MEDIUM: {
    initial: {
      actions: ['standard_routing'],
      timeout: 0,
    },
    tier1: {
      actions: ['reminder_notification'],
      timeout: 2 * 60 * 60 * 1000, // 2 hours
    },
  },
  
  LOW: {
    initial: {
      actions: ['queue_for_assignment'],
      timeout: 0,
    },
  },
};
```

---

## 6. Provider Assignment

### 6.1 Emergency Assignment Algorithm

```typescript
// src/lib/ai/emergency/emergency-assignment.ts

export class EmergencyAssignmentService {
  async findEmergencyProvider(request: EmergencyAssignmentRequest): Promise<AssignmentResult> {
    const { location, urgency, serviceType, animalType } = request;
    
    // Get all potentially available providers
    const candidates = await this.getCandidates(location, serviceType);
    
    // Filter by availability
    const available = candidates.filter(c => 
      c.status === 'ACTIVE' && 
      c.acceptsEmergency === true &&
      (urgency !== 'CRITICAL' || c.availableNow)
    );
    
    if (available.length === 0) {
      return { success: false, reason: 'NO_AVAILABLE_PROVIDERS' };
    }
    
    // Score and rank
    const scored = available.map(provider => ({
      provider,
      score: this.scoreProvider(provider, request),
    }));
    
    scored.sort((a, b) => b.score - a.score);
    
    // For CRITICAL: broadcast to top 3, first to accept wins
    if (urgency === 'CRITICAL') {
      const topProviders = scored.slice(0, 3);
      return {
        success: true,
        type: 'broadcast',
        providers: topProviders.map(s => s.provider),
        timeout: 5 * 60 * 1000, // 5 minute timeout
      };
    }
    
    // For HIGH: assign to best match, queue backup
    if (urgency === 'HIGH') {
      return {
        success: true,
        type: 'primary_with_backup',
        primary: scored[0].provider,
        backup: scored[1]?.provider,
        timeout: 15 * 60 * 1000, // 15 minute timeout
      };
    }
    
    // Standard assignment
    return {
      success: true,
      type: 'single',
      provider: scored[0].provider,
    };
  }
  
  private scoreProvider(provider: ProviderProfile, request: EmergencyAssignmentRequest): number {
    let score = 0;
    
    // Distance (closer = higher score)
    const distance = this.calculateDistance(provider.location, request.location);
    score += Math.max(0, 100 - distance * 2); // Max 100 points, -2 per km
    
    // Rating
    score += (provider.rating || 4) * 10; // Up to 50 points
    
    // Response rate
    score += (provider.responseRate || 0.5) * 20; // Up to 20 points
    
    // Availability
    if (provider.availableNow) score += 30;
    if (provider.currentCaseload < 3) score += 20;
    
    // Specialization match
    if (request.animalType && provider.specializations?.includes(request.animalType)) {
      score += 25;
    }
    
    // Emergency acceptance rate
    score += (provider.emergencyAcceptRate || 0.5) * 30; // Up to 30 points
    
    return score;
  }
}
```

### 6.2 Provider Notification

```typescript
// src/lib/ai/emergency/provider-notification.ts

export class EmergencyNotificationService {
  async notifyProviders(
    providers: ProviderProfile[],
    request: EmergencyNotificationRequest
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];
    
    for (const provider of providers) {
      // Multi-channel notification for emergencies
      const channels = this.selectChannels(request.urgency);
      
      for (const channel of channels) {
        const result = await this.sendNotification({
          provider,
          channel,
          request,
        });
        results.push(result);
      }
    }
    
    return results;
  }
  
  private selectChannels(urgency: UrgencyLevel): NotificationChannel[] {
    switch (urgency) {
      case 'CRITICAL':
        return ['push', 'sms', 'in_app']; // All channels
      case 'HIGH':
        return ['push', 'in_app'];
      default:
        return ['in_app'];
    }
  }
  
  private async sendNotification(params: SendNotificationParams): Promise<NotificationResult> {
    const { provider, channel, request } = params;
    
    const message = this.buildMessage(request, provider.locale);
    
    switch (channel) {
      case 'sms':
        return this.smsService.send({
          to: provider.phone,
          message: message.sms,
          priority: 'high',
        });
        
      case 'push':
        return this.pushService.send({
          userId: provider.userId,
          title: message.title,
          body: message.body,
          data: {
            type: 'emergency_request',
            requestId: request.requestId,
            urgency: request.urgency,
          },
          priority: 'high',
          sound: 'emergency',
        });
        
      case 'in_app':
        return this.inAppService.send({
          userId: provider.userId,
          notification: {
            type: 'EMERGENCY_REQUEST',
            title: message.title,
            body: message.body,
            metadata: { requestId: request.requestId },
          },
        });
    }
  }
  
  private buildMessage(
    request: EmergencyNotificationRequest,
    locale: string
  ): NotificationMessage {
    const isBengali = locale === 'bn-BD';
    
    if (request.urgency === 'CRITICAL') {
      return {
        title: isBengali ? '🚨 জরুরি অনুরোধ!' : '🚨 Emergency Request!',
        body: isBengali 
          ? `${request.animalType} - ${request.symptoms.slice(0, 50)}... জরুরি সাহায্য প্রয়োজন`
          : `${request.animalType} - ${request.symptoms.slice(0, 50)}... Immediate help needed`,
        sms: isBengali
          ? `জরুরি! ${request.animalType} সাহায্য প্রয়োজন। অ্যাপ চেক করুন।`
          : `URGENT! ${request.animalType} needs help. Check app.`,
      };
    }
    
    return {
      title: isBengali ? 'নতুন অনুরোধ' : 'New Request',
      body: isBengali
        ? `${request.animalType} - ${request.symptoms.slice(0, 50)}...`
        : `${request.animalType} - ${request.symptoms.slice(0, 50)}...`,
      sms: '',
    };
  }
}
```

---

## 7. Alert System

### 7.1 Alert Types

| Alert Type | Trigger | Recipients | Channels |
|------------|---------|------------|----------|
| Emergency Created | CRITICAL request | Available providers | SMS, Push, In-app |
| No Response | 5 min timeout | Admin, backup providers | Push, In-app |
| Escalation | Tier upgrade | Management | Email, Push |
| Outbreak | Multiple similar cases | Admin, health authority | Email, SMS |
| System Failure | AI/detection failure | Tech team | Slack, Email |

### 7.2 Alert Implementation

```typescript
// src/lib/ai/emergency/alert-system.ts

export class EmergencyAlertSystem {
  private alertHistory: Map<string, AlertRecord[]> = new Map();
  
  async sendAlert(alert: EmergencyAlert): Promise<void> {
    // Check for duplicate/spam
    if (this.isDuplicateAlert(alert)) {
      return;
    }
    
    // Record alert
    this.recordAlert(alert);
    
    // Route based on type
    switch (alert.type) {
      case 'EMERGENCY_CREATED':
        await this.handleEmergencyCreated(alert);
        break;
        
      case 'NO_RESPONSE':
        await this.handleNoResponse(alert);
        break;
        
      case 'ESCALATION':
        await this.handleEscalation(alert);
        break;
        
      case 'OUTBREAK':
        await this.handleOutbreak(alert);
        break;
        
      case 'SYSTEM_FAILURE':
        await this.handleSystemFailure(alert);
        break;
    }
    
    // Audit log
    await this.auditLogger.logAlert(alert);
  }
  
  private async handleEmergencyCreated(alert: EmergencyAlert): Promise<void> {
    // Get nearby providers
    const providers = await this.providerService.getNearbyEmergencyProviders(
      alert.location,
      alert.radius ?? 20 // km
    );
    
    // Send notifications
    await this.notificationService.notifyProviders(providers, {
      requestId: alert.requestId,
      urgency: alert.urgency,
      animalType: alert.animalType,
      symptoms: alert.symptoms,
    });
    
    // Admin dashboard alert
    await this.adminAlertService.create({
      type: 'emergency',
      requestId: alert.requestId,
      priority: 'high',
    });
  }
  
  private async handleNoResponse(alert: EmergencyAlert): Promise<void> {
    // Expand search radius
    const expandedProviders = await this.providerService.getNearbyEmergencyProviders(
      alert.location,
      alert.radius! * 2 // Double radius
    );
    
    // Re-notify with higher urgency
    await this.notificationService.notifyProviders(expandedProviders, {
      requestId: alert.requestId,
      urgency: 'CRITICAL',
      message: 'No provider has responded - please help!',
    });
    
    // Notify admin
    await this.adminAlertService.create({
      type: 'no_response',
      requestId: alert.requestId,
      priority: 'critical',
      message: `No response for emergency request after ${alert.timeout / 60000} minutes`,
    });
  }
  
  private async handleOutbreak(alert: EmergencyAlert): Promise<void> {
    // High priority admin alert
    await this.adminAlertService.create({
      type: 'outbreak',
      priority: 'critical',
      data: {
        location: alert.location,
        caseCount: alert.caseCount,
        suspectedCondition: alert.condition,
      },
    });
    
    // Email to management
    await this.emailService.send({
      to: config.managementEmails,
      template: 'outbreak_alert',
      data: alert,
    });
    
    // Log for health authority reporting
    await this.outbreakLogger.log(alert);
  }
}
```

---

## 8. Audit & Compliance

### 8.1 Audit Requirements

| Event | Logged Data | Retention |
|-------|-------------|-----------|
| Emergency Detection | Input, triggers, result | 2 years |
| Triage Decision | Input, AI output, final decision | 2 years |
| Provider Assignment | Candidates, scores, selection | 1 year |
| Escalation | Trigger, timeline, actions | 2 years |
| Outcome | Service completion, feedback | Permanent |

### 8.2 Audit Logger

```typescript
// src/lib/ai/emergency/audit-logger.ts

export class EmergencyAuditLogger {
  async logTriage(data: TriageAuditData): Promise<void> {
    await this.prisma.aiEmergencyAudit.create({
      data: {
        eventType: 'TRIAGE',
        requestId: data.requestId,
        userId: data.input.userId,
        animalId: data.input.animalProfile?.id,
        
        // Input (sanitized)
        inputSymptoms: data.input.symptoms,
        inputAnimalType: data.input.animalProfile?.species,
        
        // Detection
        emergencyDetected: data.emergencySignal.detected,
        emergencyConfidence: data.emergencySignal.confidence,
        emergencyTriggers: data.emergencySignal.triggers,
        
        // Result
        resultUrgency: data.result.urgency,
        resultServiceType: data.result.serviceType,
        resultConfidence: data.result.confidence,
        requiresHumanReview: data.result.requiresHumanReview,
        
        // Escalation
        escalated: data.escalation?.escalated ?? false,
        escalationRules: data.escalation?.rules,
        
        // Metadata
        latencyMs: data.latencyMs,
        aiModel: data.aiModel,
        aiProvider: data.aiProvider,
        
        timestamp: new Date(),
      },
    });
  }
  
  async logOutcome(data: OutcomeAuditData): Promise<void> {
    await this.prisma.aiEmergencyAudit.update({
      where: { requestId: data.requestId },
      data: {
        outcomeStatus: data.status,
        providerAssigned: data.providerId,
        responseTimeMinutes: data.responseTimeMinutes,
        serviceCompletedAt: data.completedAt,
        customerFeedback: data.feedback,
        updatedAt: new Date(),
      },
    });
  }
  
  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<ComplianceReport> {
    const audits = await this.prisma.aiEmergencyAudit.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    
    return {
      period: { start: startDate, end: endDate },
      totalCases: audits.length,
      criticalCases: audits.filter(a => a.resultUrgency === 'CRITICAL').length,
      avgResponseTime: this.calculateAvgResponseTime(audits),
      escalationRate: this.calculateEscalationRate(audits),
      accuracyMetrics: this.calculateAccuracyMetrics(audits),
      slaCompliance: this.calculateSlaCompliance(audits),
    };
  }
}
```

---

## 9. Implementation Guide

### 9.1 Environment Variables

```bash
# Emergency System
EMERGENCY_DETECTION_ENABLED=true
EMERGENCY_AI_TIMEOUT_MS=2000
EMERGENCY_BROADCAST_RADIUS_KM=20
EMERGENCY_NO_RESPONSE_TIMEOUT_MS=300000

# Escalation
ESCALATION_TIER1_TIMEOUT_MS=300000
ESCALATION_TIER2_TIMEOUT_MS=900000
ESCALATION_MANAGEMENT_EMAILS=management@pranidoctor.com

# Alerts
ALERT_SMS_ENABLED=true
ALERT_PUSH_ENABLED=true
```

### 9.2 File Structure

```
src/lib/ai/emergency/
├── index.ts                    # Main exports
├── keywords.ts                 # Emergency keywords database
├── emergency-detector.ts       # Detection engine
├── triage-service.ts           # Triage pipeline
├── urgency-classifier.ts       # Classification rules
├── escalation-manager.ts       # Escalation protocols
├── escalation-timeline.ts      # Timeline definitions
├── emergency-assignment.ts     # Provider assignment
├── provider-notification.ts    # Notification service
├── alert-system.ts             # Alert management
├── audit-logger.ts             # Audit logging
└── types.ts                    # Type definitions
```

### 9.3 Integration Example

```typescript
// Example: Processing an emergency request

import { EmergencyDetector } from './emergency/emergency-detector';
import { TriageService } from './emergency/triage-service';
import { EmergencyAssignmentService } from './emergency/emergency-assignment';

export async function processEmergencyRequest(input: EmergencyInput): Promise<EmergencyResponse> {
  const detector = new EmergencyDetector();
  const triageService = new TriageService();
  const assignmentService = new EmergencyAssignmentService();
  
  // 1. Detect emergency
  const emergencySignal = await detector.detect({
    text: input.symptoms,
    animalInfo: input.animalProfile,
  });
  
  // 2. Triage
  const triageResult = await triageService.triage({
    ...input,
    emergencySignal,
  });
  
  // 3. Assign provider
  const assignment = await assignmentService.findEmergencyProvider({
    location: input.location,
    urgency: triageResult.urgency,
    serviceType: triageResult.serviceType,
    animalType: input.animalProfile?.species,
  });
  
  return {
    requestId: triageResult.requestId,
    urgency: triageResult.urgency,
    serviceType: triageResult.serviceType,
    assignment,
    immediateCareAdvice: triageResult.immediateCareAdvice,
    estimatedResponseTime: triageResult.maxResponseTime,
  };
}
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | AI Team | Initial release |

---

## Related Documents

| Document | Location |
|----------|----------|
| AI Orchestrator | `docs/ai/AI_ORCHESTRATOR.md` |
| Prompt System | `docs/ai/PROMPT_SYSTEM.md` |
| Memory System | `docs/ai/MEMORY_SYSTEM.md` |
| Cost Optimization | `docs/ai/COST_OPTIMIZATION.md` |

---

*End of EMERGENCY_ENGINE.md*
