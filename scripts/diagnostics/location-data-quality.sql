-- Location master — data quality (duplicate codes/names, missing coords, unverified).
-- Run with psql, e.g.:
--   psql "%DATABASE_URL%" -f scripts/diagnostics/location-data-quality.sql
-- Or paste sections into your SQL client.

-- --- Duplicate division codes (non-empty code) ---
SELECT 'duplicate_division_codes' AS report, code, COUNT(*) AS cnt
FROM "Division"
WHERE code IS NOT NULL AND TRIM(code) <> ''
GROUP BY code
HAVING COUNT(*) > 1
ORDER BY cnt DESC, code;

-- --- Duplicate district codes under same division ---
SELECT 'duplicate_district_codes' AS report, "divisionId", code, COUNT(*) AS cnt
FROM "District"
WHERE code IS NOT NULL AND TRIM(code) <> ''
GROUP BY "divisionId", code
HAVING COUNT(*) > 1
ORDER BY cnt DESC, code;

-- --- Duplicate upazila codes under same district ---
SELECT 'duplicate_upazila_codes' AS report, "districtId", code, COUNT(*) AS cnt
FROM "Upazila"
WHERE code IS NOT NULL AND TRIM(code) <> ''
GROUP BY "districtId", code
HAVING COUNT(*) > 1
ORDER BY cnt DESC, code;

-- --- Duplicate union codes under same upazila ---
SELECT 'duplicate_union_codes' AS report, "upazilaId", code, COUNT(*) AS cnt
FROM "Union"
WHERE code IS NOT NULL AND TRIM(code) <> ''
GROUP BY "upazilaId", code
HAVING COUNT(*) > 1
ORDER BY cnt DESC, code;

-- --- Duplicate village labels under same union (normalized Bangla/English/name) ---
SELECT 'duplicate_village_names_under_union' AS report, "unionId", k, COUNT(*) AS cnt
FROM (
  SELECT "unionId", LOWER(TRIM(COALESCE("nameBn", "nameEn", name))) AS k
  FROM "Village"
  WHERE "isActive" = true
) v
GROUP BY "unionId", k
HAVING COUNT(*) > 1
ORDER BY cnt DESC
LIMIT 200;

-- --- Missing latitude or longitude by level (active rows only) ---
SELECT 'missing_coords_division' AS report, COUNT(*) AS cnt
FROM "Division" WHERE "isActive" = true AND (latitude IS NULL OR longitude IS NULL);
SELECT 'missing_coords_district' AS report, COUNT(*) AS cnt
FROM "District" WHERE "isActive" = true AND (latitude IS NULL OR longitude IS NULL);
SELECT 'missing_coords_upazila' AS report, COUNT(*) AS cnt
FROM "Upazila" WHERE "isActive" = true AND (latitude IS NULL OR longitude IS NULL);
SELECT 'missing_coords_union' AS report, COUNT(*) AS cnt
FROM "Union" WHERE "isActive" = true AND (latitude IS NULL OR longitude IS NULL);
SELECT 'missing_coords_village' AS report, COUNT(*) AS cnt
FROM "Village" WHERE "isActive" = true AND (latitude IS NULL OR longitude IS NULL);

-- --- Unverified rows by level ---
SELECT 'unverified_division' AS report, COUNT(*) AS cnt
FROM "Division" WHERE "isActive" = true AND "isVerified" = false;
SELECT 'unverified_district' AS report, COUNT(*) AS cnt
FROM "District" WHERE "isActive" = true AND "isVerified" = false;
SELECT 'unverified_upazila' AS report, COUNT(*) AS cnt
FROM "Upazila" WHERE "isActive" = true AND "isVerified" = false;
SELECT 'unverified_union' AS report, COUNT(*) AS cnt
FROM "Union" WHERE "isActive" = true AND "isVerified" = false;
SELECT 'unverified_village' AS report, COUNT(*) AS cnt
FROM "Village" WHERE "isActive" = true AND "isVerified" = false;
