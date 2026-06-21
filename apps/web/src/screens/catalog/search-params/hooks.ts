'use client';

import { useQueryStates } from 'nuqs';
import { useCallback, useMemo } from 'react';

import { catalogSearchParamsParsers } from './parsers';
import { type CatalogFilterParams, catalogFiltersAppliedKey, DEFAULT_CATALOG_FILTER_PARAMS } from './types';

export function useCatalogSearchParams() {
  const [params, setParams] = useQueryStates(catalogSearchParamsParsers);

  const appliedKey = useMemo(() => catalogFiltersAppliedKey(params), [params]);

  const resetFilters = useCallback(() => {
    void setParams({
      ...DEFAULT_CATALOG_FILTER_PARAMS,
      page: 1,
      limit: params.limit,
    });
  }, [params.limit, setParams]);

  const applyFilters = useCallback(
    (draft: CatalogFilterParams) => {
      void setParams({ ...draft, page: 1 });
    },
    [setParams],
  );

  return {
    params,
    setParams,
    appliedKey,
    resetFilters,
    applyFilters,
  };
}
