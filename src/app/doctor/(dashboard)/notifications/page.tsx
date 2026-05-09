import { NotificationListPanel } from "@/components/notifications/NotificationListPanel";

export default function DoctorNotificationsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" lang="bn">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
          নোটিফিকেশন
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          আপনার অ্যাকাউন্টের নোটিফিকেশন। পড়া চিহ্নিত করুন বা সব একসাথে পড়া দেখান।
        </p>
      </div>
      <NotificationListPanel accent="teal" />
    </div>
  );
}
