# Union parent mapping — human review

Generated **2026-05-10T16:52:00.053Z** (machine timestamp, UTC).

This file is **guidance only**. It does **not** approve mappings. Edit the simple review CSV and run the apply script when you are ready.

- **Total source parent contexts:** 131
- **Total affected union rows (sum of per-context counts from review notes):** 1099
- **Rows in unions-unmatched.csv (data rows):** 1099 (reference only)

## Recommendation legend

| Tag | Meaning |
|-----|---------|
| **APPROVE_CANDIDATE_1** | Candidate 1 looks strong on text heuristics — **still verify** in master CSVs before you APPROVE in the simple review file. |
| **REVIEW_CANDIDATES** | Compare candidates 1–3 (and reasons); pick one or use manual codes. |
| **MANUAL_TARGET_REQUIRED** | No candidate 1 triple — you must supply HDX codes from `divisions.csv` / `districts.csv` / `upazilas.csv`. |
| **SKIP_FOR_NOW** | Broken or unmapped nuhil parent chain — fix upstream nuhil rows or defer; mapping may be impossible until source data is corrected. |

## Failure: `nuhil_district_name_no_match`

### Division: Barisal (nuhil div **4**)

#### District: Barisal (nuhil district **33**)

##### Upazila: Agailjhara / আগৈলঝাড়া (nuhil upazila **255**)

- **review_id:** `R-4-33-255` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 5
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `4` / `33` / `255`
- **Candidate 1:** codes 10/1006/10060002 \| EN: Barishal / Barishal / Agailjhara \| BN: বরিশাল বিভাগ \| reason: Within mapped HDX division (Barisal); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Babuganj / বাবুগঞ্জ (nuhil upazila **251**)

- **review_id:** `R-4-33-251` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `4` / `33` / `251`
- **Candidate 1:** codes 10/1006/10060003 \| EN: Barishal / Barishal / Babuganj \| BN: বরিশাল বিভাগ \| reason: Within mapped HDX division (Barisal); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Bakerganj / বাকেরগঞ্জ (nuhil upazila **250**)

- **review_id:** `R-4-33-250` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 14
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `4` / `33` / `250`
- **Candidate 1:** codes 10/1006/10060007 \| EN: Barishal / Barishal / Bakerganj \| BN: বরিশাল বিভাগ \| reason: Within mapped HDX division (Barisal); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Banaripara / বানারীপাড়া (nuhil upazila **253**)

- **review_id:** `R-4-33-253` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 8
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `4` / `33` / `253`
- **Candidate 1:** codes 10/1006/10060010 \| EN: Barishal / Barishal / Banaripara \| BN: বরিশাল বিভাগ \| reason: Within mapped HDX division (Barisal); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Barisal Sadar / বরিশাল সদর (nuhil upazila **249**)

- **review_id:** `R-4-33-249` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `4` / `33` / `249`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Gournadi / গৌরনদী (nuhil upazila **254**)

- **review_id:** `R-4-33-254` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `4` / `33` / `254`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Hizla / হিজলা (nuhil upazila **258**)

- **review_id:** `R-4-33-258` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `4` / `33` / `258`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Mehendiganj / মেহেন্দিগঞ্জ (nuhil upazila **256**)

- **review_id:** `R-4-33-256` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 13
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `4` / `33` / `256`
- **Candidate 1:** codes 10/1006/10060062 \| EN: Barishal / Barishal / Mehendiganj \| BN: বরিশাল বিভাগ \| reason: Within mapped HDX division (Barisal); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Muladi / মুলাদী (nuhil upazila **257**)

- **review_id:** `R-4-33-257` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `4` / `33` / `257`
- **Candidate 1:** codes 10/1006/10060069 \| EN: Barishal / Barishal / Muladi \| BN: বরিশাল বিভাগ \| reason: Within mapped HDX division (Barisal); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Wazirpur / উজিরপুর (nuhil upazila **252**)

- **review_id:** `R-4-33-252` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 9
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `4` / `33` / `252`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Jhalakathi (nuhil district **30**)

##### Upazila: Jhalakathi Sadar / ঝালকাঠি সদর (nuhil upazila **230**)

- **review_id:** `R-4-30-230` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `4` / `30` / `230`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Kathalia / কাঠালিয়া (nuhil upazila **231**)

- **review_id:** `R-4-30-231` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `4` / `30` / `231`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Nalchity / নলছিটি (nuhil upazila **232**)

- **review_id:** `R-4-30-232` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `4` / `30` / `232`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Rajapur / রাজাপুর (nuhil upazila **233**)

- **review_id:** `R-4-30-233` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `4` / `30` / `233`
- **Candidate 1:** codes 10/1042/10420084 \| EN: Barishal / Jhalokati / Rajapur \| BN: বরিশাল বিভাগ \| reason: Within mapped HDX division (Barisal); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

### Division: Chattagram (nuhil div **1**)

#### District: Coxsbazar (nuhil district **9**)

##### Upazila: Chakaria / চকরিয়া (nuhil upazila **81**)

- **review_id:** `R-1-9-81` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 16
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `1` / `9` / `81`
- **Candidate 1:** codes 20/2022/20220016 \| EN: Chattogram / Cox's Bazar / Chakaria \| BN: চট্টগ্রাম বিভাগ \| reason: Within mapped HDX division (Chattagram); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Coxsbazar Sadar / কক্সবাজার সদর (nuhil upazila **80**)

- **review_id:** `R-1-9-80` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `9` / `80`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Kutubdia / কুতুবদিয়া (nuhil upazila **82**)

- **review_id:** `R-1-9-82` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `1` / `9` / `82`
- **Candidate 1:** codes 20/2022/20220045 \| EN: Chattogram / Cox's Bazar / Kutubdia \| BN: চট্টগ্রাম বিভাগ \| reason: Within mapped HDX division (Chattagram); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Moheshkhali / মহেশখালী (nuhil upazila **84**)

- **review_id:** `R-1-9-84` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 8
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `9` / `84`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Pekua / পেকুয়া (nuhil upazila **85**)

- **review_id:** `R-1-9-85` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `1` / `9` / `85`
- **Candidate 1:** codes 20/2022/20220056 \| EN: Chattogram / Cox's Bazar / Pekua \| BN: চট্টগ্রাম বিভাগ \| reason: Within mapped HDX division (Chattagram); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Ramu / রামু (nuhil upazila **86**)

- **review_id:** `R-1-9-86` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 11
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `1` / `9` / `86`
- **Candidate 1:** codes 20/2022/20220066 \| EN: Chattogram / Cox's Bazar / Ramu \| BN: চট্টগ্রাম বিভাগ \| reason: Within mapped HDX division (Chattagram); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Teknaf / টেকনাফ (nuhil upazila **87**)

- **review_id:** `R-1-9-87` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `1` / `9` / `87`
- **Candidate 1:** codes 20/2022/20220090 \| EN: Chattogram / Cox's Bazar / Teknaf \| BN: চট্টগ্রাম বিভাগ \| reason: Within mapped HDX division (Chattagram); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Ukhiya / উখিয়া (nuhil upazila **83**)

- **review_id:** `R-1-9-83` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 5
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `9` / `83`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

### Division: Mymensingh (nuhil div **8**)

#### District: Netrokona (nuhil district **64**)

##### Upazila: Atpara / আটপাড়া (nuhil upazila **485**)

- **review_id:** `R-8-64-485` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `8` / `64` / `485`
- **Candidate 1:** codes 45/4572/45720004 \| EN: Mymensingh / Netrakona / Atpara \| BN: ময়মনসিংহ বিভাগ \| reason: Within mapped HDX division (Mymensingh); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Barhatta / বারহাট্টা (nuhil upazila **482**)

- **review_id:** `R-8-64-482` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `8` / `64` / `482`
- **Candidate 1:** codes 45/4572/45720009 \| EN: Mymensingh / Netrakona / Barhatta \| BN: ময়মনসিংহ বিভাগ \| reason: Within mapped HDX division (Mymensingh); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Durgapur / দুর্গাপুর (nuhil upazila **483**)

- **review_id:** `R-8-64-483` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `8` / `64` / `483`
- **Candidate 1:** codes 45/4572/45720018 \| EN: Mymensingh / Netrakona / Durgapur \| BN: ময়মনসিংহ বিভাগ \| reason: Within mapped HDX division (Mymensingh); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** codes 50/5081/50810031 \| EN: Rajshahi / Rajshahi / Durgapur \| BN: রাজশাহী বিভাগ \| reason: Different HDX division than nuhil-mapped 45; Exact normalized English (or cross-field) upazila name match
- **Candidate 3:** (no candidate)

##### Upazila: Kalmakanda / কলমাকান্দা (nuhil upazila **488**)

- **review_id:** `R-8-64-488` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 8
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `8` / `64` / `488`
- **Candidate 1:** codes 45/4572/45720040 \| EN: Mymensingh / Netrakona / Kalmakanda \| BN: ময়মনসিংহ বিভাগ \| reason: Within mapped HDX division (Mymensingh); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Kendua / কেন্দুয়া (nuhil upazila **484**)

- **review_id:** `R-8-64-484` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 13
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `8` / `64` / `484`
- **Candidate 1:** codes 45/4572/45720047 \| EN: Mymensingh / Netrakona / Kendua \| BN: ময়মনসিংহ বিভাগ \| reason: Within mapped HDX division (Mymensingh); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Khaliajuri / খালিয়াজুরী (nuhil upazila **487**)

- **review_id:** `R-8-64-487` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `8` / `64` / `487`
- **Candidate 1:** codes 45/4572/45720038 \| EN: Mymensingh / Netrakona / Khaliajuri \| BN: ময়মনসিংহ বিভাগ \| reason: Within mapped HDX division (Mymensingh); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** codes 60/6058/60580035 \| EN: Sylhet / Moulvibazar / Juri \| BN: সিলেট বিভাগ \| reason: Different HDX division than nuhil-mapped 45; Upazila name similarity only (weak — verify district)
- **Candidate 3:** (no candidate)

##### Upazila: Madan / মদন (nuhil upazila **486**)

- **review_id:** `R-8-64-486` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 8
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `8` / `64` / `486`
- **Candidate 1:** codes 45/4572/45720056 \| EN: Mymensingh / Netrakona / Madan \| BN: ময়মনসিংহ বিভাগ \| reason: Within mapped HDX division (Mymensingh); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Mohongonj / মোহনগঞ্জ (nuhil upazila **489**)

- **review_id:** `R-8-64-489` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `8` / `64` / `489`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Netrokona Sadar / নেত্রকোণা সদর (nuhil upazila **491**)

- **review_id:** `R-8-64-491` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 12
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `8` / `64` / `491`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Purbadhala / পূর্বধলা (nuhil upazila **490**)

- **review_id:** `R-8-64-490` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 11
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `8` / `64` / `490`
- **Candidate 1:** codes 45/4572/45720083 \| EN: Mymensingh / Netrakona / Purbadhala \| BN: ময়মনসিংহ বিভাগ \| reason: Within mapped HDX division (Mymensingh); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

### Division: Rajshahi (nuhil div **2**)

#### District: Chapainawabganj (nuhil district **18**)

##### Upazila: Bholahat / ভোলাহাট (nuhil upazila **158**)

- **review_id:** `R-2-18-158` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 4
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `2` / `18` / `158`
- **Candidate 1:** codes 50/5070/50700018 \| EN: Rajshahi / Chapainababganj / Bholahat \| BN: রাজশাহী বিভাগ \| reason: Within mapped HDX division (Rajshahi); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Chapainawabganj Sadar / চাঁপাইনবাবগঞ্জ সদর (nuhil upazila **155**)

- **review_id:** `R-2-18-155` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 14
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `2` / `18` / `155`
- **Candidate 1:** codes 50/5070/50700066 \| EN: Rajshahi / Chapainababganj / Chapainawabganj Sadar \| BN: রাজশাহী বিভাগ \| reason: Within mapped HDX division (Rajshahi); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** codes 30/3026/30260062 \| EN: Dhaka / Dhaka / Nawabganj \| BN: ঢাকা বিভাগ \| reason: Different HDX division than nuhil-mapped 50; Upazila name similarity only (weak — verify district)
- **Candidate 3:** (no candidate)

##### Upazila: Gomostapur / গোমস্তাপুর (nuhil upazila **156**)

- **review_id:** `R-2-18-156` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 8
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `2` / `18` / `156`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Nachol / নাচোল (nuhil upazila **157**)

- **review_id:** `R-2-18-157` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 4
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **REVIEW_CANDIDATES**
- **Source codes:** `2` / `18` / `157`
- **Candidate 1:** codes 50/5070/50700056 \| EN: Rajshahi / Chapainababganj / Nachole \| BN: রাজশাহী বিভাগ \| reason: Within mapped HDX division (Rajshahi); Upazila name similarity only (weak — verify district)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Shibganj / শিবগঞ্জ (nuhil upazila **159**)

- **review_id:** `R-2-18-159` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 15
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **APPROVE_CANDIDATE_1**
- **Source codes:** `2` / `18` / `159`
- **Candidate 1:** codes 50/5010/50100094 \| EN: Rajshahi / Bogura / Shibganj \| BN: রাজশাহী বিভাগ \| reason: Within mapped HDX division (Rajshahi); Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** codes 50/5070/50700088 \| EN: Rajshahi / Chapainababganj / Shibganj \| BN: রাজশাহী বিভাগ \| reason: Within mapped HDX division (Rajshahi); Exact normalized English (or cross-field) upazila name match
- **Candidate 3:** (no candidate)

## Failure: `nuhil_upazila_name_no_match`

### Division: Barisal (nuhil div **4**)

#### District: Barguna (nuhil district **35**)

##### Upazila: Pathorghata / পাথরঘাটা (nuhil upazila **270**)

- **review_id:** `R-4-35-270` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `4` / `35` / `270`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Bhola (nuhil district **34**)

##### Upazila: Borhan Sddin / বোরহান উদ্দিন (nuhil upazila **260**)

- **review_id:** `R-4-34-260` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 5
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `4` / `34` / `260`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Charfesson / চরফ্যাশন (nuhil upazila **261**)

- **review_id:** `R-4-34-261` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 20
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `4` / `34` / `261`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Doulatkhan / দৌলতখান (nuhil upazila **262**)

- **review_id:** `R-4-34-262` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 9
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `4` / `34` / `262`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Pirojpur (nuhil district **32**)

##### Upazila: Nesarabad / নেছারাবাদ (nuhil upazila **248**)

- **review_id:** `R-4-32-248` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **REVIEW_CANDIDATES**
- **Source codes:** `4` / `32` / `248`
- **Candidate 1:** codes 10/1079/10790087 \| EN: Barishal / Pirojpur / Nesarabad (Swarupkathi) \| BN: বরিশাল বিভাগ \| reason: Within mapped HDX division (Barisal); District + upazila name similarity (token / substring)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Zianagar / জিয়ানগর (nuhil upazila **245**)

- **review_id:** `R-4-32-245` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 3
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `4` / `32` / `245`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

### Division: Chattagram (nuhil div **1**)

#### District: Bandarban (nuhil district **11**)

##### Upazila: Naikhongchhari / নাইক্ষ্যংছড়ি (nuhil upazila **99**)

- **review_id:** `R-1-11-99` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 5
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `11` / `99`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Brahmanbaria (nuhil district **3**)

##### Upazila: Bancharampur / বাঞ্ছারামপুর (nuhil upazila **31**)

- **review_id:** `R-1-3-31` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 13
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `3` / `31`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Chandpur (nuhil district **6**)

##### Upazila: Faridgonj / ফরিদগঞ্জ (nuhil upazila **59**)

- **review_id:** `R-1-6-59` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 15
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `6` / `59`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Matlab North / মতলব উত্তর (nuhil upazila **58**)

- **review_id:** `R-1-6-58` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 14
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `6` / `58`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Matlab South / মতলব দক্ষিণ (nuhil upazila **56**)

- **review_id:** `R-1-6-56` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `6` / `56`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Chattogram (nuhil district **8**)

##### Upazila: Karnafuli / কর্ণফুলী (nuhil upazila **79**)

- **review_id:** `R-1-8-79` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 5
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `8` / `79`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Mirsharai / মীরসরাই (nuhil upazila **67**)

- **review_id:** `R-1-8-67` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 16
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `8` / `67`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Cumilla (nuhil district **1**)

##### Upazila: Comilla Sadar / কুমিল্লা সদর (nuhil upazila **11**)

- **review_id:** `R-1-1-11` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `1` / `11`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Monohargonj / মনোহরগঞ্জ (nuhil upazila **13**)

- **review_id:** `R-1-1-13` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 11
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `1` / `13`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Sadarsouth / সদর দক্ষিণ (nuhil upazila **14**)

- **review_id:** `R-1-1-14` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 14
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `1` / `14`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Feni (nuhil district **2**)

##### Upazila: Parshuram / পরশুরাম (nuhil upazila **22**)

- **review_id:** `R-1-2-22` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 3
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `2` / `22`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Khagrachhari (nuhil district **10**)

##### Upazila: Laxmichhari / লক্ষীছড়ি (nuhil upazila **91**)

- **review_id:** `R-1-10-91` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 3
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `10` / `91`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Manikchari / মানিকছড়ি (nuhil upazila **93**)

- **review_id:** `R-1-10-93` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 4
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `10` / `93`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Mohalchari / মহালছড়ি (nuhil upazila **92**)

- **review_id:** `R-1-10-92` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 5
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `10` / `92`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Panchari / পানছড়ি (nuhil upazila **90**)

- **review_id:** `R-1-10-90` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 4
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `10` / `90`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Noakhali (nuhil district **5**)

##### Upazila: Hatia / হাতিয়া (nuhil upazila **46**)

- **review_id:** `R-1-5-46` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 9
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `5` / `46`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Senbug / সেনবাগ (nuhil upazila **49**)

- **review_id:** `R-1-5-49` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 9
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `5` / `49`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Sonaimori / সোনাইমুড়ী (nuhil upazila **51**)

- **review_id:** `R-1-5-51` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `5` / `51`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Rangamati (nuhil district **4**)

##### Upazila: Baghaichari / বাঘাইছড়ি (nuhil upazila **36**)

- **review_id:** `R-1-4-36` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 8
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **REVIEW_CANDIDATES**
- **Source codes:** `1` / `4` / `36`
- **Candidate 1:** codes 50/5081/50810010 \| EN: Rajshahi / Rajshahi / Bagha \| BN: রাজশাহী বিভাগ \| reason: Different HDX division than nuhil-mapped 20; Upazila name similarity only (weak — verify district)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Belaichari / বিলাইছড়ি (nuhil upazila **40**)

- **review_id:** `R-1-4-40` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 3
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `4` / `40`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Juraichari / জুরাছড়ি (nuhil upazila **41**)

- **review_id:** `R-1-4-41` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 4
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `1` / `4` / `41`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

### Division: Dhaka (nuhil div **6**)

#### District: Faridpur (nuhil district **52**)

##### Upazila: Charbhadrasan / চরভদ্রাসন (nuhil upazila **396**)

- **review_id:** `R-6-52-396` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 4
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `6` / `52` / `396`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Kishoreganj (nuhil district **45**)

##### Upazila: Karimgonj / করিমগঞ্জ (nuhil upazila **353**)

- **review_id:** `R-6-45-353` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 11
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `6` / `45` / `353`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Mithamoin / মিঠামইন (nuhil upazila **356**)

- **review_id:** `R-6-45-356` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `6` / `45` / `356`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Manikganj (nuhil district **46**)

##### Upazila: Doulatpur / দৌলতপুর (nuhil upazila **363**)

- **review_id:** `R-6-46-363` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 8
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `6` / `46` / `363`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Gior / ঘিওর (nuhil upazila **361**)

- **review_id:** `R-6-46-361` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `6` / `46` / `361`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Shibaloy / শিবালয় (nuhil upazila **362**)

- **review_id:** `R-6-46-362` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `6` / `46` / `362`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Singiar / সিংগাইর (nuhil upazila **364**)

- **review_id:** `R-6-46-364` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 11
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `6` / `46` / `364`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Munshiganj (nuhil district **48**)

##### Upazila: Gajaria / গজারিয়া (nuhil upazila **374**)

- **review_id:** `R-6-48-374` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 8
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `6` / `48` / `374`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Louhajanj / লৌহজং (nuhil upazila **373**)

- **review_id:** `R-6-48-373` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `6` / `48` / `373`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Narsingdi (nuhil district **40**)

##### Upazila: Monohardi / মনোহরদী (nuhil upazila **312**)

- **review_id:** `R-6-40-312` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 12
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `6` / `40` / `312`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Rajbari (nuhil district **49**)

##### Upazila: Pangsa / পাংশা (nuhil upazila **378**)

- **review_id:** `R-6-49-378` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `6` / `49` / `378`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Tangail (nuhil district **44**)

##### Upazila: Bhuapur / ভুয়াপুর (nuhil upazila **334**)

- **review_id:** `R-6-44-334` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `6` / `44` / `334`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

### Division: Khulna (nuhil div **3**)

#### District: Bagerhat (nuhil district **28**)

##### Upazila: Morrelganj / মোড়েলগঞ্জ (nuhil upazila **220**)

- **review_id:** `R-3-28-220` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 16
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `3` / `28` / `220`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Sarankhola / শরণখোলা (nuhil upazila **218**)

- **review_id:** `R-3-28-218` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 4
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `3` / `28` / `218`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Jashore (nuhil district **20**)

##### Upazila: Bagherpara / বাঘারপাড়া (nuhil upazila **173**)

- **review_id:** `R-3-20-173` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 9
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `3` / `20` / `173`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Chougachha / চৌগাছা (nuhil upazila **174**)

- **review_id:** `R-3-20-174` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 11
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `3` / `20` / `174`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Jessore Sadar / যশোর সদর (nuhil upazila **177**)

- **review_id:** `R-3-20-177` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 15
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `3` / `20` / `177`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Jhikargacha / ঝিকরগাছা (nuhil upazila **175**)

- **review_id:** `R-3-20-175` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 11
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `3` / `20` / `175`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Jhenaidah (nuhil district **29**)

##### Upazila: Moheshpur / মহেশপুর (nuhil upazila **229**)

- **review_id:** `R-3-29-229` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 12
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `3` / `29` / `229`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Khulna (nuhil district **27**)

##### Upazila: Botiaghata / বটিয়াঘাটা (nuhil upazila **212**)

- **review_id:** `R-3-27-212` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `3` / `27` / `212`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Dakop / দাকোপ (nuhil upazila **213**)

- **review_id:** `R-3-27-213` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 9
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `3` / `27` / `213`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Digholia / দিঘলিয়া (nuhil upazila **208**)

- **review_id:** `R-3-27-208` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `3` / `27` / `208`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Fultola / ফুলতলা (nuhil upazila **207**)

- **review_id:** `R-3-27-207` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 4
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `3` / `27` / `207`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Paikgasa / পাইকগাছা (nuhil upazila **206**)

- **review_id:** `R-3-27-206` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `3` / `27` / `206`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Rupsha / রূপসা (nuhil upazila **209**)

- **review_id:** `R-3-27-209` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 5
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `3` / `27` / `209`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Satkhira (nuhil district **21**)

##### Upazila: Assasuni / আশাশুনি (nuhil upazila **179**)

- **review_id:** `R-3-21-179` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 11
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `3` / `21` / `179`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

### Division: Mymensingh (nuhil div **8**)

#### District: Jamalpur (nuhil district **63**)

##### Upazila: Bokshiganj / বকশীগঞ্জ (nuhil upazila **481**)

- **review_id:** `R-8-63-481` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `8` / `63` / `481`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Dewangonj / দেওয়ানগঞ্জ (nuhil upazila **478**)

- **review_id:** `R-8-63-478` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 8
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `8` / `63` / `478`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Melandah / মেলান্দহ (nuhil upazila **476**)

- **review_id:** `R-8-63-476` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 11
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **REVIEW_CANDIDATES**
- **Source codes:** `8` / `63` / `476`
- **Candidate 1:** codes 45/4539/45390061 \| EN: Mymensingh / Jamalpur / Melandaha \| BN: ময়মনসিংহ বিভাগ \| reason: Within mapped HDX division (Mymensingh); District + upazila name similarity (token / substring)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Mymensingh (nuhil district **62**)

##### Upazila: Iswarganj / ঈশ্বরগঞ্জ (nuhil upazila **472**)

- **review_id:** `R-8-62-472` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 11
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `8` / `62` / `472`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Muktagacha / মুক্তাগাছা (nuhil upazila **465**)

- **review_id:** `R-8-62-465` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `8` / `62` / `465`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Phulpur / ফুলপুর (nuhil upazila **468**)

- **review_id:** `R-8-62-468` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `8` / `62` / `468`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Sherpur (nuhil district **61**)

##### Upazila: Nokla / নকলা (nuhil upazila **460**)

- **review_id:** `R-8-61-460` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 9
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `8` / `61` / `460`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Sreebordi / শ্রীবরদী (nuhil upazila **459**)

- **review_id:** `R-8-61-459` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `8` / `61` / `459`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

### Division: Rajshahi (nuhil div **2**)

#### District: Bogura (nuhil district **14**)

##### Upazila: Bogra Sadar / বগুড়া সদর (nuhil upazila **123**)

- **review_id:** `R-2-14-123` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 11
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `2` / `14` / `123`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Dhunot / ধুনট (nuhil upazila **130**)

- **review_id:** `R-2-14-130` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `2` / `14` / `130`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Dupchanchia / দুপচাচিঁয়া (nuhil upazila **126**)

- **review_id:** `R-2-14-126` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `2` / `14` / `126`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Nondigram / নন্দিগ্রাম (nuhil upazila **128**)

- **review_id:** `R-2-14-128` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 5
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `2` / `14` / `128`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Shariakandi / সারিয়াকান্দি (nuhil upazila **124**)

- **review_id:** `R-2-14-124` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 12
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `2` / `14` / `124`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Naogaon (nuhil district **19**)

##### Upazila: Badalgachi / বদলগাছী (nuhil upazila **161**)

- **review_id:** `R-2-19-161` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 8
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `2` / `19` / `161`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Mohadevpur / মহাদেবপুর (nuhil upazila **160**)

- **review_id:** `R-2-19-160` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `2` / `19` / `160`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Pabna (nuhil district **13**)

##### Upazila: Atghoria / আটঘরিয়া (nuhil upazila **118**)

- **review_id:** `R-2-13-118` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 5
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `2` / `13` / `118`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Ishurdi / ঈশ্বরদী (nuhil upazila **114**)

- **review_id:** `R-2-13-114` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `2` / `13` / `114`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Rajshahi (nuhil district **15**)

##### Upazila: Mohonpur / মোহনপুর (nuhil upazila **136**)

- **review_id:** `R-2-15-136` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `2` / `15` / `136`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Sirajganj (nuhil district **12**)

##### Upazila: Chauhali / চৌহালি (nuhil upazila **105**)

- **review_id:** `R-2-12-105` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `2` / `12` / `105`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Kamarkhand / কামারখন্দ (nuhil upazila **106**)

- **review_id:** `R-2-12-106` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 4
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **REVIEW_CANDIDATES**
- **Source codes:** `2` / `12` / `106`
- **Candidate 1:** codes 50/5088/50880044 \| EN: Rajshahi / Sirajganj / Kamarkhanda \| BN: রাজশাহী বিভাগ \| reason: Within mapped HDX division (Rajshahi); District + upazila name similarity (token / substring)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Raigonj / রায়গঞ্জ (nuhil upazila **108**)

- **review_id:** `R-2-12-108` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 9
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `2` / `12` / `108`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

### Division: Rangpur (nuhil div **7**)

#### District: Dinajpur (nuhil district **54**)

##### Upazila: Kaharol / কাহারোল (nuhil upazila **410**)

- **review_id:** `R-7-54-410` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **REVIEW_CANDIDATES**
- **Source codes:** `7` / `54` / `410`
- **Candidate 1:** codes 55/5527/55270056 \| EN: Rangpur / Dinajpur / Kaharole \| BN: রংপুর বিভাগ \| reason: Within mapped HDX division (Rangpur); District + upazila name similarity (token / substring)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Nawabganj / নবাবগঞ্জ (nuhil upazila **404**)

- **review_id:** `R-7-54-404` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 9
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **REVIEW_CANDIDATES**
- **Source codes:** `7` / `54` / `404`
- **Candidate 1:** codes 30/3026/30260062 \| EN: Dhaka / Dhaka / Nawabganj \| BN: ঢাকা বিভাগ \| reason: Different HDX division than nuhil-mapped 55; Exact normalized English (or cross-field) upazila name match
- **Candidate 2:** codes 50/5070/50700066 \| EN: Rajshahi / Chapainababganj / Chapainawabganj Sadar \| BN: রাজশাহী বিভাগ \| reason: Different HDX division than nuhil-mapped 55; Upazila name similarity only (weak — verify district)
- **Candidate 3:** (no candidate)

#### District: Gaibandha (nuhil district **57**)

##### Upazila: Phulchari / ফুলছড়ি (nuhil upazila **434**)

- **review_id:** `R-7-57-434` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 7
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `7` / `57` / `434`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Kurigram (nuhil district **60**)

##### Upazila: Charrajibpur / চর রাজিবপুর (nuhil upazila **456**)

- **review_id:** `R-7-60-456` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 3
- **Manual target likely required:** No (hint — still verify)
- **Recommended human action (guidance):** **REVIEW_CANDIDATES**
- **Source codes:** `7` / `60` / `456`
- **Candidate 1:** codes 55/5549/55490008 \| EN: Rangpur / Kurigram / Rajibpur \| BN: রংপুর বিভাগ \| reason: Within mapped HDX division (Rangpur); District + upazila name similarity (token / substring)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Rowmari / রৌমারী (nuhil upazila **455**)

- **review_id:** `R-7-60-455` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 5
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `7` / `60` / `455`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Nilphamari (nuhil district **56**)

##### Upazila: Kishorganj / কিশোরগঞ্জ (nuhil upazila **426**)

- **review_id:** `R-7-56-426` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 9
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `7` / `56` / `426`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Syedpur / সৈয়দপুর (nuhil upazila **422**)

- **review_id:** `R-7-56-422` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 5
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `7` / `56` / `422`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Panchagarh (nuhil district **53**)

##### Upazila: Atwari / আটোয়ারী (nuhil upazila **402**)

- **review_id:** `R-7-53-402` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `7` / `53` / `402`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Tetulia / তেতুলিয়া (nuhil upazila **403**)

- **review_id:** `R-7-53-403` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 8
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `7` / `53` / `403`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Rangpur (nuhil district **59**)

##### Upazila: Badargonj / বদরগঞ্জ (nuhil upazila **443**)

- **review_id:** `R-7-59-443` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `7` / `59` / `443`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Pirgacha / পীরগাছা (nuhil upazila **447**)

- **review_id:** `R-7-59-447` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 9
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `7` / `59` / `447`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Pirgonj / পীরগঞ্জ (nuhil upazila **445**)

- **review_id:** `R-7-59-445` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 15
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `7` / `59` / `445`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Taragonj / তারাগঞ্জ (nuhil upazila **442**)

- **review_id:** `R-7-59-442` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 5
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `7` / `59` / `442`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Thakurgaon (nuhil district **58**)

##### Upazila: Ranisankail / রাণীশংকৈল (nuhil upazila **437**)

- **review_id:** `R-7-58-437` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 8
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `7` / `58` / `437`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

### Division: Sylhet (nuhil div **5**)

#### District: Moulvibazar (nuhil district **37**)

##### Upazila: Barlekha / বড়লেখা (nuhil upazila **285**)

- **review_id:** `R-5-37-285` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 11
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `5` / `37` / `285`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Kamolganj / কমলগঞ্জ (nuhil upazila **286**)

- **review_id:** `R-5-37-286` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 9
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `5` / `37` / `286`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Sunamganj (nuhil district **39**)

##### Upazila: Bishwambarpur / বিশ্বম্ভরপুর (nuhil upazila **302**)

- **review_id:** `R-5-39-302` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 5
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `5` / `39` / `302`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: South Sunamganj / দক্ষিণ সুনামগঞ্জ (nuhil upazila **301**)

- **review_id:** `R-5-39-301` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 8
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `5` / `39` / `301`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

#### District: Sylhet (nuhil district **36**)

##### Upazila: Dakshinsurma / দক্ষিণ সুরমা (nuhil upazila **283**)

- **review_id:** `R-5-36-283` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 10
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `5` / `36` / `283`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

##### Upazila: Jaintiapur / জৈন্তাপুর (nuhil upazila **279**)

- **review_id:** `R-5-36-279` (format `R-{nuhil_division_id}-{nuhil_district_id}-{nuhil_upazila_id}`; empty segments appear as consecutive hyphens, e.g. `R--1-9`)
- **Affected union rows:** 6
- **Manual target likely required:** Yes (hint)
- **Recommended human action (guidance):** **MANUAL_TARGET_REQUIRED**
- **Source codes:** `5` / `36` / `279`
- **Candidate 1:** (no candidate)
- **Candidate 2:** (no candidate)
- **Candidate 3:** (no candidate)

