import { useQueryStates } from 'nuqs';
import { useCallback } from 'react';

import { type CartSearchField, cartsSearchParamsParsers } from './parsers';

export function useCartsSearchParams() {
  const [params, setParams] = useQueryStates(cartsSearchParamsParsers);

  const field: CartSearchField = 'visitorSessionId';
  const value = params.visitorSessionId ?? '';

  const setField = useCallback(
    (_nextField: CartSearchField, currentValue: string) => {
      const trimmed = currentValue.trim();
      void setParams(
        {
          visitorSessionId: trimmed.length > 0 ? trimmed : null,
        },
        { history: 'replace' },
      );
    },
    [setParams],
  );

  const applySearch = useCallback(
    (nextValue: string, _nextField: CartSearchField) => {
      const trimmed = nextValue.trim();
      void setParams(
        {
          visitorSessionId: trimmed.length > 0 ? trimmed : null,
        },
        { history: 'push' },
      );
    },
    [setParams],
  );

  return {
    field,
    value,
    visitorSessionId: params.visitorSessionId,
    setField,
    applySearch,
  };
}
