import Link from "next/link";

import { dkBtnPrimaryClass, dkCardClass } from "@/components/doctor/knowledge-hub/styles";
import { cn } from "@/lib/cn";

export default function DoctorKnowledgeHubPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8" lang="bn">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          নলেজ হাব
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          টিউটোরিয়াল লিখুন, খসড়া রাখুন এবং অ্যাডমিন অনুমোদনের জন্য জমা দিন।
        </p>
      </div>

      <div className={cn(dkCardClass(), "space-y-4")}>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          অনুমোদন ও প্রত্যাখ্যান শুধুমাত্র <strong>অ্যাডমিন প্যানেল</strong> থেকে হয়।
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/doctor/knowledge-hub/posts" className={dkBtnPrimaryClass()}>
            আমার পোস্ট
          </Link>
          <Link
            href="/doctor/knowledge-hub/posts/new"
            className="inline-flex justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            নতুন পোস্ট
          </Link>
        </div>
      </div>
    </div>
  );
}
