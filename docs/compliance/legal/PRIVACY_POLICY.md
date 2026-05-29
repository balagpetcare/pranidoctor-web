# Privacy Policy — Prani Doctor Platform

**Version:** 2026-05-30  
**Effective date:** 30 May 2026  
**Operator:** Prani Doctor / Animal Doctors  
**Contact:** support@pranidoctor.com  
**Public URL:** https://pranidoctor.com/privacy

---

## 1. Who we are

Prani Doctor ("we", "our", "us") operates a veterinary and livestock management platform for farmers, licensed veterinarians, and field technicians in Bangladesh. This policy applies to:

- **Prani Doctor** mobile app (Android/iOS) for farmers
- **Admin** and **doctor** web portals
- Related APIs and support services

---

## 2. Information we collect

| Category | Examples | Purpose |
|----------|----------|---------|
| **Account** | Name, mobile phone, optional email, password (hashed) | Authentication and account management |
| **Location** | Division, district, upazila, union, village; visit location notes | Service matching and dispatch |
| **Animals & farm data** | Species, breed, health, milk, feed, finance records you enter | Farm management and clinical context |
| **Service & clinical** | Symptoms, consultations, prescriptions, treatment notes | Veterinary service delivery |
| **Device** | Device key, platform, app version, push token (optional) | Security, notifications, compatibility |
| **Session & security** | IP address, user agent, login audit events | Fraud prevention and account safety |
| **Media** | Photos and documents you upload | Profiles, consultations, support |
| **AI interactions** | Chat messages, symptom checks, voice transcripts (text) | Assistive guidance (not autonomous diagnosis) |
| **Notifications** | In-app notification content and read status | Service updates and reminders |
| **Support** | Tickets and messages you send us | Customer support |

We do **not** sell personal data to third parties.

---

## 3. How we use information

- Provide and improve the Prani Doctor service
- Connect you with assigned doctors or technicians
- Send transactional notifications (appointments, case updates)
- Operate farm management features you choose to use
- Secure accounts and prevent abuse
- Comply with law and resolve disputes
- Measure platform reliability (crash reports, aggregated usage)

Marketing messages are **opt-in** via notification settings (`marketingEnabled` defaults to off).

---

## 4. Legal bases (summary)

| Processing | Basis |
|------------|-------|
| Core account and bookings | Contract — necessary to provide the service |
| Clinical records | Contract + legitimate interest in care continuity |
| Security audit logs | Legitimate interest |
| Marketing notifications | Consent |
| AI assistive features | Consent (separate AI processing acknowledgment) |
| Crash/diagnostic telemetry | Legitimate interest / consent where required |

---

## 5. Sharing and disclosure

**On-platform:** Assigned doctors and technicians receive data needed to perform requested services (animal details, symptoms, location area, contact as required for dispatch).

**Processors (sub-processors):**

| Provider | Purpose |
|----------|---------|
| Cloud hosting (PostgreSQL, object storage) | Data storage |
| Firebase (Google) | Push notifications; optional crash reporting |
| SMS gateway | OTP and transactional SMS |
| OpenAI / Anthropic | AI inference (when enabled) |
| Sentry (when enabled) | Error monitoring |

**We do not** sell or rent personal data.

---

## 6. International transfers

Some processors (Google, OpenAI, Anthropic, Sentry) may process data outside Bangladesh. We use contractual safeguards appropriate to each vendor and disclose this in our sub-processor register (available on request).

---

## 7. AI and automated processing

- AI features are **informational only** — not a substitute for a licensed veterinarian.
- When you use AI chat, symptom checks, or farm briefing, relevant context (e.g. animal species, health summaries) may be sent to our LLM providers for inference.
- We do **not** use your content to train public foundation models without explicit opt-in.
- Separate **AI processing consent** is requested before first use of AI features.
- Human doctors remain responsible for clinical decisions.

---

## 8. Retention

See [DATA_RETENTION.md](./DATA_RETENTION.md) for the full schedule. Summary:

- **Active account data:** retained while your account is active
- **OTP challenges:** minutes
- **Sessions/devices:** until expiry or revocation
- **Clinical records:** multi-year retention where law or care continuity requires
- **AI chat:** limited retention; see retention schedule
- **Audit/consent logs:** 18–24 months

---

## 9. Your rights

You may:

- **Access** and request a copy of your data (contact support@pranidoctor.com)
- **Correct** profile and farm records in the app
- **Delete** your account (verified request via support)
- **Opt out** of marketing notifications in Settings
- **Withdraw consent** for AI features (stops new AI processing; prior logs may be retained per law)

We respond to verified requests within **30 days**.

---

## 10. Doctor and provider data

Doctors and technicians have profiles managed by Prani Doctor or admins. Provider terms govern professional obligations for clinical data they create.

---

## 11. Security

- HTTPS for API communication in production
- Passwords stored using bcrypt hashing
- Tokens in platform secure storage on mobile
- Private object storage with signed URLs
- Role-based access for admin operations

---

## 12. Children

The service is not directed at children under 13. Accounts should be created by adults or guardians.

---

## 13. Changes

We may update this policy. Material changes update the **version** string (e.g. `2026-05-30`). The app may prompt you to review and accept the new version before continued use of protected features.

---

## 14. Contact

**Prani Doctor Support**  
Email: support@pranidoctor.com

---

*Template reviewed for Bangladesh operations. Not legal advice — counsel review recommended before regulatory filings.*
