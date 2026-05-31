import {
  CLIENT_CORRELATION_STORAGE_KEY,
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
} from "./constants";
import { generateLogId } from "./correlation";
import { redactMetadata } from "./redact";
import type { LogLevel, StructuredLogEntry } from "./types";

function getClientLogLevel(): LogLevel {
  const raw = process.env.NEXT_PUBLIC_LOG_LEVEL?.trim().toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") {
    return raw;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function shouldLog(level: LogLevel): boolean {
  return LEVEL_RANK[level] >= LEVEL_RANK[getClientLogLevel()];
}

export function getClientCorrelationId(): string {
  if (typeof window === "undefined") return "server-render";

  try {
    const existing = window.sessionStorage.getItem(CLIENT_CORRELATION_STORAGE_KEY);
    if (existing) return existing;
    const created = generateLogId();
    window.sessionStorage.setItem(CLIENT_CORRELATION_STORAGE_KEY, created);
    return created;
  } catch {
    return generateLogId();
  }
}

export function appendAdminCorrelationHeaders(
  headers: HeadersInit = {},
): HeadersInit {
  const correlationId = getClientCorrelationId();
  const requestId = generateLogId();
  const h = new Headers(headers);
  h.set(CORRELATION_ID_HEADER, correlationId);
  h.set(REQUEST_ID_HEADER, requestId);
  return h;
}

function serializeError(error: unknown): StructuredLogEntry["error"] {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { name: "Error", message: String(error) };
}

function emit(entry: StructuredLogEntry): void {
  const line = JSON.stringify(entry);
  if (process.env.NODE_ENV === "production") {
    const writer =
      entry.level === "error"
        ? console.error
        : entry.level === "warn"
          ? console.warn
          : console.info;
    writer(line);
    return;
  }

  const writer =
    entry.level === "error"
      ? console.error
      : entry.level === "warn"
        ? console.warn
        : entry.level === "debug"
          ? console.debug
          : console.info;

  if (
    entry.event === "admin.api.failure" &&
    entry.metadata &&
    typeof entry.metadata === "object"
  ) {
    const m = entry.metadata as Record<string, unknown>;
    writer(`[${entry.level}] ${entry.message}`, {
      url: m.url ?? m.path,
      method: m.method,
      status: m.status,
      durationMs: m.durationMs,
      responseBody: m.responseBody,
      errorMessage: m.errorMessage,
      errorStack: m.errorStack,
      correlationId: entry.correlationId,
      event: entry.event,
    });
    return;
  }

  writer(`[${entry.level}] ${entry.message}`, entry);
}

type ClientLogOptions = {
  event?: string;
  metadata?: Record<string, unknown>;
  error?: unknown;
  requestId?: string;
  correlationId?: string;
};

function log(level: LogLevel, message: string, options: ClientLogOptions = {}): void {
  if (!shouldLog(level)) return;

  const entry: StructuredLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    service: "pranidoctor-web-admin",
    scope: "client",
    message,
    correlationId: options.correlationId ?? getClientCorrelationId(),
    ...(options.requestId ? { requestId: options.requestId } : {}),
    ...(options.event ? { event: options.event } : {}),
    ...(options.metadata ? { metadata: redactMetadata(options.metadata) } : {}),
    ...(options.error ? { error: serializeError(options.error) } : {}),
  };

  emit(entry);
}

export const clientLog = {
  debug(message: string, options?: ClientLogOptions) {
    log("debug", message, options);
  },
  info(message: string, options?: ClientLogOptions) {
    log("info", message, options);
  },
  warn(message: string, options?: ClientLogOptions) {
    log("warn", message, options);
  },
  error(message: string, options?: ClientLogOptions) {
    log("error", message, options);
  },
};
