"use client";

import {
  acceptDoctorLegalDocument,
  fetchDoctorLegalStatus,
} from "@/lib/doctor-legal/doctor-legal-api";
import { PanelLegalGate } from "@/components/legal/PanelLegalGate";

export function DoctorLegalGate() {
  return (
    <PanelLegalGate
      enabled
      title="Veterinary Provider Agreement"
      description="You must accept the provider agreement before using the doctor panel."
      fetchStatus={fetchDoctorLegalStatus}
      acceptDocument={acceptDoctorLegalDocument}
    />
  );
}
