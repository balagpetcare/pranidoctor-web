import { clientLog } from "@/lib/logging/client-logger";



import type { ErrorTrackingContext } from "./error-tracking-types";

import {

  captureSentryClientException,

  initClientSentry,

  isClientSentryInitialized,

} from "./sentry-client";



export type { ErrorTrackingContext } from "./error-tracking-types";



export function captureClientException(

  error: unknown,

  context: ErrorTrackingContext = {},

): void {

  clientLog.error(context.message ?? "Captured client exception", {

    event: context.event ?? "error_tracking.client_exception",

    error,

    metadata: context,

    requestId: context.requestId,

    correlationId: context.correlationId,

  });



  if (!isClientSentryInitialized()) {

    initClientSentry();

  }

  captureSentryClientException(error, context);

}


