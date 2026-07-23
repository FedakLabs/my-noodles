import { useQueryStates } from 'nuqs';
import { useCallback } from 'react';

import { type ProductSearchField, productsSearchParamsParsers } from './parsers';

export function useProductsSearchParams() {
  const [params, setParams] = useQueryStates(productsSearchParamsParsers);

  const field: ProductSearchField = params.name != null ? 'name' : 'slug';
  const value = (field === 'name' ? params.name : params.slug) ?? '';

  const setField = useCallback(
    (nextField: ProductSearchField, currentValue: string) => {
      const trimmed = currentValue.trim();
      void setParams(
        {
          slug: nextField === 'slug' ? (trimmed.length > 0 ? trimmed : null) : null,
          name: nextField === 'name' ? (trimmed.length > 0 ? trimmed : null) : null,
        },
        { history: 'replace' },
      );
    },
    [setParams],
  );

  const applySearch = useCallback(
    (nextValue: string, nextField: ProductSearchField) => {
      const trimmed = nextValue.trim();
      void setParams(
        {
          slug: nextField === 'slug' ? (trimmed.length > 0 ? trimmed : null) : null,
          name: nextField === 'name' ? (trimmed.length > 0 ? trimmed : null) : null,
        },
        { history: 'push' },
      );
    },
    [setParams],
  );

  return {
    field,
    value,
    slug: params.slug,
    name: params.name,
    setField,
    applySearch,
  };
}
