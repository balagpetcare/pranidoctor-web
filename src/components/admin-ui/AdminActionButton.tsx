"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent, ReactNode } from "react";

import { cn } from "@/lib/cn";
import { trackAdminAction } from "@/lib/monitoring/admin-monitoring-client";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[var(--pd-admin-radius-sm,0.5rem)] px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:pointer-events-none disabled:opacity-50";

const variants = {
  primary:
    "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500",
  secondary:
    "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
  ghost:
    "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800",
  danger:
    "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500",
  link: "border-0 bg-transparent p-0 text-emerald-800 underline-offset-4 hover:underline dark:text-emerald-400",
} as const;

type Variant = keyof typeof variants;

type Monitorable = {
  /** Optional structured action name for admin monitoring (backward compatible). */
  monitorAction?: string;
};

type LinkProps = Omit<ComponentProps<typeof Link>, "className" | "children"> &
  Monitorable & {
  href: string;
  className?: string;
  variant?: Variant;
  children: ReactNode;
};

type ButtonProps = Omit<ComponentProps<"button">, "className" | "children"> &
  Monitorable & {
  className?: string;
  variant?: Variant;
  children: ReactNode;
  href?: undefined;
};

export type AdminActionButtonProps = LinkProps | ButtonProps;

function trackMonitorAction(action: string | undefined, href?: string): void {
  if (!action) return;
  trackAdminAction(action, href ? { href } : undefined);
}

export function AdminActionButton(props: AdminActionButtonProps) {
  const variant = props.variant ?? "primary";
  const className = cn(base, variants[variant], props.className);
  const monitorAction = props.monitorAction;

  if ("href" in props && typeof props.href === "string") {
    const { href, children, variant: _variant, className: _cn, monitorAction: _ma, onClick, ...linkRest } =
      props as LinkProps;
    void _variant;
    void _cn;
    void _ma;
    return (
      <Link
        href={href}
        className={className}
        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
          trackMonitorAction(monitorAction, href);
          onClick?.(event);
        }}
        {...linkRest}
      >
        {children}
      </Link>
    );
  }

  const {
    children,
    variant: _variant,
    className: _cn,
    monitorAction: _ma,
    type = "button",
    onClick,
    ...btnRest
  } = props as ButtonProps;
  void _variant;
  void _cn;
  void _ma;
  return (
    <button
      type={type}
      className={className}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        trackMonitorAction(monitorAction);
        onClick?.(event);
      }}
      {...btnRest}
    >
      {children}
    </button>
  );
}
