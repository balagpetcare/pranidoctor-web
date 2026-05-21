# CI/CD PIPELINE — Prani Doctor

**Version:** 1.0.0  
**Last Updated:** 2026-05-21  
**Scope:** GitHub Actions, deployment workflows, quality gates, release management

---

## Table of Contents

1. [CI/CD Philosophy](#1-cicd-philosophy)
2. [Pipeline Overview](#2-pipeline-overview)
3. [GitHub Actions Workflows](#3-github-actions-workflows)
4. [Quality Gates](#4-quality-gates)
5. [Build & Test Pipeline](#5-build--test-pipeline)
6. [Deployment Pipeline](#6-deployment-pipeline)
7. [Release Management](#7-release-management)
8. [Rollback Strategy](#8-rollback-strategy)
9. [Secret Management](#9-secret-management)
10. [Environment Promotion](#10-environment-promotion)

---

## 1. CI/CD Philosophy

### 1.1 Core Principles

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CI/CD PRINCIPLES                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. FAST FEEDBACK                                                               │
│     • CI completes in < 10 minutes                                              │
│     • Fail fast on obvious errors                                               │
│     • Parallel execution where possible                                         │
│                                                                                  │
│  2. QUALITY GATES                                                               │
│     • No deployment without passing checks                                      │
│     • Automated tests are mandatory                                             │
│     • Code review required for production                                       │
│                                                                                  │
│  3. AUTOMATION FIRST                                                            │
│     • Manual deployments are exceptions                                         │
│     • Reproducible builds                                                       │
│     • Self-documenting pipelines                                                │
│                                                                                  │
│  4. SECURITY INTEGRATED                                                         │
│     • Secrets never in code                                                     │
│     • Vulnerability scanning                                                    │
│     • Signed commits (recommended)                                              │
│                                                                                  │
│  5. ROLLBACK READY                                                              │
│     • Every deployment is reversible                                            │
│     • Version tracking                                                          │
│     • Database migration strategy                                               │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Pipeline Stages

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         CI/CD PIPELINE STAGES                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  COMMIT                                                                          │
│     │                                                                            │
│     ▼                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  CONTINUOUS INTEGRATION (CI)                                             │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │   │
│  │  │  Lint   │─▶│Typecheck│─▶│  Test   │─▶│  Build  │─▶│  Scan   │       │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │   │
│  │       │             │            │            │            │            │   │
│  │       └─────────────┴────────────┴────────────┴────────────┘            │   │
│  │                              PARALLEL                                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│     │                                                                            │
│     │ PR Merge (to main)                                                        │
│     ▼                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  CONTINUOUS DELIVERY (CD)                                                │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │   │
│  │  │  Build  │─▶│  Push   │─▶│ Deploy  │─▶│ Verify  │                    │   │
│  │  │  Image  │  │  Image  │  │ Staging │  │ Health  │                    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘                    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│     │                                                                            │
│     │ Manual Approval / Tag Release                                             │
│     ▼                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  PRODUCTION DEPLOYMENT                                                   │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │   │
│  │  │ Backup  │─▶│ Deploy  │─▶│ Migrate │─▶│ Verify  │─▶│ Notify  │      │   │
│  │  │   DB    │  │  Prod   │  │   DB    │  │ Health  │  │  Team   │      │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘      │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Pipeline Overview

### 2.1 Workflow Triggers

| Event | Workflow | Environment |
|-------|----------|-------------|
| Push to `feature/*` | CI | - |
| Pull Request to `main` | CI + Preview | Preview |
| Merge to `main` | CI + Deploy | Staging |
| Tag `v*.*.*` | CI + Release | Production |
| Manual dispatch | Deploy | Configurable |
| Schedule (daily) | Security Scan | - |

### 2.2 Branch Strategy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         BRANCH STRATEGY                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  feature/PD-123-user-auth ──┐                                                   │
│  feature/PD-124-dashboard ──┼──▶ Pull Request ──▶ main ──▶ Tag v1.0.0          │
│  fix/PD-125-login-bug ──────┘                        │                          │
│                                                       │                          │
│                                                       ▼                          │
│                                                   Staging                        │
│                                                       │                          │
│                                         Manual Trigger / Tag                     │
│                                                       │                          │
│                                                       ▼                          │
│                                                  Production                      │
│                                                                                  │
│  Hotfix Flow:                                                                   │
│  hotfix/critical-fix ──▶ PR to main ──▶ Fast-track to Production               │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Workflow Files Structure

```
.github/
├── workflows/
│   ├── ci.yml                # Continuous Integration
│   ├── deploy-staging.yml    # Staging deployment
│   ├── deploy-production.yml # Production deployment
│   ├── release.yml           # Release workflow
│   ├── security-scan.yml     # Security scanning
│   └── preview.yml           # PR preview environments
├── actions/
│   └── setup/
│       └── action.yml        # Reusable setup action
└── CODEOWNERS                # Code ownership
```

---

## 3. GitHub Actions Workflows

### 3.1 CI Workflow

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches:
      - main
      - 'feature/**'
      - 'fix/**'
  pull_request:
    branches:
      - main

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  # ============================================
  # Setup and Cache
  # ============================================
  setup:
    name: Setup
    runs-on: ubuntu-latest
    outputs:
      cache-hit: ${{ steps.cache.outputs.cache-hit }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT

      - name: Cache pnpm dependencies
        id: cache
        uses: actions/cache@v4
        with:
          path: ${{ steps.pnpm-cache.outputs.STORE_PATH }}
          key: pnpm-store-${{ runner.os }}-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            pnpm-store-${{ runner.os }}-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

  # ============================================
  # Lint
  # ============================================
  lint:
    name: Lint
    runs-on: ubuntu-latest
    needs: setup
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm run lint

      - name: Run Prettier check
        run: pnpm run format:check

  # ============================================
  # Type Check
  # ============================================
  typecheck:
    name: Type Check
    runs-on: ubuntu-latest
    needs: setup
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm prisma generate

      - name: Run TypeScript check
        run: pnpm run typecheck

  # ============================================
  # Prisma Validate
  # ============================================
  prisma:
    name: Prisma Validate
    runs-on: ubuntu-latest
    needs: setup
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Validate Prisma schema
        run: pnpm prisma validate

      - name: Check for pending migrations
        run: |
          # This would check if schema changes require new migration
          # pnpm prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma --exit-code
          echo "Migration check placeholder"

  # ============================================
  # Test
  # ============================================
  test:
    name: Test
    runs-on: ubuntu-latest
    needs: setup
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    env:
      DATABASE_URL: postgresql://test:test@localhost:5432/test_db
      REDIS_URL: redis://localhost:6379
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm prisma generate

      - name: Run database migrations
        run: pnpm prisma db push

      - name: Run tests
        run: pnpm run test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          fail_ci_if_error: false

  # ============================================
  # Build
  # ============================================
  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint, typecheck, prisma]
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: pnpm prisma generate

      - name: Build application
        run: pnpm run build
        env:
          NEXT_TELEMETRY_DISABLED: 1

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: |
            .next/
            !.next/cache
          retention-days: 7

  # ============================================
  # Security Scan
  # ============================================
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    needs: setup
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=high
        continue-on-error: true

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'
          exit-code: '0'  # Don't fail on vulnerabilities for now

  # ============================================
  # Build Docker Image (on main branch)
  # ============================================
  docker:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [build, test]
    if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/v')
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=sha,prefix=sha-

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            NEXT_PUBLIC_APP_VERSION=${{ github.sha }}
```

### 3.2 Deploy Staging Workflow

```yaml
# .github/workflows/deploy-staging.yml

name: Deploy to Staging

on:
  push:
    branches:
      - main
  workflow_dispatch:

concurrency:
  group: deploy-staging
  cancel-in-progress: false

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  deploy:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.pranidoctor.com
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Get short SHA
        id: sha
        run: echo "short=$(git rev-parse --short HEAD)" >> $GITHUB_OUTPUT

      - name: Deploy to staging server
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/pranidoctor/apps/web
            
            # Pull latest image
            docker pull ghcr.io/${{ github.repository }}:sha-${{ steps.sha.outputs.short }}
            
            # Update .env with new version
            echo "APP_VERSION=sha-${{ steps.sha.outputs.short }}" >> .env.staging
            
            # Deploy with zero downtime
            docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d --no-deps pranidoctor-web
            
            # Run migrations
            docker compose -f docker-compose.yml -f docker-compose.staging.yml exec -T pranidoctor-web npx prisma migrate deploy
            
            # Health check
            sleep 30
            curl -f https://staging.pranidoctor.com/api/health || exit 1
            
            # Cleanup
            docker image prune -f

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v1.25.0
        with:
          payload: |
            {
              "text": "⚠️ Staging deployment failed!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Staging Deployment Failed*\n\nCommit: `${{ steps.sha.outputs.short }}`\nWorkflow: <${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Run>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

      - name: Notify success
        if: success()
        uses: slackapi/slack-github-action@v1.25.0
        with:
          payload: |
            {
              "text": "✅ Staging deployment successful!",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Staging Deployed*\n\nVersion: `${{ steps.sha.outputs.short }}`\nURL: https://staging.pranidoctor.com"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 3.3 Deploy Production Workflow

```yaml
# .github/workflows/deploy-production.yml

name: Deploy to Production

on:
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to deploy (e.g., v1.2.3 or sha-abc1234)'
        required: true
        type: string

concurrency:
  group: deploy-production
  cancel-in-progress: false

jobs:
  # ============================================
  # Pre-deployment Checks
  # ============================================
  pre-deploy:
    name: Pre-deployment Checks
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
    steps:
      - name: Determine version
        id: version
        run: |
          if [ "${{ github.event_name }}" == "push" ]; then
            echo "version=${{ github.ref_name }}" >> $GITHUB_OUTPUT
          else
            echo "version=${{ github.event.inputs.version }}" >> $GITHUB_OUTPUT
          fi

      - name: Verify image exists
        run: |
          docker pull ghcr.io/${{ github.repository }}:${{ steps.version.outputs.version }}

  # ============================================
  # Backup Database
  # ============================================
  backup:
    name: Backup Database
    runs-on: ubuntu-latest
    needs: pre-deploy
    steps:
      - name: Create database backup
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            /opt/pranidoctor/scripts/backup-db.sh pre-deploy-${{ needs.pre-deploy.outputs.version }}

  # ============================================
  # Deploy
  # ============================================
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [pre-deploy, backup]
    environment:
      name: production
      url: https://pranidoctor.com
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            set -e
            cd /opt/pranidoctor/apps/web
            
            # Record current version for rollback
            docker compose ps --format json | jq -r '.[0].Image' >> /opt/pranidoctor/deployment-history.txt
            
            # Pull new image
            docker pull ghcr.io/${{ github.repository }}:${{ needs.pre-deploy.outputs.version }}
            
            # Update version in environment
            sed -i "s/APP_VERSION=.*/APP_VERSION=${{ needs.pre-deploy.outputs.version }}/" .env.production
            
            # Run database migrations
            docker compose -f docker-compose.yml -f docker-compose.prod.yml run --rm pranidoctor-web npx prisma migrate deploy
            
            # Rolling deployment
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps --scale pranidoctor-web=2 pranidoctor-web
            
            # Wait for new containers
            sleep 30
            
            # Health check
            for i in {1..5}; do
              if curl -sf https://pranidoctor.com/api/health; then
                echo "Health check passed"
                break
              fi
              if [ $i -eq 5 ]; then
                echo "Health check failed after 5 attempts"
                exit 1
              fi
              sleep 10
            done
            
            # Remove old containers
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps pranidoctor-web pranidoctor-web-2
            
            # Cleanup
            docker image prune -f
            
            echo "Deployment complete: ${{ needs.pre-deploy.outputs.version }}"

      - name: Create GitHub Release
        if: startsWith(github.ref, 'refs/tags/v')
        uses: softprops/action-gh-release@v1
        with:
          tag_name: ${{ needs.pre-deploy.outputs.version }}
          generate_release_notes: true

  # ============================================
  # Post-deployment
  # ============================================
  post-deploy:
    name: Post-deployment
    runs-on: ubuntu-latest
    needs: [pre-deploy, deploy]
    if: always()
    steps:
      - name: Notify team
        uses: slackapi/slack-github-action@v1.25.0
        with:
          payload: |
            {
              "text": "${{ needs.deploy.result == 'success' && '✅ Production deployment successful!' || '❌ Production deployment failed!' }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Production Deployment ${{ needs.deploy.result == 'success' && 'Complete' || 'Failed' }}*\n\nVersion: `${{ needs.pre-deploy.outputs.version }}`\nStatus: ${{ needs.deploy.result }}\nURL: https://pranidoctor.com"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

  # ============================================
  # Rollback (on failure)
  # ============================================
  rollback:
    name: Rollback
    runs-on: ubuntu-latest
    needs: [deploy]
    if: failure()
    steps:
      - name: Rollback deployment
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            /opt/pranidoctor/scripts/rollback.sh

      - name: Notify rollback
        uses: slackapi/slack-github-action@v1.25.0
        with:
          payload: |
            {
              "text": "🔄 Production rolled back due to deployment failure"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 3.4 Security Scan Workflow

```yaml
# .github/workflows/security-scan.yml

name: Security Scan

on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:

jobs:
  scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner (filesystem)
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Run Trivy on Docker image
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'ghcr.io/${{ github.repository }}:main'
          format: 'table'
          severity: 'CRITICAL,HIGH'
          exit-code: '0'

      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          extra_args: --only-verified
```

---

## 4. Quality Gates

### 4.1 Required Checks

```yaml
# Branch protection rules (configure in GitHub settings)
branch_protection:
  main:
    required_status_checks:
      strict: true
      contexts:
        - lint
        - typecheck
        - test
        - build
        - prisma
    required_pull_request_reviews:
      required_approving_review_count: 1
      dismiss_stale_reviews: true
      require_code_owner_reviews: true
    restrictions:
      users: []
      teams: ["maintainers"]
    enforce_admins: true
```

### 4.2 Quality Metrics

| Metric | Threshold | Action on Fail |
|--------|-----------|----------------|
| Lint errors | 0 | Block merge |
| Type errors | 0 | Block merge |
| Test coverage | > 70% | Warning |
| Test pass | 100% | Block merge |
| Build success | Required | Block merge |
| Security (Critical) | 0 | Warning |
| Security (High) | < 5 | Warning |

### 4.3 Code Coverage

```yaml
# codecov.yml
coverage:
  status:
    project:
      default:
        target: 70%
        threshold: 2%
    patch:
      default:
        target: 80%
        threshold: 5%

parsers:
  gcov:
    branch_detection:
      conditional: yes
      loop: yes
      method: no
      macro: no

comment:
  layout: "reach,diff,flags,files"
  behavior: default
  require_changes: true
```

---

## 5. Build & Test Pipeline

### 5.1 Build Optimization

```yaml
# Caching strategies
caching:
  node_modules:
    key: "pnpm-${{ hashFiles('pnpm-lock.yaml') }}"
    paths:
      - ~/.pnpm-store
  
  next_build:
    key: "nextjs-${{ hashFiles('**/*.tsx', '**/*.ts') }}"
    paths:
      - .next/cache
  
  prisma:
    key: "prisma-${{ hashFiles('prisma/schema.prisma') }}"
    paths:
      - node_modules/.prisma
```

### 5.2 Test Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
};
```

---

## 6. Deployment Pipeline

### 6.1 Deployment Steps

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DEPLOYMENT PROCESS                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. PRE-DEPLOYMENT                                                              │
│     ├── Verify image exists in registry                                         │
│     ├── Create database backup                                                  │
│     ├── Notify team of pending deployment                                       │
│     └── Check environment health                                                │
│                                                                                  │
│  2. DEPLOYMENT                                                                  │
│     ├── Pull new image                                                          │
│     ├── Run database migrations                                                 │
│     ├── Start new containers                                                    │
│     ├── Health check new containers                                             │
│     └── Route traffic to new containers                                         │
│                                                                                  │
│  3. POST-DEPLOYMENT                                                             │
│     ├── Remove old containers                                                   │
│     ├── Clean up old images                                                     │
│     ├── Verify application health                                               │
│     ├── Update deployment history                                               │
│     └── Notify team of completion                                               │
│                                                                                  │
│  4. ROLLBACK (if needed)                                                        │
│     ├── Identify previous version                                               │
│     ├── Deploy previous image                                                   │
│     ├── Rollback database (if possible)                                         │
│     └── Notify team of rollback                                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Server Deployment Script

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/deploy.sh

set -e

VERSION=${1:-latest}
COMPOSE_FILE="docker-compose.yml"
COMPOSE_PROD_FILE="docker-compose.prod.yml"
HEALTH_URL="https://pranidoctor.com/api/health"
MAX_RETRIES=5
RETRY_DELAY=10

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    log "ERROR: $1"
    exit 1
}

health_check() {
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -sf "$HEALTH_URL" > /dev/null; then
            log "Health check passed"
            return 0
        fi
        log "Health check attempt $i failed, retrying in ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
    done
    return 1
}

main() {
    log "Starting deployment of version: $VERSION"
    
    # Record current version for rollback
    log "Recording current version for rollback..."
    docker compose ps --format '{{.Image}}' | head -1 >> /opt/pranidoctor/deployment-history.txt
    
    # Pull new image
    log "Pulling new image..."
    docker pull "ghcr.io/pranidoctor/web:$VERSION" || error "Failed to pull image"
    
    # Run database migrations
    log "Running database migrations..."
    docker compose -f $COMPOSE_FILE -f $COMPOSE_PROD_FILE run --rm \
        pranidoctor-web npx prisma migrate deploy || error "Migration failed"
    
    # Deploy new containers
    log "Deploying new containers..."
    APP_VERSION=$VERSION docker compose -f $COMPOSE_FILE -f $COMPOSE_PROD_FILE up -d --no-deps \
        pranidoctor-web pranidoctor-web-2
    
    # Wait for containers to be ready
    log "Waiting for containers to start..."
    sleep 30
    
    # Health check
    log "Running health checks..."
    if ! health_check; then
        log "Health check failed, initiating rollback..."
        /opt/pranidoctor/scripts/rollback.sh
        error "Deployment failed, rolled back to previous version"
    fi
    
    # Cleanup
    log "Cleaning up old images..."
    docker image prune -f
    
    log "Deployment completed successfully!"
}

main "$@"
```

---

## 7. Release Management

### 7.1 Versioning Strategy

```
SEMANTIC VERSIONING: MAJOR.MINOR.PATCH

MAJOR: Breaking changes
  - API contract changes
  - Database schema breaking changes
  - Removed features

MINOR: New features
  - New endpoints
  - New features
  - Non-breaking schema changes

PATCH: Bug fixes
  - Bug fixes
  - Security patches
  - Performance improvements
```

### 7.2 Release Process

```bash
#!/bin/bash
# scripts/release.sh

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Usage: ./release.sh <version>"
    exit 1
fi

# Validate version format
if ! [[ $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Invalid version format. Use: v1.2.3"
    exit 1
fi

# Update version in package.json
npm version $VERSION --no-git-tag-version

# Create commit
git add package.json
git commit -m "chore: release $VERSION"

# Create tag
git tag -a $VERSION -m "Release $VERSION"

# Push
git push origin main
git push origin $VERSION

echo "Release $VERSION created and pushed"
echo "GitHub Actions will handle the deployment"
```

### 7.3 Changelog Generation

```yaml
# .github/release.yml
changelog:
  categories:
    - title: 🚀 Features
      labels:
        - enhancement
        - feature
    - title: 🐛 Bug Fixes
      labels:
        - bug
        - fix
    - title: 🔒 Security
      labels:
        - security
    - title: 📚 Documentation
      labels:
        - documentation
    - title: 🏗️ Maintenance
      labels:
        - chore
        - maintenance
```

---

## 8. Rollback Strategy

### 8.1 Rollback Types

| Type | Trigger | Process | Time |
|------|---------|---------|------|
| Automatic | Health check fail | Previous container | ~2 min |
| Manual | Manual trigger | Previous version | ~5 min |
| Database | Migration fail | Restore backup | ~15 min |

### 8.2 Rollback Script

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/rollback.sh

set -e

HISTORY_FILE="/opt/pranidoctor/deployment-history.txt"
COMPOSE_FILE="docker-compose.yml"
COMPOSE_PROD_FILE="docker-compose.prod.yml"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ROLLBACK: $1"
}

# Get previous version
PREVIOUS_VERSION=$(tail -2 "$HISTORY_FILE" | head -1)

if [ -z "$PREVIOUS_VERSION" ]; then
    log "No previous version found in deployment history!"
    exit 1
fi

log "Rolling back to: $PREVIOUS_VERSION"

# Deploy previous version
docker compose -f $COMPOSE_FILE -f $COMPOSE_PROD_FILE up -d --no-deps \
    pranidoctor-web pranidoctor-web-2

# Wait and verify
sleep 30

if curl -sf "https://pranidoctor.com/api/health" > /dev/null; then
    log "Rollback successful"
    
    # Record rollback
    echo "ROLLBACK: $(date) - $PREVIOUS_VERSION" >> /opt/pranidoctor/rollback-history.txt
    
    # Notify team
    curl -X POST "$SLACK_WEBHOOK" -d "{\"text\": \"⚠️ Production rolled back to $PREVIOUS_VERSION\"}"
else
    log "Rollback health check failed! Manual intervention required."
    exit 1
fi
```

### 8.3 Database Rollback

```bash
#!/bin/bash
# /opt/pranidoctor/scripts/rollback-db.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    # Use latest backup
    BACKUP_FILE=$(ls -t /opt/pranidoctor/backups/postgres/daily/*.sql.gz | head -1)
fi

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] DB ROLLBACK: $1"
}

log "Rolling back database from: $BACKUP_FILE"

# Stop application
docker compose stop pranidoctor-web pranidoctor-web-2

# Restore database
gunzip -c "$BACKUP_FILE" | docker compose exec -T postgres psql -U pranidoctor -d pranidoctor_db

# Restart application
docker compose start pranidoctor-web pranidoctor-web-2

log "Database rollback complete"
```

---

## 9. Secret Management

### 9.1 GitHub Secrets

| Secret | Description | Environments |
|--------|-------------|--------------|
| `STAGING_HOST` | Staging server IP | staging |
| `STAGING_USER` | SSH user | staging |
| `STAGING_SSH_KEY` | SSH private key | staging |
| `PRODUCTION_HOST` | Production server IP | production |
| `PRODUCTION_USER` | SSH user | production |
| `PRODUCTION_SSH_KEY` | SSH private key | production |
| `SLACK_WEBHOOK` | Notification webhook | all |
| `CODECOV_TOKEN` | Coverage reporting | all |

### 9.2 Environment Secrets

```yaml
# GitHub environment secrets configuration
environments:
  staging:
    secrets:
      - DATABASE_URL
      - REDIS_URL
      - ADMIN_JWT_SECRET
      - MOBILE_JWT_SECRET
      - OPENAI_API_KEY
    protection_rules:
      - wait_timer: 0
  
  production:
    secrets:
      - DATABASE_URL
      - REDIS_URL
      - ADMIN_JWT_SECRET
      - MOBILE_JWT_SECRET
      - OPENAI_API_KEY
    protection_rules:
      - required_reviewers: ["team-lead"]
      - wait_timer: 5  # 5 minute wait
```

### 9.3 Secret Rotation

```bash
#!/bin/bash
# scripts/rotate-secrets.sh

# Generate new secrets
NEW_ADMIN_JWT=$(openssl rand -base64 32)
NEW_MOBILE_JWT=$(openssl rand -base64 32)

# Update GitHub secrets via CLI
gh secret set ADMIN_JWT_SECRET --body "$NEW_ADMIN_JWT" --env production
gh secret set MOBILE_JWT_SECRET --body "$NEW_MOBILE_JWT" --env production

# Update server environment
ssh $PRODUCTION_HOST << EOF
    sed -i "s/ADMIN_JWT_SECRET=.*/ADMIN_JWT_SECRET=$NEW_ADMIN_JWT/" /opt/pranidoctor/apps/web/.env.production
    sed -i "s/MOBILE_JWT_SECRET=.*/MOBILE_JWT_SECRET=$NEW_MOBILE_JWT/" /opt/pranidoctor/apps/web/.env.production
    
    # Restart application to pick up new secrets
    cd /opt/pranidoctor/apps/web
    docker compose restart pranidoctor-web pranidoctor-web-2
EOF

echo "Secrets rotated successfully"
```

---

## 10. Environment Promotion

### 10.1 Promotion Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         ENVIRONMENT PROMOTION                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Development (Local)                                                           │
│        │                                                                         │
│        │ Push to feature branch                                                 │
│        ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  CI Pipeline                                                             │   │
│   │  • Lint, Test, Build                                                    │   │
│   │  • Create preview if PR                                                 │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                         │
│        │ Merge to main                                                          │
│        ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  Staging Environment                                                     │   │
│   │  • Auto-deploy from main                                                │   │
│   │  • Integration testing                                                  │   │
│   │  • QA verification                                                      │   │
│   │  • Performance testing                                                  │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│        │                                                                         │
│        │ Tag release (v*.*.*)                                                   │
│        │ OR Manual approval                                                     │
│        ▼                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │  Production Environment                                                  │   │
│   │  • Database backup                                                      │   │
│   │  • Rolling deployment                                                   │   │
│   │  • Health verification                                                  │   │
│   │  • Monitoring activation                                                │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Promotion Checklist

```markdown
## Staging to Production Promotion

### Pre-Promotion
- [ ] All staging tests passed
- [ ] No critical bugs in staging
- [ ] Performance benchmarks met
- [ ] Security scan clean
- [ ] Product owner approval

### Promotion
- [ ] Create version tag
- [ ] Trigger production workflow
- [ ] Monitor deployment
- [ ] Verify health checks

### Post-Promotion
- [ ] Verify key user flows
- [ ] Check error rates
- [ ] Monitor performance
- [ ] Notify stakeholders
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
| Backup Strategy | `docs/devops/BACKUP_STRATEGY.md` |
| Monitoring | `docs/devops/MONITORING.md` |

---

*End of CICD_PIPELINE.md*
