# Prani Doctor — প্রজেক্ট স্কোপ ও MVP প্ল্যানিং

**Public domain:** [https://pranidoctor.com/](https://pranidoctor.com/)

**দাবিত্যাগ:** এই ডকুমেন্ট **শুধুমাত্র Prani Doctor / Animal Doctors** প্ল্যাটফর্মের জন্য। এটি **BPA/WPA**, **Quarbani 2026**, বা অন্য কোনো প্রোডাক্ট/রিপোজিটরির সাথে **মিশানো যাবে না**।

---

## ১. প্রজেক্ট ভিশন (Project vision)

**Bangladesh-এর কৃষক ও পশুপালকদের** জন্য একটি **trusted, area-aware veterinary service platform** গড়ে তোলা যেখানে **registered veterinary doctors**, **AI technicians** (field support / triage / coordination), এবং **admin oversight** একসাথে কাজ করে **livestock ও companion animals**-এর চিকিৎসা সেবা দ্রুত, নিরাপদ ও ট্র্যাকযোগ্য করে তোলে।

**MVP-এর ভিশন:** কাস্টমার **OTP-based login** দিয়ে অ্যাপে আসবে, **location hierarchy** অনুযায়ী সেবা চাইবে, **doctor / AI technician assignment** হবে নিয়ম মেনে, **treatment lifecycle** (request → assignment → visit/treatment → prescription → billing) ডিজিটাল রেকর্ড হবে, এবং **commission ও emergency fee** মডেল **transparently** ট্র্যাক হবে।

**Technical north star:** একই **PostgreSQL + Prisma schema** সোর্স অফ ট্রুথ; **Next.js** (web + admin + API routes) ও **Flutter mobile** একই **contract** অনুসরণ করবে।

---

## ২. টার্গেট ইউজার (Target users)

| ভূমিকা | কে | MVP-তে ভূমিকার সারাংশ |
|--------|-----|------------------------|
| **Farmer / animal owner (Customer)** | গ্রাম বা শহরের পশুপালক, খামার মালিক | প্রোফাইল, পশুর প্রোফাইল, সেবা রিকোয়েস্ট, স্ট্যাটাস ট্র্যাকিং, প্রেসক্রিপশন/বিল দেখা |
| **Veterinary doctor** | রেজিস্টার্ড ভেট | অ্যাসাইনড কেস, চিকিৎসা নোট, প্রেসক্রিপশন, বিলিং সাবমিশন, availability |
| **AI technician** | ফিল্ড সাপোর্ট / ট্রায়াজ / কোঅর্ডিনেশন | অ্যাসাইনমেন্ট অনুযায়ী কাস্টমারের সাথে যোগাযোগ, প্রাথমিক অ্যাসেসমেন্ট বা হ্যান্ডঅফ, স্ট্যাটাস আপডেট (policy অনুযায়ী) |
| **Admin** | প্ল্যাটফর্ম অপারেশন | ডাক্তার/টেকনিশিয়ান/এলাকা ম্যানেজমেন্ট, রিকোয়েস্ট ওভারসাইট, রিপোর্ট, ফি/কমিশন সেটিং |

---

## ৩. MVP ফিচার লিস্ট (MVP feature list)

**Authentication ও ইউজার ম্যানেজমেন্ট**

- OTP login (mobile) — **phone number** ভিত্তিক; session/token মডেল **secure** রাখা।
- Role separation: **customer app**, **doctor app**, **AI technician app** (একটি Flutter codebase এ **flavor / role build** হতে পারে; MVP-তে কমপক্ষে **customer + doctor** prioritise; AI technician flow **defined API/auth** সহ)।
- Admin: user lifecycle (activate/deactivate), doctor verification flags।

**Geography ও সেবা এলাকা**

- **Division → District → Upazila → Union → Village/Service area** ট্রি; কাস্টমার ও ডাক্তারের **service area mapping**।
- রিকোয়েস্ট তৈরির সময় **service area selection** (GPS পরে enhance করা যায়; MVP-তে structured selection acceptable)।

**Core সেবা রিকোয়েস্ট (Service request)**

- Animal profile: species, breed (optional), age, identifier notes।
- Request: symptoms/notes, urgency, preferred time window, selected area।
- Status workflow: e.g. `submitted` → `assigned` → `in_progress` → `completed` / `cancelled`।
- Assignment rules: **area + doctor/technician availability** (MVP-তে rule সহজ; পরে sophisticated routing)।

**Clinical ও বিলিং**

- Treatment notes (doctor); prescription record (structured fields)।
- Line-item billing linked to request; **commission basis** calculation hooks।
- **Emergency fee** flagging যেখানে প্রযোজ্য।

**Notifications**

- **SMS notification** — assignment, status change, key milestones (provider abstraction; Twilio/local gateway placeholder acceptable for MVP if not live)।

**Admin panel**

- Dashboard কাউন্টার (requests, active doctors)।
- CRUD: doctors, AI technicians, areas, service types (যদি MVP-তে থাকে)।
- Request list + manual reassignment / cancel with audit trail।

**File upload**

- Image/document upload (symptoms photo, prescription scan) — **size limit**, **virus scan later**; MVP-তে secure storage path + signed URL pattern।

---

## ৪. MVP থেকে বাদ দেওয়া ফিচার (Features excluded from MVP)

- **Doctor subscription** (recurring) — পরের ফেজে; MVP-তে শুধু **commission model** focus।
- **Farmer premium** subscription — post-MVP।
- **Advanced payments**: wallet, split payout automation, multi-gateway — MVP-তে manual reconciliation বা placeholder OK।
- **Real-time GPS live tracking** — অপশনাল পরে; MVP-তে address/area selection।
- **Full telemedicine video** — unless explicitly scoped; পরে।
- **ML diagnosis** — পরে; MVP-তে structured intake + human doctor workflow।
- **Multi-language UI polish** — MVP-তে BN/EN mix UX পরিকল্পনা থাকলেও full i18n পরে।

---

## ৫. কাস্টমার অ্যাপ ফ্লো (Customer app flow)

1. **Onboarding:** OTP login → প্রোফাইল (নাম, ফোন, ভাষা preference optional)।
2. **Animal profile:** add/edit animal(s)।
3. **নতুন রিকোয়েস্ট:** উপসর্গ, ছবি (যদি থাকে), urgency, **Division→…→Village/Service area** select।
4. **Tracking:** list ও detail — assigned doctor/technician (policy অনুযায়ী visibility), status timeline।
5. **Post-treatment:** prescription view, bill breakdown (**commission নয় — customer-facing net charges**), receipt/download optional।
6. **Support:** help/faq link to pranidoctor.com content (যদি থাকে)।

---

## ৬. ডাক্তার ওয়ার্কফ্লো (Doctor workflow)

1. **Login:** OTP / approved doctor account only।
2. **Availability:** simple online/offline বা slot (MVP সরল)।
3. **Inbox:** assigned requests filtered by area।
4. **Case execution:** status updates → treatment notes → prescription।
5. **Billing:** line items + **emergency fee** if applicable → submit।
6. **History:** past cases per animal/request।

---

## ৭. AI টেকনিশিয়ান ওয়ার্কফ্লো (AI technician workflow)

1. **Login:** role-specific OTP account।
2. **Queue:** assigned tasks (pre-visit triage, coordination, field visit support — **exact scope admin-configurable text** MVP-তে)।
3. **Actions:** call/scheduling notes, **structured checklist** (optional), handoff to doctor।
4. **Commission-eligible events:** policy অনুযায়ী যে ইভেন্টগুলো “completed handoff” হিসেবে গণ্য হবে — admin rule এ define।

---

## ৮. অ্যাডমিন প্যানেল ওয়ার্কফ্লো (Admin panel workflow)

1. **Authentication:** admin-only (separate from customer OTP flow; stronger policy)।
2. **Catalog:** manage geography tree; manage doctor capabilities।
3. **People:** onboard doctors/technicians; verification; deactivate।
4. **Operations:** live request board; reassign; dispute notes।
5. **Finance settings:** commission %, emergency fee rules, **AI technician commission** rules।
6. **Reports:** export CSV — requests, revenue summary (MVP-lite)।

---

## ৯. এলাকা ভিত্তিক সেবা মডেল (Area-based service model)

**Hierarchy (Bangladesh admin geography + last-mile service area):**

| Level | English | বাংলা কনটেক্সট |
|-------|---------|----------------|
| **Division** | Division | প্রশাসনিক বিভাগ |
| **District** | District | জেলা |
| **Upazila** | Upazila | উপজেলা |
| **Union** | Union | ইউনিয়ন |
| **Village / Service area** | Village or defined service area | গ্রাম বা সেবা জোন (macro মানচিত্রের নিচে last-mile) |

**মডেলিং নোট (technical):**

- প্রতিটি **service area** node **parent FK** chain দিয়ে ট্রি।
- Doctor ও AI technician **many-to-many** mapping: কোন এলাকায় সক্রিয়।
- রিকোয়েস্ট **leaf service area** বা union-level এ bind করা যায় — MVP-তে **consistent rule** একটাই রাখা (prefer leaf)।

---

## ১০. রেভিনিউ মডেল (Revenue model)

| স্ট্রিম | বিবরণ | MVP |
|---------|--------|-----|
| **Per treatment commission** | প্রতি সম্পন্ন চিকিৎসা/বিল ইভেন্টে প্ল্যাটফর্ম কাট | ✅ Core |
| **Doctor subscription (later)** | মাসিক/বার্ষিক সাবস্ক্রিপশন | ❌ Post-MVP |
| **AI technician commission** | হ্যান্ডঅফ/কমপ্লিটেড টাস্ক ভিত্তিক | ✅ Rule-based (simple) |
| **Emergency fee** | উচ্চ অগ্রাধিকার বা আউট-অফ-আওয়ার সার্জ | ✅ Flag + pricing |
| **Farmer premium (later)** | ফাস্ট লেন, অতিরিক্ত কভারেজ | ❌ Post-MVP |

**Implementation note:** ledger-style **transaction table** ভবিষ্যতে payout এর জন্য; MVP-তে **auditable amounts** on request/bill sufficient।

---

## ১১. ট্রাস্ট ও সেফটি রুলস (Trust and safety rules)

- **Doctor verification:** license/reference checklist admin-approved ছাড়া production assignment নয়।
- **Data minimization:** শুধু প্রয়োজনীয় PII; sensitive notes access **role-based**।
- **Audit trail:** admin reassignment, status change, billing edit — **who/when**।
- **Abuse prevention:** rate limits on OTP; suspicious activity flags।
- **Animal welfare disclaimer:** প্ল্যাটফর্ম **triage সাপোর্ট** দেয়; **final diagnosis** licensed vet।
- **File upload:** type/size enforcement; public URL না দিয়ে **authenticated fetch** preferred।

---

## ১২. ইনিশিয়াল লঞ্চ স্ট্র্যাটেজি (Initial launch strategy)

1. **Pilot geography:** ১টি Division বা সীমিত কয়েকটি Upazila — doctor density যাচাই।
2. **Seed doctors:** locally trusted vets + training on mobile app।
3. **AI technician network:** স্পষ্ট SOP (কল টাইম, escalation path)।
4. **Marketing:** pranidoctor.com landing, Facebook rural channels, partner NGOs optional।
5. **Ops playbook:** SLA targets, customer support phone window, escalation।
6. **Measure:** time-to-assign, completion rate, repeat requests, NPS sampling।

---

## ১৩. সাজেস্টেড ডেভেলপমেন্ট ফেজ (Suggested development phases)

**Phase 0 — Foundation**

- Prisma schema: users, roles, geography, animals, requests, assignments, billing, audit।
- Next.js admin skeleton + auth।
- Flutter app shells + OTP login plumbing।

**Phase 1 — Customer MVP path**

- Request creation + tracking + notifications stub।
- File upload MVP।

**Phase 2 — Doctor MVP path**

- Assignment + treatment + prescription + billing submission।

**Phase 3 — AI technician + admin ops**

- Technician tasks + commission rules + reports।

**Phase 4 — Hardening**

- SMS provider live, security review, load testing lite, Play/App Store readiness।

---

## ১৪. টেকনিক্যাল অ্যাসাম্পশন (Technical assumptions)

| বিষয় | স্ট্যাক / পলিসি |
|--------|------------------|
| **Web / Admin** | **Next.js** (App Router) — public site + admin + API routes |
| **Mobile** | **Flutter** — customer + professional roles |
| **Database** | **PostgreSQL** |
| **ORM** | **Prisma** — migrations source of truth |
| **Auth** | **OTP login** — phone; separate admin auth strategy |
| **File upload** | Object storage compatible pattern (e.g. S3-compatible) + DB metadata |
| **SMS** | Provider abstraction; transactional SMS for key events |

---

## ১৫. MVP সমাপ্তির একসেপ্ট্যান্স ক্রাইটেরিয়া (Acceptance criteria for MVP completion)

**Functional**

- [ ] কাস্টমার OTP দিয়ে লগইন করে **animal + service request** তৈরি করতে পারে।
- [ ] Geography **Division → Village/Service area** চেইনে কাজ করে।
- [ ] Admin doctor/technician অনবোর্ড করে এবং **area mapping** দিতে পারে।
- [ ] রিকোয়েস্ট **assign** হয় এবং স্ট্যাটাস টাইমলাইন কাস্টমার অ্যাপে দেখা যায়।
- [ ] ডাক্তার treatment notes + prescription + billing সাবমিট করতে পারে।
- [ ] **Emergency fee** ও **commission amounts** বিল রেকর্ডে গণনা/প্রদর্শন policy অনুযায়ী।
- [ ] AI technician হ্যান্ডঅফ ফ্লো **minimum viable** সম্পন্ন (assign → complete)।
- [ ] SMS ইভেন্ট ওয়্যার বা queue stub **demonstrable**।
- [ ] ফাইল আপলোড রিকোয়েস্ট বা রেকর্ডে সংযুক্ত থাকে।

**Non-functional**

- [ ] Role-based access — privilege bleed নেই (basic automated/API tests বা checklist)।
- [ ] Audit logs প্রধান অ্যাডমিন অ্যাকশনে।
- [ ] Deployment-ready **environment separation** (staging/prod concept) documented।

---

## সংক্ষিপ্ত পরবর্তী কাজের লিঙ্ক

মোনোরিপোতে শেয়ার্ড ডকুমেন্টেশন ফোল্ডার থাকলে দেখুন: [PROJECT_OVERVIEW.md](../../docs/PROJECT_OVERVIEW.md), [DEVELOPMENT_ROADMAP.md](../../docs/DEVELOPMENT_ROADMAP.md), [TECHNOLOGY_STACK.md](../../docs/TECHNOLOGY_STACK.md) — পথ আপনার চেকআউট লেআউট অনুযায়ী সামঞ্জস্য করুন।

---

*ডকুমেন্ট ভার্সন: MVP scope draft — Prani Doctor only — aligned with pranidoctor.com.*
