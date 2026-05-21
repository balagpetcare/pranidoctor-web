# MONITORING — Prani Doctor

**Version:** 1.0.0  
**Last Updated:** 2026-05-21  
**Scope:** Monitoring stack, metrics, logging, alerting, observability

---

## Table of Contents

1. [Monitoring Philosophy](#1-monitoring-philosophy)
2. [Monitoring Architecture](#2-monitoring-architecture)
3. [Metrics Collection](#3-metrics-collection)
4. [Log Aggregation](#4-log-aggregation)
5. [Health Checks](#5-health-checks)
6. [Alert System](#6-alert-system)
7. [Dashboards](#7-dashboards)
8. [Application Performance](#8-application-performance)
9. [Infrastructure Monitoring](#9-infrastructure-monitoring)
10. [Incident Response](#10-incident-response)

---

## 1. Monitoring Philosophy

### 1.1 Core Principles

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         MONITORING PRINCIPLES                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. OBSERVE EVERYTHING                                                          │
│     • Metrics for performance                                                   │
│     • Logs for debugging                                                        │
│     • Traces for request flow                                                   │
│                                                                                  │
│  2. ALERT ON SYMPTOMS, NOT CAUSES                                               │
│     • User-facing impact first                                                  │
│     • Avoid alert fatigue                                                       │
│     • Actionable alerts only                                                    │
│                                                                                  │
│  3. USE THE RIGHT TOOL                                                          │
│     • Prometheus for metrics                                                    │
│     • Structured JSON logs                                                      │
│     • External uptime monitoring                                                │
│                                                                                  │
│  4. COST-EFFICIENT                                                              │
│     • Lightweight tools for startup                                             │
│     • Scale monitoring with growth                                              │
│     • Cloud-native when possible                                                │
│                                                                                  │
│  5. DEFENSE IN DEPTH                                                            │
│     • Multiple monitoring layers                                                │
│     • External + internal monitoring                                            │
│     • Backup alerting channels                                                  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Monitoring Maturity Path

```
PHASE 1 (MVP)                     PHASE 2 (Growth)                  PHASE 3 (Scale)
──────────────                    ────────────────                  ───────────────

┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
│ Basic Monitoring│              │ Full Observability│             │ Enterprise      │
│                 │              │                 │              │                 │
│ • Health checks │      ──▶     │ • Prometheus    │      ──▶     │ • Distributed   │
│ • Docker logs   │              │ • Grafana       │              │   tracing       │
│ • Uptime Robot  │              │ • Loki          │              │ • APM           │
│ • Slack alerts  │              │ • AlertManager  │              │ • Log analytics │
│                 │              │ • Custom metrics│              │ • ML anomaly    │
└─────────────────┘              └─────────────────┘              └─────────────────┘

Cost: ~$0/mo                     Cost: ~$20-50/mo                 Cost: ~$100+/mo
```

---

## 2. Monitoring Architecture

### 2.1 Phase 1 Architecture (Startup)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         MONITORING ARCHITECTURE (PHASE 1)                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  EXTERNAL MONITORING                                                            │
│  ───────────────────                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  UptimeRobot / Better Uptime (Free tier)                                │   │
│  │  • HTTP(S) endpoint monitoring                                          │   │
│  │  • SSL certificate expiry                                               │   │
│  │  • Response time tracking                                               │   │
│  │  • Email/Slack notifications                                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  APPLICATION MONITORING                                                         │
│  ──────────────────────                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                           VPS                                            │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐         │   │
│  │  │ pranidoctor-web │  │    postgres     │  │     redis       │         │   │
│  │  │                 │  │                 │  │                 │         │   │
│  │  │ /api/health     │  │  pg_isready     │  │  redis-cli ping │         │   │
│  │  │ JSON logs       │  │  slow query log │  │  INFO logs      │         │   │
│  │  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘         │   │
│  │           │                    │                    │                   │   │
│  │           └────────────────────┼────────────────────┘                   │   │
│  │                                ▼                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Docker Logs (JSON)                            │   │   │
│  │  │              /opt/pranidoctor/logs/                             │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ALERTING                                                                       │
│  ────────                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │   │
│  │  │    Slack     │  │    Email     │  │    SMS       │                  │   │
│  │  │  (Primary)   │  │  (Backup)    │  │  (Critical)  │                  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Phase 2 Architecture (Growth)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         MONITORING ARCHITECTURE (PHASE 2)                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                           ┌─────────────────┐                                   │
│                           │    Grafana      │                                   │
│                           │   Dashboards    │                                   │
│                           └────────┬────────┘                                   │
│                                    │                                             │
│         ┌──────────────────────────┼──────────────────────────┐                │
│         │                          │                          │                │
│         ▼                          ▼                          ▼                │
│  ┌─────────────┐           ┌─────────────┐           ┌─────────────┐          │
│  │ Prometheus  │           │    Loki     │           │AlertManager │          │
│  │  (Metrics)  │           │   (Logs)    │           │  (Alerts)   │          │
│  └──────┬──────┘           └──────┬──────┘           └──────┬──────┘          │
│         │                         │                         │                  │
│         │                         │                         │                  │
│  ┌──────┴──────┐           ┌──────┴──────┐                 │                  │
│  │             │           │             │                 │                  │
│  ▼             ▼           ▼             ▼                 ▼                  │
│ ┌───┐        ┌───┐       ┌───┐        ┌───┐          ┌─────────┐            │
│ │App│        │ DB│       │App│        │Sys│          │ Slack   │            │
│ │/m │        │/m │       │log│        │log│          │PagerDuty│            │
│ └───┘        └───┘       └───┘        └───┘          │ Email   │            │
│                                                       └─────────┘            │
│  ────────────────────────────────────────────────────────────────────────────  │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         APPLICATION STACK                                │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │   App    │  │ Postgres │  │  Redis   │  │  MinIO   │  │  Caddy   │ │   │
│  │  │ :3000    │  │  :5432   │  │  :6379   │  │  :9000   │  │  :443    │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Docker Compose (Monitoring Stack)

```yaml
# docker-compose.monitoring.yml

version: '3.9'

services:
  # ============================================
  # Prometheus - Metrics Collection
  # ============================================
  prometheus:
    image: prom/prometheus:v2.50.0
    container_name: prometheus
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=15d'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--web.enable-lifecycle'
    volumes:
      - ./config/prometheus:/etc/prometheus:ro
      - prometheus_data:/prometheus
    networks:
      - monitoring
      - backend
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  # ============================================
  # Grafana - Visualization
  # ============================================
  grafana:
    image: grafana/grafana:10.3.0
    container_name: grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_ROOT_URL=https://monitor.pranidoctor.com
    volumes:
      - grafana_data:/var/lib/grafana
      - ./config/grafana/provisioning:/etc/grafana/provisioning:ro
    networks:
      - monitoring
      - frontend
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

  # ============================================
  # Loki - Log Aggregation
  # ============================================
  loki:
    image: grafana/loki:2.9.0
    container_name: loki
    restart: unless-stopped
    command: -config.file=/etc/loki/loki-config.yml
    volumes:
      - ./config/loki:/etc/loki:ro
      - loki_data:/loki
    networks:
      - monitoring
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  # ============================================
  # Promtail - Log Collector
  # ============================================
  promtail:
    image: grafana/promtail:2.9.0
    container_name: promtail
    restart: unless-stopped
    command: -config.file=/etc/promtail/promtail-config.yml
    volumes:
      - ./config/promtail:/etc/promtail:ro
      - /var/log:/var/log:ro
      - /opt/pranidoctor/logs:/app/logs:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    networks:
      - monitoring
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 128M

  # ============================================
  # Alertmanager - Alert Routing
  # ============================================
  alertmanager:
    image: prom/alertmanager:v0.27.0
    container_name: alertmanager
    restart: unless-stopped
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    volumes:
      - ./config/alertmanager:/etc/alertmanager:ro
      - alertmanager_data:/alertmanager
    networks:
      - monitoring
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 128M

  # ============================================
  # Node Exporter - System Metrics
  # ============================================
  node-exporter:
    image: prom/node-exporter:v1.7.0
    container_name: node-exporter
    restart: unless-stopped
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/rootfs'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    networks:
      - monitoring
    deploy:
      resources:
        limits:
          cpus: '0.1'
          memory: 64M

  # ============================================
  # cAdvisor - Container Metrics
  # ============================================
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.0
    container_name: cadvisor
    restart: unless-stopped
    privileged: true
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    networks:
      - monitoring
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 256M

volumes:
  prometheus_data:
  grafana_data:
  loki_data:
  alertmanager_data:

networks:
  monitoring:
    driver: bridge
  frontend:
    external: true
  backend:
    external: true
```

---

## 3. Metrics Collection

### 3.1 Prometheus Configuration

```yaml
# config/prometheus/prometheus.yml

global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    environment: production
    service: pranidoctor

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

# Load rules
rule_files:
  - /etc/prometheus/rules/*.yml

# Scrape configurations
scrape_configs:
  # Prometheus self-monitoring
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter (system metrics)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  # cAdvisor (container metrics)
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  # PostgreSQL Exporter
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Redis Exporter
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Application metrics
  - job_name: 'pranidoctor-web'
    metrics_path: '/api/metrics'
    static_configs:
      - targets: ['pranidoctor-web:3000', 'pranidoctor-web-2:3000']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        regex: '([^:]+):\d+'
        replacement: '${1}'

  # Caddy metrics
  - job_name: 'caddy'
    static_configs:
      - targets: ['caddy:2019']
```

### 3.2 Application Metrics Endpoint

```typescript
// src/app/api/metrics/route.ts

import { NextResponse } from 'next/server';
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Create a custom registry
const register = new Registry();

// Collect default metrics (Node.js runtime)
collectDefaultMetrics({ register });

// Custom metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register],
});

// Business metrics
const serviceRequestsTotal = new Counter({
  name: 'service_requests_total',
  help: 'Total service requests created',
  labelNames: ['type', 'urgency'],
  registers: [register],
});

const activeServiceRequests = new Gauge({
  name: 'active_service_requests',
  help: 'Number of active service requests',
  labelNames: ['status'],
  registers: [register],
});

const aiRequestsTotal = new Counter({
  name: 'ai_requests_total',
  help: 'Total AI API requests',
  labelNames: ['provider', 'model', 'status'],
  registers: [register],
});

const aiTokensUsed = new Counter({
  name: 'ai_tokens_used_total',
  help: 'Total AI tokens used',
  labelNames: ['provider', 'type'],
  registers: [register],
});

// Export metrics endpoint
export async function GET() {
  const metrics = await register.metrics();
  return new NextResponse(metrics, {
    headers: {
      'Content-Type': register.contentType,
    },
  });
}

// Export metric helpers for use in application
export {
  httpRequestsTotal,
  httpRequestDuration,
  activeConnections,
  dbQueryDuration,
  serviceRequestsTotal,
  activeServiceRequests,
  aiRequestsTotal,
  aiTokensUsed,
};
```

### 3.3 Key Metrics

| Category | Metric | Description | Alert Threshold |
|----------|--------|-------------|-----------------|
| **HTTP** | `http_requests_total` | Request count | Error rate > 1% |
| **HTTP** | `http_request_duration_seconds` | Response time | p95 > 2s |
| **Database** | `db_query_duration_seconds` | Query time | p95 > 1s |
| **Database** | `pg_connections` | Connection count | > 80% max |
| **Cache** | `redis_memory_used_bytes` | Redis memory | > 80% max |
| **System** | `node_cpu_seconds_total` | CPU usage | > 80% |
| **System** | `node_memory_MemAvailable_bytes` | Memory | < 20% |
| **Container** | `container_cpu_usage_seconds_total` | Container CPU | > 80% |
| **Business** | `service_requests_total` | Service requests | Unusual spike |
| **AI** | `ai_requests_total` | AI calls | Error rate > 5% |
| **AI** | `ai_tokens_used_total` | Token usage | Budget alert |

---

## 4. Log Aggregation

### 4.1 Loki Configuration

```yaml
# config/loki/loki-config.yml

auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

common:
  instance_addr: 127.0.0.1
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

query_range:
  results_cache:
    cache:
      embedded_cache:
        enabled: true
        max_size_mb: 100

schema_config:
  configs:
    - from: 2024-01-01
      store: tsdb
      object_store: filesystem
      schema: v12
      index:
        prefix: index_
        period: 24h

ruler:
  alertmanager_url: http://alertmanager:9093

limits_config:
  retention_period: 720h  # 30 days
  ingestion_rate_mb: 10
  ingestion_burst_size_mb: 20
```

### 4.2 Promtail Configuration

```yaml
# config/promtail/promtail-config.yml

server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  # Docker container logs
  - job_name: containers
    static_configs:
      - targets:
          - localhost
        labels:
          job: containerlogs
          __path__: /var/lib/docker/containers/*/*log

    pipeline_stages:
      - json:
          expressions:
            output: log
            stream: stream
            attrs:
      - json:
          expressions:
            tag:
          source: attrs
      - regex:
          expression: '^(?P<container_name>[^/]+)/'
          source: tag
      - timestamp:
          source: time
          format: RFC3339Nano
      - labels:
          stream:
          container_name:
      - output:
          source: output

  # Application logs
  - job_name: pranidoctor
    static_configs:
      - targets:
          - localhost
        labels:
          job: pranidoctor
          __path__: /app/logs/*.log

    pipeline_stages:
      - json:
          expressions:
            level: level
            message: message
            service: service
            requestId: requestId
            userId: userId
            event: event
      - labels:
          level:
          service:
          event:
      - timestamp:
          source: timestamp
          format: RFC3339

  # System logs
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: system
          __path__: /var/log/syslog
```

### 4.3 Structured Logging Implementation

```typescript
// src/lib/logger.ts

import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
  base: {
    service: 'pranidoctor-web',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
  },
  redact: {
    paths: ['password', 'token', 'authorization', 'cookie', 'otp', 'phone'],
    censor: '[REDACTED]',
  },
});

// Child logger for request context
export const createRequestLogger = (requestId: string, userId?: string) => {
  return logger.child({
    requestId,
    userId: userId || 'anonymous',
  });
};

// Event logging helpers
export const logEvent = (event: string, data?: object) => {
  logger.info({ event, ...data });
};

export const logError = (error: Error, context?: object) => {
  logger.error({
    event: 'error',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  });
};

export const logMetric = (metric: string, value: number, labels?: object) => {
  logger.info({
    event: 'metric',
    metric,
    value,
    ...labels,
  });
};

export default logger;
```

### 4.4 Log Queries (LogQL)

```logql
# Error logs in last hour
{job="pranidoctor"} |= "ERROR" | json | line_format "{{.message}}"

# Slow requests (> 2s)
{job="pranidoctor"} | json | duration > 2s

# User activity
{job="pranidoctor"} | json | event="user_login" | line_format "{{.userId}}"

# Service request events
{job="pranidoctor"} | json | event=~"service_request.*"

# Errors by service
sum by (service) (count_over_time({job="pranidoctor"} |= "ERROR" [1h]))

# Request rate
sum(rate({job="pranidoctor"} | json | event="http_request" [5m])) by (method, path)
```

---

## 5. Health Checks

### 5.1 Health Check Endpoints

```typescript
// src/app/api/health/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    redis: HealthCheck;
    memory: HealthCheck;
  };
}

interface HealthCheck {
  status: 'pass' | 'fail';
  latency?: number;
  message?: string;
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthStatus['checks'] = {
    database: { status: 'fail' },
    redis: { status: 'fail' },
    memory: { status: 'fail' },
  };

  // Database check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'pass',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Redis check
  try {
    const redisStart = Date.now();
    await redis.ping();
    checks.redis = {
      status: 'pass',
      latency: Date.now() - redisStart,
    };
  } catch (error) {
    checks.redis = {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Memory check
  const memUsage = process.memoryUsage();
  const memUsedMB = memUsage.heapUsed / 1024 / 1024;
  const memLimitMB = 1536; // Container limit
  
  checks.memory = {
    status: memUsedMB < memLimitMB * 0.9 ? 'pass' : 'fail',
    message: `${Math.round(memUsedMB)}MB / ${memLimitMB}MB`,
  };

  // Determine overall status
  const failedChecks = Object.values(checks).filter(c => c.status === 'fail');
  let status: HealthStatus['status'] = 'healthy';
  
  if (failedChecks.length > 0) {
    status = checks.database.status === 'fail' ? 'unhealthy' : 'degraded';
  }

  const response: HealthStatus = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || 'unknown',
    uptime: process.uptime(),
    checks,
  };

  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;

  return NextResponse.json(response, { status: statusCode });
}
```

### 5.2 Readiness vs Liveness

```yaml
# Kubernetes-style health checks for Docker

# Liveness: Is the process alive?
# Restart if fails
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health/live"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s

# Readiness: Can it serve traffic?
# Remove from load balancer if fails
readiness:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health/ready"]
  interval: 10s
  timeout: 5s
```

```typescript
// src/app/api/health/live/route.ts
// Liveness - basic process check
export async function GET() {
  return new Response('OK', { status: 200 });
}

// src/app/api/health/ready/route.ts
// Readiness - full dependency check
export async function GET() {
  // Check database connection
  // Check Redis connection
  // Return 200 if ready, 503 if not
}
```

---

## 6. Alert System

### 6.1 Alertmanager Configuration

```yaml
# config/alertmanager/alertmanager.yml

global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@pranidoctor.com'
  smtp_auth_username: '${SMTP_USERNAME}'
  smtp_auth_password: '${SMTP_PASSWORD}'

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'slack-notifications'
  
  routes:
    # Critical alerts - immediate notification
    - match:
        severity: critical
      receiver: 'critical-alerts'
      group_wait: 0s
      repeat_interval: 1h
    
    # Warning alerts - batched
    - match:
        severity: warning
      receiver: 'slack-notifications'
      group_wait: 5m
      repeat_interval: 4h
    
    # Database alerts
    - match:
        alertname: PostgresDown
      receiver: 'critical-alerts'
    
    # AI budget alerts
    - match:
        alertname: AIBudgetExceeded
      receiver: 'budget-alerts'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#pranidoctor-alerts'
        send_resolved: true
        title: '{{ .GroupLabels.alertname }}'
        text: >-
          {{ range .Alerts }}
          *Alert:* {{ .Annotations.summary }}
          *Description:* {{ .Annotations.description }}
          *Severity:* {{ .Labels.severity }}
          {{ end }}

  - name: 'critical-alerts'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#pranidoctor-critical'
        send_resolved: true
    email_configs:
      - to: 'team@pranidoctor.com'
        send_resolved: true

  - name: 'budget-alerts'
    slack_configs:
      - api_url: '${SLACK_WEBHOOK_URL}'
        channel: '#pranidoctor-budget'
    email_configs:
      - to: 'finance@pranidoctor.com'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname']
```

### 6.2 Alert Rules

```yaml
# config/prometheus/rules/alerts.yml

groups:
  - name: pranidoctor-alerts
    rules:
      # ============================================
      # Service Availability
      # ============================================
      - alert: ServiceDown
        expr: up{job="pranidoctor-web"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Prani Doctor service is down"
          description: "{{ $labels.instance }} has been down for more than 1 minute."

      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) /
          sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} over the last 5 minutes."

      - alert: SlowResponses
        expr: |
          histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow API responses"
          description: "95th percentile response time is {{ $value | humanizeDuration }}."

      # ============================================
      # Database
      # ============================================
      - alert: PostgresDown
        expr: pg_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
          description: "PostgreSQL instance is not responding."

      - alert: DatabaseConnectionsHigh
        expr: |
          pg_stat_activity_count / pg_settings_max_connections > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database connections running high"
          description: "{{ $value | humanizePercentage }} of max connections used."

      - alert: SlowQueries
        expr: |
          rate(pg_stat_statements_seconds_total[5m]) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow database queries detected"
          description: "Query execution time is elevated."

      # ============================================
      # Infrastructure
      # ============================================
      - alert: HighCPUUsage
        expr: |
          100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value }}%."

      - alert: HighMemoryUsage
        expr: |
          (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}%."

      - alert: DiskSpaceLow
        expr: |
          (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 20
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low disk space"
          description: "Only {{ $value }}% disk space remaining."

      - alert: DiskSpaceCritical
        expr: |
          (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 10
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Critical disk space"
          description: "Only {{ $value }}% disk space remaining!"

      # ============================================
      # Redis
      # ============================================
      - alert: RedisDown
        expr: redis_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis is down"
          description: "Redis instance is not responding."

      - alert: RedisMemoryHigh
        expr: |
          redis_memory_used_bytes / redis_memory_max_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis memory usage high"
          description: "Redis using {{ $value | humanizePercentage }} of max memory."

      # ============================================
      # Business Metrics
      # ============================================
      - alert: NoServiceRequests
        expr: |
          increase(service_requests_total[1h]) == 0
        for: 2h
        labels:
          severity: warning
        annotations:
          summary: "No service requests in 2 hours"
          description: "No new service requests have been created."

      - alert: EmergencyRequestSpike
        expr: |
          increase(service_requests_total{urgency="CRITICAL"}[30m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Spike in emergency requests"
          description: "{{ $value }} emergency requests in last 30 minutes."

      # ============================================
      # AI
      # ============================================
      - alert: AIProviderErrors
        expr: |
          rate(ai_requests_total{status="error"}[5m]) /
          rate(ai_requests_total[5m]) > 0.1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High AI provider error rate"
          description: "{{ $value | humanizePercentage }} of AI requests failing."

      - alert: AIBudgetExceeded
        expr: |
          increase(ai_tokens_used_total[24h]) > 100000
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Daily AI token budget exceeded"
          description: "{{ $value }} tokens used in last 24 hours."

      # ============================================
      # SSL/Certificates
      # ============================================
      - alert: SSLCertExpiringSoon
        expr: |
          probe_ssl_earliest_cert_expiry - time() < 86400 * 30
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "SSL certificate expiring soon"
          description: "Certificate expires in {{ $value | humanizeDuration }}."

      - alert: SSLCertExpiryCritical
        expr: |
          probe_ssl_earliest_cert_expiry - time() < 86400 * 7
        for: 1h
        labels:
          severity: critical
        annotations:
          summary: "SSL certificate expiring in 7 days"
          description: "Certificate expires in {{ $value | humanizeDuration }}!"
```

### 6.3 Alert Severity Matrix

| Severity | Response Time | Examples | Notification |
|----------|---------------|----------|--------------|
| **Critical** | Immediate | Service down, DB down, Disk full | Slack + Email + SMS |
| **Warning** | < 1 hour | High latency, Memory high, Errors elevated | Slack + Email |
| **Info** | Business hours | Certificate expiring, Unusual traffic | Slack |

---

## 7. Dashboards

### 7.1 Grafana Dashboard - Overview

```json
{
  "dashboard": {
    "title": "Prani Doctor Overview",
    "panels": [
      {
        "title": "Service Health",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"pranidoctor-web\"}"
          }
        ]
      },
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m]))"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Active Service Requests",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(active_service_requests)"
          }
        ]
      },
      {
        "title": "Database Connections",
        "type": "gauge",
        "targets": [
          {
            "expr": "pg_stat_activity_count / pg_settings_max_connections"
          }
        ]
      }
    ]
  }
}
```

### 7.2 Dashboard Categories

| Dashboard | Purpose | Panels |
|-----------|---------|--------|
| **Overview** | System health at a glance | Uptime, requests, errors, latency |
| **Application** | App performance | Response times, endpoints, errors |
| **Database** | PostgreSQL health | Connections, queries, replication |
| **Infrastructure** | Server resources | CPU, memory, disk, network |
| **Business** | Business metrics | Service requests, users, revenue |
| **AI** | AI service metrics | Requests, tokens, costs, errors |

---

## 8. Application Performance

### 8.1 Request Tracing Middleware

```typescript
// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { httpRequestsTotal, httpRequestDuration } from '@/lib/metrics';

export function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || uuidv4();
  const startTime = Date.now();

  // Add request ID to headers
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  // Record metrics
  const path = request.nextUrl.pathname;
  const method = request.method;

  // Use edge-compatible timing
  response.headers.set('x-response-time', `${Date.now() - startTime}ms`);

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

### 8.2 Database Query Monitoring

```typescript
// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';
import { dbQueryDuration } from '@/lib/metrics';
import logger from '@/lib/logger';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
  ],
});

// Query timing middleware
prisma.$use(async (params, next) => {
  const startTime = Date.now();
  const result = await next(params);
  const duration = (Date.now() - startTime) / 1000;

  // Record metric
  dbQueryDuration.observe(
    { operation: params.action, table: params.model || 'unknown' },
    duration
  );

  // Log slow queries
  if (duration > 1) {
    logger.warn({
      event: 'slow_query',
      model: params.model,
      action: params.action,
      duration,
    });
  }

  return result;
});

export default prisma;
```

---

## 9. Infrastructure Monitoring

### 9.1 External Uptime Monitoring

```yaml
# UptimeRobot / Better Uptime Configuration

monitors:
  - name: "Prani Doctor API"
    type: http
    url: "https://pranidoctor.com/api/health"
    interval: 60
    timeout: 30
    alert_contacts:
      - slack
      - email

  - name: "Prani Doctor Web"
    type: http
    url: "https://pranidoctor.com"
    interval: 60
    keyword: "Prani Doctor"

  - name: "SSL Certificate"
    type: ssl
    url: "pranidoctor.com"
    alert_days: 30

  - name: "Staging"
    type: http
    url: "https://staging.pranidoctor.com/api/health"
    interval: 300
```

### 9.2 Server Monitoring Script

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/server-monitor.sh

# Configuration
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"
THRESHOLDS=(
    "cpu:80"
    "memory:85"
    "disk:90"
)

alert() {
    local message=$1
    echo "[ALERT] $message"
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -s -X POST "$SLACK_WEBHOOK" \
            -H 'Content-type: application/json' \
            -d "{\"text\":\"⚠️ $message\"}"
    fi
}

# CPU Check
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    alert "High CPU usage: ${CPU_USAGE}%"
fi

# Memory Check
MEM_USAGE=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
if (( $(echo "$MEM_USAGE > 85" | bc -l) )); then
    alert "High memory usage: ${MEM_USAGE}%"
fi

# Disk Check
DISK_USAGE=$(df / | grep / | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    alert "High disk usage: ${DISK_USAGE}%"
fi

# Docker Health
UNHEALTHY=$(docker ps --filter health=unhealthy --format "{{.Names}}")
if [ -n "$UNHEALTHY" ]; then
    alert "Unhealthy containers: $UNHEALTHY"
fi

# Service Checks
for service in pranidoctor-web postgres redis; do
    if ! docker ps --filter name=$service --filter status=running | grep -q $service; then
        alert "Container not running: $service"
    fi
done
```

---

## 10. Incident Response

### 10.1 Incident Severity Levels

| Level | Name | Description | Response Time | Example |
|-------|------|-------------|---------------|---------|
| P1 | Critical | Service completely down | Immediate | API 500, DB down |
| P2 | High | Major feature broken | < 1 hour | Payment failing |
| P3 | Medium | Minor feature broken | < 4 hours | Slow uploads |
| P4 | Low | Cosmetic/Minor | Next business day | UI glitch |

### 10.2 Incident Response Procedure

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         INCIDENT RESPONSE PROCEDURE                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. DETECTION                                                                   │
│     • Alert received (automated or user report)                                 │
│     • Assess severity level                                                     │
│     • Acknowledge incident in tracking system                                   │
│                                                                                  │
│  2. TRIAGE                                                                      │
│     • Identify affected systems/users                                           │
│     • Determine impact scope                                                    │
│     • Assign incident commander                                                 │
│                                                                                  │
│  3. INVESTIGATE                                                                 │
│     • Check dashboards and metrics                                              │
│     • Review recent deployments                                                 │
│     • Check logs for errors                                                     │
│     • Identify root cause                                                       │
│                                                                                  │
│  4. MITIGATE                                                                    │
│     • Implement quick fix or rollback                                           │
│     • Scale resources if needed                                                 │
│     • Enable feature flags/circuit breakers                                     │
│                                                                                  │
│  5. RESOLVE                                                                     │
│     • Deploy permanent fix                                                      │
│     • Verify resolution                                                         │
│     • Monitor for recurrence                                                    │
│                                                                                  │
│  6. POST-MORTEM                                                                 │
│     • Document timeline                                                         │
│     • Identify root cause                                                       │
│     • Define action items                                                       │
│     • Update runbooks                                                           │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 10.3 Runbook Template

```markdown
# Runbook: [Issue Name]

## Overview
Brief description of the issue.

## Symptoms
- Symptom 1
- Symptom 2

## Impact
- Affected users/services
- Business impact

## Detection
How the issue is detected (alerts, user reports).

## Diagnosis
Steps to diagnose the issue:
1. Check dashboard: [link]
2. Query logs: `{job="pranidoctor"} |= "ERROR"`
3. Check recent deployments

## Mitigation
Immediate steps to reduce impact:
1. Step 1
2. Step 2

## Resolution
Steps to fully resolve:
1. Step 1
2. Step 2

## Prevention
How to prevent this in the future.

## Contacts
- On-call: @team-member
- Escalation: @lead
```

### 10.4 Post-Mortem Template

```markdown
# Post-Mortem: [Incident Title]

**Date:** YYYY-MM-DD
**Duration:** X hours Y minutes
**Severity:** P1/P2/P3/P4
**Author:** Name

## Summary
One paragraph summary of what happened.

## Timeline
| Time (UTC) | Event |
|------------|-------|
| HH:MM | Alert triggered |
| HH:MM | Investigation started |
| HH:MM | Root cause identified |
| HH:MM | Mitigation applied |
| HH:MM | Incident resolved |

## Root Cause
Detailed explanation of the root cause.

## Impact
- Users affected: X
- Revenue impact: $X
- Duration: X hours

## What Went Well
- Quick detection
- Clear communication

## What Went Wrong
- Delayed response
- Missing monitoring

## Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| Add monitoring for X | Name | Date | Pending |
| Update runbook | Name | Date | Done |

## Lessons Learned
Key takeaways from this incident.
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | DevOps Team | Initial release |

---

## Related Documents

| Document | Location |
|----------|----------|
| VPS Structure | `docs/devops/VPS_STRUCTURE.md` |
| Docker Strategy | `docs/devops/DOCKER_STRATEGY.md` |
| CI/CD Pipeline | `docs/devops/CICD_PIPELINE.md` |
| Backup Strategy | `docs/devops/BACKUP_STRATEGY.md` |

---

*End of MONITORING.md*
