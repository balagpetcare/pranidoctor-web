import { describe, expect, it } from "vitest";
import { Cpu } from "lucide-react";

import { ADMIN_NAV_GROUPS } from "./admin-nav";
import { getAdminNavSectionsForSidebar } from "./admin-nav-sections";

describe("admin-nav-sections", () => {
  it("includes AI Center in sidebar sections", () => {
    const aiCenterGroup = ADMIN_NAV_GROUPS.find((g) => g.id === "ai-center");
    expect(aiCenterGroup).toBeDefined();

    const sections = getAdminNavSectionsForSidebar(ADMIN_NAV_GROUPS);
    const aiCenterSection = sections.find((s) => s.id === "sec-ai-center");

    expect(aiCenterSection).toBeDefined();
    expect(aiCenterSection?.titleBn).toBe("এআই সেন্টার");
    expect(aiCenterSection?.groups).toHaveLength(1);
    expect(aiCenterSection?.groups[0]?.id).toBe("ai-center");
    expect(aiCenterSection?.groups[0]?.labelEn).toBe("AI Center");
    expect(aiCenterSection?.groups[0]?.icon).toBe(Cpu);
    expect(aiCenterSection?.groups[0]?.children.length).toBeGreaterThanOrEqual(11);
  });

  it("keeps AI Technician Operations in a separate section", () => {
    const sections = getAdminNavSectionsForSidebar(ADMIN_NAV_GROUPS);
    const aiOpsSection = sections.find((s) => s.id === "sec-ai");
    const aiCenterSection = sections.find((s) => s.id === "sec-ai-center");

    expect(aiOpsSection?.groups.map((g) => g.id)).toEqual(["ai-technician-mgmt"]);
    expect(aiCenterSection?.groups.map((g) => g.id)).toEqual(["ai-center"]);
    expect(aiOpsSection?.id).not.toBe(aiCenterSection?.id);
  });
});
