import type { ErrorEvent, EventHint } from "@sentry/nextjs";

const SENSITIVE_HEADER_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-auth-token",
]);

import { isClientErrorTrackingEnabled } from "./config";

/** Shared Sentry env helpers and PII scrubbing for admin web. */

function parseBoolEnv(key: string, def: boolean): boolean {
  const v = process.env[key]?.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return def;
}

export function isSentryEnabled(): boolean {
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) return false;
  return parseBoolEnv("SENTRY_ENABLED", true);
}

export function getClientSentryDsn(): string | null {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return dsn || null;
}

export function isClientSentryEnabled(): boolean {
  if (!getClientSentryDsn()) return false;
  if (!isClientErrorTrackingEnabled()) return false;
  return parseBoolEnv("SENTRY_ENABLED", true);
}

export function getSentryEnvironment(): string {
  return process.env.APP_ENV?.trim() || process.env.NODE_ENV || "development";
}

export function getSentryRelease(): string | undefined {
  const version =
    process.env.APP_VERSION?.trim() ||
    process.env.npm_package_version?.trim();
  if (!version) return undefined;
  return `pranidoctor-web-admin@${version}`;
}

export function getSentryTracesSampleRate(): number {
  const raw = process.env.SENTRY_TRACES_SAMPLE_RATE?.trim();
  const parsed = raw ? Number(raw) : 0.1;
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  if (parsed > 1) return 1;
  return parsed;
}

/** Strip auth headers and direct PII before events are sent. */
export function scrubSentryEvent(
  event: ErrorEvent,
  _hint?: EventHint,
): ErrorEvent | null {
  if (event.request?.headers) {
    for (const key of Object.keys(event.request.headers)) {
      if (SENSITIVE_HEADER_KEYS.has(key.toLowerCase())) {
        delete event.request.headers[key];
      }
    }
  }

  if (event.user) {
    delete event.user.email;
    delete event.user.username;
    delete event.user.ip_address;
  }

  return event;
}
