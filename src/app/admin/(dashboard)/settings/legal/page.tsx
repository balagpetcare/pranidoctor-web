import { AdminActionButton } from "@/components/admin-ui/AdminActionButton";
import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { AdminLegalSettingsForm } from "@/components/admin/legal/AdminLegalSettingsForm";

export default function AdminLegalSettingsPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col space-y-6" lang="bn">
      <AdminActionButton href="/admin/settings" variant="ghost">
        ← সেটিংস
      </AdminActionButton>
      <AdminPageHeader
        title="Legal & privacy"
        description="Manage privacy policy versions, in-app summaries, and review consent audit events."
      />
      <AdminLegalSettingsForm />
    </div>
  );
}
