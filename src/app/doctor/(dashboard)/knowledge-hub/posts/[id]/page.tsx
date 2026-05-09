import Link from "next/link";

import { DoctorKhPostDetail } from "@/components/doctor/knowledge-hub/DoctorKhPostDetail";

type PageProps = { params: Promise<{ id: string }> };

export default async function DoctorKnowledgePostDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="space-y-4">
      <Link
        href="/doctor/knowledge-hub/posts"
        className="text-sm text-teal-700 hover:underline dark:text-teal-400"
        lang="bn"
      >
        ← আমার পোস্ট
      </Link>
      <DoctorKhPostDetail postId={id} />
    </div>
  );
}
