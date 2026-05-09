import { DoctorCaseDetailPanel } from "@/components/doctor/DoctorCaseDetailPanel";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DoctorCaseDetailPage({ params }: PageProps) {
  const { id } = await params;

  return <DoctorCaseDetailPanel requestId={id} />;
}
