import { cn } from "@/lib/cn";

export function dkInputClass(): string {
  return cn(
    "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm",
    "outline-none ring-teal-600 focus:border-teal-600 focus:ring-2",
    "dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100",
  );
}

export function dkLabelClass(): string {
  return "block text-sm font-medium text-zinc-700 dark:text-zinc-300";
}

export function dkCardClass(): string {
  return "rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900";
}

export function dkBtnPrimaryClass(): string {
  return "inline-flex justify-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-50";
}

export function dkBtnSecondaryClass(): string {
  return "inline-flex justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800";
}
