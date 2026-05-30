import { AiComplianceAdminPanel } from '@/components/admin/settings/AiComplianceAdminPanel';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';

export default function AiComplianceSettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <AdminPageHeader
        title="AI Compliance Rules"
        description="Enable banners, emergency surfacing, and compliance audit logging."
      />
      <AiComplianceAdminPanel />
    </div>
  );
}
