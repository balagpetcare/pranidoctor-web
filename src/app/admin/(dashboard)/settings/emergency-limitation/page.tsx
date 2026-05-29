import { EmergencyLimitationAdminPanel } from '@/components/admin/settings/EmergencyLimitationAdminPanel';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';

export default function EmergencyLimitationSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <AdminPageHeader
        title="Emergency Service Limitation Notice"
        description="Manage urgent, contextual, and full limitation copy for emergency workflows. Bump consent version to require re-acceptance on first emergency booking."
      />
      <EmergencyLimitationAdminPanel />
    </div>
  );
}
