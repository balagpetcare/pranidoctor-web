# Semen Template Studio Save Action Refactor

## Overview
- Removed all sticky/fixed save action behavior.
- Introduced dual-save action bars: top workflow actions + bottom final actions.
- Preserved existing submit logic and validation pipeline.

## Audit Findings
- Sticky save container previously pinned to the viewport and overlapped long-form content.
- Multiple save controls in the sidebar created a floating obstruction during scrolling.
- Scroll offsets risked hiding section headers under pinned UI.
- Mobile layouts inherited the same pinned behavior, reducing editor visibility.

## Architecture Changes
- Added reusable `FormActionBar`, `FormBottomActions`, and `UnsavedChangesIndicator` components.
- Introduced a `saveCoordinatorRef` with save intent + section checkpoint metadata for future autosave.
- Added a top action bar inside the header section with validation status + unsaved state.
- Added a bottom action section with draft/continue/publish (future) and back-to-top actions.

## Sticky/Floating Behavior Removal
- Deleted all `position: sticky` UI blocks and related CSS.
- Removed floating save containers and right sidebar save actions.
- Action buttons now render inline within the normal document flow.

## Responsive Behavior
- Desktop: top action bar within header; bottom action section at end of form.
- Tablet/mobile: actions wrap naturally with flexible row spacing; no overlay on editors.
- No viewport-pinned elements remain, ensuring full editor visibility.

## UX Improvements
- Clear dual-save workflow (top for immediate actions, bottom for final confirmation).
- Reduced visual obstruction and eliminated overlap during scroll.
- Validation status and unsaved indicators remain visible without sticking to the viewport.

## Future Autosave Readiness
- `saveCoordinatorRef` tracks save intent and last section checkpoint for autosave/draft recovery.
- `registerSectionCheckpoint` is wired to section navigation for future autosave triggers.
- Save intent setters are centralized and reusable by future autosave logic.
