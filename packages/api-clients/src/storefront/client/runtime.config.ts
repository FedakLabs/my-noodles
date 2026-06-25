import type { CreateClientConfig } from '../generated/client.gen';

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  throwOnError: true,
  // Send the feed session cookie on cross-origin storefront requests.
  credentials: 'include',
});
