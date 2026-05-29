/** DTO for GET/PUT /api/admin/settings/legal */
export type AdminLegalSettingsDto = {
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  privacyVersion: string;
  termsVersion: string;
  aiConsentVersion: string;
  privacyTitle: string;
  termsTitle: string;
  aiConsentTitle: string;
  privacyContent: string;
  termsContent: string;
  aiConsentContent: string;
  enforcePrivacyConsent: boolean;
  updatedAt: string | null;
};

export type LegalConsentAuditItem = {
  id: string;
  userId: string;
  consentType: "PRIVACY" | "TERMS" | "AI_PROCESSING";
  version: string;
  channel: string;
  ipAddress: string | null;
  createdAt: string;
};

export type LegalConsentAuditListDto = {
  items: LegalConsentAuditItem[];
  total: number;
  limit: number;
  offset: number;
};
