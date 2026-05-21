import type { Metadata } from "next";

import { AdminErrorBoundary } from "@/components/admin-ui/AdminErrorBoundary";

/** Enterprise admin routes share panel auth; exclude from search indexes. */
export const metadata: Metadata = {
  title: {
    default: "Enterprise · Prani Doctor",
    template: "%s · Prani Doctor Enterprise",
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function EnterpriseRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminErrorBoundary scope="enterprise">{children}</AdminErrorBoundary>;
}
