import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";

import {
  ServiceRequestsList,
  type ServiceRequestsListProps,
} from "./ServiceRequestsList";

export type ServiceRequestsPageShellProps = {
  title: string;
  description: string;
  listProps?: ServiceRequestsListProps;
};

export function ServiceRequestsPageShell({
  title,
  description,
  listProps,
}: ServiceRequestsPageShellProps) {
  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader title={title} description={description} />
      <ServiceRequestsList {...listProps} />
    </div>
  );
}
