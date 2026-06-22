import { type DefaultOptions, keepPreviousData, QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

import { ISR_REVALIDATE_MS } from '@/shared/isr';

const defaultOptions: DefaultOptions = {
  queries: {
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
    // Match the ISR window so back-navigation to recently-seen data reuses the cache
    // (no refetch, no busy veil) instead of treating everything as immediately stale.
    staleTime: ISR_REVALIDATE_MS,
  },
};

export function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions });
}

const getServerQueryClient = cache(createQueryClient);

let browserQueryClient: QueryClient | undefined;

/** One QueryClient per request on the server (shared by layout + page prefetch). Browser singleton on the client. */
export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    return getServerQueryClient();
  }

  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}
