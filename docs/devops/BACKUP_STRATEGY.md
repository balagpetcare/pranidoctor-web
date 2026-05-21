# BACKUP STRATEGY — Prani Doctor

**Version:** 1.0.0  
**Last Updated:** 2026-05-21  
**Scope:** Database backups, media backups, disaster recovery, retention policies

---

## Table of Contents

1. [Backup Philosophy](#1-backup-philosophy)
2. [Backup Architecture](#2-backup-architecture)
3. [PostgreSQL Backup](#3-postgresql-backup)
4. [MinIO/Media Backup](#4-miniomedia-backup)
5. [Configuration Backup](#5-configuration-backup)
6. [Backup Automation](#6-backup-automation)
7. [Retention Policy](#7-retention-policy)
8. [Restore Procedures](#8-restore-procedures)
9. [Disaster Recovery](#9-disaster-recovery)
10. [Testing & Validation](#10-testing--validation)

---

## 1. Backup Philosophy

### 1.1 Core Principles

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         BACKUP PRINCIPLES                                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. 3-2-1 RULE                                                                  │
│     • 3 copies of data                                                          │
│     • 2 different storage types                                                 │
│     • 1 offsite location                                                        │
│                                                                                  │
│  2. AUTOMATED                                                                   │
│     • Scheduled backups                                                         │
│     • Minimal manual intervention                                               │
│     • Alert on failures                                                         │
│                                                                                  │
│  3. VERIFIED                                                                    │
│     • Regular restore testing                                                   │
│     • Integrity checks                                                          │
│     • Documented procedures                                                     │
│                                                                                  │
│  4. ENCRYPTED                                                                   │
│     • At-rest encryption                                                        │
│     • In-transit encryption                                                     │
│     • Secure key management                                                     │
│                                                                                  │
│  5. COST-EFFICIENT                                                              │
│     • Tiered storage                                                            │
│     • Incremental where possible                                                │
│     • Appropriate retention                                                     │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Classification

| Data Type | RPO | RTO | Priority | Backup Frequency |
|-----------|-----|-----|----------|------------------|
| Database (PostgreSQL) | 1 hour | 4 hours | Critical | Hourly + Daily |
| User uploads (MinIO) | 24 hours | 8 hours | High | Daily |
| Configuration | 24 hours | 1 hour | High | On change |
| Logs | 7 days | 24 hours | Medium | Daily |
| Application code | N/A | 5 min | Critical | Git (continuous) |

**RPO** = Recovery Point Objective (max data loss)  
**RTO** = Recovery Time Objective (max downtime)

---

## 2. Backup Architecture

### 2.1 Backup Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         BACKUP ARCHITECTURE                                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  SOURCE DATA                                                                    │
│  ───────────                                                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │ PostgreSQL  │  │   MinIO     │  │   Config    │  │    Logs     │           │
│  │   /data     │  │   /data     │  │   /config   │  │   /logs     │           │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘           │
│         │                │                │                │                   │
│         ▼                ▼                ▼                ▼                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         BACKUP PROCESS                                   │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │   │
│  │  │  Dump   │  │Compress │  │ Encrypt │  │ Verify  │  │Transfer │       │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│         │                                                                       │
│         ▼                                                                       │
│  LOCAL BACKUP (First Copy)                                                     │
│  ────────────────────────                                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  /opt/pranidoctor/backups/                                               │   │
│  │  ├── postgres/                                                           │   │
│  │  │   ├── hourly/                                                        │   │
│  │  │   ├── daily/                                                         │   │
│  │  │   ├── weekly/                                                        │   │
│  │  │   └── monthly/                                                       │   │
│  │  ├── minio/                                                             │   │
│  │  └── config/                                                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│         │                                                                       │
│         ▼                                                                       │
│  OFFSITE BACKUP (Second Copy)                                                  │
│  ────────────────────────────                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  Cloud Storage (S3/B2/GCS)                                               │   │
│  │  ├── Lifecycle policies                                                  │   │
│  │  ├── Versioning enabled                                                  │   │
│  │  └── Cross-region replication (optional)                                │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Storage Locations

| Copy | Type | Location | Purpose |
|------|------|----------|---------|
| Primary | Local | VPS `/opt/pranidoctor/backups` | Fast restore |
| Secondary | Cloud | S3/Backblaze B2 | Offsite, disaster recovery |
| Tertiary | Archive | Glacier/B2 Archive | Long-term retention |

---

## 3. PostgreSQL Backup

### 3.1 Backup Types

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         POSTGRESQL BACKUP TYPES                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. LOGICAL BACKUP (pg_dump)                                                    │
│     ├── Full database dump                                                      │
│     ├── Human-readable SQL                                                      │
│     ├── Selective restore possible                                              │
│     └── Used for: Daily backups, migration                                      │
│                                                                                  │
│  2. CONTINUOUS ARCHIVING (WAL)                                                  │
│     ├── Write-Ahead Log streaming                                               │
│     ├── Point-in-time recovery                                                  │
│     ├── Minimal data loss                                                       │
│     └── Used for: Hourly/continuous backup                                      │
│                                                                                  │
│  3. PHYSICAL BACKUP (pg_basebackup)                                             │
│     ├── File-level copy                                                         │
│     ├── Fast backup/restore                                                     │
│     ├── Requires same PostgreSQL version                                        │
│     └── Used for: Replication, disaster recovery                                │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 PostgreSQL Backup Script

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/backup-postgres.sh

set -euo pipefail

# Configuration
BACKUP_DIR="/opt/pranidoctor/backups/postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="pranidoctor-postgres"
DB_NAME="pranidoctor_db"
DB_USER="pranidoctor"
RETENTION_HOURLY=24
RETENTION_DAILY=7
RETENTION_WEEKLY=4
RETENTION_MONTHLY=12

# Encryption key (stored securely)
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"

# Logging
LOG_FILE="/opt/pranidoctor/logs/backup/postgres_backup.log"
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    log "ERROR: $1"
    # Send alert
    curl -s -X POST "${SLACK_WEBHOOK:-}" -d "{\"text\":\"❌ PostgreSQL backup failed: $1\"}" || true
    exit 1
}

# Create backup directory structure
mkdir -p "$BACKUP_DIR"/{hourly,daily,weekly,monthly}

# Determine backup type based on time
HOUR=$(date +%H)
DAY=$(date +%u)  # 1=Monday
DATE=$(date +%d)

if [ "$DATE" == "01" ]; then
    BACKUP_TYPE="monthly"
    RETENTION=$RETENTION_MONTHLY
elif [ "$DAY" == "7" ]; then
    BACKUP_TYPE="weekly"
    RETENTION=$RETENTION_WEEKLY
elif [ "$HOUR" == "00" ]; then
    BACKUP_TYPE="daily"
    RETENTION=$RETENTION_DAILY
else
    BACKUP_TYPE="hourly"
    RETENTION=$RETENTION_HOURLY
fi

BACKUP_FILE="${BACKUP_DIR}/${BACKUP_TYPE}/${DB_NAME}_${TIMESTAMP}.sql"

log "Starting $BACKUP_TYPE backup: $BACKUP_FILE"

# Create backup
docker exec -t "$DB_CONTAINER" pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=custom \
    --compress=9 \
    --no-owner \
    --no-privileges \
    > "${BACKUP_FILE}.dump" || error_exit "pg_dump failed"

# Also create SQL format for flexibility
docker exec -t "$DB_CONTAINER" pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-privileges \
    | gzip > "${BACKUP_FILE}.gz" || error_exit "SQL dump failed"

# Encrypt backup if key is provided
if [ -n "$ENCRYPTION_KEY" ]; then
    log "Encrypting backup..."
    openssl enc -aes-256-cbc -salt -pbkdf2 \
        -in "${BACKUP_FILE}.dump" \
        -out "${BACKUP_FILE}.dump.enc" \
        -pass "pass:$ENCRYPTION_KEY" || error_exit "Encryption failed"
    rm "${BACKUP_FILE}.dump"
    BACKUP_FILE="${BACKUP_FILE}.dump.enc"
fi

# Get backup size
BACKUP_SIZE=$(du -h "${BACKUP_FILE}" 2>/dev/null | cut -f1)
log "Backup completed: ${BACKUP_FILE} (${BACKUP_SIZE})"

# Verify backup integrity
log "Verifying backup integrity..."
if [ -f "${BACKUP_FILE}.gz" ]; then
    gunzip -t "${BACKUP_FILE}.gz" || error_exit "Backup verification failed"
fi

# Cleanup old backups
log "Cleaning up old $BACKUP_TYPE backups (keeping last $RETENTION)..."
ls -t "$BACKUP_DIR/$BACKUP_TYPE"/*.{dump,dump.enc,gz} 2>/dev/null | \
    tail -n +$((RETENTION + 1)) | \
    xargs -r rm -f

# Sync to offsite storage
if [ -n "${S3_BUCKET:-}" ]; then
    log "Syncing to offsite storage..."
    aws s3 cp "${BACKUP_FILE}" "s3://${S3_BUCKET}/postgres/${BACKUP_TYPE}/" \
        --storage-class STANDARD_IA || log "WARNING: Offsite sync failed"
fi

# Record backup metadata
cat >> "$BACKUP_DIR/backup_log.json" << EOF
{"timestamp":"$(date -Iseconds)","type":"$BACKUP_TYPE","file":"$BACKUP_FILE","size":"$BACKUP_SIZE","status":"success"}
EOF

log "PostgreSQL backup completed successfully"

# Send success notification (optional, for daily/weekly/monthly)
if [ "$BACKUP_TYPE" != "hourly" ]; then
    curl -s -X POST "${SLACK_WEBHOOK:-}" \
        -d "{\"text\":\"✅ PostgreSQL $BACKUP_TYPE backup completed: ${BACKUP_SIZE}\"}" || true
fi
```

### 3.3 WAL Archiving Configuration

```conf
# postgresql.conf - WAL archiving settings

# Enable archiving
archive_mode = on
archive_command = 'gzip < %p > /opt/pranidoctor/backups/postgres/wal/%f.gz'
archive_timeout = 300  # Archive every 5 minutes if no activity

# WAL settings
wal_level = replica
max_wal_senders = 3
wal_keep_size = 1GB
```

### 3.4 Point-in-Time Recovery Setup

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/pitr-setup.sh

# Create base backup for PITR
docker exec -t pranidoctor-postgres pg_basebackup \
    -U pranidoctor \
    -D /var/lib/postgresql/backup \
    -Ft -z -P \
    -X fetch

# Move to backup location
docker cp pranidoctor-postgres:/var/lib/postgresql/backup/base.tar.gz \
    /opt/pranidoctor/backups/postgres/base/base_$(date +%Y%m%d).tar.gz
```

---

## 4. MinIO/Media Backup

### 4.1 MinIO Backup Script

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/backup-minio.sh

set -euo pipefail

# Configuration
BACKUP_DIR="/opt/pranidoctor/backups/minio"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
MINIO_ALIAS="local"
BUCKETS=("pranidoctor-media" "pranidoctor-uploads")
RETENTION_DAILY=7
RETENTION_WEEKLY=4

LOG_FILE="/opt/pranidoctor/logs/backup/minio_backup.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error_exit() {
    log "ERROR: $1"
    curl -s -X POST "${SLACK_WEBHOOK:-}" -d "{\"text\":\"❌ MinIO backup failed: $1\"}" || true
    exit 1
}

# Create backup directory
mkdir -p "$BACKUP_DIR"/{daily,weekly}

# Determine backup type
DAY=$(date +%u)
if [ "$DAY" == "7" ]; then
    BACKUP_TYPE="weekly"
    RETENTION=$RETENTION_WEEKLY
else
    BACKUP_TYPE="daily"
    RETENTION=$RETENTION_DAILY
fi

BACKUP_PATH="${BACKUP_DIR}/${BACKUP_TYPE}/${TIMESTAMP}"
mkdir -p "$BACKUP_PATH"

log "Starting $BACKUP_TYPE MinIO backup: $BACKUP_PATH"

# Configure mc alias
docker exec pranidoctor-minio mc alias set $MINIO_ALIAS \
    http://localhost:9000 \
    "$MINIO_ROOT_USER" \
    "$MINIO_ROOT_PASSWORD" || error_exit "Failed to configure mc"

# Backup each bucket
TOTAL_SIZE=0
for BUCKET in "${BUCKETS[@]}"; do
    log "Backing up bucket: $BUCKET"
    
    # Mirror bucket to backup location
    docker exec pranidoctor-minio mc mirror \
        --overwrite \
        "$MINIO_ALIAS/$BUCKET" \
        "/backup/$BUCKET" || error_exit "Failed to backup $BUCKET"
    
    # Copy from container to host
    docker cp "pranidoctor-minio:/backup/$BUCKET" "$BACKUP_PATH/"
    
    # Compress
    tar -czf "${BACKUP_PATH}/${BUCKET}.tar.gz" -C "$BACKUP_PATH" "$BUCKET"
    rm -rf "${BACKUP_PATH}/${BUCKET}"
    
    SIZE=$(du -h "${BACKUP_PATH}/${BUCKET}.tar.gz" | cut -f1)
    log "Bucket $BUCKET backed up: $SIZE"
done

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
log "Total backup size: $TOTAL_SIZE"

# Sync to offsite
if [ -n "${S3_BUCKET:-}" ]; then
    log "Syncing to offsite storage..."
    aws s3 sync "$BACKUP_PATH" "s3://${S3_BUCKET}/minio/${BACKUP_TYPE}/${TIMESTAMP}/" \
        --storage-class STANDARD_IA || log "WARNING: Offsite sync failed"
fi

# Cleanup old backups
log "Cleaning up old $BACKUP_TYPE backups (keeping last $RETENTION)..."
ls -dt "$BACKUP_DIR/$BACKUP_TYPE"/*/ 2>/dev/null | \
    tail -n +$((RETENTION + 1)) | \
    xargs -r rm -rf

log "MinIO backup completed successfully"
```

### 4.2 Incremental Media Backup

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/backup-minio-incremental.sh

# Use rsync for incremental backup
BACKUP_DIR="/opt/pranidoctor/backups/minio/incremental"
MINIO_DATA="/opt/pranidoctor/data/minio"

# Create backup with rsync
rsync -avz --delete \
    --backup --backup-dir="$BACKUP_DIR/changes_$(date +%Y%m%d)" \
    "$MINIO_DATA/" \
    "$BACKUP_DIR/current/"

# Compress changes
if [ -d "$BACKUP_DIR/changes_$(date +%Y%m%d)" ]; then
    tar -czf "$BACKUP_DIR/changes_$(date +%Y%m%d).tar.gz" \
        -C "$BACKUP_DIR" "changes_$(date +%Y%m%d)"
    rm -rf "$BACKUP_DIR/changes_$(date +%Y%m%d)"
fi
```

---

## 5. Configuration Backup

### 5.1 Configuration Backup Script

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/backup-config.sh

set -euo pipefail

BACKUP_DIR="/opt/pranidoctor/backups/config"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/config_${TIMESTAMP}.tar.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Files to backup
CONFIG_FILES=(
    "/opt/pranidoctor/apps/web/docker-compose.yml"
    "/opt/pranidoctor/apps/web/docker-compose.prod.yml"
    "/opt/pranidoctor/apps/web/Caddyfile"
    "/opt/pranidoctor/config/"
    "/opt/pranidoctor/scripts/"
)

# Create tarball (excluding sensitive files)
tar -czf "$BACKUP_FILE" \
    --exclude='*.env*' \
    --exclude='*secret*' \
    --exclude='*password*' \
    "${CONFIG_FILES[@]}" 2>/dev/null || true

# Backup encrypted environment files separately
if [ -n "${BACKUP_ENCRYPTION_KEY:-}" ]; then
    tar -czf - /opt/pranidoctor/apps/web/.env.* 2>/dev/null | \
        openssl enc -aes-256-cbc -salt -pbkdf2 \
        -pass "pass:$BACKUP_ENCRYPTION_KEY" \
        > "${BACKUP_DIR}/env_${TIMESTAMP}.tar.gz.enc"
fi

# Sync to offsite
if [ -n "${S3_BUCKET:-}" ]; then
    aws s3 cp "$BACKUP_FILE" "s3://${S3_BUCKET}/config/"
fi

# Cleanup (keep last 30 days)
find "$BACKUP_DIR" -name "config_*.tar.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "env_*.tar.gz.enc" -mtime +30 -delete

echo "Configuration backup completed: $BACKUP_FILE"
```

---

## 6. Backup Automation

### 6.1 Cron Schedule

```bash
# /etc/cron.d/pranidoctor-backup

# PostgreSQL backups
0 * * * *     root /opt/pranidoctor/scripts/backup-postgres.sh hourly >> /opt/pranidoctor/logs/backup/cron.log 2>&1
0 0 * * *     root /opt/pranidoctor/scripts/backup-postgres.sh daily >> /opt/pranidoctor/logs/backup/cron.log 2>&1
0 0 * * 0     root /opt/pranidoctor/scripts/backup-postgres.sh weekly >> /opt/pranidoctor/logs/backup/cron.log 2>&1
0 0 1 * *     root /opt/pranidoctor/scripts/backup-postgres.sh monthly >> /opt/pranidoctor/logs/backup/cron.log 2>&1

# MinIO/Media backups
0 2 * * *     root /opt/pranidoctor/scripts/backup-minio.sh >> /opt/pranidoctor/logs/backup/cron.log 2>&1

# Configuration backups
0 3 * * *     root /opt/pranidoctor/scripts/backup-config.sh >> /opt/pranidoctor/logs/backup/cron.log 2>&1

# Offsite sync
0 4 * * *     root /opt/pranidoctor/scripts/sync-offsite.sh >> /opt/pranidoctor/logs/backup/cron.log 2>&1

# Backup verification (weekly)
0 5 * * 0     root /opt/pranidoctor/scripts/verify-backups.sh >> /opt/pranidoctor/logs/backup/cron.log 2>&1
```

### 6.2 Systemd Timer (Alternative)

```ini
# /etc/systemd/system/pranidoctor-backup.service
[Unit]
Description=Prani Doctor Backup Service
After=docker.service

[Service]
Type=oneshot
ExecStart=/opt/pranidoctor/scripts/backup-all.sh
User=root
StandardOutput=append:/opt/pranidoctor/logs/backup/systemd.log
StandardError=append:/opt/pranidoctor/logs/backup/systemd.log

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/pranidoctor-backup.timer
[Unit]
Description=Run Prani Doctor backup daily

[Timer]
OnCalendar=*-*-* 02:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

### 6.3 Offsite Sync Script

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/sync-offsite.sh

set -euo pipefail

S3_BUCKET="${S3_BUCKET:-pranidoctor-backups}"
BACKUP_DIR="/opt/pranidoctor/backups"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SYNC: $1"
}

# Sync PostgreSQL backups
log "Syncing PostgreSQL backups..."
aws s3 sync "$BACKUP_DIR/postgres/" "s3://${S3_BUCKET}/postgres/" \
    --exclude "hourly/*" \
    --storage-class STANDARD_IA

# Sync MinIO backups
log "Syncing MinIO backups..."
aws s3 sync "$BACKUP_DIR/minio/" "s3://${S3_BUCKET}/minio/" \
    --storage-class STANDARD_IA

# Sync config backups
log "Syncing config backups..."
aws s3 sync "$BACKUP_DIR/config/" "s3://${S3_BUCKET}/config/"

# Apply lifecycle policy for archiving
log "Offsite sync completed"
```

---

## 7. Retention Policy

### 7.1 Retention Matrix

| Backup Type | Local Retention | Offsite Retention | Archive |
|-------------|-----------------|-------------------|---------|
| Hourly | 24 hours | N/A | N/A |
| Daily | 7 days | 30 days | N/A |
| Weekly | 4 weeks | 12 weeks | N/A |
| Monthly | 12 months | 24 months | 7 years |

### 7.2 S3 Lifecycle Policy

```json
{
  "Rules": [
    {
      "ID": "PostgresBackupLifecycle",
      "Filter": {
        "Prefix": "postgres/"
      },
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 365
      }
    },
    {
      "ID": "MediaBackupLifecycle",
      "Filter": {
        "Prefix": "minio/"
      },
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "STANDARD_IA"
        },
        {
          "Days": 180,
          "StorageClass": "GLACIER"
        }
      ],
      "Expiration": {
        "Days": 730
      }
    },
    {
      "ID": "MonthlyArchive",
      "Filter": {
        "Prefix": "postgres/monthly/"
      },
      "Status": "Enabled",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 2555
      }
    }
  ]
}
```

### 7.3 Local Cleanup Script

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/cleanup-backups.sh

BACKUP_DIR="/opt/pranidoctor/backups"

# PostgreSQL
find "$BACKUP_DIR/postgres/hourly" -mtime +1 -delete
find "$BACKUP_DIR/postgres/daily" -mtime +7 -delete
find "$BACKUP_DIR/postgres/weekly" -mtime +28 -delete
find "$BACKUP_DIR/postgres/monthly" -mtime +365 -delete

# MinIO
find "$BACKUP_DIR/minio/daily" -mtime +7 -type d -exec rm -rf {} +
find "$BACKUP_DIR/minio/weekly" -mtime +28 -type d -exec rm -rf {} +

# Config
find "$BACKUP_DIR/config" -mtime +30 -delete

# Logs
find "$BACKUP_DIR/../logs" -name "*.log" -mtime +30 -delete
find "$BACKUP_DIR/../logs" -name "*.log.gz" -mtime +90 -delete

echo "Backup cleanup completed"
```

---

## 8. Restore Procedures

### 8.1 PostgreSQL Restore

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/restore-postgres.sh

set -euo pipefail

BACKUP_FILE=$1
DB_CONTAINER="pranidoctor-postgres"
DB_NAME="pranidoctor_db"
DB_USER="pranidoctor"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    echo "Available backups:"
    ls -la /opt/pranidoctor/backups/postgres/daily/
    exit 1
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] RESTORE: $1"
}

# Decrypt if needed
if [[ "$BACKUP_FILE" == *.enc ]]; then
    log "Decrypting backup..."
    DECRYPTED_FILE="${BACKUP_FILE%.enc}"
    openssl enc -aes-256-cbc -d -pbkdf2 \
        -in "$BACKUP_FILE" \
        -out "$DECRYPTED_FILE" \
        -pass "pass:$BACKUP_ENCRYPTION_KEY"
    BACKUP_FILE="$DECRYPTED_FILE"
fi

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    log "Decompressing backup..."
    gunzip -k "$BACKUP_FILE"
    BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

log "Stopping application..."
docker compose stop pranidoctor-web pranidoctor-web-2

log "Creating backup of current database..."
docker exec -t "$DB_CONTAINER" pg_dump \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -Fc > "/opt/pranidoctor/backups/postgres/pre_restore_$(date +%Y%m%d_%H%M%S).dump"

log "Dropping and recreating database..."
docker exec -t "$DB_CONTAINER" psql -U "$DB_USER" -c "DROP DATABASE IF EXISTS ${DB_NAME}_old;"
docker exec -t "$DB_CONTAINER" psql -U "$DB_USER" -c "ALTER DATABASE ${DB_NAME} RENAME TO ${DB_NAME}_old;"
docker exec -t "$DB_CONTAINER" psql -U "$DB_USER" -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"

log "Restoring from backup..."
if [[ "$BACKUP_FILE" == *.dump ]]; then
    docker exec -i "$DB_CONTAINER" pg_restore \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --no-owner \
        --no-privileges \
        < "$BACKUP_FILE"
else
    docker exec -i "$DB_CONTAINER" psql \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        < "$BACKUP_FILE"
fi

log "Starting application..."
docker compose start pranidoctor-web pranidoctor-web-2

log "Verifying restore..."
docker exec -t "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "SELECT count(*) FROM \"User\";"

log "Restore completed successfully"
log "Old database preserved as ${DB_NAME}_old. Drop when verified."
```

### 8.2 MinIO Restore

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/restore-minio.sh

set -euo pipefail

BACKUP_PATH=$1
MINIO_ALIAS="local"

if [ -z "$BACKUP_PATH" ]; then
    echo "Usage: $0 <backup_path>"
    echo "Available backups:"
    ls -la /opt/pranidoctor/backups/minio/daily/
    exit 1
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] RESTORE: $1"
}

log "Restoring MinIO from: $BACKUP_PATH"

# Extract backups
for TARBALL in "$BACKUP_PATH"/*.tar.gz; do
    BUCKET=$(basename "$TARBALL" .tar.gz)
    log "Restoring bucket: $BUCKET"
    
    # Extract
    tar -xzf "$TARBALL" -C /tmp/
    
    # Restore to MinIO
    docker exec pranidoctor-minio mc mirror \
        --overwrite \
        "/tmp/$BUCKET" \
        "$MINIO_ALIAS/$BUCKET"
    
    # Cleanup
    rm -rf "/tmp/$BUCKET"
done

log "MinIO restore completed"
```

### 8.3 Point-in-Time Recovery

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/pitr-restore.sh

TARGET_TIME=$1  # Format: "2026-05-21 10:30:00"
BASE_BACKUP=$2  # Path to base backup

if [ -z "$TARGET_TIME" ] || [ -z "$BASE_BACKUP" ]; then
    echo "Usage: $0 <target_time> <base_backup>"
    exit 1
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] PITR: $1"
}

# Stop PostgreSQL
docker compose stop postgres

# Extract base backup
log "Extracting base backup..."
tar -xzf "$BASE_BACKUP" -C /opt/pranidoctor/data/postgres/

# Create recovery configuration
cat > /opt/pranidoctor/data/postgres/recovery.conf << EOF
restore_command = 'gunzip < /opt/pranidoctor/backups/postgres/wal/%f.gz > %p'
recovery_target_time = '$TARGET_TIME'
recovery_target_action = 'promote'
EOF

# Start PostgreSQL
log "Starting PostgreSQL for recovery..."
docker compose start postgres

log "Recovery in progress. Monitor PostgreSQL logs."
log "Once recovered, remove recovery.conf and restart."
```

---

## 9. Disaster Recovery

### 9.1 Disaster Recovery Plan

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DISASTER RECOVERY PLAN                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  SCENARIO 1: Data Corruption                                                    │
│  ───────────────────────────                                                    │
│  1. Identify scope of corruption                                                │
│  2. Stop affected services                                                      │
│  3. Restore from latest clean backup                                            │
│  4. Replay WAL logs if available                                                │
│  5. Verify data integrity                                                       │
│  6. Resume services                                                             │
│  RTO: 1-2 hours | RPO: 1 hour                                                  │
│                                                                                  │
│  SCENARIO 2: VPS Failure                                                        │
│  ────────────────────────                                                       │
│  1. Provision new VPS                                                           │
│  2. Install dependencies (Docker, etc.)                                         │
│  3. Pull configuration from git                                                 │
│  4. Restore database from offsite backup                                        │
│  5. Restore media from offsite backup                                           │
│  6. Update DNS                                                                  │
│  7. Verify services                                                             │
│  RTO: 4-6 hours | RPO: 24 hours                                                │
│                                                                                  │
│  SCENARIO 3: Region Failure                                                     │
│  ─────────────────────────                                                      │
│  1. Provision VPS in alternative region                                         │
│  2. Same steps as VPS failure                                                   │
│  3. May require DNS propagation time                                            │
│  RTO: 8-12 hours | RPO: 24 hours                                               │
│                                                                                  │
│  SCENARIO 4: Ransomware/Security Breach                                         │
│  ────────────────────────────────────                                           │
│  1. Isolate affected systems                                                    │
│  2. Assess scope of breach                                                      │
│  3. Provision clean infrastructure                                              │
│  4. Restore from verified clean backup                                          │
│  5. Security audit before resuming                                              │
│  RTO: 24-48 hours | RPO: Depends on breach timeline                            │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 DR Runbook

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/disaster-recovery.sh

# DISASTER RECOVERY RUNBOOK
# Run this script on a new VPS to recover from disaster

set -e

echo "=========================================="
echo "PRANI DOCTOR DISASTER RECOVERY"
echo "=========================================="

# Prerequisites check
command -v docker >/dev/null 2>&1 || { echo "Docker required"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "AWS CLI required"; exit 1; }

# Configuration
S3_BUCKET="${S3_BUCKET:-pranidoctor-backups}"
INSTALL_DIR="/opt/pranidoctor"

# Create directory structure
echo "Creating directory structure..."
mkdir -p $INSTALL_DIR/{apps/web,data/{postgres,redis,minio},backups,logs,config,scripts}

# Download configuration from S3
echo "Downloading configuration..."
aws s3 sync "s3://${S3_BUCKET}/config/" "$INSTALL_DIR/backups/config/"

# Find latest backup
echo "Finding latest backups..."
LATEST_DB=$(aws s3 ls "s3://${S3_BUCKET}/postgres/daily/" | sort | tail -1 | awk '{print $4}')
LATEST_MEDIA=$(aws s3 ls "s3://${S3_BUCKET}/minio/daily/" | sort | tail -1 | awk '{print $4}')

echo "Latest DB backup: $LATEST_DB"
echo "Latest media backup: $LATEST_MEDIA"

# Download backups
echo "Downloading backups (this may take a while)..."
aws s3 cp "s3://${S3_BUCKET}/postgres/daily/${LATEST_DB}" "$INSTALL_DIR/backups/postgres/"
aws s3 sync "s3://${S3_BUCKET}/minio/daily/${LATEST_MEDIA}" "$INSTALL_DIR/backups/minio/restore/"

# Extract config
echo "Extracting configuration..."
tar -xzf "$INSTALL_DIR/backups/config/"*.tar.gz -C $INSTALL_DIR/

# Start infrastructure containers
echo "Starting infrastructure..."
cd $INSTALL_DIR/apps/web
docker compose up -d postgres redis minio caddy

echo "Waiting for services to be ready..."
sleep 30

# Restore database
echo "Restoring database..."
$INSTALL_DIR/scripts/restore-postgres.sh "$INSTALL_DIR/backups/postgres/${LATEST_DB}"

# Restore media
echo "Restoring media..."
$INSTALL_DIR/scripts/restore-minio.sh "$INSTALL_DIR/backups/minio/restore/"

# Start application
echo "Starting application..."
docker compose up -d pranidoctor-web pranidoctor-web-2

# Health check
echo "Running health checks..."
sleep 30
if curl -sf http://localhost/api/health; then
    echo "=========================================="
    echo "RECOVERY COMPLETED SUCCESSFULLY"
    echo "=========================================="
    echo "Next steps:"
    echo "1. Update DNS to point to this server"
    echo "2. Verify SSL certificates"
    echo "3. Test all critical functions"
    echo "4. Notify stakeholders"
else
    echo "=========================================="
    echo "RECOVERY FAILED - HEALTH CHECK FAILED"
    echo "=========================================="
    echo "Check logs: docker compose logs"
    exit 1
fi
```

---

## 10. Testing & Validation

### 10.1 Backup Verification Script

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/verify-backups.sh

set -euo pipefail

LOG_FILE="/opt/pranidoctor/logs/backup/verify.log"
ERRORS=0

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] VERIFY: $1" | tee -a "$LOG_FILE"
}

error() {
    log "ERROR: $1"
    ((ERRORS++))
}

# Verify PostgreSQL backups
log "Verifying PostgreSQL backups..."

# Check latest daily backup exists
LATEST_DAILY=$(ls -t /opt/pranidoctor/backups/postgres/daily/*.gz 2>/dev/null | head -1)
if [ -z "$LATEST_DAILY" ]; then
    error "No daily PostgreSQL backup found"
else
    # Verify integrity
    if gunzip -t "$LATEST_DAILY" 2>/dev/null; then
        log "Daily backup verified: $LATEST_DAILY"
    else
        error "Daily backup corrupted: $LATEST_DAILY"
    fi
fi

# Verify MinIO backups
log "Verifying MinIO backups..."
LATEST_MINIO=$(ls -td /opt/pranidoctor/backups/minio/daily/*/ 2>/dev/null | head -1)
if [ -z "$LATEST_MINIO" ]; then
    error "No daily MinIO backup found"
else
    # Check tarball integrity
    for TARBALL in "$LATEST_MINIO"/*.tar.gz; do
        if tar -tzf "$TARBALL" >/dev/null 2>&1; then
            log "Media backup verified: $TARBALL"
        else
            error "Media backup corrupted: $TARBALL"
        fi
    done
fi

# Verify offsite sync
log "Verifying offsite backups..."
if [ -n "${S3_BUCKET:-}" ]; then
    OFFSITE_COUNT=$(aws s3 ls "s3://${S3_BUCKET}/postgres/daily/" 2>/dev/null | wc -l)
    if [ "$OFFSITE_COUNT" -gt 0 ]; then
        log "Offsite backups found: $OFFSITE_COUNT files"
    else
        error "No offsite backups found"
    fi
fi

# Test restore (optional, on schedule)
if [ "${TEST_RESTORE:-false}" == "true" ]; then
    log "Testing restore procedure..."
    # Create test database and restore
    # This should be done on a separate instance
fi

# Summary
log "=========================================="
if [ $ERRORS -eq 0 ]; then
    log "All backup verifications passed"
    curl -s -X POST "${SLACK_WEBHOOK:-}" \
        -d '{"text":"✅ Backup verification passed"}' || true
else
    log "FAILED: $ERRORS verification errors"
    curl -s -X POST "${SLACK_WEBHOOK:-}" \
        -d "{\"text\":\"❌ Backup verification failed: $ERRORS errors\"}" || true
    exit 1
fi
```

### 10.2 Monthly DR Drill Checklist

```markdown
## Monthly Disaster Recovery Drill

### Preparation
- [ ] Schedule maintenance window
- [ ] Notify team members
- [ ] Prepare test environment

### Database Recovery Test
- [ ] Download latest backup from offsite
- [ ] Restore to test database
- [ ] Verify data integrity
- [ ] Run sample queries
- [ ] Compare record counts

### Media Recovery Test
- [ ] Download latest media backup
- [ ] Restore to test MinIO instance
- [ ] Verify file accessibility
- [ ] Compare file counts

### Full Recovery Test (Quarterly)
- [ ] Provision test VPS
- [ ] Run disaster recovery script
- [ ] Verify all services start
- [ ] Test user login
- [ ] Test service request flow
- [ ] Document time taken
- [ ] Cleanup test resources

### Documentation
- [ ] Update RTO/RPO metrics
- [ ] Note any issues found
- [ ] Update recovery scripts if needed
- [ ] File drill report
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
| Monitoring | `docs/devops/MONITORING.md` |

---

*End of BACKUP_STRATEGY.md*
