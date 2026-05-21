export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogScope = "server" | "client";

export type StructuredLogEntry = {
  timestamp: string;
  level: LogLevel;
  service: string;
  scope: LogScope;
  message: string;
  event?: string;
  requestId?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
};
