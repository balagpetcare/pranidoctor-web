# VPS STRUCTURE — Prani Doctor Infrastructure

**Version:** 1.1.0  
**Last Updated:** 2026-05-21  
**Scope:** VPS architecture, server configuration, networking, security

---

## Table of Contents

1. [Infrastructure Overview](#1-infrastructure-overview)
2. [VPS Specifications](#2-vps-specifications)
3. [Server Architecture](#3-server-architecture)
4. [Directory Structure](#4-directory-structure)
5. [Network Architecture](#5-network-architecture)
6. [Reverse Proxy Strategy](#6-reverse-proxy-strategy)
7. [SSL/TLS Strategy](#7-ssltls-strategy)
8. [Firewall Configuration](#8-firewall-configuration)
9. [DNS Configuration](#9-dns-configuration)
9.5. [External Backup Storage](#95-external-backup-storage)
10. [Horizontal Scaling Readiness](#10-horizontal-scaling-readiness)

---

## 1. Infrastructure Overview

### 1.1 Architecture Philosophy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         INFRASTRUCTURE PRINCIPLES                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. STARTUP COST-EFFICIENT                                                      │
│     • Single VPS for MVP/Early stage                                            │
│     • Maximize value from minimal resources                                     │
│     • Pay-as-you-grow model                                                     │
│                                                                                  │
│  2. ENTERPRISE SCALABLE                                                         │
│     • Architecture ready for horizontal scaling                                 │
│     • Stateless application design                                              │
│     • External state management ready                                           │
│                                                                                  │
│  3. SECURE BY DEFAULT                                                           │
│     • Principle of least privilege                                              │
│     • Defense in depth                                                          │
│     • Regular security updates                                                  │
│                                                                                  │
│  4. MAINTAINABLE                                                                │
│     • Infrastructure as Code                                                    │
│     • Documented procedures                                                     │
│     • Automated where possible                                                  │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Evolution Path

```
PHASE 1 (MVP/Launch)              PHASE 2 (Growth)                PHASE 3 (Scale)
────────────────────              ────────────────                ────────────────

┌─────────────────────┐        ┌─────────────────────┐        ┌─────────────────────┐
│    SINGLE VPS       │        │    MULTI-VPS        │        │    CLOUD/K8S        │
│                     │        │                     │        │                     │
│  ┌───────────────┐  │        │  ┌───────────────┐  │        │  ┌───────────────┐  │
│  │   App + DB    │  │   ──▶  │  │   App VPS 1   │  │   ──▶  │  │  K8s Cluster  │  │
│  │   + Redis     │  │        │  │   App VPS 2   │  │        │  │   + RDS       │  │
│  │   + MinIO     │  │        │  │   DB VPS      │  │        │  │   + S3        │  │
│  │               │  │        │  │   Redis VPS   │  │        │  │   + Redis     │  │
│  └───────────────┘  │        │  └───────────────┘  │        │  └───────────────┘  │
│                     │        │                     │        │                     │
│  Cost: ~$20-40/mo   │        │  Cost: ~$100-200/mo │        │  Cost: ~$500+/mo    │
└─────────────────────┘        └─────────────────────┘        └─────────────────────┘

Trigger: Launch              Trigger: 1000+ DAU          Trigger: 10000+ DAU
                                      OR                          OR
                             DB > 50GB                   Global expansion
```

---

## 2. VPS Specifications

### 2.1 Recommended Providers

| Provider | Tier | Specs | Monthly Cost | Use Case |
|----------|------|-------|--------------|----------|
| **Hetzner** | CX31 | 4 vCPU, 8GB RAM, 80GB NVMe | ~$12 | MVP Recommended |
| DigitalOcean | Basic | 4 vCPU, 8GB RAM, 160GB | ~$48 | Alternative |
| Vultr | High Freq | 4 vCPU, 8GB RAM, 128GB | ~$48 | Alternative |
| Linode | Dedicated | 4 vCPU, 8GB RAM, 160GB | ~$48 | Alternative |
| AWS Lightsail | 4GB | 2 vCPU, 4GB RAM, 80GB | ~$20 | AWS ecosystem |

### 2.2 Phase 1 (Single VPS) Specifications

```yaml
# Production VPS - Minimum Requirements
vps:
  cpu: 4 vCPU (dedicated preferred)
  ram: 8 GB (minimum)
  storage: 80 GB NVMe SSD
  bandwidth: 20 TB/month
  os: Ubuntu 24.04 LTS
  location: Singapore (closest to Bangladesh)

# Resource Allocation Plan
allocation:
  postgresql: 2 GB RAM reserved
  redis: 512 MB RAM reserved
  minio: 512 MB RAM reserved
  application: 3 GB RAM
  system: 2 GB RAM buffer
```

### 2.3 Staging VPS Specifications

```yaml
# Staging VPS - Cost-Optimized
staging_vps:
  cpu: 2 vCPU
  ram: 4 GB
  storage: 40 GB SSD
  os: Ubuntu 24.04 LTS
  
# Or use same production VPS with isolated containers
# (recommended for small teams)
```

### 2.4 Environment Matrix

| Environment | Purpose | VPS | Database | Domain |
|-------------|---------|-----|----------|--------|
| **Production** | Live users | Dedicated | Isolated | pranidoctor.com |
| **Staging** | Pre-release testing | Shared/Separate | Isolated | staging.pranidoctor.com |
| **Development** | Local dev | N/A (Docker) | Local | localhost |

---

## 3. Server Architecture

### 3.1 Single VPS Architecture (Phase 1)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         SINGLE VPS ARCHITECTURE                                  │
│                         Ubuntu 24.04 LTS                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│    INTERNET                                                                      │
│        │                                                                         │
│        ▼                                                                         │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        CADDY (Reverse Proxy)                             │   │
│  │                     Port 80/443 → TLS Termination                        │   │
│  │                     Auto SSL via Let's Encrypt                           │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                         │
│        │ (Internal Docker Network)                                              │
│        │                                                                         │
│        ├──────────────────┬──────────────────┬──────────────────┐               │
│        ▼                  ▼                  ▼                  ▼               │
│  ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐          │
│  │ pranidoc- │     │ pranidoc- │     │           │     │           │          │
│  │ tor-web   │     │ tor-web   │     │   Redis   │     │   MinIO   │          │
│  │ (app:1)   │     │ (app:2)   │     │  :6379    │     │  :9000    │          │
│  │  :3000    │     │  :3001    │     │           │     │  :9001    │          │
│  └─────┬─────┘     └─────┬─────┘     └───────────┘     └───────────┘          │
│        │                 │                                                       │
│        └────────┬────────┘                                                       │
│                 ▼                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                        PostgreSQL 16                                      │   │
│  │                          :5432                                            │   │
│  │                  /var/lib/postgresql/data                                 │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                     PERSISTENT VOLUMES                                    │   │
│  │  /opt/pranidoctor/data/postgres    → PostgreSQL data                     │   │
│  │  /opt/pranidoctor/data/redis       → Redis persistence                   │   │
│  │  /opt/pranidoctor/data/minio       → Object storage                      │   │
│  │  /opt/pranidoctor/backups          → Backup storage                      │   │
│  │  /opt/pranidoctor/logs             → Application logs                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Service Components

| Service | Container | Port (Internal) | Port (External) | Purpose |
|---------|-----------|-----------------|-----------------|---------|
| Caddy | caddy | 80, 443 | 80, 443 | Reverse proxy, SSL |
| App (Primary) | pranidoctor-web | 3000 | - | Next.js application |
| App (Secondary) | pranidoctor-web-2 | 3001 | - | Load balance target |
| PostgreSQL | postgres | 5432 | - | Primary database |
| Redis | redis | 6379 | - | Cache, sessions, queues |
| MinIO | minio | 9000, 9001 | - | Object storage |

### 3.3 Resource Limits

```yaml
# docker-compose resource limits
services:
  pranidoctor-web:
    deploy:
      resources:
        limits:
          cpus: '1.5'
          memory: 1536M
        reservations:
          cpus: '0.5'
          memory: 512M

  postgres:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2048M
        reservations:
          cpus: '0.5'
          memory: 1024M

  redis:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.1'
          memory: 128M

  minio:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.1'
          memory: 256M

  caddy:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
```

---

## 4. Directory Structure

### 4.1 Server Directory Layout

```
/opt/pranidoctor/
├── apps/
│   └── web/                      # Application deployment
│       ├── docker-compose.yml    # Main compose file
│       ├── docker-compose.prod.yml
│       ├── docker-compose.staging.yml
│       ├── .env.production       # Production env (encrypted)
│       ├── .env.staging          # Staging env (encrypted)
│       └── Caddyfile             # Caddy configuration
│
├── data/                         # Persistent data
│   ├── postgres/                 # PostgreSQL data
│   │   └── data/
│   ├── redis/                    # Redis persistence
│   │   └── data/
│   └── minio/                    # MinIO object storage
│       └── data/
│
├── backups/                      # Backup storage
│   ├── postgres/                 # Database backups
│   │   ├── daily/
│   │   ├── weekly/
│   │   └── monthly/
│   ├── minio/                    # Media backups
│   └── config/                   # Config backups
│
├── logs/                         # Centralized logs
│   ├── app/                      # Application logs
│   ├── nginx/                    # Reverse proxy logs
│   ├── postgres/                 # Database logs
│   └── system/                   # System logs
│
├── scripts/                      # Operational scripts
│   ├── backup.sh
│   ├── restore.sh
│   ├── deploy.sh
│   ├── rollback.sh
│   ├── health-check.sh
│   └── maintenance.sh
│
├── ssl/                          # SSL certificates (if manual)
│   └── certs/
│
└── config/                       # Service configurations
    ├── postgres/
    │   └── postgresql.conf
    ├── redis/
    │   └── redis.conf
    └── caddy/
        └── Caddyfile
```

### 4.2 Permission Setup

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/setup-permissions.sh

# Create pranidoctor user
sudo useradd -r -s /bin/false pranidoctor

# Set ownership
sudo chown -R pranidoctor:pranidoctor /opt/pranidoctor

# Set directory permissions
sudo chmod 750 /opt/pranidoctor
sudo chmod 700 /opt/pranidoctor/data
sudo chmod 700 /opt/pranidoctor/backups
sudo chmod 755 /opt/pranidoctor/scripts
sudo chmod 755 /opt/pranidoctor/logs

# Secure sensitive files
sudo chmod 600 /opt/pranidoctor/apps/web/.env.*

# Add deploy user to pranidoctor group
sudo usermod -aG pranidoctor deploy
```

---

## 5. Network Architecture

### 5.1 Docker Network Configuration

```yaml
# docker-compose.yml networks section
networks:
  frontend:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/24
    
  backend:
    driver: bridge
    internal: true
    ipam:
      config:
        - subnet: 172.21.0.0/24

# Service network assignments:
# - caddy: frontend
# - app: frontend + backend
# - postgres: backend only
# - redis: backend only
# - minio: backend only
```

### 5.2 Network Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DOCKER NETWORK TOPOLOGY                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  INTERNET (Public)                                                              │
│      │                                                                           │
│      │ :80, :443                                                                │
│      │                                                                           │
│  ════╪════════════════════════════════════════════════════════════════════     │
│      │         FRONTEND NETWORK (172.20.0.0/24)                                 │
│      │                                                                           │
│      ▼                                                                           │
│  ┌─────────┐                                                                    │
│  │  Caddy  │ 172.20.0.2                                                         │
│  └────┬────┘                                                                    │
│       │                                                                          │
│       ├──────────────────────┐                                                  │
│       │                      │                                                  │
│       ▼                      ▼                                                  │
│  ┌─────────┐          ┌─────────┐                                              │
│  │  App 1  │          │  App 2  │                                              │
│  │ .20.10  │          │ .20.11  │   (Dual-homed)                               │
│  └────┬────┘          └────┬────┘                                              │
│       │                    │                                                    │
│  ════╪════════════════════╪════════════════════════════════════════════════    │
│      │         BACKEND NETWORK (172.21.0.0/24) [internal]                      │
│      │                    │                                                     │
│      ├────────────────────┤                                                     │
│      │                    │                                                     │
│      ▼                    ▼                                                     │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                                        │
│  │PostgreSQL│  │  Redis  │  │  MinIO  │                                        │
│  │ .21.10  │  │ .21.11  │  │ .21.12  │                                        │
│  └─────────┘  └─────────┘  └─────────┘                                        │
│                                                                                  │
│  NO DIRECT INTERNET ACCESS TO BACKEND NETWORK                                   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Port Exposure Policy

| Port | Protocol | Exposed | Purpose |
|------|----------|---------|---------|
| 22 | TCP | Yes (restricted) | SSH access |
| 80 | TCP | Yes | HTTP → HTTPS redirect |
| 443 | TCP | Yes | HTTPS traffic |
| 5432 | TCP | No | PostgreSQL (internal) |
| 6379 | TCP | No | Redis (internal) |
| 9000 | TCP | No | MinIO API (internal) |
| 9001 | TCP | No | MinIO Console (internal) |
| 3000 | TCP | No | App (internal) |

---

## 6. Reverse Proxy Strategy

### 6.1 Caddy Configuration

```caddyfile
# /opt/pranidoctor/config/caddy/Caddyfile

{
    # Global options
    email admin@pranidoctor.com
    acme_ca https://acme-v02.api.letsencrypt.org/directory
    
    # Logging
    log {
        output file /var/log/caddy/access.log {
            roll_size 100mb
            roll_keep 10
        }
        format json
    }
}

# Production
pranidoctor.com {
    # SSL - Automatic via Let's Encrypt
    tls {
        protocols tls1.2 tls1.3
    }
    
    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        -Server
    }
    
    # Gzip compression
    encode gzip zstd
    
    # Health check endpoint (no logging)
    @health path /api/health
    handle @health {
        reverse_proxy pranidoctor-web:3000
    }
    
    # Static assets caching
    @static path /_next/static/* /static/*
    handle @static {
        header Cache-Control "public, max-age=31536000, immutable"
        reverse_proxy pranidoctor-web:3000
    }
    
    # API routes
    @api path /api/*
    handle @api {
        reverse_proxy pranidoctor-web:3000 pranidoctor-web-2:3001 {
            lb_policy round_robin
            health_uri /api/health
            health_interval 10s
            health_timeout 5s
            fail_duration 30s
        }
    }
    
    # Default handler
    handle {
        reverse_proxy pranidoctor-web:3000 pranidoctor-web-2:3001 {
            lb_policy round_robin
            health_uri /api/health
            health_interval 10s
        }
    }
}

# WWW redirect
www.pranidoctor.com {
    redir https://pranidoctor.com{uri} permanent
}

# Staging
staging.pranidoctor.com {
    tls {
        protocols tls1.2 tls1.3
    }
    
    # Basic auth for staging
    basicauth /* {
        staging $2a$14$HASHED_PASSWORD_HERE
    }
    
    reverse_proxy pranidoctor-web-staging:3000
}

# Admin subdomain (optional)
admin.pranidoctor.com {
    tls {
        protocols tls1.2 tls1.3
    }
    
    # IP whitelist for admin (optional)
    @blocked not remote_ip 103.x.x.x/32 # Office IP
    respond @blocked "Access Denied" 403
    
    reverse_proxy pranidoctor-web:3000
}
```

### 6.2 Load Balancing Strategy

```
CURRENT (Phase 1): Single VPS with 2 App Instances
─────────────────────────────────────────────────

                    Caddy
                      │
            ┌─────────┴─────────┐
            │    Round Robin    │
            ▼                   ▼
        App:3000           App:3001
            │                   │
            └─────────┬─────────┘
                      │
                 PostgreSQL


FUTURE (Phase 2): Multi-VPS
───────────────────────────

                 Load Balancer (Caddy/HAProxy)
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             ▼             ▼
         VPS-1         VPS-2         VPS-3
        App:3000      App:3000      App:3000
            │             │             │
            └─────────────┼─────────────┘
                          │
                   DB VPS (Primary)
                          │
                   DB VPS (Replica)
```

---

## 7. SSL/TLS Strategy

### 7.1 Certificate Management

| Environment | Method | Provider | Renewal |
|-------------|--------|----------|---------|
| Production | Automatic | Let's Encrypt | Auto (Caddy) |
| Staging | Automatic | Let's Encrypt | Auto (Caddy) |
| Development | Self-signed | mkcert | Manual |

### 7.2 TLS Configuration

```yaml
# Minimum TLS settings
tls:
  min_version: TLSv1.2
  max_version: TLSv1.3
  
  # Preferred cipher suites (TLS 1.3)
  ciphersuites_tls13:
    - TLS_AES_256_GCM_SHA384
    - TLS_CHACHA20_POLY1305_SHA256
    - TLS_AES_128_GCM_SHA256
  
  # Cipher suites (TLS 1.2)
  ciphersuites_tls12:
    - ECDHE-ECDSA-AES256-GCM-SHA384
    - ECDHE-RSA-AES256-GCM-SHA384
    - ECDHE-ECDSA-CHACHA20-POLY1305
    - ECDHE-RSA-CHACHA20-POLY1305
```

### 7.3 Certificate Monitoring

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/check-ssl.sh

DOMAIN="pranidoctor.com"
DAYS_THRESHOLD=30

EXPIRY=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | \
         openssl x509 -noout -enddate | cut -d= -f2)

EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
NOW_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

if [ $DAYS_LEFT -lt $DAYS_THRESHOLD ]; then
    echo "WARNING: SSL certificate expires in $DAYS_LEFT days"
    # Send alert
    curl -X POST "$ALERT_WEBHOOK" -d "SSL certificate for $DOMAIN expires in $DAYS_LEFT days"
fi
```

---

## 8. Firewall Configuration

### 8.1 UFW Rules

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/setup-firewall.sh

# Reset UFW
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH (rate limited)
sudo ufw limit 22/tcp comment 'SSH'

# HTTP/HTTPS
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# Docker (internal communication)
# Note: Docker manages its own iptables rules

# Deny everything else explicitly
sudo ufw deny from any

# Enable UFW
sudo ufw --force enable

# Show status
sudo ufw status verbose
```

### 8.2 Fail2Ban Configuration

```ini
# /etc/fail2ban/jail.local

[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400

[caddy-auth]
enabled = true
port = http,https
filter = caddy-auth
logpath = /var/log/caddy/access.log
maxretry = 10
bantime = 3600

[caddy-badbots]
enabled = true
port = http,https
filter = caddy-badbots
logpath = /var/log/caddy/access.log
maxretry = 2
bantime = 86400
```

### 8.3 Security Hardening Checklist

```markdown
## VPS Security Hardening

### SSH Hardening
- [ ] Disable root login
- [ ] Use SSH keys only (no password)
- [ ] Change default SSH port (optional)
- [ ] Limit SSH users

### System Hardening
- [ ] Enable automatic security updates
- [ ] Remove unnecessary packages
- [ ] Configure fail2ban
- [ ] Enable UFW firewall
- [ ] Disable IPv6 if not needed

### Docker Hardening
- [ ] Run containers as non-root
- [ ] Use read-only file systems where possible
- [ ] Limit container capabilities
- [ ] Use security scanning

### Monitoring
- [ ] Enable audit logging
- [ ] Configure log rotation
- [ ] Set up intrusion detection
```

---

## 9. DNS Configuration

### 9.1 DNS Records

```
; pranidoctor.com DNS Zone
; A Records
@       IN  A       <VPS_IP>
www     IN  A       <VPS_IP>
staging IN  A       <VPS_IP>
admin   IN  A       <VPS_IP>
api     IN  CNAME   @

; MX Records (if email needed)
@       IN  MX  10  mail.pranidoctor.com.

; TXT Records
@       IN  TXT     "v=spf1 include:_spf.google.com ~all"

; CAA Record (Certificate Authority Authorization)
@       IN  CAA 0   issue "letsencrypt.org"
```

### 9.2 DNS Provider Setup

| Provider | Recommendation | Features |
|----------|----------------|----------|
| Cloudflare | Recommended | Free, DDoS protection, CDN |
| Route 53 | AWS ecosystem | Integrated with AWS |
| DigitalOcean DNS | DO users | Simple, free with droplets |

### 9.3 Cloudflare Configuration

```yaml
# Recommended Cloudflare settings
cloudflare:
  ssl_mode: "Full (strict)"  # End-to-end encryption
  always_use_https: true
  auto_minify:
    javascript: true
    css: true
    html: true
  brotli: true
  early_hints: true
  
  # Page Rules
  page_rules:
    - pattern: "*.pranidoctor.com/api/*"
      cache_level: "bypass"
      browser_cache_ttl: 0
    
    - pattern: "*.pranidoctor.com/_next/static/*"
      cache_level: "cache_everything"
      edge_cache_ttl: 31536000
  
  # Firewall Rules
  firewall_rules:
    - name: "Block Bad Bots"
      expression: "(cf.client.bot)"
      action: "challenge"
    
    - name: "Rate Limit API"
      expression: "(http.request.uri.path contains \"/api/\")"
      action: "rate_limit"
      threshold: 100
      period: 60
```

---

## 9.5 External Backup Storage

Offsite backups referenced in `BACKUP_STRATEGY.md` are **not** stored on the application VPS disk long-term. Local staging: `/opt/pranidoctor/backups/` (see §4 directory structure).

| Provider | Use case | Setup |
|----------|----------|-------|
| Hetzner Storage Box | Cost-effective default | SFTP/rsync from `backup.sh` |
| AWS S3 | Enterprise / large volume | AWS CLI sync |
| Backblaze B2 | Budget S3-compatible | S3 API endpoint |

**MVP recommendation:** Hetzner Storage Box or rsync to secondary VPS.  
**Scale trigger:** Move to S3 when backup set exceeds ~50GB or retention policy requires object versioning.

Align bucket names with `BACKUP_STRATEGY.md`: `pranidoctor-media`, `pranidoctor-uploads` (MinIO on VPS mirrors production naming).

---

## 10. Horizontal Scaling Readiness

### 10.1 Scaling Triggers

| Metric | Threshold | Action |
|--------|-----------|--------|
| CPU Usage | > 70% sustained | Add app instance |
| Memory | > 80% | Upgrade VPS or separate service |
| DB Connections | > 80% pool | Add read replica |
| Response Time | p95 > 2s | Investigate and scale |
| Error Rate | > 1% | Investigate, may need scale |

### 10.2 Stateless Application Requirements

```yaml
# Requirements for horizontal scaling
stateless_checklist:
  session_management:
    method: "JWT tokens"
    storage: "Client-side"
    note: "No server-side session state"
  
  file_uploads:
    method: "S3-compatible (MinIO → S3)"
    storage: "External object storage"
    note: "No local file system dependencies"
  
  cache:
    method: "Redis"
    storage: "External Redis cluster"
    note: "Shared cache across instances"
  
  background_jobs:
    method: "BullMQ with Redis"
    storage: "External Redis"
    note: "Any instance can process jobs"
  
  configuration:
    method: "Environment variables"
    source: "External config (Vault/SSM future)"
    note: "No local config files"
```

### 10.3 Multi-VPS Architecture (Phase 2)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         MULTI-VPS ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                        ┌─────────────────────┐                                  │
│                        │   Load Balancer     │                                  │
│                        │   (Hetzner LB or    │                                  │
│                        │    HAProxy VPS)     │                                  │
│                        └──────────┬──────────┘                                  │
│                                   │                                             │
│               ┌───────────────────┼───────────────────┐                        │
│               │                   │                   │                        │
│               ▼                   ▼                   ▼                        │
│       ┌───────────────┐   ┌───────────────┐   ┌───────────────┐              │
│       │   App VPS 1   │   │   App VPS 2   │   │   App VPS 3   │              │
│       │  2CPU, 4GB    │   │  2CPU, 4GB    │   │  2CPU, 4GB    │              │
│       │  App + Caddy  │   │  App + Caddy  │   │  App + Caddy  │              │
│       └───────────────┘   └───────────────┘   └───────────────┘              │
│               │                   │                   │                        │
│               └───────────────────┼───────────────────┘                        │
│                                   │                                             │
│                          ┌────────┴────────┐                                   │
│                          │                 │                                   │
│                          ▼                 ▼                                   │
│               ┌───────────────┐   ┌───────────────┐                           │
│               │   DB Primary  │   │  DB Replica   │                           │
│               │  4CPU, 8GB    │   │  2CPU, 4GB    │                           │
│               │  PostgreSQL   │   │  PostgreSQL   │                           │
│               └───────────────┘   └───────────────┘                           │
│                                                                                  │
│               ┌───────────────┐   ┌───────────────┐                           │
│               │  Redis VPS    │   │  MinIO VPS    │                           │
│               │  (or managed) │   │  (or S3)      │                           │
│               └───────────────┘   └───────────────┘                           │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 10.4 Scaling Playbook

```markdown
## Scaling Playbook

### Adding App Instance
1. Provision new VPS with same specs
2. Deploy application container
3. Add to load balancer pool
4. Verify health checks passing
5. Monitor for 15 minutes
6. Done

### Database Read Replica
1. Create replica VPS
2. Set up PostgreSQL streaming replication
3. Configure app to use replica for reads
4. Monitor replication lag
5. Update connection pool settings

### Migrating to Managed Services
1. Provision managed database (RDS, PlanetScale)
2. Set up replication from current DB
3. Test with staging environment
4. Schedule maintenance window
5. Switch DNS/connection strings
6. Verify application functionality
7. Decommission old database VPS
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
| Docker Strategy | `docs/devops/DOCKER_STRATEGY.md` |
| CI/CD Pipeline | `docs/devops/CICD_PIPELINE.md` |
| Backup Strategy | `docs/devops/BACKUP_STRATEGY.md` |
| Monitoring | `docs/devops/MONITORING.md` |

---

*End of VPS_STRUCTURE.md*
