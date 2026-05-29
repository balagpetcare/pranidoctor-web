import { AiEscalationDisclosureAdminPanel } from '@/components/admin/settings/AiEscalationDisclosureAdminPanel';
import { AdminPageHeader } from '@/components/admin-ui/AdminPageHeader';

export default function AiEscalationDisclosureSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <AdminPageHeader
        title="AI Escalation Disclosure"
        description="Manage human-review, emergency, and escalation-limitation copy shown when AI routes users to veterinarians or ops review."
      />
      <AiEscalationDisclosureAdminPanel />
    </div>
  );
}
