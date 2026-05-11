-- Location master: find duplicate administrative `code` values (PostgreSQL).
-- Run: psql "$env:DATABASE_URL" -f scripts/diagnostics/location-code-duplicates.sql
-- (PowerShell: use connection string from .env)

-- 1) Division.code duplicated (non-null codes only)
SELECT d.code, COUNT(*) AS cnt, ARRAY_AGG(d.id ORDER BY d.slug) AS ids, ARRAY_AGG(d.slug ORDER BY d.slug) AS slugs
FROM "Division" d
WHERE d.code IS NOT NULL AND TRIM(d.code) <> ''
GROUP BY d.code
HAVING COUNT(*) > 1
ORDER BY cnt DESC;

-- 2) District: same divisionId + code
SELECT d."divisionId", d.code, COUNT(*) AS cnt,
       ARRAY_AGG(d.id ORDER BY d.slug) AS ids,
       ARRAY_AGG(d.slug ORDER BY d.slug) AS slugs
FROM "District" d
WHERE d.code IS NOT NULL AND TRIM(d.code) <> ''
GROUP BY d."divisionId", d.code
HAVING COUNT(*) > 1
ORDER BY cnt DESC;

-- 3) Upazila: same districtId + code
SELECT u."districtId", u.code, COUNT(*) AS cnt,
       ARRAY_AGG(u.id ORDER BY u.slug) AS ids,
       ARRAY_AGG(u.slug ORDER BY u.slug) AS slugs
FROM "Upazila" u
WHERE u.code IS NOT NULL AND TRIM(u.code) <> ''
GROUP BY u."districtId", u.code
HAVING COUNT(*) > 1
ORDER BY cnt DESC;

-- 4) Union: same upazilaId + code
SELECT u."upazilaId", u.code, COUNT(*) AS cnt,
       ARRAY_AGG(u.id ORDER BY u.slug) AS ids,
       ARRAY_AGG(u.slug ORDER BY u.slug) AS slugs
FROM "Union" u
WHERE u.code IS NOT NULL AND TRIM(u.code) <> ''
GROUP BY u."upazilaId", u.code
HAVING COUNT(*) > 1
ORDER BY cnt DESC;
