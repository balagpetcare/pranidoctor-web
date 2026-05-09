import Link from "next/link";

import { DoctorKhPostForm } from "@/components/doctor/knowledge-hub/DoctorKhPostForm";

export default function DoctorNewKnowledgePostPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" lang="bn">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          নতুন টিউটোরিয়াল
        </h1>
        <Link
          href="/doctor/knowledge-hub/posts"
          className="text-sm text-teal-700 hover:underline dark:text-teal-400"
        >
          ← তালিকা
        </Link>
      </div>
      <DoctorKhPostForm mode="create" />
    </div>
  );
}
