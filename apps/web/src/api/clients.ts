import { StorefrontApi } from '@my-noodles/api-clients/storefront';

import { env } from '@/shared/env';

export const storefrontApi = new StorefrontApi({
  baseUrl: env.NEXT_PUBLIC_API_URL,
});
