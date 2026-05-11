import type { ReactNode } from "react";

import { AdminFormSection } from "@/components/admin-ui/AdminFormSection";
import { AdminBadge } from "@/components/admin-ui/AdminBadge";
import { khInputClass, khLabelClass } from "@/components/admin/knowledge-hub/styles";
import type { SerializedSemenTemplate } from "@/lib/admin-semen/templates-service";
import { cn } from "@/lib/cn";
import { sanitizeAdminRichHtml } from "@/lib/sanitize-admin-html";

function roBlock(label: string, value: ReactNode) {
  return (
    <div>
      <div className={cn(khLabelClass(), "text-zinc-600 dark:text-zinc-400")}>{label}</div>
      <div className={cn(khInputClass(), "mt-1 bg-zinc-50 dark:bg-zinc-900/50")}>{value}</div>
    </div>
  );
}

function roBlockRich(label: string, html: string | null | undefined) {
  if (!html?.trim()) return null;
  const clean = sanitizeAdminRichHtml(html);
  const text = clean.replace(/<[^>]+>/g, "").replace(/\u00a0/g, " ").trim();
  if (!text) return null;
  return (
    <div>
      <div className={cn(khLabelClass(), "text-zinc-600 dark:text-zinc-400")}>{label}</div>
      <div
        className={cn(
          khInputClass(),
          "mt-1 bg-zinc-50 text-sm leading-relaxed dark:bg-zinc-900/50",
          "[&_a]:font-medium [&_a]:text-emerald-800 [&_a]:underline dark:[&_a]:text-emerald-400",
          "[&_p]:my-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_h2]:my-2 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:my-2 [&_h3]:text-sm [&_h3]:font-semibold",
        )}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </div>
  );
}

export function SemenServiceTemplateDetailView({
  template: t,
}: {
  template: SerializedSemenTemplate;
}) {
  const coverMedia = t.media.find((m) => m.kind === "COVER" && m.uploadedFileId);
  const galleryMedia = t.media.filter((m) => m.kind === "GALLERY");
  const videoRows = t.media.filter((m) => m.kind === "VIDEO_UPLOAD" || m.kind === "VIDEO_URL");
  const totalBreedPercent = t.breedMix.reduce((acc, row) => acc + Number(row.percentage || 0), 0);

  return (
    <div className="mx-auto max-w-[88rem] space-y-6" lang="bn">
      <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-[var(--pd-admin-surface)] shadow-[var(--pd-admin-card-shadow)] dark:border-zinc-800 dark:bg-zinc-900/85">
        <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] lg:items-start">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{t.internalName}</h2>
            <div className="flex flex-wrap gap-2">
              <AdminBadge variant={t.isActive ? "success" : "neutral"}>{t.isActive ? "Active" : "Inactive"}</AdminBadge>
              <AdminBadge variant={t.approvalStatus === "APPROVED" ? "success" : t.approvalStatus === "REJECTED" ? "danger" : "warning"}>
                {t.approvalStatus}
              </AdminBadge>
              <AdminBadge variant="info">{t.animalType}</AdminBadge>
              <AdminBadge variant="default">{t.semenProductKind}</AdminBadge>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Provider: <span className="font-medium text-zinc-900 dark:text-zinc-100">{t.semenProvider.name}</span>
              {t.semenProvider.nameBn ? ` (${t.semenProvider.nameBn})` : ""}
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm sm:max-w-md">
              {roBlock("মূল মূল্য (৳)", t.defaultBasePrice)}
              {roBlock("অফার মূল্য (৳)", t.defaultOfferPrice ?? "—")}
              {roBlock("ছাড় %", t.defaultDiscountPercent ?? "—")}
              {roBlock("Breed mix total", `${totalBreedPercent.toFixed(2)}%`)}
            </div>
          </div>
          {coverMedia?.uploadedFileId ? (
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin secure preview */}
              <img
                src={`/api/admin/uploads/${coverMedia.uploadedFileId}`}
                alt="Template cover"
                className="h-full min-h-44 w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex min-h-44 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
              Cover media not set
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-5">
          <AdminFormSection title="বিবরণ">
            <div className="space-y-4">
              {roBlockRich("সংক্ষিপ্ত বিবরণ", t.shortDescription)}
              {roBlockRich("বিস্তারিত", t.detailedDescription)}
              {roBlockRich("উপকারিতা", t.expectedBenefits)}
              {roBlockRich("সুপারিশকৃত অবস্থা", t.recommendedAnimalCondition)}
            </div>
          </AdminFormSection>

          <AdminFormSection title="সতর্কতা / ক্লিনিক্যাল নোট">
            {roBlockRich("সতর্কতা / প্রতিবন্ধক", t.warningsContraindications) ?? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">কোনো সতর্কতা নোট নেই।</p>
            )}
          </AdminFormSection>

          <AdminFormSection title="Breed composition">
            <div className="space-y-3">
              {t.breedMix.map((m) => {
                const pct = Number(m.percentage) || 0;
                return (
                  <div key={m.id} className="space-y-1.5 rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/45">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-zinc-800 dark:text-zinc-100">
                        {m.breed.nameEn} / {m.breed.nameBn}
                      </span>
                      <span className="tabular-nums text-zinc-600 dark:text-zinc-300">{pct.toFixed(2)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </AdminFormSection>

          <AdminFormSection title="মিডিয়া গ্যালারি">
            {galleryMedia.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">গ্যালারি মিডিয়া পাওয়া যায়নি।</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {galleryMedia.map((m) =>
                  m.uploadedFileId ? (
                    <div key={m.id} className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin secure preview */}
                      <img
                        src={`/api/admin/uploads/${m.uploadedFileId}`}
                        alt="Gallery preview"
                        className="aspect-square w-full object-cover"
                      />
                    </div>
                  ) : null,
                )}
              </div>
            )}
          </AdminFormSection>

          <AdminFormSection title="ভিডিও">
            {videoRows.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">ভিডিও যুক্ত করা হয়নি।</p>
            ) : (
              <ul className="space-y-3">
                {videoRows.map((m) => (
                  <li key={m.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                    <p className="text-sm font-medium">{m.kind}</p>
                    {m.externalUrl ? (
                      <a href={m.externalUrl} target="_blank" rel="noreferrer" className="text-sm text-emerald-800 underline dark:text-emerald-400">
                        ভিডিও URL খুলুন
                      </a>
                    ) : null}
                    {m.uploadedFileId ? (
                      <video src={`/api/admin/uploads/${m.uploadedFileId}`} controls className="mt-2 max-h-64 w-full rounded" />
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </AdminFormSection>
        </div>

        <aside className="space-y-4">
          <AdminFormSection title="স্ট্যাটাস ও মেটাডেটা">
            <div className="space-y-2">
              {roBlock("টেমপ্লেট আইডি", <span className="font-mono text-xs break-all">{t.id}</span>)}
              {roBlock("তৈরি", new Date(t.createdAt).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" }))}
              {roBlock("হালনাগাদ", new Date(t.updatedAt).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" }))}
              {roBlock("অনুমোদনের সময়", t.approvedAt ? new Date(t.approvedAt).toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" }) : "—")}
              {roBlock("মিডিয়া সংখ্যা", String(t.media.length))}
              {roBlock("প্রদানকারী slug", t.semenProvider.slug)}
              {roBlock("অনুমোদনকারী", t.approvedBy ? `${t.approvedBy.email} (${t.approvedBy.id})` : "—")}
              {t.rejectedReason ? roBlock("প্রত্যাখ্যানের কারণ", t.rejectedReason) : null}
            </div>
          </AdminFormSection>

          <AdminFormSection title="Metadata chips">
            <div className="flex flex-wrap gap-2">
              <AdminBadge variant="default">{t.semenProvider.name}</AdminBadge>
              <AdminBadge variant="info">{t.animalType}</AdminBadge>
              {t.otherSemenLabel ? <AdminBadge variant="neutral">{t.otherSemenLabel}</AdminBadge> : null}
              <AdminBadge variant="warning">{`${galleryMedia.length} gallery`}</AdminBadge>
              <AdminBadge variant="success">{`${videoRows.length} video`}</AdminBadge>
            </div>
          </AdminFormSection>

          <AdminFormSection title="ট্যাগ JSON">
            <pre className={cn(khInputClass(), "max-h-64 overflow-auto whitespace-pre-wrap text-xs")}>
              {t.tagsJson == null ? "null" : JSON.stringify(t.tagsJson, null, 2)}
            </pre>
          </AdminFormSection>
        </aside>
      </div>
    </div>
  );
}
