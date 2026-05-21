import Link from "next/link";

import { AdminPageHeader } from "@/components/admin-ui/AdminPageHeader";
import { listMissingCoords } from "@/lib/locations/location-master-admin-client";

export default async function AdminLocationsMissingCoordsPage() {
  const items = await listMissingCoords({ level: "ALL", limit: 80 });

  return (
    <div className="space-y-6" lang="bn">
      <AdminPageHeader
        title="কোঅর্ডিনেট অনুপস্থিত"
        description="সক্রিয় রেকর্ড যেখানে অক্ষাংশ বা দ্রাঘিমাংশ খালি। স্তর অনুযায়ী API দিয়ে আরও দেখুন।"
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
