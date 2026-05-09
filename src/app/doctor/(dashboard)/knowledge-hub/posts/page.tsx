import Link from "next/link";

import { DoctorKhPostsList } from "@/components/doctor/knowledge-hub/DoctorKhPostsList";
import { dkBtnPrimaryClass } from "@/components/doctor/knowledge-hub/styles";

export default function DoctorKnowledgeHubPostsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            আমার টিউটোরিয়াল
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            শুধুমাত্র আপনার লেখা পোস্ট দেখাচ্ছে।
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/doctor/knowledge-hub"
            className="text-sm text-teal-700 hover:underline dark:text-teal-400"
          >
            ← নলেজ হাব
          </Link>
          <Link href="/doctor/knowledge-hub/posts/new" className={dkBtnPrimaryClass()}>
            নতুন পোস্ট
          </Link>
        </div>
      </div>
      <DoctorKhPostsList />
    </div>
  );
}
