import Link from "next/link";

import { DoctorEarningsSummary } from "@/components/doctor/DoctorEarningsSummary";

export default function DoctorHomePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <DoctorEarningsSummary />
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          স্বাগতম
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          নিচের লিংক থেকে আপনার সেবা অনুরোধগুলো দেখুন।
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        <li>
          <Link
            href="/doctor/requests/new"
            className="block rounded-xl border border-zinc-200 bg-white p-4 text-sm font-medium text-teal-900 shadow-sm hover:border-teal-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-teal-100 dark:hover:border-teal-700"
          >
            নতুন অনুরোধ
          </Link>
        </li>
        <li>
          <Link
            href="/doctor/requests/active"
            className="block rounded-xl border border-zinc-200 bg-white p-4 text-sm font-medium text-teal-900 shadow-sm hover:border-teal-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-teal-100 dark:hover:border-teal-700"
          >
            চলমান কেস
          </Link>
        </li>
        <li>
          <Link
            href="/doctor/requests/completed"
            className="block rounded-xl border border-zinc-200 bg-white p-4 text-sm font-medium text-teal-900 shadow-sm hover:border-teal-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-teal-100 dark:hover:border-teal-700"
          >
            সম্পন্ন
          </Link>
        </li>
      </ul>
    </div>
  );
}
