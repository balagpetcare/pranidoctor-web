import { cn } from "@/lib/cn";

export function khInputClass(): string {
  return cn(
    "mt-1.5 block min-h-[2.875rem] w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-[16px] leading-[1.6] text-zinc-900 placeholder:text-zinc-500 placeholder:opacity-90",
    "outline-none transition-colors hover:border-zinc-400",
    "focus-visible:border-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-600/25",
    "disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 disabled:opacity-90 dark:disabled:bg-zinc-900",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:hover:border-zinc-500",
  );
}

export function khLabelClass(): string {
  return "block text-[15px] font-semibold leading-[1.55] text-zinc-800 dark:text-zinc-200";
}

export function khCardClass(): string {
  return "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900";
}

export function khBtnPrimaryClass(): string {
  return "inline-flex justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50";
}

export function khBtnSecondaryClass(): string {
  return "inline-flex justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800";
}
