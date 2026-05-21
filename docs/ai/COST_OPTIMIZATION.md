# COST OPTIMIZATION — Prani Doctor AI

**Version:** 1.0.0  
**Last Updated:** 2026-05-21  
**Scope:** Token budgeting, caching, rate limiting, cost tracking, AI moderation

---

## Table of Contents

1. [Cost Optimization Overview](#1-cost-optimization-overview)
2. [Token Budgeting](#2-token-budgeting)
3. [Caching Strategy](#3-caching-strategy)
4. [Model Selection Optimization](#4-model-selection-optimization)
5. [Rate Limiting](#5-rate-limiting)
6. [AI Moderation](#6-ai-moderation)
7. [Cost Tracking & Monitoring](#7-cost-tracking--monitoring)
8. [AI Audit Logging](#8-ai-audit-logging)
9. [Optimization Techniques](#9-optimization-techniques)
10. [Implementation Guide](#10-implementation-guide)

---

## 1. Cost Optimization Overview

### 1.1 Cost Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         AI COST OPTIMIZATION SYSTEM                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                    PRE-REQUEST OPTIMIZATION                             │    │
│  │                                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │   Cache     │  │   Rate      │  │   Budget    │  │   Model     │   │    │
│  │  │   Check     │──│   Limit     │──│   Check     │──│  Selection  │   │    │
│  │  │             │  │   Check     │  │             │  │             │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                                         │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                   │                                              │
│                                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                    REQUEST OPTIMIZATION                                 │    │
│  │                                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │   Prompt    │  │   Token     │  │   Context   │  │  Streaming  │   │    │
│  │  │  Compress   │──│   Budget    │──│   Pruning   │──│   Opt-out   │   │    │
│  │  │             │  │   Enforce   │  │             │  │             │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                                         │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                   │                                              │
│                                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                    POST-REQUEST TRACKING                                │    │
│  │                                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │   Token     │  │   Cost      │  │   Cache     │  │   Audit     │   │    │
│  │  │   Count     │──│   Record    │──│   Store     │──│   Log       │   │    │
│  │  │             │  │             │  │             │  │             │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                                         │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Cost Drivers

| Driver | Impact | Optimization Strategy |
|--------|--------|----------------------|
| **Input Tokens** | ~30% of cost | Prompt compression, context pruning |
| **Output Tokens** | ~70% of cost | Token limits, structured output |
| **Model Choice** | 10-100x variance | Smart model routing |
| **Request Volume** | Linear | Caching, batching |
| **Retry/Fallback** | 2-3x per failure | Circuit breaker, health checks |

### 1.3 Cost Budget Framework

| Budget Level | Scope | Control | Example |
|--------------|-------|---------|---------|
| **System Daily** | Platform-wide | Hard limit | $100/day |
| **User Daily** | Per user | Soft limit + queue | 50 requests |
| **User Monthly** | Per user | Hard limit | 500 requests |
| **Request** | Per API call | Token cap | 4000 tokens |
| **Pipeline** | Per pipeline type | Token cap | Varies |

---

## 2. Token Budgeting

### 2.1 Budget Configuration

```typescript
// src/lib/ai/cost/budget-config.ts

export const TOKEN_BUDGETS = {
  // System-level
  system: {
    dailyBudgetUsd: 100,
    monthlyBudgetUsd: 2500,
    alertThresholdPercent: 80,
  },
  
  // Per-user
  user: {
    freeTier: {
      dailyRequests: 10,
      monthlyRequests: 100,
      maxTokensPerRequest: 2000,
    },
    standardTier: {
      dailyRequests: 50,
      monthlyRequests: 500,
      maxTokensPerRequest: 4000,
    },
    premiumTier: {
      dailyRequests: 200,
      monthlyRequests: 2000,
      maxTokensPerRequest: 8000,
    },
  },
  
  // Per-pipeline
  pipeline: {
    triage: {
      maxInputTokens: 1500,
      maxOutputTokens: 500,
      maxTotalTokens: 2000,
    },
    diagnosis: {
      maxInputTokens: 3000,
      maxOutputTokens: 1000,
      maxTotalTokens: 4000,
    },
    emergency: {
      maxInputTokens: 1000,
      maxOutputTokens: 300,
      maxTotalTokens: 1500,
      priority: 'skip_budget_check', // Emergencies bypass limits
    },
    chat: {
      maxInputTokens: 2000,
      maxOutputTokens: 500,
      maxTotalTokens: 2500,
    },
    voice: {
      maxInputTokens: 500,
      maxOutputTokens: 200,
      maxTotalTokens: 800,
    },
    moderation: {
      maxInputTokens: 1000,
      maxOutputTokens: 100,
      maxTotalTokens: 1200,
    },
    image: {
      maxInputTokens: 1500,
      maxOutputTokens: 500,
      maxTotalTokens: 2000,
    },
  },
};
```

### 2.2 Budget Manager

```typescript
// src/lib/ai/cost/budget-manager.ts

export class BudgetManager {
  constructor(
    private readonly redis: Redis,
    private readonly prisma: PrismaClient,
    private readonly config: typeof TOKEN_BUDGETS,
  ) {}
  
  async checkBudget(request: BudgetCheckRequest): Promise<BudgetCheckResult> {
    const { userId, pipeline, estimatedTokens } = request;
    
    // 1. Check system budget
    const systemBudget = await this.checkSystemBudget();
    if (!systemBudget.allowed) {
      return {
        allowed: false,
        reason: 'SYSTEM_BUDGET_EXCEEDED',
        message: 'System daily budget exceeded. Try again tomorrow.',
      };
    }
    
    // 2. Emergency bypass
    if (pipeline === 'emergency') {
      return { allowed: true, reason: 'EMERGENCY_BYPASS' };
    }
    
    // 3. Check user budget
    const userBudget = await this.checkUserBudget(userId);
    if (!userBudget.allowed) {
      return {
        allowed: false,
        reason: userBudget.reason,
        message: userBudget.message,
        retryAfter: userBudget.retryAfter,
      };
    }
    
    // 4. Check pipeline token limits
    const pipelineConfig = this.config.pipeline[pipeline];
    if (estimatedTokens > pipelineConfig.maxTotalTokens) {
      return {
        allowed: false,
        reason: 'TOKEN_LIMIT_EXCEEDED',
        message: `Request exceeds ${pipeline} token limit`,
        maxAllowed: pipelineConfig.maxTotalTokens,
      };
    }
    
    // 5. Reserve budget
    await this.reserveBudget(userId, estimatedTokens);
    
    return {
      allowed: true,
      reservationId: generateId(),
      maxTokens: pipelineConfig.maxTotalTokens,
    };
  }
  
  async consumeBudget(
    userId: string,
    actualTokens: number,
    costUsd: number
  ): Promise<void> {
    const today = this.getTodayKey();
    const month = this.getMonthKey();
    
    // Update user counters
    await this.redis.multi()
      .hincrby(`user:${userId}:usage:${today}`, 'tokens', actualTokens)
      .hincrby(`user:${userId}:usage:${today}`, 'requests', 1)
      .hincrbyfloat(`user:${userId}:usage:${today}`, 'cost', costUsd)
      .hincrby(`user:${userId}:usage:${month}`, 'tokens', actualTokens)
      .hincrby(`user:${userId}:usage:${month}`, 'requests', 1)
      .hincrbyfloat(`user:${userId}:usage:${month}`, 'cost', costUsd)
      .exec();
    
    // Update system counters
    await this.redis.multi()
      .hincrbyfloat(`system:usage:${today}`, 'cost', costUsd)
      .hincrby(`system:usage:${today}`, 'tokens', actualTokens)
      .exec();
    
    // Check alert threshold
    await this.checkAndAlertIfNeeded(today);
  }
  
  async getUserUsage(userId: string): Promise<UserUsage> {
    const today = this.getTodayKey();
    const month = this.getMonthKey();
    
    const [dailyUsage, monthlyUsage] = await Promise.all([
      this.redis.hgetall(`user:${userId}:usage:${today}`),
      this.redis.hgetall(`user:${userId}:usage:${month}`),
    ]);
    
    const userTier = await this.getUserTier(userId);
    const limits = this.config.user[userTier];
    
    return {
      daily: {
        requests: parseInt(dailyUsage.requests || '0'),
        tokens: parseInt(dailyUsage.tokens || '0'),
        cost: parseFloat(dailyUsage.cost || '0'),
        limit: limits.dailyRequests,
        remaining: limits.dailyRequests - parseInt(dailyUsage.requests || '0'),
      },
      monthly: {
        requests: parseInt(monthlyUsage.requests || '0'),
        tokens: parseInt(monthlyUsage.tokens || '0'),
        cost: parseFloat(monthlyUsage.cost || '0'),
        limit: limits.monthlyRequests,
        remaining: limits.monthlyRequests - parseInt(monthlyUsage.requests || '0'),
      },
      tier: userTier,
    };
  }
  
  private async checkSystemBudget(): Promise<BudgetCheckResult> {
    const today = this.getTodayKey();
    const usage = await this.redis.hget(`system:usage:${today}`, 'cost');
    const currentCost = parseFloat(usage || '0');
    
    if (currentCost >= this.config.system.dailyBudgetUsd) {
      return { allowed: false, reason: 'SYSTEM_BUDGET_EXCEEDED' };
    }
    
    return { allowed: true };
  }
  
  private async checkUserBudget(userId: string): Promise<BudgetCheckResult> {
    const userTier = await this.getUserTier(userId);
    const limits = this.config.user[userTier];
    
    const today = this.getTodayKey();
    const month = this.getMonthKey();
    
    const [dailyRequests, monthlyRequests] = await Promise.all([
      this.redis.hget(`user:${userId}:usage:${today}`, 'requests'),
      this.redis.hget(`user:${userId}:usage:${month}`, 'requests'),
    ]);
    
    // Check monthly first
    if (parseInt(monthlyRequests || '0') >= limits.monthlyRequests) {
      return {
        allowed: false,
        reason: 'MONTHLY_LIMIT_EXCEEDED',
        message: 'Monthly request limit reached',
        retryAfter: this.getNextMonthTimestamp(),
      };
    }
    
    // Check daily
    if (parseInt(dailyRequests || '0') >= limits.dailyRequests) {
      return {
        allowed: false,
        reason: 'DAILY_LIMIT_EXCEEDED',
        message: 'Daily request limit reached',
        retryAfter: this.getNextDayTimestamp(),
      };
    }
    
    return { allowed: true };
  }
}
```

### 2.3 Token Estimation

```typescript
// src/lib/ai/cost/token-estimator.ts

export class TokenEstimator {
  // Approximate token counts (model-specific)
  private readonly charPerToken = {
    english: 4,
    bengali: 2.5, // Bengali uses more characters per concept
    mixed: 3,
  };
  
  estimate(text: string): number {
    const language = this.detectLanguage(text);
    const charRatio = this.charPerToken[language];
    return Math.ceil(text.length / charRatio);
  }
  
  estimateRequest(request: AiRequest): TokenEstimate {
    const systemTokens = request.system ? this.estimate(request.system) : 0;
    const promptTokens = this.estimate(request.prompt);
    const contextTokens = request.context ? this.estimate(request.context) : 0;
    
    const inputTokens = systemTokens + promptTokens + contextTokens;
    
    // Estimate output based on pipeline
    const estimatedOutputTokens = this.estimateOutput(request.pipeline);
    
    return {
      input: inputTokens,
      estimatedOutput: estimatedOutputTokens,
      total: inputTokens + estimatedOutputTokens,
      breakdown: {
        system: systemTokens,
        prompt: promptTokens,
        context: contextTokens,
      },
    };
  }
  
  private estimateOutput(pipeline: string): number {
    const averageOutputs: Record<string, number> = {
      triage: 350,
      diagnosis: 600,
      emergency: 200,
      chat: 300,
      voice: 100,
      moderation: 50,
      image: 400,
    };
    
    return averageOutputs[pipeline] ?? 300;
  }
  
  private detectLanguage(text: string): 'english' | 'bengali' | 'mixed' {
    const bengaliPattern = /[\u0980-\u09FF]/;
    const englishPattern = /[a-zA-Z]/;
    
    const hasBengali = bengaliPattern.test(text);
    const hasEnglish = englishPattern.test(text);
    
    if (hasBengali && hasEnglish) return 'mixed';
    if (hasBengali) return 'bengali';
    return 'english';
  }
}
```

---

## 3. Caching Strategy

### 3.1 Cache Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         AI RESPONSE CACHING                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                      CACHE LAYERS                                       │    │
│  │                                                                         │    │
│  │  ┌─────────────────────┐  ┌─────────────────────┐                      │    │
│  │  │    EXACT CACHE      │  │   SEMANTIC CACHE    │                      │    │
│  │  │    (Redis)          │  │   (Future)          │                      │    │
│  │  │                     │  │                     │                      │    │
│  │  │ • Hash of prompt    │  │ • Vector similarity │                      │    │
│  │  │ • TTL: 1 hour       │  │ • Embedding match   │                      │    │
│  │  │ • High precision    │  │ • Fuzzy matching    │                      │    │
│  │  │                     │  │                     │                      │    │
│  │  └─────────────────────┘  └─────────────────────┘                      │    │
│  │                                                                         │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
│  CACHE KEY COMPOSITION:                                                         │
│  ────────────────────────                                                       │
│  key = hash(pipeline + model + system_prompt_version + user_prompt)            │
│                                                                                  │
│  CACHE EXCLUSIONS:                                                              │
│  ─────────────────                                                              │
│  • Emergency requests                                                           │
│  • User-specific context                                                        │
│  • Time-sensitive queries                                                       │
│  • Low-confidence responses                                                     │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Cache Implementation

```typescript
// src/lib/ai/cost/ai-cache.ts

export class AiCache {
  private readonly defaultTtl = 60 * 60; // 1 hour
  
  constructor(private readonly redis: Redis) {}
  
  async get<T>(request: AiRequest): Promise<CachedResponse<T> | null> {
    // Check if cacheable
    if (!this.isCacheable(request)) {
      return null;
    }
    
    const key = this.buildCacheKey(request);
    const cached = await this.redis.get(key);
    
    if (!cached) {
      return null;
    }
    
    const parsed = JSON.parse(cached) as CachedResponse<T>;
    
    // Validate cache freshness
    if (this.isStale(parsed, request)) {
      await this.redis.del(key);
      return null;
    }
    
    return parsed;
  }
  
  async set<T>(
    request: AiRequest,
    response: AiResponse<T>,
    options?: CacheOptions
  ): Promise<void> {
    // Don't cache if not cacheable
    if (!this.isCacheable(request)) {
      return;
    }
    
    // Don't cache low confidence responses
    if (response.confidence && response.confidence < 0.6) {
      return;
    }
    
    const key = this.buildCacheKey(request);
    const ttl = options?.ttl ?? this.getTtl(request.pipeline);
    
    const cacheEntry: CachedResponse<T> = {
      data: response.data,
      confidence: response.confidence,
      cachedAt: new Date().toISOString(),
      model: response.model,
      tokens: response.usage?.totalTokens,
    };
    
    await this.redis.setex(key, ttl, JSON.stringify(cacheEntry));
  }
  
  private isCacheable(request: AiRequest): boolean {
    // Never cache emergencies
    if (request.pipeline === 'emergency') {
      return false;
    }
    
    // Don't cache if explicitly disabled
    if (request.noCache) {
      return false;
    }
    
    // Don't cache user-specific context
    if (request.includesUserContext) {
      return false;
    }
    
    return true;
  }
  
  private buildCacheKey(request: AiRequest): string {
    const components = [
      request.pipeline,
      request.model ?? 'default',
      this.hashPrompt(request.system ?? ''),
      this.hashPrompt(request.prompt),
    ];
    
    return `ai:cache:${components.join(':')}`;
  }
  
  private hashPrompt(prompt: string): string {
    // Normalize whitespace and hash
    const normalized = prompt.trim().replace(/\s+/g, ' ');
    return createHash('sha256').update(normalized).digest('hex').substring(0, 16);
  }
  
  private getTtl(pipeline: string): number {
    const ttls: Record<string, number> = {
      triage: 30 * 60, // 30 minutes
      diagnosis: 60 * 60, // 1 hour
      chat: 15 * 60, // 15 minutes
      moderation: 24 * 60 * 60, // 24 hours
      image: 60 * 60, // 1 hour
    };
    
    return ttls[pipeline] ?? this.defaultTtl;
  }
  
  private isStale(cached: CachedResponse<unknown>, request: AiRequest): boolean {
    // Check if prompt template version changed
    if (request.promptVersion && cached.promptVersion !== request.promptVersion) {
      return true;
    }
    
    return false;
  }
}
```

### 3.3 Cache Metrics

```typescript
// src/lib/ai/cost/cache-metrics.ts

export class CacheMetrics {
  private metrics = {
    hits: 0,
    misses: 0,
    savings: 0, // Estimated cost savings
  };
  
  recordHit(estimatedCost: number): void {
    this.metrics.hits++;
    this.metrics.savings += estimatedCost;
  }
  
  recordMiss(): void {
    this.metrics.misses++;
  }
  
  getHitRate(): number {
    const total = this.metrics.hits + this.metrics.misses;
    return total > 0 ? this.metrics.hits / total : 0;
  }
  
  getSavings(): number {
    return this.metrics.savings;
  }
  
  async persistMetrics(): Promise<void> {
    await this.redis.hset('ai:cache:metrics', {
      hits: this.metrics.hits.toString(),
      misses: this.metrics.misses.toString(),
      savings: this.metrics.savings.toString(),
      hitRate: this.getHitRate().toString(),
    });
  }
}
```

---

## 4. Model Selection Optimization

### 4.1 Model Cost Matrix

| Model | Input Cost ($/1M) | Output Cost ($/1M) | Quality | Speed | Use Case |
|-------|-------------------|-------------------|---------|-------|----------|
| gpt-4o | $2.50 | $10.00 | Highest | Fast | Complex reasoning |
| gpt-4o-mini | $0.15 | $0.60 | High | Fastest | General use |
| claude-3-5-sonnet | $3.00 | $15.00 | Highest | Fast | Complex + vision |
| claude-3-haiku | $0.25 | $1.25 | Good | Fastest | Simple tasks |

### 4.2 Smart Model Selector

```typescript
// src/lib/ai/cost/model-selector.ts

export class CostOptimizedModelSelector {
  private readonly modelPricing: Record<string, ModelPricing> = {
    'gpt-4o': { input: 2.50, output: 10.00, quality: 1.0, speed: 0.9 },
    'gpt-4o-mini': { input: 0.15, output: 0.60, quality: 0.85, speed: 1.0 },
    'claude-3-5-sonnet': { input: 3.00, output: 15.00, quality: 1.0, speed: 0.85 },
    'claude-3-haiku': { input: 0.25, output: 1.25, quality: 0.75, speed: 1.0 },
  };
  
  select(request: ModelSelectionRequest): ModelSelection {
    const { pipeline, priority, estimatedTokens, requiresVision } = request;
    
    // Emergency: always use best model
    if (pipeline === 'emergency' || priority === 'critical') {
      return {
        model: 'gpt-4o',
        reason: 'Critical priority requires highest quality model',
      };
    }
    
    // Vision required
    if (requiresVision) {
      return {
        model: 'gpt-4o',
        reason: 'Vision capability required',
      };
    }
    
    // Cost-sensitive pipelines
    if (['chat', 'moderation', 'voice'].includes(pipeline)) {
      return {
        model: 'gpt-4o-mini',
        reason: 'Cost-optimized for high-volume pipeline',
        estimatedCost: this.estimateCost('gpt-4o-mini', estimatedTokens),
      };
    }
    
    // Quality-sensitive pipelines
    if (['diagnosis', 'triage'].includes(pipeline)) {
      // Use mini for simple cases, full for complex
      const complexity = this.assessComplexity(request);
      
      if (complexity === 'simple') {
        return {
          model: 'gpt-4o-mini',
          reason: 'Simple case suitable for optimized model',
          estimatedCost: this.estimateCost('gpt-4o-mini', estimatedTokens),
        };
      }
      
      return {
        model: 'gpt-4o',
        reason: 'Complex case requires full model',
        estimatedCost: this.estimateCost('gpt-4o', estimatedTokens),
      };
    }
    
    // Default to cost-effective
    return {
      model: 'gpt-4o-mini',
      reason: 'Default cost-optimized selection',
      estimatedCost: this.estimateCost('gpt-4o-mini', estimatedTokens),
    };
  }
  
  private assessComplexity(request: ModelSelectionRequest): 'simple' | 'complex' {
    const { prompt, context } = request;
    
    // Simple heuristics for complexity
    const totalLength = (prompt?.length ?? 0) + (context?.length ?? 0);
    
    // Multiple symptoms = complex
    const symptomCount = (prompt?.match(/symptom|লক্ষণ/gi) ?? []).length;
    
    // Multiple conditions mentioned = complex
    const conditionCount = (prompt?.match(/disease|condition|রোগ/gi) ?? []).length;
    
    if (totalLength > 2000 || symptomCount > 3 || conditionCount > 2) {
      return 'complex';
    }
    
    return 'simple';
  }
  
  private estimateCost(model: string, tokens: number): number {
    const pricing = this.modelPricing[model];
    if (!pricing) return 0;
    
    // Assume 70% input, 30% output
    const inputTokens = tokens * 0.7;
    const outputTokens = tokens * 0.3;
    
    return (inputTokens / 1_000_000) * pricing.input +
           (outputTokens / 1_000_000) * pricing.output;
  }
}
```

---

## 5. Rate Limiting

### 5.1 Rate Limit Configuration

```typescript
// src/lib/ai/cost/rate-limiter-config.ts

export const RATE_LIMITS = {
  // Per-user limits
  user: {
    freeTier: {
      requestsPerMinute: 5,
      requestsPerHour: 20,
      tokensPerMinute: 10000,
    },
    standardTier: {
      requestsPerMinute: 20,
      requestsPerHour: 100,
      tokensPerMinute: 50000,
    },
    premiumTier: {
      requestsPerMinute: 50,
      requestsPerHour: 500,
      tokensPerMinute: 200000,
    },
  },
  
  // Per-pipeline limits
  pipeline: {
    emergency: {
      requestsPerMinute: 100, // High limit for emergencies
      tokensPerMinute: 500000,
    },
    triage: {
      requestsPerMinute: 30,
      tokensPerMinute: 100000,
    },
    diagnosis: {
      requestsPerMinute: 20,
      tokensPerMinute: 80000,
    },
    chat: {
      requestsPerMinute: 50,
      tokensPerMinute: 150000,
    },
  },
  
  // System-wide limits
  system: {
    requestsPerMinute: 1000,
    tokensPerMinute: 5000000,
    concurrentRequests: 100,
  },
};
```

### 5.2 Rate Limiter Implementation

```typescript
// src/lib/ai/cost/rate-limiter.ts

export class AiRateLimiter {
  constructor(
    private readonly redis: Redis,
    private readonly config: typeof RATE_LIMITS,
  ) {}
  
  async check(request: RateLimitRequest): Promise<RateLimitResult> {
    const { userId, pipeline, estimatedTokens } = request;
    
    // 1. Check system limits
    const systemCheck = await this.checkSystemLimit();
    if (!systemCheck.allowed) {
      return systemCheck;
    }
    
    // 2. Check pipeline limits
    const pipelineCheck = await this.checkPipelineLimit(pipeline, estimatedTokens);
    if (!pipelineCheck.allowed) {
      return pipelineCheck;
    }
    
    // 3. Check user limits
    const userCheck = await this.checkUserLimit(userId, estimatedTokens);
    if (!userCheck.allowed) {
      return userCheck;
    }
    
    // 4. Increment counters
    await this.incrementCounters(userId, pipeline, estimatedTokens);
    
    return { allowed: true };
  }
  
  private async checkUserLimit(
    userId: string,
    tokens: number
  ): Promise<RateLimitResult> {
    const tier = await this.getUserTier(userId);
    const limits = this.config.user[tier];
    
    const minuteKey = `ratelimit:user:${userId}:minute:${this.getMinuteKey()}`;
    const hourKey = `ratelimit:user:${userId}:hour:${this.getHourKey()}`;
    
    const [minuteRequests, hourRequests, minuteTokens] = await Promise.all([
      this.redis.get(minuteKey),
      this.redis.get(hourKey),
      this.redis.get(`${minuteKey}:tokens`),
    ]);
    
    // Check requests per minute
    if (parseInt(minuteRequests || '0') >= limits.requestsPerMinute) {
      return {
        allowed: false,
        reason: 'RATE_LIMIT_MINUTE',
        retryAfter: 60 - (Date.now() / 1000 % 60),
        limit: limits.requestsPerMinute,
        remaining: 0,
      };
    }
    
    // Check requests per hour
    if (parseInt(hourRequests || '0') >= limits.requestsPerHour) {
      return {
        allowed: false,
        reason: 'RATE_LIMIT_HOUR',
        retryAfter: 3600 - (Date.now() / 1000 % 3600),
        limit: limits.requestsPerHour,
        remaining: 0,
      };
    }
    
    // Check tokens per minute
    if (parseInt(minuteTokens || '0') + tokens > limits.tokensPerMinute) {
      return {
        allowed: false,
        reason: 'TOKEN_LIMIT_MINUTE',
        retryAfter: 60 - (Date.now() / 1000 % 60),
      };
    }
    
    return {
      allowed: true,
      remaining: limits.requestsPerMinute - parseInt(minuteRequests || '0') - 1,
    };
  }
  
  private async incrementCounters(
    userId: string,
    pipeline: string,
    tokens: number
  ): Promise<void> {
    const minuteKey = this.getMinuteKey();
    const hourKey = this.getHourKey();
    
    const multi = this.redis.multi();
    
    // User counters
    multi.incr(`ratelimit:user:${userId}:minute:${minuteKey}`);
    multi.expire(`ratelimit:user:${userId}:minute:${minuteKey}`, 60);
    multi.incr(`ratelimit:user:${userId}:hour:${hourKey}`);
    multi.expire(`ratelimit:user:${userId}:hour:${hourKey}`, 3600);
    multi.incrby(`ratelimit:user:${userId}:minute:${minuteKey}:tokens`, tokens);
    multi.expire(`ratelimit:user:${userId}:minute:${minuteKey}:tokens`, 60);
    
    // Pipeline counters
    multi.incr(`ratelimit:pipeline:${pipeline}:minute:${minuteKey}`);
    multi.expire(`ratelimit:pipeline:${pipeline}:minute:${minuteKey}`, 60);
    
    // System counters
    multi.incr(`ratelimit:system:minute:${minuteKey}`);
    multi.expire(`ratelimit:system:minute:${minuteKey}`, 60);
    
    await multi.exec();
  }
}
```

---

## 6. AI Moderation

### 6.1 Moderation Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         AI CONTENT MODERATION                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  INPUT MODERATION (Before AI Call)                                              │
│  ──────────────────────────────────                                             │
│  • Check for prohibited content                                                 │
│  • Detect injection attempts                                                    │
│  • Validate input format                                                        │
│  • Strip dangerous patterns                                                     │
│                                                                                  │
│  OUTPUT MODERATION (After AI Call)                                              │
│  ───────────────────────────────────                                            │
│  • Verify safe medical advice                                                   │
│  • Check for harmful recommendations                                            │
│  • Validate structured output                                                   │
│  • Ensure disclaimers present                                                   │
│                                                                                  │
│  MODERATION ACTIONS:                                                            │
│  ────────────────────                                                           │
│  • ALLOW: Content passes all checks                                             │
│  • FLAG: Content requires human review                                          │
│  • MODIFY: Content sanitized automatically                                      │
│  • BLOCK: Content rejected entirely                                             │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Moderation Service

```typescript
// src/lib/ai/moderation/moderation-service.ts

export class AiModerationService {
  private readonly prohibitedPatterns = [
    // Injection attempts
    /ignore.*previous.*instructions/i,
    /you are now/i,
    /act as/i,
    /pretend you/i,
    
    // Dangerous requests
    /how to harm/i,
    /kill.*animal/i,
    /poison/i,
  ];
  
  private readonly medicalSafetyPatterns = [
    // Dosage without disclaimer
    /give.*mg.*(?!consult|veterinarian)/i,
    // Definitive diagnosis without disclaimer
    /definitely.*(?!may be|could be|possibly)/i,
  ];
  
  async moderateInput(input: string): Promise<ModerationResult> {
    const issues: ModerationIssue[] = [];
    
    // Check prohibited patterns
    for (const pattern of this.prohibitedPatterns) {
      if (pattern.test(input)) {
        issues.push({
          type: 'prohibited_content',
          severity: 'high',
          pattern: pattern.toString(),
          action: 'block',
        });
      }
    }
    
    // Check for excessive length (potential abuse)
    if (input.length > 10000) {
      issues.push({
        type: 'excessive_length',
        severity: 'medium',
        action: 'truncate',
        metadata: { length: input.length, maxLength: 10000 },
      });
    }
    
    // Determine overall action
    if (issues.some(i => i.action === 'block')) {
      return {
        allowed: false,
        action: 'block',
        issues,
        message: 'Content contains prohibited patterns',
      };
    }
    
    if (issues.some(i => i.action === 'truncate')) {
      return {
        allowed: true,
        action: 'modify',
        issues,
        sanitizedInput: input.substring(0, 10000),
      };
    }
    
    return { allowed: true, action: 'allow', issues: [] };
  }
  
  async moderateOutput(output: AiOutput): Promise<ModerationResult> {
    const issues: ModerationIssue[] = [];
    
    // Check for unsafe medical advice
    for (const pattern of this.medicalSafetyPatterns) {
      if (pattern.test(output.content)) {
        issues.push({
          type: 'unsafe_medical_advice',
          severity: 'high',
          pattern: pattern.toString(),
          action: 'flag',
        });
      }
    }
    
    // Check for missing disclaimer (required for diagnosis)
    if (output.pipeline === 'diagnosis' && !output.content.includes('disclaimer')) {
      issues.push({
        type: 'missing_disclaimer',
        severity: 'medium',
        action: 'modify',
      });
    }
    
    // Check confidence threshold
    if (output.confidence && output.confidence < 0.3) {
      issues.push({
        type: 'low_confidence',
        severity: 'medium',
        action: 'flag',
        metadata: { confidence: output.confidence },
      });
    }
    
    // Determine action
    if (issues.some(i => i.action === 'flag')) {
      return {
        allowed: true,
        action: 'flag',
        issues,
        requiresReview: true,
      };
    }
    
    if (issues.some(i => i.action === 'modify')) {
      return {
        allowed: true,
        action: 'modify',
        issues,
        sanitizedOutput: this.addDisclaimer(output.content),
      };
    }
    
    return { allowed: true, action: 'allow', issues: [] };
  }
  
  private addDisclaimer(content: string): string {
    const disclaimer = '\n\n⚠️ এই তথ্য শুধুমাত্র সাধারণ নির্দেশনার জন্য। সঠিক রোগ নির্ণয় এবং চিকিৎসার জন্য অবশ্যই পশু চিকিৎসকের সাথে পরামর্শ করুন।';
    return content + disclaimer;
  }
}
```

---

## 7. Cost Tracking & Monitoring

### 7.1 Cost Tracker

```typescript
// src/lib/ai/cost/cost-tracker.ts

export class AiCostTracker {
  constructor(
    private readonly redis: Redis,
    private readonly prisma: PrismaClient,
  ) {}
  
  async recordUsage(usage: AiUsageRecord): Promise<void> {
    const { requestId, userId, pipeline, model, tokens, cost } = usage;
    
    // Real-time counters (Redis)
    await this.updateRealTimeCounters(usage);
    
    // Persistent record (Database)
    await this.prisma.aiUsageRecord.create({
      data: {
        requestId,
        userId,
        pipeline,
        model,
        inputTokens: tokens.input,
        outputTokens: tokens.output,
        totalTokens: tokens.total,
        costUsd: cost,
        cached: usage.cached ?? false,
        latencyMs: usage.latencyMs,
        timestamp: new Date(),
      },
    });
  }
  
  async getDailyReport(): Promise<DailyCostReport> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const records = await this.prisma.aiUsageRecord.groupBy({
      by: ['pipeline', 'model'],
      where: {
        timestamp: { gte: today },
      },
      _sum: {
        totalTokens: true,
        costUsd: true,
      },
      _count: true,
    });
    
    const byPipeline = records.reduce((acc, r) => {
      if (!acc[r.pipeline]) {
        acc[r.pipeline] = { requests: 0, tokens: 0, cost: 0 };
      }
      acc[r.pipeline].requests += r._count;
      acc[r.pipeline].tokens += r._sum.totalTokens ?? 0;
      acc[r.pipeline].cost += r._sum.costUsd ?? 0;
      return acc;
    }, {} as Record<string, { requests: number; tokens: number; cost: number }>);
    
    const byModel = records.reduce((acc, r) => {
      if (!acc[r.model]) {
        acc[r.model] = { requests: 0, tokens: 0, cost: 0 };
      }
      acc[r.model].requests += r._count;
      acc[r.model].tokens += r._sum.totalTokens ?? 0;
      acc[r.model].cost += r._sum.costUsd ?? 0;
      return acc;
    }, {} as Record<string, { requests: number; tokens: number; cost: number }>);
    
    return {
      date: today,
      totalRequests: records.reduce((sum, r) => sum + r._count, 0),
      totalTokens: records.reduce((sum, r) => sum + (r._sum.totalTokens ?? 0), 0),
      totalCost: records.reduce((sum, r) => sum + (r._sum.costUsd ?? 0), 0),
      byPipeline,
      byModel,
    };
  }
  
  async getCostAlerts(): Promise<CostAlert[]> {
    const alerts: CostAlert[] = [];
    const today = this.getTodayKey();
    
    // Check system daily budget
    const systemCost = await this.redis.hget(`system:usage:${today}`, 'cost');
    const currentCost = parseFloat(systemCost || '0');
    const budgetThreshold = TOKEN_BUDGETS.system.dailyBudgetUsd * 0.8;
    
    if (currentCost >= budgetThreshold) {
      alerts.push({
        type: 'BUDGET_WARNING',
        level: currentCost >= TOKEN_BUDGETS.system.dailyBudgetUsd ? 'critical' : 'warning',
        message: `Daily budget at ${((currentCost / TOKEN_BUDGETS.system.dailyBudgetUsd) * 100).toFixed(1)}%`,
        currentValue: currentCost,
        threshold: TOKEN_BUDGETS.system.dailyBudgetUsd,
      });
    }
    
    return alerts;
  }
}
```

### 7.2 Cost Dashboard Metrics

```typescript
// src/lib/ai/cost/metrics.ts

export const AI_COST_METRICS = {
  // Request metrics
  aiRequestsTotal: new Counter({
    name: 'ai_requests_total',
    help: 'Total AI requests',
    labelNames: ['pipeline', 'model', 'cached'],
  }),
  
  // Token metrics
  aiTokensTotal: new Counter({
    name: 'ai_tokens_total',
    help: 'Total tokens used',
    labelNames: ['pipeline', 'model', 'type'],
  }),
  
  // Cost metrics
  aiCostTotal: new Counter({
    name: 'ai_cost_usd_total',
    help: 'Total AI cost in USD',
    labelNames: ['pipeline', 'model'],
  }),
  
  // Cache metrics
  aiCacheHitRate: new Gauge({
    name: 'ai_cache_hit_rate',
    help: 'AI cache hit rate',
  }),
  
  aiCacheSavings: new Counter({
    name: 'ai_cache_savings_usd_total',
    help: 'Estimated savings from cache',
  }),
  
  // Budget metrics
  aiBudgetUsagePercent: new Gauge({
    name: 'ai_budget_usage_percent',
    help: 'Budget usage percentage',
    labelNames: ['scope'],
  }),
  
  // Latency
  aiLatencyHistogram: new Histogram({
    name: 'ai_request_duration_seconds',
    help: 'AI request latency',
    labelNames: ['pipeline', 'model'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  }),
};
```

---

## 8. AI Audit Logging

**Table ownership:** `AiUsageRecord` (and `AiCostAlert`) are defined here and catalogued in `TABLE_STRUCTURE.md` §9.9. `AiAuditLogger` in the orchestrator and emergency engine writes to `AiUsageRecord` only.

### 8.1 Audit Schema

```prisma
// Addition to prisma/schema.prisma

model AiUsageRecord {
  id            String    @id @default(cuid())
  requestId     String    @unique
  userId        String
  
  // Request details
  pipeline      String
  model         String
  
  // Tokens
  inputTokens   Int
  outputTokens  Int
  totalTokens   Int
  
  // Cost
  costUsd       Decimal   @db.Decimal(10, 6)
  
  // Performance
  cached        Boolean   @default(false)
  latencyMs     Int
  
  // Moderation
  moderationAction String?
  moderationIssues Json?
  
  // Metadata
  timestamp     DateTime  @default(now())
  
  user          User      @relation(fields: [userId], references: [id])
  
  @@index([userId, timestamp])
  @@index([pipeline, timestamp])
  @@index([timestamp])
  
  @@map("ai_usage_record")
}

model AiCostAlert {
  id            String    @id @default(cuid())
  type          String
  level         String    // warning, critical
  scope         String    // system, user
  scopeId       String?   // userId if user scope
  
  message       String
  currentValue  Decimal
  threshold     Decimal
  
  acknowledged  Boolean   @default(false)
  acknowledgedBy String?
  acknowledgedAt DateTime?
  
  timestamp     DateTime  @default(now())
  
  @@index([timestamp, acknowledged])
  
  @@map("ai_cost_alert")
}
```

### 8.2 Audit Logger

```typescript
// src/lib/ai/audit/audit-logger.ts

export class AiAuditLogger {
  constructor(private readonly prisma: PrismaClient) {}
  
  async logRequest(data: AiAuditLogData): Promise<void> {
    await this.prisma.aiUsageRecord.create({
      data: {
        requestId: data.requestId,
        userId: data.userId,
        pipeline: data.pipeline,
        model: data.model,
        inputTokens: data.tokens.input,
        outputTokens: data.tokens.output,
        totalTokens: data.tokens.total,
        costUsd: new Decimal(data.cost),
        cached: data.cached,
        latencyMs: data.latencyMs,
        moderationAction: data.moderation?.action,
        moderationIssues: data.moderation?.issues,
      },
    });
    
    // Update metrics
    AI_COST_METRICS.aiRequestsTotal.inc({
      pipeline: data.pipeline,
      model: data.model,
      cached: String(data.cached),
    });
    
    AI_COST_METRICS.aiTokensTotal.inc(
      { pipeline: data.pipeline, model: data.model, type: 'input' },
      data.tokens.input
    );
    AI_COST_METRICS.aiTokensTotal.inc(
      { pipeline: data.pipeline, model: data.model, type: 'output' },
      data.tokens.output
    );
    
    AI_COST_METRICS.aiCostTotal.inc(
      { pipeline: data.pipeline, model: data.model },
      data.cost
    );
    
    AI_COST_METRICS.aiLatencyHistogram.observe(
      { pipeline: data.pipeline, model: data.model },
      data.latencyMs / 1000
    );
  }
  
  async getAuditTrail(
    filters: AuditTrailFilters
  ): Promise<AiUsageRecord[]> {
    return this.prisma.aiUsageRecord.findMany({
      where: {
        userId: filters.userId,
        pipeline: filters.pipeline,
        timestamp: {
          gte: filters.startDate,
          lte: filters.endDate,
        },
      },
      orderBy: { timestamp: 'desc' },
      take: filters.limit ?? 100,
    });
  }
  
  async generateCostReport(
    startDate: Date,
    endDate: Date
  ): Promise<CostReport> {
    const records = await this.prisma.aiUsageRecord.groupBy({
      by: ['pipeline', 'model'],
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalTokens: true,
        costUsd: true,
      },
      _count: true,
      _avg: {
        latencyMs: true,
      },
    });
    
    const cacheStats = await this.prisma.aiUsageRecord.aggregate({
      where: {
        timestamp: { gte: startDate, lte: endDate },
      },
      _count: true,
      _sum: {
        costUsd: true,
      },
    });
    
    const cachedCount = await this.prisma.aiUsageRecord.count({
      where: {
        timestamp: { gte: startDate, lte: endDate },
        cached: true,
      },
    });
    
    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalRequests: cacheStats._count,
        totalCost: cacheStats._sum.costUsd?.toNumber() ?? 0,
        cacheHitRate: cachedCount / cacheStats._count,
      },
      byPipeline: this.groupByPipeline(records),
      byModel: this.groupByModel(records),
    };
  }
}
```

---

## 9. Optimization Techniques

### 9.1 Prompt Compression

```typescript
// src/lib/ai/cost/prompt-compressor.ts

export class PromptCompressor {
  compress(prompt: string, maxTokens: number): string {
    const estimatedTokens = this.estimateTokens(prompt);
    
    if (estimatedTokens <= maxTokens) {
      return prompt;
    }
    
    // 1. Remove redundant whitespace
    let compressed = prompt.replace(/\s+/g, ' ').trim();
    
    // 2. Remove unnecessary punctuation
    compressed = compressed.replace(/\.{2,}/g, '.');
    
    // 3. Truncate if still too long
    const targetLength = maxTokens * 3; // Rough char estimate
    if (compressed.length > targetLength) {
      compressed = this.smartTruncate(compressed, targetLength);
    }
    
    return compressed;
  }
  
  private smartTruncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    // Try to truncate at sentence boundary
    const truncated = text.substring(0, maxLength);
    const lastSentence = truncated.lastIndexOf('.');
    
    if (lastSentence > maxLength * 0.7) {
      return truncated.substring(0, lastSentence + 1) + ' [truncated]';
    }
    
    return truncated + '... [truncated]';
  }
}
```

### 9.2 Batch Processing

```typescript
// src/lib/ai/cost/batch-processor.ts

export class AiBatchProcessor {
  private queue: BatchItem[] = [];
  private processing = false;
  
  async add<T>(request: AiRequest): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        request,
        resolve,
        reject,
        addedAt: Date.now(),
      });
      
      this.processIfReady();
    });
  }
  
  private async processIfReady(): Promise<void> {
    // Process when batch is full or timeout reached
    if (this.queue.length >= 5 || this.hasTimedOutItems()) {
      await this.processBatch();
    } else {
      // Set timeout for partial batch
      setTimeout(() => this.processBatch(), 1000);
    }
  }
  
  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const batch = this.queue.splice(0, 10);
    
    try {
      // Process similar requests together
      const grouped = this.groupBySimilarity(batch);
      
      for (const group of grouped) {
        if (group.length === 1) {
          // Single request
          const result = await this.processRequest(group[0].request);
          group[0].resolve(result);
        } else {
          // Batch request (if supported by provider)
          const results = await this.processBatchRequest(group.map(g => g.request));
          group.forEach((item, i) => item.resolve(results[i]));
        }
      }
    } catch (error) {
      batch.forEach(item => item.reject(error));
    } finally {
      this.processing = false;
    }
  }
}
```

---

## 10. Implementation Guide

### 10.1 Environment Variables

```bash
# Budget Configuration
AI_DAILY_BUDGET_USD=100
AI_MONTHLY_BUDGET_USD=2500
AI_BUDGET_ALERT_THRESHOLD=0.8

# Rate Limiting
AI_RATE_LIMIT_USER_MINUTE=20
AI_RATE_LIMIT_USER_HOUR=100
AI_RATE_LIMIT_SYSTEM_MINUTE=1000

# Caching
AI_CACHE_ENABLED=true
AI_CACHE_DEFAULT_TTL_SECONDS=3600

# Model Selection
AI_DEFAULT_MODEL=gpt-4o-mini
AI_PREMIUM_MODEL=gpt-4o
AI_FALLBACK_MODEL=claude-3-haiku
```

### 10.2 File Structure

```
src/lib/ai/cost/
├── index.ts                    # Main exports
├── budget-config.ts            # Budget configuration
├── budget-manager.ts           # Budget enforcement
├── token-estimator.ts          # Token estimation
├── ai-cache.ts                 # Response caching
├── cache-metrics.ts            # Cache analytics
├── model-selector.ts           # Smart model selection
├── rate-limiter.ts             # Rate limiting
├── rate-limiter-config.ts      # Rate limit configuration
├── cost-tracker.ts             # Cost tracking
├── metrics.ts                  # Prometheus metrics
└── prompt-compressor.ts        # Prompt optimization

src/lib/ai/moderation/
├── moderation-service.ts       # Content moderation
└── safety-patterns.ts          # Safety rules

src/lib/ai/audit/
├── audit-logger.ts             # Audit logging
└── report-generator.ts         # Cost reports
```

### 10.3 Integration Example

```typescript
// Example: Cost-optimized AI request

import { BudgetManager } from './cost/budget-manager';
import { AiCache } from './cost/ai-cache';
import { CostOptimizedModelSelector } from './cost/model-selector';
import { AiRateLimiter } from './cost/rate-limiter';
import { AiCostTracker } from './cost/cost-tracker';
import { AiModerationService } from './moderation/moderation-service';

export async function processWithCostOptimization(
  request: AiRequest
): Promise<AiResponse> {
  const budgetManager = new BudgetManager();
  const cache = new AiCache();
  const modelSelector = new CostOptimizedModelSelector();
  const rateLimiter = new AiRateLimiter();
  const costTracker = new AiCostTracker();
  const moderation = new AiModerationService();
  
  // 1. Check cache
  const cached = await cache.get(request);
  if (cached) {
    costTracker.recordUsage({ ...request, cached: true, cost: 0 });
    return cached;
  }
  
  // 2. Rate limit check
  const rateLimit = await rateLimiter.check(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError(rateLimit);
  }
  
  // 3. Budget check
  const budget = await budgetManager.checkBudget(request);
  if (!budget.allowed) {
    throw new BudgetError(budget);
  }
  
  // 4. Input moderation
  const inputMod = await moderation.moderateInput(request.prompt);
  if (!inputMod.allowed) {
    throw new ModerationError(inputMod);
  }
  
  // 5. Select optimal model
  const modelSelection = modelSelector.select(request);
  request.model = modelSelection.model;
  
  // 6. Execute request
  const response = await aiProvider.complete(request);
  
  // 7. Output moderation
  const outputMod = await moderation.moderateOutput(response);
  if (outputMod.action === 'modify') {
    response.content = outputMod.sanitizedOutput;
  }
  
  // 8. Record cost
  await costTracker.recordUsage({
    requestId: request.requestId,
    userId: request.userId,
    pipeline: request.pipeline,
    model: response.model,
    tokens: response.usage,
    cost: response.estimatedCost,
    cached: false,
    latencyMs: response.latencyMs,
  });
  
  // 9. Cache response
  await cache.set(request, response);
  
  // 10. Consume budget
  await budgetManager.consumeBudget(
    request.userId,
    response.usage.totalTokens,
    response.estimatedCost
  );
  
  return response;
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
| Emergency Engine | `docs/ai/EMERGENCY_ENGINE.md` |

---

*End of COST_OPTIMIZATION.md*
