import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";

import type { RequestCorrelation } from "./correlation";

export type RequestLogContext = RequestCorrelation & {
  path?: string;
  method?: string;
};

const storage = new AsyncLocalStorage<RequestLogContext>();

export function runWithRequestContext<T>(
  context: RequestLogContext,
  fn: () => T,
): T {
  return storage.run(context, fn);
}

export function getRequestContext(): RequestLogContext | undefined {
  return storage.getStore();
}
