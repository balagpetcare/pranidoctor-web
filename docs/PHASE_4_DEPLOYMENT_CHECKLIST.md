# Phase 4: Livestock Feed Ecosystem - Production Deployment Checklist

**Version:** 1.0  
**Date:** 2026-05-28  
**Status:** Ready for Deployment

---

## Pre-Deployment Checklist

### 1. Database Preparation

- [ ] **Backup Current Database**
  ```bash
  pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **Run Prisma Migrations**
  ```bash
  npx prisma migrate deploy
  ```

- [ ] **Verify Migration Success**
  ```bash
  npx prisma migrate status
  ```

- [ ] **Generate Prisma Client**
  ```bash
  npx prisma generate
  ```

### 2. Environment Configuration

- [ ] **Verify Environment Variables**
  - DATABASE_URL
  - NEXTAUTH_SECRET
  - NEXTAUTH_URL
  - JWT_SECRET
  - API_SECRET_KEY
  - REDIS_URL (if using caching)
  - S3_BUCKET (if using file storage)
  - SENTRY_DSN (if using error tracking)

- [ ] **Update Production Secrets**
  ```bash
  # Generate new secrets if needed
  openssl rand -base64 32
  ```

- [ ] **Configure CORS Origins**
  - Mobile app domains
  - Admin panel domain
  - API domains

### 3. Data Seeding

- [ ] **Seed Feed Categories**
  ```bash
  npx ts-node scripts/seed-feed-categories.ts
  ```

- [ ] **Seed Feed Items (Bangladesh-specific)**
  ```bash
  npx ts-node scripts/seed-feed-items.ts
  ```

- [ ] **Verify Seed Data**
  ```sql
  SELECT COUNT(*) FROM feed_category;
  SELECT COUNT(*) FROM feed_item;
  ```

### 4. Build & Test

- [ ] **Install Dependencies**
  ```bash
  npm ci
  ```

- [ ] **Type Check**
  ```bash
  npx tsc --noEmit
  ```

- [ ] **Lint Check**
  ```bash
  npm run lint
  ```

- [ ] **Build Application**
  ```bash
  npm run build
  ```

- [ ] **Verify Build Output**
  - Check `.next` directory exists
  - Verify no build errors
  - Check bundle size

---

## Deployment Steps

### 1. Staging Deployment

- [ ] **Deploy to Staging**
  ```bash
  # Vercel
  vercel --target=staging
  
  # Or custom server
  npm run deploy:staging
  ```

- [ ] **Run Smoke Tests**
  ```bash
  npm run test:smoke
  ```

- [ ] **API Health Check**
  ```bash
  curl https://staging-api.pranidoctor.com/api/health
  ```

- [ ] **Verify Database Connectivity**
  ```bash
  npx prisma db pull --force
  ```

### 2. Production Deployment

- [ ] **Deploy to Production**
  ```bash
  # Vercel
  vercel --target=production
  
  # Or custom server
  npm run deploy:production
  ```

- [ ] **Verify Deployment Success**
  - Check Vercel dashboard
  - Verify build logs
  - Confirm no errors

- [ ] **Update DNS (if needed)**
  - Point domain to new deployment
  - Verify SSL certificates

---

## Post-Deployment Verification

### 1. Health Checks

- [ ] **API Health Endpoint**
  ```bash
  curl https://api.pranidoctor.com/api/health
  ```

- [ ] **Database Connection**
  ```sql
  SELECT NOW();
  ```

- [ ] **Redis Connection (if applicable)**
  ```bash
  redis-cli ping
  ```

### 2. Functional Testing

- [ ] **Admin Panel Access**
  - Login with admin credentials
  - Navigate to Feed Items
  - Verify list loads
  - Test search/filter

- [ ] **Mobile API Access**
  - Test livestock list endpoint
  - Test feed inventory endpoint
  - Verify authentication

- [ ] **Analytics Dashboard**
  - Load analytics page
  - Verify charts render
  - Check data accuracy

### 3. Performance Verification

- [ ] **Response Time Check**
  ```bash
  # API response time
  curl -w "@curl-format.txt" https://api.pranidoctor.com/api/mobile/livestock
  ```

- [ ] **Database Query Performance**
  ```sql
  -- Check slow queries
  SELECT query, mean_exec_time 
  FROM pg_stat_statements 
  ORDER BY mean_exec_time DESC 
  LIMIT 10;
  ```

- [ ] **Bundle Size Check**
  - Admin panel: < 500KB initial
  - API routes: < 100KB each

### 4. Security Verification

- [ ] **SSL Certificate**
  ```bash
  openssl s_client -connect api.pranidoctor.com:443 -servername api.pranidoctor.com
  ```

- [ ] **Security Headers**
  ```bash
  curl -I https://api.pranidoctor.com/api/health
  ```
  Verify:
  - X-Frame-Options
  - X-Content-Type-Options
  - Strict-Transport-Security

- [ ] **CORS Configuration**
  ```bash
  curl -H "Origin: https://admin.pranidoctor.com" \
       -I https://api.pranidoctor.com/api/admin/feed-items
  ```

---

## Monitoring Setup

### 1. Error Tracking

- [ ] **Sentry Configuration**
  - Verify DSN is set
  - Test error capture
  - Configure alerts

- [ ] **Log Aggregation**
  - Configure log shipping
  - Set up log alerts
  - Verify log retention

### 2. Performance Monitoring

- [ ] **APM Setup**
  - Configure DataDog/New Relic
  - Set up dashboards
  - Configure alerts

- [ ] **Database Monitoring**
  - Enable pg_stat_statements
  - Set up slow query alerts
  - Monitor connection pool

### 3. Uptime Monitoring

- [ ] **Pingdom/UptimeRobot**
  - Add health check endpoint
  - Configure alert contacts
  - Set check interval (1 min)

---

## Rollback Plan

### 1. Database Rollback

```bash
# If migration fails
npx prisma migrate resolve --rolled-back "migration_name"

# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

### 2. Application Rollback

```bash
# Vercel
vercel --target=production --rollback

# Or redeploy previous version
vercel --target=production --version=PREVIOUS_VERSION
```

### 3. DNS Rollback

- Revert DNS changes
- Clear CDN cache
- Verify traffic routing

---

## Post-Deployment Tasks

### 1. Documentation

- [ ] **Update API Documentation**
  - Add new endpoints
  - Update request/response examples
  - Document error codes

- [ ] **Update Admin Guide**
  - Feed management procedures
  - Analytics interpretation
  - Troubleshooting guide

### 2. Team Notification

- [ ] **Notify Stakeholders**
  - Product team
  - QA team
  - Customer support

- [ ] **Update Status Page**
  - Mark deployment complete
  - Update feature availability

### 3. Customer Communication

- [ ] **In-App Announcement**
  - New feed features
  - Livestock management

- [ ] **Release Notes**
  - Phase 4 features
  - Bug fixes
  - Performance improvements

---

## Verification Checklist Summary

| Category | Items | Completed |
|----------|-------|-----------|
| Database | 4 | [ ] |
| Environment | 3 | [ ] |
| Data Seeding | 3 | [ ] |
| Build & Test | 4 | [ ] |
| Staging | 4 | [ ] |
| Production | 3 | [ ] |
| Health Checks | 3 | [ ] |
| Functional Testing | 3 | [ ] |
| Performance | 3 | [ ] |
| Security | 3 | [ ] |
| Monitoring | 6 | [ ] |
| Documentation | 2 | [ ] |
| Communication | 3 | [ ] |

**Total Items:** 41

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Tech Lead | | | |
| QA Lead | | | |
| Product Manager | | | |
| DevOps | | | |

---

**Deployment Status:** ⬜ Ready | ⬜ In Progress | ⬜ Complete  
**Rollback Required:** ⬜ Yes | ⬜ No  
**Issues Found:** _______________
