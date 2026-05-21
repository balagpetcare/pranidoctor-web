import {
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
} from "./constants";

export type RequestCorrelation = {
  requestId: string;
  correlationId: string;
};

export function generateLogId(): string {
  return crypto.randomUUID();
}

export function resolveRequestCorrelation(
  headers: Headers | Readonly<Headers> | { get(name: string): string | null },
): RequestCorrelation {
  const requestId =
    headers.get(REQUEST_ID_HEADER)?.trim() || generateLogId();
  const correlationId =
    headers.get(CORRELATION_ID_HEADER)?.trim() || requestId;

  return { requestId, correlationId };
}

export function applyRequestCorrelationHeaders(
  headers: Headers,
  ids: RequestCorrelation,
): void {
  headers.set(REQUEST_ID_HEADER, ids.requestId);
  headers.set(CORRELATION_ID_HEADER, ids.correlationId);
}
