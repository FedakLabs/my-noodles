import { createAppLogger } from '@my-noodles/api-lib/logging';

import { config } from '@/config';

export const appLogger = createAppLogger({
  appName: config.appName,
  nodeEnv: config.nodeEnv,
  otel: config.otel,
});
