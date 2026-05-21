export type ErrorTrackingContext = {
  digest?: string;
  route?: string;
  method?: string;
  source?: "server" | "client";
  tags?: Record<string, string>;
  requestId?: string;
  correlationId?: string;
  /** Structured log event name (defaults to error_tracking.client_exception). */
  event?: string;
  /** Human-readable log message (defaults to "Captured client exception"). */
  message?: string;
};
