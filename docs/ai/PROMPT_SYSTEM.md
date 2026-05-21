# PROMPT SYSTEM — Prani Doctor

**Version:** 1.0.0  
**Last Updated:** 2026-05-21  
**Scope:** Prompt templates, veterinary reasoning, confidence scoring, human escalation

---

## Table of Contents

1. [Prompt System Overview](#1-prompt-system-overview)
2. [Template Architecture](#2-template-architecture)
3. [Veterinary Reasoning Pipeline](#3-veterinary-reasoning-pipeline)
4. [Confidence Scoring](#4-confidence-scoring)
5. [Human Escalation](#5-human-escalation)
6. [Pipeline Prompts](#6-pipeline-prompts)
7. [Prompt Engineering Guidelines](#7-prompt-engineering-guidelines)
8. [Localization Strategy](#8-localization-strategy)
9. [Testing & Validation](#9-testing--validation)
10. [Implementation Guide](#10-implementation-guide)

---

## 1. Prompt System Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PROMPT SYSTEM                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                      TEMPLATE REGISTRY                                  │    │
│  │                                                                         │    │
│  │   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐          │    │
│  │   │  Triage   │  │ Diagnosis │  │Assignment │  │ Emergency │          │    │
│  │   │ Templates │  │ Templates │  │ Templates │  │ Templates │          │    │
│  │   └───────────┘  └───────────┘  └───────────┘  └───────────┘          │    │
│  │   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐          │    │
│  │   │   Voice   │  │   Chat    │  │   Image   │  │Moderation │          │    │
│  │   │ Templates │  │ Templates │  │ Templates │  │ Templates │          │    │
│  │   └───────────┘  └───────────┘  └───────────┘  └───────────┘          │    │
│  │                                                                         │    │
│  └────────────────────────────────┬───────────────────────────────────────┘    │
│                                   │                                              │
│                                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                      PROMPT BUILDER                                     │    │
│  │                                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │   System    │  │   Context   │  │  Examples   │  │   Output    │   │    │
│  │  │   Prompt    │──│   Injector  │──│  (Few-shot) │──│   Schema    │   │    │
│  │  │             │  │             │  │             │  │             │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                                         │    │
│  └────────────────────────────────┬───────────────────────────────────────┘    │
│                                   │                                              │
│                                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                    VETERINARY REASONING ENGINE                          │    │
│  │                                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │  Symptom    │  │  Condition  │  │  Treatment  │  │  Urgency    │   │    │
│  │  │  Analysis   │──│  Matching   │──│  Suggestion │──│  Assessment │   │    │
│  │  │             │  │             │  │             │  │             │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                                         │    │
│  └────────────────────────────────┬───────────────────────────────────────┘    │
│                                   │                                              │
│                                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                    CONFIDENCE & ESCALATION                              │    │
│  │                                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │ Confidence  │  │  Threshold  │  │  Escalation │  │   Human     │   │    │
│  │  │  Scoring    │──│   Check     │──│   Router    │──│   Queue     │   │    │
│  │  │             │  │             │  │             │  │             │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                                         │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Principles

| Principle | Description |
|-----------|-------------|
| **Structured Output** | All prompts request JSON for parsing reliability |
| **Domain-Specific** | Veterinary context embedded in system prompts |
| **Confidence-Aware** | Every output includes confidence score |
| **Safety-First** | Conservative defaults, explicit escalation |
| **Bilingual** | Bengali input support, structured English reasoning |
| **Auditable** | All prompts and responses logged |

---

## 2. Template Architecture

### 2.1 Template Interface

```typescript
// src/lib/ai/prompts/template.interface.ts

export interface PromptTemplate<TInput, TOutput> {
  /** Template identifier */
  readonly id: string;
  
  /** Template version (semver) */
  readonly version: string;
  
  /** Pipeline this template belongs to */
  readonly pipeline: string;
  
  /** Description for documentation */
  readonly description: string;
  
  /** Build system prompt */
  buildSystemPrompt(): string;
  
  /** Build user prompt from input */
  buildUserPrompt(input: TInput): string;
  
  /** Get few-shot examples */
  getExamples(): PromptExample[];
  
  /** Get output JSON schema */
  getOutputSchema(): JSONSchema;
  
  /** Parse raw output to typed result */
  parseOutput(raw: string): TOutput;
  
  /** Validate output meets requirements */
  validateOutput(output: TOutput): ValidationResult;
}

export interface PromptExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface PromptContext {
  system: string;
  user: string;
  examples: PromptExample[];
  schema: JSONSchema;
}
```

### 2.2 Template Registry

```typescript
// src/lib/ai/prompts/template-registry.ts

export class PromptTemplateRegistry {
  private templates: Map<string, PromptTemplate<unknown, unknown>> = new Map();
  
  register<TInput, TOutput>(template: PromptTemplate<TInput, TOutput>): void {
    const key = `${template.pipeline}:${template.id}`;
    this.templates.set(key, template as PromptTemplate<unknown, unknown>);
  }
  
  get<TInput, TOutput>(pipeline: string, templateId: string): PromptTemplate<TInput, TOutput> {
    const key = `${pipeline}:${templateId}`;
    const template = this.templates.get(key);
    if (!template) {
      throw new TemplateNotFoundError(pipeline, templateId);
    }
    return template as PromptTemplate<TInput, TOutput>;
  }
  
  getForPipeline(pipeline: string): PromptTemplate<unknown, unknown>[] {
    return Array.from(this.templates.values())
      .filter(t => t.pipeline === pipeline);
  }
}

export const promptTemplateRegistry = new PromptTemplateRegistry();
```

### 2.3 Base Template Implementation

```typescript
// src/lib/ai/prompts/base-template.ts

export abstract class BasePromptTemplate<TInput, TOutput> 
  implements PromptTemplate<TInput, TOutput> {
  
  abstract readonly id: string;
  abstract readonly version: string;
  abstract readonly pipeline: string;
  abstract readonly description: string;
  
  protected abstract getSystemPromptContent(): string;
  protected abstract buildUserPromptContent(input: TInput): string;
  protected abstract getOutputSchemaDefinition(): JSONSchema;
  protected abstract parseOutputContent(raw: string): TOutput;
  
  buildSystemPrompt(): string {
    return `${this.getSystemPromptContent()}

RESPONSE FORMAT:
You MUST respond with valid JSON matching the following schema:
${JSON.stringify(this.getOutputSchemaDefinition(), null, 2)}

CRITICAL RULES:
1. ALWAYS respond in valid JSON only - no markdown, no explanations outside JSON
2. ALWAYS include a confidence score (0.0-1.0) reflecting your certainty
3. If confidence is below 0.7, set requiresHumanReview to true
4. NEVER make definitive medical diagnoses - only suggest possibilities
5. For emergencies, always err on the side of caution`;
  }
  
  buildUserPrompt(input: TInput): string {
    return this.buildUserPromptContent(input);
  }
  
  getExamples(): PromptExample[] {
    return []; // Override in subclasses
  }
  
  getOutputSchema(): JSONSchema {
    return this.getOutputSchemaDefinition();
  }
  
  parseOutput(raw: string): TOutput {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = raw.match(/```json\n?([\s\S]*?)\n?```/) || 
                        raw.match(/\{[\s\S]*\}/);
      
      const jsonStr = jsonMatch?.[1] || jsonMatch?.[0] || raw;
      const parsed = JSON.parse(jsonStr);
      
      return this.parseOutputContent(JSON.stringify(parsed));
    } catch (error) {
      throw new PromptParseError(this.id, raw, error);
    }
  }
  
  validateOutput(output: TOutput): ValidationResult {
    // Default validation - override for specific checks
    return { valid: true, errors: [] };
  }
}
```

---

## 3. Veterinary Reasoning Pipeline

### 3.1 Reasoning Chain

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    VETERINARY REASONING PIPELINE                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  INPUT                                                                          │
│  ──────                                                                         │
│  • Symptom description (Bengali/English)                                        │
│  • Animal profile (species, breed, age, weight)                                │
│  • Medical history                                                              │
│  • Images (optional)                                                            │
│  • Geographic context                                                           │
│                                                                                  │
│        │                                                                         │
│        ▼                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  STAGE 1: SYMPTOM EXTRACTION                                        │       │
│  │                                                                     │       │
│  │  • Parse symptom keywords from description                         │       │
│  │  • Normalize terminology (Bengali → standard terms)                │       │
│  │  • Identify duration, severity, progression                        │       │
│  │  • Flag emergency indicators                                       │       │
│  │                                                                     │       │
│  │  Output: StructuredSymptoms                                        │       │
│  └───────────────────────────────────┬─────────────────────────────────┘       │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  STAGE 2: CONDITION MATCHING                                        │       │
│  │                                                                     │       │
│  │  • Match symptoms against veterinary knowledge base                │       │
│  │  • Consider species-specific conditions                            │       │
│  │  • Factor in regional endemic diseases (Bangladesh)                │       │
│  │  • Weight by symptom specificity and prevalence                    │       │
│  │                                                                     │       │
│  │  Output: PossibleConditions[]                                      │       │
│  └───────────────────────────────────┬─────────────────────────────────┘       │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  STAGE 3: DIFFERENTIAL DIAGNOSIS                                    │       │
│  │                                                                     │       │
│  │  • Rank conditions by likelihood                                   │       │
│  │  • Identify distinguishing features                                │       │
│  │  • Suggest diagnostic tests if needed                              │       │
│  │  • Calculate confidence scores                                     │       │
│  │                                                                     │       │
│  │  Output: RankedDifferentials[]                                     │       │
│  └───────────────────────────────────┬─────────────────────────────────┘       │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  STAGE 4: URGENCY ASSESSMENT                                        │       │
│  │                                                                     │       │
│  │  • Evaluate life-threatening potential                             │       │
│  │  • Consider time-sensitivity of conditions                         │       │
│  │  • Factor in animal vulnerability                                  │       │
│  │  • Determine required response time                                │       │
│  │                                                                     │       │
│  │  Output: UrgencyLevel + ResponseTime                               │       │
│  └───────────────────────────────────┬─────────────────────────────────┘       │
│                                      │                                          │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  STAGE 5: RECOMMENDATION GENERATION                                 │       │
│  │                                                                     │       │
│  │  • Immediate care instructions                                     │       │
│  │  • Provider type recommendation (Doctor/Technician)                │       │
│  │  • Warning signs to watch for                                      │       │
│  │  • Escalation triggers                                             │       │
│  │                                                                     │       │
│  │  Output: CareRecommendations                                       │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
│  OUTPUT                                                                         │
│  ──────                                                                         │
│  {                                                                              │
│    symptoms: StructuredSymptoms,                                                │
│    possibleConditions: RankedDifferentials[],                                   │
│    urgency: UrgencyLevel,                                                       │
│    recommendations: CareRecommendations,                                        │
│    confidence: 0.0-1.0,                                                         │
│    requiresHumanReview: boolean,                                                │
│    reasoning: string                                                            │
│  }                                                                              │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Veterinary Knowledge Context

```typescript
// src/lib/ai/prompts/context/veterinary-context.ts

export const VETERINARY_CONTEXT = {
  // Species-specific considerations
  species: {
    CATTLE: {
      commonConditions: [
        'Mastitis', 'Milk fever', 'Bloat', 'Foot rot', 'Lumpy skin disease',
        'FMD (Foot and Mouth Disease)', 'Anthrax', 'Black Quarter',
        'Hemorrhagic Septicemia', 'Bovine viral diarrhea',
      ],
      emergencyIndicators: [
        'Unable to stand', 'Bloated abdomen', 'Labored breathing',
        'Bloody discharge', 'Seizures', 'Collapse', 'Profuse bleeding',
      ],
      normalVitals: {
        temperature: { min: 38.0, max: 39.5, unit: '°C' },
        heartRate: { min: 40, max: 80, unit: 'bpm' },
        respirationRate: { min: 10, max: 30, unit: 'breaths/min' },
      },
    },
    GOAT: {
      commonConditions: [
        'PPR (Peste des petits ruminants)', 'Pneumonia', 'Enterotoxemia',
        'Foot rot', 'Mange', 'Worms', 'Mastitis', 'Bloat',
      ],
      emergencyIndicators: [
        'Bloody diarrhea', 'Unable to walk', 'Severe dehydration',
        'High fever with mouth sores', 'Difficulty breathing',
      ],
      normalVitals: {
        temperature: { min: 38.5, max: 40.0, unit: '°C' },
        heartRate: { min: 70, max: 90, unit: 'bpm' },
        respirationRate: { min: 15, max: 30, unit: 'breaths/min' },
      },
    },
    POULTRY: {
      commonConditions: [
        'Newcastle disease', 'Avian influenza', 'Gumboro disease',
        'Fowl pox', 'Coccidiosis', 'Fowl cholera', 'Marek\'s disease',
      ],
      emergencyIndicators: [
        'Sudden high mortality', 'Severe respiratory distress',
        'Neurological signs', 'Bloody droppings in flock',
      ],
    },
  },
  
  // Regional endemic diseases (Bangladesh)
  endemicDiseases: [
    { name: 'Lumpy Skin Disease', species: ['CATTLE'], season: 'monsoon' },
    { name: 'FMD', species: ['CATTLE', 'GOAT'], season: 'year-round' },
    { name: 'PPR', species: ['GOAT'], season: 'year-round' },
    { name: 'Anthrax', species: ['CATTLE'], season: 'flood-season' },
    { name: 'Hemorrhagic Septicemia', species: ['CATTLE'], season: 'monsoon' },
  ],
  
  // Urgency levels
  urgencyLevels: {
    CRITICAL: {
      description: 'Life-threatening, immediate attention required',
      maxResponseTime: 30, // minutes
      examples: ['Severe bloat', 'Active bleeding', 'Collapse', 'Dystocia'],
    },
    HIGH: {
      description: 'Serious condition, requires prompt attention',
      maxResponseTime: 120, // 2 hours
      examples: ['High fever', 'Not eating 24h+', 'Severe lameness'],
    },
    MEDIUM: {
      description: 'Needs attention but not immediately life-threatening',
      maxResponseTime: 480, // 8 hours
      examples: ['Mild lameness', 'Skin issues', 'Reduced appetite'],
    },
    LOW: {
      description: 'Routine care or minor issue',
      maxResponseTime: 1440, // 24 hours
      examples: ['Vaccination', 'Routine checkup', 'Minor wound'],
    },
  },
};
```

---

## 4. Confidence Scoring

### 4.1 Confidence Model

```typescript
// src/lib/ai/prompts/confidence/confidence-model.ts

export interface ConfidenceScore {
  /** Overall confidence (0.0-1.0) */
  overall: number;
  
  /** Component scores */
  components: {
    /** Symptom clarity (clear description = higher) */
    symptomClarity: number;
    
    /** Symptom-condition match strength */
    matchStrength: number;
    
    /** Uniqueness of symptoms (specific = higher) */
    diagnosticSpecificity: number;
    
    /** Data completeness (more info = higher) */
    dataCompleteness: number;
  };
  
  /** Factors that reduced confidence */
  uncertaintyFactors: string[];
  
  /** Threshold met for autonomous action */
  meetsThreshold: boolean;
  
  /** Recommended action based on confidence */
  recommendedAction: 'proceed' | 'human_review' | 'reject';
}

export const CONFIDENCE_THRESHOLDS = {
  /** Minimum confidence for autonomous action */
  autonomous: 0.85,
  
  /** Below this requires human review */
  humanReview: 0.7,
  
  /** Below this, reject and require human input */
  reject: 0.3,
  
  /** Pipeline-specific thresholds */
  pipeline: {
    triage: { autonomous: 0.8, humanReview: 0.6 },
    diagnosis: { autonomous: 0.7, humanReview: 0.5 }, // More conservative
    assignment: { autonomous: 0.9, humanReview: 0.7 },
    emergency: { autonomous: 0.75, humanReview: 0.5 }, // Err on caution
  },
};
```

### 4.2 Confidence Calculator

```typescript
// src/lib/ai/prompts/confidence/confidence-calculator.ts

export class ConfidenceCalculator {
  calculateOverall(components: ConfidenceScore['components']): number {
    // Weighted average
    const weights = {
      symptomClarity: 0.25,
      matchStrength: 0.35,
      diagnosticSpecificity: 0.25,
      dataCompleteness: 0.15,
    };
    
    let sum = 0;
    let weightSum = 0;
    
    for (const [key, weight] of Object.entries(weights)) {
      const score = components[key as keyof typeof components];
      sum += score * weight;
      weightSum += weight;
    }
    
    return sum / weightSum;
  }
  
  assessConfidence(
    output: DiagnosisOutput,
    input: DiagnosisInput,
    pipeline: string
  ): ConfidenceScore {
    const components = {
      symptomClarity: this.assessSymptomClarity(input),
      matchStrength: this.assessMatchStrength(output),
      diagnosticSpecificity: this.assessSpecificity(output),
      dataCompleteness: this.assessDataCompleteness(input),
    };
    
    const overall = this.calculateOverall(components);
    const thresholds = CONFIDENCE_THRESHOLDS.pipeline[pipeline] ?? CONFIDENCE_THRESHOLDS;
    
    const uncertaintyFactors: string[] = [];
    
    if (components.symptomClarity < 0.5) {
      uncertaintyFactors.push('Symptom description is vague or incomplete');
    }
    if (components.matchStrength < 0.5) {
      uncertaintyFactors.push('Symptoms do not clearly match known conditions');
    }
    if (output.possibleConditions.length > 5) {
      uncertaintyFactors.push('Multiple conditions equally likely');
    }
    if (!input.animalProfile?.weight) {
      uncertaintyFactors.push('Missing animal weight information');
    }
    
    let recommendedAction: ConfidenceScore['recommendedAction'];
    if (overall >= thresholds.autonomous) {
      recommendedAction = 'proceed';
    } else if (overall >= thresholds.humanReview) {
      recommendedAction = 'human_review';
    } else {
      recommendedAction = 'reject';
    }
    
    return {
      overall,
      components,
      uncertaintyFactors,
      meetsThreshold: overall >= thresholds.autonomous,
      recommendedAction,
    };
  }
  
  private assessSymptomClarity(input: DiagnosisInput): number {
    const description = input.symptoms || '';
    
    let score = 0.5; // Base score
    
    // Length check (too short = unclear)
    if (description.length > 50) score += 0.1;
    if (description.length > 100) score += 0.1;
    
    // Contains duration info
    if (/\d+\s*(দিন|ঘণ্টা|day|hour)/i.test(description)) score += 0.1;
    
    // Contains severity indicators
    if (/(মারাত্মক|তীব্র|severe|serious)/i.test(description)) score += 0.1;
    
    // Contains specific symptoms
    if (/(জ্বর|ডায়রিয়া|fever|diarrhea|lameness)/i.test(description)) score += 0.1;
    
    return Math.min(score, 1.0);
  }
  
  private assessMatchStrength(output: DiagnosisOutput): number {
    if (!output.possibleConditions?.length) return 0;
    
    // Top condition confidence
    const topConfidence = output.possibleConditions[0]?.confidence ?? 0;
    
    // Gap between top conditions (larger gap = more certain)
    const secondConfidence = output.possibleConditions[1]?.confidence ?? 0;
    const gap = topConfidence - secondConfidence;
    
    // Combine: high top confidence + large gap = strong match
    return topConfidence * 0.7 + Math.min(gap * 2, 1) * 0.3;
  }
  
  private assessSpecificity(output: DiagnosisOutput): number {
    // Fewer conditions = more specific
    const conditionCount = output.possibleConditions?.length ?? 0;
    
    if (conditionCount === 0) return 0;
    if (conditionCount === 1) return 1.0;
    if (conditionCount === 2) return 0.8;
    if (conditionCount <= 4) return 0.6;
    if (conditionCount <= 6) return 0.4;
    return 0.2;
  }
  
  private assessDataCompleteness(input: DiagnosisInput): number {
    let score = 0;
    const fields = [
      'symptoms',
      'animalProfile.species',
      'animalProfile.age',
      'animalProfile.weight',
      'animalProfile.sex',
      'medicalHistory',
      'images',
    ];
    
    const maxScore = fields.length;
    
    if (input.symptoms) score++;
    if (input.animalProfile?.species) score++;
    if (input.animalProfile?.age) score++;
    if (input.animalProfile?.weight) score++;
    if (input.animalProfile?.sex) score++;
    if (input.medicalHistory) score++;
    if (input.images?.length) score++;
    
    return score / maxScore;
  }
}
```

---

## 5. Human Escalation

### 5.1 Escalation Rules

```typescript
// src/lib/ai/prompts/escalation/escalation-rules.ts

export interface EscalationRule {
  id: string;
  name: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  condition: (output: unknown, context: EscalationContext) => boolean;
  action: EscalationAction;
  notification: EscalationNotification;
}

export interface EscalationAction {
  type: 'require_review' | 'notify' | 'block' | 'redirect';
  targetRole?: string;
  queueName?: string;
  timeout?: number;
}

export interface EscalationNotification {
  channels: ('in_app' | 'sms' | 'push' | 'email')[];
  template: string;
  urgency: 'immediate' | 'normal';
}

export const ESCALATION_RULES: EscalationRule[] = [
  {
    id: 'low_confidence',
    name: 'Low AI Confidence',
    priority: 'high',
    condition: (output: DiagnosisOutput) => 
      output.confidence < CONFIDENCE_THRESHOLDS.humanReview,
    action: {
      type: 'require_review',
      targetRole: 'DOCTOR',
      queueName: 'ai-review-queue',
      timeout: 3600, // 1 hour
    },
    notification: {
      channels: ['in_app', 'push'],
      template: 'ai_review_required',
      urgency: 'normal',
    },
  },
  {
    id: 'emergency_detected',
    name: 'Emergency Condition Detected',
    priority: 'critical',
    condition: (output: TriageOutput) => 
      output.urgency === 'CRITICAL',
    action: {
      type: 'notify',
      targetRole: 'DOCTOR',
    },
    notification: {
      channels: ['in_app', 'sms', 'push'],
      template: 'emergency_escalation',
      urgency: 'immediate',
    },
  },
  {
    id: 'dangerous_condition',
    name: 'Potentially Dangerous Condition',
    priority: 'high',
    condition: (output: DiagnosisOutput) => 
      output.possibleConditions.some(c => 
        ['Anthrax', 'Rabies', 'Avian Influenza'].includes(c.name)
      ),
    action: {
      type: 'require_review',
      targetRole: 'DOCTOR',
    },
    notification: {
      channels: ['in_app', 'sms'],
      template: 'dangerous_condition_review',
      urgency: 'immediate',
    },
  },
  {
    id: 'zoonotic_risk',
    name: 'Zoonotic Disease Risk',
    priority: 'critical',
    condition: (output: DiagnosisOutput) => 
      output.possibleConditions.some(c => c.zoonoticRisk),
    action: {
      type: 'block',
    },
    notification: {
      channels: ['in_app', 'sms', 'email'],
      template: 'zoonotic_risk_alert',
      urgency: 'immediate',
    },
  },
  {
    id: 'multiple_animals',
    name: 'Multiple Animals Affected (Outbreak)',
    priority: 'high',
    condition: (_, context) => 
      context.additionalInfo?.affectedAnimals > 3,
    action: {
      type: 'notify',
      targetRole: 'ADMIN',
    },
    notification: {
      channels: ['in_app', 'email'],
      template: 'potential_outbreak',
      urgency: 'immediate',
    },
  },
];
```

### 5.2 Escalation Manager

```typescript
// src/lib/ai/prompts/escalation/escalation-manager.ts

export class EscalationManager {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly queueService: QueueService,
    private readonly auditLogger: AuditLogger,
  ) {}
  
  async evaluate(
    output: unknown,
    context: EscalationContext
  ): Promise<EscalationResult> {
    const triggeredRules: TriggeredRule[] = [];
    
    for (const rule of ESCALATION_RULES) {
      if (rule.condition(output, context)) {
        triggeredRules.push({
          rule,
          triggeredAt: new Date(),
        });
      }
    }
    
    if (triggeredRules.length === 0) {
      return { escalated: false, rules: [] };
    }
    
    // Sort by priority
    triggeredRules.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.rule.priority] - priorityOrder[b.rule.priority];
    });
    
    // Execute escalation actions
    const actions: ExecutedAction[] = [];
    
    for (const triggered of triggeredRules) {
      const action = await this.executeAction(triggered.rule, output, context);
      actions.push(action);
      
      await this.auditLogger.log({
        type: 'ai_escalation',
        ruleId: triggered.rule.id,
        ruleName: triggered.rule.name,
        priority: triggered.rule.priority,
        requestId: context.requestId,
        userId: context.userId,
        output: this.sanitizeForLog(output),
      });
    }
    
    return {
      escalated: true,
      rules: triggeredRules.map(t => t.rule.id),
      highestPriority: triggeredRules[0].rule.priority,
      actions,
      requiresBlocking: actions.some(a => a.type === 'block'),
    };
  }
  
  private async executeAction(
    rule: EscalationRule,
    output: unknown,
    context: EscalationContext
  ): Promise<ExecutedAction> {
    const { action, notification } = rule;
    
    // Send notifications
    await this.sendNotifications(notification, context, rule);
    
    // Execute action
    switch (action.type) {
      case 'require_review':
        await this.queueService.enqueue(action.queueName!, {
          requestId: context.requestId,
          output,
          rule: rule.id,
          targetRole: action.targetRole,
          timeout: action.timeout,
        });
        return { type: 'require_review', queued: true };
        
      case 'block':
        return { type: 'block', blocked: true };
        
      case 'notify':
        return { type: 'notify', notified: true };
        
      case 'redirect':
        return { type: 'redirect', redirectTo: action.targetRole };
    }
  }
  
  private async sendNotifications(
    notification: EscalationNotification,
    context: EscalationContext,
    rule: EscalationRule
  ): Promise<void> {
    for (const channel of notification.channels) {
      await this.notificationService.send({
        channel,
        template: notification.template,
        urgency: notification.urgency,
        recipient: context.userId,
        data: {
          requestId: context.requestId,
          ruleName: rule.name,
          priority: rule.priority,
        },
      });
    }
  }
}
```

---

## 6. Pipeline Prompts

### 6.1 Triage Prompt Template

```typescript
// src/lib/ai/prompts/templates/triage.template.ts

export class TriagePromptTemplate extends BasePromptTemplate<TriageInput, TriageOutput> {
  readonly id = 'triage-v1';
  readonly version = '1.0.0';
  readonly pipeline = 'triage';
  readonly description = 'Triage incoming service requests to determine urgency and routing';
  
  protected getSystemPromptContent(): string {
    return `You are a veterinary triage assistant for Prani Doctor, a livestock healthcare platform in Bangladesh.

YOUR ROLE:
- Assess the urgency of incoming animal health concerns
- Determine the appropriate response type
- Flag emergencies that need immediate attention
- Route to appropriate provider type (Doctor or AI Technician)

BANGLADESH CONTEXT:
- Primary livestock: Cattle (cows), Goats, Poultry (chickens, ducks)
- Common endemic diseases: FMD, PPR, Lumpy Skin Disease, Anthrax, Black Quarter
- Seasonal considerations: Monsoon increases certain disease risks
- Rural farmers may describe symptoms in Bengali using local terms

URGENCY LEVELS:
- CRITICAL: Life-threatening, requires immediate response (≤30 min)
- HIGH: Serious condition, prompt attention needed (≤2 hours)
- MEDIUM: Needs attention but not immediately life-threatening (≤8 hours)
- LOW: Routine care or minor issue (≤24 hours)

SERVICE TYPES:
- EMERGENCY_DOCTOR: For critical/high urgency clinical cases
- DOCTOR_HOME_VISIT: For cases requiring physical examination
- DOCTOR_ONLINE_CONSULTATION: For non-emergency consultations
- AI_TECHNICIAN_SERVICE: For breeding, vaccination, deworming

CRITICAL RULE: When in doubt about urgency, ALWAYS err on the side of caution and escalate.`;
  }
  
  protected buildUserPromptContent(input: TriageInput): string {
    return `Please triage the following service request:

ANIMAL INFORMATION:
- Species: ${input.animalProfile.species}
- Breed: ${input.animalProfile.breed || 'Unknown'}
- Age: ${input.animalProfile.age || 'Unknown'}
- Weight: ${input.animalProfile.weight ? `${input.animalProfile.weight} kg` : 'Unknown'}
- Sex: ${input.animalProfile.sex || 'Unknown'}

REPORTED SYMPTOMS:
${input.symptoms}

${input.additionalNotes ? `ADDITIONAL NOTES:\n${input.additionalNotes}` : ''}

${input.customerUrgency ? `CUSTOMER'S URGENCY PERCEPTION: ${input.customerUrgency}` : ''}

Please analyze and provide triage assessment.`;
  }
  
  protected getOutputSchemaDefinition(): JSONSchema {
    return {
      type: 'object',
      required: ['urgency', 'serviceType', 'reasoning', 'confidence', 'requiresHumanReview'],
      properties: {
        urgency: {
          type: 'string',
          enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
          description: 'Assessed urgency level',
        },
        serviceType: {
          type: 'string',
          enum: [
            'EMERGENCY_DOCTOR',
            'DOCTOR_HOME_VISIT',
            'DOCTOR_ONLINE_CONSULTATION',
            'AI_TECHNICIAN_SERVICE',
          ],
          description: 'Recommended service type',
        },
        estimatedResponseTime: {
          type: 'number',
          description: 'Maximum recommended response time in minutes',
        },
        primaryConcerns: {
          type: 'array',
          items: { type: 'string' },
          description: 'Main symptoms/concerns identified',
        },
        possibleConditions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              likelihood: { type: 'string', enum: ['high', 'medium', 'low'] },
            },
          },
          description: 'Possible conditions (preliminary, not diagnosis)',
        },
        immediateCareAdvice: {
          type: 'string',
          description: 'Immediate steps the farmer can take (in Bengali context)',
        },
        warningSignsToWatch: {
          type: 'array',
          items: { type: 'string' },
          description: 'Signs that would indicate worsening condition',
        },
        reasoning: {
          type: 'string',
          description: 'Brief explanation of triage decision',
        },
        confidence: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Confidence in assessment (0.0-1.0)',
        },
        requiresHumanReview: {
          type: 'boolean',
          description: 'Whether this needs human review before action',
        },
        emergencyFlags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Any emergency indicators detected',
        },
      },
    };
  }
  
  protected parseOutputContent(raw: string): TriageOutput {
    const parsed = JSON.parse(raw);
    return {
      urgency: parsed.urgency,
      serviceType: parsed.serviceType,
      estimatedResponseTime: parsed.estimatedResponseTime,
      primaryConcerns: parsed.primaryConcerns ?? [],
      possibleConditions: parsed.possibleConditions ?? [],
      immediateCareAdvice: parsed.immediateCareAdvice,
      warningSignsToWatch: parsed.warningSignsToWatch ?? [],
      reasoning: parsed.reasoning,
      confidence: parsed.confidence,
      requiresHumanReview: parsed.requiresHumanReview,
      emergencyFlags: parsed.emergencyFlags ?? [],
    };
  }
  
  getExamples(): PromptExample[] {
    return [
      {
        input: `ANIMAL: Cattle, Holstein Friesian, 4 years, 450kg, Female
SYMPTOMS: গরু হঠাৎ দাঁড়াতে পারছে না, মুখ দিয়ে লালা পড়ছে, পেট ফুলে গেছে, শ্বাস কষ্ট হচ্ছে`,
        output: JSON.stringify({
          urgency: 'CRITICAL',
          serviceType: 'EMERGENCY_DOCTOR',
          estimatedResponseTime: 30,
          primaryConcerns: ['Unable to stand', 'Bloated abdomen', 'Respiratory distress'],
          possibleConditions: [
            { name: 'Bloat (Tympany)', likelihood: 'high' },
            { name: 'Milk fever', likelihood: 'medium' },
          ],
          immediateCareAdvice: 'গরুকে দাঁড় করানোর চেষ্টা করবেন না। পানি বা খাবার দেবেন না। মুখ পরিষ্কার রাখুন।',
          warningSignsToWatch: ['Worsening breathing', 'Blue gums', 'Loss of consciousness'],
          reasoning: 'Bloated abdomen with respiratory distress and inability to stand indicates potentially fatal bloat requiring immediate veterinary intervention.',
          confidence: 0.85,
          requiresHumanReview: false,
          emergencyFlags: ['respiratory_distress', 'bloated_abdomen', 'inability_to_stand'],
        }),
      },
    ];
  }
}
```

### 6.2 Diagnosis Prompt Template

```typescript
// src/lib/ai/prompts/templates/diagnosis.template.ts

export class DiagnosisPromptTemplate extends BasePromptTemplate<DiagnosisInput, DiagnosisOutput> {
  readonly id = 'diagnosis-v1';
  readonly version = '1.0.0';
  readonly pipeline = 'diagnosis';
  readonly description = 'Assist with differential diagnosis for livestock conditions';
  
  protected getSystemPromptContent(): string {
    return `You are a veterinary diagnostic assistant for Prani Doctor, supporting livestock healthcare in Bangladesh.

YOUR ROLE:
- Analyze symptoms to suggest possible conditions
- Provide differential diagnosis with confidence levels
- Suggest appropriate diagnostic tests
- NEVER provide definitive diagnoses - only possibilities for veterinary consideration

IMPORTANT DISCLAIMERS (MUST INCLUDE IN ALL RESPONSES):
- This is AI-assisted analysis, NOT a definitive diagnosis
- All suggestions require verification by a qualified veterinarian
- Treatment should only be initiated by licensed professionals
- In emergencies, physical examination takes priority over remote analysis

DIAGNOSTIC APPROACH:
1. Analyze reported symptoms systematically
2. Consider species-specific conditions
3. Factor in regional prevalence (Bangladesh)
4. Consider seasonal factors
5. Rank conditions by likelihood
6. Identify key differentiating symptoms
7. Suggest confirmatory tests if needed

CONFIDENCE SCORING:
- Score represents how well symptoms match known conditions
- NOT certainty of actual diagnosis
- High confidence (>0.8): Symptoms clearly match specific condition
- Medium confidence (0.5-0.8): Multiple conditions possible
- Low confidence (<0.5): Unclear presentation, needs more info

BANGLADESH VETERINARY CONTEXT:
- Common cattle diseases: Mastitis, Milk fever, FMD, LSD, Anthrax, HS, BQ
- Common goat diseases: PPR, Pneumonia, Enterotoxemia, Coccidiosis
- Common poultry diseases: Newcastle, Gumboro, Fowl pox, Coccidiosis`;
  }
  
  protected buildUserPromptContent(input: DiagnosisInput): string {
    let prompt = `Please analyze the following case for differential diagnosis:

ANIMAL PROFILE:
- Species: ${input.animalProfile.species}
- Breed: ${input.animalProfile.breed || 'Unknown'}
- Age: ${input.animalProfile.age || 'Unknown'}
- Weight: ${input.animalProfile.weight ? `${input.animalProfile.weight} kg` : 'Unknown'}
- Sex: ${input.animalProfile.sex || 'Unknown'}
- Reproductive status: ${input.animalProfile.reproductiveStatus || 'Unknown'}

PRESENTING SYMPTOMS:
${input.symptoms}

SYMPTOM ONSET: ${input.onsetDuration || 'Not specified'}
SYMPTOM PROGRESSION: ${input.progression || 'Not specified'}`;

    if (input.medicalHistory) {
      prompt += `\n\nMEDICAL HISTORY:\n${input.medicalHistory}`;
    }
    
    if (input.vaccinationHistory) {
      prompt += `\n\nVACCINATION HISTORY:\n${input.vaccinationHistory}`;
    }
    
    if (input.recentEvents) {
      prompt += `\n\nRECENT EVENTS (diet change, stress, etc.):\n${input.recentEvents}`;
    }
    
    if (input.environmentalFactors) {
      prompt += `\n\nENVIRONMENTAL FACTORS:\n${input.environmentalFactors}`;
    }
    
    if (input.images?.length) {
      prompt += `\n\n[${input.images.length} image(s) attached for analysis]`;
    }
    
    prompt += `\n\nPlease provide differential diagnosis analysis.`;
    
    return prompt;
  }
  
  protected getOutputSchemaDefinition(): JSONSchema {
    return {
      type: 'object',
      required: ['possibleConditions', 'urgencyAssessment', 'recommendedActions', 'confidence', 'requiresHumanReview', 'disclaimer'],
      properties: {
        possibleConditions: {
          type: 'array',
          items: {
            type: 'object',
            required: ['name', 'confidence', 'keySymptomMatches'],
            properties: {
              name: { type: 'string', description: 'Condition name' },
              confidence: { type: 'number', minimum: 0, maximum: 1 },
              keySymptomMatches: { type: 'array', items: { type: 'string' } },
              missingSymptoms: { type: 'array', items: { type: 'string' } },
              differentiatingFeatures: { type: 'string' },
              zoonoticRisk: { type: 'boolean' },
              notifiable: { type: 'boolean', description: 'Reportable disease' },
            },
          },
          description: 'Ranked list of possible conditions',
        },
        urgencyAssessment: {
          type: 'object',
          properties: {
            level: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
            reasoning: { type: 'string' },
          },
        },
        suggestedTests: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              test: { type: 'string' },
              purpose: { type: 'string' },
              priority: { type: 'string', enum: ['essential', 'recommended', 'optional'] },
            },
          },
        },
        recommendedActions: {
          type: 'object',
          properties: {
            immediate: { type: 'array', items: { type: 'string' } },
            shortTerm: { type: 'array', items: { type: 'string' } },
            monitoring: { type: 'array', items: { type: 'string' } },
          },
        },
        additionalInfoNeeded: {
          type: 'array',
          items: { type: 'string' },
          description: 'Additional information that would help diagnosis',
        },
        confidence: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Overall confidence in the analysis',
        },
        requiresHumanReview: {
          type: 'boolean',
        },
        reasoning: {
          type: 'string',
          description: 'Explanation of diagnostic reasoning',
        },
        disclaimer: {
          type: 'string',
          description: 'Medical disclaimer (required)',
        },
      },
    };
  }
  
  protected parseOutputContent(raw: string): DiagnosisOutput {
    const parsed = JSON.parse(raw);
    
    // Ensure disclaimer is present
    if (!parsed.disclaimer) {
      parsed.disclaimer = 'This AI-generated analysis is for informational purposes only. It is NOT a definitive diagnosis. All treatment decisions must be made by a qualified veterinarian after proper examination.';
    }
    
    return parsed as DiagnosisOutput;
  }
}
```

### 6.3 Image Analysis Prompt Template

```typescript
// src/lib/ai/prompts/templates/image-analysis.template.ts

export class ImageAnalysisPromptTemplate extends BasePromptTemplate<ImageAnalysisInput, ImageAnalysisOutput> {
  readonly id = 'image-analysis-v1';
  readonly version = '1.0.0';
  readonly pipeline = 'image';
  readonly description = 'Analyze images of animals for visible symptoms and conditions';
  
  protected getSystemPromptContent(): string {
    return `You are a veterinary image analysis assistant for Prani Doctor, analyzing photos of livestock in Bangladesh.

YOUR ROLE:
- Identify visible symptoms or abnormalities in images
- Describe observations objectively
- Suggest possible conditions based on visual findings
- Flag images requiring urgent attention

ANALYSIS CATEGORIES:
1. SKIN/COAT: Lesions, lumps, swelling, hair loss, color changes
2. EYES: Discharge, cloudiness, swelling, abnormal appearance
3. BODY CONDITION: Weight, posture, symmetry
4. MOVEMENT/POSTURE: If visible, abnormal stance or position
5. VISIBLE INJURIES: Wounds, abrasions, bleeding
6. DISCHARGE: From any body opening

IMAGE QUALITY ASSESSMENT:
- Rate image quality (good/fair/poor)
- Note any limitations (blurry, poor lighting, partial view)
- Request better images if analysis is limited

LIMITATIONS:
- Cannot assess internal conditions
- Cannot measure vital signs
- Cannot smell or palpate
- Limited to visible findings only

ALWAYS:
- Describe what you can see objectively
- State confidence in observations
- Recommend physical examination for confirmation
- Flag any emergency-appearing conditions`;
  }
  
  protected buildUserPromptContent(input: ImageAnalysisInput): string {
    return `Please analyze the attached image(s) of an animal:

ANIMAL INFORMATION:
- Species: ${input.animalProfile.species}
- Breed: ${input.animalProfile.breed || 'Unknown'}
- Age: ${input.animalProfile.age || 'Unknown'}

IMAGE CONTEXT:
- Area of concern: ${input.areaOfConcern || 'General assessment requested'}
- Farmer's description: ${input.farmerDescription || 'None provided'}

NUMBER OF IMAGES: ${input.imageCount || 1}

Please provide detailed visual analysis.`;
  }
  
  protected getOutputSchemaDefinition(): JSONSchema {
    return {
      type: 'object',
      required: ['imageQuality', 'observations', 'possibleFindings', 'confidence', 'recommendations'],
      properties: {
        imageQuality: {
          type: 'object',
          properties: {
            rating: { type: 'string', enum: ['good', 'fair', 'poor'] },
            limitations: { type: 'array', items: { type: 'string' } },
            betterImageNeeded: { type: 'boolean' },
          },
        },
        observations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              description: { type: 'string' },
              location: { type: 'string' },
              severity: { type: 'string', enum: ['mild', 'moderate', 'severe'] },
            },
          },
        },
        possibleFindings: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              finding: { type: 'string' },
              confidence: { type: 'number' },
              supportingObservations: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        emergencyIndicators: {
          type: 'array',
          items: { type: 'string' },
        },
        recommendations: {
          type: 'object',
          properties: {
            immediateAction: { type: 'string' },
            furtherExamination: { type: 'array', items: { type: 'string' } },
            additionalImages: { type: 'array', items: { type: 'string' } },
          },
        },
        confidence: { type: 'number' },
        requiresHumanReview: { type: 'boolean' },
        disclaimer: { type: 'string' },
      },
    };
  }
  
  protected parseOutputContent(raw: string): ImageAnalysisOutput {
    const parsed = JSON.parse(raw);
    
    if (!parsed.disclaimer) {
      parsed.disclaimer = 'Image analysis provides visual observations only. Physical examination by a veterinarian is required for accurate assessment.';
    }
    
    return parsed as ImageAnalysisOutput;
  }
}
```

---

## 7. Prompt Engineering Guidelines

### 7.1 Best Practices

| Guideline | Description | Example |
|-----------|-------------|---------|
| **Be Specific** | Avoid vague instructions | "Provide exactly 3-5 possible conditions" |
| **Provide Context** | Include relevant domain info | "In Bangladesh, FMD is endemic" |
| **Structured Output** | Always request JSON | Define explicit schema |
| **Include Examples** | Few-shot for consistency | Provide 1-3 examples |
| **Set Constraints** | Limit scope explicitly | "Do not provide treatment dosages" |
| **Request Confidence** | Always ask for confidence | "Rate confidence 0.0-1.0" |
| **Safety First** | Default to caution | "When uncertain, recommend consultation" |

### 7.2 Prompt Components

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         PROMPT STRUCTURE                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  SYSTEM PROMPT                                                                  │
│  ─────────────                                                                  │
│  1. ROLE DEFINITION                                                             │
│     "You are a veterinary [role] for Prani Doctor..."                          │
│                                                                                  │
│  2. CONTEXT                                                                     │
│     - Domain specifics (Bangladesh, livestock)                                  │
│     - Common conditions and terminology                                         │
│     - Regional considerations                                                   │
│                                                                                  │
│  3. RULES/CONSTRAINTS                                                           │
│     - What to do and not do                                                     │
│     - Safety requirements                                                       │
│     - Output requirements                                                       │
│                                                                                  │
│  4. OUTPUT FORMAT                                                               │
│     - JSON schema                                                               │
│     - Required fields                                                           │
│     - Examples                                                                  │
│                                                                                  │
│  USER PROMPT                                                                    │
│  ───────────                                                                    │
│  1. INPUT DATA                                                                  │
│     - Structured animal/symptom information                                     │
│     - Clearly labeled sections                                                  │
│                                                                                  │
│  2. TASK SPECIFICATION                                                          │
│     - What analysis is requested                                                │
│     - Any specific focus areas                                                  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| Vague instructions | Inconsistent outputs | Be explicit and specific |
| Missing examples | Format variation | Include few-shot examples |
| No confidence request | Can't assess reliability | Always require confidence |
| Open-ended output | Parsing failures | Use JSON schema |
| No safety constraints | Dangerous recommendations | Explicit safety rules |
| English-only | Misses local terms | Support Bengali input |

---

## 8. Localization Strategy

### 8.1 Bengali Input Handling

```typescript
// src/lib/ai/prompts/localization/bengali-handler.ts

export const BENGALI_SYMPTOM_MAPPINGS: Record<string, string[]> = {
  // Fever
  'fever': ['জ্বর', 'গা গরম', 'শরীর গরম'],
  
  // Diarrhea
  'diarrhea': ['পাতলা পায়খানা', 'ডায়রিয়া', 'পায়খানা'],
  
  // Not eating
  'anorexia': ['খাচ্ছে না', 'খাবার খায় না', 'রুচি নেই'],
  
  // Bloat
  'bloat': ['পেট ফোলা', 'পেট বড়', 'পেট ফুলে গেছে'],
  
  // Lameness
  'lameness': ['খোঁড়াচ্ছে', 'হাঁটতে পারছে না', 'পা টানছে'],
  
  // Respiratory distress
  'respiratory_distress': ['শ্বাস কষ্ট', 'ঘন ঘন শ্বাস', 'হাঁপাচ্ছে'],
  
  // Discharge
  'discharge': ['পুঁজ', 'রস বের হচ্ছে', 'পানি পড়ছে'],
  
  // Swelling
  'swelling': ['ফোলা', 'ফুলে গেছে', 'গোটা'],
  
  // Weakness
  'weakness': ['দুর্বল', 'শক্তি নেই', 'দাঁড়াতে পারছে না'],
};

export function extractBengaliSymptoms(text: string): string[] {
  const symptoms: string[] = [];
  
  for (const [standardTerm, bengaliTerms] of Object.entries(BENGALI_SYMPTOM_MAPPINGS)) {
    for (const bengaliTerm of bengaliTerms) {
      if (text.includes(bengaliTerm)) {
        symptoms.push(standardTerm);
        break;
      }
    }
  }
  
  return symptoms;
}
```

### 8.2 Response Localization

```typescript
// src/lib/ai/prompts/localization/response-localizer.ts

export const BENGALI_RESPONSES = {
  urgency: {
    CRITICAL: 'জরুরি - এখনই পশু চিকিৎসক প্রয়োজন',
    HIGH: 'গুরুত্বপূর্ণ - দ্রুত চিকিৎসা প্রয়োজন',
    MEDIUM: 'মাঝারি - চিকিৎসা প্রয়োজন',
    LOW: 'সাধারণ - নিয়মিত চিকিৎসা',
  },
  
  immediateCare: {
    'keep_hydrated': 'প্রচুর পরিষ্কার পানি দিন',
    'isolate': 'অন্য পশু থেকে আলাদা রাখুন',
    'do_not_feed': 'খাবার দেবেন না',
    'keep_clean': 'আক্রান্ত স্থান পরিষ্কার রাখুন',
    'monitor_closely': 'নিবিড়ভাবে পর্যবেক্ষণ করুন',
  },
  
  disclaimers: {
    diagnosis: 'এটি শুধুমাত্র প্রাথমিক ধারণা। সঠিক রোগ নির্ণয়ের জন্য পশু চিকিৎসকের পরামর্শ নিন।',
    emergency: 'জরুরি অবস্থায় অপেক্ষা না করে দ্রুত পশু চিকিৎসকের কাছে নিয়ে যান।',
  },
};
```

---

## 9. Testing & Validation

### 9.1 Prompt Testing Framework

```typescript
// src/lib/ai/prompts/testing/prompt-tester.ts

export interface PromptTestCase<TInput, TOutput> {
  id: string;
  name: string;
  input: TInput;
  expectedOutput: Partial<TOutput>;
  assertions: PromptAssertion<TOutput>[];
}

export interface PromptAssertion<T> {
  field: keyof T;
  operator: 'equals' | 'contains' | 'in_range' | 'not_empty' | 'matches_regex';
  expected: unknown;
}

export class PromptTester<TInput, TOutput> {
  constructor(private template: PromptTemplate<TInput, TOutput>) {}
  
  async runTestCase(
    testCase: PromptTestCase<TInput, TOutput>,
    provider: AiProvider
  ): Promise<TestResult> {
    const context = {
      system: this.template.buildSystemPrompt(),
      user: this.template.buildUserPrompt(testCase.input),
    };
    
    const response = await provider.complete({
      requestId: `test-${testCase.id}`,
      pipeline: this.template.pipeline,
      system: context.system,
      prompt: context.user,
      jsonMode: true,
    });
    
    const output = this.template.parseOutput(response.content);
    const assertionResults = this.runAssertions(output, testCase.assertions);
    
    return {
      testCase: testCase.id,
      passed: assertionResults.every(r => r.passed),
      output,
      assertions: assertionResults,
      latencyMs: response.latencyMs,
      tokens: response.usage.totalTokens,
    };
  }
  
  private runAssertions(
    output: TOutput,
    assertions: PromptAssertion<TOutput>[]
  ): AssertionResult[] {
    return assertions.map(assertion => {
      const actual = output[assertion.field];
      let passed: boolean;
      
      switch (assertion.operator) {
        case 'equals':
          passed = actual === assertion.expected;
          break;
        case 'contains':
          passed = String(actual).includes(String(assertion.expected));
          break;
        case 'in_range':
          const [min, max] = assertion.expected as [number, number];
          passed = Number(actual) >= min && Number(actual) <= max;
          break;
        case 'not_empty':
          passed = actual !== undefined && actual !== null && actual !== '';
          break;
        default:
          passed = false;
      }
      
      return {
        field: String(assertion.field),
        operator: assertion.operator,
        expected: assertion.expected,
        actual,
        passed,
      };
    });
  }
}
```

### 9.2 Test Cases

```typescript
// src/lib/ai/prompts/testing/test-cases/triage-tests.ts

export const TRIAGE_TEST_CASES: PromptTestCase<TriageInput, TriageOutput>[] = [
  {
    id: 'emergency-bloat',
    name: 'Should identify bloat as critical emergency',
    input: {
      animalProfile: { species: 'CATTLE', breed: 'Holstein', age: '4 years' },
      symptoms: 'গরু পেট ফুলে গেছে, শ্বাস নিতে কষ্ট হচ্ছে, দাঁড়াতে পারছে না',
    },
    expectedOutput: {
      urgency: 'CRITICAL',
      serviceType: 'EMERGENCY_DOCTOR',
    },
    assertions: [
      { field: 'urgency', operator: 'equals', expected: 'CRITICAL' },
      { field: 'confidence', operator: 'in_range', expected: [0.7, 1.0] },
      { field: 'emergencyFlags', operator: 'not_empty', expected: true },
    ],
  },
  {
    id: 'routine-vaccination',
    name: 'Should route vaccination to AI technician',
    input: {
      animalProfile: { species: 'CATTLE', breed: 'Local', age: '2 years' },
      symptoms: 'টিকা দিতে হবে, গরু সুস্থ আছে',
    },
    expectedOutput: {
      urgency: 'LOW',
      serviceType: 'AI_TECHNICIAN_SERVICE',
    },
    assertions: [
      { field: 'urgency', operator: 'equals', expected: 'LOW' },
      { field: 'serviceType', operator: 'equals', expected: 'AI_TECHNICIAN_SERVICE' },
    ],
  },
];
```

---

## 10. Implementation Guide

### 10.1 File Structure

```
src/lib/ai/prompts/
├── index.ts                    # Main exports
├── template.interface.ts       # Template interface
├── template-registry.ts        # Template registry
├── base-template.ts            # Base implementation
├── templates/
│   ├── triage.template.ts      # Triage prompts
│   ├── diagnosis.template.ts   # Diagnosis prompts
│   ├── assignment.template.ts  # Assignment prompts
│   ├── emergency.template.ts   # Emergency prompts
│   ├── voice.template.ts       # Voice prompts
│   ├── chat.template.ts        # Chat prompts
│   ├── image-analysis.template.ts
│   └── moderation.template.ts
├── context/
│   └── veterinary-context.ts   # Domain knowledge
├── confidence/
│   ├── confidence-model.ts     # Confidence types
│   └── confidence-calculator.ts
├── escalation/
│   ├── escalation-rules.ts     # Escalation rules
│   └── escalation-manager.ts
├── localization/
│   ├── bengali-handler.ts      # Bengali support
│   └── response-localizer.ts
└── testing/
    ├── prompt-tester.ts        # Testing framework
    └── test-cases/
        ├── triage-tests.ts
        └── diagnosis-tests.ts
```

### 10.2 Usage Example

```typescript
// Example: Using the triage pipeline

import { promptTemplateRegistry } from './prompts/template-registry';
import { TriagePromptTemplate } from './prompts/templates/triage.template';
import { ConfidenceCalculator } from './prompts/confidence/confidence-calculator';
import { EscalationManager } from './prompts/escalation/escalation-manager';

// Register template
promptTemplateRegistry.register(new TriagePromptTemplate());

// Process triage request
async function processTriage(input: TriageInput): Promise<TriageResult> {
  const template = promptTemplateRegistry.get<TriageInput, TriageOutput>('triage', 'triage-v1');
  
  // Build prompt
  const systemPrompt = template.buildSystemPrompt();
  const userPrompt = template.buildUserPrompt(input);
  
  // Call AI provider
  const response = await aiOrchestrator.process({
    type: 'triage',
    system: systemPrompt,
    prompt: userPrompt,
    jsonMode: true,
  });
  
  // Parse and validate output
  const output = template.parseOutput(response.content);
  const validation = template.validateOutput(output);
  
  if (!validation.valid) {
    throw new PromptValidationError(validation.errors);
  }
  
  // Calculate confidence
  const confidenceCalculator = new ConfidenceCalculator();
  const confidence = confidenceCalculator.assessConfidence(output, input, 'triage');
  
  // Check for escalation
  const escalationManager = new EscalationManager(/* ... */);
  const escalation = await escalationManager.evaluate(output, {
    requestId: response.requestId,
    userId: input.userId,
  });
  
  return {
    ...output,
    confidenceAssessment: confidence,
    escalation,
    requiresHumanReview: confidence.recommendedAction !== 'proceed',
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
| Memory System | `docs/ai/MEMORY_SYSTEM.md` |
| Emergency Engine | `docs/ai/EMERGENCY_ENGINE.md` |
| Cost Optimization | `docs/ai/COST_OPTIMIZATION.md` |

---

*End of PROMPT_SYSTEM.md*
