import { monitoringLog } from "../log";

import {
  getAlertAppVersion,
  getAlertDedupWindowMs,
  getAlertEnvironment,
  getAlertEscalationThreshold,
  getAlertServiceName,
  getAlertStormLimit,
  getAlertWebhookUrl,
  isAlertingEnabled,
} from "./alert-config";
import { AlertDeduplicator } from "./alert-deduplicator";
import {
  DEFAULT_RUNBOOK,
  type AlertEscalation,
  type ProductionAlertInput,
  type ProductionAlertPayload,
  severityToTier,
} from "./alert-types";

const deduplicator = new AlertDeduplicator(
  getAlertDedupWindowMs(),
  getAlertEscalationThreshold(),
  getAlertStormLimit,
);

export type SendAlertResult = {
  sent: boolean;
  reason?: "disabled" | "deduplicated" | "storm_suppressed" | "no_webhook";
  escalation?: AlertEscalation;
};

function dedupKey(input: ProductionAlertInput): string {
  return input.fingerprint
    ? `${input.alertId}:${input.fingerprint}`
    : input.alertId;
}

function buildPayload(
  input: ProductionAlertInput,
  escalation: AlertEscalation,
): ProductionAlertPayload {
  return {
    event: "production.alert",
    alertId: input.alertId,
    title: input.title,
    message: input.message,
    severity: input.severity,
    tier: severityToTier(input.severity),
    service: getAlertServiceName(),
    environment: getAlertEnvironment(),
    version: getAlertAppVersion(),
    timestamp: new Date().toISOString(),
    escalation,
    runbook: input.runbook ?? DEFAULT_RUNBOOK,
    ...(input.metadata ? { metadata: input.metadata } : {}),
  };
}

export async function sendProductionAlert(
  input: ProductionAlertInput,
): Promise<SendAlertResult> {
  if (!isAlertingEnabled()) {
    return { sent: false, reason: "disabled" };
  }

  const decision = deduplicator.evaluate(dedupKey(input), input.severity);
  const escalation: AlertEscalation = {
    repeatCount: decision.repeatCount,
    escalated: decision.escalated,
    escalationLevel: decision.escalationLevel,
    deduplicated: decision.deduplicated,
  };

  if (!decision.allow) {
    if (decision.deduplicated) {
      monitoringLog.info("Alert suppressed (deduplicated)", {
        event: "monitoring.alert.suppressed",
        metadata: { alertId: input.alertId, repeatCount: decision.repeatCount },
      });
      return { sent: false, reason: "deduplicated", escalation };
    }
    if (decision.stormSuppressed) {
      monitoringLog.warn("Alert suppressed (storm limit)", {
        event: "monitoring.alert.storm_suppressed",
        metadata: { alertId: input.alertId, severity: input.severity },
      });
      return { sent: false, reason: "storm_suppressed", escalation };
    }
  }

  const webhookUrl = getAlertWebhookUrl();
  const payload = buildPayload(input, escalation);

  if (!webhookUrl) {
    monitoringLog.warn(`${input.title}: ${input.message}`, {
      event: "monitoring.alert",
      metadata: {
        alertId: input.alertId,
        severity: input.severity,
        escalation,
        ...input.metadata,
      },
    });
    return { sent: false, reason: "no_webhook", escalation };
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { sent: true, escalation };
  } catch (error) {
    monitoringLog.error("Alert webhook delivery failed", {
      event: "monitoring.alert.webhook_failed",
      error,
      metadata: { alertId: input.alertId, title: input.title },
    });
    return { sent: false, reason: "no_webhook", escalation };
  }
}

export function sendCriticalAlert(
  alertId: string,
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
  fingerprint?: string,
): void {
  void sendProductionAlert({
    alertId,
    title,
    message,
    severity: "critical",
    metadata,
    fingerprint,
  });
}

export function sendWarningAlert(
  alertId: string,
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
  fingerprint?: string,
): void {
  void sendProductionAlert({
    alertId,
    title,
    message,
    severity: "warning",
    metadata,
    fingerprint,
  });
}

export function sendInformationalAlert(
  alertId: string,
  title: string,
  message: string,
  metadata?: Record<string, unknown>,
  fingerprint?: string,
): void {
  void sendProductionAlert({
    alertId,
    title,
    message,
    severity: "info",
    metadata,
    fingerprint,
  });
}

export function resetProductionAlertingForTests(): void {
  deduplicator.reset();
}
