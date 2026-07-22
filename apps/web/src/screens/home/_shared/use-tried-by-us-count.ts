'use client';

import { useProductsList } from '@/api/products';

import { LANDING_TRIED_COUNT_PARAMS } from '../landing-query-params';

export function useTriedByUsCount() {
  const { products, productsIsInitialLoad, productsIsError } = useProductsList(LANDING_TRIED_COUNT_PARAMS);

  return {
    count: products?.meta.total ?? 0,
    isLoading: productsIsInitialLoad,
    isError: productsIsError,
  };
}
