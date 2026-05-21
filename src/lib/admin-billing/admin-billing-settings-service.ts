/** DTO for GET/PUT /api/admin/settings/billing (API consumer). */
export type AdminBillingSettingsDto = {
  commissionPercent: number;
  commissionRate: number;
  explanation?: string | null;
};
