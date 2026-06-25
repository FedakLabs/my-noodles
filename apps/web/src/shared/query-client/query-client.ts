import { type DefaultOptions, keepPreviousData, QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

const defaultOptions: DefaultOptions = {
  queries: {
    retry: 1,
    throwOnError: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
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
