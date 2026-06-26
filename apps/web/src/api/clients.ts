import { setupApiClients } from '@my-noodles/api-clients/storefront';

import { env } from '@/shared/env';

setupApiClients(env.NEXT_PUBLIC_API_URL);
