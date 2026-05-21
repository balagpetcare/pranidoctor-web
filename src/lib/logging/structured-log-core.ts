import { redactMetadata } from "./redact";
import type { LogLevel, StructuredLogEntry } from "./types";

export const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export function getConfiguredLogLevel(): LogLevel {
  const raw = process.env.LOG_LEVEL?.trim().toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") {
    return raw;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

export function shouldLogLevel(level: LogLevel): boolean {
  return LEVEL_RANK[level] >= LEVEL_RANK[getConfiguredLogLevel()];
}

export function serializeLogError(error: unknown): StructuredLogEntry["error"] {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { name: "Error", message: String(error) };
}

export type BuildStructuredLogEntryInput = {
  level: LogLevel;
  message: string;
  service: string;
  scope: StructuredLogEntry["scope"];
  event?: string;
  requestId?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
  error?: unknown;
  version?: string;
};

export function buildStructuredLogEntry(
  input: BuildStructuredLogEntryInput,
): StructuredLogEntry {
  const metadata = redactMetadata({
    ...(input.version ? { version: input.version } : {}),
    ...(input.metadata ?? {}),
  });

  return {
    timestamp: new Date().toISOString(),
    level: input.level,
    service: input.service,
    scope: input.scope,
    message: input.message,
    ...(input.event ? { event: input.event } : {}),
    ...(input.requestId ? { requestId: input.requestId } : {}),
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
    ...(metadata && Object.keys(metadata).length > 0 ? { metadata } : {}),
    ...(input.error ? { error: serializeLogError(input.error) } : {}),
  };
}
