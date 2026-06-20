import { type DefaultOptions, QueryClient } from '@tanstack/react-query';

const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 60_000,
    retry: 1,
  },
};

export function createQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    return createQueryClient();
  }

  browserQueryClient ??= createQueryClient();
  return browserQueryClient;
}
