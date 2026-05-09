import { DoctorServiceRequestsList } from "@/components/doctor/DoctorServiceRequestsList";

export default function DoctorCompletedCasesPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        সম্পন্ন কেস
      </h2>
      <DoctorServiceRequestsList tab="completed" />
    </div>
  );
}
