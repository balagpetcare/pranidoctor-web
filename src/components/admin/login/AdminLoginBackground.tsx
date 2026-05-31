export function AdminLoginBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-linear-to-br from-[#F5FAF7] via-[#EEF8F2] to-[#E8F5EE]" />
      <div className="pd-admin-login-pattern absolute inset-0 opacity-80" />
      <div className="pd-admin-login-float absolute -left-16 top-[12%] h-72 w-72 rounded-full bg-[#14B87A]/20 blur-3xl" />
      <div className="pd-admin-login-float-delayed absolute -right-12 top-[55%] h-80 w-80 rounded-full bg-[#0F8F5F]/15 blur-3xl" />
      <div className="absolute bottom-[8%] left-[35%] h-56 w-56 rounded-full bg-[#22C55E]/10 blur-3xl" />
    </div>
  );
}
