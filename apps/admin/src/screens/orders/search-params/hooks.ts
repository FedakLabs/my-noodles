import type { OrderStatus } from '@my-noodles/api-clients/admin';
import { useQueryStates } from 'nuqs';
import { useCallback } from 'react';

import { ordersSearchParamsParsers } from './parsers';

export function useOrdersSearchParams() {
  const [params, setParams] = useQueryStates(ordersSearchParamsParsers);

  const applySearch = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      void setParams({ q: trimmed.length > 0 ? trimmed : null, page: 1 }, { history: 'push' });
    },
    [setParams],
  );

  const setStatus = useCallback(
    (status: OrderStatus[]) => {
      void setParams({ status, page: 1 }, { history: 'replace' });
    },
    [setParams],
  );

  const setCreatedFrom = useCallback(
    (createdFrom: string) => {
      void setParams({ createdFrom: createdFrom || null, page: 1 }, { history: 'replace' });
    },
    [setParams],
  );

  const setCreatedTo = useCallback(
    (createdTo: string) => {
      void setParams({ createdTo: createdTo || null, page: 1 }, { history: 'replace' });
    },
    [setParams],
  );

  const setPage = useCallback(
    (page: number) => {
      void setParams({ page }, { history: 'replace' });
    },
    [setParams],
  );

  return {
    q: params.q,
    status: params.status,
    createdFrom: params.createdFrom,
    createdTo: params.createdTo,
    page: params.page,
    applySearch,
    setStatus,
    setCreatedFrom,
    setCreatedTo,
    setPage,
  };
}
