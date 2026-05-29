import { appendAdminCorrelationHeaders } from "@/lib/logging/client-logger";

import type { AdminLegalStatus } from "@/lib/admin-legal/admin-legal-api";

type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

function parseEnvelope<T>(body: unknown): T {
  const parsed = body as ApiEnvelope<T>;
  if (!parsed || typeof parsed !== "object" || !("ok" in parsed) || !parsed.ok) {
    throw new Error("Invalid legal API response");
  }
  return parsed.data;
}

export async function fetchDoctorLegalStatus(): Promise<AdminLegalStatus> {
  const res = await fetch("/api/doctor/legal/status", {
    credentials: "same-origin",
    cache: "no-store",
    headers: appendAdminCorrelationHeaders(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error("Failed to load legal status");
  return parseEnvelope<AdminLegalStatus>(body);
}

export async function acceptDoctorLegalDocument(input: {
  documentKey: string;
  version: string;
}): Promise<AdminLegalStatus> {
  const res = await fetch("/api/doctor/legal/accept", {
    method: "POST",
    credentials: "same-origin",
    headers: appendAdminCorrelationHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(input),
  });
  const body = await res.json();
  if (!res.ok) throw new Error("Failed to record legal acceptance");
  return parseEnvelope<AdminLegalStatus>(body);
}
