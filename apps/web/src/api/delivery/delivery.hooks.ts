'use client';

import type { DeliveryMethod, DeliveryProvider } from '@my-noodles/api-clients/storefront';
import { formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { useDebouncedValue } from '@/hooks/use-debounced-value';

import { deliveryQueries } from './delivery';

const SEARCH_DEBOUNCE_MS = 300;
/** Minimum characters before city/warehouse search hits the API. */
export const DELIVERY_SEARCH_MIN_LENGTH = 3;

export function useDeliveryProviders() {
  return formatUseQuery(useQuery(deliveryQueries.providers()), 'deliveryProviders');
}

export function useDeliveryCities(
  provider: DeliveryProvider,
  method: DeliveryMethod,
  query: string,
  enabled = true,
) {
  const liveQuery = query.trim();
  const debouncedQuery = useDebouncedValue(liveQuery, SEARCH_DEBOUNCE_MS);
  // Live below threshold must disable immediately — debounce can still hold a previous search string.
  const searching =
    liveQuery.length >= DELIVERY_SEARCH_MIN_LENGTH && debouncedQuery.length >= DELIVERY_SEARCH_MIN_LENGTH;

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
  method: DeliveryMethod,
  cityRef: string | null,
  query: string,
  enabled = true,
) {
  const liveQuery = query.trim();
  const debouncedQuery = useDebouncedValue(liveQuery, SEARCH_DEBOUNCE_MS);
  const searching =
    liveQuery.length >= DELIVERY_SEARCH_MIN_LENGTH && debouncedQuery.length >= DELIVERY_SEARCH_MIN_LENGTH;
  const queryEnabled = enabled && Boolean(cityRef) && searching;

  return formatUseQuery(
    useQuery({
      ...deliveryQueries.warehouses(provider, method, cityRef ?? '', debouncedQuery),
      enabled: queryEnabled,
    }),
    'deliveryWarehouses',
  );
}
