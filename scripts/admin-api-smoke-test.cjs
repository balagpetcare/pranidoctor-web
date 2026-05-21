const fs = require("node:fs");
const path = require("node:path");

const WEB = process.env.WEB_URL ?? "http://localhost:3001";
const email = process.env.ADMIN_SEED_EMAIL ?? "admin@pranidoctor.com";
const password = process.env.ADMIN_SEED_PASSWORD ?? "12345678";

async function login(base) {
  const res = await fetch(`${base}/api/admin/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
    redirect: "manual",
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  const body = await res.json().catch(() => null);
  return { status: res.status, cookie, body };
}

async function get(base, pathName, cookie) {
  const res = await fetch(`${base}${pathName}`, {
    headers: cookie ? { cookie } : {},
    redirect: "manual",
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

const endpoints = [
  "/api/admin/auth/me",
  "/api/admin/dashboard/page-data",
  "/api/admin/areas?limit=5&offset=0",
  "/api/admin/locations/stats",
  "/api/admin/locations/import-report",
  "/api/admin/locations/missing-coords?level=division&limit=5",
  "/api/admin/locations/pending-verification?level=division&limit=5",
  "/api/admin/locations/duplicates?level=division&limit=5",
  "/api/admin/doctors?limit=5&offset=0",
  "/api/admin/ai-technicians?limit=5&offset=0",
  "/api/admin/ai-technician-applications?limit=5&offset=0",
  "/api/admin/ai-technician-complaints?limit=5&offset=0",
  "/api/admin/service-requests?limit=5&offset=0",
  "/api/admin/service-categories",
  "/api/admin/billing?limit=5&offset=0",
  "/api/admin/settings/billing",
  "/api/admin/content-categories",
  "/api/admin/tutorials?take=5&skip=0",
  "/api/admin/semen-providers?limit=5",
  "/api/admin/livestock-breeds?limit=5",
  "/api/admin/semen-service-templates?limit=5",
  "/api/admin/service-instances?limit=5",
  "/api/notifications?limit=5&offset=0",
  "/api/admin/dev-tools/otp-logs",
  "/api/admin/health",
];

async function main() {
  console.error("[smoke] starting");
  const webLogin = await login(WEB);
  console.error("[smoke] login", webLogin.status, Boolean(webLogin.cookie));
  if (!webLogin.cookie) {
    console.error("Login failed", webLogin.status, webLogin.body);
    process.exit(1);
  }

  const results = [];
  for (const ep of endpoints) {
    console.error("[smoke] GET", ep);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);
    let r;
    try {
      r = await get(WEB, ep, webLogin.cookie);
    } finally {
      clearTimeout(timer);
    }
    console.error("[smoke] GET", ep, r.status);
    const envelopeOk =
      r.body && typeof r.body === "object" && "ok" in r.body ? r.body.ok : null;
    results.push({
      endpoint: ep,
      status: r.status,
      envelopeOk,
      errorCode: r.body?.error?.code ?? null,
      hasData: Boolean(r.body?.data),
    });
  }

  const payload = { web: WEB, loginStatus: webLogin.status, results };
  const outPath = path.join(__dirname, "admin-api-smoke-results.json");
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${results.length} results to ${outPath}`);
}

main()
  .then(() => {
    console.error("[smoke] done");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
