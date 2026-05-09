import Link from "next/link";

import { DoctorKhPostForm } from "@/components/doctor/knowledge-hub/DoctorKhPostForm";

type PageProps = { params: Promise<{ id: string }> };

export default async function DoctorEditKnowledgePostPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-3xl space-y-6" lang="bn">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          সম্পাদনা
        </h1>
        <Link
          href={`/doctor/knowledge-hub/posts/${id}`}
          className="text-sm text-teal-700 hover:underline dark:text-teal-400"
        >
          ← বিস্তারিত
        </Link>
      </div>
      <DoctorKhPostForm mode="edit" postId={id} />
    </div>
  );
}
