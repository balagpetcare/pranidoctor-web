import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const baseProdEnv: Record<string, string> = {
  NODE_ENV: "production",
  APP_ENV: "production",
  SKIP_PRODUCTION_ENV_VALIDATION: "false",  ADMIN_JWT_SECRET: "x".repeat(32),
  OTP_MODE: "live",
  OTP_DEBUG_PANEL_ENABLED: "false",
  ENABLE_DEV_OTP: "false",
  BACKEND_URL: "https://api.example.com",
  NEXT_PUBLIC_API_URL: "https://api.example.com/api",
};

describe("production-validation", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  function stubProdEnv(overrides: Record<string, string | undefined> = {}) {
    for (const [key, value] of Object.entries({ ...baseProdEnv, ...overrides })) {
      if (value === undefined) {
        vi.stubEnv(key, "");
      } else {
        vi.stubEnv(key, value);
      }
    }
  }

  it("skips validation outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("APP_ENV", "development");
    const { validateProductionEnv } = await import("./production-validation");
    expect(validateProductionEnv().ok).toBe(true);
  });

  it("passes with valid production env", async () => {
    stubProdEnv();
    const { validateProductionEnv } = await import("./production-validation");
    expect(validateProductionEnv().ok).toBe(true);
  });

  it("fails when ADMIN_JWT_SECRET is too short", async () => {
    stubProdEnv({ ADMIN_JWT_SECRET: "short-secret" });
    const { validateProductionEnv } = await import("./production-validation");
    const result = validateProductionEnv();
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("ADMIN_JWT_SECRET"))).toBe(true);
  });

  it("fails when OTP_MODE is dev", async () => {
    stubProdEnv({ OTP_MODE: "dev" });
    const { validateProductionEnv } = await import("./production-validation");
    const result = validateProductionEnv();
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("OTP_MODE"))).toBe(true);
  });

  it("fails when debug flags are enabled", async () => {
    stubProdEnv({ OTP_DEBUG_PANEL_ENABLED: "true" });
    const { validateProductionEnv } = await import("./production-validation");
    expect(validateProductionEnv().ok).toBe(false);

    vi.unstubAllEnvs();
    stubProdEnv({ ENABLE_DEV_OTP: "true" });
    const mod = await import("./production-validation");
    expect(mod.validateProductionEnv().ok).toBe(false);
  });

  it("can be skipped with SKIP_PRODUCTION_ENV_VALIDATION", async () => {
    stubProdEnv({ ADMIN_JWT_SECRET: "short", SKIP_PRODUCTION_ENV_VALIDATION: "true" });
    const { shouldValidateProductionEnv } = await import("./production-validation");
    expect(shouldValidateProductionEnv()).toBe(false);
  });
});
