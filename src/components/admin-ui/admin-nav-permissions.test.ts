import { describe, expect, it } from "vitest";
import { Stethoscope } from "lucide-react";

import { USER_ROLE } from "@/lib/admin-auth/user-role";
import type { AdminNavItem } from "@/components/admin-ui/admin-nav";
import {
  filterAdminNavGroupsForActor,
  navItemVisibleForActor,
} from "@/components/admin-ui/admin-nav-permissions";

const gatedItem: AdminNavItem = {
  href: "/admin/audit",
  labelBn: "অডিট",
  titleEn: "Audit",
  icon: Stethoscope,
  roles: [USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN],
};

const openItem: AdminNavItem = {
  href: "/admin/doctors",
  labelBn: "ডাক্তার",
  titleEn: "Doctors",
  icon: Stethoscope,
};

const supportActor = {
  id: "1",
  email: "s@x.com",
  displayName: null,
  role: USER_ROLE.SUPPORT,
};

describe("admin-nav-permissions", () => {
  it("shows ungated items while auth is loading", () => {
    expect(navItemVisibleForActor(openItem, null, { authLoading: true })).toBe(true);
    expect(navItemVisibleForActor(gatedItem, null, { authLoading: true })).toBe(false);
  });

  it("hides role-gated items for SUPPORT", () => {
    expect(navItemVisibleForActor(gatedItem, supportActor)).toBe(false);
    expect(navItemVisibleForActor(openItem, supportActor)).toBe(true);
  });

  it("filter preserves open groups during auth loading", () => {
    const groups = filterAdminNavGroupsForActor(
      [
        {
          id: "t",
          labelEn: "T",
          labelBn: "T",
          titleEn: "T",
          icon: Stethoscope,
          children: [openItem, gatedItem],
        },
      ],
      null,
      { authLoading: true },
    );
    expect(groups[0]?.children).toHaveLength(1);
    expect(groups[0]?.children[0]?.href).toBe("/admin/doctors");
  });
});
