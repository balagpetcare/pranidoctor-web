import "server-only";

import { getAppVersion, getServiceName } from "@/lib/monitoring/config";

import { writeStructuredLogLine } from "./log-sink";
import { getRequestContext } from "./request-context";
import {
  buildStructuredLogEntry,
  shouldLogLevel,
} from "./structured-log-core";
import type { LogLevel } from "./types";

type LogOptions = {
  event?: string;
  metadata?: Record<string, unknown>;
  error?: unknown;
  requestId?: string;
  correlationId?: string;
};

function log(level: LogLevel, message: string, options: LogOptions = {}): void {
  if (!shouldLogLevel(level)) return;

  const ctx = getRequestContext();
  const entry = buildStructuredLogEntry({
    level,
    message,
    service: getServiceName("admin"),
    scope: "server",
    version: getAppVersion(),
    event: options.event,
    requestId: options.requestId ?? ctx?.requestId,
    correlationId: options.correlationId ?? ctx?.correlationId,
    metadata: options.metadata,
    error: options.error,
  });

  writeStructuredLogLine(JSON.stringify(entry), level, "node");
}

export const serverLog = {
  debug(message: string, options?: LogOptions) {
    log("debug", message, options);
  },
  info(message: string, options?: LogOptions) {
    log("info", message, options);
  },
  warn(message: string, options?: LogOptions) {
    log("warn", message, options);
  },
  error(message: string, options?: LogOptions) {
    log("error", message, options);
  },
};

export function createServerLogger(bindings: LogOptions) {
  return {
    debug(message: string, options?: LogOptions) {
      serverLog.debug(message, { ...bindings, ...options });
    },
    info(message: string, options?: LogOptions) {
      serverLog.info(message, { ...bindings, ...options });
    },
    warn(message: string, options?: LogOptions) {
      serverLog.warn(message, { ...bindings, ...options });
    },
    error(message: string, options?: LogOptions) {
      serverLog.error(message, { ...bindings, ...options });
    },
  };
}
