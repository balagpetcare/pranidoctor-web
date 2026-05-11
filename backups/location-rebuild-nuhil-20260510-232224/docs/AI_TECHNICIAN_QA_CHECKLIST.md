# AI Technician module — QA & security checklist

**Project:** Prani Doctor / Animal Doctors  
**Repos:** `pranidoctor-web`, `pranidoctor_mobile`  
**Companion docs:** [`AI_TECHNICIAN_IMPLEMENTATION_PLAN.md`](./AI_TECHNICIAN_IMPLEMENTATION_PLAN.md), [`AI_TECHNICIAN_API.md`](./AI_TECHNICIAN_API.md)

Use this list before release or after any change touching AI technician flows.

---

## A. End-to-end flow (manual)

- [ ] **Same login:** Customer OTP session can open farmer AI flows; user promoted to **`AI_TECHNICIAN`** uses same app account for technician endpoints (Bearer JWT).
- [ ] **Application:** `AiTechnicianIntro` → form → save draft; division areas + services + documents; submit → status moves toward admin queue.
- [ ] **Admin review:** `/admin/ai-technicians/applications` — open row → documents visible → transition (correction / approve / reject / publish) works.
- [ ] **Publish:** After **PUBLISHED**, technician appears in **`GET /api/mobile/ai-services/technicians`** for matching district/upazila.
- [ ] **Technician dashboard:** Stats, earnings line, **সাম্প্রতিক রিভিউ**, emergency toggle (when allowed), link to job list.
- [ ] **Service / gig:** Create, edit, deactivate service; reflected on public profile.
- [ ] **Farmer listing:** Finder filters; card opens public profile; request form submits **`AiServiceRequest`**.
- [ ] **Technician jobs:** New → accept → status steps → complete with valid body → request **COMPLETED**.
- [ ] **Digital record:** Farmer and assignee can open record; **ফলোআপ** / **গর্ভ পরীক্ষা** visible when technician entered dates.
- [ ] **Payment status:** Shown on record / request as returned by API (MVP manual statuses).
- [ ] **Review:** Completed request → review once → second attempt returns conflict.
- [ ] **Complaint:** Submitted with technician on request; appears under **এআই অভিযোগ** admin; status update saves.

---

## B. Security checklist (automated reasoning + spot tests)

| # | Requirement | Where verified |
|---|-------------|----------------|
| 1 | User **cannot** self-approve application | `POST /api/admin/ai-technician-applications/[id]/transition` uses **`requireAdminApiActor`**; mobile JWT cannot call admin routes without admin session. |
| 2 | User **cannot** read another user’s private application via mobile | `GET /api/mobile/ai-technician/me` and write paths scoped by **`auth.ctx.userId`** in application service. |
| 3 | Technician **cannot** mutate another technician’s requests | `technician-ai-requests-service`: **`loadRequestForTechnician`** + **`row.technicianProfileId === actor`** for accept/decline/status/complete; pool **PENDING** only where area matches. |
| 4 | Farmer **cannot** read other farmers’ requests | `listMyAiServiceRequests` / `getMyAiServiceRequestById` filter **`customerUserId`**. |
| 5 | Private documents **not** on public technician API | `getAiServiceTechnicianPublic` returns services + areas + bio; **no** `AiTechnicianDocument` list. |
| 6 | Unpublished / suspended **not** in public listing | `publishedTechnicianBaseWhere()`: **`status: PUBLISHED`**, **`providerStatus: ACTIVE`**, active **User**. |
| 7 | Admin routes protected | `requireAdminPanelApiAccess` / `requireAdminApiActor` on listed admin AI routes. |
| 8 | Status transitions protected | `canTransitionTo` single-step chain; `complete` only from **IN_PROGRESS**; duplicate complete → **ALREADY_COMPLETED**. |
| 9 | Price **not** negative | `completeAiServiceRequestBodySchema`: **`totalFee`** `z.number().nonnegative()` or digit string regex. |
| 10 | Completed service **not** double-completed | Transaction creates record once; second complete rejected. |

**Manual spot tests:**  
- [ ] Call **`GET /api/mobile/ai-services/requests/{otherId}`** as farmer A → **404**.  
- [ ] Call technician **accept** on request assigned to B → **FORBIDDEN** / **NOT_FOUND**.  
- [ ] Open public technician **`GET …/technicians/{id}`** for **APPROVED**-only profile → **NOT_FOUND**.

---

## C. UI checklist (Flutter)

- [ ] Bengali strings readable (no clipping on small devices) on: finder, request form, my requests, detail, review/complaint, record, technician dashboard, job list/detail/complete.
- [ ] **Loading / error / empty:** `PraniLoadingState`, error text, empty chips on lists.
- [ ] **Design system:** `PraniPremiumCard`, `PraniPrimaryButton` / `PraniSecondaryButton`, `PraniScaffold` — no one-off duplicate headers for same screen.
- [ ] **Navigation:** Profile / home paths to AI entry still reach finder + technician intro + my requests + technician dashboard.
- [ ] **Overflow:** Scroll views on long forms; technician dashboard **recent reviews** list scrolls inside parent `ListView`.

---

## D. Backend checklist (`pranidoctor-web`)

- [ ] `npx prisma validate` (or migrate diff in CI) — schema coherent.
- [ ] `npm run lint` — no new ESLint violations in touched files.
- [ ] `npm run typecheck` — clean.
- [ ] `npm run build` — Next.js build succeeds.
- [ ] `npm test` — Vitest green.
- [ ] `npx prisma generate` — client generated.
- [ ] `npx prisma migrate status` — matches deployed DB in target environment (local dev may show **pending** until `prisma migrate dev` or production **`prisma migrate deploy`**).

---

## E. Mobile checklist (`pranidoctor_mobile`)

- [ ] `dart format .`
- [ ] `flutter analyze` — no issues.
- [ ] `flutter test`
- [ ] `flutter build apk --debug` — optional smoke on device/emulator.

---

## F. Regression matrix (quick)

| Area | Action | Expected |
|------|--------|----------|
| Auth | Expired token on technician `GET …/requests` | **401** |
| Farmer | Create request without technician | Allowed per product rules |
| Technician | Complete without prior **IN_PROGRESS** | **INVALID_STATUS** |
| Admin | Complaint status **RESOLVED** + note | Persisted; list refresh |

---

## G. Known limitations (copy for release notes)

- Technician job list may set **`truncated`** when many rows in area (see implementation plan).  
- Pool **DECLINED** affects all technicians (documented product choice).  
- No automated pregnancy reminder push.  
- Admin complaint UI: single-page list + panel (no deep link per complaint id).

---

## H. Future improvements

- E2E tests (Playwright admin + integration tests for API).  
- Signed URL TTL + audit for document downloads.  
- Optional **`hasAiReview`** on farmer request list API.  
- Paginated technician job query without cap.  
- Payment gateway + receipt upload.

---

## I. AI Technician stepper, locations & uploads (COMMAND 07 manual QA)

**Prerequisites:** Web `.env` with S3/MinIO configured or `STORAGE_DRIVER=disabled` (uploads will fail with clear API message). DB seeded: `npm run db:seed` (includes **`seedBdReferenceLocations`**). Mobile app points `API_BASE_URL` at running Next server; user logged in with OTP (customer session works for AI technician module).

### Mobile (`pranidoctor_mobile`)

- [ ] **Intro:** Profile → AI technician entry opens **`AiTechnicianIntroScreen`** when no profile; “আবেদন ফর্মে যান” navigates to form.
- [ ] **Six steps:** Header shows **ধাপ n / ৬** and progress bar; intro card lists **ছয়টি ধাপ** titles.
- [ ] **Next / Previous:** Validates personal / professional / address before next; no crash on last step.
- [ ] **Data retention:** Change fields on step 2 → go to step 4 → back to 2; text still present (controllers). Optional: tap **খসড়া সংরক্ষণ** and reload — server matches.
- [ ] **DOB:** Tap date field → `showDatePicker` (bn_BD) → ISO saved in field.
- [ ] **Gender:** Dropdown changes value.
- [ ] **District → upazila → union:** District list loads; upazila disabled until district; union optional; profile address and “add service area” sheet both cascade.
- [ ] **Service areas:** Add row, delete row; at least one required for submit.
- [ ] **Upload image:** NID front/back JPG/PNG; progress bar moves; snackbar success; `fetchMe` shows document.
- [ ] **Upload PDF:** Certificate slot PDF if allowed by picker; server accepts PDF for document purposes.
- [ ] **Bad type:** Pick unsupported type blocked by picker; if API returns **415** / `INVALID_TYPE`, Bengali message shown.
- [ ] **Oversize:** File &gt; ~5 MB on image slot or &gt; ~10 MB on cert slot → Bengali oversize message before upload or **413** from API.
- [ ] **Review step:** Summary lists key fields, warnings for missing NID / areas / address.
- [ ] **Submit:** Completes → status screen; backend validation errors show as snackbar / `_fieldError` (Bengali-friendly).
- [ ] **Small screen:** No horizontal overflow; scroll works on each step.
- [ ] **Keyboard:** Focus a text field; bottom **পরবর্তী** / **খসড়া** bar stays above keyboard (`viewInsets` padding).
- [ ] **Dark theme:** Cards, progress, and errors readable (premium contrast).

### Backend (`pranidoctor-web`)

- [ ] **`GET /api/mobile/locations/districts`** (and upazilas/unions) return 200 with seeded slugs.
- [ ] **`npm run db:seed`** twice: no duplicate-key crash (upserts).
- [ ] **`POST /api/mobile/uploads`** without JWT → **401**.
- [ ] Invalid MIME / magic bytes → **415** / `INVALID_TYPE`.
- [ ] Oversize body → **413** / `FILE_TOO_LARGE`.
- [ ] Image upload stored as processed bytes + **`UploadedFile`** row (check DB).
- [ ] **`POST /api/mobile/ai-technician/documents`** with `uploadedFileId` links document to profile.
- [ ] Raw bucket URL not required in client; **`downloadUrl`** uses app origin + file id path.
- [ ] **`GET /api/admin/uploads/[id]`** with admin session → 302 to signed URL.

### Admin

- [ ] **`/admin/ai-technicians/applications`** list loads.
- [ ] Detail shows document cards + missing-doc warning when applicable.
- [ ] **Need correction / Approve / Publish / Reject / Suspend** modals and transitions succeed (see checklist A).

### Known limitations (this area)

- Image `<img src="/api/admin/uploads/...">` after **302** to S3 may fail if bucket CORS blocks browser reads.
- **`download`** attribute on anchor may not rename file after cross-origin redirect.
- Client size caps assume defaults **5 MB** / **10 MB**; if `.env` overrides `UPLOAD_MAX_*_MB`, mobile pre-check may be stricter or looser than server until constants are aligned.
