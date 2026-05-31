import Image from "next/image";
import {
  BarChart3,
  Bot,
  Building2,
  Check,
  HeartPulse,
  Stethoscope,
} from "lucide-react";

const FEATURES = [
  { label: "Farm Management", icon: Building2 },
  { label: "Veterinary Services", icon: Stethoscope },
  { label: "Animal Health Tracking", icon: HeartPulse },
  { label: "AI Assistant", icon: Bot },
  { label: "Analytics Dashboard", icon: BarChart3 },
] as const;

const STATS = [
  { value: "500+", label: "Active Farms", labelBn: "সক্রিয় খামার" },
  { value: "120+", label: "Registered Doctors", labelBn: "নিবন্ধিত ডাক্তার" },
  { value: "50K+", label: "Treated Animals", labelBn: "চিকিৎসা প্রাপ্ত প্রাণী" },
] as const;

export function AdminLoginHero() {
  return (
    <section
      className="pd-admin-login-animate-in relative flex min-h-[280px] flex-col justify-between lg:min-h-0 lg:py-10 lg:pl-10 lg:pr-6 xl:py-12 xl:pl-14 xl:pr-10"
      aria-labelledby="admin-login-hero-title"
    >
      <div className="relative overflow-hidden rounded-[28px] shadow-[0_32px_64px_-24px_rgb(6_78_59_/_0.45)] lg:min-h-[calc(100vh-5rem)] lg:rounded-[32px]">
        <Image
          src="/admin/login-hero.png"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{ background: "var(--pd-login-hero-overlay)" }}
        />

        <div className="relative flex h-full min-h-[320px] flex-col justify-between p-6 sm:p-8 lg:min-h-[calc(100vh-5rem)] lg:p-10">
          <div className="max-w-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/90">
              Prani Doctor Platform
            </p>
            <h1
              id="admin-login-hero-title"
              className="mt-3 text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl xl:text-[2rem]"
            >
              Smart Livestock Healthcare Management
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-emerald-50/95 sm:text-base">
              Manage farms, doctors, appointments, health records, treatments and
              AI-powered veterinary services from a single platform.
            </p>
          </div>

          <ul className="mt-8 space-y-3" aria-label="Platform features">
            {FEATURES.map(({ label, icon: Icon }) => (
              <li
                key={label}
                className="flex items-center gap-3 text-sm font-medium text-white/95"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                  <Check className="h-3.5 w-3.5 text-[#A7F3D0]" strokeWidth={2.5} />
                </span>
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-emerald-200/90" aria-hidden />
                  {label}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:mt-10">
            {STATS.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition-colors hover:bg-white/15"
              >
                <p className="text-2xl font-bold tracking-tight text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-emerald-50/95">
                  {stat.label}
                </p>
                <p className="mt-0.5 text-xs text-emerald-100/75">{stat.labelBn}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
