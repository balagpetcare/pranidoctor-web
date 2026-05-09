import { DoctorServiceRequestsList } from "@/components/doctor/DoctorServiceRequestsList";

export default function DoctorNewRequestsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        নতুন অনুরোধ
      </h2>
      <DoctorServiceRequestsList tab="new" />
    </div>
  );
}
