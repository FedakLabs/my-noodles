import {
  type DeliveryCityDto,
  deliveryControllerListProviders,
  deliveryControllerSearchCities,
  deliveryControllerSearchWarehouses,
  type DeliveryMethod,
  type DeliveryProvider,
  type DeliveryProviderDto,
  type DeliveryWarehouseDto,
} from '@my-noodles/api-clients/storefront';
import { queryOptions, type QueryClient } from '@tanstack/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';

export type { DeliveryCityDto, DeliveryProviderDto, DeliveryWarehouseDto };

export const deliveryQueries = {
  rootKey: ['delivery'] as const,
  /** Locale-prefixed root — for invalidate/remove; do not pass to useQuery. */
  all: () =>
    queryOptions({
      queryKey: withAppLocaleKey(() => deliveryQueries.rootKey)(),
    }),
  providers: () =>
    queryOptions({
      queryKey: withAppLocaleKey(() => [...deliveryQueries.rootKey, 'providers'] as const)(),
      queryFn: () => deliveryControllerListProviders(),
      staleTime: 60 * 60_000,
    }),
  cities: (provider: DeliveryProvider, method: DeliveryMethod, query: string) =>
    queryOptions({
      queryKey: withAppLocaleKey(
        () => [...deliveryQueries.rootKey, 'cities', provider, method, query] as const,
      )(),
      queryFn: () =>
        deliveryControllerSearchCities({
          query: { provider, method, q: query.trim() },
        }),
      staleTime: 5 * 60_000,
      placeholderData: undefined,
    }),
  warehouses: (provider: DeliveryProvider, method: DeliveryMethod, cityRef: string, query?: string) =>
    queryOptions({
      queryKey: withAppLocaleKey(
        () => [...deliveryQueries.rootKey, 'warehouses', provider, method, cityRef, query ?? ''] as const,
      )(),
      queryFn: () =>
        deliveryControllerSearchWarehouses({
          query: { provider, cityRef, ...(query ? { q: query } : {}) },
        }),
      staleTime: 5 * 60_000,
      placeholderData: undefined,
    }),
};

/** Drops cached city/warehouse searches for the active locale; keeps providers. */
export function removeDeliverySearchQueries(queryClient: QueryClient): void {
  const rootKey = deliveryQueries.all().queryKey;
  queryClient.removeQueries({ queryKey: [...rootKey, 'cities'], exact: false });
  queryClient.removeQueries({ queryKey: [...rootKey, 'warehouses'], exact: false });
}
