# AUTHENTICATION FLOW — Prani Doctor

**Version:** 1.1.0  
**Last Updated:** 2026-05-21  
**Scope:** JWT authentication, OTP flow, token refresh, session management

---

## Table of Contents

1. [Authentication Overview](#1-authentication-overview)
2. [JWT Strategy](#2-jwt-strategy)
3. [Mobile OTP Flow](#3-mobile-otp-flow)
4. [Admin Login Flow](#4-admin-login-flow)
5. [Token Refresh Strategy](#5-token-refresh-strategy)
6. [Role Authorization](#6-role-authorization)
7. [Permission Middleware](#7-permission-middleware)
8. [Session Management](#8-session-management)
9. [Security Considerations](#9-security-considerations)
10. [Implementation Guide](#10-implementation-guide)

---

## 1. Authentication Overview

### 1.1 Authentication Methods

| Context | Method | Token Storage | Lifetime |
|---------|--------|---------------|----------|
| Mobile Customer | Phone + OTP | Authorization header | 7 days |
| Mobile Doctor | Phone + OTP | Authorization header | 7 days |
| Mobile Technician | Phone + OTP | Authorization header | 7 days |
| Admin Panel | Email + Password | HttpOnly Cookie | 24 hours |
| API Integration | API Key | Authorization header | Until revoked |

### 1.2 Authentication Flow Overview

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION ARCHITECTURE                                 │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   MOBILE APP                           ADMIN PANEL                            │
│   ──────────                           ───────────                            │
│                                                                                │
│   ┌─────────────────┐                  ┌─────────────────┐                   │
│   │   Phone + OTP   │                  │ Email + Password│                   │
│   └────────┬────────┘                  └────────┬────────┘                   │
│            │                                    │                             │
│            ▼                                    ▼                             │
│   ┌─────────────────┐                  ┌─────────────────┐                   │
│   │ POST /auth/otp/ │                  │POST /admin/auth/│                   │
│   │     request     │                  │     login       │                   │
│   └────────┬────────┘                  └────────┬────────┘                   │
│            │                                    │                             │
│            ▼                                    ▼                             │
│   ┌─────────────────┐                  ┌─────────────────┐                   │
│   │ SMS OTP Code    │                  │ Validate creds  │                   │
│   │ (6 digits)      │                  │ (bcrypt verify) │                   │
│   └────────┬────────┘                  └────────┬────────┘                   │
│            │                                    │                             │
│            ▼                                    ▼                             │
│   ┌─────────────────┐                  ┌─────────────────┐                   │
│   │ POST /auth/otp/ │                  │ Set HttpOnly    │                   │
│   │     verify      │                  │ Cookie          │                   │
│   └────────┬────────┘                  └────────┬────────┘                   │
│            │                                    │                             │
│            ▼                                    ▼                             │
│   ┌─────────────────┐                  ┌─────────────────┐                   │
│   │ Issue JWT       │                  │ Issue JWT       │                   │
│   │ Access + Refresh│                  │ (in cookie)     │                   │
│   └────────┬────────┘                  └────────┬────────┘                   │
│            │                                    │                             │
│            ▼                                    ▼                             │
│   ┌─────────────────────────────────────────────────────────┐               │
│   │                    PROTECTED RESOURCES                   │               │
│   │                                                          │               │
│   │  Authorization: Bearer <token>   Cookie: admin-token=x  │               │
│   └──────────────────────────────────────────────────────────┘               │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. JWT Strategy

### 2.1 Token Structure

#### Access Token Payload (Mobile)

```typescript
interface MobileJwtPayload {
  // Standard claims
  sub: string;          // User ID
  iat: number;          // Issued at (Unix timestamp)
  exp: number;          // Expiration (Unix timestamp)
  jti: string;          // JWT ID (unique identifier)
  
  // Custom claims
  role: UserRole;       // CUSTOMER | DOCTOR | AI_TECHNICIAN
  phone: string;        // Normalized phone number
  profileId: string;    // Profile record ID
  profileType: string;  // CustomerProfile | DoctorProfile | AiTechnicianProfile
  
  // Provider-specific (optional)
  providerStatus?: ProviderStatus;  // ACTIVE | SUSPENDED | PENDING
}
```

#### Access Token Payload (Admin)

```typescript
interface AdminJwtPayload {
  // Standard claims
  sub: string;          // User ID
  iat: number;          // Issued at
  exp: number;          // Expiration
  jti: string;          // JWT ID
  
  // Custom claims
  role: UserRole;       // SUPER_ADMIN | ADMIN | SUPPORT
  email: string;        // Admin email
  
  // Session info
  sessionId: string;    // For session invalidation
}
```

### 2.2 Token Configuration

| Setting | Mobile Access | Mobile Refresh | Admin |
|---------|---------------|----------------|-------|
| Algorithm | HS256 | HS256 | HS256 |
| Secret | `MOBILE_JWT_SECRET` | `MOBILE_REFRESH_SECRET` | `ADMIN_JWT_SECRET` |
| Lifetime | 7 days | 30 days | 24 hours |
| Min Secret | 32 chars | 32 chars | 32 chars |

### 2.3 Token Generation

```typescript
import jwt from 'jsonwebtoken';

// Mobile access token
function generateMobileAccessToken(user: User, profile: Profile): string {
  const payload: MobileJwtPayload = {
    sub: user.id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    jti: generateUUID(),
    role: user.role,
    phone: user.phone!,
    profileId: profile.id,
    profileType: getProfileType(user.role),
    ...(profile.providerStatus && { providerStatus: profile.providerStatus }),
  };
  
  return jwt.sign(payload, process.env.MOBILE_JWT_SECRET!);
}

// Mobile refresh token
function generateMobileRefreshToken(user: User): string {
  const payload = {
    sub: user.id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    jti: generateUUID(),
    type: 'refresh',
  };
  
  return jwt.sign(payload, process.env.MOBILE_REFRESH_SECRET!);
}

// Admin token
function generateAdminToken(user: User, sessionId: string): string {
  const payload: AdminJwtPayload = {
    sub: user.id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    jti: generateUUID(),
    role: user.role,
    email: user.email,
    sessionId,
  };
  
  return jwt.sign(payload, process.env.ADMIN_JWT_SECRET!);
}
```

### 2.4 Token Verification

```typescript
function verifyMobileToken(token: string): MobileJwtPayload | null {
  try {
    const payload = jwt.verify(token, process.env.MOBILE_JWT_SECRET!) as MobileJwtPayload;
    
    // Additional validation
    if (!['CUSTOMER', 'DOCTOR', 'AI_TECHNICIAN'].includes(payload.role)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      // Token expired - client should use refresh token
      return null;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      // Invalid token
      return null;
    }
    throw error;
  }
}

function verifyAdminToken(token: string): AdminJwtPayload | null {
  try {
    const payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET!) as AdminJwtPayload;
    
    if (!['SUPER_ADMIN', 'ADMIN', 'SUPPORT'].includes(payload.role)) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}
```

---

## 3. Mobile OTP Flow

> **Canonical OTP length:** `OTP_LENGTH=6` across API, mobile UI, validation, and SMS templates.

### 3.0 OTP Policy

System-wide OTP policy for mobile customer, doctor, and AI technician login.

| Field | Value | Env Variable | Notes |
|-------|-------|--------------|-------|
| **Length** | `6` digits | `OTP_LENGTH=6` | Numeric only (`0-9`); no letters |
| **Expiry** | `300` seconds (5 min) | `OTP_EXPIRY_SECONDS=300` | Challenge invalidated after expiry |
| **Resend cooldown** | `60` seconds | `OTP_RESEND_COOLDOWN_SECONDS=60` | Minimum gap between sends per phone |
| **Attempt limit** | `5` per challenge | `OTP_MAX_ATTEMPTS=5` | Wrong verify attempts before new OTP required |
| **Rate limiting (send)** | `5` per hour per phone | `OTP_MAX_SENDS_PER_HOUR=5` | Rolling window; see `OTP_SEND_WINDOW_MINUTES` |
| **Rate limiting (verify)** | `10` per 10 min per phone | API gateway | Prevents brute force on verify endpoint |
| **Retry** | New OTP after max attempts or expiry | — | Client must call `/otp/request` again |
| **Masking** | Never return OTP in API JSON | — | Hash only in DB (`codeHash`); SMS/dev-log delivery only |

**Validation rules (verify):**

```typescript
code: z.string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits 0-9')
```

**Display masking (logs/UI):**

| Context | Mask format | Example |
|---------|-------------|---------|
| API response | OTP never included | `{ expiresIn, resendAvailableIn }` only |
| Server logs (prod) | No plain OTP | — |
| Server logs (dev) | Full code in dev mode only | `[PraniDoctor OTP DEV] otp=******` optional last-2 |
| SMS template | Full 6-digit code | `আপনার কোড: {{code}}` |
| Admin debug panel | Masked unless dev+non-prod | `12****` |

**Environment block (reference):**

```bash
OTP_LENGTH=6
OTP_EXPIRY_SECONDS=300
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_SENDS_PER_HOUR=5
OTP_SEND_WINDOW_MINUTES=60
```

### 3.1 OTP Request Flow

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         OTP REQUEST FLOW                                       │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   CLIENT                          SERVER                          SMS GATEWAY │
│   ──────                          ──────                          ─────────── │
│                                                                                │
│   POST /auth/otp/request                                                      │
│   { phone: "01712345678" }  ────▶                                             │
│                                   ┌─────────────────────────┐                 │
│                                   │ 1. Normalize phone      │                 │
│                                   │ 2. Rate limit check     │                 │
│                                   │ 3. Generate 6-digit OTP │                 │
│                                   │ 4. Hash OTP (bcrypt)    │                 │
│                                   │ 5. Store challenge      │                 │
│                                   └───────────┬─────────────┘                 │
│                                               │                               │
│                                               │ Send SMS                      │
│                                               │────────────────────────────▶  │
│                                               │                               │
│                             ◀─────────────────┘                               │
│   { expiresIn: 300,                                                          │
│     resendAvailableIn: 60 }                                                  │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 OTP Challenge Storage

```prisma
model MobileOtpChallenge {
  id                  String    @id @default(cuid())
  normalizedPhone     String    @unique
  codeHash            String                    // bcrypt hash of OTP
  expiresAt           DateTime                  // 5 minutes from creation
  verifyAttempts      Int       @default(0)    // Max 5 attempts
  sendWindowStartedAt DateTime?                 // Rate limit window start
  sendsInWindow       Int       @default(0)    // Max 5 sends per hour
  lastOtpSentAt       DateTime?                 // For resend cooldown
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  @@index([expiresAt])
}
```

### 3.3 OTP Request Endpoint

```typescript
// POST /api/mobile/auth/otp/request
async function requestOtp(request: NextRequest) {
  const body = await request.json();
  
  // 1. Validate phone format (Bangladesh mobile)
  const phoneSchema = z.object({
    phone: z.string().regex(/^01[3-9]\d{8}$/, 'Invalid Bangladesh mobile number'),
  });
  
  const { phone } = phoneSchema.parse(body);
  const normalizedPhone = normalizePhone(phone);
  
  // 2. Check rate limits
  const challenge = await prisma.mobileOtpChallenge.findUnique({
    where: { normalizedPhone },
  });
  
  if (challenge) {
    // Check send rate limit (5 sends per hour)
    const windowExpired = !challenge.sendWindowStartedAt || 
      Date.now() - challenge.sendWindowStartedAt.getTime() > 60 * 60 * 1000;
    
    if (!windowExpired && challenge.sendsInWindow >= 5) {
      throw new AppError('OTP_RATE_LIMIT', 'Too many OTP requests. Try again later.', 429);
    }
    
    // Check resend cooldown (60 seconds)
    if (challenge.lastOtpSentAt && 
        Date.now() - challenge.lastOtpSentAt.getTime() < 60 * 1000) {
      const waitTime = Math.ceil((60 * 1000 - (Date.now() - challenge.lastOtpSentAt.getTime())) / 1000);
      throw new AppError('OTP_COOLDOWN', `Please wait ${waitTime} seconds`, 429);
    }
  }
  
  // 3. Generate OTP
  const otp = generateSecureOtp(6); // e.g., "482951"
  const codeHash = await bcrypt.hash(otp, 10);
  
  // 4. Store/update challenge
  await prisma.mobileOtpChallenge.upsert({
    where: { normalizedPhone },
    create: {
      normalizedPhone,
      codeHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      sendWindowStartedAt: new Date(),
      sendsInWindow: 1,
      lastOtpSentAt: new Date(),
    },
    update: {
      codeHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      verifyAttempts: 0,
      sendWindowStartedAt: challenge?.sendWindowStartedAt && 
        Date.now() - challenge.sendWindowStartedAt.getTime() < 60 * 60 * 1000
        ? undefined
        : new Date(),
      sendsInWindow: challenge?.sendWindowStartedAt && 
        Date.now() - challenge.sendWindowStartedAt.getTime() < 60 * 60 * 1000
        ? { increment: 1 }
        : 1,
      lastOtpSentAt: new Date(),
    },
  });
  
  // 5. Send SMS (async, don't block response)
  sendOtpSms(normalizedPhone, otp).catch(console.error);
  
  // 6. Return response
  return NextResponse.json({
    success: true,
    data: {
      phone: formatPhoneForDisplay(normalizedPhone),
      expiresIn: 300,
      resendAvailableIn: 60,
    },
  });
}
```

### 3.4 OTP Verify Flow

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         OTP VERIFY FLOW                                        │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   CLIENT                          SERVER                                      │
│   ──────                          ──────                                      │
│                                                                                │
│   POST /auth/otp/verify                                                       │
│   { phone, code }           ────▶                                             │
│                                   ┌─────────────────────────────┐             │
│                                   │ 1. Find challenge           │             │
│                                   │ 2. Check expiry             │             │
│                                   │ 3. Check attempt limit      │             │
│                                   │ 4. Verify OTP (bcrypt)      │             │
│                                   │ 5. Find/create user         │             │
│                                   │ 6. Find/create profile      │             │
│                                   │ 7. Generate tokens          │             │
│                                   │ 8. Delete challenge         │             │
│                                   └───────────┬─────────────────┘             │
│                                               │                               │
│                             ◀─────────────────┘                               │
│   { accessToken,                                                              │
│     refreshToken,                                                             │
│     expiresIn,                                                                │
│     user: {...} }                                                             │
│                                                                                │
│   Store tokens                                                                │
│   Navigate to home                                                            │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 3.5 OTP Verify Endpoint

```typescript
// POST /api/mobile/auth/otp/verify
async function verifyOtp(request: NextRequest) {
  const body = await request.json();
  
  const schema = z.object({
    phone: z.string().regex(/^01[3-9]\d{8}$/),
    code: z.string().length(6).regex(/^\d{6}$/),
  });
  
  const { phone, code } = schema.parse(body);
  const normalizedPhone = normalizePhone(phone);
  
  // 1. Find challenge
  const challenge = await prisma.mobileOtpChallenge.findUnique({
    where: { normalizedPhone },
  });
  
  if (!challenge) {
    throw new AppError('OTP_NOT_FOUND', 'OTP not requested for this number', 400);
  }
  
  // 2. Check expiry
  if (challenge.expiresAt < new Date()) {
    await prisma.mobileOtpChallenge.delete({ where: { id: challenge.id } });
    throw new AppError('OTP_EXPIRED', 'OTP has expired. Request a new one.', 400);
  }
  
  // 3. Check attempt limit
  if (challenge.verifyAttempts >= 5) {
    await prisma.mobileOtpChallenge.delete({ where: { id: challenge.id } });
    throw new AppError('OTP_MAX_ATTEMPTS', 'Too many attempts. Request a new OTP.', 429);
  }
  
  // Increment attempt count
  await prisma.mobileOtpChallenge.update({
    where: { id: challenge.id },
    data: { verifyAttempts: { increment: 1 } },
  });
  
  // 4. Verify OTP
  const isValid = await bcrypt.compare(code, challenge.codeHash);
  
  if (!isValid) {
    const remaining = 5 - (challenge.verifyAttempts + 1);
    throw new AppError('OTP_INVALID', `Invalid OTP. ${remaining} attempts remaining.`, 400);
  }
  
  // 5. Find or create user
  let user = await prisma.user.findUnique({
    where: { phone: normalizedPhone },
  });
  
  const isNewUser = !user;
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: normalizedPhone,
        email: `${normalizedPhone}@phone.pranidoctor.com`, // Placeholder email
        passwordHash: await bcrypt.hash(generateUUID(), 10), // Random password
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
  }
  
  // 6. Find or create profile
  let profile = await getProfileByRole(user.id, user.role);
  
  if (!profile && user.role === 'CUSTOMER') {
    profile = await prisma.customerProfile.create({
      data: {
        userId: user.id,
        displayName: `User ${normalizedPhone.slice(-4)}`,
      },
    });
  }
  
  // 7. Generate tokens
  const accessToken = generateMobileAccessToken(user, profile);
  const refreshToken = generateMobileRefreshToken(user);
  
  // 8. Delete challenge
  await prisma.mobileOtpChallenge.delete({ where: { id: challenge.id } });
  
  // 9. Return response
  return NextResponse.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      isNewUser,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        status: user.status,
        profile: profile ? {
          id: profile.id,
          displayName: profile.displayName,
          profilePhotoUrl: profile.profilePhotoUrl,
        } : null,
      },
    },
  });
}
```

---

## 4. Admin Login Flow

### 4.1 Login Flow Diagram

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         ADMIN LOGIN FLOW                                       │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   BROWSER                         SERVER                                      │
│   ───────                         ──────                                      │
│                                                                                │
│   POST /api/admin/auth/login                                                  │
│   { email, password }       ────▶                                             │
│                                   ┌─────────────────────────────┐             │
│                                   │ 1. Find user by email       │             │
│                                   │ 2. Check user status        │             │
│                                   │ 3. Verify password (bcrypt) │             │
│                                   │ 4. Check role is admin      │             │
│                                   │ 5. Generate session ID      │             │
│                                   │ 6. Generate JWT             │             │
│                                   │ 7. Set HttpOnly cookie      │             │
│                                   └───────────┬─────────────────┘             │
│                                               │                               │
│                             ◀─────────────────┘                               │
│   Set-Cookie: admin-token=<jwt>; HttpOnly; Secure; SameSite=Strict           │
│   { user: {...} }                                                             │
│                                                                                │
│   Redirect to dashboard                                                       │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Admin Login Endpoint

```typescript
// POST /api/admin/auth/login
async function adminLogin(request: NextRequest) {
  const body = await request.json();
  
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });
  
  const { email, password } = schema.parse(body);
  
  // 1. Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: { adminProfile: true },
  });
  
  if (!user) {
    // Don't reveal if email exists
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }
  
  // 2. Check status
  if (user.status !== 'ACTIVE') {
    throw new AppError('ACCOUNT_INACTIVE', 'Account is not active', 403);
  }
  
  // 3. Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  
  if (!isValid) {
    // Log failed attempt
    await logLoginAttempt(user.id, false, request);
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }
  
  // 4. Check role
  if (!['SUPER_ADMIN', 'ADMIN', 'SUPPORT'].includes(user.role)) {
    throw new AppError('FORBIDDEN', 'Not authorized for admin access', 403);
  }
  
  // 5. Generate session ID
  const sessionId = generateUUID();
  
  // 6. Generate JWT
  const token = generateAdminToken(user, sessionId);
  
  // 7. Log successful login
  await logLoginAttempt(user.id, true, request);
  
  // 8. Create response with cookie
  const response = NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.adminProfile ? {
          displayName: user.adminProfile.displayName,
        } : null,
      },
    },
  });
  
  // Set HttpOnly cookie
  response.cookies.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });
  
  return response;
}
```

### 4.3 Admin Logout

```typescript
// POST /api/admin/auth/logout
async function adminLogout(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
  
  // Clear cookie
  response.cookies.set('admin-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Expire immediately
    path: '/',
  });
  
  return response;
}
```

---

## 5. Token Refresh Strategy

### 5.1 Refresh Flow

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                         TOKEN REFRESH FLOW                                     │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   MOBILE APP                      SERVER                                      │
│   ──────────                      ──────                                      │
│                                                                                │
│   1. API call with access token                                               │
│      Authorization: Bearer <access_token>                                     │
│                             ────▶                                             │
│                                   Token expired (401)                         │
│                             ◀────                                             │
│                                                                                │
│   2. POST /auth/refresh                                                       │
│      { refreshToken }       ────▶                                             │
│                                   ┌─────────────────────────┐                 │
│                                   │ 1. Verify refresh token │                 │
│                                   │ 2. Check user exists    │                 │
│                                   │ 3. Check user active    │                 │
│                                   │ 4. Generate new tokens  │                 │
│                                   └───────────┬─────────────┘                 │
│                                               │                               │
│                             ◀─────────────────┘                               │
│   { accessToken (new),                                                        │
│     refreshToken (new) }                                                      │
│                                                                                │
│   3. Retry original request with new token                                    │
│      Authorization: Bearer <new_access_token>                                 │
│                             ────▶                                             │
│                                   Success (200)                               │
│                             ◀────                                             │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Refresh Endpoint

```typescript
// POST /api/mobile/auth/refresh
async function refreshToken(request: NextRequest) {
  const body = await request.json();
  
  const schema = z.object({
    refreshToken: z.string(),
  });
  
  const { refreshToken } = schema.parse(body);
  
  // 1. Verify refresh token
  let payload: { sub: string; type: string };
  
  try {
    payload = jwt.verify(refreshToken, process.env.MOBILE_REFRESH_SECRET!) as typeof payload;
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
  } catch {
    throw new AppError('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token', 401);
  }
  
  // 2. Find user
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
  });
  
  if (!user) {
    throw new AppError('USER_NOT_FOUND', 'User not found', 401);
  }
  
  // 3. Check status
  if (user.status !== 'ACTIVE') {
    throw new AppError('ACCOUNT_INACTIVE', 'Account is not active', 403);
  }
  
  // 4. Get profile
  const profile = await getProfileByRole(user.id, user.role);
  
  // 5. Generate new tokens
  const newAccessToken = generateMobileAccessToken(user, profile);
  const newRefreshToken = generateMobileRefreshToken(user);
  
  return NextResponse.json({
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 7 * 24 * 60 * 60,
    },
  });
}
```

### 5.3 Token Refresh Best Practices

```typescript
// Client-side token refresh interceptor (Flutter/Dio example)
class AuthInterceptor extends Interceptor {
  @override
  Future<void> onError(DioError err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Try to refresh token
      final refreshToken = await storage.getRefreshToken();
      
      if (refreshToken != null) {
        try {
          final response = await dio.post('/auth/refresh', data: {
            'refreshToken': refreshToken,
          });
          
          // Store new tokens
          await storage.setAccessToken(response.data['data']['accessToken']);
          await storage.setRefreshToken(response.data['data']['refreshToken']);
          
          // Retry original request
          final retryResponse = await dio.fetch(err.requestOptions);
          return handler.resolve(retryResponse);
        } catch (e) {
          // Refresh failed - logout user
          await authService.logout();
        }
      }
    }
    
    return handler.next(err);
  }
}
```

---

## 6. Role Authorization

### 6.1 Role Hierarchy

```typescript
enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',  // Level 5 - Full access
  ADMIN = 'ADMIN',              // Level 4 - Operations
  SUPPORT = 'SUPPORT',          // Level 3 - Customer help
  DOCTOR = 'DOCTOR',            // Level 2 - Clinical provider
  AI_TECHNICIAN = 'AI_TECHNICIAN', // Level 2 - Field provider
  CUSTOMER = 'CUSTOMER',        // Level 1 - Service consumer
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  SUPPORT: 3,
  DOCTOR: 2,
  AI_TECHNICIAN: 2,
  CUSTOMER: 1,
};
```

### 6.2 Role-Based Access Control

```typescript
// Check if user has required role(s)
function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

// Check if user has minimum role level
function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

// Route protection decorator
function requireRoles(...roles: UserRole[]) {
  return function (handler: ApiHandler): ApiHandler {
    return async (request: NextRequest, context: any) => {
      const user = await authenticate(request);
      
      if (!hasRole(user.role, roles)) {
        throw new AppError('FORBIDDEN', 'Insufficient permissions', 403);
      }
      
      return handler(request, context);
    };
  };
}
```

### 6.3 Route Protection Examples

```typescript
// Admin-only route
export const GET = requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN)(
  async function getUsers(request: NextRequest) {
    // Only SUPER_ADMIN and ADMIN can access
  }
);

// Provider routes (Doctor or Technician)
export const GET = requireRoles(UserRole.DOCTOR, UserRole.AI_TECHNICIAN)(
  async function getAssignedRequests(request: NextRequest) {
    // Both doctors and technicians can access
  }
);

// Super admin only
export const DELETE = requireRoles(UserRole.SUPER_ADMIN)(
  async function deleteUser(request: NextRequest) {
    // Only SUPER_ADMIN can delete users
  }
);
```

---

## 7. Permission Middleware

### 7.1 Middleware Architecture

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE CHAIN                                            │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   Request                                                                     │
│      │                                                                         │
│      ▼                                                                         │
│   ┌─────────────────┐                                                         │
│   │ Rate Limiter    │  Check request rate                                     │
│   └────────┬────────┘                                                         │
│            │                                                                   │
│            ▼                                                                   │
│   ┌─────────────────┐                                                         │
│   │ Auth Middleware │  Verify JWT, extract user                               │
│   └────────┬────────┘                                                         │
│            │                                                                   │
│            ▼                                                                   │
│   ┌─────────────────┐                                                         │
│   │ Role Middleware │  Check role permissions                                 │
│   └────────┬────────┘                                                         │
│            │                                                                   │
│            ▼                                                                   │
│   ┌─────────────────┐                                                         │
│   │Resource Middlewr│  Check resource ownership                               │
│   └────────┬────────┘                                                         │
│            │                                                                   │
│            ▼                                                                   │
│   ┌─────────────────┐                                                         │
│   │ Audit Middleware│  Log access (optional)                                  │
│   └────────┬────────┘                                                         │
│            │                                                                   │
│            ▼                                                                   │
│   Route Handler                                                               │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Mobile Auth Middleware

```typescript
// src/lib/middleware/mobile-auth.ts

export interface AuthenticatedRequest extends NextRequest {
  user: MobileJwtPayload;
}

export async function mobileAuthMiddleware(
  request: NextRequest
): Promise<MobileJwtPayload> {
  // 1. Extract token from header
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('UNAUTHORIZED', 'Authorization header required', 401);
  }
  
  const token = authHeader.slice(7);
  
  // 2. Verify token
  const payload = verifyMobileToken(token);
  
  if (!payload) {
    throw new AppError('UNAUTHORIZED', 'Invalid or expired token', 401);
  }
  
  // 3. Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, status: true, role: true },
  });
  
  if (!user || user.status !== 'ACTIVE') {
    throw new AppError('UNAUTHORIZED', 'User not found or inactive', 401);
  }
  
  // 4. Check if provider is verified (for provider roles)
  if (['DOCTOR', 'AI_TECHNICIAN'].includes(payload.role)) {
    if (payload.providerStatus !== 'ACTIVE') {
      throw new AppError('PROVIDER_NOT_VERIFIED', 'Provider account not verified', 403);
    }
  }
  
  return payload;
}
```

### 7.3 Admin Auth Middleware

```typescript
// src/lib/middleware/admin-auth.ts

export async function adminAuthMiddleware(
  request: NextRequest
): Promise<AdminJwtPayload> {
  // 1. Extract token from cookie
  const token = request.cookies.get('admin-token')?.value;
  
  if (!token) {
    throw new AppError('UNAUTHORIZED', 'Admin authentication required', 401);
  }
  
  // 2. Verify token
  const payload = verifyAdminToken(token);
  
  if (!payload) {
    throw new AppError('UNAUTHORIZED', 'Invalid or expired session', 401);
  }
  
  // 3. Verify user still exists and is active
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, status: true, role: true },
  });
  
  if (!user || user.status !== 'ACTIVE') {
    throw new AppError('UNAUTHORIZED', 'User not found or inactive', 401);
  }
  
  // 4. Verify role hasn't changed
  if (user.role !== payload.role) {
    throw new AppError('ROLE_CHANGED', 'Please log in again', 401);
  }
  
  return payload;
}
```

### 7.4 Resource Ownership Middleware

```typescript
// Check if user owns the resource or has admin access
export async function requireResourceOwnership(
  userId: string,
  userRole: UserRole,
  resourceOwnerId: string
): Promise<void> {
  // Admins can access any resource
  if (['SUPER_ADMIN', 'ADMIN'].includes(userRole)) {
    return;
  }
  
  // Check ownership
  if (userId !== resourceOwnerId) {
    throw new AppError('FORBIDDEN', 'Not authorized to access this resource', 403);
  }
}

// Usage in route handler
async function getAnimalProfile(request: NextRequest, { params }: RouteParams) {
  const user = await mobileAuthMiddleware(request);
  
  const animal = await prisma.animalProfile.findUnique({
    where: { id: params.id },
    include: { customer: { select: { userId: true } } },
  });
  
  if (!animal) {
    throw new AppError('NOT_FOUND', 'Animal not found', 404);
  }
  
  // Check ownership
  await requireResourceOwnership(user.sub, user.role, animal.customer.userId);
  
  return NextResponse.json({ success: true, data: animal });
}
```

---

## 8. Session Management

### 8.1 Session Storage Strategy

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    SESSION MANAGEMENT                                          │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   MOBILE (Stateless JWT)              ADMIN (Stateful-ish)                    │
│   ──────────────────────              ────────────────────                    │
│                                                                                │
│   • JWT contains all claims           • JWT contains sessionId                │
│   • No server-side session            • Session can be invalidated            │
│   • Refresh token for renewal         • Cookie-based storage                  │
│   • Logout = delete local tokens      • Logout = delete cookie + blacklist    │
│                                                                                │
│   Advantages:                         Advantages:                             │
│   • Scalable (no session store)       • Revocable sessions                    │
│   • Offline-friendly                  • Audit trail                           │
│                                       • Concurrent session control            │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Session Invalidation (Admin)

```typescript
// Future: Redis-based session blacklist
interface SessionBlacklist {
  add(sessionId: string, expiresAt: Date): Promise<void>;
  check(sessionId: string): Promise<boolean>;
}

// Check if session is blacklisted
async function isSessionBlacklisted(sessionId: string): Promise<boolean> {
  // In Redis: SISMEMBER session:blacklist {sessionId}
  const blacklisted = await redis.sismember('session:blacklist', sessionId);
  return blacklisted === 1;
}

// Invalidate session (logout, password change, etc.)
async function invalidateSession(sessionId: string, reason: string): Promise<void> {
  // Add to blacklist with TTL matching token expiry
  await redis.sadd('session:blacklist', sessionId);
  await redis.expire('session:blacklist', 24 * 60 * 60); // 24 hours
  
  // Log the invalidation
  await prisma.auditLog.create({
    data: {
      action: 'SESSION_INVALIDATED',
      entityType: 'Session',
      entityId: sessionId,
      actorType: 'SYSTEM',
      details: { reason },
    },
  });
}
```

### 8.3 Concurrent Session Control

```typescript
// Limit concurrent sessions per user (admin)
const MAX_ADMIN_SESSIONS = 3;

async function enforceSessionLimit(userId: string, newSessionId: string): Promise<void> {
  // Get active sessions
  const sessions = await redis.smembers(`user:${userId}:sessions`);
  
  if (sessions.length >= MAX_ADMIN_SESSIONS) {
    // Invalidate oldest session
    const oldestSession = sessions[0];
    await invalidateSession(oldestSession, 'Session limit exceeded');
    await redis.srem(`user:${userId}:sessions`, oldestSession);
  }
  
  // Add new session
  await redis.sadd(`user:${userId}:sessions`, newSessionId);
}
```

---

## 9. Security Considerations

### 9.1 Token Security

| Concern | Mitigation |
|---------|------------|
| Token theft | Short expiry, HTTPS only, HttpOnly cookies |
| Token replay | JWT ID (jti) for tracking |
| Brute force | Rate limiting, account lockout |
| XSS | HttpOnly cookies, Content-Security-Policy |
| CSRF | SameSite cookies, CSRF tokens for forms |

### 9.2 OTP Security

| Concern | Mitigation |
|---------|------------|
| Brute force | 5 attempt limit, lockout period |
| Replay attack | Single-use OTP, 5-minute expiry |
| Enumeration | Rate limit OTP requests |
| Interception | Encourage app-based OTP (future) |

### 9.3 Password Security (Admin)

```typescript
// Password requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: false,
  maxLength: 128,
};

function validatePassword(password: string): boolean {
  if (password.length < PASSWORD_REQUIREMENTS.minLength) return false;
  if (password.length > PASSWORD_REQUIREMENTS.maxLength) return false;
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) return false;
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) return false;
  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) return false;
  if (PASSWORD_REQUIREMENTS.requireSpecial && !/[!@#$%^&*]/.test(password)) return false;
  return true;
}

// Bcrypt cost factor
const BCRYPT_ROUNDS = 12;
```

### 9.4 Security Headers

```typescript
// Next.js security headers (next.config.js)
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  },
];
```

---

## 10. Implementation Guide

### 10.1 Environment Variables

```bash
# JWT Secrets (minimum 32 characters each)
MOBILE_JWT_SECRET=your-super-secure-mobile-jwt-secret-here
MOBILE_REFRESH_SECRET=your-super-secure-mobile-refresh-secret
ADMIN_JWT_SECRET=your-super-secure-admin-jwt-secret-here

# Token Lifetimes (in seconds)
MOBILE_TOKEN_LIFETIME=604800      # 7 days
MOBILE_REFRESH_LIFETIME=2592000   # 30 days
ADMIN_TOKEN_LIFETIME=86400        # 24 hours

# OTP Configuration (canonical — see §3.0 OTP Policy)
OTP_LENGTH=6                      # REQUIRED: 6-digit numeric OTP
OTP_EXPIRY_SECONDS=300            # 5 minutes
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=60      # Resend cooldown
OTP_MAX_SENDS_PER_HOUR=5
OTP_SEND_WINDOW_MINUTES=60

# SMS Gateway
SMS_PROVIDER=ssl_wireless         # Or twilio, msg91, etc.
SMS_API_KEY=your-sms-api-key
SMS_SENDER_ID=PraniDoc
```

### 10.2 File Structure

```
src/
├── lib/
│   ├── auth/
│   │   ├── jwt.ts              # JWT utilities
│   │   ├── otp.ts              # OTP generation/verification
│   │   ├── password.ts         # Password hashing
│   │   └── session.ts          # Session management
│   ├── middleware/
│   │   ├── mobile-auth.ts      # Mobile authentication
│   │   ├── admin-auth.ts       # Admin authentication
│   │   ├── rate-limit.ts       # Rate limiting
│   │   └── rbac.ts             # Role-based access
│   └── sms/
│       ├── index.ts            # SMS provider interface
│       └── providers/
│           ├── ssl-wireless.ts # Bangladesh provider
│           └── mock.ts         # Development mock
└── app/
    └── api/
        ├── mobile/
        │   └── auth/
        │       ├── otp/
        │       │   ├── request/route.ts
        │       │   └── verify/route.ts
        │       ├── login/route.ts
        │       ├── register/route.ts
        │       └── refresh/route.ts
        └── admin/
            └── auth/
                ├── login/route.ts
                ├── logout/route.ts
                └── me/route.ts
```

### 10.3 Testing Authentication

```typescript
// Unit test for OTP verification
describe('OTP Verification', () => {
  it('should verify valid OTP', async () => {
    // Setup
    const phone = '01712345678';
    const otp = '123456';
    await createOtpChallenge(phone, otp);
    
    // Test
    const response = await POST('/api/mobile/auth/otp/verify', {
      phone,
      code: otp,
    });
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.data.accessToken).toBeDefined();
    expect(response.data.refreshToken).toBeDefined();
  });
  
  it('should reject expired OTP', async () => {
    const phone = '01712345678';
    await createExpiredOtpChallenge(phone);
    
    const response = await POST('/api/mobile/auth/otp/verify', {
      phone,
      code: '123456',
    });
    
    expect(response.status).toBe(400);
    expect(response.error.code).toBe('OTP_EXPIRED');
  });
});
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-05-21 | Security Team | Initial release |

---

## Related Documents

| Document | Location |
|----------|----------|
| API Contract | `docs/api/API_CONTRACT_V1.md` |
| Error Standards | `docs/api/ERROR_STANDARD.md` |
| Role System | `docs/database/ROLE_SYSTEM.md` |
| Security Standards | `docs/core/MASTER_SYSTEM_RULES.md#7-security-standards` |

---

*End of AUTH_FLOW.md*
