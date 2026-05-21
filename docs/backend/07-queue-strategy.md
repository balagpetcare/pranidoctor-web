# PHASE 1 BACKEND FOUNDATION — Queue Strategy

**Version:** 1.0.0  
**Status:** PLAN ONLY — NO IMPLEMENTATION  
**Date:** 2026-05-21  
**Scope:** Background job processing, queue architecture, worker design

---

## Table of Contents

1. [Queue Architecture](#1-queue-architecture)
2. [BullMQ Configuration](#2-bullmq-configuration)
3. [Queue Definitions](#3-queue-definitions)
4. [Job Patterns](#4-job-patterns)
5. [Worker Design](#5-worker-design)
6. [Error Handling](#6-error-handling)
7. [Monitoring](#7-monitoring)
8. [Scaling Strategy](#8-scaling-strategy)

---

## 1. Queue Architecture

### 1.1 Queue System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            QUEUE ARCHITECTURE                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                          PRODUCERS (API Server)                          │  │
│   │                                                                          │  │
│   │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │  │
│   │  │   Auth   │  │ Clinics  │  │    AI    │  │  Notif   │               │  │
│   │  │  Module  │  │  Module  │  │  Module  │  │  Module  │               │  │
│   │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘               │  │
│   │       │             │             │             │                       │  │
│   └───────┼─────────────┼─────────────┼─────────────┼───────────────────────┘  │
│           │             │             │             │                          │
│           └─────────────┴─────────────┴─────────────┘                          │
│                                 │                                               │
│                                 ▼                                               │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                             REDIS (BullMQ)                               │  │
│   │                                                                          │  │
│   │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │  │
│   │  │  notification  │  │      ai        │  │    cleanup     │            │  │
│   │  │    queue       │  │    queue       │  │    queue       │            │  │
│   │  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘            │  │
│   │          │                   │                   │                      │  │
│   │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │  │
│   │  │     email      │  │    report      │  │    backup      │            │  │
│   │  │    queue       │  │    queue       │  │    queue       │            │  │
│   │  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘            │  │
│   │          │                   │                   │                      │  │
│   └──────────┼───────────────────┼───────────────────┼──────────────────────┘  │
│              │                   │                   │                          │
│              └───────────────────┼───────────────────┘                          │
│                                  │                                               │
│                                  ▼                                               │
│   ┌──────────────────────────────────────────────────────────────────────────┐  │
│   │                         CONSUMERS (Workers)                               │  │
│   │                                                                          │  │
│   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │  │
│   │  │  Notification    │  │      AI          │  │    System        │      │  │
│   │  │    Worker        │  │    Worker        │  │    Worker        │      │  │
│   │  │                  │  │                  │  │                  │      │  │
│   │  │ • SMS            │  │ • AI completion  │  │ • Cleanup        │      │  │
│   │  │ • Push           │  │ • Embedding      │  │ • Backup         │      │  │
│   │  │ • Email          │  │ • Summarization  │  │ • Reports        │      │  │
│   │  └──────────────────┘  └──────────────────┘  └──────────────────┘      │  │
│   │                                                                          │  │
│   └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Queue vs Event Decision Matrix

| Scenario | Use Event | Use Queue | Reason |
|----------|-----------|-----------|--------|
| Fire-and-forget notification | ✓ | | Simple, in-process |
| External API call (SMS) | | ✓ | Retry, rate limit |
| AI completion request | | ✓ | Long-running, expensive |
| Audit logging | ✓ | | Async but quick |
| Report generation | | ✓ | CPU-intensive |
| Email with template | | ✓ | External service |
| In-app notification | ✓ | | Quick DB write |
| Data export | | ✓ | Time-consuming |
| Webhook delivery | | ✓ | Retry semantics |

---

## 2. BullMQ Configuration

### 2.1 Queue Service Setup

```typescript
// src/shared/queue/queue.service.ts

import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { config } from '@shared/config';
import { logger } from '@shared/logger';

export interface QueueOptions {
  defaultJobOptions?: {
    attempts?: number;
    backoff?: { type: 'exponential' | 'fixed'; delay: number };
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
  };
}

const defaultConnection = {
  host: new URL(config.redis.url).hostname,
  port: parseInt(new URL(config.redis.url).port) || 6379,
  maxRetriesPerRequest: null,
};

export class QueueService {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  
  createQueue(name: string, options: QueueOptions = {}): Queue {
    const queue = new Queue(name, {
      connection: defaultConnection,
      prefix: `${config.redis.prefix}queue`,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: 100,
        removeOnFail: 500,
        ...options.defaultJobOptions,
      },
    });
    
    this.queues.set(name, queue);
    
    // Set up event listeners
    const events = new QueueEvents(name, { connection: defaultConnection });
    events.on('completed', ({ jobId }) => {
      logger.debug({ msg: 'Job completed', queue: name, jobId });
    });
    events.on('failed', ({ jobId, failedReason }) => {
      logger.error({ msg: 'Job failed', queue: name, jobId, reason: failedReason });
    });
    
    return queue;
  }
  
  createWorker<T>(
    queueName: string,
    processor: (job: Job<T>) => Promise<unknown>,
    concurrency = 1
  ): Worker<T> {
    const worker = new Worker<T>(
      queueName,
      processor,
      {
        connection: defaultConnection,
        prefix: `${config.redis.prefix}queue`,
        concurrency,
      }
    );
    
    worker.on('error', (error) => {
      logger.error({ msg: 'Worker error', queue: queueName, error: error.message });
    });
    
    this.workers.set(queueName, worker);
    return worker;
  }
  
  async close(): Promise<void> {
    await Promise.all([
      ...Array.from(this.queues.values()).map((q) => q.close()),
      ...Array.from(this.workers.values()).map((w) => w.close()),
    ]);
  }
}

export const queueService = new QueueService();
```

### 2.2 Queue Configuration

```typescript
// src/shared/queue/queue.config.ts

export const queueConfig = {
  notification: {
    name: 'notification',
    concurrency: 5,
    rateLimit: { max: 100, duration: 60000 }, // 100 per minute
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential' as const, delay: 5000 },
    },
  },
  
  email: {
    name: 'email',
    concurrency: 3,
    rateLimit: { max: 50, duration: 60000 },
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential' as const, delay: 10000 },
    },
  },
  
  ai: {
    name: 'ai',
    concurrency: 2, // Limited by API rate limits
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'fixed' as const, delay: 30000 },
      timeout: 120000, // 2 minutes
    },
  },
  
  report: {
    name: 'report',
    concurrency: 1, // Sequential to avoid memory spikes
    defaultJobOptions: {
      attempts: 2,
      timeout: 300000, // 5 minutes
    },
  },
  
  cleanup: {
    name: 'cleanup',
    concurrency: 1,
    defaultJobOptions: {
      attempts: 1, // No retry for cleanup
      removeOnComplete: true,
    },
  },
};
```

---

## 3. Queue Definitions

### 3.1 Queue Registry

```typescript
// src/shared/queue/queue.names.ts

export const QueueNames = {
  // Notification queues
  NOTIFICATION: 'notification',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  
  // AI queues
  AI_COMPLETION: 'ai:completion',
  AI_EMBEDDING: 'ai:embedding',
  AI_SUMMARY: 'ai:summary',
  
  // System queues
  REPORT: 'report',
  EXPORT: 'export',
  CLEANUP: 'cleanup',
  BACKUP: 'backup',
  
  // Scheduled jobs
  SCHEDULED: 'scheduled',
} as const;

export type QueueName = typeof QueueNames[keyof typeof QueueNames];
```

### 3.2 Job Type Definitions

```typescript
// src/shared/queue/job.types.ts

// Notification jobs
export interface SendSmsJob {
  phone: string;
  message: string;
  templateId?: string;
}

export interface SendPushJob {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface SendEmailJob {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, unknown>;
}

// AI jobs
export interface AiCompletionJob {
  sessionId: string;
  prompt: string;
  model?: string;
  maxTokens?: number;
}

export interface AiSummaryJob {
  conversationId: string;
  messages: Array<{ role: string; content: string }>;
}

// Report jobs
export interface GenerateReportJob {
  reportType: 'daily_summary' | 'monthly_billing' | 'service_analytics';
  dateRange: { start: string; end: string };
  format: 'pdf' | 'csv' | 'xlsx';
  recipientEmail?: string;
}

// Cleanup jobs
export interface CleanupJob {
  type: 'expired_otps' | 'old_sessions' | 'orphan_files';
  olderThanDays: number;
}
```

---

## 4. Job Patterns

### 4.1 Basic Job Pattern

```typescript
// Adding a job
const notificationQueue = queueService.createQueue(QueueNames.NOTIFICATION);

await notificationQueue.add(
  'send-sms',
  {
    phone: '+8801712345678',
    message: 'Your OTP is 123456',
  },
  {
    priority: 1, // Higher = lower priority
    delay: 0,
  }
);
```

### 4.2 Scheduled Job Pattern

```typescript
// Repeatable job (cron-like)
await cleanupQueue.add(
  'cleanup-expired-otps',
  { type: 'expired_otps', olderThanDays: 1 },
  {
    repeat: {
      pattern: '0 */6 * * *', // Every 6 hours
    },
    jobId: 'cleanup-otps', // Prevent duplicates
  }
);

// Delayed job
await reportQueue.add(
  'generate-daily-report',
  { reportType: 'daily_summary', ... },
  {
    delay: calculateDelayUntil6AM(),
  }
);
```

### 4.3 Priority Job Pattern

```typescript
// High priority (emergency SMS)
await notificationQueue.add(
  'send-sms',
  { phone, message: 'Emergency alert!' },
  { priority: 1 } // Processed first
);

// Normal priority
await notificationQueue.add(
  'send-sms',
  { phone, message: 'Appointment reminder' },
  { priority: 5 }
);

// Low priority (marketing)
await notificationQueue.add(
  'send-sms',
  { phone, message: 'Special offer!' },
  { priority: 10 }
);
```

### 4.4 Flow Pattern (Job Dependencies)

```typescript
// Job A → Job B → Job C
import { FlowProducer } from 'bullmq';

const flowProducer = new FlowProducer({ connection: defaultConnection });

await flowProducer.add({
  name: 'send-report-email',
  queueName: QueueNames.EMAIL,
  data: { to: 'admin@example.com', reportUrl: '{{deps.generateReport.url}}' },
  children: [
    {
      name: 'generateReport',
      queueName: QueueNames.REPORT,
      data: { reportType: 'monthly_billing', ... },
    },
  ],
});
```

---

## 5. Worker Design

### 5.1 Worker Entry Point

```typescript
// src/worker.ts

import { logger } from '@shared/logger';
import { queueService } from '@shared/queue';
import { notificationWorker } from '@workers/notification.worker';
import { aiWorker } from '@workers/ai.worker';
import { cleanupWorker } from '@workers/cleanup.worker';

async function startWorkers() {
  logger.info({ msg: 'Starting workers...' });
  
  // Initialize workers
  await notificationWorker.start();
  await aiWorker.start();
  await cleanupWorker.start();
  
  logger.info({ msg: 'All workers started' });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info({ msg: 'Received SIGTERM, shutting down workers...' });
  await queueService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info({ msg: 'Received SIGINT, shutting down workers...' });
  await queueService.close();
  process.exit(0);
});

startWorkers().catch((error) => {
  logger.error({ msg: 'Failed to start workers', error: error.message });
  process.exit(1);
});
```

### 5.2 Notification Worker

```typescript
// src/workers/notification.worker.ts

import { Job } from 'bullmq';
import { queueService, QueueNames, queueConfig } from '@shared/queue';
import { SendSmsJob, SendPushJob } from '@shared/queue/job.types';
import { smsService } from '@modules/notifications/services/sms.service';
import { pushService } from '@modules/notifications/services/push.service';
import { logger } from '@shared/logger';

const workerLogger = logger.child({ worker: 'notification' });

async function processJob(job: Job<SendSmsJob | SendPushJob>) {
  workerLogger.info({ msg: 'Processing job', jobId: job.id, name: job.name });
  
  switch (job.name) {
    case 'send-sms':
      return processSmsJob(job as Job<SendSmsJob>);
    case 'send-push':
      return processPushJob(job as Job<SendPushJob>);
    default:
      throw new Error(`Unknown job type: ${job.name}`);
  }
}

async function processSmsJob(job: Job<SendSmsJob>) {
  const { phone, message, templateId } = job.data;
  
  await smsService.send({
    phone,
    message,
    templateId,
  });
  
  workerLogger.info({ msg: 'SMS sent', phone: maskPhone(phone) });
}

async function processPushJob(job: Job<SendPushJob>) {
  const { userId, title, body, data } = job.data;
  
  await pushService.send({
    userId,
    notification: { title, body },
    data,
  });
  
  workerLogger.info({ msg: 'Push notification sent', userId });
}

export const notificationWorker = {
  start() {
    queueService.createWorker(
      QueueNames.NOTIFICATION,
      processJob,
      queueConfig.notification.concurrency
    );
  },
};
```

### 5.3 AI Worker

```typescript
// src/workers/ai.worker.ts

import { Job } from 'bullmq';
import { queueService, QueueNames, queueConfig } from '@shared/queue';
import { AiCompletionJob, AiSummaryJob } from '@shared/queue/job.types';
import { aiService } from '@modules/ai';
import { logger } from '@shared/logger';

const workerLogger = logger.child({ worker: 'ai' });

async function processJob(job: Job) {
  const startTime = Date.now();
  workerLogger.info({ msg: 'Processing AI job', jobId: job.id, name: job.name });
  
  try {
    let result;
    
    switch (job.name) {
      case 'completion':
        result = await processCompletionJob(job as Job<AiCompletionJob>);
        break;
      case 'summary':
        result = await processSummaryJob(job as Job<AiSummaryJob>);
        break;
      default:
        throw new Error(`Unknown AI job type: ${job.name}`);
    }
    
    const duration = Date.now() - startTime;
    workerLogger.info({ msg: 'AI job completed', jobId: job.id, duration });
    
    return result;
  } catch (error) {
    workerLogger.error({
      msg: 'AI job failed',
      jobId: job.id,
      error: (error as Error).message,
    });
    throw error;
  }
}

async function processCompletionJob(job: Job<AiCompletionJob>) {
  const { sessionId, prompt, model, maxTokens } = job.data;
  
  const completion = await aiService.complete({
    prompt,
    model,
    maxTokens,
  });
  
  // Store result in session context
  await aiService.updateSessionContext(sessionId, completion);
  
  return { completion };
}

async function processSummaryJob(job: Job<AiSummaryJob>) {
  const { conversationId, messages } = job.data;
  
  const summary = await aiService.summarize(messages);
  
  // Store summary
  await aiService.saveConversationSummary(conversationId, summary);
  
  return { summary };
}

export const aiWorker = {
  start() {
    queueService.createWorker(
      QueueNames.AI_COMPLETION,
      processJob,
      queueConfig.ai.concurrency
    );
  },
};
```

---

## 6. Error Handling

### 6.1 Retry Strategy

```typescript
// Queue-level retry configuration
const smsQueue = queueService.createQueue(QueueNames.SMS, {
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000, // Start at 5s, then 10s, 20s, 40s, 80s
    },
  },
});

// Job-level override
await smsQueue.add(
  'send-otp',
  { phone, message },
  {
    attempts: 3, // Fewer attempts for time-sensitive OTP
    backoff: { type: 'fixed', delay: 2000 },
  }
);
```

### 6.2 Dead Letter Queue

```typescript
// On final failure, move to DLQ
worker.on('failed', async (job, error) => {
  if (job && job.attemptsMade >= job.opts.attempts!) {
    // Move to dead letter queue
    await dlqQueue.add(
      'failed-job',
      {
        originalQueue: queueName,
        originalJob: job.name,
        data: job.data,
        error: error.message,
        attempts: job.attemptsMade,
        failedAt: new Date().toISOString(),
      },
      {
        removeOnComplete: false, // Keep for analysis
      }
    );
    
    logger.error({
      msg: 'Job moved to DLQ',
      queue: queueName,
      jobId: job.id,
      error: error.message,
    });
  }
});
```

### 6.3 Error Categories

| Error Type | Retry? | Action |
|------------|--------|--------|
| Network timeout | Yes | Exponential backoff |
| Rate limit (429) | Yes | Wait and retry |
| Invalid input (400) | No | Move to DLQ |
| Authentication (401) | No | Alert, DLQ |
| Server error (5xx) | Yes | Exponential backoff |
| Resource not found | No | DLQ |
| Validation error | No | DLQ |

---

## 7. Monitoring

### 7.1 Queue Metrics

```typescript
// src/shared/queue/metrics.ts

import { Queue } from 'bullmq';

export async function getQueueMetrics(queue: Queue) {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);
  
  return {
    name: queue.name,
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + delayed,
  };
}

// Expose via health endpoint
router.get('/health/queues', async (req, res) => {
  const metrics = await Promise.all(
    Array.from(queues.values()).map(getQueueMetrics)
  );
  
  res.json({
    status: 'ok',
    queues: metrics,
  });
});
```

### 7.2 Alerting Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Queue depth | > 100 | > 500 | Scale workers |
| Failed jobs/hour | > 10 | > 50 | Investigate |
| Processing time P95 | > 30s | > 60s | Optimize |
| DLQ size | > 10 | > 50 | Manual review |
| Worker restarts/hour | > 3 | > 10 | Debug |

### 7.3 Logging Format

```typescript
// Job start
logger.info({
  msg: 'Job started',
  queue: queueName,
  jobId: job.id,
  jobName: job.name,
  attempt: job.attemptsMade + 1,
});

// Job success
logger.info({
  msg: 'Job completed',
  queue: queueName,
  jobId: job.id,
  duration: Date.now() - startTime,
});

// Job failure
logger.error({
  msg: 'Job failed',
  queue: queueName,
  jobId: job.id,
  attempt: job.attemptsMade,
  maxAttempts: job.opts.attempts,
  error: error.message,
  willRetry: job.attemptsMade < (job.opts.attempts ?? 1),
});
```

---

## 8. Scaling Strategy

### 8.1 Horizontal Scaling

```
Phase 1: Single Worker Process
┌────────────────────────────────────────┐
│           Worker Process               │
│  ┌────────────┐  ┌────────────┐       │
│  │ Notif (5)  │  │  AI (2)    │       │
│  └────────────┘  └────────────┘       │
│  ┌────────────┐  ┌────────────┐       │
│  │ Report (1) │  │ Cleanup (1)│       │
│  └────────────┘  └────────────┘       │
└────────────────────────────────────────┘

Phase 2: Dedicated Workers
┌──────────────────┐  ┌──────────────────┐
│ Notification     │  │ AI Worker        │
│ Worker           │  │                  │
│ (3 instances)    │  │ (2 instances)    │
└──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│ Report Worker    │  │ System Worker    │
│ (1 instance)     │  │ (1 instance)     │
└──────────────────┘  └──────────────────┘
```

### 8.2 Auto-Scaling Triggers

| Queue | Scale Up When | Scale Down When |
|-------|---------------|-----------------|
| notification | depth > 200 for 2min | depth < 20 for 10min |
| ai | depth > 50 for 5min | depth < 5 for 15min |
| report | depth > 10 | depth = 0 |

### 8.3 Worker Docker Compose

```yaml
# docker-compose.workers.yml

services:
  worker-notification:
    image: pranidoctor-worker
    command: node dist/worker.js notification
    deploy:
      replicas: 2
    environment:
      - WORKER_TYPE=notification
      - CONCURRENCY=5

  worker-ai:
    image: pranidoctor-worker
    command: node dist/worker.js ai
    deploy:
      replicas: 1
    environment:
      - WORKER_TYPE=ai
      - CONCURRENCY=2

  worker-system:
    image: pranidoctor-worker
    command: node dist/worker.js system
    deploy:
      replicas: 1
    environment:
      - WORKER_TYPE=system
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Architecture | Initial Phase 1 plan |

---

## Related Documents

| Document | Path |
|----------|------|
| System Architecture | `docs/backend/01-system-architecture.md` |
| Docker Design | `docs/backend/05-docker-design.md` |
| Module Contract | `docs/backend/06-module-contract.md` |

---

*End of 07-queue-strategy.md*
