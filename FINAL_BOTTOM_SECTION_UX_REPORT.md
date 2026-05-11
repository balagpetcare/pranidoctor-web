# Final Bottom Section UX Report

**Scope:** `/admin/semen-service-templates/new` (bottom half) — media/metadata pairing, save footer, spacing rhythm, completion flow.

**Constraints honored:** APIs/schema unchanged, recent media/editor polish retained, TipTap & upload logic untouched.

---

## 1) Spacing + flow fixes

- **Form padding:** reduced bottom padding to remove empty canvas (`pb-32 → pb-24`, `sm:pb-28 → sm:pb-20`).
- **Section rhythm:** tightened overall vertical gaps (`space-y-5 → space-y-4`, `sm:space-y-7 → sm:space-y-6`).
- **Media + metadata row:** adjusted layout to emphasize media and reduce voids:  
  `xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]` and `xl:gap-4`.
- **Sticky bar offset:** reduced top margin (`mt-4 → mt-3`) to remove perceived dead-zone above footer.

---

## 2) Metadata section redesign

**File:** `src/components/admin/semen-template/MetadataBuilder.tsx`

- **New header hierarchy:** label + helper copy + row count pill.
- **Empty state:** elegant hint panel with example tags (`tier`, `source`, `region`, `channel`).
- **Table polish:**
  - Gradient header, tighter padding, `text-[11px]` base.
  - Inputs set on **white/soft** surfaces for better separation.
  - Row hover and subtle transitions for scanability.
- **Add-row CTA:** bottom-right **premium** button, hover shadow, explicit “নতুন সারি যোগ করুন”.

---

## 3) Sticky save bar architecture

**File:** `src/components/admin/semen/SemenServiceTemplateForm.tsx`

- **Modern sticky bar** with blurred background, border-top, and safe-area padding.
- **Completion signals:**
  - Progress % badge
  - “সব ঠিক / Xটি অসম্পূর্ণ” badge
  - Dirty indicator (unsaved changes)
  - Media-processing indicator
- **Validation summary:** Inline warning strip with top two missing items + count (`issueSummary`).
- **Save CTA:**
  - Spinner on save (`Loader2`)
  - Elevated button with hover/active motion
  - Disabled reason shown when saving/media/approval is busy

---

## 4) Completion & validation UX

- **Blocking issue detection** (client-side): same rule set as save validation.
- **Auto-scroll** to relevant section on validation error (core/pricing/breed).
- **Clear messaging** inside sticky bar to explain what blocks saving.

---

## 5) Layout consistency audit

Unified in this pass:

- **Radii:** using `--pd-admin-radius` for metadata table and media cards.
- **Shadows:** `--pd-admin-card-shadow` used consistently.
- **Spacing:** reduced dead space at the end of the form; alignment across media/metadata/footer.
- **Typography:** kept Bengali-first legibility; CTA labels clarified.

---

## 6) Files modified

- `src/components/admin/semen/SemenServiceTemplateForm.tsx`
  - Sticky footer rebuild, validation summary, unsaved indicator, scroll-to-error
  - Spacing tweaks (bottom padding, section rhythm)
  - Section IDs for auto-scroll
- `src/components/admin/semen-template/MetadataBuilder.tsx`
  - Premium card hierarchy, empty state, table polish, add-row CTA

---

## 7) Remaining recommendations

1. **True section validation** per card (inline red highlights) would require field-level error state, not just summary.
2. **Save success state** could be added as a transient badge in the sticky bar before redirect (optional).
3. **Keyboard shortcut** for save (Ctrl/Cmd+S) may further improve enterprise UX.

---

## 8) QA checklist

- [ ] No extra bottom whitespace (scroll to end of form).
- [ ] Metadata empty state and add-row button look polished.
- [ ] Sticky bar stays stable across breakpoints (mobile + desktop).
- [ ] Progress + validation summary update live.
- [ ] Save button shows spinner and disabled reason when busy.
- [ ] Auto-scroll on validation error brings user to correct section.
- [ ] No console warnings or hydration issues.

