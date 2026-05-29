import { appendAdminCorrelationHeaders } from "@/lib/logging/client-logger";

export type AdminLegalRequirement = {
  documentKey: string;
  version: string;
  title: string;
  publicUrl: string | null;
  accepted: boolean;
  acceptedAt: string | null;
};

export type AdminLegalStatus = {
  allAccepted: boolean;
  pendingDocuments: AdminLegalRequirement[];
  requirements: AdminLegalRequirement[];
};

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

export async function fetchAdminLegalStatus(): Promise<AdminLegalStatus> {
  const res = await fetch("/api/admin/legal/status", {
    credentials: "same-origin",
    cache: "no-store",
    headers: appendAdminCorrelationHeaders(),
  });
  const body = await res.json();
  if (!res.ok) throw new Error("Failed to load legal status");
  return parseEnvelope<AdminLegalStatus>(body);
}

export async function acceptAdminLegalDocument(input: {
  documentKey: string;
  version: string;
}): Promise<AdminLegalStatus> {
  const res = await fetch("/api/admin/legal/accept", {
    method: "POST",
    credentials: "same-origin",
    headers: appendAdminCorrelationHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(input),
  });
  const body = await res.json();
  if (!res.ok) throw new Error("Failed to record legal acceptance");
  return parseEnvelope<AdminLegalStatus>(body);
}
