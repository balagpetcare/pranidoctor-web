import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { listPendingVerification } from "@/lib/locations/location-master-admin";

export default async function AdminLocationsPendingVerificationPage() {
  const items = await listPendingVerification({ level: "ALL", limit: 80 });

  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader
        title="অনিরীক্ষিত লোকেশন"
        description={`isVerified = false সক্রিয় রেকর্ডের নমুনা (সর্বোচ্চ ${items.length} সারি)।`}
        actions={
          <Link className="text-sm text-blue-600 underline" href="/admin/locations">
            ফিরে যান
          </Link>
        }
      />

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-600">
            <tr>
              <th className="px-3 py-2">স্তর</th>
              <th className="px-3 py-2">কোড</th>
              <th className="px-3 py-2">নাম (EN)</th>
              <th className="px-3 py-2">নাম (BN)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100">
                <td className="px-3 py-2 font-mono text-xs">{r.level}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.code ?? "—"}</td>
                <td className="px-3 py-2">{r.nameEn}</td>
                <td className="px-3 py-2">{r.nameBn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
