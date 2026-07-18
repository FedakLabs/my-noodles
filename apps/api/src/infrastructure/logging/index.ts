import { configureAppLogger } from '@my-noodles/api-lib/logger';

import { config } from '@/config';

configureAppLogger({
  appName: config.appName,
  appVersion: config.appVersion,
  nodeEnv: config.nodeEnv,
  otel: config.otel,
});
