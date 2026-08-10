import { prepareSentry } from '@my-noodles/web-lib/sentry';

import { env } from '@/shared/env';

prepareSentry({
  dsn: env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,
});
