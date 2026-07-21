import { ordersControllerGetOrder, type Order } from '@my-noodles/api-clients/storefront';
import { queryOptions } from '@tanstack/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';

export type { Order };

export const ordersQueries = {
  rootKey: ['orders'] as const,
  all: () =>
    queryOptions({
      queryKey: withAppLocaleKey(() => ordersQueries.rootKey)(),
    }),
  detail: (orderId: string) =>
    queryOptions({
      queryKey: withAppLocaleKey(() => [...ordersQueries.rootKey, orderId] as const)(),
      queryFn: () => ordersControllerGetOrder({ path: { id: orderId } }),
    }),
};
