"use client";

import { Check } from "lucide-react";
import { type InputHTMLAttributes, type ReactNode, useId } from "react";

import { cn } from "@/lib/cn";

type AdminLoginCheckboxProps = {
  label: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className">;

export function AdminLoginCheckbox({
  label,
  id: idProp,
  ...inputProps
}: AdminLoginCheckboxProps) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-[#374151]"
    >
      <input
        {...inputProps}
        id={id}
        type="checkbox"
        className="pd-admin-login-checkbox sr-only"
      />
      <span
        className={cn(
          "pd-admin-login-checkbox-box mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-[#D1D5DB] bg-white transition-colors",
        )}
        aria-hidden
      >
        <Check
          className="h-3.5 w-3.5 text-white opacity-0 transition-all duration-150"
          strokeWidth={3}
        />
      </span>
      <span>{label}</span>
    </label>
  );
}
