import { VetDisclaimerAdminPanel } from '@/components/admin/settings/VetDisclaimerAdminPanel';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';

export default function VetDisclaimerSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <AdminPageHeader
        title="Veterinary Advice Disclaimer"
        description="Manage platform, emergency, booking, and treatment journal disclaimers. Bump consent version to require re-acceptance."
      />
      <VetDisclaimerAdminPanel />
    </div>
  );
}
