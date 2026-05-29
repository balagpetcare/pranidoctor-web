'use client';

import { AdminActionButton } from '@/components/admin-ui/AdminActionButton';

type Props = {
  page: number;
  hasMore: boolean;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
};

export function FeedEcosystemPagination({
  page,
  hasMore,
  total,
  limit,
  onPageChange,
  loading,
}: Props) {
  if (total <= limit) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-500">
        {from}–{to} / {total}
      </p>
      <div className="flex gap-2">
        <AdminActionButton
          type="button"
          variant="secondary"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
        >
          আগের
        </AdminActionButton>
        <AdminActionButton
          type="button"
          variant="secondary"
          disabled={!hasMore || loading}
          onClick={() => onPageChange(page + 1)}
        >
          পরের
        </AdminActionButton>
      </div>
    </div>
  );
}
