# AI ORCHESTRATOR — Prani Doctor

**Version:** 1.1.0  
**Last Updated:** 2026-05-21  
**Scope:** AI routing, provider abstraction, pipeline management, fallback chains

---

## Table of Contents

1. [Orchestrator Overview](#1-orchestrator-overview)
2. [Provider Abstraction Layer](#2-provider-abstraction-layer)
3. [Request Router](#3-request-router)
4. [Pipeline Architecture](#4-pipeline-architecture)
5. [Fallback Chain](#5-fallback-chain)
6. [Model Selection](#6-model-selection)
7. [Queue Integration](#7-queue-integration)
8. [Event-Driven Patterns](#8-event-driven-patterns)
9. [Health Monitoring](#9-health-monitoring)
10. [Implementation Guide](#10-implementation-guide)
11. [Memory Integration (MVP vs Phase 2)](#11-memory-integration-mvp-vs-phase-2)

---

## 1. Orchestrator Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         AI ORCHESTRATOR SYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                          REQUEST LAYER                                  │    │
│  │                                                                         │    │
│  │   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐          │    │
│  │   │  Mobile   │  │   Admin   │  │   Queue   │  │  Webhook  │          │    │
│  │   │    API    │  │    API    │  │   Worker  │  │  Handler  │          │    │
│  │   └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘          │    │
│  │         └───────────────┴───────────────┴─────────────┘                │    │
│  │                                │                                        │    │
│  └────────────────────────────────┼────────────────────────────────────────┘    │
│                                   │                                              │
│                                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                        AI REQUEST ROUTER                                │    │
│  │                                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │  Classify   │  │   Route     │  │   Budget    │  │   Rate      │   │    │
│  │  │  Request    │──│   Request   │──│   Check     │──│   Limit     │   │    │
│  │  │             │  │             │  │             │  │   Check     │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                                         │    │
│  └────────────────────────────────┬────────────────────────────────────────┘    │
│                                   │                                              │
│                                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                        PIPELINE EXECUTOR                                │    │
│  │                                                                         │    │
│  │   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐              │    │
│  │   │    TRIAGE     │  │   DIAGNOSIS   │  │  ASSIGNMENT   │              │    │
│  │   │   Pipeline    │  │   Pipeline    │  │   Pipeline    │              │    │
│  │   └───────────────┘  └───────────────┘  └───────────────┘              │    │
│  │   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐              │    │
│  │   │    VOICE      │  │     CHAT      │  │   EMERGENCY   │              │    │
│  │   │   Pipeline    │  │   Pipeline    │  │   Pipeline    │              │    │
│  │   └───────────────┘  └───────────────┘  └───────────────┘              │    │
│  │   ┌───────────────┐  ┌───────────────┐                                 │    │
│  │   │    IMAGE      │  │  MODERATION   │                                 │    │
│  │   │   Analysis    │  │   Pipeline    │                                 │    │
│  │   └───────────────┘  └───────────────┘                                 │    │
│  │                                                                         │    │
│  └────────────────────────────────┬────────────────────────────────────────┘    │
│                                   │                                              │
│                                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                     PROVIDER ABSTRACTION LAYER                          │    │
│  │                                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │   OpenAI    │  │  Anthropic  │  │   Gemini    │  │    Local    │   │    │
│  │  │  GPT-4/4o   │  │   Claude    │  │  (Future)   │  │   (Future)  │   │    │
│  │  │  (Primary)  │  │ (Secondary) │  │             │  │   Llama 3   │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                                         │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Principles

| Principle | Description |
|-----------|-------------|
| **Provider Agnostic** | Abstract all AI providers behind common interface |
| **Fail-Safe** | Graceful degradation to manual workflow |
| **Cost-Conscious** | Token budgeting and caching at every level |
| **Auditable** | Complete logging via `AiUsageRecord` (`AiAuditLogger`) — see `TABLE_STRUCTURE.md` §9.9 |
| **Human-in-Loop** | AI assists, humans decide for clinical matters |
| **Queue-Ready** | Non-blocking async processing support |
| **Event-Driven Ready** | Publish events for downstream consumers |

### 1.3 Request Types

| Type | Priority | Max Latency | Provider Selection |
|------|----------|-------------|-------------------|
| `EMERGENCY_TRIAGE` | Critical | <2s | Primary only, no fallback delay |
| `SYMPTOM_DIAGNOSIS` | High | <5s | Primary with fallback |
| `PROVIDER_ASSIGNMENT` | Medium | <10s | Any available |
| `VOICE_PROCESSING` | Medium | <3s | Primary only |
| `CHAT_RESPONSE` | Low | <15s | Cost-optimized |
| `IMAGE_ANALYSIS` | Medium | <10s | Vision-capable only |
| `CONTENT_MODERATION` | Low | <30s | Batch processing |

---

## 2. Provider Abstraction Layer

### 2.1 Provider Interface

```typescript
// src/lib/ai/providers/provider.interface.ts

export interface AiProvider {
  /** Provider identifier */
  readonly name: string;
  
  /** Provider display name */
  readonly displayName: string;
  
  /** Check if provider is currently available */
  isAvailable(): Promise<boolean>;
  
  /** Get current health status */
  getHealthStatus(): Promise<ProviderHealth>;
  
  /** Text completion */
  complete(request: CompletionRequest): Promise<CompletionResponse>;
  
  /** Chat completion (multi-turn) */
  chat(request: ChatRequest): Promise<ChatResponse>;
  
  /** Text embedding */
  embed(request: EmbedRequest): Promise<EmbedResponse>;
  
  /** Image analysis (if supported) */
  analyzeImage?(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse>;
  
  /** Speech-to-text (if supported) */
  transcribe?(request: TranscribeRequest): Promise<TranscribeResponse>;
  
  /** Text-to-speech (if supported) */
  synthesize?(request: SynthesizeRequest): Promise<SynthesizeResponse>;
  
  /** Estimate token count */
  estimateTokens(text: string): number;
  
  /** Get model capabilities */
  getCapabilities(): ProviderCapabilities;
}

export interface ProviderHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  latencyMs: number;
  errorRate: number;
  lastChecked: Date;
  message?: string;
}

export interface ProviderCapabilities {
  textCompletion: boolean;
  chat: boolean;
  embedding: boolean;
  imageAnalysis: boolean;
  speechToText: boolean;
  textToSpeech: boolean;
  functionCalling: boolean;
  jsonMode: boolean;
  maxContextTokens: number;
  maxOutputTokens: number;
  supportedLanguages: string[];
}
```

### 2.2 Completion Request/Response

```typescript
// src/lib/ai/providers/types.ts

export interface CompletionRequest {
  /** Request identifier for tracing */
  requestId: string;
  
  /** Pipeline that initiated request */
  pipeline: string;
  
  /** Model to use (provider-specific or generic) */
  model?: string;
  
  /** System prompt */
  system?: string;
  
  /** User prompt */
  prompt: string;
  
  /** Temperature (0-2, default 0.7) */
  temperature?: number;
  
  /** Max tokens to generate */
  maxTokens?: number;
  
  /** Stop sequences */
  stopSequences?: string[];
  
  /** Force JSON output */
  jsonMode?: boolean;
  
  /** JSON schema for structured output */
  responseSchema?: object;
  
  /** User identifier for rate limiting */
  userId?: string;
  
  /** Timeout in milliseconds */
  timeoutMs?: number;
}

export interface CompletionResponse {
  /** Request identifier */
  requestId: string;
  
  /** Generated content */
  content: string;
  
  /** Parsed JSON if jsonMode was true */
  json?: unknown;
  
  /** Token usage */
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  
  /** Cost in USD (estimated) */
  estimatedCost: number;
  
  /** Model that was used */
  model: string;
  
  /** Provider that handled request */
  provider: string;
  
  /** Processing time in ms */
  latencyMs: number;
  
  /** Finish reason */
  finishReason: 'complete' | 'max_tokens' | 'stop_sequence' | 'error';
}
```

### 2.3 OpenAI Provider Implementation

```typescript
// src/lib/ai/providers/openai.provider.ts

import OpenAI from 'openai';
import { AiProvider, CompletionRequest, CompletionResponse } from './types';

export class OpenAiProvider implements AiProvider {
  readonly name = 'openai';
  readonly displayName = 'OpenAI';
  
  private client: OpenAI;
  private defaultModel = 'gpt-4o';
  
  constructor(config: OpenAiConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organizationId,
      timeout: config.timeoutMs ?? 30000,
    });
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      const health = await this.getHealthStatus();
      return health.status !== 'unavailable';
    } catch {
      return false;
    }
  }
  
  async getHealthStatus(): Promise<ProviderHealth> {
    const start = Date.now();
    try {
      // Simple completion to check availability
      await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
      });
      
      return {
        status: 'healthy',
        latencyMs: Date.now() - start,
        errorRate: 0,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        status: 'unavailable',
        latencyMs: Date.now() - start,
        errorRate: 1,
        lastChecked: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const start = Date.now();
    const model = request.model ?? this.defaultModel;
    
    const messages: OpenAI.ChatCompletionMessageParam[] = [];
    
    if (request.system) {
      messages.push({ role: 'system', content: request.system });
    }
    messages.push({ role: 'user', content: request.prompt });
    
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1000,
        stop: request.stopSequences,
        response_format: request.jsonMode ? { type: 'json_object' } : undefined,
      });
      
      const content = response.choices[0]?.message?.content ?? '';
      const usage = response.usage;
      
      return {
        requestId: request.requestId,
        content,
        json: request.jsonMode ? JSON.parse(content) : undefined,
        usage: {
          promptTokens: usage?.prompt_tokens ?? 0,
          completionTokens: usage?.completion_tokens ?? 0,
          totalTokens: usage?.total_tokens ?? 0,
        },
        estimatedCost: this.calculateCost(model, usage),
        model,
        provider: this.name,
        latencyMs: Date.now() - start,
        finishReason: this.mapFinishReason(response.choices[0]?.finish_reason),
      };
    } catch (error) {
      throw new AiProviderError(this.name, 'complete', error);
    }
  }
  
  async analyzeImage(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse> {
    const start = Date.now();
    const model = 'gpt-4o'; // Vision-capable model
    
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: request.prompt },
          {
            type: 'image_url',
            image_url: {
              url: request.imageUrl,
              detail: request.detail ?? 'auto',
            },
          },
        ],
      },
    ];
    
    if (request.system) {
      messages.unshift({ role: 'system', content: request.system });
    }
    
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        max_tokens: request.maxTokens ?? 1000,
      });
      
      return {
        requestId: request.requestId,
        content: response.choices[0]?.message?.content ?? '',
        usage: {
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
          totalTokens: response.usage?.total_tokens ?? 0,
        },
        model,
        provider: this.name,
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      throw new AiProviderError(this.name, 'analyzeImage', error);
    }
  }
  
  getCapabilities(): ProviderCapabilities {
    return {
      textCompletion: true,
      chat: true,
      embedding: true,
      imageAnalysis: true,
      speechToText: true,
      textToSpeech: true,
      functionCalling: true,
      jsonMode: true,
      maxContextTokens: 128000,
      maxOutputTokens: 16384,
      supportedLanguages: ['en', 'bn', 'hi', 'ar', 'zh', 'es', 'fr', 'de'],
    };
  }
  
  estimateTokens(text: string): number {
    // Rough estimation: ~4 chars per token for English
    // Bengali may vary
    return Math.ceil(text.length / 4);
  }
  
  private calculateCost(model: string, usage?: OpenAI.CompletionUsage): number {
    if (!usage) return 0;
    
    // Pricing per 1M tokens (as of 2026)
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4o': { input: 2.50, output: 10.00 },
      'gpt-4o-mini': { input: 0.15, output: 0.60 },
      'gpt-4-turbo': { input: 10.00, output: 30.00 },
    };
    
    const modelPricing = pricing[model] ?? pricing['gpt-4o'];
    const inputCost = (usage.prompt_tokens / 1_000_000) * modelPricing.input;
    const outputCost = (usage.completion_tokens / 1_000_000) * modelPricing.output;
    
    return inputCost + outputCost;
  }
  
  private mapFinishReason(reason?: string): CompletionResponse['finishReason'] {
    switch (reason) {
      case 'stop': return 'complete';
      case 'length': return 'max_tokens';
      default: return 'complete';
    }
  }
}
```

### 2.4 Anthropic Provider Implementation

```typescript
// src/lib/ai/providers/anthropic.provider.ts

import Anthropic from '@anthropic-ai/sdk';
import { AiProvider, CompletionRequest, CompletionResponse } from './types';

export class AnthropicProvider implements AiProvider {
  readonly name = 'anthropic';
  readonly displayName = 'Anthropic Claude';
  
  private client: Anthropic;
  private defaultModel = 'claude-3-5-sonnet-20241022';
  
  constructor(config: AnthropicConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }
  
  async isAvailable(): Promise<boolean> {
    try {
      const health = await this.getHealthStatus();
      return health.status !== 'unavailable';
    } catch {
      return false;
    }
  }
  
  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const start = Date.now();
    const model = request.model ?? this.defaultModel;
    
    try {
      const response = await this.client.messages.create({
        model,
        system: request.system,
        messages: [{ role: 'user', content: request.prompt }],
        max_tokens: request.maxTokens ?? 1000,
        temperature: request.temperature ?? 0.7,
        stop_sequences: request.stopSequences,
      });
      
      const textContent = response.content.find(c => c.type === 'text');
      const content = textContent?.type === 'text' ? textContent.text : '';
      
      return {
        requestId: request.requestId,
        content,
        json: request.jsonMode ? JSON.parse(content) : undefined,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        estimatedCost: this.calculateCost(model, response.usage),
        model,
        provider: this.name,
        latencyMs: Date.now() - start,
        finishReason: this.mapStopReason(response.stop_reason),
      };
    } catch (error) {
      throw new AiProviderError(this.name, 'complete', error);
    }
  }
  
  getCapabilities(): ProviderCapabilities {
    return {
      textCompletion: true,
      chat: true,
      embedding: false, // Anthropic doesn't have embeddings
      imageAnalysis: true,
      speechToText: false,
      textToSpeech: false,
      functionCalling: true,
      jsonMode: false, // No native JSON mode, prompt-based
      maxContextTokens: 200000,
      maxOutputTokens: 8192,
      supportedLanguages: ['en', 'bn', 'hi', 'ar', 'zh', 'es', 'fr', 'de'],
    };
  }
  
  private calculateCost(model: string, usage: { input_tokens: number; output_tokens: number }): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
      'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
      'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
    };
    
    const modelPricing = pricing[model] ?? pricing['claude-3-5-sonnet-20241022'];
    const inputCost = (usage.input_tokens / 1_000_000) * modelPricing.input;
    const outputCost = (usage.output_tokens / 1_000_000) * modelPricing.output;
    
    return inputCost + outputCost;
  }
  
  private mapStopReason(reason?: string): CompletionResponse['finishReason'] {
    switch (reason) {
      case 'end_turn': return 'complete';
      case 'max_tokens': return 'max_tokens';
      case 'stop_sequence': return 'stop_sequence';
      default: return 'complete';
    }
  }
}
```

### 2.5 Future Provider Template

```typescript
// src/lib/ai/providers/gemini.provider.ts (FUTURE)

import { AiProvider, CompletionRequest, CompletionResponse } from './types';

export class GeminiProvider implements AiProvider {
  readonly name = 'gemini';
  readonly displayName = 'Google Gemini';
  
  // Implementation when Google Gemini is added
  // Follow same interface pattern as OpenAI/Anthropic
}

// src/lib/ai/providers/local.provider.ts (FUTURE)

export class LocalLlamaProvider implements AiProvider {
  readonly name = 'local-llama';
  readonly displayName = 'Local Llama 3';
  
  // Implementation for local model inference
  // Uses Ollama or vLLM backend
  // Primary use: offline fallback, cost reduction
}
```

### 2.6 Provider Registry

```typescript
// src/lib/ai/providers/registry.ts

export class ProviderRegistry {
  private providers: Map<string, AiProvider> = new Map();
  private healthCache: Map<string, ProviderHealth> = new Map();
  private healthCheckInterval = 30_000; // 30 seconds
  
  constructor() {
    // Start health check loop
    setInterval(() => this.checkAllHealth(), this.healthCheckInterval);
  }
  
  register(provider: AiProvider): void {
    this.providers.set(provider.name, provider);
    this.checkHealth(provider.name).catch(console.error);
  }
  
  get(name: string): AiProvider | undefined {
    return this.providers.get(name);
  }
  
  getAll(): AiProvider[] {
    return Array.from(this.providers.values());
  }
  
  getAvailable(): AiProvider[] {
    return this.getAll().filter(p => {
      const health = this.healthCache.get(p.name);
      return health?.status === 'healthy' || health?.status === 'degraded';
    });
  }
  
  getByCapability(capability: keyof ProviderCapabilities): AiProvider[] {
    return this.getAvailable().filter(p => {
      const caps = p.getCapabilities();
      return caps[capability] === true;
    });
  }
  
  async checkHealth(name: string): Promise<ProviderHealth> {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not registered`);
    }
    
    const health = await provider.getHealthStatus();
    this.healthCache.set(name, health);
    return health;
  }
  
  private async checkAllHealth(): Promise<void> {
    const checks = this.getAll().map(p => this.checkHealth(p.name).catch(() => null));
    await Promise.all(checks);
  }
}

// Singleton instance
export const providerRegistry = new ProviderRegistry();
```

---

## 3. Request Router

### 3.1 Router Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AI REQUEST ROUTER                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  Incoming Request                                                               │
│        │                                                                         │
│        ▼                                                                         │
│  ┌─────────────────┐                                                            │
│  │ 1. CLASSIFY     │  Determine request type (triage, diagnosis, etc.)         │
│  │    REQUEST      │                                                            │
│  └────────┬────────┘                                                            │
│           │                                                                      │
│           ▼                                                                      │
│  ┌─────────────────┐                                                            │
│  │ 2. VALIDATE     │  Check required fields, sanitize input                    │
│  │    INPUT        │                                                            │
│  └────────┬────────┘                                                            │
│           │                                                                      │
│           ▼                                                                      │
│  ┌─────────────────┐  No ──▶  Queue for later / Return error                   │
│  │ 3. CHECK BUDGET │──────────────────────────────────────▶                    │
│  │    & RATE LIMIT │                                                            │
│  └────────┬────────┘                                                            │
│           │ Yes                                                                  │
│           ▼                                                                      │
│  ┌─────────────────┐                                                            │
│  │ 4. CHECK CACHE  │  Hit ──▶  Return cached response                          │
│  │                 │──────────────────────────────────────▶                    │
│  └────────┬────────┘                                                            │
│           │ Miss                                                                 │
│           ▼                                                                      │
│  ┌─────────────────┐                                                            │
│  │ 5. SELECT       │  Based on: capability, health, cost, priority             │
│  │    PROVIDER     │                                                            │
│  └────────┬────────┘                                                            │
│           │                                                                      │
│           ▼                                                                      │
│  ┌─────────────────┐                                                            │
│  │ 6. EXECUTE      │  Call pipeline with selected provider                     │
│  │    PIPELINE     │                                                            │
│  └────────┬────────┘                                                            │
│           │                                                                      │
│           ▼                                                                      │
│  ┌─────────────────┐                                                            │
│  │ 7. POST-PROCESS │  Validate output, cache, log, return                      │
│  │    & LOG        │                                                            │
│  └─────────────────┘                                                            │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Router Implementation

```typescript
// src/lib/ai/router/ai-router.ts

export class AiRouter {
  constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly pipelineRegistry: PipelineRegistry,
    private readonly budgetManager: BudgetManager,
    private readonly rateLimiter: RateLimiter,
    private readonly cache: AiCache,
    private readonly auditLogger: AiAuditLogger,
  ) {}
  
  async route<T>(request: AiRouterRequest): Promise<AiRouterResponse<T>> {
    const requestId = request.requestId ?? generateRequestId();
    const startTime = Date.now();
    
    try {
      // 1. Classify request
      const classification = this.classifyRequest(request);
      
      // 2. Validate input
      this.validateInput(request, classification);
      
      // 3. Check budget and rate limits
      await this.checkConstraints(request, classification);
      
      // 4. Check cache
      const cached = await this.checkCache(request);
      if (cached) {
        await this.auditLogger.logCacheHit(requestId, request);
        return { ...cached, fromCache: true };
      }
      
      // 5. Select provider
      const provider = await this.selectProvider(classification);
      
      // 6. Execute pipeline
      const pipeline = this.pipelineRegistry.get(classification.pipeline);
      const result = await pipeline.execute(request, provider);
      
      // 7. Post-process
      await this.postProcess(requestId, request, result, startTime);
      
      return {
        requestId,
        success: true,
        data: result as T,
        provider: provider.name,
        latencyMs: Date.now() - startTime,
        fromCache: false,
      };
    } catch (error) {
      await this.handleError(requestId, request, error, startTime);
      throw error;
    }
  }
  
  private classifyRequest(request: AiRouterRequest): RequestClassification {
    // Priority-based classification
    if (request.isEmergency) {
      return { pipeline: 'emergency', priority: 'critical', maxLatencyMs: 2000 };
    }
    
    switch (request.type) {
      case 'triage':
        return { pipeline: 'triage', priority: 'high', maxLatencyMs: 5000 };
      case 'diagnosis':
        return { pipeline: 'diagnosis', priority: 'high', maxLatencyMs: 5000 };
      case 'assignment':
        return { pipeline: 'assignment', priority: 'medium', maxLatencyMs: 10000 };
      case 'voice':
        return { pipeline: 'voice', priority: 'medium', maxLatencyMs: 3000 };
      case 'chat':
        return { pipeline: 'chat', priority: 'low', maxLatencyMs: 15000 };
      case 'image':
        return { pipeline: 'image', priority: 'medium', maxLatencyMs: 10000 };
      case 'moderation':
        return { pipeline: 'moderation', priority: 'low', maxLatencyMs: 30000 };
      default:
        return { pipeline: 'generic', priority: 'low', maxLatencyMs: 30000 };
    }
  }
  
  private async selectProvider(classification: RequestClassification): Promise<AiProvider> {
    const capabilities = this.getRequiredCapabilities(classification.pipeline);
    const available = this.providerRegistry.getByCapability(capabilities.primary);
    
    if (available.length === 0) {
      throw new NoProviderAvailableError(classification.pipeline);
    }
    
    // Priority selection based on classification
    if (classification.priority === 'critical') {
      // For critical requests, use primary provider only (fastest)
      return available[0];
    }
    
    // For non-critical, consider cost optimization
    return this.selectCostOptimalProvider(available, classification);
  }
  
  private selectCostOptimalProvider(
    providers: AiProvider[],
    classification: RequestClassification
  ): AiProvider {
    // Scoring: health (40%), cost (40%), latency (20%)
    const scored = providers.map(p => {
      const health = this.providerRegistry.getHealth(p.name);
      const costScore = this.getCostScore(p);
      const latencyScore = health ? 1 - (health.latencyMs / 10000) : 0.5;
      const healthScore = health?.status === 'healthy' ? 1 : 0.5;
      
      return {
        provider: p,
        score: healthScore * 0.4 + costScore * 0.4 + latencyScore * 0.2,
      };
    });
    
    scored.sort((a, b) => b.score - a.score);
    return scored[0].provider;
  }
  
  private async checkConstraints(
    request: AiRouterRequest,
    classification: RequestClassification
  ): Promise<void> {
    // Check rate limits
    if (request.userId) {
      const limited = await this.rateLimiter.check(request.userId, classification.pipeline);
      if (limited) {
        throw new RateLimitExceededError(request.userId);
      }
    }
    
    // Check budget
    const withinBudget = await this.budgetManager.check(request.userId, request.estimatedTokens);
    if (!withinBudget) {
      throw new BudgetExceededError(request.userId);
    }
  }
  
  private async postProcess(
    requestId: string,
    request: AiRouterRequest,
    result: unknown,
    startTime: number
  ): Promise<void> {
    const latencyMs = Date.now() - startTime;
    
    // Cache result
    if (this.isCacheable(request)) {
      await this.cache.set(request, result);
    }
    
    // Update budget
    if (request.userId && result.usage) {
      await this.budgetManager.consume(request.userId, result.usage.totalTokens);
    }
    
    // Audit log
    await this.auditLogger.log({
      requestId,
      type: request.type,
      userId: request.userId,
      pipeline: request.type,
      provider: result.provider,
      tokens: result.usage?.totalTokens,
      cost: result.estimatedCost,
      latencyMs,
      success: true,
    });
  }
}
```

---

## 4. Pipeline Architecture

### 4.1 Pipeline Interface

```typescript
// src/lib/ai/pipelines/pipeline.interface.ts

export interface AiPipeline<TInput, TOutput> {
  /** Pipeline identifier */
  readonly name: string;
  
  /** Pipeline version */
  readonly version: string;
  
  /** Pipeline description */
  readonly description: string;
  
  /** Required provider capabilities */
  readonly requiredCapabilities: (keyof ProviderCapabilities)[];
  
  /** Pre-process input */
  preprocess(input: TInput): ProcessedInput;
  
  /** Validate processed input */
  validate(input: ProcessedInput): ValidationResult;
  
  /** Build prompt from input */
  buildPrompt(input: ProcessedInput): PromptContext;
  
  /** Execute pipeline */
  execute(input: TInput, provider: AiProvider): Promise<TOutput>;
  
  /** Post-process raw output */
  postprocess(raw: string, input: ProcessedInput): TOutput;
  
  /** Get safety checks */
  getSafetyChecks(): SafetyCheck[];
  
  /** Get human override points */
  getHumanOverridePoints(): OverridePoint[];
}

export interface ProcessedInput {
  original: unknown;
  normalized: unknown;
  metadata: Record<string, unknown>;
}

export interface PromptContext {
  system: string;
  user: string;
  examples?: Array<{ input: string; output: string }>;
  jsonSchema?: object;
}

export interface SafetyCheck {
  name: string;
  check: (output: unknown) => boolean;
  action: 'block' | 'flag' | 'log';
  message: string;
}

export interface OverridePoint {
  name: string;
  condition: (output: unknown) => boolean;
  action: 'require_review' | 'notify' | 'escalate';
}
```

### 4.2 Pipeline Registry

```typescript
// src/lib/ai/pipelines/registry.ts

export class PipelineRegistry {
  private pipelines: Map<string, AiPipeline<unknown, unknown>> = new Map();
  
  register<TInput, TOutput>(pipeline: AiPipeline<TInput, TOutput>): void {
    this.pipelines.set(pipeline.name, pipeline as AiPipeline<unknown, unknown>);
  }
  
  get<TInput, TOutput>(name: string): AiPipeline<TInput, TOutput> {
    const pipeline = this.pipelines.get(name);
    if (!pipeline) {
      throw new PipelineNotFoundError(name);
    }
    return pipeline as AiPipeline<TInput, TOutput>;
  }
  
  getAll(): AiPipeline<unknown, unknown>[] {
    return Array.from(this.pipelines.values());
  }
}

export const pipelineRegistry = new PipelineRegistry();

// Register all pipelines
pipelineRegistry.register(new TriagePipeline());
pipelineRegistry.register(new DiagnosisPipeline());
pipelineRegistry.register(new AssignmentPipeline());
pipelineRegistry.register(new EmergencyPipeline());
pipelineRegistry.register(new VoicePipeline());
pipelineRegistry.register(new ChatPipeline());
pipelineRegistry.register(new ImageAnalysisPipeline());
pipelineRegistry.register(new ModerationPipeline());
```

---

## 5. Fallback Chain

### 5.1 Fallback Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FALLBACK CHAIN                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  LEVEL 1: PRIMARY PROVIDER                                          │       │
│  │  ─────────────────────────────                                      │       │
│  │  OpenAI GPT-4o (default)                                            │       │
│  │  • Highest quality                                                  │       │
│  │  • Best for complex reasoning                                       │       │
│  │  • Retry: 2 attempts with exponential backoff                       │       │
│  └───────────────────────────────────┬─────────────────────────────────┘       │
│                                      │ Fail                                     │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  LEVEL 2: SECONDARY PROVIDER                                        │       │
│  │  ────────────────────────────                                       │       │
│  │  Anthropic Claude 3.5 Sonnet                                        │       │
│  │  • Similar capabilities                                             │       │
│  │  • Different failure modes                                          │       │
│  │  • Retry: 2 attempts                                                │       │
│  └───────────────────────────────────┬─────────────────────────────────┘       │
│                                      │ Fail                                     │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  LEVEL 3: LIGHTWEIGHT MODEL                                         │       │
│  │  ───────────────────────────                                        │       │
│  │  OpenAI GPT-4o-mini / Claude Haiku                                  │       │
│  │  • Faster, cheaper                                                  │       │
│  │  • Lower quality acceptable for degraded mode                       │       │
│  │  • Retry: 1 attempt                                                 │       │
│  └───────────────────────────────────┬─────────────────────────────────┘       │
│                                      │ Fail                                     │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  LEVEL 4: CACHED RESPONSE                                           │       │
│  │  ────────────────────────                                           │       │
│  │  Return cached similar response if available                        │       │
│  │  • Semantic similarity search                                       │       │
│  │  • Flag as "approximate"                                            │       │
│  └───────────────────────────────────┬─────────────────────────────────┘       │
│                                      │ No cache                                 │
│                                      ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │  LEVEL 5: GRACEFUL DEGRADATION                                      │       │
│  │  ─────────────────────────────                                      │       │
│  │  • Queue for later processing                                       │       │
│  │  • Return to manual workflow                                        │       │
│  │  • Notify admin if critical                                         │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Fallback Implementation

```typescript
// src/lib/ai/fallback/fallback-chain.ts

export class FallbackChain {
  private levels: FallbackLevel[];
  
  constructor(config: FallbackConfig) {
    this.levels = [
      {
        name: 'primary',
        provider: config.primary,
        retries: 2,
        backoffMs: [1000, 2000],
      },
      {
        name: 'secondary',
        provider: config.secondary,
        retries: 2,
        backoffMs: [500, 1000],
      },
      {
        name: 'lightweight',
        provider: config.lightweight,
        retries: 1,
        backoffMs: [500],
      },
    ];
  }
  
  async execute<T>(
    request: CompletionRequest,
    executor: (provider: AiProvider) => Promise<T>
  ): Promise<FallbackResult<T>> {
    const errors: FallbackError[] = [];
    
    for (const level of this.levels) {
      try {
        const result = await this.tryLevel(level, executor);
        return {
          success: true,
          data: result,
          level: level.name,
          fallbackUsed: level.name !== 'primary',
          errors,
        };
      } catch (error) {
        errors.push({
          level: level.name,
          provider: level.provider.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        });
      }
    }
    
    // All providers failed - try cache
    const cached = await this.tryCache(request);
    if (cached) {
      return {
        success: true,
        data: cached as T,
        level: 'cache',
        fallbackUsed: true,
        fromCache: true,
        errors,
      };
    }
    
    // Complete failure
    return {
      success: false,
      data: null,
      level: 'degraded',
      fallbackUsed: true,
      errors,
      degradedAction: this.getDegradedAction(request),
    };
  }
  
  private async tryLevel<T>(
    level: FallbackLevel,
    executor: (provider: AiProvider) => Promise<T>
  ): Promise<T> {
    for (let attempt = 0; attempt <= level.retries; attempt++) {
      try {
        return await executor(level.provider);
      } catch (error) {
        if (attempt < level.retries) {
          await sleep(level.backoffMs[attempt] ?? 1000);
        } else {
          throw error;
        }
      }
    }
    throw new Error('Unreachable');
  }
  
  private getDegradedAction(request: CompletionRequest): DegradedAction {
    // Determine what to do when all AI fails
    return {
      action: 'queue',
      message: 'Request queued for manual processing',
      queueName: 'ai-fallback-queue',
      notifyAdmin: request.priority === 'critical',
    };
  }
}
```

---

## 6. Model Selection

### 6.1 Model Mapping

| Use Case | Primary Model | Secondary Model | Notes |
|----------|---------------|-----------------|-------|
| **Emergency Triage** | gpt-4o | claude-3-5-sonnet | Fastest, most capable |
| **Symptom Diagnosis** | gpt-4o | claude-3-5-sonnet | Best reasoning |
| **Assignment** | gpt-4o-mini | claude-3-haiku | Cost-optimized |
| **Voice Processing** | whisper-1 | - | OpenAI only |
| **Chat Support** | gpt-4o-mini | claude-3-haiku | High volume, cost-sensitive |
| **Image Analysis** | gpt-4o | claude-3-5-sonnet | Vision required |
| **Content Moderation** | gpt-4o-mini | - | Batch processing |
| **Embedding** | text-embedding-3-small | - | OpenAI only |

### 6.2 Model Selection Logic

```typescript
// src/lib/ai/model-selector.ts

export class ModelSelector {
  private modelConfig: ModelConfig;
  
  constructor(config: ModelConfig) {
    this.modelConfig = config;
  }
  
  selectModel(request: AiRouterRequest): ModelSelection {
    const { pipeline, priority, capabilities } = this.classifyRequest(request);
    
    // Critical requests always use best model
    if (priority === 'critical') {
      return {
        provider: 'openai',
        model: 'gpt-4o',
        reason: 'Critical priority requires best model',
      };
    }
    
    // Vision requests need vision-capable models
    if (capabilities.includes('imageAnalysis')) {
      return {
        provider: 'openai',
        model: 'gpt-4o',
        reason: 'Vision capability required',
      };
    }
    
    // Cost-sensitive pipelines use lightweight models
    if (['chat', 'moderation', 'assignment'].includes(pipeline)) {
      return {
        provider: this.selectCheapestAvailable(),
        model: 'gpt-4o-mini',
        reason: 'Cost optimization for non-critical pipeline',
      };
    }
    
    // Default to primary model
    return {
      provider: 'openai',
      model: 'gpt-4o',
      reason: 'Default selection',
    };
  }
  
  private selectCheapestAvailable(): string {
    const providers = providerRegistry.getAvailable();
    
    // Prefer gpt-4o-mini if available
    if (providers.find(p => p.name === 'openai')) {
      return 'openai';
    }
    
    // Fall back to Claude Haiku
    if (providers.find(p => p.name === 'anthropic')) {
      return 'anthropic';
    }
    
    return providers[0]?.name ?? 'openai';
  }
}
```

---

## 7. Queue Integration

### 7.1 Queue Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         AI QUEUE INTEGRATION                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │                      PRIORITY QUEUES (BullMQ)                       │       │
│  │                                                                     │       │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │       │
│  │  │  CRITICAL   │  │    HIGH     │  │   MEDIUM    │  │    LOW    │ │       │
│  │  │  (P0)       │  │    (P1)     │  │    (P2)     │  │    (P3)   │ │       │
│  │  │             │  │             │  │             │  │           │ │       │
│  │  │ Emergency   │  │ Diagnosis   │  │ Assignment  │  │ Batch     │ │       │
│  │  │ Triage      │  │ Symptoms    │  │ Chat        │  │ Moderate  │ │       │
│  │  │             │  │             │  │ Voice       │  │           │ │       │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘ │       │
│  │         │                │                │               │       │       │
│  └─────────┼────────────────┼────────────────┼───────────────┼───────┘       │
│            │                │                │               │               │
│            └────────────────┴────────────────┴───────────────┘               │
│                                   │                                          │
│                                   ▼                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         WORKER POOL                                  │    │
│  │                                                                      │    │
│  │   Worker 1    Worker 2    Worker 3    Worker 4    Worker N          │    │
│  │   ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐         │    │
│  │   │ P0   │    │ P0/P1│    │ P1/P2│    │ P2/P3│    │ P3   │         │    │
│  │   │ only │    │      │    │      │    │      │    │ batch│         │    │
│  │   └──────┘    └──────┘    └──────┘    └──────┘    └──────┘         │    │
│  │                                                                      │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Queue Implementation

```typescript
// src/lib/ai/queue/ai-queue.ts

import { Queue, Worker, Job } from 'bullmq';

export class AiQueueManager {
  private queues: Map<string, Queue> = new Map();
  private workers: Worker[] = [];
  
  constructor(private readonly connection: Redis) {
    this.initializeQueues();
    this.initializeWorkers();
  }
  
  private initializeQueues(): void {
    const queueConfigs: QueueConfig[] = [
      { name: 'ai-critical', priority: 0 },
      { name: 'ai-high', priority: 1 },
      { name: 'ai-medium', priority: 2 },
      { name: 'ai-low', priority: 3 },
    ];
    
    for (const config of queueConfigs) {
      this.queues.set(config.name, new Queue(config.name, {
        connection: this.connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: { age: 3600 }, // 1 hour
          removeOnFail: { age: 86400 }, // 24 hours
        },
      }));
    }
  }
  
  async enqueue(request: AiQueueRequest): Promise<Job> {
    const queue = this.selectQueue(request.priority);
    
    return queue.add(request.type, request, {
      priority: this.mapPriority(request.priority),
      jobId: request.requestId,
      delay: request.delay,
    });
  }
  
  private selectQueue(priority: AiPriority): Queue {
    switch (priority) {
      case 'critical': return this.queues.get('ai-critical')!;
      case 'high': return this.queues.get('ai-high')!;
      case 'medium': return this.queues.get('ai-medium')!;
      case 'low': return this.queues.get('ai-low')!;
    }
  }
  
  private initializeWorkers(): void {
    // Critical queue - dedicated workers
    this.workers.push(new Worker('ai-critical', this.processJob, {
      connection: this.connection,
      concurrency: 5,
      limiter: { max: 100, duration: 1000 },
    }));
    
    // High/Medium queues - shared workers
    this.workers.push(new Worker('ai-high', this.processJob, {
      connection: this.connection,
      concurrency: 10,
    }));
    
    this.workers.push(new Worker('ai-medium', this.processJob, {
      connection: this.connection,
      concurrency: 10,
    }));
    
    // Low queue - batch worker
    this.workers.push(new Worker('ai-low', this.processBatch, {
      connection: this.connection,
      concurrency: 5,
    }));
  }
  
  private async processJob(job: Job): Promise<unknown> {
    const router = new AiRouter(/* ... */);
    return router.route(job.data);
  }
}
```

---

## 8. Event-Driven Patterns

### 8.1 AI Events

```typescript
// src/lib/ai/events/ai-events.ts

export const AI_EVENTS = {
  // Request lifecycle
  REQUEST_RECEIVED: 'ai.request.received',
  REQUEST_CLASSIFIED: 'ai.request.classified',
  REQUEST_QUEUED: 'ai.request.queued',
  REQUEST_STARTED: 'ai.request.started',
  REQUEST_COMPLETED: 'ai.request.completed',
  REQUEST_FAILED: 'ai.request.failed',
  
  // Provider events
  PROVIDER_SELECTED: 'ai.provider.selected',
  PROVIDER_FALLBACK: 'ai.provider.fallback',
  PROVIDER_UNAVAILABLE: 'ai.provider.unavailable',
  
  // Pipeline events
  PIPELINE_STARTED: 'ai.pipeline.started',
  PIPELINE_COMPLETED: 'ai.pipeline.completed',
  PIPELINE_FAILED: 'ai.pipeline.failed',
  
  // Safety events
  SAFETY_CHECK_FAILED: 'ai.safety.check_failed',
  HUMAN_REVIEW_REQUIRED: 'ai.safety.human_review',
  ESCALATION_TRIGGERED: 'ai.safety.escalation',
  
  // Cost events
  BUDGET_WARNING: 'ai.cost.budget_warning',
  BUDGET_EXCEEDED: 'ai.cost.budget_exceeded',
  RATE_LIMIT_HIT: 'ai.cost.rate_limit',
} as const;

export interface AiEvent<T = unknown> {
  type: string;
  timestamp: Date;
  requestId: string;
  data: T;
  metadata?: Record<string, unknown>;
}
```

### 8.2 Event Publisher

```typescript
// src/lib/ai/events/event-publisher.ts

export class AiEventPublisher {
  constructor(private readonly eventBus: EventBus) {}
  
  async publish<T>(event: AiEvent<T>): Promise<void> {
    // Publish to event bus
    await this.eventBus.publish(event.type, {
      ...event,
      timestamp: event.timestamp ?? new Date(),
    });
    
    // Also log for audit
    await this.logEvent(event);
  }
  
  // Convenience methods
  async requestReceived(requestId: string, request: AiRouterRequest): Promise<void> {
    await this.publish({
      type: AI_EVENTS.REQUEST_RECEIVED,
      requestId,
      timestamp: new Date(),
      data: { type: request.type, userId: request.userId },
    });
  }
  
  async requestCompleted(
    requestId: string,
    result: AiRouterResponse<unknown>
  ): Promise<void> {
    await this.publish({
      type: AI_EVENTS.REQUEST_COMPLETED,
      requestId,
      timestamp: new Date(),
      data: {
        provider: result.provider,
        latencyMs: result.latencyMs,
        fromCache: result.fromCache,
      },
    });
  }
  
  async humanReviewRequired(
    requestId: string,
    reason: string,
    output: unknown
  ): Promise<void> {
    await this.publish({
      type: AI_EVENTS.HUMAN_REVIEW_REQUIRED,
      requestId,
      timestamp: new Date(),
      data: { reason, output },
    });
  }
}
```

---

## 9. Health Monitoring

### 9.1 Health Check System

```typescript
// src/lib/ai/health/health-monitor.ts

export class AiHealthMonitor {
  private readonly checkInterval = 30_000; // 30 seconds
  private healthHistory: HealthRecord[] = [];
  
  constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly alertService: AlertService,
  ) {
    this.startMonitoring();
  }
  
  private startMonitoring(): void {
    setInterval(() => this.performHealthCheck(), this.checkInterval);
  }
  
  private async performHealthCheck(): Promise<void> {
    const providers = this.providerRegistry.getAll();
    const results: HealthCheckResult[] = [];
    
    for (const provider of providers) {
      const health = await provider.getHealthStatus();
      results.push({
        provider: provider.name,
        ...health,
      });
      
      // Alert if unhealthy
      if (health.status === 'unavailable') {
        await this.alertService.alert({
          level: 'warning',
          title: `AI Provider Unavailable: ${provider.name}`,
          message: health.message ?? 'Provider health check failed',
        });
      }
    }
    
    this.healthHistory.push({
      timestamp: new Date(),
      results,
    });
    
    // Keep last 24 hours
    this.pruneHistory();
  }
  
  getHealthSummary(): HealthSummary {
    const recent = this.healthHistory.slice(-10);
    const providers = this.providerRegistry.getAll();
    
    return {
      overall: this.calculateOverallHealth(recent),
      providers: providers.map(p => ({
        name: p.name,
        status: this.providerRegistry.getHealth(p.name)?.status ?? 'unknown',
        uptime: this.calculateUptime(p.name, recent),
        avgLatency: this.calculateAvgLatency(p.name, recent),
      })),
      lastCheck: this.healthHistory[this.healthHistory.length - 1]?.timestamp,
    };
  }
}
```

### 9.2 Metrics Collection

```typescript
// src/lib/ai/metrics/metrics.ts

export const AI_METRICS = {
  // Request metrics
  requestsTotal: new Counter({
    name: 'ai_requests_total',
    help: 'Total AI requests',
    labelNames: ['type', 'provider', 'status'],
  }),
  
  requestDuration: new Histogram({
    name: 'ai_request_duration_seconds',
    help: 'AI request duration',
    labelNames: ['type', 'provider'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  }),
  
  // Token metrics
  tokensUsed: new Counter({
    name: 'ai_tokens_total',
    help: 'Total tokens used',
    labelNames: ['type', 'provider', 'direction'],
  }),
  
  // Cost metrics
  costTotal: new Counter({
    name: 'ai_cost_total_usd',
    help: 'Total AI cost in USD',
    labelNames: ['provider', 'model'],
  }),
  
  // Cache metrics
  cacheHits: new Counter({
    name: 'ai_cache_hits_total',
    help: 'AI cache hits',
    labelNames: ['type'],
  }),
  
  // Fallback metrics
  fallbacks: new Counter({
    name: 'ai_fallbacks_total',
    help: 'AI provider fallbacks',
    labelNames: ['from_provider', 'to_provider', 'reason'],
  }),
};
```

---

## 10. Implementation Guide

### 10.1 Environment Variables

```bash
# Provider API Keys
OPENAI_API_KEY=sk-...
OPENAI_ORG_ID=org-...
ANTHROPIC_API_KEY=sk-ant-...

# Model Configuration
AI_DEFAULT_PROVIDER=openai
AI_DEFAULT_MODEL=gpt-4o
AI_FALLBACK_PROVIDER=anthropic
AI_FALLBACK_MODEL=claude-3-5-sonnet-20241022

# Cost Controls
AI_DAILY_BUDGET_USD=100
AI_USER_DAILY_LIMIT=50
AI_USER_MONTHLY_LIMIT=500
AI_MAX_INPUT_TOKENS=4000
AI_MAX_OUTPUT_TOKENS=2000

# Caching
AI_CACHE_ENABLED=true
AI_CACHE_TTL_MINUTES=60

# Queue (BullMQ)
AI_QUEUE_ENABLED=true
REDIS_URL=redis://localhost:6379

# Health Check
AI_HEALTH_CHECK_INTERVAL_MS=30000
```

### 10.2 File Structure

```
src/lib/ai/
├── orchestrator.ts           # Main AI orchestrator entry point
├── providers/
│   ├── index.ts              # Provider exports
│   ├── provider.interface.ts # Provider interface
│   ├── registry.ts           # Provider registry
│   ├── openai.provider.ts    # OpenAI implementation
│   ├── anthropic.provider.ts # Anthropic implementation
│   └── types.ts              # Shared types
├── pipelines/
│   ├── index.ts              # Pipeline exports
│   ├── pipeline.interface.ts # Pipeline interface
│   ├── registry.ts           # Pipeline registry
│   ├── triage.pipeline.ts    # Triage pipeline
│   ├── diagnosis.pipeline.ts # Diagnosis pipeline
│   ├── assignment.pipeline.ts
│   ├── emergency.pipeline.ts
│   ├── voice.pipeline.ts
│   ├── chat.pipeline.ts
│   ├── image.pipeline.ts
│   └── moderation.pipeline.ts
├── router/
│   ├── ai-router.ts          # Request router
│   └── model-selector.ts     # Model selection logic
├── fallback/
│   └── fallback-chain.ts     # Fallback implementation
├── queue/
│   └── ai-queue.ts           # BullMQ integration
├── cache/
│   └── ai-cache.ts           # Response caching
├── budget/
│   └── budget-manager.ts     # Cost controls
├── events/
│   ├── ai-events.ts          # Event definitions
│   └── event-publisher.ts    # Event publishing
├── health/
│   └── health-monitor.ts     # Health monitoring
├── metrics/
│   └── metrics.ts            # Prometheus metrics
└── audit/
    └── audit-logger.ts       # Audit logging
```

### 10.3 Initialization

```typescript
// src/lib/ai/orchestrator.ts

import { providerRegistry } from './providers/registry';
import { OpenAiProvider } from './providers/openai.provider';
import { AnthropicProvider } from './providers/anthropic.provider';
import { AiRouter } from './router/ai-router';
import { AiQueueManager } from './queue/ai-queue';

export async function initializeAiOrchestrator(): Promise<AiOrchestrator> {
  // Register providers
  providerRegistry.register(new OpenAiProvider({
    apiKey: process.env.OPENAI_API_KEY!,
    organizationId: process.env.OPENAI_ORG_ID,
  }));
  
  providerRegistry.register(new AnthropicProvider({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  }));
  
  // Initialize components
  const budgetManager = new BudgetManager(/* ... */);
  const rateLimiter = new RateLimiter(/* ... */);
  const cache = new AiCache(/* ... */);
  const auditLogger = new AiAuditLogger(/* ... */);
  
  // Create router
  const router = new AiRouter(
    providerRegistry,
    pipelineRegistry,
    budgetManager,
    rateLimiter,
    cache,
    auditLogger,
  );
  
  // Initialize queue if enabled
  let queueManager: AiQueueManager | undefined;
  if (process.env.AI_QUEUE_ENABLED === 'true') {
    const redis = new Redis(process.env.REDIS_URL!);
    queueManager = new AiQueueManager(redis);
  }
  
  return new AiOrchestrator(router, queueManager);
}

export class AiOrchestrator {
  constructor(
    private readonly router: AiRouter,
    private readonly queueManager?: AiQueueManager,
  ) {}
  
  async process<T>(request: AiRouterRequest): Promise<AiRouterResponse<T>> {
    // For critical requests, process immediately
    if (request.priority === 'critical') {
      return this.router.route<T>(request);
    }
    
    // For non-critical, queue if enabled
    if (this.queueManager && !request.immediate) {
      const job = await this.queueManager.enqueue(request);
      return { queued: true, jobId: job.id } as unknown as AiRouterResponse<T>;
    }
    
    // Otherwise process immediately
    return this.router.route<T>(request);
  }
}
```

---

## 11. Memory Integration (MVP vs Phase 2)

The orchestrator loads context from the memory system before pipeline execution. Scope aligns with `docs/ai/MEMORY_SYSTEM.md` and `docs/database/ERD.md` §14.

### 11.1 MVP Memory Hooks

| Pipeline Step | Memory Module | Action |
|---------------|---------------|--------|
| Pre-route | `conversation_context` | `getOrCreateContext(sessionId, userId)` from Redis |
| Context build | `session_summary` | Load last 5 `AiConversation` summaries for user |
| Prompt assembly | `prompt_cache` | Check `prompt:{hash}`; set on miss after token estimate |
| Post-response | `conversation_context` | `addMessage(sessionId, assistantMessage)` |
| Session end | `session_summary` | `closeConversation` → archive `AiConversation` |

```typescript
// MVP context injection (orchestrator pipeline)
async function buildPipelineContext(request: AiRouterRequest): Promise<PipelineContext> {
  const ctx = await contextManager.getOrCreateContext(
    request.sessionId,
    request.userId,
    request.conversationId,
  );

  const recentSummaries = await mediumTermStore.getRecentConversations(
    request.userId,
    5,
  );

  const cachedPrompt = await promptCache.get(request.promptHash);

  return {
    conversationContext: ctx,
    recentSummaries,
    cachedPromptFragment: cachedPrompt,
  };
}
```

### 11.2 Phase 2 Memory Hooks (Not in MVP)

| Module | Orchestrator use | When |
|--------|------------------|------|
| `long_term_memory` | Inject scoped facts from `AiMemoryEntry` | After semantic ranking |
| `vector_memory` | Similarity search on `embeddingVector` | Retrieval-augmented prompts |
| `personalization` | Merge `AiUserContext` (language, topics, animals) | Every request |

MVP pipelines must not depend on Phase 2 tables. Feature-flag `AI_MEMORY_PHASE2_ENABLED=false` until migration complete.

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | AI Team | Initial release |
| 1.1.0 | 2026-05-21 | Architecture | §11 Memory integration MVP/Phase 2 |

---

## Related Documents

| Document | Location |
|----------|----------|
| Prompt System | `docs/ai/PROMPT_SYSTEM.md` |
| Memory System | `docs/ai/MEMORY_SYSTEM.md` |
| Emergency Engine | `docs/ai/EMERGENCY_ENGINE.md` |
| Cost Optimization | `docs/ai/COST_OPTIMIZATION.md` |
| Master Rules | `docs/core/MASTER_SYSTEM_RULES.md` |

---

*End of AI_ORCHESTRATOR.md*
