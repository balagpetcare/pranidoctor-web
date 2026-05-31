"use client";

import { type InputHTMLAttributes, useId, useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

type AdminLoginFloatingInputProps = {
  label: string;
  labelBn?: string;
  icon: LucideIcon;
  invalid?: boolean;
  showPasswordToggle?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export function AdminLoginFloatingInput({
  label,
  labelBn,
  icon: Icon,
  invalid = false,
  showPasswordToggle = false,
  type = "text",
  value,
  id: idProp,
  ...inputProps
}: AdminLoginFloatingInputProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const [revealed, setRevealed] = useState(false);
  const filled =
    value !== undefined && value !== null && String(value).length > 0;
  const inputType =
    showPasswordToggle && type === "password"
      ? revealed
        ? "text"
        : "password"
      : type;

  return (
    <div
      className="pd-admin-login-floating-field relative"
      data-filled={filled ? "true" : "false"}
      data-invalid={invalid ? "true" : "false"}
    >
      <div className="relative">
        <span
          className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#6B7280] transition-colors group-focus-within:text-[#0F8F5F]"
          aria-hidden
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>

        <input
          {...inputProps}
          id={id}
          type={inputType}
          value={value}
          aria-invalid={invalid || undefined}
          className={cn(
            "pd-admin-login-floating-input peer block w-full min-h-[3.25rem] rounded-xl border border-[#D1D5DB] bg-white/90 pt-6 pb-2 pl-11 text-[0.9375rem] text-[#111827]",
            "outline-none transition-[border-color,box-shadow] duration-200",
            showPasswordToggle && "pr-12",
          )}
        />

        {showPasswordToggle ? (
          <button
            type="button"
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-[#F5FAF7] hover:text-[#0F8F5F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F8F5F]"
            onClick={() => setRevealed((prev) => !prev)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
          >
            {revealed ? (
              <EyeOff className="h-[18px] w-[18px]" aria-hidden />
            ) : (
              <Eye className="h-[18px] w-[18px]" aria-hidden />
            )}
          </button>
        ) : null}
      </div>

      <label
        htmlFor={id}
        className={cn(
          "pd-admin-login-floating-label pointer-events-none absolute left-11 top-1/2 z-10 -translate-y-1/2 text-[0.9375rem] text-[#6B7280]",
          "transition-all duration-200",
        )}
      >
        <span>{label}</span>
        {labelBn ? (
          <span className="sr-only"> / {labelBn}</span>
        ) : null}
      </label>
    </div>
  );
}
