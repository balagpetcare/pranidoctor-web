'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { defaultAnalyticsRange } from './date-range';
import type { AnalyticsQueryParams } from './types';

export function useAnalyticsQuery<T>(
  fetcher: (params: AnalyticsQueryParams) => Promise<T>,
  extraParams?: Partial<AnalyticsQueryParams>,
) {
  const [range, setRange] = useState(defaultAnalyticsRange);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params: AnalyticsQueryParams = useMemo(
    () => ({ ...range, ...extraParams }),
    [range, extraParams],
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(params);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetcher, params]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, range, setRange, reload, params };
}
