import { describe, expect, it } from "vitest";

import { buildAdminBreadcrumbs } from "./admin-breadcrumbs";

describe("buildAdminBreadcrumbs", () => {
  it("returns dashboard only for /admin", () => {
    expect(buildAdminBreadcrumbs("/admin")).toEqual([{ href: "/admin", label: "ড্যাশবোর্ড" }]);
  });

  it("builds doctors edit trail", () => {
    const crumbs = buildAdminBreadcrumbs("/admin/doctors/abc123/edit");
    expect(crumbs[0]?.label).toBe("ড্যাশবোর্ড");
    expect(crumbs.some((c) => c.label === "ডাক্তার")).toBe(true);
    expect(crumbs.at(-1)?.label).toBe("সম্পাদনা");
  });

  it("builds enterprise tab trail", () => {
    const crumbs = buildAdminBreadcrumbs("/enterprise/services/review/pending");
    expect(crumbs.some((c) => c.label === "এন্টারপ্রাইজ সেবা পর্যালোচনা")).toBe(true);
    expect(crumbs.at(-1)?.label).toBe("অপেক্ষমাণ");
  });
});
