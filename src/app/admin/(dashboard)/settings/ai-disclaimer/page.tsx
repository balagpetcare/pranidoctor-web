import { AiDisclaimerAdminPanel } from '@/components/admin/settings/AiDisclaimerAdminPanel';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';

export default function AiDisclaimerSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <AdminPageHeader
        title="AI Disclaimer"
        description="Manage banner, contextual, and consent text. Bump consent version to require re-acceptance."
      />
      <AiDisclaimerAdminPanel />
    </div>
  );
}
