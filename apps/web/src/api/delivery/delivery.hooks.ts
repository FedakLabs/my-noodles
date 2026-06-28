'use client';

import type { DeliveryProvider } from '@my-noodles/api-clients/storefront';
import { formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { useDebouncedValue } from '@/hooks/use-debounced-value';

import {
  deliveryQueryKeys,
  fetchDeliveryCities,
  fetchDeliveryProviders,
  fetchDeliveryWarehouses,
} from './delivery';

const CITY_MIN_QUERY = 2;
const SEARCH_DEBOUNCE_MS = 300;
const POPULAR_CITIES_QUERY = '__popular__';

export function useDeliveryProviders() {
  return formatUseQuery(
    useQuery({
      queryKey: deliveryQueryKeys.providers(),
      queryFn: fetchDeliveryProviders,
      staleTime: 60 * 60_000,
    }),
    'deliveryProviders',
  );
}

export function useDeliveryPopularCities(provider: DeliveryProvider, enabled = true) {
  return formatUseQuery(
    useQuery({
      queryKey: deliveryQueryKeys.popularCities(provider),
      queryFn: () => fetchDeliveryCities(provider),
      enabled,
      staleTime: 60 * 60_000,
    }),
    'deliveryPopularCities',
  );
}

export function useDeliveryCities(provider: DeliveryProvider, query: string, enabled = true) {
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const searching = debouncedQuery.length >= CITY_MIN_QUERY;

  return formatUseQuery(
    useQuery({
      queryKey: deliveryQueryKeys.cities(provider, searching ? debouncedQuery : POPULAR_CITIES_QUERY),
      queryFn: () =>
        searching ? fetchDeliveryCities(provider, debouncedQuery) : fetchDeliveryCities(provider),
      enabled,
      staleTime: searching ? 5 * 60_000 : 60 * 60_000,
    }),
    'deliveryCities',
  );
}

export function useDeliveryWarehouses(
  provider: DeliveryProvider,
  cityRef: string | null,
  query: string,
  enabled = true,
) {
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const queryEnabled = enabled && Boolean(cityRef);

  return formatUseQuery(
    useQuery({
      queryKey: deliveryQueryKeys.warehouses(provider, cityRef ?? '', debouncedQuery),
      queryFn: () => fetchDeliveryWarehouses(provider, cityRef!, debouncedQuery || undefined),
      enabled: queryEnabled,
      staleTime: 5 * 60_000,
    }),
    'deliveryWarehouses',
  );
}
