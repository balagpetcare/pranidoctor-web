import { describe, expect, it } from "vitest";

import { USER_ROLE } from "./user-role";
import { adminCan } from "./permissions";

const superAdmin = {
  id: "1",
  email: "sa@test",
  displayName: null,
  role: USER_ROLE.SUPER_ADMIN,
};
const admin = {
  id: "2",
  email: "ad@test",
  displayName: null,
  role: USER_ROLE.ADMIN,
};
const support = {
  id: "3",
  email: "su@test",
  displayName: null,
  role: USER_ROLE.SUPPORT,
};

describe("API keys permissions (Option A)", () => {
  it("grants ai.secrets.view to SUPER_ADMIN and ADMIN", () => {
    expect(adminCan(superAdmin, "ai.secrets.view")).toBe(true);
    expect(adminCan(admin, "ai.secrets.view")).toBe(true);
    expect(adminCan(support, "ai.secrets.view")).toBe(false);
  });

  it("grants ai.secrets.manage to SUPER_ADMIN only", () => {
    expect(adminCan(superAdmin, "ai.secrets.manage")).toBe(true);
    expect(adminCan(admin, "ai.secrets.manage")).toBe(false);
    expect(adminCan(support, "ai.secrets.manage")).toBe(false);
  });
});
