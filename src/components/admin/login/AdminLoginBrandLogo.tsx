import Image from "next/image";

export function AdminLoginBrandLogo() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-4 h-14 w-14 overflow-hidden rounded-2xl bg-[#F5FAF7] p-1.5 shadow-sm ring-1 ring-[#0F8F5F]/10">
        <Image
          src="/admin/prani-doctor-logo.png"
          alt="Prani Doctor"
          width={48}
          height={48}
          className="h-full w-full object-contain"
          priority
        />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F8F5F]">
        Prani Doctor
      </p>
    </div>
  );
}
