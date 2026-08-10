'use client';

import { prepareSentry } from '@my-noodles/web-lib/sentry';

import { env } from '@/shared/env';

prepareSentry({
  dsn: env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  release: process.env.NEXT_PUBLIC_APP_VERSION,
});
