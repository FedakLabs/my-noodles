'use client';

import type { DeliveryMethod, DeliveryProvider } from '@my-noodles/api-clients/storefront';
import { formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { useDebouncedValue } from '@/hooks/use-debounced-value';

import { deliveryQueries } from './delivery';

const CITY_MIN_QUERY = 2;
const SEARCH_DEBOUNCE_MS = 300;

export function useDeliveryProviders() {
  return formatUseQuery(useQuery(deliveryQueries.providers()), 'deliveryProviders');
}

export function useDeliveryCities(
  provider: DeliveryProvider,
  method: DeliveryMethod,
  query: string,
  enabled = true,
) {
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const searching = debouncedQuery.length >= CITY_MIN_QUERY;

  return formatUseQuery(
    useQuery({
      ...deliveryQueries.cities(provider, method, debouncedQuery),
      enabled: enabled && searching,
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
      ...deliveryQueries.warehouses(provider, cityRef ?? '', debouncedQuery || undefined),
      enabled: queryEnabled,
    }),
    'deliveryWarehouses',
  );
}
