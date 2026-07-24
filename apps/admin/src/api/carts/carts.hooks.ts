import { formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { cartsQueries } from './carts';
import type { CartsListParams } from './types';

export function useCartsList(params: CartsListParams) {
  return formatUseQuery(useQuery(cartsQueries.list(params)), 'carts');
}

export function useCart(visitorSessionId: string) {
  return formatUseQuery(
    useQuery({
      ...cartsQueries.detail(visitorSessionId),
      enabled: Boolean(visitorSessionId),
    }),
    'cart',
  );
}
