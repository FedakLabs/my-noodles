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
import { requestData } from '@my-noodles/web-lib/react-query';
import { queryOptions } from '@tanstack/react-query';

export type { DeliveryCityDto, DeliveryProviderDto, DeliveryWarehouseDto };

export const deliveryQueryKeys = {
  all: ['delivery'] as const,
  providers: () => [...deliveryQueryKeys.all, 'providers'] as const,
  cities: (provider: DeliveryProvider, method: DeliveryMethod, query: string) =>
    [...deliveryQueryKeys.all, 'cities', provider, method, query] as const,
  warehouses: (provider: DeliveryProvider, cityRef: string, query?: string) =>
    [...deliveryQueryKeys.all, 'warehouses', provider, cityRef, query ?? ''] as const,
};

export async function fetchDeliveryProviders(): Promise<DeliveryProviderDto[]> {
  return requestData(deliveryControllerListProviders());
}

export async function fetchDeliveryCities(
  provider: DeliveryProvider,
  method: DeliveryMethod,
  query?: string,
): Promise<DeliveryCityDto[]> {
  return requestData(
    deliveryControllerSearchCities({
      query: { provider, method, q: query?.trim() ?? '' },
    }),
  );
}

export async function fetchDeliveryWarehouses(
  provider: DeliveryProvider,
  cityRef: string,
  query?: string,
): Promise<DeliveryWarehouseDto[]> {
  return requestData(
    deliveryControllerSearchWarehouses({
      query: { provider, cityRef, ...(query ? { q: query } : {}) },
    }),
  );
}

export const deliveryQueries = {
  providers: () =>
    queryOptions({
      queryKey: deliveryQueryKeys.providers(),
      queryFn: fetchDeliveryProviders,
      staleTime: 60 * 60_000,
    }),
  cities: (provider: DeliveryProvider, method: DeliveryMethod, query: string) =>
    queryOptions({
      queryKey: deliveryQueryKeys.cities(provider, method, query),
      queryFn: () => fetchDeliveryCities(provider, method, query),
      staleTime: 5 * 60_000,
    }),
  warehouses: (provider: DeliveryProvider, cityRef: string, query?: string) =>
    queryOptions({
      queryKey: deliveryQueryKeys.warehouses(provider, cityRef, query),
      queryFn: () => fetchDeliveryWarehouses(provider, cityRef, query),
      staleTime: 5 * 60_000,
    }),
};
