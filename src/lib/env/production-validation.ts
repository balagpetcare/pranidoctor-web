import { edgeLog } from "@/lib/logging/edge-logger";

const PLACEHOLDER_ADMIN_SECRETS = new Set([
  "change-this-admin-secret",
  "replace-with-your-own-secret-at-least-32-chars-long",
]);

function writeBootLog(level: "warn" | "error", message: string, event: string): void {
  edgeLog[level](message, { event, metadata: { phase: "boot" } });
}

function parseBoolEnv(env: NodeJS.ProcessEnv, key: string): boolean {
  const v = env[key]?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

export function shouldValidateProductionEnv(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (parseBoolEnv(env, "SKIP_PRODUCTION_ENV_VALIDATION")) {
    return false;
  }
  const nodeEnv = env.NODE_ENV?.trim();
  const appEnv = env.APP_ENV?.trim();
  return nodeEnv === "production" || appEnv === "production";
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export type ProductionEnvValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export function validateProductionEnv(
  env: NodeJS.ProcessEnv = process.env,
): ProductionEnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!shouldValidateProductionEnv(env)) {
    return { ok: true, errors, warnings };
  }

  const adminSecret =
    env.ADMIN_JWT_SECRET?.trim() ||
    env.AUTH_SECRET?.trim() ||
    env.JWT_SECRET?.trim() ||
    "";

  if (!adminSecret || adminSecret.length < 32) {
    errors.push(
      "ADMIN_JWT_SECRET (or AUTH_SECRET/JWT_SECRET fallback) must be set and at least 32 characters in production",
    );
  } else if (PLACEHOLDER_ADMIN_SECRETS.has(adminSecret)) {
    errors.push("ADMIN_JWT_SECRET must not use placeholder values from .env.example");
  }

  const otpMode = env.OTP_MODE?.trim().toLowerCase();
  if (otpMode !== "live") {
    errors.push("OTP_MODE must be live in production");
  }

  if (parseBoolEnv(env, "OTP_DEBUG_PANEL_ENABLED")) {
    errors.push("OTP_DEBUG_PANEL_ENABLED must be false in production");
  }

  if (parseBoolEnv(env, "ENABLE_DEV_OTP")) {
    errors.push("ENABLE_DEV_OTP must be false in production");
  }

  const backendUrl = env.BACKEND_URL?.trim();
  if (!backendUrl) {
    errors.push("BACKEND_URL is required in production");
  } else if (!isValidHttpUrl(backendUrl)) {
    errors.push("BACKEND_URL must be a valid http(s) URL");
  } else if (env.APP_ENV?.trim() === "production") {
    try {
      const parsed = new URL(backendUrl);
      if (parsed.protocol !== "https:") {
        errors.push("BACKEND_URL must use https when APP_ENV=production");
      }
    } catch {
      errors.push("BACKEND_URL must be a valid http(s) URL");
    }
  }

  const apiUrl = env.NEXT_PUBLIC_API_URL?.trim();
  if (!apiUrl) {
    warnings.push("NEXT_PUBLIC_API_URL is unset — admin proxy may fall back to BACKEND_URL");
  } else if (!isValidHttpUrl(apiUrl)) {
    errors.push("NEXT_PUBLIC_API_URL must be a valid http(s) URL");
  }

  if (env.NODE_ENV === "production" && env.APP_ENV?.trim() !== "production") {
    warnings.push("NODE_ENV=production but APP_ENV is not production — confirm deployment target");
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function formatProductionEnvValidation(
  result: ProductionEnvValidationResult,
): string {
  const lines = ["Production environment validation:"];

  if (result.errors.length > 0) {
    lines.push("", "Errors:");
    for (const error of result.errors) {
      lines.push(`  ✗ ${error}`);
    }
  }

  if (result.warnings.length > 0) {
    lines.push("", "Warnings:");
    for (const warning of result.warnings) {
      lines.push(`  ⚠ ${warning}`);
    }
  }

  lines.push("", result.ok ? "Environment OK." : "Environment validation failed.");
  return lines.join("\n");
}

export function assertProductionEnvOrThrow(
  env: NodeJS.ProcessEnv = process.env,
): void {
  const result = validateProductionEnv(env);
  if (result.ok) {
    if (result.warnings.length > 0) {
      writeBootLog("warn", formatProductionEnvValidation(result), "env.production_validation");
    }
    return;
  }

  writeBootLog("error", formatProductionEnvValidation(result), "env.production_validation.failed");
  throw new Error("Production environment validation failed — refusing to start");
}
