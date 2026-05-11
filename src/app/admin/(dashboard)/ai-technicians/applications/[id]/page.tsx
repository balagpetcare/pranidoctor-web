import { ApplicationReviewPanel } from "@/components/admin/ai-technicians/ApplicationReviewPanel";

type PageProps = { params: Promise<{ id: string }> };

export default async function AiTechnicianApplicationDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  return <ApplicationReviewPanel applicationId={id} />;
}
