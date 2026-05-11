import { PawPrint } from "lucide-react";
import { Noto_Sans_Bengali } from "next/font/google";
import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function AdminLoginPage() {
  return (
    <div
      className={`relative flex min-h-screen flex-col ${notoBengali.className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-emerald-50/90 via-zinc-50 to-zinc-100 dark:from-emerald-950/40 dark:via-zinc-950 dark:to-zinc-950"
        aria-hidden
      />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-16">
        <header className="mb-6 flex max-w-sm flex-col items-center text-center sm:mb-8">
          <div
            className="mb-4 hidden h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-sm ring-1 ring-emerald-900/10 dark:bg-emerald-950/60 dark:text-emerald-200 dark:ring-emerald-500/20 sm:flex"
            aria-hidden
          >
            <PawPrint className="h-7 w-7" strokeWidth={1.75} />
          </div>
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-800/80 dark:text-emerald-400/90">
            Prani Doctor
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Prani Doctor Admin
          </h1>
          <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Admin Dashboard Login
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Authorized staff only. Use the email or phone on your admin account.
          </p>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-zinc-500 dark:text-zinc-500">
            শুধুমাত্র অনুমোদিত অ্যাডমিন — আপনার অ্যাকাউন্টের ইমেইল বা মোবাইল নম্বর ব্যবহার করুন।
          </p>
        </header>

        <Suspense
          fallback={
            <div
              className="rounded-2xl border border-zinc-200/80 bg-white/90 px-8 py-10 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-400"
              lang="bn"
            >
              লোড হচ্ছে… / Loading…
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
