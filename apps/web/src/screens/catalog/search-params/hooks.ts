'use client';

import { useQueryStates } from 'nuqs';
import { useCallback, useMemo } from 'react';

import { catalogSearchParamsParsers } from './parsers';
import { catalogFiltersAppliedKey, DEFAULT_CATALOG_FILTER_PARAMS, hasCatalogFiltersApplied } from './types';

export function useCatalogSearchParams() {
  const [params, setParams] = useQueryStates(catalogSearchParamsParsers);

  const appliedKey = useMemo(() => catalogFiltersAppliedKey(params), [params]);
  const hasFiltersApplied = useMemo(() => hasCatalogFiltersApplied(params), [params]);

  const resetFilters = useCallback(() => {
    void setParams({
      ...DEFAULT_CATALOG_FILTER_PARAMS,
      collection: null,
      page: null,
      limit: params.limit,
    });
  }, [params.limit, setParams]);

  return {
    params,
    setParams,
    appliedKey,
    hasFiltersApplied,
    resetFilters,
  };
}
