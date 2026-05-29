"use client";

import {
  acceptAdminLegalDocument,
  fetchAdminLegalStatus,
} from "@/lib/admin-legal/admin-legal-api";
import { useAdminAuth } from "@/lib/admin-auth/AdminAuthProvider";
import { PanelLegalGate } from "@/components/legal/PanelLegalGate";

export function AdminLegalGate() {
  const { status, refreshSession } = useAdminAuth();

  return (
    <PanelLegalGate
      enabled={status === "authenticated"}
      title="Admin Acceptable Use Policy"
      description="You must accept the current platform personnel policy before using the admin console."
      fetchStatus={fetchAdminLegalStatus}
      acceptDocument={acceptAdminLegalDocument}
      onAccepted={refreshSession}
    />
  );
}
