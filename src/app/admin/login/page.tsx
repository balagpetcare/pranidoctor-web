import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <Suspense
        fallback={
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading…
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
