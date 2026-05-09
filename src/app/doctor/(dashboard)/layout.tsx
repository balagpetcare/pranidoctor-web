import { Noto_Sans_Bengali } from "next/font/google";

import { DoctorDashboardShell } from "@/components/doctor/DoctorDashboardShell";
import { ensureDoctorDashboardAccess } from "@/lib/doctor-auth/dashboard-guard";

const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default async function DoctorDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await ensureDoctorDashboardAccess();

  return (
    <div className={notoBengali.className}>
      <DoctorDashboardShell>{children}</DoctorDashboardShell>
    </div>
  );
}
