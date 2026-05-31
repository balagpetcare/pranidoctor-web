import { Noto_Sans_Bengali } from "next/font/google";
import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { AdminLoginBackground } from "@/components/admin/login/AdminLoginBackground";
import { AdminLoginHero } from "@/components/admin/login/AdminLoginHero";

import "@/components/admin/login/admin-login.css";

import { APP_VERSION } from "@/lib/app-version";

const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

function AdminLoginFormFallback() {
  return (
    <div
      className="pd-admin-login-glass mx-auto w-full max-w-[480px] rounded-[24px] px-8 py-12 text-center text-sm text-[#6B7280]"
      lang="bn"
      role="status"
      aria-live="polite"
    >
      লোড হচ্ছে… / Loading…
    </div>
  );
}

export default function AdminLoginPage() {
  const platformVersion = APP_VERSION;

  return (
    <div
      className={`pd-admin-login relative min-h-screen bg-[#F5FAF7] text-[#111827] dark:bg-[#F5FAF7] dark:text-[#111827] ${notoBengali.className}`}
    >
      <AdminLoginBackground />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] flex-col lg:flex-row">
        <div className="w-full px-4 pb-6 pt-6 sm:px-6 sm:pt-8 lg:w-[45%] lg:pb-10 lg:pt-10">
          <AdminLoginHero />
        </div>

        <div className="flex w-full flex-1 items-center justify-center px-4 pb-10 pt-2 sm:px-6 lg:w-[55%] lg:px-10 lg:py-10">
          <Suspense fallback={<AdminLoginFormFallback />}>
            <AdminLoginForm platformVersion={platformVersion} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
