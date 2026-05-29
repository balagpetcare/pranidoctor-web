# Phase 4 — Multilingual Plan

**Plan ID:** `PHASE_4_LIVESTOCK_FEED_ECOSYSTEM_MASTER_PLANNING_V1`  
**Status:** Planning only  
**Primary locale:** Bengali (`bn`)  
**Secondary locale:** English (`en`)

---

## 1. Current Localization Architecture

### Flutter (`pranidoctor_user`)

| Component | Location |
|-----------|----------|
| JSON translations | `assets/i18n/bn.json`, `en.json` |
| Key constants | `lib/core/localization/translation_keys.dart` (generated) |
| Loader | `localization_loader.dart` |
| Controller | `language_controller.dart` — user preference persist |
| Extensions | `localization_extensions.dart` — `context.l10n.key` |
| API errors | `api_error_mapper.dart` |
| Dates/numbers | `app_date_format.dart`, `localization_format.dart` |

Build tool: `tool/i18n/build_localization.dart` → regenerates keys from JSON.

### Backend

| Component | Location |
|-----------|----------|
| Auth i18n catalog | `src/modules/auth/i18n/` |
| AI responses | locale param on sessions |
| Feed catalog | `nameBn`, `nameEn` on `FeedCatalog` |
| Breed master | `nameBn`, `nameEn` on `LivestockBreed` |

### Admin panel

- Bengali-first labels on feed catalog UI (`lang="bn"`)
- English field labels where useful for staff

---

## 2. Phase 4 Localization Principles

| ID | Principle |
|----|-----------|
| L-01 | **BN-first UX** — default copy, empty states, errors in Bengali |
| L-02 | **Master data bilingual** — catalog, breeds, vendor names |
| L-03 | **Stable keys** — no inline BN strings in Dart/TSX |
| L-04 | **Glossary consistency** — one term per concept (see glossary) |
| L-05 | **API returns both** — `nameBn` + `nameEn`; client picks by locale |
| L-06 | **Numbers locale-aware** — BN digits optional setting |
| L-07 | **Recommendation disclaimers** — legal/safety text in both locales |

---

## 3. Translation Key Namespaces (new)

Add to `assets/i18n/bn.json` / `en.json`:

```
livestock.*          — animal UI
livestock.species.*  — species labels
livestock.purpose.*  — purpose labels
livestock.health.*   — health status
feed.catalog.*       — catalog picker
feed.inventory.*     — stock UI (extend existing)
feed.recommendation.* — ration screen
analytics.*          — dashboard
vendor.*             — marketplace prep
unit.*               — kg, mon, seer, bag
```

Estimated new keys: **180–220** (Phase 4 scope).

---

## 4. Bangladesh Glossary (mandatory terms)

| Key concept | BN (preferred) | EN | Avoid |
|-------------|----------------|-----|-------|
| Livestock | পশু | Livestock | Animal (in user UI) |
| Cattle | গরু | Cattle | Cow (when generic) |
| Goat | ছাগল | Goat | |
| Feed | খাবার / খাদ্য | Feed | Food (human connotation) |
| Roughage | খড়-ভুসি | Roughage | |
| Concentrate | ঘন খাদ্য | Concentrate | |
| Oil cake | খৈল | Oil cake | |
| Bran | ভুসি | Bran | |
| Inventory / stock | মজুদ | Stock | Inventory (user-facing) |
| Ear tag | কানের ট্যাগ | Ear tag | |
| Vaccination | টিকা | Vaccination | |
| Milk yield | দুধ উৎপাদন | Milk production | |
| Feed efficiency | খাবার দক্ষতা | Feed efficiency | |
| Profit/loss | লাভ-ক্ষতি | Profit & loss | |

Full glossary: reuse `pranidoctor_user/docs/localization/TRANSLATION_GLOSSARY.md` — extend with Phase 4 section.

---

## 5. Master Data Display Rules

### Feed catalog

```dart
String displayName(FeedCatalogItem item, Locale locale) {
  if (locale.languageCode == 'bn') {
    return item.nameBn.isNotEmpty ? item.nameBn : item.nameEn;
  }
  return item.nameEn.isNotEmpty ? item.nameEn : item.nameBn;
}
```

### Breeds, vendors, seasonal notes

Same pattern — BN preferred with EN fallback.

### Nutrition labels

| Field | BN label |
|-------|----------|
| cpPercent | কাঁচা প্রোটিন (%) |
| tdnPercent | TDN (%) |
| dmPercent | শুষ্ক পদার্থ (%) |

---

## 6. API i18n

### Error messages

Mobile API returns:

```json
{ "error": { "code": "INSUFFICIENT_STOCK", "message": "...", "messageBn": "..." } }
```

Flutter `UserErrorMapper` prefers localized field when locale is BN.

### Recommendation warnings

Array of `{ code, messageBn, messageEn }` — client selects one.

### Admin-only strings

English acceptable; BN subtitles for field labels in forms.

---

## 7. Units & Formats

### Unit display map

| Unit enum | BN | EN |
|-----------|-----|-----|
| KG | কেজি | kg |
| BAG | বস্তা | bag |
| BUNDLE | গোছা | bundle |
| LITER | লিটার | L |
| MON | মণ | mon (40 kg) |
| SEER | সের | seer |

Show conversion hint: "১ মণ = ৪০ কেজি"

### Dates

- BN: `২৯ মে ২০২৬` via `app_date_format.dart`
- Relative: "গতকাল", "আজ"

### Currency

- Always `৳` prefix: `৳১,২৫০`
- Use grouping per locale

---

## 8. Voice & Tone (BN)

| Context | Style |
|---------|-------|
| Empty state | Encouraging, simple: "এখনো কোনো পশু যোগ করা হয়নি" |
| Errors | Clear action: "মজুদ কম — আগে স্টক যোগ করুন" |
| Recommendations | Advisory, not commanding: "আপনি চাইলে এই খাবার বাড়াতে পারেন" |
| Disclaimers | Formal: "এটি veterinary পরামর্শের বিকল্প নয়" |

Reference: `docs/localization/BN_LANGUAGE_STYLE_GUIDE.md`

---

## 9. Offline & Sync

Cached catalog includes **both** `nameBn` and `nameEn` — locale switch works offline.

Draft payloads store enum codes only — labels resolved at render.

---

## 10. CI & Quality Gates

| Check | Tool |
|-------|------|
| Missing keys | `build_localization.dart` diff fails CI |
| Key parity BN/EN | audit script in `docs/localization/` |
| Glossary drift | manual review on PRs touching feed/livestock |
| Hardcoded string scan | grep for Bengali in `lib/features/` (allowlist widgets) |

---

## 11. Implementation Checklist

- [ ] Add Phase 4 keys to `bn.json` + `en.json`
- [ ] Run key generator
- [ ] Replace hardcoded strings in inventory, feed, animals features
- [ ] Extend API DTOs with `messageBn` where needed
- [ ] Admin form BN labels for new vendor screens
- [ ] Update glossary doc
- [ ] QA both locales on all new screens — [testing-checklist.md](./testing-checklist.md)

---

## 12. Related Documents

- [flutter-architecture.md](./flutter-architecture.md)
- [feed-engine-plan.md](./feed-engine-plan.md)
- [livestock-health-plan.md](./livestock-health-plan.md)
- `pranidoctor_user/docs/localization/LOCALIZATION_MASTER_PLAN.md`
