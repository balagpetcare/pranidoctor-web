import { getAppVersion, getServiceName } from "@/lib/monitoring/config";

import {
  buildStructuredLogEntry,
  shouldLogLevel,
} from "./structured-log-core";
import { writeStructuredLogLine } from "./log-sink";
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

  const entry = buildStructuredLogEntry({
    level,
    message,
    service: getServiceName("admin"),
    scope: "server",
    version: getAppVersion(),
    event: options.event,
    requestId: options.requestId,
    correlationId: options.correlationId,
    metadata: options.metadata,
    error: options.error,
  });

  writeStructuredLogLine(JSON.stringify(entry), level, "edge");
}

/** Structured logger safe for Edge Runtime and instrumentation bundles. */
export const edgeLog = {
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
