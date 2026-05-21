# MEMORY SYSTEM — Prani Doctor AI

**Version:** 1.1.0  
**Last Updated:** 2026-05-21  
**Scope:** Conversation context, AI memory, session management, offline readiness

---

## Memory Phase Roadmap

| Phase | Modules | Storage | Status |
|-------|---------|---------|--------|
| **MVP** | `conversation_context` | Redis `ctx:{sessionId}` | Required for MVP AI chat |
| **MVP** | `session_summary` | PostgreSQL `AiConversation` | Required — archive on session end |
| **MVP** | `prompt_cache` | Redis `prompt:{hash}` | Required — cost optimization |
| **Phase 2** | `long_term_memory` | PostgreSQL `AiMemoryEntry` | Deferred |
| **Phase 2** | `vector_memory` | `AiMemoryEntry.embeddingVector` + vector index | Deferred |
| **Phase 2** | `personalization` | PostgreSQL `AiUserContext` | Deferred |

> Resolves CONF-H002: MVP tables are in-scope for Phase 0; extended memory is Phase 2. See `docs/database/ERD.md` §14 and `docs/database/DATABASE_ARCHITECTURE.md`.

---

## Table of Contents

1. [Memory System Overview](#1-memory-system-overview)
2. [Conversation Context](#2-conversation-context)
3. [Memory Storage Architecture](#3-memory-storage-architecture)
4. [Context Injection](#4-context-injection)
5. [Session Management](#5-session-management)
6. [Offline AI Fallback](#6-offline-ai-fallback)
7. [Privacy & Data Handling](#7-privacy--data-handling)
8. [Implementation Guide](#8-implementation-guide)

---

## 1. Memory System Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AI MEMORY SYSTEM                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                      MEMORY LAYERS                                      │    │
│  │                                                                         │    │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │    │
│  │  │   SHORT-TERM    │  │   MEDIUM-TERM   │  │    LONG-TERM    │        │    │
│  │  │   (Session)     │  │   (User)        │  │    (System)     │        │    │
│  │  │                 │  │                 │  │                 │        │    │
│  │  │ • Current conv. │  │ • User prefs    │  │ • Animal hist.  │        │    │
│  │  │ • Active ctx    │  │ • Past interac. │  │ • Treatment rec │        │    │
│  │  │ • Temp state    │  │ • Animal data   │  │ • Learned patt. │        │    │
│  │  │                 │  │                 │  │                 │        │    │
│  │  │ TTL: Session    │  │ TTL: 30 days    │  │ TTL: Permanent  │        │    │
│  │  │ Store: Redis    │  │ Store: DB+Cache │  │ Store: Database │        │    │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘        │    │
│  │                                                                         │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                   │                                              │
│                                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                    CONTEXT BUILDER                                      │    │
│  │                                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │    │
│  │  │  Retrieve   │  │  Prioritize │  │  Compress   │  │   Inject    │   │    │
│  │  │   Memory    │──│   Content   │──│   Tokens    │──│   Context   │   │    │
│  │  │             │  │             │  │             │  │             │   │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │    │
│  │                                                                         │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                   │                                              │
│                                   ▼                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │                    AI PROMPT (WITH CONTEXT)                             │    │
│  │                                                                         │    │
│  │   System Prompt + Retrieved Context + User Message → AI Response       │    │
│  │                                                                         │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Memory Types (Logical Layers)

| Type | MVP Module | Scope | Persistence | Purpose |
|------|------------|-------|-------------|---------|
| **Short-Term** | `conversation_context` | Single session | Redis, session TTL | Current messages, entities, state |
| **Session Archive** | `session_summary` | Per conversation | PostgreSQL `AiConversation` | Summaries after session close |
| **Prompt Cache** | `prompt_cache` | Per prompt hash | Redis | Token/cost optimization |
| **Long-Term** | `long_term_memory` *(Phase 2)* | User/animal/system | `AiMemoryEntry` | Facts, preferences, patterns |
| **Vector** | `vector_memory` *(Phase 2)* | Semantic | Embeddings on `AiMemoryEntry` | Similarity search |
| **Personalization** | `personalization` *(Phase 2)* | User | `AiUserContext` | Prefs, topics, active animals |

Application data (animal profiles, treatments) remains in core domain tables — not AI memory modules.

### 1.3 MVP vs Phase 2 Implementation Scope

**MVP (implement now):**

- `ConversationContextManager` + Redis short-term store
- Archive to `AiConversation` on `closeConversation`
- `prompt_cache` in orchestrator pipeline (see `AI_ORCHESTRATOR.md` §11)
- Optional `AiMessage` rows when full transcript retention is required

**Phase 2 (do not block MVP):**

- `AiUserContext` upsert on every session
- `AiMemoryEntry` with `embeddingVector` and semantic retrieval
- Cross-session personalization injection

---

## 2. Conversation Context

### 2.1 Context Structure

```typescript
// src/lib/ai/memory/types/context.types.ts

export interface ConversationContext {
  /** Session identifier */
  sessionId: string;
  
  /** User identifier */
  userId: string;
  
  /** Conversation identifier */
  conversationId: string;
  
  /** Current conversation state */
  state: ConversationState;
  
  /** Message history */
  messages: ConversationMessage[];
  
  /** Extracted entities */
  entities: ExtractedEntities;
  
  /** Active topic */
  currentTopic: ConversationTopic | null;
  
  /** Pending actions */
  pendingActions: PendingAction[];
  
  /** Metadata */
  metadata: ConversationMetadata;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tokens?: number;
  metadata?: {
    intent?: string;
    sentiment?: string;
    language?: string;
  };
}

export interface ExtractedEntities {
  /** Animal being discussed */
  animal?: {
    id?: string;
    species: string;
    name?: string;
  };
  
  /** Symptoms mentioned */
  symptoms: string[];
  
  /** Conditions mentioned */
  conditions: string[];
  
  /** Dates mentioned */
  dates: Array<{ type: string; date: Date }>;
  
  /** Location info */
  location?: {
    district?: string;
    upazila?: string;
  };
}

export interface ConversationTopic {
  type: 'triage' | 'diagnosis' | 'booking' | 'general' | 'support';
  startedAt: Date;
  relatedEntities: string[];
}

export interface ConversationState {
  phase: 'greeting' | 'gathering_info' | 'processing' | 'providing_result' | 'follow_up' | 'closing';
  awaiting?: string;
  completedSteps: string[];
}
```

### 2.2 Context Manager

```typescript
// src/lib/ai/memory/context-manager.ts

export class ConversationContextManager {
  constructor(
    private readonly shortTermStore: ShortTermMemoryStore,
    private readonly mediumTermStore: MediumTermMemoryStore,
    private readonly longTermStore: LongTermMemoryStore,
  ) {}
  
  async getOrCreateContext(
    sessionId: string,
    userId: string,
    conversationId?: string
  ): Promise<ConversationContext> {
    // Try to get existing session context
    let context = await this.shortTermStore.get<ConversationContext>(
      `ctx:${sessionId}`
    );
    
    if (context) {
      return context;
    }
    
    // Create new context
    context = {
      sessionId,
      userId,
      conversationId: conversationId ?? generateId(),
      state: { phase: 'greeting', completedSteps: [] },
      messages: [],
      entities: { symptoms: [], conditions: [], dates: [] },
      currentTopic: null,
      pendingActions: [],
      metadata: {
        createdAt: new Date(),
        lastActiveAt: new Date(),
      },
    };
    
    // Enrich with user's historical context
    const userContext = await this.mediumTermStore.get<UserContext>(
      `user:${userId}`
    );
    
    if (userContext) {
      context.metadata.userPreferences = userContext.preferences;
      context.metadata.recentTopics = userContext.recentTopics;
    }
    
    await this.shortTermStore.set(`ctx:${sessionId}`, context);
    return context;
  }
  
  async addMessage(
    sessionId: string,
    message: Omit<ConversationMessage, 'id' | 'timestamp'>
  ): Promise<ConversationContext> {
    const context = await this.shortTermStore.get<ConversationContext>(
      `ctx:${sessionId}`
    );
    
    if (!context) {
      throw new ContextNotFoundError(sessionId);
    }
    
    const newMessage: ConversationMessage = {
      id: generateId(),
      ...message,
      timestamp: new Date(),
    };
    
    context.messages.push(newMessage);
    context.metadata.lastActiveAt = new Date();
    
    // Extract entities from user messages
    if (message.role === 'user') {
      await this.extractAndMergeEntities(context, message.content);
    }
    
    // Update state based on message
    this.updateConversationState(context, newMessage);
    
    // Trim if too many messages
    if (context.messages.length > 50) {
      context.messages = this.summarizeOldMessages(context.messages);
    }
    
    await this.shortTermStore.set(`ctx:${sessionId}`, context);
    return context;
  }
  
  async updateState(
    sessionId: string,
    updates: Partial<ConversationState>
  ): Promise<void> {
    const context = await this.shortTermStore.get<ConversationContext>(
      `ctx:${sessionId}`
    );
    
    if (context) {
      context.state = { ...context.state, ...updates };
      await this.shortTermStore.set(`ctx:${sessionId}`, context);
    }
  }
  
  async closeConversation(sessionId: string): Promise<void> {
    const context = await this.shortTermStore.get<ConversationContext>(
      `ctx:${sessionId}`
    );
    
    if (context) {
      // Archive to medium-term storage
      await this.archiveConversation(context);
      
      // Update user's medium-term context
      await this.updateUserContext(context);
      
      // Clear short-term
      await this.shortTermStore.delete(`ctx:${sessionId}`);
    }
  }
  
  private async extractAndMergeEntities(
    context: ConversationContext,
    text: string
  ): Promise<void> {
    // Extract symptoms
    const symptoms = extractBengaliSymptoms(text);
    context.entities.symptoms = [
      ...new Set([...context.entities.symptoms, ...symptoms])
    ];
    
    // Extract animal reference
    const animalMatch = text.match(/(গরু|ছাগল|মুরগি|cow|goat|chicken)/i);
    if (animalMatch && !context.entities.animal) {
      context.entities.animal = {
        species: mapToSpecies(animalMatch[1]),
      };
    }
    
    // Extract duration/time references
    const durationMatch = text.match(/(\d+)\s*(দিন|ঘণ্টা|day|hour)/i);
    if (durationMatch) {
      context.entities.dates.push({
        type: 'symptom_duration',
        date: new Date(), // Calculate actual date
      });
    }
  }
  
  private summarizeOldMessages(
    messages: ConversationMessage[]
  ): ConversationMessage[] {
    // Keep last 20 messages
    const recentMessages = messages.slice(-20);
    
    // Summarize older messages into a system message
    const oldMessages = messages.slice(0, -20);
    if (oldMessages.length > 0) {
      const summary: ConversationMessage = {
        id: generateId(),
        role: 'system',
        content: `[Previous conversation summary: Discussed ${oldMessages.length} messages covering symptoms and initial assessment]`,
        timestamp: oldMessages[0].timestamp,
      };
      return [summary, ...recentMessages];
    }
    
    return recentMessages;
  }
}
```

---

## 3. Memory Storage Architecture

### 3.0 MVP Module Map

```
MVP                          Phase 2 (deferred)
─────────────────────────    ─────────────────────────
conversation_context  →      long_term_memory
session_summary       →      vector_memory
prompt_cache          →      personalization
```

### 3.1 Storage Layers (MVP)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       MEMORY STORAGE ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │                    SHORT-TERM MEMORY (Redis)                        │       │
│  │                                                                     │       │
│  │  Key Pattern: ctx:{sessionId}                                       │       │
│  │  TTL: Session duration (default 30 min)                            │       │
│  │  Max Size: 100KB per context                                       │       │
│  │                                                                     │       │
│  │  Data:                                                             │       │
│  │  • Current conversation messages                                   │       │
│  │  • Active conversation state                                       │       │
│  │  • Extracted entities                                              │       │
│  │  • Pending actions                                                 │       │
│  │                                                                     │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                   │                                             │
│                                   │ Archive on session end                      │
│                                   ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │                   MEDIUM-TERM MEMORY (PostgreSQL + Redis Cache)     │       │
│  │                                                                     │       │
│  │  Tables:                                                           │       │
│  │  • AiConversation - Archived conversations                         │       │
│  │  • AiUserContext - User preferences and history                    │       │
│  │                                                                     │       │
│  │  Cache Key: user:{userId}:ctx                                      │       │
│  │  Cache TTL: 1 hour                                                 │       │
│  │  DB TTL: 30 days (configurable)                                    │       │
│  │                                                                     │       │
│  │  Data:                                                             │       │
│  │  • Past conversation summaries                                     │       │
│  │  • User preferences                                                │       │
│  │  • Common topics                                                   │       │
│  │  • Animal context cache                                            │       │
│  │                                                                     │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                   │                                             │
│                                   │ Reference                                   │
│                                   ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │                    LONG-TERM MEMORY (PostgreSQL)                    │       │
│  │                                                                     │       │
│  │  Tables:                                                           │       │
│  │  • AnimalProfile - Animal information                              │       │
│  │  • TreatmentCase - Treatment history                               │       │
│  │  • Prescription - Prescription history                             │       │
│  │  • ServiceRequest - Service history                                │       │
│  │                                                                     │       │
│  │  TTL: Permanent (application data)                                 │       │
│  │                                                                     │       │
│  │  Data:                                                             │       │
│  │  • Complete animal medical history                                 │       │
│  │  • All past treatments and prescriptions                           │       │
│  │  • Service request history                                         │       │
│  │  • Diagnostic patterns                                             │       │
│  │                                                                     │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Database Schema — MVP Tables

```prisma
// Addition to prisma/schema.prisma — MVP scope

// AI Conversation Archive (session_summary)
model AiConversation {
  id              String    @id @default(cuid())
  userId          String
  conversationId  String    @unique
  
  // Conversation data
  summary         String?   @db.Text
  topic           String?
  messageCount    Int
  
  // Extracted context
  entitiesJson    Json?     // Stored entities
  
  // Outcomes
  outcomeType     String?   // triage, diagnosis, booking, etc.
  outcomeId       String?   // Reference to created entity
  
  // Metadata
  startedAt       DateTime
  endedAt         DateTime
  durationSeconds Int
  
  createdAt       DateTime  @default(now())
  
  user            User      @relation(fields: [userId], references: [id])
  
  @@index([userId, startedAt])
  @@index([topic])
  
  @@map("ai_conversation")
}

// AI Message (optional MVP — full transcript when audit requires)
model AiMessage {
  id              String    @id @default(cuid())
  conversationId  String
  role            String    // user | assistant | system
  content         String    @db.Text
  tokens          Int?
  createdAt       DateTime  @default(now())

  conversation    AiConversation @relation(fields: [conversationId], references: [conversationId])

  @@index([conversationId, createdAt])
  @@map("ai_message")
}
```

### 3.2.1 Database Schema — Phase 2 Tables (Deferred)

> Do not add to Prisma schema for MVP freeze. Implement after MVP AI chat is stable.

```prisma
// Phase 2 — personalization
model AiUserContext {
  id              String    @id @default(cuid())
  userId          String    @unique
  
  // Preferences
  preferredLanguage String  @default("bn")
  preferredProvider String? // Preferred doctor/technician
  
  // Conversation patterns
  commonTopics    Json?     // Array of frequently discussed topics
  lastTopics      Json?     // Recent topics for context
  
  // Animal context cache
  activeAnimals   Json?     // Quick reference to user's animals
  
  // Aggregated insights
  totalConversations Int    @default(0)
  lastConversationAt DateTime?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  user            User      @relation(fields: [userId], references: [id])
  
  @@map("ai_user_context")
}

// Phase 2 — long_term_memory + vector_memory
model AiMemoryEntry {
  id              String    @id @default(cuid())
  
  // Scope
  scope           String    // 'user', 'animal', 'system'
  scopeId         String    // userId, animalId, or 'global'
  
  // Content
  memoryType      String    // 'fact', 'preference', 'pattern', 'summary'
  content         String    @db.Text
  
  // Vector embedding for semantic search (future)
  embeddingVector Float[]?  @db.DoublePrecision
  
  // Metadata
  source          String?   // Where this memory came from
  confidence      Float     @default(1.0)
  accessCount     Int       @default(0)
  lastAccessedAt  DateTime?
  
  // Expiry
  expiresAt       DateTime?
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([scope, scopeId])
  @@index([memoryType])
  
  @@map("ai_memory_entry")
}
```

### 3.3 Memory Store Implementations

```typescript
// src/lib/ai/memory/stores/short-term.store.ts

export class ShortTermMemoryStore {
  constructor(private readonly redis: Redis) {}
  
  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }
  
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const data = JSON.stringify(value);
    
    // Check size limit (100KB)
    if (data.length > 100 * 1024) {
      throw new MemorySizeExceededError(key, data.length);
    }
    
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, data);
    } else {
      // Default 30 minute TTL
      await this.redis.setex(key, 30 * 60, data);
    }
  }
  
  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
  
  async extend(key: string, additionalSeconds: number): Promise<void> {
    const currentTtl = await this.redis.ttl(key);
    if (currentTtl > 0) {
      await this.redis.expire(key, currentTtl + additionalSeconds);
    }
  }
}

// src/lib/ai/memory/stores/medium-term.store.ts

export class MediumTermMemoryStore {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cache: ShortTermMemoryStore,
  ) {}
  
  async getUserContext(userId: string): Promise<UserContext | null> {
    // Try cache first
    const cacheKey = `user:${userId}:ctx`;
    const cached = await this.cache.get<UserContext>(cacheKey);
    if (cached) return cached;
    
    // Query database
    const dbContext = await this.prisma.aiUserContext.findUnique({
      where: { userId },
    });
    
    if (!dbContext) return null;
    
    const context: UserContext = {
      userId: dbContext.userId,
      preferredLanguage: dbContext.preferredLanguage,
      preferredProvider: dbContext.preferredProvider,
      commonTopics: dbContext.commonTopics as string[],
      lastTopics: dbContext.lastTopics as string[],
      activeAnimals: dbContext.activeAnimals as AnimalSummary[],
      totalConversations: dbContext.totalConversations,
      lastConversationAt: dbContext.lastConversationAt,
    };
    
    // Cache for 1 hour
    await this.cache.set(cacheKey, context, 60 * 60);
    
    return context;
  }
  
  async updateUserContext(
    userId: string,
    updates: Partial<UserContext>
  ): Promise<void> {
    await this.prisma.aiUserContext.upsert({
      where: { userId },
      create: {
        userId,
        ...updates,
      },
      update: {
        ...updates,
        updatedAt: new Date(),
      },
    });
    
    // Invalidate cache
    await this.cache.delete(`user:${userId}:ctx`);
  }
  
  async archiveConversation(conversation: ArchivedConversation): Promise<void> {
    await this.prisma.aiConversation.create({
      data: {
        userId: conversation.userId,
        conversationId: conversation.conversationId,
        summary: conversation.summary,
        topic: conversation.topic,
        messageCount: conversation.messageCount,
        entitiesJson: conversation.entities,
        outcomeType: conversation.outcomeType,
        outcomeId: conversation.outcomeId,
        startedAt: conversation.startedAt,
        endedAt: conversation.endedAt,
        durationSeconds: conversation.durationSeconds,
      },
    });
  }
  
  async getRecentConversations(
    userId: string,
    limit: number = 5
  ): Promise<ConversationSummary[]> {
    const conversations = await this.prisma.aiConversation.findMany({
      where: { userId },
      orderBy: { endedAt: 'desc' },
      take: limit,
      select: {
        conversationId: true,
        summary: true,
        topic: true,
        startedAt: true,
        endedAt: true,
      },
    });
    
    return conversations;
  }
}

// src/lib/ai/memory/stores/long-term.store.ts

export class LongTermMemoryStore {
  constructor(private readonly prisma: PrismaClient) {}
  
  async getAnimalHistory(animalId: string): Promise<AnimalHistory> {
    const [animal, treatments, prescriptions, requests] = await Promise.all([
      this.prisma.animalProfile.findUnique({
        where: { id: animalId },
        include: { customer: { select: { displayName: true } } },
      }),
      this.prisma.treatmentCase.findMany({
        where: { animalId },
        orderBy: { recordedAt: 'desc' },
        take: 10,
      }),
      this.prisma.prescription.findMany({
        where: { animalId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { items: true },
      }),
      this.prisma.serviceRequest.findMany({
        where: { animalId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);
    
    return {
      animal,
      treatments,
      prescriptions,
      serviceHistory: requests,
      summary: this.summarizeHistory(treatments, prescriptions, requests),
    };
  }
  
  async getCustomerAnimals(userId: string): Promise<AnimalSummary[]> {
    const customer = await this.prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        animals: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            animalType: true,
          },
        },
      },
    });
    
    return customer?.animals ?? [];
  }
  
  private summarizeHistory(
    treatments: TreatmentCase[],
    prescriptions: Prescription[],
    requests: ServiceRequest[]
  ): string {
    const parts: string[] = [];
    
    if (treatments.length > 0) {
      const conditions = treatments
        .map(t => t.diagnosis)
        .filter(Boolean)
        .slice(0, 3);
      parts.push(`Past conditions: ${conditions.join(', ')}`);
    }
    
    if (requests.length > 0) {
      const recentRequest = requests[0];
      parts.push(`Last service: ${recentRequest.serviceType} on ${recentRequest.createdAt.toDateString()}`);
    }
    
    return parts.join('. ');
  }
}
```

---

## 4. Context Injection

### 4.1 Context Builder

```typescript
// src/lib/ai/memory/context-builder.ts

export class ContextBuilder {
  constructor(
    private readonly shortTermStore: ShortTermMemoryStore,
    private readonly mediumTermStore: MediumTermMemoryStore,
    private readonly longTermStore: LongTermMemoryStore,
    private readonly tokenBudget: number = 4000,
  ) {}
  
  async buildContext(
    sessionId: string,
    userId: string,
    currentMessage: string
  ): Promise<BuiltContext> {
    const usedTokens: Record<string, number> = {};
    const contextParts: ContextPart[] = [];
    let remainingBudget = this.tokenBudget;
    
    // 1. Get conversation context (highest priority)
    const conversationContext = await this.getConversationContext(sessionId);
    if (conversationContext) {
      const tokens = estimateTokens(conversationContext.content);
      if (tokens <= remainingBudget) {
        contextParts.push(conversationContext);
        remainingBudget -= tokens;
        usedTokens['conversation'] = tokens;
      }
    }
    
    // 2. Get user context
    const userContext = await this.getUserContext(userId);
    if (userContext && remainingBudget > 500) {
      const tokens = estimateTokens(userContext.content);
      if (tokens <= remainingBudget) {
        contextParts.push(userContext);
        remainingBudget -= tokens;
        usedTokens['user'] = tokens;
      }
    }
    
    // 3. Get animal context if mentioned
    const animalContext = await this.getAnimalContext(
      conversationContext?.entities?.animal?.id,
      userId,
      remainingBudget
    );
    if (animalContext) {
      const tokens = estimateTokens(animalContext.content);
      contextParts.push(animalContext);
      remainingBudget -= tokens;
      usedTokens['animal'] = tokens;
    }
    
    // 4. Get relevant memories
    if (remainingBudget > 200) {
      const memories = await this.getRelevantMemories(
        userId,
        currentMessage,
        remainingBudget
      );
      for (const memory of memories) {
        const tokens = estimateTokens(memory.content);
        if (tokens <= remainingBudget) {
          contextParts.push(memory);
          remainingBudget -= tokens;
          usedTokens['memory'] = (usedTokens['memory'] ?? 0) + tokens;
        }
      }
    }
    
    return {
      parts: contextParts,
      totalTokens: this.tokenBudget - remainingBudget,
      tokenBreakdown: usedTokens,
      formatted: this.formatContext(contextParts),
    };
  }
  
  private async getConversationContext(sessionId: string): Promise<ContextPart | null> {
    const context = await this.shortTermStore.get<ConversationContext>(
      `ctx:${sessionId}`
    );
    
    if (!context || context.messages.length === 0) {
      return null;
    }
    
    // Format recent messages
    const recentMessages = context.messages.slice(-10);
    const messageHistory = recentMessages
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');
    
    // Format entities
    const entities: string[] = [];
    if (context.entities.animal) {
      entities.push(`Animal: ${context.entities.animal.species} ${context.entities.animal.name || ''}`);
    }
    if (context.entities.symptoms.length > 0) {
      entities.push(`Symptoms discussed: ${context.entities.symptoms.join(', ')}`);
    }
    
    return {
      type: 'conversation',
      priority: 1,
      content: `CURRENT CONVERSATION:
${messageHistory}

${entities.length > 0 ? `EXTRACTED INFORMATION:\n${entities.join('\n')}` : ''}`,
      entities: context.entities,
    };
  }
  
  private async getUserContext(userId: string): Promise<ContextPart | null> {
    const userContext = await this.mediumTermStore.getUserContext(userId);
    
    if (!userContext) {
      return null;
    }
    
    const parts: string[] = [];
    
    if (userContext.preferredLanguage) {
      parts.push(`Preferred language: ${userContext.preferredLanguage === 'bn' ? 'Bengali' : 'English'}`);
    }
    
    if (userContext.activeAnimals?.length) {
      const animalList = userContext.activeAnimals
        .map(a => `${a.name || 'Unnamed'} (${a.species})`)
        .join(', ');
      parts.push(`User's animals: ${animalList}`);
    }
    
    if (userContext.lastTopics?.length) {
      parts.push(`Recent topics: ${userContext.lastTopics.slice(0, 3).join(', ')}`);
    }
    
    if (parts.length === 0) {
      return null;
    }
    
    return {
      type: 'user',
      priority: 2,
      content: `USER CONTEXT:\n${parts.join('\n')}`,
    };
  }
  
  private async getAnimalContext(
    animalId: string | undefined,
    userId: string,
    budget: number
  ): Promise<ContextPart | null> {
    if (!animalId) {
      return null;
    }
    
    const history = await this.longTermStore.getAnimalHistory(animalId);
    
    if (!history.animal) {
      return null;
    }
    
    const content = `ANIMAL INFORMATION:
Name: ${history.animal.name || 'Not named'}
Species: ${history.animal.species}
Breed: ${history.animal.breed || 'Unknown'}
Age: ${history.animal.dateOfBirth ? calculateAge(history.animal.dateOfBirth) : 'Unknown'}
Weight: ${history.animal.weightKg ? `${history.animal.weightKg} kg` : 'Unknown'}

${history.summary ? `MEDICAL HISTORY SUMMARY:\n${history.summary}` : ''}`;
    
    return {
      type: 'animal',
      priority: 2,
      content,
    };
  }
  
  private formatContext(parts: ContextPart[]): string {
    // Sort by priority
    const sorted = [...parts].sort((a, b) => a.priority - b.priority);
    
    return sorted
      .map(p => `--- ${p.type.toUpperCase()} CONTEXT ---\n${p.content}`)
      .join('\n\n');
  }
}
```

### 4.2 Context Injection Middleware

```typescript
// src/lib/ai/memory/context-injector.ts

export class ContextInjector {
  constructor(private readonly contextBuilder: ContextBuilder) {}
  
  async injectContext(
    request: AiRequest,
    sessionId: string,
    userId: string
  ): Promise<AiRequest> {
    // Build context
    const context = await this.contextBuilder.buildContext(
      sessionId,
      userId,
      request.prompt
    );
    
    // If no context, return as-is
    if (context.totalTokens === 0) {
      return request;
    }
    
    // Inject context into system prompt
    const enhancedSystemPrompt = `${request.system}

CONTEXT INFORMATION (use if relevant to user's question):
${context.formatted}

END OF CONTEXT
---`;
    
    return {
      ...request,
      system: enhancedSystemPrompt,
      metadata: {
        ...request.metadata,
        contextTokens: context.totalTokens,
        contextBreakdown: context.tokenBreakdown,
      },
    };
  }
}
```

---

## 5. Session Management

### 5.1 Session Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       SESSION LIFECYCLE                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────┐                                                            │
│  │  SESSION START  │  User opens app/starts conversation                        │
│  └────────┬────────┘                                                            │
│           │                                                                      │
│           ▼                                                                      │
│  ┌─────────────────┐                                                            │
│  │ Initialize      │                                                            │
│  │ • Create context│                                                            │
│  │ • Load user ctx │                                                            │
│  │ • Set TTL       │                                                            │
│  └────────┬────────┘                                                            │
│           │                                                                      │
│           ▼                                                                      │
│  ┌─────────────────┐                                                            │
│  │ ACTIVE SESSION  │◀───────────────────────────────────────┐                  │
│  │                 │                                         │                  │
│  │ • Process msgs  │──▶ User message ──▶ Process ──▶ Response                  │
│  │ • Update ctx    │◀─────────────────────────────────────────                  │
│  │ • Extend TTL    │                                                            │
│  └────────┬────────┘                                                            │
│           │                                                                      │
│           │ TTL expires OR user ends                                            │
│           ▼                                                                      │
│  ┌─────────────────┐                                                            │
│  │ SESSION END     │                                                            │
│  │                 │                                                            │
│  │ • Archive conv. │                                                            │
│  │ • Update user   │                                                            │
│  │ • Clear short   │                                                            │
│  │   term memory   │                                                            │
│  └─────────────────┘                                                            │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Session Manager

```typescript
// src/lib/ai/memory/session-manager.ts

export class AiSessionManager {
  private readonly DEFAULT_TTL = 30 * 60; // 30 minutes
  private readonly EXTEND_THRESHOLD = 5 * 60; // 5 minutes
  
  constructor(
    private readonly contextManager: ConversationContextManager,
    private readonly shortTermStore: ShortTermMemoryStore,
  ) {}
  
  async startSession(
    sessionId: string,
    userId: string,
    options?: SessionOptions
  ): Promise<SessionInfo> {
    const context = await this.contextManager.getOrCreateContext(
      sessionId,
      userId
    );
    
    // Set initial TTL
    const ttl = options?.ttlSeconds ?? this.DEFAULT_TTL;
    await this.shortTermStore.set(`session:${sessionId}`, {
      userId,
      startedAt: new Date(),
      lastActiveAt: new Date(),
      ttl,
    }, ttl);
    
    return {
      sessionId,
      userId,
      conversationId: context.conversationId,
      expiresAt: new Date(Date.now() + ttl * 1000),
    };
  }
  
  async touchSession(sessionId: string): Promise<void> {
    const session = await this.shortTermStore.get<SessionData>(`session:${sessionId}`);
    
    if (!session) {
      throw new SessionNotFoundError(sessionId);
    }
    
    // Update last active time
    session.lastActiveAt = new Date();
    await this.shortTermStore.set(`session:${sessionId}`, session, session.ttl);
    
    // Also extend context TTL
    await this.shortTermStore.extend(`ctx:${sessionId}`, session.ttl);
  }
  
  async extendSession(sessionId: string, additionalSeconds?: number): Promise<void> {
    const extension = additionalSeconds ?? this.DEFAULT_TTL;
    
    await this.shortTermStore.extend(`session:${sessionId}`, extension);
    await this.shortTermStore.extend(`ctx:${sessionId}`, extension);
  }
  
  async endSession(sessionId: string): Promise<void> {
    // Close and archive conversation
    await this.contextManager.closeConversation(sessionId);
    
    // Clear session data
    await this.shortTermStore.delete(`session:${sessionId}`);
  }
  
  async isSessionActive(sessionId: string): Promise<boolean> {
    const session = await this.shortTermStore.get<SessionData>(`session:${sessionId}`);
    return session !== null;
  }
  
  async getSessionInfo(sessionId: string): Promise<SessionInfo | null> {
    const session = await this.shortTermStore.get<SessionData>(`session:${sessionId}`);
    if (!session) return null;
    
    const context = await this.shortTermStore.get<ConversationContext>(`ctx:${sessionId}`);
    
    return {
      sessionId,
      userId: session.userId,
      conversationId: context?.conversationId,
      startedAt: session.startedAt,
      lastActiveAt: session.lastActiveAt,
      expiresAt: new Date(Date.now() + session.ttl * 1000),
      messageCount: context?.messages.length ?? 0,
    };
  }
}
```

---

## 6. Offline AI Fallback

### 6.1 Offline Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                       OFFLINE AI FALLBACK STRATEGY                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  CURRENT STATE (MVP): No offline AI - queue for later                           │
│  FUTURE STATE: Local model + cached responses                                   │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │                    OFFLINE DETECTION                                │       │
│  │                                                                     │       │
│  │  Mobile App                                                        │       │
│  │     │                                                              │       │
│  │     ├─▶ Check connectivity                                         │       │
│  │     │   └─▶ Online  ──▶ Normal API flow                           │       │
│  │     │   └─▶ Offline ──▶ Offline flow                              │       │
│  │     │                                                              │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                   │                                             │
│                                   │ Offline                                     │
│                                   ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │                    OFFLINE FLOW (MVP)                               │       │
│  │                                                                     │       │
│  │  1. Show cached FAQ/common responses                               │       │
│  │  2. Queue AI request for later sync                                │       │
│  │  3. Allow form-based data collection                               │       │
│  │  4. Sync and process when online                                   │       │
│  │                                                                     │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                   │                                             │
│                                   │ Future                                      │
│                                   ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │                    OFFLINE FLOW (FUTURE)                            │       │
│  │                                                                     │       │
│  │  ┌───────────────────────────────────────────────────────────┐     │       │
│  │  │               LOCAL MODEL (On-Device)                     │     │       │
│  │  │                                                           │     │       │
│  │  │  • Lightweight model (e.g., Llama 3B quantized)          │     │       │
│  │  │  • Limited to triage + emergency detection               │     │       │
│  │  │  • Pre-downloaded veterinary knowledge                    │     │       │
│  │  │  • Flag for server verification when online              │     │       │
│  │  │                                                           │     │       │
│  │  └───────────────────────────────────────────────────────────┘     │       │
│  │                                                                     │       │
│  │  ┌───────────────────────────────────────────────────────────┐     │       │
│  │  │               CACHED RESPONSES                            │     │       │
│  │  │                                                           │     │       │
│  │  │  • Common symptom → triage mappings                      │     │       │
│  │  │  • Emergency protocols                                   │     │       │
│  │  │  • First aid instructions                                │     │       │
│  │  │  • FAQ responses                                         │     │       │
│  │  │                                                           │     │       │
│  │  └───────────────────────────────────────────────────────────┘     │       │
│  │                                                                     │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Offline Memory Store (Mobile)

```typescript
// lib/core/ai/offline_memory_store.dart (Flutter)

class OfflineAiMemoryStore {
  final Box<String> _memoryBox;
  final Box<String> _queueBox;
  
  OfflineAiMemoryStore(this._memoryBox, this._queueBox);
  
  // Store conversation for offline access
  Future<void> storeConversation(ConversationContext context) async {
    final key = 'conv:${context.conversationId}';
    await _memoryBox.put(key, jsonEncode(context.toJson()));
  }
  
  // Get offline conversation
  Future<ConversationContext?> getConversation(String conversationId) async {
    final key = 'conv:$conversationId';
    final data = _memoryBox.get(key);
    if (data == null) return null;
    return ConversationContext.fromJson(jsonDecode(data));
  }
  
  // Queue AI request for later
  Future<void> queueRequest(AiRequest request) async {
    final id = const Uuid().v4();
    await _queueBox.put(id, jsonEncode({
      'id': id,
      'request': request.toJson(),
      'createdAt': DateTime.now().toIso8601String(),
    }));
  }
  
  // Get pending requests for sync
  Future<List<QueuedAiRequest>> getPendingRequests() async {
    final requests = <QueuedAiRequest>[];
    for (final key in _queueBox.keys) {
      final data = _queueBox.get(key);
      if (data != null) {
        requests.add(QueuedAiRequest.fromJson(jsonDecode(data)));
      }
    }
    return requests;
  }
  
  // Clear synced request
  Future<void> clearRequest(String requestId) async {
    await _queueBox.delete(requestId);
  }
  
  // Get cached emergency protocols
  Future<List<EmergencyProtocol>> getEmergencyProtocols() async {
    // Pre-cached emergency protocols for offline use
    return [
      EmergencyProtocol(
        symptom: 'bloat',
        species: ['CATTLE', 'GOAT'],
        urgency: 'CRITICAL',
        immediateActions: [
          'Do not give food or water',
          'Keep animal standing if possible',
          'Call veterinarian immediately',
        ],
        warningSignsBn: [
          'পেট ফুলে যাওয়া',
          'শ্বাস কষ্ট',
          'অস্থিরতা',
        ],
      ),
      // ... more protocols
    ];
  }
}
```

---

## 7. Privacy & Data Handling

### 7.1 Data Classification

| Data Type | Classification | Storage | Retention |
|-----------|---------------|---------|-----------|
| Conversation text | Sensitive | Encrypted | 30 days |
| Animal health info | Medical | Encrypted | Permanent |
| User preferences | Personal | Encrypted | Until deletion |
| AI responses | Non-sensitive | Plain | 7 days |
| Aggregated patterns | De-identified | Plain | Permanent |

### 7.2 PII Handling

```typescript
// src/lib/ai/memory/privacy/pii-handler.ts

export class PiiHandler {
  private readonly piiPatterns = [
    { type: 'phone', pattern: /01[3-9]\d{8}/g, replacement: '[PHONE]' },
    { type: 'email', pattern: /[\w.-]+@[\w.-]+\.\w+/g, replacement: '[EMAIL]' },
    { type: 'nid', pattern: /\d{10,17}/g, replacement: '[ID]' },
    { type: 'address', pattern: /বাড়ি নং \d+/g, replacement: '[ADDRESS]' },
  ];
  
  // Sanitize text before sending to AI
  sanitizeForAi(text: string): string {
    let sanitized = text;
    for (const { pattern, replacement } of this.piiPatterns) {
      sanitized = sanitized.replace(pattern, replacement);
    }
    return sanitized;
  }
  
  // Sanitize context before storage
  sanitizeForStorage(context: ConversationContext): ConversationContext {
    return {
      ...context,
      messages: context.messages.map(m => ({
        ...m,
        content: this.sanitizeForAi(m.content),
      })),
    };
  }
  
  // Extract PII for separate secure storage
  extractPii(text: string): ExtractedPii[] {
    const pii: ExtractedPii[] = [];
    for (const { type, pattern } of this.piiPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          pii.push({ type, value: match });
        }
      }
    }
    return pii;
  }
}
```

### 7.3 Data Retention Policy

```typescript
// src/lib/ai/memory/privacy/retention-policy.ts

export const RETENTION_POLICIES = {
  // Short-term (session)
  session: {
    type: 'session',
    maxAge: null, // Session lifetime
    deleteOnSessionEnd: true,
  },
  
  // Conversation archives
  conversation: {
    type: 'conversation',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    deleteAfterExpiry: true,
    anonymizeAfter: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  
  // User context
  userContext: {
    type: 'userContext',
    maxAge: null, // Until account deletion
    deleteOnAccountDeletion: true,
  },
  
  // AI memory entries
  memory: {
    type: 'memory',
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days for user scope
    deleteAfterExpiry: true,
  },
};

export class RetentionManager {
  async enforceRetention(): Promise<RetentionReport> {
    const now = new Date();
    const report: RetentionReport = {
      conversationsDeleted: 0,
      memoriesDeleted: 0,
      dataAnonymized: 0,
    };
    
    // Delete old conversations
    const oldConversations = await this.prisma.aiConversation.deleteMany({
      where: {
        createdAt: {
          lt: new Date(now.getTime() - RETENTION_POLICIES.conversation.maxAge!),
        },
      },
    });
    report.conversationsDeleted = oldConversations.count;
    
    // Delete expired memories
    const expiredMemories = await this.prisma.aiMemoryEntry.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });
    report.memoriesDeleted = expiredMemories.count;
    
    return report;
  }
}
```

---

## 8. Implementation Guide

### 8.1 Environment Variables

```bash
# Memory Configuration
AI_MEMORY_SHORT_TERM_TTL=1800         # 30 minutes
AI_MEMORY_CONTEXT_TOKEN_BUDGET=4000
AI_MEMORY_MAX_MESSAGES=50

# Retention
AI_RETENTION_CONVERSATION_DAYS=30
AI_RETENTION_MEMORY_DAYS=90

# Offline (Future)
AI_OFFLINE_MODEL_PATH=/models/llama-3b
AI_OFFLINE_ENABLED=false
```

### 8.2 File Structure

```
src/lib/ai/memory/
├── index.ts                    # Main exports
├── types/
│   └── context.types.ts        # Type definitions
├── stores/
│   ├── short-term.store.ts     # Redis store
│   ├── medium-term.store.ts    # DB + cache
│   └── long-term.store.ts      # DB only
├── context-manager.ts          # Conversation context
├── context-builder.ts          # Build AI context
├── context-injector.ts         # Inject into prompts
├── session-manager.ts          # Session lifecycle
├── privacy/
│   ├── pii-handler.ts          # PII sanitization
│   └── retention-policy.ts     # Data retention
└── offline/
    └── offline-handler.ts      # Offline support
```

### 8.3 Integration Example

```typescript
// Example: AI chat with memory

import { ConversationContextManager } from './memory/context-manager';
import { ContextInjector } from './memory/context-injector';
import { AiSessionManager } from './memory/session-manager';
import { AiOrchestrator } from './orchestrator';

export class AiChatService {
  constructor(
    private readonly sessionManager: AiSessionManager,
    private readonly contextManager: ConversationContextManager,
    private readonly contextInjector: ContextInjector,
    private readonly orchestrator: AiOrchestrator,
  ) {}
  
  async processMessage(
    sessionId: string,
    userId: string,
    message: string
  ): Promise<ChatResponse> {
    // Ensure session is active
    if (!await this.sessionManager.isSessionActive(sessionId)) {
      await this.sessionManager.startSession(sessionId, userId);
    }
    
    // Touch session (extend TTL)
    await this.sessionManager.touchSession(sessionId);
    
    // Add user message to context
    await this.contextManager.addMessage(sessionId, {
      role: 'user',
      content: message,
    });
    
    // Build AI request
    let request: AiRequest = {
      type: 'chat',
      system: CHAT_SYSTEM_PROMPT,
      prompt: message,
      userId,
    };
    
    // Inject context
    request = await this.contextInjector.injectContext(request, sessionId, userId);
    
    // Process with AI
    const response = await this.orchestrator.process<ChatOutput>(request);
    
    // Add assistant response to context
    await this.contextManager.addMessage(sessionId, {
      role: 'assistant',
      content: response.data.content,
    });
    
    return {
      content: response.data.content,
      suggestions: response.data.suggestions,
      sessionId,
    };
  }
  
  async endConversation(sessionId: string): Promise<void> {
    await this.sessionManager.endSession(sessionId);
  }
}
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | AI Team | Initial release |
| 1.1.0 | 2026-05-21 | Architecture | MVP/Phase 2 memory scope split |

---

## Related Documents

| Document | Location |
|----------|----------|
| AI Orchestrator | `docs/ai/AI_ORCHESTRATOR.md` |
| Prompt System | `docs/ai/PROMPT_SYSTEM.md` |
| Emergency Engine | `docs/ai/EMERGENCY_ENGINE.md` |
| Cost Optimization | `docs/ai/COST_OPTIMIZATION.md` |

---

*End of MEMORY_SYSTEM.md*
