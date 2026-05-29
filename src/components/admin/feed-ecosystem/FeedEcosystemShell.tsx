'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';

import { FEED_ECOSYSTEM_NAV } from './options';

type Props = {
  children: React.ReactNode;
};

export function FeedEcosystemShell({ children }: Props) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl space-y-6" lang="bn">
      <nav
        aria-label="Feed ecosystem sections"
        className="-mx-1 flex gap-1 overflow-x-auto pb-1"
      >
        {FEED_ECOSYSTEM_NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/admin/feed-ecosystem' && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.titleEn}
              className={cn(
                'whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
              )}
            >
              {item.labelBn}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
